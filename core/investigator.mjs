/** Browser-safe, input-dependent evidence analysis. No network or model calls. */
export const ANALYSIS_VERSION = '1.0.2';
export const FEED_NAMES = ['manifest', 'telemetry', 'incidents', 'calibration'];
const labels = {
  manifest: 'Shipment manifest', telemetry: 'Sensor telemetry',
  incidents: 'Carrier event log', calibration: 'Calibration register',
};
const finite = value => typeof value === 'number' && Number.isFinite(value);
const time = value => typeof value === 'string' ? Date.parse(value) : NaN;
const round = (value, digits = 1) => finite(value) ? Number(value.toFixed(digits)) : null;
const ids = rows => [...new Set(rows.map(row => row.row_id).filter(Boolean))];
const rowsOf = (feeds, name) => Array.isArray(feeds?.[name]?.records) ? feeds[name].records : [];
const inside = (value, start, end) => value >= start && value <= end;
const unique = values => [...new Set(values)];

// Treat finite input numbers as the decimal measurements their canonical
// strings represent. Align integer coefficients before subtracting, then round
// only once to the nearest representable Number. This avoids binary subtraction
// noise at exact boundaries without imposing a fixed number of decimal places.
const decimalDifference = (left, right) => {
  const parts = value => {
    const [coefficient, exponent = '0'] = String(value).split('e');
    const fractionDigits = coefficient.includes('.') ? coefficient.length - coefficient.indexOf('.') - 1 : 0;
    return { coefficient: BigInt(coefficient.replace('.', '')), exponent: Number(exponent) - fractionDigits };
  };
  const a = parts(left), b = parts(right);
  const exponent = Math.min(a.exponent, b.exponent);
  const difference = a.coefficient * 10n ** BigInt(a.exponent - exponent) - b.coefficient * 10n ** BigInt(b.exponent - exponent);
  return Number(`${difference}e${exponent}`);
};

export function listShipments(feeds) {
  return rowsOf(feeds, 'manifest').map(row => ({ ...row }));
}

export function telemetryRejection(row) {
  if (!row || !['row_id', 'reading_id', 'shipment_id', 'sensor_id'].every(key => typeof row[key] === 'string' && row[key].trim())) return 'Missing observation identity';
  if (!Number.isFinite(time(row.observed_at))) return 'Invalid observation timestamp';
  if (!finite(row.temperature_c)) return 'Temperature is not a finite number';
  if (row.temperature_c < -80 || row.temperature_c > 80) return 'Outside the synthetic sensor integrity envelope (-80 to 80 C)';
  return null;
}

function summarizeRecord(source, row) {
  if (source === 'manifest') return `${row.route}: stated range ${row.min_temp_c}–${row.max_temp_c} C; reported ${row.reported_status}.`;
  if (source === 'telemetry') return `${row.sensor_id} measured ${row.temperature_c} C at ${row.observed_at}.`;
  if (source === 'incidents') return `${row.event_type}: ${row.details}`;
  return `${row.sensor_id}: ${row.status} offset ${row.offset_c} C; valid ${row.valid_from} to ${row.valid_to}.`;
}

function evidenceRecord(source, row) {
  return {
    id: row.row_id, source, sourceLabel: labels[source],
    recordId: row.reading_id || row.incident_id || row.calibration_id || row.shipment_id,
    timestamp: row.observed_at || row.occurred_at || row.confirmed_at || row.reported_status_at || row.source_updated_at,
    sourceUpdatedAt: row.source_updated_at,
    summary: summarizeRecord(source, row), record: { ...row },
  };
}

/**
 * Calibration is observed-minus-reference. An expired, pending, ambiguous, or
 * malformed certificate cannot authorize a correction. It is evidence, not
 * cargo disposition authority. Incident text never controls program execution.
 */
export function investigateShipment(feeds, shipmentId, options = {}) {
  const excluded = new Set(options.excludeRowIds || []);
  const manifestRows = rowsOf(feeds, 'manifest').filter(row => row.shipment_id === shipmentId && !excluded.has(row.row_id));
  if (manifestRows.length !== 1) throw new Error(`Expected one manifest for shipment ${shipmentId}; found ${manifestRows.length}.`);
  const shipment = { ...manifestRows[0] };
  const start = time(shipment.investigation_window_start);
  const end = time(shipment.investigation_window_end);
  const intervalMs = shipment.expected_interval_minutes * 60_000;
  // Source timestamps have millisecond resolution. A smaller step can fail to
  // advance an epoch timestamp, so reject it before constructing the schedule.
  if (![start, end, intervalMs].every(Number.isFinite) || end < start || intervalMs < 1 || (end - start) / intervalMs > 5000) throw new Error('Invalid or unbounded investigation window.');
  if (!finite(shipment.min_temp_c) || !finite(shipment.max_temp_c) || shipment.min_temp_c >= shipment.max_temp_c) throw new Error('Invalid manifest temperature limits.');

  const telemetry = rowsOf(feeds, 'telemetry').filter(row => row.shipment_id === shipmentId && !excluded.has(row.row_id));
  const incidents = rowsOf(feeds, 'incidents').filter(row => row.shipment_id === shipmentId && !excluded.has(row.row_id));
  const sensorIds = new Set([shipment.primary_sensor_id, ...telemetry.map(row => row.sensor_id)]);
  const calibrations = rowsOf(feeds, 'calibration').filter(row => sensorIds.has(row.sensor_id) && !excluded.has(row.row_id));
  const missingSources = FEED_NAMES.filter(name => feeds?.[name]?.notRetrieved === true);
  const allEvidence = [evidenceRecord('manifest', shipment), ...telemetry.map(row => evidenceRecord('telemetry', row)), ...incidents.map(row => evidenceRecord('incidents', row)), ...calibrations.map(row => evidenceRecord('calibration', row))];
  const evidenceIds = new Set();
  for (const item of allEvidence) {
    if (!item.id || evidenceIds.has(item.id)) throw new Error('Missing or duplicate evidence row_id; provenance cannot be reconstructed.');
    evidenceIds.add(item.id);
  }

  const rejectedRows = [];
  const readingCounts = new Map();
  for (const row of telemetry) readingCounts.set(row.reading_id, (readingCounts.get(row.reading_id) || 0) + 1);
  const ambiguousReadingRows = telemetry.filter(row => readingCounts.get(row.reading_id) > 1 && inside(time(row.observed_at), start, end));
  const valid = [];
  for (const row of telemetry) {
    let reason = telemetryRejection(row);
    // Do not choose an authoritative reading by input order. Every row sharing
    // the identity is quarantined, including the first apparently valid row.
    if (readingCounts.get(row.reading_id) > 1) reason = 'Duplicate reading_id; all conflicting observations quarantined';
    if (reason) rejectedRows.push({ row: { ...row }, reason });
    else if (inside(time(row.observed_at), start, end)) valid.push(row);
  }
  valid.sort((a, b) => time(a.observed_at) - time(b.observed_at));
  const primary = valid.filter(row => row.sensor_id === shipment.primary_sensor_id);
  const seenTimes = new Set();
  const duplicateTimes = primary.filter(row => {
    const instant = time(row.observed_at);
    if (seenTimes.has(instant)) return true;
    seenTimes.add(instant);
    return false;
  });
  const calibrationMatches = [];
  const unresolvedCalibration = [];
  const points = primary.map(row => {
    const matches = options.ignoreCalibration ? [] : calibrations.filter(cal =>
      cal.sensor_id === row.sensor_id && cal.status === 'confirmed' &&
      Number.isFinite(time(cal.confirmed_at)) && finite(cal.offset_c) &&
      time(cal.valid_from) <= time(row.observed_at) && time(row.observed_at) < time(cal.valid_to));
    const calibration = matches.length === 1 ? matches[0] : null;
    if (!calibration) unresolvedCalibration.push({ readingId: row.reading_id, rowId: row.row_id, reason: matches.length > 1 ? 'Overlapping confirmed calibration certificates' : 'No applicable confirmed calibration certificate' });
    else calibrationMatches.push({ readingId: row.reading_id, calibrationId: calibration.calibration_id, calibrationRowId: calibration.row_id, offsetC: calibration.offset_c });
    const references = valid.filter(other => other.sensor_id !== shipment.primary_sensor_id && other.reading_quality === 'reference' && time(other.observed_at) === time(row.observed_at));
    // A reference point is corroboration only when its own certificate is unambiguous.
    const referenceEvaluations = references.map(reference => {
      const certificates = calibrations.filter(cal => cal.sensor_id === reference.sensor_id && cal.status === 'confirmed' && Number.isFinite(time(cal.confirmed_at)) && finite(cal.offset_c) && time(cal.valid_from) <= time(reference.observed_at) && time(reference.observed_at) < time(cal.valid_to));
      return certificates.length === 1 ? { value: decimalDifference(reference.temperature_c, certificates[0].offset_c), calibrationRowId: certificates[0].row_id, rowId: reference.row_id } : null;
    }).filter(Boolean);
    const referenceValues = referenceEvaluations.map(item => item.value);
    return {
      timestamp: row.observed_at, rawC: row.temperature_c,
      // Retain precision for thresholds and reference checks; round display
      // summaries only, so an actual boundary crossing cannot disappear.
      correctedC: calibration ? decimalDifference(row.temperature_c, calibration.offset_c) : null,
      referenceC: referenceValues.length ? round(referenceValues.reduce((sum, value) => sum + value, 0) / referenceValues.length, 3) : null,
      referenceValuesC: referenceValues,
      valid: true, readingId: row.reading_id, rowId: row.row_id,
      calibrationId: calibration?.calibration_id || null,
      calibrationRowId: calibration?.row_id || null,
      referenceRowIds: unique(referenceEvaluations.map(item => item.rowId)),
      referenceCalibrationRowIds: unique(referenceEvaluations.map(item => item.calibrationRowId)),
    };
  });

  const schedule = Array.from({ length: Math.floor((end - start) / intervalMs) + 1 }, (_, index) => start + index * intervalMs);
  const observedTimes = unique(primary.map(row => time(row.observed_at))).sort((a, b) => a - b);
  const tolerance = Math.min(intervalMs * 0.2, 120_000);
  const missingTimestamps = schedule.filter(expected => !observedTimes.some(actual => Math.abs(actual - expected) <= tolerance)).map(at => new Date(at).toISOString());
  const matchedCount = schedule.length - missingTimestamps.length;
  const boundaries = [start, ...observedTimes, end];
  const maxGapMs = Math.max(0, ...boundaries.slice(1).map((at, index) => at - boundaries[index]));
  const coverage = {
    expectedCount: schedule.length, observedCount: observedTimes.length,
    percent: round(matchedCount / schedule.length * 100),
    maxGapMinutes: round(maxGapMs / 60_000), missingTimestamps,
    complete: missingTimestamps.length === 0 && maxGapMs <= intervalMs * 1.5 && duplicateTimes.length === 0,
  };
  const outOfRange = temperature => finite(temperature) && (temperature < shipment.min_temp_c || temperature > shipment.max_temp_c);
  const rawExcursions = points.filter(point => outOfRange(point.rawC));
  const excursions = points.filter(point => outOfRange(point.correctedC));
  const referenceDisagreements = points.filter(point => finite(point.correctedC) && point.referenceValuesC.some(value => Math.abs(decimalDifference(value, point.correctedC)) > 0.5));
  const ambiguous = unresolvedCalibration.length > 0 || duplicateTimes.length > 0 || ambiguousReadingRows.length > 0 || referenceDisagreements.length > 0 || missingSources.length > 0;
  const corroboration = points.filter(point => point.referenceValuesC.length && finite(point.correctedC) && point.referenceValuesC.every(value => Math.abs(decimalDifference(value, point.correctedC)) <= 0.5));
  const correctionApplied = calibrationMatches.filter(match => match.offsetC !== 0);
  let outcome;
  if (excursions.length) outcome = 'excursion';
  else if (!coverage.complete || ambiguous || points.length === 0) outcome = 'insufficient_evidence';
  else if (rawExcursions.length && correctionApplied.length) outcome = 'sensor_bias';
  else outcome = 'within_range';

  const findings = [];
  const contradictions = [];
  const actions = [];
  const primaryIds = ids(primary);
  const applicableCalIds = unique(calibrationMatches.map(match => match.calibrationRowId));
  const excursionIds = excursions.map(point => point.rowId);
  const doorEvents = incidents.filter(row => row.event_type === 'door_open' && inside(time(row.occurred_at), start, end) && excursions.some(point => Math.abs(time(point.timestamp) - time(row.occurred_at)) <= 30 * 60_000));
  findings.push({ id: 'coverage', title: coverage.complete ? 'Observation schedule covered' : 'Observation gaps remain', detail: `${matchedCount} of ${coverage.expectedCount} scheduled primary observations are present; largest gap ${coverage.maxGapMinutes} minutes.`, severity: coverage.complete ? 'info' : 'warning', citationIds: [shipment.row_id, ...primaryIds] });
  if (missingSources.length) findings.push({ id: 'source-gap', title: 'Required source evidence has not been retrieved', detail: `Unfetched sources: ${missingSources.join(', ')}. Missing retrieval is not evidence that no record exists.`, severity: 'warning', citationIds: [shipment.row_id] });
  if (rejectedRows.length) findings.push({ id: 'quality', title: 'Invalid sensor data excluded', detail: `${rejectedRows.length} observation(s) failed integrity checks before peaks, coverage, or verdict were calculated.`, severity: 'warning', citationIds: ids(rejectedRows.map(item => item.row)) });
  if (ambiguousReadingRows.length) findings.push({ id: 'reading-identity', title: 'Reading identity remains ambiguous', detail: 'Multiple source rows share a reading identity inside the investigation window. All versions are excluded; request authoritative records before clearing the status.', severity: 'warning', citationIds: ids(ambiguousReadingRows) });
  if (applicableCalIds.length) findings.push({ id: 'calibration', title: 'Calibration validity checked', detail: `${calibrationMatches.length} primary observations have exactly one confirmed certificate covering their timestamp; ${correctionApplied.length} use a non-zero offset.`, severity: 'info', citationIds: applicableCalIds });
  if (unresolvedCalibration.length) findings.push({ id: 'calibration-gap', title: 'Calibration cannot be assumed', detail: `${unresolvedCalibration.length} observations lack one unambiguous confirmed certificate. Pending and expired records do not authorize correction.`, severity: 'warning', citationIds: unique([...unresolvedCalibration.map(item => item.rowId), ...ids(calibrations)]) });
  if (duplicateTimes.length) findings.push({ id: 'duplicate-times', title: 'Conflicting sampling identity', detail: 'More than one primary observation occupies the same timestamp; request authoritative records.', severity: 'warning', citationIds: ids(duplicateTimes) });
  if (referenceDisagreements.length) findings.push({ id: 'reference-conflict', title: 'Independent reference disagrees', detail: `${referenceDisagreements.length} observation(s) differ by more than the synthetic 0.5 C comparison tolerance. Do not clear the raw alarm using the primary certificate alone.`, severity: 'warning', citationIds: unique(referenceDisagreements.flatMap(point => [point.rowId, point.calibrationRowId, ...point.referenceRowIds, ...point.referenceCalibrationRowIds]).filter(Boolean)) });
  if (excursions.length) findings.push({ id: 'excursion', title: 'Above or below the stated operating range', detail: `${excursions.length} calibrated observations fall outside ${shipment.min_temp_c}–${shipment.max_temp_c} C. Discrete readings do not establish a continuous exposure duration.`, severity: 'critical', citationIds: unique([shipment.row_id, ...excursionIds, ...applicableCalIds]) });
  if (doorEvents.length) findings.push({ id: 'door-association', title: 'Door event aligns with the excursion', detail: 'The recorded door-open event is within 30 minutes of an excursion observation. This is temporal support for investigation, not proof of causation.', severity: 'warning', citationIds: [...ids(doorEvents), ...excursionIds] });
  if (outcome === 'sensor_bias') findings.push({ id: 'bias', title: 'Confirmed offset explains the raw alarm', detail: `${rawExcursions.length} raw out-of-range readings become in-range after the documented correction. ${corroboration.length} independently calibrated reference observations agree within 0.5 C.`, severity: 'info', citationIds: unique([...rawExcursions.map(point => point.rowId), ...applicableCalIds, ...corroboration.flatMap(point => [...point.referenceRowIds, ...point.referenceCalibrationRowIds])]) });

  const statusRows = [{ ...shipment, kind: 'manifest' }, ...incidents];
  for (const row of statusRows) {
    const claimsClear = row.reported_status === 'in_range';
    const claimsAlert = row.reported_status === 'temperature_alert';
    if ((claimsClear && (outcome === 'excursion' || outcome === 'insufficient_evidence')) || (claimsAlert && outcome === 'sensor_bias')) contradictions.push({
      id: `conflict-${row.row_id}`, claim: `${row.row_id} reports ${row.reported_status}.`,
      counterEvidence: outcome === 'excursion' ? 'Calibrated out-of-range observations contradict a clear status.' : outcome === 'sensor_bias' ? 'An applicable confirmed offset explains the raw sensor alert.' : 'Missing or unresolved measurements cannot substantiate a clear status.',
      resolution: outcome === 'insufficient_evidence' ? 'Keep the status unverified and request evidence.' : 'Preserve both records; prefer timestamped measurement and calibration evidence for this window.',
      citationIds: unique([row.row_id, shipment.row_id, ...(excursionIds.length ? excursionIds : primaryIds), ...applicableCalIds]),
    });
  }

  const descriptions = {
    excursion: { title: 'Observed excursion', summary: `${excursions.length} calibrated readings fall outside the stated operating range${doorEvents.length ? ', with a nearby door-open event' : ''}.`, recommendation: 'Escalate the exception with the observed readings and event timeline. A qualified operator decides the next operational action.' },
    sensor_bias: { title: 'Sensor bias explains the alarm', summary: `The confirmed offset resolves ${rawExcursions.length} raw alerts within a complete observation window${corroboration.length ? '; independent reference readings agree' : ''}.`, recommendation: 'Route the sensor for maintenance and reconcile the raw alarm with its calibration evidence. This does not authorize cargo release.' },
    insufficient_evidence: { title: 'Abstain: evidence is incomplete', summary: `Available evidence covers ${coverage.percent}% of the scheduled primary observations${ambiguous ? ' and includes unresolved calibration or conflicting observations' : ''}. A clear conclusion is not supported.`, recommendation: 'Request missing logger records and applicable confirmed calibration. Keep the shipment status unverified until the evidence gap is resolved.' },
    within_range: { title: 'No excursion observed in this window', summary: 'All scheduled, valid primary observations are within the stated range after confirmed calibration.', recommendation: 'Record the bounded observation result and retain the evidence. This is not a statement about unobserved time or product safety.' },
  };
  const chosen = descriptions[outcome];
  if (outcome === 'excursion') actions.push({ id: 'escalate', title: 'Escalate the observed exception', reason: 'Provide calibrated readings, the manifest range, and relevant carrier events to the responsible operator.', priority: 'high', citationIds: unique([shipment.row_id, ...excursionIds, ...ids(doorEvents)]) });
  if (outcome === 'sensor_bias') actions.push({ id: 'sensor-service', title: 'Request sensor maintenance', reason: 'The raw alarm is explained by a confirmed non-zero calibration offset; preserve the certificate and reference checks.', priority: 'medium', citationIds: unique([...applicableCalIds, ...corroboration.flatMap(point => point.referenceRowIds)]) });
  if (!coverage.complete || ambiguous) actions.push({ id: 'recover-evidence', title: 'Recover missing evidence', reason: 'Obtain the missing scheduled readings and an unambiguous applicable calibration before clearing the exception.', priority: 'high', citationIds: unique([shipment.row_id, ...primaryIds, ...ids(calibrations)]) });
  if (contradictions.length) actions.push({ id: 'reconcile-status', title: 'Reconcile conflicting status records', reason: 'Attach the evidence without deleting the original claim or silently overwriting its provenance.', priority: 'medium', citationIds: unique(contradictions.flatMap(item => item.citationIds)) });
  if (rejectedRows.length) actions.push({ id: 'quarantine-reading', title: 'Quarantine invalid observations', reason: 'Retain failed source rows for audit but exclude them from operational calculations.', priority: 'medium', citationIds: ids(rejectedRows.map(item => item.row)) });
  if (!actions.length) actions.push({ id: 'retain-evidence', title: 'Retain the bounded observation record', reason: 'The result covers only the stated window and discrete observations.', priority: 'low', citationIds: [shipment.row_id, ...primaryIds] });
  const confidenceScore = outcome === 'insufficient_evidence' ? Math.min(0.45, coverage.percent / 100 * 0.5) : Math.min(0.96, 0.72 + (coverage.complete ? 0.12 : 0) + (!ambiguous ? 0.06 : 0) + (corroboration.length ? 0.04 : 0) + (doorEvents.length ? 0.02 : 0));
  const metrics = {
    rawPeakC: points.length ? round(Math.max(...points.map(point => point.rawC))) : null,
    correctedPeakC: points.some(point => finite(point.correctedC)) ? round(Math.max(...points.map(point => point.correctedC).filter(finite))) : null,
    excursionReadings: excursions.length, rawExcursionReadings: rawExcursions.length,
    rejectedReadings: rejectedRows.length, correctionAppliedCount: correctionApplied.length,
    corroboratingReferenceReadings: corroboration.length,
    referenceDisagreements: referenceDisagreements.length,
  };
  const citationProblems = [...findings, ...contradictions, ...actions].flatMap(item => item.citationIds).filter(id => !evidenceIds.has(id));
  if (citationProblems.length) throw new Error('Critic rejected a citation that does not resolve to source evidence.');
  return {
    analysisVersion: ANALYSIS_VERSION, mode: 'deterministic', shipment, outcome, ...chosen,
    synthetic: FEED_NAMES.every(name => feeds?.[name]?.synthetic === true),
    confidence: { score: round(confidenceScore, 2), label: outcome === 'insufficient_evidence' ? 'Limited evidence' : coverage.complete && !ambiguous ? 'Strong observed evidence' : 'Partial observed evidence', basis: `${coverage.percent}% scheduled coverage; ${calibrationMatches.length} confirmed calibration matches; ${corroboration.length} corroborating reference points.`, method: 'Transparent heuristic evidence strength; not a calibrated probability.' },
    coverage, metrics, chart: points, evidence: allEvidence, findings, contradictions, missingSources,
    actions, rejectedRows, calibrationMatches, unresolvedCalibration,
    excludedRowIds: [...excluded],
    trace: [
      { agent: 'Planner', action: 'scope', status: 'complete', detail: `Bounded investigation of ${shipmentId} from ${shipment.investigation_window_start} to ${shipment.investigation_window_end}.`, citationIds: [shipment.row_id] },
      { agent: 'Data steward', action: 'validate', status: 'complete', detail: `${telemetry.length} observations inspected; ${rejectedRows.length} rejected before analysis.`, citationIds: ids(telemetry) },
      { agent: 'Analyst', action: 'reconcile', status: 'complete', detail: `Applied ${calibrationMatches.length} confirmed calibration matches and checked ${coverage.expectedCount} scheduled positions.`, citationIds: unique([...primaryIds, ...applicableCalIds]) },
      { agent: 'Critic', action: 'verify', status: 'complete', detail: `Verified every citation, rejected unsupported clear-status claims, and checked coverage/calibration conditions. ${contradictions.length} source conflicts retained.`, citationIds: unique(contradictions.flatMap(item => item.citationIds)) },
      { agent: 'Dossier writer', action: 'report', status: 'complete', detail: `${chosen.title}. These are deterministic computation stages; live model use is separately disclosed.`, citationIds: unique(findings.flatMap(item => item.citationIds)) },
    ],
    limitations: [
      'Synthetic demonstration records; no measured commercial impact or production deployment is implied.',
      'Operations support only: no product release, disposal, food safety, or pharmaceutical certification.',
      'Discrete observations cannot prove continuous temperature or exact excursion duration.',
      'Incident text is untrusted evidence; reported statuses do not override missing measurements.',
      ...(options.ignoreCalibration ? ['Calibration was deliberately withheld for this counterfactual rerun.'] : []),
    ],
  };
}

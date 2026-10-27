-- @statement usl-calibrated-observations
-- An absent or ambiguous calibration must be handled as unknown downstream.
SELECT m.shipment_id, m.row_id AS manifest_row_id, t.row_id AS telemetry_row_id,
  t.reading_id, t.sensor_id, t.observed_at, t.temperature_c,
  c.row_id AS calibration_row_id, c.calibration_id, c.offset_c,
  CASE WHEN c.calibration_id IS NOT NULL THEN t.temperature_c - c.offset_c
    ELSE NULL END AS corrected_temperature_c,
  m.min_temp_c, m.max_temp_c
FROM lightning.metastore.traceharbor.shipment_evidence.manifest m
JOIN lightning.metastore.traceharbor.shipment_evidence.telemetry t
  ON m.shipment_id = t.shipment_id
LEFT JOIN lightning.metastore.traceharbor.shipment_evidence.calibration c
  ON t.sensor_id = c.sensor_id AND c.status = 'confirmed'
  AND c.confirmed_at IS NOT NULL AND c.confirmed_at <> ''
  AND t.observed_at >= c.valid_from AND t.observed_at < c.valid_to
WHERE t.temperature_c BETWEEN -80 AND 80
  AND t.observed_at >= m.investigation_window_start
  AND t.observed_at <= m.investigation_window_end
ORDER BY m.shipment_id, t.observed_at;

-- @statement usl-event-context
-- Preserve individual rows; do not SUM/COUNT this one-to-many join.
SELECT m.shipment_id, m.reported_status AS manifest_status,
  t.row_id AS telemetry_row_id, t.observed_at, t.temperature_c,
  i.row_id AS incident_row_id, i.occurred_at, i.event_type,
  i.reported_status AS event_status, i.details
FROM lightning.metastore.traceharbor.shipment_evidence.manifest m
LEFT JOIN lightning.metastore.traceharbor.shipment_evidence.telemetry t
  ON m.shipment_id = t.shipment_id
LEFT JOIN lightning.metastore.traceharbor.shipment_evidence.incidents i
  ON m.shipment_id = i.shipment_id
ORDER BY m.shipment_id, t.observed_at, i.occurred_at;

-- @statement usl-primary-observation-coverage
-- Counts alone are insufficient: the core also examines schedule and time gaps.
SELECT m.shipment_id, m.investigation_window_start, m.investigation_window_end,
  m.expected_interval_minutes, COUNT(DISTINCT t.observed_at) AS valid_primary_observations
FROM lightning.metastore.traceharbor.shipment_evidence.manifest m
LEFT JOIN lightning.metastore.traceharbor.shipment_evidence.telemetry t
  ON m.shipment_id = t.shipment_id AND m.primary_sensor_id = t.sensor_id
  AND t.temperature_c BETWEEN -80 AND 80 AND t.reading_id <> ''
  AND t.observed_at >= m.investigation_window_start
  AND t.observed_at <= m.investigation_window_end
GROUP BY m.shipment_id, m.investigation_window_start, m.investigation_window_end,
  m.expected_interval_minutes
ORDER BY m.shipment_id;

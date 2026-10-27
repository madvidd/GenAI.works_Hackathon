-- @statement explore-manifest-count
-- Count flattened records, not the one-row JSON envelope.
SELECT COUNT(*) AS record_count FROM traceharbor_sources.manifest_raw
LATERAL VIEW explode(records) AS r;

-- @statement explore-manifest-rows
SELECT r.row_id, r.shipment_id, r.consignee, r.route, r.origin, r.destination, r.cargo_label, r.primary_sensor_id, r.min_temp_c, r.max_temp_c, r.investigation_window_start, r.investigation_window_end, r.expected_interval_minutes, r.promised_at, r.reported_status, r.reported_status_at, r.source_updated_at
FROM traceharbor_sources.manifest_raw LATERAL VIEW explode(records) AS r LIMIT 10;

-- @statement explore-manifest-distribution
SELECT r.route, COUNT(*) AS records
FROM traceharbor_sources.manifest_raw LATERAL VIEW explode(records) AS r
GROUP BY r.route ORDER BY records DESC;

-- @statement explore-telemetry-count
-- Count flattened records, not the one-row JSON envelope.
SELECT COUNT(*) AS record_count FROM traceharbor_sources.telemetry_raw
LATERAL VIEW explode(records) AS r;

-- @statement explore-telemetry-rows
SELECT r.row_id, r.reading_id, r.shipment_id, r.sensor_id, r.observed_at, r.temperature_c, r.reading_quality, r.source_updated_at
FROM traceharbor_sources.telemetry_raw LATERAL VIEW explode(records) AS r LIMIT 10;

-- @statement explore-telemetry-distribution
SELECT r.shipment_id, COUNT(*) AS records
FROM traceharbor_sources.telemetry_raw LATERAL VIEW explode(records) AS r
GROUP BY r.shipment_id ORDER BY records DESC;

-- @statement explore-incidents-count
-- Count flattened records, not the one-row JSON envelope.
SELECT COUNT(*) AS record_count FROM traceharbor_sources.incidents_raw
LATERAL VIEW explode(records) AS r;

-- @statement explore-incidents-rows
SELECT r.row_id, r.incident_id, r.shipment_id, r.occurred_at, r.event_type, r.reported_status, r.details, r.source_updated_at
FROM traceharbor_sources.incidents_raw LATERAL VIEW explode(records) AS r LIMIT 10;

-- @statement explore-incidents-distribution
SELECT r.event_type, COUNT(*) AS records
FROM traceharbor_sources.incidents_raw LATERAL VIEW explode(records) AS r
GROUP BY r.event_type ORDER BY records DESC;

-- @statement explore-calibration-count
-- Count flattened records, not the one-row JSON envelope.
SELECT COUNT(*) AS record_count FROM traceharbor_sources.calibration_raw
LATERAL VIEW explode(records) AS r;

-- @statement explore-calibration-rows
SELECT r.row_id, r.calibration_id, r.sensor_id, r.valid_from, r.valid_to, r.offset_c, r.status, r.reference_method, r.confirmed_at, r.source_updated_at
FROM traceharbor_sources.calibration_raw LATERAL VIEW explode(records) AS r LIMIT 10;

-- @statement explore-calibration-distribution
SELECT r.status, COUNT(*) AS records
FROM traceharbor_sources.calibration_raw LATERAL VIEW explode(records) AS r
GROUP BY r.status ORDER BY records DESC;

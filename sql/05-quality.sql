-- @statement register-telemetry-integrity
-- This synthetic sensor envelope is separate from the cargo operating range.
REGISTER DQ telemetry_integrity TABLE lightning.metastore.traceharbor.shipment_evidence.telemetry AS
row_id <> '' AND reading_id <> '' AND shipment_id <> ''
AND sensor_id IS NOT NULL AND sensor_id <> ''
AND observed_at IS NOT NULL AND observed_at <> ''
AND temperature_c IS NOT NULL AND temperature_c >= -80 AND temperature_c <= 80;

-- @statement list-quality-rules
LIST DQ USL lightning.metastore.traceharbor.shipment_evidence;

-- @statement execute-telemetry-integrity
RUN DQ telemetry_integrity TABLE lightning.metastore.traceharbor.shipment_evidence.telemetry;

-- @statement inspect-invalid-readings
SHOW DQ INVALID RECORD telemetry_integrity TABLE lightning.metastore.traceharbor.shipment_evidence.telemetry;

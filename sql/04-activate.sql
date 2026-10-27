-- @statement activate-manifest
ACTIVATE USL TABLE lightning.metastore.traceharbor.shipment_evidence.manifest AS
SELECT COALESCE(CAST(r.row_id AS STRING), '') AS row_id,
  COALESCE(CAST(r.shipment_id AS STRING), '') AS shipment_id,
  CAST(r.consignee AS STRING) AS consignee,
  CAST(r.route AS STRING) AS route,
  CAST(r.origin AS STRING) AS origin,
  CAST(r.destination AS STRING) AS destination,
  CAST(r.cargo_label AS STRING) AS cargo_label,
  CAST(r.primary_sensor_id AS STRING) AS primary_sensor_id,
  CAST(r.min_temp_c AS DOUBLE) AS min_temp_c,
  CAST(r.max_temp_c AS DOUBLE) AS max_temp_c,
  CAST(r.investigation_window_start AS STRING) AS investigation_window_start,
  CAST(r.investigation_window_end AS STRING) AS investigation_window_end,
  CAST(r.expected_interval_minutes AS INT) AS expected_interval_minutes,
  CAST(r.promised_at AS STRING) AS promised_at,
  CAST(r.reported_status AS STRING) AS reported_status,
  CAST(r.reported_status_at AS STRING) AS reported_status_at,
  CAST(r.source_updated_at AS STRING) AS source_updated_at
FROM traceharbor_sources.manifest_raw LATERAL VIEW explode(records) AS r;

-- @statement activate-telemetry
ACTIVATE USL TABLE lightning.metastore.traceharbor.shipment_evidence.telemetry AS
SELECT COALESCE(CAST(r.row_id AS STRING), '') AS row_id,
  COALESCE(CAST(r.reading_id AS STRING), '') AS reading_id,
  COALESCE(CAST(r.shipment_id AS STRING), '') AS shipment_id,
  CAST(r.sensor_id AS STRING) AS sensor_id,
  CAST(r.observed_at AS STRING) AS observed_at,
  CAST(r.temperature_c AS DOUBLE) AS temperature_c,
  CAST(r.reading_quality AS STRING) AS reading_quality,
  CAST(r.source_updated_at AS STRING) AS source_updated_at
FROM traceharbor_sources.telemetry_raw LATERAL VIEW explode(records) AS r;

-- @statement activate-incidents
ACTIVATE USL TABLE lightning.metastore.traceharbor.shipment_evidence.incidents AS
SELECT COALESCE(CAST(r.row_id AS STRING), '') AS row_id,
  COALESCE(CAST(r.incident_id AS STRING), '') AS incident_id,
  COALESCE(CAST(r.shipment_id AS STRING), '') AS shipment_id,
  CAST(r.occurred_at AS STRING) AS occurred_at,
  CAST(r.event_type AS STRING) AS event_type,
  CAST(r.reported_status AS STRING) AS reported_status,
  CAST(r.details AS STRING) AS details,
  CAST(r.source_updated_at AS STRING) AS source_updated_at
FROM traceharbor_sources.incidents_raw LATERAL VIEW explode(records) AS r;

-- @statement activate-calibration
ACTIVATE USL TABLE lightning.metastore.traceharbor.shipment_evidence.calibration AS
SELECT COALESCE(CAST(r.row_id AS STRING), '') AS row_id,
  COALESCE(CAST(r.calibration_id AS STRING), '') AS calibration_id,
  CAST(r.sensor_id AS STRING) AS sensor_id,
  CAST(r.valid_from AS STRING) AS valid_from,
  CAST(r.valid_to AS STRING) AS valid_to,
  CAST(r.offset_c AS DOUBLE) AS offset_c,
  CAST(r.status AS STRING) AS status,
  CAST(r.reference_method AS STRING) AS reference_method,
  CAST(r.confirmed_at AS STRING) AS confirmed_at,
  CAST(r.source_updated_at AS STRING) AS source_updated_at
FROM traceharbor_sources.calibration_raw LATERAL VIEW explode(records) AS r;

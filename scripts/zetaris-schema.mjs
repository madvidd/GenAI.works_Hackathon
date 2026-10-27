// Column order is an explicit contract for Zetaris row-array responses.
export const USL_PREFIX = 'lightning.metastore.traceharbor.shipment_evidence';
export const FEED_COLUMNS = {
  "manifest": [
    "row_id",
    "shipment_id",
    "consignee",
    "route",
    "origin",
    "destination",
    "cargo_label",
    "primary_sensor_id",
    "min_temp_c",
    "max_temp_c",
    "investigation_window_start",
    "investigation_window_end",
    "expected_interval_minutes",
    "promised_at",
    "reported_status",
    "reported_status_at",
    "source_updated_at"
  ],
  "telemetry": [
    "row_id",
    "reading_id",
    "shipment_id",
    "sensor_id",
    "observed_at",
    "temperature_c",
    "reading_quality",
    "source_updated_at"
  ],
  "incidents": [
    "row_id",
    "incident_id",
    "shipment_id",
    "occurred_at",
    "event_type",
    "reported_status",
    "details",
    "source_updated_at"
  ],
  "calibration": [
    "row_id",
    "calibration_id",
    "sensor_id",
    "valid_from",
    "valid_to",
    "offset_c",
    "status",
    "reference_method",
    "confirmed_at",
    "source_updated_at"
  ]
};
export const feedQuery = name => {
  if (!Object.hasOwn(FEED_COLUMNS, name)) throw new Error('Unknown governed feed.');
  return 'SELECT ' + FEED_COLUMNS[name].join(', ') + ' FROM ' + USL_PREFIX + '.' + name;
};

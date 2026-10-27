-- @statement create-parent-namespace
CREATE NAMESPACE IF NOT EXISTS lightning.metastore;

-- @statement create-traceharbor-namespace
CREATE NAMESPACE IF NOT EXISTS lightning.metastore.traceharbor;

-- @statement compile-usl
-- Send the complete COMPILE and every CREATE TABLE below in ONE API request.
COMPILE USL shipment_evidence DEPLOY NAMESPACE lightning.metastore.traceharbor DDL
CREATE TABLE manifest (
  row_id varchar(64) NOT NULL,
  shipment_id varchar(64) NOT NULL PRIMARY KEY,
  consignee varchar(200),
  route varchar(200),
  origin varchar(100),
  destination varchar(100),
  cargo_label varchar(200),
  primary_sensor_id varchar(64),
  min_temp_c double,
  max_temp_c double,
  investigation_window_start varchar(64),
  investigation_window_end varchar(64),
  expected_interval_minutes int,
  promised_at varchar(64),
  reported_status varchar(64),
  reported_status_at varchar(64),
  source_updated_at varchar(64)
);
CREATE TABLE telemetry (
  row_id varchar(64) NOT NULL,
  reading_id varchar(64) NOT NULL PRIMARY KEY,
  shipment_id varchar(64) NOT NULL FOREIGN KEY REFERENCES manifest(shipment_id),
  sensor_id varchar(64),
  observed_at varchar(64),
  temperature_c double,
  reading_quality varchar(64),
  source_updated_at varchar(64)
);
CREATE TABLE incidents (
  row_id varchar(64) NOT NULL,
  incident_id varchar(64) NOT NULL PRIMARY KEY,
  shipment_id varchar(64) NOT NULL FOREIGN KEY REFERENCES manifest(shipment_id),
  occurred_at varchar(64),
  event_type varchar(100),
  reported_status varchar(64),
  details varchar(2000),
  source_updated_at varchar(64)
);
CREATE TABLE calibration (
  row_id varchar(64) NOT NULL,
  calibration_id varchar(64) NOT NULL PRIMARY KEY,
  sensor_id varchar(64),
  valid_from varchar(64),
  valid_to varchar(64),
  offset_c double,
  status varchar(64),
  reference_method varchar(500),
  confirmed_at varchar(64),
  source_updated_at varchar(64)
);

-- @statement create-source-database
CREATE LIGHTNING DATABASE traceharbor_sources DESCRIBE BY "TraceHarbor synthetic operational sources";

-- @statement register-manifest
CREATE LIGHTNING REST TABLE manifest_raw FROM traceharbor_sources REQUEST (
  endpoint "__PUBLIC_ORIGIN__/data/manifest.json",
  method "get", response_type "json", http_encoding "URLENCODED"
) HEADER () BODY ();

-- @statement register-telemetry
CREATE LIGHTNING REST TABLE telemetry_raw FROM traceharbor_sources REQUEST (
  endpoint "__PUBLIC_ORIGIN__/data/telemetry.json",
  method "get", response_type "json", http_encoding "URLENCODED"
) HEADER () BODY ();

-- @statement register-incidents
CREATE LIGHTNING REST TABLE incidents_raw FROM traceharbor_sources REQUEST (
  endpoint "__PUBLIC_ORIGIN__/data/incidents.json",
  method "get", response_type "json", http_encoding "URLENCODED"
) HEADER () BODY ();

-- @statement register-calibration
CREATE LIGHTNING REST TABLE calibration_raw FROM traceharbor_sources REQUEST (
  endpoint "__PUBLIC_ORIGIN__/data/calibration.json",
  method "get", response_type "json", http_encoding "URLENCODED"
) HEADER () BODY ();

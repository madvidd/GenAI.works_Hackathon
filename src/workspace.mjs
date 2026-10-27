import { FEED_NAMES, investigateShipment } from "../core/investigator.mjs";

/** Validate before replacing a working browser workspace. Invalid readings remain
 * inspectable evidence; broken identities and envelopes are rejected atomically. */
export function validateWorkspaceDataset(feeds) {
  for (const name of FEED_NAMES) {
    const feed = feeds?.[name];
    if (!Array.isArray(feed?.records)) throw Error(`Missing ${name}.records`);
    for (const field of ["source_system", "dataset_id"])
      if (feed[field] !== undefined && typeof feed[field] !== "string")
        throw Error(`${name}.${field} must be text when provided.`);
    if (feed.records.length > 5000)
      throw Error("Keep inputs to 50 shipments and 5,000 records per source.");
    if (
      feed.records.some(
        (row) => !row || typeof row !== "object" || Array.isArray(row),
      )
    )
      throw Error(`${name}.records must contain record objects.`);
  }
  if (!feeds.manifest.records.length)
    throw Error(
      "Include at least one shipment in manifest.records. Your current workspace is unchanged.",
    );
  if (feeds.manifest.records.length > 50)
    throw Error("Keep inputs to 50 shipments and 5,000 records per source.");
  const ids = new Set();
  for (const name of FEED_NAMES)
    for (const row of feeds[name].records) {
      if (
        typeof row.row_id !== "string" ||
        !row.row_id.trim() ||
        ids.has(row.row_id)
      )
        throw Error(
          "Every source record needs a unique, nonempty row_id across the dataset.",
        );
      ids.add(row.row_id);
    }
  for (const row of feeds.manifest.records) {
    for (const key of [
      "shipment_id",
      "origin",
      "destination",
      "route",
      "consignee",
      "primary_sensor_id",
    ])
      if (typeof row[key] !== "string" || !row[key].trim())
        throw Error(`A shipment is missing ${key}.`);
    investigateShipment(feeds, row.shipment_id);
  }
  return feeds;
}

/** Malformed source values remain inspectable as text, never React children. */
export function displaySourceValue(value) {
  if (value === null || value === undefined) return "—";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

export function changeWorkspaceReading(feeds, shipmentId, rowId, value) {
  const temperature = Number(value);
  if (!rowId || !Number.isFinite(temperature) || String(value).trim() === "")
    throw Error("Choose a reading and enter a temperature.");
  const row = feeds.telemetry.records.find(
    (item) => item.row_id === rowId && item.shipment_id === shipmentId,
  );
  if (!row) throw Error("Select a reading from the current shipment.");
  const next = structuredClone(feeds);
  next.telemetry.records = next.telemetry.records.map((item) =>
    item.row_id === rowId
      ? {
          ...item,
          temperature_c: temperature,
          browser_edit: {
            kind: "user-supplied what-if",
            original_temperature_c:
              item.browser_edit?.original_temperature_c ?? item.temperature_c,
            modified_temperature_c: temperature,
          },
        }
      : item,
  );
  return next;
}

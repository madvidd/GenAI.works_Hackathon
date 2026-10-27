import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadFixtureFeeds } from "../server/agent.mjs";
import { investigateShipment } from "../core/investigator.mjs";
import {
  validateWorkspaceDataset,
  changeWorkspaceReading,
  displaySourceValue,
} from "../src/workspace.mjs";

test("an import cannot replace the workspace with an empty or unrenderable manifest", async () => {
  const feeds = await loadFixtureFeeds();
  assert.equal(validateWorkspaceDataset(feeds), feeds);
  const empty = structuredClone(feeds);
  empty.manifest.records = [];
  assert.throws(() => validateWorkspaceDataset(empty), /at least one shipment/);
  const malformed = structuredClone(feeds);
  delete malformed.manifest.records[0].consignee;
  assert.throws(() => validateWorkspaceDataset(malformed), /consignee/);
  assert.equal(investigateShipment(feeds, "TH-1042").outcome, "sensor_bias");
});

test("imports reject ambiguous global row identity and duplicate shipment identity", async () => {
  const feeds = await loadFixtureFeeds();
  const duplicateRow = structuredClone(feeds);
  duplicateRow.incidents.records[0].row_id =
    duplicateRow.telemetry.records[0].row_id;
  assert.throws(() => validateWorkspaceDataset(duplicateRow), /unique/);
  const duplicateShipment = structuredClone(feeds);
  duplicateShipment.manifest.records.push({
    ...feeds.manifest.records[0],
    row_id: "DUPLICATE-MANIFEST",
  });
  assert.throws(
    () => validateWorkspaceDataset(duplicateShipment),
    /Expected one manifest/,
  );
});

test("imports reject metadata that would crash the source cards before replacing data", async () => {
  const feeds = await loadFixtureFeeds();
  for (const source of ["manifest", "telemetry", "incidents", "calibration"])
    for (const field of ["source_system", "dataset_id"])
      for (const value of [{ unexpected: "object" }, ["array"], false, 42, null]) {
        const malformed = structuredClone(feeds);
        malformed[source][field] = value;
        assert.throws(
          () => validateWorkspaceDataset(malformed),
          new RegExp(`${source}\\.${field} must be text`),
        );
      }
  const optional = structuredClone(feeds);
  delete optional.telemetry.source_system;
  delete optional.telemetry.dataset_id;
  assert.equal(validateWorkspaceDataset(optional), optional);
  assert.equal(investigateShipment(feeds, "TH-1042").outcome, "sensor_bias");
});

test("malformed readings stay rejected and their retained fields render as text", async () => {
  const feeds = await loadFixtureFeeds();
  const row = feeds.telemetry.records.find(
    (item) => item.shipment_id === "TH-1044",
  );
  row.reading_id = { malformed: "reading-id" };
  row.observed_at = { malformed: "event-time" };
  row.source_updated_at = ["unexpected", "timestamp"];
  row.temperature_c = { malformed: "temperature" };
  assert.equal(validateWorkspaceDataset(feeds), feeds);
  const result = investigateShipment(feeds, "TH-1044");
  assert.ok(result.rejectedRows.some((item) => item.row.row_id === row.row_id));
  assert.ok(!result.chart.some((item) => item.rowId === row.row_id));
  const evidence = result.evidence.find((item) => item.id === row.row_id);
  assert.deepEqual(evidence.record, row);
  const values = [
    evidence.recordId,
    evidence.timestamp,
    evidence.sourceUpdatedAt,
    row.temperature_c,
  ].map(displaySourceValue);
  const markup = renderToStaticMarkup(
    React.createElement(
      "dl",
      null,
      ...values.map((value, index) =>
        React.createElement("dd", { key: index }, value),
      ),
    ),
  );
  assert.match(markup, /reading-id/);
  assert.match(markup, /event-time/);
  assert.match(markup, /timestamp/);
  assert.match(markup, /temperature/);
  assert.equal(displaySourceValue("TEL-1044-00"), "TEL-1044-00");
  assert.equal(displaySourceValue(0), "0");
  assert.equal(displaySourceValue(undefined), "—");
});

test("reading edits are scoped to the selected shipment and leave original data intact", async () => {
  const feeds = await loadFixtureFeeds();
  const row = feeds.telemetry.records.find(
    (item) => item.shipment_id === "TH-1044",
  );
  assert.throws(
    () => changeWorkspaceReading(feeds, "TH-1042", row.row_id, "9.2"),
    /current shipment/,
  );
  assert.throws(
    () => changeWorkspaceReading(feeds, "TH-1044", row.row_id, ""),
    /temperature/,
  );
  const changed = changeWorkspaceReading(feeds, "TH-1044", row.row_id, "9.2");
  assert.equal(investigateShipment(changed, "TH-1044").outcome, "excursion");
  const editedRow = changed.telemetry.records.find(
    (item) => item.row_id === row.row_id,
  );
  assert.equal(
    editedRow.browser_edit.original_temperature_c,
    row.temperature_c,
  );
  assert.equal(editedRow.browser_edit.modified_temperature_c, 9.2);
  const editedAgain = changeWorkspaceReading(
    changed,
    "TH-1044",
    row.row_id,
    "9.8",
  );
  assert.equal(
    editedAgain.telemetry.records.find((item) => item.row_id === row.row_id)
      .browser_edit.original_temperature_c,
    row.temperature_c,
  );
  assert.equal(investigateShipment(feeds, "TH-1044").outcome, "within_range");
});

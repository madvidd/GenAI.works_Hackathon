# Actual combined agent runs

These archives contain real Nightshift, Zetaris and Meterless World Model
execution on the synthetic TH-1042 case. They are separate from the credential-free
sample outputs and mocked transport tests.

| Attempt | Actual result |
| --- | --- |
| `attempt-01` | Planner succeeded; the first Zetaris request hit the client's 60-second timeout. Existing server history later recorded success after 60.5 seconds. No critic, synthesis or completed dossier was produced. |
| `attempt-02` | Complete in 142.323 seconds: three local model calls, four actual USL reads, 46 records consumed through the official World Model, and a cited sensor-bias dossier. |
| `attempt-03-browser` | Complete through the actual local browser UI; the UI displayed 143.631 seconds. The downloaded live dossier matches all server result fields, with the expected added UI trace and export metadata. |

Two of three full attempts completed. Attempt 02 remains the timing reference;
the browser run has its own validation record, screenshots and downloaded export
under `submission/browser-qa/`.

The successful run's model chose manifest and telemetry first. Its critic then
selected incidents and calibration, plus the calibration-withholding test.
Actual extra retrieval changed `insufficient_evidence` to `sensor_bias`.
Withholding the calibration certificates changed the result back to
`insufficient_evidence`.

The returned model ID for all three successful phases was
`local-runtime/llama-3.2-1b-instruct`. No NVIDIA contribution is claimed. Strict
schemas limit admissible task questions, tools and existing result IDs; they do
not prove independent reasoning quality. The model selects priorities and
tests; deterministic calculations and finding-specific citations remain
authoritative. An earlier structurally valid but irrelevant model focus is
preserved in `../live-nightshift-preflight/planner-probe.json` with its negative
semantic review.

The client now allows 120 seconds per live SQL request and 180 seconds per model
request, within an unchanged 300-second total run cap. There is no automatic
sample fallback. The original failed attempt remains in the denominator.
The 142.323-second successful example is a service-run measurement, not a
benchmark or measured analyst-time saving; it excludes installation and setup.

`attempt-02` contains the generated dossier and manifest, actual phase trace,
four SQL responses, and engine events/audit records. Credentials were never
included in request receipts. Archives were scanned against actual local keys
and for private paths and email addresses. Only the completed trace's private
absolute `runFolder` was normalized to a repository-relative path. Artifact
hashes and checks are in `../../docs/live-agent-validation.json`.

With both local services configured, reproduce a separate new run with:

```sh
node --import tsx server/agent.mjs --mode live --shipment TH-1042
```

Results may differ in model-selected tools or priorities. Missing evidence must
remain unresolved rather than receiving a stored successful answer.

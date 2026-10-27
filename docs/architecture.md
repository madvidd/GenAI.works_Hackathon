# TraceHarbor architecture

[Documentation](README.md) · [Getting started](getting-started.md) · [Evidence guide](evidence-guide.md)

The verified baseline is dated 27 October 2026. Its [clean-clone check](clean-clone-validation.json) covers published commit `ca1f6b7`: fresh dependency installation, 16 tests, production build and three sample CLI cases without credentials or sponsor calls. Separate [actual service receipts](../examples/live-agent/attempt-02/) show three model calls and four governed reads completing in 142.323 seconds. New source changes require new validation; transport unit tests and actual service receipts remain distinct.

The current 1.0.2 revision has 33 passing local tests. It also has [two actual browser-driven investigations](live-revision-validation.json): TH-1042 supports sensor bias, while TH-1043 retains insufficient evidence. Each used three actual Nightshift calls, four Zetaris reads and official World Model context. The [current UI checks](ui-validation.json) cover the redesigned interactions. Final publication and exact-revision clean-clone verification remain distinct from these local runs.

## Implementation map

| Component | Responsibility | Source |
| --- | --- | --- |
| React workspace | Case selection, evidence views, imports, experiments and dossier export | [`src/main.jsx`](../src/main.jsx), [`src/workspace.mjs`](../src/workspace.mjs) |
| Numerical evidence core | Identity, calibration, coverage, measured outcomes and source-backed findings | [`core/investigator.mjs`](../core/investigator.mjs) |
| Agent coordinator | Bounded planner/retrieval/critic/synthesis workflow and run artifacts | [`server/agent.mjs`](../server/agent.mjs) |
| Graph context | Official World Model ingestion, evidence reconstruction and source-priority facts | [`server/world-context.mjs`](../server/world-context.mjs) |
| Model boundary | Nightshift requests, output contracts, token budgets and returned-model receipts | [`server/nightshift.mjs`](../server/nightshift.mjs), [`server/output-schemas.mjs`](../server/output-schemas.mjs) |
| Database boundary | Actual Zetaris REST requests and deterministic row decoding | [`scripts/zetaris-client.mjs`](../scripts/zetaris-client.mjs), [`scripts/zetaris-schema.mjs`](../scripts/zetaris-schema.mjs) |
| Local HTTP companion | Same-origin built UI and bounded loopback investigation endpoint | [`server/http.mjs`](../server/http.mjs) |

The public browser imports the browser-safe evidence core. It does not run the Node.js agent, access private service tokens or claim World Model/model/database execution. The sample CLI and live runner consume the official World Model through the server-side wrapper.

## Problem boundary

An operations analyst has a disputed temperature alert. A manifest says the shipment is clear, the logger shows a spike, a carrier note describes a door event, and calibration may change the meaning of a reading. TraceHarbor investigates one bounded observation window and returns an explanation, contradictions, missing evidence, and proposed next actions for a human operator.

A door event near an excursion is an association, not experimental proof of causation. An observation gap remains unknown. A sensor correction requires a confirmed certificate valid at the observation time. The system does not certify product safety or execute a physical action.

## Execution modes

| Mode | Data and reasoning | What it demonstrates |
| --- | --- | --- |
| Browser demonstration | Public synthetic feeds and input-dependent deterministic computation | Interactive evidence inspection and calculations |
| Sample runner | Fixture inputs and executable local logic with no external credentials | Programmatic behavior and explicitly disclosed sample traces |
| Live runner | Zetaris USL evidence, Meterless World Model feature, and actual models through Nightshift | Sponsor integration only when actual receipts and tests exist |

Never label the first two modes as live model or database execution. Live failures remain visible. An explicitly selected sample rerun is a separate run with its own mode, ID, and provenance.

## Implemented live data flow

```mermaid
flowchart LR
  M[Shipment manifest] --> Z[Zetaris source registrations]
  T[Sensor telemetry] --> Z
  I[Carrier event log] --> Z
  C[Calibration register] --> Z
  Z --> U[Shipment evidence USL and DQ]
  U --> R[Evidence retrieval]
  R --> A[Validated analysis]
  A --> K[Critic]
  K -->|Retrieve missing source| R
  K -->|Withhold evidence and recompute| A
  K -->|Approved bounded claims| D[Evidence dossier]
  W[Meterless World Model] <--> A
  N[Nightshift] <--> P[Planner and bounded selection agents]
  P <--> R
  P <--> K
```

This diagram describes the code. It is not a real-service execution receipt.

## Decisions and authority

| Role | Decision owned | Required run evidence |
| --- | --- | --- |
| Planner | Choose initial allowed sources and an investigation question | Request, plan, handoff, actual model receipt in live mode |
| Retriever / data steward | Retrieve and validate evidence without losing original rows | SQL, row results/counts, rejected records and reasons |
| Analyst | Calculate calibrated observations, schedule coverage, and supported hypotheses | Inputs, calculations, and source IDs |
| Critic | Retrieve missing evidence and choose a bounded evidence-withholding recheck; preserve unsupported conclusions as unresolved | Actual extra query, provisional/final outcome, challenge, selected intervention, recomputed result |
| Dossier writer | Communicate only approved claims with citations and limits | Current generated result linked to the request and trace |

Names alone are insufficient. The critic must change what can be concluded. Preserve initial and revised interpretations so a judge can see why the answer changed. Record the returned model ID rather than infer it from a configured alias.

The planner chooses two or three initial sources, with manifest and telemetry required. The critic sees the provisional result and unfetched source list, can request missing sources, and causes actual allowlisted SQL reads. Returned rows are re-ingested into the official World Model before factual analysis is recomputed. In the mocked transport test, retrieving calibration changes insufficient evidence to a sensor-bias explanation; declining that retrieval leaves the case unresolved. The manifest records `initialSources`, `criticSources`, `provisionalOutcome`, `finalOutcome`, and `remainingMissingSources`. That unit test proves the code branch. In the separate actual live run, the planner chose manifest and telemetry; the critic selected both missing sources and calibration withholding. Four real USL reads and World Model context consumption changed insufficient evidence to sensor bias; withholding certificates then restored insufficient evidence. The selected model was `local-runtime/llama-3.2-1b-instruct`.

## Deterministic evidence contract

The current core reports `analysisVersion: 1.0.2`. Its regression suite quarantines all versions of repeated reading IDs, normalizes equivalent timestamp representations when detecting duplicates, compares unrounded measurements with limits, and rejects a cadence that cannot advance time. Duplicate reference evidence cannot silently validate a disputed correction. Calibration subtraction and reference-distance checks align finite numbers' decimal coefficients and exponents with integer arithmetic before converting the result back to a number. This removes binary subtraction noise at exact boundaries without introducing a fixed rounding step or arbitrary epsilon. These changes preserve the four supplied case outcomes while tightening ambiguous-input behavior; see the [current readiness review](readiness-review.md).

`core/investigator.mjs` exports `investigateShipment(feeds, shipmentId, options)`. `excludeRowIds` withholds evidence; `ignoreCalibration` withholds correction. These are sensitivity checks on the available record, not predictions of an intervention in the real world.

The core requires one manifest and unique evidence IDs, bounds the window, rejects malformed or impossible observations, and applies exactly one confirmed calibration in `[valid_from, valid_to)`. Pending, expired, and overlapping certificates stay unresolved. It counts primary-sensor schedule coverage and checks gaps. Reference probes corroborate observations but cannot fill primary-sensor gaps.

A live case with no primary observations receives an explicitly labeled evidence-availability review and abstention. Runtime output validation rejects duplicated or oversized model selections. An empty evidence set is not presented as a completed measurement-based withholding test.

Original reported statuses remain visible when contradicted. Every citation must resolve to a retained row. Results are an observed excursion, sensor-bias explanation, insufficient evidence, or a bounded in-range finding. Confidence is a disclosed heuristic, not model accuracy, a safety probability, or a causal likelihood.

## Meterless boundary

The World Model feature uses the official engine implementation and preserves its Apache-2.0 license/notices. Upstream reference revision: `1742dec56a66e58eef9dda2d2b865823758ca8cd`. The local feature test passed: 46 source rows were ingested; a warm reload skipped all 46 unchanged rows with no new ingest events; four distinct shipment identities remained separate. External keys prevent fuzzy-name matching from merging similar shipment IDs. The investigator consumes evidence reconstructed from the graph. The official upstream conformance runner was executed separately and passed 8/8.

## Zetaris boundary

The numbered SQL files cover separately registered feeds, three exploratory queries per source, a four-table USL, activation mappings, integrity-rule execution, and three USL investigation queries. These are four synthetic operational datasets on one host, not four production providers.

USL joins preserve row IDs. A one-to-many event join must not inflate observation counts. The core reasons from original rows and distinct schedule positions. The REST adapter sends one SQL block per request, with the real bearer token, organization ID, fresh request UUID, and documented `queryId/sql/source/limit` body. It rejects unexpected response shapes and redacts tokens from errors.

## Hosting and API

The React/Vite site serves public assets and synthetic data. It embeds no provider token. Its live integration contract is:

```http
POST /api/investigate
Content-Type: application/json

{"shipmentId":"TH-1041","mode":"live"}
```

The successful envelope is `{ "result": <investigation result> }`. `npm start` serves the built UI and API at `http://127.0.0.1:8787`, with a loopback host/origin check, one active run, and a three-run/ten-minute budget. A static Firebase deployment does not provide this API or reach the developer's localhost. Keep the hosted live control unavailable or return a clear service error when the backend is absent. Public backend deployment is not claimed.

## Runtime controls and evidence

The live runner permits three model calls, four governed source reads and 300 seconds total. Individual model calls allow 180 seconds and live SQL reads 120 seconds within that remaining total. Setup/contract-check SQL retains its 60-second default. Streaming response caps are 1 MB for Nightshift and 2 MB for Zetaris. Strict JSON schemas limit legitimate task questions, tool names and existing finding/action/citation IDs; source/recheck choices remain model decisions. The deterministic core retains authority over numerical claims and outcomes. The critic’s displayed challenge is a canonical description of its chosen test. Incident prose is untrusted evidence, never executable instructions. Calculations and citation validation must remain independent of source-note commands.

Before claiming the full architecture works, retain: clean-clone sample execution with no credentials/services; changed-input results; actual live critique/retrieval branching; passing World Model tests; Zetaris source/USL/DQ receipts; a Nightshift completion with returned model ID; and browser/export/deployment checks. Selected published artifacts must be redacted. Missing evidence and partial failures stay visible.

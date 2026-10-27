# TraceHarbor

**Investigate a cold-chain exception. Show the evidence. Know when to abstain.**

TraceHarbor is an Open Agent Hackathon 2026 project for **The Agent That Can Explain Why**. It helps an operations analyst examine a disputed temperature alert across a shipment manifest, sensor telemetry, carrier events, and calibration records. It preserves conflicting claims and explains which observations support an outcome.

Built by **Vengers**. [Open the verified deployed sample](https://traceharbor.web.app).

All demonstration data is synthetic. The application supports investigation; it does not authorize cargo release, disposal, consumption, or a safety certification. Temperature limits are fixture assumptions, not regulatory standards.

## Implementation status

Status reviewed on **27 October 2026**. This is a development status, not a submission-ready claim.

| Part | Evidence currently available | Remaining verification |
| --- | --- | --- |
| Deterministic investigation | Input-dependent implementation; local 14-test suite passed | Clean-clone validation |
| Evidence provenance | Stable row IDs, original source rows, timestamps, calibration matches, and citation checks | UI and export verification |
| Zetaris | REST adapter, source-registration plan, USL DDL, exploration queries, and data-quality SQL | Execute against a real instance and retain actual receipts |
| Meterless World Model | 46 source rows ingested; warm reload skipped all 46 unchanged rows; upstream conformance runner passed 8/8 | Clean-clone repeat pending |
| Meterless Nightshift | Installed runtime reachable; authenticated model discovery succeeds | Actual completion returned `no_provider_configured`; configure a provider and retain successful calls |
| NVIDIA Nemotron | Planned through Nightshift | Actual returned model IDs and run evidence |
| Website and examples | Deployed sample verified; four feeds and calibration-withholding interaction checked; four actual sample runs in `examples/` | Final clean-clone repeat |
| Deck | [Editable PowerPoint](submission/traceharbor.pptx) and [PDF](submission/traceharbor.pdf), eight slides, actual screenshots, all pages visually inspected | Refresh sponsor status after a successful live run |
| Video | Three-minute narration and shot plan | Actual audio recording and public-access verification |

An SQL file is not proof that Zetaris ran. A configured model name is not proof that NVIDIA handled a request. Sample computation never claims a sponsor call occurred. See the [requirements matrix](docs/requirements-matrix.md) for release gates.

## What the investigation computes

The analysis validates observation identity and sensor integrity, applies only an unambiguous confirmed calibration valid at the observation time, checks the primary sensor's expected sampling schedule, and compares measured evidence with reported statuses. Findings and proposed next steps cite their source rows.

| Case | What makes it useful |
| --- | --- |
| `TH-1041` | A reported clear status conflicts with calibrated out-of-range readings. A nearby door event supports an association, not proven causation. An invalid 999 C observation is excluded. |
| `TH-1042` | A confirmed sensor offset explains a raw alarm. Reference observations corroborate the correction. An expired certificate must not override the applicable certificate. |
| `TH-1043` | Sparse readings, a pending calibration, and a confident operator note are insufficient to clear the exception. The result abstains and requests missing evidence. |
| `TH-1044` | A normal control with a complete observation window and confirmed zero offset. |

These are scenarios, not hardcoded answer keys. The analysis uses the supplied observations and calibration records. Altering or withholding evidence must change the result. Runtime code must not load final answers from `output_examples/`.

Confidence is a transparent heuristic for evidence strength, **not a calibrated probability**. Discrete observations do not establish continuous temperature or exact exposure duration. Read the [data contract](data/README.md) for the assumptions.

## Development commands

Use Node.js 22.11 or later and npm. Commands below are the project package interface; the final clean-clone check remains pending.

```sh
npm ci
npm run dev
```

```sh
npm run test
npm run check
npm run build
npm run preview
```

The World Model feature check is `official World Model warm-loads, preserves identities, and skips unchanged ingest` in [`tests/runtime.test.mjs`](tests/runtime.test.mjs). Run it with the full `npm run test` suite. The local suite passed 14 tests. The official upstream World Model conformance runner also passed 8/8 against the vendored implementation, covering stable IDs, merge bands, provenance rejection, unchanged/mutated ingestion, bitemporal edges, and audit behavior. A fresh-clone repeat remains a separate gate. Mocked transport tests are labeled in their names.

The React/Vite frontend runs the deterministic demonstration on synthetic feeds. The programmatic agent commands are:

```sh
npm run agent:sample
npm run agent:live
```

Select a case with `npm run agent:sample -- --shipment TH-1042`. The runner writes `dossier.json`, `manifest.json`, `trace.jsonl`, `world-events.jsonl`, and `world-audit.jsonl` under a unique `logs/runs/` directory. Live runs also write `zetaris-queries.jsonl`.

Sample mode runs without Zetaris, Nightshift, or credentials and discloses its mode. Live mode requires actual configured services. A live failure does not silently become a sample success. The local orchestration tests use mocked network transports; they are not proof of actual sponsor execution.

After building, run the local live companion:

```sh
npm run build
npm start
```

Open `http://127.0.0.1:8787`. The companion serves the built UI and `/api/investigate` on the same local origin. It permits one active investigation and at most three live requests per ten minutes. It binds to loopback; it is not a publicly exposed backend.

The core can also be inspected independently without dependencies or credentials:

```sh
node --input-type=module -e "import fs from 'node:fs'; import {investigateShipment,FEED_NAMES} from './core/investigator.mjs'; const feeds=Object.fromEntries(FEED_NAMES.map(n=>[n,JSON.parse(fs.readFileSync('data/'+n+'.json','utf8'))])); console.log(JSON.stringify(investigateShipment(feeds,'TH-1041'),null,2));"
```

This last command does not call any sponsor service.

## Sponsor configuration

Copy `.env.example` to the ignored `.env.local`, then enter real local values. Never commit either token. Keep the NVIDIA provider key in **Nightshift's Providers tab**, outside this repository.

| Variable | Purpose |
| --- | --- |
| `ZETARIS_BASE_URL` | Zetaris REST base URL, normally `http://localhost:8888/api/v1.0` |
| `ZETARIS_API_KEY` | Zetaris API token |
| `ZETARIS_ORG_ID` | Numeric organization ID; local installs normally use `1` |
| `TRACEHARBOR_PUBLIC_ORIGIN` | Verified HTTPS origin serving the four public synthetic feeds |
| `NIGHTSHIFT_BASE_URL` | Runtime URL, normally `http://127.0.0.1:8088/v1` |
| `NIGHTSHIFT_API_KEY` | Nightshift Runtime token, not an NVIDIA provider key |
| `NIGHTSHIFT_MODEL` | Discovered Runtime model ID; `meterless/auto` may select a non-NVIDIA model |

`ZETARIS_REST_URL` is also accepted by the Zetaris adapter. The supplied example uses `ZETARIS_BASE_URL` consistently. A container's `localhost` addresses that container, so containers need a documented address that reaches services on the host.

## Zetaris setup

Install and configure the actual platform using the official [participant resources](https://hackathon.genai.works/dashboard). Zetaris must be able to reach the public JSON feeds. Publishing a static frontend alone does not connect it to a developer's local database.

Preview the exact source-registration, exploration, USL, and data-quality plan:

```sh
node scripts/zetaris-setup.mjs --origin https://YOUR_PROJECT.web.app
```

After checking the target instance and published feed content, execute the plan:

```sh
node scripts/zetaris-setup.mjs --origin https://YOUR_PROJECT.web.app --execute
```

The runner verifies public feeds against local fixtures, executes bounded requests in sequence, and retains actual JSONL receipts under `logs/zetaris/`. It stops on errors. It does not delete or replace existing objects. Inspect any partial result before rerunning.

For an already configured instance:

```sh
node scripts/zetaris-setup.mjs --origin https://YOUR_PROJECT.web.app --verify-only --execute
```

Read [SQL setup and evidence](sql/README.md) before running mutations. A successful connectivity query alone is insufficient: the live application must consume the USL evidence and the data-quality rule must be shown executing.

## Architecture and evidence

The implemented live workflow uses Nightshift for a planner, critic, and supported synthesis. The planner chooses two or three initial sources from four allowlisted Zetaris reads. The critic can retrieve missing sources; those results are ingested into the World Model and factual analysis is recomputed. Unfetched sources remain explicitly unknown. The World Model ingests evidence and its graph context is read back into the deterministic investigator. The critic selects an evidence-withholding test that actually reruns the analysis. Synthesis selects existing supported findings/actions; numerical claims and citation validation remain in the deterministic core. This path is implemented and locally tested, but real service execution remains pending.

The public static website cannot access the builder's private local services. Live runs belong in the documented backend environment where Zetaris and Nightshift are reachable. The frontend's same-origin integration contract is `POST /api/investigate` with `{ "shipmentId": "TH-1041", "mode": "live" }`, returning `{ "result": ... }`. Backend availability is a separate deployment requirement. See [architecture](docs/architecture.md).

Every live run should retain its request, generated result, JSONL trace, actual Zetaris receipts, engine activity, returned model IDs, and failures or fallbacks. Redact credentials before selecting evidence for publication. Never handwrite a trace or pass a sample trace off as a live run.

## Submission materials

- [Requirements and current evidence](docs/requirements-matrix.md)
- [Resource review ledger](docs/resource-review-ledger.md)
- [Zetaris reflections and proposed improvement](docs/zetaris-reflections.md)
- [Sponsor technology explanation](docs/sponsor-technology.md)
- [Three-minute demo narration and recording plan](docs/demo-script.md)
- [Eight-slide source content](docs/slide-deck.md)
- [Submission fields and final validation](docs/submission-checklist.md)
- [`metadata.json`](metadata.json)

The narration and slide source are preparation materials, not a recorded video or finished deck. Deadline: **27 October 2026, 23:45 UTC**. Team membership locks when the first submission is created. Official rules and current announcements govern conflicts with older guides.

## Attribution and limitations

This project is developed with OpenAI Codex as an AI coding tool. Cursor use is not claimed. Generated code remains subject to review and testing; test evidence is recorded separately. The synthetic fixtures are original project data. No customer interview, commercial outcome, or measured time saving is asserted.

The Meterless World Model integration uses the official Apache-2.0 engine implementation; its original license and notices must remain with vendored files. See [sponsor attribution](docs/sponsor-technology.md) for the source revision and implementation boundary. Zetaris SQL follows the official getting-started documentation. Sponsor guides are linked rather than republished.

Project-authored code and fixture data retain the existing [MIT license](LICENSE), copyright 2026 Seyed Mohammad Salehi. Third-party components retain their own licenses.

# TraceHarbor

**Investigate a cold-chain exception. Show the evidence. Know when to abstain.**

TraceHarbor is an Open Agent Hackathon 2026 project for **The Agent That Can Explain Why**. It helps an operations analyst examine a disputed temperature alert across a shipment manifest, sensor telemetry, carrier events, and calibration records. It preserves conflicting claims and explains which observations support an outcome.

Built by **Vengers**. [Open the verified deployed sample](https://traceharbor.web.app).

All demonstration data is synthetic. The application supports investigation; it does not authorize cargo release, disposal, consumption, or a safety certification. Temperature limits are fixture assumptions, not regulatory standards.

## Implementation status

Status reviewed on **27 October 2026**. This is a development status, not a submission-ready claim.

| Part | Evidence currently available | Remaining verification |
| --- | --- | --- |
| Deterministic investigation | Input-dependent implementation; local 16-test suite passed | Clean-clone validation |
| Evidence provenance | Stable row IDs, original source rows, timestamps, calibration matches, and citation checks | UI and export verification |
| Zetaris | All 34 setup statements executed; four USL reads matched 46 records and fed the World Model; DQ returned 26 total / 25 valid / 1 invalid | Verified in the [full live run](examples/live-agent/attempt-02/); [SQL setup receipts](examples/live-zetaris/) |
| Meterless World Model | 46 source rows ingested; warm reload skipped all 46 unchanged rows; upstream conformance runner passed 8/8 | Clean-clone repeat pending |
| Meterless Nightshift | Three actual local Llama 3.2 1B completions: planner, critic and supported selection; full run completed in 142.3 seconds | Broader model-quality evaluation; [actual receipts](examples/live-agent/attempt-02/) |
| NVIDIA | No current NVIDIA or Nemotron contribution claimed | The selected local-model path is not evidence of NVIDIA use |
| Website and examples | Deployed sample verified; four feeds and calibration-withholding interaction checked; four actual sample runs in `examples/` | Final clean-clone repeat |
| Deck | [Editable PowerPoint](submission/traceharbor.pptx) and [PDF](submission/traceharbor.pdf), eight slides, actual screenshots, all pages visually inspected | Refresh sponsor status after a successful live run |
| Video | Actual narrated MP4 with subtitles and reproducible sources | Refresh final sponsor evidence and verify public playback |

An SQL file is not proof that Zetaris ran. A configured model name is not proof that NVIDIA handled a request. Sample computation never claims a sponsor call occurred. See the [requirements matrix](docs/requirements-matrix.md) for release gates.

## What the investigation computes

The analysis validates observation identity and sensor integrity, applies only an unambiguous confirmed calibration valid at the observation time, checks the primary sensor's expected sampling schedule, and compares measured evidence with reported statuses. Findings and proposed next steps cite their source rows.

| Case | What makes it useful |
| --- | --- |
| `TH-1041` | A reported clear status conflicts with calibrated out-of-range readings. A nearby door event supports an association, not proven causation. An invalid 999 C observation is excluded. |
| `TH-1042` | A confirmed sensor offset explains a raw alarm. Reference observations corroborate the correction. An expired certificate must not override the applicable certificate. |
| `TH-1043` | Sparse readings, a pending calibration, and a confident operator note are insufficient to clear the exception. The result abstains and requests missing evidence. |
| `TH-1044` | A normal control with a complete observation window and confirmed zero offset. |

These are scenarios, not hardcoded answer keys. The analysis uses the supplied observations and calibration records. Altering or withholding evidence must change the result. Runtime code does not load the generated dossiers in `examples/` as answers.

Confidence is a transparent heuristic for evidence strength, **not a calibrated probability**. Discrete observations do not establish continuous temperature or exact exposure duration. Read the [data contract](data/README.md) for the assumptions.

## Development commands

Use Node.js 22.11 or later and npm. Commands below are the project package interface; the final clean-clone check remains pending.

On Windows PowerShell, use `npm.cmd` when forwarding options, for example `npm.cmd run agent:sample -- --shipment TH-1042`. The direct equivalent is `node --import tsx server/agent.mjs --mode sample --shipment TH-1042`. PowerShell’s `npm` wrapper may strip forwarded option names; that is a shell invocation issue, not an investigation failure.

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

The World Model feature check is `official World Model warm-loads, preserves identities, and skips unchanged ingest` in [`tests/runtime.test.mjs`](tests/runtime.test.mjs). Run it with the full `npm run test` suite. The local suite passed 16 tests. The official upstream World Model conformance runner also passed 8/8 against the vendored implementation, covering stable IDs, merge bands, provenance rejection, unchanged/mutated ingestion, bitemporal edges, and audit behavior. A fresh-clone repeat remains a separate gate. Mocked transport tests are labeled in their names.

The React/Vite frontend runs the deterministic demonstration on synthetic feeds. The programmatic agent commands are:

```sh
npm run agent:sample
npm run agent:live
```

Select a case with `npm run agent:sample -- --shipment TH-1042`. The runner writes `dossier.json`, `manifest.json`, `trace.jsonl`, `world-events.jsonl`, and `world-audit.jsonl` under a unique `logs/runs/` directory. Live runs also write `zetaris-queries.jsonl`.

Four explicit [structured sample inputs](examples/README.md) map to the exported results:

| Input | Generated dossier | Equivalent CLI |
| --- | --- | --- |
| [TH-1041 input](examples/inputs/TH-1041.json) | [Observed excursion](examples/TH-1041/dossier.json) | `npm run agent:sample -- --shipment TH-1041` |
| [TH-1042 input](examples/inputs/TH-1042.json) | [Sensor bias](examples/TH-1042/dossier.json) | `npm run agent:sample -- --shipment TH-1042` |
| [TH-1043 input](examples/inputs/TH-1043.json) | [Insufficient evidence](examples/TH-1043/dossier.json) | `npm run agent:sample -- --shipment TH-1043` |
| [TH-1044 input](examples/inputs/TH-1044.json) | [Normal control](examples/TH-1044/dossier.json) | `npm run agent:sample -- --shipment TH-1044` |

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

Copy `.env.example` to the ignored `.env.local`, then enter real local values. Never commit either token. The verified live run used **local Llama 3.2 1B Instruct through Nightshift**, selected to limit memory use. No cloud-model key is required for that path. The example uses the actual returned model ID; a download or selected setting alone is not a successful inference receipt.

| Variable | Purpose |
| --- | --- |
| `ZETARIS_BASE_URL` | Zetaris REST base URL, normally `http://localhost:8888/api/v1.0` |
| `ZETARIS_API_KEY` | Zetaris API token |
| `ZETARIS_ORG_ID` | Numeric organization ID; local installs normally use `1` |
| `TRACEHARBOR_PUBLIC_ORIGIN` | Verified HTTPS origin serving the four public synthetic feeds |
| `NIGHTSHIFT_BASE_URL` | Runtime URL, normally `http://127.0.0.1:8088/v1` |
| `NIGHTSHIFT_API_KEY` | Private Nightshift Runtime token |
| `NIGHTSHIFT_MODEL` | Actual local Runtime model ID from authenticated discovery; a routing alias alone does not identify the model that ran |

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

The actual setup and application-contract verification passed on 27 October 2026. Run `node --import tsx scripts/zetaris-verify.mjs` to repeat four governed reads, exact record comparison, World Model context consumption and four outcome/citation checks. See [actual receipts](examples/live-zetaris/) and the [report](docs/zetaris-validation.json). This read-only check makes no Nightshift call.

Read [SQL setup and evidence](sql/README.md) before running mutations. A successful connectivity query alone is insufficient: the live application must consume the USL evidence and the data-quality rule must be shown executing.

## Architecture and evidence

The implemented live workflow uses Nightshift for a planner, critic, and supported synthesis. The planner chooses two or three initial sources from four allowlisted Zetaris reads. The critic can retrieve missing sources; those results are ingested into the World Model and factual analysis is recomputed. Unfetched sources remain explicitly unknown. The World Model ingests evidence and its graph context is read back into the deterministic investigator. The critic selects an evidence-withholding test that actually reruns the analysis. Synthesis selects existing supported findings/actions; numerical claims and citation validation remain in the deterministic core. The actual full run is archived at [examples/live-agent/attempt-02](examples/live-agent/attempt-02/): the model chose two initial sources, then incidents and calibration; real retrieval changed insufficient evidence to sensor bias, and withholding calibration changed it back. Three actual local model calls and four actual USL reads completed in 142.3 seconds. This is bounded model selection with deterministic calculations and citations, not a claim that output constraints prove independent reasoning.

The public static website cannot access the builder's private local services. Live runs belong in the documented backend environment where Zetaris and Nightshift are reachable. The frontend's same-origin integration contract is `POST /api/investigate` with `{ "shipmentId": "TH-1041", "mode": "live" }`, returning `{ "result": ... }`. Backend availability is a separate deployment requirement. See [architecture](docs/architecture.md).

Every live run should retain its request, generated result, JSONL trace, actual Zetaris receipts, engine activity, returned model IDs, and failures or fallbacks. Redact credentials before selecting evidence for publication. Never handwrite a trace or pass a sample trace off as a live run.

## Final verification

After building and deploying the intended checkout, run:

```sh
node scripts/verify-deployment.mjs
```

This makes unauthenticated HTTPS requests and compares the published HTML,
JavaScript/CSS, four data feeds, MP4, PDF, PPTX and subtitles against the current
build bytes. It also checks expected security/media headers and writes the
source commit, hashes and results to ignored `logs/deployment-verification.json`.
A successful local build alone is not proof that those bytes were deployed.

## Submission materials

- [Requirements and current evidence](docs/requirements-matrix.md)
- [Resource review ledger](docs/resource-review-ledger.md)
- [Zetaris reflections and proposed improvement](docs/zetaris-reflections.md)
- [Sponsor technology explanation](docs/sponsor-technology.md)
- [Three-minute demo narration and recording plan](docs/demo-script.md)
- [Eight-slide source content](docs/slide-deck.md)
- [Submission fields and final validation](docs/submission-checklist.md)
- [`metadata.json`](metadata.json)

The repository includes an actual narrated MP4 with subtitles and an editable PowerPoint/PDF deck, alongside their source and scripts. Their verification and published links are tracked in [submission artifacts](submission/README.md). Deadline: **27 October 2026, 23:45 UTC**. Team membership locks when the first submission is created. Official rules and current announcements govern conflicts with older guides.

## Attribution and limitations

This project is developed with OpenAI Codex as an AI coding tool. Cursor use is not claimed. Generated code remains subject to review and testing; test evidence is recorded separately. The synthetic fixtures are original project data. No customer interview, commercial outcome, or measured time saving is asserted.

The Meterless World Model integration uses the official Apache-2.0 engine implementation; its original license and notices must remain with vendored files. See [sponsor attribution](docs/sponsor-technology.md) for the source revision and implementation boundary. Zetaris SQL follows the official getting-started documentation. Sponsor guides are linked rather than republished.

Project-authored code and fixture data retain the existing [MIT license](LICENSE), copyright 2026 Seyed Mohammad Salehi. Third-party components retain their own licenses.

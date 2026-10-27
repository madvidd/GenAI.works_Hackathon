# Requirements and evidence matrix

Snapshot: **27 October 2026**. `Present` means the artifact or implementation exists. `Pending` means the corresponding test, run, or final artifact has not been verified in this snapshot. Neither a planned adapter nor an installed service proves a successful integration. Update statuses only from actual evidence, with the relevant file or receipt.

Authority: current Official Rules and Announcements on [HackOS](https://hackathon.genai.works/dashboard), then current challenge/submission instructions. The Participant Setup Guide contains mixed revisions; recent AI Usage Policy, Vibe Coding Starter Guide, and Pre-Submission Self-Check clarify Nightshift and optional Cursor. The resource ledger records conflicts.

## Eligibility and submission gates

| Requirement | TraceHarbor response / evidence | Current status |
| --- | --- | --- |
| Submit by 27 Oct 2026, 23:45 UTC | Keep timestamped final repo hash and artifact links | Pending submission |
| One account, one team, one submission; 1–5 members | Verify actual HackOS roster; no invented contributors | Pending roster confirmation |
| Exactly one primary track | The Agent That Can Explain Why | Selected in project metadata; platform selection pending |
| Team locks on first submission creation | Confirm members and primary contact before creating it | Pending |
| Public GitHub repository with runnable code and README | `madvidd/GenAI.works_Hackathon` | Source present; final push/public-access check pending |
| Demo video, 1–4 minutes, with audio | Narrated MP4, subtitles and reproducible sources | Recorded; final evidence refresh and public playback verification pending |
| Slide deck | Eight-slide editable PowerPoint and PDF under `submission/` | Exported, structural/layout/import checks passed, all eight slides/pages visually inspected; sponsor status stays explicit |
| Sponsor explanation | `docs/sponsor-technology.md` | Actual SQL, engine and full local-model receipts archived |
| Declare pre-existing components | Metadata identifies upstream World Model and existing scaffold | Final declaration and revision audit pending |
| Accurate participant names, HackOS emails, GitHub handles, roles, primary contact | Enter verified information in live form | Pending; private details omitted from public templates |
| Links accessible through judging | Test logged out, retain copies | Pending final artifacts |

## Required technical behavior

| Requirement | Implementation / intended evidence | Current status |
| --- | --- | --- |
| Real input-dependent work, no stored final-answer lookup | `core/investigator.mjs` derives result from source records | Present; local 16-test suite passed; clean-clone check pending |
| Programmatic structured input/output, no UI-only dependency | Agent CLI and `/api/investigate` contract | Integration/clean-run verification pending |
| At least two distinct agents with actual collaboration | Planner chooses 2–3 initial sources; critic retrieves missing sources and chooses an evidence-withholding rerun; synthesis selects supported IDs | Mock transport tests plus actual planner/critic/synthesis receipts; critic retrieval changed the computed outcome |
| A feedback, critique, retry, or branch event | Record actual rejected claim and resulting action | Pending actual agent trace |
| Zetaris is the data layer | REST registration and shipment evidence USL | 34 real setup statements; four actual USL reads consumed through World Model and investigator; complete actual live model run archived |
| A Meterless Engine powers a feature | Official World Model ingest, graph-context consumption, source-priority facts; `tests/runtime.test.mjs` warm-load/identity/unchanged-ingest test | Local feature test passed; separate upstream conformance runner passed 8/8 |
| Nightshift is the primary live AI provider | Nightshift client using Runtime URL/token | Actual full run: three local Llama 3.2 1B phase completions, returned model IDs and timing retained |
| NVIDIA where it contributes; award based on Nemotron through Nightshift | Record actual response model IDs and their contribution | Not currently used; selected local model does not establish NVIDIA or Nemotron use |
| Cursor optional; actual coding tool disclosed | OpenAI Codex; Cursor not claimed | Documented |
| Sample mode works without credentials or local sponsor services | Deterministic fixture processing, explicit mode | Core present; whole-run clean-environment check pending |
| At least three sample inputs and matching generated outputs | Four JSON inputs in `examples/inputs/`, mapped in `examples/README.md` | Matching actual current sample runs published in `examples/TH-1041` through `TH-1044` |
| Run-generated logs to stdout and `logs/` | Request ID, agent, action, handoff, status, retries, model, queries/results, engine activity | Actual stdout and archived trace/query/engine records verified |
| No hidden manual data/database setup | Scripted registration and reproducible fixture publication | Scripts present; clean-clone validation pending |
| Timeouts, bounded retries/rounds, structured failures | Explicit service and run budgets | 16-test suite; actual 142.3-second live run within the 300-second cap |
| No runtime dependency installs or large downloads | npm install/build stage; small fixtures | Final package/Docker inspection pending |
| No GPU required to judge | Credential-free sample mode; local-model live setup is separate | Sample mode has no GPU dependency; whole-run clean-clone check pending |
| No secrets in code, history, screenshots, logs, or artifacts | Ignored `.env.local`, blank example tokens, provider key only in Nightshift | Final secret/history/media scan pending |
| Honest synthetic, fallback, limitation, and third-party disclosure | README, data contract, metadata, sponsor explanation | Present; final claim/code audit pending |

## The 100-point rubric

Weights were read from the current event criteria. This table maps the design to evidence; it does not predict points or guarantee an outcome. Ties are resolved by Impact, then submission timestamp.

| Criterion | Points | TraceHarbor's case | Evidence still needed |
| --- | ---: | --- | --- |
| Impact | 30 | A bounded operations task: resolve disputed exceptions and expose missing evidence | Real user feedback or explicitly unvalidated hypothesis; no fabricated savings |
| Technical | 20 | Data validation, provenance, calibration rules, feedback, abstention, reproducibility | Tests, real live traces, clean-clone run, full sponsor evidence |
| Innovation | 15 | Compare raw alarm, calibrated explanation, and evidence-withheld result; critic can refuse confidence | Working scenario feature and meaningful effect on output |
| Demo | 15 | One coherent real investigation, visible critique, source evidence, and abstention | Recorded 1–4 minute video with audio and public access |
| UX | 10 | Readable evidence dossier, visible mode, uncertainty, source inspection, useful next actions | Built-site interaction, keyboard/mobile checks, exports |
| Sponsor Tech | 10 | Zetaris data/USL/DQ, World Model feature, Nightshift reasoning, bounded local-model selection; no NVIDIA contribution claimed | Actual integrations and receipts, beyond logos or connectivity only |
| **Total** | **100** | | |

## Latest Zetaris scoring methodology

The one-page scoring PDF supplied in the Resource Center was read in full. These items supplement the event rubric; no invented point allocation is assigned to them here.

| Item | Project artifact | Proof required / status |
| --- | --- | --- |
| At least 3 independent sources | Four separately registered source feeds in `sql/01-register.sql` | Four actual registrations passed. Synthetic system representations share one host; not independent production providers. |
| 2–3 exploratory queries per source | Three per source in `sql/02-explore.sql` | All 12 executed; flattened source counts 4 / 26 / 10 / 6 |
| One USL with DDL | `sql/03-usl.sql`, four related tables | Actual compile and all four activations passed |
| 2–3 active USL queries | Three in `sql/06-investigate.sql` | All three executed: 25 / 69 / 4 rows |
| A data-quality rule shown executing | `sql/05-quality.sql`, telemetry integrity | Actual result: 26 total / 25 valid / 1 invalid; invalid row inspected |
| Reflection: time saved vs manual; partial comparator is a bonus | `docs/zetaris-reflections.md`, section 1 | Estimate labeled; measured comparator not yet run |
| Reflection: USL usefulness/limits, next project and estimated saving | Reflections section 2 | Written; estimates labeled |
| Reflection: proposed PM feature; feature mock/resulting USL is a bonus | Reflections section 3 | Concept mock and proposed projection; unimplemented |

The actual invalid-record response identifies `TEL-1041-X` / `RD-1041-X`, with a 999 C value. Query IDs, responses, timings and the separate real-USL-to-World-Model check are retained in [the evidence archive](../examples/live-zetaris/) and [validation report](zetaris-validation.json).

## Final evidence bundle

Retain the final commit, install/build/test output, at least three generated request/results, run-generated traces, actual source and USL receipts, DQ execution evidence, World Model test output, returned model IDs, and verified video/deck/site links. Preserve failures in measured denominators. Mark sample artifacts as sample. Do not commit private configuration or unredacted logs.

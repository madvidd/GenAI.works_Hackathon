# Requirements and evidence matrix

[Documentation](README.md) · [Evidence guide](evidence-guide.md) · [Submission checklist](submission-checklist.md)

Snapshot: **27 October 2026**. `Present` means the artifact or implementation exists. `Pending` means the corresponding test, run, or final artifact has not been verified in this snapshot. Neither a planned adapter nor an installed service proves a successful integration. Update statuses only from actual evidence, with the relevant file or receipt.

The current release is source/artifact commit `1c71b1cfdd051119f347443ef4d9209b652478ca`. Its [isolated clone](clean-clone-redesign-validation.json) passed 33 tests, the production build and four actual sample CLI cases; [all 14 public files](deployment-redesign-validation.json) matched the intended build. Earlier `ca1f6b7` receipts remain historical evidence. [Release verification](release-validation.md) explains the later receipt-only commits.

The current 1.0.2 revision separately passes 33 local tests. The redesigned interface has [actual browser checks](ui-validation.json), and the same 1.0.2 core has [two completed actual live cases](live-revision-validation.json). Each current live case made three model calls and four governed reads. Publication and final clean-clone checks have their own verified receipts; the [official entry is confirmed submitted](submission-confirmation.md), observed after reload at 22:13 UTC on 27 October 2026.

Authority: current Official Rules and Announcements on [HackOS](https://hackathon.genai.works/dashboard), then current challenge/submission instructions. The Participant Setup Guide contains mixed revisions; recent AI Usage Policy, Vibe Coding Starter Guide, and Pre-Submission Self-Check clarify Nightshift and optional Cursor. The resource ledger records conflicts.

## Eligibility and submission gates

| Requirement | TraceHarbor response / evidence | Current status |
| --- | --- | --- |
| Submit by 27 Oct 2026, 23:45 UTC | [Persisted portal confirmation](submission-confirmation.md) and submitted links | Submitted status observed at 22:13 UTC before the deadline; server submission timestamp not displayed |
| One account, one team, one submission; 1–5 members | Verify actual HackOS roster; no invented contributors | Two Vengers members observed; contributions and primary contact confirmed; portal showed Submitted 1 / 1 |
| Exactly one primary track | The Agent That Can Explain Why | Selected and submitted on the portal; entry #1 shows this track |
| Team locks on first submission creation | Roster, contributions and primary contact confirmed | Submission created; persisted team description, roles and both use-case tags verified |
| Public GitHub repository with runnable code and README | `madvidd/GenAI.works_Hackathon` | Pushed publicly; anonymous GitHub API verified the source commit |
| Demo video, 1–4 minutes, with audio | Narrated MP4, subtitles and reproducible sources | 188.48-second refreshed MP4; final live evidence, captions, decode/visual checks and public hash/playback smoke checks passed |
| Slide deck | Eight-slide editable PowerPoint and PDF under `submission/` | Exported, structural/layout/import checks passed, all eight slides/pages visually inspected; sponsor status stays explicit |
| Sponsor explanation | `docs/sponsor-technology.md` | Actual SQL, engine and full local-model receipts archived |
| Declare pre-existing components | Metadata identifies upstream World Model and existing scaffold | Upstream revision/license and original LICENSE/README scaffold disclosed |
| Accurate participant names, HackOS emails, GitHub handles, roles, primary contact | Confirmed contributors and primary contact recorded; private contact information omitted | No separate contact/email fields existed in the live form; Ali Rajaee’s GitHub handle was not provided |
| Links accessible through judging | Test logged out, retain copies | Public files returned HTTP 200 with matching hashes; retain hosting and repository through judging |

## Required technical behavior

| Requirement | Implementation / intended evidence | Current status |
| --- | --- | --- |
| Real input-dependent work, no stored final-answer lookup | `core/investigator.mjs` derives result from source records | Final isolated clone passed 33 tests and all four actual sample CLI cases |
| Programmatic structured input/output, no UI-only dependency | Agent CLI and `/api/investigate` contract | Actual live CLI and browser API verified; all four sample CLI cases passed from the final isolated clone |
| At least two distinct agents with actual collaboration | Planner chooses 2–3 initial sources; critic retrieves missing sources and chooses an evidence-withholding rerun; synthesis selects supported IDs | Mock transport tests plus actual planner/critic/synthesis receipts; critic retrieval changed the computed outcome |
| A feedback, critique, retry, or branch event | Record actual rejected claim and resulting action | Actual critic retrieval changed insufficient evidence to sensor bias; calibration withholding restored insufficient evidence |
| Zetaris is the data layer | REST registration and shipment evidence USL | 34 real setup statements; four actual USL reads consumed through World Model and investigator; complete actual live model run archived |
| A Meterless Engine powers a feature | Official World Model ingest, graph-context consumption, source-priority facts; `tests/runtime.test.mjs` warm-load/identity/unchanged-ingest test | Local feature test passed; separate upstream conformance runner passed 8/8 |
| Nightshift is the primary live AI provider | Nightshift client using Runtime URL/token | Actual full run: three local Llama 3.2 1B phase completions, returned model IDs and timing retained |
| NVIDIA where it contributes; award based on Nemotron through Nightshift | Record actual response model IDs and their contribution | Not currently used; selected local model does not establish NVIDIA or Nemotron use |
| Cursor optional; actual coding tool disclosed | OpenAI Codex; Cursor not claimed | Documented |
| Sample mode works without credentials or local sponsor services | Deterministic fixture processing, explicit mode | All four final clean-clone CLI cases passed with no private env file or sponsor env variables and zero model/SQL calls |
| At least three sample inputs and matching generated outputs | Four JSON inputs in `examples/inputs/`, mapped in `examples/README.md` | Matching actual current sample runs generated in `examples/TH-1041` through `TH-1044` |
| Run-generated logs to stdout and `logs/` | Request ID, agent, action, handoff, status, retries, model, queries/results, engine activity | Actual stdout and archived trace/query/engine records verified |
| No hidden manual data/database setup | Scripted registration and reproducible fixture publication | Actual 34-statement setup archived; separate clean-clone install/build/sample validation passed |
| Timeouts, bounded retries/rounds, structured failures | Explicit service and run budgets | Current 33-test suite; final 1.0.2 live UI durations 153.028 and 153.347 seconds within the 300-second cap; earlier timeout retained |
| No runtime dependency installs or large downloads | npm install/build stage; small fixtures | Dependencies installed before execution; sample/live runners contain no dependency installation or model-download step |
| No GPU required to judge | Credential-free sample mode; local-model live setup is separate | Sample mode has no GPU dependency; 33 tests and all four final clean-clone CLI cases passed without model calls |
| No secrets in code, history, screenshots, logs, or artifacts | Ignored `.env.local`, blank example tokens, provider key only in Nightshift | Candidate files and prior Git history scanned; actual local-key matches and credential-pattern matches were zero; media reviewed |
| Honest synthetic, fallback, limitation, and third-party disclosure | README, data contract, metadata, sponsor explanation | Verified claims reconciled with actual runs, clean-clone checks, browser evidence and public downloads |

## The 100-point rubric

Weights were read from the current event criteria. This table maps the design to evidence; it does not predict points or guarantee an outcome. Ties are resolved by Impact, then submission timestamp.

| Criterion | Points | TraceHarbor's case | Evidence and remaining validation |
| --- | ---: | --- | --- |
| Impact | 30 | A bounded operations task: resolve disputed exceptions and expose missing evidence | Real user feedback or explicitly unvalidated hypothesis; no fabricated savings |
| Technical | 20 | Data validation, provenance, calibration rules, feedback, abstention, reproducibility | Final 33-test clone/build, four sample cases, actual live traces and 14-file public hash verification are archived |
| Innovation | 15 | Compare raw alarm, calibrated explanation, and evidence-withheld result; critic can refuse confidence | Actual retrieval and withholding changed TH-1042 outcomes; broader evaluation remains |
| Demo | 15 | One coherent real investigation, visible critique, source evidence, and abstention | Reviewed 3:08 refreshed demonstration uses the redesigned interface and final live receipts; published bytes and browser playback smoke checks passed |
| UX | 10 | Readable evidence dossier, visible mode, uncertainty, source inspection, useful next actions | Versioned browser checks, targeted final regressions, exported dossiers and public/mobile smoke checks are recorded |
| Sponsor Tech | 10 | Zetaris data/USL/DQ, World Model feature, Nightshift reasoning, bounded local-model selection; no NVIDIA contribution claimed | Actual integration receipts are archived; new integration changes require fresh evidence |
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

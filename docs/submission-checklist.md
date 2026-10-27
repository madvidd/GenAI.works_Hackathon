# Submission record and final validation

[Documentation](README.md) · [Requirements](requirements-matrix.md) · [Presentation assets](../submission/README.md)

Deadline: **27 October 2026, 23:45 UTC**. The live submission form and current Official Rules govern if they differ from the form preview. The portal expects one submission per team and permits up to three on distinct tracks; TraceHarbor has one entry on one primary track. The team roster locks when the first submission is created.

**Submitted:** the portal’s entry #1 and **Submitted 1 / 1** status persisted after reload, observed on **27 October 2026 at 22:13 UTC**. This minute-precision observation is not the server submission timestamp, which the UI did not display. See the [confirmation](submission-confirmation.md) and [actual submitted form record](../submission/hackos-entry.json).

## Project summary (reference copy)

**Project name:** TraceHarbor

**Primary track:** The Agent That Can Explain Why

**One sentence:** TraceHarbor investigates disputed shipment temperature alerts across source records, tests the evidence behind each explanation, and abstains when the record is insufficient.

**Description:** TraceHarbor supports an operations analyst reviewing a disputed cold-chain exception. It connects shipment manifests, sensor telemetry, carrier events, and calibration evidence; preserves conflicting claims; and produces a cited investigation dossier with uncertainty and proposed next actions. In the implemented live path, a bounded critic can retrieve missing sources and select an evidence-withholding test, causing the system to recompute its conclusion. The demonstration uses synthetic data and distinguishes deterministic sample computation from verified live sponsor execution. It does not authorize cargo release or certify product safety.

Use the sponsor explanation only after reconciling it with the final live evidence. Do not turn planned integrations into completed claims when pasting into the form.

## Preview fields and actual live-form resolution

| Field from the preview | Recorded resolution |
| --- | --- |
| Project name, one-line summary, paragraph description | TraceHarbor is named in the persisted description; the actual form had no separate project-title field |
| Exactly one track | The Agent That Can Explain Why, selected and submitted |
| Each contributor’s full name | Confirmed roster: Seyed Mohammad Salehi and Ali Rajaee |
| Each contributor’s HackOS email | No separate email field appeared in the live form; private addresses are not published |
| GitHub username and role | Seyed Mohammad Salehi (`madvidd`): project lead and all work except Ali Rajaee’s testing; Ali Rajaee: testing, GitHub handle not provided |
| Primary contact | Seyed Mohammad Salehi, confirmed primary contact; no separate contact field appeared in the live form |
| Public repository URL | `https://github.com/madvidd/GenAI.works_Hackathon`, verified logged out |
| Colab links if applicable | Omit if no Colab runtime is used |
| Demo video | [HackOS-hosted submission video](https://iframe.mediadelivery.net/embed/778121/21475ca2-f757-48b6-8ebd-e7f5e2275fb8), uploaded from the 188.48-second original with audio; processed player duration 188.396 seconds and playback verified |
| Slide deck | [Submitted eight-slide PDF](https://traceharbor.web.app/submission/traceharbor.pdf) |
| Sponsor technology explanation | Actual roles, tests, requests, and distinctive use |
| Pre-existing components | Upstream World Model, dependencies/templates, and any pre-window project work |

Do not assert team consent, shared review, registration eligibility, prize arrangements, or an individual's contribution without confirmation. The default cash split is equal unless the team provides a different written arrangement. Prize claims and private financial details belong to the organizer's later process, not this public repository.

## Evidence already recorded

Four current input/output examples, 33 passing local tests, the official World Model feature test and 8/8 upstream conformance checks, actual Zetaris setup/USL/DQ receipts, and final local Nightshift investigations are archived. [The final TH-1042 run](../examples/live-agent/attempt-06-final-decimal/manifest.json) used three model calls, four SQL reads and 46 World Model records. Its critic retrieved incidents and calibration, changing insufficient evidence to sensor bias; withholding calibration restored insufficient evidence. [The final TH-1043 run](../examples/live-agent/attempt-07-final-abstention/manifest.json) retained its abstention. Earlier failures remain visible; seven full attempts include six completed runs, which is not a reliability estimate.

The refreshed MP4 is 188.48 seconds with audio and captions. The eight-slide PDF/PPTX use the redesigned interface and final 1.0.2 live evidence; visible regression wording is generic and the exact 33-test count is in the receipts. All nine video layouts/end frames, eight slide renders and eight PDF pages were visually checked, and full video/audio decoding passed. Uninterrupted human audiovisual playback remains unverified. The [final isolated clone](clean-clone-redesign-validation.json) passed 33 tests, the build and all four sample cases at source/artifact commit `1c71b1c`. The [public deployment](deployment-redesign-validation.json) matched all 14 intended files, and public UI/video smoke checks passed. [Release verification](release-validation.md) records the exact scope.

## Final technical check

Checked technical and artifact items record the verified source/artifact commit `1c71b1cfdd051119f347443ef4d9209b652478ca` and the linked current receipts. Historical service/conformance results retain their recorded scope. Recheck affected gates after any later application, dependency, fixture or artifact change. The actual platform confirmation is recorded separately below.

- [x] Fresh clone and documented dependency installation succeed.
- [x] `npm test` and `npm run build` pass with retained output; these are the two stages composed by `npm run check`.
- [x] Sample CLI runs with no credentials and zero sponsor-service calls.
- [x] At least three input examples and matching outputs are generated by the final runner.
- [x] Different and altered inputs produce appropriate different results.
- [x] Actual World Model feature/conformance tests pass.
- [x] Live Zetaris exploration, USL queries, and DQ execution have real receipts.
- [x] All three Nightshift phases complete correctly in one actual combined live run; returned model IDs and final dossier are logged.
- [x] A real critique/branch changes or validates the result and is visible in logs.
- [x] Logs are generated at runtime, printed appropriately, and written to `logs/`.
- [x] No silent sample substitution hides a live failure.
- [x] The API is usable programmatically; the UI is not required to drive the runner.
- [x] Dependencies, model installation and data setup are documented; the agent run performs no package/model installation or hidden manual setup.
- [x] Current files, Git history, examples, logs, screenshots, video, and deck are checked for secrets.
- [x] README commands, metadata status, diagram, and narration match actual code/evidence.

## Final artifact check

- [x] Repo is public at the final intended commit.
- [x] Firebase `.web.app` URL serves the intended build and synthetic feeds.
- [x] Mobile, keyboard, evidence inspection, mode labels, and exports are checked.
- [x] Live API availability is accurately communicated on the hosted site.
- [x] Final video passes complete audio/video decoding, narration-signal checks, all-scene visual review, captions and public browser playback smoke checks.
- [x] Video and deck open without requesting access; backup copies exist.
- [x] Sponsor and pre-existing-work disclosures are accurate.
- [x] Remaining resource-review gaps are disclosed rather than described as complete.
- [x] The roster, contribution roles and primary contact are confirmed; saved team details persisted after reload.
- [x] Final commit and public MP4/PDF/PPTX/SRT URLs are verified and preserved.
- [x] The persisted platform submission status and minute-precision observation time are preserved; no server submission timestamp was displayed.

Uninterrupted human audiovisual playback and native Microsoft PowerPoint rendering remain unverified. Technical video checks and the reviewed PDF are complete. The resource ledger separately identifies six recordings whose spoken content was unavailable for review.

The [verified platform confirmation](submission-confirmation.md) establishes the submitted state. The portal’s **eight unfinished board tasks and zero requirements** warning was acknowledged through **Submit anyway**; those tasks were not marked complete. Saved form text, a working website or a pushed repository alone would not establish submission.

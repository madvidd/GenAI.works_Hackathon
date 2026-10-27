# Backend and requirements audit

**Snapshot: 27 October 2026, 20:45 UTC. Analysis version: 1.0.1.**

Later verification and the **1.0.2 decimal-boundary correction** are recorded in the dated addenda below. Historical snapshots and live receipts retain their original version scope.

This review checked the backend, evidence calculations, tests, and existing execution receipts against the [requirements matrix](requirements-matrix.md) and [resource ledger](resource-review-ledger.md). The current Official Rules were re-read in the signed-in [HackOS dashboard](https://hackathon.genai.works/dashboard) during this review: Zetaris, a working Meterless Engine, and Nightshift remain mandatory; the deadline remains **23:45 UTC on 27 October**. Current rules and announcements take precedence over older conflicting workshop material. The rules preview carries a draft banner, so organizer clarifications remain authoritative.

The evidence supports real sponsor integration and input-dependent computation. It does not establish guaranteed eligibility, a particular score, or a win. Platform submission and publication of the revised checkout were still pending at this snapshot.

## Defects reproduced and fixed

| Finding | Before | Current behavior and regression evidence |
| --- | --- | --- |
| Repeated observation identity | The first row with a repeated `reading_id` could be accepted while a contradictory later row was discarded, making the answer depend on row order. | All versions are quarantined. An identity collision inside the investigation window prevents a clear status, including when the collision affects a reference probe. Tests cover reversed row order and reference ambiguity. |
| Equivalent timestamp spellings | `Z` and `.000Z` spellings of the same instant could evade duplicate detection or bypass reference comparisons. | Primary duplicate detection and reference matching compare parsed instants. Tests cover duplicate ambiguity, retained corroboration, and retained reference disagreement. |
| Rounding before decisions | A corrected temperature of 8.0004 C could become 8 C before comparison with an 8 C maximum and hide an excursion. | Threshold and reference comparisons retain full precision. Upper- and lower-bound regression cases are detected; presentation summaries may still be rounded. |
| A non-advancing schedule | An extremely small positive cadence at an epoch timestamp could fail to advance the loop. | Cadences below timestamp resolution, one millisecond, are rejected; schedule construction uses a bounded index count. A zero-duration window with a tiny cadence now rejects immediately. |
| No valid observations | A live critic could receive an invalid empty-choice schema when no valid primary observations or applicable calibration matches were present. | It receives an explicit evidence-availability review, retrieves any chosen missing source, and abstains. The trace discloses that no withholding experiment occurred. |
| Model output outside its schema | Runtime checks allowed repeated selections and more findings/actions/citations than the declared model schema. | Runtime validation independently enforces unique selections, at most two findings, two actions, and three citations. Mock responses that ignore those limits fail explicitly. |

The fixed calculations are in [the investigator](../core/investigator.mjs). Orchestration and output validation are in [the agent](../server/agent.mjs) and [schemas](../server/output-schemas.mjs). The [local HTTP server](../server/http.mjs) preserves the distinction between an evidence-availability review and a sensitivity test.

## Verification of the revised code

The full current suite passed **28/28 tests** using `npm.cmd test` on Windows. This includes nine additional backend/core regression tests and three workspace tests beyond the previous 16-test suite. The first full attempt was blocked by the execution sandbox's loopback restriction; the repeat with local networking enabled passed. HTTP tests use temporary local mock servers; provider transport tests use mock responses. No real SQL or model request was made by this audit.

All four structured sample inputs were actually executed again at **20:44:46–20:44:47 UTC**, after the initial fixes. Those executions used analysis version 1.0.1. The linked sample folders below contain the latest regenerated outputs, now version 1.0.2 as recorded in the later addendum. Each run resolves its citations, consumes real World Model graph context, and reports zero model calls and zero SQL queries:

| Input | Generated result | Outcome |
| --- | --- | --- |
| [TH-1041](../examples/inputs/TH-1041.json) | [Dossier](../examples/TH-1041/dossier.json) | `excursion` |
| [TH-1042](../examples/inputs/TH-1042.json) | [Dossier](../examples/TH-1042/dossier.json) | `sensor_bias` |
| [TH-1043](../examples/inputs/TH-1043.json) | [Dossier](../examples/TH-1043/dossier.json) | `insufficient_evidence` |
| [TH-1044](../examples/inputs/TH-1044.json) | [Dossier](../examples/TH-1044/dossier.json) | `within_range` |

These are actual offline sample executions, not evidence of new live sponsor execution. The previous live archives remain unchanged. Only the new sample traces' `completed.runFolder` field was normalized to a repository-relative path; each archive records that normalization and the resulting trace hash.

## Mandatory technology and collaboration evidence

| Requirement | Evidence reviewed | Scope and limit |
| --- | --- | --- |
| Zetaris as the data layer | [Actual setup validation](zetaris-validation.json): 34 statements, four registrations, 12 exploration queries, four compiled/activated USL tables, three investigation queries, and an executed DQ rule with 26 total / 25 valid / 1 invalid rows. [Installation validation](../submission/zetaris-install-validation.json) records nine official checks and two successful direct API queries. | This is real local Zetaris execution over disclosed synthetic feeds. Connectivity alone is not used as proof of the full application. |
| Meaningful Meterless Engine feature | [Runtime tests](../tests/runtime.test.mjs) exercise official World Model ingestion, canonical graph readback, persistent warm loading, separate shipment identity, and unchanged-ingest skipping. Actual query results were consumed through the engine in the [USL integration archive](../examples/live-zetaris/). | Engine code is executed and its graph values feed the calculations. The engine is not represented by a logo or unused dependency. |
| Nightshift as primary AI provider | [Actual CLI live validation](live-agent-validation.json) and [browser live validation](../examples/live-agent/attempt-03-browser/validation.json) each record three model phases, four SQL reads, 46 source records consumed, and the returned local Llama model ID. | These are historical successful executions before this audit's 1.0.1 fixes. The model ran locally through Nightshift; no NVIDIA or Nemotron contribution is claimed. |
| At least two collaborating agents and a real feedback event | Planner chooses the initial read plan; critic receives the provisional evidence and chooses additional reads plus a recheck; synthesis selects supported findings/actions. The actual critic retrieved incidents and calibration, changing `insufficient_evidence` to `sensor_bias`; withholding calibration restored `insufficient_evidence`. | These are distinct decision contexts, responsibilities, outputs, and handoffs using the same underlying model. No reviewed current rule requires different models. This is a bounded sequential multi-agent workflow, not a claim of three separate model providers or unrestricted autonomous workers. |
| Structured programmatic path and reproducibility | [Agent API/CLI](../server/agent.mjs), four structured sample inputs, generated JSON dossiers, stdout/JSONL traces, and the [historical clean-clone receipt](clean-clone-validation.json). | The latest verified clean clone at this snapshot is commit `ca1f6b7723b86319d31f0a824c67d8ba1ea36daa`, with 16 tests and three sample CLI runs. It does not certify the newly edited checkout. |
| Bounded and honest failure behavior | Three model calls maximum, four source reads maximum, 120-second SQL request cap, 180-second model request cap, 300-second overall signal, response byte limits, and one active local HTTP investigation. | Failed live execution stays failed; it never silently substitutes a successful sample answer. The first timed-out live attempt remains in the archive. |

Using one model for multiple agent roles does not by itself demonstrate collaboration. The substantive evidence here is the critic's actual decision to obtain missing source data, the executed tool results, and the recomputation that changed the outcome. The same model identity is disclosed throughout; the deterministic calculation and citation checks retain final authority over the result.

The public Firebase website is the **sample workspace**. The local companion executes the **live** Nightshift/Zetaris workflow. A static browser calculation, an engine-only test, or a model-discovery request must not be described as a complete live investigation.

## Remaining requirements and judging risks

| Priority | Gap at this snapshot | Required treatment |
| --- | --- | --- |
| Before deadline | HackOS submission was still not started; roster/contact/contributor details and primary track still needed confirmation in the form. | Complete the authorized submission workflow and verify the submitted state before 23:45 UTC. A deployed website and public repository do not constitute submission. Do not invent contributor details. |
| Before final publication | The 1.0.1 source changes postdate the existing final commit, build, live run, and clean-clone receipts. | Publish the revised checkout, verify the built website, and run the final clean-clone checks at the exact pushed SHA. Preserve old receipts as historical. A new full live check is being coordinated separately. |
| Largest scoring gap: Impact, 30 points | No independent operations-user study, customer adoption, measured time saving, or commercial outcome is established. | Keep the user problem and expected benefit explicit but prospective. Real feedback would strengthen this category; invented testimonials, savings, and scores would weaken the evidence. |
| Zetaris source independence | Four independently modeled/registered feeds share one demonstration origin and are synthetic representations of operational systems. | Disclose this clearly. Four endpoints do not prove four independent production providers; the sponsor may interpret its independence criterion more strictly. Moving the same fixtures to more hosts would not solve that evidence gap. |
| Generalization and reliability | The completed full live runs cover one shipment scenario; at the historical checkpoint, two of three full attempts succeeded. The first SQL request exceeded the original 60-second cap. | Preserve the failed attempt and actual timings. Do not claim universal correctness, 100% reliability, or performance across real customer data. The 120-second request budget remains inside the 300-second run bound. |
| Sponsor award scope | The selected local Llama model does not establish a Nemotron or NVIDIA contribution. | Do not claim that award's technology criterion. Current mandatory Zetaris/Engine/Nightshift evidence is assessed separately. |
| Research coverage | Six recordings lacked accessible captions in the inspected players. | Retain the resource ledger's limit. Do not say every video was watched. Written requirements and reviewed transcripts remain the documented basis. |

The remaining rubric weights are Technical 20, Innovation 15, Demo 15, UX 10, and Sponsor Tech 10. Current evidence supports those categories through executed integrations, critique and abstention, a narrated demonstration, and a usable evidence workspace. Final presentation and user-experience verification belong to their separate review streams. No numerical judging score is inferred from implementation coverage.

The final clean-clone method should assert the expected GitHub origin and exact revision, require a clean working tree before and after, perform a fresh `npm ci` at that revision, run the full current tests/build, and execute at least three sample CLI requests with no private environment file or sponsor environment variables. The prior offline install used a populated package cache; it was a fresh dependency installation, not reuse of a previous `node_modules` tree. The final receipt must state its actual install method and revision.

## Current-code live follow-up — 21:05 UTC

Two additional investigations were actually run through the redesigned local browser UI using analysis version **1.0.1**. This resolves the earlier snapshot's current-code live verification gap. It does not replace the pending publication and exact-pushed-revision clean-clone checks, or the HackOS submission itself.

| New attempt | Case and actual result | UI elapsed | Trace elapsed | Verified archive |
| --- | --- | ---: | ---: | --- |
| 04, redesign | TH-1042: `sensor_bias` | 170.490 s | 169.191 s | [Validation](../examples/live-agent/attempt-04-redesign/validation.json), [dossier](../examples/live-agent/attempt-04-redesign/dossier.json), [browser export](../examples/live-agent/attempt-04-redesign/browser-export.json) |
| 05, abstention | TH-1043: `insufficient_evidence` | 160.702 s | 159.374 s | [Validation](../examples/live-agent/attempt-05-abstention/validation.json), [dossier](../examples/live-agent/attempt-05-abstention/dossier.json), [browser export](../examples/live-agent/attempt-05-abstention/browser-export.json) |

UI timings are the browser operator's observed elapsed values. Trace timings begin after provider preflight completes and therefore measure a different interval. The two measurements are preserved separately, not presented as interchangeable whole-run timings.

Each new run completed three actual local-model calls through Nightshift, four actual Zetaris source reads, and World Model context consumption of 46 records. In each case, the planner selected manifest and telemetry, then the critic retrieved incidents and calibration. All deterministic citations and model selections resolved, each canonical engine verdict matched the dossier, and each downloaded browser export matched the server dossier apart from the documented UI trace/export fields. Privacy scans found no exact private provider-key matches, authorization values, private filesystem paths, or email addresses in the published evidence. Original request/response and outcome records were retained; only `completed.runFolder` was normalized for publication.

The new cases demonstrate different responses to evidence:

- **TH-1042:** retrieval changed the provisional abstention to sensor bias. Seven raw alarms became in-range after confirmed corrections, with complete scheduled coverage and two corroborating reference points. Withholding calibration restored abstention.
- **TH-1043:** retrieval left the answer as insufficient evidence. Only two of seven scheduled observations were present, with 28.6% coverage, a 50-minute largest gap, and no applicable confirmed correction. Withholding calibration also left the answer insufficient. This unchanged result is preserved; the trace does not pretend every critique must change the outcome.

At this follow-up checkpoint, the archive contains **five full live attempts, four completed**: the historical attempt 01 timed out, historical attempts 02–03 completed, and current-code attempts 04–05 completed. The current-code follow-up therefore covers two shipment scenarios. This small synthetic evaluation is not a production reliability estimate or a guarantee that all future inputs will succeed. Earlier preflight probes are separate from this full-run denominator.

The recorded browser assets were `index-KqLeXhm5.js` and `index-CG4W20OW.css`. These are observed build filenames; no unpublished Git commit identity is inferred from them. Earlier live receipts and the historical 16-test clean-clone receipt remain unchanged and retain their original scope. The current test suite remains **28/28 passed**; final publication and clean-clone verification are handled in the release workflow.

## Decimal-boundary correction — 21:14 UTC

A follow-up regression check found binary floating-point subtraction could create a false excursion at an exact decimal limit: a 2.3 C measurement minus a 0.3 C offset produced `1.9999999999999998`, below a 2 C minimum. Removing display rounding alone did not solve this numerical boundary case.

Analysis version **1.0.2** now converts each finite input number's canonical decimal string into a signed integer coefficient and decimal exponent. It aligns and subtracts those coefficients using `BigInt`, then converts the result back to a JavaScript Number once. The same calculation is used for primary calibration, reference calibration, and reference-distance comparisons. It introduces neither fixed three-decimal rounding nor an arbitrary comparison epsilon.

The full suite now passes **31/31 tests**. The added regressions verify:

- Exact lower and upper limits: `2.3 - 0.3 = 2` and `7.7 - (-0.3) = 8` do not become excursions.
- Meaningful nearby crossings remain visible: corrected values 8.0004 and 1.9996 are excursions.
- Scientific notation remains supported: `1.23e-7 - 2.3e-8 = 1e-7` preserves the declared limit.
- An exact 0.5 C reference difference is accepted; a genuine 0.5004 C difference is rejected.

All four public sample archives were regenerated from the corrected code at **21:14:41–21:14:42 UTC**, with analysis version 1.0.2. Their original four outcomes remain unchanged, every citation resolves, World Model graph context is consumed, and model/SQL call counts remain zero.

Actual live attempts 04–05 still record version 1.0.1 and were **not rewritten** to imply verification of this patch. Fresh 1.0.2 live checks, final publication, and an isolated clean-clone run are coordinated separately. The new clean-clone helper uses a new checkout, an explicit published SHA and expected test-count argument, four sample cases, and no private environment file or sponsor environment variables. Preparation or syntax checking of that helper does not constitute a completed clean-clone verification.

## Final 1.0.2 live verification — 21:25 UTC

The corrected code has now completed both actual local-service cases through the browser. The [current live-revision report](live-revision-validation.json) records the final results separately from earlier versions:

| Attempt | Case and result | UI elapsed | Trace elapsed | Evidence |
| --- | --- | ---: | ---: | --- |
| 06, final decimal | TH-1042: `sensor_bias` | 153.028 s | 152.799 s | [Validation](../examples/live-agent/attempt-06-final-decimal/validation.json), [dossier](../examples/live-agent/attempt-06-final-decimal/dossier.json), [browser export](../examples/live-agent/attempt-06-final-decimal/browser-export.json) |
| 07, final abstention | TH-1043: `insufficient_evidence` | 153.347 s | 153.091 s | [Validation](../examples/live-agent/attempt-07-final-abstention/validation.json), [dossier](../examples/live-agent/attempt-07-final-abstention/dossier.json), [browser export](../examples/live-agent/attempt-07-final-abstention/browser-export.json) |

Each final run records analysis version 1.0.2, three actual local Nightshift completions, four actual Zetaris reads, and 46 World Model context records. Citations, model selections, canonical verdicts, and browser/server dossier correspondence passed validation. Privacy checks passed. The final browser asset names were `index-BItQxwUl.js` and `index-CG4W20OW.css`; publication identity remains a separate verification step.

The archive now contains **seven full live attempts, six completed**, including **two completed cases out of two attempts on version 1.0.2**. Earlier attempts remain unchanged, including the initial timeout. Provider probes, offline samples, rejected API requests, and the stopped-companion connection-failure UI check are excluded from this full-investigation denominator. These counts are a transparent record of this synthetic evaluation, not a reliability guarantee.

The browser's [decimal-boundary export](../submission/browser-qa/TH-1044-decimal-boundary.json) was also copied without modification and validated: raw 2.3 C, confirmed offset 0.3 C, corrected 2 C against a 2 C minimum, zero excursion readings, and `within_range`. Its SHA-256 is `b83c4f39399f46e19376b9ee2c7983877bbac9b282e93ad32fcbcb07ad066738`. This is an actual **sample browser** check; it is not evidence of a sponsor call.

The current local suite is **31/31 passed**. The browser review records 28 baseline interaction groups from version 1.0.1 and three targeted regression groups on 1.0.2, plus the two final live cases; it does not claim that every baseline check was rerun. At this snapshot, the new published commit, isolated clean-clone receipt, deployment receipt, and HackOS submission are still pending. Metadata explicitly distinguishes those pending current-release checks from the historical successful release.

## Final browser import guards — 21:33 UTC

The final UI review reproduced two import-related rendering failures. Optional source metadata such as `source_system` or `dataset_id` could be an object instead of text, and malformed telemetry fields retained correctly as rejected evidence could still be passed directly to React as object-valued children.

The workspace now rejects non-text source metadata before replacing the working dataset. Malformed readings remain preserved and rejected by the evidence calculation; their retained field values are converted to safe display text so the drawer and reading controls remain usable. This preserves the distinction between invalid evidence and an invalid import envelope.

The release coordinator ran the full suite under **Node 24** after these guards: **33/33 tests passed**, confirmed at approximately 21:33 UTC. The two added tests cover all four source envelopes and several invalid metadata types, plus actual React static rendering of retained malformed reading fields. This supersedes the earlier 31-test checkpoint. It does not change the analysis core or server: analysis remains **1.0.2**, and actual live attempts 06–07 retain their original results and observed browser assets. Targeted browser checks and the final build are recorded by the UI/release review; they are not inferred from these unit tests.

The isolated clean-clone validator is prepared to check both TAP and Node 24 spec-reporter summary lines, including ANSI-colored output. It requires the expected test count as an argument, now 33, and rejects missing or ambiguous summaries. Parser checks are complete; the actual new clone still awaits the published SHA and must not be described as already verified.

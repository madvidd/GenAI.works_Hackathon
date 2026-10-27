# Evaluation and intended operational value

[Documentation](README.md) · [Evidence guide](evidence-guide.md) · [Zetaris reflections](zetaris-reflections.md)

## The value hypothesis

TraceHarbor may help an operations analyst reconcile a disputed temperature alert more consistently and produce an inspectable handoff. Its working prototype demonstrates evidence calculations, source citations, missing-data handling and a consequential critic branch. It has not yet demonstrated faster work, fewer operational errors, commercial savings or customer demand.

Evaluate three distinct questions:

1. **Does the calculation follow the supplied evidence?** Test identity, time windows, calibration, coverage, contradictions and citation resolution.
2. **Does the agent obtain useful missing evidence?** Compare the provisional result with critic-selected retrieval and withholding, including unsuccessful choices.
3. **Does the workflow help an analyst?** Compare equal-scope manual and assisted investigations with correctness and effort measured separately.

## Evidence already available

The [clean-clone receipt](clean-clone-validation.json) records 16 passing tests and three actual sample runs for baseline commit `ca1f6b7`. The current local suite passes 33 tests. The official World Model’s separate upstream conformance run passed 8/8. [Actual integration receipts](live-revision-validation.json) record two successful current investigations and six completed full runs out of seven recorded attempts overall, with the earlier timeout retained. These are functional and integration checks on synthetic cases, not a representative field benchmark or a reliability estimate.

Subsequent fixes must be evaluated on their own checkout. Do not treat a historical test count or published screenshot as evidence that a new revision passed.

The revised core is 1.0.2; the current local suite passes 33 tests, and all four sample archives were regenerated with resolved citations and zero model/SQL calls. [The readiness review](readiness-review.md) describes the regression fixes and final current-revision live evidence and separate publication checks.

## Functional test families

| Family | What should be challenged | Useful failure signal |
| --- | --- | --- |
| Identity | Missing or duplicate row/reading IDs; distinct shipments with similar names | Evidence is rejected or kept distinct rather than silently merged |
| Time | Equivalent timestamps, window boundaries, expected cadence and large gaps | Coverage cannot be inflated by duplicate observations |
| Calibration | Confirmed, pending, expired, overlapping or conflicting certificates | Correction is applied only when justified; ambiguity remains visible |
| Numeric boundaries | Exact decimal subtraction, scientific notation, stated limits and the integrity envelope | `2.3 − 0.3` remains exactly at the 2°C boundary; genuine 1.9996°C and 8.0004°C excursions remain excursions |
| Reference evidence | Independent reference agreement and disagreement | Exact 0.5°C agreement and genuine 0.5004°C disagreement remain distinct; duplicate references cannot silently validate a disputed correction |
| Provenance | Changed rows, warm reloads and unresolvable citation IDs | Claims remain traceable; unchanged evidence is not falsely re-ingested |
| Agent behavior | Useful retrieval, declined retrieval, malformed decisions and absent critique | The record shows the actual branch; invalid output is not silently repaired into success |
| Service failure | Timeouts, unavailable services, oversized responses and invalid envelopes | The run fails explicitly without a hidden sample fallback |
| Interaction | Imported-data validation, case-scoped edits, evidence drawers and export | The displayed/exported dossier belongs to the current case and evidence |

Tests should compare behavior at the boundary, not merely mirror implementation constants. A passing fixture case alone does not establish correct handling of altered evidence.

## A fair analyst study

Use the same case files and questions in both conditions. Include true observed excursions, justified sensor corrections, missing evidence, contradictory sources and normal controls. Define the adjudicated outcome and acceptable evidence beforehand, independently of the application’s output.

| Measure | Operational definition |
| --- | --- |
| Finding correctness | Supported findings recovered; unsupported findings asserted; material contradictions missed |
| Citation validity | Each asserted finding resolves to the appropriate retained source records |
| Abstention behavior | Cases with insufficient evidence remain unresolved; complete cases are not needlessly blocked |
| Active analyst time | Time reading, checking and preparing the handoff, excluding separately reported system waiting |
| End-to-end elapsed time | Wall-clock time including service latency and failures |
| Human correction burden | Edits, overridden recommendations and missing records that the operator must recover |
| Handoff usefulness | A second reviewer can identify the question, evidence, limits and next step without reconstructing the investigation |

Counterbalance manual/assisted order to reduce learning effects. Keep one-time installation, source onboarding and training separate from repeat-use investigation time. Report cold and warm runs when caches matter. Record the source revision, hardware, model, context settings, dataset, all attempts and failure reasons.

The recorded 142.323-second live run is system latency for one synthetic scenario; it is not analyst time saved. The illustrative 34-minute and 14-minute budgets in [Zetaris reflections](zetaris-reflections.md) are unmeasured planning assumptions, not results.

## Agent ablations worth running

- Compare initial manifest/telemetry evidence with the complete four-source evidence set.
- Compare critic retrieval with a critic that declines the missing source.
- Withhold calibration and independent reference observations separately.
- Change readings around a limit without changing the rest of the case.
- Introduce contradictory evidence and measure whether the system abstains.
- Compare local model choices while keeping data, budgets and deterministic rules fixed.

A schema-constrained model can select valid identifiers while still making a poor investigative choice. Measure the resulting evidence and conclusion, not JSON validity alone. Keep unsuccessful and timed-out attempts in the denominator.

## Scope of any future result

A small successful study would support only its tested analyst task, data and deployment conditions. Production use additionally requires validated domain thresholds, representative data, appropriate access controls, retention and governance, monitoring, and clear human decision authority. None of those outcomes is established by this prototype’s synthetic examples.

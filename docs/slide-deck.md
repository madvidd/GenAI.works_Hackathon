# TraceHarbor: eight-slide source

This is the editorial source for the final eight-slide [PowerPoint](../submission/traceharbor.pptx) and [PDF](../submission/traceharbor.pdf). The reproducible authoring source is [submission/build-deck.mjs](../submission/build-deck.mjs). The exports include 16 passing local tests and the verified browser investigation from `examples/live-agent/attempt-03-browser/manifest.json`. The authoring source requires this validated manifest through `TRACEHARBOR_LIVE_MANIFEST` before claiming complete live execution. All eight slide renders and all eight exported PDF pages were visually inspected; structural, layout and first-party import checks passed. See the [validation receipt](../submission/validation.json). Keep secrets out of every slide and speaker note.

## 1. The problem and user

**Title:** One shipment. Four conflicting stories.

**On-slide copy:**

- User: an operations analyst investigating a disputed temperature exception.
- Manifest, telemetry, carrier notes, and calibration must be reconciled.
- A confident status is not enough when observations are missing or contradictory.

**Visual:** Four source cards feeding one investigation question.

**Speaker note:** This is a focused operational hypothesis supported by synthetic scenarios. We have not conducted a customer study or measured commercial savings.

## 2. The solution

**Title:** A dossier that shows why, and when to stop.

**On-slide copy:** Supported findings. Source-level citations. Preserved contradictions. Evidence-withholding tests. Explicit abstention. Proposed next actions for a human operator.

**Visual:** Actual dossier screenshot with one finding expanded to its source rows.

**Speaker note:** TraceHarbor investigates the observed record. It does not approve cargo release or certify product safety.

## 3. Agent workflow

**Title:** The critic can change the answer.

**On-slide copy:** Planner → governed retrieval → World Model context → numerical analysis → critic-selected evidence test → rerun → supported synthesis.

**Visual:** Workflow with the executed critic branch highlighted, plus a short actual trace excerpt.

**Speaker note:** Model decisions are bounded. The planner chooses two or three initial sources. The critic can retrieve omitted evidence, recompute the factual result and select a permitted evidence-withholding challenge. Synthesis selects supported findings/actions. The numerical core owns measurements and the bounded outcome. The archived complete live run retrieved incidents and calibration after an initial manifest-and-telemetry pass, changing insufficient evidence to sensor bias. Withholding calibration returned to insufficient evidence.

## 4. Technical stack

**Title:** Inspectable from the browser to the evidence row.

**On-slide copy:** React/Vite interface; Node.js programmatic runner; deterministic evidence core; Zetaris REST and USL; official Meterless World Model; Nightshift model route; Firebase static hosting.

**Visual:** Deployment diagram separating public static assets from the local live companion and its private service configuration.

**Speaker note:** Public sample computation is explicitly labeled. A static website does not imply access to the builder's local services. Tokens never enter the frontend bundle.

## 5. Sponsor technology

**Title:** Every claimed integration needs a receipt.

**On-slide copy:**

- Zetaris: source registrations, exploration, relationship-preserving USL, executed data-quality rule.
- Meterless World Model: evidence ingestion, graph-context retrieval, source-priority facts, event/audit artifacts.
- Nightshift: three actual structured-output calls for planner, critic and synthesis, using local Llama 3.2 1B.
- NVIDIA: no current contribution claimed; the selected model path is local Llama.

**Visual:** Actual query, engine and model receipts, with their verified scope. The complete run used four actual Zetaris reads and 46 World Model records in 142.323 seconds. All three Nightshift phases returned the selected local model. The failed earlier simple preflight and initial timeout remain archived; this completed synthetic case is not a general model-quality benchmark.

**Speaker note:** Codex is the coding assistant. Cursor use is not claimed. Upstream engine code is attributed under Apache-2.0.

## 6. What is distinctive

**Title:** Withhold evidence. Test the answer.

**On-slide copy:** A raw alarm can be explained by valid calibration. Withhold that evidence and recompute. A missing sample stays missing. A source contradiction stays visible.

**Visual:** Actual before/after evidence-withholding result with the affected citations.

**Speaker note:** This is record sensitivity, not experimental causality. Temporal alignment with a door event supports investigation; it does not prove the event caused the excursion.

## 7. Product and evaluation

**Title:** Three difficult cases, plus a normal control.

**On-slide copy:** Observed excursion; sensor bias; insufficient evidence; bounded in-range control. Every case is synthetic and input-dependent.

**Visual:** Product screenshots of the chart, evidence drawer, abstention state and trace. Use the latest verified metadata test count and add clean-run evidence only after it exists.

**Speaker note:** The final test set should include changed inputs, invalid observations, expired/overlapping calibration, missing data, citation rejection, service failure, and no-credential sample mode. No test result is claimed from the presence of a test file.

## 8. Next steps and limits

**Title:** From a reproducible prototype to a validated workflow.

**On-slide copy:** Validate with one real operations user. Connect permitted real sources. Measure manual and assisted investigation time fairly. Expand schema/permission coverage. Keep high-impact decisions human-owned.

**Visual:** Three-step roadmap: verified integration → user study → operational pilot, plus repository and verified demo links.

**Speaker note:** Current limits include synthetic evidence, small datasets, heuristic confidence, no proof of causation, and no product-safety authority. Any time-saving figures are estimates until a timed comparator is performed.

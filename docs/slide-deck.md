# TraceHarbor: eight-slide source

This is the editorial source for the [finished PowerPoint](../submission/traceharbor.pptx) and [PDF](../submission/traceharbor.pdf). The reproducible authoring source is [submission/build-deck.mjs](../submission/build-deck.mjs). The exported deck uses actual deployed screenshots and explicitly labels pending sponsor execution. Status labels must match the final verified build. Keep secrets out of every slide and speaker note.

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

**Speaker note:** Model decisions are bounded. The planner chooses source order/focus, the critic chooses a permitted challenge, and synthesis selects supported findings/actions. The numerical core owns the measurements and outcome. Show this as implemented only after the live run has been verified.

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
- Nightshift: actual planner, critic, and synthesis calls.
- NVIDIA: show returned Nemotron IDs only if verified.

**Visual:** Redacted actual query, engine, and model receipts. Until available, use an explicit “execution pending” status panel.

**Speaker note:** Codex is the coding assistant. Cursor use is not claimed. Upstream engine code is attributed under Apache-2.0.

## 6. What is distinctive

**Title:** Test the explanation against its evidence.

**On-slide copy:** A raw alarm can be explained by valid calibration. Withhold that evidence and recompute. A missing sample stays missing. A source contradiction stays visible.

**Visual:** Actual before/after evidence-withholding result with the affected citations.

**Speaker note:** This is record sensitivity, not experimental causality. Temporal alignment with a door event supports investigation; it does not prove the event caused the excursion.

## 7. Product and evaluation

**Title:** Three difficult cases, plus a normal control.

**On-slide copy:** Observed excursion; sensor bias; insufficient evidence; bounded in-range control. Every case is synthetic and input-dependent.

**Visual:** Product screenshots of the chart, evidence drawer, abstention state, and trace. Add actual test counts and clean-run evidence only after they exist.

**Speaker note:** The final test set should include changed inputs, invalid observations, expired/overlapping calibration, missing data, citation rejection, service failure, and no-credential sample mode. No test result is claimed from the presence of a test file.

## 8. Next steps and limits

**Title:** From a reproducible prototype to a validated workflow.

**On-slide copy:** Validate with one real operations user. Connect permitted real sources. Measure manual and assisted investigation time fairly. Expand schema/permission coverage. Keep high-impact decisions human-owned.

**Visual:** Three-step roadmap: verified integration → user study → operational pilot, plus repository and verified demo links.

**Speaker note:** Current limits include synthetic evidence, small datasets, heuristic confidence, no proof of causation, and no product-safety authority. Any time-saving figures are estimates until a timed comparator is performed.

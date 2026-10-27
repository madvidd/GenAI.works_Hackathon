# Investigating an exception with TraceHarbor

[Documentation](README.md) · [Run locally](getting-started.md) · [Data assumptions](../data/README.md)

## The user and the job

TraceHarbor is designed for an operations analyst reviewing a disputed shipment-temperature alert before handing the case to the responsible operator. The analyst needs to reconcile measurements, reported statuses and instrument evidence, then explain what is known and what should happen next.

The prototype organizes the work into a dossier. It does not replace the operator’s authority or a validated quality-management process. Its practical usefulness is a product hypothesis supported by working synthetic scenarios, not measured adoption or savings.

## A five-step investigation

1. **Select a shipment and confirm the window.** Check its route, primary sensor, stated range and expected sampling interval. Keep the execution mode visible.
2. **Read the outcome with its coverage.** An observed peak and a complete-looking chart are insufficient if observations or applicable calibration are missing.
3. **Open the evidence behind a finding.** Inspect stable row IDs, original values, source/update times and the certificate’s validity interval. Read conflicting source claims rather than discarding them.
4. **Challenge the explanation.** Use an evidence-withholding experiment to identify whether the result depends on a certificate or other selected record. The result is recomputed from the remaining support.
5. **Export a handoff.** Retain the supported findings, unresolved questions, proposed next action and execution trace. A person decides what operational action is permitted.

## The four supplied cases

| Case | Investigation | Supported interpretation |
| --- | --- | --- |
| `TH-1041` — Southampton → London | A clear status conflicts with three calibrated readings above the stated range; a 999°C observation is invalid | Observed excursion; reconcile the original claims and investigate the nearby door event without treating timing as proof of cause |
| `TH-1042` — Bristol → Oxford | Seven raw alerts, applicable +4.5°C sensor offset, two agreeing reference observations and an expired alternative certificate | Sensor bias explains the alarm; inspect the valid certificate and request sensor maintenance |
| `TH-1043` — Birmingham → Manchester | Only two of seven expected readings, a fifty-minute gap and a pending certificate | Insufficient evidence; request missing observations and resolved calibration |
| `TH-1044` — Cambridge → Norwich | Complete observations and confirmed zero offset within the bounded window | No excursion observed in the available window |

Every case is synthetic. The logic derives outcomes from records; the archived output files are examples, not runtime answer lookups.

## Follow TH-1042 from alarm to explanation

The raw peak is 10.1°C. The manifest’s demonstration range is 2–8°C. The applicable confirmed certificate states that the sensor reads 4.5°C above its reference, so the correction is:

```text
corrected temperature = observed temperature − confirmed offset
                      = 10.1°C − 4.5°C
                      = 5.6°C
```

TraceHarbor requires the certificate to be confirmed and valid at each observation time. The expired certificate cannot substitute for the applicable one, and reference-probe readings cannot fill gaps in the primary sensor’s schedule. Two reference observations corroborate this case’s correction.

In the actual current local agent run, the first manifest-and-telemetry pass was insufficient. The Nightshift critic selected incidents and calibration for retrieval through Zetaris. After the new rows entered World Model context, the core recomputed the result as sensor bias. The critic’s calibration-withholding check then restored insufficient evidence. The [trace and model/query receipts](../examples/live-agent/attempt-06-final-decimal/) preserve that sequence. A separate [TH-1043 live investigation](../examples/live-agent/attempt-07-final-abstention/) still abstained after retrieval because the observation gap and unresolved calibration remained.

## Understand each view

| View | Use it to answer |
| --- | --- |
| Overview | What does the available evidence support, over which window, with what coverage? |
| Evidence | Which original rows and timestamps support or contradict the finding? |
| Reasoning | What computations or actual live steps occurred, and where did the interpretation change? |
| What if | Does the conclusion survive the selected evidence change? |

Source drawers expose evidence rather than a new model-generated explanation of that evidence. A trace in browser sample mode describes deterministic computation; a live trace must include actual query/model receipts to establish service execution.

## What a good handoff contains

- The shipment, observation window and exact question investigated.
- The computed outcome with the supporting record IDs and relevant calculations.
- Missing or rejected observations, ambiguous calibration and conflicting source claims.
- The proposed next step and the evidence needed to resolve an abstention.
- The run mode, identity and limitations so another reviewer can reproduce the scope.

The intended benefit is less manual reconciliation and a more inspectable handoff. The project has not measured analyst time, error reduction or financial outcomes. [The evaluation plan](evaluation.md) describes how to test those benefits fairly.

## Explore a different input

The workspace can import one JSON object containing `manifest`, `telemetry`, `incidents` and `calibration` feed objects. Each must contain a `records` array. See the [data contract and import example](../data/README.md#browser-import-format).

Import validation runs before replacing the current workspace, including string-type validation for optional feed metadata across all four sources. The manifest must contain at least one renderable shipment, source row IDs must be nonempty and unique across the dataset, and each shipment must pass the evidence core’s identity/window checks. Invalid readings can remain inspectable evidence; structurally broken or ambiguous inputs cannot replace the current workspace.

Reading edits apply to the selected shipment only and recompute sample results. They do not update Zetaris or a physical logger. The What if comparison retains the workspace's unedited baseline so the original conclusion remains visible beside the current experiment. An edited source drawer explicitly identifies the browser experiment and exposes `browser_edit` provenance, including the original and modified temperatures; repeat edits retain the first original value. The dataset is labeled as modified in the browser.

**Restore original sample** clears browser edits and experiments and restores the built-in demonstration. An imported dataset becomes the comparison baseline for its own subsequent edits. Press `/` to focus shipment search; use the active tabs and citation controls to navigate to the evidence behind a finding. These controls were exercised in the [current browser validation](ui-validation.json), which records actual checks and their limits. Publication checks remain separate.

## Interpret the limits correctly

“No excursion observed” describes the available valid measurements; it is not continuous-temperature proof or a safety authorization. Evidence strength is a heuristic, not a calibrated probability. Withholding a certificate changes the available explanation; it does not simulate physically changing the shipment. Four operational source types on one demonstration host are not four independent production providers.

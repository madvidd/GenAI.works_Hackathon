# Three-minute demo script

Target: **3:00**, inside the required 1–4 minutes. **Audio is required.** This is a narration and shot plan, not a recorded demo. Record the current application, inputs, outputs, and actual trace. Cuts may shorten waiting time; they must not fabricate a result or a sponsor call.

The live section below is conditional on a successful real run. If a service is unavailable, replace its spoken claim with the accurate failure and the explicitly labeled sample path. Do not submit an adapter screenshot as proof of execution.

## Narration and shots

| Time | On screen | Narration |
| --- | --- | --- |
| 0:00–0:20 | Title, track, synthetic-data label; open one disputed shipment | “This is TraceHarbor, for The Agent That Can Explain Why. It helps an operations analyst investigate a disputed cold-chain exception. A shipment status, a sensor alarm, an event log, and a calibration record can tell different stories. These records are synthetic. The question is what the evidence actually supports.” |
| 0:20–0:45 | Raw versus corrected chart; select `TH-1042`; inspect the certificate | “Here the raw readings trigger an alarm. The applicable confirmed certificate records a sensor offset, and the corrected readings fall within the stated range. Independent reference observations corroborate that correction. An expired certificate remains visible but cannot authorize a correction. This explains the sensor alarm; it does not authorize cargo release.” |
| 0:45–1:10 | Row-level evidence drawer; source IDs, event/source times, contradiction | “Every finding points back to its source rows. We preserve the original claim even when the evidence contradicts it. Event time and source-update time are distinct. The evidence-strength score explains its assumptions; it is a heuristic, not a probability of safety.” |
| 1:10–1:40 | Actual live trace and result, or clearly labeled sample trace if live is unavailable | **Only after verified live execution:** “The planner chooses a bounded retrieval plan. Zetaris supplies the governed rows through the shipment evidence USL. The official Meterless World Model ingests that evidence and returns the context used by the investigator. Nightshift handles the planner, critic, and synthesis requests. These receipts show the actual model used on each call.” |
| 1:40–2:05 | Critic challenge and evidence-withheld rerun | “The critic asks whether the conclusion survives without a piece of supporting evidence. We execute that test. Without the applicable calibration, the explanation must change. This is a sensitivity check on the record, not a claim about what would happen to a physical shipment. The final dossier keeps the challenge and both results.” |
| 2:05–2:30 | `TH-1043`: missing schedule and abstention; then `TH-1041` invalid row | “For this shipment, only two of seven expected observations are present. A confident operator note and a pending calibration cannot fill the gap, so TraceHarbor abstains and requests the missing evidence. In the excursion case, an impossible sensor reading is excluded, and a nearby door event is described as an association rather than proven causation.” |
| 2:30–2:50 | Structured output, trace artifacts, sample command; actual DQ receipt if available | “Judges can run the system programmatically. Sample mode executes the logic without credentials; it never replays a stored answer. Live runs keep query, model, engine, and critique evidence. The public interface states which mode is running.” |
| 2:50–3:00 | Final dossier and public repository link | “The result is a bounded operational handoff: supported findings, unresolved conflicts, evidence gaps, and next actions. TraceHarbor makes the explanation inspectable, including when the right answer is that we do not know enough.” |

Approximate spoken duration depends on pace and pauses. Rehearse against the actual recording and cut words rather than speed up unreadably.

## Required recording evidence

- Show a real input and the resulting output from the current build.
- Show an actual critique and resulting branch or rerun.
- Show the meaningful Zetaris query/USL path and a real DQ execution receipt, if completed.
- Show World Model activity and a live Nightshift request only when those artifacts exist.
- Show actual returned model IDs when claiming Nemotron contribution.
- Show the explicit synthetic/sample/live label and an insufficient-evidence outcome.

## Capture and publication checks

Prefer 1080p, 16:9, MP4, clear microphone narration, and readable browser/terminal text. Keep token settings, `.env.local`, provider keys, personal inboxes, and unrelated private tabs out of frame. Review frames around any terminal or provider console. Avoid a wall of slides replacing the working product.

Watch the exported file from start to finish: check duration, intelligible audio, legibility, and that the displayed results match the narration. Test the shared video while logged out. Preserve the exported file and a second copy/link through judging. Record its URL in metadata only after access is verified.

## If live integration remains incomplete

Say: “This recording shows the input-dependent sample mode. The live adapter is implemented, but a successful full sponsor run is not yet verified.” That is accurate; it does not satisfy the missing live-integration requirement. Keep the unmet gate visible in the requirements matrix rather than hide it with sponsor logos.

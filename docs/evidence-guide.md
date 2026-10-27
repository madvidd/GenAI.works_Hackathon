# How to inspect the evidence

[Documentation](README.md) · [Examples](../examples/README.md) · [Evaluation plan](evaluation.md)

TraceHarbor separates calculation tests, actual engine activity, real service execution and publication checks. Each answers a different question. The archived baseline was verified on 27 October 2026; the source revision in a receipt determines what it covers.

The current 1.0.2 sample archives and 33-test local suite are recorded in the [readiness review](readiness-review.md). The revised interface and two final 1.0.2 live investigations have [their own receipts](live-revision-validation.json), separate from earlier attempts. The 16-test clean-clone receipt remains historical evidence, not the current local test count.

## Start here

| Question | Evidence to inspect | What it establishes |
| --- | --- | --- |
| Can another checkout run the sample? | [Final clean-clone receipt](clean-clone-redesign-validation.json) | Commit `1c71b1c`: fresh offline dependency installation, 33 tests, build and all four sample cases without private credentials or model/SQL calls |
| What does a generated sample look like? | [Four input/output examples](../examples/README.md) | Input-dependent computation and actual World Model events; no sponsor network calls |
| Did Zetaris actually run? | [SQL setup archive](../examples/live-zetaris/) and [validation](zetaris-validation.json) | Actual source exploration, USL/DQ execution and record consumption |
| Did the complete model workflow run? | [Attempt 02](../examples/live-agent/attempt-02/) and [validation](live-agent-validation.json) | Three local Nightshift phases, four SQL reads, 46 World Model records and the resulting dossier |
| Did the UI invoke the actual backend? | [Browser run](../examples/live-agent/attempt-03-browser/) and [downloaded export](../submission/browser-qa/TH-1042-live.json) | Matching run identity, outcome, citation evidence and browser/server result |
| Did the revised core and UI run live? | [Current revision summary](live-revision-validation.json), [TH-1042](../examples/live-agent/attempt-06-final-decimal/) and [TH-1043](../examples/live-agent/attempt-07-final-abstention/) | Analysis 1.0.2: supported sensor bias and retained abstention, each with three real model calls, four SQL reads and matching exports |
| Do current browser interactions work? | [Grouped UI checks](ui-validation.json) | Actual navigation, imports, editing, citations, keyboard, mobile and API interactions; not exhaustive coverage |
| Were the intended files published? | [Final deployment receipt](deployment-redesign-validation.json) and [release explanation](release-validation.md) | All 14 production-build files returned HTTP 200 and matched the source/artifact commit's intended bytes |
| Are the media exports usable? | [Video validation](../submission/demo-validation.json), [deck validation](../submission/validation.json) and [asset guide](../submission/README.md) | Declared technical checks, reviewed images/pages and explicit playback/rendering limits |

## Read a complete live run

1. Open `manifest.json`. Check `mode`, `liveExecuted`, sponsor-runtime flags, the run ID and model/query counts.
2. Inspect `modelReceipts`. Confirm the planner, critic and synthesis phases returned actual model IDs, usage and completion status.
3. Inspect `retrievalPlan`. Compare initial sources, critic-selected sources, provisional/final outcomes and anything still missing.
4. Read `zetaris-queries.jsonl` and the World Model event/audit files. Their actual returned records must support the dossier.
5. Read `dossier.json`, including its citations, contradictions, counterfactual result and limitations.
6. Follow the ordered `trace.jsonl` events. The result should be explainable from the executed steps, not from an intended architecture diagram.

In the archived TH-1042 live cases, manifest and telemetry initially produced insufficient evidence. The critic retrieved incidents and calibration, the factual result became sensor bias, and calibration withholding restored insufficient evidence. The raw peak was 10.1°C; the corrected peak was 5.6°C. This is evidence dependence, not demonstrated physical causation.

## What each mode does not prove

| Evidence type | Boundary |
| --- | --- |
| Browser sample | Computes local synthetic results; does not prove World Model, Zetaris or Nightshift execution |
| Sample CLI | Runs the official World Model and calculation core; does not prove database/model network calls |
| Mocked orchestration test | Proves control flow under supplied test responses; does not prove a sponsor service responded |
| Actual live run | Proves the archived attempt on its data and configuration; does not establish broad reliability or production scale |
| Public deployment check | Proves matching published bytes at that time; does not submit a hackathon entry |

## Preserve inconvenient evidence

The [live-agent archive](../examples/live-agent/) includes an earlier timed-out attempt. The [Nightshift preflight](../examples/live-nightshift-preflight/receipt.json) returned HTTP 200 but replied `No` when asked for `CONNECTED`. That probe proves transport and inference, not instruction-following success. Later structured runs are separate attempts, not retroactive corrections to those results.

The archived schema probe also has its own scope; constrained JSON output alone is not evidence of a correct investigation. Report actual returned models and observed choices rather than infer provider use from aliases or settings.

## Publication hygiene and reproducibility

Keep local `.env.local`, runtime tokens, raw private configuration and unrelated user information out of Git and screenshots. Selected public traces disclose any archive-only path normalization. Preserve the original calculations, model/query receipts and failure outcomes.

New execution creates new run IDs and timestamps. A changed source revision, dataset, model or prompt requires a new verification record. Keep historical receipts intact rather than rewriting them to appear current. [The submission confirmation](submission-confirmation.md) separately records the portal’s submitted state, observed after reload at 22:13 UTC on 27 October 2026. The [checklist](submission-checklist.md) distinguishes that confirmation from technical checks and unfinished board tasks.

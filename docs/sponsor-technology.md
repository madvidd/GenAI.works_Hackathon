# Sponsor technology explanation

This explanation describes the implementation and its evidence requirements. **Live sponsor execution is pending in this snapshot.** Replace that status only after real receipts exist. The public demonstration uses synthetic data and deterministic calculations; it does not imply that a live model or database request occurred.

## Zetaris: the evidence data layer

Four source registrations represent shipment management, sensor telemetry, carrier events, and calibration. A four-table shipment evidence USL preserves relationships and row-level provenance. The setup plan includes twelve exploratory source queries, activation mappings, a telemetry-integrity rule, and three USL investigation queries.

The live runner can read at most four allowlisted USL queries through the actual REST adapter. The planner chooses two or three initial sources; the critic can retrieve missing sources and recompute the factual analysis before its evidence-withholding challenge. It does not let a model supply executable SQL. Source rows feed the World Model and numerical investigation; this makes the data layer consequential to the output. A `SELECT 1` receipt alone does not demonstrate this contribution.

Required evidence: public-feed hash checks, successful registrations, source results, USL compile/activation/use, executed DQ counts and invalid rows, and a live agent dossier built from those query responses. The four feeds are distinct synthetic system representations on one host, not four independent production providers.

Syntax reference: [Zetaris getting-started at 6a2fbaa](https://github.com/zetaris/getting-started/tree/6a2fbaa47c32c9ac33f6584c64b43b146c621bed). Project SQL is original integration code based on that documentation. No JDBC success is claimed.

## Meterless World Model: structured evidence context

The project integrates the official TypeScript World Model implementation from [Meterless/Meterless](https://github.com/Meterless/Meterless/tree/1742dec56a66e58eef9dda2d2b865823758ca8cd), revision `1742dec56a66e58eef9dda2d2b865823758ca8cd`, under Apache-2.0. Original license and notices are retained with the vendored source.

The wrapper ingests the source evidence, reconstructs evidence from graph context, and passes it into the deterministic investigator, which selects the shipment and window. Source-priority facts and the final verdict are persisted through the engine. Run artifacts include its events and audit records. This is a feature integration, not a claim to have invented the upstream engine.

The local feature test passed within the 14-test suite: 46 source rows ingested, all 46 unchanged rows skipped on warm reload, no new ingest events, and four separate shipment identities. External keys are used because fuzzy matching would otherwise merge similarly named operational IDs. The official upstream conformance runner also passed 8/8 against the vendored implementation. Preserve the project test and actual event/audit artifacts. H-MEM, Markovian, voice, and automated cargo disposition are not claimed as active features.

## Meterless Nightshift: primary live model provider

All three live model calls go through Nightshift: the planner chooses two or three initial governed sources; the critic can request missing sources and chooses a bounded evidence-withholding test; synthesis selects existing supported findings and actions. The deterministic core owns numerical calculations, source citations, and the bounded outcome.

The runner caps model calls at three, USL reads at four, and total runtime at five minutes. The critic's selected test executes another analysis. It can show that the explanation depends on calibration, sampling coverage, or an operator claim. This is a sensitivity test of the record, not a simulated physical intervention. Failed live execution does not silently become sample execution.

The application's secret is the Nightshift Runtime token. The NVIDIA provider key stays in Nightshift. Required evidence: authenticated Runtime discovery, actual request receipts, returned model IDs, and run-generated traces. Installation and a health endpoint are not evidence of successful inference.

## NVIDIA Nemotron: only claim the model that actually ran

The intended contribution is Nemotron reasoning through Nightshift. The configured alias `meterless/auto` is insufficient proof because it can route to another provider. Record the actual model returned on every request and the role that request performed. Do not set a verified-NVIDIA flag from an alias, screenshot of a provider setting, or an unexecuted code path.

No verified Nemotron contribution is claimed yet. Once tested, include the real model identifiers and the corresponding redacted run receipts here and in `metadata.json`.

## Coding tool and other attribution

OpenAI Codex is used as the AI coding assistant. Cursor is optional under the current AI Usage Policy and Vibe Coding guide; no Cursor use is claimed. The team remains responsible for inspecting, testing, and understanding generated code.

React, Vite, and other package dependencies retain their licenses. Original synthetic fixtures and project integration code use the repository's existing MIT license. The existing LICENSE and short README were present before this implementation; the upstream World Model is a pre-existing component. Declare any additional pre-window project work found during the final history review.

## Distinctive integration

The intended demonstration is not a dashboard with sponsor logos. It is a contested claim: raw alarm, governed evidence, source-valid calibration, critic-selected evidence withholding, and an explanation whose scope changes when its support disappears. Zetaris supplies the governed rows; World Model supplies structured retrieved context; Nightshift supplies bounded planning and critique; deterministic checks prevent those model calls from inventing measurements or clearance authority.

That integration must be demonstrated with actual runs before being submitted as complete.

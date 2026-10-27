# Real Zetaris setup and evidence

[Documentation](../docs/README.md) · [Full local setup](../docs/getting-started.md) · [Source contract](../data/README.md)

This folder turns the four synthetic operational feeds into a governed query contract for the live agent. Zetaris supplies actual rows; the evidence core interprets calibration, coverage and conflicting claims. The model selects allowed read tools and never supplies executable SQL.

The SQL uses the official Zetaris REST, USL and DQ syntax reviewed at
[`zetaris/getting-started` commit 6a2fbaa](https://github.com/zetaris/getting-started/tree/6a2fbaa47c32c9ac33f6584c64b43b146c621bed).
All 34 statements were executed against an actual instance on 27 October 2026.
[Actual receipts](../examples/live-zetaris/) retain query IDs, results and timings.
Local fixture computation or dry-run parsing is not proof of Zetaris execution.

1. Obtain a licensed/evaluation Zetaris instance, its actual API token, and
   numeric organisation ID. Follow the official installation guide. This project
   does not install Docker, accept platform terms, or create a paid AWS cluster.
2. Put `ZETARIS_BASE_URL`, `ZETARIS_API_KEY`, `ZETARIS_ORG_ID`, and
   `TRACEHARBOR_PUBLIC_ORIGIN` in the ignored `.env.local`. A local base URL is
   `http://localhost:8888/api/v1.0`; a remote deployment must use HTTPS.
3. Publish the four canonical `data/*.json` feeds at `/data/` on the Firebase
   origin. Review the exact plan with
   `node scripts/zetaris-setup.mjs --origin https://PROJECT.web.app`.
4. Execute the reviewed plan with the same command plus `--execute`. It first
   checks that the published JSON matches the local fixtures, then runs the SQL
   sequentially, with 60-second request and ten-minute total caps. It makes no
   automatic retries and stops at the first error. Partial JSONL receipts remain
   under `logs/zetaris/`.
5. Inspect the actual `execute-telemetry-integrity` counts and
   `inspect-invalid-readings` result. The fixture should reject only
   `TEL-1041-X` / `RD-1041-X` (999 C), but this expectation is not a fabricated
   database result. Archive the observed response as submission evidence.

Every `-- @statement` block is exactly one API request. The multi-table
`COMPILE USL` block must remain intact. The runner does not split SQL at its
internal semicolons. It never deletes or replaces existing objects. On rerun,
inspect existing objects before choosing how to proceed. `--verify-only
--execute` runs the read/quality-execution subset against an already set-up
instance; it still verifies the published feeds first.

Files cover the three connectivity checks, four REST source registrations,
twelve exploration queries (three per source), one four-table USL DDL, four
activations, a named DQ rule with execution and invalid-record inspection, and
three USL investigation queries. The current reference requires
`RUN DQ telemetry_integrity TABLE ...`; older examples omit the rule name.

The `scripts/zetaris-schema.mjs` column order is the decoding contract for the
documented row-array SQL response. The live agent reads those USL tables rather
than silently loading local fixtures. A Firebase static page alone cannot access
a developer's local Zetaris or Nightshift runtime. Run the live agent where both
are reachable; publish only redacted evidence artifacts deliberately selected
for sharing.

The SQL is original project code based on documented syntax. Sponsor source
materials are linked rather than copied. No JDBC success is claimed: this
implementation uses the direct REST API, whose readiness is checked separately.

## Commands at a glance

Run from the repository root after configuring `.env.local`. Replace the origin when using your own published fixture data.

```powershell
# Preview only: no database mutations.
node scripts/zetaris-setup.mjs --origin https://traceharbor.web.app

# Execute the reviewed source/USL/DQ plan against the configured instance.
node scripts/zetaris-setup.mjs --origin https://traceharbor.web.app --execute

# Check an existing setup, including actual DQ execution.
node scripts/zetaris-setup.mjs --origin https://traceharbor.web.app --verify-only --execute

# Read USL rows, consume World Model context and validate outcomes/citations.
node --import tsx scripts/zetaris-verify.mjs
```

The last command makes no Nightshift request. Setup, contract verification and a complete live model investigation have different receipts.

## REST request contract

[`scripts/zetaris-client.mjs`](../scripts/zetaris-client.mjs) posts to `{ZETARIS_BASE_URL}/sql-editor/sqls/run`. It supplies `Authorization: Bearer <private token>`, numeric `X-Org-ID`, a fresh `X-Request-ID`, and `Content-Type: application/json`.

```json
{
  "queryId": "<fresh UUID for this query>",
  "sql": "<one complete SQL statement block>",
  "source": "SqlEditor",
  "limit": 1000
}
```

The adapter expects an object envelope with `data` as row arrays. [`zetaris-schema.mjs`](../scripts/zetaris-schema.mjs) defines column order; the client refuses unexpected shapes rather than guessing. Query/request IDs, SQL, returned rows and timing are evidence. Private tokens are not.

## Inspect the archived result

| Layer | Observed baseline result | Why it matters |
| --- | --- | --- |
| Source exploration | 12 queries; flattened counts 4 manifests / 26 readings / 10 incidents / 6 certificates | Confirms payloads and flattening before relying on the semantic layer |
| USL | Four related tables compiled and activated | Gives the runner a repeatable source/relationship contract |
| Integrity rule | 26 total / 25 valid / 1 invalid | Preserves the rejected 999°C record as a quality result |
| Contract check | 46 original rows read into World Model context; four outcomes and citations checked | Shows actual query results reaching the investigation |

An invalid telemetry row can remain in raw evidence and be rejected by the core. Executing a DQ rule does not mean every later query automatically filters invalid observations. One-to-many joined projections must not be treated as distinct sensor measurements; preserve original identities when interpreting joins.

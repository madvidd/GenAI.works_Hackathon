# Real Zetaris setup and evidence

The SQL uses the official Zetaris REST, USL and DQ syntax reviewed at
[`zetaris/getting-started` commit 6a2fbaa](https://github.com/zetaris/getting-started/tree/6a2fbaa47c32c9ac33f6584c64b43b146c621bed).
These files are implementation plans until executed against an actual instance.
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

# Actual Zetaris evidence

These are receipts from real direct REST requests on 27 October 2026 against
the published synthetic feeds at `https://traceharbor.web.app/data/`.
They are not fabricated traces or mocked transport output.

- `setup.jsonl`: all 34 setup statements, including four registrations, twelve
  source exploration queries, one four-table USL compile, four activations,
  named data-quality execution and invalid-row inspection, and three USL queries.
- `usl-queries.jsonl`: four actual governed source reads using the application's
  exact column-order contract. Query IDs, responses and timings are retained.
- `usl-verification.json`: all 46 decoded records matched the canonical fixtures;
  actual query results passed through the official Meterless World Model and
  investigator. All four expected outcomes and every citation resolved.

The executed `telemetry_integrity` rule returned **26 total, 25 valid and one
invalid**. The invalid-record response identifies `TEL-1041-X` / `RD-1041-X`
at 999°C. The three USL investigation queries returned 25, 69 and four rows.

Reproduce the read-only application-contract check after the platform is set up:

```sh
node --import tsx scripts/zetaris-verify.mjs
```

New receipts go under `logs/zetaris/`. This archive was scanned against actual
local API keys and for authentication headers, email addresses and private
Windows paths before publication. Request authentication headers are not logged.

This proves actual Zetaris execution and engine context consumption. It does
not prove a Nightshift completion, NVIDIA contribution, full live agent run,
production data integration or measured analyst-time savings.

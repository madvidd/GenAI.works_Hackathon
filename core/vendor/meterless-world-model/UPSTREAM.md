# Meterless World Model reference

The six files in `src/` are unchanged from
https://github.com/Meterless/Meterless/tree/1742dec56a66e58eef9dda2d2b865823758ca8cd/engines/world-model/reference/src
(retrieved 27 October 2026). The accompanying Apache-2.0 licence applies to these
vendored files. TraceHarbor's wrapper lives outside this directory.

This is the real event-sourced reference implementation, not a name applied to
an unrelated cache. TraceHarbor invokes its canonical ingest pipeline, queries
its graph to reconstruct agent context, records source-priority facts, persists
state, and exports its actual events/audit. It does not claim all optional World
Model features, H-MEM, or Markovian execution are implemented.

# Zetaris reflections

These address the three reflections in the supplied Zetaris scoring methodology. Written on 27 October 2026. **All time figures below are planning estimates, not measured benchmarks or customer results.** Real platform execution and a timed manual comparator are still pending. The SQL and product concept below must not be presented as executed evidence.

## 1. Time saved compared with a manual investigation

The manual task is to answer one bounded question: does the available evidence support the reported status for one shipment during its stated observation window? A useful baseline preserves the same calibration, missing-data, provenance, and quality checks as the automated path. Comparing a careful agent against an incomplete manual check would be misleading.

An illustrative planning budget is:

| Manual step | Assumed minutes |
| --- | ---: |
| Locate and open four source exports | 8 |
| Match shipment, sensor, and event identifiers | 6 |
| Inspect invalid data and applicable calibration intervals | 8 |
| Check the observation schedule and conflicting status claims | 6 |
| Write a cited handoff note | 6 |
| **Illustrative total** | **34** |

An illustrative repeat investigation using a configured USL might allocate 2 minutes to retrieval, 4 to evidence review, 4 to interpreting the critique, and 4 to the handoff: **14 minutes**, an assumed 20-minute reduction. That arithmetic is a hypothesis, not a demonstrated 59% productivity gain. It excludes initial platform installation and USL setup, which must be counted separately when evaluating adoption.

To turn this into evidence, time the same shipment/task manually and through the working application. Start from a defined cold or warm state; report both if useful. Preserve the final outputs, errors, missing findings, human corrections, hardware, build revision, and timings. Include all attempted runs in the denominator. Measure active analyst time separately from service latency. A partial manual comparator can still be informative if its incomplete coverage is explicit.

## 2. Where the USL helps, where it stops, and a future use

The proposed `shipment_evidence` USL gives the application a consistent relationship between manifests, observations, incidents, and calibration. It keeps identifiers and source timestamps available for citations. A stable table contract lets the agent choose governed read tools without generating arbitrary SQL. The source registration and activation steps make the data layer reproducible rather than relying on hand-copied exports.

The USL does not establish that a reported fact is true. It does not decide whether an expired certificate is admissible, fill missing observations, prove a door event caused an excursion, or make one-to-many join counts safe automatically. Those checks remain explicit in TraceHarbor's deterministic evidence logic. This prototype uses small synthetic datasets on one host; it has not demonstrated production-scale federation, schema drift handling, latency, or customer permissions.

A future project could investigate equipment-maintenance exceptions across asset records, sensor history, work orders, and calibration. The reusable part would be the governed source/identity/provenance contract. Domain thresholds and decision authority would need fresh validation. A planning estimate of **one to two engineering days** saved on a later four-source prototype is plausible if the same registration and schema patterns apply; this is an unmeasured estimate and may disappear when authentication or source semantics differ.

## 3. Product-manager proposal: evidence-window bundles

Proposed feature: let an analyst define a time-bounded investigation bundle that preserves source row IDs, valid-time relationships, quality-rule outcomes, and unresolved ambiguities. Export it with the query IDs and source update timestamps needed to reproduce the explanation. This is a proposed Zetaris/product improvement, not an existing platform feature claim.

Concept mock:

```text
EVIDENCE WINDOW                         TH-1042
Window       26 Oct 10:00 — 11:00 UTC
Sources      Manifest | Telemetry | Events | Calibration

Relationship check
  Shipment → sensor                         linked
  Observation → confirmed certificate       1 applicable
  Observation → expired certificate         excluded
  Primary schedule                          7 / 7 observed

Keep in the bundle
  [x] Original row IDs and timestamps
  [x] Quality failures and exclusion reasons
  [x] Query receipts and schema revision
  [x] Unresolved relationships

Preview USL projection     Export evidence bundle
```

The existing USL is the base for this proposal. A resulting projection would keep `shipment_id`, `manifest_row_id`, `telemetry_row_id`, `observed_at`, `calibration_row_id`, the original value, corrected value, and both source timestamps. It would represent zero or multiple matching certificates as an ambiguity rather than silently choose one. `sql/06-investigate.sql` provides the initial observation/calibration projection; the proposed product feature would add a reusable audited bundle around those results.

Acceptance criteria for a prototype:

1. Replaying a saved bundle against its stored inputs reproduces the cited calculation.
2. Withholding one certificate changes the explanation and identifies the affected claims.
3. An invalid observation remains visible in an audit section but cannot inflate a peak or coverage count.
4. Multiple applicable certificates produce an unresolved relationship, not an arbitrary correction.
5. The export contains no credentials and distinguishes source time, event time, and query time.

This concept offers a falsifiable improvement path. A feature mock alone does not demonstrate implemented functionality or earned scoring credit.

# TraceHarbor synthetic evidence feeds

Every record in this directory is invented for a reproducible demonstration. No
customer, carrier, shipment, cargo disposition, or commercial result is real.
The four feeds represent separate operational systems but share one demo host.
They are not four independent production providers.

TraceHarbor supports operational investigation. Its temperature envelopes are
fixture assumptions, not food or pharmaceutical safety standards. A result never
authorizes release, disposal, consumption, or a safety certification.

## Contract

Each JSON feed has `schema_version`, `dataset_id`, `synthetic: true`,
`source_system`, `generated_at`, and `records`. Every row has a stable `row_id`
and `source_updated_at`; event times are separate. All times are UTC ISO 8601.
Consumers must preserve source rows, IDs, and timestamps as evidence.

| File | Operational source | Primary key | Important fields |
| --- | --- | --- | --- |
| `manifest.json` | Shipment management | `shipment_id` | Route, agreed fixture limits, primary sensor, investigation window, expected sampling interval, reported status |
| `telemetry.json` | Temperature logger | `reading_id` | Shipment and sensor, observed time, raw temperature, reported/reference measurement |
| `incidents.json` | Event and operator log | `incident_id` | Shipment, event time, event type, reported status, untrusted free text |
| `calibration.json` | Calibration register | `calibration_id` | Sensor, validity interval, offset, confirmation state, reference method |

`offset_c` means **observed minus reference**. A corrected temperature is
`temperature_c - offset_c`. Apply a calibration only when `status` is `confirmed`,
`confirmed_at` is populated, and the observation is inside the half-open interval
`[valid_from, valid_to)`. Overlapping applicable certificates require review;
never choose one silently. A pending or expired certificate is not permission to
correct readings. Reference-probe measurements must not fill gaps in a primary
sensor's sampling schedule.

The investigation window includes both endpoints. With a ten-minute schedule
from 10:00 through 11:00, seven primary observations are expected. Count distinct
observation times, examine boundary and internal gaps, and exclude invalid data.
These fixtures use a synthetic sensor integrity envelope of -80 through 80 C.
This envelope rejects impossible demo readings; it is separate from each cargo's
2 through 8 C operational range.

## Reproducible cases

- `TH-1041`: three above-limit readings coincide with a door-open event; the
  manifest and an operator note incorrectly report `in_range`. `TEL-1041-X`
  reports 999 C and must be rejected before investigation. The timing supports a
  door-event association, not a proven causal experiment.
- `TH-1042`: all raw primary readings exceed the upper limit. A confirmed +4.5 C
  calibration offset makes every corrected primary reading in range; two
  independent reference-probe readings corroborate the correction. An expired
  calibration row must not be applied. This resolves a sensor alarm, not cargo
  release or product safety.
- `TH-1043`: only two of seven primary observations are present, separated by
  fifty minutes. A pending offset and an operator's confident note cannot fill
  the gap. Abstain and request missing observations.
- `TH-1044`: complete in-range primary observations and a confirmed zero offset
  provide a normal control within this observation window.

The JSON records contain no expected-outcome labels or precomputed verdicts.
Changing observations, calibration status, or event times must change downstream
analysis. Free-text incident details are source evidence, never executable agent
instructions. The source timestamp is intentionally different from the event
timestamp so provenance and ordering can be inspected.

## Publishing and Zetaris

The frontend build should copy exactly the four `*.json` feeds to `public/data/`.
The canonical sources remain here. The Zetaris runner verifies public JSON
content against these local fixtures before creating objects. See
[`../sql/README.md`](../sql/README.md) for setup and evidence capture.

All fixture contents are original project work covered by the repository's MIT
licence. Sponsor guides are referenced, not redistributed here.

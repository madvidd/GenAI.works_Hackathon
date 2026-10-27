# Structured sample inputs and generated outputs

[Project overview](../README.md) · [Getting started](../docs/getting-started.md) · [Evidence guide](../docs/evidence-guide.md)

Use this directory to inspect reproducible inputs and real generated results. It contains credential-free sample runs and separately labeled actual service receipts. The application does not replay these dossiers as answers.

## Choose the evidence you need

| Folder | Contents | Scope |
| --- | --- | --- |
| `inputs/` and `TH-1041`…`TH-1044` | Structured sample requests and matching generated artifacts | Local calculation and actual World Model activity; zero model/SQL calls |
| [`live-zetaris/`](live-zetaris/) | Actual setup, USL/DQ and contract receipts | Real database execution, independently of model inference |
| [`live-agent/`](live-agent/) | Seven full attempts: six completed, one earlier timeout retained | Actual Nightshift, Zetaris and World Model execution; current 1.0.2 cases include TH-1042 and TH-1043 |
| [`live-nightshift-preflight/`](live-nightshift-preflight/) | Inference and schema probes | Transport and semantic behavior have separate outcomes |

## Run a sample

The four `TH-1041`…`TH-1044` archives were regenerated with `analysisVersion: 1.0.2`. Each contains actual World Model context consumption, resolved citations and zero Nightshift/Zetaris calls. The separate final 1.0.2 live archives are [`attempt-06-final-decimal`](live-agent/attempt-06-final-decimal/) and [`attempt-07-final-abstention`](live-agent/attempt-07-final-abstention/). Earlier attempts remain historical and were not relabeled as executions of the revised core. The [current live summary](../docs/live-revision-validation.json) explains the attempt denominator and its limits.

The four input JSON files are the options accepted by the exported
`runInvestigation` function in `server/agent.mjs`. They select a shipment and
sample mode; they do not contain expected answers. The function loads the four
canonical synthetic feeds from `data/`, runs the real Meterless World Model,
retrieves its graph context, and computes the result.

| Structured input | Matching generated output | Equivalent CLI |
| --- | --- | --- |
| [`inputs/TH-1041.json`](inputs/TH-1041.json) | [`TH-1041/dossier.json`](TH-1041/dossier.json) | `npm.cmd run agent:sample -- --shipment TH-1041` |
| [`inputs/TH-1042.json`](inputs/TH-1042.json) | [`TH-1042/dossier.json`](TH-1042/dossier.json) | `npm.cmd run agent:sample -- --shipment TH-1042` |
| [`inputs/TH-1043.json`](inputs/TH-1043.json) | [`TH-1043/dossier.json`](TH-1043/dossier.json) | `npm.cmd run agent:sample -- --shipment TH-1043` |
| [`inputs/TH-1044.json`](inputs/TH-1044.json) | [`TH-1044/dossier.json`](TH-1044/dossier.json) | `npm.cmd run agent:sample -- --shipment TH-1044` |

On macOS/Linux, use `npm`; on Windows, `npm.cmd` preserves forwarded option names. To pass an input file directly to the programmatic interface after installing dependencies:

```sh
node --import tsx --input-type=module -e "import {readFile} from 'node:fs/promises'; import {runInvestigation} from './server/agent.mjs'; await runInvestigation(JSON.parse(await readFile('examples/inputs/TH-1042.json','utf8')));"
```

Each output folder contains the actual generated dossier, run manifest, JSONL
trace, World Model events, and World Model audit. The manifest explicitly says
`mode: sample` and `liveExecuted: false`. These prove local computation and
engine activity, not Zetaris queries or Nightshift inference. Runtime code never
loads these dossiers as answers.

Fresh executions write new run IDs and timestamps under `logs/runs/`; those
fields are expected to differ. The outcome, source citations, and numerical
analysis depend on the supplied records. No credentials, model download, or
sponsor service is needed for sample mode.

For publication, only each archived trace's `completed.runFolder` field was
normalized from a private absolute checkout path to a repository-relative path.
Each folder's `archive-normalization.json` discloses that change and records
the resulting trace SHA-256. Measurements, outcomes and execution receipts
were retained. Fresh runs still write their actual local output path.

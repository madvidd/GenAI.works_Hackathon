# Structured sample inputs and generated outputs

The four input JSON files are the options accepted by the exported
`runInvestigation` function in `server/agent.mjs`. They select a shipment and
sample mode; they do not contain expected answers. The function loads the four
canonical synthetic feeds from `data/`, runs the real Meterless World Model,
retrieves its graph context, and computes the result.

| Structured input | Matching generated output | Equivalent CLI |
| --- | --- | --- |
| [`inputs/TH-1041.json`](inputs/TH-1041.json) | [`TH-1041/dossier.json`](TH-1041/dossier.json) | `npm run agent:sample -- --shipment TH-1041` |
| [`inputs/TH-1042.json`](inputs/TH-1042.json) | [`TH-1042/dossier.json`](TH-1042/dossier.json) | `npm run agent:sample -- --shipment TH-1042` |
| [`inputs/TH-1043.json`](inputs/TH-1043.json) | [`TH-1043/dossier.json`](TH-1043/dossier.json) | `npm run agent:sample -- --shipment TH-1043` |
| [`inputs/TH-1044.json`](inputs/TH-1044.json) | [`TH-1044/dossier.json`](TH-1044/dossier.json) | `npm run agent:sample -- --shipment TH-1044` |

To pass an input file directly to the programmatic interface after `npm ci`:

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

# Getting started

[Documentation](README.md) · [Architecture](architecture.md) · [Example inputs](../examples/README.md)

Choose the sample for a credential-free demonstration. Choose the local live companion when you want actual Zetaris reads and Nightshift inference. Both use the same evidence calculations; only the programmatic paths use the official World Model.

## Requirements

| Path | Requirements |
| --- | --- |
| Published sample | A modern browser; no installation |
| Local sample UI/CLI | Node.js 22.11 or later, npm and this repository |
| Local live UI/CLI | The above, a configured Zetaris REST API, Nightshift Runtime, a serving local model and private service tokens |

The verified live model was `local-runtime/llama-3.2-1b-instruct`, using the Llama 3.2 1B Q4_K_M artifact. The weights are about 808 MB and the installed catalog estimates 2 GB RAM for the model; the entire Zetaris/application stack needs additional resources. These are model figures, not a promised minimum for the full system. Keep Nightshift’s normal memory and disk-admission checks enabled.

## Install and run the sample

From Windows PowerShell:

```powershell
git clone https://github.com/madvidd/GenAI.works_Hackathon.git
Set-Location GenAI.works_Hackathon
node --version
npm.cmd ci
npm.cmd run dev
```

Open the Vite address printed in the terminal. Use `npm.cmd` on Windows, especially when forwarding options after `--`; the PowerShell `npm` wrapper was observed stripping forwarded option names in this environment. On macOS/Linux, use `npm`.

Generate a sample dossier in a separate terminal:

```powershell
npm.cmd run agent:sample -- --shipment TH-1042
```

The direct equivalent is:

```powershell
node --import tsx server/agent.mjs --mode sample --shipment TH-1042
```

Sample mode loads the four canonical files in `data/`, ingests them through the official World Model and computes a result. It needs no `.env.local`, model download or service credentials. It records `mode: sample`, `liveExecuted: false` and zero external model/SQL calls.

To execute a checked-in structured request:

```powershell
node --import tsx --input-type=module -e "import {readFile} from 'node:fs/promises'; import {runInvestigation} from './server/agent.mjs'; await runInvestigation(JSON.parse(await readFile('examples/inputs/TH-1042.json','utf8')));"
```

## Read the result

Each fresh run writes a unique folder under `logs/runs/` and emits structured trace events. Keep that run’s files together:

| File | Purpose |
| --- | --- |
| `dossier.json` | Outcome, calculations, evidence, contradictions, actions and limitations |
| `manifest.json` | Mode, run identity, budgets, model receipts and retrieval plan |
| `trace.jsonl` | Ordered execution events and decisions |
| `world-events.jsonl` | Actual World Model ingest/state events |
| `world-audit.jsonl` | Actual engine audit history |
| `zetaris-queries.jsonl` | Actual SQL request/response receipts, present for live runs |

Generated run IDs and timestamps will differ from the archived examples. The case outcome and calculations should follow the supplied records. Runtime code does not load archived dossiers as answers.

## Run the local live companion

### 1. Configure private service values

Create the local environment file only if it does not already exist:

```powershell
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
notepad .env.local
```

Enter your actual values. `.env.local` is ignored by Git.

| Variable | Meaning |
| --- | --- |
| `ZETARIS_BASE_URL` | API base ending in `/api/v1.0`; local example: `http://localhost:8888/api/v1.0` |
| `ZETARIS_API_KEY` | Private Zetaris bearer token |
| `ZETARIS_ORG_ID` | Actual numeric organization ID; verified local setup used `1` |
| `TRACEHARBOR_PUBLIC_ORIGIN` | HTTPS origin serving the four canonical `/data/*.json` feeds |
| `NIGHTSHIFT_BASE_URL` | Runtime endpoint; verified local example: `http://127.0.0.1:8088/v1` |
| `NIGHTSHIFT_API_KEY` | Private Nightshift Runtime token |
| `NIGHTSHIFT_MODEL` | Explicit routable model ID; verified route: `local-runtime/llama-3.2-1b-instruct` |

The Zetaris adapter also accepts `ZETARIS_REST_URL` as an alias. Remote service credentials require HTTPS. A container’s `localhost` addresses that container; use the documented reachable host address for your deployment. Never put tokens in frontend code, screenshots, source-controlled examples or public logs.

### 2. Set up actual Zetaris sources

Obtain a permitted Zetaris instance and follow the [official participant resources](https://hackathon.genai.works/dashboard). This repository’s setup script configures project data objects; it does not install the platform or accept its terms.

Review the plan first:

```powershell
node scripts/zetaris-setup.mjs --origin https://traceharbor.web.app
```

Use your own deployed origin when the local fixture contents differ from the published demo. The script compares the public feed content with your local files before any execution. After checking the instance and plan:

```powershell
node scripts/zetaris-setup.mjs --origin https://traceharbor.web.app --execute
```

This performs real source registration, exploration, USL activation and DQ execution. It stops on error and retains partial receipts; it does not delete or replace existing objects. For an already configured instance:

```powershell
node scripts/zetaris-setup.mjs --origin https://traceharbor.web.app --verify-only --execute
node --import tsx scripts/zetaris-verify.mjs
```

The second command performs read-only USL/World Model/outcome checks and makes no Nightshift call. Read [SQL setup](../sql/README.md) for statement boundaries, payloads and expected evidence.

### 3. Start a real Nightshift inference lane

In the verified Nightshift 1.2.7 installation, model discovery alone did not create a serving lane. The working UI path was **Night → Lanes & memory → Add lane → Extract structured data**, then the installed Llama 3.2 1B model, **4k context**, **one slot** and normal autostart.

Wait for the lane to report ready and use the actual model ID in `.env.local`. See the [installation evidence](local-model-setup.md) for the catalog artifact, SHA-256, model-license boundary and resource checks. A health response or listed model proves availability metadata, not a successful investigation.

### 4. Serve the built UI and local API

```powershell
npm.cmd run build
npm.cmd start
```

Open `http://127.0.0.1:8787`. The companion serves the built frontend and `POST /api/investigate` from one local origin. It binds to loopback, permits one active investigation and allows at most three live requests per ten minutes. It is not a public backend deployment.

Alternatively, run the live CLI:

```powershell
npm.cmd run agent:live -- --shipment TH-1042
```

The API request shape is:

```json
{"shipmentId":"TH-1042","mode":"live"}
```

Successful responses wrap the dossier as `{"result": ...}`. Actual live execution is bounded to three Nightshift calls, four unique USL reads and 300 seconds. Check the resulting manifest and receipts; a selected setting or a sample result is not proof that the services ran.

## Checks before sharing a change

```powershell
npm.cmd test
npm.cmd run build
```

`npm.cmd run check` composes those two stages. Exercise the UI, changed-input behavior, citations and export separately. Test at narrow widths and with keyboard navigation when changing presentation or interaction code.

After deploying the intended build, `node scripts/verify-deployment.mjs` makes unauthenticated requests and compares public HTML, JavaScript/CSS, four feeds and four submission artifacts with local build bytes. It writes `logs/deployment-verification.json`. It verifies deployment; it does not deploy or submit an entry.

## Common setup problems

| Symptom | Check |
| --- | --- |
| Forwarded CLI options disappear in PowerShell | Use `npm.cmd ... -- --shipment TH-1042` or the direct `node --import tsx` command |
| `local_runtime_not_ready` | A discovered GGUF is not a running lane; inspect Nightshift’s normal lane state |
| `low_live_memory` or `disk_full` | Free appropriate resources or select a supported storage location; preserve normal admission checks |
| SQL authentication/organization errors | Check the actual base URL, private token and numeric organization ID |
| Public-feed comparison fails | Publish the same canonical data as the local checkout, or select the matching origin |
| Object already exists after a partial setup | Inspect retained receipts and the instance; do not blindly rerun destructive substitutes |
| Live request times out or returns malformed decisions | Keep the failure, inspect phase receipts and resource availability; do not label a later sample as that live result |
| Live control is unavailable on the public website | Use the local companion where both services are reachable; Firebase Hosting serves the static sample |

The [evidence guide](evidence-guide.md) distinguishes the verified baseline from any new local attempt.

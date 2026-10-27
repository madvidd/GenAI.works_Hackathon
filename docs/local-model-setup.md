# Local Nightshift model setup evidence

[Documentation](README.md) · [Practical setup sequence](getting-started.md#run-the-local-live-companion) · [Actual run evidence](evidence-guide.md)

This is an installation and execution record. Actual local inference and a complete bounded investigation through Nightshift are verified. The selected path uses a local Llama model through Nightshift; no NVIDIA cloud or Nemotron usage is claimed.

## Verified artifact

The installed Nightshift 1.2.7 catalog identifies `local-runtime/llama-3.2-1b-instruct` and the artifact `Llama-3.2-1B-Instruct-Q4_K_M.gguf`. Its catalog estimate is 2 GB RAM. The model is marked as not supporting native tool calling; TraceHarbor requests structured JSON decisions rather than claiming native tool calls from this model.

The public [model artifact](https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/blob/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf) was downloaded from the exact catalog source. Verification on 2026-10-27 found:

| Property | Observed value |
|---|---|
| Bytes | 807,694,464 |
| File signature | `GGUF` |
| SHA-256 | `6f85a640a97cf2bf5b8e764087b1e83da0fdb51d7c9fab7d0fece9385611df83` |
| Destination | Configured local model folder; machine-specific paths remain private |
| Copy policy | New file only; no existing model overwritten |
| Destination verification | SHA-256 matches the downloaded artifact |

The weights are governed by the model's Llama 3.2 license, not the project's MIT license. They are not committed to this repository. See the [model repository and license metadata](https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF).

## Discovery is not inference

The shipped Nightshift source documents scanning its configured model folder, validating GGUF files and matching curated filenames to catalog entries. Copying the verified artifact supports normal model discovery. It does not create a running inference lane by itself.

The authenticated Runtime model endpoint returned HTTP 200 and included the selected catalog ID. Initially, the app and daemon were responding but there were zero inference lanes. A real explicit-model completion returned HTTP 503 with `local_runtime_not_ready`. Model discovery and the general Runtime Start control did not create a serving lane in this installation.

## Configure the local inference lane

The normal UI path used in Nightshift 1.2.7 was:

1. Open **Night** (`Ctrl+6`), then **Lanes & memory**.
2. Choose **Add lane**, then **Extract structured data**.
3. Select the installed **Llama 3.2 1B Instruct** GGUF.
4. Set context to **4k**, slots to **1**, and enable ordinary autostart.
5. Create the lane and use its normal **Start** action.

The resulting lane identifier is `llama-3-2-1b`, serving `Llama-3.2-1B-Instruct-Q4_K_M.gguf`. Normal memory admission initially refused startup: the UI reported a 1,990 MB requirement and 1,906 MB available. After temporarily pausing only this project's development services, the ordinary lane startup succeeded. The UI and daemon both reported a ready lane with 4k context and one slot. Memory guards remained enabled.

The default model volume also failed the downloader's free-space reserve. A second copy was verified on a volume with adequate space. No disk floor or memory guard was disabled, no force-start flag was used, and no undocumented lane configuration was written. The generic **Setup → Runtime → Restart runtime** advice was insufficient on its own; an explicit lane was necessary.

## Completion criteria

The [sanitized actual preflight receipt](../examples/live-nightshift-preflight/receipt.json) records an authenticated HTTP 200 completion at 2026-10-27T19:26:20Z. Requested and returned model identifiers were both `local-runtime/llama-3.2-1b-instruct`; the request took 2,493 ms and used 43 prompt tokens plus two completion tokens.

The probe asked for `CONNECTED`, but the model replied `No`. This proves real transport and inference, **not** correct instruction following. The receipt preserves that failure.

The subsequent [complete live investigation](../examples/live-agent/attempt-02/manifest.json) used strict JSON-schema contracts for planner, critic and synthesis. It completed in 142.323 seconds with three actual Nightshift calls, four actual Zetaris reads and 46 records consumed through the official World Model. The critic retrieved incidents and calibration: the provisional insufficient-evidence result became sensor bias, while withholding calibration returned it to insufficient evidence. The [validation receipt](live-agent-validation.json) verifies the result and citations. This one synthetic scenario is evidence of working integration, not a general reliability benchmark. The earlier timeout attempt and failed simple probe remain archived.

If context length is configurable, the initial agent request needs room for both its evidence prompt and output budget; 4096 tokens is the current setup target. Keep ordinary runtime admission checks enabled. A rejected request or invalid model response must remain an explicit failure, without substitution of a sample result.

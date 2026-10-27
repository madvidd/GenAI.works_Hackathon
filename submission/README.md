# Submission artifacts

`traceharbor.pptx` is an editable eight-slide presentation, and `traceharbor.pdf` is its PDF export. Speaker notes identify evidence and limitations. Screenshots are real deployed application captures from `docs/images/`.

The final exports include the verified 16-test result and actual Nightshift, Zetaris and World Model execution. The deck was built with `TRACEHARBOR_LIVE_MANIFEST=examples/live-agent/attempt-03-browser/manifest.json`, matching the video’s live screenshots. The source validates the manifest’s three model phases, sponsor flags, bounded query count and matching dossier. The source uses `@oai/artifact-tool`, the presentation helper/validation modules, and Arial. These authoring tools are not application runtime dependencies.

To rebuild, provide absolute paths through `ARTIFACT_TOOL_MODULE`, `PRESENTATION_HELPERS_MODULE`, `PRESENTATION_PYTHON`, `PRESENTATION_INTEGRITY_VALIDATOR`, `PRESENTATION_LAYOUT_VALIDATOR`, and `RUNTIME_NODE_MODULES`, then run `node submission/build-deck.mjs`. Set `TRACEHARBOR_LIVE_MANIFEST` explicitly; omitting it deliberately prevents a complete live-run claim. `DECK_BUILD_DIR` selects private intermediates and `DECK_OUTPUT_DIR` optionally stages reviewed candidates outside the canonical submission folder. Keep an existing final deck as a prior revision before rebuilding, because the finalizer refuses to silently overwrite one. Inspect all eight PNG previews and the exported PDF before publishing. Windows may require permission for the finalizer's atomic hard-link promotion inside the output folder.

The PowerPoint retains native editable text and two tables. The PDF is a faithful image export of all eight actual slide renders: the bundled Windows PDF exporter lacked its Helvetica module, so `export-preview-pdf.py` packages those renders without redrawing them. All eight exported PDF pages were rendered with Poppler and visually checked. Native Microsoft PowerPoint rendering has not been tested.

Narration and submission preparation: [demo script](../docs/demo-script.md), [eight-slide source](../docs/slide-deck.md), [submission checklist](../docs/submission-checklist.md). A deck is not a recorded demo video or a submitted entry.

## Reproducible screen demonstration

The final [MP4 demonstration](traceharbor-demo.mp4) is 188.71 seconds, 1920×1080, with stereo AAC narration and embedded English captions. [Standalone captions](traceharbor-demo.srt) and a [validation receipt](demo-validation.json) accompany it. All nine layouts and nine encoded end-of-scene frames were visually inspected; the complete audio/video decoded without errors. Uninterrupted human audiovisual playback remains pending. The video presents four synthetic sample cases and the actual browser investigation archived at [attempt-03-browser](../examples/live-agent/attempt-03-browser/manifest.json): three Nightshift calls, four Zetaris reads and 46 World Model records. The public site remains explicitly sample mode.

`demo-scenes.json` contains the narration, actual screenshot paths, editorial crop coordinates and disclosure for a roughly three-minute demonstration. `build-demo.ps1` uses the installed Windows offline Microsoft Zira Desktop voice. It does not clone a person or contact a speech service. `render-demo.py` uses installed FFmpeg/FFprobe to compose the real screenshots, add gentle vertical framing, and embed English captions. The screenshots are edited presentation material; the video does not claim to be an uninterrupted recording of model execution.

On Windows with Python, FFmpeg and FFprobe installed:

```powershell
.\submission\build-demo.ps1 -PythonPath python -FfmpegPath ffmpeg -FfprobePath ffprobe
```

Use `-AudioOnly` to regenerate narration without encoding. Run `python submission/render-demo.py --frames-only` to inspect all nine scene layouts first. All generated WAV files, clips, caption intermediates and the candidate MP4 stay in ignored `.tools/demo-build/`. The renderer refuses missing screenshots and validates 1920×1080 video, an audio track and a duration between one and four minutes. Its receipt records source-image hashes and clearly leaves human playback review pending. Publish a final MP4 only after checking the complete video, audio, captions and current integration claims. Rebuild any scene whose screenshot or verification status changes.

## Final evidence preparation

Run `node submission/prepare-final-artifacts.mjs` for a lightweight private draft; this command neither renders nor overwrites canonical artifacts. Supply `--manifest` with the repository-relative actual manifest path, `--live-image` with a reviewed result screenshot, and `--live-reasoning-image` with the matching critic/retrieval screenshot. The draft updates the test count and execution scenes only when the manifest and its dossier pass the evidence checks. A sample manifest is rejected. Review the editorial crops against the actual screenshot dimensions; the preparer does not invent application states.

Review `.tools/submission-finalization/demo-scenes.draft.json`, then deliberately apply it as the canonical scene source before rebuilding narration and video. After checking the export, run `node submission/sync-demo-script.mjs` to synchronize the narration document with the actual receipt. Set `TRACEHARBOR_LIVE_MANIFEST` to the same archived manifest when rebuilding the deck. The final MP4/PDF/PPTX/SRT remain canonical under `submission/`; `npm run build` copies only those four public files to `dist/submission/`. Building those copies does not publish them. Add their direct public URLs to metadata only after deployment and independent access/hash verification.

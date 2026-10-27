# Demo and presentation artifacts

[Project overview](../README.md) · [Documentation](../docs/README.md) · [Submission checklist](../docs/submission-checklist.md)

## Reviewed assets

| Artifact | Use | Local source / verification |
| --- | --- | --- |
| [Narrated MP4](https://traceharbor.web.app/submission/traceharbor-demo.mp4) | 3:08 walkthrough of four sample cases and actual live evidence | [Video](traceharbor-demo.mp4) · [Receipt](demo-validation.json) |
| [PDF deck](https://traceharbor.web.app/submission/traceharbor.pdf) | Readable eight-slide presentation | [PDF](traceharbor.pdf) · [Receipt](validation.json) |
| [PowerPoint](https://traceharbor.web.app/submission/traceharbor.pptx) | Editable slide text, native tables and speaker notes | [PPTX](traceharbor.pptx) · [Authoring source](build-deck.mjs) |
| [English captions](https://traceharbor.web.app/submission/traceharbor-demo.srt) | Standalone subtitles for the narrated video | [SRT](traceharbor-demo.srt) · [Narration source](demo-scenes.json) |

These are the refreshed, locally reviewed artifacts for the redesigned interface and analysis version 1.0.2. Their live scenes match the final TH-1042 investigation in `examples/live-agent/attempt-06-final-decimal/manifest.json`. The [official entry is confirmed submitted](../docs/submission-confirmation.md). The [persisted form record](hackos-entry.json) retains its description, sponsor explanation and final links, including the [HackOS-hosted video](https://iframe.mediadelivery.net/embed/778121/21475ca2-f757-48b6-8ebd-e7f5e2275fb8) and public PDF deck. The Firebase MP4 remains the downloadable canonical copy.

Public delivery paths: [demo video](https://traceharbor.web.app/submission/traceharbor-demo.mp4), [PDF deck](https://traceharbor.web.app/submission/traceharbor.pdf), [editable PowerPoint](https://traceharbor.web.app/submission/traceharbor.pptx), and [captions](https://traceharbor.web.app/submission/traceharbor-demo.srt). All four refreshed files returned HTTP 200 and matched the reviewed hashes in the [final deployment receipt](../docs/deployment-redesign-validation.json). The [release explanation](../docs/release-validation.md) identifies source/artifact commit `1c71b1c`; the [historical deployment receipt](../docs/deployment-validation.json) remains scoped to the earlier baseline.

`traceharbor.pptx` is an editable eight-slide presentation, and `traceharbor.pdf` is its PDF export. Speaker notes identify evidence and limitations. Screenshots are actual application captures from `docs/images/`; local live-run views are explicitly identified.

The refreshed exports include actual Nightshift, Zetaris and World Model execution. Visible text says “Regression suite passes”; the receipts retain the exact final count of 33 tests. The deck was built with `TRACEHARBOR_LIVE_MANIFEST=examples/live-agent/attempt-06-final-decimal/manifest.json`, matching the video’s live screenshots. The source validates the manifest’s three model phases, sponsor flags, bounded query count and matching dossier. Later test runs do not retroactively change that recorded narration.

## Rebuild the deck

The source uses `@oai/artifact-tool`, the presentation helper/validation modules, and Arial. These authoring tools are not application runtime dependencies.

To rebuild, provide absolute paths through `ARTIFACT_TOOL_MODULE`, `PRESENTATION_HELPERS_MODULE`, `PRESENTATION_PYTHON`, `PRESENTATION_INTEGRITY_VALIDATOR`, `PRESENTATION_LAYOUT_VALIDATOR`, and `RUNTIME_NODE_MODULES`, then run `node submission/build-deck.mjs`. Set `TRACEHARBOR_LIVE_MANIFEST` explicitly; omitting it deliberately prevents a complete live-run claim. `DECK_BUILD_DIR` selects private intermediates and `DECK_OUTPUT_DIR` optionally stages reviewed candidates outside the canonical submission folder. Keep an existing final deck as a prior revision before rebuilding, because the finalizer refuses to silently overwrite one. Inspect all eight PNG previews and the exported PDF before publishing. Windows may require permission for the finalizer's atomic hard-link promotion inside the output folder.

The PowerPoint retains native editable text and two tables. The PDF is a faithful image export of all eight actual slide renders: the bundled Windows PDF exporter lacked its Helvetica module, so `export-preview-pdf.py` packages those renders without redrawing them. All eight exported PDF pages were rendered with Poppler and visually checked. Native Microsoft PowerPoint rendering has not been tested.

Narration and submission preparation: [demo script](../docs/demo-script.md), [eight-slide source](../docs/slide-deck.md), [submission checklist](../docs/submission-checklist.md). A deck is not a recorded demo video or a submitted entry.

## Reproducible screen demonstration

The final [MP4 demonstration](traceharbor-demo.mp4) is 188.48 seconds, 1920×1080, with stereo AAC narration and embedded English captions. [Standalone captions](traceharbor-demo.srt) and a [validation receipt](demo-validation.json) accompany it. All nine layouts and nine encoded end-of-scene frames were visually inspected; the complete audio/video decoded without errors. Public browser playback passed a smoke check without a media error; uninterrupted human audiovisual playback remains unverified. The video presents four synthetic sample cases and the actual browser investigation archived at [attempt-06-final-decimal](../examples/live-agent/attempt-06-final-decimal/manifest.json): three Nightshift calls, four Zetaris reads and 46 World Model records. The public site remains explicitly sample mode.

`demo-scenes.json` contains the narration, actual screenshot paths, editorial crop coordinates and disclosure for a roughly three-minute demonstration. `build-demo.ps1` uses the installed Windows offline Microsoft Zira Desktop voice. It does not clone a person or contact a speech service. `render-demo.py` uses installed FFmpeg/FFprobe to compose the real screenshots, add gentle vertical framing, and embed English captions. The screenshots are edited presentation material; the video does not claim to be an uninterrupted recording of model execution.

On Windows with Python, FFmpeg and FFprobe installed:

```powershell
.\submission\build-demo.ps1 -PythonPath python -FfmpegPath ffmpeg -FfprobePath ffprobe
```

Use `-AudioOnly` to regenerate narration without encoding. Run `python submission/render-demo.py --frames-only` to inspect all nine scene layouts first. All generated WAV files, clips, caption intermediates and the candidate MP4 stay in ignored `.tools/demo-build/`. The renderer refuses missing screenshots and validates 1920×1080 video, an audio track and a duration between one and four minutes. Its receipt records source-image hashes and clearly leaves human playback review pending. Publish a final MP4 only after checking the complete video, audio, captions and current integration claims. Rebuild any scene whose screenshot or verification status changes.

## Final evidence preparation

Run the preparer with explicit evidence and matching captures; it writes a private draft and does not render or overwrite canonical artifacts:

```powershell
node submission/prepare-final-artifacts.mjs --manifest examples/live-agent/attempt-06-final-decimal/manifest.json --live-image docs/images/final-live-investigation.png --live-reasoning-image docs/images/final-live-reasoning-detail.png
```

The draft updates the test count and execution scenes only when the manifest and its dossier pass the evidence checks. A sample manifest is rejected. Review editorial crops against the actual screenshot dimensions; the preparer does not invent application states. For a newer recording, select that run’s manifest and its own actual captures together.

Review `.tools/submission-finalization/demo-scenes.draft.json`, then deliberately apply it as the canonical scene source before rebuilding narration and video. After checking the export, run `node submission/sync-demo-script.mjs` to synchronize the narration document with the actual receipt. Set `TRACEHARBOR_LIVE_MANIFEST` to the same archived manifest when rebuilding the deck. The final MP4/PDF/PPTX/SRT remain canonical under `submission/`; `npm run build` copies only those four public files to `dist/submission/`. Building those copies does not publish them. Add their direct public URLs to metadata only after deployment and independent access/hash verification.

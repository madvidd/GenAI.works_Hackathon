# Submission artifacts

`traceharbor.pptx` is an editable eight-slide presentation, and `traceharbor.pdf` is its PDF export. Speaker notes identify evidence and limitations. Screenshots are real deployed application captures from `docs/images/`.

The deck does not claim successful sponsor execution until the corresponding fields in `metadata.json` have verified receipts. Rebuild it after updating those facts. The source uses `@oai/artifact-tool`, the presentation helper/validation modules, and Arial. These authoring tools are not application runtime dependencies.

To rebuild, provide absolute paths through `ARTIFACT_TOOL_MODULE`, `PRESENTATION_HELPERS_MODULE`, `PRESENTATION_PYTHON`, `PRESENTATION_INTEGRITY_VALIDATOR`, `PRESENTATION_LAYOUT_VALIDATOR`, and `RUNTIME_NODE_MODULES`, then run `node submission/build-deck.mjs`. `DECK_BUILD_DIR` optionally selects a private build directory. Keep an existing final deck as a prior revision before rebuilding, because the finalizer refuses to silently overwrite one. Inspect all eight PNG previews and the exported PDF before publishing. Windows may require permission for the finalizer's atomic hard-link promotion inside the output folder.

The PowerPoint retains native editable text and two tables. The PDF is a faithful image export of all eight actual slide renders: the bundled Windows PDF exporter lacked its Helvetica module, so `export-preview-pdf.py` packages those renders without redrawing them. All eight exported PDF pages were rendered with Poppler and visually checked. Native Microsoft PowerPoint rendering has not been tested.

Narration and submission preparation: [demo script](../docs/demo-script.md), [eight-slide source](../docs/slide-deck.md), [submission checklist](../docs/submission-checklist.md). A deck is not a recorded demo video or a submitted entry.

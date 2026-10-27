import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readArtifactContext} from './artifact-context.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scenes=JSON.parse(await fs.readFile(path.join(repo,'submission/demo-scenes.json'),'utf8'));
const receipt=JSON.parse(await fs.readFile(path.join(repo,'submission/demo-validation.json'),'utf8'));
const context=await readArtifactContext(repo,scenes.verification_snapshot?.live_manifest);
if(!context.liveVerified||receipt.scenes.length!==scenes.scenes.length
  ||receipt.scenes.some((scene,i)=>scene.narration!==scenes.scenes[i].narration)) {
  throw new Error('Narration source, actual export receipt and live evidence must agree.');
}
const stamp=seconds=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
let elapsed=0;
const rows=receipt.scenes.map((scene,i)=>{
  const start=elapsed;elapsed+=scene.scene_duration_seconds;
  return `| ${stamp(start)}–${stamp(elapsed)} | ${scenes.scenes[i].title} | ${scene.narration} |`;
});
const content=`# TraceHarbor demo narration

The final [MP4 demonstration](../submission/traceharbor-demo.mp4) is ${receipt.duration_seconds.toFixed(2)} seconds, 1920×1080, with stereo AAC narration and embedded English captions. The exact narration, screenshot paths and editorial framing are in [demo-scenes.json](../submission/demo-scenes.json); [standalone captions](../submission/traceharbor-demo.srt) and a [validation receipt](../submission/demo-validation.json) accompany it.

This is an edited screen demonstration using actual application captures, synthetic shipment data and a disclosed offline Windows synthetic narrator. It shows four sample cases and actual local execution evidence. It does not claim to be an uninterrupted recording of model execution. The public website remains an explicit deterministic sample; the local companion performed the live investigation.

The live scenes match [the archived browser run](../${context.manifestReference}): three actual Nightshift calls, four actual Zetaris reads and 46 records consumed through the official World Model. The critic retrieved incidents and calibration, changing insufficient evidence to sensor bias; withholding calibration restored insufficient evidence. The selected model was local Llama 3.2 1B. No NVIDIA cloud use, measured commercial savings or cargo-release authority is claimed.

## Exported narration

| Approximate time | Screen and purpose | Narration |
| --- | --- | --- |
${rows.join('\n')}

## Reproduction and review

Run \`node submission/prepare-final-artifacts.mjs --manifest ${context.manifestReference} --live-image docs/images/live-investigation.png --live-reasoning-image docs/images/live-reasoning.png\` to prepare a private evidence-checked draft. Review its narration and actual-image crops before replacing the canonical scene source. A sample manifest or mismatched dossier is rejected. Rebuild narration/video with \`submission/build-demo.ps1\`, inspect the actual output, then run \`node submission/sync-demo-script.mjs\` to synchronize this document with its export receipt.

All nine layouts and nine end-of-scene encoded frames were visually inspected. All video and audio decoded without errors, all nine narration segments contain non-silent audio, and the English caption stream is present. Uninterrupted human audiovisual playback remains pending and is not implied by automated decoding.

Keep the previous export privately until its replacement passes validation. Never substitute sample output for a failed live run. Preserve failed attempts, synthetic-data and narration disclosures, and the difference between mocked automated transports and actual execution receipts. Keep service tokens and unrelated private windows out of every capture.

The required duration is one to four minutes with audio. Verify public MP4/PDF/PPTX/SRT access before adding their URLs to metadata. A published artifact is not evidence that the official hackathon entry was submitted.
`;
await fs.writeFile(path.join(repo,'docs/demo-script.md'),content);
console.log(JSON.stringify({document:'docs/demo-script.md',duration:receipt.duration_seconds,scenes:rows.length,liveManifest:context.manifestReference}));

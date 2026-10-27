import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readArtifactContext} from './artifact-context.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = name => { const i=args.indexOf(name); return i<0 ? undefined : args[i+1]; };
const context = await readArtifactContext(repo, option('--manifest'));
const scenes = JSON.parse(await fs.readFile(path.join(repo,'submission/demo-scenes.json'),'utf8'));
const evaluation = scenes.scenes.find(scene => scene.id === '08-control');
evaluation.narration = `The fourth case is a normal control: the available observations remain within the fixture's stated range. Different records produce different conclusions. The regression suite passes, including a critic that retrieves missing calibration and changes an unresolved result into a supported explanation. Automated orchestration tests use mocked network transports; actual execution has separate receipts.`;
evaluation.callout = `The control stays in range.\nThe regression suite passes.\nTest transports are mocked.\nLive receipts are separate.`;
const status = scenes.scenes.find(scene => scene.id === '09-status');
if (context.liveVerified) {
  scenes.mode='sample-cases-and-verified-live-execution';
  scenes.scenes.find(scene => scene.id === '01-introduction').narration='This is TraceHarbor, built by Vengers for The Agent That Can Explain Why. This edited demonstration uses actual application captures, synthetic shipment records, and a synthetic narrator. We will inspect four working cases, then the receipts from a real local agent investigation.';
  const image = option('--live-image');
  if (!image) throw new Error('A verified live run requires an actual live-evidence screenshot via --live-image.');
  const imagePath=path.resolve(repo,image);const relative=path.relative(repo,imagePath);
  if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error('Use a reviewed screenshot inside the repository.');
  await fs.access(imagePath);
  status.image=relative.replaceAll('\\','/');delete status.crop;delete status.pan_to_y;
  status.narration=`A complete investigation now has three actual Nightshift model calls, ${context.live.budget.sqlQueries} Zetaris reads, and ${context.live.contextTrace.selectedCount} records consumed from the official World Model. The local Llama model uses structured decisions. The public website remains a clearly labeled synthetic sample. Reproducible source and execution receipts are on GitHub. Our next validation is a real operations user study.`;
  status.callout=`Three actual model calls.\n${context.live.budget.sqlQueries} governed SQL reads.\nArchived engine context.\nPublic site remains sample mode.`;
  status.label='VERIFIED PROGRAMMATIC RUN';
  const reasoningImage=option('--live-reasoning-image');
  if (reasoningImage) {
    const absolute=path.resolve(repo,reasoningImage);const relative=path.relative(repo,absolute);
    if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error('Use a reviewed reasoning screenshot inside the repository.');
    await fs.access(absolute);
    const plan=context.live.retrievalPlan;
    const counterfactual=context.dossier.counterfactual;
    if (plan.provisionalOutcome!=='insufficient_evidence'||plan.finalOutcome!=='sensor_bias'
      ||!plan.criticSources.includes('calibration')||!plan.criticSources.includes('incidents')
      ||counterfactual?.intervention?.ignoreCalibration!==true||counterfactual.rerunOutcome!=='insufficient_evidence') {
      throw new Error('This narration requires the archived calibration retrieval and withholding behavior.');
    }
    const reasoning=scenes.scenes.find(scene=>scene.id==='07-reasoning');
    reasoning.image=relative.replaceAll('\\','/');delete reasoning.crop;delete reasoning.pan_to_y;
    reasoning.label='ACTUAL LIVE AGENT / CRITIC RETRIEVAL';
    reasoning.headline='The critic changes\nwhat the agent\ncan explain.';
    reasoning.callout='Missing evidence: abstain.\nRetrieve calibration: sensor bias.\nWithhold it again: abstain.';
    reasoning.narration='Here is the actual live agent investigation. The initial manifest and telemetry leave the result unresolved. The critic chooses to retrieve incidents and calibration through Zetaris. The agent then explains the sensor bias. Its calibration-withholding check returns to insufficient evidence. These model decisions change the available evidence and the computed conclusion.';
  }
} else {
  status.narration='Actual Zetaris source, semantic layer, and data quality execution is archived. A local Nightshift preflight returned a response, but failed its simple instruction-following check. The complete combined agent run is still pending. The public sample and reproducible source are available at trace harbor dot web dot app. These limits remain explicit.';
  status.callout='Zetaris execution verified.\nLocal inference responded.\nFull-agent validation pending.\nThe probe did not follow its task.';
}
scenes.verification_snapshot={tests:context.tests,live_manifest:context.manifestReference,live_verified:context.liveVerified,returned_models:context.returnedModels};
const out=path.join(repo,'.tools/submission-finalization');await fs.mkdir(out,{recursive:true});
await fs.writeFile(path.join(out,'demo-scenes.draft.json'),JSON.stringify(scenes,null,2)+'\n');
await fs.writeFile(path.join(out,'artifact-context.json'),JSON.stringify({tests:context.tests,liveVerified:context.liveVerified,manifestReference:context.manifestReference,returnedModels:context.returnedModels},null,2)+'\n');
console.log(JSON.stringify({draft:'.tools/submission-finalization/demo-scenes.draft.json',tests:context.tests,liveVerified:context.liveVerified,canonicalArtifactsChanged:false,rendered:false}));

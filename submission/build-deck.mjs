// Rebuild with the bundled @oai/artifact-tool runtime; see submission/README.md.
// Project screenshots are real captures. No synthetic sponsor receipts are used.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = process.env.ARTIFACT_TOOL_MODULE;
const helpers = process.env.PRESENTATION_HELPERS_MODULE;
if (!runtime || !helpers) throw new Error('Set ARTIFACT_TOOL_MODULE and PRESENTATION_HELPERS_MODULE to installed module paths.');
const { Presentation, PresentationFile } = await import(pathToFileURL(runtime));
const { resolvePresentationFont, finalizePresentation } = await import(pathToFileURL(helpers));
const font = resolvePresentationFont({ fontFamily: 'Arial' });
const build = path.resolve(process.env.DECK_BUILD_DIR || path.join(repo, '..', 'tmp', 'traceharbor-deck'));
await fs.mkdir(build, { recursive: true });
const pres = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const c = { navy:'#193442', ink:'#193442', gray:'#64747c', light:'#f5f7f8', white:'#ffffff', lime:'#c8eb9c', green:'#3b6c5c', line:'#dbe2e5', amber:'#8b623e' };
const metadata = JSON.parse(await fs.readFile(path.join(repo, 'metadata.json'), 'utf8'));
const verified = metadata.verification;
function text(s, value, x, y, w, h, size=26, color=c.ink, bold=false) {
  const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
  a.text=value; a.text.style={fontFamily:font,typeface:font,fontSize:size,color,bold,verticalAlignment:'middle',wrap:true}; return a;
}
function slide(kicker,title,dark=false) {
  const s=pres.slides.add(); s.background.fill=dark?c.navy:c.white;
  const ink=dark?c.white:c.ink;
  text(s,kicker.toUpperCase(),64,40,1110,30,18,dark?c.lime:c.green,true);
  text(s,title,64,95,1136,105,44,ink,true);
  text(s,'TRACEHARBOR  /  OPEN AGENT HACKATHON 2026',64,670,1050,20,13,dark?'#afc0c7':c.gray);
  text(s,String(pres.slides.items.length),1180,665,35,30,16,dark?'#afc0c7':c.gray);
  return s;
}
function table(s, values, top, widths, rowHeight=72) {
  const t=s.tables.add({rows:values.length,columns:values[0].length,left:64,top,width:1152,height:values.length*rowHeight,columnWidths:widths,values});
  t.borders.assign({fill:c.line,width:1,style:'solid'});
  for(let r=0;r<values.length;r++){
    t.rows[r].height=rowHeight;
    for(let col=0;col<values[0].length;col++){
      const cell=t.getCell(r,col);cell.fill=r===0?c.navy:(r%2?c.light:c.white);
      cell.text.style={typeface:font,fontFamily:font,fontSize:r===0?22:23,bold:r===0,color:r===0?c.white:c.ink};
    }
  }
  return t;
}
function note(s, body, sources) {s.speakerNotes.text=body+'\n\nEvidence and sources:\n'+sources.join('\n');}
async function screenshot(s,name,position,crop,alt) {s.images.add({blob:new Uint8Array(await fs.readFile(path.join(repo,'docs','images',name))),contentType:'image/png',position,fit:'contain',crop,alt});}

// 1. Problem and intended user: a typographic cover, with no decorative diagram.
{
  const s=slide('Track 2 Â· The Agent That Can Explain Why','TraceHarbor',true);
  text(s,'One shipment.\nFour conflicting stories.',64,230,1020,165,64,c.white,true);
  text(s,'An operations analyst needs a defensible explanation\nfor a disputed cold-chain temperature exception.',68,435,1060,88,29,'#d2dce0');
  text(s,'MANIFEST  Â·  TELEMETRY  Â·  INCIDENTS  Â·  CALIBRATION',68,574,1110,35,22,c.lime,true);
  note(s,'TraceHarbor is a focused prototype for an operations analyst investigating a disputed temperature alarm. The supplied records are synthetic. The problem and proposed value are a hypothesis; no customer study or measured savings is claimed.', ['https://traceharbor.web.app','https://github.com/madvidd/GenAI.works_Hackathon/blob/main/data/README.md']);
}
// 2. Solution: actual deployed UI, cropped natively to the investigation area.
{
  const s=slide('Solution','A dossier the operator can inspect');
  text(s,'Findings cite the records.\nConflicts stay visible.\nMissing evidence stays missing.',64,238,350,180,29,c.ink,true);
  text(s,'The next action belongs\nto the human operator.',64,466,340,90,26,c.gray);
  await screenshot(s,'traceharbor-desktop.png',{left:445,top:215,width:770,height:410},{left:0.207,top:0.15,right:0.016,bottom:0.60},'Actual deployed TraceHarbor sample investigation interface, cropped to the dossier.');
  note(s,'The screenshot is a real capture from the deployed website. The public site computes synthetic sample results locally. It is not evidence that local Zetaris or Nightshift services executed. The interface presents source-backed findings and preserves contradictory operational claims. It never approves cargo release.', ['https://traceharbor.web.app','docs/images/traceharbor-desktop.png','core/investigator.mjs']);
}
// 3. Agent architecture: deliberately clear about implementation versus execution.
{
  const s=slide('Agent workflow','The critic has a concrete job');
  const rows=[['01','Plan retrieval','Choose the evidence needed for the question.'],['02','Read and reconcile','Query governed sources; build World Model context.'],['03','Challenge the answer','Request missing evidence; withhold a key assumption.'],['04','Recompute and explain','Return supported findings, citations and next actions.']];
  rows.forEach((r,i)=>{const y=219+i*91;text(s,r[0],64,y,62,48,34,c.green,true);text(s,r[1],150,y,365,48,28,c.ink,true);text(s,r[2],535,y,665,66,25,c.gray);});
  text(s,'BOUNDED LIVE PATH: 3 MODEL CALLS Â· 4 UNIQUE SQL READS Â· 5 MINUTES',64,610,1140,30,21,c.green,true);
  note(s,'This slide describes the implemented live path, not a successful sponsor-model run. Planner and critic choices are restricted to allowlisted evidence operations. The deterministic core owns temperature arithmetic and verdicts. The live orchestrator must stop on transport errors and never silently fall back to the sample dataset. Verify the current implementation and corresponding tests before presenting.', ['server/agent.mjs','core/investigator.mjs','tests/runtime.test.mjs','docs/architecture.md']);
}
// 4. Technical stack and deployment boundary.
{
  const s=slide('Technical stack','Two ways to run the same evidence core');
  text(s,'PUBLIC SAMPLE',64,225,520,38,22,c.green,true);
  text(s,'React + Vite\nFirebase Hosting\nSynthetic source records\nLocal deterministic computation',64,286,515,230,30,c.ink);
  text(s,'traceharbor.web.app',64,555,520,42,29,c.ink,true);
  text(s,'LOCAL LIVE COMPANION',670,225,550,38,22,c.green,true);
  text(s,'Node.js structured runner\nZetaris REST + semantic layer\nOfficial Meterless World Model\nNightshift model requests',670,286,550,230,30,c.ink);
  text(s,'Private service credentials stay server-side.',670,555,530,70,25,c.gray);
  note(s,'The website is deployed and independently verified with four feeds and the evidence-withholding interaction. The public frontend cannot access the builderâ€™s loopback services. The local companion serves the built frontend and a bounded same-origin investigation API. No service tokens are embedded in the frontend bundle.', ['https://traceharbor.web.app','server/http.mjs','server/agent.mjs','.env.example','firebase.json']);
}
// 5. Sponsor status: actual verified state, refreshed from metadata at rebuild.
{
  const s=slide('Sponsor technology','Receipts determine what we claim');
  table(s,[['Technology','Role','Verified state'],['Meterless World Model','Evidence state and provenance','Local feature test + 8/8 conformance'],['Zetaris','Four feeds, USL, data quality',verified.live_zetaris_run?'Live query execution verified':'Implementation present; execution pending'],['Meterless Nightshift','Primary live model route',verified.live_nightshift_run?'Actual model response verified':'Runtime reachable; provider needed'],['NVIDIA Nemotron','Optional model through Nightshift',verified.verified_nemotron_run?'Returned model identity verified':'No verified model request']],219,[300,365,487],75);
  text(s,'Codex assisted implementation. Cursor usage is not claimed.',64,620,1140,28,21,c.gray);
  note(s,'This status is deliberately evidence bounded. The official World Model is vendored at revision 1742dec56a66e58eef9dda2d2b865823758ca8cd with its Apache-2.0 license retained. Its upstream conformance runner passed eight of eight. At this build, Nightshift is installed and authenticated models discovery succeeds, but a real completion returns no_provider_configured. Update only after actual successful receipts exist. Network-mocked orchestration tests do not count as sponsor execution.', ['metadata.json','core/vendor/meterless-world-model/UPSTREAM.md','docs/sponsor-technology.md','https://github.com/Meterless/Meterless']);
}
// 6. Distinctive interaction: real deployed counterfactual capture.
{
  const s=slide('What is distinctive','Remove the evidence. Recompute the answer.');
  text(s,'TH-1042',64,229,380,35,22,c.green,true);
  text(s,'Calibration available',64,290,390,45,29,c.ink,true);
  text(s,'Sensor bias explains\nthe alarm.',64,345,385,90,30,c.green);
  text(s,'Calibration withheld',64,465,390,45,29,c.ink,true);
  text(s,'Abstain: evidence\nis incomplete.',64,520,385,90,30,c.amber);
  await screenshot(s,'calibration-counterfactual.png',{left:485,top:220,width:730,height:405},{left:0.44,top:0.37,right:0.03,bottom:0.35},'Actual deployed What if experiment: withholding calibration changes TH-1042 from sensor bias to abstention.');
  note(s,'The actual browser experiment was verified after deployment. This is evidence sensitivity, not proof of experimental causality. The original full source record remains available. In the synthetic dataset a valid +4.5 degree sensor offset and independently calibrated reference readings support the bias explanation. Removing calibration prevents that explanation from being accepted.', ['https://traceharbor.web.app','docs/images/calibration-counterfactual.png','core/investigator.mjs','data/calibration.json','tests/investigator.test.mjs']);
}
// 7. Native editable table, with functional outcomes rather than invented KPIs.
{
  const s=slide('Product and evaluation','Different records produce different conclusions');
  table(s,[['Synthetic case','What the evidence tests','Computed result'],['TH-1041','Calibrated peaks + conflicting claims','Observed excursion'],['TH-1042','Valid offset + agreeing reference','Sensor bias'],['TH-1043','Missing observations + uncertain calibration','Insufficient evidence'],['TH-1044','Complete bounded observations','Within observed range']],215,[235,570,347],72);
  text(s,`${verified.local_test_count_passed} local tests passed`,64,602,475,42,29,c.green,true);
  text(s,'8 / 8 upstream engine checks passed',565,602,650,42,29,c.green,true);
  note(s,'These are synthetic functional scenarios, not a clinical or commercial benchmark. Tests cover changed inputs, invalid samples, expired or conflicting calibration, source provenance and abstention. Official World Model conformance covers identity, merge boundaries, provenance rejection, change detection, bitemporal relationships and audit behavior. Orchestration transports in automated tests are mocked. The public website and local sample runs were separately exercised.', ['tests/investigator.test.mjs','tests/runtime.test.mjs','logs/runs','metadata.json']);
}
// 8. Closing with usable links and a practical next experiment.
{
  const s=slide('Next steps and limits','Make the explanation useful in real operations',true);
  text(s,'01  Finish live integration receipts\n02  Validate with an operations analyst\n03  Time a fair manual-versus-assisted study',64,236,1150,200,33,c.white,true);
  text(s,'Synthetic evidence today. No measured savings,\ncausal proof, release approval or safety certification.',64,474,1120,90,27,'#d2dce0');
  text(s,'traceharbor.web.app',64,587,590,42,30,c.lime,true);
  text(s,'github.com/madvidd/GenAI.works_Hackathon',64,630,1120,30,22,c.lime);
  note(s,'The next validation is a repeatable comparison on the same case files, with identical questions and scoring, separating one-time setup from investigation time and reporting errors as well as time. Any savings estimates elsewhere in the submission are explicitly unmeasured assumptions. A human remains responsible for operational decisions. No claim of guaranteed competition success is made.', ['https://traceharbor.web.app','https://github.com/madvidd/GenAI.works_Hackathon','docs/zetaris-reflections.md','docs/requirements-matrix.md']);
}

for (let i=0;i<pres.slides.items.length;i++) {
  const png=await pres.export({slide:pres.slides.items[i],format:'png',scale:1});
  await fs.writeFile(path.join(build,`slide-${i+1}.png`),new Uint8Array(await png.arrayBuffer()));
}
const candidate=path.join(build,'traceharbor-candidate.pptx');
await (await PresentationFile.exportPptx(pres)).save(candidate);
// The current Windows artifact runtime's PDF export has a missing Helvetica
// module. Preserve the reviewed rendered slide pixels in a PDF if it occurs.
try {
  const pdf=await pres.export({format:'pdf'});
  await fs.writeFile(path.join(build,'traceharbor.pdf'),new Uint8Array(await pdf.arrayBuffer()));
} catch (error) {
  if (!String(error.message).includes('#standard-fonts/Helvetica')) throw error;
  execFileSync(process.env.PRESENTATION_PYTHON,[path.join(repo,'submission','export-preview-pdf.py'),build],{stdio:'inherit'});
}
const final=path.join(repo,'submission','traceharbor.pptx');
await finalizePresentation({workspaceDir:path.dirname(repo),candidatePath:candidate,finalPath:final,pythonExecutable:process.env.PRESENTATION_PYTHON,integrityValidatorPath:process.env.PRESENTATION_INTEGRITY_VALIDATOR,layoutValidatorPath:process.env.PRESENTATION_LAYOUT_VALIDATOR,layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','5','--require-native-table-slide','7'],explicitTotalSlideCount:8,requiredNativeTableOwnerSlides:[5,7],fontPolicy:{basis:'design',families:[font]},verifyArtifactToolImport:true,receiptPath:path.join(build,'finalization-receipt.json')});
await fs.copyFile(path.join(build,'traceharbor.pdf'),path.join(repo,'submission','traceharbor.pdf'));
console.log(JSON.stringify({slides:8,pptx:final,pdf:path.join(repo,'submission','traceharbor.pdf'),previews:build}));

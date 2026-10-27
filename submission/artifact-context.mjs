import fs from 'node:fs/promises';
import path from 'node:path';

async function optionalJson(file) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

// A preflight response and a complete three-stage live investigation are
// different evidence. Final artifact authors must supply the actual manifest.
export async function readArtifactContext(repo, manifestPath = process.env.TRACEHARBOR_LIVE_MANIFEST) {
  const metadata = JSON.parse(await fs.readFile(path.join(repo, 'metadata.json'), 'utf8'));
  const preflight = await optionalJson(path.join(repo, 'examples/live-nightshift-preflight/receipt.json'));
  let live = null;
  let dossier = null;
  let manifestReference = null;
  if (manifestPath) {
    const absolute = path.resolve(repo, manifestPath);
    const relative = path.relative(repo, absolute);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Use an archived live manifest inside the repository.');
    live = JSON.parse(await fs.readFile(absolute, 'utf8'));
    const phases = new Set((live.modelReceipts || []).map(receipt => receipt.phase));
    if (live.mode !== 'live' || live.liveExecuted !== true
      || !live.sponsorRuntime?.zetaris || !live.sponsorRuntime?.nightshift || !live.sponsorRuntime?.meterlessWorldModel
      || live.budget?.modelCalls !== 3 || live.modelReceipts?.length !== 3
      || !['planner', 'critic', 'synthesis'].every(phase => phases.has(phase))
      || live.modelReceipts.some(receipt => !receipt.returnedModel || receipt.finishReason === 'length')
      || !(live.budget.sqlQueries >= 2 && live.budget.sqlQueries <= 4)) {
      throw new Error('The supplied manifest does not prove a completed bounded live investigation.');
    }
    manifestReference = relative.replaceAll('\\', '/');
    dossier = JSON.parse(await fs.readFile(path.join(path.dirname(absolute), 'dossier.json'), 'utf8'));
    if (dossier.runId !== live.runId || dossier.execution?.runId !== live.runId
      || dossier.execution?.liveExecuted !== true || dossier.outcome !== live.retrievalPlan?.finalOutcome) {
      throw new Error('The archived dossier does not match the live execution manifest.');
    }
  }
  const tests = metadata.verification.local_test_count_passed;
  if (!Number.isInteger(tests) || tests < 1) throw new Error('Verified local test count is missing.');
  return {
    metadata, tests, liveVerified: Boolean(live), live, dossier, manifestReference,
    zetarisVerified: metadata.verification.live_zetaris_run === true,
    nightshiftPreflightVerified: preflight?.http === 200 && Boolean(preflight.model),
    preflightInstructionFollowingPassed: preflight?.instruction_following_check_passed === true,
    returnedModels: [...new Set((live?.modelReceipts || []).map(receipt => receipt.returnedModel))],
  };
}

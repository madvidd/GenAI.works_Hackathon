import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { FEED_NAMES, investigateShipment } from '../core/investigator.mjs';
import { decodeFeed, loadFixtureFeeds } from '../server/agent.mjs';
import { buildWorldContext } from '../server/world-context.mjs';
import { feedQuery } from './zetaris-schema.mjs';
import { ZetarisClient, redact } from './zetaris-client.mjs';
import { loadLocalEnv } from './zetaris-setup.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const canonical = value => Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']' : value && typeof value === 'object' ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}' : JSON.stringify(value);
const ordered = rows => [...rows].sort((left, right) => left.row_id.localeCompare(right.row_id));

// Read-only integration verification: real Zetaris -> decoder -> official
// World Model -> investigator. This does not claim a Nightshift model call.
export async function verifyZetaris({ output = path.join(root, 'logs/zetaris') } = {}) {
  await loadLocalEnv();
  const fixtures = await loadFixtureFeeds();
  const client = new ZetarisClient();
  const signal = AbortSignal.timeout(5 * 60_000);
  const startedAt = new Date().toISOString();
  const feeds = {};
  const queries = [];
  const sources = [];
  for (const name of FEED_NAMES) {
    signal.throwIfAborted();
    const response = await client.run(feedQuery(name), { limit: 1000, signal });
    queries.push({ source: name, ...response });
    const records = decodeFeed(name, response.rows);
    const sourceText = canonical(ordered(records));
    const matchesFixture = sourceText === canonical(ordered(fixtures[name].records));
    if (!matchesFixture) throw new Error(`Decoded live ${name} rows differ from the canonical synthetic fixture.`);
    feeds[name] = { ...fixtures[name], records, source_system: `Actual Zetaris USL ${name}`, notRetrieved: false };
    sources.push({ name, rowCount: records.length, matchesFixture, sha256: createHash('sha256').update(sourceText).digest('hex'), queryId: response.queryId, durationMs: response.durationMs });
    console.log(JSON.stringify({ phase: 'actual-usl-read-verified', ...sources.at(-1) }));
  }
  const cases = [];
  const expectedOutcomes = { 'TH-1041': 'excursion', 'TH-1042': 'sensor_bias', 'TH-1043': 'insufficient_evidence', 'TH-1044': 'within_range' };
  for (const shipmentId of Object.keys(expectedOutcomes)) {
    signal.throwIfAborted();
    const world = await buildWorldContext(feeds, shipmentId, { runId: `zetaris-contract-${shipmentId}`, storage: 'memory' });
    const result = investigateShipment(world.feeds, shipmentId);
    const evidenceIds = new Set(result.evidence.map(row => row.id));
    const citations = [...result.findings, ...result.actions, ...result.contradictions].flatMap(item => item.citationIds);
    if (result.outcome !== expectedOutcomes[shipmentId] || citations.some(id => !evidenceIds.has(id))) throw new Error(`Live USL investigation or citation check failed for ${shipmentId}.`);
    cases.push({ shipmentId, outcome: result.outcome, coveragePercent: result.coverage.percent, correctedPeakC: result.metrics.correctedPeakC, rejectedReadings: result.metrics.rejectedReadings, evidenceRows: evidenceIds.size, citationReferences: citations.length, citationsResolved: true, contextTrace: world.contextTrace });
  }
  const report = { schemaVersion: '1.0', kind: 'actual-zetaris-usl-contract-verification', startedAt, completedAt: new Date().toISOString(), syntheticData: true, zetarisExecuted: true, nightshiftExecuted: false, worldModelExecuted: true, sqlQueries: queries.length, sources, cases, complete: true };
  const folder = path.resolve(output);
  await fs.mkdir(folder, { recursive: true });
  const stem = `usl-verification-${startedAt.replace(/[:.]/g, '-')}`;
  await fs.writeFile(path.join(folder, `${stem}.json`), JSON.stringify(report, null, 2) + '\n');
  await fs.writeFile(path.join(folder, `${stem}-queries.jsonl`), queries.map(row => JSON.stringify(row)).join('\n') + '\n');
  console.log(JSON.stringify({ phase: 'actual-usl-investigation-verified', report: path.join(folder, `${stem}.json`), cases: cases.map(({ shipmentId, outcome }) => ({ shipmentId, outcome })) }));
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--output' || !args[1])) {
    console.error('Usage: node --import tsx scripts/zetaris-verify.mjs [--output logs/zetaris]');
    process.exitCode = 1;
  } else verifyZetaris(args.length ? { output: path.resolve(root, args[1]) } : {}).catch(error => {
    console.error(redact(error.message, [process.env.ZETARIS_API_KEY, process.env.NIGHTSHIFT_API_KEY]));
    process.exitCode = 1;
  });
}

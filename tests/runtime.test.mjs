import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildWorldContext } from '../server/world-context.mjs';
import { runInvestigation, loadFixtureFeeds } from '../server/agent.mjs';
import { FEED_COLUMNS } from '../scripts/zetaris-schema.mjs';
import { NightshiftClient } from '../server/nightshift.mjs';
import { plannerSchema } from '../server/output-schemas.mjs';
import { ZetarisClient } from '../scripts/zetaris-client.mjs';
import { loadPlan } from '../scripts/zetaris-setup.mjs';

test('official World Model warm-loads, preserves identities, and skips unchanged ingest', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'traceharbor-world-test-'));
  try {
    const feeds = await loadFixtureFeeds();
    const first = await buildWorldContext(feeds, 'TH-1041', { directory, runId: 'test-first' });
    assert.equal(first.ingestReport.processed, 46);
    assert.equal(first.world.view('graph').query({ type: 'shipment' }).length, 4);
    const eventCount = first.world.events().length;
    const second = await buildWorldContext(feeds, 'TH-1041', { directory, runId: 'test-second' });
    assert.equal(second.ingestReport.skippedUnchanged, 46);
    assert.equal(second.ingestReport.eventsAppended, 0);
    assert.equal(second.world.events().length, eventCount);
    assert.deepEqual(second.feeds, feeds);
    assert.equal(second.contextTrace.storedAndConsumed, true);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test('bounded agent orchestration uses tool data, real engine, and critic rerun (mock transports)', async () => {
  const fixtures = await loadFixtureFeeds();
  const phases = [];
  const queries = [];
  const nightshift = {
    preflight: async () => ({ online: true, testTransport: true }),
    generateJson: async ({ phase }) => {
      phases.push(phase);
      const values = {
        planner: { sources: ['telemetry', 'manifest', 'incidents'], focus: 'Check whether valid calibration changes a temperature alarm.' },
        critic: { retrieve_sources: ['calibration'], challenge: 'Would the raw alarm remain explained without calibration?', recheck: 'calibration', citation_ids: ['TEL-1042-20'] },
        synthesis: { finding_ids: ['bias'], action_ids: ['sensor-service'], citation_ids: ['CALROW-42', 'TEL-1042-20R'] },
      };
      return { value: values[phase], receipt: { phase, testTransport: true } };
    },
  };
  const zetaris = { run: async sql => { queries.push(sql); const name = sql.split('.').at(-1); return { rows: fixtures[name].records.map(row => FEED_COLUMNS[name].map(key => row[key])), queryId: `test-${name}`, sql, durationMs: 0 }; } };
  const result = await runInvestigation({ mode: 'live', shipmentId: 'TH-1042', nightshift, zetaris, persist: false });
  assert.deepEqual(phases, ['planner', 'critic', 'synthesis']);
  assert.equal(queries.length, 4);
  assert.equal(result.dossier.outcome, 'sensor_bias');
  assert.equal(result.manifest.retrievalPlan.provisionalOutcome, 'insufficient_evidence');
  assert.equal(result.manifest.retrievalPlan.finalOutcome, 'sensor_bias');
  assert.deepEqual(result.manifest.retrievalPlan.criticSources, ['calibration']);
  assert.equal(result.dossier.counterfactual.rerunOutcome, 'insufficient_evidence');
  assert.equal(result.manifest.budget.modelCalls, 3);
  assert.equal(result.dossier.canonicalVerdict.canonical.attrs.investigation_status, 'sensor_bias');
});

test('live provider failure never becomes a successful sample run', async () => {
  await assert.rejects(runInvestigation({ mode: 'live', shipmentId: 'TH-1041', persist: false, nightshift: { preflight: async () => { throw new Error('provider unavailable'); } }, zetaris: {} }), /provider unavailable/);
});

test('a critic that declines a missing source cannot receive a fabricated clear conclusion', async () => {
  const fixtures = await loadFixtureFeeds();
  let queries = 0;
  const nightshift = {
    preflight: async () => ({ testTransport: true }),
    generateJson: async ({ phase }) => ({ value: {
      planner: { sources: ['manifest', 'telemetry', 'incidents'], focus: 'Check whether temperature observations support the reported status.' },
      critic: { retrieve_sources: [], challenge: 'What if the last observation were absent?', recheck: 'coverage', citation_ids: ['MAN-1042'] },
      synthesis: { finding_ids: ['source-gap'], action_ids: ['recover-evidence'], citation_ids: ['MAN-1042'] },
    }[phase], receipt: { testTransport: true, phase } }),
  };
  const zetaris = { run: async sql => { queries++; const name = sql.split('.').at(-1); return { rows: fixtures[name].records.map(row => FEED_COLUMNS[name].map(key => row[key])), queryId: `test-${name}`, sql, durationMs: 0 }; } };
  const result = await runInvestigation({ mode: 'live', shipmentId: 'TH-1042', nightshift, zetaris, persist: false });
  assert.equal(queries, 3);
  assert.equal(result.dossier.outcome, 'insufficient_evidence');
  assert.deepEqual(result.dossier.missingSources, ['calibration']);
  assert.equal(result.dossier.metrics.correctedPeakC, null);
});

test('documented REST and Nightshift headers are sent and secrets are redacted', async () => {
  const secret = 'unit-test-token-only';
  let request;
  const zetaris = new ZetarisClient({ apiKey: secret, fetchImpl: async (url, options) => { request = { url, options }; return new Response(JSON.stringify({ data: [['1']] }), { status: 200 }); } });
  assert.equal((await zetaris.run('SELECT 1')).rows[0][0], '1');
  assert.equal(request.url, 'http://localhost:8888/api/v1.0/sql-editor/sqls/run');
  assert.equal(request.options.headers['X-Org-ID'], '1');
  assert.equal(JSON.parse(request.options.body).source, 'SqlEditor');
  const nightshift = new NightshiftClient({ apiKey: secret, fetchImpl: async (url, options) => { request = { url, options }; return new Response(JSON.stringify({ model: 'test-model', choices: [{ message: { content: '{"ok":true}' } }] }), { status: 200 }); } });
  await nightshift.generateJson({ system: 'test', prompt: 'test', phase: 'planner', schema: plannerSchema() });
  assert.equal(request.options.headers['meterless-app'], 'traceharbor');
  assert.equal(request.options.headers['meterless-scope'], 'user');
  assert.deepEqual(JSON.parse(request.options.body).response_format, { type: 'json_schema', json_schema: plannerSchema() });
  assert.equal(JSON.parse(request.options.body).max_tokens, 256);
  const failure = new ZetarisClient({ apiKey: secret, fetchImpl: async () => new Response(`Bearer ${secret}`, { status: 401 }) });
  await assert.rejects(failure.run('SELECT 1'), error => error.message.includes('[REDACTED]') && !error.message.includes(secret));
});

test('setup has four sources, twelve exploration queries, one intact USL compile and named DQ', async () => {
  const plan = await loadPlan('https://traceharbor-test.web.app');
  assert.equal(plan.filter(item => item.label.startsWith('register-') && item.label !== 'register-telemetry-integrity').length, 4);
  assert.equal(plan.filter(item => item.label.startsWith('explore-')).length, 12);
  const compile = plan.filter(item => item.label === 'compile-usl');
  assert.equal(compile.length, 1);
  assert.equal((compile[0].sql.match(/^CREATE TABLE /gm) || []).length, 4);
  assert.match(plan.find(item => item.label === 'execute-telemetry-integrity').sql, /RUN DQ telemetry_integrity TABLE/);
  assert.equal(plan.filter(item => item.label.startsWith('usl-')).length, 3);
});

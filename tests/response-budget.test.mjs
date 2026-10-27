import test from 'node:test';
import assert from 'node:assert/strict';
import { ZetarisClient } from '../scripts/zetaris-client.mjs';
import { NightshiftClient } from '../server/nightshift.mjs';
import { readBoundedText } from '../core/http-body.mjs';

test('provider response limits cancel oversized streams before buffering the complete body', async () => {
  for (const [Provider, budget] of [[ZetarisClient, 2_000_000], [NightshiftClient, 1_000_000]]) {
    let cancelled = false;
    let pulls = 0;
    const chunk = new Uint8Array(65536);
    const fetchImpl = async () => new Response(new ReadableStream({
      pull(controller) { pulls++; controller.enqueue(chunk); },
      cancel() { cancelled = true; },
    }));
    const client = new Provider({ apiKey: 'test-secret', fetchImpl });
    await assert.rejects(() => Provider === ZetarisClient ? client.run('SELECT 1') : client.preflight(), /response exceeded.*byte budget/);
    assert.equal(cancelled, true);
    assert.ok(pulls <= Math.ceil(budget / chunk.byteLength) + 2, 'stream was consumed after its budget was exceeded');
  }
  let cancelled = false;
  const declared = new Response(new ReadableStream({ cancel() { cancelled = true; } }), { headers: { 'Content-Length': '100' } });
  await assert.rejects(() => readBoundedText(declared, 5, 'test'), /byte budget/);
  assert.equal(cancelled, true);
  assert.equal(await readBoundedText(new Response('é'), 2, 'test'), 'é');
  await assert.rejects(() => readBoundedText(new Response('é'), 1, 'test'), /byte budget/);
});

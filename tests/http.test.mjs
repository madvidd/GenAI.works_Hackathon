import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createTraceHarborServer } from '../server/http.mjs';

test('local API accepts only same-origin allowlisted bounded investigations', async () => {
  let calls = 0;
  const server = createTraceHarborServer({ shipments: ['TH-1041'], run: async () => { calls++; return { dossier: { outcome: 'excursion', trace: [] }, events: [] }; } });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  const send = (body, extra = {}) => fetch(`${origin}/api/investigate`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...extra }, body: JSON.stringify(body) });
  try {
    assert.equal((await send({ shipmentId: 'TH-9999', mode: 'live' })).status, 400);
    assert.equal((await send({ shipmentId: 'TH-1041', mode: 'live' }, { Origin: 'https://untrusted.example' })).status, 403);
    const response = await send({ shipmentId: 'TH-1041', mode: 'live' }, { Origin: origin });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).result.outcome, 'excursion');
    assert.equal(calls, 1);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

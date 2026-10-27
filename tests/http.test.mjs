import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import http from 'node:http';
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
    assert.equal((await send(null)).status, 400);
    assert.equal((await send({ shipmentId: 'TH-1041', mode: 'live' }, { Origin: 'https://untrusted.example' })).status, 403);
    const response = await send({ shipmentId: 'TH-1041', mode: 'live' }, { Origin: origin });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).result.outcome, 'excursion');
    assert.equal(calls, 1);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('overlapping partial POST bodies cannot start concurrent live investigations', async () => {
  let calls = 0;
  let releaseRun;
  let signalRun;
  const started = new Promise(resolve => { signalRun = resolve; });
  const held = new Promise(resolve => { releaseRun = resolve; });
  const server = createTraceHarborServer({ shipments: ['TH-1041'], run: async () => { calls++; signalRun(); await held; return { dossier: { trace: [] }, events: [] }; } });
  let received = 0;
  let signalBodies;
  const bodiesWaiting = new Promise(resolve => { signalBodies = resolve; });
  server.on('request', () => { if (++received === 2) signalBodies(); });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const requests = [];
  const partial = () => {
    let resolveResponse;
    const complete = new Promise(resolve => { resolveResponse = resolve; });
    const request = http.request({ hostname: '127.0.0.1', port: server.address().port, path: '/api/investigate', method: 'POST', headers: { 'Content-Type': 'application/json' } }, response => { response.resume(); response.on('end', () => resolveResponse(response.statusCode)); });
    requests.push(request);
    request.write('{"shipmentId":');
    return { request, complete };
  };
  try {
    const first = partial();
    const second = partial();
    await bodiesWaiting;
    first.request.end('"TH-1041","mode":"live"}');
    await started;
    second.request.end('"TH-1041","mode":"live"}');
    assert.equal(await second.complete, 429);
    assert.equal(calls, 1);
    releaseRun();
    assert.equal(await first.complete, 200);
  } finally {
    releaseRun();
    requests.forEach(request => request.destroy());
    await new Promise(resolve => server.close(resolve));
  }
});

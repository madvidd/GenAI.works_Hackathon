import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInvestigation, loadFixtureFeeds } from './agent.mjs';
import { loadLocalEnv } from '../scripts/zetaris-setup.mjs';
import { redact } from '../scripts/zetaris-client.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation', '.srt': 'application/x-subrip' };

export function createTraceHarborServer({ shipments, run = runInvestigation, dist = path.join(root, 'dist') }) {
  const allowedShipments = new Set(shipments);
  let running = false;
  let recentRuns = [];
  return http.createServer(async (request, response) => {
    const send = (status, value) => { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); response.end(JSON.stringify(value)); };
    try {
      // This companion is intentionally loopback-only. No wildcard CORS or proxy trust.
      const host = request.headers.host || '';
      if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return send(403, { error: 'Untrusted host.' });
      if (request.headers.origin && request.headers.origin !== `http://${host}`) return send(403, { error: 'Only same-origin local requests are accepted.' });
      const url = new URL(request.url, `http://${host}`);
      if (url.pathname === '/api/health' && request.method === 'GET') return send(200, { status: 'ready', liveRunning: running, configuration: { zetaris: Boolean(process.env.ZETARIS_API_KEY), nightshift: Boolean(process.env.NIGHTSHIFT_API_KEY) }, providerConnectivityVerified: false });
      if (url.pathname === '/api/investigate') {
        if (request.method !== 'POST') return send(405, { error: 'Use POST.' });
        if (!/^application\/json(?:;|$)/i.test(request.headers['content-type'] || '')) return send(415, { error: 'Use application/json.' });
        if (running) return send(429, { error: 'A bounded investigation is already running.' });
        recentRuns = recentRuns.filter(at => at > Date.now() - 10 * 60_000);
        if (recentRuns.length >= 3) return send(429, { error: 'Local run budget reached: at most three live investigations per ten minutes.' });
        const chunks = [];
        let bodyBytes = 0;
        for await (const chunk of request) { bodyBytes += chunk.length; if (bodyBytes > 2048) return send(413, { error: 'Request body exceeds 2 KB.' }); chunks.push(chunk); }
        let body;
        try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return send(400, { error: 'Invalid JSON.' }); }
        if (!body || typeof body !== 'object' || Array.isArray(body) || body.mode !== 'live' || !allowedShipments.has(body.shipmentId) || Object.keys(body).some(key => !['mode', 'shipmentId'].includes(key))) return send(400, { error: 'Use an allowlisted shipment ID and mode live.' });
        // Other request handlers can progress while this one's body is arriving.
        // Recheck and reserve in one synchronous section after that await.
        if (running) return send(429, { error: 'A bounded investigation is already running.' });
        recentRuns = recentRuns.filter(at => at > Date.now() - 10 * 60_000);
        if (recentRuns.length >= 3) return send(429, { error: 'Local run budget reached: at most three live investigations per ten minutes.' });
        running = true; recentRuns.push(Date.now());
        try {
          const completed = await run({ mode: 'live', shipmentId: body.shipmentId });
          const liveTrace = completed.events.map(event => ({
            agent: event.phase.startsWith('model') || event.phase === 'planner' ? 'Nightshift agent' : event.phase === 'query-tool' ? 'Zetaris tool' : event.phase === 'world-ingest' ? 'Meterless World Model' : 'Runtime',
            action: event.phase, status: event.status,
            detail: event.detail || (event.phase === 'query-tool' ? `Read ${event.rows} real USL rows from ${event.source}.`
              : event.phase === 'world-ingest' ? `Ingested ${event.report.processed} changed observations; skipped ${event.report.skippedUnchanged} unchanged observations. Queried ${event.contextTrace.selectedCount} canonical graph records for agent context.`
              : event.phase === 'critic-rerun' ? `${event.counterfactual.challenge.challenge} Result: ${event.counterfactual.factualOutcome} → ${event.counterfactual.rerunOutcome}. ${event.counterfactual.interpretation}`
              : JSON.stringify(event.result || event.challenge || event.plan || event.selection || { outcome: event.outcome }).slice(0, 800)),
            citationIds: event.challenge?.citation_ids || event.counterfactual?.challenge?.citation_ids || [],
          }));
          send(200, { result: { ...completed.dossier, mode: 'live', trace: [...completed.dossier.trace, ...liveTrace] } });
        } finally { running = false; }
        return;
      }
      if (url.pathname.startsWith('/api/')) return send(404, { error: 'Unknown endpoint.' });
      if (!['GET', 'HEAD'].includes(request.method)) return send(405, { error: 'Method not allowed.' });
      const decoded = decodeURIComponent(url.pathname);
      const filename = path.resolve(dist, `.${decoded}`);
      const relative = path.relative(dist, filename);
      if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(/[\\/]/).some(part => part.startsWith('.'))) return send(403, { error: 'Invalid asset path.' });
      let actual = filename;
      let content;
      try { if ((await fs.stat(actual)).isDirectory()) actual = path.join(actual, 'index.html'); content = await fs.readFile(actual); }
      catch { if (path.extname(decoded)) return send(404, { error: 'Asset not found.' }); actual = path.join(dist, 'index.html'); content = await fs.readFile(actual); }
      response.writeHead(200, { 'Content-Type': mime[path.extname(actual)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) { if (!response.headersSent) send(500, { error: redact(error.message, [process.env.NIGHTSHIFT_API_KEY, process.env.ZETARIS_API_KEY]), liveCompleted: false }); else response.end(); }
  });
}

async function main() {
  await loadLocalEnv();
  const feeds = await loadFixtureFeeds();
  const port = Number(process.env.PORT || 8787);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PORT must be an unprivileged valid port.');
  const server = createTraceHarborServer({ shipments: feeds.manifest.records.map(row => row.shipment_id) });
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  server.listen(port, '127.0.0.1', () => console.log(`TraceHarbor local companion: http://127.0.0.1:${port}`));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(redact(error.message, [process.env.NIGHTSHIFT_API_KEY, process.env.ZETARIS_API_KEY])); process.exitCode = 1; });

import { randomUUID } from 'node:crypto';
import { readBoundedText } from '../core/http-body.mjs';

export function redact(value, secrets = []) {
  let output = String(value);
  for (const secret of secrets.filter(Boolean)) output = output.split(secret).join('[REDACTED]');
  return output.replace(/Bearer\s+[^\s"']+/gi, 'Bearer [REDACTED]');
}

export function normalizeZetarisUrl(value) {
  const url = new URL(value || 'http://localhost:8888/api/v1.0');
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Use a plain HTTP(S) Zetaris API URL without credentials, query, or fragment.');
  if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]', 'host.docker.internal'].includes(url.hostname)) throw new Error('Remote Zetaris credentials require HTTPS.');
  url.pathname = url.pathname.replace(/\/$/, '');
  if (!url.pathname || url.pathname === '/') url.pathname = '/api/v1.0';
  if (!url.pathname.endsWith('/api/v1.0')) throw new Error('Zetaris REST base URL must end in /api/v1.0.');
  return url.toString().replace(/\/$/, '');
}

export class ZetarisClient {
  constructor({ baseUrl = process.env.ZETARIS_BASE_URL || process.env.ZETARIS_REST_URL, apiKey = process.env.ZETARIS_API_KEY, orgId = process.env.ZETARIS_ORG_ID || '1', timeoutMs = 60_000, fetchImpl = fetch } = {}) {
    if (!apiKey || /[\r\n]/.test(apiKey)) throw new Error('Set a real ZETARIS_API_KEY in the process environment or .env.local.');
    if (!/^\d+$/.test(String(orgId))) throw new Error('ZETARIS_ORG_ID must be the numeric organisation ID.');
    this.baseUrl = normalizeZetarisUrl(baseUrl);
    this.apiKey = apiKey;
    this.orgId = String(orgId);
    this.timeoutMs = Math.max(1000, Math.min(120_000, timeoutMs));
    this.fetchImpl = fetchImpl;
  }

  async run(sql, { limit = 1000, signal } = {}) {
    if (typeof sql !== 'string' || !sql.trim() || sql.length > 100_000) throw new Error('SQL must be nonempty and bounded.');
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new Error('Result limit must be 1–1000.');
    const queryId = randomUUID();
    const requestId = randomUUID();
    const started = Date.now();
    try {
      const response = await this.fetchImpl(`${this.baseUrl}/sql-editor/sqls/run`, {
        method: 'POST', redirect: 'error',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'X-Org-ID': this.orgId, 'X-Request-ID': requestId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId, sql, source: 'SqlEditor', limit }),
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(this.timeoutMs)]) : AbortSignal.timeout(this.timeoutMs),
      });
      const content = await readBoundedText(response, 2_000_000, 'Zetaris');
      if (!response.ok) throw new Error(`Zetaris HTTP ${response.status}: ${content.slice(0, 500)}`);
      let result;
      try { result = JSON.parse(content); } catch { throw new Error('Zetaris returned a non-JSON response.'); }
      if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('Unexpected Zetaris response envelope.');
      if (result.error || result.errors?.length || result.success === false) throw new Error(`Zetaris query failed: ${JSON.stringify(result.error || result.errors || result.message).slice(0, 500)}`);
      const rows = result.data ?? [];
      if (!Array.isArray(rows) || rows.some(row => !Array.isArray(row))) throw new Error('Expected Zetaris data as row arrays; refusing to guess the response shape.');
      return { queryId, requestId, sql, rows, durationMs: Date.now() - started, raw: result };
    } catch (error) {
      const failure = new Error(redact(error?.message || error, [this.apiKey]), { cause: undefined });
      Object.assign(failure, { queryId, requestId, sql, durationMs: Date.now() - started });
      throw failure;
    }
  }
}

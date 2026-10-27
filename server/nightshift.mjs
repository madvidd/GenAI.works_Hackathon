import { redact } from '../scripts/zetaris-client.mjs';
import { readBoundedText } from '../core/http-body.mjs';

export function normalizeNightshiftUrl(value = 'http://127.0.0.1:8088/v1') {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Use an HTTP(S) Nightshift Runtime base URL without embedded credentials.');
  if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]', 'host.docker.internal'].includes(url.hostname)) throw new Error('Remote Nightshift credentials require HTTPS.');
  url.pathname = url.pathname.replace(/\/(chat\/completions|models)\/?$/, '').replace(/\/$/, '');
  if (!url.pathname.endsWith('/v1')) url.pathname += '/v1';
  return url.toString().replace(/\/$/, '');
}

export class NightshiftClient {
  constructor({ baseUrl = process.env.NIGHTSHIFT_BASE_URL, apiKey = process.env.NIGHTSHIFT_API_KEY, model = process.env.NIGHTSHIFT_MODEL || 'meterless/auto', fetchImpl = fetch, maxCalls = 3 } = {}) {
    if (!apiKey || apiKey === 'rt-local' || /[\r\n]/.test(apiKey)) throw new Error('Set a real Nightshift Runtime proxy token as NIGHTSHIFT_API_KEY; rt-local is not a credential.');
    this.baseUrl = normalizeNightshiftUrl(baseUrl); this.apiKey = apiKey;
    this.model = model; this.fetchImpl = fetchImpl; this.maxCalls = Math.min(3, maxCalls); this.calls = 0;
  }
  async request(route, body, signal) {
    try {
      const response = await this.fetchImpl(`${this.baseUrl}${route}`, {
        method: body ? 'POST' : 'GET', redirect: 'error',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'meterless-app': 'traceharbor', ...(body ? { 'meterless-scope': 'user', 'Content-Type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(body ? 180_000 : 60_000)]) : AbortSignal.timeout(body ? 180_000 : 60_000),
      });
      const text = await readBoundedText(response, 1_000_000, 'Nightshift');
      if (!response.ok) throw new Error(`Nightshift HTTP ${response.status}: ${text.slice(0, 400)}`);
      const result = JSON.parse(text);
      if (result.error) throw new Error(`Nightshift error: ${JSON.stringify(result.error).slice(0, 400)}`);
      return result;
    } catch (error) { throw new Error(redact(error.message, [this.apiKey])); }
  }
  async preflight(signal) {
    const result = await this.request('/models', undefined, signal);
    if (!Array.isArray(result.data)) throw new Error('Nightshift model discovery returned an unexpected shape.');
    const models = result.data.map(item => item.id).filter(Boolean);
    if (!this.model.startsWith('meterless/') && !models.includes(this.model)) throw new Error('Configured model was not returned by Nightshift /models.');
    return { online: true, requestedModel: this.model, availableModelCount: models.length };
  }
  async generateJson({ system, prompt, signal, phase, schema }) {
    if (++this.calls > this.maxCalls) throw new Error('Nightshift call budget exhausted.');
    const started = Date.now();
    const result = await this.request('/chat/completions', {
      model: this.model, temperature: 0.1, max_tokens: ({ planner: 256, critic: 512, synthesis: 384 })[phase] || 512, stream: false,
      ...(schema ? { response_format: { type: 'json_schema', json_schema: schema } } : {}),
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
    }, signal);
    const text = result.choices?.[0]?.message?.content;
    if (result.choices?.[0]?.finish_reason === 'length') throw new Error(`Nightshift ${phase} exhausted its output budget.`);
    if (typeof text !== 'string') throw new Error('Nightshift did not return a text completion.');
    let parsed;
    try { parsed = JSON.parse(text.trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')); }
    catch { throw new Error(`Nightshift ${phase} did not return the required JSON; no unbounded repair calls were made.`); }
    return { value: parsed, receipt: { phase, provider: 'Nightshift Runtime', requestedModel: this.model, returnedModel: result.model || null, usage: result.usage || null, durationMs: Date.now() - started, completionId: result.id || null, responseFormat: schema ? 'json_schema' : 'text', schemaName: schema?.name || null, finishReason: result.choices?.[0]?.finish_reason || null, nvidiaProviderVerified: false } };
  }
}

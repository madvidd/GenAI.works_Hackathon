import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { ZetarisClient, redact } from './zetaris-client.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export async function loadLocalEnv(file = path.join(root, '.env.local')) {
  let text;
  try { text = await fs.readFile(file, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}

export function splitMarkedStatements(text, filename) {
  const parts = text.split(/^-- @statement ([a-z0-9-]+)\s*$/m);
  if (parts.length < 3 || parts[0].replace(/--[^\n]*/g, '').trim()) throw new Error(`Expected explicit statement boundaries in ${filename}.`);
  const statements = [];
  for (let index = 1; index < parts.length; index += 2) {
    // Match the official runner: remove leading comments and the final
    // terminator, while preserving COMPILE USL's internal table separators.
    const sql = parts[index + 1]?.trim().replace(/^(?:--[^\n]*\n\s*)+/, '').replace(/;\s*$/, '').trim();
    if (!sql) throw new Error(`Empty SQL block in ${filename}.`);
    statements.push({ label: parts[index], file: filename, sql });
  }
  return statements;
}

export async function loadPlan(origin) {
  const url = new URL(origin);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Public origin must be an HTTPS origin, without path or credentials.');
  const files = (await fs.readdir(path.join(root, 'sql'))).filter(name => /^\d\d-.+\.sql$/.test(name)).sort();
  const plan = [];
  for (const file of files) plan.push(...splitMarkedStatements((await fs.readFile(path.join(root, 'sql', file), 'utf8')).replaceAll('__PUBLIC_ORIGIN__', url.origin), file));
  if (!plan.length || plan.length > 50 || new Set(plan.map(item => item.label)).size !== plan.length) throw new Error('Invalid, duplicate, or excessive setup plan.');
  return plan;
}

const canonical = value => Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']' : value && typeof value === 'object' ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}' : JSON.stringify(value);
async function verifyPublishedFeeds(origin, signal) {
  const receipts = [];
  for (const name of ['manifest', 'telemetry', 'incidents', 'calibration']) {
    const local = JSON.parse(await fs.readFile(path.join(root, 'data', `${name}.json`), 'utf8'));
    const response = await fetch(`${origin}/data/${name}.json`, { signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]), redirect: 'error' });
    if (!response.ok) throw new Error(`Published ${name} feed returned HTTP ${response.status}.`);
    const text = await response.text();
    if (text.length > 1_000_000) throw new Error('Published feed exceeds the fixture budget.');
    const published = JSON.parse(text);
    if (published.synthetic !== true || !Array.isArray(published.records) || canonical(local) !== canonical(published)) throw new Error(`Published ${name} does not match the canonical synthetic fixture.`);
    receipts.push({ feed: name, url: `${origin}/data/${name}.json`, records: published.records.length, sha256: createHash('sha256').update(canonical(published)).digest('hex') });
  }
  return receipts;
}

export async function main(args = process.argv.slice(2)) {
  if (args.includes('--help')) { console.log('node scripts/zetaris-setup.mjs --origin https://PROJECT.web.app [--execute] [--verify-only] [--output logs/zetaris]\nDry-run is the default. Execution changes the configured Zetaris instance; reruns stop on existing-object errors.'); return; }
  const allowed = new Set(['--origin', '--execute', '--verify-only', '--output']);
  const options = {};
  for (let index = 0; index < args.length; index++) {
    if (!allowed.has(args[index])) throw new Error(`Unknown argument ${args[index]}.`);
    if (['--execute', '--verify-only'].includes(args[index])) options[args[index]] = true;
    else { const key = args[index]; options[key] = args[++index]; if (!options[key]) throw new Error(`Missing ${key} value.`); }
  }
  await loadLocalEnv();
  const origin = options['--origin'] || process.env.TRACEHARBOR_PUBLIC_ORIGIN;
  if (!origin) throw new Error('Set TRACEHARBOR_PUBLIC_ORIGIN or pass --origin.');
  const plan = await loadPlan(origin);
  const selected = options['--verify-only'] ? plan.filter(item => !/^(create-|register-|compile-|activate-)/.test(item.label)) : plan;
  if (!options['--execute']) {
    console.log(JSON.stringify({ mode: 'dry-run', liveExecuted: false, totalStatements: selected.length, origin, statements: selected }, null, 2));
    return;
  }
  const client = new ZetarisClient();
  const globalSignal = AbortSignal.timeout(10 * 60_000);
  const runId = `zetaris-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
  const folder = path.resolve(root, options['--output'] || 'logs/zetaris');
  await fs.mkdir(folder, { recursive: true });
  const receiptFile = path.join(folder, `${runId}.jsonl`);
  const write = entry => fs.appendFile(receiptFile, JSON.stringify({ runId, recordedAt: new Date().toISOString(), ...entry }) + '\n', 'utf8');
  let executed = 0;
  try {
    const feeds = await verifyPublishedFeeds(new URL(origin).origin, globalSignal);
    await write({ event: 'published-feeds-verified', feeds, liveExecuted: true });
    for (const statement of selected) {
      globalSignal.throwIfAborted();
      const result = await client.run(statement.sql, { limit: 1000, signal: globalSignal });
      if (statement.label === 'connectivity' && Number(result.rows[0]?.[0]) !== 1) throw new Error('SELECT 1 did not return 1.');
      await write({ event: 'sql-executed', label: statement.label, file: statement.file, ...result });
      executed++;
      console.log(`${executed}/${selected.length} ${statement.label}: ${result.rows.length} row(s)`);
    }
    await write({ event: 'run-completed', executed, complete: true });
    console.log(`Executed ${executed} real Zetaris statements. Inspect receipts: ${receiptFile}`);
  } catch (error) {
    await write({ event: 'run-failed', executed, complete: false, error: redact(error.message, [process.env.ZETARIS_API_KEY]) });
    throw new Error(`${redact(error.message, [process.env.ZETARIS_API_KEY])} Partial receipts: ${receiptFile}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(redact(error.message, [process.env.ZETARIS_API_KEY])); process.exitCode = 1; });

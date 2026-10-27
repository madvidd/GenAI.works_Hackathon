import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const origin = 'https://traceharbor.web.app';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const html = await fs.readFile(path.join(root, 'dist/index.html'), 'utf8');
const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map(match => match[1]);
if (!assets.some(asset => asset.endsWith('.js')) || !assets.some(asset => asset.endsWith('.css')))
  throw new Error('Build the site before verifying its deployment.');
const files = [
  '/index.html', ...assets,
  ...['manifest', 'telemetry', 'incidents', 'calibration'].map(name => `/data/${name}.json`),
  ...['traceharbor-demo.mp4', 'traceharbor.pdf', 'traceharbor.pptx', 'traceharbor-demo.srt'].map(name => `/submission/${name}`),
];
const checks = [];
for (const file of files) {
  const local = await fs.readFile(path.join(root, 'dist', file.slice(1)));
  const response = await fetch(`${origin}${file}?verify=${Date.now()}`, {
    redirect: 'error', signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  const remote = Buffer.from(await response.arrayBuffer());
  if (digest(local) !== digest(remote)) throw new Error(`${file}: deployed bytes differ from the current build.`);
  if (response.headers.get('x-content-type-options') !== 'nosniff') throw new Error(`${file}: expected security header is missing.`);
  const contentType = response.headers.get('content-type');
  if (file.endsWith('.mp4') && !contentType?.startsWith('video/mp4')) throw new Error('Demo video has an unexpected media type.');
  if (file.endsWith('.pdf') && !contentType?.startsWith('application/pdf')) throw new Error('Slide PDF has an unexpected media type.');
  checks.push({ file, status: response.status, bytes: remote.length, contentType, sha256: digest(remote), matchesBuild: true });
}
const report = {
  verifiedAt: new Date().toISOString(), origin,
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  method: 'Unauthenticated HTTPS downloads compared byte-for-byte with the production build, including all four source feeds and four presentation artifacts.',
  checks,
};
await fs.mkdir(path.join(root, 'logs'), { recursive: true });
await fs.writeFile(path.join(root, 'logs/deployment-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

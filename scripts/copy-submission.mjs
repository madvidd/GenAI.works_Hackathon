import { copyFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Keep one canonical copy in submission/. Vite's output contains only these
// public deliverables, never build intermediates, source credentials or logs.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'traceharbor-demo.mp4',
  'traceharbor-demo.srt',
  'traceharbor.pdf',
  'traceharbor.pptx',
];
for (const file of files) {
  const source = path.join(root, 'submission', file);
  const details = await stat(source);
  if (!details.isFile() || details.size === 0) {
    throw new Error(`Missing or empty submission artifact: ${file}`);
  }
}
const destination = path.join(root, 'dist', 'submission');
await mkdir(destination, { recursive: true });
for (const file of files) {
  await copyFile(path.join(root, 'submission', file), path.join(destination, file));
}
console.log(`Copied ${files.length} public submission artifacts to dist/submission.`);

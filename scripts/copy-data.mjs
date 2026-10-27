import { mkdir, copyFile } from 'node:fs/promises';
await mkdir(new URL('../public/data/', import.meta.url), {recursive:true});
for (const name of ['manifest','telemetry','incidents','calibration']) await copyFile(new URL(`../data/${name}.json`,import.meta.url),new URL(`../public/data/${name}.json`,import.meta.url));

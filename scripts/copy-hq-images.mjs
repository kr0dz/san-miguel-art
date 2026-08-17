import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const source = path.join(root, 'images');
const target = path.join(root, 'dist', 'images');

await fs.rm(target, { recursive: true, force: true });
await fs.cp(source, target, { recursive: true });
console.log('SMArt: copied existing HQ AVIF artwork into dist/images.');

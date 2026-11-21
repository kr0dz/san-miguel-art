import { writeFile, mkdir, readdir, readFile } from 'node:fs/promises';
const out = 'dist/assets/brand';
await mkdir(out, { recursive: true });
const base64 = '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';
const image = Buffer.from(base64, 'base64');
if (image.length !== 1797 || image.subarray(1, 4).toString() !== 'PNG') throw new Error('Invalid favicon binary');
await writeFile(out + '/smart-favicon.png', image);
console.log('SMArt: published actual 64px PNG monogram favicon.');

const links = '<link rel="icon" type="image/svg+xml" href="/assets/brand/favicon.svg?v=sm20261121"><link rel="icon" type="image/png" sizes="64x64" href="/assets/brand/smart-favicon.png?v=sm20261121"><link rel="shortcut icon" href="/assets/brand/smart-favicon.png?v=sm20261121"><link rel="apple-touch-icon" href="/assets/brand/smart-favicon.png?v=sm20261121">';
async function htmlFiles(dir) {
  const paths = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const location = dir + '/' + entry.name;
    if (entry.isDirectory()) paths.push(...await htmlFiles(location));
    else if (entry.isFile() && entry.name.endsWith('.html')) paths.push(location);
  }
  return paths;
}
let changed = 0;
for (const file of await htmlFiles('dist')) {
  let html = await readFile(file, 'utf8');
  if (!/<head\\b/i.test(html) || !/<\\/head>/i.test(html)) continue;
  html = html.replace(/<link\\b[^>]*\\brel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>/gi, '');
  html = html.replace(/<\\/head>/i, links + '</head>');
  await writeFile(file, html, 'utf8');
  changed++;
}
console.log('SMArt: favicon linked across ' + changed + ' public and admin HTML pages.');

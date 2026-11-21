import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const ORIGIN = 'https://sanmigueldeallende.art';
const market = JSON.parse(await readFile(path.join(ROOT, 'data/marketplace.json'), 'utf8'));
const site = JSON.parse(await readFile(path.join(ROOT, 'data/site-v5.json'), 'utf8'));

const filled = value => typeof value === 'string' && value.trim().length > 0;
const xml = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[c]));

const errors = [];
for (const artist of market.artists || []) {
  if (artist.published === false) continue;
  for (const key of ['name', 'slug', 'image', 'imageAltEs', 'imageAltEn', 'bioEs', 'bioEn']) {
    if (!filled(artist[key])) errors.push('Artista ' + artist.id + ': falta ' + key);
  }
}
for (const work of market.works || []) {
  if (work.published === false) continue;
  for (const key of ['slug', 'titleEs', 'titleEn', 'image', 'altEs', 'altEn', 'descriptionEs', 'descriptionEn']) {
    if (!filled(work[key])) errors.push('Obra ' + work.id + ': falta ' + key);
  }
}
function inspectMedia(node, location) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => inspectMedia(item, location + '[' + index + ']'));
    return;
  }
  if (!node || typeof node !== 'object') return;
  if (filled(node.src) && /\.(?:avif|webp|jpe?g|png)(?:\?|$)/i.test(node.src) && !filled(node.alt)) {
    errors.push('Imagen en ' + location + ': falta alt');
  }
  for (const [key, value] of Object.entries(node)) inspectMedia(value, location + '.' + key);
}
inspectMedia(site.pages, 'site.pages');
if (errors.length) {
  console.error('Faltan datos SEO. No se debe publicar sin revisar estas imágenes:\n' + errors.join('\n'));
  process.exit(1);
}

async function htmlFiles(folder) {
  const results = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const location = path.join(folder, entry.name);
    if (entry.isDirectory()) results.push(...await htmlFiles(location));
    else if (entry.isFile() && entry.name.endsWith('.html')) results.push(location);
  }
  return results;
}
function attribute(tag, name) {
  const match = tag.match(new RegExp('\\b' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', 'i'));
  return match ? (match[1] ?? match[2]) : null;
}
function publicUrl(src) {
  if (!src || /^(?:data:|blob:|javascript:|#)/i.test(src)) return null;
  try {
    const url = new URL(src, ORIGIN);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    return url.href;
  } catch { return null; }
}
const entries = [];
const missing = [];
for (const file of await htmlFiles(DIST)) {
  const relative = path.relative(DIST, file).split(path.sep).join('/');
  if (relative.startsWith('dashboard/')) continue;
  const html = await readFile(file, 'utf8');
  if (/<meta\s+name=["']robots["'][^>]*noindex/i.test(html)) continue;
  const pathname = relative === 'index.html'
    ? '/'
    : '/' + relative.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  const pageUrl = new URL(pathname, ORIGIN).href;
  const images = new Set();
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src = attribute(tag, 'src');
    const alt = attribute(tag, 'alt');
    if (alt === null || (!filled(alt) && attribute(tag, 'aria-hidden') !== 'true' && attribute(tag, 'role') !== 'presentation')) {
      missing.push(pathname + ' -> ' + (src || '(sin src)'));
      continue;
    }
    const url = publicUrl(src);
    if (url && /\.(?:avif|webp|jpe?g|png)(?:\?|$)/i.test(url)) images.add(url);
  }
  if (images.size) entries.push({ pageUrl, images: [...images] });
}
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
  entries.map(({ pageUrl, images }) =>
    '  <url><loc>' + xml(pageUrl) + '</loc>' +
    images.map(img => '<image:image><image:loc>' + xml(img) + '</image:loc></image:image>').join('') +
    '</url>'
  ).join('\n') + '\n</urlset>\n';
await writeFile(path.join(DIST, 'sitemap-images.xml'), sitemap, 'utf8');
const robotsPath = path.join(DIST, 'robots.txt');
let robots = await readFile(robotsPath, 'utf8');
if (!robots.includes('/sitemap-images.xml')) {
  robots += '\nSitemap: ' + ORIGIN + '/sitemap-images.xml\n';
  await writeFile(robotsPath, robots, 'utf8');
}
if (missing.length) {
  console.warn('Imágenes del HTML sin ALT descriptivo; revisar:\n' + missing.join('\n'));
}
console.log('SEO imágenes: ' + entries.length + ' páginas con imágenes indexables, sitemap generado.');

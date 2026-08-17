import fs from 'node:fs/promises';

const file = new URL('../data/site-v5.json', import.meta.url);
const data = JSON.parse(await fs.readFile(file, 'utf8'));

// Remap only verified artwork files that are shipped locally in /images.
const replacements = {
  'hero.webp': '/images/fernando-castaneda-parroquia-san-miguel.avif',
  'atardecer-board.webp': '/images/fernando-castaneda-paisaje-atardecer.avif',
  'abstract-board.webp': '/images/fernando-castaneda-mural-contemporaneo.avif',
  'parroquia-board.webp': '/images/fernando-castaneda-parroquia-san-miguel.avif',
  'artist.webp': '/images/fernando-castaneda-muralista.avif',
  'interior-before.webp': '/images/mural-interior-antes.avif',
  'interior-after.webp': '/images/mural-interior-terminado.avif'
};

function mapValue(value) {
  if (typeof value === 'string') {
    for (const [oldName, newPath] of Object.entries(replacements)) {
      if (value === `/assets/images/fernando/${oldName}` || value.endsWith(`/assets/images/fernando/${oldName}`)) return newPath;
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(mapValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapValue(v)]));
  return value;
}

await fs.writeFile(file, `${JSON.stringify(mapValue(data), null, 2)}\n`);
console.log('SMArt: verified artwork URLs mapped to local AVIF assets.');

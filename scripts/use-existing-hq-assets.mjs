import fs from 'node:fs/promises';

const file = new URL('../data/site-v5.json', import.meta.url);
const data = JSON.parse(await fs.readFile(file, 'utf8'));

// Only remap the large public-facing artwork for which we ship verified AVIF files.
// Smaller process/artist assets remain on their existing local URLs so the CMS keeps working.
const replacements = {
  'hero.webp': '/images/fernando-castaneda-parroquia-san-miguel.avif',
  'atardecer-board.webp': '/images/fernando-castaneda-paisaje-atardecer.avif',
  'abstract-board.webp': '/images/fernando-castaneda-mural-contemporaneo.avif',
  'parroquia-board.webp': '/images/fernando-castaneda-parroquia-san-miguel.avif'
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
console.log('SMArt: large artwork URLs mapped to verified local AVIF assets.');

import fs from 'node:fs/promises';

const targets = ['dist/index.html', 'dist/en/index.html'];
const img = (src, alt, pos = '50% 50%') => `<img class="hq-img" src="${src}" alt="${alt}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;object-position:${pos};display:block">`;
const botanical = `<svg viewBox="0 0 720 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustración botánica" style="width:100%;height:100%;display:block"><g fill="none" stroke="#9a765d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".68"><path d="M85 290C205 235 265 151 330 55"/><path d="M292 104c-56-56-106-45-133-11 49 9 91 18 133 11Z"/><path d="M332 78c29-58 74-70 113-53-28 36-65 53-113 53Z"/><path d="M255 158c-63-38-108-12-127 26 48-7 88-14 127-26Z"/><path d="M369 136c44-59 96-52 126-20-45 22-84 28-126 20Z"/><path d="M200 215c-59-17-91 12-99 47 38-13 70-27 99-47Z"/><path d="M405 188c55-41 102-22 123 14-47 6-85 2-123-14Z"/><path d="M463 260c69-47 124-28 151 7-57 9-106 6-151-7Z"/></g><g fill="#b46d48" opacity=".25"><path d="M332 78c29-58 74-70 113-53-28 36-65 53-113 53Z"/><path d="M369 136c44-59 96-52 126-20-45 22-84 28-126 20Z"/><path d="M463 260c69-47 124-28 151 7-57 9-106 6-151-7Z"/></g></svg>`;

for (const file of targets) {
  let html = await fs.readFile(file, 'utf8');
  html = html.replace(/<div class="ref-art" role="img" aria-label="Proyecto de mural exterior"><\/div>/g, img('/images/mural-interior-terminado.avif', 'Proyecto mural terminado'));
  html = html.replace(/<div class="ref-art" role="img" aria-label="Rótulo pintado a mano"><\/div>/g, img('/images/fernando-castaneda-mural-contemporaneo.avif', 'Detalle de pintura mural'));
  html = html.replace(/<div class="ref-art" role="img" aria-label="San Miguel de Allende"><\/div>/g, img('/images/fernando-castaneda-parroquia-san-miguel.avif', 'Mural inspirado en San Miguel de Allende', '50% 48%'));
  html = html.replace(/<div class="ref-art" role="img" aria-label="Ilustración botánica"><\/div>/g, botanical);
  await fs.writeFile(file, html);
}
console.log('SMArt: removed remaining low-resolution reference-image crops.');

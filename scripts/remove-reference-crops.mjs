import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';

const OUT=path.join(process.cwd(),'dist');

const local=p=>`/assets/images/fernando/${p}`;
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function photo(src,alt,caption=''){
  return `<figure class="figure ref-crop hq-media"><img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async">${caption?`<figcaption>${esc(caption)}</figcaption>`:''}</figure>`;
}
const botanical=`<figure class="figure ref-crop hq-media botanical-hq" aria-label="Ilustración botánica decorativa"><svg viewBox="0 0 900 430" role="img" aria-hidden="true"><g fill="none" stroke="#a85d43" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" opacity=".92"><path d="M730 430C650 345 617 271 634 191c12-57 45-105 99-145M637 251c-62-15-111-50-143-104M647 220c58-37 99-84 124-142M594 169c-48-7-90-28-126-65M678 145c51-31 88-69 112-114M641 310c-50 8-96-2-139-30M679 337c47-15 88-41 122-78"/><path d="M495 147c25 2 46-9 62-32-28-7-50 4-62 32Zm-27-43c21 2 38-7 52-27-24-6-42 3-52 27Zm304-26c-23 2-41-7-55-27 25-6 44 3 55 27Zm-269 202c28-1 50 11 67 35-31 7-54-5-67-35Zm294-21c-27 0-48 12-64 36 30 6 52-6 64-36Z"/></g><g fill="#a85d43" opacity=".65"><circle cx="634" cy="191" r="4"/><circle cx="641" cy="310" r="4"/><circle cx="679" cy="337" r="4"/></g></svg></figure>`;

async function patch(rel){
  const file=path.join(OUT,rel);
  let html=await readFile(file,'utf8');

  // The fourth project used a tiny crop from the reference screenshot.
  html=html.replace(/(<article class="ref-project">\s*)<figure class="figure ref-crop"[^>]*>[\s\S]*?<\/figure>(\s*<div><small>Casa particular<\/small>)/,
    `$1${photo(local('interior-board.webp'),'Intervención mural interior de gran formato')}$2`);

  // Keep the exact sign-block geometry, but use a real artwork file instead of the screenshot sprite.
  html=html.replace(/(<section class="ref-split sign-block">[\s\S]*?<div class="ref-split-art">)[\s\S]*?(<\/div><\/section>)/,
    `$1${photo(local('abstract-board.webp'),'Intervención pictórica contemporánea en un espacio comercial')}$2`);

  // Replace the remaining San Miguel screenshot crop with a real high-resolution mural image.
  html=html.replace(/(<div class="place-photo">)[\s\S]*?(<\/div><div class="place-copy">)/,
    `$1${photo(local('parroquia-board.webp'),'Mural inspirado en la arquitectura de San Miguel de Allende')}$2`);

  // The botanical element is decorative; render it as vector so it stays perfectly sharp at every size.
  html=html.replace(/(<div class="manifesto-art">)[\s\S]*?(<\/div><\/section>)/,
    `$1${botanical}$2`);

  if(!html.includes('botanical-hq')) throw new Error(`Reference crop cleanup did not apply to ${rel}`);
  await writeFile(file,html,'utf8');
}

await patch('index.html');
await patch(path.join('en','index.html'));
console.log('Removed remaining screenshot-based image crops without changing layout geometry.');

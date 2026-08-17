import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';

const OUT=path.join(process.cwd(),'dist');
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function photo(src,alt,caption=''){
  return `<figure class="figure ref-crop hq-media"><img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async">${caption?`<figcaption>${esc(caption)}</figcaption>`:''}</figure>`;
}
const botanical=`<figure class="figure botanical-reference" aria-label="Ilustración botánica decorativa"><img src="/assets/brand/botanical-reference.svg" alt="Ilustración botánica en tonos verde salvia y terracota" loading="eager" decoding="async" style="display:block;width:100%;height:100%;object-fit:contain;object-position:center;background:#fcf8f2"></figure>`;

async function patch(rel){
  const file=path.join(OUT,rel);
  let html=await readFile(file,'utf8');

  html=html.replace(/(<article class="ref-project">\s*)<figure class="figure ref-crop"[^>]*>[\s\S]*?<\/figure>(\s*<div><small>Casa particular<\/small>)/,
    `$1${photo('/images/fernando-castaneda-parroquia-san-miguel.avif','Mural inspirado en la arquitectura de San Miguel de Allende')}$2`);

  html=html.replace(/(<section class="ref-split sign-block">[\s\S]*?<div class="ref-split-art">)[\s\S]*?(<\/div><\/section>)/,
    `$1${photo('/images/fernando-castaneda-mural-contemporaneo.avif','Intervención pictórica contemporánea realizada a mano')}$2`);

  html=html.replace(/(<div class="place-photo">)[\s\S]*?(<\/div><div class="place-copy">)/,
    `$1${photo('/images/fernando-castaneda-parroquia-san-miguel.avif','Mural inspirado en la arquitectura de San Miguel de Allende')}$2`);

  html=html.replace(/(<div class="manifesto-art">)[\s\S]*?(<\/div><\/section>)/,
    `$1${botanical}$2`);

  if(!html.includes('/assets/brand/botanical-reference.svg')) throw new Error(`Vector botanical did not apply to ${rel}`);
  await writeFile(file,html,'utf8');
}

await patch('index.html');
await patch(path.join('en','index.html'));
console.log('SMArt: crisp vector botanical installed without changing layout geometry.');

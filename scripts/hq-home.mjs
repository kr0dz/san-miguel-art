import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';

const ROOT=process.cwd();
const OUT=path.join(ROOT,'dist');
const data=JSON.parse(await readFile(path.join(ROOT,'data/site-v5.json'),'utf8'));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function figure(im={},captionOverride=''){
  if(!im?.src)return'';
  const caption=captionOverride||im.caption||'';
  return `<figure class="figure ref-crop hq-media"><img src="${esc(im.src)}" alt="${esc(im.alt||'')}" loading="lazy" decoding="async">${caption?`<figcaption>${esc(caption)}</figcaption>`:''}</figure>`;
}

function localDefault(im,fallback){
  if(!im?.src)return {src:fallback,alt:im?.alt||''};
  if(String(im.src).includes('/assets/images/fernando/interior-board.webp')) return {...im,src:fallback};
  return im;
}

function patchHero(html,p){
  const im=p.hero?.images?.[0];
  if(!im?.src)return html;
  return html.replace(/(<div class="ref-hero-art">)[\s\S]*?(<\/div><\/section>)/,(_,a,b)=>a+figure(im)+b);
}

function patchProjects(html,p){
  const portfolio=(p.sections||[]).find(s=>s.id==='portfolio');
  const items=portfolio?.items||[];
  let i=0;
  return html.replace(/<article class="ref-project">[\s\S]*?<\/article>/g,block=>{
    const im=items[i++];
    if(!im?.src)return block;
    return block.replace(/<figure class="figure ref-crop"[\s\S]*?<\/figure>/,figure(im));
  });
}

function patchTransformation(html,p){
  const murals=(p.sections||[]).find(s=>s.id==='murals');
  const imgs=murals?.images||[];
  if(!imgs.length)return html;
  const before=localDefault(imgs[0],'/images/mural-interior-antes.avif');
  const after=localDefault(imgs[1]||imgs[0],'/images/mural-interior-terminado.avif');
  const pair=figure(before,'ANTES')+figure(after,'DESPUÉS');
  return html.replace(/(<div class="ref-before-after before-after">)[\s\S]*?(<\/div><div class="transform-copy">)/,(_,a,b)=>a+pair+b);
}

function patchArtist(html,p){
  const artist=(p.sections||[]).find(s=>s.id==='artist');
  const im=artist?.images?.[0];
  if(!im?.src)return html;
  return html.replace(/(<div class="artist-photo">)[\s\S]*?(<\/div><div class="artist-copy">)/,(_,a,b)=>a+figure(im)+b);
}

function patchHospitality(html,p){
  const key=String(p.lang||'').toLowerCase().startsWith('en')?'hospitality_en':'hospitality_es';
  const im=data.pages[key]?.hero?.images?.[0];
  if(!im?.src)return html;
  return html.replace(/(<section class="ref-split hospitality-block"><div class="ref-split-art">)[\s\S]*?(<\/div><div class="ref-split-copy">)/,(_,a,b)=>a+figure(im)+b);
}

async function patchPage(key){
  const p=data.pages[key];
  if(!p)return;
  const rel=p.path==='/'?'index.html':path.join(p.path.replace(/^\//,'').replace(/\/$/,''),'index.html');
  const file=path.join(OUT,rel);
  let html=await readFile(file,'utf8');
  const css='<style>.hq-media{overflow:hidden;background:#e5ddd2}.hq-media>img{display:block;width:100%;height:100%;object-fit:cover}.ref-hero-art .hq-media>img,.ref-split-art .hq-media>img,.artist-photo .hq-media>img,.place-photo .hq-media>img,.ref-before-after .hq-media>img{width:100%;height:100%;object-fit:cover}.ref-project .hq-media>img{width:100%;height:100%;object-fit:cover}</style>';
  html=html.replace('</head>',css+'</head>');
  html=patchHero(html,p);
  html=patchProjects(html,p);
  html=patchTransformation(html,p);
  html=patchArtist(html,p);
  html=patchHospitality(html,p);
  await writeFile(file,html,'utf8');
}

await patchPage('home_es');
await patchPage('home_en');
console.log('Applied verified AVIF artwork inside stable SMArt layout boxes.');

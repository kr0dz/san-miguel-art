import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';

const ROOT=process.cwd();
const OUT=path.join(ROOT,'dist');
const data=JSON.parse(await readFile(path.join(ROOT,'data/site-v5.json'),'utf8'));

function addFinalCss(html){
  if(!html.includes('/assets/css/reference-final.css')) html=html.replace('</head>','<link rel="stylesheet" href="/assets/css/reference-final.css"></head>');
  if(!html.includes('/assets/brand/favicon.svg')) html=html.replace('</head>','<link rel="icon" type="image/svg+xml" href="/assets/brand/favicon.svg"><link rel="shortcut icon" href="/assets/brand/favicon.svg"></head>');
  return html;
}

function sectionBlocks(inside){
  return [...inside.matchAll(/<section class="([^"]+)"[^>]*>[\s\S]*?<\/section>/g)].map(m=>({cls:m[1],html:m[0]}));
}

function fixedReferenceOrder(html,p){
  const token='<main class="reference-home">';
  const start=html.indexOf(token),end=html.indexOf('</main>',start);
  if(start<0||end<0) return html;
  const before=html.slice(0,start+token.length),inside=html.slice(start+token.length,end),after=html.slice(end);
  const blocks=sectionBlocks(inside);
  const one=name=>blocks.find(x=>x.cls.split(/\s+/).includes(name))?.html||'';
  const sections=Object.fromEntries((p.sections||[]).map(s=>[s.id,s]));
  const enabled=id=>sections[id]?.enabled!==false;

  const hero=one('ref-hero');
  const services=enabled('services') ? one('manifesto')+one('ref-services') : '';
  const portfolio=enabled('portfolio') ? one('ref-projects') : '';
  const murals=enabled('murals') ? blocks.filter(x=>x.cls.includes('sign-block')||x.cls.includes('hospitality-block')||x.cls.split(/\s+/).includes('transformation')).map(x=>x.html).join('') : '';
  const process=enabled('process') ? one('ref-process') : '';
  const artist=enabled('artist') ? one('artist-place')+one('ref-faq') : '';
  const closing=enabled('closing') ? one('ref-final') : '';

  const known=new Set(['services','portfolio','murals','process','artist','closing']);
  const supplements=(p.sections||[]).filter(s=>!known.has(s.id)&&s.enabled!==false).map(s=>blocks.find(x=>x.html.includes(`data-section="${s.id}"`))?.html||'').filter(Boolean).join('');

  return before+hero+services+portfolio+murals+process+artist+supplements+closing+after;
}

async function processPage(key,p){
  const rel=p.path==='/'?'index.html':path.join(p.path.replace(/^\//,'').replace(/\/$/,''),'index.html');
  const file=path.join(OUT,rel);
  let html=await readFile(file,'utf8');
  html=addFinalCss(html);
  if(key==='home_es'||key==='home_en') html=fixedReferenceOrder(html,p);
  await writeFile(file,html,'utf8');
}

for(const [key,p] of Object.entries(data.pages)) await processPage(key,p);
console.log('SMArt: finalized approved reference proportions, home section order and favicon.');

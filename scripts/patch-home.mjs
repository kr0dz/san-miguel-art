import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';

const ROOT=process.cwd();
const OUT=path.join(ROOT,'dist');
const data=JSON.parse(await readFile(path.join(ROOT,'data/site-v5.json'),'utf8'));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isEn=p=>String(p.lang||'').toLowerCase().startsWith('en');

function resolved(value,oldValue,referenceValue){return value==null||value===''||value===oldValue?referenceValue:value}
function action(obj={},solid=false){if(!obj?.label)return'';const cls=`button ${solid?'solid':''}`.trim();if(obj.href)return `<a class="${cls}" href="${esc(obj.href)}">${esc(obj.label)}</a>`;return `<button class="${cls}" data-interest="${esc(obj.interest||obj.label)}">${esc(obj.label)}</button>`}
function sameAction(a={},b={}){return String(a.label||'')===String(b.label||'')&&String(a.href||'')===String(b.href||'')&&String(a.interest||'')===String(b.interest||'')}
function patchSectionTag(html,className,tag,value){const re=new RegExp(`(<section class="[^"]*${className}[^"]*"[^>]*>[\\s\\S]*?<${tag}[^>]*>)[\\s\\S]*?(<\\/${tag}>)`);return html.replace(re,(_,a,b)=>a+esc(value)+b)}
function patchMini(html,className,value){const re=new RegExp(`(<section class="[^"]*${className}[^"]*"[^>]*>[\\s\\S]*?<div class="mini-heading">)[\\s\\S]*?(<\\/div>)`);return html.replace(re,(_,a,b)=>a+esc(value)+b)}
function patchHomeFields(html,p){const en=isEn(p),h=p.hero||{},sections=Object.fromEntries((p.sections||[]).map(s=>[s.id,s]));
 const heroDefaults=en?{
  eyebrow:'Murals · Hand-painted signs · Commissions',refEyebrow:'MURALS · SIGNS · SAN MIGUEL DE ALLENDE',
  title:'Art made to transform spaces.',refTitle:'Hand-painted murals and signs in San Miguel de Allende',
  body:'Custom murals, hand-painted signs and commissioned artwork for homes, hotels, restaurants and businesses in San Miguel de Allende.',refBody:'We transform walls, facades and spaces into one-of-a-kind pieces made for each place.',
  primary:{label:'Explore murals',href:'/en/murals-san-miguel-de-allende/'},refPrimary:{label:'REQUEST A QUOTE',interest:'Mural or sign project'},
  secondary:{label:'Request a quote',interest:'Art project'},refSecondary:{label:'VIEW PROJECTS',href:'#projects'}
 }:{
  eyebrow:'Murales · Rótulos · Comisiones · San Miguel de Allende',refEyebrow:'MURALES Y RÓTULOS PINTADOS A MANO',
  title:'Arte hecho para transformar espacios.',refTitle:'Murales y rótulos pintados a mano en San Miguel de Allende',
  body:'Murales personalizados, rótulos pintados a mano y pintura por encargo para residencias, hoteles, restaurantes y negocios en San Miguel de Allende.',refBody:'Transformamos muros, fachadas y espacios en obras únicas, hechas con tiempo, oficio y pensadas para cada lugar.',
  primary:{label:'Ver murales',href:'/murales-san-miguel-de-allende/'},refPrimary:{label:'COTIZA TU PROYECTO',interest:'Mural o rótulo'},
  secondary:{label:'Cotizar proyecto',interest:'Proyecto artístico'},refSecondary:{label:'VER PROYECTOS',href:'#projects'}
 };
 const eyebrow=resolved(h.eyebrow,heroDefaults.eyebrow,heroDefaults.refEyebrow),title=resolved(h.title,heroDefaults.title,heroDefaults.refTitle),body=resolved(h.body,heroDefaults.body,heroDefaults.refBody);
 const primary=sameAction(h.primary,heroDefaults.primary)?heroDefaults.refPrimary:(h.primary||{}),secondary=sameAction(h.secondary,heroDefaults.secondary)?heroDefaults.refSecondary:(h.secondary||{});
 html=html.replace(/<div class="ref-hero-copy">[\s\S]*?<\/div><div class="ref-hero-art">/,`<div class="ref-hero-copy"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1>${body?`<p>${esc(body)}</p>`:''}<div class="hero-actions">${action(primary,true)}${action(secondary,false)}</div></div><div class="ref-hero-art">`);
 const services=sections.services||{};
 const servicesTitle=resolved(services.title,en?'Made for the place, not pulled from a template.':'No vendemos una fórmula. Creamos para el lugar.',en?'A wall can be much more than a wall.':'Un muro puede ser mucho más que una pared.');
 const servicesBody=resolved(services.body,en?'':'Puedes contratar una intervención completa o comenzar con una idea todavía abierta.',en?'Every project begins with a place, a story and an intention. We paint by hand to create something that belongs there.':'Cada proyecto nace de un lugar, una historia y una intención. Pintamos a mano para crear belleza que permanece y conecta con lo que somos.');
 html=patchSectionTag(html,'manifesto','h2',servicesTitle);if(servicesBody)html=patchSectionTag(html,'manifesto','p',servicesBody);
 html=patchMini(html,'ref-services',resolved(services.eyebrow,en?'Art services':'Servicios artísticos',en?'WHAT WE DO':'LO QUE HACEMOS'));
 const portfolio=sections.portfolio||{};html=patchSectionTag(html,'ref-projects','h2',resolved(portfolio.title,en?'The proof is on the wall.':'La prueba está en el muro.',en?'PROJECTS THAT TRANSFORM SPACES':'PROYECTOS QUE TRANSFORMAN ESPACIOS'));
 const murals=sections.murals||{};if(Object.keys(murals).length){html=patchSectionTag(html,'transformation','h3',resolved(murals.title,en?'':'La arquitectura también puede formar parte de la obra.',en?'Every project begins with a vision and becomes something real.':'Cada proyecto comienza con una visión y se convierte en algo real.'))}
 const process=sections.process||{};html=patchMini(html,'ref-process',resolved(process.title,en?'From an empty wall to a clear proposal.':'De una pared vacía a una propuesta concreta.',en?'OUR PROCESS':'NUESTRO PROCESO'));
 const artist=sections.artist||{};html=patchSectionTag(html,'artist-place','h2',resolved(artist.title,'Fernando Castañeda',en?'PAINTED BY HAND. DESIGNED TO BELONG.':'PINTADO A MANO. DISEÑADO PARA PERTENECER AL LUGAR.'));
 const closing=sections.closing||{};html=patchSectionTag(html,'ref-final','h2',resolved(closing.title,en?'What would you like to transform?':'¿Qué quieres transformar?',en?'DO YOU HAVE A WALL IN MIND?':'¿TIENES UNA PARED EN MENTE?'));
 const oldCta=en?'Message us on WhatsApp':'Hablar por WhatsApp',ctaLabel=resolved(closing.cta,oldCta,en?'REQUEST A QUOTE':'COTIZA TU PROYECTO');
 html=html.replace(/(<section class="ref-final">[\s\S]*?<div>)[\s\S]*?(<\/div><\/section>)/,(_,a,b)=>`${a}<button class="button solid" data-interest="${esc(closing.interest||'Art project')}">${esc(ctaLabel)}</button><button class="button dark-outline" data-interest="${esc(closing.interest||'Art project')}">${en?'WHATSAPP US':'ESCRÍBENOS POR WHATSAPP'}</button>${b}`);
 return html;
}
function genericSection(s,en){if(s.enabled===false)return'';const head=`<div class="section-head"><div><div class="eyebrow">${esc(s.eyebrow||'')}</div><h2>${esc(s.title||'')}</h2></div>${s.body?`<p>${esc(s.body)}</p>`:''}</div>`;
 if(s.type==='gallery')return `<section class="section" data-section="${esc(s.id)}">${head}<div class="portfolio">${(s.items||[]).map(it=>`<article class="project"><div class="project-image">${it.src?`<img src="${esc(it.src)}" alt="${esc(it.alt||'')}" loading="lazy">`:''}</div><div class="project-info"><span>${esc(it.kicker||'')}</span><h3>${esc(it.title||'')}</h3>${it.cta?`<button class="text-link" data-interest="${esc(it.title||it.cta)}">${esc(it.cta)} ↗</button>`:''}</div></article>`).join('')}</div></section>`;
 if(s.type==='services')return `<section class="section" data-section="${esc(s.id)}">${head}<div class="services-list">${(s.items||[]).map((it,i)=>`<a class="service-row" href="${esc(it.href||'#')}"><span class="idx">${String(i+1).padStart(2,'0')}</span><span class="kicker">${esc(it.kicker||'')}</span><h3>${esc(it.title||'')}</h3><p>${esc(it.body||'')}</p><span class="arrow">${esc(it.cta|| (en?'Explore':'Ver más'))} ↗</span></a>`).join('')}</div></section>`;
 if(s.type==='process')return `<section class="section" data-section="${esc(s.id)}">${head}<ol class="process-list">${(s.items||[]).map((it,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><div><strong>${esc(it.title||'')}</strong><p>${esc(it.body||'')}</p></div></li>`).join('')}</ol></section>`;
 if(s.type==='videos'){const items=(s.items||[]).filter(v=>v?.published!==false&&v?.url);if(!items.length)return'';return `<section class="section paper" data-section="${esc(s.id)}">${head}<div class="videos">${items.map(v=>`<article class="video-card"><div class="video-copy"><h3>${esc(v.title||'Video')}</h3><p>${esc(v.description||v.body||'')}</p><a href="${esc(v.url)}" target="_blank" rel="noopener">${en?'Watch video':'Ver video'} ↗</a></div></article>`).join('')}</div></section>`}
 if(s.type==='cta')return `<section class="cta-section" data-section="${esc(s.id)}"><div class="eyebrow">${esc(s.eyebrow||'')}</div><h2>${esc(s.title||'')}</h2>${s.body?`<p>${esc(s.body)}</p>`:''}<button class="button solid" data-interest="${esc(s.interest||s.cta||'Art project')}">${esc(s.cta||'WhatsApp')}</button></section>`;
 return `<section class="section paper" data-section="${esc(s.id)}">${head}</section>`;
}
function reorderHome(html,p){const startToken='<main class="reference-home">',start=html.indexOf(startToken),end=html.indexOf('</main>',start);if(start<0||end<0)return html;const before=html.slice(0,start+startToken.length),inside=html.slice(start+startToken.length,end),after=html.slice(end);
 const sections=[...inside.matchAll(/<section class="([^"]+)"[^>]*>[\s\S]*?<\/section>/g)].map(m=>({cls:m[1],html:m[0]}));
 const one=name=>sections.find(x=>x.cls.split(/\s+/).includes(name))?.html||'';
 const hero=one('ref-hero');
 const groups={
  services:one('manifesto')+one('ref-services'),
  portfolio:one('ref-projects'),
  murals:sections.filter(x=>x.cls.includes('sign-block')||x.cls.includes('hospitality-block')||x.cls.split(/\s+/).includes('transformation')).map(x=>x.html).join(''),
  process:one('ref-process'),
  artist:one('artist-place')+one('ref-faq'),
  closing:one('ref-final')
 };
 const en=isEn(p),ordered=[];let supplementalMuralsInserted=false;const hasMurals=(p.sections||[]).some(s=>s.id==='murals');
 for(const s of p.sections||[]){if(s.enabled===false)continue;let block='';if(s.id==='services'&&s.type==='services')block=groups.services;else if(s.id==='portfolio'&&s.type==='gallery')block=groups.portfolio;else if(s.id==='murals'&&s.type==='feature'){block=groups.murals;supplementalMuralsInserted=true}else if(s.id==='process'&&s.type==='process')block=groups.process;else if(s.id==='artist'&&s.type==='feature')block=groups.artist;else if(s.id==='closing'&&s.type==='cta')block=groups.closing;else block=genericSection(s,en);if(block)ordered.push(block);if(!hasMurals&&!supplementalMuralsInserted&&s.id==='portfolio'&&groups.murals){ordered.push(groups.murals);supplementalMuralsInserted=true}}
 if(!supplementalMuralsInserted&&groups.murals)ordered.splice(Math.min(2,ordered.length),0,groups.murals);
 return before+hero+ordered.join('')+after;
}
async function patchPage(key){const p=data.pages[key];if(!p)return;const rel=p.path==='/'?'index.html':path.join(p.path.replace(/^\//,'').replace(/\/$/,''),'index.html'),file=path.join(OUT,rel);let html=await readFile(file,'utf8');html=patchHomeFields(html,p);html=reorderHome(html,p);await writeFile(file,html,'utf8')}
await patchPage('home_es');
await patchPage('home_en');
console.log('Patched SMArt reference homes to use CMS values, visibility and section order.');

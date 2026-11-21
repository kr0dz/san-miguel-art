import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
const OUT=path.join(process.cwd(),'dist');
const market=JSON.parse(await readFile('data/marketplace.json','utf8'));
const works=market.works.filter(w=>w.published!==false&&market.artists.some(a=>a.id===w.artistId&&a.published!==false));
const artist=market.artists.find(a=>a.published!==false&&a.featured)||market.artists.find(a=>a.published!==false);
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20 20 4M7 4h13v13"/></svg>';
const mail='mailto:sanmigueldeallendetech@gmail.com?subject=';
const t=(en,es,eng)=>en?eng:es;
const workURL=(w,en)=>'/'+(en?'en/artworks':'obras')+'/'+encodeURIComponent(w.slug)+'/';
function card(w,i,en){
 const owner=market.artists.find(a=>a.id===w.artistId)||artist||{};
 const title=t(en,w.titleEs,w.titleEn),alt=t(en,w.altEs,w.altEn),category=t(en,w.categoryEs,w.categoryEn);
 return `<a class="sm-work" href="${e(workURL(w,en))}"><span class="sm-work-media"><img src="${e(w.image)}" alt="${e(alt)}" loading="lazy" decoding="async"></span><span class="sm-work-meta"><span><small>${e(owner.name)} · ${e(category)}</small><h3>${e(title)}</h3></span><span class="sm-work-number">${String(i+1).padStart(2,'0')} / ${String(works.length).padStart(2,'0')}</span></span></a>`;
}
function home(en){
 const main=works.find(w=>w.id==='composicion-contemporanea')||works[0];
 const secondary=works.find(w=>w.id==='paisaje-atardecer')||works[1]||works[0];
 const a=artist||{name:'SMArt',slug:'',image:'/images/fernando-castaneda-muralista.avif'};
 const segments=t(en,
 [['01 / DESCUBRE','Obras','Explora las piezas y proyectos del catálogo.','Ver obras','/obras/'],['02 / IMAGINA','Murales','Pintura e intervenciones hechas para cada espacio.','Ver murales','/murales-san-miguel-de-allende/'],['03 / ENCARGA','A medida','Una pintura o proyecto creado a partir de tu idea.','Ver encargos','/pintura-por-encargo-san-miguel-de-allende/']],
 [['01 / DISCOVER','Artworks','Browse the collection of available artwork and projects.','Explore works','/en/artworks/'],['02 / CREATE','Murals','Original paintings and interventions for your walls.','See murals','/en/murals-san-miguel-de-allende/'],['03 / COMMISSION','Custom work','Discuss a painting or creative project made for your space.','Explore commissions','/en/commissioned-painting-san-miguel-de-allende/']]);
 const services=segments.map(([num,name,description,cta,href])=>`<a class="sm-scope-card" href="${href}"><span class="sm-scope-num">${num}</span><div><h3>${name}</h3><p>${description}</p><span class="sm-scope-go"><span>${cta}</span>${icon}</span></div></a>`).join('');
 return `<main class="sm-edition-home" id="main">
  <section class="sm-hero" aria-labelledby="sm-hero-title">
    <div class="sm-hero-copy">
      <span class="sm-kicker">${t(en,'ARTE · ARTISTAS · SAN MIGUEL DE ALLENDE','ART · ARTISTS · SAN MIGUEL DE ALLENDE')}</span>
      <h1 class="sm-hero-title" id="sm-hero-title"><span>San Miguel</span><em>de Allende</em><strong>${t(en,'es arte.','is art.')}</strong></h1>
      <div class="sm-hero-bottom"><p>${t(en,'Conoce a los artistas, descubre su obra y encuentra algo que quieras llevarte a casa.','Meet the artists, explore their work and find something worth bringing home.')}</p>
        <div class="sm-hero-actions"><a class="sm-primary-link sm-arrow" href="${en?'/en/artworks/':'/obras/'}">${t(en,'Explorar obras','Explore the art')}${icon}</a><a class="sm-secondary-link" href="${en?'/en/artists/':'/artistas/'}">${t(en,'Conocer artistas','Meet the artists')}</a></div>
      </div><span class="sm-hero-number">SMArt — MÉXICO / 2026</span>
    </div>
    <div class="sm-hero-stage">
      ${main?`<a href="${e(workURL(main,en))}" class="sm-stage-frame" aria-label="${e(t(en,main.titleEs,main.titleEn))}"><img src="${e(main.image)}" alt="${e(t(en,main.altEs,main.altEn))}" loading="eager" fetchpriority="high" decoding="async"></a>`:''}
      ${secondary?`<a href="${e(workURL(secondary,en))}" class="sm-stage-small" aria-label="${e(t(en,secondary.titleEs,secondary.titleEn))}"><img src="${e(secondary.image)}" alt="${e(t(en,secondary.altEs,secondary.altEn))}" loading="eager" decoding="async"></a>`:''}
      <span class="sm-stage-sticker">SM<br>ART<br>INDEX</span><span class="sm-stage-vertical">SAN MIGUEL DE ALLENDE · ART</span>
    </div>
  </section>
  <div class="sm-index-strip"><span>SMArt / 001</span><span class="sm-dot" aria-hidden="true"></span><span>${t(en,'OTRA FORMA DE DESCUBRIR ARTE','A DIFFERENT WAY TO DISCOVER ART')}</span><span class="sm-dot" aria-hidden="true"></span><span>SAN MIGUEL DE ALLENDE, MX</span></div>
  <section class="sm-intro" aria-labelledby="sm-intro-title">
    <div class="sm-intro-side"><span class="sm-kicker">${t(en,'01 / LA IDEA','01 / THE IDEA')}</span><span class="sm-index" aria-hidden="true">01</span></div>
    <div class="sm-intro-content"><h2 id="sm-intro-title">${t(en,'Aquí el arte','Every work')}<br><span>${t(en,'tiene nombre.','has a name.')}</span></h2>
      <p>${t(en,'Detrás de cada obra hay alguien que la creó. SMArt reúne artistas, pinturas y proyectos de San Miguel de Allende en un mismo lugar.','Behind every work is an artist. SMArt presents artists, artworks and projects connected to San Miguel de Allende in one place.')}</p>
      <a class="sm-arrow" href="${en?'/en/artists/':'/artistas/'}">${t(en,'Descubre a los artistas','Discover the artists')}${icon}</a>
    </div>
  </section>
  <section class="sm-gallery" aria-labelledby="sm-gallery-title">
    <div class="sm-gallery-top"><div><span class="sm-kicker">${t(en,'02 / LA SELECCIÓN','02 / THE SELECTION')}</span><h2 id="sm-gallery-title">${t(en,'Míralo','Worth')}<br><em>${t(en,'de cerca.','a closer look.')}</em></h2></div>
      <a class="sm-arrow" href="${en?'/en/artworks/':'/obras/'}">${t(en,'Ver todas las obras','View all artworks')}${icon}</a>
    </div><div class="sm-gallery-grid">${works.slice(0,8).map((w,i)=>card(w,i,en)).join('')}</div>
  </section>
  ${artist?`<section class="sm-artist" aria-labelledby="sm-artist-title">
    <figure class="sm-artist-photo"><img src="${e(a.image)}" alt="${e(t(en,a.imageAltEs,a.imageAltEn))}" loading="lazy" decoding="async"></figure>
    <div class="sm-artist-content"><span class="sm-kicker">${t(en,'03 / ARTISTA DESTACADO','03 / ARTIST SPOTLIGHT')}</span>
      <h2 id="sm-artist-title">${e(a.name).replace(' ', '<br><em>')}</em></h2>
      <p>${e(t(en,a.bioEs,a.bioEn))}</p>
      <a class="sm-arrow" href="${en?'/en/artists/':'/artistas/'}${e(a.slug)}/">${t(en,'Conocer al artista','Explore artist profile')}${icon}</a>
    </div>
  </section>`:''}
  <section class="sm-scope" aria-labelledby="sm-scope-title">
    <span class="sm-kicker">${t(en,'04 / QUÉ ENCUENTRAS','04 / WHAT YOU CAN FIND')}</span>
    <div class="sm-scope-heading"><h2 id="sm-scope-title">${t(en,'Arte a tu manera.','Art, in every form.')}</h2>
      <p>${t(en,'Una obra que te gusta, un mural para tu espacio o una idea por desarrollar. Hay distintas formas de encontrar arte aquí.','From a single artwork to a mural created for a space: discover the different ways to work with SMArt.')}</p></div>
    <div class="sm-scope-grid">${services}</div>
  </section>
  <section class="sm-quiet" aria-labelledby="sm-ending-title">
    <div><span class="sm-kicker">${t(en,'05 / HABLEMOS','05 / LET’S TALK')}</span></div>
    <div class="sm-quiet-right"><h2 id="sm-ending-title">${t(en,'¿Tienes','An idea')}<br><em>${t(en,'una idea?','in mind?')}</em></h2>
      <p>${t(en,'¿Buscas una obra, un mural o algo hecho especialmente para ti? Cuéntanos lo que tienes en mente.','Looking for artwork, a mural or something made just for you? Tell us what you have in mind.')}</p>
      <a class="sm-arrow" href="${mail+encodeURIComponent(t(en,'Consulta sobre arte — SMArt','Art inquiry — SMArt'))}">${t(en,'Contactar a SMArt','Contact SMArt')}${icon}</a>
    </div>
  </section>
  <div class="sm-credit"><span>SMArt / SAN MIGUEL DE ALLENDE</span><span>${t(en,'ARTE LOCAL. PERSONAS REALES.','LOCAL ART. REAL PEOPLE.')}</span></div>
</main>`;
}
function enhance(html,en,isHome){
 html=html.replace(/<body\b([^>]*)>/i,(all,attr)=>'<body'+attr+' class="sm-edition">');
 html=html.replace(/<a class="brand" href="([^"]+)">SMArt<\/a>/,
 `<a class="brand sm-logo" href="${en?'/en/':'/'}" aria-label="SMArt — San Miguel de Allende"><span class="sm-logo-main">SM<span>Art</span><i aria-hidden="true">.</i></span><small>San Miguel de Allende</small></a>`);
 html=html.replace(/(<header class="header reference-header">[\s\S]*?<nav class="nav">[\s\S]*?)(<\/nav>)/,
 (all,before,after)=>before+`<a class="sm-nav-contact" href="${mail+encodeURIComponent(t(en,'Consulta de arte','Art inquiry'))}">${t(en,'Contacto','Contact')}${icon}</a>`+after);
 html=html.replace(/(<button class="menu"[^>]*>)[\s\S]*?(<\/button>)/,(all,open,close)=>open.replace('<button ','<button aria-expanded="false" aria-controls="smart-mobile-nav" ')+'<span class="menu-bars" aria-hidden="true"><i></i><i></i></span>'+close);
 html=html.replace(/<nav class="mobile-nav"/,'<nav class="mobile-nav" id="smart-mobile-nav" aria-label="Mobile navigation"');
 html=html.replace('</head>','<link rel="stylesheet" href="/assets/css/art-index.css?v=mobile-fix-20261121">'+(isHome?'<link rel="preload" as="image" href="/images/fernando-castaneda-mural-contemporaneo.avif">':'')+'</head>');
 html=html.replace('src="/assets/js/site-v5.js"','src="/assets/js/site-v5.js?v=mobile-fix-20261121"');
 html=html.replace('</body>','<script src="/assets/js/art-index.js?v=mobile-fix-20261121" defer></script></body>');
 if(isHome){
  const re=/<main class="reference-home">[\s\S]*?<\/main>/;
  if(!re.test(html))throw new Error('Cannot find current homepage main.');
  html=html.replace(re,home(en));
 }
 return html;
}
async function crawl(dir){
 let res=[];for(const ent of await readdir(dir,{withFileTypes:true})){
  const p=path.join(dir,ent.name);
  if(ent.isDirectory())res.push(...await crawl(p));
  else if(ent.isFile()&&ent.name==='index.html')res.push(p);
 }return res;
}
let changed=0;
for(const file of await crawl(OUT)){
 const rel=path.relative(OUT,file).split(path.sep).join('/');
 if(rel.startsWith('dashboard/')||rel.includes('artist-portal'))continue;
 let html=await readFile(file,'utf8');
 if(!html.includes('<header class="header reference-header">'))continue;
 const en=rel.startsWith('en/');
 const isHome=rel==='index.html'||rel==='en/index.html';
 html=enhance(html,en,isHome);
 await writeFile(file,html,'utf8');changed++;
}
console.log('SMArt Art Index: '+changed+' pages redesigned, including two curated editorial homepages.');

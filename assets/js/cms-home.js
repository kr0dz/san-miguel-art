(()=>{
const CONTENT_URL='https://raw.githubusercontent.com/kr0dz/san-miguel-art/main/data/site-content.json';
const $=s=>document.querySelector(s);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const askLabel=t=>esc(t||'Consultar disponibilidad y precio');
function setText(sel,v){const el=$(sel);if(el&&v!=null)el.textContent=v}
function hide(sel,v){const el=$(sel);if(el)el.hidden=v===false}
function mediaMarkup(images=[],mode='single',context='default'){
 const list=images.filter(x=>x&&x.src); if(!list.length)return '';
 const fig=im=>`<figure class="cms-figure"><img src="${esc(im.src)}" alt="${esc(im.alt||'')}" loading="lazy">${im.caption?`<figcaption>${esc(im.caption)}</figcaption>`:''}</figure>`;
 if(mode==='single')return `<div class="cms-single">${fig(list[0])}</div>`;
 if(mode==='beforeAfter')return `<div class="cms-before-after">${list.slice(0,2).map(fig).join('')}</div>`;
 if(mode==='carousel')return `<div class="cms-carousel" tabindex="0">${list.map(fig).join('')}</div>`;
 return `<div class="cms-gallery ${context==='hero'?'hero-gallery':''}">${list.map(fig).join('')}</div>`;
}
function renderHero(s){hide('#heroSection',s.enabled);setText('#heroEyebrow',s.eyebrow);setText('#heroTitle',s.title);setText('#heroBody',s.body);setText('#heroPrimary',s.primaryLabel);setText('#heroSecondary',s.secondaryLabel);const m=$('#heroMedia');if(m)m.innerHTML=mediaMarkup(s.images,s.mode,'hero')}
function renderWorks(s){hide('#worksSection',s.enabled);setText('#worksEyebrow',s.eyebrow);setText('#worksTitle',s.title);setText('#worksBody',s.body);const root=$('#worksGrid');if(!root)return;const items=(s.items||[]).filter(x=>x&&x.src);const show=s.mode==='single'?items.slice(0,1):items;root.className=`works-grid mode-${esc(s.mode||'gallery')}`;root.innerHTML=show.map((it,i)=>`<article class="work-card ${i===0?'featured':''}"><div class="work-media"><img src="${esc(it.src)}" alt="${esc(it.alt||'')}" loading="lazy"></div><div class="work-meta"><small>${esc(it.kicker||'')}</small><h3>${esc(it.title||'Obra')}</h3><button class="ask jsq" data-i="${esc(it.title||'Obra')}">${askLabel(it.cta)} ↗</button></div></article>`).join('')}
function renderMurals(s){hide('#muralsSection',s.enabled);setText('#muralsEyebrow',s.eyebrow);setText('#muralsTitle',s.title);setText('#muralsBody',s.body);const m=$('#muralsMedia');if(m)m.innerHTML=mediaMarkup(s.images,s.mode)}
function renderArtist(s){hide('#artistSection',s.enabled);setText('#artistEyebrow',s.eyebrow);setText('#artistTitle',s.title);setText('#artistBody',s.body);const m=$('#artistMedia');if(m)m.innerHTML=mediaMarkup(s.images,s.mode)}
function videoEmbed(v){const u=String(v.url||'');let m=u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);if(m)return `<iframe loading="lazy" src="https://www.youtube.com/embed/${m[1]}" title="${esc(v.title)}" allowfullscreen></iframe>`;m=u.match(/vimeo\.com\/(?:video\/)?(\d+)/);if(m)return `<iframe loading="lazy" src="https://player.vimeo.com/video/${m[1]}" title="${esc(v.title)}" allowfullscreen></iframe>`;if(/\.(mp4|webm|ogg)(\?|$)/i.test(u))return `<video controls preload="metadata" src="${esc(u)}"></video>`;return `<a class="video-link" href="${esc(u)}" target="_blank" rel="noopener">Abrir video ↗</a>`}
function renderVideos(s){hide('#videosSection',s.enabled);setText('#videosEyebrow',s.eyebrow);setText('#videosTitle',s.title);setText('#videosBody',s.body);const root=$('#videoList');if(!root)return;const items=(s.items||[]).filter(v=>v&&v.published!==false&&v.url).sort((a,b)=>(a.order||0)-(b.order||0));root.innerHTML=items.length?items.map(v=>`<article class="video-card"><div class="video-media">${videoEmbed(v)}</div><div class="video-copy"><h3>${esc(v.title||'Video')}</h3>${v.description?`<p>${esc(v.description)}</p>`:''}</div></article>`).join(''):'<div class="video-empty">Próximamente: procesos y obra en video.</div>'}
function bindQueries(){document.querySelectorAll('.jsq').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>window.SMART_OPEN_QUERY?.(b.dataset.i||'Consulta general'))})}
async function load(){try{const r=await fetch(CONTENT_URL+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)return;const c=await r.json();if(c.seo?.title)document.title=c.seo.title;const meta=document.querySelector('meta[name="description"]');if(meta&&c.seo?.description)meta.content=c.seo.description;if(c.hero)renderHero(c.hero);if(c.works)renderWorks(c.works);if(c.murals)renderMurals(c.murals);if(c.artist)renderArtist(c.artist);if(c.videos)renderVideos(c.videos);bindQueries()}catch(e){console.warn('SMArt CMS fallback activo',e)}}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',load):load();
})();

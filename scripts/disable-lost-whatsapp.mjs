import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Temporary safety measure: do not send visitors to the retired WhatsApp number.
const root = 'dist';
const files = directory => readdirSync(directory).flatMap(name => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? files(path) : [path];
});
const css = '<style id="retired-whatsapp-contact">a[href*="wa.me/"],a[href*="api.whatsapp.com/send"],.whatsapp,[data-smart-whatsapp],[data-wa-general],[data-interest],.jsq,#f,.modal:has(#f){display:none!important}</style>';

const noticeStyles = '<style id="contact-service-notice-style">.contact-service-notice{background:#f3f1ec;color:#35332e;border-bottom:1px solid #d8d4cb;padding:12px 18px;text-align:center;font:13px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}.contact-service-notice strong{font-weight:700}.contact-service-notice a{font:inherit;font-weight:700;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}</style>';
const email='sanmigueldeallendetech@gmail.com';
function notice(en){
  const message=en
    ? 'We no longer have access to our previous WhatsApp number. We apologize for the inconvenience. Please email us at'
    : 'Ya no tenemos acceso a nuestro número anterior de WhatsApp. Lamentamos las molestias. Puedes escribirnos por correo a';
  const heading=en?'Important notice.':'Aviso importante.';
  return '<aside class="contact-service-notice" role="status"><strong>'+heading+'</strong> '+message+' <a href="mailto:'+email+'">'+email+'</a>.</aside>';
}
function injectNotice(value){
  const en=/<html\b[^>]*lang=["']en(?:-|["'])/i.test(value);
  return value.replace(/(<body\b[^>]*>)/i,(_,open)=>open+notice(en));
}


const relatedStyle='<style id="smart-related-site-style">.smart-related-site{background:#f5f3ee;color:#293d33;padding:28px clamp(20px,5vw,70px);border-top:1px solid #d8d4cc}.smart-related-site-inner{max-width:1050px;margin:auto}.smart-related-site h2{font-size:clamp(21px,2.7vw,31px);margin:0 0 8px;line-height:1.2}.smart-related-site p{font:15px/1.7 system-ui,sans-serif;margin:0;max-width:820px}.smart-related-site a{font-weight:700;color:#27614d;text-decoration:underline;text-underline-offset:3px}</style>';
function addRelatedSite(value, file){
  const rel=file.replaceAll('\\','/');
  if (!rel.endsWith('/dist/index.html') && !rel.endsWith('/dist/en/index.html') && rel !== 'dist/index.html' && rel !== 'dist/en/index.html')return value;
  const en=rel.endsWith('/en/index.html');
  const copy=en
    ? '<section class="smart-related-site" aria-label="Related local services"><div class="smart-related-site-inner"><h2>Planning more for your space?</h2><p>For other local services in San Miguel de Allende, from event planning to practical support, explore the <a href="https://escribeme.com.mx/en">Escríbeme local services guide</a>.</p></div></section>'
    : '<section class="smart-related-site" aria-label="Servicios locales complementarios"><div class="smart-related-site-inner"><h2>¿Tu espacio necesita algo más?</h2><p>Para conocer otros servicios locales en San Miguel de Allende, desde eventos hasta asistencia para tu propiedad o negocio, explora <a href="https://escribeme.com.mx/">la guía de servicios Escríbeme</a>.</p></div></section>';
  return value.replace('</head>',relatedStyle+'</head>').replace('</main>',copy+'</main>');
}

for (const path of files(root)) {
  if (!/\.(html|js|json|css)$/i.test(path)) continue;
  let value=readFileSync(path,'utf8');
  value=value.replaceAll('447915374776','');
  if (path.endsWith('.html') && !value.includes('id="retired-whatsapp-contact"')) {
    value=value.replace('</head>',css+noticeStyles+'</head>');
    value=injectNotice(value);
  }
  if(path.endsWith('.html'))value=addRelatedSite(value,path);
  writeFileSync(path,value);
}

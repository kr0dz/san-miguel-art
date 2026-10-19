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

for (const path of files(root)) {
  if (!/\.(html|js|json|css)$/i.test(path)) continue;
  let value=readFileSync(path,'utf8');
  value=value.replaceAll('447915374776','');
  if (path.endsWith('.html') && !value.includes('id="retired-whatsapp-contact"')) {
    value=value.replace('</head>',css+noticeStyles+'</head>');
    value=injectNotice(value);
  }
  writeFileSync(path,value);
}

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Temporary safety measure: do not send visitors to the retired WhatsApp number.
const root = 'dist';
const files = directory => readdirSync(directory).flatMap(name => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? files(path) : [path];
});
const css = '<style id="retired-whatsapp-contact">a[href*="wa.me/"],a[href*="api.whatsapp.com/send"],.whatsapp,[data-smart-whatsapp],[data-wa-general],[data-interest],.jsq,#f,.modal:has(#f){display:none!important}</style>';
for (const path of files(root)) {
  if (!/\.(html|js|json|css)$/i.test(path)) continue;
  let value=readFileSync(path,'utf8');
  value=value.replaceAll('447915374776','');
  if (path.endsWith('.html') && !value.includes('id="retired-whatsapp-contact"')) {
    value=value.replace('</head>',css+'</head>');
  }
  writeFileSync(path,value);
}

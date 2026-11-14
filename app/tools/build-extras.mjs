// Adds the Hope box and My circle to the app's copy of the Daily check-in, after tools/build.mjs
// has made app/www. Kept in its own file so two sessions can work without colliding.
// Every word comes from src/text/extras.<lang>.html.
import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(appDir, 'www');
const PAGES = [
  { file: 'check-in/index.html', lang: 'en', up: '../' },
  { file: 'es/registro-diario/index.html', lang: 'es', up: '../../' },
];

function blocks(lang) {
  const text = readFileSync(join(appDir, 'src', 'text', `extras.${lang}.html`), 'utf8');
  const out = {};
  for (const m of text.matchAll(/<!-- BLOCK:([a-z-]+) -->\n?([\s\S]*?)<!-- END -->/g)) out[m[1]] = m[2];
  return out;
}
// Each change must match exactly once, so a change elsewhere can't silently skip one.
function once(html, find, replace, what) {
  const count = typeof find === 'string' ? html.split(find).length - 1 : (html.match(new RegExp(find.source, 'g')) || []).length;
  if (count !== 1) throw new Error(`extras, ${what}: expected 1 match, found ${count}`);
  return html.replace(find, replace);
}

for (const page of PAGES) {
  const b = blocks(page.lang);
  const path = join(www, page.file);
  let html = readFileSync(path, 'utf8');
  html = once(html, '          <li><a href="#ci-journey">', b['hope-tab'] + '          <li><a href="#ci-journey">', 'hope tab');
  html = once(html, '      <section class="ci-panel" id="ci-journey"', b.hope + '\n      <section class="ci-panel" id="ci-journey"', 'hope box');
  html = once(html, '        <section class="ci-erase"', b.circle + '        <section class="ci-erase"', 'circle');
  html = once(html, '  </main>', b['circle-share'] + '  </main>', 'circle share');
  // Hope box photos are shown from the app's own storage, which needs blob: images. App only.
  html = once(html, "img-src 'self'", "img-src 'self' blob:", 'image policy');
  html = once(html, '</head>', `  <link rel="stylesheet" href="${page.up}assets/extras.css">\n</head>`, 'extras stylesheet');
  writeFileSync(path, html);
}
cpSync(join(appDir, 'src', 'extras.css'), join(www, 'assets', 'extras.css'));
console.log('Added the Hope box and My circle to app/www.');

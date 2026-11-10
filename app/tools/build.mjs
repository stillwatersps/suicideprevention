// Builds app/www from the website: copies the same files the website publishes, then adds the
// app-only parts to the Daily check-in pages and their About pages. The website itself is never
// changed. Run from app/: `npm run build`.
import { build } from 'esbuild';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(appDir, '..');
const www = join(appDir, 'www');

// The same list as the publish step in .github/workflows/site.yml.
const SITE_ITEMS = ['index.html', '404.html', 'sw.js', 'manifest.webmanifest', 'assets', 'get-help',
  'help-someone', 'teens', 'research', 'card', 'es', 'check-in', 'not-sure', 'after-a-loss', 'about'];

const PAGES = [
  { file: 'check-in/index.html', lang: 'en', about: 'about/index.html' },
  { file: 'es/registro-diario/index.html', lang: 'es', about: 'es/acerca-de/index.html' },
];

function blocks(lang) {
  const text = readFileSync(join(appDir, 'src', 'text', lang + '.html'), 'utf8');
  const out = {};
  for (const m of text.matchAll(/<!-- BLOCK:([a-z-]+) -->\n?([\s\S]*?)<!-- END -->/g)) out[m[1]] = m[2];
  // A block can include another: <!-- INSERT:name --> on a line of its own.
  for (const key of Object.keys(out)) {
    out[key] = out[key].replace(/<!-- INSERT:([a-z-]+) -->\n/g, (all, name) => {
      if (!out[name]) throw new Error(`${lang}: block ${key} includes a missing block ${name}`);
      return out[name];
    });
  }
  return out;
}

// Each change must match exactly once, so a change to the website can't silently skip one.
function once(html, find, replace, what) {
  const count = typeof find === 'string' ? html.split(find).length - 1 : (html.match(new RegExp(find.source, 'g')) || []).length;
  if (count !== 1) throw new Error(`${what}: expected 1 match, found ${count}`);
  return html.replace(find, replace);
}

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
for (const item of SITE_ITEMS) {
  const from = join(site, item);
  if (existsSync(from)) cpSync(from, join(www, item), { recursive: true });
}

for (const page of PAGES) {
  const b = blocks(page.lang);
  const path = join(www, page.file);
  let html = readFileSync(path, 'utf8');
  html = once(html, /      <aside class="ci-privacy"[\s\S]*?<\/aside>\n/, b.privacy, 'privacy');
  html = once(html, '      <nav class="ci-tabs"', b.age + '      <nav class="ci-tabs"', 'age');
  html = once(html, '        <ol class="ci-steps">', b['today-box'] + b['reminders-hint'] + '        <ol class="ci-steps">', 'today box');
  html = once(html, '        <section aria-labelledby="ci-kept-reflections-title">',
    b['today-log'] + '        <section aria-labelledby="ci-kept-reflections-title">', 'today log');
  html = once(html, '          <p class="ci-set-aside"', b.foryou + '          <p class="ci-set-aside"', 'for your age');
  html = once(html, '          <p class="ci-step-buttons"><button type="button" class="ci-restart">',
    b['result-share'] + '          <p class="ci-step-buttons"><button type="button" class="ci-restart">', 'result share');
  html = once(html, '  </main>', b['share-dialog'] + '  </main>', 'share panel');
  // The journal's note comes first in the page, then Your journey's.
  const notes = html.match(/        <p class="ci-note">.*<\/p>\n/g) || [];
  if (notes.length !== 2) throw new Error(`notes: expected 2, found ${notes.length}`);
  html = once(html, notes[0], b['journal-note'], 'journal note');
  html = once(html, notes[1], b['journey-note'], 'journey note');
  html = once(html, '        <section class="ci-erase"', b.reminders + b.settings + '        <section class="ci-erase"', 'settings');
  html = once(html, /(<h3 id="ci-erase-title">[^<]*<\/h3>\n {10}<p>[^\n]*<\/p>\n)/, `$1${b['erase-note']}`, 'erase note');
  const share = ` <button type="button" class="app-share" data-share="entry">${b['share-label'].trim()}</button>`;
  html = once(html, /(<button type="button" class="ci-delete-entry">[^<]*<\/button>)/, `$1${share}`, 'entry share');
  html = once(html, /(<button type="button" class="ci-remove-item">[^<]*<\/button>)/, `$1${share.replace('"entry"', '"item"')}`, 'item share');
  const up = page.lang === 'es' ? '../../' : '../';
  html = once(html, '</head>', `  <link rel="stylesheet" href="${up}assets/app.css">\n</head>`, 'stylesheet');
  html = once(html, /(  <script src="[./]*assets\/check-in\.js" defer><\/script>\n)/,
    `$1  <script src="${up}assets/app.js" defer></script>\n`, 'script');
  writeFileSync(path, html);

  const aboutPath = join(www, page.about);
  let about = readFileSync(aboutPath, 'utf8');
  about = once(about, /            <li><strong>(The Daily check-in|El registro diario)\.<\/strong>[^\n]*<\/li>\n/, b['about-checkin'], 'about');
  writeFileSync(aboutPath, about);
}

cpSync(join(appDir, 'src', 'app.css'), join(www, 'assets', 'app.css'));
await build({
  entryPoints: [join(appDir, 'src', 'app.js')],
  bundle: true,
  format: 'iife',
  target: ['safari15', 'chrome100'],
  outfile: join(www, 'assets', 'app.js'),
  legalComments: 'none',
});
console.log('Built app/www from the website, with the app-only parts added.');

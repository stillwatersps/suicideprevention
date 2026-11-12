// Adds the redesigned app (tabs, onboarding, streaks, meditation) to the app's copy of the Daily
// check-in, after tools/build.mjs and tools/build-extras.mjs have made app/www.
// Every word comes from src/text/redesign.<lang>.html. The safety frame of the page (crisis
// strip, Exit, Get Support Now, the Spanish link, the review notices, privacy, Support, the 988
// panel) is left exactly as it is; the new screens are added beside it.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(appDir, 'www');
const PAGES = [
  { file: 'check-in/index.html', lang: 'en', up: '../', about: 'about/index.html' },
  { file: 'es/registro-diario/index.html', lang: 'es', up: '../../', about: 'es/acerca-de/index.html' },
];

export function blocks(lang) {
  const text = readFileSync(join(appDir, 'src', 'text', `redesign.${lang}.html`), 'utf8');
  const out = {};
  for (const m of text.matchAll(/<!-- BLOCK:([a-z0-9-]+) -->\n?([\s\S]*?)<!-- END -->/g)) out[m[1]] = m[2];
  return out;
}
// Each change must match exactly once, so a change elsewhere can't silently skip one.
function once(html, find, replace, what) {
  const count = typeof find === 'string' ? html.split(find).length - 1 : (html.match(new RegExp(find.source, 'g')) || []).length;
  if (count !== 1) throw new Error(`redesign, ${what}: expected 1 match, found ${count}`);
  return html.replace(find, replace);
}

// Voice and sound files a founder may add later. The app reads this list instead of guessing,
// so a missing file is never requested.
function audioManifest() {
  const out = { voice: [], ambient: [] };
  for (const kind of Object.keys(out)) {
    const dir = join(appDir, 'assets', kind);
    if (!existsSync(dir)) continue;
    const walk = (folder, prefix) => {
      for (const name of readdirSync(folder, { withFileTypes: true })) {
        if (name.isDirectory()) walk(join(folder, name.name), prefix + name.name + '/');
        else if (/\.(mp3|m4a|wav|ogg)$/.test(name.name)) out[kind].push(prefix + name.name);
      }
    };
    walk(dir, '');
    cpSync(dir, join(www, 'assets', kind), { recursive: true });
  }
  return out;
}

const manifest = audioManifest();
// The Developer section shows which build phase this is, read from PROGRESS.md.
const progress = existsSync(join(appDir, 'PROGRESS.md')) ? readFileSync(join(appDir, 'PROGRESS.md'), 'utf8') : '';
const phase = ((progress.match(/^Current phase: (.*)$/m) || [])[1] || 'unknown').replace(/["<>&]/g, '');
for (const page of PAGES) {
  const b = blocks(page.lang);
  const path = join(www, page.file);
  let html = readFileSync(path, 'utf8');
  // The new screens go above the page's own review notice; the notice for the new words goes
  // right under it. Both notices stay on every screen.
  html = once(html, /( {6}<aside class="page-status review-note"[\s\S]*?<\/aside>\n)/,
    (all) => b.app + b.words.replace('<div class="tl-words" hidden>', `<div class="tl-words" hidden data-phase="${phase}" data-audio='${JSON.stringify(manifest)}'>`) + all + b.review, 'screens and review notice');
  // A heavy feeling in the five-question check-in shows support at the top of its results.
  html = once(html, '          <div class="ci-talk-first">', b['result-support'] + '          <div class="ci-talk-first">', 'result support');
  html = once(html, '  <footer class="site-footer"', b.tabbar + (b.overlays || '') + '  <footer class="site-footer"', 'tab bar');
  html = once(html, '</head>', `  <link rel="stylesheet" href="${page.up}assets/tokens.css">\n  <link rel="stylesheet" href="${page.up}assets/redesign.css">\n  <link rel="stylesheet" href="${page.up}assets/redesign-identity.css">\n</head>`, 'stylesheets');
  // Recorded voice, sound loops, and the two bundled fonts are files inside the app; the page may
  // use its own files only.
  html = once(html, "img-src 'self' blob:", "img-src 'self' blob:; media-src 'self'; font-src 'self'", 'media policy');
  writeFileSync(path, html);

  // About: the review list gains a line for the app's new words, marked pending like the rest.
  const aboutPath = join(www, page.about);
  let about = readFileSync(aboutPath, 'utf8');
  about = once(about, /( {12}<li><a href="\.\.\/(check-in|registro-diario)\/">[^\n]*<\/li>\n)/, (all) => all + b['about-app'], 'about review list');
  writeFileSync(aboutPath, about);
}

// iPhone: the app's pages run edge to edge, under the status bar. Every page in the app (the
// website's pages too) keeps its crisis strip clear of the status bar and the Dynamic Island.
function everyPage(dir, depth, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) { if (entry.name !== 'assets') everyPage(join(dir, entry.name), depth + 1, out); } else if (entry.name.endsWith('.html')) out.push({ path: join(dir, entry.name), up: '../'.repeat(depth) });
  }
  return out;
}
for (const page of everyPage(www, 0)) {
  let html = readFileSync(page.path, 'utf8');
  html = once(html, 'content="width=device-width, initial-scale=1">', 'content="width=device-width, initial-scale=1, viewport-fit=cover">', 'viewport in ' + page.path);
  html = once(html, '</head>', `  <link rel="stylesheet" href="${page.up}assets/app-safe-area.css">\n</head>`, 'safe-area stylesheet in ' + page.path);
  // After Quick exit, coming back to the app must show the page again (src/app-return.js says why).
  html = once(html, '</head>', `  <script src="${page.up}assets/app-return.js"></script>\n</head>`, 'return-from-exit script in ' + page.path);
  writeFileSync(page.path, html);
}
mkdirSync(join(www, 'assets'), { recursive: true });
cpSync(join(appDir, 'src', 'tokens.css'), join(www, 'assets', 'tokens.css'));
cpSync(join(appDir, 'src', 'redesign.css'), join(www, 'assets', 'redesign.css'));
for (const name of ['redesign-identity.css', 'grain.svg', 'grain-dark.svg', 'icon-info.svg']) cpSync(join(appDir, 'src', name), join(www, 'assets', name));
cpSync(join(appDir, 'src', 'app-safe-area.css'), join(www, 'assets', 'app-safe-area.css'));
cpSync(join(appDir, 'src', 'app-return.js'), join(www, 'assets', 'app-return.js'));
// Fraunces and Figtree, bundled with their licenses: no font is ever fetched from anywhere else.
cpSync(join(appDir, 'src', 'fonts'), join(www, 'assets', 'fonts'), { recursive: true });
console.log('Added the redesigned app to app/www.');

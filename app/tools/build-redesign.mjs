// Adds the redesigned app (tabs, onboarding, streaks, meditation) to the app's copy of the Daily
// check-in, after tools/build.mjs and tools/build-extras.mjs have made app/www.
// Every word comes from src/text/redesign.<lang>.html. The safety frame of the page (crisis
// strip, Exit, Get Support Now, the Spanish link, the review notices, privacy, Support, the 988
// panel) is left exactly as it is; the new screens are added beside it.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ICONS, TABS } from '../src/ui/icons.js';

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

// The Licenses screen: the notice each open-source package and the font asks to travel with the
// app, read from the installed packages and the font's license file, never retyped. Packages that
// share one notice are listed together above it. The texts stay in English in both languages.
const SHIPPED = ['@capacitor/core', '@capacitor/ios', '@capacitor/android', '@capacitor/preferences', '@capacitor/share', '@capacitor/local-notifications', 'tslib'];
const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// License files are wrapped by hand at about 80 letters, which reads as ragged lines on a phone.
// A long line is joined to the line after it; every word and every paragraph break is kept.
const unwrap = (text) => text.replace(/\r/g, '').trim().split('\n').reduce((out, line) => {
  const last = out[out.length - 1];
  if (last !== undefined && last.length >= 60 && line.trim() && !/^\s/.test(line)) out[out.length - 1] = last.trimEnd() + ' ' + line.trim();
  else out.push(line);
  return out;
}, []).join('\n');
function licensesHtml() {
  const groups = new Map();
  for (const name of SHIPPED) {
    const dir = join(appDir, 'node_modules', name);
    const file = ['LICENSE', 'LICENSE.txt', 'LICENSE.md'].map((f) => join(dir, f)).find(existsSync);
    if (!file) throw new Error(`redesign, licenses: no license file for ${name}. Run npm ci first.`);
    const text = unwrap(readFileSync(file, 'utf8'));
    const version = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).version;
    if (!groups.has(text)) groups.set(text, []);
    groups.get(text).push(`${name} ${version}`);
  }
  const parts = [...groups].map(([text, names]) => ({ names: names.join(', '), text }));
  parts.push({ names: 'Literata (font)', text: unwrap(readFileSync(join(appDir, 'src', 'fonts', 'Literata-OFL.txt'), 'utf8')) });
  return parts.map((part) => `          <h3 class="tl-headline tl-license-name" lang="en">${escapeHtml(part.names)}</h3>\n          <p class="tl-license" lang="en">${escapeHtml(part.text)}</p>\n`).join('');
}
const licenses = licensesHtml();

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

// "What happens when you reach out to 988": the Get Help page's own section, word for word, for a
// screen inside the app. It is copied here and never retyped, so the screen can't drift from the
// page a reviewer reads. The page folds most of it under "Show more"; the screen shows all of it.
const EXPECT_FROM = { en: 'get-help/index.html', es: 'es/obtener-ayuda/index.html' };
function expectSection(lang) {
  const html = readFileSync(join(www, EXPECT_FROM[lang]), 'utf8');
  const found = html.match(/<section id="what-to-expect"[^>]*>([\s\S]*?)<\/section>/);
  if (!found) throw new Error(`redesign, 988 section: not found in ${EXPECT_FROM[lang]}`);
  const title = (found[1].match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1];
  let body = found[1].replace(/<h2[^>]*>[\s\S]*?<\/h2>/, '');
  if (!title || !/<details class="more">/.test(body) || !/<\/details>/.test(body)) throw new Error(`redesign, 988 section: ${EXPECT_FROM[lang]} is not shaped as expected`);
  body = body.replace(/<details class="more">\s*<summary>[\s\S]*?<\/summary>/, '').replace(/<\/details>/, '');
  if (/<details|<summary|<script|\bstyle=/.test(body)) throw new Error('redesign, 988 section: something unexpected is in it');
  // A link to another part of the Get Help page has to say which page it means from here.
  body = body.replace(/href="#/g, `href="../${EXPECT_FROM[lang].split('/').slice(-2, -1)[0]}/#`);
  return `<h2 class="tl-title" id="tl-expect-title">${title.trim()}</h2>\n          <div class="tl-expect-body">${body.trim()}\n          </div>`;
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
    (all) => once(once(b.app, '          <!-- LICENSES -->\n', licenses, 'licenses'), '          <!-- EXPECT -->\n', '          ' + expectSection(page.lang) + '\n', '988 section') + b.words.replace('<div class="tl-words" hidden>', `<div class="tl-words" hidden data-phase="${phase}" data-audio='${JSON.stringify(manifest)}'>`) + all + b.review, 'screens and review notice');
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
// The app's five tabs, as plain links, for the website's pages inside the app (Get help, Not
// sure, For teens, and the rest). Without it those pages had no way back to the app's screens.
// Same order, icons, and names as the app's own bar; the names come from the same word blocks.
function siteTabBar(lang, up) {
  const b = blocks(lang);
  const word = (key) => { const found = b.words.match(new RegExp('data-word="' + key.replace('.', '\\.') + '">([^<]+)<')); if (!found) throw new Error(`redesign, tab bar: no word ${key} in ${lang}`); return found[1]; };
  const label = (b.tabbar.match(/aria-label="([^"]+)"/) || [])[1];
  if (!label) throw new Error(`redesign, tab bar: no spoken name in ${lang}`);
  const home = up + (lang === 'es' ? 'es/registro-diario/' : 'check-in/');
  const items = TABS.map((tab) => `      <li><a class="tl-tab" data-tl-tab-btn="${tab.id}" href="${home}${tab.id === 'home' ? '' : '#tl-' + tab.id}"><svg class="tl-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${ICONS[tab.icon]}"/></svg><span class="tl-tab-label">${word('tab.' + tab.id)}</span></a></li>`).join('\n');
  return `  <nav class="tl-tabbar" id="tl-tabbar" aria-label="${label}">\n    <ul>\n${items}\n    </ul>\n  </nav>\n`;
}
// Spanish: 988 asks people who text in Spanish to send the word AYUDA. Where a Spanish link says
// so, the app fills the word in, so nobody has to remember it in a hard moment. The link only
// opens the phone's Messages with 988 and the word ready; the person still taps Send. Links that
// name another word (PRIDE) and every English link are left as they are. App only: the public
// website's links are not changed. "?&body=" is the form that both iPhone and Android read.
export const TEXT_AYUDA = 'sms:988?&amp;body=AYUDA';
export function fillInAyuda(html) {
  return html.replace(/<a\b[^>]*\bhref="sms:988"[^>]*>[\s\S]*?<\/a>/g, (link) => (/\bAYUDA\b/.test(link.replace(/<[^>]+>/g, ' ')) ? link.replace('href="sms:988"', `href="${TEXT_AYUDA}"`) : link));
}
const appPages = PAGES.map((page) => join(www, page.file));
for (const page of everyPage(www, 0)) {
  let html = readFileSync(page.path, 'utf8');
  if (page.path.slice(www.length + 1).startsWith('es/')) html = fillInAyuda(html);
  if (!appPages.includes(page.path)) {
    const lang = page.path.slice(www.length + 1).startsWith('es/') ? 'es' : 'en';
    const bar = siteTabBar(lang, page.up);
    // Before the footer, as on the app's own page; a page with no footer gets it at the end.
    const footer = '  <footer class="site-footer"';
    html = html.split(footer).length === 2 ? once(html, footer, bar + footer, 'tab bar in ' + page.path) : once(html, '</body>', bar + '</body>', 'tab bar in ' + page.path);
    html = once(html, '</head>', `  <link rel="stylesheet" href="${page.up}assets/app-tabbar.css">\n  <script src="${page.up}assets/app-tabbar.js" defer></script>\n</head>`, 'tab bar files in ' + page.path);
  }
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
cpSync(join(appDir, 'src', 'app-tabbar.css'), join(www, 'assets', 'app-tabbar.css'));
// Literata, bundled with its license: no font is ever fetched from anywhere else.
cpSync(join(appDir, 'src', 'fonts'), join(www, 'assets', 'fonts'), { recursive: true });
console.log('Added the redesigned app to app/www.');

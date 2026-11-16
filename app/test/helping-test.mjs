// "Helping someone you're worried about": a screen on the Friends tab that shows the Help Someone
// page's own opening and six sections, word for word and link for link, copied when the app is
// built. Nothing in it is written for the app, so it can't drift from the page a reviewer reads.
//   node test/helping-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone. No call, text, or chat is
// ever started: crisis links are only checked for being there.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, noSideways, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const www = fileURLToPath(new URL('../www/', import.meta.url));
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const SOURCE = { en: 'help-someone/index.html', es: 'es/ayudar-a-alguien/index.html' };
const SECTIONS = ['signs', 'five-steps', 'conversation', 'child-or-teen', 'online', 'yourself'];
const tidy = (text) => text.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

// The page's own opening and six sections: every heading, paragraph, and list item, in order, and every link.
function fromPage(lang) {
  const html = readFileSync(join(www, SOURCE[lang]), 'utf8');
  const title = tidy(html.match(/<h1 id="page-title">([\s\S]*?)<\/h1>/)[1].replace(/<[^>]+>/g, ''));
  const pieces = [html.match(/<p class="hero-lead">[\s\S]*?<\/p>/)[0], html.match(/<p class="urgent">[\s\S]*?<\/p>/)[0]];
  for (const id of SECTIONS) pieces.push(html.match(new RegExp('<section id="' + id + '"[^>]*>([\\s\\S]*?)<\\/section>'))[1].replace(/<summary>[\s\S]*?<\/summary>/g, ''));
  const all = pieces.join('\n');
  const lines = [...all.matchAll(/<(h2|h3|p|li)\b[^>]*>((?:(?!<(?:h2|h3|p|li|ul|ol)\b)[\s\S])*?)<\/\1>/g)].map((m) => tidy(m[2].replace(/<[^>]+>/g, ''))).filter(Boolean);
  const links = [...all.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  return { title, lines, links };
}

async function newPage(browser, lang, { colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(() => { window.__tidelight = { clockRate: 1 }; });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
async function openHelping(page) {
  await tab(page, 'friends');
  if (!(await page.isVisible('#tl-friends'))) await tab(page, 'friends');
  await page.click('#tl-friends-helping');
  await page.waitForSelector('#tl-helping:not([hidden])');
  await page.waitForTimeout(700);
}

const browser = await openBrowser();

for (const lang of ['en', 'es']) {
  console.log(`\nHelping someone you're worried about, ${name(lang)}`);
  const source = fromPage(lang);
  check(source.lines.length >= 40 && source.links.length >= 5, `the Help Someone page has its opening and six sections (${source.lines.length} headings, paragraphs, and list items; ${source.links.length} links): "${source.title}"`);
  const { context, page, errors, outside } = await newPage(browser, lang);

  // ---- the way in: a row on the Friends tab ----
  await tab(page, 'friends');
  if (!(await page.isVisible('#tl-friends'))) await tab(page, 'friends');
  const way = await page.evaluate(() => { const row = document.getElementById('tl-friends-helping'); const r = row.getBoundingClientRect(); return { label: row.textContent.replace(/\s+/g, ' ').trim(), h: r.height }; });
  check(way.label === source.title && way.h >= 44, `the Friends tab offers it, under the page's own title: "${way.label}"`);
  await openHelping(page);

  // ---- the screen says exactly what the page says ----
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  const seen = await page.evaluate(() => { const screen = document.getElementById('tl-helping'); const lines = Array.from(screen.querySelectorAll('.tl-helping-body h3, .tl-helping-body h4, .tl-helping-body p, .tl-helping-body li')).filter((el) => !el.querySelector('p, li, ul, ol')).map((el) => el.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean); return { title: document.getElementById('tl-helping-title').textContent.replace(/\s+/g, ' ').trim(), lines, hrefs: Array.from(screen.querySelectorAll('.tl-helping-body a')).map((a) => a.getAttribute('href')), folded: screen.querySelectorAll('details, summary').length, draft: Boolean(screen.querySelector('.tl-draft-tag')), ids: Array.from(document.querySelectorAll('[id]')).map((el) => el.id), streak: Boolean(screen.querySelector('[class*="streak"], .tl-horizon')) }; });
  check(seen.title === source.title, 'its title is the page\'s title');
  const firstDiff = source.lines.findIndex((line, i) => line !== seen.lines[i]);
  check(JSON.stringify(seen.lines) === JSON.stringify(source.lines), `every heading, paragraph, and list item is the page's own, in order, word for word (${seen.lines.length})` + (firstDiff >= 0 ? `: differs at ${firstDiff}: "${(source.lines[firstDiff] || '').slice(0, 60)}" / "${(seen.lines[firstDiff] || '').slice(0, 60)}"` : ''));
  // The app's copy of the Spanish page already has AYUDA filled in on its text link; so does the screen.
  check(JSON.stringify(seen.hrefs) === JSON.stringify(source.links), `its ${seen.hrefs.length} links are the page's own, in order, and no others`);
  check(['tel:911', 'tel:988'].every((href) => seen.hrefs.includes(href)) && seen.hrefs.some((href) => href.startsWith('sms:988')), 'its opening keeps the page\'s 911 line and its 988 call and text links');
  check(seen.folded === 0, 'nothing in it is folded behind a tap');
  check(seen.draft && !seen.streak, 'it is marked "Draft for review", and has no streak and no horizon');
  check(new Set(seen.ids).size === seen.ids.length, 'no two parts of the page share an id');
  const broken = seen.hrefs.filter((href) => { if (/^https:\/\//.test(href)) return false; if (/^(tel|sms):/.test(href)) return false; const path = join(www, pagePath(lang), href.split('#')[0]); return !(existsSync(path) || existsSync(join(path, 'index.html'))); });
  check(broken.length === 0, 'every link that isn\'t a call, a text, or another service\'s own site leads to a page inside the app' + (broken.length ? ': not ' + broken.join(', ') : ''));
  check(await noSideways(page), 'no sideways scrolling');
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-helping', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`); });
  check(audit.length === 0, 'the automated accessibility audit finds nothing serious' + (audit.length ? ': ' + audit.join('; ') : ''));
  await page.click('#tl-helping [data-tl-back]');
  await page.waitForSelector('#tl-friends:not([hidden])');
  check(await page.isVisible('#tl-friends-helping'), 'Back returns to the Friends tab');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}

console.log('\nDark mode, a small phone, and the largest text');
for (const lang of ['en', 'es']) {
  const { context, page } = await newPage(browser, lang, { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openHelping(page);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-helping', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, `${name(lang)}, dark, a small phone: the audit finds nothing serious` + (audit.length ? ': ' + audit.join(', ') : ''));
  for (const size of ['200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-helping, #tl-helping *')).filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > window.innerWidth + 1); }).length);
    check(wide === 0, `${name(lang)}, text at ${size}: nothing in it runs off the side`);
  }
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

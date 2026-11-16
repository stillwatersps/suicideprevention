// "Your privacy in Tidelight": a plain description of what the app keeps and where it goes,
// reached from Settings. It says it is not a privacy policy, every word of it is in view, and it
// asks for nothing and stores nothing.
//   node test/privacy-screen-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone. No call, text, or chat is
// ever started.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { safetyFrame, serve, counter, pagePath, noSideways, openSettings, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');

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
async function open(page) {
  await openSettings(page);
  await page.waitForSelector('#tl-settings:not([hidden])');
  await page.click('#tl-settings-privacy');
  await page.waitForSelector('#tl-privacy:not([hidden])');
  await page.waitForTimeout(700);
}
const read = (page) => page.evaluate(() => {
  const screen = document.getElementById('tl-privacy');
  const pieces = Array.from(screen.querySelectorAll('h2, h3, p, li'));
  return {
    title: document.getElementById('tl-privacy-title').textContent.trim(),
    status: document.getElementById('tl-privacy-status').innerText.replace(/\s+/g, ' ').trim(),
    headings: Array.from(screen.querySelectorAll('h3')).map((h) => h.textContent.trim()),
    pieces: pieces.length,
    unseen: pieces.filter((el) => el.getClientRects().length === 0 || getComputedStyle(el).visibility === 'hidden').length,
    folded: screen.querySelectorAll('details, summary, [aria-expanded], .tl-more').length,
    controls: Array.from(screen.querySelectorAll('button, input, select, textarea, a')).map((el) => el.textContent.trim()),
    draft: Boolean(screen.querySelector('.tl-draft-tag')),
    streak: Boolean(screen.querySelector('[class*="streak"], .tl-horizon')),
    statusAboveBody: document.getElementById('tl-privacy-status').getBoundingClientRect().top < screen.querySelector('.tl-privacy-body').getBoundingClientRect().top,
    text: screen.innerText,
  };
});
const everything = (page) => page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])));

const browser = await openBrowser();
const shapes = {};

for (const lang of ['en', 'es']) {
  console.log(`\nYour privacy in Tidelight, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await openSettings(page);
  await page.waitForSelector('#tl-settings:not([hidden])');
  const row = await page.evaluate(() => { const el = document.getElementById('tl-settings-privacy'); const licenses = document.getElementById('tl-settings-licenses'); return { there: Boolean(el), h: el ? el.getBoundingClientRect().height : 0, first: el && licenses ? Boolean(el.compareDocumentPosition(licenses) & Node.DOCUMENT_POSITION_FOLLOWING) : false }; });
  check(row.there && row.h >= 44 && row.first, 'Settings has a row for it, above the open-source licenses');
  await page.waitForTimeout(600);
  const before = await everything(page);
  await open(page);
  const seen = await read(page);
  shapes[lang] = seen;
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(seen.draft && !seen.streak, 'it is marked "Draft for review", and has no streak and no horizon');
  check(/not a privacy policy|no es una política de privacidad/.test(seen.status) && /lawyer|abogado/.test(seen.status) && seen.statusAboveBody, `it says first that it is not a privacy policy and that no lawyer has read it: "${seen.status.slice(0, 60)}…"`);
  check(seen.headings.length === 9, `it has nine short parts: ${seen.headings.join(' · ')}`);
  check(seen.unseen === 0 && seen.folded === 0 && seen.pieces >= 30, `every one of its ${seen.pieces} headings, paragraphs, and list items is in view; nothing folds behind a tap`);
  check(seen.controls.length === 2, 'it asks for nothing: its only controls are Back and the "Draft for review" link');
  check(/iCloud/.test(seen.text) && /Google/.test(seen.text) && /988/.test(seen.text) && /911/.test(seen.text), 'it names the phone\'s backup, and says what calling or texting 988 and calling 911 open');
  check(!/undefined|null|\{[a-z]+\}/.test(seen.text), 'no unfilled words');
  check(await noSideways(page), 'no sideways scrolling');
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-privacy', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`); });
  check(audit.length === 0, 'the automated accessibility audit finds nothing serious' + (audit.length ? ': ' + audit.join('; ') : ''));
  await page.click('#tl-privacy [data-tl-back]');
  await page.waitForSelector('#tl-settings:not([hidden])');
  check(await page.isVisible('#tl-settings-privacy'), 'Back returns to Settings');
  check((await everything(page)) === before, 'reading it stored nothing');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
check(shapes.en.pieces === shapes.es.pieces && shapes.en.headings.length === shapes.es.headings.length && shapes.en.title !== shapes.es.title, 'Spanish has the same parts as English, in Spanish');

console.log('\nDark mode, a small phone, and the largest text');
for (const lang of ['en', 'es']) {
  const { context, page } = await newPage(browser, lang, { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await open(page);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
  await page.waitForTimeout(300);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-privacy', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, `${name(lang)}, dark, a small phone: the audit finds nothing serious` + (audit.length ? ': ' + audit.join(', ') : ''));
  for (const size of ['200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-privacy, #tl-privacy *')).filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > window.innerWidth + 1); }).length);
    check(wide === 0, `${name(lang)}, text at ${size}: nothing in it runs off the side`);
    check((await safetyFrame(page)).length === 0, `${name(lang)}, text at ${size}: the whole safety frame is still there`);
  }
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

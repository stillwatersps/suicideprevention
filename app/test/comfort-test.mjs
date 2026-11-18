// Comfort settings: always use the dark colors, easier reading, and a "Read aloud" button.
//   node test/comfort-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium, muted: what would be read aloud is recorded by a stand-in and never spoken.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
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
  await context.addInitScript(() => { window.__tidelight = { clockRate: 1, read: [], onReadAloud(o) { this.read.push(o); } }; });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
async function openSettings(page) {
  await tab(page, 'home');
  if (!(await page.isVisible('#tl-home'))) await tab(page, 'home');
  await page.click('#tl-home [data-tl-push="settings"]');
  await page.waitForSelector('#tl-settings:not([hidden])');
}
async function openKind(page) {
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-kind');
  await page.waitForSelector('#tl-kind:not([hidden])');
}
const flip = async (page, id) => { await page.click('#' + id); await page.waitForTimeout(200); };
const classes = (page) => page.evaluate(() => ({ night: document.documentElement.classList.contains('tl-night'), easy: document.documentElement.classList.contains('tl-easy'), reads: document.documentElement.classList.contains('tl-reads') }));
const kept = (page) => page.evaluate(() => { const s = JSON.parse(localStorage.getItem('tidelight.settings') || '{}'); return [s.alwaysDark, s.easyRead, s.readAloud].map(Boolean).join(); });
const background = (page) => page.evaluate(() => [document.documentElement, document.body, document.querySelector('#tl-settings .tl-title')].map((el) => getComputedStyle(el).backgroundColor + '/' + getComputedStyle(el).color).join('|'));
const spacing = (page) => page.evaluate(() => { const p = document.querySelector('#tl-settings .tl-sub'); const cs = getComputedStyle(p); return parseFloat(cs.lineHeight) / parseFloat(cs.fontSize); });

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nComfort settings, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await openSettings(page);
  const start = await page.evaluate(() => ['tl-set-dark', 'tl-set-easy', 'tl-set-read'].map((id) => { const box = document.getElementById(id); return { on: box.checked, label: box.closest('label').textContent.trim(), h: Math.round(box.closest('label').getBoundingClientRect().height) }; }));
  let c = await classes(page);
  check(start.every((s) => !s.on && s.label.length > 8 && s.h >= 44) && !c.night && !c.easy && !c.reads, `Settings has three switches, all off: ${start.map((s) => s.label).join('; ')}`);
  check((await page.$$eval('.tl-read', (els) => els.length)) === 0, 'with the Read aloud switch off, no screen has the button, shown or hidden');

  // ---- always dark ----
  const light = await background(page);
  await flip(page, 'tl-set-dark');
  c = await classes(page);
  const dark = await background(page);
  check(c.night && dark !== light && (await kept(page)) === 'true,false,false', 'turning on "Always use the dark colors" darkens the app at once, in daylight on a light phone, and is kept');
  check(Number(await page.evaluate(() => sessionStorage.getItem('tidelight.night-until'))) > Date.now() + 3600000, 'the website\'s pages inside the app are told to be dark too');
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen in the dark colors');
  await page.reload();
  await page.waitForSelector('html.app-ready');
  check((await classes(page)).night, 'it is still dark after the app is closed and opened');
  await openSettings(page);
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-settings', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on Settings, in the dark colors' + (audit.length ? ': ' + audit.join(', ') : ''));
  await flip(page, 'tl-set-dark');
  check(!(await classes(page)).night && (await background(page)) === light, 'turning it off goes back to following the phone');

  // ---- easier reading ----
  const tight = await spacing(page);
  await flip(page, 'tl-set-easy');
  const loose = await spacing(page);
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('.tl-screen p a:not(.tl-btn):not(.pill)')).slice(0, 8).every((a) => getComputedStyle(a).textDecorationLine.includes('underline')));
  check((await classes(page)).easy && (isNaN(tight) || loose > tight) && loose >= 1.75 && links, `"Easier reading" gives lines more room (${isNaN(tight) ? 'the usual' : tight.toFixed(2)} to ${loose.toFixed(2)}) and underlines links in the text`);
  const wide = await page.evaluate(() => { const limit = window.innerWidth + 1; return Array.from(document.querySelectorAll('#tl-settings *')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).length; });
  check(wide === 0 && (await safetyFrame(page)).length === 0, 'nothing runs off the side with it on, and the safety frame is whole');

  // ---- read aloud ----
  await flip(page, 'tl-set-read');
  check((await kept(page)) === 'false,true,true' && (await classes(page)).reads, 'the Read aloud switch is kept with the others');
  await openKind(page);
  const button = await page.evaluate(() => { const b = document.querySelector('#tl-kind .tl-read'); const back = document.querySelector('#tl-kind [data-tl-back]'); return b ? { shown: b.getClientRects().length > 0, h: Math.round(b.getBoundingClientRect().height), pressed: b.getAttribute('aria-pressed'), words: b.textContent.trim(), backShown: back.getClientRects().length > 0, sameRow: Math.abs(b.getBoundingClientRect().top - back.getBoundingClientRect().top) < 30 } : null; });
  check(button && button.shown && button.h >= 44 && button.pressed === 'false' && button.backShown, `a screen with a Back button now has "${button && button.words}", full size, and Back is still there`);
  check((await page.evaluate(() => window.__tidelight.read.length)) === 0, 'nothing is read until it is tapped');
  await page.click('#tl-kind .tl-read');
  await page.waitForTimeout(150);
  const heard = await page.evaluate(() => ({ read: window.__tidelight.read, title: document.querySelector('#tl-kind .tl-title').textContent.trim(), now: document.querySelector('#tl-kind .tl-read').textContent.trim(), pressed: document.querySelector('#tl-kind .tl-read').getAttribute('aria-pressed'), back: document.querySelector('#tl-kind [data-tl-back]').textContent.trim() }));
  check(heard.read.length === 1 && heard.read[0].text.includes(heard.title) && heard.read[0].text.length > 200 && heard.read[0].lang === lang, 'a tap reads the screen\'s own words, starting from its title, in this language');
  check(!heard.read[0].text.includes(heard.back + ' ' + heard.title) && heard.pressed === 'true' && heard.now !== button.words, `the Back row is not read, and the button now says "${heard.now}"`);
  await page.click('#tl-kind .tl-read');
  await page.waitForTimeout(100);
  check((await page.$eval('#tl-kind .tl-read', (b) => b.getAttribute('aria-pressed') + '|' + b.textContent.trim())) === 'false|' + button.words, 'a second tap stops it');
  await page.click('#tl-kind .tl-read');
  await page.click('#tl-kind [data-tl-back]');
  await openKind(page);
  check((await page.$eval('#tl-kind .tl-read', (b) => b.getAttribute('aria-pressed'))) === 'false', 'leaving the screen stops it too');

  // What is typed into a field is never read.
  await tab(page, 'checkin');
  await page.click('#tl-checkin-reframe');
  await page.waitForSelector('#tl-reframe:not([hidden])');
  await page.fill('#tl-reframe-1', 'A made-up private thought, zqxv');
  await page.click('#tl-reframe .tl-read');
  await page.waitForTimeout(150);
  const last = await page.evaluate(() => window.__tidelight.read[window.__tidelight.read.length - 1].text);
  check(last.length > 100 && !last.includes('zqxv'), 'what is typed into a field is never read out');
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  check((await page.$eval('#tl-reframe .tl-read', (b) => b.getAttribute('aria-pressed'))) === 'false', 'leaving the app (or Quick exit) stops the reading at once');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await page.evaluate(() => localStorage.setItem('tidelight.settings', JSON.stringify({ easyRead: true, readAloud: true })));
  await page.reload();
  await page.waitForSelector('html.app-ready');
  for (const [label, open, sel] of [['Settings', openSettings, '#tl-settings'], ['Being kind to yourself', openKind, '#tl-kind']]) {
    await open(page);
    for (const size of ['100%', '200%', '331%']) {
      await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
      await page.waitForTimeout(250);
      const wide = await page.evaluate((q) => { const limit = window.innerWidth + 1; return Array.from(document.querySelectorAll(q + ' *')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className || el.tagName).slice(0, 3); }, sel);
      check(wide.length === 0, `Spanish, dark, a small phone, easier reading and Read aloud on, text at ${size}: ${label} fits` + (wide.length ? ': ' + wide.join(', ') : ''));
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
  }
  check((await safetyFrame(page)).length === 0, 'and the safety frame is whole');
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, muted; nothing was spoken. Not a phone.`);
process.exit(tally.failures ? 1 : 0);

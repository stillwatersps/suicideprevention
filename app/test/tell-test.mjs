// "Words for telling someone": ways to start, each with a Copy button. The app sends nothing.
//   node test/tell-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');

async function newPage(browser, lang, { colorScheme = 'light', viewport = { width: 390, height: 844 }, clipboard = 'works' } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  // A stand-in for the phone's clipboard, so the test never touches this computer's.
  await context.addInitScript((mode) => {
    window.__tidelight = { clockRate: 1, copied: [] };
    const fake = { writeText: (text) => (mode === 'works' ? (window.__tidelight.copied.push(text), Promise.resolve()) : Promise.reject(new Error('not allowed'))) };
    try { Object.defineProperty(navigator, 'clipboard', { configurable: true, get: () => fake }); } catch (e) { /* the page will find no clipboard, and say so */ }
  }, clipboard);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
async function openIt(page) {
  await tab(page, 'friends');
  if (!(await page.isVisible('#tl-friends'))) await tab(page, 'friends');
  await page.click('#tl-friends-tell');
  await page.waitForSelector('#tl-tell:not([hidden])');
}
const status = (page) => page.evaluate(() => { const s = document.getElementById('tl-tell-status'); return s.hidden ? '' : s.textContent.trim(); });
const keys = (page) => page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().filter((k) => k !== 'tidelight.checkin.v1')));

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nWords for telling someone, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await tab(page, 'friends');
  check(await page.isVisible('#tl-friends-tell'), 'the Friends tab has a row for it');
  const before = await keys(page);
  await openIt(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-tell .tl-draft-tag'), 'the screen is marked "Draft for review"');
  const seen = await page.evaluate(() => {
    const screen = document.getElementById('tl-tell');
    const lines = Array.from(screen.querySelectorAll('.tl-tell-line')).map((li) => ({ words: li.querySelector('[data-tell-words]').textContent.trim(), label: li.querySelector('[data-tell-copy]').getAttribute('aria-label') || '', h: Math.round(li.querySelector('[data-tell-copy]').getBoundingClientRect().height) }));
    const crisis = Array.from(screen.querySelectorAll('.tl-support-actions a')).map((a) => ({ href: a.getAttribute('href'), h: a.getBoundingClientRect().height }));
    return { lines, crisis, fields: screen.querySelectorAll('input, textarea').length };
  });
  check(seen.lines.length === 8 && seen.lines.every((l) => l.words.length > 20 && l.h >= 44), 'eight ways to start, each with a full-size Copy button');
  check(seen.lines.every((l) => l.label.includes(l.words) && l.label !== l.words), 'each Copy button says, to a screen reader, which words it copies');
  check(seen.crisis.length === 3 && seen.crisis[0].href === 'tel:988' && seen.crisis[1].href.startsWith('sms:988') && seen.crisis[2].href === 'tel:911' && seen.crisis.every((c) => c.h >= 44), 'Call 988, Text 988, and Call 911 are on the screen itself, full size');
  await page.click('.tl-tell-line:nth-child(1) [data-tell-copy] >> nth=0');
  await page.waitForTimeout(150);
  const copied = await page.evaluate(() => window.__tidelight.copied);
  check(copied.length === 1 && copied[0] === seen.lines[0].words && (await status(page)).length > 10, `Copy puts exactly those words on the clipboard, and says so: "${await status(page)}"`);
  check((await keys(page)) === before && outside.length === 0, 'nothing is stored and nothing is sent');
  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-tell', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the screen' + (audit.length ? ': ' + audit.join(', ') : ''));
  await page.click('#tl-tell [data-tl-back]');
  check(await page.isVisible('#tl-friends-tell'), 'Back returns to the Friends tab');
  await openIt(page);
  check((await status(page)) === '', 'and coming back, the "Copied" line is gone');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'en', { clipboard: 'refuses' });
  await openIt(page);
  const okBefore = await status(page);
  await page.click('[data-tell-copy] >> nth=4');
  await page.waitForTimeout(150);
  const said = await status(page);
  check(okBefore === '' && /hold/i.test(said), `when the phone won't let the app copy, the screen says how to copy by hand: "${said}"`);
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openIt(page);
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-tell'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-tell', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with a stand-in for the clipboard; not a phone.`);
process.exit(tally.failures ? 1 : 0);

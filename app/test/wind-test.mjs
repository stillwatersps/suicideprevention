// "Wind down for sleep": four small steps to tick off, then the Sleep session. Nothing is kept.
//   node test/wind-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone.
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
  await context.addInitScript(() => { window.__tidelight = { clockRate: 1, sessions: [], onSession(o) { this.sessions.push(o); } }; });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
async function openWind(page) {
  await tab(page, 'meditate');
  if (!(await page.isVisible('#tl-meditate'))) await tab(page, 'meditate');
  await page.click('#tl-meditate-wind');
  await page.waitForSelector('#tl-wind:not([hidden])');
}
const ticks = (page) => page.$$eval('#tl-wind [data-wind-step] input', (boxes) => boxes.map((box) => box.checked));
const everything = (page) => page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().filter((k) => k !== 'tidelight.checkin.v1').map((k) => [k, localStorage.getItem(k)])));

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nWind down for sleep, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await tab(page, 'meditate');
  check(await page.isVisible('#tl-meditate-wind'), 'the Meditate tab has a row for it');
  const before = await everything(page);
  await openWind(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-wind .tl-draft-tag'), 'the screen is marked "Draft for review"');
  const steps = await page.$$eval('#tl-wind [data-wind-step]', (rows) => rows.map((row) => ({ words: row.textContent.trim(), h: Math.round(row.getBoundingClientRect().height) })));
  check(steps.length === 4 && steps.every((s) => s.words.length > 15 && s.h >= 44), 'four steps, each a full-size tick box with plain words');
  check((await ticks(page)).every((on) => !on), 'none is ticked to begin with');
  check(await page.evaluate(() => /988/.test(document.getElementById('tl-wind').textContent) && /911/.test(document.getElementById('tl-wind').textContent)), 'it says where 988 and 911 are, for a night that feels like too much');

  // Ticking is only on the screen.
  await page.click('#tl-wind [data-wind-step]:nth-of-type(1)');
  await page.click('#tl-wind [data-wind-step]:nth-of-type(3)');
  check((await ticks(page)).join() === 'true,false,true,false', 'a step can be ticked, in any order, and skipped');
  check((await everything(page)) === before, 'ticking stores nothing');

  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-wind', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the screen' + (audit.length ? ': ' + audit.join(', ') : ''));

  // Leaving and coming back clears the ticks.
  await page.click('#tl-wind [data-tl-back]');
  await openWind(page);
  check((await ticks(page)).every((on) => !on), 'opening it again starts with nothing ticked');

  // The button starts the Sleep session.
  await page.click('#tl-wind-start');
  await page.waitForSelector('#tl-stage:not([hidden])');
  const playing = await page.evaluate(() => document.documentElement.classList.contains('tl-full'));
  check(playing && (await safetyFrame(page)).length === 0, '"Start the Sleep session" starts a session, with the safety frame on screen');
  await page.click('#tl-stage', { position: { x: 195, y: 300 } });
  await page.click('#tl-player-end');
  if (await page.isVisible('#tl-end-yes')) await page.click('#tl-end-yes');
  await page.waitForSelector('#tl-stage', { state: 'hidden' });
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('tidelight.sessions') || '[]').map((s) => s.type));
  check(kept.length === 1 && kept[0] === 'sleep', 'and it was the Sleep session');
  check(await page.isVisible('#tl-meditate'), 'ending it returns to the Meditate tab, as every session does');

  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openWind(page);
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-wind'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
    const boxes = await page.$$eval('#tl-wind [data-wind-step] input', (els) => els.every((el) => { const r = el.getBoundingClientRect(); return r.right <= window.innerWidth && r.width > 10; }));
    check(boxes, `and at ${size} every tick box is on the screen`);
  }
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-wind', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

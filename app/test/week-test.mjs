// "My week, in words": a few sentences about the last seven days. Nothing kept, nothing counted.
//   node test/week-test.mjs      (after a build; part of `npm test`)
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
  await context.addInitScript(() => { window.__tidelight = { clockRate: 60, spoken: [], onSpeak(o) { this.spoken.push(o); } }; });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
async function openIt(page) {
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-week');
  await page.waitForSelector('#tl-week:not([hidden])');
}
async function checkIn(page, value) {
  await tab(page, 'home');
  if (!(await page.isVisible('#tl-home'))) await tab(page, 'home');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click(`#tl-flow-faces [data-value="${value}"]`);
  await page.click('#tl-flow-done');
  await page.waitForTimeout(500);
}
const view = (page) => page.evaluate(() => ({ lines: Array.from(document.querySelectorAll('#tl-week-lines li')).map((li) => li.textContent.trim()), own: Array.from(document.querySelectorAll('#tl-week-own li')).map((li) => li.textContent.trim()), ownShown: !document.getElementById('tl-week-own-box').hidden }));
const keys = (page) => page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort()));

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nMy week, in words, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await tab(page, 'checkin');
  check(await page.isVisible('#tl-checkin-week'), 'the Check-in tab has a row for it');
  const before = await keys(page);
  await openIt(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-week .tl-draft-tag'), 'the screen is marked "Draft for review"');
  let v = await view(page);
  check(v.lines.length === 1 && v.lines[0].length > 20 && !v.ownShown, `with nothing recorded there is one gentle sentence and no list: "${v.lines[0]}"`);
  const empty = v.lines[0];
  const crisis = await page.$$eval('#tl-week .tl-support-actions a', (els) => els.map((a) => ({ href: a.getAttribute('href'), h: a.getBoundingClientRect().height })));
  check(crisis.length === 3 && crisis[0].href === 'tel:988' && crisis[2].href === 'tel:911' && crisis.every((c) => c.h >= 44), 'Call 988, Text 988, and Call 911 are on the screen itself, full size');
  check((await keys(page)) === before, 'opening it stores nothing');

  await checkIn(page, 4);
  await openIt(page);
  v = await view(page);
  check(v.lines.length === 1 && v.lines[0] !== empty && v.ownShown && v.own.length === 2, `after one check-in the sentence changes ("${v.lines[0]}") and the person's own line is listed under its day`);
  await tab(page, 'meditate');
  await page.click('.tl-type[data-type="quick"] [data-type-start]');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 30000 });
  await page.reload();
  await page.waitForSelector('html.app-ready');
  await openIt(page);
  v = await view(page);
  check(v.lines.length === 2, `after a meditation there is a second sentence: "${v.lines[1]}"`);
  const words = v.lines.join(' ');
  check(!/\d|%/.test(words) && !(await page.evaluate(() => Boolean(document.querySelector('#tl-week canvas, #tl-week svg.tl-chart, #tl-week [class*="streak"], #tl-week progress, #tl-week meter')))), 'no sentence has a number in it, and there is no chart, meter, or streak');
  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-week', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the screen' + (audit.length ? ': ' + audit.join(', ') : ''));
  await page.click('#tl-week [data-tl-back]');
  check(await page.isVisible('#tl-checkin'), 'Back returns to the Check-in tab');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await checkIn(page, 3);
  await openIt(page);
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-week'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-week', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

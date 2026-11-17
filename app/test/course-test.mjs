// "A first week": seven steps, each something the app already has. Only the ticks are kept.
//   node test/course-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const KEY = 'tidelight.course.v1';
const step = (n) => `#tl-course [data-course-step]:nth-child(${n})`;

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
  await tab(page, 'meditate');
  if (!(await page.isVisible('#tl-meditate'))) await tab(page, 'meditate');
  await page.click('#tl-meditate-course');
  await page.waitForSelector('#tl-course:not([hidden])');
}
const stored = (page) => page.evaluate((k) => localStorage.getItem(k), KEY);
const view = (page) => page.evaluate(() => {
  const steps = Array.from(document.querySelectorAll('#tl-course [data-course-step]'));
  return { ticked: steps.map((s) => (s.querySelector('input').checked ? 1 : 0)).join(''), next: steps.map((s) => (s.querySelector('[data-course-next]').hidden ? 0 : 1)).join(''), all: !document.getElementById('tl-course-all').hidden, again: !document.getElementById('tl-course-again').hidden };
});
const tick = async (page, n) => { await page.click(step(n) + ' input'); await page.waitForTimeout(120); };

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nA first week, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await tab(page, 'meditate');
  check(await page.isVisible('#tl-meditate-course'), 'the Meditate tab has a row for it');
  await openIt(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-course .tl-draft-tag'), 'the screen is marked "Draft for review"');
  let v = await view(page);
  check(v.ticked === '0000000' && v.next === '1000000' && !v.all && !v.again, 'seven steps, none ticked, with "Up next" on the first only');
  check((await stored(page)) === null, 'opening it stores nothing');
  const sizes = await page.$$eval('#tl-course [data-course-open], #tl-course .tl-switch', (els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));
  check(sizes.length === 14 && sizes.every((h) => h >= 44), 'every step\'s button and tick row is full size');

  await tick(page, 1);
  v = await view(page);
  check((await stored(page)) === '{"done":[0]}' && v.next === '0100000' && v.again, 'ticking day 1 keeps only the step\'s number, and "Up next" moves to day 2');
  await tick(page, 3);
  await page.reload();
  await page.waitForSelector('html.app-ready');
  await openIt(page);
  v = await view(page);
  check(v.ticked === '1010000' && v.next === '0100000', 'after the app is closed and opened the ticks are still there');
  await tick(page, 3);
  check((await stored(page)) === '{"done":[0]}', 'a tick can be taken back');

  await page.click(step(2) + ' [data-course-open]');
  check(await page.isVisible('#tl-ground'), 'day 2\'s button opens Grounding');
  await openIt(page);
  await page.click(step(7) + ' [data-course-open]');
  check(await page.isVisible('#tl-plan'), 'day 7\'s button opens the safety plan');
  await openIt(page);
  for (const n of [2, 3, 4, 5, 6, 7]) await tick(page, n);
  v = await view(page);
  check(v.ticked === '1111111' && v.next === '0000000' && v.all, 'with all seven ticked there is one plain closing line, and no "Up next"');
  const closing = await page.evaluate(() => { const box = document.getElementById('tl-course'); return { text: document.getElementById('tl-course-all').textContent, fuss: Boolean(box.querySelector('.tl-confetti, [class*="streak"], .tl-horizon, canvas')) }; });
  check(closing.text.length > 20 && !closing.fuss && !/!|\d/.test(closing.text), 'the closing line has no count, no exclamation, and no celebration: "' + closing.text + '"');
  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-course', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the screen' + (audit.length ? ': ' + audit.join(', ') : ''));
  await page.click('#tl-course-again');
  await page.waitForTimeout(150);
  v = await view(page);
  check(v.ticked === '0000000' && v.next === '1000000' && !v.all && !v.again && (await stored(page)) === '{"done":[]}', '"Clear my ticks" unticks all seven');

  await page.click(step(1) + ' [data-course-open]');
  await page.waitForSelector('#tl-stage:not([hidden])');
  const playing = await page.evaluate(() => JSON.parse(localStorage.getItem('tidelight.sessions') || '[]').length);
  check(playing === 0 && (await safetyFrame(page)).length === 0, 'day 1\'s button starts the one-minute session, with the safety frame on screen');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 30000 });
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('tidelight.sessions') || '[]')[0]);
  check(kept && kept.type === 'quick' && kept.totalSeconds === 60, 'and it runs to its end as a one-minute session');
  check((await stored(page)) === '{"done":[]}', 'finishing a session ticks nothing by itself: the tick is the person\'s');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  // A day with a very low check-in: the closing line stays hidden.
  const { context, page } = await newPage(browser, 'en');
  await tab(page, 'home');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
  await openIt(page);
  for (const n of [1, 2, 3, 4, 5, 6, 7]) await tick(page, n);
  const v = await view(page);
  check(v.ticked === '1111111' && !v.all, 'on a day with a very low check-in, ticking all seven shows no closing line');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openIt(page);
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-course'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-course', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

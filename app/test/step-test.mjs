// "One small thing for today", on Home: one line from the person's own list of things they'd
// like to try, a different one each day. The app adds no line of its own.
//   node test/step-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const LIST = ['A made-up walk to the corner', 'Call a made-up sister', 'Draw something made up'];
const pageState = (explore) => JSON.stringify({ feeling: '', feelingLabel: '', needs: [], checkins: [], reflections: {}, explore, enjoyed: [], learned: [], entries: [] });

async function newPage(browser, lang, { storage = {}, colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript((stored) => {
    window.__tidelight = { clockRate: 1, buzz: [], onHaptic(h) { this.buzz.push(h); } };
    try { if (!sessionStorage.getItem('seeded')) { Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, storage);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
const card = (page) => page.evaluate(() => {
  const box = document.getElementById('tl-home-step');
  const on = (id) => { const el = document.getElementById(id); return !el.hidden && el.getClientRects().length > 0; };
  return { shown: !box.hidden && box.getClientRects().length > 0, line: on('tl-home-step-line') ? document.getElementById('tl-home-step-line').textContent : '', empty: on('tl-home-step-empty'), other: on('tl-home-step-other'), list: on('tl-home-step-list') };
});

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nOne small thing for today, ${name(lang)}`);
  // With nothing on the list yet.
  let opened = await newPage(browser, lang);
  let page = opened.page;
  const none = await card(page);
  check(none.shown && none.empty && none.line === '' && !none.other && none.list, 'with nothing on the list, the card says what it is for and offers "My list": the app adds no line of its own');
  await page.click('#tl-home-step-list');
  await page.waitForTimeout(400);
  check(await page.evaluate(() => { const part = document.getElementById('ci-rediscover'); return Boolean(part && part.getClientRects().length > 0); }), '"My list" opens the list, where the person writes it');
  check((await safetyFrame(page)).length === 0, 'with the safety frame on screen');
  await opened.context.close();

  // With three things on the list.
  opened = await newPage(browser, lang, { storage: { 'tidelight.checkin.v1': pageState(LIST) } });
  page = opened.page;
  const before = await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort()));
  const one = await card(page);
  check(one.shown && LIST.includes(one.line) && !one.empty && one.other, 'with three things on the list, Home shows one of them, word for word: "' + one.line + '"');
  const seen = [one.line];
  for (let i = 0; i < 3; i += 1) { await page.click('#tl-home-step-other'); seen.push((await card(page)).line); }
  check(new Set(seen.slice(0, 3)).size === 3 && seen[3] === seen[0], '"Another one" goes through all three and comes back round');
  await page.reload();
  await page.waitForSelector('html.app-ready');
  check((await card(page)).line === one.line, 'opened again the same day, it starts on the same line');
  check((await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort()))) === before, 'the card stores nothing');
  check(await page.evaluate(() => !/done|hecho|✓/i.test(document.getElementById('tl-home-step').textContent) && window.__tidelight.buzz.filter((h) => /success|celebrat/.test(JSON.stringify(h))).length === 0), 'it never asks whether the thing was done, and celebrates nothing');
  const sizes = await page.$$eval('#tl-home-step button', (els) => els.filter((el) => el.getClientRects().length).map((el) => Math.round(el.getBoundingClientRect().height)));
  check(sizes.length === 2 && sizes.every((h) => h >= 44), 'both buttons are at least 44 points tall');
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-home-step', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the card' + (audit.length ? ': ' + audit.join(', ') : ''));

  // A very low check-in: the card is gone for the day.
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
  await page.click('#tl-flow-support [data-tl-go="home"]');
  await page.waitForTimeout(400);
  check(!(await card(page)).shown, 'after a very low check-in the card is not shown for the rest of the day');
  check(opened.errors.length === 0, 'no script errors' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
  check(opened.outside.length === 0, 'nothing was requested from outside the app');
  await opened.context.close();
}
{
  // Damaged list: only what can be read is used.
  for (const [what, explore, want] of [['a list that is not a list', 'walk', 0], ['a list with other things in it', [null, 7, '  ', '<b>Kept</b>'], 1]]) {
    const { context, page, errors } = await newPage(browser, 'en', { storage: { 'tidelight.checkin.v1': pageState(explore) } });
    const seen = await card(page);
    check(errors.length === 0 && (want ? seen.line === '<b>Kept</b>' : seen.empty), `${what}: Home opens, and the card shows ${want ? 'the one line that could be read, as plain words' : 'no line'}`);
    await context.close();
  }
  // One thing on the list: no "Another one".
  const { context, page } = await newPage(browser, 'en', { storage: { 'tidelight.checkin.v1': pageState(['Only a made-up thing']) } });
  const only = await card(page);
  check(only.line === 'Only a made-up thing' && !only.other, 'with one thing on the list there is no "Another one"');
  await context.close();
}
{
  const long = ['Unapalabramuylargaquenosepuedepartirfacilmenteenningunsitio y algo más que hacer hoy', 'Otra cosa'];
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 }, storage: { 'tidelight.checkin.v1': pageState(long) } });
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const box = document.getElementById('tl-home-step'); const limit = window.innerWidth + 1; return [box, ...box.querySelectorAll('*')].filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: the card stays on the screen` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

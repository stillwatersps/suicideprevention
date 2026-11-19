// "For my next appointment": things to bring up, and one reminder that says nothing about it.
//   node test/visit-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with a stand-in for the phone's notifications. No notification is shown.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const KEY = 'tidelight.visit.v1';
const local = (d) => { const two = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}T${two(d.getHours())}:${two(d.getMinutes())}`; };
const inDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(14, 15, 0, 0); return d; };

async function newPage(browser, lang, { colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(() => {
    window.__tidelight = { clockRate: 1, notificationAuthorization: 'notDetermined', grantNotifications: true, calls: [], onSchedule(list, cancel) { this.calls.push({ list, cancel }); } };
  });
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
  await page.click('#tl-checkin-visit');
  await page.waitForSelector('#tl-visit:not([hidden])');
}
const stored = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), KEY);
const notes = (page) => page.$$eval('#tl-visit-notes .tl-plan-text', (els) => els.map((el) => el.textContent));
const status = (page) => page.evaluate(() => { const s = document.getElementById('tl-visit-status'); return s.hidden ? '' : s.textContent.trim(); });
const asked = (page) => page.evaluate(() => window.__tidelight.calls.filter((c) => c.cancel.includes(297) && c.cancel.length === 1).map((c) => c.list));
const add = async (page, words, how) => { await page.fill('#tl-visit-new', words); if (how === 'enter') await page.press('#tl-visit-new', 'Enter'); else await page.click('#tl-visit-add'); await page.waitForTimeout(150); };

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nFor my next appointment, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await tab(page, 'checkin');
  check(await page.isVisible('#tl-checkin-visit'), 'the Check-in tab has a row for it');
  await openIt(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-visit .tl-draft-tag'), 'the screen is marked "Draft for review"');
  check((await notes(page)).length === 0 && (await stored(page)) === null && !(await page.isVisible('#tl-visit-notes')), 'it starts empty, and opening it stores nothing');
  check(await page.evaluate(() => document.getElementById('tl-visit-privacy').getClientRects().length > 0), 'it says in view who can read what is written');

  await add(page, '  A made-up   thing to ask ', 'click');
  await add(page, 'A second made-up thing', 'enter');
  await add(page, '   ', 'click');
  check(JSON.stringify(await notes(page)) === JSON.stringify(['A made-up thing to ask', 'A second made-up thing']) && JSON.stringify((await stored(page)).notes) === JSON.stringify(['A made-up thing to ask', 'A second made-up thing']), 'two lines are added (by the button, and by the Return key) and kept; an empty one is not');
  const sizes = await page.$$eval('#tl-visit-notes [data-visit-remove], #tl-visit-add, #tl-visit-new, #tl-visit-when, #tl-visit-set', (els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));
  check(sizes.every((h) => h >= 44) && (await page.$$eval('#tl-visit-notes [data-visit-remove]', (els) => els.every((b) => b.getAttribute('aria-label').length > 10))), 'every control is full size, and each Remove says which line it removes');
  await page.click('#tl-visit-notes [data-visit-remove="0"]');
  await page.waitForTimeout(150);
  check(JSON.stringify(await notes(page)) === JSON.stringify(['A second made-up thing']), 'a line can be removed');
  for (let i = 0; i < 9; i += 1) { if (await page.isDisabled('#tl-visit-new')) break; await add(page, 'Made-up line ' + i, 'click'); }
  check((await notes(page)).length === 8 && (await page.isDisabled('#tl-visit-add')) && (await page.isVisible('#tl-visit-full')), 'eight is the most, and the screen says so');

  const when = inDays(4);
  await page.fill('#tl-visit-when', local(inDays(-2)));
  await page.click('#tl-visit-set');
  await page.waitForTimeout(200);
  check((await asked(page)).length === 0 && !(await stored(page)).at, 'a reminder time that has passed is refused');
  await page.fill('#tl-visit-when', local(when));
  await page.click('#tl-visit-set');
  await page.waitForTimeout(250);
  const calls = await asked(page);
  const last = calls[calls.length - 1] || [];
  const sample = await page.$eval('#tl-visit [data-once-sample]', (el) => el.textContent);
  check(calls.length === 1 && last.length === 1 && last[0].id === 297 && new Date(last[0].at).getTime() === when.getTime(), 'a time four days ahead sets one reminder on the phone, for exactly that time');
  check(last[0] && last[0].title === 'Tidelight' && last[0].body === sample && sample.length > 8 && !/made-up/i.test(JSON.stringify(last)), `the phone is given only "Tidelight" and "${sample}": nothing the person wrote`);
  check(new Date((await stored(page)).at).getTime() === when.getTime() && (await stored(page)).notes.length === 8 && (await status(page)).length > 10, 'the time is kept, the list is untouched, and the screen says when it is set for');
  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-visit', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the screen' + (audit.length ? ': ' + audit.join(', ') : ''));

  await page.reload();
  await page.waitForSelector('html.app-ready');
  await openIt(page);
  check((await notes(page)).length === 8 && (await page.inputValue('#tl-visit-when')) === local(when), 'after the app is closed and opened, the list and the time are still there');
  await page.click('#tl-visit-remove');
  await page.waitForTimeout(250);
  const after = await asked(page);
  check(after[after.length - 1].length === 0 && (await stored(page)).at === '' && (await stored(page)).notes.length === 8, '"Remove the reminder" cancels it on the phone and leaves the list alone');
  await page.fill('#tl-visit-when', local(inDays(6)));
  await page.click('#tl-visit-set');
  await page.waitForTimeout(250);
  await page.evaluate(() => window.dispatchEvent(new Event('tidelight-erased')));
  await page.waitForTimeout(400);
  const erased = await asked(page);
  check(erased[erased.length - 1].length === 0 && (await page.evaluate((k) => localStorage.getItem(k), KEY)) === null && (await notes(page)).length === 0, 'Delete everything removes the list, the time, and the phone\'s reminder');
  await page.click('#tl-visit [data-tl-push="summary"]');
  check(await page.isVisible('#tl-summary'), 'the screen leads on to "A summary for an appointment"');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openIt(page);
  await add(page, 'Una cosa inventada bastante larga para ver si cabe en una pantalla pequeña sin salirse', 'click');
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-visit'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-visit', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with a stand-in for the phone's notifications; not a phone.`);
process.exit(tally.failures ? 1 : 0);

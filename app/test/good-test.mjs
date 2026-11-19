// "Three good things": up to three short lines a day, in the person's own words, kept on this
// phone only. Nothing is counted.
//   node test/good-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, openSettings, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const KEY = 'tidelight.good.v1';
const dayKey = (back) => { const d = new Date(); d.setDate(d.getDate() - back); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const EARLIER = { days: [{ day: dayKey(1), things: ['A made-up walk', 'A made-up call'] }, { day: dayKey(3), things: ['Made-up soup'] }] };

async function newPage(browser, lang, { hooks = {}, storage = {}, colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(([given, stored]) => {
    window.__tidelight = Object.assign({ shared: [], clockRate: 1, buzz: [], onHaptic(h) { this.buzz.push(h); } }, JSON.parse(JSON.stringify(given)));
    try { if (!sessionStorage.getItem('seeded')) { Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, [hooks, storage]);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
const stored = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), KEY);
async function openGood(page) {
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-good');
  await page.waitForSelector('#tl-good:not([hidden])');
}
const fields = (page) => page.$$eval('#tl-good [data-good-thing]', (els) => els.map((el) => el.value));
const earlier = (page) => page.$$eval('#tl-good-earlier > li', (rows) => rows.map((row) => ({ day: row.querySelector('.tl-label').textContent, things: Array.from(row.querySelectorAll('.tl-good-things li')).map((li) => li.textContent), remove: row.querySelector('[data-good-remove]').getAttribute('aria-label') })));

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nThree good things, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang, { storage: { [KEY]: JSON.stringify(EARLIER) } });
  await tab(page, 'checkin');
  check(await page.isVisible('#tl-checkin-good'), 'the Check-in tab has a row for it');
  await openGood(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-good .tl-draft-tag'), 'the screen is marked "Draft for review"');
  check(await page.isVisible('#tl-good-privacy'), 'where it is kept, and who can read it, is in view');
  check((await fields(page)).join('|') === '||', 'today starts with three empty lines: the app writes none of them');
  const before = await earlier(page);
  check(before.length === 2 && before[0].things.join() === 'A made-up walk,A made-up call' && before[1].things.join() === 'Made-up soup', 'earlier days are listed, newest first, as they were written');
  check(before.every((d) => d.day.length > 6 && d.remove.includes(d.day)), 'each earlier day is named by its date, and its Remove button says which day: ' + before[0].remove);
  const text = await page.evaluate(() => document.getElementById('tl-good').innerText);
  check(!/\d+\s*(days?|días?)|in a row|seguidos|streak|racha|%/i.test(text.replace(/\d+ (de )?[a-záéíóú]+ ?/gi, '')), 'nothing on the screen counts days, shows a streak, or gives a figure');

  // Saving nothing keeps nothing.
  await page.click('#tl-good-save');
  check((await stored(page)).days.length === 2, 'Save with nothing written adds no day');

  // Two things, with a blank line between.
  await page.fill('#tl-good-1', '  A made-up cup of tea  ');
  await page.fill('#tl-good-3', 'The made-up bus came');
  await page.click('#tl-good-save');
  await page.waitForFunction((k) => JSON.parse(localStorage.getItem(k)).days.length === 3, KEY);
  const kept = await stored(page);
  check(kept.days[0].day === dayKey(0) && kept.days[0].things.join('|') === 'A made-up cup of tea|The made-up bus came', 'today\'s two things are saved on the phone, without the empty line');
  check((await fields(page)).join('|') === 'A made-up cup of tea|The made-up bus came|', 'and stay on the screen to add to or change');
  const said = await page.evaluate(() => ({ words: document.getElementById('tl-good-status').textContent.trim(), focus: document.activeElement.id, buzz: window.__tidelight.buzz.map((h) => JSON.stringify(h)).filter((h) => /success|celebrat|milestone/.test(h)).length }));
  check(said.words.length > 5 && said.focus === 'tl-good-status', 'the screen says it was saved, and a screen reader hears it');
  check(said.buzz === 0, 'nothing is celebrated');
  check((await earlier(page)).length === 2, 'today is not repeated under "Earlier days"');
  check(await page.evaluate(() => window.__tidelight.shared.length === 0), 'nothing was shared or sent');

  // Return in a line saves too; changing and clearing.
  await page.fill('#tl-good-3', 'A made-up third thing');
  await page.press('#tl-good-3', 'Enter');
  await page.waitForFunction((k) => JSON.parse(localStorage.getItem(k)).days[0].things.length === 3, KEY);
  check((await stored(page)).days[0].things.join('|') === 'A made-up cup of tea|The made-up bus came|A made-up third thing', 'Return in a line saves, keeping the order on screen');

  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-good', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the screen' + (audit.length ? ': ' + audit.join(', ') : ''));
  const small = await page.$$eval('#tl-good button, #tl-good input', (els) => els.filter((el) => el.getClientRects().length && el.getBoundingClientRect().height < 43.5).map((el) => el.id || el.textContent.trim()));
  check(small.length === 0, 'every button and field on it is at least 44 points tall' + (small.length ? ': ' + small.join(', ') : ''));

  // It is still there after the app is closed and opened.
  await page.reload();
  await page.waitForSelector('html.app-ready');
  await openGood(page);
  check((await fields(page)).filter(Boolean).length === 3 && (await earlier(page)).length === 2, 'after the app is opened again, today\'s three and the earlier days are there');

  // Removing an earlier day.
  await page.click('#tl-good-earlier > li:nth-child(2) [data-good-remove]');
  await page.waitForFunction((k) => JSON.parse(localStorage.getItem(k)).days.length === 2, KEY);
  check((await earlier(page)).length === 1 && (await stored(page)).days.every((d) => d.things[0] !== 'Made-up soup'), '"Remove this day" removes that day and no other');

  // A copy of my data.
  await page.evaluate(() => { window.__tidelight.onShareFile = (file) => { window.__tidelight.shared.push(file); return { completed: true }; }; });
  await openSettings(page);
  await page.click('#tl-set-export');
  await page.waitForFunction(() => window.__tidelight.shared.length === 1);
  const file = await page.evaluate(() => window.__tidelight.shared[0].text);
  check(file.includes(lang === 'es' ? 'TRES COSAS BUENAS' : 'THREE GOOD THINGS') && file.includes('- A made-up cup of tea') && file.includes('- A made-up walk'), 'a copy of my data includes every day kept');

  // Clearing today removes the day; Delete everything removes the rest.
  await openGood(page);
  for (const id of ['#tl-good-1', '#tl-good-2', '#tl-good-3']) await page.fill(id, '');
  await page.click('#tl-good-save');
  await page.waitForFunction((k) => JSON.parse(localStorage.getItem(k)).days.length === 1, KEY);
  check((await stored(page)).days[0].day === dayKey(1), 'clearing today\'s lines and saving removes today');
  await page.click('#tl-good [data-tl-back]');
  await page.click('#tl-checkin [data-tl-legacy="ci-journey"]');
  await page.click('.ci-erase-start');
  await page.click('.ci-erase-yes');
  await page.waitForFunction((k) => localStorage.getItem(k) === null, KEY);
  await openGood(page);
  check((await earlier(page)).length === 0 && !(await page.isVisible('#tl-good-earlier-box')), 'Delete everything removes every day');

  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}

console.log('\nThree good things and the rest of the app');
{
  // It is never offered on the support step: a hard moment is not the time to be asked for good things.
  const { context, page } = await newPage(browser, 'en', { storage: { [KEY]: JSON.stringify(EARLIER) } });
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
  check(await page.evaluate(() => !document.querySelector('#tl-flow-support [data-tl-push="good"]') && !/good things/i.test(document.getElementById('tl-flow-support').textContent)), 'the support step after a very low check-in does not mention it');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'en', { hooks: { lock: { unlocked: false, allow: false } }, storage: { 'tidelight.settings': JSON.stringify({ appLock: true }), [KEY]: JSON.stringify(EARLIER) } });
  await page.waitForSelector('#tl-lock:not([hidden])');
  const locked = await page.evaluate(() => ({ screen: document.getElementById('tl-good').getClientRects().length, text: document.body.innerText.includes('made-up walk'), strip: document.querySelector('.crisis-bar a[href="tel:988"]').getClientRects().length > 0 }));
  check(locked.screen === 0 && !locked.text && locked.strip, 'while the app is locked it can\'t be read, and the crisis strip is on screen');
  await context.close();
}
{
  for (const damaged of ['{"days":"none"}', '[1,2]', '"words"', JSON.stringify({ days: [null, { day: 'soon', things: ['x'] }, { day: dayKey(2), things: ['<script>window.__ran = 1</script>Kept', 7] }] })]) {
    const { context, page, errors } = await newPage(browser, 'en', { storage: { [KEY]: damaged } });
    await openGood(page);
    const seen = await page.evaluate(() => ({ things: Array.from(document.querySelectorAll('#tl-good-earlier .tl-good-things li')).map((li) => li.textContent), ran: window.__ran === 1, fields: document.querySelectorAll('#tl-good [data-good-thing]').length }));
    const want = damaged.includes('Kept') ? ['<script>window.__ran = 1</script>Kept'] : [];
    check(JSON.stringify(seen.things) === JSON.stringify(want) && !seen.ran && seen.fields === 3 && errors.length === 0, `damaged data (${damaged.slice(0, 22)}…): the screen opens with what could be read, as plain words, and no error`);
    await context.close();
  }
}
{
  const long = { days: [{ day: dayKey(1), things: ['Unapalabramuylargaquenosepuedepartirfacilmenteenningunsitio y algo más', 'Corta'] }] };
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 }, storage: { [KEY]: JSON.stringify(long) } });
  await openGood(page);
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-good'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-good', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

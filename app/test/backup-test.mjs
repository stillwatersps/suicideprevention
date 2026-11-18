// A backup file, and restoring from it: one file the person chooses where to put, and can give
// back to the app.
//   node test/backup-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with a stand-in for the share sheet. No file leaves this computer.
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const PLAN = JSON.stringify({ signs: ['A made-up warning sign, zqxv'], coping: [], distract: [], people: [{ name: 'A made-up friend', phone: '555 0100' }], pros: [], safer: [], updatedAt: '' });

async function newPage(browser, lang, seed, { colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript((stored) => {
    window.__files = [];
    window.__tidelight = { clockRate: 1, onShareFile: (file) => { window.__files.push(file); return { completed: true }; } };
    try { if (stored && !sessionStorage.getItem('seeded')) { Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, seed);
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
const note = (page, id) => page.evaluate((i) => { const n = document.getElementById(i); return n.hidden ? '' : n.textContent.trim(); }, id);
const give = (page, fileName, text) => page.setInputFiles('#tl-set-restore-file', { name: fileName, mimeType: 'application/json', buffer: Buffer.from(text) });
const planOnPhone = (page) => page.evaluate(() => localStorage.getItem('tidelight.plan.v1'));

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nA backup file, ${name(lang)}`);
  // ---- the old phone: make the file ----
  const old = await newPage(browser, lang, { 'tidelight.plan.v1': PLAN, 'tidelight.profile': JSON.stringify({ name: 'A made-up name' }), 'tidelight.follow.v1': JSON.stringify({ who: 'A made-up person', at: new Date(Date.now() + 86400000).toISOString() }) });
  await openSettings(old.page);
  check((await safetyFrame(old.page)).length === 0, 'the whole safety frame is on screen');
  const box = await old.page.evaluate(() => { const b = document.getElementById('tl-set-backup-box'); return { shown: b.getClientRects().length > 0, warned: /lock|bloquead/i.test(b.textContent), sizes: ['tl-set-backup-make', 'tl-set-restore-file'].map((id) => Math.round(document.getElementById(id).getBoundingClientRect().height)), label: (document.getElementById('tl-set-restore-file').labels[0] || {}).textContent || '', askHidden: document.getElementById('tl-set-restore-ask').hidden }; });
  check(box.shown && box.warned && box.sizes.every((h) => h >= 44) && box.label.length > 8 && box.askHidden, 'Settings has "A backup file": it says the file isn\'t locked, and has a button to make one and a labelled field to restore one');
  await old.page.click('#tl-set-backup-make');
  await old.page.waitForFunction(() => window.__files.length === 1);
  const made = await old.page.evaluate(() => window.__files[0]);
  let parsed = null;
  try { parsed = JSON.parse(made.text); } catch (e) { parsed = null; }
  check(/^[a-z-]+\.json$/.test(made.name) && parsed && parsed.kind === 'tidelight-backup' && parsed.data['tidelight.plan.v1'] === PLAN, `the phone is handed one file, "${made.name}", holding what is stored, as stored`);
  check(Object.keys(parsed.data).every((key) => key.startsWith('tidelight.')) && !Object.keys(parsed.data).includes('tidelight.reminders.v1'), 'only the app\'s own things are in it');
  check((await note(old.page, 'tl-set-backup-note')).length > 20, 'the screen says it was handed over and that no record is kept');
  check(old.errors.length === 0 && old.outside.length === 0, 'no script errors, and nothing was requested from outside the app');
  await old.context.close();

  // ---- another phone: give the file back ----
  const fresh = await newPage(browser, lang, { 'tidelight.plan.v1': JSON.stringify({ signs: ['Something already on this phone'], coping: [], distract: [], people: [], pros: [], safer: [], updatedAt: '' }), 'tidelight.letter.v1': JSON.stringify({ text: 'A letter only on this phone' }) });
  const { page } = fresh;
  await openSettings(page);
  await give(page, 'holiday.json', '{"photos":["not a backup"]}');
  await page.waitForTimeout(250);
  check((await note(page, 'tl-set-restore-note')).length > 20 && !(await page.isVisible('#tl-set-restore-ask')) && /already on this phone/.test(await planOnPhone(page)), `a file that isn't a backup is refused, and nothing changes: "${await note(page, 'tl-set-restore-note')}"`);
  await give(page, 'notes.txt', 'just some words');
  await page.waitForTimeout(250);
  check(!(await page.isVisible('#tl-set-restore-ask')) && /already on this phone/.test(await planOnPhone(page)), 'so is a file of plain words');
  await give(page, made.name, made.text.replace('"schema": 2', '"schema": 99'));
  await page.waitForTimeout(250);
  const newer = await note(page, 'tl-set-restore-note');
  check(!(await page.isVisible('#tl-set-restore-ask')) && newer.length > 20 && /already on this phone/.test(await planOnPhone(page)), `and one from a newer version of the app, with what to do: "${newer}"`);

  await give(page, made.name, made.text);
  await page.waitForSelector('#tl-set-restore-ask:not([hidden])');
  const ask = await page.evaluate(() => ({ words: document.getElementById('tl-set-restore-ask').textContent.replace(/\s+/g, ' ').trim(), sizes: ['tl-set-restore-yes', 'tl-set-restore-no'].map((id) => Math.round(document.getElementById(id).getBoundingClientRect().height)) }));
  check(ask.words.length > 80 && ask.sizes.every((h) => h >= 44) && /already on this phone/.test(await planOnPhone(page)), 'a real backup file is not restored at once: the screen first says it replaces what is here and can\'t be undone');
  await page.click('#tl-set-restore-no');
  await page.waitForTimeout(200);
  check(!(await page.isVisible('#tl-set-restore-ask')) && /already on this phone/.test(await planOnPhone(page)) && (await note(page, 'tl-set-restore-note')).length > 5, '"Keep what is on this phone" changes nothing, and says so');

  await give(page, made.name, made.text);
  await page.waitForSelector('#tl-set-restore-ask:not([hidden])');
  await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('#tl-set-restore-yes')]);
  await page.waitForSelector('html.app-ready');
  const now = await page.evaluate(() => ({ plan: localStorage.getItem('tidelight.plan.v1'), letter: localStorage.getItem('tidelight.letter.v1'), profile: localStorage.getItem('tidelight.profile'), follow: JSON.parse(localStorage.getItem('tidelight.follow.v1') || 'null') }));
  check(now.plan === PLAN && /made-up name/.test(now.profile || ''), '"Replace what is on this phone" puts the file\'s plan and name here');
  check(now.letter === null, 'and what was only on this phone is gone: nothing of the two is mixed');
  check(now.follow && now.follow.who === 'A made-up person' && now.follow.at === '', 'a reminder time in the file is cleared, since this phone has no such reminder');
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-plan');
  await page.waitForSelector('#tl-plan:not([hidden])');
  check((await page.$$eval('#tl-plan .tl-plan-text', (els) => els.map((el) => el.textContent))).includes('A made-up warning sign, zqxv'), 'the app shows the restored plan');
  check(fresh.errors.length === 0, 'no script errors' + (fresh.errors.length ? ': ' + fresh.errors.slice(0, 2).join(' | ') : ''));
  check(fresh.outside.length === 0, 'nothing was requested from outside the app');
  await fresh.context.close();
}
{
  const { context, page } = await newPage(browser, 'es', null, { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openSettings(page);
  await give(page, 'tidelight-respaldo.json', JSON.stringify({ kind: 'tidelight-backup', version: 1, schema: 2, made: '', data: {} }));
  await page.waitForSelector('#tl-set-restore-ask:not([hidden])');
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const box = document.getElementById('tl-set-backup-box'); const limit = window.innerWidth + 1; return Array.from(box.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className || el.tagName).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: the box and its question fit` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with a stand-in for the share sheet; no file left this computer.`);
process.exit(tally.failures ? 1 : 0);

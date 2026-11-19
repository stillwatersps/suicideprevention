// Reminders in the person's own words: kept on the phone, shown by the phone, and never anything
// about mood, crisis, or getting help.
//   node test/reminder-words-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with a stand-in for the phone's notifications. No notification is shown.
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
  await context.addInitScript(() => {
    window.__tidelight = { clockRate: 1, grantNotifications: true, schedules: [], scheduled: [], onSchedule(list) { this.schedules.push(list); this.scheduled = list; } };
    // A phone remembers that notifications were allowed when the app is closed and opened; so does this stand-in.
    Object.defineProperty(window.__tidelight, 'notificationAuthorization', { configurable: true, enumerable: true,
      get() { try { return sessionStorage.getItem('stand-in-notifications') || 'notDetermined'; } catch (e) { return 'notDetermined'; } },
      set(value) { try { sessionStorage.setItem('stand-in-notifications', value); } catch (e) { /* stays not asked */ } } });
  });
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
const bodies = (page) => page.evaluate(() => Array.from(new Set((window.__tidelight.scheduled || []).map((n) => n.body))));
const status = (page) => page.evaluate(() => { const s = document.getElementById('tl-set-rem-words-status'); return s.hidden ? '' : s.textContent.trim(); });
const kept = (page) => page.evaluate(() => (JSON.parse(localStorage.getItem('tidelight.settings') || '{}').reminderWords));
const save = async (page, words) => { await page.fill('#tl-set-rem-words', words); await page.click('#tl-set-rem-words-save'); await page.waitForTimeout(250); };

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nReminders in my own words, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await openSettings(page);
  await page.click('#tl-set-reminders');
  await page.waitForFunction(() => window.__tidelight.scheduled.length > 0);
  const usual = await bodies(page);
  const seen = await page.evaluate(() => { const f = document.getElementById('tl-set-rem-words'); const note = document.getElementById('tl-set-rem-words-note'); return { label: (f.labels[0] || {}).textContent || '', max: f.maxLength, empty: f.value === '', described: f.getAttribute('aria-describedby') === note.id, note: note.getClientRects().length > 0, noteTop: note.getBoundingClientRect().top, saveTop: document.getElementById('tl-set-rem-words-save').getBoundingClientRect().top, h: Math.round(f.getBoundingClientRect().height) }; });
  check(usual.length === 1 && seen.empty, `with reminders on and no words of the person's, every reminder says the usual words ("${usual[0]}")`);
  check(seen.label.length > 10 && seen.max === 60 && seen.h >= 44, 'Settings has a labelled field for the person\'s own words, 60 characters at most');
  check(seen.note && seen.described && seen.noteTop < seen.saveTop, 'it says, before the Save button, that a reminder shows on the lock screen where others can read it');
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen');

  await save(page, '  Water   the plants ');
  const mine = await bodies(page);
  check(mine.length === 1 && mine[0] === 'Water the plants' && (await kept(page)) === 'Water the plants', 'saving "Water the plants" sets every reminder to say exactly that, and keeps it with the settings');
  check((await status(page)).length > 10 && (await page.$eval('.tl-rem-sample', (el) => el.textContent)) === 'Water the plants', 'the screen says it was saved, and the sample sentence shows the new words');
  check((await page.evaluate(() => window.__tidelight.scheduled.every((n) => n.title === 'Tidelight'))), 'the title is still only "Tidelight"');

  const refusedWith = lang === 'es' ? '¿Cómo está tu ánimo hoy?' : 'How is your mood today?';
  const before = await status(page);
  await save(page, refusedWith);
  const said = await status(page);
  check((await bodies(page)).join() === 'Water the plants' && (await kept(page)) === 'Water the plants' && said !== before && said.length > 20, `"${refusedWith}" is refused, with a reason, and the reminders don't change`);
  for (const words of ['Call 988 now', 'crisis', 'Open Tidelight']) await save(page, words);
  check((await bodies(page)).join() === 'Water the plants', 'so are a crisis line, the word "crisis", and the app\'s own name');

  await page.reload();
  await page.waitForSelector('html.app-ready');
  await page.waitForFunction(() => window.__tidelight.scheduled.length > 0);
  check((await bodies(page)).join() === 'Water the plants', 'after the app is closed and opened, reminders are set with the person\'s words again');
  await openSettings(page);
  check((await page.inputValue('#tl-set-rem-words')) === 'Water the plants', 'and the field shows them');
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-settings', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on Settings' + (audit.length ? ': ' + audit.join(', ') : ''));

  await save(page, '');
  check((await bodies(page)).join() === usual.join() && (await kept(page)) === '', 'saving the field empty goes back to the usual words');
  await save(page, 'Blue door');
  await page.evaluate(() => window.dispatchEvent(new Event('tidelight-erased')));
  await page.waitForTimeout(400);
  check((await bodies(page)).join() === usual.join() && !(await kept(page)) && (await page.inputValue('#tl-set-rem-words')) === '', 'Delete everything removes the words, and reminders already set go back to the usual words');

  // Words that got onto the phone some other way are never used if they aren't discreet.
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('tidelight.settings') || '{}'); s.reminderWords = 'Feeling sad? Call 988'; localStorage.setItem('tidelight.settings', JSON.stringify(s)); });
  await page.reload();
  await page.waitForSelector('html.app-ready');
  await page.waitForFunction(() => window.__tidelight.scheduled.length > 0);
  check((await bodies(page)).join() === usual.join(), 'words already on the phone that name mood or a crisis line are not used');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openSettings(page);
  await page.fill('#tl-set-rem-words', 'Una palabra muy larga para ver si cabe en la pantalla pequeña');
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const limit = window.innerWidth + 1; return ['tl-set-rem-words', 'tl-set-rem-words-note', 'tl-set-rem-words-save', 'tl-set-rem-words-status'].filter((id) => { const el = document.getElementById(id); return el.getClientRects().length && el.getBoundingClientRect().right > limit; }); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: the field, its note and its button fit` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with a stand-in for the phone's notifications; not a phone.`);
process.exit(tally.failures ? 1 : 0);

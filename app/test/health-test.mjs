// Apple Health: off until the person turns it on; then each finished meditation is handed to the
// phone as a start time and a length, and nothing else. Where there is no Health, the setting is
// not shown at all.
//   node test/health-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium, muted, with a stand-in for the phone's Health: nothing is written anywhere.
// Not a phone. No call, text, or chat is ever started.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, noSideways, openSettings, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const oneADay = { checkInsPerDay: 1, countChosen: true };

// `health` is the stand-in for the phone's Health ({ status, grant }); leave it out for a phone without Health.
async function newPage(browser, lang, { health, settings = oneADay, colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(([given, stored]) => {
    // The clock runs 20 times fast, so a one-minute meditation takes three seconds.
    window.__tidelight = { clockRate: 20 };
    if (given) window.__tidelight.health = Object.assign({ written: [], removed: 0 }, given);
    try { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('tidelight.settings', stored); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, [health || null, JSON.stringify(settings)]);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
async function settingsOpen(page) {
  await openSettings(page);
  await page.waitForSelector('#tl-settings:not([hidden])');
  await page.waitForTimeout(400);
}
// One short meditation, played to its end, then closed.
async function meditate(page, { mood } = {}) {
  await tab(page, 'meditate');
  if (!(await page.isVisible('#tl-meditate'))) await tab(page, 'meditate');
  await page.click('.tl-type[data-type="quick"] [data-type-start]');
  await page.waitForSelector('#tl-stage:not([hidden])');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 10000 });
  if (mood) await page.click(`#tl-complete-faces [data-value="${mood}"]`);
  await page.waitForTimeout(300);
}
const leavePlayer = async (page) => { await page.click('#tl-complete [data-player-done]'); await page.waitForSelector('#tl-tabbar [data-tl-tab-btn="home"]', { state: 'visible' }); await page.waitForTimeout(200); };
const phone = (page) => page.evaluate(() => window.__tidelight.health || null);
const setting = (page) => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('tidelight.settings') || '{}').health; } catch (e) { return 'unreadable'; } });
const box = (page) => page.evaluate(() => { const el = document.getElementById('tl-set-health-box'); const toggle = document.getElementById('tl-set-health'); const note = document.getElementById('tl-set-health-note'); return { shown: Boolean(el) && !el.hidden && el.getClientRects().length > 0, on: toggle.checked, note: note.hidden ? '' : note.textContent.trim(), text: el.innerText, h: toggle.closest('label').getBoundingClientRect().height, remove: document.getElementById('tl-set-health-remove').getBoundingClientRect().height }; });

const browser = await openBrowser();

console.log('\nA phone without Health (a browser, Android, some iPads)');
{
  const { context, page, errors } = await newPage(browser, 'en');
  await settingsOpen(page);
  check((await box(page)).shown === false, 'Settings doesn\'t show the Health setting at all');
  await meditate(page);
  await leavePlayer(page);
  check((await setting(page)) !== true, 'and a finished meditation changes nothing about it');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors[0] : ''));
  await context.close();
}

for (const lang of ['en', 'es']) {
  console.log(`\nApple Health, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang, { health: { status: 'notDetermined', grant: true } });

  // ---- off until turned on ----
  await meditate(page);
  await leavePlayer(page);
  check((await phone(page)).written.length === 0, 'before it is turned on, a finished meditation adds nothing to Health');
  await settingsOpen(page);
  let seen = await box(page);
  check(seen.shown && !seen.on && seen.note === '', 'Settings shows the choice, and it is off');
  check(seen.h >= 44 && seen.remove >= 44, 'the switch and the remove button are at least 44 points tall');
  check(/iCloud/.test(seen.text) && /Apple/.test(seen.text) && (lang === 'es' ? /no lee nada/i : /reads nothing/i).test(seen.text), 'its words say what is added, that Health is Apple\'s, that it can go to iCloud, and that Tidelight reads nothing from it');
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen');

  // ---- turned on: the phone is asked, then each finished meditation is handed over once ----
  await page.check('#tl-set-health');
  await page.waitForFunction(() => window.__tidelight.health.status === 'allowed');
  await page.waitForTimeout(300);
  seen = await box(page);
  check(seen.on && (await setting(page)) === true && seen.note === '', 'turning it on asks the phone, and it stays on when the phone says yes');
  await meditate(page, { mood: 4 });
  let health = await phone(page);
  const one = health.written[0] || {};
  check(health.written.length === 1, 'a finished meditation is handed to Health once, even with a mood chosen after it');
  check(JSON.stringify(Object.keys(one).sort()) === '["seconds","startedAt"]' && one.seconds === 60 && Math.abs(one.startedAt - Date.now()) < 120000, `what is handed over is when it started and how long it lasted, and nothing else: ${JSON.stringify(Object.keys(one))}`);
  check(!/mood|4\b/.test(JSON.stringify(one).replace(String(one.startedAt), '').replace('60', '')), 'the mood chosen after is not in it');
  await leavePlayer(page);

  // ---- turned off: nothing more is added ----
  await settingsOpen(page);
  await page.uncheck('#tl-set-health');
  await page.waitForTimeout(300);
  check((await setting(page)) === false, 'turning it off is kept');
  await meditate(page);
  await leavePlayer(page);
  check((await phone(page)).written.length === 1, 'and the next meditation adds nothing');

  // ---- removing what was added ----
  await settingsOpen(page);
  await page.click('#tl-set-health-remove');
  await page.waitForSelector('#tl-set-health-note:not([hidden])');
  health = await phone(page);
  check(health.removed === 1 && health.written.length === 0 && (await box(page)).note.length > 10, `the remove button takes Tidelight's entries out of Health and says so: "${(await box(page)).note}"`);
  await page.evaluate(() => { window.__tidelight.health.failRemove = true; });
  await page.click('#tl-set-health-remove');
  await page.waitForTimeout(300);
  const failed = (await box(page)).note;
  check(failed.length > 10 && !/undefined|Error|null/.test(failed) && /Health|Salud/.test(failed), `if that can't be done, it says so in plain words: "${failed}"`);
  await page.evaluate(() => { window.__tidelight.health.failRemove = false; });

  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.getElementById('tl-set-health-box').scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(300);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-set-health-box', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`); });
  check(audit.length === 0, 'the automated accessibility audit finds nothing serious' + (audit.length ? ': ' + audit.join('; ') : ''));
  check(await noSideways(page), 'no sideways scrolling');

  // ---- Delete everything removes them too ----
  await page.check('#tl-set-health');
  await page.waitForTimeout(300);
  await meditate(page);
  await leavePlayer(page);
  const before = (await phone(page)).removed;
  check((await phone(page)).written.length === 1, 'on again: a meditation is added');
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin [data-tl-legacy="ci-journey"]');
  await page.click('.ci-erase-start');
  await page.click('.ci-erase-yes');
  await page.waitForFunction((n) => window.__tidelight.health.removed > n, before, { timeout: 5000 }).catch(() => {});
  health = await phone(page);
  check(health.removed === before + 1 && health.written.length === 0, 'Delete everything also removes what Tidelight added to Health');

  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}

console.log('\nWhen the phone says no');
for (const lang of ['en', 'es']) {
  const { context, page } = await newPage(browser, lang, { health: { status: 'notDetermined', grant: false } });
  await settingsOpen(page);
  await page.click('#tl-set-health'); // a tap: the switch turns itself back off when the phone says no
  await page.waitForFunction(() => window.__tidelight.health.status === 'denied');
  await page.waitForSelector('#tl-set-health-note:not([hidden])');
  const seen = await box(page);
  check(!seen.on && (await setting(page)) === false && seen.note.length > 20, `${name(lang)}: the switch goes back off and the page says why: "${seen.note}"`);
  await meditate(page);
  check((await phone(page)).written.length === 0, `${name(lang)}: and nothing is added to Health`);
  await context.close();
}

console.log('\nWhen Health\'s permission was taken away later');
{
  const { context, page } = await newPage(browser, 'en', { health: { status: 'denied' }, settings: { ...oneADay, health: true } });
  await meditate(page);
  await leavePlayer(page);
  check((await phone(page)).written.length === 0, 'a meditation adds nothing: the phone refuses, and the app says nothing about it');
  await settingsOpen(page);
  await page.waitForFunction(() => { try { return JSON.parse(localStorage.getItem('tidelight.settings')).health === false; } catch (e) { return false; } }, null, { timeout: 4000 }).catch(() => {});
  check((await box(page)).on === false && (await setting(page)) === false, 'Settings shows the switch off, as it now is');
  await context.close();
}

console.log('\nDark mode, a small phone, and the largest text');
{
  const { context, page } = await newPage(browser, 'es', { health: { status: 'notDetermined', grant: true }, colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await settingsOpen(page);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.getElementById('tl-set-health-box').scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(400);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-set-health-box', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'Spanish, dark, a small phone: the audit finds nothing serious' + (audit.length ? ': ' + audit.join(', ') : ''));
  for (const size of ['200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-set-health-box, #tl-set-health-box *')).filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > window.innerWidth + 1); }).length);
    check(wide === 0, `text at ${size}: nothing in it runs off the side`);
  }
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with a stand-in for the phone's Health; nothing was written anywhere. Not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

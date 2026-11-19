// Faults a read of the whole app found on November 16, 2026, each held fixed here.
//   node test/faults-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium, muted, with stand-ins for everything a phone does. Not a phone. The app's files
// are answered from disk, nothing outside is reachable, and no call, text, or chat is ever started.
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { counter, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const www = fileURLToPath(new URL('../www/', import.meta.url));
const BASE = 'http://tidelight.test/';
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.vcf': 'text/vcard' };
const { check, tally } = counter();
const browser = await openBrowser();

async function open({ hooks = {}, storage = {}, seed = true, init = null, path = 'check-in/' } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const errors = [];
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin + '/' !== BASE) return route.abort();
    let file = decodeURIComponent(url.pathname);
    if (file.endsWith('/')) file += 'index.html';
    try { return route.fulfill({ status: 200, contentType: TYPES[extname(file)] || 'application/octet-stream', body: await readFile(join(www, normalize(file))) }); } catch (e) { return route.fulfill({ status: 404, body: '' }); }
  });
  await context.addInitScript(([given, stored]) => {
    window.__tidelight = Object.assign({ clockRate: 1 }, JSON.parse(JSON.stringify(given)));
    // Seeded once for the visit, so what the app saves afterwards is not put back by a later page.
    try { if (!sessionStorage.getItem('seeded')) { Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* no storage */ }
  }, [hooks, storage]);
  if (init) await context.addInitScript(init);
  if (seed) await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + path);
  return { context, page, errors };
}
const stored = (page, key) => page.evaluate((k) => localStorage.getItem(k), key);
const showing = (page, selector) => page.evaluate((s) => { const el = document.querySelector(s); return Boolean(el && !el.hidden && el.getClientRects().length); }, selector);
const screens = (page) => page.evaluate(() => Array.from(document.querySelectorAll('.tl-screen')).filter((s) => !s.hidden).map((s) => s.id).join(','));
// What Quick exit does to the page (it is hidden), then what coming back to the app does
// (app-return.js). No outside page is opened.
const quickExitAndBack = async (page) => { await page.evaluate(() => { document.documentElement.hidden = true; window.dispatchEvent(new Event('pageshow')); }); await page.waitForTimeout(300); };
const PLAN = { signs: ['A made-up warning sign'], coping: ['A made-up thing to do'], distract: [], people: [], pros: [], safer: [], updatedAt: 'x' };

console.log('\nNothing is celebrated on a day with a very low check-in');
{
  const now = new Date().toISOString();
  const storage = {
    'tidelight.profile': JSON.stringify({ name: 'Sam' }),
    'tidelight.settings': JSON.stringify({ countChosen: true, styleChosen: true, remindersOn: true, checkInStyle: 'straightforward' }),
    'tidelight.home': JSON.stringify({ latitude: 40, longitude: -100, savedAt: now }),
    'tidelight.sessions': JSON.stringify([{ id: now + '-quick-1', meditationId: 'quick-1', type: 'quick', startedAt: now, totalSeconds: 60, completedSeconds: 60, completed: true }]),
  };
  const init = 'window.__haptics = []; window.__tidelight.onHaptic = (o) => window.__haptics.push(o);';
  const { context, page, errors } = await open({ storage, init, hooks: { locationAuthorization: 'whenInUse', notificationAuthorization: 'authorized' } });
  await page.waitForSelector('html.app-ready');
  await page.waitForTimeout(800);
  check((await page.textContent('#tl-setup-count')).includes('7'), 'the setup list has one thing left: the first check-in');
  await page.click('#tl-home-next');
  await page.waitForSelector('#tl-flow:not([hidden])');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.evaluate(() => { window.__haptics.length = 0; });
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => ({ buzzes: window.__haptics.map((h) => h.kind || h.type || h.name || JSON.stringify(h)), done: document.getElementById('tl-setup-done').hidden, onboarding: JSON.parse(localStorage.getItem('tidelight.onboarding') || '{}') }));
  check(!after.buzzes.some((kind) => /success/.test(kind)), 'no success buzz while the support step is on screen' + (after.buzzes.length ? ' (felt: ' + after.buzzes.join(', ') + ')' : ''));
  check(after.done && !after.onboarding.setupCelebrated && Boolean(after.onboarding.quietDay), '"Setup complete" is not shown, and is kept for another day');
  await page.click('#tl-flow-support [data-tl-go="home"]');
  await page.waitForTimeout(400);
  check(!(await showing(page, '#tl-setup-done')), 'and it is not on Home for the rest of that day');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors[0] : ''));
  await context.close();
}

console.log('\nA phone set to Spanish still opens where a widget or shortcut asked');
{
  // The phone hands the place over once, however many pages load.
  const once = `try { if (!sessionStorage.getItem('lt-set')) { sessionStorage.setItem('lt', '#tl-plan'); sessionStorage.setItem('lt-set', '1'); } } catch (e) {}
    Object.defineProperty(window.__tidelight, 'launchTarget', { configurable: true, get() { return sessionStorage.getItem('lt') || ''; }, set(v) { sessionStorage.setItem('lt', v || ''); } });`;
  for (const language of ['en', 'es']) {
    const { context, page, errors } = await open({ storage: { 'tidelight.plan.v1': JSON.stringify(PLAN), 'tidelight.language': language }, init: once });
    await page.waitForFunction((lang) => document.documentElement.lang === lang && document.documentElement.classList.contains('app-ready'), language);
    await page.waitForTimeout(600);
    check(await showing(page, '#tl-plan'), `saved language ${language}: the plan opens, in that language`);
    check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors[0] : ''));
    await context.close();
  }
}

console.log('\nThe language link is remembered wherever it is tapped');
for (const saved of [null, 'en']) {
  const { context, page, errors } = await open({ storage: saved ? { 'tidelight.language': saved } : {}, path: 'get-help/' });
  await page.waitForLoadState('load');
  await page.click('.lang-switch a'); // "Leer en español", on the Get help page
  await page.waitForLoadState('load');
  check(await page.evaluate(() => document.documentElement.lang === 'es'), `saved before: ${saved || 'nothing'}. The Get help page opens in Spanish`);
  await page.click('#tl-tabbar a >> nth=1'); // a tab, as a link, on that page
  await page.waitForFunction(() => document.documentElement.classList.contains('app-ready'));
  await page.waitForTimeout(500);
  const back = await page.evaluate(() => ({ lang: document.documentElement.lang, kept: localStorage.getItem('tidelight.language') }));
  check(back.lang === 'es' && back.kept === 'es', 'a tab from there stays in Spanish, and the choice is saved');
  check((await screens(page)) === 'tl-checkin', 'and it opens the tab that was tapped (Check-in), not Home');
  await page.goto(BASE + 'check-in/'); // the next launch: the app always starts here
  await page.waitForFunction(() => document.documentElement.lang === 'es' && document.documentElement.classList.contains('app-ready'));
  check(true, 'the next launch opens in Spanish');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors[0] : ''));
  await context.close();
}

console.log('\nLeaving "Enter my date of birth again" by Quick exit');
{
  const { context, page, errors } = await open();
  await page.waitForSelector('html.app-ready');
  await page.click('#tl-home [data-tl-push="settings"]');
  await page.waitForSelector('#tl-settings:not([hidden])');
  await page.click('.app-age-change');
  await page.waitForTimeout(300);
  check((await screens(page)) === 'tl-onboarding' && !(await showing(page, '#tl-tabbar')), 'the date of birth page fills the screen');
  await quickExitAndBack(page);
  const classes = await page.evaluate(() => document.documentElement.className);
  check((await screens(page)) === 'tl-home' && (await showing(page, '#tl-tabbar')) && !/tl-full|app-asking-age/.test(classes), 'coming back shows Home with the tab bar');
  check((await stored(page, 'tidelight.agegroup.v1')) !== null, 'the age group already saved is kept');
  await page.click('#tl-tabbar [data-tl-tab-btn="checkin"]');
  check((await screens(page)) === 'tl-checkin', 'and the tabs work');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors[0] : ''));
  await context.close();
}

console.log('\nThe words to share are not left on the page after Quick exit');
{
  const { context, page, errors } = await open({ storage: { 'tidelight.plan.v1': JSON.stringify(PLAN) } });
  await page.waitForSelector('html.app-ready');
  await page.click('#tl-tabbar [data-tl-tab-btn="checkin"]');
  await page.click('#tl-checkin-plan');
  await page.waitForSelector('#tl-plan:not([hidden])');
  await page.click('#tl-plan-share');
  await page.waitForTimeout(300);
  check((await showing(page, '#app-share-panel')) && (await page.inputValue('#app-share-text')).includes('A made-up warning sign'), 'the share notice is open with the plan in it');
  await quickExitAndBack(page);
  const panel = await page.evaluate(() => ({ off: document.getElementById('app-share-panel').classList.contains('ci-off'), text: document.getElementById('app-share-text').value }));
  check(panel.off && panel.text === '' && (await screens(page)) === 'tl-home', 'after Quick exit: Home, the notice closed, and its words gone');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors[0] : ''));
  await context.close();
}

console.log('\nMeditations');
{
  const sessions = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('tidelight.sessions') || '[]'));
  // A session ended early, then a mood chosen on the screen after it.
  let opened = await open({ hooks: { clockRate: 20 } });
  let page = opened.page;
  await page.waitForSelector('html.app-ready');
  await page.click('#tl-home-reset'); // one minute; at 20 times the speed it is 3 seconds
  await page.waitForSelector('#tl-stage:not([hidden])');
  await page.waitForTimeout(2150);
  await page.click('#tl-stage', { position: { x: 195, y: 300 } });
  await page.click('#tl-player-end');
  await page.click('#tl-end-yes');
  await page.waitForSelector('#tl-complete:not([hidden])');
  const early = (await sessions(page))[0];
  check(early && early.completedSeconds > 20 && early.completedSeconds < 60, `a one-minute session ended early is kept as ${early && early.completedSeconds} seconds`);
  await page.click('#tl-complete-faces [data-value="4"]');
  await page.waitForTimeout(300);
  const mooded = (await sessions(page))[0];
  check(mooded.completedSeconds === early.completedSeconds && mooded.moodAfter === 4 && (await sessions(page)).length === 1, 'choosing a mood afterwards keeps that length (it used to become the full minute)');
  check(opened.errors.length === 0, 'no script errors' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
  await opened.context.close();

  // Two starts at once.
  opened = await open();
  page = opened.page;
  await page.waitForSelector('html.app-ready');
  await page.evaluate(() => { const start = document.getElementById('tl-home-reset'); start.click(); start.click(); });
  await page.waitForTimeout(1500);
  check((await sessions(page)).length === 0 && (await showing(page, '#tl-stage')), 'two starts at once make one session, and no empty one in the history');
  check(opened.errors.length === 0, 'no script errors' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
  await opened.context.close();

  // The player is in place at once, and "End session?" is on the screen wherever the page was scrolled to
  // (found in the iPhone Simulator: a touch stopped the slow scroll, and the question opened off the screen).
  opened = await open();
  page = opened.page;
  await page.waitForSelector('html.app-ready');
  const placed = await page.evaluate(() => { document.getElementById('tl-home-reset').click(); const r = document.getElementById('tl-stage').getBoundingClientRect(); const strip = document.querySelector('.crisis-bar').getBoundingClientRect().bottom; return { top: Math.round(r.top - strip), bottom: Math.round(r.bottom), screen: window.innerHeight }; });
  check(placed.top >= 0 && placed.top <= 2 && placed.bottom <= placed.screen,`the player is under the crisis strip and on the screen the moment it starts (${placed.top} below the strip)`);
  await page.evaluate(() => { window.scrollTo({ top: 0, behavior: 'instant' }); document.getElementById('tl-player-end').click(); });
  await page.waitForTimeout(100);
  const asked = await page.evaluate(() => { const strip = document.querySelector('.crisis-bar').getBoundingClientRect().bottom; return ['tl-end-title', 'tl-end-yes', 'tl-end-no'].map((id) => { const r = document.getElementById(id).getBoundingClientRect(); return r.height > 0 && r.top >= strip - 1 && r.bottom <= window.innerHeight + 1; }); });
  check(asked.every(Boolean), 'with the page scrolled back to its top, "End session?" and both its answers are on the screen');
  check(opened.errors.length === 0, 'no script errors' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
  await opened.context.close();

  // A new screen starts at its top at once (found in the iPhone Simulator: a tab tapped while Home was
  // scrolled down opened part-way down its own page).
  opened = await open();
  page = opened.page;
  await page.waitForSelector('html.app-ready');
  const jump = await page.evaluate(() => { window.scrollTo({ top: 600, behavior: 'instant' }); const before = window.scrollY; document.querySelector('#tl-tabbar [data-tl-tab-btn="meditate"]').click(); return { before, after: window.scrollY }; });
  check(jump.before > 300 && jump.after === 0, `a tab tapped while the page is scrolled down opens at its top at once (from ${jump.before} to ${jump.after})`);
  await opened.context.close();

  // A finished check-in is closed (found in the iPhone Simulator: the Check-in tab opened on a new check-in).
  opened = await open();
  page = opened.page;
  await page.waitForSelector('html.app-ready');
  await page.click('#tl-tabbar [data-tl-tab-btn="home"]');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click('#tl-flow-faces [data-value="4"]');
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow [data-flow="done"]:not([hidden])');
  await page.click('#tl-flow [data-flow="done"] [data-tl-go="home"]');
  await page.click('#tl-tabbar [data-tl-tab-btn="checkin"]');
  await page.waitForTimeout(200);
  check(await showing(page, '#tl-checkin') && !(await showing(page, '#tl-flow')), 'after a finished check-in and "Back to home", the Check-in tab opens on its own first screen');
  check(opened.errors.length === 0, 'no script errors' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
  await opened.context.close();

  // A full list of saved meditations.
  const presets = Array.from({ length: 20 }, (_, i) => ({ id: 'p-' + i, name: 'Mine ' + (i + 1), choices: { lengthMinutes: 5, situation: 'breathe', sound: 'none', world: 'ocean', voice: false, haptics: true, bodyScan: false, style: 'calm' } }));
  opened = await open({ hooks: { clockRate: 40 }, storage: { 'tidelight.presets': JSON.stringify(presets) } });
  page = opened.page;
  await page.waitForSelector('html.app-ready');
  await page.click('#tl-home-reset');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 15000 });
  await page.click('#tl-complete-favorite');
  await page.waitForTimeout(300);
  const names = (await page.evaluate(() => JSON.parse(localStorage.getItem('tidelight.presets') || '[]'))).map((p) => p.name);
  check(names.length === 20 && names[0] === 'Mine 1' && names[19] === 'Mine 20', '"Save as favorite" with 20 saved removes none of them');
  const note = await page.evaluate(() => { const el = document.getElementById('tl-complete-note'); return { shown: !el.hidden && el.getClientRects().length > 0, words: el.textContent.trim() }; });
  check(note.shown && note.words.length > 10, 'and says why: "' + note.words + '"');
  check(opened.errors.length === 0, 'no script errors' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
  await opened.context.close();
}

console.log('\nCheck-in times');
{
  // Times set by hand in the older app, carried over, then setup with Next on every page.
  const old = { morning: { on: true, time: '06:15' }, midday: { on: false, time: '12:00' }, afternoon: { on: true, time: '15:45' }, evening: { on: true, time: '21:10' } };
  let opened = await open({ seed: false, storage: { 'tidelight.reminders.v1': JSON.stringify(old), 'tidelight.agegroup.v1': 'adult' }, hooks: { notificationAuthorization: 'authorized' } });
  let page = opened.page;
  await page.waitForSelector('html.app-ready');
  const times = () => page.evaluate(() => JSON.parse(localStorage.getItem('tidelight.settings') || '{}').customTimes);
  check(JSON.stringify(await times()) === '["06:15","15:45","21:10"]', 'the older app\'s three reminder times come over');
  for (let i = 0; i < 12 && !(await page.isVisible('#tl-ob-start')); i += 1) {
    if (await page.isVisible('.tl-ob-page:not([hidden]) [data-ob-next]')) await page.click('.tl-ob-page:not([hidden]) [data-ob-next]');
    else if (await page.isVisible('#tl-ob-skip')) await page.click('#tl-ob-skip');
    else break;
    await page.waitForTimeout(150);
  }
  check(JSON.stringify(await times()) === '["06:15","15:45","21:10"]', 'and setting up with nothing changed keeps them');
  check(opened.errors.length === 0, 'no script errors' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
  await opened.context.close();

  // A time field must survive being edited.
  opened = await open();
  page = opened.page;
  await page.waitForSelector('html.app-ready');
  await page.click('#tl-home [data-tl-push="settings"]');
  await page.waitForSelector('#tl-set-time-0');
  await page.evaluate(() => { window.__first = document.getElementById('tl-set-time-0'); window.__first.focus(); });
  await page.keyboard.type('0');
  await page.keyboard.type('6');
  await page.waitForTimeout(400);
  const field = await page.evaluate(() => ({ there: document.contains(window.__first), focused: document.activeElement === window.__first }));
  check(field.there && field.focused, 'a check-in time field stays under the cursor while its hour is typed');
  await page.keyboard.type('15');
  await page.keyboard.type('AM');
  await page.waitForTimeout(400);
  const kept = await page.evaluate(() => (JSON.parse(localStorage.getItem('tidelight.settings') || '{}').customTimes || []).join(','));
  check(kept.includes('06:15'), 'and the whole time can be typed and is saved (' + kept + ')');
  check(opened.errors.length === 0, 'no script errors' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
  await opened.context.close();
}

console.log('\nA new day, with the app left open');
{
  const late = new Date(); late.setDate(late.getDate() - 1); late.setHours(23, 50, 0, 0);
  const { context, page, errors } = await open({
    init: `(() => { const real = Date; const start = real.now(); let offset = ${late.getTime()} - start; window.__jump = (ms) => { offset += ms; };
      class Fake extends real { constructor(...a) { if (a.length) super(...a); else super(real.now() + offset); } static now() { return real.now() + offset; } }
      window.Date = Fake; })();`,
  });
  await page.waitForSelector('html.app-ready');
  await page.click('#tl-home-next');
  await page.waitForSelector('#tl-flow:not([hidden])');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click('#tl-flow-faces [data-value="4"]');
  await page.click('#tl-flow-done');
  await page.waitForTimeout(400);
  const older = () => page.evaluate(() => document.querySelectorAll('.app-log li').length);
  check((await older()) === 1, 'ten to midnight: the older "Today\'s check-ins" list has the check-in');
  await page.evaluate(() => { window.__jump(30 * 60 * 1000); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(600);
  check((await older()) === 0, 'twenty past midnight, back in the app: that list is empty, like the newer one');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors[0] : ''));
  await context.close();
}

console.log('\nA tapped reminder');
{
  const { context, page, errors } = await open({ hooks: { reminderTap: {} } });
  await page.waitForSelector('html.app-ready');
  await page.click('#tl-home [data-tl-push="settings"]');
  await page.waitForSelector('#tl-settings:not([hidden])');
  const wired = await page.evaluate(() => typeof window.__tidelight.reminderTap.then === 'function');
  check(wired, 'the app listens for a tap on a check-in reminder');
  if (wired) await page.evaluate(() => window.__tidelight.reminderTap.then());
  await page.waitForTimeout(300);
  check((await screens(page)) === 'tl-checkin', 'and the tap opens the Check-in tab');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors[0] : ''));
  await context.close();
}

console.log('\nA check-in the phone could not save still reaches support');
{
  // The phone refuses every write from here on (what a full phone does).
  const { context, page, errors } = await open();
  await page.waitForSelector('html.app-ready');
  await page.click('#tl-home-next');
  await page.waitForSelector('#tl-flow:not([hidden])');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.evaluate(() => { Storage.prototype.setItem = function () { throw new DOMException('full', 'QuotaExceededError'); }; });
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.click('#tl-flow-done');
  await page.waitForTimeout(800);
  check(await showing(page, '#tl-flow-support'), 'a very low mood shows the support step even when nothing could be saved');
  check(await page.evaluate(() => Boolean(document.querySelector('#tl-flow-support a[href="tel:988"]'))), 'with Call 988 on it');
  await context.close();
  void errors; // a refused write is reported by the app's own line, not as a script error
}

await browser.close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

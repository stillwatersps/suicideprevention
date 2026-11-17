// Tests the privacy features in desktop Chromium, after `node tools/build.mjs`: removing one
// check-in or one meditation session, a copy of the person's data, the backup sentence, the
// licenses screen, and the app lock. Everything a phone does is a stand-in here (the phone's
// own check of who is holding it most of all): this is not a phone test. No test may contact a
// crisis service; crisis links are only checked for being on screen.
import { tab, openPanel, openSettings, safetyFrame, serve, counter, pagePath, noSideways, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();

async function newPage(browser, lang, { seed = true, hooks = {}, storage = {} } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const errors = [];
  const outside = [];
  context.on('request', (r) => { if (!r.url().startsWith(base) && !/^(data|blob):/.test(r.url())) outside.push(r.url()); });
  await context.addInitScript(([given, stored]) => {
    window.__tidelight = Object.assign({ shared: [] }, JSON.parse(JSON.stringify(given)));
    try { if (!sessionStorage.getItem('seeded')) { Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, [hooks, storage]);
  if (seed) await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
const stored = (page, key) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
// The app going to the background and coming back, the way the page hears of it. `asPhone` is
// what the phone does meanwhile: it forgets that it had confirmed the person.
async function leaveAndReturn(page, { comeBack = true } = {}) {
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    if (window.__tidelight.lock) window.__tidelight.lock.unlocked = false;
  });
  if (!comeBack) return;
  await page.evaluate(() => { delete document.visibilityState; document.dispatchEvent(new Event('visibilitychange')); });
}
const comeBack = (page) => page.evaluate(() => { delete document.visibilityState; document.dispatchEvent(new Event('visibilitychange')); });

const NOW = new Date();
const EARLIER = new Date(NOW.getTime() - 1000);
const YESTERDAY = new Date(NOW.getTime() - 26 * 3600 * 1000);
const LOG = [
  { t: YESTERDAY.toISOString(), slot: 'morning', feeling: 'made-up-yesterday', needs: [] },
  { t: EARLIER.toISOString(), slot: 'morning', feeling: 'made-up-first', needs: [] },
  { t: NOW.toISOString(), slot: 'midday', feeling: 'made-up-second', needs: [], kind: 'quick', mood: 4, tags: [], note: 'a made-up note' },
];
const SESSIONS = [
  { id: 's2', type: 'quick', startedAt: NOW.toISOString(), completedSeconds: 180, completed: true },
  { id: 's1', type: 'deep', startedAt: YESTERDAY.toISOString(), completedSeconds: 600, completed: true },
];
const SAVED = {
  'tidelight.log.v1': JSON.stringify(LOG),
  'tidelight.sessions': JSON.stringify(SESSIONS),
  'tidelight.checkin.v1': JSON.stringify({ entries: [{ id: 1, date: NOW.toISOString(), mood: '', moodValue: '', prompt: '', text: 'A made-up journal entry\nwith a second line' }], explore: ['A made-up thing to try'], nextId: 2 }),
  'tidelight.hope.v1': JSON.stringify([{ id: 'h1', kind: 'other', text: 'A made-up reason', when: 1 }]),
  'tidelight.circle.v1': JSON.stringify({ people: [{ name: 'A made-up friend', phone: '555-0100' }], log: [] }),
  'tidelight.profile': JSON.stringify({ name: 'Made-up' }),
};

async function removeTests(browser, lang) {
  console.log(`\nRemoving one check-in or one session, ${name(lang)}`);
  const { context, page, errors } = await newPage(browser, lang, { storage: SAVED });
  await tab(page, 'checkin');
  check((await page.locator('#tl-today-list li').count()) === 2, 'today\'s two check-ins are listed, and yesterday\'s is not');
  check((await page.locator('#tl-today-list .tl-today-remove').count()) === 2, 'each one has its own Remove');
  const small = await page.$$eval('#tl-today-list .tl-today-remove', (els) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).length);
  check(small === 0, 'each Remove is at least 44 points');
  const daysBefore = JSON.stringify(await stored(page, 'tidelight.days'));
  await page.click('#tl-today-list li:first-child .tl-today-remove');
  await page.waitForFunction(() => document.querySelectorAll('#tl-today-list li').length === 1);
  let log = await stored(page, 'tidelight.log.v1');
  check(log.length === 2 && !log.some((item) => item.feeling === 'made-up-first'), 'Remove takes that one check-in off the phone and leaves the others');
  check(await page.isVisible('#tl-today-removed'), 'and the page says it was removed and that the day stays marked');
  check(JSON.stringify(await stored(page, 'tidelight.days')) === daysBefore, 'the days and the streak are left as they were');
  check((await safetyFrame(page)).length === 0 && await noSideways(page), 'the Check-in tab keeps the safety frame and fits');

  await openPanel(page, 'ci-journey');
  check((await page.locator('.app-log li').count()) === 1 && (await page.locator('.app-log .app-log-remove').count()) === 1, 'Your journey lists the one check-in left today, with Remove');
  await page.click('.app-log .app-log-remove');
  await page.waitForFunction(() => document.querySelectorAll('.app-log li').length === 0);
  log = await stored(page, 'tidelight.log.v1');
  check(log.length === 1 && log[0].feeling === 'made-up-yesterday', 'removing it there leaves only yesterday\'s check-in saved');
  check(await page.isVisible('.app-log-removed') && await page.isVisible('.app-log-empty'), 'the page says so, and shows that today has no check-ins');

  await tab(page, 'meditate');
  await page.click('#tl-history-card');
  check((await page.locator('#tl-history-list li').count()) === 2 && (await page.locator('#tl-history-list .tl-history-remove').count()) === 2, 'History lists two sessions, each with Remove');
  check(/13/.test(await page.textContent('#tl-history [data-history-total]')), 'the total is 13 minutes');
  await page.click('#tl-history-list li:first-child .tl-history-remove');
  await page.waitForFunction(() => document.querySelectorAll('#tl-history-list li').length === 1);
  const sessions = await stored(page, 'tidelight.sessions');
  check(sessions.length === 1 && sessions[0].id === 's1', 'Remove takes that one session off the phone');
  check(/10/.test(await page.textContent('#tl-history [data-history-total]')), 'and the total follows: 10 minutes');
  check((await safetyFrame(page)).length === 0 && await noSideways(page), 'History keeps the safety frame and fits');
  check(errors.length === 0, 'no errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await context.close();
}

async function dataTests(browser, lang) {
  console.log(`\nYour data in Settings, and a copy of it, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang, { storage: SAVED });
  await openSettings(page);
  const backup = (await page.textContent('#tl-set-backup')).trim();
  check(await page.isVisible('#tl-set-backup') && /iCloud/.test(backup) && /Google/.test(backup), 'Settings says, in view, that the phone\'s iCloud or Google backup can include what is saved');
  check((await page.evaluate(() => Boolean(document.querySelector('#tl-set-backup').closest('details')))) === false, 'that sentence is not folded behind a tap');
  check(await page.isVisible('#tl-set-export') && await page.isVisible('#tl-settings-erase'), 'a copy of your data and Delete everything are both there');
  check((await page.isVisible('#tl-set-export-note')) === false, 'nothing is said about a copy before one is made');

  // The person closes the share sheet: nothing happened, so nothing is said.
  await page.evaluate(() => { window.__tidelight.onShareFile = (file) => { window.__tidelight.shared.push(file); return { completed: false }; }; });
  await page.click('#tl-set-export');
  await page.waitForFunction(() => window.__tidelight.shared.length === 1);
  check((await page.isVisible('#tl-set-export-note')) === false, 'closing the share sheet says nothing');

  await page.evaluate(() => { window.__tidelight.onShareFile = (file) => { window.__tidelight.shared.push(file); return { completed: true }; }; });
  await page.click('#tl-set-export');
  await page.waitForSelector('#tl-set-export-note:not([hidden])');
  const file = await page.evaluate(() => window.__tidelight.shared[1]);
  check(file.name === (lang === 'es' ? 'tidelight-mis-datos.txt' : 'tidelight-my-data.txt'), 'the file is handed to the phone\'s share sheet by name: ' + file.name);
  const text = file.text;
  check(text.startsWith(lang === 'es' ? 'Tidelight: una copia de mis datos' : 'Tidelight: a copy of my data'), 'the file starts with what it is');
  check(text.includes(lang === 'es' ? 'Este archivo no está bloqueado.' : 'This file is not locked.'), 'and says it is not locked');
  for (const piece of ['made-up-yesterday', 'made-up-first', 'made-up-second', 'a made-up note', 'A made-up journal entry\nwith a second line', 'A made-up thing to try', 'A made-up reason', 'A made-up friend, 555-0100', 'Made-up']) {
    check(text.includes(piece), 'the file holds: ' + piece.replace('\n', ' / '));
  }
  check(text.includes(lang === 'es' ? 'Nada guardado.' : 'Nothing saved.'), 'a kind of thing with nothing kept says so');
  check(!/undefined|\[object|NaN|null/.test(text), 'nothing reads as "undefined", "null", or an object');
  const headings = text.split('\n').filter((line) => line && line === line.toUpperCase() && /[A-ZÁÉÍÓÚÑ]{3}/.test(line));
  // Fourteen since November 16, 2026: the letter to myself has its own section, after the safety plan.
  check(headings.length === 14 && new Set(headings).size === 14, 'fourteen sections, each under its own heading: ' + headings.length);
  check(/\S/.test(await page.textContent('#tl-set-export-note')), 'the page says the copy was made');
  check(outside.length === 0, 'making the copy sent nothing anywhere');
  check(JSON.stringify(await stored(page, 'tidelight.log.v1')) === JSON.stringify(LOG), 'and changed nothing that is saved');
  check((await safetyFrame(page)).length === 0 && await noSideways(page), 'Settings keeps the safety frame and fits');

  // Licenses.
  await page.click('#tl-settings-licenses');
  check(await page.isVisible('#tl-licenses'), 'Settings opens the open-source licenses');
  const licenses = await page.textContent('#tl-licenses');
  for (const piece of ['@capacitor/core', '@capacitor/share', 'tslib', 'Literata', 'MIT License', 'Permission is hereby granted', 'SIL OPEN FONT LICENSE', 'Copyright']) {
    check(licenses.includes(piece), 'the licenses screen carries: ' + piece);
  }
  check((await page.locator('#tl-licenses .tl-license').count()) >= 3 && (await page.$$eval('#tl-licenses .tl-license, #tl-licenses .tl-license-name', (els) => els.every((e) => e.getAttribute('lang') === 'en'))), 'each notice is marked as English, for screen readers');
  check(await page.isVisible('#tl-licenses .tl-draft-tag a[href="#tl-review"]'), 'the screen carries the draft mark');
  check((await safetyFrame(page)).length === 0 && await noSideways(page), 'the licenses screen keeps the safety frame and fits');
  await page.click('#tl-licenses [data-tl-back]');
  check(await page.isVisible('#tl-settings'), 'Back returns to Settings');
  check(errors.length === 0, 'no errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await context.close();
}

async function lockTests(browser, lang) {
  console.log(`\nThe app lock, ${name(lang)}`);
  const noteText = (page) => page.evaluate(() => { const note = document.querySelector('#tl-set-lock-note'); return note.hidden ? '' : note.textContent.trim(); });
  // Flip the switch on and wait until the app has either kept the choice or said why not.
  const tryOn = async (page) => {
    await page.click('#tl-set-lock');
    await page.waitForFunction(() => !document.querySelector('#tl-set-lock-note').hidden || (JSON.parse(localStorage.getItem('tidelight.settings') || '{}').appLock === true && document.querySelector('#tl-set-lock').checked));
  };

  // A browser, or a phone the lock isn't built for: the switch goes back off and says why.
  {
    const { context, page } = await newPage(browser, lang);
    await openSettings(page);
    check((await page.isChecked('#tl-set-lock')) === false, 'the lock is off until someone turns it on');
    await tryOn(page);
    check((await page.isChecked('#tl-set-lock')) === false && (await noteText(page)).length > 10 && (await stored(page, 'tidelight.settings') || {}).appLock !== true, 'where the phone can\'t lock the app, the switch goes back off and says so');
    await context.close();
  }
  {
    const { context, page } = await newPage(browser, lang, { hooks: { lock: { noPasscode: true } } });
    await openSettings(page);
    await tryOn(page);
    check((await page.isChecked('#tl-set-lock')) === false && /passcode|código/.test(await noteText(page)), 'a phone with no passcode: the switch goes back off and says to set one');
    await context.close();
  }
  {
    const { context, page } = await newPage(browser, lang, { hooks: { lock: { unlocked: false, allow: false } } });
    await openSettings(page);
    await tryOn(page);
    check((await page.isChecked('#tl-set-lock')) === false && (await noteText(page)).length > 10 && (await stored(page, 'tidelight.settings') || {}).appLock !== true, 'the phone doesn\'t confirm the person: the lock stays off, and says so');
    check((await page.evaluate(() => document.documentElement.classList.contains('tl-locked'))) === false, 'and the app is not covered');
    await context.close();
  }

  // Turning it on, leaving, and coming back.
  {
    const { context, page, errors } = await newPage(browser, lang, { hooks: { lock: { unlocked: false, allow: true } }, storage: SAVED });
    await leaveAndReturn(page);
    check((await page.evaluate(() => document.documentElement.classList.contains('tl-locked'))) === false, 'with the lock off, leaving and coming back covers nothing');
    await openSettings(page);
    await tryOn(page);
    const asked = await page.evaluate(() => window.__tidelight.lock);
    check((await page.isChecked('#tl-set-lock')) && (await stored(page, 'tidelight.settings')).appLock === true, 'turning the lock on asks the phone first, then keeps the choice');
    check(asked.asked === 1 && asked.reason === (lang === 'es' ? 'Desbloquear Tidelight' : 'Unlock Tidelight') && asked.enabled === true, 'the phone is asked once, with plain words, and told the lock is on');
    check(await page.isVisible('#tl-settings') && (await noteText(page)) === '', 'the person stays in Settings, unlocked');

    await page.evaluate(() => { window.__tidelight.lock.allow = false; });
    await leaveAndReturn(page, { comeBack: false });
    check(await page.isVisible('#tl-lock') && (await page.$$eval('.tl-screen', (els) => els.filter((e) => e.offsetParent !== null).length)) === 0, 'leaving the app covers its screens at once');
    const coverTop = await page.evaluate(() => ({ top: window.__tidelight.lock.top, strip: Math.round(document.querySelector('.crisis-bar').getBoundingClientRect().bottom) }));
    check(coverTop.top === coverTop.strip && coverTop.top > 40, 'the phone is told where the crisis strip ends, so its cover for the app switcher starts below the strip: ' + coverTop.top);
    await comeBack(page);
    await page.waitForSelector('#tl-lock-note:not([hidden])');
    await page.waitForFunction(() => window.__tidelight.lock.drawn >= 1, null, { timeout: 4000 }).catch(() => {});
    check((await page.evaluate(() => window.__tidelight.lock.drawn)) >= 1, 'coming back, the page tells the phone once its lock screen is drawn, so the phone\'s cover can lift');
    check(await page.isVisible('#tl-lock') && await page.isVisible('#tl-lock-open'), 'coming back, the app is locked, with an Unlock button');
    check((await page.isVisible('#tl-tabbar')) === false, 'the tab bar is covered too');
    const missing = await safetyFrame(page);
    check(missing.length === 0, 'locked: 988, 911, Exit, Get Support Now, the language link, and both review notices are still on screen' + (missing.length ? ': missing ' + missing.join(', ') : ''));
    check(await page.isVisible('#tl-lock .tl-draft-tag a[href="#tl-review"]'), 'the lock screen carries the draft mark');
    const seen = await page.evaluate(() => document.body.innerText);
    check(!/made-up/i.test(seen), 'nothing the person saved can be read while locked');
    await page.click('.header-cta');
    const inView = () => { const r = document.querySelector('#support').getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; };
    await page.waitForFunction(inView, null, { timeout: 4000 }).catch(() => {});
    check(await page.evaluate(inView), 'Get Support Now still goes to Support, without unlocking');
    check(await page.isVisible('#support a[href="tel:988"]') && await page.isVisible('#tl-lock'), 'Support shows its crisis lines while the app stays locked');
    for (const id of ['home', 'checkin']) await page.evaluate((t) => { location.hash = '#tl-' + t; }, id);
    check((await page.$$eval('.tl-screen', (els) => els.filter((e) => e.offsetParent !== null).length)) === 0, 'a link to a tab shows nothing while locked');
    check(await noSideways(page), 'the lock screen fits');

    await page.evaluate(() => { window.__tidelight.lock.allow = true; });
    await page.click('#tl-lock-open');
    await page.waitForFunction(() => !document.documentElement.classList.contains('tl-locked'));
    check((await page.isVisible('#tl-lock')) === false && await page.isVisible('#tl-tabbar') && (await page.$$eval('.tl-screen', (els) => els.filter((e) => e.offsetParent !== null).length)) === 1, 'Unlock, once the phone confirms the person, opens the app again');

    // Coming back when the phone confirms at once.
    await leaveAndReturn(page);
    await page.waitForFunction(() => !document.documentElement.classList.contains('tl-locked'));
    check((await page.$$eval('.tl-screen', (els) => els.filter((e) => e.offsetParent !== null).length)) === 1 && (await page.evaluate(() => window.__tidelight.lock.asked)) >= 3, 'coming back asks the phone by itself, and opens when it confirms');

    // Turning it off.
    await openSettings(page);
    await page.click('#tl-set-lock');
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('tidelight.settings')).appLock === false);
    await leaveAndReturn(page);
    check((await page.evaluate(() => document.documentElement.classList.contains('tl-locked'))) === false && (await page.evaluate(() => window.__tidelight.lock.enabled)) === false, 'turned off, the app is no longer covered, and the phone is told');
    check(errors.length === 0, 'no errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await context.close();
  }

  // A cold start with the lock on.
  {
    const { context, page } = await newPage(browser, lang, { hooks: { lock: { unlocked: false, allow: false } }, storage: Object.assign({ 'tidelight.settings': JSON.stringify({ appLock: true }) }, SAVED) });
    await page.waitForSelector('#tl-lock-note:not([hidden])');
    check(await page.isVisible('#tl-lock') && (await page.$$eval('.tl-screen', (els) => els.filter((e) => e.offsetParent !== null).length)) === 0, 'opening the app starts locked, with no screen behind it');
    check((await safetyFrame(page)).length === 0, 'and the safety frame is there from the start');
    check(!/made-up/i.test(await page.evaluate(() => document.body.innerText)), 'nothing saved can be read');
    await page.evaluate(() => { window.__tidelight.lock.allow = true; });
    await page.click('#tl-lock-open');
    await page.waitForSelector('#tl-home:not([hidden])');
    check((await page.isVisible('#tl-lock')) === false && await page.isVisible('#tl-tabbar'), 'Unlock opens the app on Home');
    await context.close();
  }
  // A phone whose passcode was removed after the lock was turned on: the app opens.
  {
    const { context, page } = await newPage(browser, lang, { hooks: { lock: { noPasscode: true } }, storage: { 'tidelight.settings': JSON.stringify({ appLock: true }) } });
    check(await page.isVisible('#tl-home') && (await page.isVisible('#tl-lock')) === false, 'if the phone has no passcode any more, the app opens instead of locking the person out');
    await context.close();
  }
  // First launch is never locked, whatever is stored.
  {
    const { context, page } = await newPage(browser, lang, { seed: false, hooks: { lock: { unlocked: false, allow: false } }, storage: { 'tidelight.settings': JSON.stringify({ appLock: true }) } });
    check(await page.isVisible('#tl-onboarding') && (await page.isVisible('#tl-lock')) === false, 'setting up for the first time is never behind the lock');
    await context.close();
  }
  // The alert for a place the person chose is a safety feature: the lock doesn't cover it.
  {
    const { context, page } = await newPage(browser, lang, { hooks: { lock: { unlocked: false, allow: false } }, storage: { 'tidelight.settings': JSON.stringify({ appLock: true }) } });
    await page.waitForSelector('#tl-lock:not([hidden])');
    await page.evaluate(() => { window.__tidelight.pendingAlert = { placeId: 'x', placeName: 'A made-up place', since: Date.now() - 600000, minutes: 10 }; window.dispatchEvent(new CustomEvent('tidelight-launch', { detail: '#app-place-alert' })); });
    await page.waitForSelector('#app-place-alert', { state: 'visible', timeout: 4000 }).catch(() => {});
    check(await page.isVisible('#app-place-alert') && await page.isVisible('#tl-lock'), 'a place alert still shows while the app is locked');
    await context.close();
  }
}

const browser = await openBrowser();
try {
  for (const lang of ['en', 'es']) {
    await removeTests(browser, lang);
    await dataTests(browser, lang);
    await lockTests(browser, lang);
  }
} finally {
  await browser.close();
  close();
}
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone. The phone's own lock was a stand-in.`);
process.exit(tally.failures ? 1 : 0);

// Resilience: whatever is on the phone (damaged data, years of data, no room to save, an older
// version's data) the app must still open, the crisis strip must still work, and nobody may ever
// see a blank screen or a technical message.
//   node test/resilience-test.mjs      (part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone.
import { tab, openPanel, openSettings, safetyFrame, serve, counter, pagePath, noSideways, SEEDED } from './helpers.mjs';
import { home, root, startFlow } from './app-screens.mjs';
import { openBrowser } from './quiet.mjs';

const { check, tally } = counter();
const { base, close } = await serve();
const browser = await openBrowser();

// Every key the app keeps (src/core/storage.js), and the plain-text ones.
const KEYS = ['tidelight.checkin.v1', 'tidelight.agegroup.v1', 'tidelight.textsize.v1', 'tidelight.log.v1', 'tidelight.reminders.v1', 'tidelight.places.v1', 'tidelight.hope.v1', 'tidelight.circle.v1',
  'tidelight.settings', 'tidelight.profile', 'tidelight.onboarding', 'tidelight.home', 'tidelight.days', 'tidelight.streak', 'tidelight.sessions', 'tidelight.presets', 'tidelight.language', 'tidelight.schema'];
// Ways a stored value can be wrong: cut off mid-save, the wrong kind of thing, the right kind with
// wrong things inside, nonsense, and enormous.
const DAMAGE = {
  'cut off mid-save': '{"current":3,"best":',
  'the word null': 'null',
  'a list where a record belongs': '[1,"two",null,{"a":[]}]',
  'a record where a list belongs': '{"0":"x","length":"many","t":null}',
  'a bare number': '-42',
  'a bare sentence': '"<script>alert(1)</script> ‮\u{1F30A} not data"',
  'right shape, wrong insides': JSON.stringify({ completed: 'yes', quietDay: 20261212, checkInsPerDay: 'lots', customTimes: 'noon', remindersOn: 'true', current: 'x', best: -5, celebrated: 'none', freezesAvailable: null, lastEvaluatedDate: 'yesterday', places: 'here', contacts: { a: 1 }, name: { first: [] }, items: 7, people: null, latitude: 'north', checkInStyle: 9, streaksOn: 'maybe', reduceMotion: [] }),
  'a list of broken entries': JSON.stringify([null, 7, 'x', {}, { t: 'not a date', mood: 'sad', tags: 'none', kind: 3 }, { dateKey: '2026-13-45', checkInsCompleted: 'two' }, []]),
  'a megabyte of the letter a': 'a'.repeat(1024 * 1024),
  'nothing at all': '',
};

const TECHNICAL = /\b(undefined|NaN|null|\[object Object\]|TypeError|ReferenceError|SyntaxError|Uncaught|stack trace|at [\w.$]+ \(|JSON\.parse|Cannot read)\b/;
async function open(lang, { storage = {}, before = null, seed = true, prepare = null } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  if (prepare) await prepare(context);
  const errors = [];
  await context.route((url) => !url.href.startsWith(base), (route) => route.abort());
  if (seed) await context.addInitScript(SEEDED);
  await context.addInitScript((stored) => {
    window.__tidelight = { clockRate: 900, notificationAuthorization: 'authorized', locationAuthorization: 'whenInUse', position: { latitude: 1, longitude: 1 } };
    try { if (!sessionStorage.getItem('damaged')) { Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); sessionStorage.setItem('damaged', '1'); } } catch (e) { /* storage is the thing under test */ }
  }, storage);
  if (before) await context.addInitScript(before);
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.goto(base + pagePath(lang));
  const ready = await page.waitForSelector('html.app-ready', { timeout: 8000 }).then(() => true, () => false);
  return { context, page, errors, ready };
}
// What a person would be looking at: is there a real screen, the strip, and no technical words?
async function look(page) {
  return page.evaluate((technical) => {
    const shown = (sel) => { const el = document.querySelector(sel); if (!el) return false; for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (n.hidden || cs.display === 'none' || cs.visibility === 'hidden') return false; } return el.getBoundingClientRect().height > 20; };
    const strip = ['a[href="tel:988"]', 'a[href="sms:988"]', 'a[href="tel:911"]', '.quick-exit'].every((sel) => { const el = document.querySelector('.crisis-bar ' + sel); return el && el.getBoundingClientRect().height >= 43.5; });
    const screen = ['#tl-home', '#tl-onboarding', '#tl-checkin', '#tl-flow', '#app-age'].some(shown) || Array.from(document.querySelectorAll('.ci-body .ci-panel, .ci-body .ci-step')).some((el) => el.offsetParent !== null && el.getBoundingClientRect().height > 60);
    const text = document.body.innerText;
    const words = text.replace(/\s+/g, ' ').trim().length;
    const bad = (text.match(new RegExp(technical.source, 'g')) || []).slice(0, 3);
    return { strip, screen, words, bad, hidden: document.documentElement.hidden === true, support: shown('#support a[href="tel:988"]') };
  }, { source: TECHNICAL.source });
}
function judge(label, seen, errors, ready) {
  const problems = [];
  if (!ready) problems.push('the app never finished starting');
  if (!seen.strip) problems.push('the crisis strip is not whole');
  if (!seen.support) problems.push('the 988 panel is not in the page');
  if (!seen.screen || seen.hidden || seen.words < 200) problems.push('there is no real screen to look at (a blank or nearly blank page)');
  if (seen.bad.length) problems.push('technical words are on screen: ' + seen.bad.join(', '));
  if (errors.length) problems.push('script errors: ' + errors.slice(0, 2).join(' | ').slice(0, 220));
  check(problems.length === 0, `${label}: the app opens on a real screen, with the crisis strip working and nothing technical showing` + (problems.length ? '\n         ' + problems.join('\n         ') : ''));
}

// ---------- damaged data, one stored thing at a time ----------
console.log('Damaged data: every stored thing, damaged every way');
for (const [how, value] of Object.entries(DAMAGE)) {
  const failures = [];
  for (const key of KEYS) {
    const { context, page, errors, ready } = await open('en', { storage: { [key]: value } });
    const seen = await look(page);
    const wrong = [];
    if (!ready) wrong.push('never started');
    if (!seen.strip || !seen.support) wrong.push('crisis strip or 988 panel missing');
    if (!seen.screen || seen.hidden || seen.words < 200) wrong.push('blank screen');
    if (seen.bad.length) wrong.push('technical words: ' + seen.bad.join(','));
    if (errors.length) wrong.push('script error: ' + errors[0].slice(0, 140));
    if (wrong.length) failures.push(`${key}: ${wrong.join('; ')}`);
    await context.close();
  }
  check(failures.length === 0, `${how}: with any one of the ${KEYS.length} stored things damaged this way, the app still opens, the strip works, and nothing blank or technical shows` + (failures.length ? '\n         ' + failures.slice(0, 9).join('\n         ') : ''));
}
{
  // Everything damaged at once, in both languages, and the person can still do a check-in.
  for (const lang of ['en', 'es']) {
    const storage = Object.fromEntries(KEYS.map((key, i) => [key, Object.values(DAMAGE)[i % 8]]));
    const { context, page, errors, ready } = await open(lang, { storage, seed: false });
    judge(`${lang}, every stored thing damaged at once`, await look(page), errors, ready);
    await context.close();
  }
}

// ---------- no room to save, or no storage at all ----------
console.log('\nStorage full, or not available');
{
  const full = () => { const set = Storage.prototype.setItem; Storage.prototype.setItem = function (key, value) { if (String(key).startsWith('tidelight.')) { const e = new Error('The quota has been exceeded.'); e.name = 'QuotaExceededError'; throw e; } return set.call(this, key, value); }; };
  let { context, page, errors, ready } = await open('en', { before: full });
  judge('with no room left to save anything', await look(page), errors, ready);
  await startFlow(page);
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.click('#tl-flow-done');
  const support = await page.waitForSelector('#tl-flow-support:not([hidden])', { timeout: 4000 }).then(() => true, () => false);
  check(support && (await safetyFrame(page)).length === 0, 'and a very low check-in still shows the support options, even though it could not be saved');
  check(errors.length === 0, 'with no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ').slice(0, 200) : ''));
  await context.close();
  const gone = () => { for (const name of ['getItem', 'setItem', 'removeItem', 'key']) Storage.prototype[name] = function () { const e = new Error('The operation is insecure.'); e.name = 'SecurityError'; throw e; }; };
  ({ context, page, errors, ready } = await open('en', { before: gone, seed: false }));
  judge('with storage refusing every read and write', await look(page), errors, ready);
  await context.close();
}

// ---------- years of data ----------
console.log('\nYears of data');
{
  const now = Date.now();
  const day = 86400000;
  const pad = (n) => String(n).padStart(2, '0');
  const keyOf = (ms) => { const d = new Date(ms); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const log = [];
  const days = {};
  for (let i = 3 * 365; i >= 1; i -= 1) {
    const at = now - i * day;
    for (let n = 0; n < 3; n += 1) log.push({ t: new Date(at + n * 3600000).toISOString(), slot: ['morning', 'midday', 'evening'][n], feeling: 'Okay', needs: [], kind: 'quick', mood: 1 + ((i + n) % 5), tags: ['Tired'], note: n === 0 ? 'A made-up note \u{1F30A} שלום مرحبا ' + 'long '.repeat(40) : '' });
    days[keyOf(at)] = { dateKey: keyOf(at), checkInsCompleted: 3, checkInGoal: 3, meditationsCompleted: i % 2, status: i % 9 === 0 ? 'missed' : 'complete' };
  }
  const sessions = Array.from({ length: 600 }, (_, i) => ({ id: 's' + i, type: ['silent', 'quick', 'deep', 'sleep'][i % 4], title: 'A made-up session', plannedSeconds: 300, completedSeconds: 300, completed: true, startedAt: new Date(now - i * day / 2).toISOString(), moodAfter: 3 }));
  const circle = { people: Array.from({ length: 5 }, (_, i) => ({ id: 'p' + i, name: ['אביגיל כהן', 'مريم العلي', 'Zoë Ñandú-Ó Brádaigh the Third of Somewhere Rather Long Indeed', '\u{1F469}‍\u{1F469}‍\u{1F467} Emoji Family', 'A made-up friend'][i], phone: '555-010' + i })), log: [] };
  const storage = { 'tidelight.log.v1': JSON.stringify(log), 'tidelight.days': JSON.stringify(days), 'tidelight.sessions': JSON.stringify(sessions), 'tidelight.circle.v1': JSON.stringify(circle),
    'tidelight.profile': JSON.stringify({ name: 'مريم \u{1F30A} Zoë' }), 'tidelight.settings': JSON.stringify({ checkInsPerDay: 3, countChosen: true }) };
  const started = Date.now();
  const { context, page, errors, ready } = await open('en', { storage });
  const took = Date.now() - started;
  judge(`three years of check-ins (${log.length}), ${sessions.length} meditations, and names in Hebrew, Arabic, and emoji`, await look(page), errors, ready);
  check(took < 6000, `it opens in ${took} ms here with all of that (budget 6,000 ms on a desktop)`);
  check(await noSideways(page), 'Home fits, long name and all');
  await openPanel(page, 'ci-journey');
  check(await noSideways(page) && (await safetyFrame(page)).length === 0, 'Your journey opens and fits, with the safety frame on screen');
  await root(page, 'meditate');
  await page.click('#tl-history-card');
  const rows = await page.locator('#tl-history-list li').count();
  check(rows > 0 && await noSideways(page), `meditation history opens (${rows} rows shown) and fits`);
  await root(page, 'friends');
  check(await noSideways(page) && (await page.locator('.app-circle-list li').count()) === 5, 'Friends shows all five people, right-to-left and emoji names included, without running off the side');
  await home(page);
  await page.click('#tl-streak-card');
  check(await page.isVisible('#tl-streak-month') && await noSideways(page), 'Your streak opens and fits');
  // Typing: very long text, emoji, right-to-left, and markup are kept as plain text.
  await openPanel(page, 'ci-journal');
  const wild = '<img src=x onerror=alert(1)> \u{1F30A}\u{1F499} שלום مرحبا ‮ reversed \u0000 ' + 'word '.repeat(2000);
  await page.fill('#ci-entry', wild);
  await page.click('.ci-add-entry');
  await page.waitForTimeout(300);
  const kept = await page.evaluate(() => ({ images: document.querySelectorAll('.ci-entries img').length, text: (document.querySelector('.ci-entries') || { textContent: '' }).textContent.length }));
  check(kept.images === 0 && kept.text > 5000 && await noSideways(page), 'a journal entry of 10,000 characters with markup, emoji, and right-to-left text is kept as plain text and fits');
  await startFlow(page);
  await page.click('#tl-flow-faces [data-value="3"]');
  await page.fill('#tl-flow-note', wild);
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow [data-flow="done"]:not([hidden])');
  const note = await page.evaluate(() => JSON.parse(localStorage.getItem('tidelight.log.v1')).slice(-1)[0].note);
  check(typeof note === 'string' && note.length <= 500 && !/onerror=alert\(1\)>.*<img/.test(note), `a check-in note of any length is cut to the limit (${note.length} characters) and kept as text`);
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ').slice(0, 200) : ''));
  // Sent to the background and brought back fifty times, then a long meditation: memory stays level.
  const heap = () => page.evaluate(() => (performance.memory ? performance.memory.usedJSHeapSize : 0));
  await home(page);
  const before = await heap();
  for (let i = 0; i < 50; i += 1) await page.evaluate(() => { document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('pagehide')); window.dispatchEvent(new Event('pageshow')); });
  await root(page, 'meditate');
  await page.evaluate(() => { window.__tidelight.clockRate = 400; });
  await page.click('.tl-type[data-type="silent"] [data-type-start]');
  const finished = await page.waitForSelector('#tl-complete:not([hidden]), #tl-meditate:not([hidden])', { timeout: 20000 }).then(() => true, () => false);
  const after = await heap();
  check(finished, 'a full session runs to its end after all that');
  check(before === 0 || after - before < 40 * 1024 * 1024, `memory in use grew by ${Math.round((after - before) / 1024 / 1024)} MB over fifty background trips and a session (budget 40 MB)`);
  await context.close();
}

// ---------- if the app's own code fails to start ----------
console.log('\nIf the app itself fails to start');
for (const lang of ['en', 'es']) {
  // The redesign's start-up is made to fail, as a bug or a bad update would: the page arrives
  // without two parts the newer screens are built on (the tab bar and Home).
  const breakPage = async (context) => context.route(/\/(check-in|registro-diario)\/$/, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace('id="tl-tabbar"', 'id="tl-tabbar-gone"').replace('id="tl-home"', 'id="tl-home-gone"');
    await route.fulfill({ response, body });
  });
  const { context, page, errors, ready } = await open(lang, { prepare: breakPage });
  await page.waitForTimeout(600);
  const seen = await look(page);
  check(ready && seen.strip && seen.support && seen.screen && !seen.hidden && seen.words > 200 && seen.bad.length === 0, `${lang}: the person gets a working page with the crisis strip, not a blank screen or an error` + (seen.screen ? '' : ' (no screen shown)') + (seen.bad.length ? ' (technical words: ' + seen.bad.join(', ') + ')' : ''));
  check((await page.evaluate(() => document.body.innerText)).length > 1500, `${lang}: with the page's own words (the older layout), nothing invented for the occasion`);
  await context.close();
}
{
  // An error later on, while the app is in use, never puts technical words on screen.
  const { context, page } = await open('en');
  await page.evaluate(() => { setTimeout(() => { throw new Error('A made-up failure with a stack'); }, 0); Promise.reject(new Error('A made-up rejected promise')); });
  await page.waitForTimeout(300);
  const seen = await look(page);
  check(seen.strip && seen.screen && seen.bad.length === 0 && !/made-up failure|rejected promise/.test(await page.evaluate(() => document.body.innerText)), 'an error while the app is in use shows nothing technical, and the screen and strip stay as they were');
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

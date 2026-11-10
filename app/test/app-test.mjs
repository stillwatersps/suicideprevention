// Tests the app's Daily check-in in desktop Chromium, after `node tools/build.mjs`.
// Native saving and sharing can't run here: the app's browser fallbacks (localStorage and a
// stubbed share sheet) stand in for them. This is not a phone test.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const www = fileURLToPath(new URL('../www/', import.meta.url));
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json', '.vcf': 'text/vcard' };

const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  try {
    const file = join(www, normalize(path));
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}/`;

let failures = 0;
let passes = 0;
function check(ok, what) {
  if (ok) { passes++; console.log('  ok   ' + what); } else { failures++; console.log('  FAIL ' + what); }
}

function birthDateYearsAgo(years) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function run(browser, lang) {
  const page_ = lang === 'es' ? 'es/registro-diario/' : 'check-in/';
  console.log(`\n${lang === 'es' ? 'Spanish' : 'English'}: ${page_}`);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const errors = [];
  const outside = [];
  context.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:')) outside.push(r.url()); });
  await context.addInitScript(() => {
    window.__shared = [];
    Object.defineProperty(navigator, 'share', { value: async (data) => { window.__shared.push(data.text); }, configurable: true });
    // Stand-ins for the phone (Places that are hard for me): a map picker, a contact picker, and
    // records of what the phone would be told. Nothing is watched or sent.
    window.__tidelight = {
      configs: [], composed: [], acknowledged: [],
      pickPlace: async (options) => ({ name: options.name ? options.name + ' (changed)' : 'The old footbridge', latitude: 40.7, longitude: -74.0, radius: options.radius || 200 }),
      pickContact: async () => ({ name: 'A made-up friend', phone: '555-0100' }),
      onSetPlaces: (config) => window.__tidelight.configs.push(config),
      onCompose: (options) => window.__tidelight.composed.push(options),
      onAcknowledge: (id) => window.__tidelight.acknowledged.push(id),
    };
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + page_);
  await page.waitForSelector('html.app-ready');

  // Age setup comes first, with crisis help on screen.
  check(await page.isVisible('#app-age'), 'asks for a date of birth on first open');
  check(!(await page.isVisible('.ci-tabs')), 'hides the check-in until the age is given');
  check(await page.isVisible('.crisis-bar a[href="tel:988"]'), 'crisis strip stays on screen during age setup');
  check(await page.isVisible('#app-age a[href="tel:988"]') && await page.isVisible('#app-age a[href="tel:911"]'), 'age question shows 988 and 911');
  check(await page.isVisible('.app-age-accuracy'), 'says plainly that an accurate date of birth matters');

  await page.click('.app-age-save');
  check(await page.isVisible('.app-age-problem'), 'an empty date is refused');
  const tomorrow = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  await page.fill('#app-birth-date', tomorrow);
  await page.click('.app-age-save');
  check(await page.isVisible('#app-age'), 'a date in the future is refused');

  // A valid date asks the person to check the group first, and keeps nothing until they say yes.
  await page.fill('#app-birth-date', birthDateYearsAgo(40));
  await page.click('.app-age-save');
  check(await page.isVisible('.app-age-confirm'), 'a valid date shows the age group to check');
  check(await page.isVisible('.app-age-confirm .app-accommodations [data-age-group="adult"]'), 'lists what the app does for that age before saving');
  let stored = await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)));
  check(!stored.includes('"adult"'), 'keeps nothing until the group is confirmed');
  await page.click('.app-age-redo');
  check(await page.isVisible('#app-birth-date'), '"No, change the date" asks again');

  const birth = birthDateYearsAgo(15);
  await page.fill('#app-birth-date', birth);
  await page.click('.app-age-save');
  check((await page.textContent('.app-age-confirm .app-group-name')).match(/13/) !== null, 'shows the right group to check (13 to 17)');
  check(await page.isVisible('.app-age-confirm .app-accommodations [data-age-group="teen"]')
    && !(await page.isVisible('.app-age-confirm .app-accommodations [data-age-group="adult"]')), 'lists only that group\'s accommodations');
  await page.click('.app-age-yes');
  check(!(await page.isVisible('#app-age')), 'confirming closes the age question');
  check(await page.isVisible('.ci-tabs'), 'the check-in appears');

  // What the app does for this age shows on the page.
  check(await page.isVisible('.app-age-box [data-age-group="teen"]'), 'Today starts with the box for ages 13 to 17');
  check(await page.isVisible('.app-age-box [data-age-group="teen"] a[href*="#other-ways"]'), 'the teen box links to LGBTQ+ support on Get Help');
  check(!(await page.isVisible('.app-age-box [data-age-group="child"]')), 'other ages\' boxes stay hidden');
  check(await page.isVisible('.app-rem-hint a[href="#app-reminders"]'), 'Today points to the check-in reminders');
  check(!(await page.evaluate(() => document.documentElement.classList.contains('app-large-text'))), 'regular text for ages 13 to 17');

  stored = await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)));
  check(stored.includes('"teen"'), 'keeps the age group (15 years old is 13 to 17)');
  check(!stored.includes(birth) && !stored.includes(birth.slice(0, 4)), 'never keeps the birth date');

  // Check in, and see the age group's ideas.
  await page.click('[data-ci-start]');
  await page.click('#ci-step-feeling label:has(input[value="hopeful"])');
  await page.click('#ci-step-feeling .ci-next');
  for (const id of ['mind', 'difficult', 'self']) await page.click(`#ci-step-${id} .ci-skip`);
  await page.click('.ci-finish');
  check(await page.isVisible('.app-foryou [data-age-group="teen"]'), 'shows ideas for ages 13 to 17');
  const others = await page.$$eval('.app-foryou [data-age-group]', (els) => els.filter((e) => e.offsetParent !== null).length);
  check(others === 1, 'shows only one age group\'s ideas');

  // Share how I'm feeling.
  await page.click('[data-share="result"]');
  check(await page.isVisible('#app-share-panel'), 'Share opens the notice before sharing');
  check(await page.isVisible('#app-share-panel a[href="tel:988"]'), 'the share notice shows 988');
  const preview = await page.inputValue('#app-share-text');
  check(preview.length > 0 && !preview.includes('undefined'), 'the share text can be read and changed first');
  await page.click('.app-share-cancel');
  check(!(await page.isVisible('#app-share-panel')), 'Cancel closes it without sharing');
  check((await page.evaluate(() => window.__shared.length)) === 0, 'nothing is shared on Cancel');

  // Write a journal entry, then share it with the opening line.
  await page.click('.ci-tabs a[href="#ci-journal"]');
  await page.fill('#ci-entry', 'A made-up entry for the test.');
  await page.click('.ci-add-entry');
  await page.click('.ci-entry .app-share');
  await page.check('#app-share-intro');
  await page.click('.app-share-go');
  const shared = await page.evaluate(() => window.__shared);
  check(shared.length === 1 && shared[0].includes('A made-up entry for the test.'), 'shares the entry through the share sheet');
  check(/^(I wanted|Quería)/.test(shared[0] || ''), 'adds the opening line when chosen');

  // Today's check-ins: one line per check-in, filed by the time of day, shared only on purpose.
  await page.click('.ci-tabs a[href="#ci-today"]');
  const feelingLabel = (await page.textContent('.ci-fill-feeling')).trim();
  await page.click('.ci-tabs a[href="#ci-journey"]');
  const logText = await page.textContent('.app-log');
  check(/(Morning|Midday|After school|Before bed|Mañana|Mediodía|Después de la escuela|Antes de dormir), /.test(logText), 'Your journey lists today\'s check-in with its time of day');
  check(feelingLabel.length > 0 && logText.includes(feelingLabel), 'the line shows the feeling that was chosen');
  check(!(await page.isVisible('.app-log-empty')), 'the "no check-ins" line hides once there is one');
  await page.click('.app-share-days[data-days="1"]');
  check(await page.isVisible('#app-share-panel'), 'Share today\'s check-ins opens the notice first');
  const daySummary = await page.inputValue('#app-share-text');
  check(daySummary.includes('Tidelight') && daySummary.includes(feelingLabel), 'the summary names Tidelight and today\'s feeling');
  check(!daySummary.includes('A made-up entry'), 'the summary leaves journal entries out');
  await page.click('.app-share-cancel');
  await page.click('.app-share-days[data-days="7"]');
  const weekSummary = await page.inputValue('#app-share-text');
  check(weekSummary.includes(feelingLabel) && weekSummary.split('\n').length > daySummary.split('\n').length - 2, 'the 7-day summary groups check-ins by day');
  await page.click('.app-share-cancel');
  check((await page.evaluate(() => window.__shared.length)) === 1, 'nothing more is shared on Cancel');

  // Reminders: all off until turned on, kept on the phone, never sent anywhere.
  check(await page.isVisible('#app-reminders'), 'Your journey has the check-in reminders');
  const onCount = await page.$$eval('.app-rem-on', (els) => els.filter((e) => e.checked).length);
  check(onCount === 0, 'every reminder is off to start with');
  check(!(await page.isVisible('.app-rem-web')), 'no browser note while every reminder is off');
  await page.check('.app-rem-on[data-slot="morning"]');
  await page.fill('.app-rem-time[data-slot="morning"]', '07:45');
  await page.waitForTimeout(300);
  stored = await page.evaluate(() => localStorage.getItem('tidelight.reminders.v1') || '');
  check(stored.includes('"morning":{"on":true,"time":"07:45"}'), 'the morning reminder and its time are kept');
  check(stored.includes('"evening":{"on":false'), 'the other reminders stay off');
  check(await page.isVisible('.app-rem-web'), 'in a browser it says reminders need the app on a phone');

  // Places that are hard for me: off, no places suggested, and nothing watched until turned on.
  check(await page.isVisible('.app-places'), 'Your journey has Places that are hard for me');
  check(!(await page.isChecked('.app-places-on')), 'it starts off');
  check(!(await page.isVisible('.app-places-setup')), 'the setup is hidden while it is off');
  check((await page.$$('.app-places-list li')).length === 0, 'no place is suggested');
  await page.check('.app-places-on');
  await page.waitForTimeout(300);
  check(await page.isVisible('.app-places-setup'), 'turning it on shows the setup');
  check(await page.isVisible('.app-places a[href="tel:988"]') && await page.isVisible('.app-places a[href="tel:911"]'), 'the setup shows 988 and 911');
  check(await page.isVisible('.app-places-empty') && await page.isVisible('.app-people-empty'), 'starts with no places and no people');
  await page.click('.app-place-add');
  await page.waitForTimeout(300);
  check((await page.textContent('.app-places-list')).includes('The old footbridge'), 'a place chosen on the map is listed with its name');
  check(/200/.test(await page.textContent('.app-places-list')), 'and its radius');
  await page.click('.app-place-edit');
  await page.waitForTimeout(300);
  check((await page.textContent('.app-places-list')).includes('(changed)'), 'a place can be edited');
  await page.click('.app-person-add');
  await page.waitForTimeout(300);
  check((await page.textContent('.app-people-list')).includes('A made-up friend'), 'a person from the contacts is listed');
  await page.selectOption('.app-dwell', '10');
  await page.waitForTimeout(300);
  let told = await page.evaluate(() => window.__tidelight.configs.slice(-1)[0]);
  check(told.enabled === true && told.dwellMinutes === 10 && told.places.length === 1 && told.contacts.length === 1, 'the phone is told the places, the person, and the wait time');
  check(told.words && told.words.body && told.words.okay && told.words.call988 && told.words.call911, 'the phone gets the notification\'s words from the page');
  check(told.showPlaceOnLockScreen === false, 'the lock screen stays neutral unless chosen');
  check(!(await page.isVisible('.app-dwell-test')), 'the 1-minute test choice is hidden outside test builds');
  stored = await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)));
  check(stored.includes('The old footbridge') && stored.includes('555-0100'), 'places and people are kept on this phone');

  // The alert screen: pretend the phone says the person has stayed at the place.
  await page.evaluate(() => { window.__tidelight.pendingAlert = { placeId: 'x', placeName: 'The old footbridge (changed)', since: Date.now() - 600000, minutes: 10 }; });
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('tidelight-launch', { detail: '#app-place-alert' })));
  await page.waitForTimeout(300);
  check(await page.isVisible('#app-place-alert'), 'the alert screen opens');
  check((await page.textContent('#app-alert-title')).includes('The old footbridge (changed)') && (await page.textContent('#app-alert-title')).includes('10'), 'it names the place and the minutes');
  check((await page.textContent('.app-alert-names')).includes('A made-up friend'), 'it names the person it would go to');
  check(await page.isVisible('#app-place-alert a[href="tel:988"]') && await page.isVisible('#app-place-alert a[href="tel:911"]'), '988 and 911 are on the alert screen');
  check(await page.isVisible('.app-alert-countdown'), 'a countdown runs');
  await page.click('.app-alert-okay');
  await page.waitForTimeout(300);
  check(await page.isVisible('.app-alert-okay-done'), '"I\'m okay" stops it');
  check((await page.evaluate(() => window.__tidelight.composed.length)) === 0, 'nothing is composed or sent after "I\'m okay"');
  check((await page.evaluate(() => window.__tidelight.acknowledged)).includes('x'), 'the phone is told not to ask again during this visit');
  await page.click('.app-alert-close');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('tidelight-launch', { detail: '#app-place-alert-send' })));
  await page.waitForTimeout(300);
  const composed = await page.evaluate(() => window.__tidelight.composed);
  check(composed.length === 1 && composed[0].message.length > 0 && composed[0].placeId === 'x', '"Send my message" from the notification hands the message to the phone\'s composer, never sends it itself');
  check(await page.isVisible('.app-alert-fallback') || await page.isVisible('.app-alert-cancelled'), 'says what happened');
  await page.click('.app-alert-close');
  await page.evaluate(() => { delete window.__tidelight.pendingAlert; });
  await page.uncheck('.app-places-on');
  await page.waitForTimeout(300);
  told = await page.evaluate(() => window.__tidelight.configs.slice(-1)[0]);
  check(told.enabled === false, 'turning it off tells the phone to stop watching');
  await page.check('.app-places-on');
  await page.waitForTimeout(300);

  // Close the app and open it again: everything is still there, and no age question.
  await page.waitForTimeout(400);
  await page.reload();
  await page.waitForSelector('html.app-ready');
  check(!(await page.isVisible('#app-age')), 'does not ask the age again');
  await page.click('.ci-tabs a[href="#ci-journal"]');
  check((await page.textContent('.ci-entries')).includes('A made-up entry for the test.'), 'the journal entry is still there after reopening');
  const entryDate = (await page.textContent('.ci-entry .ci-entry-date')).trim();
  check(entryDate.length > 0 && !/\d{4}-\d{2}-\d{2}T/.test(entryDate), 'the entry\'s date still reads as a date after reopening');
  await page.click('.ci-tabs a[href="#ci-journey"]');
  check(await page.isVisible('.app-settings .app-group-name'), 'Your journey shows the age group');
  check((await page.$$('.ci-cal-day.is-marked')).length === 1, 'the calendar still marks today after reopening');
  check((await page.textContent('.app-log')).includes(feelingLabel), 'today\'s check-in is still listed after reopening');
  check(await page.isChecked('.app-rem-on[data-slot="morning"]') && (await page.inputValue('.app-rem-time[data-slot="morning"]')) === '07:45', 'the reminder is still set after reopening');
  check(await page.isChecked('.app-places-on') && (await page.textContent('.app-places-list')).includes('The old footbridge'), 'the places are still there after reopening');

  // Delete everything removes it from the phone, and keeps the age group.
  await page.click('.ci-erase-start');
  await page.click('.ci-erase-yes');
  await page.waitForTimeout(400);
  await page.reload();
  await page.waitForSelector('html.app-ready');
  await page.click('.ci-tabs a[href="#ci-journal"]');
  check(!(await page.textContent('.ci-entries')).includes('A made-up entry'), 'Delete everything removes saved entries');
  stored = await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)));
  check(stored.includes('"teen"') && !stored.includes('made-up'), 'the age group stays, the writing is gone');

  // Changing the birth date changes the group.
  await page.click('.ci-tabs a[href="#ci-journey"]');
  check((await page.textContent('.app-log')).trim() === '' && await page.isVisible('.app-log-empty'), 'Delete everything clears today\'s check-ins');
  check(await page.isChecked('.app-rem-on[data-slot="morning"]'), 'the reminders stay after Delete everything');
  check(!stored.includes('footbridge') && !stored.includes('555-0100') && !(await page.isChecked('.app-places-on')), 'Delete everything removes the places and people and turns the feature off');
  await page.click('.app-age-change');
  await page.fill('#app-birth-date', birthDateYearsAgo(70));
  await page.click('.app-age-save');
  await page.click('.app-age-yes');
  stored = await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)));
  check(stored.includes('"older"'), 'a new date of birth changes the group to 65 and over');
  check(await page.evaluate(() => document.documentElement.classList.contains('app-large-text')), 'text is larger for 65 and over');
  await page.click('.ci-tabs a[href="#ci-today"]');
  check(await page.isVisible('.app-age-box [data-age-group="older"]') && !(await page.isVisible('.app-age-box [data-age-group="teen"]')), 'Today\'s box changes with the group');
  await page.click('.ci-tabs a[href="#ci-journey"]');
  check(await page.isVisible('.app-settings .app-accommodations [data-age-group="older"]'), 'Your journey lists what the app does for 65 and over');
  await page.click('.app-text-toggle');
  check(!(await page.evaluate(() => document.documentElement.classList.contains('app-large-text'))), 'larger text can be switched off');
  await page.waitForTimeout(300);
  await page.reload();
  await page.waitForSelector('html.app-ready');
  check(!(await page.evaluate(() => document.documentElement.classList.contains('app-large-text'))), 'the text size choice is remembered');
  const sideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(!sideways, 'the page doesn\'t scroll sideways');

  // A child's group shows the box for the grown-up with them.
  await page.click('.ci-tabs a[href="#ci-journey"]');
  await page.click('.app-age-change');
  await page.fill('#app-birth-date', birthDateYearsAgo(9));
  await page.click('.app-age-save');
  await page.click('.app-age-yes');
  await page.click('.ci-tabs a[href="#ci-today"]');
  check(await page.isVisible('.app-age-box [data-age-group="child"]'), 'under 13: Today starts with a box for the grown-up with them');
  await page.evaluate(() => document.documentElement.classList.add('app-large-text'));
  const sidewaysLarge = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(!sidewaysLarge, 'larger text doesn\'t make the page scroll sideways');

  // The About page describes the app, not the website.
  await page.goto(base + (lang === 'es' ? 'es/acerca-de/' : 'about/'));
  check((await page.textContent('main')).match(/saved on this phone only|se guarda solo en este teléfono/) !== null, 'About says what the app keeps');

  check(outside.length === 0, 'no requests to other sites' + (outside.length ? ': ' + outside.join(', ') : ''));
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await context.close();
}

const browser = await chromium.launch();
try {
  await run(browser, 'en');
  await run(browser, 'es');
} finally {
  await browser.close();
  server.close();
}
console.log(`\n${passes} passed, ${failures} failed. Desktop Chromium only, with the app's browser fallbacks; not a phone.`);
process.exit(failures ? 1 : 0);

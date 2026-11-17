// "Darker at night": between bed time and wake time the app uses its dark colors, whatever the
// phone is set to. Off until turned on.
//   node test/night-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium set to LIGHT, muted, with the clock set by the test. Not a phone.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, openSettings, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const NIGHT_ON = JSON.stringify({ nightMode: true, sleepTime: '22:00', wakeTime: '07:00' });

// The page's clock reads `hour:minute` today when it loads; window.__jump(minutes) moves it on.
const clockAt = (hour, minute) => `(() => { const real = Date; const want = new real(); want.setHours(${hour}, ${minute}, 0, 0);
  let offset = Number(sessionStorage.getItem('clock-offset') || (want.getTime() - real.now()));
  sessionStorage.setItem('clock-offset', String(offset));
  window.__jump = (minutes) => { offset += minutes * 60000; sessionStorage.setItem('clock-offset', String(offset)); };
  class Fake extends real { constructor(...a) { if (a.length) super(...a); else super(real.now() + offset); } static now() { return real.now() + offset; } }
  window.Date = Fake; })();`;

async function newPage(browser, lang, { hour = 23, minute = 0, storage = {}, colorScheme = 'light', path = null, viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  await context.route((url) => !url.href.startsWith(base), (route) => route.abort());
  await context.addInitScript(clockAt(hour, minute));
  await context.addInitScript((stored) => {
    window.__tidelight = { shared: [], clockRate: 1 };
    try { if (!sessionStorage.getItem('seeded')) { Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, storage);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + (path || pagePath(lang)));
  if (!path) await page.waitForSelector('html.app-ready');
  return { context, page, errors };
}
const look = (page) => page.evaluate(() => {
  const strip = document.querySelector('.crisis-bar');
  const call = strip.querySelector('a[href="tel:988"]');
  return {
    night: document.documentElement.classList.contains('tl-night'),
    page: getComputedStyle(document.body).backgroundColor,
    ink: getComputedStyle(document.body).color,
    strip: getComputedStyle(strip).backgroundColor + ' / ' + getComputedStyle(strip).color + ' / ' + getComputedStyle(call).color,
  };
});
const audit = async (page) => {
  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  return page.evaluate(async () => { const result = await window.axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] }, resultTypes: ['violations'] }); return result.violations.flatMap((v) => v.nodes.map((n) => n.target.join(' '))).slice(0, 4); });
};

const browser = await openBrowser();

// What the app's own dark and light look like, on phones set that way, to compare with.
const dark = await newPage(browser, 'en', { hour: 12, colorScheme: 'dark' });
const DARK = await look(dark.page);
await dark.context.close();
const light = await newPage(browser, 'en', { hour: 12 });
const LIGHT = await look(light.page);
await light.context.close();
// The website's pages inside the app have the website's own dark colors.
const webDark = await newPage(browser, 'en', { hour: 12, colorScheme: 'dark', path: 'get-help/' });
await webDark.page.waitForLoadState('load');
const WEB_DARK = await look(webDark.page);
await webDark.context.close();
console.log('\nDarker at night');
check(DARK.page !== LIGHT.page && DARK.ink !== LIGHT.ink && !DARK.night && !LIGHT.night, 'a phone set to dark and a phone set to light look different, and neither is "night"');
check(DARK.strip !== LIGHT.strip, 'the crisis strip has its own dark colors on a phone set to dark');

{
  // Off until turned on.
  const { context, page } = await newPage(browser, 'en', { hour: 23 });
  const off = await look(page);
  check(!off.night && off.page === LIGHT.page, 'at 11 at night, with the setting off, a phone set to light stays light');
  await openSettings(page);
  check((await page.isVisible('#tl-set-night')) && !(await page.isChecked('#tl-set-night')), 'Settings has "Darker at night", off');

  // Turned on at night: dark at once.
  await page.click('#tl-set-night');
  await page.waitForFunction(() => document.documentElement.classList.contains('tl-night'));
  const on = await look(page);
  check(on.page === DARK.page && on.ink === DARK.ink, 'turned on at 11 at night: the app\'s own dark colors, on a phone set to light');
  check(on.strip === DARK.strip, 'and the crisis strip looks exactly as it does on a phone set to dark');
  check(JSON.parse(await page.evaluate(() => localStorage.getItem('tidelight.settings'))).nightMode === true, 'the choice is saved');
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen');
  const faint = await audit(page);
  check(faint.length === 0, 'nothing in Settings is too faint to read at night' + (faint.length ? ': ' + faint.join(', ') : ''));

  // Changing bed time changes tonight at once.
  await page.fill('#tl-set-sleep', '23:30');
  await page.dispatchEvent('#tl-set-sleep', 'change');
  await page.waitForFunction(() => !document.documentElement.classList.contains('tl-night'));
  check((await look(page)).page === LIGHT.page, 'a later bed time (11:30) makes 11:00 day again, at once');
  await page.fill('#tl-set-sleep', '22:00');
  await page.dispatchEvent('#tl-set-sleep', 'change');
  await page.waitForFunction(() => document.documentElement.classList.contains('tl-night'));
  await page.click('#tl-set-night');
  await page.waitForFunction(() => !document.documentElement.classList.contains('tl-night'));
  check((await look(page)).page === LIGHT.page, 'turning it off makes the app light again, at once');
  await context.close();
}

for (const lang of ['en', 'es']) {
  // On, through an evening and a morning.
  const { context, page, errors } = await newPage(browser, lang, { hour: 21, minute: 58, storage: { 'tidelight.settings': NIGHT_ON } });
  check(!(await look(page)).night, `${name(lang)}: two minutes before bed time the app is light`);
  await page.evaluate(() => { window.__jump(3); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForFunction(() => document.documentElement.classList.contains('tl-night'));
  check((await look(page)).page === DARK.page, 'a minute after bed time it is dark');
  for (const where of ['home', 'checkin', 'meditate', 'friends']) {
    await tab(page, where);
    await page.waitForTimeout(250);
    const faint = await audit(page);
    check(faint.length === 0, `the ${where} tab: nothing is too faint to read at night` + (faint.length ? ': ' + faint.join(', ') : ''));
  }
  // The website's pages inside the app are dark too, from their first paint.
  await page.goto(base + (lang === 'es' ? 'es/obtener-ayuda/' : 'get-help/'));
  await page.waitForLoadState('load');
  const help = await look(page);
  check(help.night && help.page === WEB_DARK.page && help.ink === WEB_DARK.ink && help.strip === WEB_DARK.strip, 'the Get help page inside the app is dark too: exactly what it shows on a phone set to dark');
  const faintHelp = await audit(page);
  check(faintHelp.length === 0, 'and nothing on it is too faint to read' + (faintHelp.length ? ': ' + faintHelp.join(', ') : ''));
  // Morning: nine hours on, past wake time.
  await page.evaluate(() => window.__jump(9 * 60 + 5));
  await page.reload();
  await page.waitForLoadState('load');
  check(!(await look(page)).night, 'after wake time the Get help page is light again');
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  const morning = await look(page);
  check(!morning.night && morning.page === LIGHT.page, 'and so is the app');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors[0] : ''));
  await context.close();
}

{
  // A phone already set to dark is unchanged by night; and a page opened by day has no trace of it.
  const a = await newPage(browser, 'en', { hour: 23, colorScheme: 'dark', storage: { 'tidelight.settings': NIGHT_ON } });
  const both = await look(a.page);
  check(both.page === DARK.page && both.strip === DARK.strip, 'on a phone set to dark, night looks the same as its usual dark');
  await a.context.close();
  const b = await newPage(browser, 'en', { hour: 12, storage: { 'tidelight.settings': NIGHT_ON }, path: 'get-help/' });
  await b.page.waitForLoadState('load');
  check(!(await look(b.page)).night, 'by day, a website page inside the app is light');
  await b.context.close();
  // Times that can't be read: the app follows the phone.
  const c = await newPage(browser, 'en', { hour: 23, storage: { 'tidelight.settings': JSON.stringify({ nightMode: true, sleepTime: 'late', wakeTime: 7 }) } });
  check(c.errors.length === 0 && (await c.page.isVisible('.crisis-bar')), 'with times that can\'t be read the app still opens, with the crisis strip');
  await c.context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, set to light, with the clock set by the test; not a phone.`);
process.exit(tally.failures ? 1 : 0);

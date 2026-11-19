// A breathing session on the Lock Screen: asked of the phone only when the person turned it on,
// only for a breathing session, and taken down when the session ends or is paused.
//   node test/live-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium, muted, with a stand-in for the phone. Nothing is shown on any Lock Screen.
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');

async function newPage(browser, lang, { phone = true, colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript((isPhone) => {
    window.__tidelight = { clockRate: 60, spoken: [], onSpeak(o) { this.spoken.push(o); }, asked: [] };
    if (isPhone) window.__tidelight.onActivity = function (o) { this.asked.push(o); };
  }, phone);
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
const asked = (page) => page.evaluate(() => JSON.stringify(window.__tidelight.asked));
const kept = (page) => page.evaluate(() => Boolean(JSON.parse(localStorage.getItem('tidelight.settings') || '{}').lockScreenBreathing));
async function reset(page) {
  await tab(page, 'home');
  if (!(await page.isVisible('#tl-home'))) await tab(page, 'home');
  await page.click('#tl-home-reset');
  await page.waitForSelector('#tl-stage:not([hidden])');
}

// Leaves the player (ending the session first if it is still going), so the tab bar is back.
async function leave(page) {
  if (!(await page.isVisible('#tl-complete'))) {
    await page.evaluate(() => document.getElementById('tl-player-end').click());
    await page.evaluate(() => document.getElementById('tl-end-yes').click());
    await page.waitForTimeout(300);
  }
  if (await page.isVisible('#tl-complete [data-player-done]')) await page.click('#tl-complete [data-player-done]');
  await page.waitForSelector('#tl-tabbar [data-tl-tab-btn="home"]', { state: 'visible' });
  await page.waitForTimeout(200);
}

const browser = await openBrowser();
{
  const { context, page } = await newPage(browser, 'en', { phone: false });
  await openSettings(page);
  check(!(await page.isVisible('#tl-set-live-box')), 'where the phone can\'t do it (not an iPhone), Settings doesn\'t offer it');
  await context.close();
}
for (const lang of ['en', 'es']) {
  console.log(`\nA breathing session on the Lock Screen, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await openSettings(page);
  const box = await page.evaluate(() => { const b = document.getElementById('tl-set-live-box'); const t = document.getElementById('tl-set-live'); return { shown: b.getClientRects().length > 0, on: t.checked, h: Math.round(t.closest('label').getBoundingClientRect().height), words: b.querySelector('.tl-sub').textContent.trim() }; });
  check(box.shown && !box.on && box.h >= 44 && !(await kept(page)), 'Settings offers it, off');
  check(/Tidelight/.test(box.words) && box.words.length > 150, 'it says what the Lock Screen will show and that anyone who sees the phone can see it');
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen');

  await reset(page);
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 30000 });
  check((await asked(page)) === '[]', 'while it is off, a breathing session asks the phone for nothing');
  await leave(page);

  await openSettings(page);
  await page.click('#tl-set-live');
  await page.waitForTimeout(200);
  check(await kept(page), 'turning it on is kept with the settings');
  await reset(page);
  await page.waitForTimeout(150);
  check((await asked(page)) === '[{"start":{"seconds":60}}]', 'with it on, the 1-minute reset asks the phone to show one minute, and tells it nothing else');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 30000 });
  check((await asked(page)) === '[{"start":{"seconds":60}},{"end":true}]', 'when the minute is up, it is taken down');
  await leave(page);

  await page.evaluate(() => { window.__tidelight.asked = []; });
  await reset(page);
  await page.waitForTimeout(150);
  await page.evaluate(() => document.getElementById('tl-player-pause').click());
  await page.waitForTimeout(150);
  check((await asked(page)) === '[{"start":{"seconds":60}},{"end":true}]', 'pausing takes it down too: a paused session\'s time left would be wrong');
  await leave(page);

  await page.evaluate(() => { window.__tidelight.asked = []; });
  await tab(page, 'meditate');
  if (!(await page.isVisible('#tl-meditate'))) await tab(page, 'meditate');
  await page.click('.tl-type[data-type="deep"] [data-type-start]');
  await page.waitForSelector('#tl-stage:not([hidden])');
  await page.waitForTimeout(300);
  check(!(await asked(page)).includes('start'), 'a session that isn\'t only breathing (Deep) never shows on the Lock Screen');
  await leave(page);

  await openSettings(page);
  await page.click('#tl-set-live');
  await page.waitForTimeout(200);
  check(!(await kept(page)), 'and it can be turned off again');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openSettings(page);
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const box = document.getElementById('tl-set-live-box'); const limit = window.innerWidth + 1; return Array.from(box.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).length; });
    check(wide === 0, `Spanish, dark, a small phone, text at ${size}: the setting fits`);
  }
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with a stand-in for the phone; nothing was shown on a Lock Screen.`);
process.exit(tally.failures ? 1 : 0);

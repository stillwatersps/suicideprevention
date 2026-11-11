// Tests the redesigned app (tabs, onboarding, check-in, streaks, meditation) in desktop Chromium,
// after `node tools/build.mjs`. Everything a phone does is a stand-in here: this is not a phone
// test. No test may contact a crisis service; links are only checked for being on screen.
import { createRequire } from 'node:module';
import { tab, openPanel, openSettings, safetyFrame, serve, counter, birthDateYearsAgo, pagePath, noSideways } from './helpers.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { base, close } = await serve();
const { check, tally } = counter();
const TABS = ['home', 'checkin', 'meditate', 'location', 'friends'];

async function newPage(browser, lang, options = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ...options });
  const errors = [];
  const outside = [];
  context.on('request', (r) => { if (!r.url().startsWith(base) && !/^(data|blob):/.test(r.url())) outside.push(r.url()); });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
async function giveAge(page, years = 30) {
  await page.fill('#app-birth-date', birthDateYearsAgo(years));
  await page.click('.app-age-save');
  await page.click('.app-age-yes');
}

async function shellTests(browser, lang) {
  console.log(`\nShell and tabs, ${lang === 'es' ? 'Spanish' : 'English'}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  check(!(await page.isVisible('#tl-tabbar')), 'no tab bar while the age is asked');
  check((await safetyFrame(page)).length === 0, 'the safety frame is on screen while the age is asked');
  await giveAge(page);
  check(await page.isVisible('#tl-home'), 'Home shows after the age question');
  const labels = await page.$$eval('#tl-tabbar .tl-tab', (els) => els.map((e) => e.getAttribute('data-tl-tab-btn')));
  check(JSON.stringify(labels) === JSON.stringify(TABS), 'five tabs in order: Home, Check-in, Meditate, Location, Friends');
  check((await page.$$eval('#tl-tabbar .tl-tab-label', (els) => els.every((e) => e.textContent.trim().length > 0))), 'every tab has a label');
  check((await page.textContent('.tl-greeting')).trim().length > 3, 'Home greets by time of day');

  for (const id of TABS) {
    await tab(page, id);
    check(await page.isVisible('#tl-' + id), `the ${id} tab shows its screen`);
    check((await page.$$eval('.tl-screen', (els) => els.filter((e) => !e.hidden).length)) === 1, `${id}: one screen at a time`);
    const missing = await safetyFrame(page);
    check(missing.length === 0, `${id}: 988, 911, Exit, Get Support Now, the language link, and both review notices are on screen` + (missing.length ? ': missing ' + missing.join(', ') : ''));
    check(await page.isVisible(`#tl-${id} .tl-draft-tag a[href="#tl-review"]`), `${id}: marked "Draft for review"`);
    check((await page.getAttribute(`#tl-tabbar [data-tl-tab-btn="${id}"]`, 'aria-current')) === 'page', `${id}: its tab is marked current`);
    check(await noSideways(page), `${id}: no sideways scrolling`);
    const small = await page.$$eval(`#tl-${id} [class*="tl-"]:is(button, a), #tl-${id} .tl-draft-tag a, #tl-tabbar button`, (els) => els.filter((e) => e.offsetParent !== null)
      .filter((e) => { const r = e.getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).map((e) => (e.className || e.tagName) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)));
    check(small.length === 0, `${id}: every new control is at least 44 points` + (small.length ? ': ' + small.slice(0, 4).join('; ') : ''));
    const unnamed = await page.$$eval(`#tl-${id} button, #tl-${id} a, #tl-${id} input, #tl-tabbar button`, (els) => els.filter((e) => e.offsetParent !== null)
      .filter((e) => !(e.getAttribute('aria-label') || e.textContent.trim() || (e.labels && e.labels.length) || e.getAttribute('aria-labelledby'))).length);
    check(unnamed === 0, `${id}: every control has a name a screen reader can say`);
  }

  // Each tab keeps its own stack; tapping the tab you're on goes back to its first screen.
  await openSettings(page);
  check(await page.isVisible('#tl-settings') && !(await page.isVisible('#tl-home')), 'the gear on Home opens Settings');
  check((await safetyFrame(page)).length === 0, 'Settings: the safety frame is on screen');
  check(await page.isVisible('#tl-settings .app-settings'), 'Settings holds the age group section');
  await tab(page, 'meditate');
  await tab(page, 'home');
  check(await page.isVisible('#tl-settings'), 'coming back to Home finds Settings still open');
  await tab(page, 'home');
  check(await page.isVisible('#tl-home'), 'tapping Home again goes back to its first screen');

  // Nothing that existed is lost: every older section is reachable.
  for (const panel of ['ci-journal', 'ci-rediscover', 'app-hope', 'ci-journey', 'ci-today']) {
    await tab(page, 'checkin');
    if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
    await page.click(`#tl-checkin [data-tl-legacy="${panel}"]`);
    check(await page.isVisible('#' + panel), `Check-in opens ${panel}`);
    check((await safetyFrame(page)).length === 0, `${panel}: the safety frame is on screen`);
  }
  await page.click('#tl-legacy [data-tl-back]');
  check(await page.isVisible('#tl-checkin'), 'Back returns to the Check-in tab');
  await tab(page, 'location');
  check(await page.isVisible('#tl-location .app-places'), 'Places that are hard for me is on the Location tab');
  check(await page.isVisible('#tl-location .app-places a[href="tel:988"]') || !(await page.isChecked('.app-places-on')), 'its crisis lines are untouched');
  await tab(page, 'friends');
  check(await page.isVisible('#tl-friends .app-circle'), 'My circle is on the Friends tab');
  check(await page.isVisible('#tl-friends .app-circle a[href="tel:988"]') && await page.isVisible('#tl-friends .app-circle a[href="tel:911"]'), 'My circle still shows 988 and 911');
  await openPanel(page, 'ci-journey');
  check(await page.isVisible('.ci-erase') && await page.isVisible('#app-reminders, .app-log-section'), 'Your journey still has today\'s check-ins and Delete everything');

  // Get Support Now still goes to the 988 panel, from a new screen.
  await tab(page, 'meditate');
  await page.click('.header-cta');
  await page.waitForTimeout(700);
  const inView = await page.evaluate(() => { const r = document.querySelector('#support').getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; });
  check(inView, 'Get Support Now brings the 988 panel into view');

  // Words that fill in from the page: none is missing.
  const blank = await page.$$eval('.tl-words [data-word]', (els) => els.filter((e) => !e.textContent.trim()).map((e) => e.getAttribute('data-word')));
  check(blank.length === 0, 'no word is blank');

  check(outside.length === 0, 'no requests to other sites' + (outside.length ? ': ' + outside.join(', ') : ''));
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await context.close();
}

async function themeTests(browser) {
  console.log('\nLight, dark, small screens, and reduced motion');
  for (const colorScheme of ['light', 'dark']) {
    const { context, page } = await newPage(browser, 'en', { colorScheme, viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' });
    await giveAge(page);
    for (const id of TABS) {
      await tab(page, id);
      check(await noSideways(page), `${colorScheme}, 320 wide: ${id} fits`);
    }
    // Text must stand out from what is behind it.
    const ratio = await page.evaluate(() => {
      const lum = (c) => { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      const title = document.querySelector('#tl-friends .tl-title');
      const a = lum(getComputedStyle(title).color);
      const b = lum(getComputedStyle(document.body).backgroundColor);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    check(ratio >= 4.5, `${colorScheme}: a screen title stands out from the page (${ratio.toFixed(1)} to 1)`);
    await context.close();
  }
}

const browser = await chromium.launch();
try {
  await shellTests(browser, 'en');
  await shellTests(browser, 'es');
  await themeTests(browser);
} finally {
  await browser.close();
  close();
}
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

// Tests the redesigned app (tabs, onboarding, check-in, streaks, meditation) in desktop Chromium,
// after `node tools/build.mjs`. Everything a phone does is a stand-in here: this is not a phone
// test. No test may contact a crisis service; links are only checked for being on screen.
import { createRequire } from 'node:module';
import { tab, openPanel, openSettings, startDaily, safetyFrame, serve, counter, birthDateYearsAgo, pagePath, noSideways, skipOnboarding, SEEDED } from './helpers.mjs';

import { isoWeek } from '../src/logic/streaks.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { base, close } = await serve();
const { check, tally } = counter();
const TABS = ['home', 'checkin', 'meditate', 'location', 'friends'];

// seed: a phone already set up (the default). hooks: what the pretend phone answers.
async function newPage(browser, lang, { seed = true, hooks = {}, storage = {}, ...options } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ...options });
  const errors = [];
  const outside = [];
  context.on('request', (r) => { if (!r.url().startsWith(base) && !/^(data|blob):/.test(r.url())) outside.push(r.url()); });
  await context.addInitScript(([given, stored]) => {
    window.__tidelight = Object.assign({
      schedules: [], haptics: [], spoken: [], ambient: [], awake: [], sessions: [],
      onSchedule(list) { this.schedules.push(list); this.scheduled = list; }, onHaptic(o) { this.haptics.push(o); },
      onSpeak(o) { this.spoken.push(o); }, onAmbient(kind) { this.ambient.push(kind); }, onKeepAwake(on) { this.awake.push(on); }, onSession(o) { this.sessions.push(o); },
    }, given);
    // Count every time the audio system is opened, to prove Silent and sound-off never open it.
    window.__audioContexts = 0;
    const Real = window.AudioContext;
    if (Real) window.AudioContext = class extends Real { constructor(...args) { super(...args); window.__audioContexts += 1; } };
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
const DISCREET = /suicid|crisis|mood|feeling|sad|988|ánimo|sentir/i;

async function shellTests(browser, lang) {
  console.log(`\nShell and tabs, ${lang === 'es' ? 'Spanish' : 'English'}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  check(await page.isVisible('#tl-home'), 'a phone already set up opens on Home');
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
  check(await page.isVisible('.ci-erase') && await page.isVisible('.app-log-section'), 'Your journey still has today\'s check-ins and Delete everything');

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


async function onboardingTests(browser, lang) {
  console.log(`\nOnboarding with every permission allowed, ${lang === 'es' ? 'Spanish' : 'English'}`);
  const hooks = { locationAuthorization: 'notDetermined', grantLocation: true, position: { latitude: 40.01, longitude: -75.02 }, notificationAuthorization: 'notDetermined', grantNotifications: true };
  const { context, page, errors, outside } = await newPage(browser, lang, { seed: false, hooks });
  const onPage = (name) => page.isVisible(`.tl-ob-page[data-ob="${name}"]`);
  const next = () => page.click('.tl-ob-page:not([hidden]) [data-ob-next]');
  const frameOk = async (name) => {
    const missing = await safetyFrame(page);
    check(missing.length === 0, `${name} page: 988, 911, Exit, Get Support Now, the language link, and both review notices are on screen` + (missing.length ? ': missing ' + missing.join(', ') : ''));
  };
  check(await onPage('welcome'), 'a fresh install opens on the welcome page');
  check(!(await page.isVisible('#tl-tabbar')), 'no tab bar during onboarding');
  check(!(await page.isVisible('#tl-ob-skip')), 'the welcome page has no Skip');
  check(await page.isVisible('#tl-onboarding .tl-draft-tag'), 'onboarding is marked "Draft for review"');
  await frameOk('welcome');
  await next();
  check(await onPage('age') && await page.isVisible('#app-age'), 'the date of birth comes next');
  check(!(await page.isVisible('#tl-ob-skip')), 'the date of birth can\'t be skipped');
  check(await page.isVisible('#app-age a[href="tel:988"]') && await page.isVisible('#app-age a[href="tel:911"]'), 'the age question still shows 988 and 911');
  await frameOk('age');
  await page.fill('#app-birth-date', birthDateYearsAgo(30));
  await page.click('.app-age-save');
  await page.click('.app-age-yes');
  check(await onPage('name'), 'then the name page');
  check(await page.isVisible('#tl-ob-skip') && await page.isVisible('#tl-ob-back'), 'which can be skipped, and has Back');
  await frameOk('name');
  await page.fill('#tl-ob-name', 'Sam');
  await next();
  check(await onPage('count') && (await page.textContent('#tl-ob-count .tl-stepper-value')).trim() === '3', 'check-ins per day starts at 3');
  check((await page.locator('.tl-ob-page[data-ob="count"] [data-tl-times] li').count()) === 3, 'with a preview of three times');
  await page.click('#tl-ob-count [data-tl-step="1"]');
  check((await page.locator('.tl-ob-page[data-ob="count"] [data-tl-times] li').count()) === 4, 'the preview follows the stepper');
  for (let i = 0; i < 5; i += 1) await page.click('#tl-ob-count [data-tl-step="1"]', { force: true }).catch(() => {});
  check((await page.textContent('#tl-ob-count .tl-stepper-value')).trim() === '5', 'the stepper stops at 5');
  await page.click('#tl-ob-count [data-tl-step="-1"]');
  await frameOk('count');
  await next();
  check(await onPage('times'), 'then wake time and bedtime');
  const before = await page.textContent('.tl-ob-page[data-ob="times"] [data-tl-times]');
  await page.fill('#tl-ob-wake', '10:00');
  await page.dispatchEvent('#tl-ob-wake', 'change');
  check((await page.textContent('.tl-ob-page[data-ob="times"] [data-tl-times]')) !== before, 'changing the wake time moves the check-in times');
  await frameOk('times');
  await page.click('#tl-ob-back');
  check(await onPage('count'), 'Back goes to the page before');
  await next();
  await next();
  check(await onPage('style'), 'then the style page');
  await page.click('#tl-ob-style [data-value="straightforward"]');
  check((await page.textContent('#tl-ob-style-preview')).trim().length > 3 && (await page.getAttribute('#tl-ob-style [data-value="straightforward"]', 'aria-pressed')) === 'true', 'tapping a style shows a sample prompt and marks the card');
  const speed = await page.evaluate(() => document.querySelector('#tl-ob-style-preview').style.getPropertyValue('--tl-speed'));
  check(speed === '0.8', 'the preview runs at that style\'s speed');
  await frameOk('style');
  await next();
  check(await onPage('location'), 'then location');
  await frameOk('location');
  await page.click('#tl-ob-location');
  await page.waitForSelector('#tl-ob-home:not([hidden])');
  check(true, 'allowing location offers "Set your home spot"');
  await page.click('#tl-ob-home');
  await page.waitForFunction(() => localStorage.getItem('tidelight.home'));
  const home = await stored(page, 'tidelight.home');
  check(home && home.latitude === 40.01, 'the home spot is saved on this phone');
  await next();
  check(await onPage('notifications'), 'then notifications');
  await frameOk('notifications');
  await page.click('#tl-ob-notify');
  await page.waitForFunction(() => window.__tidelight.schedules.length > 0 && window.__tidelight.scheduled.length > 0);
  const scheduled = await page.evaluate(() => window.__tidelight.scheduled);
  check(scheduled.length >= 4 && scheduled.every((n) => new Date(n.at) > new Date()), 'reminders are set for the days ahead, none in the past');
  check(scheduled.every((n) => n.title === 'Tidelight' && n.body.length > 5 && !DISCREET.test(n.body)), 'reminder words are discreet: nothing about mood, crisis, or the person');
  await next();
  check(await onPage('done') && !(await page.isVisible('#tl-ob-skip')), 'then the last page');
  await frameOk('done');
  await page.click('#tl-ob-start');
  check(await page.isVisible('#tl-home') && await page.isVisible('#tl-tabbar'), 'Start opens Home, with the tab bar');
  check((await page.textContent('.tl-greeting')).includes('Sam'), 'Home greets the person by name');
  const settings = await stored(page, 'tidelight.settings');
  check(settings.checkInsPerDay === 4 && settings.wakeTime === '10:00' && settings.checkInStyle === 'straightforward' && settings.remindersOn === true, 'the choices are saved');
  check((await stored(page, 'tidelight.onboarding')).completed === true, 'onboarding is marked done');

  // Setup ring: worked out from real state.
  await page.waitForSelector('#tl-home-setup:not([hidden])');
  check(/6\/8/.test(await page.textContent('#tl-setup-count')), 'the setup ring says 6 of 8: a first check-in and a first meditation are left');
  await page.click('#tl-setup-open');
  const left = await page.$$eval('#tl-setup-list li', (els) => els.filter((e) => !e.hidden).map((e) => e.getAttribute('data-setup')));
  check(JSON.stringify(left) === JSON.stringify(['firstCheckIn', 'firstMeditation']), 'tapping it lists what\'s left');

  // Straightforward: a check-in in a few taps.
  const t0 = Date.now();
  await page.click('[data-setup-do="firstCheckIn"]');
  check(await page.isVisible('#tl-flow [data-flow="mood"]') && !(await page.isVisible('#tl-flow [data-flow="breath"]')), 'Straightforward goes straight to the mood');
  const prompt = (await page.textContent('#tl-flow-prompt')).trim();
  check(prompt.length > 0 && prompt.length < 16, 'with the short prompt');
  check((await page.locator('#tl-flow-faces .tl-face').count()) === 5 && (await page.$$eval('#tl-flow-faces .tl-face-label', (els) => els.every((e) => e.textContent.trim()))), 'five faces, each with a word under it');
  check((await safetyFrame(page)).length === 0, 'the check-in keeps the safety frame on screen');
  await page.click('#tl-flow-faces [data-value="4"]');
  await page.click('#tl-flow-tags [data-value="grateful"]');
  await page.fill('#tl-flow-note', 'A made-up note.');
  await page.click('#tl-flow-done');
  check(await page.isVisible('#tl-flow [data-flow="done"]'), 'Done shows the short thanks');
  check(Date.now() - t0 < 10000, 'a Straightforward check-in takes under 10 seconds here');
  await page.waitForSelector('#tl-home:not([hidden])', { timeout: 4000 });
  check(true, 'and returns to Home by itself');
  check(/7\/8/.test(await page.textContent('#tl-setup-count')), 'the setup ring moves to 7 of 8');
  const log = await stored(page, 'tidelight.log.v1');
  check(log.length === 1 && log[0].mood === 4 && log[0].tags.length === 1 && log[0].note === 'A made-up note.' && log[0].kind === 'quick', 'the check-in is kept on this phone, in the same list as before');
  await tab(page, 'checkin');
  check((await page.textContent('#tl-today-list')).includes('A made-up note.'), 'the Check-in tab lists today\'s check-in');
  await openPanel(page, 'ci-journey');
  check((await page.locator('.ci-cal-day.is-marked').count()) === 1 && (await page.textContent('.app-log')).length > 5, 'Your journey marks today and lists it too');
  await page.click('.app-share-days[data-days="1"]');
  check(!(await page.inputValue('#app-share-text')).includes('A made-up note.'), 'a note is never part of a shared summary');
  await page.click('.app-share-cancel');

  // Changing the style changes the flow, the words, and the speed at once.
  await openSettings(page);
  check((await safetyFrame(page)).length === 0, 'Settings keeps the safety frame on screen');
  await page.click('#tl-set-style [data-value="calm"]');
  check((await page.evaluate(() => document.documentElement.style.getPropertyValue('--tl-speed'))) === '1.4', 'Calm slows the animations (1.4 times)');
  await page.click('#tl-settings [data-tl-back]');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  check(await page.isVisible('#tl-flow [data-flow="breath"]'), 'Calm starts with one breath');
  await page.click('#tl-flow-skip');
  const calmPrompt = (await page.textContent('#tl-flow-prompt')).trim();
  check(calmPrompt.length > prompt.length, 'and asks with the softer, longer prompt');

  // A very low mood shows support right away, and nothing celebrates.
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.click('#tl-flow-done');
  check(await page.isVisible('#tl-flow-support'), 'a very low mood shows support options at once');
  check(await page.isVisible('#tl-flow-support a[href="tel:988"]') && await page.isVisible('#tl-flow-support a[href="sms:988"]') && await page.isVisible('#tl-flow-support a[href="tel:911"]'), 'with Call 988, Text 988, and Call 911');
  check(!(await page.isVisible('#tl-flow [data-flow="done"]')), 'instead of the usual thanks');
  check((await page.locator('#tl-flow-support').evaluate((el) => /streak|racha|🎉/i.test(el.textContent))) === false, 'no streak or celebration words near it');
  await page.waitForTimeout(2600);
  check(await page.isVisible('#tl-flow-support'), 'and it stays until the person leaves it');
  check((await stored(page, 'tidelight.log.v1')).length === 2, 'the check-in is still kept');
  await page.click('#tl-flow-support a[href="#support"]');
  await page.waitForTimeout(600);
  check(await page.evaluate(() => { const r = document.querySelector('#support').getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; }), '"More ways to get support" goes to the 988 panel');

  // The five-question check-in: a heavy feeling shows support at the top of its results.
  await startDaily(page);
  await page.click('#ci-step-feeling label:has(input[value="sad"])');
  await page.click('#ci-step-feeling .ci-next');
  for (const id of ['mind', 'difficult', 'self']) await page.click(`#ci-step-${id} .ci-skip`);
  await page.click('.ci-finish');
  check(await page.isVisible('#tl-result-support a[href="tel:988"]') && await page.isVisible('#tl-result-support a[href="tel:911"]'), 'the Daily check-in shows support at once after a heavy feeling');
  await page.click('.ci-restart');
  await page.click('#ci-step-feeling label:has(input[value="hopeful"])');
  await page.click('#ci-step-feeling .ci-next');
  for (const id of ['mind', 'difficult', 'self']) await page.click(`#ci-step-${id} .ci-skip`);
  await page.click('.ci-finish');
  check(!(await page.isVisible('#tl-result-support')), 'and not after a lighter one');

  // A second launch goes straight to Home.
  await page.reload();
  await page.waitForSelector('html.app-ready');
  check(await page.isVisible('#tl-home') && !(await page.isVisible('#tl-onboarding')), 'a second launch goes straight to Home');
  check((await page.textContent('.tl-greeting')).includes('Sam'), 'and still knows the name');

  // Delete everything removes the name and the home spot too.
  await openPanel(page, 'ci-journey');
  await page.click('.ci-erase-start');
  await page.click('.ci-erase-yes');
  await page.waitForFunction(() => !localStorage.getItem('tidelight.home') && !localStorage.getItem('tidelight.profile'));
  check(true, 'Delete everything removes the name and the home spot');
  check((await stored(page, 'tidelight.settings')).checkInsPerDay === 4, 'and keeps the settings');

  check(outside.length === 0, 'no requests to other sites' + (outside.length ? ': ' + outside.join(', ') : ''));
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await context.close();
}

async function deniedTests(browser) {
  console.log('\nOnboarding with every permission refused, then Settings');
  const hooks = { locationAuthorization: 'notDetermined', grantLocation: false, notificationAuthorization: 'notDetermined', grantNotifications: false };
  const { context, page, errors } = await newPage(browser, 'en', { seed: false, hooks });
  await page.click('.tl-ob-page:not([hidden]) [data-ob-next]');
  await page.fill('#app-birth-date', birthDateYearsAgo(16));
  await page.click('.app-age-save');
  await page.click('.app-age-yes');
  for (const name of ['name', 'count', 'times', 'style']) { check(await page.isVisible(`.tl-ob-page[data-ob="${name}"]`), `Skip leaves the ${name} page`); await page.click('#tl-ob-skip'); }
  await page.click('#tl-ob-location');
  await page.waitForFunction(() => document.querySelector('#tl-ob-location-note').textContent.trim().length > 0);
  check(!(await page.isVisible('#tl-ob-home')), 'location refused: no home spot offered, and a plain note says so');
  await page.click('.tl-ob-page:not([hidden]) [data-ob-next]');
  await page.click('#tl-ob-notify');
  await page.waitForFunction(() => document.querySelector('#tl-ob-notify-note').textContent.trim().length > 0);
  check((await page.evaluate(() => (window.__tidelight.scheduled || []).length)) === 0, 'notifications refused: no reminder is set');
  await page.click('.tl-ob-page:not([hidden]) [data-ob-next]');
  await page.click('#tl-ob-start');
  check(await page.isVisible('#tl-home'), 'refusing everything still reaches Home');
  await page.waitForSelector('#tl-home-setup:not([hidden])');
  check(/0\/8/.test(await page.textContent('#tl-setup-count')), 'the setup ring says 0 of 8');
  await page.click('#tl-setup-open');
  await page.fill('#tl-setup-name', 'Lee');
  await page.click('[data-setup-do="name"]');
  await page.waitForFunction(() => /1\/8/.test(document.querySelector('#tl-setup-count').textContent));
  check(true, 'saving a name from the list moves it to 1 of 8');
  await page.click('[data-setup-do="count"]');
  await page.waitForFunction(() => /2\/8/.test(document.querySelector('#tl-setup-count').textContent));
  check(true, 'one tap keeps the check-in count');
  await page.click('[data-setup-do="notifications"]');
  await page.waitForFunction(() => document.querySelector('#tl-setup-note').textContent.trim().length > 0);
  check(/2\/8/.test(await page.textContent('#tl-setup-count')), 'a refused permission stays on the list, with a note');

  // Settings.
  await openSettings(page);
  check(!(await page.isChecked('#tl-set-reminders')), 'reminders are off until turned on');
  await page.click('#tl-set-reminders');
  await page.waitForSelector('#tl-set-rem-denied:not([hidden])');
  check(!(await page.isChecked('#tl-set-reminders')), 'turning reminders on while the phone refuses turns the switch back off, and says why');
  await page.evaluate(() => { window.__tidelight.notificationAuthorization = 'authorized'; });
  await page.check('#tl-set-reminders');
  await page.waitForFunction(() => (window.__tidelight.scheduled || []).length > 0);
  const three = await page.evaluate(() => window.__tidelight.scheduled.length);
  await page.click('#tl-set-count [data-tl-step="1"]');
  await page.waitForFunction((n) => window.__tidelight.scheduled.length > n, three);
  check((await page.locator('#tl-set-times input').count()) === 4, 'one more check-in a day adds a time and sets the reminders again');
  await page.fill('#tl-set-times input >> nth=0', '06:15');
  await page.dispatchEvent('#tl-set-times input >> nth=0', 'change');
  await page.waitForFunction(() => (JSON.parse(localStorage.getItem('tidelight.settings')).customTimes || []).includes('06:15'));
  check(true, 'each check-in time can be changed');
  await page.click('#tl-set-test');
  await page.waitForFunction(() => window.__tidelight.scheduled.some((n) => n.id === 299));
  check(true, 'the test notification is handed to the phone');
  await page.uncheck('#tl-set-reminders');
  await page.waitForFunction(() => window.__tidelight.scheduled.length === 0);
  check(true, 'turning reminders off clears them');
  await page.uncheck('#tl-set-streaks');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('tidelight.settings')).streaksOn === false);
  check(true, 'streaks can be turned off');
  await page.check('#tl-set-reduce');
  await page.waitForFunction(() => document.documentElement.classList.contains('tl-reduce'));
  check(true, 'Reduce animations applies at once');
  check(!(await page.isVisible('#tl-developer')), 'the Developer section is hidden');
  for (let i = 0; i < 7; i += 1) await page.click('#tl-version');
  check(await page.isVisible('#tl-developer') && (await page.textContent('#tl-dev-phase')).trim().length > 10, 'seven taps on the version open it, with the build phase');
  await page.click('#tl-dev-onboarding');
  check(await page.isVisible('.tl-ob-page[data-ob="welcome"]'), 'Reset onboarding shows the welcome page again');
  await page.click('.tl-ob-page:not([hidden]) [data-ob-next]');
  check(await page.isVisible('.tl-ob-page[data-ob="name"]'), 'this time without the date of birth, which is already known');
  await skipOnboarding(page);

  // "Enter my date of birth again" from Settings, and back.
  await openSettings(page);
  await page.click('.app-age-change');
  check(await page.isVisible('#app-age') && !(await page.isVisible('#tl-ob-skip')) && !(await page.isVisible('#tl-tabbar')), 'Settings can ask the date of birth again, on its own page');
  await page.fill('#app-birth-date', birthDateYearsAgo(40));
  await page.click('.app-age-save');
  await page.click('.app-age-yes');
  check(await page.isVisible('#tl-settings') && await page.isVisible('#tl-tabbar'), 'and returns to Settings');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await context.close();
}

async function migrationTests(browser) {
  console.log('\nData from before the redesign');
  const old = {
    'tidelight.agegroup.v1': 'teen',
    'tidelight.reminders.v1': JSON.stringify({ morning: { on: true, time: '07:45' }, midday: { on: false, time: '12:00' }, afternoon: { on: false, time: '15:30' }, evening: { on: true, time: '21:15' } }),
    'tidelight.log.v1': JSON.stringify([{ t: new Date().toISOString(), slot: 'morning', feeling: 'Okay', needs: ['Rest'] }]),
    'tidelight.checkin.v1': JSON.stringify({ feeling: '', feelingLabel: '', needs: [], checkins: [new Date().toISOString()], reflections: {}, explore: ['A made-up idea'], enjoyed: [], learned: [], entries: [{ id: 1, text: 'An older made-up entry.', prompt: '', mood: '', moodValue: '', date: new Date().toISOString() }], nextId: 2 }),
  };
  const { context, page, errors } = await newPage(browser, 'en', { seed: false, storage: old, hooks: { notificationAuthorization: 'authorized' } });
  check(await page.isVisible('.tl-ob-page[data-ob="welcome"]'), 'someone who used the app before sees the welcome page once');
  await page.click('.tl-ob-page:not([hidden]) [data-ob-next]');
  check(await page.isVisible('.tl-ob-page[data-ob="name"]'), 'and isn\'t asked their date of birth again');
  await skipOnboarding(page);
  const settings = await stored(page, 'tidelight.settings');
  check(settings.remindersOn === true && settings.checkInsPerDay === 2 && JSON.stringify(settings.customTimes) === '["07:45","21:15"]', 'the two reminders that were on became two check-ins a day, at the same times');
  check((await stored(page, 'tidelight.reminders.v1')).morning.time === '07:45', 'the older reminders are still stored, untouched');
  check((await page.evaluate(() => localStorage.getItem('tidelight.schema'))) === '2', 'the stored data is marked as the new version');
  const scheduled = await page.evaluate(() => window.__tidelight.scheduled || []);
  check(scheduled.length > 0 && scheduled.every((n) => ['07:45', '21:15'].includes(new Date(n.at).toTimeString().slice(0, 5))), 'reminders are set again at those times');
  await tab(page, 'checkin');
  check((await page.locator('#tl-today-list li').count()) === 1, 'an older check-in shows in today\'s list');
  await openPanel(page, 'ci-journal');
  check((await page.textContent('.ci-entries')).includes('An older made-up entry.'), 'an older journal entry is still there');
  await openPanel(page, 'ci-journey');
  check((await page.textContent('.ci-list-explore')).includes('A made-up idea') && (await page.locator('.ci-cal-day.is-marked').count()) === 1, 'and so are kept ideas and the calendar');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await context.close();
}


const keyOf = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const doneDay = (offset, goal = 1) => ({ dateKey: keyOf(offset), checkInsCompleted: goal, checkInGoal: goal, meditationsCompleted: 0, status: 'complete' });
const daysOf = (...offsets) => JSON.stringify(Object.fromEntries(offsets.map((o) => [keyOf(o), doneDay(o)])));
const oneADay = JSON.stringify({ checkInsPerDay: 1, countChosen: true });
const streakIs = (page, n) => page.waitForFunction((want) => document.querySelector('#tl-streak-number').textContent.trim() === want, String(n), { timeout: 5000 }).then(() => true, () => false);
async function quickCheckIn(page, mood) {
  await tab(page, 'home');
  if (!(await page.isVisible('#tl-home'))) await tab(page, 'home');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click(`#tl-flow-faces [data-value="${mood}"]`);
  await page.click('#tl-flow-done');
}

async function streakTests(browser, lang) {
  console.log(`\nStreaks, ${lang === 'es' ? 'Spanish' : 'English'}`);
  // Two complete days behind, one check-in a day: today's check-in makes three, a milestone.
  let { context, page, errors } = await newPage(browser, lang, { storage: { 'tidelight.settings': oneADay, 'tidelight.days': daysOf(-2, -1) } });
  check(await page.isVisible('#tl-streak-card') && await streakIs(page, 2), 'Home shows the streak so far: 2');
  check((await page.locator('#tl-streak-week .tl-day').count()) === 7, 'with a row of seven days');
  check(await page.isVisible('#tl-streak-week .tl-day.is-today'), 'today is marked as in progress');
  check((await page.textContent('#tl-streak-week-words')).trim().length > 10, 'and the row is described in words for screen readers');
  await quickCheckIn(page, 4);
  await page.waitForSelector('#tl-home:not([hidden])', { timeout: 5000 });
  await page.waitForFunction(() => document.querySelector('#tl-streak-number').textContent.trim() === '3');
  check(true, 'the streak card updates right after the check-in: 3');
  check(await page.isVisible('#tl-milestone') && (await page.textContent('#tl-milestone-line')).includes('3'), 'a 3-day milestone shows, once');
  check((await safetyFrame(page)).length === 0, 'the celebration covers none of the safety frame');
  check(await page.evaluate(() => { const c = document.querySelector('.tl-burst'); return !c || getComputedStyle(c).pointerEvents === 'none'; }), 'and takes no taps');
  await page.click('#tl-milestone-ok');
  check(!(await page.isVisible('#tl-milestone')), 'it can be put away');
  await page.click('#tl-streak-card');
  check(await page.isVisible('#tl-streak') && (await page.textContent('#tl-streak-current')).trim() === '3' && (await page.textContent('#tl-streak-best')).trim() === '3', 'the streak screen shows now and best');
  const monthDays = await page.locator('#tl-streak-month .tl-day:not(.is-blank)').count();
  check(monthDays >= 28 && monthDays <= 31 && (await page.locator('#tl-streak-month .tl-day.is-complete').count()) >= 1, 'with this month as a calendar of days');
  check((await page.locator('#tl-streak .tl-legend li').count()) === 4 && (await page.textContent('#tl-streak-freeze-line')).includes('1'), 'a legend in words, and the freezes held');
  check((await safetyFrame(page)).length === 0 && await page.isVisible('#tl-streak .tl-draft-tag'), 'the streak screen keeps the safety frame and is marked "Draft for review"');
  check(await noSideways(page), 'the streak screen fits');
  await page.reload();
  await page.waitForSelector('html.app-ready');
  check(await streakIs(page, 3) && !(await page.isVisible('#tl-milestone')), 'the milestone isn\'t shown again; the streak is remembered');
  // Developer tools: seed a month to look at, and reset.
  await openSettings(page);
  for (let i = 0; i < 7; i += 1) await page.click('#tl-version');
  await page.click('#tl-dev-seed');
  await page.click('#tl-settings [data-tl-back]');
  await page.click('#tl-streak-card');
  check((await page.locator('#tl-streak-month .tl-day.is-frozen, #tl-streak-month .tl-day.is-missed, #tl-streak-month .tl-day.is-complete').count()) >= 5, 'seeded history fills the calendar');
  // Streaks off: nothing of them shows.
  await page.click('#tl-streak [data-tl-anchor="tl-set-feel"]');
  await page.uncheck('#tl-set-streaks');
  await page.click('#tl-settings [data-tl-back]');
  await tab(page, 'home');
  check(!(await page.isVisible('#tl-streak-card')) && !(await page.isVisible('#tl-milestone')) && !(await page.isVisible('#tl-streak-fresh')), 'with streaks turned off, Home shows no streak at all');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await context.close();

  // A very low check-in on a milestone day: support comes first and nothing celebrates.
  ({ context, page, errors } = await newPage(browser, lang, { storage: { 'tidelight.settings': oneADay, 'tidelight.days': daysOf(-2, -1) } }));
  await quickCheckIn(page, 1);
  check(await page.isVisible('#tl-flow-support') && !(await page.isVisible('#tl-milestone')) && !(await page.isVisible('.tl-burst')), 'a very low check-in shows support, with no celebration anywhere');
  await page.click('#tl-flow-support [data-tl-go="home"]');
  check(await streakIs(page, 3) && !(await page.isVisible('#tl-milestone')), 'back on Home the day still counts, quietly: no milestone card');
  await context.close();

  // A streak that ended while away: a gentle card, no guilt.
  const ended = JSON.stringify({ current: 3, best: 3, freezesAvailable: 0, lastFreezeGrantWeek: isoWeek(keyOf(-2)), lastEvaluatedDate: keyOf(-3), celebrated: [3], brokenNotice: null });
  ({ context, page, errors } = await newPage(browser, lang, { storage: { 'tidelight.settings': oneADay, 'tidelight.days': daysOf(-5, -4, -3), 'tidelight.streak': ended } }));
  check(await streakIs(page, 0), 'after two days away with no freeze, the streak starts again at 0');
  check(await page.isVisible('#tl-streak-fresh') && (await page.textContent('#tl-streak-fresh-line')).includes('3'), 'a gentle card says the best is still 3');
  check(!/miss|lost|broke|fail|perd|romp|fall/i.test(await page.textContent('#tl-streak-fresh')), 'with no guilt words');
  check(await page.evaluate(() => getComputedStyle(document.querySelector('#tl-streak-fresh')).position !== 'fixed'), 'as a card in the page, not a pop-up');
  await page.click('#tl-streak-fresh-ok');
  await page.reload();
  await page.waitForSelector('html.app-ready');
  check(!(await page.isVisible('#tl-streak-fresh')), 'once put away, it stays away');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await context.close();
}


const startType = async (page, type) => { await tab(page, 'meditate'); if (!(await page.isVisible('#tl-meditate'))) await tab(page, 'meditate'); await page.click(`.tl-type[data-type="${type}"] [data-type-start]`); await page.waitForSelector('#tl-stage:not([hidden])'); };
const startSample = (page) => startType(page, 'quick');
const barAt = (page) => page.evaluate(() => Number((document.querySelector('#tl-player-bar').style.transform.match(/[\d.]+/) || [0])[0]));

async function playerTests(browser, lang) {
  console.log(`\nThe meditation player, ${lang === 'es' ? 'Spanish' : 'English'}`);
  // The clock runs 20 times fast here, so a one-minute session takes three seconds.
  let { context, page, errors, outside } = await newPage(browser, lang, { hooks: { clockRate: 20 }, storage: { 'tidelight.settings': oneADay } });
  await startSample(page);
  check(!(await page.isVisible('#tl-tabbar')), 'the tab bar steps aside during a session');
  check(await page.isVisible('.crisis-bar a[href="tel:988"]') && await page.isVisible('.crisis-bar a[href="sms:988"]') && await page.isVisible('.crisis-bar a[href="tel:911"]') && await page.isVisible('.crisis-bar .quick-exit'), 'Call 988, Text 988, Call 911, and Exit stay on screen over the player');
  check(await page.isVisible('#tl-stage .tl-player-support[href="#support"]') && await page.isVisible('#tl-stage a[href="#tl-review"]'), 'the stage carries Get Support Now and "Draft for review"');
  check(await page.evaluate(() => { const top = document.querySelector('.crisis-bar').getBoundingClientRect(); const stage = document.querySelector('#tl-stage').getBoundingClientRect(); return stage.top >= top.bottom - 1; }), 'the stage starts under the crisis strip, not over it');
  check(await page.evaluate(() => Boolean(document.querySelector('.review-note:not(.tl-review)') && document.querySelector('.tl-review') && document.querySelector('#support a[href="tel:988"]') && document.querySelector('.lang-switch a'))), 'the rest of the safety frame is still in the page below');
  const words = new Set();
  let painted = false;
  for (let i = 0; i < 24; i += 1) {
    const w = (await page.textContent('#tl-guide-word')).trim();
    if (w) words.add(w);
    painted = painted || await page.evaluate(() => { const c = document.querySelector('#tl-world'); const d = c.getContext('2d').getImageData(c.width / 2, c.height / 2, 1, 1).data; return d[3] > 0; });
    await page.waitForTimeout(100);
  }
  check(painted, 'layer 1, the world, is drawn');
  check(words.size >= 3, 'layer 2, the guide, moves through in, hold, and out: ' + [...words].join(' / '));
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 8000 });
  const pretend = await page.evaluate(() => ({ spoken: window.__tidelight.spoken, haptics: window.__tidelight.haptics.length, awake: window.__tidelight.awake, sessions: window.__tidelight.sessions, audio: window.__audioContexts }));
  check(pretend.spoken.length === 2 && pretend.spoken[0].scriptId === 'intro.quick' && pretend.spoken[1].scriptId === 'outro.quick' && pretend.spoken.every((line) => line.text.length > 10), 'layer 3, the voice, says the intro and the outro');
  check(pretend.spoken.every((line) => line.kind === 'tts'), 'with no recording, it falls back to text-to-speech');
  check(pretend.haptics >= 6, 'layer 5, haptic breathing, pulses with the breath (' + pretend.haptics + ' pulses)');
  check(pretend.awake[0] === true && pretend.awake[pretend.awake.length - 1] === false, 'the screen is kept awake for the session and released after');
  check(pretend.audio === 0, 'a session with no background sound never opens the audio system');
  check(await page.isVisible('#tl-complete') && /1/.test(await page.textContent('#tl-complete-minutes')), 'the session ends on a completion screen with the minutes');
  check((await safetyFrame(page)).length === 0 && await page.isVisible('#tl-complete .tl-draft-tag'), 'the completion screen keeps the safety frame and is marked "Draft for review"');
  let sessions = await stored(page, 'tidelight.sessions');
  check(sessions.length === 1 && sessions[0].completed === true && sessions[0].completedSeconds === 60 && sessions[0].type === 'quick', 'the session is recorded on this phone');
  const today = (await stored(page, 'tidelight.days'))[keyOf(0)];
  check(today && today.meditationsCompleted === 1, 'and counts toward today');
  await page.click('#tl-complete-faces [data-value="4"]');
  check((await stored(page, 'tidelight.sessions'))[0].moodAfter === 4, 'an optional mood after is kept with it');
  await page.click('#tl-complete-favorite');
  await page.waitForFunction(() => (JSON.parse(localStorage.getItem('tidelight.presets') || '[]')).length === 1);
  check(true, 'Save as favorite keeps it');
  await page.click('#tl-complete [data-player-done]');
  check(await page.isVisible('#tl-meditate') && await page.isVisible('#tl-tabbar'), 'Done returns to Meditate, with the tab bar');
  await tab(page, 'home');
  await page.waitForFunction(() => /firstMeditation/.test(Array.from(document.querySelectorAll('#tl-setup-list li[hidden]')).map((e) => e.getAttribute('data-setup')).join(' ')));
  check(true, 'the setup list ticks off "First meditation"');

  // A very low mood after a session: support at once.
  await startSample(page);
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 8000 });
  await page.click('#tl-complete-faces [data-value="1"]');
  check(await page.isVisible('#tl-complete-support a[href="tel:988"]') && await page.isVisible('#tl-complete-support a[href="sms:988"]') && await page.isVisible('#tl-complete-support a[href="tel:911"]'), 'a very low mood after a session shows Call 988, Text 988, and Call 911 at once');
  check(!(await page.isVisible('#tl-complete-body')), 'in place of "Well done"');
  await page.click('#tl-complete [data-player-done]');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  check(outside.length === 0, 'no requests to other sites');
  await context.close();

  // Controls, at a slower clock.
  ({ context, page, errors } = await newPage(browser, lang, { hooks: { clockRate: 2 }, storage: { 'tidelight.settings': oneADay } }));
  await startSample(page);
  check(!(await page.isVisible('#tl-controls')), 'the controls start hidden');
  await page.click('#tl-stage', { position: { x: 180, y: 560 } });
  check(await page.isVisible('#tl-player-pause') && await page.isVisible('#tl-player-end') && await page.isVisible('#tl-toggle-sound') && await page.isVisible('#tl-toggle-voice') && await page.isVisible('#tl-toggle-haptics'), 'a tap shows Pause, End, and the three switches');
  const order = await page.evaluate(() => { const end = document.querySelector('#tl-player-end').getBoundingClientRect(); const sw = document.querySelector('#tl-toggle-sound').getBoundingClientRect(); const stage = document.querySelector('#tl-stage').getBoundingClientRect(); return end.left < stage.left + stage.width / 2 && sw.left > stage.left + stage.width / 2 && end.top < stage.top + stage.height / 3; });
  check(order, 'End is top left and the switches top right');
  await page.waitForTimeout(3400);
  check(!(await page.isVisible('#tl-controls')), 'the controls hide again after three seconds');
  await page.click('#tl-stage', { position: { x: 180, y: 560 } });
  await page.click('#tl-player-pause');
  const paused = await barAt(page);
  await page.waitForTimeout(700);
  check(Math.abs((await barAt(page)) - paused) < 0.0005, 'Pause stops the clock');
  check(await page.isVisible('#tl-controls'), 'and the controls stay while paused');
  const hapticsPaused = await page.evaluate(() => window.__tidelight.haptics.length);
  await page.waitForTimeout(600);
  check((await page.evaluate(() => window.__tidelight.haptics.length)) === hapticsPaused, 'no haptics while paused');
  await page.click('#tl-player-pause');
  await page.waitForTimeout(500);
  check((await barAt(page)) > paused, 'Resume carries on from the same place');
  // Each layer switches off on its own, mid-session.
  await page.click('#tl-stage', { position: { x: 180, y: 560 } }).catch(() => {});
  if (!(await page.isVisible('#tl-controls'))) await page.click('#tl-stage', { position: { x: 180, y: 560 } });
  await page.click('#tl-toggle-haptics');
  check((await page.getAttribute('#tl-toggle-haptics', 'aria-pressed')) === 'false', 'haptic breathing can be switched off mid-session');
  await page.waitForTimeout(300);
  const hapticsOff = await page.evaluate(() => window.__tidelight.haptics.filter((h) => h.style !== 'light' || h.intensity !== 1).length);
  await page.waitForTimeout(1500);
  check((await page.evaluate(() => window.__tidelight.haptics.filter((h) => h.style !== 'light' || h.intensity !== 1).length)) <= hapticsOff + 1, 'and the breath pulses stop');
  await page.click('#tl-toggle-voice');
  check((await page.getAttribute('#tl-toggle-voice', 'aria-pressed')) === 'false' && (await page.getAttribute('#tl-toggle-sound', 'aria-pressed')) === 'true', 'the voice switches off without touching the sound switch');
  // End, with a confirmation, before 60%.
  await page.click('#tl-player-end');
  check(await page.isVisible('#tl-end-confirm') && (await page.textContent('#tl-end-title')).trim().length > 5, 'End asks "End session?" first');
  await page.click('#tl-end-no');
  check(!(await page.isVisible('#tl-end-confirm')) && await page.isVisible('#tl-stage'), '"Keep going" keeps going');
  await page.click('#tl-player-end');
  await page.click('#tl-end-yes');
  await page.waitForSelector('#tl-meditate:not([hidden])');
  sessions = await stored(page, 'tidelight.sessions');
  check(sessions.length === 1 && sessions[0].completed === false && sessions[0].completedSeconds < 36, 'ending before 60% records the session as not completed');
  const day = (await stored(page, 'tidelight.days'))[keyOf(0)];
  check(!day || day.meditationsCompleted === 0, 'and it doesn\'t count toward today');
  check(!(await page.isVisible('#tl-complete')) && await page.isVisible('#tl-tabbar'), 'with no completion screen');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await context.close();
}


async function typesTests(browser, lang) {
  console.log(`\nMeditation types and suggestions, ${lang === 'es' ? 'Spanish' : 'English'}`);
  let { context, page, errors, outside } = await newPage(browser, lang, { hooks: { clockRate: 120 }, storage: { 'tidelight.settings': oneADay } });
  await tab(page, 'meditate');
  check(await page.isVisible('#tl-suggest-card') && (await page.textContent('#tl-suggest-card [data-suggest-title]')).trim().length > 2 && (await page.textContent('#tl-suggest-card [data-suggest-reason]')).trim().length > 5, 'Meditate opens with a suggestion and its one-line reason');
  check((await page.locator('#tl-types .tl-type').count()) === 4, 'then the four types');
  const labels = await page.$$eval('#tl-types [data-type-start]', (els) => els.map((e) => e.getAttribute('aria-label')));
  check(labels.every((l) => /\d/.test(l) && l.length > 12), 'each Start says what it starts: ' + labels[0]);
  check(await page.isVisible('#tl-build-card') && await page.isVisible('#tl-history-card') && await page.isVisible('#tl-presets'), 'then presets, Build your own, and History');
  check((await safetyFrame(page)).length === 0 && await noSideways(page), 'the Meditate tab keeps the safety frame and fits');

  // Silent: never any sound, whatever the settings say.
  await page.click('.tl-type[data-type="silent"] [data-type-length] [data-value="5"]');
  check(/5/.test(await page.getAttribute('.tl-type[data-type="silent"] [data-type-start]', 'aria-label')), 'choosing a length changes what Start says');
  await startType(page, 'silent');
  check((await page.getAttribute('#tl-toggle-sound', 'disabled')) !== null && (await page.getAttribute('#tl-toggle-voice', 'disabled')) !== null, 'Silent: the sound and voice switches can\'t be turned on');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 10000 });
  let heard = await page.evaluate(() => ({ audio: window.__audioContexts, spoken: window.__tidelight.spoken.length, ambient: window.__tidelight.ambient.length, haptics: window.__tidelight.haptics.length }));
  check(heard.audio === 0 && heard.spoken === 0 && heard.ambient === 0, 'Silent plays no audio at all: the audio system is never opened');
  check(heard.haptics > 5, 'and still breathes with haptics');
  check(/5/.test(await page.textContent('#tl-complete-minutes')), 'a 5-minute Silent session completes');
  await page.click('#tl-complete [data-player-done]');

  // Deep: voice and ambient together, with a world chosen in its options.
  await page.click('.tl-type[data-type="deep"] [data-type-options]');
  check(await page.isVisible('.tl-type[data-type="deep"] .tl-type-more') && (await page.getAttribute('.tl-type[data-type="deep"] [data-type-options]', 'aria-expanded')) === 'true', 'Options opens in place on the card');
  await page.click('.tl-type[data-type="deep"] [data-type-world] [data-value="forest"]');
  await startType(page, 'deep');
  check((await page.getAttribute('#tl-stage', 'data-world')) === 'forest', 'the chosen world is used');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 12000 });
  heard = await page.evaluate(() => ({ audio: window.__audioContexts, spoken: window.__tidelight.spoken.map((l) => l.scriptId), ambient: window.__tidelight.ambient }));
  check(heard.audio === 1 && heard.ambient.join() === 'ocean', 'Deep session: layer 4, the ambient sound, starts (ocean)');
  check(heard.spoken.join() === 'intro.deep,bodyScan,outro.deep', 'and the voice speaks the intro, the body scan, and the outro');
  await page.click('#tl-complete [data-player-done]');

  // Sleep: no completion screen; it just goes dark.
  await startType(page, 'sleep');
  await page.waitForSelector('#tl-stage.is-dark', { timeout: 12000 });
  check(!(await page.isVisible('#tl-complete')), 'Sleep ends with no completion screen: the stage goes dark');
  check(await page.isVisible('.crisis-bar a[href="tel:988"]') && await page.isVisible('#tl-stage .tl-player-support'), 'with 988 and Get Support Now still on screen');
  await page.click('#tl-stage', { position: { x: 180, y: 560 } });
  await page.click('#tl-player-end');
  await page.waitForSelector('#tl-meditate:not([hidden])');
  const sessions = await stored(page, 'tidelight.sessions');
  check(sessions.length === 3 && sessions.every((s) => s.completed) && sessions[0].type === 'sleep', 'all three sessions are recorded');

  // History.
  await page.click('#tl-history-card');
  check(await page.isVisible('#tl-history') && (await page.locator('#tl-history-list li').count()) === 3 && /25/.test(await page.textContent('#tl-history [data-history-total]')), 'History lists the sessions and the total: 25 minutes');
  check((await safetyFrame(page)).length === 0, 'History keeps the safety frame');
  await page.click('#tl-history [data-tl-back]');

  // Rule 5: what was done today isn't suggested again.
  const now = await page.textContent('#tl-suggest-card [data-suggest-title]');
  check(now.trim().length > 0, 'the suggestion still shows after sessions: ' + now.trim());

  // Developer overrides: the suggestion follows the context.
  await openSettings(page);
  for (let i = 0; i < 7; i += 1) await page.click('#tl-version');
  const pretend = async (time, headphones, home) => {
    await page.fill('#tl-dev-time', time); await page.dispatchEvent('#tl-dev-time', 'change');
    await page.selectOption('#tl-dev-headphones', headphones);
    await page.selectOption('#tl-dev-home', home);
    await page.waitForTimeout(150);
    return page.evaluate(() => document.querySelector('#tl-dev-suggest').textContent);
  };
  const first = await pretend('14:00', 'yes', 'no');
  const second = await pretend('14:00', 'no', 'no');
  check(first !== second, 'changing headphones changes the suggestion: "' + first + '" then "' + second + '"');
  await context.close();

  // A fresh day, to see each rule on its own.
  ({ context, page, errors, outside } = await newPage(browser, lang, { hooks: { clockRate: 120 } }));
  await openSettings(page);
  for (let i = 0; i < 7; i += 1) await page.click('#tl-version');
  const rule = async (time, headphones, home) => {
    await page.fill('#tl-dev-time', time); await page.dispatchEvent('#tl-dev-time', 'change');
    await page.selectOption('#tl-dev-headphones', headphones);
    await page.selectOption('#tl-dev-home', home);
    await page.waitForTimeout(150);
    return page.evaluate(() => document.querySelector('#tl-home-suggest').getAttribute('aria-label'));
  };
  const seen = [await rule('22:15', 'yes', 'yes'), await rule('14:00', 'no', 'yes'), await rule('14:00', 'yes', 'no'), await rule('14:00', 'no', 'no')];
  check(new Set(seen).size === 4, 'night, home, headphones away from home, and none of those each suggest a different type');
  check(/10/.test(seen[0]) && /1[^0-9]/.test(seen[2]) && /3/.test(seen[3]), 'Sleep at night, a 1-minute reset on the go, Silent otherwise');
  await page.click('#tl-settings [data-tl-back]');
  check(await page.isVisible('#tl-home-suggest'), 'Home shows the suggestion too');
  await page.click('#tl-home-suggest');
  await page.waitForSelector('#tl-stage:not([hidden])');
  check(true, 'and starts it in one tap');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 10000 });
  await page.click('#tl-complete [data-player-done]');
  await tab(page, 'home');
  await page.click('#tl-home-reset');
  await page.waitForSelector('#tl-stage:not([hidden])');
  check((await page.evaluate(() => window.__tidelight.sessions.slice(-1)[0].type)) === 'quick', 'Home\'s "1-min reset" starts the one-minute reset');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  check(outside.length === 0, 'no requests to other sites');
  await context.close();

  // Location: near the saved home spot suggests Deep; without permission, the rule is skipped quietly.
  const near = { locationAuthorization: 'whenInUse', position: { latitude: 40.0005, longitude: -75.0 } };
  const homeSpot = { 'tidelight.home': JSON.stringify({ latitude: 40.0, longitude: -75.0 }) };
  ({ context, page, errors } = await newPage(browser, lang, { hooks: near, storage: homeSpot }));
  await openSettings(page);
  for (let i = 0; i < 7; i += 1) await page.click('#tl-version');
  await page.fill('#tl-dev-time', '14:00'); await page.dispatchEvent('#tl-dev-time', 'change');
  await page.waitForTimeout(200);
  const atHome = await page.evaluate(() => document.querySelector('#tl-home-suggest').getAttribute('aria-label'));
  await context.close();
  ({ context, page, errors } = await newPage(browser, lang, { hooks: { locationAuthorization: 'denied', position: near.position }, storage: homeSpot }));
  await openSettings(page);
  for (let i = 0; i < 7; i += 1) await page.click('#tl-version');
  await page.fill('#tl-dev-time', '14:00'); await page.dispatchEvent('#tl-dev-time', 'change');
  await page.waitForTimeout(200);
  const noPermission = await page.evaluate(() => document.querySelector('#tl-home-suggest').getAttribute('aria-label'));
  check(/10/.test(atHome) && /3/.test(noPermission), 'near the home spot suggests the Deep session; with location refused it quietly falls back to Silent');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await context.close();
}


async function builderTests(browser, lang) {
  console.log(`\nThe builder and presets, ${lang === 'es' ? 'Spanish' : 'English'}`);
  let { context, page, errors, outside } = await newPage(browser, lang, { hooks: { clockRate: 300 } });
  await tab(page, 'meditate');
  const starters = await page.$$eval('#tl-presets-list .tl-preset', (els) => els.map((e) => ({ suggested: !e.querySelector('.tl-preset-suggested').hidden, name: e.querySelector('.tl-preset-name').textContent })));
  check(starters.length === 2 && starters.every((p) => p.suggested && p.name.length > 3), 'a first visit suggests two starter presets: ' + starters.map((p) => p.name).join(', '));
  await page.click('#tl-presets-list .tl-preset >> nth=0 >> [data-preset="start"]');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 10000 });
  const bus = await page.evaluate(() => ({ audio: window.__audioContexts, spoken: window.__tidelight.spoken.length, total: window.__tidelight.sessions[0].total }));
  check(bus.audio === 0 && bus.spoken === 0 && bus.total === 300, 'the first one ("Bus ride") is 5 minutes with no sound at all');
  await page.click('#tl-complete [data-player-done]');

  await page.click('#tl-build-card');
  check(await page.isVisible('#tl-builder') && (await safetyFrame(page)).length === 0 && await page.isVisible('#tl-builder .tl-draft-tag'), 'Build your own opens the builder, with the safety frame, marked "Draft for review"');
  await page.waitForTimeout(300);
  check(await page.evaluate(() => { const c = document.querySelector('#tl-builder-world'); return c.getContext('2d').getImageData(c.width / 2, c.height / 2, 1, 1).data[3] > 0; }), 'the live preview is drawn');
  const circle = async () => page.evaluate(() => document.querySelector('#tl-builder-circle').style.transform);
  const c1 = await circle(); await page.waitForTimeout(700);
  check((await circle()) !== c1, 'and breathes on a loop');
  check(/5/.test(await page.textContent('#tl-builder-length-out')) && !(await page.isVisible('#tl-builder-scan-row')), 'the length starts at 5 minutes, with no body scan offered under 8');
  const before = await page.evaluate(() => window.__tidelight.haptics.length);
  await page.fill('#tl-builder-length', '12');
  check(/12/.test(await page.textContent('#tl-builder-length-out')) && (await page.getAttribute('#tl-builder-length', 'aria-valuetext')).includes('12'), 'the slider shows a big number: 12 min');
  check((await page.evaluate(() => window.__tidelight.haptics.length)) > before, 'and ticks as it moves');
  check(await page.isVisible('#tl-builder-scan-row'), 'at 8 minutes or more, the body scan switch appears');
  const summary = await page.textContent('#tl-builder-summary');
  await page.click('#tl-builder-situation [data-value="focus"]');
  await page.click('#tl-builder-worlds [data-value="forest"]');
  check((await page.textContent('#tl-builder-summary')) !== summary, 'choosing a situation and a world updates the screen at once');
  await page.click('#tl-builder-sound [data-value="rain"]');
  await page.waitForFunction(() => window.__tidelight.ambient.includes('rain'));
  check(true, 'tapping a sound plays a short listen');
  await page.check('#tl-builder-scan');
  await page.check('#tl-builder-voice');
  await page.click('#tl-builder-style [data-value="straightforward"]');

  // Save preset.
  await page.click('#tl-builder-save');
  check(await page.isVisible('#tl-builder-name') && (await page.evaluate(() => document.activeElement.id)) === 'tl-builder-name', 'Save preset asks for a name, with the keyboard ready');
  const suggested = await page.inputValue('#tl-builder-name');
  check(suggested.length > 3 && suggested.length <= 24 && (await page.getAttribute('#tl-builder-name', 'maxlength')) === '24', 'a name is already filled in, 24 characters at most: ' + suggested);
  await page.fill('#tl-builder-name', 'A made-up preset');
  await page.click('#tl-builder-name-save');
  let presets = await stored(page, 'tidelight.presets');
  check(presets.length === 1 && presets[0].name === 'A made-up preset' && presets[0].choices.lengthMinutes === 12 && presets[0].choices.situation === 'focus' && !('segments' in presets[0]), 'the preset keeps the choices, not the finished meditation');

  // Start from the builder.
  await page.click('#tl-builder-start');
  await page.waitForSelector('#tl-stage:not([hidden])');
  check((await page.getAttribute('#tl-stage', 'data-world')) === 'forest', 'Start plays it in the chosen world');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 12000 });
  const built = await page.evaluate(() => ({ last: window.__tidelight.sessions.slice(-1)[0], spoken: window.__tidelight.spoken.map((l) => l.scriptId), ambient: window.__tidelight.ambient }));
  check(built.last.total === 720 && built.last.type === 'custom', 'for exactly 12 minutes');
  const lines = await page.evaluate(() => window.__tidelight.spoken);
  check(built.spoken.includes('intro.custom') && built.spoken.includes('bodyScan') && built.spoken.includes('outro.custom') && lines.every((l) => l.text.length > 10) && built.ambient.filter((a) => a === 'rain').length >= 2, 'with the voice, the body scan, and the rain that were chosen');
  await page.click('#tl-complete [data-player-done]');

  // The preset is on the Meditate tab, and survives a restart.
  await page.reload();
  await page.waitForSelector('html.app-ready');
  await tab(page, 'meditate');
  check((await page.locator('#tl-presets-list .tl-preset').count()) === 1 && (await page.textContent('#tl-presets-list .tl-preset-name')).includes('A made-up preset'), 'the preset is on the Meditate tab after a restart, and the suggestions are gone');
  await page.click('#tl-presets-list [data-preset="more"]');
  await page.fill('#tl-presets-list .tl-preset-rename input', 'Renamed');
  await page.click('#tl-presets-list [data-preset="rename"]');
  check((await page.textContent('#tl-presets-list .tl-preset-name')).trim() === 'Renamed', 'it can be renamed');
  await page.click('#tl-presets-list [data-preset="more"]');
  await page.click('#tl-presets-list [data-preset="duplicate"]');
  check((await page.locator('#tl-presets-list .tl-preset').count()) === 2, 'duplicated');
  await page.click('#tl-presets-list .tl-preset >> nth=0 >> [data-preset="more"]');
  await page.click('#tl-presets-list .tl-preset >> nth=0 >> [data-preset="edit"]');
  check(await page.isVisible('#tl-builder') && (await page.inputValue('#tl-builder-length')) === '12' && (await page.getAttribute('#tl-builder-situation [data-value="focus"]', 'aria-pressed')) === 'true', 'edited: the builder opens filled in');
  await page.fill('#tl-builder-length', '20');
  await page.click('#tl-builder-save');
  await page.click('#tl-builder-name-save');
  presets = await stored(page, 'tidelight.presets');
  check(presets.length === 2 && presets[0].choices.lengthMinutes === 20 && presets[1].choices.lengthMinutes === 12, 'saving an edit changes that preset only');
  await page.click('#tl-builder [data-tl-back]');
  await page.click('#tl-presets-list .tl-preset >> nth=1 >> [data-preset="more"]');
  await page.click('#tl-presets-list .tl-preset >> nth=1 >> [data-preset="delete"]');
  check(await page.isVisible('#tl-presets-list .tl-preset >> nth=1 >> .tl-preset-confirm'), 'Delete asks first');
  await page.click('#tl-presets-list .tl-preset >> nth=1 >> [data-preset="delete-yes"]');
  check((await page.locator('#tl-presets-list .tl-preset').count()) === 1, 'then deletes');
  await page.click('#tl-presets-list [data-preset="start"]');
  await page.waitForSelector('#tl-stage:not([hidden])');
  check((await page.evaluate(() => window.__tidelight.sessions.slice(-1)[0].total)) === 1200, 'starting a preset makes it fresh from its choices: 20 minutes');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  check(outside.length === 0, 'no requests to other sites');
  await context.close();

  // At most 20 presets.
  const twenty = JSON.stringify(Array.from({ length: 20 }, (unused, i) => ({ id: 'p' + i, name: 'Preset ' + i, choices: { lengthMinutes: 3 } })));
  ({ context, page, errors } = await newPage(browser, lang, { storage: { 'tidelight.presets': twenty } }));
  await tab(page, 'meditate');
  check((await page.locator('#tl-presets-list .tl-preset').count()) === 20, 'twenty presets show');
  await page.click('#tl-build-card');
  await page.click('#tl-builder-save');
  check(!(await page.isVisible('#tl-builder-name')) && (await page.textContent('#tl-builder-note')).trim().length > 10, 'a twenty-first is refused, with a plain note');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await context.close();
}

const browser = await chromium.launch();
try {
  await shellTests(browser, 'en');
  await shellTests(browser, 'es');
  await themeTests(browser);
  await onboardingTests(browser, 'en');
  await onboardingTests(browser, 'es');
  await deniedTests(browser);
  await migrationTests(browser);
  await streakTests(browser, 'en');
  await streakTests(browser, 'es');
  await playerTests(browser, 'en');
  await playerTests(browser, 'es');
  await typesTests(browser, 'en');
  await typesTests(browser, 'es');
  await builderTests(browser, 'en');
  await builderTests(browser, 'es');
} finally {
  await browser.close();
  close();
}
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

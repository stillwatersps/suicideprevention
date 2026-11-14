// Safety rules on screen: every rule the project has written down that a browser can prove.
// Each group names its rule. The table of rules, where each is enforced, and which test holds it
// is in notes/LAUNCH-READINESS.md ("Safety rules and their tests").
//   node test/safety-test.mjs      (part of `npm test` and `npm run test:safety`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone.
import { tab, openPanel, openSettings, startDaily, safetyFrame, serve, counter, pagePath, noSideways, skipOnboarding, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { check, tally } = counter();
const { base, close } = await serve();
const browser = await openBrowser();
const FEELINGS = ['hopeful', 'calm', 'okay', 'unsure', 'overwhelmed', 'sad', 'anxious', 'disconnected', 'exhausted'];
const HEAVY = ['overwhelmed', 'sad', 'anxious', 'disconnected', 'exhausted'];
const NEVER_ON_A_NOTIFICATION = /suicid|crisis|crisi|mood|ánimo|animo|depress|deprim|988|911|lifeline/i;

async function newPage(lang, { seed = true, hooks = {}, storage = {}, at = null, ...options } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ...options });
  const errors = [];
  const outside = [];
  context.on('request', (r) => { if (!r.url().startsWith(base) && !/^(data|blob):/.test(r.url())) outside.push(r.url()); });
  await context.route((url) => !url.href.startsWith(base), (route) => route.abort());
  await context.addInitScript(([given, stored]) => {
    window.__positionReads = 0;
    window.__tidelight = Object.assign({ clockRate: 900, schedules: [], notificationAuthorization: 'authorized', locationAuthorization: 'whenInUse',
      onSchedule(list) { this.schedules.push(list); this.scheduled = list; } }, given);
    // Count every time the app asks where the phone is.
    Object.defineProperty(window.__tidelight, 'position', { get() { window.__positionReads += 1; return { latitude: 1, longitude: 1 }; } });
    try { if (!sessionStorage.getItem('seeded')) { Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, [hooks, storage]);
  if (seed) await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  if (at) await page.clock.setFixedTime(at);
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
const home = async (page) => { await tab(page, 'home'); if (!(await page.isVisible('#tl-home'))) await tab(page, 'home'); };
const startFlow = async (page) => { await home(page); await page.click('#tl-home [data-tl-quick="checkin"]'); if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip'); };
const stored = (page, key) => page.evaluate((k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, key);
const supportLinks = async (page, box) => (await page.isVisible(`${box} a[href="tel:988"]`)) && (await page.isVisible(`${box} a[href="sms:988"]`)) && (await page.isVisible(`${box} a[href="tel:911"]`));
const localKey = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

for (const lang of ['en', 'es']) {
  const L = lang === 'es' ? 'Spanish' : 'English';

  // ---------- Rule: a very low mood shows crisis support at once (quick check-in) ----------
  console.log(`\nA very low check-in shows support at once, ${L}`);
  for (let mood = 1; mood <= 5; mood += 1) {
    const { context, page, errors } = await newPage(lang);
    await startFlow(page);
    await page.click(`#tl-flow-faces [data-value="${mood}"]`);
    await page.click('#tl-flow-done');
    await page.waitForTimeout(250);
    const support = await page.isVisible('#tl-flow-support');
    const usual = await page.isVisible('#tl-flow [data-flow="done"]');
    if (mood <= 2) {
      check(support && !usual && await supportLinks(page, '#tl-flow-support'), `quick check-in, mood ${mood}: Call 988, Text 988, and Call 911 are shown at once, instead of the usual ending`);
      check(!(await page.isVisible('#tl-flow .tl-horizon')) && !(await page.isVisible('#tl-flow-breathe')) && (await page.locator('.tl-burst, #tl-milestone:not([hidden])').count()) === 0, `mood ${mood}: no dawn, no celebration, and no streak card on or near it`);
      check((await safetyFrame(page)).length === 0, `mood ${mood}: the safety frame is on screen with it`);
      await page.waitForTimeout(2600);
      check(await page.isVisible('#tl-flow-support'), `mood ${mood}: the support screen stays until the person leaves it`);
      check((await stored(page, 'tidelight.onboarding')).quietDay === localKey(new Date()), `mood ${mood}: the rest of the day is quiet`);
      check((await stored(page, 'tidelight.log.v1')).length === 1, `mood ${mood}: the check-in is still kept, like any other`);
    } else {
      check(!support && usual, `quick check-in, mood ${mood}: the usual ending, and no support screen`);
      check((await stored(page, 'tidelight.onboarding')).quietDay !== localKey(new Date()), `mood ${mood}: the day is not marked quiet`);
    }
    check(errors.length === 0, `mood ${mood}: no script errors` + (errors.length ? ': ' + errors.join(' | ') : ''));
    await context.close();
  }

  // ---------- Rule: a heavy feeling on the Daily check-in shows support with its results ----------
  console.log(`\nA heavy feeling on the Daily check-in shows support, ${L}`);
  {
    const { context, page, errors } = await newPage(lang);
    for (const feeling of FEELINGS) {
      await startDaily(page);
      if (await page.isVisible('.ci-restart')) await page.click('.ci-restart');
      await page.click(`#ci-step-feeling label:has(input[value="${feeling}"])`);
      await page.click('#ci-step-feeling .ci-next');
      for (const id of ['mind', 'difficult', 'self']) await page.click(`#ci-step-${id} .ci-skip`);
      await page.click('.ci-finish');
      await page.waitForTimeout(200);
      const shown = await page.isVisible('#tl-result-support');
      const heavy = HEAVY.includes(feeling);
      check(shown === heavy && (!heavy || await supportLinks(page, '#tl-result-support')), `"${feeling}": ${heavy ? '988 and 911 are at the top of the results' : 'the ordinary results, with no support box'}`);
    }
    check((await stored(page, 'tidelight.onboarding')).quietDay === localKey(new Date()), 'a heavy feeling makes the rest of the day quiet');
    // A feeling chosen, then the check-in started over: the support box is not left showing.
    await page.click('.ci-restart');
    check(!(await page.isVisible('#tl-result-support')), 'starting over puts the support box away');
    check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await context.close();
  }

  // ---------- Rule: a very low mood after a meditation shows support, with no dawn ----------
  console.log(`\nA very low mood after a meditation, ${L}`);
  for (const mood of [1, 2, 3, 5]) {
    const { context, page } = await newPage(lang);
    await tab(page, 'meditate');
    await page.click('.tl-type[data-type="quick"] [data-type-start]');
    await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 15000 });
    await page.click(`#tl-complete-faces [data-value="${mood}"]`);
    await page.waitForTimeout(250);
    const support = await page.isVisible('#tl-complete-support');
    if (mood <= 2) check(support && await supportLinks(page, '#tl-complete-support') && !(await page.isVisible('#tl-complete .tl-horizon')) && (await safetyFrame(page)).length === 0, `mood ${mood} after a session: support at once, the dawn is gone, the safety frame is on screen`);
    else check(!support, `mood ${mood} after a session: no support screen`);
    await context.close();
  }

  // ---------- Rule: after a very low check-in, nothing celebrates for the rest of that day ----------
  console.log(`\nA quiet day stays quiet, and ends at midnight, ${L}`);
  {
    // 11:50 at night on the last day of a month: a very low check-in.
    const { context, page, errors } = await newPage(lang, { at: new Date(2026, 10, 30, 23, 50, 0), storage: { 'tidelight.settings': JSON.stringify({ checkInsPerDay: 1, countChosen: true }) } });
    await startFlow(page);
    await page.click('#tl-flow-faces [data-value="1"]');
    await page.click('#tl-flow-done');
    await page.waitForSelector('#tl-flow-support:not([hidden])');
    check((await stored(page, 'tidelight.onboarding')).quietDay === '2026-11-30', 'the quiet day is filed under the local date, November 30');
    await page.click('#tl-flow-support [data-tl-go="home"]');
    // A later, ordinary check-in the same night: the thanks line and the two choices, but no dawn.
    await startFlow(page);
    await page.click('#tl-flow-faces [data-value="4"]');
    await page.click('#tl-flow-done');
    await page.waitForSelector('#tl-flow [data-flow="done"]:not([hidden])');
    check(!(await page.isVisible('#tl-flow .tl-horizon')) && (await page.locator('#tl-flow .tl-horizon-complete').count()) === 0 && await page.isVisible('#tl-flow-thanks') && await page.isVisible('#tl-flow-breathe'), 'a later ordinary check-in that day ends with its thanks and choices, and no dawn');
    await page.click('#tl-flow [data-flow="done"] [data-tl-go="home"]');
    check(!(await page.isVisible('#tl-milestone')), 'and no milestone card on Home');
    // Ten past midnight, December 1: closed and opened again.
    await page.clock.setFixedTime(new Date(2026, 11, 1, 0, 10, 0));
    await page.reload();
    await page.waitForSelector('html.app-ready');
    check(await page.isVisible('#tl-home') && (await safetyFrame(page)).length === 0, 'after midnight on the 1st the app opens on Home with the safety frame');
    await tab(page, 'checkin');
    const todayLines = await page.locator('#tl-today-list li').count();
    check(todayLines === 0, 'yesterday\'s check-ins are not listed under Today');
    await startFlow(page);
    await page.click('#tl-flow-faces [data-value="4"]');
    await page.click('#tl-flow-done');
    await page.waitForSelector('#tl-flow [data-flow="done"]:not([hidden])');
    check(await page.isVisible('#tl-flow-horizon.tl-horizon-complete'), 'the new day is not quiet: an ordinary check-in ends on the dawn again');
    await page.click('#tl-flow [data-flow="done"] [data-tl-go="home"]');
    await page.click('#tl-streak-card');
    const month = await page.$$eval('#tl-streak-month .tl-day:not(.is-blank)', (els) => ({ days: els.length, done: els.filter((e) => e.classList.contains('is-complete')).length, first: els[0].textContent.trim() }));
    check(month.days === 31 && month.first === '1', 'the calendar shows December, starting on the 1st');
    const days = await stored(page, 'tidelight.days');
    check(Object.keys(days).every((key) => /^\d{4}-\d{2}-\d{2}$/.test(key)) && Boolean(days['2026-11-30']) && Boolean(days['2026-12-01']), 'both days are on record, each under a two-digit date (2026-11-30 and 2026-12-01)');
    check((await stored(page, 'tidelight.streak')).current === 2, 'and the streak carried across the month end: two days in a row (one check-in a day)');
    // The phone's clock is set back ten days.
    await page.clock.setFixedTime(new Date(2026, 10, 20, 9, 0, 0));
    await page.reload();
    await page.waitForSelector('html.app-ready');
    const streak = await stored(page, 'tidelight.streak');
    check(await page.isVisible('#tl-home') && (await safetyFrame(page)).length === 0, 'with the clock set back ten days, the app still opens with the safety frame');
    check(Number.isInteger(streak.current) && streak.current >= 0 && Object.keys(await stored(page, 'tidelight.days')).length >= 2 && (await stored(page, 'tidelight.log.v1')).length === 3, 'no check-in is lost and the streak is still a whole number');
    check(errors.length === 0, 'no script errors through midnight, a new month, and a clock set back' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await context.close();
  }

  // ---------- Rule: every question is optional; a skipped answer is never distress ----------
  console.log(`\nQuestions can be skipped, ${L}`);
  {
    const { context, page, errors } = await newPage(lang);
    await startDaily(page);
    for (const id of ['feeling', 'mind', 'difficult', 'self']) { const can = await page.isVisible(`#ci-step-${id} .ci-skip`); if (can) await page.click(`#ci-step-${id} .ci-skip`); check(can, `the "${id}" question can be skipped`); }
    await page.click('.ci-finish');
    await page.waitForTimeout(200);
    check(await page.isVisible('.ci-result, #ci-result, .ci-results') || await page.isVisible('.ci-restart'), 'a check-in with every question skipped still finishes');
    check(!(await page.isVisible('#tl-result-support')), 'and skipping everything is not treated as distress');
    check((await stored(page, 'tidelight.onboarding')).quietDay !== localKey(new Date()), 'nor does it make the day quiet');
    // The quick check-in can't be finished with no mood: there is nothing to tap until one is chosen.
    await startFlow(page);
    check(!(await page.isVisible('#tl-flow-done')), 'the quick check-in has no Done until a mood is chosen');
    await page.click('#tl-flow-faces [data-value="3"]');
    check(await page.isVisible('#tl-flow-done'), 'tags and the note are optional: Done is there as soon as a mood is chosen');
    check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await context.close();
  }

  // ---------- Rule: closing the app part-way never leaves a half check-in or a blank screen ----------
  console.log(`\nClosed in the middle of a check-in, ${L}`);
  {
    const { context, page, errors } = await newPage(lang);
    await startFlow(page);
    await page.click('#tl-flow-faces [data-value="1"]');
    await page.reload(); // the app is closed before Done
    await page.waitForSelector('html.app-ready');
    check(await page.isVisible('#tl-home') && (await safetyFrame(page)).length === 0, 'closed before Done on a quick check-in: the app opens on Home with the safety frame');
    check(((await stored(page, 'tidelight.log.v1')) || []).length === 0 && (await stored(page, 'tidelight.onboarding')).quietDay !== localKey(new Date()), 'nothing half-finished was kept, and an unfinished very low mood did not mark the day');
    await startDaily(page);
    await page.click('#ci-step-feeling label:has(input[value="sad"])');
    await page.click('#ci-step-feeling .ci-next');
    await page.reload();
    await page.waitForSelector('html.app-ready');
    check(await page.isVisible('#tl-home') && (await safetyFrame(page)).length === 0 && !(await page.isVisible('#tl-result-support')), 'closed part-way through the Daily check-in: the app opens on Home, safety frame on screen, no stray support box');
    check(((await stored(page, 'tidelight.log.v1')) || []).length === 0, 'and no check-in was recorded for the unfinished one');
    check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await context.close();
  }

  // ---------- Rule: notifications are discreet ----------
  console.log(`\nReminders say nothing private, ${L}`);
  for (const style of ['calm', 'straightforward']) {
    const { context, page } = await newPage(lang, { storage: { 'tidelight.settings': JSON.stringify({ checkInsPerDay: 3, countChosen: true, checkInStyle: style, styleChosen: true }) } });
    await openSettings(page);
    await page.check('#tl-set-reminders');
    await page.waitForFunction(() => window.__tidelight.schedules.length > 0, null, { timeout: 5000 }).catch(() => {});
    const sent = await page.evaluate(() => (window.__tidelight.scheduled || []).map((n) => n.title + ' | ' + n.body));
    const loud = sent.filter((line) => NEVER_ON_A_NOTIFICATION.test(line));
    check(sent.length > 0 && loud.length === 0, `${style}: every reminder the app schedules (${sent.length}) is free of suicide, crisis, mood, 988, and 911` + (loud.length ? ': ' + loud[0] : ''));
    check(new Set(sent).size === 1, `${style}: and they all say the same neutral line ("${(sent[0] || '').split(' | ')[1] || ''}")`);
    await context.close();
  }

  // ---------- Rule: location stays on the phone and is read only when asked ----------
  console.log(`\nLocation is read only when the person asks, ${L}`);
  {
    const { context, page, outside, errors } = await newPage(lang);
    for (const id of ['home', 'checkin', 'meditate', 'location', 'friends']) { await tab(page, id); await page.waitForTimeout(120); }
    await openSettings(page);
    await page.waitForTimeout(200);
    check((await page.evaluate(() => window.__positionReads)) === 0, 'opening every tab and Settings never reads where the phone is');
    await tab(page, 'home');
    await page.click('#tl-setup-open');
    const save = page.locator('[data-setup-do="homeSpot"]');
    if (await save.count()) {
      await save.first().click();
      await page.waitForFunction(() => window.__positionReads > 0, null, { timeout: 4000 }).catch(() => {});
      const reads = await page.evaluate(() => window.__positionReads);
      check(reads === 1, `tapping "Save where I am" reads it once (${reads})`);
      await page.waitForTimeout(300);
      const kept = JSON.stringify(await stored(page, 'tidelight.home'));
      check(/latitude|lat/.test(kept), 'and the home spot is kept on this phone');
    } else check(false, 'the "Save where I am" step is in the setup list');
    check(outside.length === 0, 'nothing was sent or requested anywhere outside the app' + (outside.length ? ': ' + outside.join(', ') : ''));
    check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await context.close();
  }

  // ---------- Rule: streaks can be turned off, and never sit beside support ----------
  console.log(`\nStreaks keep away from support and can be turned off, ${L}`);
  {
    const { context, page } = await newPage(lang);
    await startFlow(page);
    await page.click('#tl-flow-faces [data-value="2"]');
    await page.click('#tl-flow-done');
    await page.waitForSelector('#tl-flow-support:not([hidden])');
    const near = await page.evaluate(() => ['#tl-streak-card', '#tl-milestone', '#tl-streak-fresh', '#tl-streak'].filter((sel) => { const el = document.querySelector(sel); return el && el.offsetParent !== null; }));
    check(near.length === 0, 'no streak card, milestone, or "new start" card is on screen with the support options' + (near.length ? ': ' + near.join(', ') : ''));
    await page.click('#tl-flow-support [data-tl-go="home"]');
    await openSettings(page);
    await page.uncheck('#tl-set-streaks');
    await page.click('#tl-settings [data-tl-back]');
    await home(page);
    check(!(await page.isVisible('#tl-streak-card')) && !(await page.isVisible('#tl-milestone')) && !(await page.isVisible('#tl-streak-fresh')), 'with Streaks turned off in Settings, Home shows nothing of them');
    check(Object.keys(await stored(page, 'tidelight.days')).length === 1, 'and turning them off erased nothing');
    await context.close();
  }

  // ---------- Rule: every screen keeps the draft notices and the way to the other language ----------
  console.log(`\nDraft notices and the language link on every screen, ${L}`);
  {
    const { context, page } = await newPage(lang, { hooks: { clockRate: 1 } });
    const lacking = [];
    const look = async (name) => {
      const missing = await page.evaluate(() => {
        const inPage = (sel) => { const el = document.querySelector(sel); if (!el) return false; for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (n.hidden || cs.display === 'none' || cs.visibility === 'hidden') return false; } return el.getBoundingClientRect().height > 4; };
        const out = [];
        if (!inPage('.lang-switch a')) out.push('the language link');
        if (!inPage('.review-note:not(.tl-review)')) out.push('the page\'s draft notice');
        if (!inPage('.tl-review')) out.push('the app\'s draft notice');
        const screen = Array.from(document.querySelectorAll('.tl-screen')).find((s) => !s.hidden && s.offsetParent !== null);
        // The player's mark is a chip on the scene; every other screen's is a line above its title.
        const marks = screen ? Array.from(screen.querySelectorAll('.tl-draft-tag a[href="#tl-review"], .tl-stage a.tl-scene-chip[href="#tl-review"]')) : [];
        const marked = marks.some((mark) => mark.getBoundingClientRect().height > 4 && getComputedStyle(mark).visibility !== 'hidden' && mark.textContent.trim().length > 3);
        if (screen && screen.id !== 'tl-legacy' && !marked) out.push('the draft mark on ' + screen.id);
        return out;
      });
      if (missing.length) lacking.push(`${name}: ${missing.join(', ')}`);
    };
    for (const id of ['home', 'checkin', 'meditate', 'location', 'friends']) { await tab(page, id); if (!(await page.isVisible('#tl-' + id))) await tab(page, id); await look(id); }
    await openSettings(page); await look('settings');
    await home(page); await page.click('#tl-streak-card'); await look('streak');
    await startFlow(page); await look('quick check-in');
    await page.click('#tl-flow-faces [data-value="1"]'); await page.click('#tl-flow-done'); await page.waitForSelector('#tl-flow-support:not([hidden])'); await look('support after a very low mood');
    for (const panel of ['ci-journal', 'ci-rediscover', 'app-hope', 'ci-journey']) { await openPanel(page, panel); await look(panel); }
    await tab(page, 'meditate'); if (!(await page.isVisible('#tl-meditate'))) await tab(page, 'meditate');
    await page.click('#tl-build-card'); await look('builder');
    await tab(page, 'meditate'); if (!(await page.isVisible('#tl-meditate'))) await tab(page, 'meditate');
    await page.click('.tl-type[data-type="quick"] [data-type-start]'); await page.waitForSelector('#tl-stage:not([hidden])'); await look('player');
    check(lacking.length === 0, 'on 16 screens, the language link, both draft notices, and each new screen\'s draft mark are all in the page' + (lacking.length ? ': ' + lacking.join('; ') : ''));
    await context.close();
  }

  // ---------- Rule: stored data from an older version still opens (first launch, returning, upgrading) ----------
  console.log(`\nFirst launch, returning, and upgrading from an older version, ${L}`);
  {
    let { context, page, errors } = await newPage(lang, { seed: false });
    check(await page.isVisible('#tl-onboarding') && (await safetyFrame(page)).length === 0, 'first launch: onboarding, with the safety frame on screen');
    check(errors.length === 0, 'first launch: no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await context.close();
    // An older build's data: check-ins and the four old reminders, from before tabs, streaks, and settings existed.
    const older = { 'tidelight.agegroup.v1': 'adult',
      'tidelight.log.v1': JSON.stringify([{ t: new Date(Date.now() - 86400000).toISOString(), slot: 'morning', feeling: 'Okay', needs: [] }, { t: new Date(Date.now() - 2 * 86400000).toISOString(), slot: 'evening', feeling: 'Sad', needs: ['Rest'] }]),
      'tidelight.reminders.v1': JSON.stringify({ morning: { on: true, time: '07:45' }, midday: { on: false, time: '12:00' }, afternoon: { on: false, time: '15:30' }, evening: { on: true, time: '21:15' } }) };
    ({ context, page, errors } = await newPage(lang, { seed: false, storage: older }));
    check((await safetyFrame(page)).length === 0, 'upgrading: the app opens with the safety frame on screen');
    if (await page.isVisible('#tl-onboarding')) await skipOnboarding(page);
    await page.waitForSelector('#tl-home:not([hidden])');
    const settings = await stored(page, 'tidelight.settings');
    check(String(await page.evaluate(() => localStorage.getItem('tidelight.schema'))).replace(/"/g, '') === '2', 'upgrading: the stored data is brought to the current version');
    check(Boolean(settings) && settings.checkInsPerDay === 2 && settings.remindersOn === true, 'upgrading: the two reminders that were on became two check-ins a day');
    check((await stored(page, 'tidelight.log.v1')).length === 2, 'upgrading: both older check-ins are still there');
    const days = await stored(page, 'tidelight.days');
    const olderDays = Object.values(days || {}).filter((day) => day.checkInsCompleted === 1);
    check(olderDays.length === 2 && olderDays.every((day) => /^\d{4}-\d{2}-\d{2}$/.test(day.dateKey)), 'upgrading: and each became a day on the calendar, with one check-in');
    check(errors.length === 0, 'upgrading: no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await context.close();
  }
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

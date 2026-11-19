// "Ten minutes at a time": five small steps, two minutes each. Silent, and it keeps nothing.
//   node test/ride-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone. No call, text, or chat is
// ever started: links to 988 and 911 are only checked, never tapped.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, openSettings, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');

async function newPage(browser, lang, { hooks = {}, storage = {}, colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(([given, stored]) => {
    window.__tidelight = Object.assign({ shared: [], clockRate: 1 }, JSON.parse(JSON.stringify(given)));
    try { if (!sessionStorage.getItem('seeded')) { Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, [hooks, storage]);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
async function openRide(page) {
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-ride');
  await page.waitForSelector('#tl-ride:not([hidden])');
}
const setRate = (page, rate) => page.evaluate((r) => { window.__tidelight.clockRate = r; }, rate);
const faces = (page) => page.evaluate(() => ({ start: !document.getElementById('tl-ride-start-box').hidden, step: !document.getElementById('tl-ride-step-box').hidden, end: !document.getElementById('tl-ride-end-box').hidden }));
const step = (page) => page.evaluate(() => ({ count: document.getElementById('tl-ride-count').textContent, words: document.getElementById('tl-ride-step').textContent, time: document.getElementById('tl-ride-time').textContent, next: document.getElementById('tl-ride-next').textContent, focus: document.activeElement.id }));
const crisis = (page) => page.$$eval('#tl-ride .tl-support-actions a', (links) => links.filter((a) => a.getClientRects().length).map((a) => a.getAttribute('href')));
const everything = (page) => page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])));

const browser = await openBrowser();

for (const lang of ['en', 'es']) {
  console.log(`\nTen minutes at a time, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang, { hooks: { haptics: [] } });
  await page.evaluate(() => { window.__buzz = []; window.__tidelight.onHaptic = (h) => window.__buzz.push(h); });

  // ---- the way in, and the screen before it starts ----
  await tab(page, 'checkin');
  check(await page.isVisible('#tl-checkin-ride'), 'the Check-in tab has a row for it');
  await openRide(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-ride .tl-draft-tag'), 'the screen is marked "Draft for review"');
  const before = await faces(page);
  check(before.start && !before.step && !before.end, 'before it starts: one button, no clock');
  const links = await crisis(page);
  check(links.length === 3 && links[0] === 'tel:988' && links[1].startsWith('sms:988') && links[2] === 'tel:911', 'Call 988, Text 988, and Call 911 are on the screen itself');
  const kept = await everything(page);

  // ---- the five steps ----
  await page.click('#tl-ride-start');
  await page.waitForSelector('#tl-ride-step-box:not([hidden])');
  const one = await step(page);
  check(/1/.test(one.count) && /5/.test(one.count) && one.words.length > 20, 'it starts at step 1 of 5, with the step\'s words: ' + one.words.slice(0, 40));
  check(one.time === '2:00' || one.time === '1:59', 'the step has two minutes on its clock (' + one.time + ')');
  check(one.focus === 'tl-ride-step', 'a screen reader is taken to the step\'s words, and the ticking clock is not read out');
  check((await crisis(page)).length === 3 && (await safetyFrame(page)).length === 0, 'the crisis buttons and the safety frame stay while it runs');
  await page.waitForTimeout(1300);
  const ticking = (await step(page)).time;
  check(ticking === '1:58' || ticking === '1:59' || ticking === '1:57', 'the clock counts down (' + ticking + ')');
  const seen = [one.words];
  for (let n = 2; n <= 5; n += 1) {
    await page.click('#tl-ride-next');
    await page.waitForTimeout(350);
    const now = await step(page);
    seen.push(now.words);
    if (n === 5) check(new RegExp(String(n)).test(now.count) && now.next.trim().length > 0 && now.next !== one.next, 'the last step\'s button says it finishes: "' + now.next.trim() + '"');
  }
  check(new Set(seen).size === 5 && seen.every((w) => w.length > 20), '"Next step" goes through five different steps');
  const buzz = await page.evaluate(() => window.__buzz.map((h) => (typeof h === 'string' ? h : h.name || h.kind || h.type || JSON.stringify(h))));
  check(!buzz.some((b) => /success|celebrat|milestone/.test(b)), 'no step sets off a celebration' + (buzz.length ? ' (felt: ' + [...new Set(buzz)].join(', ') + ')' : ''));

  // ---- time moving a step on by itself, and the end ----
  await setRate(page, 120); // two minutes in one second
  await page.waitForSelector('#tl-ride-end-box:not([hidden])', { timeout: 6000 });
  await setRate(page, 1);
  const end = await page.evaluate(() => ({ passed: !document.getElementById('tl-ride-passed').hidden, focus: document.activeElement.id, easier: document.getElementById('tl-ride-easier-note').hidden, hard: document.getElementById('tl-ride-hard-note').hidden }));
  check(end.passed && end.focus === 'tl-ride-end-title' && end.easier && end.hard, 'when the time has passed it says so and asks how things are, with no answer chosen for the person');

  // ---- "Still hard": support at once ----
  await page.click('#tl-ride-hard');
  await page.waitForTimeout(300);
  const hard = await page.evaluate(() => {
    const note = document.getElementById('tl-ride-hard-note');
    const call = document.querySelector('#tl-ride .tl-support-actions a[href="tel:988"]').getBoundingClientRect();
    return { shown: !note.hidden, callOnScreen: call.top >= 0 && call.bottom <= window.innerHeight, quiet: JSON.parse(localStorage.getItem('tidelight.onboarding') || '{}').quietDay || '' };
  });
  check(hard.shown && hard.callOnScreen, '"Still hard" shows that help is there, with Call 988 on screen without scrolling');
  check(hard.quiet.length === 10, 'and the day is made quiet, so nothing celebrates afterwards');
  await page.click('#tl-ride-easier');
  const easier = await page.evaluate(() => ({ easier: !document.getElementById('tl-ride-easier-note').hidden, hard: !document.getElementById('tl-ride-hard-note').hidden }));
  check(easier.easier && !easier.hard, '"A little easier" says a plain line, with no celebration');
  check(await page.evaluate(() => document.getElementById('tl-ride-easier-whole').getClientRects().length > 0), 'after the whole ten minutes, that line says so');

  // ---- stopping early, and starting again ----
  await page.click('#tl-ride-again');
  check((await faces(page)).start, '"Start again" goes back to the beginning');
  await page.click('#tl-ride-start');
  await page.waitForSelector('#tl-ride-step-box:not([hidden])');
  await page.click('#tl-ride-stop');
  const stopped = await page.evaluate(() => ({ end: !document.getElementById('tl-ride-end-box').hidden, passed: !document.getElementById('tl-ride-passed').hidden }));
  check(stopped.end && !stopped.passed, '"Stop here" asks how things are, without saying ten minutes passed');
  await page.click('#tl-ride-easier');
  const early = await page.evaluate(() => ({ note: document.getElementById('tl-ride-easier-note').innerText.trim(), whole: document.getElementById('tl-ride-easier-whole').getClientRects().length > 0 }));
  check(!early.whole && early.note.length > 10 && !/ten minutes|diez minutos/i.test(early.note), `stopped early, "A little easier" doesn't say ten minutes were got through (found in the Simulator): "${early.note}"`);
  await page.click('#tl-ride [data-tl-back]');
  await openRide(page);
  check((await faces(page)).start, 'leaving the screen and coming back starts from the beginning');

  // ---- it keeps nothing ----
  const after = JSON.parse(await everything(page)).filter(([k]) => k !== 'tidelight.onboarding');
  const beforeKeys = JSON.parse(kept).filter(([k]) => k !== 'tidelight.onboarding');
  // (Any tap makes the app save the older check-in page's own state, tidelight.checkin.v1; that is not about this screen.)
  const differ = after.filter(([k, v]) => k !== 'tidelight.checkin.v1' && !beforeKeys.some(([bk, bv]) => bk === k && bv === v)).map(([k]) => k);
  check(differ.length === 0, 'nothing about it was stored (only the quiet day, from "Still hard")' + (differ.length ? ': ' + differ.join(', ') : ''));

  // ---- accessibility ----
  await page.click('#tl-ride-start');
  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-ride', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding while a step is showing' + (audit.length ? ': ' + audit.join(', ') : ''));
  const targets = await page.$$eval('#tl-ride button, #tl-ride .tl-support-actions a', (els) => els.filter((el) => el.getClientRects().length).map((el) => Math.round(el.getBoundingClientRect().height)));
  check(targets.every((h) => h >= 44), 'every button on it is at least 44 points tall');
  await page.click('#tl-ride-stop');

  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}

console.log('\nTen minutes and the rest of the app');
{
  // From the support step after a very low check-in, and back to it.
  const { context, page } = await newPage(browser, 'en');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
  const order = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-flow-support a, #tl-flow-support button')).map((el) => el.getAttribute('href') || el.getAttribute('data-tl-push') || 'other'));
  check(order.indexOf('ride') > order.indexOf('tel:911') && order.indexOf('tel:988') === 0, 'the support step offers it below Call 988, Text 988, and Call 911');
  await page.click('#tl-flow-support [data-tl-push="ride"]');
  await page.waitForSelector('#tl-ride:not([hidden])');
  await page.click('#tl-ride [data-tl-back]');
  await page.waitForTimeout(400);
  check(await page.evaluate(() => !document.getElementById('tl-flow-support').hidden && document.getElementById('tl-flow-support').getClientRects().length > 0), 'Back returns to the support step, not to a new check-in');
  await context.close();
}
{
  // Quick exit while it runs: back on Home, and the clock is not running behind it.
  const { context, page } = await newPage(browser, 'en');
  await openRide(page);
  await page.click('#tl-ride-start');
  await page.evaluate(() => { document.documentElement.hidden = true; window.dispatchEvent(new Event('pageshow')); });
  await page.waitForTimeout(300);
  check(await page.isVisible('#tl-home'), 'after Quick exit the app is on Home');
  await openRide(page);
  check((await faces(page)).start, 'and the ten minutes are back at the beginning');
  await context.close();
}
{
  // Dark, a small phone, and the phone's largest text.
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openRide(page);
  await page.click('#tl-ride-start');
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-ride'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-ride', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

// "A reminder to check in on someone": one reminder, at a time the person picks. The phone's
// reminder never shows a name.
//   node test/follow-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with a stand-in for the phone's notifications. No notification is shown.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const KEY = 'tidelight.follow.v1';
const local = (d) => { const two = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}T${two(d.getHours())}:${two(d.getMinutes())}`; };
const inDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(9, 30, 0, 0); return d; };

async function newPage(browser, lang, { colorScheme = 'light', viewport = { width: 390, height: 844 }, grant = true } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript((allow) => {
    window.__tidelight = { clockRate: 1, notificationAuthorization: 'notDetermined', grantNotifications: allow, calls: [], onSchedule(list, cancel) { this.calls.push({ list, cancel }); } };
  }, grant);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
async function openIt(page) {
  await tab(page, 'friends');
  if (!(await page.isVisible('#tl-friends'))) await tab(page, 'friends');
  await page.click('#tl-friends-follow');
  await page.waitForSelector('#tl-follow:not([hidden])');
}
const status = (page) => page.evaluate(() => { const s = document.getElementById('tl-follow-status'); return s.hidden ? '' : s.textContent.trim(); });
const stored = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), KEY);
// What the phone was asked to do for this reminder's id (298), newest last.
const asked = (page) => page.evaluate(() => window.__tidelight.calls.filter((c) => c.cancel.includes(298) && c.cancel.length === 1).map((c) => c.list));
const set = async (page, who, when) => { await page.fill('#tl-follow-who', who); await page.fill('#tl-follow-when', when); await page.click('#tl-follow-set'); await page.waitForTimeout(250); };

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nA reminder to check in on someone, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await tab(page, 'friends');
  check(await page.isVisible('#tl-friends-follow'), 'the Friends tab has a row for it');
  await openIt(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-follow .tl-draft-tag'), 'the screen is marked "Draft for review"');
  const seen = await page.evaluate(() => ({ sample: document.querySelector('#tl-follow [data-once-sample]').textContent, discreet: document.getElementById('tl-follow-discreet').getBoundingClientRect().top < document.getElementById('tl-follow-who').getBoundingClientRect().top, labels: ['tl-follow-who', 'tl-follow-when'].every((id) => (document.getElementById(id).labels[0] || {}).textContent), sizes: ['tl-follow-who', 'tl-follow-when', 'tl-follow-set'].map((id) => Math.round(document.getElementById(id).getBoundingClientRect().height)), removeShown: !document.getElementById('tl-follow-remove').hidden }));
  check(seen.sample.length > 8 && seen.discreet, `it says, before the fields, the only words the reminder will show: "${seen.sample}"`);
  check(seen.labels && seen.sizes.every((h) => h >= 44) && !seen.removeShown, 'two labelled fields and a full-size button; nothing to remove yet');

  const yesterday = inDays(-1);
  await set(page, 'A made-up name', local(yesterday));
  check((await asked(page)).length === 0 && (await stored(page)) === null && (await status(page)).length > 15, `a time that has passed is refused, with a reason: "${await status(page)}"`);
  await set(page, 'A made-up name', '');
  check((await asked(page)).length === 0 && (await stored(page)) === null, 'so is no time at all');

  const when = inDays(3);
  await set(page, '  A made-up   name ', local(when));
  const calls = await asked(page);
  const last = calls[calls.length - 1] || [];
  check(calls.length === 1 && last.length === 1 && last[0].id === 298 && new Date(last[0].at).getTime() === when.getTime(), 'a time three days ahead sets one reminder on the phone, for exactly that time');
  check(last[0] && last[0].title === 'Tidelight' && last[0].body === seen.sample && !/made-up/i.test(JSON.stringify(last)), `the phone is given only "Tidelight" and "${seen.sample}": never the name`);
  const kept = await stored(page);
  check(kept && kept.who === 'A made-up name' && new Date(kept.at).getTime() === when.getTime(), 'the name and the time are kept on this phone');
  check((await status(page)).length > 10 && (await page.isVisible('#tl-follow-remove')), `the screen says when it is set for: "${await status(page)}"`);
  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-follow', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the screen' + (audit.length ? ': ' + audit.join(', ') : ''));

  await page.reload();
  await page.waitForSelector('html.app-ready');
  await openIt(page);
  check((await page.inputValue('#tl-follow-who')) === 'A made-up name' && (await page.inputValue('#tl-follow-when')) === local(when), 'after the app is closed and opened, the screen shows the name and the time again');
  await page.click('#tl-follow-remove');
  await page.waitForTimeout(250);
  const after = await asked(page);
  check(after.length >= 1 && after[after.length - 1].length === 0 && JSON.stringify(await stored(page)) === '{"who":"","at":""}' && (await page.inputValue('#tl-follow-who')) === '', '"Remove the reminder" cancels it on the phone and clears the name and the time');

  await set(page, 'Another made-up name', local(inDays(5)));
  await page.evaluate(() => window.dispatchEvent(new Event('tidelight-erased')));
  await page.waitForTimeout(400);
  const erased = await asked(page);
  check(erased[erased.length - 1].length === 0 && (await page.evaluate((k) => localStorage.getItem(k), KEY)) === null && (await page.inputValue('#tl-follow-who')) === '', 'Delete everything removes the name, the time, and the phone\'s reminder');
  await page.click('#tl-follow [data-tl-push="helping"]');
  check(await page.isVisible('#tl-helping'), 'the screen leads on to "Helping someone you\'re worried about"');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'en', { grant: false });
  await openIt(page);
  await set(page, 'A made-up name', local(inDays(2)));
  check((await stored(page)) === null && /notifications/i.test(await status(page)), `when the phone refuses notifications, nothing is kept and the screen says why: "${await status(page)}"`);
  await context.close();
}
{
  // A time that has passed since it was set.
  const { context, page } = await newPage(browser, 'en');
  await page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ who: 'A made-up name', at: new Date(Date.now() - 3600000).toISOString() })), KEY);
  await page.reload();
  await page.waitForSelector('html.app-ready');
  await openIt(page);
  check((await page.inputValue('#tl-follow-when')) === '' && (await page.inputValue('#tl-follow-who')) === 'A made-up name' && (await status(page)).length > 10, `once the time has passed, the screen says so and the name stays for another: "${await status(page)}"`);
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openIt(page);
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-follow'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-follow', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with a stand-in for the phone's notifications; not a phone.`);
process.exit(tally.failures ? 1 : 0);

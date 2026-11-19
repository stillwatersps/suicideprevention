// "Care near me": a link that opens the phone's own maps at emergency rooms. The app reads no
// location and learns nothing.
//   node test/nearby-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone. No call, text, or chat is
// ever started, and the maps link is only read, never opened.
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
    // Any read of the phone's location is counted: there must be none.
    window.__located = 0;
    try { const geo = navigator.geolocation; ['getCurrentPosition', 'watchPosition'].forEach((fn) => { const real = geo[fn].bind(geo); geo[fn] = (...a) => { window.__located += 1; return real(...a); }; }); } catch (e) { /* no geolocation here */ }
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
const QUERY = { en: 'emergency+room', es: 'sala+de+emergencias' };
async function openNearby(page) {
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-nearby');
  await page.waitForSelector('#tl-nearby:not([hidden])');
}

const browser = await openBrowser();

for (const lang of ['en', 'es']) {
  console.log(`\nCare near me, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  const before = await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort()));
  await tab(page, 'checkin');
  check(await page.isVisible('#tl-checkin-nearby'), 'the Check-in tab has a row for it');
  await openNearby(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-nearby .tl-draft-tag'), 'the screen is marked "Draft for review"');
  check(await page.isVisible('#tl-nearby-privacy'), 'it says in view that the link leaves Tidelight and what the maps app does');
  const link = await page.evaluate(() => { const a = document.getElementById('tl-nearby-er'); const r = a.getBoundingClientRect(); return { href: a.getAttribute('href'), rel: a.getAttribute('rel'), h: r.height, w: r.width, words: a.textContent.trim() }; });
  check(link.href === 'https://maps.apple.com/?q=' + QUERY[lang], 'the link opens the phone\'s maps at a search for emergency rooms, in this language: ' + link.href);
  check(!/[?&](ll|sll|near|daddr|saddr)=/.test(link.href) && link.rel === 'noreferrer noopener', 'with no place and nothing about the person in it');
  check(link.h >= 44 && link.w >= 200 && link.words.length > 10, 'it is a full-size button that says where it goes: "' + link.words + '"');
  const crisis = await page.$$eval('#tl-nearby .tl-support-actions a', (links) => links.filter((a) => a.getClientRects().length).map((a) => a.getAttribute('href')));
  check(crisis.length === 3 && crisis[0] === 'tel:988' && crisis[1].startsWith('sms:988') && crisis[2] === 'tel:911', 'Call 988, Text 988, and Call 911 are on the screen itself');
  const order = await page.evaluate(() => { const strong = document.querySelector('#tl-nearby strong').getBoundingClientRect().top; const a = document.getElementById('tl-nearby-er').getBoundingClientRect().top; return strong < a; });
  check(order, '"You don\'t have to go anywhere to get help" comes before the link');
  check((await page.evaluate(() => window.__located)) === 0, 'the app read no location');
  check((await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort()))) === before, 'and stored nothing');

  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-nearby', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the screen' + (audit.length ? ': ' + audit.join(', ') : ''));

  // The list of other services is one tap away, and Back returns here.
  await page.click('#tl-nearby [data-tl-push="ways"]');
  await page.waitForSelector('#tl-ways:not([hidden])');
  check((await safetyFrame(page)).length === 0, '"Other ways to reach someone" opens from it');
  await page.click('#tl-ways [data-tl-back]');
  await page.waitForTimeout(300);
  check(await page.isVisible('#tl-nearby'), 'and Back returns to it');

  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}

console.log('\nCare near me and the rest of the app');
{
  const { context, page } = await newPage(browser, 'en');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
  const order = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-flow-support a, #tl-flow-support button')).map((el) => el.getAttribute('href') || el.getAttribute('data-tl-push') || 'other'));
  check(order.indexOf('nearby') > order.indexOf('tel:911') && order.indexOf('tel:988') === 0, 'the support step offers it below Call 988, Text 988, and Call 911');
  await page.click('#tl-flow-support [data-tl-push="nearby"]');
  await page.waitForSelector('#tl-nearby:not([hidden])');
  await page.click('#tl-nearby [data-tl-back]');
  await page.waitForTimeout(400);
  check(await page.evaluate(() => !document.getElementById('tl-flow-support').hidden && document.getElementById('tl-flow-support').getClientRects().length > 0), 'Back returns to the support step, not to a new check-in');
  check((await page.evaluate(() => window.__located)) === 0, 'still no location was read');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openNearby(page);
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-nearby'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-nearby', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone. No call, text, or chat was started, and no map was opened.`);
process.exit(tally.failures ? 1 : 0);

// "Another way to see it": four questions for a heavy thought. Nothing typed is kept.
//   node test/reframe-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');

async function newPage(browser, lang, { colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(() => { window.__tidelight = { clockRate: 1, shared: [] }; });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
async function openIt(page) {
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-reframe');
  await page.waitForSelector('#tl-reframe:not([hidden])');
}
const answers = (page) => page.$$eval('#tl-reframe [data-reframe-answer]', (els) => els.map((el) => el.value));
const everywhere = (page) => page.evaluate(() => JSON.stringify([Object.keys(localStorage).map((k) => localStorage.getItem(k)), Object.keys(sessionStorage).map((k) => sessionStorage.getItem(k))]));

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nAnother way to see it, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await tab(page, 'checkin');
  check(await page.isVisible('#tl-checkin-reframe'), 'the Check-in tab has a row for it');
  await openIt(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-reframe .tl-draft-tag'), 'the screen is marked "Draft for review"');
  const first = await page.evaluate(() => { const screen = document.getElementById('tl-reframe'); const strong = screen.querySelector('strong').getBoundingClientRect(); const field = screen.querySelector('[data-reframe-answer]').getBoundingClientRect(); return { notFor: strong.top < field.top && strong.height > 0, says988: /988/.test(screen.textContent), kept: document.getElementById('tl-reframe-privacy').getClientRects().length > 0 }; });
  check(first.notFor && first.says988, 'it says, before the questions, that it isn\'t for thoughts of ending your life, and where 988 is');
  check(first.kept, 'it says in view that nothing written is kept');
  check((await answers(page)).join('') === '' && (await page.$$eval('#tl-reframe [data-reframe-answer]', (els) => els.every((el) => !el.getAttribute('placeholder')))), 'four empty fields: the app suggests no answer');

  await page.fill('#tl-reframe-1', 'A made-up thing happened.');
  await page.fill('#tl-reframe-2', 'A made-up heavy thought, zqxv');
  await page.fill('#tl-reframe-4', 'A made-up other way');
  await page.click('#tl-tabbar [data-tl-tab-btn="home"]');
  await page.waitForTimeout(400); // the app's usual save runs after a tap
  check(!(await everywhere(page)).includes('zqxv') && (await page.evaluate(() => window.__tidelight.shared.length)) === 0, 'what was typed is not stored anywhere on the phone, and nothing was shared');
  await openIt(page);
  check((await answers(page)).join('') === '', 'leaving the screen clears it');

  await page.fill('#tl-reframe-3', 'A made-up kind word');
  await page.click('#tl-reframe-clear');
  check((await answers(page)).join('') === '' && (await page.evaluate(() => document.activeElement.id)) === 'tl-reframe-1', '"Clear what I wrote" clears every field and goes back to the first');

  await page.fill('#tl-reframe-2', 'A made-up thought before Quick exit');
  await page.evaluate(() => { document.documentElement.hidden = true; window.dispatchEvent(new Event('pageshow')); });
  await page.waitForTimeout(300);
  check((await page.isVisible('#tl-home')) && (await answers(page)).join('') === '', 'after Quick exit the app is on Home and nothing typed is left');

  await openIt(page);
  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-reframe', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the screen' + (audit.length ? ': ' + audit.join(', ') : ''));

  // Never on the support step.
  await tab(page, 'home');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
  check(await page.evaluate(() => !document.querySelector('#tl-flow-support [data-tl-push="reframe"]')), 'the support step after a very low check-in does not offer it');

  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openIt(page);
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-reframe'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-reframe', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

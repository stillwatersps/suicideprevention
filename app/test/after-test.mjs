// "After a crisis": five small steps for the days after, in plain words. Nothing kept.
//   node test/after-test.mjs      (after a build; part of `npm test`)
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
  await context.addInitScript(() => { window.__tidelight = { clockRate: 1 }; });
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
  await page.click('#tl-checkin-after');
  await page.waitForSelector('#tl-after:not([hidden])');
}
const keys = (page) => page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().filter((k) => k !== 'tidelight.checkin.v1')));

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nAfter a crisis, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await tab(page, 'checkin');
  check(await page.isVisible('#tl-checkin-after'), 'the Check-in tab has a row for it');
  const before = await keys(page);
  await openIt(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-after .tl-draft-tag'), 'the screen is marked "Draft for review"');
  const seen = await page.evaluate(() => {
    const screen = document.getElementById('tl-after');
    const strong = screen.querySelector('strong').getBoundingClientRect();
    const steps = Array.from(screen.querySelectorAll('.tl-after-step')).map((li) => ({ title: li.querySelector('h3').textContent.trim(), words: li.querySelector('p').textContent.trim().length }));
    const ways = Array.from(screen.querySelectorAll('.tl-after-links [data-tl-push]')).map((b) => ({ to: b.getAttribute('data-tl-push'), h: Math.round(b.getBoundingClientRect().height) }));
    const crisis = Array.from(screen.querySelectorAll('.tl-support-actions a')).map((a) => ({ href: a.getAttribute('href'), h: a.getBoundingClientRect().height }));
    return { firstTop: strong.top, stepsTop: screen.querySelector('.tl-after-steps').getBoundingClientRect().top, steps, ways, crisis, fields: screen.querySelectorAll('input, textarea').length, fuss: Boolean(screen.querySelector('[class*="streak"], .tl-horizon, canvas')) };
  });
  check(seen.firstTop < seen.stepsTop, 'before the steps, it says that the thoughts coming back is not failure and where help is');
  check(seen.steps.length === 5 && seen.steps.every((s) => s.title.length > 5 && s.words > 30), `five small steps: ${seen.steps.map((s) => s.title).join('; ')}`);
  check(seen.ways.map((w) => w.to).join() === 'plan,visit,reach,care' && seen.ways.every((w) => w.h >= 44), 'four full-size ways on, to tools the app already has');
  check(seen.crisis.length === 3 && seen.crisis[0].href === 'tel:988' && seen.crisis[1].href.startsWith('sms:988') && seen.crisis[2].href === 'tel:911' && seen.crisis.every((c) => c.h >= 44), 'Call 988, Text 988, and Call 911 are on the screen itself, full size');
  check(seen.fields === 0 && !seen.fuss, 'there is nothing to fill in, and no streak or decoration');
  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-after', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the screen' + (audit.length ? ': ' + audit.join(', ') : ''));
  for (const to of ['plan', 'visit', 'care']) {
    await page.click(`#tl-after [data-tl-push="${to}"]`);
    check(await page.isVisible('#tl-' + to), `"${to}" opens its screen`);
    await page.click(`#tl-${to} [data-tl-back]`);
    if (!(await page.isVisible('#tl-after'))) await openIt(page);
  }
  await page.click('#tl-after [data-tl-push="reach"]');
  check(await page.isVisible('#tl-reach'), '"reach" opens its screen');
  check((await keys(page)) === before, 'opening it, and the screens it leads to, stores nothing');
  // Never on the support step.
  await tab(page, 'home');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
  check(await page.evaluate(() => !document.querySelector('#tl-flow-support [data-tl-push="after"]')), 'the support step after a very low check-in does not offer it: that step is for reaching a person');
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
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-after'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-after', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

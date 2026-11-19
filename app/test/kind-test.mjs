// "Being kind to yourself": three short exercises in plain words. Nothing to type, nothing kept.
//   node test/kind-test.mjs      (after a build; part of `npm test`)
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
  await page.click('#tl-checkin-kind');
  await page.waitForSelector('#tl-kind:not([hidden])');
}

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nBeing kind to yourself, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await tab(page, 'checkin');
  check(await page.isVisible('#tl-checkin-kind'), 'the Check-in tab has a row for it');
  const before = await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort()));
  await openIt(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-kind .tl-draft-tag'), 'the screen is marked "Draft for review"');
  const seen = await page.evaluate(() => {
    const screen = document.getElementById('tl-kind');
    const parts = Array.from(screen.querySelectorAll('.tl-kind-part')).map((el) => ({ title: el.querySelector('h3').textContent.trim(), words: el.textContent.replace(/\s+/g, ' ').trim().length }));
    const crisis = Array.from(screen.querySelectorAll('.tl-support-actions a')).map((a) => { const r = a.getBoundingClientRect(); return { href: a.getAttribute('href'), w: r.width, h: r.height }; });
    return { parts, crisis, fields: screen.querySelectorAll('input, textarea').length, streak: Boolean(screen.querySelector('[class*="streak"], .tl-horizon')) };
  });
  check(seen.parts.length === 3 && seen.parts.every((p) => p.title.length > 4 && p.words > 60), `three exercises, each with a name and what to do: ${seen.parts.map((p) => p.title).join('; ')}`);
  check(seen.crisis.length === 3 && seen.crisis[0].href === 'tel:988' && seen.crisis[1].href.startsWith('sms:988') && seen.crisis[2].href === 'tel:911' && seen.crisis.every((c) => c.w >= 44 && c.h >= 44), 'Call 988, Text 988, and Call 911 are on the screen itself, full size');
  check(seen.fields === 0 && !seen.streak, 'there is nothing to fill in, and no streak or decoration');
  await page.click('#tl-tabbar [data-tl-tab-btn="home"]');
  check((await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().filter((k) => k !== 'tidelight.checkin.v1')))) === JSON.stringify(JSON.parse(before).filter((k) => k !== 'tidelight.checkin.v1')), 'opening it stores nothing');
  await openIt(page);
  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-kind', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the screen' + (audit.length ? ': ' + audit.join(', ') : ''));
  await page.click('#tl-kind [data-tl-back]');
  check(await page.isVisible('#tl-checkin'), 'Back returns to the Check-in tab');
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
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-kind'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-kind', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

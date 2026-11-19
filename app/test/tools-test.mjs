// "All tools": every tool in one list, with a search. Nothing typed is kept.
//   node test/tools-test.mjs      (after a build; part of `npm test`)
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
  await context.addInitScript(() => { window.__tidelight = { clockRate: 60 }; });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
async function openIt(page) {
  await tab(page, 'home');
  if (!(await page.isVisible('#tl-home'))) await tab(page, 'home');
  await page.click('#tl-home-tools');
  await page.waitForSelector('#tl-tools:not([hidden])');
}
const shown = (page) => page.$$eval('#tl-tools-list li', (items) => items.filter((li) => li.getClientRects().length).map((li) => li.querySelector('[data-tool-open]').getAttribute('data-tool-open')));
const type = async (page, words) => { await page.fill('#tl-tools-search', words); await page.waitForTimeout(120); };
const everywhere = (page) => page.evaluate(() => JSON.stringify([Object.keys(localStorage).map((k) => localStorage.getItem(k)), Object.keys(sessionStorage).map((k) => sessionStorage.getItem(k))]));
const state = (page) => page.evaluate(() => ({ crisis: !document.getElementById('tl-tools-crisis').hidden, status: document.getElementById('tl-tools-status').hidden ? '' : document.getElementById('tl-tools-status').textContent.trim() }));

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nAll tools, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await tab(page, 'home');
  check(await page.isVisible('#tl-home-tools'), 'Home has a button for it, on the toolkit card');
  await openIt(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-tools .tl-draft-tag'), 'the screen is marked "Draft for review"');
  const rows = await page.$$eval('#tl-tools-list [data-tool-open]', (els) => els.map((el) => ({ title: el.querySelector('.tl-card-title').textContent.trim(), sub: el.querySelector('.tl-card-sub').textContent.trim(), h: Math.round(el.getBoundingClientRect().height) })));
  check(rows.length === 22 && rows.every((r) => r.title.length > 3 && r.sub.length > 8 && !/^tool\./.test(r.title + r.sub) && r.h >= 44), `twenty-two tools, each with a name and a line in this language (${rows.slice(0, 2).map((r) => r.title).join('; ')}…)`);
  let s = await state(page);
  check(!s.crisis && s.status === '', 'with nothing typed, every tool shows and nothing else');
  const field = await page.evaluate(() => { const f = document.getElementById('tl-tools-search'); return { label: (f.labels[0] || {}).textContent || '', h: Math.round(f.getBoundingClientRect().height), kept: document.getElementById('tl-tools-kept').getClientRects().length > 0 }; });
  check(field.label.length > 5 && field.h >= 44 && field.kept, 'the search field is labelled and full size, and says in view that what is typed is not kept');

  await type(page, lang === 'es' ? 'DORMIR' : 'SLEEP');
  check((await shown(page)).join() === 'wind' && (await state(page)).status.length > 10, 'typing a word shows only the tools that match, whatever the capitals');
  await type(page, 'zqxv');
  s = await state(page);
  check((await shown(page)).length === 0 && s.status.length > 20 && !s.crisis, `a word that matches nothing says so plainly: "${s.status}"`);
  await page.waitForTimeout(400);
  check(!(await everywhere(page)).includes('zqxv'), 'what was typed is not stored anywhere on the phone');
  await type(page, lang === 'es' ? 'suicidio' : 'suicide');
  s = await state(page);
  const crisis = await page.$$eval('#tl-tools-crisis .tl-support-actions a', (els) => els.map((a) => ({ href: a.getAttribute('href'), h: a.getBoundingClientRect().height })));
  check(s.crisis && crisis.length === 3 && crisis[0].href === 'tel:988' && crisis[2].href === 'tel:911' && crisis.every((c) => c.h >= 44), 'a search that reads like a need for urgent help shows Call 988, Text 988, and Call 911 first, full size');
  const order = await page.evaluate(() => document.getElementById('tl-tools-crisis').getBoundingClientRect().top < document.getElementById('tl-tools-status').getBoundingClientRect().top);
  check(order, 'above "nothing matches", not below it');
  await page.waitForTimeout(600); // a screen fades in; colors are measured once it has
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-tools', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the screen' + (audit.length ? ': ' + audit.join(', ') : ''));

  await tab(page, 'meditate');
  await openIt(page);
  check((await page.inputValue('#tl-tools-search')) === '' && (await shown(page)).length === 22 && !(await state(page)).crisis, 'leaving the screen clears the search');
  await page.click('#tl-tools-list [data-tool-open="ground"]');
  check(await page.isVisible('#tl-ground'), 'a row opens its tool (Grounding)');
  await page.click('#tl-ground [data-tl-back]');
  await page.waitForTimeout(200);
  check(await page.isVisible('#tl-tools') && (await page.getAttribute('#tl-tabbar [data-tl-tab-btn="home"]', 'aria-current')) === 'page', 'Back from it returns to this list, on Home (found in the Simulator: it went to the Check-in tab)');
  await page.click('#tl-tools-list [data-tool-open="ground"]');
  await tab(page, 'checkin');
  check(await page.isVisible('#tl-checkin') && !(await page.isVisible('#tl-tools')), 'opened again, a tap on its tab goes to that tab\'s first screen as before');
  await openIt(page);
  await page.click('#tl-tools-list [data-tool-open="meditate"]');
  check(await page.isVisible('#tl-meditate'), 'a row for a tab opens the tab (Meditate)');
  await openIt(page);
  await page.click('#tl-tools-list [data-tool-open="journey"]');
  await page.waitForTimeout(300);
  check(await page.isVisible('#ci-journey'), 'a row for an older section opens it (Your journey)');
  await openIt(page);
  await type(page, 'made-up words before Quick exit');
  await page.evaluate(() => { window.dispatchEvent(new Event('pageshow')); });
  await page.waitForTimeout(200);
  check((await page.inputValue('#tl-tools-search')) === '', 'coming back after Quick exit, nothing typed is left');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openIt(page);
  await type(page, 'ayuda');
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-tools'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
  await type(page, '');
  await page.waitForTimeout(600);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-tools', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

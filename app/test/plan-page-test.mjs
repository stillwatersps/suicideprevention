// The safety plan as a page to print or keep: a plain file handed to the phone's share sheet.
//   node test/plan-page-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with a stand-in for the share sheet. Nothing is shared and nothing is printed.
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const PLAN = JSON.stringify({ signs: ['A made-up warning sign, zqxv'], coping: ['A made-up thing I do'], distract: [], people: [{ name: 'A made-up friend', phone: '555 0100' }], pros: [], safer: ['A made-up step'], updatedAt: '' });

async function newPage(browser, lang, plan, { colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript((stored) => {
    window.__files = [];
    window.__sheet = { completed: true };
    window.__tidelight = { clockRate: 1, onShareFile: (file) => { window.__files.push(file); return window.__sheet; } };
    try { if (stored && !sessionStorage.getItem('seeded')) { localStorage.setItem('tidelight.plan.v1', stored); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, plan);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
async function openPlan(page) {
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-plan');
  await page.waitForSelector('#tl-plan:not([hidden])');
}
const note = (page) => page.evaluate(() => { const n = document.getElementById('tl-plan-page-note'); return n.hidden ? '' : n.textContent.trim(); });

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nThe safety plan as a page, ${name(lang)}`);
  {
    const { context, page } = await newPage(browser, lang, null);
    await openPlan(page);
    check(!(await page.isVisible('#tl-plan-page-box')), 'with an empty plan the page is not offered');
    await context.close();
  }
  const { context, page, errors, outside } = await newPage(browser, lang, PLAN);
  await openPlan(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen');
  const box = await page.evaluate(() => { const b = document.getElementById('tl-plan-page-box'); const btn = document.getElementById('tl-plan-page'); return { shown: b.getClientRects().length > 0, h: Math.round(btn.getBoundingClientRect().height), warn: b.querySelector('.tl-sub').textContent.length > 60, afterShare: b.getBoundingClientRect().top > document.getElementById('tl-plan-share-box').getBoundingClientRect().top }; });
  check(box.shown && box.h >= 44 && box.warn && box.afterShare, 'with something in the plan, "A page to print or keep" is offered under Share my plan, with who can read it said first');
  const before = await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().filter((k) => k !== 'tidelight.checkin.v1').map((k) => [k, localStorage.getItem(k).length])));

  await page.evaluate(() => { window.__sheet = { completed: false }; });
  await page.click('#tl-plan-page');
  await page.waitForFunction(() => window.__files.length === 1);
  await page.waitForTimeout(150);
  check((await note(page)) === '', 'closing the share sheet without choosing says nothing: nothing happened');
  await page.evaluate(() => { window.__sheet = { completed: true }; });
  await page.click('#tl-plan-page');
  await page.waitForFunction(() => window.__files.length === 2);
  await page.waitForTimeout(150);
  const file = await page.evaluate(() => window.__files[1]);
  const lines = file.text.split('\n');
  check(/^[a-z-]+\.txt$/.test(file.name) && lines[0] === lines[0].toUpperCase() && lines[0].length > 8, `the phone is handed one plain file, "${file.name}", that starts with the plan's name`);
  check(['A made-up warning sign, zqxv', 'A made-up thing I do', 'A made-up friend, 555 0100', 'A made-up step'].every((words) => file.text.includes('- ' + words)), 'it has every line of the plan, in the person\'s own words');
  const headings = await page.$$eval('#tl-plan [data-plan-part] > h3', (els) => els.map((el) => el.textContent.trim()));
  const used = [0, 1, 3, 5].map((i) => headings[i]);
  const unused = [2, 4].map((i) => headings[i]);
  check(used.every((h) => file.text.includes('\n' + h + '\n')) && unused.every((h) => !file.text.includes(h)), 'under the screen\'s own headings, and a part with nothing in it is left out');
  const end = lines.filter(Boolean).slice(-2).join(' ');
  check(/988/.test(end) && /911/.test(end), 'and it ends with 988 and 911: "' + end + '"');
  check((await note(page)).length > 20, 'the screen says the page was handed over and that no record is kept: "' + (await note(page)) + '"');
  check((await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().filter((k) => k !== 'tidelight.checkin.v1').map((k) => [k, localStorage.getItem(k).length])))) === before, 'making the page stores nothing (the older page\'s own routine save aside)');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', PLAN, { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await openPlan(page);
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const box = document.getElementById('tl-plan-page-box'); const limit = window.innerWidth + 1; return Array.from(box.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: the box fits` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with a stand-in for the share sheet; nothing was shared or printed.`);
process.exit(tally.failures ? 1 : 0);

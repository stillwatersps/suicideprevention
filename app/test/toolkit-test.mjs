// "My toolkit": up to four tools pinned to Home. Only their ids are kept.
//   node test/toolkit-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const KEY = 'tidelight.toolkit.v1';

async function newPage(browser, lang, { colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(() => { window.__tidelight = { clockRate: 60, spoken: [], onSpeak(o) { this.spoken.push(o); } }; });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
const home = async (page) => { await tab(page, 'home'); if (!(await page.isVisible('#tl-home'))) await tab(page, 'home'); };
const choose = async (page) => { await home(page); await page.click('#tl-home-toolkit-edit'); await page.waitForSelector('#tl-toolkit:not([hidden])'); };
const pin = async (page, id) => { await page.click(`#tl-toolkit-list input[data-tool="${id}"]`); await page.waitForTimeout(120); };
const stored = (page) => page.evaluate((k) => localStorage.getItem(k), KEY);
const onHome = (page) => page.evaluate(() => ({ ids: Array.from(document.querySelectorAll('#tl-home-toolkit-list [data-toolkit-open]')).map((b) => b.getAttribute('data-toolkit-open')).join(), names: Array.from(document.querySelectorAll('#tl-home-toolkit-list [data-toolkit-open]')).map((b) => b.textContent.trim()), small: Array.from(document.querySelectorAll('#tl-home-toolkit-list [data-toolkit-open]')).filter((b) => b.getBoundingClientRect().height < 44).length, empty: document.getElementById('tl-home-toolkit-empty').getClientRects().length > 0 }));
const audit = async (page, sel) => { await page.waitForTimeout(600); await page.evaluate(axeSource); return page.evaluate(async (s) => { const result = await window.axe.run(s, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); }, sel); };

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nMy toolkit, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await home(page);
  let h = await onHome(page);
  check((await page.isVisible('#tl-home-toolkit')) && h.ids === '' && h.empty && (await stored(page)) === null, 'Home has the card, empty, with a line saying what it is for; nothing is stored');
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen on Home with the card there');
  await choose(page);
  check((await safetyFrame(page)).length === 0, 'and with the chooser open');
  check(await page.isVisible('#tl-toolkit .tl-draft-tag'), 'the chooser is marked "Draft for review"');
  const rows = await page.$$eval('#tl-toolkit-list .tl-switch', (els) => els.map((el) => ({ words: el.textContent.trim(), h: Math.round(el.getBoundingClientRect().height), on: el.querySelector('input').checked })));
  check(rows.length === 14 && rows.every((r) => r.words.length > 3 && !/^tool\./.test(r.words) && r.h >= 44 && !r.on), `fourteen tools, each named in this language, none pinned (${rows.slice(0, 3).map((r) => r.words).join('; ')}…)`);
  check(!rows.some((r) => /988|911/.test(r.words)), 'no crisis line is in the list: they can\'t be unpinned');

  await pin(page, 'ground');
  await pin(page, 'plan');
  check((await stored(page)) === '{"pinned":["ground","plan"]}', 'pinning two keeps only their ids, in the order pinned');
  await home(page);
  h = await onHome(page);
  check(h.ids === 'ground,plan' && !h.empty && h.small === 0 && h.names.every((n) => n.length > 3), `Home shows them as full-size buttons: ${h.names.join('; ')}`);
  const a1 = await audit(page, '#tl-home-toolkit');
  check(a1.length === 0, 'no serious accessibility finding on the card' + (a1.length ? ': ' + a1.join(', ') : ''));
  await page.click('#tl-home-toolkit-list [data-toolkit-open="ground"]');
  check(await page.isVisible('#tl-ground'), 'the first opens Grounding');
  await home(page);
  await page.click('#tl-home-toolkit-list [data-toolkit-open="plan"]');
  check(await page.isVisible('#tl-plan'), 'the second opens the safety plan');

  await page.reload();
  await page.waitForSelector('html.app-ready');
  check((await onHome(page)).ids === 'ground,plan', 'after the app is closed and opened they are still on Home');
  await choose(page);
  await pin(page, 'hope');
  await pin(page, 'reset');
  await pin(page, 'good');
  const full = await page.evaluate(() => ({ status: !document.getElementById('tl-toolkit-status').hidden, good: document.querySelector('#tl-toolkit-list input[data-tool="good"]').checked }));
  check(full.status && !full.good && (await stored(page)) === '{"pinned":["ground","plan","hope","reset"]}', 'a fifth is not pinned, and the screen says four is the most');
  const a2 = await audit(page, '#tl-toolkit');
  check(a2.length === 0, 'no serious accessibility finding on the chooser' + (a2.length ? ': ' + a2.join(', ') : ''));
  await pin(page, 'ground');
  await pin(page, 'good');
  check((await stored(page)) === '{"pinned":["plan","hope","reset","good"]}', 'unpinning one makes room for another');
  await home(page);
  await page.click('#tl-home-toolkit-list [data-toolkit-open="hope"]');
  await page.waitForTimeout(300);
  check(await page.isVisible('#app-hope'), 'a pinned Hope box opens the Hope box');
  await home(page);
  await page.click('#tl-home-toolkit-list [data-toolkit-open="reset"]');
  await page.waitForSelector('#tl-stage:not([hidden])');
  check((await safetyFrame(page)).length === 0, 'a pinned 1-minute reset starts the session, with the safety frame on screen');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 30000 });
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await page.evaluate((k) => localStorage.setItem(k, '{"pinned":["ride","reframe","kind","wind"]}'), KEY);
  await page.reload();
  await page.waitForSelector('html.app-ready');
  for (const [where, open] of [['#tl-home-toolkit', home], ['#tl-toolkit', choose]]) {
    await open(page);
    for (const size of ['100%', '200%', '331%']) {
      await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
      await page.waitForTimeout(250);
      const wide = await page.evaluate((sel) => { const box = document.querySelector(sel); const limit = window.innerWidth + 1; return Array.from(box.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className || el.tagName).slice(0, 3); }, where);
      check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing in ${where} runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    const a = await audit(page, where);
    check(a.length === 0, `and no serious accessibility finding in ${where} in dark` + (a.length ? ': ' + a.join(', ') : ''));
  }
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

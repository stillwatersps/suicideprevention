// "Breathe in a pattern": breathing with the circle, in one of three patterns.
//   node test/breathe-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium, muted: what would be spoken or sounded is recorded by a stand-in.
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const card = '.tl-type[data-type="breathe"]';

async function newPage(browser, lang, { viewport = { width: 390, height: 844 }, colorScheme = 'light' } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(() => { window.__tidelight = { clockRate: 60, spoken: [], ambient: [], onSpeak(o) { this.spoken.push(o); }, onAmbient(kind) { this.ambient.push(kind); } }; });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  await tab(page, 'meditate');
  if (!(await page.isVisible('#tl-meditate'))) await tab(page, 'meditate');
  return { context, page, errors, outside };
}
const last = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('tidelight.sessions') || '[]')[0]);

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nBreathe in a pattern, ${name(lang)}`);
  for (const pattern of ['calm', 'box', 'stressed']) {
    const { context, page, errors, outside } = await newPage(browser, lang);
    if (pattern === 'calm') {
      const seen = await page.evaluate((sel) => { const c = document.querySelector(sel); const chips = (q) => Array.from(c.querySelectorAll(q + ' .tl-chip')); return { name: c.querySelector('.tl-type-name').textContent.trim(), patterns: chips('[data-type-pattern]').map((b) => b.getAttribute('data-value')).join(), picked: chips('[data-type-pattern]').filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.getAttribute('data-value')).join(), lengths: chips('[data-type-length]').map((b) => b.getAttribute('data-value')).join(), small: chips('[data-type-pattern]').filter((b) => b.getBoundingClientRect().height < 44).length, note: c.querySelector('.tl-type-note').getClientRects().length > 0, group: c.querySelector('[data-type-pattern]').getAttribute('aria-label') }; }, card);
      check(seen.patterns === 'calm,box,stressed' && seen.picked === 'calm' && seen.lengths === '1,3,5', `the Meditate tab has a "${seen.name}" card: three patterns (the calm one picked), for 1, 3 or 5 minutes`);
      check(seen.small === 0 && seen.group.length > 3, `each pattern is a full-size button in a group named "${seen.group}"`);
      check(seen.note, 'the card says, in view, to stop if it makes you dizzy');
    } else {
      await page.click(`${card} [data-type-pattern] [data-value="${pattern}"]`);
    }
    await page.click(card + ' [data-type-start]');
    await page.waitForSelector('#tl-stage:not([hidden])');
    if (pattern === 'calm') check((await safetyFrame(page)).length === 0, 'the safety frame is on screen while it plays');
    await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 30000 });
    const kept = await last(page);
    const heard = await page.evaluate(() => ({ spoken: window.__tidelight.spoken.length, ambient: window.__tidelight.ambient.length }));
    check(kept && kept.type === 'breathe' && kept.meditationId === 'breathe-1-' + pattern && kept.completed && kept.totalSeconds === 60, `picking "${pattern}" runs one minute of that pattern to its end (${kept && kept.meditationId})`);
    check(heard.spoken === 0 && heard.ambient === 0, 'with nothing spoken and no background sound');
    check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
    check(outside.length === 0, 'nothing was requested from outside the app');
    await context.close();
  }
}
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate((sel) => { const c = document.querySelector(sel); const limit = window.innerWidth + 1; return Array.from(c.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.getAttribute('data-value') || el.className).slice(0, 3); }, card);
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the card runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, muted, with stand-ins for voice and sound; not a phone.`);
process.exit(tally.failures ? 1 : 0);

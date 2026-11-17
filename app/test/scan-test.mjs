// "Body scan": a session that moves attention slowly up the body. Its lines are ones the Deep
// session already says.
//   node test/scan-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium, muted: what would be spoken or sounded is recorded by a stand-in.
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const card = '.tl-type[data-type="scan"]';

async function newPage(browser, lang, rate) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript((r) => {
    window.__tidelight = { clockRate: r, spoken: [], ambient: [], haptics: [], onSpeak(o) { this.spoken.push(o); }, onAmbient(kind) { this.ambient.push(kind); }, onHaptic(o) { this.haptics.push(o); } };
  }, rate);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nBody scan, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang, 60);
  await tab(page, 'meditate');
  if (!(await page.isVisible('#tl-meditate'))) await tab(page, 'meditate');
  const seen = await page.evaluate((sel) => { const c = document.querySelector(sel); return c ? { name: c.querySelector('.tl-type-name').textContent.trim(), lengths: Array.from(c.querySelectorAll('[data-type-length] .tl-chip')).map((b) => b.getAttribute('data-value')).join(), label: c.querySelector('[data-type-start]').getAttribute('aria-label'), h: Math.round(c.querySelector('[data-type-start]').getBoundingClientRect().height) } : null; }, card);
  check(seen && seen.name.length > 3 && seen.lengths === '5,10', `the Meditate tab has a "${seen && seen.name}" card, for 5 or 10 minutes`);
  check(seen && seen.label.includes(seen.name) && /5/.test(seen.label) && seen.h >= 44, 'Start says what it starts and is full size: "' + (seen && seen.label) + '"');
  await page.click(card + ' [data-type-start]');
  await page.waitForSelector('#tl-stage:not([hidden])');
  check((await safetyFrame(page)).length === 0, 'the safety frame is on screen while it plays');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 30000 });
  const heard = await page.evaluate(() => ({ spoken: window.__tidelight.spoken.map((l) => l.scriptId), ambient: window.__tidelight.ambient.length, breath: window.__tidelight.haptics.filter((h) => /breath|inhale|exhale/i.test(JSON.stringify(h))).length }));
  check(heard.spoken.join() === 'intro.deep,bodyScan,outro.deep', 'it says three lines, in order: settle, the body scan, come back (' + heard.spoken.join(', ') + ')');
  check(heard.ambient === 0 && heard.breath === 0, 'with no background sound unless one is chosen, and no taps to breathe to');
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('tidelight.sessions') || '[]')[0]);
  check(kept && kept.type === 'scan' && kept.completed && kept.totalSeconds === 300, 'when the time is up it is kept in the history as a five-minute session');
  check(await page.isVisible('#tl-complete-faces'), 'and asks how the person feels now, like every session');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  // The voice guide turned off in Settings: words on the screen only.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route((url) => !url.href.startsWith(base), (route) => route.abort());
  await context.addInitScript(() => { window.__tidelight = { clockRate: 60, spoken: [], onSpeak(o) { this.spoken.push(o); } }; try { localStorage.setItem('tidelight.settings', JSON.stringify({ meditation: { voice: false } })); } catch (e) { /* first load */ } });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  await page.goto(base + pagePath('en'));
  await page.waitForSelector('html.app-ready');
  await tab(page, 'meditate');
  await page.click(card + ' [data-type-start]');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 30000 });
  check((await page.evaluate(() => window.__tidelight.spoken.length)) === 0, 'with the voice guide off in Settings, nothing is spoken and the session still runs to its end');
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, muted, with stand-ins for voice and sound; not a phone.`);
process.exit(tally.failures ? 1 : 0);

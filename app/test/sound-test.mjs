// "Just sound": a session with rain, ocean, or steady noise and nothing else. No voice, no
// breathing to follow, no taps.
//   node test/sound-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium, muted: what would sound is recorded by a stand-in, and nothing is played.
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');

async function newPage(browser, lang, storage = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript((stored) => {
    window.__tidelight = {
      clockRate: 1, spoken: [], ambient: [], haptics: [], awake: [],
      onSpeak(o) { this.spoken.push(o); }, onAmbient(kind) { this.ambient.push(kind); }, onHaptic(o) { this.haptics.push(o); }, onKeepAwake(on) { this.awake.push(on); },
    };
    try { if (!sessionStorage.getItem('seeded')) { Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, storage);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
const card = '.tl-type[data-type="sound"]';
const sessions = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('tidelight.sessions') || '[]'));

const browser = await openBrowser();
for (const lang of ['en', 'es']) {
  console.log(`\nJust sound, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await tab(page, 'meditate');
  if (!(await page.isVisible('#tl-meditate'))) await tab(page, 'meditate');
  check(await page.isVisible(card), 'the Meditate tab has a "Just sound" card');
  const seen = await page.evaluate((sel) => { const c = document.querySelector(sel); return { name: c.querySelector('.tl-type-name').textContent.trim(), lengths: Array.from(c.querySelectorAll('[data-type-length] .tl-chip')).map((b) => b.getAttribute('data-value')), label: c.querySelector('[data-type-start]').getAttribute('aria-label'), sounds: Array.from(c.querySelectorAll('[data-type-sound] .tl-chip')).map((b) => b.getAttribute('data-value')), chosen: (c.querySelector('[data-type-sound] [aria-pressed="true"]') || {}).getAttribute ? c.querySelector('[data-type-sound] [aria-pressed="true"]').getAttribute('data-value') : null }; }, card);
  check(seen.name.length > 3 && seen.lengths.join() === '5,15,30', `it is named "${seen.name}" and runs for 5, 15, or 30 minutes`);
  check(/5/.test(seen.label) && seen.label.includes(seen.name), 'Start says what it starts: "' + seen.label + '"');
  check(seen.sounds.includes('rain') && seen.sounds.includes('ocean') && seen.sounds.includes('whiteNoise') && seen.sounds.includes('brownNoise') && seen.chosen === 'rain', 'its options offer rain, ocean, white noise, and brown noise, starting on rain');

  // Ocean, five minutes, with the clock sped up.
  await page.click(card + ' [data-type-options]');
  await page.click(card + ' [data-type-sound] [data-value="ocean"]');
  await page.click(card + ' [data-type-start]');
  await page.waitForSelector('#tl-stage:not([hidden])');
  await page.waitForFunction(() => window.__tidelight.ambient.length > 0);
  check((await safetyFrame(page)).length === 0, 'the safety frame is on screen while it plays');
  await page.waitForTimeout(1200);
  const playing = await page.evaluate(() => ({ ambient: window.__tidelight.ambient.slice(), spoken: window.__tidelight.spoken.length, haptics: window.__tidelight.haptics.filter((h) => /breath|inhale|exhale/i.test(JSON.stringify(h))).length, text: (document.getElementById('tl-screen-text') || {}).textContent || '', guide: Array.from(document.querySelectorAll('.tl-guide-words')).filter((el) => el.getClientRects().length && el.textContent.trim()).length }));
  check(playing.ambient.join() === 'ocean', 'the chosen sound starts (ocean), and only that');
  check(playing.spoken === 0, 'no voice speaks');
  check(playing.haptics === 0 && playing.guide === 0, 'there is no breathing to follow: no taps and no guide words');
  check(playing.text.trim().length > 2, 'the screen shows only a quiet word: "' + playing.text.trim() + '"');
  // End it, then run a whole one with the clock sped up (the speed is read when a session starts).
  await page.click('#tl-stage', { position: { x: 195, y: 300 } });
  await page.click('#tl-player-end');
  if (await page.isVisible('#tl-end-yes')) await page.click('#tl-end-yes');
  await page.waitForSelector('#tl-stage', { state: 'hidden' });
  await page.evaluate(() => { window.__tidelight.clockRate = 400; });
  await page.click(card + ' [data-type-start]');
  await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 20000 });
  await page.evaluate(() => { window.__tidelight.clockRate = 1; });
  const kept = (await sessions(page)).find((s) => s.completed);
  check(kept && kept.type === 'sound' && kept.completed && kept.totalSeconds === 300, 'when the time is up it is kept in the history as a five-minute session');
  check((await page.evaluate(() => window.__tidelight.spoken.length)) === 0, 'and still nothing was spoken');
  await page.click('#tl-complete [data-player-done]');
  await page.click('#tl-meditate [data-tl-push="history"]').catch(() => {});
  const history = await page.evaluate(() => (document.getElementById('tl-history') || { textContent: '' }).textContent);
  check(history.includes(seen.name), 'the history names it "' + seen.name + '"');

  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}
{
  // With the sound switched off in the player, nothing sounds at all.
  const { context, page } = await newPage(browser, 'en');
  await tab(page, 'meditate');
  await page.click(card + ' [data-type-start]');
  await page.waitForSelector('#tl-stage:not([hidden])');
  await page.waitForFunction(() => window.__tidelight.ambient.length > 0);
  await page.click('#tl-stage', { position: { x: 195, y: 300 } });
  await page.click('#tl-toggle-sound');
  await page.waitForTimeout(500);
  check(await page.evaluate(() => document.getElementById('tl-toggle-sound').getAttribute('aria-pressed') === 'false' || /off|sin/i.test(document.getElementById('tl-toggle-sound').getAttribute('aria-label') || '')), 'the player\'s sound switch turns the sound off');
  check(await page.isVisible('#tl-toggle-voice') === false || (await page.evaluate(() => window.__tidelight.spoken.length)) === 0, 'and there is never a voice to turn on');
  await context.close();
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, muted, with a stand-in for sound; not a phone.`);
process.exit(tally.failures ? 1 : 0);

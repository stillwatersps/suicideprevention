// Takes a phone-size picture of every screen and state of the app, for the design record.
// Run after a build: node tools/screens.mjs before   (or: after, or any folder name)
//   node tools/screens.mjs after-launch-pass store   makes only the six App Store drafts
// Pictures go to app/design/<name>/ and stay on this computer (the folder is not committed).
// Desktop Chromium at two phone sizes, light and dark, English and Spanish, plus one pass at
// the largest text size. Not a phone, and not the iOS Simulator.
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, birthDateYearsAgo, pagePath, SEEDED } from '../test/helpers.mjs';
import { openBrowser } from '../test/quiet.mjs';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'design', process.argv[2] || 'after');
const SIZES = { se: { width: 375, height: 667 }, 17: { width: 402, height: 874 } };
const only = process.argv[3]; // optional: one combination, such as en-light-17

const { base, close } = await serve();
const browser = await openBrowser();
let count = 0;

async function pass(lang, scheme, size, large) {
  const tag = `${lang}-${scheme}-${size}${large ? '-largest-text' : ''}`;
  if (only && only !== tag) return;
  mkdirSync(join(out, tag), { recursive: true });
  const context = await browser.newContext({ viewport: SIZES[size], colorScheme: scheme, deviceScaleFactor: 2 });
  await context.addInitScript(() => {
    window.__tidelight = { clockRate: 6, locationAuthorization: 'whenInUse', notificationAuthorization: 'authorized', position: { latitude: 1, longitude: 1 }, pickContact: async () => ({ name: 'A made-up friend', phone: '555-0100' }) };
  });
  const page = await context.newPage();
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  if (large) await page.evaluate(() => { document.documentElement.style.fontSize = '135%'; });
  const shot = async (name, full) => { await page.waitForTimeout(450); await page.screenshot({ path: join(out, tag, name + '.png'), fullPage: Boolean(full) }); count += 1; };
  const tab = (id) => page.click(`#tl-tabbar [data-tl-tab-btn="${id}"]`);
  const root = async (id) => { await tab(id); if (!(await page.isVisible('#tl-' + id))) await tab(id); };
  const step = async (name, fn) => { try { await fn(); } catch (e) { console.log(`  ${tag}: could not reach ${name}: ${String(e.message).split('\n')[0]}`); } };

  // Onboarding, page by page.
  for (let i = 0; i < 12 && await page.isVisible('#tl-onboarding'); i += 1) {
    const name = await page.getAttribute('.tl-ob-page:not([hidden])', 'data-ob');
    await shot(`01-onboarding-${String(i + 1).padStart(2, '0')}-${name}`);
    if (name === 'age') { await page.fill('#app-birth-date', birthDateYearsAgo(30)); await page.click('.app-age-save'); await page.click('.app-age-yes'); }
    else if (name === 'done') await page.click('#tl-ob-start');
    else { if (name === 'style') await page.click('#tl-ob-style [data-value="calm"]'); await page.click('.tl-ob-page:not([hidden]) [data-ob-next]'); }
  }
  await step('home', async () => { await root('home'); await shot('02-home-first-day'); await shot('02-home-first-day-full', true); });
  await step('setup list', async () => { await page.click('#tl-setup-open'); await shot('03-home-setup-open'); await page.click('#tl-setup-open'); });
  await step('check-in', async () => {
    await root('checkin'); await shot('04-checkin-tab');
    await page.click('#tl-checkin-quick'); await shot('05-checkin-breath');
    if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
    await shot('06-checkin-mood');
    await page.click('#tl-flow-faces [data-value="4"]'); await page.click('#tl-flow-tags [data-value="grateful"]'); await shot('07-checkin-mood-picked');
    await page.click('#tl-flow-done'); await shot('08-checkin-done');
    await page.click('[data-flow="done"] [data-tl-go="home"]'); await page.waitForSelector('#tl-home:not([hidden])', { timeout: 6000 });
    await shot('09-home-after-check-in');
  });
  await step('streak', async () => { await root('home'); await page.click('#tl-streak-card, [data-tl-push="streak"]'); await shot('11-streak'); });
  await step('settings', async () => { await root('home'); await page.click('#tl-home [data-tl-push="settings"]'); await shot('12-settings'); await shot('12-settings-full', true); });
  await step('daily check-in', async () => {
    await root('checkin'); await page.click('#tl-checkin [data-tl-legacy="ci-today"][data-tl-start]'); await shot('13-daily-question-1');
    await page.click('#ci-step-feeling label:has(input[value="okay"])'); await page.click('#ci-step-feeling .ci-next');
    for (const id of ['mind', 'difficult', 'self']) await page.click(`#ci-step-${id} .ci-skip`);
    await shot('14-daily-needs'); await page.click('.ci-finish'); await shot('15-daily-result');
  });
  for (const [n, panel] of [['16-journal', 'ci-journal'], ['17-rediscover', 'ci-rediscover'], ['18-hope-box', 'app-hope'], ['19-your-journey', 'ci-journey']]) {
    await step(panel, async () => { await root('checkin'); await page.click(`#tl-checkin [data-tl-legacy="${panel}"]`); await shot(n); });
  }
  await step('meditate', async () => { await root('meditate'); await shot('20-meditate'); await shot('20-meditate-full', true); });
  await step('builder', async () => { await page.click('#tl-build-card'); await shot('21-builder'); await shot('21-builder-full', true); });
  await step('player', async () => {
    await root('meditate'); await page.click('.tl-type[data-type="quick"] [data-type-start], [data-type="quick"] [data-type-start]');
    await page.waitForSelector('#tl-stage:not([hidden])'); await page.waitForTimeout(1500); await shot('22-player');
    await page.click('#tl-stage', { position: { x: 150, y: 380 } }); await shot('23-player-controls');
    await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 20000 }); await shot('24-meditation-complete');
    await page.click('#tl-complete [data-player-done]');
  });
  await step('history', async () => { await root('meditate'); await page.click('#tl-history-card'); await shot('25-history'); });
  await step('location', async () => { await root('location'); await shot('26-location'); });
  await step('friends', async () => { await root('friends'); await shot('27-friends'); });
  // Last, because a very low check-in makes the rest of the day quiet (no dawn at completion).
  await step('very low check-in', async () => {
    await root('home'); await page.click('#tl-home [data-tl-quick="checkin"]'); if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
    await page.click('#tl-flow-faces [data-value="1"]'); await page.click('#tl-flow-done'); await shot('10-checkin-support-after-very-low');
  });
  await step('support', async () => { await root('home'); await page.click('.header-cta'); await page.waitForTimeout(700); await shot('28-get-support-now'); });
  // The website's pages inside the app, which carry the same tab bar.
  for (const [n, en, es] of [['29-site-get-help', 'get-help/', 'es/obtener-ayuda/'], ['30-site-not-sure', 'not-sure/', 'es/que-siento/'], ['31-site-home', '', 'es/']]) {
    await step(n, async () => { await page.goto(base + (lang === 'es' ? es : en)); await page.waitForSelector('#tl-tabbar .tl-tab'); await shot(n); });
  }
  await context.close();
}

// What a person sees if the newer screens fail to start: the older layout, with the same crisis
// strip. Forced here by handing the page a copy with two of its parts renamed.
async function fallback(lang, scheme, size) {
  const tag = `${lang}-${scheme}-${size}`;
  if (only && only !== tag) return;
  mkdirSync(join(out, tag), { recursive: true });
  const context = await browser.newContext({ viewport: SIZES[size], colorScheme: scheme, deviceScaleFactor: 2 });
  await context.route(/\/(check-in|registro-diario)\/$/, async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('id="tl-tabbar"', 'id="tl-tabbar-gone"').replace('id="tl-home"', 'id="tl-home-gone"') });
  });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  try {
    await page.goto(base + pagePath(lang));
    await page.waitForSelector('html.app-ready');
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(out, tag, '32-fallback-older-layout.png') }); count += 1;
    await page.screenshot({ path: join(out, tag, '32-fallback-older-layout-full.png'), fullPage: true }); count += 1;
  } catch (e) { console.log(`  ${tag}: could not reach the fallback: ${String(e.message).split('\n')[0]}`); }
  await context.close();
}

// Six draft pictures at the App Store's 6.9-inch size (1320 by 2868). DRAFTS: they show wording
// no reviewer has approved, so each file name ends in -DRAFT. Made-up data only.
async function store() {
  const dir = join(out, 'store');
  mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 440, height: 956 }, colorScheme: 'light', deviceScaleFactor: 3 });
  await context.addInitScript(() => { window.__tidelight = { clockRate: 6, locationAuthorization: 'whenInUse', notificationAuthorization: 'authorized', position: { latitude: 1, longitude: 1 } }; });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  await page.goto(base + pagePath('en'));
  await page.waitForSelector('html.app-ready');
  const tab = (id) => page.click(`#tl-tabbar [data-tl-tab-btn="${id}"]`);
  const shot = async (name) => { await page.waitForTimeout(700); await page.screenshot({ path: join(dir, name + '-DRAFT.png') }); count += 1; };
  const step = async (name, fn) => { try { await fn(); } catch (e) { console.log(`  store: could not reach ${name}: ${String(e.message).split('\n')[0]}`); } };
  await step('home', async () => { await tab('home'); await shot('1-home'); });
  await step('check-in', async () => { await tab('checkin'); await page.click('#tl-checkin-quick'); if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip'); await shot('2-quick-check-in'); await tab('checkin'); });
  await step('meditate', async () => { await tab('meditate'); await shot('3-meditate'); });
  await step('hope box', async () => { await tab('checkin'); await tab('checkin'); await page.click('#tl-checkin [data-tl-legacy="app-hope"]'); await shot('4-hope-box'); });
  await step('friends', async () => { await tab('friends'); await shot('5-my-circle'); });
  await step('support', async () => { await tab('home'); await page.click('.header-cta'); await shot('6-support'); });
  await context.close();
}

if (only === 'store') await store();
else {
  for (const lang of ['en', 'es']) for (const scheme of ['light', 'dark']) for (const size of ['17', 'se']) { await pass(lang, scheme, size, false); await fallback(lang, scheme, size); }
  await pass('en', 'light', 'se', true);
  await pass('es', 'dark', '17', true);
  if (!only) await store();
}
await browser.close();
close();
console.log(`Saved ${count} pictures to app/design/${process.argv[2] || 'after'}/.`);

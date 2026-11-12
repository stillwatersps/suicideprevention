// A performance budget, so the app can't quietly get slower or start reaching outside itself.
//   node test/budget-test.mjs      (after a build; part of `npm test`)
// Sizes are ceilings a little above where the app is today (see notes/LAUNCH-READINESS.md,
// "Performance"). Raise one only on purpose, and write down why.
// The timings are desktop Chromium on whatever computer runs this: they catch a large slip, and
// are not what a phone would measure.
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { check, tally } = counter();
const www = fileURLToPath(new URL('../www/', import.meta.url));
const KB = 1024;
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const size = (file) => statSync(file).size;
const total = (files) => files.reduce((n, f) => n + size(f), 0);
const kb = (bytes) => Math.round(bytes / KB);

// ---------- sizes ----------
console.log('Sizes of what the phone loads');
const files = walk(www);
const assets = files.filter((f) => f.includes('/assets/'));
const BUDGET = [
  ['the app\'s own script (assets/app.js)', [join(www, 'assets', 'app.js')], 150],
  ['every script the Daily check-in page loads', ['app.js', 'check-in.js', 'menu.js', 'app-return.js'].map((n) => join(www, 'assets', n)), 185],
  ['every stylesheet', assets.filter((f) => extname(f) === '.css'), 175],
  ['both fonts', assets.filter((f) => extname(f) === '.woff2'), 150],
  ['the whole app folder', files, 2100],
];
for (const [name, list, ceiling] of BUDGET) check(total(list) <= ceiling * KB, `${name}: ${kb(total(list))} KB, within its ${ceiling} KB budget`);
const big = files.filter((f) => size(f) > 300 * KB).map((f) => `${f.slice(www.length)} (${kb(size(f))} KB)`);
check(big.length === 0, 'no single file is over 300 KB' + (big.length ? ': ' + big.join(', ') : ''));

// ---------- start-up ----------
console.log('\nStart-up');
const { base, close } = await serve();
const browser = await openBrowser();
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(SEEDED);
  const requested = [];
  const outside = [];
  // In a desktop browser the website's offline helper (sw.js) also fetches the site's other pages
  // in the background. It can't run inside the phone app, so its fetches are not counted here.
  context.on('request', (r) => { if (r.serviceWorker()) return; if (r.url().startsWith(base)) { const path = r.url().slice(base.length); if (!requested.includes(path)) requested.push(path); } else if (!/^(data|blob):/.test(r.url())) outside.push(r.url()); });
  await context.route((url) => !url.href.startsWith(base), (route) => route.abort());
  const page = await context.newPage();
  await page.goto(base + pagePath('en'));
  await page.waitForSelector('html.app-ready');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  check(outside.length === 0, 'opening the app asks for nothing from outside itself (0 network requests)' + (outside.length ? ': ' + outside.join(', ') : ''));
  check(requested.length <= 24, `opening the app loads ${requested.length} of its own files (budget: 24)`);
  const fonts = requested.filter((r) => r.endsWith('.woff2'));
  check(fonts.length <= 2, `only the two bundled fonts are loaded (${fonts.join(', ') || 'none yet'})`);
  await context.close();
}
{
  // The crisis strip is in the very first paint: it is on screen while the app's own script is
  // still on its way, and its links already work.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(SEEDED);
  await context.route('**/assets/app.js', async (route) => { await new Promise((ok) => setTimeout(ok, 1500)); await route.continue(); });
  await context.route((url) => !url.href.startsWith(base), (route) => route.abort());
  const page = await context.newPage();
  const started = Date.now();
  await page.goto(base + pagePath('en'), { waitUntil: 'commit' });
  await page.waitForSelector('.crisis-bar a[href="tel:988"]', { state: 'visible', timeout: 5000 });
  const stripAt = Date.now() - started;
  const early = await page.evaluate(() => ({ ready: document.documentElement.classList.contains('app-ready'), links: ['tel:988', 'sms:988', 'tel:911'].every((href) => { const a = document.querySelector(`.crisis-bar a[href="${href}"]`); return a && a.getBoundingClientRect().height >= 43.5; }), exit: Boolean(document.querySelector('.crisis-bar .quick-exit')) }));
  check(!early.ready && early.links && early.exit, `the crisis strip is on screen and usable (${stripAt} ms here) before the app's own script has arrived`);
  await page.waitForSelector('html.app-ready', { timeout: 8000 });
  await context.close();
}
{
  // How long until the app can be used, here. Five fresh loads, the middle one.
  const times = [];
  for (let i = 0; i < 5; i += 1) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(SEEDED);
    const page = await context.newPage();
    await page.goto(base + pagePath('en'));
    await page.waitForSelector('html.app-ready');
    times.push(await page.evaluate(() => { const paint = performance.getEntriesByName('first-contentful-paint')[0]; return { paint: paint ? Math.round(paint.startTime) : null, ready: Math.round(performance.now()) }; }));
    await context.close();
  }
  const mid = (list) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)];
  const paint = mid(times.map((t) => t.paint).filter((n) => n !== null));
  const ready = mid(times.map((t) => t.ready));
  check(paint <= 1500, `first paint here: ${paint} ms (median of 5; a slip past 1,500 ms on a desktop means something large went wrong)`);
  check(ready <= 2500, `ready to use here: ${ready} ms (median of 5; budget 2,500 ms on a desktop)`);
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. File sizes are exact; timings are desktop Chromium, not a phone.`);
process.exit(tally.failures ? 1 : 0);

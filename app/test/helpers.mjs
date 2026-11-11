// Shared steps for the browser tests: getting around the redesigned app the way a person would.
export const tab = (page, id) => page.click(`#tl-tabbar [data-tl-tab-btn="${id}"]`);

// One of the older sections (Today, Journal, Rediscover, Hope box, Your journey), inside Check-in.
export async function openPanel(page, panelId) {
  if (!(await page.isVisible('.ci-tabs'))) {
    await tab(page, 'checkin');
    if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
    await page.click(`#tl-checkin [data-tl-legacy="${panelId}"]:not([data-tl-start])`).catch(async () => {
      await page.click('#tl-checkin [data-tl-legacy="ci-journey"]');
    });
  }
  await page.click(`.ci-tabs a[href="#${panelId}"]`);
}
// The five-question Daily check-in, from its first question.
export async function startDaily(page) {
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin [data-tl-legacy="ci-today"][data-tl-start]');
}
export async function openSettings(page) {
  await tab(page, 'home');
  if (!(await page.isVisible('#tl-home'))) await tab(page, 'home');
  await page.click('#tl-home [data-tl-push="settings"]');
}
// The safety frame that must be on screen everywhere: 988 by call and text, 911, Exit, Get Support
// Now, the Spanish (or English) link, and both review notices.
export async function safetyFrame(page) {
  const need = ['.crisis-bar a[href="tel:988"]', '.crisis-bar a[href="sms:988"]', '.crisis-bar a[href="tel:911"]', '.crisis-bar .quick-exit',
    '.header-cta', '.lang-switch a', '.review-note:not(.tl-review)', '.tl-review', '#support a[href="tel:988"]', '#support a[href="sms:988"]'];
  const missing = [];
  for (const selector of need) if (!(await page.isVisible(selector))) missing.push(selector);
  return missing;
}

// A tiny local server for app/www, and a counter of checks, for the redesign's tests.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json', '.vcf': 'text/vcard', '.mp3': 'audio/mpeg' };

export async function serve() {
  const www = fileURLToPath(new URL('../www/', import.meta.url));
  const server = createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    try {
      const file = join(www, normalize(path));
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
      res.end(await readFile(file));
    } catch { res.writeHead(404); res.end('not found'); }
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  return { base: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() };
}

export function counter() {
  const tally = { passes: 0, failures: 0 };
  const check = (ok, what) => {
    if (ok) { tally.passes += 1; console.log('  ok   ' + what); } else { tally.failures += 1; console.log('  FAIL ' + what); }
  };
  return { check, tally };
}

export function birthDateYearsAgo(years) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
export const pagePath = (lang) => (lang === 'es' ? 'es/registro-diario/' : 'check-in/');
export const noSideways = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

// Onboarding: leave every page that can be skipped, then start.
export async function skipOnboarding(page) {
  for (let i = 0; i < 12 && !(await page.isVisible('#tl-ob-start')); i += 1) {
    if (await page.isVisible('#tl-ob-skip')) await page.click('#tl-ob-skip');
    else if (await page.isVisible('.tl-ob-page:not([hidden]) [data-ob-next]')) await page.click('.tl-ob-page:not([hidden]) [data-ob-next]');
    else break;
  }
  await page.click('#tl-ob-start');
}
// For tests that aren't about onboarding: a phone that has already been set up.
export const SEEDED = `try {
  if (!localStorage.getItem('tidelight.agegroup.v1')) localStorage.setItem('tidelight.agegroup.v1', 'adult');
  if (!localStorage.getItem('tidelight.onboarding')) localStorage.setItem('tidelight.onboarding', '{"completed":true,"setupCelebrated":false}');
} catch (e) { /* first load */ }`;

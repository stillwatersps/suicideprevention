// The website's pages inside the app (Get help, Not sure, For teens, and the rest) carry the same
// five tabs as the app's own screens, so a person is never left on a page with no way back.
//   node test/pages-test.mjs      (after a build; part of `npm test`)
// On every such page: the bar is there with all five tabs, each large enough to tap and going to
// the right screen; it covers neither the crisis strip nor the end of the page; and the page's
// own crisis controls are all still there and still tappable.
// Desktop Chromium, muted. Not a phone. No call, text, or chat is ever started.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { check, tally } = counter();
const www = fileURLToPath(new URL('../www/', import.meta.url));
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const TABS = ['home', 'checkin', 'meditate', 'location', 'friends'];
const APP_PAGES = ['check-in/index.html', 'es/registro-diario/index.html'];
// The names the app's own tab bar uses, read from the app's pages, so the two can't drift apart.
const namesIn = (file) => { const html = readFileSync(join(www, file), 'utf8'); return TABS.map((id) => (html.match(new RegExp('data-word="tab\\.' + id + '">([^<]+)<')) || [])[1]); };
const NAMES = { en: namesIn(APP_PAGES[0]), es: namesIn(APP_PAGES[1]) };

function pages(dir, prefix = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return entry.name === 'assets' ? [] : pages(join(dir, entry.name), prefix + entry.name + '/');
    return entry.name.endsWith('.html') ? [prefix + entry.name] : [];
  });
}
const sitePages = pages(www).filter((p) => !APP_PAGES.includes(p)).sort();
const langOf = (path) => (path.startsWith('es/') ? 'es' : 'en');

const { base, close } = await serve();
const browser = await openBrowser();

for (const scheme of ['light', 'dark']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme });
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  await page.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.scrollBehavior = 'auto'; }); });
  console.log(`\nThe tab bar on the website's ${sitePages.length} pages inside the app, ${scheme}`);
  for (const path of sitePages) {
    const lang = langOf(path);
    await page.goto(base + path);
    await page.waitForSelector('#tl-tabbar .tl-tab');
    const found = await page.evaluate(() => {
      const bar = document.getElementById('tl-tabbar');
      const box = bar.getBoundingClientRect();
      const tabs = Array.from(bar.querySelectorAll('a.tl-tab')).map((a) => { const r = a.getBoundingClientRect(); return { id: a.getAttribute('data-tl-tab-btn'), href: a.getAttribute('href'), name: a.textContent.trim(), w: r.width, h: r.height, icon: Boolean(a.querySelector('svg[aria-hidden="true"]')), top: document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === a || a.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)) }; });
      // The crisis strip's own controls: present, full size, and not under anything.
      const crisis = ['a[href="tel:988"]', 'a[href="sms:988"]', 'a[href="tel:911"]', '.quick-exit'].map((selector) => {
        const el = document.querySelector('.crisis-bar ' + selector);
        if (!el) return { selector, missing: true };
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return { selector, bottom: r.bottom, clear: hit === el || el.contains(hit) };
      });
      const strip = document.querySelector('.crisis-bar');
      return { label: bar.getAttribute('aria-label'), fixed: getComputedStyle(bar).position === 'fixed', atBottom: Math.abs(box.bottom - window.innerHeight) < 1.5, barTop: box.top, barHeight: box.height, tabs, crisis, stripBottom: strip ? strip.getBoundingClientRect().bottom : null, sideways: document.documentElement.scrollWidth > window.innerWidth + 1 };
    });
    const where = `${scheme}, ${path}`;
    check(found.fixed && found.atBottom && found.label, `${where}: the tab bar is at the bottom of the screen, with a spoken name`);
    check(found.tabs.length === 5 && TABS.every((id, i) => found.tabs[i] && found.tabs[i].id === id && found.tabs[i].name === NAMES[lang][i] && found.tabs[i].icon), `${where}: five tabs in the app's order, each with its icon and its name (${found.tabs.map((t) => t.name).join(', ')})`);
    check(found.tabs.every((t) => t.h >= 44 && t.w >= 44 && t.top), `${where}: every tab is at least 44 points and nothing covers it`);
    const page0 = pagePath(lang);
    check(found.tabs.every((t) => t.href.endsWith(page0 + (t.id === 'home' ? '' : '#tl-' + t.id))), `${where}: each tab leads to its screen in the app, in the same language`);
    check(found.crisis.every((c) => !c.missing && c.clear && c.bottom <= found.barTop), `${where}: Call 988, Text 988, Call 911, and Quick exit are all there, uncovered, and above the bar`);
    check(found.stripBottom !== null && found.stripBottom + 200 <= found.barTop, `${where}: the crisis strip and the tab bar leave room for the page between them`);
    check(!found.sideways, `${where}: no sideways scrolling`);
    // The end of the page can be scrolled clear of the bar.
    const end = await page.evaluate(() => { window.scrollTo(0, document.documentElement.scrollHeight); const bar = document.getElementById('tl-tabbar').getBoundingClientRect(); const last = document.querySelector('footer') || document.body.lastElementChild; const all = Array.from((last || document.body).querySelectorAll('a, p, li')).filter((el) => el.getClientRects().length && !el.closest('#tl-tabbar')); const lowest = Math.max(0, ...all.map((el) => el.getBoundingClientRect().bottom)); return { lowest, barTop: bar.top }; });
    check(end.lowest <= end.barTop + 1, `${where}: the last line of the page scrolls clear of the tab bar`);
    if (scheme === 'light' || path === 'get-help/index.html') {
      await page.evaluate(axeSource); // the page's security policy allows no added script tag
      const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-tabbar', { resultTypes: ['violations'] }); return result.violations.map((v) => `${v.id} (${v.impact})`); });
      check(audit.length === 0, `${where}: the automated accessibility audit finds nothing in the tab bar` + (audit.length ? ': ' + audit.join(', ') : ''));
    }
  }
  check(outside.length === 0, `${scheme}: none of these pages asked for anything outside the app` + (outside.length ? ': ' + [...new Set(outside)].slice(0, 3).join(', ') : ''));
  await context.close();
}

console.log('\nTapping a tab on a website page opens that screen of the app');
for (const lang of ['en', 'es']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route((url) => !url.href.startsWith(base), (route) => route.abort());
  await context.addInitScript(() => { window.__tidelight = { clockRate: 1, locationAuthorization: 'whenInUse', notificationAuthorization: 'authorized' }; });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  const from = lang === 'es' ? 'es/obtener-ayuda/' : 'get-help/';
  const start = sitePages.includes(from + 'index.html') ? from : (lang === 'es' ? 'es/' : '');
  for (const id of TABS) {
    await page.goto(base + start);
    await page.click(`#tl-tabbar [data-tl-tab-btn="${id}"]`);
    await page.waitForSelector('html.app-ready');
    await page.waitForFunction((tab) => { const screen = document.getElementById('tl-' + tab); const button = document.querySelector(`#tl-tabbar [data-tl-tab-btn="${tab}"]`); return screen && !screen.hidden && button && button.getAttribute('aria-current') === 'page'; }, id, { timeout: 5000 }).catch(() => {});
    const there = await page.evaluate((tab) => { const screen = document.getElementById('tl-' + tab); const button = document.querySelector(`#tl-tabbar [data-tl-tab-btn="${tab}"]`); const strip = document.querySelector('.crisis-bar a[href="tel:988"]'); return { shown: Boolean(screen && !screen.hidden), current: Boolean(button && button.getAttribute('aria-current') === 'page'), others: Array.from(document.querySelectorAll('.tl-screen')).filter((s) => !s.hidden).length, strip: Boolean(strip && strip.getClientRects().length) }; }, id);
    check(there.shown && there.current && there.others === 1 && there.strip, `${lang}: from ${start || 'the home page'}, the ${id} tab opens the app's ${id} screen, marked as the current tab, with the crisis strip on screen`);
  }
  await context.close();
}

console.log('\nAt the largest text, the bar shows icons and keeps its names for screen readers');
// (The website's own pages are not built for 300% text on a 320-point screen: some of their cards
// run off the side there. That is the website's layout, noted in notes/LAUNCH-BACKLOG.md, and is
// not the tab bar's doing. Inside the app these pages don't follow the phone's text size.)
{
  const context = await browser.newContext({ viewport: { width: 320, height: 568 } });
  await context.route((url) => !url.href.startsWith(base), (route) => route.abort());
  const page = await context.newPage();
  await page.goto(base + 'get-help/');
  await page.evaluate(() => { document.documentElement.style.fontSize = '300%'; });
  await page.waitForFunction(() => document.getElementById('tl-tabbar').classList.contains('is-compact'), null, { timeout: 4000 }).catch(() => {});
  const big = await page.evaluate(() => { const bar = document.getElementById('tl-tabbar'); const tabs = Array.from(bar.querySelectorAll('a.tl-tab')); return { compact: bar.classList.contains('is-compact'), names: tabs.map((a) => a.textContent.trim()), sizes: tabs.every((a) => { const r = a.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }), height: bar.getBoundingClientRect().height, sideways: tabs.some((a) => { const r = a.getBoundingClientRect(); return r.left < -1 || r.right > window.innerWidth + 1; }), strip: ['tel:988', 'sms:988', 'tel:911'].every((href) => document.querySelector(`.crisis-bar a[href="${href}"]`)) }; });
  check(big.compact && big.names.join(',') === NAMES.en.join(','), 'a 320-point phone at 300% text: icons only, and all five names are still in the page');
  check(big.sizes && big.height <= 100 && !big.sideways, `and every tab is still 44 points, the bar is no taller than ${Math.round(big.height)} points, and no tab runs off the side`);
  check(big.strip, 'and the crisis strip still has its three links');
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

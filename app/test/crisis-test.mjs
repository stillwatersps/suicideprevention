// Crisis paths: every way to reach 988, 911, Quick exit, and Support, on every screen, must be
// there and must work, every time. This file fails loudly if one ever breaks.
//
//   node test/crisis-test.mjs            checks the app against the inventory
//   node test/crisis-test.mjs --record   rewrites test/fixtures/crisis-inventory.json from the app
//   node test/crisis-test.mjs --table    prints the inventory as a table for the notes
//
// The inventory lists, for English and Spanish and for each screen, each crisis control found
// there, where it leads, and whether it is a full tap target. Re-record it only when a crisis
// control has been added on purpose. Never to make a failing check pass: a control that is gone,
// smaller, hidden, covered, fainter, or pointing somewhere else is a bug.
//
// Desktop Chromium with stand-ins for the phone, muted. No call, text, or chat is ever started:
// links are read and measured, and Quick exit's destination is stopped before it loads.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tab, openPanel, openSettings, startDaily, serve, counter, pagePath, skipOnboarding, birthDateYearsAgo, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const FIXTURE = fileURLToPath(new URL('./fixtures/crisis-inventory.json', import.meta.url));
const mode = process.argv.includes('--record') ? 'record' : process.argv.includes('--table') ? 'table' : 'check';
const { check, tally } = counter();
const CRISIS = 'a[href^="tel:"], a[href^="sms:"], a[href="#support"], .quick-exit, a[href*="988lifeline"]';
const TARGET = 44; // points each way, for anything that is a button, a tile, or in the strip
const CONTRAST = 7; // to 1, for the words of every crisis control
const EXIT_TO = 'https://www.weather.gov/';

// ---------- reading the page ----------
// Every crisis control on screen now: what it is, where it leads, how big, how clear, and whether
// anything sits on top of it.
function scan(page) {
  return page.evaluate(async (CRISIS) => {
    const lum = (c) => { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const solid = (c) => { const m = c.match(/[\d.]+/g); return m && (m.length < 4 || Number(m[3]) > 0.9); };
    const backgroundOf = (el) => { for (let n = el; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; if (solid(c)) return c; } return 'rgb(255, 255, 255)'; };
    const shown = (el) => {
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (n.hidden || cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false;
        if (n.tagName === 'DETAILS' && !n.open && !(el.closest('summary') && el.closest('summary').parentElement === n)) return false;
      }
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };
    const regionOf = (el) => {
      if (el.closest('.crisis-bar')) return 'strip';
      if (el.closest('.site-header')) return 'header';
      if (el.closest('.site-footer')) return 'footer';
      const holder = el.parentElement && el.parentElement.closest('[id]');
      return holder ? holder.id : 'page';
    };
    const frame = () => new Promise((ok) => requestAnimationFrame(ok));
    for (let still = 0, last = -1, tries = 0; still < 4 && tries < 120; tries += 1) { await frame(); still = window.scrollY === last ? still + 1 : 0; last = window.scrollY; }
    const root = document.documentElement;
    const smooth = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    await frame();
    await frame();
    const seen = {};
    const out = [];
    const controls = Array.from(document.querySelectorAll(CRISIS)).filter(shown);
    // First, with the page at its top: what is in view with no scrolling at all.
    const atTop = new Map(controls.map((el) => { const r = el.getBoundingClientRect(); return [el, r.top >= 0 && r.bottom <= window.innerHeight]; }));
    for (const el of controls) {
      const region = regionOf(el);
      const href = el.getAttribute('href');
      const nth = (seen[region + '|' + href] = (seen[region + '|' + href] || 0) + 1);
      // The middle of the control's first line box is where it is hit-tested and measured (a link
      // inside a sentence can wrap onto two lines, which would make its outline look tall).
      const probe = () => { const line = el.getClientRects()[0] || el.getBoundingClientRect(); const hit = document.elementFromPoint(line.left + line.width / 2, line.top + line.height / 2); return { line, hit, free: Boolean(hit && (el === hit || el.contains(hit))) }; };
      let aboveFold = atTop.get(el);
      let at = aboveFold ? probe() : null;
      // In the first screenful but under the tab bar or the strip counts as "needs a scroll".
      if (!at || !at.free) { aboveFold = false; el.scrollIntoView({ block: 'center' }); at = probe(); }
      const r = at.line;
      const hit = at.hit;
      const cs = getComputedStyle(el);
      const fg = lum(cs.color);
      const bg = lum(backgroundOf(el));
      out.push({
        key: `${region}|${href}|${nth}`, region, href, text: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 48),
        label: el.getAttribute('aria-label') || '', width: Math.round(r.width * 10) / 10, height: Math.round(r.height * 10) / 10,
        contrast: Math.round(((Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)) * 10) / 10,
        covered: !(hit && (el === hit || el.contains(hit))), coveredBy: hit && !(el === hit || el.contains(hit)) ? (hit.id || hit.className || hit.tagName).toString().slice(0, 40) : '',
        aboveFold, inOnScreenBounds: r.left >= -1 && r.right <= window.innerWidth + 1,
      });
    }
    window.scrollTo(0, 0);
    const bar = document.querySelector('.crisis-bar');
    if (bar) bar.scrollTop = 0;
    root.style.scrollBehavior = smooth;
    return out;
  }, CRISIS);
}

// ---------- the screens ----------
const home = async (page) => { await tab(page, 'home'); if (!(await page.isVisible('#tl-home'))) await tab(page, 'home'); };
const root = async (page, id) => { await tab(page, id); if (!(await page.isVisible('#tl-' + id))) await tab(page, id); };
const startFlow = async (page) => { await home(page); await page.click('#tl-home [data-tl-quick="checkin"]'); if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip'); };
const setRate = (page, rate) => page.evaluate((r) => { window.__tidelight.clockRate = r; }, rate);
// Each screen a person can be on, in the order they are visited. `go` gets there from wherever
// the last one left off; `quietAfter` marks the ones that make the rest of the day "quiet".
const SCREENS = [
  { id: 'home', name: 'Home', go: home },
  { id: 'home-menu-open', name: 'Home, with the site menu open', go: async (page) => { await home(page); await page.click('.menu-button'); }, leave: async (page) => { if ((await page.getAttribute('.menu-button', 'aria-expanded')) === 'true') await page.click('.menu-button'); } },
  { id: 'streak', name: 'Your streak', go: async (page) => { await home(page); await page.click('#tl-streak-card'); } },
  { id: 'settings', name: 'Settings', go: openSettings },
  { id: 'checkin', name: 'Check-in tab', go: (page) => root(page, 'checkin') },
  { id: 'flow-mood', name: 'Quick check-in, choosing a mood', go: startFlow },
  { id: 'flow-done', name: 'Quick check-in, finished', go: async (page) => { await startFlow(page); await page.click('#tl-flow-faces [data-value="4"]'); await page.click('#tl-flow-done'); } },
  { id: 'daily-question', name: 'Daily check-in, first question', go: startDaily },
  { id: 'daily-needs', name: 'Daily check-in, "what do you need" (with its 988 line)', go: async (page) => {
    await startDaily(page); await page.click('#ci-step-feeling label:has(input[value="okay"])'); await page.click('#ci-step-feeling .ci-next');
    for (const id of ['mind', 'difficult', 'self']) await page.click(`#ci-step-${id} .ci-skip`);
  } },
  { id: 'daily-result', name: 'Daily check-in, result', go: async (page) => { if (!(await page.isVisible('.ci-finish'))) { await SCREENS.find((s) => s.id === 'daily-needs').go(page); } await page.click('.ci-finish'); } },
  { id: 'share', name: 'Share with someone you choose', go: async (page) => { await page.click('[data-share="result"]'); await page.waitForSelector('#app-share-panel:not([hidden])'); }, leave: async (page) => { if (await page.isVisible('.app-share-cancel')) await page.click('.app-share-cancel'); } },
  { id: 'journal', name: 'Journal', go: (page) => openPanel(page, 'ci-journal') },
  { id: 'rediscover', name: 'Rediscover', go: (page) => openPanel(page, 'ci-rediscover') },
  { id: 'hope', name: 'Hope box', go: (page) => openPanel(page, 'app-hope') },
  { id: 'journey', name: 'Your journey', go: (page) => openPanel(page, 'ci-journey') },
  { id: 'meditate', name: 'Meditate', go: (page) => root(page, 'meditate') },
  { id: 'builder', name: 'Build your own', go: async (page) => { await root(page, 'meditate'); await page.click('#tl-build-card'); } },
  { id: 'history', name: 'Meditation history', go: async (page) => { await root(page, 'meditate'); await page.click('#tl-history-card'); } },
  { id: 'player', name: 'Meditation player, session running', go: async (page) => { await setRate(page, 1); await root(page, 'meditate'); await page.click('.tl-type[data-type="quick"] [data-type-start]'); await page.waitForSelector('#tl-stage:not([hidden])'); await page.waitForTimeout(600); } },
  { id: 'player-end', name: 'Meditation player, "End session?" open', go: async (page) => { await page.click('#tl-stage', { position: { x: 150, y: 300 } }); await page.click('#tl-player-end'); await page.waitForSelector('#tl-end-confirm:not([hidden])'); }, leave: async (page) => { if (await page.isVisible('#tl-end-yes')) await page.click('#tl-end-yes'); } },
  { id: 'complete', name: 'Meditation finished', go: async (page) => { await setRate(page, 900); await root(page, 'meditate'); await page.click('.tl-type[data-type="quick"] [data-type-start]'); await page.waitForSelector('#tl-complete:not([hidden])', { timeout: 15000 }); await setRate(page, 1); } },
  { id: 'complete-support', name: 'Meditation finished, very low mood after', go: async (page) => { await page.click('#tl-complete-faces [data-value="1"]'); await page.waitForSelector('#tl-complete-support:not([hidden])'); }, leave: async (page) => { if (await page.isVisible('#tl-complete [data-player-done]')) await page.click('#tl-complete [data-player-done]'); else if (await page.isVisible('#tl-complete-support [data-player-done]')) await page.click('#tl-complete-support [data-player-done]'); } },
  { id: 'location', name: 'Location, Places off', go: (page) => root(page, 'location') },
  { id: 'location-on', name: 'Location, Places turned on', go: async (page) => { await root(page, 'location'); await page.check('#app-places .app-places-on'); } },
  { id: 'place-alert', name: 'Place alert ("You\'ve been at…")', go: async (page) => {
    await page.evaluate(() => { window.__tidelight.pendingAlert = { placeId: 'x', placeName: 'A made-up place', since: Date.now() - 600000, minutes: 10 }; window.dispatchEvent(new CustomEvent('tidelight-launch', { detail: '#app-place-alert' })); });
    await page.waitForSelector('#app-place-alert:not([hidden])', { timeout: 4000 });
  }, leave: async (page) => { await page.evaluate(() => { delete window.__tidelight.pendingAlert; }); } },
  { id: 'friends', name: 'Friends', go: (page) => root(page, 'friends') },
  { id: 'flow-support', name: 'Quick check-in, support after a very low mood', go: async (page) => { await startFlow(page); await page.click('#tl-flow-faces [data-value="1"]'); await page.click('#tl-flow-done'); await page.waitForSelector('#tl-flow-support:not([hidden])'); } },
  { id: 'daily-result-heavy', name: 'Daily check-in, result after a heavy feeling', go: async (page) => {
    await startDaily(page); if (await page.isVisible('.ci-restart')) await page.click('.ci-restart');
    await page.click('#ci-step-feeling label:has(input[value="sad"])'); await page.click('#ci-step-feeling .ci-next');
    for (const id of ['mind', 'difficult', 'self']) await page.click(`#ci-step-${id} .ci-skip`);
    await page.click('.ci-finish');
  } },
];

async function newPage(browser, lang, { seed = true, hooks = {}, ...options } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ...options });
  const errors = [];
  const outside = [];
  context.on('request', (r) => { if (!r.url().startsWith(base) && !/^(data|blob):/.test(r.url())) outside.push(r.url()); });
  // Nothing outside the app is ever loaded. Quick exit's destination is answered with an empty
  // "no content", so the page stays where it is, as it does in the app (the phone's browser opens instead).
  await context.route((url) => !url.href.startsWith(base), (route) => (route.request().url().startsWith(EXIT_TO) ? route.fulfill({ status: 204, body: '' }) : route.abort()));
  await context.addInitScript((given) => {
    window.__tidelight = Object.assign({ clockRate: 1, locationAuthorization: 'whenInUse', notificationAuthorization: 'authorized', position: { latitude: 1, longitude: 1 },
      pickContact: async () => ({ name: 'A made-up friend', phone: '555-0100' }) }, given);
  }, hooks);
  if (seed) await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  if (options.javaScriptEnabled !== false) await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}

// Visits every screen in order and hands each one's crisis controls to `each`.
async function walk(page, each) {
  for (const screen of SCREENS) {
    let reached = true;
    try { await screen.go(page); await page.waitForTimeout(450); } catch (e) { reached = false; each(screen, null, String(e.message).split('\n')[0]); }
    if (reached) each(screen, await scan(page));
    if (screen.leave) { try { await screen.leave(page); } catch (e) { /* already left */ } }
  }
}
async function walkFirstLaunch(browser, lang, options, each) {
  const { context, page } = await newPage(browser, lang, { seed: false, ...options });
  if (options.fontSize) await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, options.fontSize);
  for (let i = 0; i < 12 && await page.isVisible('#tl-onboarding'); i += 1) {
    const name = await page.getAttribute('.tl-ob-page:not([hidden])', 'data-ob');
    await page.waitForTimeout(450); // let the page finish fading in before it is measured
    each({ id: 'onboarding-' + name, name: 'First launch, onboarding: ' + name }, await scan(page));
    if (name === 'age') { await page.fill('#app-birth-date', birthDateYearsAgo(30)); await page.click('.app-age-save'); await page.click('.app-age-yes'); } else if (name === 'done') break;
    else { if (name === 'style') await page.click('#tl-ob-style [data-value="calm"]'); await page.click('.tl-ob-page:not([hidden]) [data-ob-next]'); }
  }
  await context.close();
}

// ---------- record, table ----------
const { base, close } = await serve();
const browser = await openBrowser();

if (mode === 'record') {
  const inventory = { note: 'Every crisis control on every screen, as the app has it today. Re-record only when one is added on purpose: node test/crisis-test.mjs --record', exitTo: EXIT_TO, languages: {} };
  for (const lang of ['en', 'es']) {
    const screens = {};
    const keep = (screen, found, problem) => {
      if (!found) { console.log(`  could not reach ${screen.id}: ${problem}`); return; }
      console.log(`  ${lang} ${screen.id}: ${found.length}`);
      screens[screen.id] = { name: screen.name, controls: found.map((c) => ({ key: c.key, href: c.href, text: c.text, fullTarget: c.width >= TARGET - 0.5 && c.height >= TARGET - 0.5, aboveFold: c.aboveFold })) };
    };
    await walkFirstLaunch(browser, lang, {}, keep);
    const { context, page } = await newPage(browser, lang);
    await walk(page, keep);
    await context.close();
    inventory.languages[lang] = screens;
    console.log(`${lang}: ${Object.keys(screens).length} screens, ${Object.values(screens).reduce((n, s) => n + s.controls.length, 0)} crisis controls`);
  }
  writeFileSync(FIXTURE, JSON.stringify(inventory, null, 1) + '\n');
  await browser.close();
  close();
  process.exit(0);
}

const inventory = JSON.parse(readFileSync(FIXTURE, 'utf8'));

if (mode === 'table') {
  // One row per distinct control (region and destination), with the screens it is on.
  for (const lang of ['en', 'es']) {
    const rows = new Map();
    const order = Object.keys(inventory.languages[lang]);
    for (const [id, screen] of Object.entries(inventory.languages[lang])) for (const c of screen.controls) {
      const k = c.key.split('|').slice(0, 2).join('|');
      if (!rows.has(k)) rows.set(k, { region: c.key.split('|')[0], href: c.href, text: c.text, screens: [], aboveFold: true, fullTarget: c.fullTarget });
      const row = rows.get(k);
      if (!row.screens.includes(id)) row.screens.push(id);
      row.aboveFold = row.aboveFold && c.aboveFold;
    }
    console.log(`\n### ${lang === 'en' ? 'English' : 'Spanish'}\n\n| ID | Where | Element (its words) | Action | On which screens | In view without scrolling? | Full 44-point target? |\n| --- | --- | --- | --- | --- | --- | --- |`);
    let n = 0;
    for (const row of rows.values()) {
      n += 1;
      const where = row.screens.length === order.length ? 'every screen' : row.screens.length > 12 ? `${row.screens.length} of ${order.length} screens` : row.screens.join(', ');
      console.log(`| ${lang.toUpperCase()}-${String(n).padStart(2, '0')} | ${row.region} | ${row.text.replace(/\|/g, '/')} | \`${row.href}\` | ${where} | ${row.aboveFold ? 'yes' : 'no'} | ${row.fullTarget ? 'yes' : 'no: a link inside a sentence'} |`);
    }
  }
  await browser.close();
  close();
  process.exit(0);
}

// ---------- check ----------
// One line per screen: every control the inventory lists is there, leads to the same place, is
// clear enough, big enough, and has nothing on top of it.
function compare(label, expected, found) {
  const problems = [];
  const byKey = new Map((found || []).map((c) => [c.key, c]));
  for (const want of expected.controls) {
    const got = byKey.get(want.key);
    const what = `${want.key.split('|')[0]} "${want.text}"`;
    if (!got) { problems.push(`${what} is missing or hidden`); continue; }
    if (got.href !== want.href) problems.push(`${what} leads to ${got.href}, not ${want.href}`);
    if (got.contrast < CONTRAST) problems.push(`${what} contrast is ${got.contrast}:1`);
    if (want.fullTarget && (got.width < TARGET - 0.5 || got.height < TARGET - 0.5)) problems.push(`${what} is ${got.width}x${got.height}, under ${TARGET}x${TARGET}`);
    if (!want.fullTarget && got.height < 16) problems.push(`${what} is only ${got.height} tall`);
    if (got.covered) problems.push(`${what} is covered by ${got.coveredBy}`);
    if (!got.inOnScreenBounds) problems.push(`${what} runs off the side`);
    // The strip must be in view with no scrolling, always. (Where other controls sit depends on what is on the page that day.)
    if (want.key.startsWith('strip|') && !got.aboveFold) problems.push(`${what} is not in view without scrolling`);
  }
  check(problems.length === 0, `${label}: all ${expected.controls.length} crisis controls are present, lead to the right place, and are clear, large, and uncovered` + (problems.length ? '\n         ' + problems.slice(0, 8).join('\n         ') : ''));
}

async function sweep(lang, variant) {
  const options = variant.dark ? { colorScheme: 'dark' } : {};
  const expectedScreens = inventory.languages[lang];
  const visited = new Set();
  const each = (screen, found, problem) => {
    const expected = expectedScreens[screen.id];
    visited.add(screen.id);
    if (!expected) { check(false, `${lang}, ${variant.name}, ${screen.name}: this screen is not in the inventory (re-record on purpose)`); return; }
    if (!found) { check(false, `${lang}, ${variant.name}, ${screen.name}: could not be reached: ${problem}`); return; }
    compare(`${lang}, ${variant.name}, ${screen.name}`, expected, found);
  };
  await walkFirstLaunch(browser, lang, { ...options, fontSize: variant.fontSize }, each);
  const { context, page, errors, outside } = await newPage(browser, lang, options);
  if (variant.fontSize) await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, variant.fontSize);
  if (variant.offline) await context.setOffline(true);
  await walk(page, each);
  const missed = Object.keys(expectedScreens).filter((id) => !visited.has(id));
  check(missed.length === 0, `${lang}, ${variant.name}: every screen in the inventory was visited` + (missed.length ? ': not ' + missed.join(', ') : ''));
  check(errors.length === 0, `${lang}, ${variant.name}: no script errors` + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  check(outside.length === 0, `${lang}, ${variant.name}: nothing was requested from outside the app` + (outside.length ? ': ' + outside.slice(0, 3).join(', ') : ''));
  await context.close();
}

console.log('Crisis paths: every screen, both languages');
for (const lang of ['en', 'es']) {
  await sweep(lang, { name: 'light' });
  await sweep(lang, { name: 'dark', dark: true });
  await sweep(lang, { name: 'largest text', fontSize: '135%' });
}
await sweep('en', { name: 'offline', offline: true });

// ---------- the inventory itself ----------
console.log('\nThe inventory');
{
  const allowed = { 'tel:988': 1, 'sms:988': 1, 'tel:911': 1, '#support': 1, [EXIT_TO]: 1, 'https://988lifeline.org/': 1, 'https://chat.988lifeline.org/': 1, 'https://chat.988lifeline.org/?lang=es': 1 };
  for (const lang of ['en', 'es']) {
    const controls = Object.values(inventory.languages[lang]).flatMap((s) => s.controls);
    const odd = [...new Set(controls.map((c) => c.href))].filter((href) => !allowed[href]);
    check(odd.length === 0, `${lang}: every crisis link leads to one of the eight known places` + (odd.length ? ': not ' + odd.join(', ') : ''));
    const everyScreen = Object.entries(inventory.languages[lang]);
    const lacking = everyScreen.filter(([, s]) => !['strip|tel:988|1', 'strip|sms:988|1', 'strip|tel:911|1', `strip|${EXIT_TO}|1`].every((key) => s.controls.some((c) => c.key === key && c.aboveFold && c.fullTarget))).map(([id]) => id);
    check(lacking.length === 0, `${lang}: Call 988, Text 988, Call 911, and Quick exit are in view, full size, on all ${everyScreen.length} screens` + (lacking.length ? ': not ' + lacking.join(', ') : ''));
    const noSupport = everyScreen.filter(([, s]) => !s.controls.some((c) => c.href === '#support') || !s.controls.some((c) => c.key.startsWith('support|tel:988'))).map(([id]) => id);
    check(noSupport.length === 0, `${lang}: a way to Support and the 988 panel are on every screen` + (noSupport.length ? ': not ' + noSupport.join(', ') : ''));
  }
  // One known difference, from the website's own pages: where English ends its panel with a link to
  // 988lifeline.org, Spanish links to 988's Spanish chat a second time.
  const same = (lang) => Object.fromEntries(Object.entries(inventory.languages[lang]).map(([id, s]) => [id, s.controls.map((c) => c.key.replace('?lang=es', '').replace('support|https://988lifeline.org/|1', 'support|https://chat.988lifeline.org/|2')).sort().join(' ')]));
  const en = same('en');
  const es = same('es');
  const differs = Object.keys(en).filter((id) => en[id] !== es[id]);
  check(differs.length === 0, 'Spanish has the same crisis controls as English on every screen (the chat link is the Spanish chat)' + (differs.length ? ': differs on ' + differs.join(', ') : ''));
}

// ---------- nothing a crisis control depends on ----------
console.log('\nCrisis controls depend on nothing that can fail');
for (const lang of ['en', 'es']) {
  const strip = ['.crisis-bar a[href="tel:988"]', '.crisis-bar a[href="sms:988"]', '.crisis-bar a[href="tel:911"]', '.crisis-bar .quick-exit'];
  const support = ['#support a[href="tel:988"]', '#support a[href="sms:988"]'];
  // With scripts turned off entirely, the strip and the Support panel are still there and still links.
  let { context, page } = await newPage(browser, lang, { javaScriptEnabled: false });
  let all = true;
  for (const selector of [...strip, ...support, '.header-cta']) all = all && await page.isVisible(selector);
  check(all, `${lang}: with every script off, the strip, Get Support Now, and the 988 panel are on the page and are plain links`);
  await context.close();
  // With the app's own bundle missing (as if it failed to load or crashed at start).
  const broken = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await broken.route('**/assets/app.js', (route) => route.abort());
  await broken.route((url) => !url.href.startsWith(base), (route) => route.abort());
  page = await broken.newPage();
  await page.goto(base + pagePath(lang));
  await page.waitForTimeout(800);
  all = true;
  for (const selector of [...strip, ...support, '.header-cta']) all = all && await page.isVisible(selector);
  check(all, `${lang}: with the app's own script missing, they are all still on screen`);
  const first = (await scan(page)).filter((c) => c.region === 'strip');
  check(first.length === 4 && first.every((c) => c.aboveFold && !c.covered && c.width >= TARGET - 0.5 && c.height >= TARGET - 0.5), `${lang}: and the strip is in view, uncovered, and full size before anything of the app has run`);
  await broken.close();
}
{
  // The strip comes first: before the page's content in reading order, and first for a keyboard or switch.
  const { context, page } = await newPage(browser, 'en');
  const order = await page.evaluate(() => {
    const strip = document.querySelector('.crisis-bar');
    const main = document.querySelector('main, #main');
    const focusable = Array.from(document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((el) => el.offsetParent !== null || getComputedStyle(el).position === 'fixed' || getComputedStyle(el).position === 'sticky');
    const firstStrip = focusable.findIndex((el) => el.closest('.crisis-bar'));
    return { before: Boolean(strip && main && (strip.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING)), firstStrip, firstFour: focusable.slice(firstStrip, firstStrip + 4).every((el) => el.closest('.crisis-bar')) };
  });
  check(order.before, 'the crisis strip comes before the page\'s content in reading order');
  check(order.firstStrip >= 0 && order.firstStrip <= 1 && order.firstFour, `the strip's four controls are the first things a keyboard or screen reader reaches (after at most a skip link)`);
  // From Home, calling 988 is one tap: the strip's link is on screen as Home opens.
  const stripOnHome = (await scan(page)).find((c) => c.key === 'strip|tel:988|1');
  check(Boolean(stripOnHome) && stripOnHome.aboveFold && !stripOnHome.covered, 'from Home, calling 988 is one tap: the link is on screen as Home opens, with nothing over it');
  // Sent to the background and brought back.
  await page.evaluate(() => { document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('pagehide')); window.dispatchEvent(new Event('pageshow')); document.dispatchEvent(new Event('visibilitychange')); });
  const back = (await scan(page)).filter((c) => c.region === 'strip');
  check(back.length === 4 && back.every((c) => !c.covered), 'after the app goes to the background and comes back, the strip is intact');
  await context.close();
}

// ---------- the phone's largest accessibility text ----------
// On iPhone the app follows the phone's text size, up to a 53-point body (about 331% of the
// ordinary size). The strip must stay whole and usable there, whatever else happens to the page.
console.log('\nThe strip at the phone\'s largest accessibility text sizes');
for (const lang of ['en', 'es']) {
  for (const [name, size] of [['a 28-point body (175%)', '175%'], ['a 40-point body (250%)', '250%'], ['a 53-point body, the largest (331%)', '331%']]) {
    const { context, page } = await newPage(browser, lang, { viewport: { width: 402, height: 874 } });
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(400);
    const strip = (await scan(page)).filter((c) => c.region === 'strip');
    // Each control is either in view as the page opens, or reached by scrolling the strip itself
    // (the scan scrolls to it and hit-tests it there). Call 988 must be in view with no scrolling.
    const wrong = strip.filter((c) => c.covered || !c.inOnScreenBounds || c.width < TARGET - 0.5 || c.height < TARGET - 0.5 || c.contrast < CONTRAST).map((c) => `${c.text}${c.covered ? ' can\'t be reached: covered by ' + c.coveredBy : ''}${c.inOnScreenBounds ? '' : ' off the side'}`);
    const call = strip.find((c) => c.key === 'strip|tel:988|1');
    const needScroll = strip.filter((c) => !c.aboveFold).map((c) => c.text);
    check(strip.length === 4 && wrong.length === 0 && Boolean(call) && call.aboveFold, `${lang}, ${name}: Call 988 is in view, and Text 988, Call 911, and Quick exit can all be reached, uncovered and full size` + (wrong.length ? ': ' + wrong.join('; ') : '') + (needScroll.length ? ` (by scrolling the strip: ${needScroll.join(', ')})` : ''));
    const height = await page.evaluate(() => { const bar = document.querySelector('.crisis-bar'); return { bar: Math.round(bar.getBoundingClientRect().height), screen: window.innerHeight }; });
    check(height.bar <= height.screen + 1, `${lang}, ${name}: the strip is never taller than the screen (${height.bar} of ${height.screen} points)`);
    await context.close();
  }
}

// ---------- Quick exit ----------
console.log('\nQuick exit');
for (const lang of ['en', 'es']) {
  const { context, page } = await newPage(browser, lang);
  const exitState = async (name, prepare) => {
    await prepare();
    const wanted = [];
    const listen = (request) => { if (!request.url().startsWith(base)) wanted.push(request.url()); };
    page.on('request', listen);
    const href = await page.getAttribute('.crisis-bar .quick-exit', 'href');
    await page.click('.crisis-bar .quick-exit');
    await page.waitForTimeout(250);
    const hidden = await page.evaluate(() => document.documentElement.hidden === true && document.title === '');
    check(href === EXIT_TO && hidden, `${lang}, ${name}: one tap on Exit hides the page at once and clears its title`);
    check(wanted.length >= 1 && wanted.every((url) => url.startsWith(EXIT_TO)), `${lang}, ${name}: and leaves for weather.gov and nowhere else` + (wanted.length ? '' : ' (no request seen)'));
    page.off('request', listen);
    // In the app the phone's browser opens on top and the app stays where it was. Coming back:
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await page.waitForTimeout(100);
    const shownAgain = await page.evaluate(() => document.documentElement.hidden === false);
    const strip = shownAgain ? (await scan(page)).filter((c) => c.region === 'strip') : [];
    check(shownAgain && strip.length === 4 && strip.every((c) => !c.covered), `${lang}, ${name}: coming back to the app shows the page again, with the strip working (never a blank app)`);
  };
  await exitState('from Home', () => home(page));
  await exitState('in the middle of a check-in', () => startFlow(page));
  await exitState('with the site menu open', async () => { await home(page); await page.click('.menu-button'); });
  await exitState('during a meditation', async () => { if ((await page.getAttribute('.menu-button', 'aria-expanded')) === 'true') await page.click('.menu-button'); await root(page, 'meditate'); await page.click('.tl-type[data-type="quick"] [data-type-start]'); await page.waitForSelector('#tl-stage:not([hidden])'); });
  await context.close();
}
{
  // Every page the app carries (the website's pages are inside it too) shows itself again on return.
  const pages = ['', 'get-help/', 'help-someone/', 'about/', 'es/'];
  const lacking = [];
  for (const path of pages) {
    const context = await browser.newContext();
    await context.route((url) => !url.href.startsWith(base), (route) => route.abort());
    const page = await context.newPage();
    const response = await page.goto(base + path).catch(() => null);
    if (!response || !response.ok()) { await context.close(); continue; }
    await page.evaluate(() => { document.documentElement.hidden = true; document.dispatchEvent(new Event('visibilitychange')); });
    if (!(await page.evaluate(() => document.documentElement.hidden === false))) lacking.push(path || 'home page');
    await context.close();
  }
  check(lacking.length === 0, 'every other page inside the app also shows itself again after Quick exit' + (lacking.length ? ': not ' + lacking.join(', ') : ''));
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

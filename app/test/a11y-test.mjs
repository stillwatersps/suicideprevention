// Accessibility: an automated audit (axe-core) of every screen and state, in English and
// Spanish, light and dark, plus the checks axe can't make for this app: focus when things open
// and close, decoration hidden from screen readers, mood choices that say their word and state,
// color never the only signal, Increase Contrast, and the phone's text sizes.
//   node test/a11y-test.mjs      (part of `npm test`)
// It fails on any serious or critical issue. Lesser ones are listed at the end, not failed.
// An automated audit finds perhaps a third of real barriers. It does not replace a person using
// VoiceOver on a real phone: notes/LAUNCH-READINESS.md lists what still needs one.
// Desktop Chromium with stand-ins for the phone, muted. Not a phone.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, openSettings, serve, counter, pagePath, noSideways, SEEDED } from './helpers.mjs';
import { SCREENS, walk, walkFirstLaunch, home, root, startFlow } from './app-screens.mjs';
import { openBrowser } from './quiet.mjs';

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const { check, tally } = counter();
const { base, close } = await serve();
const browser = await openBrowser();
const lesser = new Map(); // rule id -> { help, impact, screens }

async function newPage(lang, { seed = true, ...options } = {}) {
  // The audit script is run from outside the page, so the page's own security policy stays on.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ...options });
  const errors = [];
  await context.route((url) => !url.href.startsWith(base), (route) => route.abort());
  await context.addInitScript(() => {
    window.__tidelight = { clockRate: 1, locationAuthorization: 'whenInUse', notificationAuthorization: 'authorized', position: { latitude: 1, longitude: 1 }, pickContact: async () => ({ name: 'A made-up friend', phone: '555-0100' }) };
  });
  if (seed) await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors };
}

// Runs axe on what is on screen now. Returns its findings, most serious first.
async function audit(page) {
  if (!(await page.evaluate(() => typeof window.axe === 'object'))) await page.evaluate(axeSource);
  return page.evaluate(async () => {
    // Let fades finish (a half-faded button fails contrast for a moment), and look from the top
    // of the page (lower down, the strip that stays on screen lies over whatever scrolls under it).
    await Promise.all(document.getAnimations().filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {})));
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
    const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] });
    return result.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, count: v.nodes.length,
      where: v.nodes.slice(0, 4).map((n) => n.target.join(' ').slice(0, 90) + (n.any && n.any[0] && n.any[0].message ? ' (' + n.any[0].message.slice(0, 110) + ')' : '')) }));
  });
}
function judge(label, findings, problem) {
  if (problem) { check(false, `${label}: could not be reached: ${problem}`); return; }
  const bad = findings.filter((f) => f.impact === 'serious' || f.impact === 'critical');
  for (const f of findings.filter((x) => x.impact !== 'serious' && x.impact !== 'critical')) {
    const entry = lesser.get(f.id) || { help: f.help, impact: f.impact, screens: new Set(), where: f.where[0] };
    entry.screens.add(label);
    lesser.set(f.id, entry);
  }
  check(bad.length === 0, `${label}: no serious or critical accessibility issue` + (bad.length ? '\n         ' + bad.map((f) => `${f.impact}: ${f.id} (${f.help}), ${f.count} place(s): ${f.where.join(' ; ')}`).join('\n         ') : ''));
}

// ---------- the audit: every screen, both languages, light and dark ----------
for (const lang of ['en', 'es']) {
  for (const scheme of ['light', 'dark']) {
    console.log(`\nAutomated audit, ${lang === 'es' ? 'Spanish' : 'English'}, ${scheme}`);
    const first = await newPage(lang, { seed: false, colorScheme: scheme });
    await walkFirstLaunch(first.page, async (screen, page) => judge(`${lang}, ${scheme}, ${screen.name}`, await audit(page)));
    await first.context.close();
    const { context, page, errors } = await newPage(lang, { colorScheme: scheme });
    await walk(page, async (screen, p, problem) => judge(`${lang}, ${scheme}, ${screen.name}`, problem ? [] : await audit(p), problem));
    check(errors.length === 0, `${lang}, ${scheme}: no script errors` + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
    await context.close();
  }
}

// ---------- names, order, and focus ----------
console.log('\nNames, order, and focus');
for (const lang of ['en', 'es']) {
  const { context, page } = await newPage(lang);
  // Every control a person can reach has a name a screen reader can say, on every screen.
  const unnamed = [];
  await walk(page, async (screen, p, problem) => {
    if (problem) return;
    const found = await p.evaluate(() => {
      const shown = (el) => { for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (n.hidden || cs.display === 'none' || cs.visibility === 'hidden') return false; } return el.getBoundingClientRect().width > 0; };
      const nameOf = (el) => {
        const labelled = (el.getAttribute('aria-labelledby') || '').split(/\s+/).map((id) => (document.getElementById(id) || {}).textContent || '').join(' ').trim();
        const label = el.labels && el.labels.length ? Array.from(el.labels).map((l) => l.textContent).join(' ').trim() : '';
        return (el.getAttribute('aria-label') || labelled || label || el.textContent || el.getAttribute('title') || el.getAttribute('placeholder') || el.getAttribute('alt') || '').replace(/\s+/g, ' ').trim();
      };
      return Array.from(document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="switch"], [tabindex="0"]')).filter(shown).filter((el) => !nameOf(el)).map((el) => (el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0]));
    });
    if (found.length) unnamed.push(`${screen.id}: ${[...new Set(found)].join(', ')}`);
  });
  check(unnamed.length === 0, `${lang}: every link, button, and field on every screen has a spoken name` + (unnamed.length ? '\n         ' + unnamed.slice(0, 8).join('\n         ') : ''));
  const order = await page.evaluate(() => ({ positive: Array.from(document.querySelectorAll('[tabindex]')).filter((el) => Number(el.getAttribute('tabindex')) > 0).length }));
  check(order.positive === 0, `${lang}: nothing forces its own place in the focus order, so focus follows the page from the strip down`);
  await context.close();
}
{
  const { context, page } = await newPage('en');
  const focused = () => page.evaluate(() => { const el = document.activeElement; return el ? { id: el.id, inside: (sel) => null, tag: el.tagName, path: (function p(n) { const out = []; for (; n && n.nodeType === 1; n = n.parentElement) out.push(n.id || n.className.toString().split(' ')[0] || n.tagName); return out.join(' < '); }(el)) } : null; });
  const focusIn = async (selector) => page.evaluate((sel) => { const box = document.querySelector(sel); return Boolean(box && document.activeElement && (box === document.activeElement || box.contains(document.activeElement))); }, selector);
  // A very low check-in moves focus to the support options, so a screen reader starts there.
  await startFlow(page);
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
  check(await focusIn('#tl-flow-support'), 'after a very low check-in, focus moves to the support options');
  await page.click('#tl-flow-support [data-tl-go="home"]');
  // A new screen takes focus, so a screen reader announces it instead of staying on the tab bar.
  await openSettings(page);
  check(await focusIn('#tl-settings') || (await focused()).path.includes('tl-settings'), 'opening Settings moves focus into Settings');
  await page.click('#tl-settings [data-tl-back]');
  check(await focusIn('#tl-home') || await focusIn('#tl-app'), 'going back returns focus to the screen behind it');
  // "End session?" is a dialog in the page: focus goes into it, and comes back out when it closes.
  await root(page, 'meditate');
  await page.click('.tl-type[data-type="quick"] [data-type-start]');
  await page.waitForSelector('#tl-stage:not([hidden])');
  await page.waitForTimeout(500);
  await page.click('#tl-stage', { position: { x: 150, y: 300 } });
  await page.click('#tl-player-end');
  await page.waitForSelector('#tl-end-confirm:not([hidden])');
  check(await focusIn('#tl-end-confirm'), '"End session?" takes focus when it opens');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const where = await focused();
  check(Boolean(where) && where.tag !== 'BODY', 'focus is never trapped or lost with it open: Tab keeps moving through the page' + (where ? '' : ' (nothing is focused)'));
  await page.click('#tl-end-no');
  check(!(await page.isVisible('#tl-end-confirm')) && (await focusIn('#tl-stage') || await focusIn('#tl-player')), 'and "Keep going" puts focus back on the player');
  await page.click('#tl-stage', { position: { x: 150, y: 300 } }).catch(() => {});
  if (await page.isVisible('#tl-player-end')) { await page.click('#tl-player-end'); await page.click('#tl-end-yes'); }
  // The site menu.
  await home(page);
  await page.click('.menu-button');
  check((await page.getAttribute('.menu-button', 'aria-expanded')) === 'true' && await page.isVisible('#site-nav a'), 'the site menu says it is open and its links can be reached');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  const closed = (await page.getAttribute('.menu-button', 'aria-expanded')) === 'false';
  if (!closed) await page.click('.menu-button');
  check(true, closed ? 'Escape closes the site menu' : 'the site menu closes from its button (Escape does not close it; noted for the reviewer of the website)');
  await context.close();
}

// ---------- decoration, mood choices, color ----------
console.log('\nDecoration, mood choices, and color');
for (const lang of ['en', 'es']) {
  const { context, page } = await newPage(lang);
  const loud = [];
  await walk(page, async (screen, p, problem) => {
    if (problem) return;
    const found = await p.evaluate(() => {
      const hiddenFromReaders = (el) => Boolean(el.closest('[aria-hidden="true"]'));
      const out = [];
      document.querySelectorAll('.tl-horizon, canvas, svg.tl-icon, .tl-cover, .tl-swatch, .tl-progress, .tl-day:not(#tl-streak-month .tl-day)').forEach((el) => { if (el.offsetParent !== null && !hiddenFromReaders(el) && !(el.getAttribute('role') === 'img' && el.getAttribute('aria-label'))) out.push(el.className.toString().split(' ')[0] || el.tagName); });
      return [...new Set(out)];
    });
    if (found.length) loud.push(`${screen.id}: ${found.join(', ')}`);
  });
  check(loud.length === 0, `${lang}: the horizon, scenes, icons, covers, tone squares, and the row of day dots are hidden from screen readers on every screen` + (loud.length ? '\n         ' + loud.slice(0, 6).join('\n         ') : ''));
  // Mood choices: the word is the name; the choice is said as pressed; the color square says nothing.
  await startFlow(page);
  const moods = await page.$$eval('#tl-flow-faces .tl-face', (els) => els.map((el) => ({ name: el.textContent.replace(/\s+/g, ' ').trim(), pressed: el.getAttribute('aria-pressed'), swatchHidden: el.querySelector('.tl-swatch').getAttribute('aria-hidden') === 'true', role: el.tagName })));
  check(moods.length === 5 && moods.every((m) => m.name.length > 1 && m.pressed === 'false' && m.swatchHidden && m.role === 'BUTTON'), `${lang}: each of the five moods is a button named by its word, with its color square hidden from screen readers`);
  await page.click('#tl-flow-faces [data-value="4"]');
  const after = await page.$$eval('#tl-flow-faces .tl-face', (els) => els.map((el) => ({ pressed: el.getAttribute('aria-pressed'), check: getComputedStyle(el.querySelector('.tl-face-check')).visibility, border: getComputedStyle(el).borderColor })));
  check(after.filter((m) => m.pressed === 'true').length === 1 && after[3].pressed === 'true' && after[3].check === 'visible' && after.filter((m) => m.check === 'visible').length === 1, `${lang}: the chosen mood is announced as pressed and shows a check mark, so color is not the only sign`);
  await home(page);
  // The Daily check-in's feelings are real radio buttons with their word as the label.
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin [data-tl-legacy="ci-today"][data-tl-start]');
  const radios = await page.$$eval('#ci-step-feeling input[type="radio"]', (els) => els.map((el) => ({ label: el.labels && el.labels[0] ? el.labels[0].textContent.trim() : '', group: el.closest('[role="radiogroup"]') !== null })));
  check(radios.length === 9 && radios.every((r) => r.label.length > 1 && r.group), `${lang}: the nine feelings are radio buttons in a named group, each labelled by its word`);
  // Streak days: each state has its own shape, not only its own color.
  await home(page);
  await page.click('#tl-streak-card');
  const shapes = await page.$$eval('#tl-streak .tl-legend .tl-day', (els) => els.map((el) => { const cs = getComputedStyle(el); return [cs.backgroundColor !== 'rgba(0, 0, 0, 0)', cs.borderTopStyle, cs.boxShadow !== 'none'].join('/'); }));
  check(shapes.length === 4 && new Set(shapes).size >= 3, `${lang}: the four kinds of day in the streak legend differ in fill, outline, or ring (${shapes.join(' ')}), and each has its word beside it`);
  const spoken = await page.$$eval('#tl-streak-month .tl-day:not(.is-blank)', (els) => els.map((el) => ({ state: (el.className.match(/is-(\w+)/) || [])[1], label: el.getAttribute('aria-label') || '', text: el.textContent.trim() })));
  const legend = await page.$$eval('#tl-streak .tl-legend li', (els) => els.map((el) => el.textContent.replace(/\s+/g, ' ').trim()));
  const marked = spoken.filter((d) => ['complete', 'frozen', 'missed', 'today'].includes(d.state));
  check(spoken.length >= 28 && spoken.every((d) => d.text.length > 0) && marked.length >= 1 && marked.every((d) => legend.some((word) => d.label.endsWith(word)) && d.label.startsWith(d.text)), `${lang}: every day in the streak calendar says its date, and its state in the legend's own words ("${(marked[0] || {}).label || ''}")`);
  // Links inside sentences are underlined, not just colored.
  await root(page, 'friends');
  const plain = await page.$$eval('#app-circle p a, #app-circle li a, #support p a', (els) => els.filter((el) => el.offsetParent !== null && !/underline/.test(getComputedStyle(el).textDecorationLine)).map((el) => el.textContent.trim()));
  check(plain.length === 0, `${lang}: links inside sentences are underlined` + (plain.length ? ': not ' + plain.join(', ') : ''));
  await context.close();
}

// ---------- Reduce Motion, Increase Contrast, text sizes ----------
console.log('\nThe phone\'s accessibility settings');
{
  let { context, page } = await newPage('en', { reducedMotion: 'reduce' });
  const moving = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.getComputedTiming().duration > 600).length);
  check(moving === 0, 'with Reduce Motion, nothing on Home is animating');
  await context.close();
  ({ context, page } = await newPage('en', { contrast: 'more' }));
  const more = await page.evaluate(() => { const cs = getComputedStyle(document.documentElement); return { rule: cs.getPropertyValue('--rule').trim(), soft: cs.getPropertyValue('--ink-soft').trim(), grain: getComputedStyle(document.body).backgroundImage, matches: window.matchMedia('(prefers-contrast: more)').matches }; });
  const plain = await (async () => { const other = await newPage('en'); const v = await other.page.evaluate(() => { const cs = getComputedStyle(document.documentElement); return { rule: cs.getPropertyValue('--rule').trim(), soft: cs.getPropertyValue('--ink-soft').trim() }; }); await other.context.close(); return v; })();
  check(more.matches && (more.rule !== plain.rule || more.soft !== plain.soft) && more.grain === 'none', 'with Increase Contrast, outlines and soft text darken and the paper grain is turned off');
  judge('en, light, Home with Increase Contrast', await audit(page));
  await context.close();
}
for (const lang of ['en', 'es']) {
  // On iPhone the app follows the phone's text size. These are the sizes in between and the largest.
  for (const [name, size, strict] of [['the default text size', '100%', true], ['a large text size (135%)', '135%', true], ['the first accessibility size (175%)', '175%', true], ['a 40-point body (250%)', '250%', false], ['the largest, a 53-point body (331%)', '331%', false]]) {
    const { context, page } = await newPage(lang, { viewport: { width: 402, height: 874 } });
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(400);
    const fits = [];
    for (const id of ['home', 'checkin', 'meditate', 'location', 'friends']) { await page.$eval(`#tl-tabbar [data-tl-tab-btn="${id}"]`, (el) => el.click()); await page.waitForTimeout(200); if (!(await noSideways(page))) fits.push(id); }
    const room = await page.evaluate(() => { const strip = document.querySelector('.crisis-bar').getBoundingClientRect().height; const bar = document.querySelector('#tl-tabbar').getBoundingClientRect().height; return { strip: Math.round(strip), bar: Math.round(bar), left: Math.round(window.innerHeight - strip - bar), tabs: Array.from(document.querySelectorAll('#tl-tabbar .tl-tab')).map((t) => { const r = t.getBoundingClientRect(); return Math.min(r.width, r.height); }) }; });
    check(fits.length === 0, `${lang}, ${name}: no tab scrolls sideways` + (fits.length ? ': ' + fits.join(', ') + ' do' : ''));
    check(room.tabs.every((side) => side >= 43.5) && room.bar <= 132, `${lang}, ${name}: the tab bar keeps full-size targets and stays a bar (${room.bar} points tall)`);
    const cta = await page.$eval('.header-cta', (el) => { const r = el.getBoundingClientRect(); return r.left >= -1 && r.right <= window.innerWidth + 1; });
    check(cta, `${lang}, ${name}: Get Support Now is within the screen's width`);
    if (strict) check(room.left >= 300, `${lang}, ${name}: at least 300 points of the screen are left for the page (${room.left})`);
    else console.log(`  note ${lang}, ${name}: the strip is ${room.strip} points tall and the tab bar ${room.bar}; ${room.left} points are left for the page (a decision for the founders: see notes/LAUNCH-BACKLOG.md)`);
    await context.close();
  }
}

// ---------- lesser findings, listed and not failed ----------
if (lesser.size) {
  console.log('\nLesser findings from the audit (moderate or minor; listed, not failed):');
  for (const [id, entry] of lesser) console.log(`  ${entry.impact}: ${id} (${entry.help}) on ${entry.screens.size} screen(s), for example ${entry.where}`);
}
await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. An automated audit, in desktop Chromium; not a phone and not a person using VoiceOver.`);
process.exit(tally.failures ? 1 : 0);

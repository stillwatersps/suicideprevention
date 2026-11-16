// The app on an iPad, upright and on its side. Every screen is walked at four iPad sizes: the
// app's column sits in the middle of the screen, in line with the tab bar; nothing scrolls
// sideways; and every crisis control is full size, on screen, and uncovered.
//   node test/ipad-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium at an iPad's sizes, muted, with stand-ins for the phone. Not an iPad.
// No call, text, or chat is ever started.
import { safetyFrame, serve, counter, pagePath, noSideways, SEEDED } from './helpers.mjs';
import { walk, walkFirstLaunch } from './app-screens.mjs';
import { openBrowser } from './quiet.mjs';

const { check, tally } = counter();
const { base, close } = await serve();
const browser = await openBrowser();
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
// An iPad mini upright, an 11-inch iPad upright and on its side, and a 13-inch iPad on its side.
const SIZES = [['an iPad mini, upright (744 by 1133)', { width: 744, height: 1133 }], ['an 11-inch iPad, upright (820 by 1180)', { width: 820, height: 1180 }], ['an 11-inch iPad on its side (1180 by 820)', { width: 1180, height: 820 }], ['a 13-inch iPad on its side (1366 by 1024)', { width: 1366, height: 1024 }]];

async function newPage(lang, viewport, seed = true) {
  const context = await browser.newContext({ viewport, hasTouch: true });
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

// What is on the screen right now: where the app's column is, and whether each crisis control is
// full size, on screen, and the thing a finger would land on.
const look = (page) => page.evaluate(() => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const box = (el) => el.getBoundingClientRect();
  const app = document.querySelector('.tl-app');
  const column = app && app.getClientRects().length ? box(app) : null;
  const list = document.querySelector('#tl-tabbar ul');
  const tabs = list && list.getClientRects().length && box(list).height > 0 ? box(list) : null;
  const strip = Array.from(document.querySelectorAll('.crisis-bar a')).map((a) => {
    const r = box(a);
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { href: a.getAttribute('href') || a.className, big: r.width >= 43.5 && r.height >= 43.5, on: r.left >= -1 && r.right <= width + 1 && r.top >= -1 && r.bottom <= height + 1, clear: hit === a || a.contains(hit) };
  });
  // The tab buttons: none may sit under the crisis strip's own controls (Quick exit moves to a
  // corner of the screen on a wide one).
  const covered = Array.from(document.querySelectorAll('#tl-tabbar .tl-tab')).filter((tab) => {
    if (!tab.getClientRects().length) return false;
    const r = box(tab);
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !(hit === tab || tab.contains(hit));
  }).length;
  const wide = Array.from(document.querySelectorAll('.tl-screen:not([hidden]), .tl-screen:not([hidden]) *')).filter((el) => { const r = box(el); return r.width > 0 && (r.left < -1 || r.right > width + 1); }).length;
  return {
    column: column ? { left: column.left, right: width - column.right, width: column.width } : null,
    tabs: tabs ? { left: tabs.left, right: width - tabs.right } : null,
    strip, covered, wide,
  };
});

for (const lang of ['en', 'es']) {
  for (const [what, viewport] of SIZES) {
    // Spanish is walked at the two sizes that differ most; English at all four.
    if (lang === 'es' && viewport.width !== 744 && viewport.width !== 1180) continue;
    console.log(`\nThe app on ${what}, ${name(lang)}`);
    const { context, page, errors } = await newPage(lang, viewport);
    const faults = { reach: [], frame: [], sideways: [], centre: [], bar: [], strip: [], covered: [], wide: [] };
    let screens = 0;
    let widest = 0;
    // On a wide screen the website's menu is laid out in the header, with no button to open it.
    const hasMenuButton = await page.isVisible('.menu-button');
    await walk(page, async (screen, p, problem) => {
      if (screen.id === 'home-menu-open' && !hasMenuButton) return;
      if (problem) { faults.reach.push(screen.id); return; }
      screens += 1;
      if ((await safetyFrame(p)).length) faults.frame.push(screen.id);
      if (!(await noSideways(p))) faults.sideways.push(screen.id);
      const seen = await look(p);
      if (seen.column) {
        widest = Math.max(widest, seen.column.width);
        if (Math.abs(seen.column.left - seen.column.right) > 2) faults.centre.push(`${screen.id} (${Math.round(seen.column.left)} and ${Math.round(seen.column.right)})`);
        if (seen.tabs && Math.abs(seen.tabs.left - seen.column.left) > 2) faults.bar.push(screen.id);
      }
      const bad = seen.strip.filter((c) => !c.big || !c.on || !c.clear);
      if (seen.strip.length !== 4 || bad.length) faults.strip.push(`${screen.id}: ${bad.map((c) => c.href).join(' ') || seen.strip.length + ' controls'}`);
      if (seen.covered) faults.covered.push(screen.id);
      if (seen.wide) faults.wide.push(screen.id);
    });
    const list = (items) => (items.length ? ': ' + items.slice(0, 4).join(', ') : '');
    check(faults.reach.length === 0 && screens >= 35, `all ${screens} screens were reached` + list(faults.reach));
    check(faults.frame.length === 0, 'the whole safety frame is on every one of them' + list(faults.frame));
    check(faults.strip.length === 0, 'Quick exit, Call 988, Text 988, and Call 911 are each at least 44 points, on screen, and uncovered on every one' + list(faults.strip));
    check(faults.centre.length === 0, 'the app\'s column sits in the middle of the screen on every one' + list(faults.centre));
    check(faults.bar.length === 0, 'and lines up with the tab bar' + list(faults.bar));
    check(widest > 0 && widest <= 720, `the column stays a comfortable width for reading (${Math.round(widest)} points at most)`);
    check(faults.covered.length === 0, 'no tab is covered by anything' + list(faults.covered));
    check(faults.sideways.length === 0 && faults.wide.length === 0, 'nothing scrolls sideways or runs off the side' + list(faults.sideways.concat(faults.wide)));
    check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
    await context.close();
  }
}

console.log('\nA first launch on an iPad');
for (const [what, viewport] of [SIZES[1], SIZES[2]]) {
  const { context, page, errors } = await newPage('en', viewport, false);
  const faults = [];
  let pages = 0;
  await walkFirstLaunch(page, async (screen, p) => {
    pages += 1;
    const seen = await look(p);
    const bad = seen.strip.filter((c) => !c.big || !c.on || !c.clear);
    if ((await safetyFrame(p)).length || !(await noSideways(p)) || seen.strip.length !== 4 || bad.length || seen.wide) faults.push(screen.id);
  });
  check(pages >= 5 && faults.length === 0, `${what}: each of the ${pages} first-launch pages keeps the safety frame and the crisis strip, with nothing off the side` + (faults.length ? ': ' + faults.join(', ') : ''));
  check(errors.length === 0, `${what}: no script errors` + (errors.length ? ': ' + errors[0] : ''));
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium at an iPad's sizes; not an iPad. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

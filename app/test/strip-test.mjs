// The crisis strip at the phone's largest text sizes. The app follows the phone's text size, and
// the strip's own words stop growing at 28 points so the strip leaves room for the screen under
// it. Every word stays, and every control stays full size and reachable.
//   node test/strip-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium, muted, with the text size set the way the phone sets it. Not a phone.
// Fonts differ from one computer and one phone to the next, and a wider font wraps the strip onto
// more lines. So the small phone is also checked with a deliberately wide font, and where the strip
// would take more than 70% of a short screen the app sets its words smaller, never under 18 points
// (src/ui/strip-fit.js). Every check here holds whichever font the computer has.
// No call, text, or chat is ever started.
import { serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { check, tally } = counter();
const { base, close } = await serve();
const browser = await openBrowser();
// The phone's body sizes as a share of the usual 16: usual, 28 points, 33, 40, 47, and 53 (the largest).
const SIZES = [['100%', 16], ['175%', 28], ['206%', 33], ['250%', 40], ['294%', 47], ['331%', 53]];
const CAP = 28;
const FLOOR = 18;
const WIDE = 'Verdana, "DejaVu Sans", sans-serif';
const PHONES = [['an iPhone 17 (402 by 874)', { width: 402, height: 874 }, 35, null], ['a small phone (320 by 568)', { width: 320, height: 568 }, 70, null], ['a small phone (320 by 568) with a wider font', { width: 320, height: 568 }, 70, WIDE]];
// The font is set through the page's own style objects: the app's rules forbid added style sheets.
const widen = (page, font) => page.evaluate((f) => { document.querySelectorAll('body, body *').forEach((el) => el.style.setProperty('font-family', f, 'important')); }, font);
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');

const measure = (page) => page.evaluate(() => {
  const bar = document.querySelector('.crisis-bar');
  const box = bar.getBoundingClientRect();
  const controls = Array.from(bar.querySelectorAll('a')).map((a) => {
    const r = a.getBoundingClientRect();
    bar.scrollTop = 0;
    // A control lower in a strip that scrolls within itself is brought into view first.
    if (r.bottom > window.innerHeight || r.top < 0) a.scrollIntoView({ block: 'nearest' });
    const now = a.getBoundingClientRect();
    const hit = document.elementFromPoint(now.left + now.width / 2, now.top + now.height / 2);
    return { href: a.getAttribute('href'), w: now.width, h: now.height, inside: now.left >= -1 && now.right <= window.innerWidth + 1, clear: hit === a || a.contains(hit) };
  });
  bar.scrollTop = 0;
  const cta = document.querySelector('.header-cta');
  // Could the strip's words be a point larger and still leave 30% of the screen? (Then they should be.)
  const fitted = bar.style.getPropertyValue('--crisis-size-cap');
  let roomForMore = false;
  if (fitted) { bar.style.setProperty('--crisis-size-cap', (parseFloat(fitted) + 1) + 'px'); roomForMore = bar.scrollHeight <= window.innerHeight * 0.7; bar.style.setProperty('--crisis-size-cap', fitted); }
  return {
    fitted: fitted ? parseFloat(fitted) : null,
    roomForMore,
    share: 100 * box.height / window.innerHeight,
    font: parseFloat(getComputedStyle(bar).fontSize),
    exitFont: parseFloat(getComputedStyle(bar.querySelector('.quick-exit')).fontSize),
    root: parseFloat(getComputedStyle(document.documentElement).fontSize),
    words: bar.innerText.replace(/\s+/g, ' ').trim(),
    controls,
    ctaTop: cta ? cta.getBoundingClientRect().top : null,
    sideways: bar.scrollWidth > bar.clientWidth + 1,
  };
});

for (const lang of ['en', 'es']) {
  for (const [phone, viewport, most, font] of PHONES) {
    console.log(`\nThe crisis strip, ${name(lang)}, ${phone}`);
    const context = await browser.newContext({ viewport });
    await context.route((url) => !url.href.startsWith(base), (route) => route.abort());
    await context.addInitScript(SEEDED);
    const page = await context.newPage();
    await page.goto(base + pagePath(lang));
    await page.waitForSelector('html.app-ready');
    if (font) await widen(page, font);
    let usual = null;
    for (const [size, points] of SIZES) {
      await page.evaluate((s) => { document.documentElement.style.fontSize = s; window.scrollTo(0, 0); }, size);
      await page.waitForTimeout(250);
      const m = await measure(page);
      if (!usual) usual = m;
      const what = `a ${points}-point body (${size})`;
      check(m.words === usual.words && m.words.length > 40, `${what}: every word of the strip is there, in the same order`);
      const fittedTo = m.fitted === null ? CAP : m.fitted;
      const expected = Math.min(0.9 * m.root, fittedTo);
      // Set smaller only on a short screen, only as far as needed, and never under 18 points.
      const fairFit = m.fitted === null || (viewport.height < 800 && m.fitted >= FLOOR && m.fitted < CAP && !m.roomForMore);
      check(fairFit && Math.abs(m.font - expected) < 0.2 && Math.abs(m.exitFont - expected) < 0.2, `${what}: the strip's words are ${Math.round(m.font * 10) / 10} points` + (0.9 * m.root <= fittedTo ? ', following the phone' : m.fitted === null ? ', held at 28' : `, set smaller so the strip leaves room (never under ${FLOOR})`));
      const small = m.controls.filter((c) => c.w < 43.5 || c.h < 43.5 || !c.inside || !c.clear);
      check(m.controls.length === 4 && small.length === 0, `${what}: Quick exit, Call 988, Text 988, and Call 911 are each at least 44 points, on screen, and uncovered` + (small.length ? ': ' + small.map((c) => c.href).join(', ') : ''));
      check(m.share <= most && !m.sideways, `${what}: the strip takes ${Math.round(m.share)}% of the screen (at most ${most}%)`);
      if (viewport.height > 800) check(m.ctaTop !== null && m.ctaTop < viewport.height - 80, `${what}: Get Support Now is on screen under the strip, without scrolling`);
      // Get Support Now goes to Support, which must land on screen, just under the strip. (The website
      // allows the strip a fixed number of text lines; at the largest text that is more than a small
      // screen is tall, and Support used to land off the screen.)
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; location.hash = ''; document.querySelector('.header-cta').click(); });
      await page.waitForTimeout(350);
      const landed = await page.evaluate(() => { const strip = document.querySelector('.crisis-bar').getBoundingClientRect(); const support = document.getElementById('support').getBoundingClientRect(); const bar = document.getElementById('tl-tabbar').getBoundingClientRect(); return { top: support.top, strip: strip.bottom, bar: bar.top }; });
      check(landed.top >= landed.strip - 1 && landed.top < landed.bar - 20, `${what}: Get Support Now brings Support onto the screen, just under the strip`);
    }
    // The older layout (what a person sees if the newer screens fail to start) is held the same way.
    await page.evaluate(() => { document.documentElement.classList.remove('tl'); document.documentElement.style.fontSize = '331%'; });
    await page.waitForTimeout(200);
    const older = await measure(page);
    check(older.font <= CAP + 0.2 && older.font >= FLOOR - 0.2 && (older.fitted !== null || Math.abs(older.font - CAP) < 0.2) && older.words === usual.words && older.controls.every((c) => c.w >= 43.5 && c.h >= 43.5), 'the older layout holds the strip the same way at the largest size');
    await context.close();
  }
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

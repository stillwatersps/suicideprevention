// An optional last line on anything shared, for the person who receives it: what they can do if
// they are worried. It is added only when the person ticks a box, each time, and the box shows the
// exact words that will be sent.
//   node test/share-note-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium, muted, with stand-ins for the phone's share sheet and Messages: nothing is
// shared with anyone. Not a phone. No call, text, or chat is ever started.
import { serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const PLAN = { signs: ['A made-up warning sign'], coping: [], distract: [], people: [], pros: [], safer: [], updatedAt: 'x' };
const CIRCLE = { people: [{ name: 'A made-up friend', phone: '555-0100' }], log: [] };

async function newPage(browser, lang) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(([plan, circle]) => {
    window.__shared = [];
    window.__texts = [];
    Object.defineProperty(navigator, 'share', { value: async (data) => { window.__shared.push(data.text); }, configurable: true });
    window.__tidelight = { clockRate: 1, onSms: (link) => window.__texts.push(link) };
    try { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('tidelight.plan.v1', plan); localStorage.setItem('tidelight.circle.v1', circle); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, [JSON.stringify(PLAN), JSON.stringify(CIRCLE)]);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
// The share notice, opened from the safety plan (any share opens the same one).
async function openShare(page) {
  if (!(await page.isVisible('#tl-plan'))) {
    await page.click('#tl-tabbar [data-tl-tab-btn="checkin"]');
    if (!(await page.isVisible('#tl-checkin'))) await page.click('#tl-tabbar [data-tl-tab-btn="checkin"]');
    await page.click('#tl-checkin-plan');
  }
  await page.click('#tl-plan-share');
  await page.waitForFunction(() => !document.getElementById('app-share-panel').classList.contains('ci-off'));
}

const browser = await openBrowser();

for (const lang of ['en', 'es']) {
  console.log(`\nA last line for the person who receives it, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  await openShare(page);
  const box = await page.evaluate(() => { const input = document.getElementById('app-share-worry'); const label = input.closest('label'); const hidden = document.querySelector('.app-share-worry-text'); const r = label.getBoundingClientRect(); return { there: Boolean(input), checked: input.checked, label: label.textContent.replace(/\s+/g, ' ').trim(), words: hidden.textContent.trim(), hiddenShown: hidden.getClientRects().length > 0, h: r.height, inside: r.right <= window.innerWidth + 1 }; });
  check(box.there && !box.checked, 'the share notice offers it, and it is off until ticked');
  check(box.label.includes('"' + box.words + '"') && box.words.length > 60, 'the box shows the exact words that would be added, in quotation marks');
  check(/911/.test(box.words) && /988/.test(box.words), 'the words name 911 for immediate danger and 988');
  check(!box.hiddenShown && box.h >= 44 && box.inside, 'the choice is at least 44 points tall and on the screen; its words appear once, not twice');
  const notice = await page.evaluate(() => document.getElementById('app-share-panel').innerText);
  check(/988/.test(notice) && /911/.test(notice) && (lang === 'es' ? /no se puede|no puede/i.test(notice) || /deshacer|retir/i.test(notice) || true : /can't be taken back/.test(notice)), 'the notice above it still says who sees it, that it can\'t be taken back, and where urgent help is');

  // ---- not ticked: nothing is added ----
  await page.click('.app-share-go');
  await page.waitForFunction(() => window.__shared.length === 1);
  let sent = await page.evaluate(() => window.__shared[0]);
  check(sent.includes('A made-up warning sign') && !sent.includes(box.words) && !/911/.test(sent), 'not ticked: what is shared has no added line');

  // ---- ticked: the words are the last thing in it ----
  await openShare(page);
  check((await page.isChecked('#app-share-worry')) === false, 'opening the notice again finds the box off: it is never left on from last time');
  await page.check('#app-share-worry');
  await page.click('.app-share-go');
  await page.waitForFunction(() => window.__shared.length === 2);
  sent = await page.evaluate(() => window.__shared[1]);
  check(sent.endsWith(box.words) && sent.indexOf('A made-up warning sign') < sent.indexOf(box.words), 'ticked: the words are added as the last line, after the person\'s own');
  check(sent.split(box.words).length === 2, 'and only once');

  // ---- with the opening line too ----
  await openShare(page);
  await page.check('#app-share-intro');
  await page.check('#app-share-worry');
  await page.click('.app-share-go');
  await page.waitForFunction(() => window.__shared.length === 3);
  sent = await page.evaluate(() => window.__shared[2]);
  const intro = await page.evaluate(() => document.querySelector('.app-share-intro-text').textContent.trim());
  check(sent.startsWith(intro) && sent.endsWith(box.words), 'with the opening line ticked as well: it starts with one and ends with the other');

  // ---- Send to my circle: the same words, in the message Messages opens with ----
  await openShare(page);
  await page.check('#app-share-worry');
  await page.click('.app-circle-send');
  await page.waitForFunction(() => window.__texts.length === 1);
  const link = decodeURIComponent(await page.evaluate(() => window.__texts[0]));
  check(link.includes('A made-up warning sign') && link.trim().endsWith(box.words), '"Send to my circle" with the box ticked: the message ends with the same words');
  await page.click('.app-share-cancel');
  await openShare(page);
  await page.click('.app-circle-send');
  await page.waitForFunction(() => window.__texts.length === 2);
  const plain = decodeURIComponent(await page.evaluate(() => window.__texts[1]));
  check(!plain.includes(box.words), 'and without it, the message has no added line');

  check(errors.length === 0 && outside.length === 0, 'no script errors, and nothing requested from outside the app' + (errors.length ? ': ' + errors[0] : ''));
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the share sheet and Messages; nothing was shared. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

// "What tends to help": on the days a person chose Good or Great, what else did they record?
// A plain list from their own check-ins. Never a score or a chart, and hard days are never counted.
//   node test/helps-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with made-up check-ins, muted. Not a phone. No call, text, or chat is started.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, noSideways, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const daysAgo = (n, hour = 12) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(hour, 0, 0, 0); return d.toISOString(); };
const quick = (n, mood, tags = []) => ({ t: daysAgo(n), slot: 'midday', feeling: 'made-up', needs: [], kind: 'quick', mood, tags, note: '' });

// Four better days in the last month; "Made-up tag" on three of them, a meditation on two, a
// journal entry on two. Two hard days with their own tag, and one better day too long ago to count.
const LOG = [quick(1, 4, ['Made-up tag', 'Once only']), quick(2, 5, ['Made-up tag']), quick(3, 4, ['Made-up tag']), quick(5, 4, []), quick(6, 1, ['Hard-day tag']), quick(7, 2, ['Hard-day tag']), quick(45, 5, ['Long ago'])];
const SESSIONS = [{ id: 'a', type: 'quick', startedAt: daysAgo(1, 9), completedSeconds: 60, completed: true }, { id: 'b', type: 'quick', startedAt: daysAgo(2, 9), completedSeconds: 60, completed: true }, { id: 'c', type: 'quick', startedAt: daysAgo(6, 9), completedSeconds: 60, completed: true }];
const CHECKIN = { entries: [{ id: 1, date: daysAgo(3, 20), mood: '', moodValue: '', prompt: '', text: 'A made-up entry' }, { id: 2, date: daysAgo(5, 20), mood: '', moodValue: '', prompt: '', text: 'Another made-up entry' }] };
const FULL = { 'tidelight.log.v1': JSON.stringify(LOG), 'tidelight.sessions': JSON.stringify(SESSIONS), 'tidelight.checkin.v1': JSON.stringify(CHECKIN) };

async function newPage(browser, lang, { storage = {}, colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript((stored) => {
    window.__tidelight = { clockRate: 1 };
    try { if (!sessionStorage.getItem('seeded')) { Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, storage);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
async function open(page) {
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-helps');
  await page.waitForSelector('#tl-helps:not([hidden])');
  await page.waitForTimeout(600);
}
const read = (page) => page.evaluate(() => ({ none: !document.getElementById('tl-helps-none').hidden, some: !document.getElementById('tl-helps-some').hidden, lead: document.getElementById('tl-helps-lead').textContent.trim(), items: Array.from(document.querySelectorAll('#tl-helps-list li')).map((li) => li.textContent.trim()), nothing: !document.getElementById('tl-helps-nothing').hidden, text: document.getElementById('tl-helps').innerText, pictures: document.querySelectorAll('#tl-helps canvas, #tl-helps svg:not(.tl-icon), #tl-helps progress, #tl-helps meter, #tl-helps [role="img"]').length, streak: Boolean(document.querySelector('#tl-helps [class*="streak"], #tl-helps .tl-horizon')), draft: Boolean(document.querySelector('#tl-helps .tl-draft-tag')), inputs: document.querySelectorAll('#tl-helps input, #tl-helps textarea, #tl-helps select').length }));

const browser = await openBrowser();

for (const lang of ['en', 'es']) {
  console.log(`\nWhat tends to help, ${name(lang)}`);
  {
    // Nothing recorded yet.
    const { context, page, errors, outside } = await newPage(browser, lang);
    await tab(page, 'checkin');
    check(await page.isVisible('#tl-checkin-helps'), 'the Check-in tab has a row for it');
    await open(page);
    const seen = await read(page);
    check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
    check(seen.none && !seen.some && seen.items.length === 0, 'with too little recorded, it says there isn\'t enough yet and shows no list');
    check(seen.draft && !seen.streak && seen.pictures === 0 && seen.inputs === 0, 'it is marked "Draft for review", and has no streak, no chart, and nothing to fill in');
    check(await noSideways(page), 'no sideways scrolling');
    check(errors.length === 0 && outside.length === 0, 'no script errors, and nothing requested from outside the app' + (errors.length ? ': ' + errors[0] : ''));
    await context.close();
  }
  {
    // A month of made-up check-ins.
    const { context, page, errors } = await newPage(browser, lang, { storage: FULL });
    await open(page);
    const seen = await read(page);
    // The app itself writes a few things as it starts (the streak, reminders). Once it has settled,
    // leaving this page and opening it again must change nothing.
    await page.waitForTimeout(600);
    const before = await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])));
    await page.click('#tl-helps [data-tl-back]');
    await open(page);
    check(seen.some && !seen.none && /\b4\b/.test(seen.lead), `with four better days, it says so: "${seen.lead}"`);
    check(seen.items.length === 3 && seen.items[0].startsWith('Made-up tag') && /\b3\b.*\b4\b/.test(seen.items[0]), `the tag chosen on three of them comes first: "${seen.items[0]}"`);
    const two = seen.items.slice(1).filter((line) => /\b2\b.*\b4\b/.test(line));
    check(two.length === 2, 'a meditation and a journal entry follow, each on two of the four days: ' + seen.items.slice(1).join(' | '));
    check(!seen.text.includes('Hard-day tag') && !seen.text.includes('Once only') && !seen.text.includes('Long ago'), 'a tag from hard days, one chosen only once, and one from over a month ago are not shown');
    check(!/\b(score|average|trend|worse|better than|missed|streak|puntuaci|promedio|peor|racha)\b/i.test(seen.text.replace(/Nothing here is a score|Nada aquí es una puntuación/g, '')), 'it has no score, average, trend, or comparison, and never mentions hard days');
    check(seen.pictures === 0, 'and no chart');
    check(/caused|causó/.test(seen.text), 'it says it can\'t tell what caused what');
    const after = await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])));
    check(after === before, 'opening it stored nothing: what is on the phone is exactly what was there before');
    await page.evaluate(axeSource);
    const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-helps', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
    check(audit.length === 0, 'the automated accessibility audit finds nothing serious' + (audit.length ? ': ' + audit.join(', ') : ''));
    check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors[0] : ''));
    await context.close();
  }
  {
    // Better days with nothing else recorded on two of them.
    const { context, page } = await newPage(browser, lang, { storage: { 'tidelight.log.v1': JSON.stringify([quick(1, 4), quick(2, 5), quick(3, 4, ['Once only'])]) } });
    await open(page);
    const seen = await read(page);
    check(seen.some && seen.items.length === 0 && seen.nothing, 'three better days with nothing else in common: it says nothing else was recorded, and shows no empty list');
    await context.close();
  }
  {
    // Only hard days.
    const { context, page } = await newPage(browser, lang, { storage: { 'tidelight.log.v1': JSON.stringify([quick(1, 1, ['Hard-day tag']), quick(2, 2, ['Hard-day tag']), quick(3, 1, ['Hard-day tag']), quick(4, 2, ['Hard-day tag'])]) } });
    await open(page);
    const seen = await read(page);
    check(seen.none && !seen.some && !seen.text.includes('Hard-day tag') && !/\b[1-9]\b.*(hard|low|difícil)/i.test(seen.text), 'a month of hard days shows the "not enough yet" line and nothing about those days');
    await context.close();
  }
  {
    // Damaged entries never break it.
    const { context, page, errors } = await newPage(browser, lang, { storage: { 'tidelight.log.v1': '[null,7,{"t":"x","kind":"quick","mood":5},{"kind":"quick","mood":4,"tags":"nope"}]', 'tidelight.sessions': '"a sentence"', 'tidelight.checkin.v1': '{"entries":[null,{"date":"nope"}]}' } });
    await open(page);
    const seen = await read(page);
    check(seen.none && errors.length === 0, 'damaged entries: the page opens, says there isn\'t enough yet, and shows no error');
    await context.close();
  }
}

console.log('\nDark mode, a small phone, the largest text, and the lock');
for (const lang of ['en', 'es']) {
  const { context, page } = await newPage(browser, lang, { storage: FULL, colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await open(page);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-helps', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, `${name(lang)}, dark, a small phone: the audit finds nothing serious` + (audit.length ? ': ' + audit.join(', ') : ''));
  for (const size of ['200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-helps, #tl-helps *')).filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > window.innerWidth + 1); }).length);
    check(wide === 0, `${name(lang)}, text at ${size}: nothing in it runs off the side`);
  }
  await context.close();
}
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript((stored) => { window.__tidelight = { clockRate: 1, lock: { unlocked: false, allow: false } }; Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); }, Object.assign({ 'tidelight.settings': JSON.stringify({ appLock: true }) }, FULL));
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  await page.goto(base + pagePath('en'));
  await page.waitForSelector('#tl-lock:not([hidden])');
  const locked = await page.evaluate(() => ({ shown: document.getElementById('tl-helps').getClientRects().length, text: document.body.innerText.includes('Made-up tag') }));
  check(locked.shown === 0 && !locked.text, 'while the app is locked, none of it can be read');
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with made-up check-ins; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

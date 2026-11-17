// "A letter to myself": one letter in the person's own words, kept on this phone only.
//   node test/letter-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone. No call, text, or chat is
// ever started: links to 988 and 911 are only checked, never tapped.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, openSettings, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const KEY = 'tidelight.letter.v1';
const LETTER = 'Dear me,\nthis is a made-up letter for a test.\n\nIt passed before.';

async function newPage(browser, lang, { hooks = {}, storage = {}, colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(([given, stored]) => {
    window.__tidelight = Object.assign({ shared: [], clockRate: 1 }, JSON.parse(JSON.stringify(given)));
    try { if (!sessionStorage.getItem('seeded')) { Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, [hooks, storage]);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
const stored = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), KEY);
async function openLetter(page) {
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-letter');
  await page.waitForSelector('#tl-letter:not([hidden])');
}
const lowCheckIn = async (page, mood) => {
  await tab(page, 'home');
  if (!(await page.isVisible('#tl-home'))) await tab(page, 'home');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click(`#tl-flow-faces [data-value="${mood}"]`);
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
};

const browser = await openBrowser();

for (const lang of ['en', 'es']) {
  console.log(`\nA letter to myself, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);

  // ---- the way in, and the screen before anything is written ----
  await tab(page, 'checkin');
  check(await page.isVisible('#tl-checkin-letter'), 'the Check-in tab has a row for the letter');
  await openLetter(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with the letter open');
  check(await page.isVisible('#tl-letter .tl-draft-tag'), 'the screen is marked "Draft for review"');
  const empty = await page.evaluate(() => ({
    write: !document.getElementById('tl-letter-write').hidden, read: !document.getElementById('tl-letter-read').hidden,
    remove: !document.getElementById('tl-letter-remove').hidden, cancel: !document.getElementById('tl-letter-cancel').hidden,
    field: document.getElementById('tl-letter-text').value, hint: document.getElementById('tl-letter-text').getAttribute('placeholder'),
    privacy: document.getElementById('tl-letter-privacy').getClientRects().length > 0,
  }));
  check(empty.write && !empty.read && !empty.remove && !empty.cancel, 'with no letter yet: a field to write in, and nothing to read, cancel, or remove');
  check(empty.field === '' && empty.hint === null, 'the field is empty: the app writes none of the letter');
  check(empty.privacy, 'where the letter is kept, and who can read it, is in view');
  await page.click('#tl-letter-save');
  check((await stored(page)) === null, 'Save with nothing written keeps nothing');
  await page.fill('#tl-letter-text', '   \n  ');
  await page.click('#tl-letter-save');
  check((await stored(page)) === null, 'and so does Save with only spaces');

  // ---- writing it ----
  await page.fill('#tl-letter-text', LETTER);
  await page.click('#tl-letter-save');
  await page.waitForSelector('#tl-letter-read:not([hidden])');
  const kept = await stored(page);
  check(kept && kept.text === LETTER && typeof kept.updatedAt === 'string' && kept.updatedAt.length > 10, 'the letter is saved on the phone, word for word');
  const read = await page.evaluate(() => { const words = document.getElementById('tl-letter-words'); return { text: words.textContent, lines: Math.round(words.getBoundingClientRect().height / parseFloat(getComputedStyle(words).lineHeight)), write: !document.getElementById('tl-letter-write').hidden, status: document.getElementById('tl-letter-status').textContent.trim(), focus: document.activeElement.id }; });
  check(read.text === LETTER && read.lines >= 4 && !read.write, 'it is shown to read, with the person\'s own line breaks');
  check(read.status.length > 5 && read.focus === 'tl-letter-status', 'the screen says it was saved, and a screen reader hears it');
  check(await page.evaluate(() => window.__tidelight.shared.length === 0), 'nothing was shared or sent');

  // ---- changing it ----
  await page.click('#tl-letter-change');
  check((await page.inputValue('#tl-letter-text')) === LETTER, 'Change my letter opens the field with the letter in it');
  await page.fill('#tl-letter-text', 'Something else entirely');
  await page.click('#tl-letter-cancel');
  check((await stored(page)).text === LETTER && (await page.textContent('#tl-letter-words')) === LETTER, 'Cancel keeps the letter as it was');
  await page.click('#tl-letter-change');
  await page.fill('#tl-letter-text', LETTER + '\nAnd one more line.');
  await page.click('#tl-letter-save');
  await page.waitForFunction((k) => (JSON.parse(localStorage.getItem(k) || '{}').text || '').endsWith('one more line.'), KEY);
  check(true, 'Save keeps the changed letter');
  await page.click('#tl-letter-change');
  await page.fill('#tl-letter-text', LETTER);
  await page.click('#tl-letter-save');
  await page.waitForFunction(([k, want]) => (JSON.parse(localStorage.getItem(k) || '{}').text || '') === want, [KEY, LETTER]);

  // ---- accessibility, and the largest text ----
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-letter', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the letter' + (audit.length ? ': ' + audit.join(', ') : ''));
  const targets = await page.$$eval('#tl-letter button', (els) => els.filter((el) => el.getClientRects().length).map((el) => Math.round(Math.min(el.getBoundingClientRect().width, el.getBoundingClientRect().height))));
  check(targets.length >= 3 && targets.every((size) => size >= 44), 'every button on it is at least 44 points');

  // ---- it is still there after the app is closed and opened ----
  await page.reload();
  await page.waitForSelector('html.app-ready');
  await openLetter(page);
  check((await page.textContent('#tl-letter-words')) === LETTER && !(await page.isVisible('#tl-letter-write')), 'after the app is opened again the letter is there to read');

  // ---- a copy of my data includes it ----
  await page.evaluate(() => { window.__tidelight.onShareFile = (file) => { window.__tidelight.shared.push(file); return { completed: true }; }; });
  await openSettings(page);
  await page.click('#tl-set-export');
  await page.waitForFunction(() => window.__tidelight.shared.length === 1);
  const file = await page.evaluate(() => window.__tidelight.shared[0].text);
  check(file.includes(lang === 'es' ? 'UNA CARTA PARA MÍ' : 'A LETTER TO MYSELF') && file.includes('this is a made-up letter for a test.'), 'a copy of my data includes the letter');

  // ---- the support screen after a very low check-in offers it, below the crisis buttons ----
  await lowCheckIn(page, 1);
  const support = await page.evaluate(() => { const box = document.getElementById('tl-flow-support'); const open = box.querySelector('[data-letter-open]'); const order = Array.from(box.querySelectorAll('a, button')).map((el) => el.getAttribute('href') || (el.hasAttribute('data-letter-open') ? 'letter' : 'other')); return { shown: !open.hidden && open.getClientRects().length > 0, h: open.getBoundingClientRect().height, order }; });
  check(support.shown && support.h >= 44, 'after a very low check-in, the support screen offers "Read my letter"');
  check(support.order.indexOf('tel:988') === 0 && support.order.indexOf('letter') > support.order.indexOf('tel:911'), 'below Call 988, Text 988, and Call 911, never above them');
  await page.click('#tl-flow-support [data-letter-open]');
  await page.waitForSelector('#tl-letter:not([hidden])');
  check((await page.textContent('#tl-letter-words')) === LETTER && (await safetyFrame(page)).length === 0, 'it opens the letter to read, with the safety frame still on screen');
  await page.click('#tl-letter [data-tl-back]');
  await page.waitForTimeout(400);
  const backTo = await page.evaluate(() => ({ support: !document.getElementById('tl-flow-support').hidden && document.getElementById('tl-flow-support').getClientRects().length > 0, mood: !document.querySelector('#tl-flow [data-flow="mood"]').hidden, call: Boolean(document.querySelector('#tl-flow-support a[href="tel:988"]')) }));
  check(backTo.support && !backTo.mood && backTo.call, 'Back from the letter returns to the support screen with Call 988, not to a new check-in');

  // ---- removing it asks first ----
  await openLetter(page);
  await page.click('#tl-letter-remove');
  check(await page.isVisible('#tl-letter-confirm'), 'Remove my letter asks first');
  await page.click('#tl-letter-remove-no');
  check((await stored(page)).text === LETTER && !(await page.isVisible('#tl-letter-confirm')), '"Keep it" keeps it');
  await page.click('#tl-letter-remove');
  await page.click('#tl-letter-remove-yes');
  await page.waitForFunction((k) => { const v = JSON.parse(localStorage.getItem(k) || 'null'); return !v || !v.text; }, KEY);
  const gone = await page.evaluate(() => ({ write: !document.getElementById('tl-letter-write').hidden, read: !document.getElementById('tl-letter-read').hidden, field: document.getElementById('tl-letter-text').value, words: document.getElementById('tl-letter-words').textContent, open: Array.from(document.querySelectorAll('[data-letter-open]')).every((b) => b.hidden) }));
  check(gone.write && !gone.read && gone.field === '' && gone.words === '' && gone.open, '"Remove it" removes the letter from the phone and from the screen');

  // ---- Delete everything removes it ----
  await page.fill('#tl-letter-text', LETTER);
  await page.click('#tl-letter-save');
  await page.waitForFunction((k) => Boolean((JSON.parse(localStorage.getItem(k) || '{}')).text), KEY);
  await page.click('#tl-letter [data-tl-back]').catch(() => {});
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin [data-tl-legacy="ci-journey"]');
  await page.click('.ci-erase-start');
  await page.click('.ci-erase-yes');
  await page.waitForFunction((k) => localStorage.getItem(k) === null, KEY);
  await openLetter(page);
  check((await page.textContent('#tl-letter-words')) === '' && (await page.isVisible('#tl-letter-write')), 'Delete everything removes the letter');

  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}

console.log('\nThe letter and the rest of the app');
{
  // With nothing written, the support screen does not offer a letter.
  const { context, page } = await newPage(browser, 'en');
  await lowCheckIn(page, 2);
  check((await page.isVisible('#tl-flow-support [data-letter-open]')) === false, 'with no letter written, the support screen does not offer one');
  check(await page.isVisible('#tl-flow-support a[href="tel:988"]'), 'and still shows Call 988');
  await context.close();
}
{
  // The app lock covers the letter like every other screen of the person's own.
  const { context, page } = await newPage(browser, 'en', { hooks: { lock: { unlocked: false, allow: false } }, storage: { 'tidelight.settings': JSON.stringify({ appLock: true }), [KEY]: JSON.stringify({ text: LETTER, updatedAt: 'x' }) } });
  await page.waitForSelector('#tl-lock:not([hidden])');
  const locked = await page.evaluate(() => ({ letter: document.getElementById('tl-letter').getClientRects().length, text: document.body.innerText.includes('made-up letter'), strip: document.querySelector('.crisis-bar a[href="tel:988"]').getClientRects().length > 0 }));
  check(locked.letter === 0 && !locked.text && locked.strip, 'while the app is locked the letter can\'t be read, and the crisis strip is on screen');
  await context.close();
}
{
  // Damaged data: the letter comes back empty and usable, never broken.
  for (const damaged of ['{"text":7}', '[1,2,3]', '"a sentence"', '{"text":"<script>window.__ran = 1</script>Kept words","updatedAt":5}']) {
    const { context, page, errors } = await newPage(browser, 'en', { storage: { [KEY]: damaged } });
    await openLetter(page);
    const seen = await page.evaluate(() => ({ words: document.getElementById('tl-letter-words').textContent, ran: window.__ran === 1, write: !document.getElementById('tl-letter-write').hidden }));
    const want = damaged.includes('Kept') ? '<script>window.__ran = 1</script>Kept words' : '';
    check(seen.words === want && !seen.ran && seen.write === (want === '') && errors.length === 0, `a damaged letter (${damaged.slice(0, 24)}…) opens with what could be read, as plain words, and no error`);
    await context.close();
  }
}
{
  // Dark, a small phone, and the phone's largest text: nothing runs off the side of the letter.
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 }, storage: { [KEY]: JSON.stringify({ text: LETTER + '\n' + 'Unapalabramuylargaquenosepuedepartirfacilmenteenningunsitio'.repeat(2), updatedAt: 'x' }) } });
  await openLetter(page);
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-letter'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the letter runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-letter', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

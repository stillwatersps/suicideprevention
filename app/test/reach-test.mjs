// "Reach someone I trust": a message ready ahead of time for someone in My circle. The person
// sends it; the app sends nothing.
//   node test/reach-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone. No call, text, or chat is
// ever started: the address a message would open is caught and read, never opened, and links to
// 988, 911, and a person's own contact are only checked, never tapped.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, openSettings, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const KEY = 'tidelight.reach.v1';
const CIRCLE = 'tidelight.circle.v1';
const PEOPLE = { people: [{ name: 'Sam (made up)', phone: '(555) 010-0199' }, { name: 'A made-up aunt', phone: '555-0100' }], log: [] };
const START = { en: "I'm having a hard time right now. Could you call or text me when you see this?", es: 'Estoy pasando por un momento difícil. ¿Podrías llamarme o escribirme cuando veas esto?' };

async function newPage(browser, lang, { hooks = {}, storage = {}, colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(([given, stored]) => {
    window.__tidelight = Object.assign({ shared: [], clockRate: 1 }, JSON.parse(JSON.stringify(given)));
    window.__sms = [];
    window.__tidelight.onSms = (link) => { window.__sms.push(link); }; // caught, never opened
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
async function openReach(page) {
  await tab(page, 'friends');
  if (!(await page.isVisible('#tl-friends'))) await tab(page, 'friends');
  await page.click('#tl-friends-reach');
  await page.waitForSelector('#tl-reach:not([hidden])');
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
const people = (page) => page.$$eval('#tl-reach-people li', (rows) => rows.map((row) => ({ name: row.querySelector('.tl-plan-text').textContent, message: row.querySelector('[data-reach-message]').textContent, call: row.querySelector('a').getAttribute('href'), sizes: Array.from(row.querySelectorAll('a, button')).map((el) => Math.round(el.getBoundingClientRect().height)) })));

const browser = await openBrowser();

for (const lang of ['en', 'es']) {
  console.log(`\nReach someone I trust, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang, { storage: { [CIRCLE]: JSON.stringify(PEOPLE) } });

  // ---- the way in, and what is on the screen ----
  await tab(page, 'friends');
  check(await page.isVisible('#tl-friends-reach'), 'the Friends tab has a row for it');
  await openReach(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(await page.isVisible('#tl-reach .tl-draft-tag'), 'the screen is marked "Draft for review"');
  check(await page.isVisible('#tl-reach-privacy'), 'who receives a message, and that it can\'t be taken back, is in view');
  check((await page.inputValue('#tl-reach-text')) === START[lang], 'the field starts with the screen\'s own short message');
  const listed = await people(page);
  check(listed.length === 2 && listed[0].name === 'Sam (made up)' && listed[1].name === 'A made-up aunt', 'the two people in My circle are listed');
  check(listed[0].call === 'tel:5550100199' && listed[1].call === 'tel:5550100', 'each can be called: their own number, never a crisis line');
  check(listed.every((p) => p.sizes.every((h) => h >= 44)), 'every button for a person is at least 44 points tall');
  check((await stored(page)) === null, 'nothing is stored just by opening the screen');

  // ---- a message to one person: the phone's own messages, with the words filled in ----
  await page.click('#tl-reach-people li:nth-child(1) [data-reach-message]');
  const first = await page.evaluate(() => window.__sms.slice());
  check(first.length === 1 && first[0].startsWith('sms:5550100199?body=') && decodeURIComponent(first[0].split('body=')[1]) === START[lang], 'Message opens the phone\'s messages to that one person, with the words filled in');
  check(!first[0].includes('5550100;') && !first[0].includes('988') && !first[0].includes('911'), 'to nobody else, and never to a crisis line');
  const said = await page.evaluate(() => { const s = document.getElementById('tl-reach-status'); return { shown: !s.hidden, words: s.textContent.trim() }; });
  check(said.shown && said.words.length > 20, 'the screen says nothing is sent until Send is tapped there');
  check((await stored(page)) === null && (await page.evaluate(() => window.__tidelight.shared.length)) === 0, 'the app itself sent nothing and kept nothing');

  // ---- the person's own words ----
  await page.fill('#tl-reach-text', '  Can you call me? It is a made-up hard day.  ');
  await page.click('#tl-reach-people li:nth-child(2) [data-reach-message]');
  const second = await page.evaluate(() => window.__sms[1]);
  check(second.startsWith('sms:5550100?body=') && decodeURIComponent(second.split('body=')[1]) === 'Can you call me? It is a made-up hard day.', 'changed words go as they are on screen, even before they are saved');
  await page.click('#tl-reach-save');
  await page.waitForFunction((k) => Boolean((JSON.parse(localStorage.getItem(k) || '{}')).message), KEY);
  check((await stored(page)).message === 'Can you call me? It is a made-up hard day.', 'Save keeps the person\'s own words on the phone');
  check(await page.evaluate(() => document.activeElement.id === 'tl-reach-status'), 'and a screen reader hears that they were saved');
  await page.reload();
  await page.waitForSelector('html.app-ready');
  await openReach(page);
  check((await page.inputValue('#tl-reach-text')) === 'Can you call me? It is a made-up hard day.', 'after the app is opened again the field has the person\'s own words');

  // ---- accessibility ----
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-reach', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length})`); });
  check(audit.length === 0, 'no serious accessibility finding on the screen' + (audit.length ? ': ' + audit.join(', ') : ''));

  // ---- a copy of my data includes the saved words ----
  await page.evaluate(() => { window.__tidelight.onShareFile = (file) => { window.__tidelight.shared.push(file); return { completed: true }; }; });
  await openSettings(page);
  await page.click('#tl-set-export');
  await page.waitForFunction(() => window.__tidelight.shared.length === 1);
  const file = await page.evaluate(() => window.__tidelight.shared[0].text);
  check(file.includes(lang === 'es' ? 'UN MENSAJE PARA UN MOMENTO DIFÍCIL' : 'A MESSAGE FOR A HARD MOMENT') && file.includes('Can you call me? It is a made-up hard day.'), 'a copy of my data includes the message');

  // ---- the support step offers it, below the crisis buttons ----
  await lowCheckIn(page, 1);
  const support = await page.evaluate(() => { const box = document.getElementById('tl-flow-support'); const open = box.querySelector('[data-reach-open]'); const order = Array.from(box.querySelectorAll('a, button')).map((el) => el.getAttribute('href') || (el.hasAttribute('data-reach-open') ? 'reach' : 'other')); return { shown: !open.hidden && open.getClientRects().length > 0, h: open.getBoundingClientRect().height, order }; });
  check(support.shown && support.h >= 44, 'after a very low check-in, the support step offers "Message someone I trust"');
  check(support.order.indexOf('tel:988') === 0 && support.order.indexOf('reach') > support.order.indexOf('tel:911'), 'below Call 988, Text 988, and Call 911, never above them');
  await page.click('#tl-flow-support [data-reach-open]');
  await page.waitForSelector('#tl-reach:not([hidden])');
  check((await people(page)).length === 2 && (await safetyFrame(page)).length === 0, 'it opens the screen with the people on it, and the safety frame still on screen');
  await page.click('#tl-reach [data-tl-back]');
  await page.waitForTimeout(400);
  const backTo = await page.evaluate(() => ({ support: !document.getElementById('tl-flow-support').hidden && document.getElementById('tl-flow-support').getClientRects().length > 0, mood: !document.querySelector('#tl-flow [data-flow="mood"]').hidden, call: Boolean(document.querySelector('#tl-flow-support a[href="tel:988"]')) }));
  check(backTo.support && !backTo.mood && backTo.call, 'Back returns to the support step with Call 988, not to a new check-in');

  // ---- saving the screen's own words again keeps nothing ----
  await openReach(page);
  await page.fill('#tl-reach-text', START[lang]);
  await page.click('#tl-reach-save');
  await page.waitForFunction((k) => { const v = JSON.parse(localStorage.getItem(k) || 'null'); return !v || !v.message; }, KEY);
  check(true, 'saving the starting words again keeps nothing of the person\'s');

  // ---- Delete everything removes the saved words, and the circle with them ----
  await page.fill('#tl-reach-text', 'Made-up words to erase');
  await page.click('#tl-reach-save');
  await page.waitForFunction((k) => Boolean((JSON.parse(localStorage.getItem(k) || '{}')).message), KEY);
  await page.click('#tl-reach [data-tl-back]').catch(() => {});
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin [data-tl-legacy="ci-journey"]');
  await page.click('.ci-erase-start');
  await page.click('.ci-erase-yes');
  await page.waitForFunction((k) => localStorage.getItem(k) === null, KEY);
  await openReach(page);
  const after = await page.evaluate(() => ({ field: document.getElementById('tl-reach-text').value, rows: document.querySelectorAll('#tl-reach-people li').length, nobody: !document.getElementById('tl-reach-nobody').hidden }));
  check(after.field === START[lang] && after.rows === 0 && after.nobody, 'Delete everything removes the saved words and the people; the screen says the circle is empty');
  await page.click('#tl-reach-nobody [data-tl-go="friends"]');
  check(await page.isVisible('#tl-friends'), '"Go to Friends" goes to the Friends tab, where people are added');

  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}

console.log('\nThe message and the rest of the app');
{
  // With nobody in the circle, the support step does not offer it.
  const { context, page } = await newPage(browser, 'en');
  await lowCheckIn(page, 2);
  check((await page.isVisible('#tl-flow-support [data-reach-open]')) === false, 'with nobody in My circle, the support step does not offer a message');
  check(await page.isVisible('#tl-flow-support a[href="tel:988"]'), 'and still shows Call 988');
  await context.close();
}
{
  // The app lock covers it like every other screen of the person's own.
  const { context, page } = await newPage(browser, 'en', { hooks: { lock: { unlocked: false, allow: false } }, storage: { 'tidelight.settings': JSON.stringify({ appLock: true }), [CIRCLE]: JSON.stringify(PEOPLE), [KEY]: JSON.stringify({ message: 'Made-up private words', updatedAt: 'x' }) } });
  await page.waitForSelector('#tl-lock:not([hidden])');
  const locked = await page.evaluate(() => ({ screen: document.getElementById('tl-reach').getClientRects().length, text: document.body.innerText.includes('Made-up private words') || document.body.innerText.includes('Sam (made up)'), strip: document.querySelector('.crisis-bar a[href="tel:988"]').getClientRects().length > 0 }));
  check(locked.screen === 0 && !locked.text && locked.strip, 'while the app is locked neither the words nor the people can be read, and the crisis strip is on screen');
  await context.close();
}
{
  // Damaged data: the screen opens with what could be read, and never an error.
  for (const [what, storage] of [
    ['a damaged message', { [KEY]: '{"message":7}', [CIRCLE]: JSON.stringify(PEOPLE) }],
    ['a damaged circle', { [CIRCLE]: '{"people":"nobody"}' }],
    ['people with no usable number', { [CIRCLE]: JSON.stringify({ people: [null, 7, { name: '<script>window.__ran = 1</script>', phone: '555-0100' }, { name: 'No number', phone: 'x' }] }) }],
  ]) {
    const { context, page, errors } = await newPage(browser, 'en', { storage });
    await openReach(page);
    const seen = await page.evaluate(() => ({ field: document.getElementById('tl-reach-text').value, rows: Array.from(document.querySelectorAll('#tl-reach-people .tl-plan-text')).map((el) => el.textContent), ran: window.__ran === 1 }));
    const want = what.startsWith('people') ? 1 : what.includes('circle') ? 0 : 2;
    check(seen.field === START.en && seen.rows.length === want && !seen.ran && errors.length === 0, `${what}: the screen opens with what could be read, as plain words, and no error`);
    await context.close();
  }
}
{
  // Dark, a small phone, and the phone's largest text.
  const long = { people: [{ name: 'Unnombremuylargoquenosepuedepartirfacilmente Apellido', phone: '555-0100' }], log: [] };
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 }, storage: { [CIRCLE]: JSON.stringify(long) } });
  await openReach(page);
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => { const screen = document.getElementById('tl-reach'); const limit = window.innerWidth + 1; return Array.from(screen.querySelectorAll('*')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > limit).map((el) => el.id || el.className).slice(0, 3); });
    check(wide.length === 0, `Spanish, dark, a small phone, text at ${size}: nothing on the screen runs off the side` + (wide.length ? ': ' + wide.join(', ') : ''));
  }
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-reach', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'and no serious accessibility finding in dark' + (audit.length ? ': ' + audit.join(', ') : ''));
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

// "A summary for an appointment": a short page of the person's own records. Only what they tick
// goes on it, they see every word before sharing, and nothing ticked or typed is kept.
//   node test/summary-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with made-up records and a stand-in for the phone's share sheet, muted: nothing
// is shared with anyone. Not a phone. No call, text, or chat is ever started.
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

// Check-ins two, five, twenty, and forty-five days ago; journal entries three and twenty-five days
// ago; and a plan with one made-up line.
const LOG = [quick(45, 4, ['Tag from long ago']), quick(20, 4, ['Tag from twenty days ago']), quick(5, 2, ['Tag from a hard day']), quick(2, 4, ['Tag from two days ago'])];
const CHECKIN = { entries: [{ id: 1, date: daysAgo(25, 20), mood: '', moodValue: '', prompt: '', text: 'An entry from twenty-five days ago' }, { id: 2, date: daysAgo(3, 20), mood: '', moodValue: '', prompt: '', text: 'An entry from three days ago' }] };
const PLAN = { signs: ['A made-up warning sign'], coping: [], distract: [], people: [], pros: [], safer: [], updatedAt: 'x' };
const FULL = { 'tidelight.log.v1': JSON.stringify(LOG), 'tidelight.checkin.v1': JSON.stringify(CHECKIN), 'tidelight.plan.v1': JSON.stringify(PLAN) };

async function newPage(browser, lang, { storage = {}, colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript((stored) => {
    window.__files = [];
    window.__sheet = { completed: true };
    window.__tidelight = { clockRate: 1, onShareFile: (file) => { window.__files.push(file); return window.__sheet; } };
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
  await page.click('#tl-checkin-summary');
  await page.waitForSelector('#tl-summary:not([hidden])');
  await page.waitForTimeout(600);
}
const read = (page) => page.evaluate(() => ({
  text: document.getElementById('tl-summary-preview').textContent,
  empty: !document.getElementById('tl-summary-empty').hidden,
  out: !document.getElementById('tl-summary-out').hidden,
  checkins: document.getElementById('tl-summary-checkins').checked,
  journal: document.getElementById('tl-summary-journal').checked,
  plan: document.getElementById('tl-summary-plan').checked,
  days: document.querySelector('input[name="tl-summary-days"]:checked').value,
  ask: document.getElementById('tl-summary-ask').value,
  note: !document.getElementById('tl-summary-note').hidden,
  screen: document.getElementById('tl-summary').innerText,
  pictures: document.querySelectorAll('#tl-summary canvas, #tl-summary svg:not(.tl-icon), #tl-summary progress, #tl-summary meter, #tl-summary [role="img"]').length,
  streak: Boolean(document.querySelector('#tl-summary [class*="streak"], #tl-summary .tl-horizon')),
  draft: Boolean(document.querySelector('#tl-summary .tl-draft-tag')),
}));
const everything = (page) => page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])));

const browser = await openBrowser();

for (const lang of ['en', 'es']) {
  console.log(`\nA summary for an appointment, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang, { storage: FULL });
  await tab(page, 'checkin');
  check(await page.isVisible('#tl-checkin-summary'), 'the Check-in tab has a row for it');
  await open(page);
  await page.waitForTimeout(600); // the app's own start-up writes are done
  const before = await everything(page);
  let seen = await read(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  check(seen.draft && !seen.streak && seen.pictures === 0, 'it is marked "Draft for review", and has no streak and no chart');

  // ---- how it starts ----
  check(seen.checkins && !seen.journal && !seen.plan && seen.days === '14' && seen.ask === '', 'it starts with check-ins from the last 14 days ticked, and the journal and the safety plan not');
  check(seen.out && !seen.empty && seen.text.includes('Tag from two days ago') && seen.text.includes('Tag from a hard day'), 'the page shows the check-ins from the last 14 days, as they were recorded');
  check(!seen.text.includes('Tag from twenty days ago') && !seen.text.includes('Tag from long ago'), 'and none from before that');
  check(!seen.text.includes('An entry from') && !seen.text.includes('A made-up warning sign'), 'the journal and the safety plan are not on it until ticked');
  const top = seen.text.split('\n').slice(0, 3);
  check(top.length === 3 && top.every((line) => line.trim().length > 10) && /14/.test(top[1]) && /Tidelight/.test(top[1]), `it opens with its title, when and how it was made, and that it is not a medical record: "${top[2]}"`);
  check(!/\b(score|average|trend|worse|better|streak|puntuaci|promedio|peor|mejor|racha)\b/i.test(seen.text), 'the page has no score, average, trend, or comparison');
  check(!/undefined|null|NaN|\[object/.test(seen.text), 'and nothing a person couldn\'t read');

  // ---- the choices ----
  await page.check('input[name="tl-summary-days"][value="30"]');
  seen = await read(page);
  check(seen.text.includes('Tag from twenty days ago') && !seen.text.includes('Tag from long ago') && /30/.test(seen.text.split('\n')[1]), 'the last 30 days: the check-in from twenty days ago is on it, the one from forty-five is not, and the page says 30');
  await page.check('#tl-summary-journal');
  seen = await read(page);
  check(seen.text.includes('An entry from three days ago') && seen.text.includes('An entry from twenty-five days ago'), 'the journal, ticked: the entries from those 30 days are on it, in the person\'s words');
  await page.check('input[name="tl-summary-days"][value="14"]');
  seen = await read(page);
  check(seen.text.includes('An entry from three days ago') && !seen.text.includes('An entry from twenty-five days ago'), 'back to 14 days: the older entry is gone');
  await page.check('#tl-summary-plan');
  seen = await read(page);
  check(seen.text.includes('A made-up warning sign'), 'the safety plan, ticked: its lines are on it');
  await page.fill('#tl-summary-ask', 'A made-up question?');
  seen = await read(page);
  check(seen.text.includes('A made-up question?') && seen.text.indexOf('A made-up question?') < seen.text.indexOf('Tag from two days ago'), 'something to ask or say is on it, before the records');
  const limit = await page.evaluate(() => { const field = document.getElementById('tl-summary-ask'); return { max: field.maxLength, label: Boolean(document.querySelector('label[for="tl-summary-ask"]')) }; });
  check(limit.max === 300 && limit.label, 'the field has a label and holds 300 characters');

  // ---- sharing: the phone's share sheet gets exactly the words on screen ----
  await page.evaluate(() => { window.__sheet = { completed: false }; });
  await page.click('#tl-summary-share');
  await page.waitForFunction(() => window.__files.length === 1);
  await page.waitForTimeout(200);
  check((await read(page)).note === false, 'closing the share sheet says nothing');
  await page.evaluate(() => { window.__sheet = { completed: true }; });
  await page.click('#tl-summary-share');
  await page.waitForSelector('#tl-summary-note:not([hidden])');
  const file = await page.evaluate(() => window.__files[1]);
  seen = await read(page);
  check(file.text === seen.text && file.text.length > 100, 'sharing hands the phone exactly the words shown, and nothing else');
  check(/^tidelight-[a-z]+\.txt$/.test(file.name), `as one text file with a plain name: ${file.name}`);
  check(/\S/.test(await page.textContent('#tl-summary-note')), 'the page says it was handed over');
  check(/can't take it back|no puede recuperarla/.test(seen.screen), 'beside the button it says anyone who gets it can read it and that it can\'t be taken back');

  // ---- nothing chosen: no page, and nothing to share ----
  await page.uncheck('#tl-summary-checkins');
  await page.uncheck('#tl-summary-journal');
  await page.uncheck('#tl-summary-plan');
  await page.fill('#tl-summary-ask', '');
  seen = await read(page);
  check(seen.empty && !seen.out && !(await page.isVisible('#tl-summary-share')), 'with nothing ticked and nothing typed, it says so and offers nothing to share');

  // ---- nothing is kept ----
  await page.check('#tl-summary-plan');
  await page.fill('#tl-summary-ask', 'Typed and left behind');
  await tab(page, 'home');
  if (!(await page.isVisible('#tl-home'))) await tab(page, 'home');
  await open(page);
  seen = await read(page);
  check(seen.checkins && !seen.journal && !seen.plan && seen.days === '14' && seen.ask === '' && !seen.note, 'opening it again starts over: nothing ticked or typed is left from last time');
  const after = await everything(page);
  check(after === before && !after.includes('Typed and left behind') && !after.includes('made-up question'), 'none of it was stored: what is on the phone is exactly what was there before');

  check(await noSideways(page), 'no sideways scrolling');
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-summary', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`); });
  check(audit.length === 0, 'the automated accessibility audit finds nothing serious' + (audit.length ? ': ' + audit.join('; ') : ''));
  const small = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-summary .tl-switch, #tl-summary button, #tl-summary textarea')).filter((el) => el.getClientRects().length && el.getBoundingClientRect().height < 43.5).map((el) => el.id || el.textContent.trim().slice(0, 20)));
  check(small.length === 0, 'every choice and button is at least 44 points tall' + (small.length ? ': not ' + small.join(', ') : ''));
  await page.click('#tl-summary [data-tl-back]');
  await page.waitForSelector('#tl-checkin:not([hidden])');
  check(await page.isVisible('#tl-checkin-summary'), 'Back returns to the Check-in tab');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}

console.log('\nNothing recorded yet');
for (const lang of ['en', 'es']) {
  const { context, page, errors } = await newPage(browser, lang);
  await open(page);
  await page.check('#tl-summary-journal');
  await page.check('#tl-summary-plan');
  const seen = await read(page);
  const body = seen.text.split('\n').slice(3).filter((line) => line.trim());
  check(seen.out && body.length === 6 && new Set([body[1], body[3], body[5]]).size === 1 && !/undefined|null/.test(seen.text), `${name(lang)}: each ticked part says nothing was recorded: "${body[1]}"`);
  check(errors.length === 0, `${name(lang)}: no script errors` + (errors.length ? ': ' + errors[0] : ''));
  await context.close();
}

console.log('\nDark mode, a small phone, and the largest text');
for (const lang of ['en', 'es']) {
  const { context, page } = await newPage(browser, lang, { storage: FULL, colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await open(page);
  await page.check('#tl-summary-journal');
  await page.check('#tl-summary-plan');
  // Audited from the top of the page, so no choice is measured while half under the crisis strip.
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
  await page.waitForTimeout(700);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-summary', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`); });
  check(audit.length === 0, `${name(lang)}, dark, a small phone: the audit finds nothing serious` + (audit.length ? ': ' + audit.join('; ') : ''));
  for (const size of ['200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    // Only this screen is measured here, as in the tests of the other screens.
    const off = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-summary, #tl-summary *')).filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > window.innerWidth + 1); }).map((el) => el.id || el.className || el.tagName).slice(0, 3));
    check(off.length === 0, `${name(lang)}, text at ${size}: nothing in it runs off the side` + (off.length ? ': ' + off.join(', ') : ''));
    check((await safetyFrame(page)).length === 0, `${name(lang)}, text at ${size}: the whole safety frame is still there`);
  }
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with a stand-in for the share sheet; nothing was shared. Not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

// When the phone can't keep something, the app says so, once, in plain words, and never near
// the crisis strip. Before, a check-in on a full phone was lost without a word.
//   node test/save-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium, muted, with the browser's storage made to refuse writes the way a full phone
// does. Not a phone. No call, text, or chat is ever started.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');

async function newPage(browser, lang, { colorScheme = 'light', viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport, colorScheme });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(() => { window.__tidelight = { clockRate: 1 }; });
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  await page.waitForTimeout(500); // the app's own start-up writes are done
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; }); // measure where things land, not mid-glide
  return { context, page, errors, outside };
}
// From now on the phone refuses to keep anything of Tidelight's, as a full phone does.
const fillThePhone = (page) => page.evaluate(() => { const set = Storage.prototype.setItem; window.__realSet = set; Storage.prototype.setItem = function refuse(key, value) { if (String(key).startsWith('tidelight.')) { const e = new Error('The quota has been exceeded.'); e.name = 'QuotaExceededError'; throw e; } return set.call(this, key, value); }; });
const makeRoom = (page) => page.evaluate(() => { Storage.prototype.setItem = window.__realSet; });
const note = (page) => page.evaluate(() => {
  const el = document.getElementById('tl-save-note');
  const r = el.getBoundingClientRect();
  const strip = document.querySelector('.crisis-bar').getBoundingClientRect();
  const bar = document.getElementById('tl-tabbar').getBoundingClientRect();
  const hit = (sel) => { const a = document.querySelector(sel); const b = a.getBoundingClientRect(); const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return top === a || a.contains(top); };
  return { shown: !el.hidden && r.height > 0, words: el.querySelector('p').textContent.trim(), role: el.getAttribute('role'), top: r.top, bottom: r.bottom, stripBottom: strip.bottom, barTop: bar.height ? bar.top : window.innerHeight, strip: ['.crisis-bar a[href^="tel:988"]', '.crisis-bar a[href^="sms:988"]', '.crisis-bar a[href^="tel:911"]', '.crisis-bar .quick-exit'].every(hit), ok: el.querySelector('button').getBoundingClientRect().height, inside: r.left >= 0 && r.right <= window.innerWidth + 1 };
});
async function quickCheckIn(page, mood) {
  await tab(page, 'home');
  if (!(await page.isVisible('#tl-home'))) await tab(page, 'home');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click(`#tl-flow-faces [data-value="${mood}"]`);
  await page.click('#tl-flow-done');
}

const browser = await openBrowser();

for (const lang of ['en', 'es']) {
  console.log(`\nWhen the phone can't save, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);
  check((await note(page)).shown === false, 'while saving works, the line is never on screen');
  await quickCheckIn(page, 4);
  await page.waitForTimeout(400);
  check((await note(page)).shown === false, 'an ordinary check-in that saves says nothing');

  await fillThePhone(page);
  await quickCheckIn(page, 4);
  await page.waitForFunction(() => !document.getElementById('tl-save-note').hidden, null, { timeout: 5000 }).catch(() => {});
  let seen = await note(page);
  check(seen.shown && seen.words.length > 60 && !/undefined|null|Error|quota|exception/i.test(seen.words), `a check-in the phone can't keep: the app says so in plain words: "${seen.words.slice(0, 70)}…"`);
  check(seen.role === 'status', 'it is announced to a screen reader, politely');
  check(seen.top > seen.stripBottom + 100 && seen.bottom <= seen.barTop + 1 && seen.inside, 'it sits at the bottom, above the tab bar, well away from the crisis strip');
  check(seen.strip, 'Call 988, Text 988, Call 911, and Quick exit are all still on screen and uncovered');
  check((await safetyFrame(page)).length === 0, 'and the whole safety frame is there');
  check(seen.ok >= 44, 'its button is at least 44 points');
  const done = await page.evaluate(() => { const step = document.querySelector('#tl-flow [data-flow="done"]'); return step && !step.hidden; });
  check(done, 'the check-in itself still finished: the person is not stopped');
  // Whatever is at the bottom of the page can be scrolled clear of the line.
  const reach = await page.evaluate(() => { window.scrollTo(0, document.documentElement.scrollHeight); const last = Array.from(document.querySelectorAll('footer a, footer p')).filter((el) => el.getClientRects().length).pop(); const n = document.getElementById('tl-save-note').getBoundingClientRect(); return last ? last.getBoundingClientRect().bottom <= n.top + 1 : true; });
  check(reach, 'the last line of the page scrolls clear of it');
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-save-note', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'the automated accessibility audit finds nothing serious in it' + (audit.length ? ': ' + audit.join(', ') : ''));

  // Said once: more failed saves don't stack up lines.
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-plan');
  await page.fill('#tl-plan-signs-new', 'A made-up warning sign');
  await page.click('#tl-plan [data-plan-part="signs"] [data-plan-add]');
  await page.waitForTimeout(300);
  check((await page.$$('#tl-save-note:not([hidden])')).length === 1 && (await page.$$('.tl-save-note')).length === 1, 'a second failed save doesn\'t add a second line');
  check((await page.textContent('#tl-plan [data-plan-part="signs"]')).includes('A made-up warning sign'), 'and what was typed is still on screen, as the line says');

  await page.click('#tl-save-note-ok');
  check((await note(page)).shown === false, '"Got it" takes the line away');
  await page.fill('#tl-plan-signs-new', 'Another made-up sign');
  await page.click('#tl-plan [data-plan-part="signs"] [data-plan-add]');
  await page.waitForFunction(() => !document.getElementById('tl-save-note').hidden, null, { timeout: 5000 }).catch(() => {});
  check((await note(page)).shown, 'if saving fails again later, it says so again');
  await page.click('#tl-save-note-ok');

  // Room again: quiet again.
  await makeRoom(page);
  await page.fill('#tl-plan-coping-new', 'Music');
  await page.click('#tl-plan [data-plan-part="coping"] [data-plan-add]');
  await page.waitForTimeout(400);
  check((await note(page)).shown === false && (await page.evaluate(() => (localStorage.getItem('tidelight.plan.v1') || '').includes('Music'))), 'once the phone has room again, saving works and nothing is said');
  check(errors.length === 0 && outside.length === 0, 'no script errors, and nothing requested from outside the app' + (errors.length ? ': ' + errors[0] : ''));
  await context.close();
}

console.log('\nA very low check-in on a phone that can\'t save');
for (const lang of ['en', 'es']) {
  const { context, page } = await newPage(browser, lang, { viewport: { width: 375, height: 667 } });
  await fillThePhone(page);
  await quickCheckIn(page, 1);
  await page.waitForSelector('#tl-flow-support:not([hidden])');
  await page.waitForTimeout(400);
  const seen = await note(page);
  check(seen.shown && seen.strip, `${name(lang)}: support shows at once, the line says the check-in couldn't be kept, and the crisis strip is uncovered`);
  // Every crisis button on the support step can be brought clear of the line and tapped.
  const reachable = await page.evaluate(() => ['tel:988', 'sms:988', 'tel:911'].map((href) => { const a = document.querySelector(`#tl-flow-support a[href^="${href}"]`); a.scrollIntoView({ block: 'center' }); const r = a.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return top === a || a.contains(top); }));
  check(reachable.every(Boolean), `${name(lang)}: Call 988, Text 988, and Call 911 on the support screen can each be brought clear of the line`);
  await context.close();
}

console.log('\nDark mode and the largest text');
{
  const { context, page } = await newPage(browser, 'es', { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await fillThePhone(page);
  await quickCheckIn(page, 4);
  await page.waitForFunction(() => !document.getElementById('tl-save-note').hidden, null, { timeout: 5000 }).catch(() => {});
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-save-note', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, 'Spanish, dark, a small phone: the audit finds nothing serious' + (audit.length ? ': ' + audit.join(', ') : ''));
  for (const size of ['200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; window.dispatchEvent(new Event('resize')); }, size);
    await page.waitForTimeout(250);
    const seen = await note(page);
    // Where there is no room between the strip and the tab bar, the line is in the page itself and
    // is brought into view by scrolling, like anything else on the page.
    const ok = await page.evaluate(() => { const b = document.getElementById('tl-save-note-ok'); b.scrollIntoView({ block: 'start' }); const r = b.getBoundingClientRect(); const strip = document.querySelector('.crisis-bar').getBoundingClientRect(); const y = Math.max(r.top, strip.bottom) + 6; const top = document.elementFromPoint(r.left + r.width / 2, y); return { hit: top === b || b.contains(top), inside: r.right <= window.innerWidth + 1 && r.left >= -1, inline: document.getElementById('tl-save-note').classList.contains('tl-save-note-inline') }; });
    const after = await note(page);
    check(seen.shown && ok.hit && ok.inside && after.strip, `text at ${size}: the line is ${ok.inline ? 'in the page' : 'at the bottom of the screen'}, "Got it" can be reached, and the crisis strip is uncovered`);
  }
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with storage made to refuse writes; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

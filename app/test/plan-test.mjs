// "My safety plan": six short lists in the person's own words, kept on this phone only.
//   node test/plan-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone. No call, text, or chat is
// ever started: links to 988, 911, and a person's own contact are only checked, never tapped.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, openSettings, safetyFrame, serve, counter, pagePath, noSideways, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const PARTS = ['signs', 'coping', 'distract', 'people', 'pros', 'safer'];
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const KEY = 'tidelight.plan.v1';

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
async function openPlan(page) {
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-plan');
  await page.waitForSelector('#tl-plan:not([hidden])');
}
const addText = async (page, part, text) => { await page.fill(`#tl-plan-${part}-new`, text); await page.click(`#tl-plan [data-plan-part="${part}"] [data-plan-add]`); };
const addPerson = async (page, part, person, phone) => { await page.fill(`#tl-plan-${part}-name`, person); await page.fill(`#tl-plan-${part}-phone`, phone || ''); await page.click(`#tl-plan [data-plan-part="${part}"] [data-plan-add]`); };
const items = (page, part) => page.$$eval(`#tl-plan [data-plan-part="${part}"] .tl-plan-text`, (els) => els.map((el) => el.textContent));

const browser = await openBrowser();

for (const lang of ['en', 'es']) {
  console.log(`\nMy safety plan, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang, { hooks: { pickContact: null } });
  // The stand-in contact picker: one made-up person.
  await page.evaluate(() => { window.__tidelight.pickContact = async () => ({ name: 'A made-up friend', phone: '555-0100' }); });

  // ---- the way in, and what is on the screen before anything is written ----
  await tab(page, 'checkin');
  check(await page.isVisible('#tl-checkin-plan'), 'the Check-in tab has a row for the safety plan');
  await openPlan(page);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with the plan open');
  check(await page.isVisible('#tl-plan .tl-draft-tag'), 'the plan is marked "Draft for review"');
  const empty = await page.evaluate(() => {
    const screen = document.getElementById('tl-plan');
    const parts = Array.from(screen.querySelectorAll('[data-plan-part]')).map((el) => el.getAttribute('data-plan-part'));
    const crisis = ['tel:988', 'sms:988', 'tel:911'].map((href) => { const a = screen.querySelector(`[data-plan-part="pros"] a[href^="${href}"]`); const r = a ? a.getBoundingClientRect() : { width: 0, height: 0 }; return a ? { w: r.width, h: r.height } : null; });
    const privacy = document.getElementById('tl-plan-privacy');
    return { parts, crisis, privacyShown: privacy.getClientRects().length > 0 && !privacy.closest('details'), privacy: privacy.textContent, lists: screen.querySelectorAll('.tl-plan-list:not([hidden])').length, share: !document.getElementById('tl-plan-share-box').hidden, streak: Boolean(screen.querySelector('[class*="streak"], .tl-horizon')), hope: Boolean(screen.querySelector('[data-tl-legacy="app-hope"]')) };
  });
  check(JSON.stringify(empty.parts) === JSON.stringify(PARTS), 'six parts, in the order the Get Help page gives them');
  check(empty.crisis.every((c) => c && c.h >= 44 && c.w >= 44), 'part 5 holds Call 988, Text 988, and Call 911 as full-size buttons, before anything is added');
  check(empty.privacyShown && /phone|teléfono/.test(empty.privacy), 'the line about where the plan is kept is in view, not behind a tap');
  check(empty.lists === 0 && !empty.share, 'an empty plan shows no empty lists and no share button');
  check(!empty.streak, 'no streak and no horizon on the plan');
  check(empty.hope, 'and a way to the Hope box, where reasons are kept');
  check(await noSideways(page), 'no sideways scrolling');

  // ---- writing a plan ----
  await addText(page, 'signs', '  I stop answering   messages ');
  await page.waitForFunction(() => document.querySelectorAll('#tl-plan [data-plan-part="signs"] .tl-plan-text').length === 1);
  check(JSON.stringify(await items(page, 'signs')) === JSON.stringify(['I stop answering messages']), 'a warning sign is added as one tidy line');
  check(await page.isVisible('#tl-plan-status'), 'and the screen says it was saved');
  check((await page.inputValue('#tl-plan-signs-new')) === '', 'the field is cleared for the next one');
  await addText(page, 'signs', 'I stop answering messages');
  await addText(page, 'signs', '   ');
  check((await items(page, 'signs')).length === 1, 'the same line twice, or an empty line, adds nothing');
  await page.fill('#tl-plan-coping-new', 'A walk by the river');
  await page.press('#tl-plan-coping-new', 'Enter');
  await page.waitForFunction(() => document.querySelectorAll('#tl-plan [data-plan-part="coping"] .tl-plan-text').length === 1);
  check((await items(page, 'coping'))[0] === 'A walk by the river', 'Return in a field adds what was typed');
  await addText(page, 'distract', '<img src=x onerror="window.__hit=1"> the library');
  await page.waitForFunction(() => document.querySelectorAll('#tl-plan [data-plan-part="distract"] .tl-plan-text').length === 1);
  check((await items(page, 'distract'))[0].includes('<img') && (await page.evaluate(() => window.__hit)) === undefined && (await page.$('#tl-plan [data-plan-part="distract"] img')) === null, 'markup typed into the plan stays plain text');
  await addText(page, 'safer', 'x'.repeat(400));
  await page.waitForFunction(() => document.querySelectorAll('#tl-plan [data-plan-part="safer"] .tl-plan-text').length === 1);
  check((await items(page, 'safer'))[0].length === 120, 'a very long line is cut to 120 characters');

  await addPerson(page, 'people', 'Sam (made up)', '(555) 010-0199');
  await page.waitForFunction(() => document.querySelectorAll('#tl-plan [data-plan-part="people"] .tl-plan-text').length === 1);
  const sam = await page.evaluate(() => { const a = document.querySelector('#tl-plan [data-plan-part="people"] .tl-plan-call'); const r = a.getBoundingClientRect(); return { href: a.getAttribute('href'), text: a.textContent, h: r.height, w: r.width }; });
  check(sam.href === 'tel:5550100199' && sam.text.includes('Sam (made up)') && sam.h >= 44 && sam.w >= 44, 'a person with a number gets a full-size button that calls that number: ' + sam.href);
  await page.click('#tl-plan [data-plan-part="people"] [data-plan-pick]');
  await page.waitForFunction(() => document.querySelectorAll('#tl-plan [data-plan-part="people"] .tl-plan-text').length === 2);
  check((await items(page, 'people'))[1] === 'A made-up friend, 555-0100', 'someone chosen from the phone\'s contacts is added with their number');
  await addPerson(page, 'pros', 'A made-up counselor', '');
  await page.waitForFunction(() => document.querySelectorAll('#tl-plan [data-plan-part="pros"] .tl-plan-text').length === 1);
  check((await page.$('#tl-plan [data-plan-part="pros"] .tl-plan-call')) === null, 'a person with no number has no call button');
  const crisisStill = await page.evaluate(() => ['tel:988', 'sms:988', 'tel:911'].every((href) => document.querySelector(`#tl-plan [data-plan-part="pros"] .tl-support-actions a[href^="${href}"]`)) && !document.querySelector('#tl-plan .tl-support-actions [data-plan-remove]'));
  check(crisisStill, '988 and 911 stay in part 5 and have no Remove button');

  const kept = await stored(page);
  check(kept && kept.signs.length === 1 && kept.people.length === 2 && kept.people[0].phone === '(555) 010-0199' && typeof kept.updatedAt === 'string' && kept.updatedAt.length > 10, 'the plan is kept on the phone, under its own key');
  const names = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-plan button, #tl-plan a, #tl-plan input')).filter((el) => el.getClientRects().length).map((el) => { const label = el.getAttribute('aria-label') || (el.labels && el.labels[0] && el.labels[0].textContent) || el.textContent; return (label || '').trim(); }).filter((n) => !n).length);
  check(names === 0, 'every control on the plan has a name');
  const targets = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-plan button, #tl-plan a.tl-btn')).filter((el) => el.getClientRects().length).filter((el) => { const r = el.getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).map((el) => el.textContent.trim()));
  check(targets.length === 0, 'every button on the plan is at least 44 points' + (targets.length ? ': ' + targets.join(', ') : ''));
  check(await noSideways(page), 'still no sideways scrolling with a plan written');

  // ---- a part can hold only so many ----
  for (let i = 0; i < 9; i += 1) { if (await page.isEnabled('#tl-plan-coping-new')) await addText(page, 'coping', 'Made-up thing ' + i); }
  await page.waitForFunction(() => document.querySelectorAll('#tl-plan [data-plan-part="coping"] .tl-plan-text').length === 8);
  const full = await page.evaluate(() => { const box = document.querySelector('#tl-plan [data-plan-part="coping"]'); const note = box.querySelector('[data-plan-full]'); return { disabled: box.querySelector('input').disabled && box.querySelector('[data-plan-add]').disabled, note: !note.hidden && /8/.test(note.textContent) }; });
  check(full.disabled && full.note, 'a part with 8 entries says so and takes no more');

  // ---- removing ----
  await page.click('#tl-plan [data-plan-part="coping"] [data-plan-remove="0"]');
  await page.waitForFunction(() => document.querySelectorAll('#tl-plan [data-plan-part="coping"] .tl-plan-text').length === 7);
  check(!(await items(page, 'coping')).includes('A walk by the river') && (await stored(page)).coping.length === 7, 'Remove takes one entry out, on screen and on the phone');
  check(await page.isEnabled('#tl-plan-coping-new'), 'and the part takes entries again');
  check(await page.evaluate(() => document.activeElement && document.activeElement.id === 'tl-plan-coping-title'), 'focus goes to the part\'s name, not to nowhere');

  // ---- it is still there after closing and opening the app ----
  await page.reload();
  await page.waitForSelector('html.app-ready');
  await openPlan(page);
  check((await items(page, 'signs'))[0] === 'I stop answering messages' && (await items(page, 'people')).length === 2, 'the plan is there after the app is closed and opened again');

  // ---- an automated accessibility audit of the written plan ----
  await page.waitForTimeout(700); // a screen fades in, and a half-faded button fails contrast for a moment
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-plan', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`); });
  check(audit.length === 0, 'the automated accessibility audit finds nothing serious on the plan' + (audit.length ? ': ' + audit.join('; ') : ''));

  // ---- sharing goes through the same notice as every other share ----
  check(await page.isVisible('#tl-plan-share'), 'a written plan can be shared');
  await page.click('#tl-plan-share');
  await page.waitForFunction(() => { const panel = document.getElementById('app-share-panel'); return panel && !panel.classList.contains('ci-off'); });
  const shared = await page.evaluate(() => ({ text: document.getElementById('app-share-text').value, notice: document.getElementById('app-share-panel').innerText }));
  check(shared.text.includes('I stop answering messages') && shared.text.includes('A made-up friend, 555-0100') && /988/.test(shared.notice), 'Share my plan opens the share notice (with 988 in it) and the plan\'s words, which can be changed first');
  check(shared.text.split('\n')[0] === (lang === 'es' ? 'Mi plan de seguridad' : 'My safety plan'), 'the words start with what it is');
  await page.click('.app-share-cancel');

  // ---- a copy of my data includes the plan ----
  await page.evaluate(() => { window.__tidelight.onShareFile = (file) => { window.__tidelight.shared.push(file); return { completed: true }; }; });
  await openSettings(page);
  await page.click('#tl-set-export');
  await page.waitForFunction(() => window.__tidelight.shared.length === 1);
  const file = await page.evaluate(() => window.__tidelight.shared[0].text);
  check(file.includes(lang === 'es' ? 'MI PLAN DE SEGURIDAD' : 'MY SAFETY PLAN') && file.includes('- I stop answering messages') && file.includes('- Sam (made up), (555) 010-0199'), 'a copy of my data includes the plan, part by part');

  // ---- the support screen after a very low check-in offers the plan ----
  await tab(page, 'home');
  if (!(await page.isVisible('#tl-home'))) await tab(page, 'home');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
  const support = await page.evaluate(() => { const box = document.getElementById('tl-flow-support'); const open = box.querySelector('[data-plan-open]'); const order = Array.from(box.querySelectorAll('a, button')).map((el) => el.getAttribute('href') || (el.hasAttribute('data-plan-open') ? 'plan' : 'other')); return { shown: !open.hidden && open.getClientRects().length > 0, h: open.getBoundingClientRect().height, order }; });
  check(support.shown && support.h >= 44, 'after a very low check-in, the support screen offers "Open my safety plan"');
  check(support.order.indexOf('tel:988') === 0 && support.order.indexOf('plan') > support.order.indexOf('tel:911'), 'below Call 988, Text 988, and Call 911, never above them');
  await page.click('#tl-flow-support [data-plan-open]');
  await page.waitForSelector('#tl-plan:not([hidden])');
  check((await items(page, 'signs')).length === 1 && (await safetyFrame(page)).length === 0, 'it opens the plan, with the safety frame still on screen');

  // ---- Delete everything removes the plan ----
  await page.click('#tl-plan [data-tl-back]').catch(() => {});
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin [data-tl-legacy="ci-journey"]');
  await page.click('.ci-erase-start');
  await page.click('.ci-erase-yes');
  await page.waitForFunction((k) => localStorage.getItem(k) === null, KEY);
  await openPlan(page);
  const after = await page.evaluate(() => ({ texts: document.querySelectorAll('#tl-plan .tl-plan-text').length, share: !document.getElementById('tl-plan-share-box').hidden, crisis: document.querySelectorAll('#tl-plan .tl-support-actions a').length }));
  check(after.texts === 0 && !after.share && after.crisis === 3, 'Delete everything empties the plan and leaves 988 and 911 in it');

  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}

console.log('\nThe plan and the rest of the app');
{
  // With nothing written, the support screen does not offer an empty plan.
  const { context, page } = await newPage(browser, 'en');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click('#tl-flow-faces [data-value="2"]');
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
  check((await page.isVisible('#tl-flow-support [data-plan-open]')) === false, 'with no plan written, the support screen does not offer one');
  check(await page.isVisible('#tl-flow-support a[href="tel:988"]'), 'and still shows Call 988');
  await context.close();
}
{
  // The app lock covers the plan like every other screen of the person's own.
  const plan = { signs: ['A made-up warning sign'], coping: [], distract: [], people: [{ name: 'A made-up friend', phone: '555-0100' }], pros: [], safer: [], updatedAt: 'x' };
  const { context, page } = await newPage(browser, 'en', { hooks: { lock: { unlocked: false, allow: false } }, storage: { 'tidelight.settings': JSON.stringify({ appLock: true }), [KEY]: JSON.stringify(plan) } });
  await page.waitForSelector('#tl-lock:not([hidden])');
  const locked = await page.evaluate(() => ({ plan: document.getElementById('tl-plan').getClientRects().length, text: document.body.innerText.includes('A made-up warning sign'), strip: document.querySelector('.crisis-bar a[href="tel:988"]').getClientRects().length > 0 }));
  check(locked.plan === 0 && !locked.text && locked.strip, 'while the app is locked the plan can\'t be read, and the crisis strip is on screen');
  await context.close();
}
{
  // Damaged data: the plan comes back empty and usable, never broken.
  for (const damaged of ['{"signs":"not a list","people":[null,7,{"phone":"1"}]}', '[1,2,3]', '"a sentence"', '{"signs":[null,{},"kept"],"pros":[{"name":"Kept person","phone":"<script>"}]}']) {
    const { context, page, errors } = await newPage(browser, 'en', { storage: { [KEY]: damaged } });
    await openPlan(page);
    const seen = await page.evaluate(() => ({ texts: Array.from(document.querySelectorAll('#tl-plan .tl-plan-text')).map((el) => el.textContent), crisis: document.querySelectorAll('#tl-plan .tl-support-actions a').length, script: document.querySelectorAll('#tl-plan script').length }));
    const want = damaged.includes('kept') ? ['kept', 'Kept person'] : [];
    check(JSON.stringify(seen.texts) === JSON.stringify(want) && seen.crisis === 3 && seen.script === 0 && errors.length === 0, `a damaged plan (${damaged.slice(0, 28)}…) opens with what could be read and no error`);
    await addText(page, 'signs', 'Still works');
    await page.waitForFunction(() => Array.from(document.querySelectorAll('#tl-plan [data-plan-part="signs"] .tl-plan-text')).some((el) => el.textContent === 'Still works'));
    check(true, 'and can be written to');
    await context.close();
  }
}
for (const [lang, colorScheme] of [['es', 'dark'], ['en', 'dark']]) {
  // Dark mode, and the phone's largest text on a small phone.
  const plan = { signs: ['A made-up warning sign that is quite long, to see how it wraps on a narrow screen'], coping: ['Music'], distract: [], people: [{ name: 'A made-up friend with a long name', phone: '555-0100' }], pros: [], safer: [], updatedAt: 'x' };
  const { context, page } = await newPage(browser, lang, { colorScheme, viewport: { width: 320, height: 568 }, storage: { [KEY]: JSON.stringify(plan) } });
  await openPlan(page);
  await page.waitForTimeout(700);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-plan', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, `${name(lang)}, dark, a small phone: the audit finds nothing serious` + (audit.length ? ': ' + audit.join(', ') : ''));
  for (const size of ['100%', '200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    // Measured on the plan itself. (On a 320-point phone at 331% the website's own Support section, below every screen, is 16 points too wide; that was so before the plan and is in notes/LAUNCH-BACKLOG.md.)
    const fit = await page.evaluate(() => ({ sideways: Array.from(document.querySelectorAll('#tl-plan, #tl-plan *')).some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > window.innerWidth + 1); }), crisis: ['tel:988', 'sms:988', 'tel:911'].every((href) => { const a = document.querySelector(`#tl-plan .tl-support-actions a[href^="${href}"]`); const r = a.getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && r.left >= -1 && r.right <= window.innerWidth + 1; }) }));
    check(!fit.sideways && fit.crisis, `${name(lang)}, text at ${size}: nothing in the plan runs off the side, and 988 and 911 in it stay full size`);
  }
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

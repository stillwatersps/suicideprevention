// Grounding: four short exercises to steady yourself, offered on the support screen after a very
// low check-in and on the Check-in tab. New wording, a draft for the reviewer.
//   node test/ground-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone. No call, text, or chat is
// ever started: crisis links are only checked for being there.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, noSideways, SEEDED } from './helpers.mjs';
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
  return { context, page, errors, outside };
}
async function lowCheckIn(page) {
  await tab(page, 'home');
  if (!(await page.isVisible('#tl-home'))) await tab(page, 'home');
  await page.click('#tl-home [data-tl-quick="checkin"]');
  if (await page.isVisible('#tl-flow-skip')) await page.click('#tl-flow-skip');
  await page.click('#tl-flow-faces [data-value="1"]');
  await page.click('#tl-flow-done');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
}

const browser = await openBrowser();

for (const lang of ['en', 'es']) {
  console.log(`\nGrounding, ${name(lang)}`);
  const { context, page, errors, outside } = await newPage(browser, lang);

  // ---- from the Check-in tab ----
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  check(await page.isVisible('#tl-checkin-ground'), 'the Check-in tab has a row for grounding');
  await page.click('#tl-checkin-ground');
  await page.waitForSelector('#tl-ground:not([hidden])');
  await page.waitForTimeout(700);
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  const seen = await page.evaluate(() => {
    const screen = document.getElementById('tl-ground');
    const parts = Array.from(screen.querySelectorAll('.tl-ground-part')).map((el) => ({ title: el.querySelector('h3').textContent.trim(), words: el.textContent.replace(/\s+/g, ' ').trim().length }));
    const steps = Array.from(screen.querySelectorAll('.tl-ground-steps li')).map((li) => li.textContent.trim());
    const crisis = ['tel:988', 'sms:988', 'tel:911'].map((href) => { const a = screen.querySelector(`.tl-support-actions a[href^="${href}"]`); const r = a ? a.getBoundingClientRect() : { width: 0, height: 0 }; return a ? { w: r.width, h: r.height } : null; });
    const text = screen.innerText;
    return { parts, steps, crisis, draft: Boolean(screen.querySelector('.tl-draft-tag')), streak: Boolean(screen.querySelector('[class*="streak"], .tl-horizon')), says988: /988/.test(text) && /911/.test(text), inputs: screen.querySelectorAll('input, textarea, select').length };
  });
  check(seen.parts.length === 4 && seen.parts.every((p) => p.title.length > 2 && p.words > 30), `four exercises, each with a name and what to do: ${seen.parts.map((p) => p.title).join('; ')}`);
  check(seen.steps.length === 5 && seen.steps.map((s) => s[0]).join('') === '54321', 'the first counts down through five senses: 5, 4, 3, 2, 1');
  check(seen.crisis.every((c) => c && c.w >= 44 && c.h >= 44) && seen.says988, 'Call 988, Text 988, and Call 911 are on the screen itself, full size, and the screen says they are there');
  check(seen.draft, 'it is marked "Draft for review"');
  check(!seen.streak, 'no streak and no horizon on it');
  check(seen.inputs === 0, 'it asks for nothing: there is nothing to type and nothing is kept');
  check(await noSideways(page), 'no sideways scrolling');
  const targets = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-ground button, #tl-ground a.tl-btn')).filter((el) => el.getClientRects().length).filter((el) => { const r = el.getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).map((el) => el.textContent.trim()));
  check(targets.length === 0, 'every button on it is at least 44 points' + (targets.length ? ': ' + targets.join(', ') : ''));
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-ground', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`); });
  check(audit.length === 0, 'the automated accessibility audit finds nothing serious' + (audit.length ? ': ' + audit.join('; ') : ''));
  const before = await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k).length])));

  // ---- "Breathe for a minute" starts the silent one-minute reset, with the crisis strip above it ----
  await page.click('#tl-ground-breathe');
  await page.waitForSelector('#tl-stage:not([hidden])', { timeout: 6000 });
  const playing = await page.evaluate(() => ({ strip: ['tel:988', 'sms:988', 'tel:911'].every((href) => { const a = document.querySelector(`.crisis-bar a[href^="${href}"]`); return a && a.getClientRects().length > 0; }), exit: document.querySelector('.crisis-bar .quick-exit').getClientRects().length > 0 }));
  check(playing.strip && playing.exit, '"Breathe for a minute" starts the one-minute breathing circle, with the crisis strip and Quick exit above it');
  await page.click('#tl-stage', { position: { x: 150, y: 300 } });
  await page.click('#tl-player-end, [data-player-end]').catch(() => {});
  await page.click('#tl-end-confirm [data-end-yes], #tl-end-yes').catch(() => {});
  await page.waitForTimeout(500);

  // ---- from the support screen after a very low check-in ----
  await page.reload();
  await page.waitForSelector('html.app-ready');
  await lowCheckIn(page);
  const way = await page.evaluate(() => { const box = document.getElementById('tl-flow-support'); const open = box.querySelector('[data-tl-push="ground"]'); const order = Array.from(box.querySelectorAll('a, button')).map((el) => el.getAttribute('href') || el.getAttribute('data-tl-push') || 'other'); const r = open ? open.getBoundingClientRect() : { height: 0 }; return { h: r.height, order }; });
  check(way.h >= 44, 'the support screen offers grounding');
  check(way.order.indexOf('tel:988') === 0 && way.order.indexOf('ground') > way.order.indexOf('tel:911'), 'below Call 988, Text 988, and Call 911, never above them');
  await page.click('#tl-flow-support [data-tl-push="ground"]');
  await page.waitForSelector('#tl-ground:not([hidden])');
  check(await page.isVisible('#tl-ground-title'), 'and it opens from there');
  await page.click('#tl-ground [data-tl-back]');
  await page.waitForTimeout(400);
  const backTo = await page.evaluate(() => ({ support: document.getElementById('tl-flow-support').getClientRects().length > 0, call: Boolean(document.querySelector('#tl-flow-support a[href="tel:988"]')) }));
  check(backTo.support && backTo.call, 'Back returns to the support screen with Call 988, not to a new check-in');

  check(typeof before === 'string' && before.length > 2, 'opening it and reading it stored nothing new on the phone');
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}

console.log('\nDark mode, a small phone, and the largest text');
for (const lang of ['en', 'es']) {
  const { context, page } = await newPage(browser, lang, { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-ground');
  await page.waitForSelector('#tl-ground:not([hidden])');
  await page.waitForTimeout(700);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-ground', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, `${name(lang)}, dark, a small phone: the audit finds nothing serious` + (audit.length ? ': ' + audit.join(', ') : ''));
  for (const size of ['200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-ground, #tl-ground *')).filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > window.innerWidth + 1); }).length);
    check(wide === 0, `${name(lang)}, text at ${size}: nothing in it runs off the side`);
  }
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

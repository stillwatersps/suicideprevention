// "What happens when you reach out to 988": a screen inside the app that shows the Get Help
// page's own section of that name, word for word, copied when the app is built. Nothing in it is
// written for the app, so it can't drift from the page a reviewer reads.
//   node test/expect-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium with stand-ins for the phone, muted. Not a phone. No call, text, or chat is
// ever started: crisis links are only checked for being there.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { tab, safetyFrame, serve, counter, pagePath, noSideways, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const www = fileURLToPath(new URL('../www/', import.meta.url));
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const SOURCE = { en: 'get-help/index.html', es: 'es/obtener-ayuda/index.html' };
const tidy = (text) => text.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

// The section as the Get Help page has it: its heading, and every paragraph and small heading in order.
function fromPage(lang) {
  const html = readFileSync(join(www, SOURCE[lang]), 'utf8');
  const section = html.match(/<section id="what-to-expect"[\s\S]*?<\/section>/)[0];
  const title = tidy(section.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)[1].replace(/<[^>]+>/g, ''));
  const body = section.replace(/<summary>[\s\S]*?<\/summary>/, '');
  const lines = [...body.matchAll(/<(h3|p)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => tidy(m[2].replace(/<[^>]+>/g, '')));
  return { title, lines };
}

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
  console.log(`\nWhat happens when you reach out to 988, ${name(lang)}`);
  const source = fromPage(lang);
  check(source.lines.length >= 12 && source.title.includes('988'), `the Get Help page has the section (${source.lines.length} paragraphs and headings): "${source.title}"`);
  const { context, page, errors, outside } = await newPage(browser, lang);

  // ---- the way in: the support screen after a very low check-in ----
  await lowCheckIn(page);
  const way = await page.evaluate(() => { const box = document.getElementById('tl-flow-support'); const open = box.querySelector('[data-tl-push="expect"]'); const order = Array.from(box.querySelectorAll('a, button')).map((el) => el.getAttribute('href') || el.getAttribute('data-tl-push') || 'other'); const r = open ? open.getBoundingClientRect() : { height: 0 }; return { label: open ? open.textContent.replace(/\s+/g, ' ').trim() : '', h: r.height, order }; });
  check(way.label === source.title && way.h >= 44, `the support screen offers it, under the page's own heading: "${way.label}"`);
  check(way.order.indexOf('tel:988') === 0 && way.order.indexOf('expect') > way.order.indexOf('tel:911'), 'below Call 988, Text 988, and Call 911, never above them');
  await page.click('#tl-flow-support [data-tl-push="expect"]');
  await page.waitForSelector('#tl-expect:not([hidden])');
  await page.waitForTimeout(700);

  // ---- the screen says exactly what the page says ----
  check((await safetyFrame(page)).length === 0, 'the whole safety frame is on screen with it open');
  const seen = await page.evaluate(() => { const screen = document.getElementById('tl-expect'); const lines = Array.from(screen.querySelectorAll('.tl-expect-body h3, .tl-expect-body p')).map((el) => el.textContent.replace(/\s+/g, ' ').trim()); return { title: document.getElementById('tl-expect-title').textContent.replace(/\s+/g, ' ').trim(), lines, folded: screen.querySelectorAll('details, summary').length, draft: Boolean(screen.querySelector('.tl-draft-tag')), ids: Array.from(document.querySelectorAll('[id]')).map((el) => el.id) }; });
  check(seen.title === source.title, 'its title is the page\'s heading');
  check(JSON.stringify(seen.lines) === JSON.stringify(source.lines), `every paragraph and heading is the page's own, in order, word for word (${seen.lines.length})`);
  check(seen.folded === 0, 'nothing in it is folded behind a tap: how 988 handles privacy and emergency services is in view');
  check(seen.draft, 'it is marked "Draft for review", as the page is');
  check(new Set(seen.ids).size === seen.ids.length, 'no two parts of the page share an id');
  const crisis = await page.evaluate(() => ['tel:988', 'sms:988', 'tel:911'].map((href) => { const a = document.querySelector(`#tl-expect .tl-support-actions a[href^="${href}"]`); const r = a ? a.getBoundingClientRect() : { width: 0, height: 0 }; return a ? { w: r.width, h: r.height } : null; }));
  check(crisis.every((c) => c && c.w >= 44 && c.h >= 44), 'Call 988, Text 988, and Call 911 are on the screen itself, full size');
  // Every link in it leads to a page that is inside the app, or to 988's own site.
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-expect .tl-expect-body a')).map((a) => a.getAttribute('href')));
  const broken = links.filter((href) => { if (/^https:\/\/(chat\.)?988lifeline\.org\//.test(href)) return false; if (/^(tel|sms):/.test(href)) return false; const path = join(www, pagePath(lang), href.split('#')[0]); return !(existsSync(path) || existsSync(join(path, 'index.html'))); });
  check(links.length >= 2 && broken.length === 0, `its ${links.length} links lead to pages inside the app or to 988's own site` + (broken.length ? ': not ' + broken.join(', ') : ''));
  check(await noSideways(page), 'no sideways scrolling');
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-expect', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`); });
  check(audit.length === 0, 'the automated accessibility audit finds nothing serious' + (audit.length ? ': ' + audit.join('; ') : ''));

  // ---- Back returns to the support screen, which is as it was ----
  await page.click('#tl-expect [data-tl-back]');
  await page.waitForSelector('#tl-flow-support:not([hidden])');
  check(await page.isVisible('#tl-flow-support a[href="tel:988"]'), 'Back returns to the support screen, with Call 988 on it');

  // ---- the other way in: part 5 of the safety plan ----
  await tab(page, 'checkin');
  if (!(await page.isVisible('#tl-checkin'))) await tab(page, 'checkin');
  await page.click('#tl-checkin-plan');
  await page.waitForSelector('#tl-plan:not([hidden])');
  const fromPlan = await page.evaluate(() => { const b = document.querySelector('#tl-plan [data-plan-part="pros"] [data-tl-push="expect"]'); return b ? b.textContent.replace(/\s+/g, ' ').trim() : ''; });
  check(fromPlan === source.title, 'part 5 of the safety plan offers it too, under the same words');
  await page.click('#tl-plan [data-plan-part="pros"] [data-tl-push="expect"]');
  await page.waitForSelector('#tl-expect:not([hidden])');
  check(await page.isVisible('#tl-expect-title'), 'and it opens from there');

  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  check(outside.length === 0, 'nothing was requested from outside the app');
  await context.close();
}

console.log('\nDark mode, a small phone, and the largest text');
for (const lang of ['en', 'es']) {
  const { context, page } = await newPage(browser, lang, { colorScheme: 'dark', viewport: { width: 320, height: 568 } });
  await lowCheckIn(page);
  await page.click('#tl-flow-support [data-tl-push="expect"]');
  await page.waitForSelector('#tl-expect:not([hidden])');
  await page.waitForTimeout(700);
  await page.evaluate(axeSource);
  const audit = await page.evaluate(async () => { const result = await window.axe.run('#tl-expect', { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => v.id); });
  check(audit.length === 0, `${name(lang)}, dark, a small phone: the audit finds nothing serious` + (audit.length ? ': ' + audit.join(', ') : ''));
  for (const size of ['200%', '331%']) {
    await page.evaluate((s) => { document.documentElement.style.fontSize = s; }, size);
    await page.waitForTimeout(250);
    const wide = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-expect, #tl-expect *')).filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > window.innerWidth + 1); }).length);
    check(wide === 0, `${name(lang)}, text at ${size}: nothing in it runs off the side`);
  }
  await context.close();
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

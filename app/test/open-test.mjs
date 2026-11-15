// Opening the app at a named place, as the Home Screen widget does: the safety plan, or a minute
// of breathing. The phone hands the page one word; this checks what the page does with it.
//   node test/open-test.mjs      (after a build; part of `npm test`)
// Desktop Chromium, muted, with a stand-in for the phone handing over the place. The widget itself
// is native and is not run here: test/unit/widget.test.mjs reads its files, and the iOS Simulator
// was used by hand. Not a phone. No call, text, or chat is ever started.
import { serve, counter, pagePath, safetyFrame, SEEDED } from './helpers.mjs';
import { openBrowser } from './quiet.mjs';

const { base, close } = await serve();
const { check, tally } = counter();
const name = (lang) => (lang === 'es' ? 'Spanish' : 'English');
const PLAN = { signs: ['A made-up warning sign'], coping: [], distract: [], people: [], pros: [], safer: [], updatedAt: 'x' };

async function newPage(browser, lang, { hooks = {}, storage = {}, seed = true } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const errors = [];
  const outside = [];
  await context.route((url) => !url.href.startsWith(base), (route) => { outside.push(route.request().url()); return route.abort(); });
  await context.addInitScript(([given, stored]) => {
    window.__tidelight = Object.assign({ clockRate: 1 }, JSON.parse(JSON.stringify(given)));
    // The phone hands a place over once. On a later start in the same test it has none to give.
    try { if (sessionStorage.getItem('seeded')) delete window.__tidelight.launchTarget; } catch (e) { /* first load */ }
    try { if (!sessionStorage.getItem('seeded')) { Object.keys(stored).forEach((key) => localStorage.setItem(key, stored[key])); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* first load */ }
  }, [hooks, storage]);
  if (seed) await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, errors, outside };
}
// The phone telling a page that is already open where to go.
const arrive = (page, target) => page.evaluate((t) => window.dispatchEvent(new CustomEvent('tidelight-launch', { detail: t })), target);
const showing = (page) => page.evaluate(() => ({ plan: document.getElementById('tl-plan').getClientRects().length > 0, stage: Boolean(document.getElementById('tl-stage') && !document.getElementById('tl-stage').hidden && document.getElementById('tl-stage').getClientRects().length > 0), home: document.getElementById('tl-home').getClientRects().length > 0, onboarding: Boolean(document.getElementById('tl-onboarding') && document.getElementById('tl-onboarding').getClientRects().length > 0), strip: ['tel:988', 'sms:988', 'tel:911'].every((href) => { const a = document.querySelector(`.crisis-bar a[href^="${href}"]`); return a && a.getClientRects().length > 0; }), current: (document.querySelector('#tl-tabbar [aria-current="page"]') || { getAttribute: () => '' }).getAttribute('data-tl-tab-btn') }));

const browser = await openBrowser();

for (const lang of ['en', 'es']) {
  console.log(`\nOpened at a named place, ${name(lang)}`);
  {
    // The app is already open on Home.
    const { context, page, errors, outside } = await newPage(browser, lang, { storage: { 'tidelight.plan.v1': JSON.stringify(PLAN) } });
    await arrive(page, '#tl-plan');
    await page.waitForSelector('#tl-plan:not([hidden])');
    let seen = await showing(page);
    check(seen.plan && seen.current === 'checkin' && seen.strip, 'named "plan": the safety plan opens, with the crisis strip above it');
    check((await safetyFrame(page)).length === 0 && (await page.textContent('#tl-plan')).includes('A made-up warning sign'), 'with the whole safety frame, and the person\'s own plan in it');
    await page.click('#tl-plan [data-tl-back]');
    await page.waitForTimeout(300);
    check((await page.isVisible('#tl-checkin')) || (await page.isVisible('#tl-home')), 'Back from it goes to one of the app\'s own screens, not nowhere');

    await arrive(page, '#tl-breathe');
    await page.waitForSelector('#tl-stage:not([hidden])', { timeout: 6000 });
    seen = await showing(page);
    check(seen.stage && seen.strip, 'named "breathe": the one-minute breathing circle starts, with the crisis strip above it');
    check(errors.length === 0 && outside.length === 0, 'no script errors, and nothing requested from outside the app' + (errors.length ? ': ' + errors[0] : ''));
    await context.close();
  }
  {
    // The app is opened cold by the widget: the phone holds the place until the page asks for it.
    const { context, page } = await newPage(browser, lang, { hooks: { launchTarget: '#tl-plan' }, storage: { 'tidelight.plan.v1': JSON.stringify(PLAN) } });
    await page.waitForSelector('#tl-plan:not([hidden])', { timeout: 6000 });
    check((await showing(page)).plan, 'opened cold at "plan": the app starts on the safety plan');
    check((await page.evaluate(() => window.__tidelight.launchTarget)) === '', 'and the place is used once: it is not kept for the next start');
    await page.reload();
    await page.waitForSelector('html.app-ready');
    await page.waitForTimeout(500);
    check((await showing(page)).home, 'the next start is on Home as usual');
    await context.close();
  }
  {
    // A name the app doesn't know, or nothing: the app just opens.
    const { context, page, errors } = await newPage(browser, lang);
    for (const odd of ['#tl-nowhere', '#tl-settings', '', 'javascript:alert(1)', '#tl-plan<script>']) await arrive(page, odd);
    await page.waitForTimeout(300);
    const seen = await showing(page);
    check(seen.home && !seen.plan && !seen.stage && errors.length === 0, 'a place the app doesn\'t know changes nothing: Home stays, with no error');
    await context.close();
  }
  {
    // First launch is never skipped.
    const { context, page } = await newPage(browser, lang, { seed: false, hooks: { launchTarget: '#tl-breathe' } });
    await page.waitForTimeout(600);
    await arrive(page, '#tl-plan');
    await page.waitForTimeout(300);
    const seen = await showing(page);
    check(seen.onboarding && !seen.plan && !seen.stage && seen.strip, 'a new person still sees setting up first, with the crisis strip; the place is ignored');
    await context.close();
  }
  {
    // The app lock still applies.
    const { context, page } = await newPage(browser, lang, { hooks: { lock: { unlocked: false, allow: false }, launchTarget: '#tl-breathe' }, storage: { 'tidelight.settings': JSON.stringify({ appLock: true }), 'tidelight.plan.v1': JSON.stringify(PLAN) } });
    await page.waitForSelector('#tl-lock:not([hidden])');
    await page.waitForTimeout(500);
    let seen = await showing(page);
    check(!seen.stage && seen.strip, 'locked, named "breathe": nothing starts behind the lock, and the crisis strip is on screen');
    await arrive(page, '#tl-plan');
    await page.waitForTimeout(400);
    seen = await showing(page);
    const readable = await page.evaluate(() => document.body.innerText.includes('A made-up warning sign'));
    check(!seen.plan && !readable && seen.strip && await page.isVisible('#tl-lock'), 'locked, named "plan": the plan can\'t be read until the phone confirms the person');
    await context.close();
  }
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with a stand-in for the phone; the widget itself is not run here. No call, text, or chat was started.`);
process.exit(tally.failures ? 1 : 0);

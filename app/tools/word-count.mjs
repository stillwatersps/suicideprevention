// Counts the words on screen, screen by screen, for the "text diet" record in PROGRESS.md.
// Run after a build: node tools/word-count.mjs
// "Frame" is the safety frame every screen keeps in full (crisis strip, Exit, header with Get
// Support Now, the language link, both review notices, privacy, Support, the 988 panel, footer).
// "Screen" is everything else on screen. The numbers before the redesign are in BEFORE, measured
// the same way on the build before the redesign (whole page, 390 by 844, desktop Chromium).
import { createRequire } from 'node:module';
import { serve, birthDateYearsAgo } from '../test/helpers.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BEFORE = {
  'First open (age question)': 720, Today: 674, 'Check-in, first question': 701, 'Check-in, result': 881, Rediscover: 726,
  Journal: 681, 'Hope box': 768, 'Your journey (reminders, places, circle, settings)': 1336, 'Your journey with Places turned on': 1788,
};

const { base, close } = await serve();
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await page.goto(base + 'check-in/');
await page.waitForSelector('html.app-ready');
const count = () => page.evaluate(() => {
  const words = (text) => text.split(/\s+/).filter(Boolean).length;
  const app = document.querySelector('#tl-app');
  const bar = document.querySelector('#tl-tabbar');
  const seen = (el) => (el && el.offsetParent !== null ? words(el.innerText) : 0);
  const screen = seen(app) + seen(bar) + Array.from(document.querySelectorAll('.tl-overlay')).reduce((n, o) => n + seen(o), 0);
  const all = words(document.body.innerText);
  const notice = seen(document.querySelector('#tl-review'));
  return { all, screen, frame: all - screen, notice };
});
const rows = [];
const add = async (name) => rows.push({ name, ...(await count()) });
const click = (sel) => page.click(sel);

if (await page.isVisible('#tl-onboarding')) {
  await add('Onboarding: welcome');
  await page.evaluate(() => window.__tlTest && window.__tlTest.skipOnboarding && window.__tlTest.skipOnboarding(new Date().getFullYear() - 30));
  await page.waitForTimeout(300);
} else if (await page.isVisible('#app-birth-date')) {
  await add('First open (age question)');
  await page.fill('#app-birth-date', birthDateYearsAgo(30));
  await click('.app-age-save');
  await click('.app-age-yes');
}
for (const [name, id] of [['Home', 'home'], ['Check-in', 'checkin'], ['Meditate', 'meditate'], ['Location (Places off)', 'location'], ['Friends (My circle)', 'friends']]) {
  await click(`#tl-tabbar [data-tl-tab-btn="${id}"]`);
  await add(name);
}
await click('#tl-tabbar [data-tl-tab-btn="home"]');
await click('#tl-home [data-tl-push="settings"]');
await add('Settings');
for (const [name, panel] of [['Daily check-in, first question', 'ci-today'], ['Journal', 'ci-journal'], ['Rediscover', 'ci-rediscover'], ['Hope box', 'app-hope'], ['Your journey', 'ci-journey']]) {
  await click('#tl-tabbar [data-tl-tab-btn="checkin"]');
  if (!(await page.isVisible('#tl-checkin'))) await click('#tl-tabbar [data-tl-tab-btn="checkin"]');
  await click(`#tl-checkin [data-tl-legacy="${panel}"]`);
  await add(name);
}
await browser.close();
close();

const frame = Math.min(...rows.filter((r) => r.screen > 0).map((r) => r.frame));
const oldFrame = frame - rows[rows.length - 1].notice; // the frame before had no notice for the new words
console.log(`Safety frame, kept in full on every screen: about ${frame} words.\n`);
console.log('| Screen now | Words on the screen itself | With the safety frame |');
console.log('| --- | --- | --- |');
rows.forEach((r) => console.log(`| ${r.name} | ${r.screen} | ${r.all} |`));
console.log('\n| Screen before the redesign | Whole page | Without the safety frame (estimate) |');
console.log('| --- | --- | --- |');
Object.entries(BEFORE).forEach(([name, all]) => console.log(`| ${name} | ${all} | ${Math.max(0, all - oldFrame)} |`));

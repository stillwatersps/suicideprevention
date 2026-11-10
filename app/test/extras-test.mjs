// Tests the Hope box and My circle in desktop Chromium, after `node tools/build.mjs`.
// The phone's contact picker and Messages app can't run here: test hooks stand in for them.
// This is not a phone test.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { smsLink, preview, fitInside } from '../src/extras-logic.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const www = fileURLToPath(new URL('../www/', import.meta.url));
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json', '.vcf': 'text/vcard' };
// A real image from the site, to stand in for a photo.
const PNG = await readFile(join(www, 'assets', 'icon-180.png'));

let failures = 0;
let passes = 0;
function check(ok, what) {
  if (ok) { passes++; console.log('  ok   ' + what); } else { failures++; console.log('  FAIL ' + what); }
}

console.log('Helpers');
check(smsLink(['+1 (555) 010-0001', '555-010-0002'], 'Hi there', 'ios') === 'sms://open?addresses=+15550100001,5550100002&body=Hi%20there', 'iPhone message link lists every person');
check(smsLink(['5550100001', '5550100002'], 'a&b', 'android') === 'sms:5550100001;5550100002?body=a%26b', 'Android message link lists every person');
check(preview('one\n\ntwo   three') === 'one two three' && preview('x'.repeat(200)).length === 80, 'previews are one short line');
check(JSON.stringify(fitInside(4000, 3000, 1280)) === '{"width":1280,"height":960}' && fitInside(100, 50, 1280).width === 100, 'photos shrink to fit and never grow');

const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  try {
    const file = join(www, normalize(path));
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}/`;

async function run(browser, lang) {
  const path = lang === 'es' ? 'es/registro-diario/' : 'check-in/';
  console.log(`\n${lang === 'es' ? 'Spanish' : 'English'}: ${path}`);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const errors = [];
  const outside = [];
  context.on('request', (r) => { if (!r.url().startsWith(base) && !/^(data|blob):/.test(r.url())) outside.push(r.url()); });
  await context.addInitScript(() => {
    const people = [{ name: 'Ana Example', phone: '+1 555 010 0001' }, { name: 'Sam Example', phone: '555-010-0002' }, { name: 'No Phone', phone: '' }];
    window.__sms = [];
    window.__tidelight = { pickContact: async () => people.shift() || { cancelled: true }, onSms: (link) => window.__sms.push(link) };
    try { if (!localStorage.getItem('tidelight.agegroup.v1')) localStorage.setItem('tidelight.agegroup.v1', 'teen'); } catch (e) { /* first load */ }
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + path);
  await page.waitForSelector('html.app-ready.app-extras-ready');

  // Hope box.
  await page.click('.ci-tabs a[href="#app-hope"]');
  check(await page.isVisible('#app-hope'), 'Hope box opens from its own tab');
  check(await page.isVisible('#app-hope a[href="tel:988"]') && await page.isVisible('.crisis-bar a[href="tel:988"]'), 'Hope box shows 988, and the crisis strip stays');
  check(await page.isVisible('.app-hope-empty'), 'starts empty');
  await page.click('.app-hope-add');
  check(await page.isVisible('.app-hope-empty'), 'empty words are not added');
  await page.check('input[name="app-hope-kind"][value="message"]');
  await page.fill('#app-hope-text', 'A made-up kind sentence for the test.');
  await page.click('.app-hope-add');
  check((await page.textContent('.app-hope-words')).includes('A made-up kind sentence for the test.'), 'adds words to the hope box');
  await page.setInputFiles('#app-hope-photo', { name: 'photo.png', mimeType: 'image/png', buffer: PNG });
  await page.waitForSelector('.app-hope-photo img');
  const shown = await page.evaluate(() => new Promise((ok) => { const i = document.querySelector('.app-hope-photo img'); if (i.complete) ok(i.naturalWidth); else { i.onload = () => ok(i.naturalWidth); i.onerror = () => ok(0); } }));
  check(shown > 0, 'adds a photo and shows it');
  await page.setInputFiles('#app-hope-photo', { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not a photo') });
  await page.waitForSelector('.app-hope-photo-problem:not(.ci-off)');
  check(await page.isVisible('.app-hope-photo-problem'), 'a file that isn\'t a photo is refused, with a message');

  await page.reload();
  await page.waitForSelector('html.app-ready.app-extras-ready');
  await page.click('.ci-tabs a[href="#app-hope"]');
  check((await page.textContent('.app-hope-words')).includes('A made-up kind sentence') && await page.isVisible('.app-hope-photo img'), 'the hope box is still there after reopening');
  const sideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(!sideways, 'the Hope box doesn\'t scroll sideways');

  // My circle.
  await page.click('.ci-tabs a[href="#ci-journey"]');
  check(await page.isVisible('#app-circle') && await page.isVisible('.app-circle-empty'), 'My circle is in Your journey, and starts empty');
  check(await page.isVisible('#app-circle [data-age-group="teen"]') && !(await page.isVisible('#app-circle [data-age-group="child"]')), 'a teen is told the circle doesn\'t have to include a parent');
  check(await page.isVisible('#app-circle a[href="tel:988"]'), 'My circle shows 988');
  await page.click('.app-circle-add');
  await page.click('.app-circle-add');
  check((await page.locator('.app-circle-person').count()) === 2, 'adds two chosen people');
  await page.click('.app-circle-add');
  check(await page.isVisible('.app-circle-no-phone') && (await page.locator('.app-circle-person').count()) === 2, 'a contact with no phone number is not added');

  // Private by default: sharing is a choice, one entry at a time.
  await page.click('.ci-tabs a[href="#ci-journal"]');
  await page.fill('#ci-entry', 'A made-up entry to share.');
  await page.click('.ci-add-entry');
  await page.fill('#ci-entry', 'A made-up private entry.');
  await page.click('.ci-add-entry');
  check((await page.evaluate(() => window.__sms.length)) === 0, 'nothing is sent by writing an entry');
  await page.locator('.ci-entry', { hasText: 'A made-up entry to share.' }).locator('.app-share').click();
  check(await page.isVisible('.app-circle-send'), 'the share panel offers "Send to my circle"');
  await page.click('.app-circle-send');
  const sms = await page.evaluate(() => window.__sms);
  check(sms.length === 1 && sms[0].startsWith('sms:') && sms[0].includes('15550100001') && sms[0].includes('5550100002'), 'opens one message addressed to everyone in the circle');
  check(sms.length === 1 && decodeURIComponent(sms[0]).includes('A made-up entry to share.') && !decodeURIComponent(sms[0]).includes('private'), 'the message holds only the entry that was shared');
  check(await page.isVisible('.app-circle-opened'), 'says nothing is sent until the person taps Send');
  await page.click('.ci-tabs a[href="#ci-journey"]');
  check((await page.textContent('.app-circle-log')).includes('A made-up entry to share.'), 'keeps a list of what was shared with the circle');

  // The hope box is never part of what's shared.
  check(!decodeURIComponent(sms[0] || '').includes('kind sentence'), 'the hope box is not in the message');

  // Delete everything empties the hope box and the circle.
  await page.click('.ci-erase-start');
  await page.click('.ci-erase-yes');
  await page.waitForTimeout(500);
  await page.reload();
  await page.waitForSelector('html.app-ready.app-extras-ready');
  await page.click('.ci-tabs a[href="#ci-journey"]');
  check((await page.locator('.app-circle-person').count()) === 0 && await page.isVisible('.app-circle-log-empty'), 'Delete everything empties the circle');
  await page.click('.ci-tabs a[href="#app-hope"]');
  check(await page.isVisible('.app-hope-empty') && (await page.locator('.app-hope-photo').count()) === 0, 'Delete everything empties the hope box, photos included');
  const kept = await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)));
  check(!kept.includes('made-up') && !kept.includes('Example'), 'no words or names are left on the phone');

  check(outside.length === 0, 'no requests to other sites' + (outside.length ? ': ' + outside.join(', ') : ''));
  check(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await context.close();
}

const browser = await chromium.launch();
try {
  await run(browser, 'en');
  await run(browser, 'es');
} finally {
  await browser.close();
  server.close();
}
console.log(`\n${passes} passed, ${failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(failures ? 1 : 0);

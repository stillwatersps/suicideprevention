// Phone-size screenshots of the app's new screens, for people to look at. Desktop Chromium, not a phone.
// Usage: node test/screens.mjs <folder>
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = process.argv[2] || '.';
const www = fileURLToPath(new URL('../www/', import.meta.url));
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  try { const f = join(www, normalize(path)); res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' }); res.end(await readFile(f)); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}/`;
const b = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme });
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'share', { value: async () => {}, configurable: true }); });
  const p = await ctx.newPage();
  await p.goto(base + 'check-in/');
  await p.waitForSelector('html.app-ready');
  await p.locator('#app-age').scrollIntoViewIfNeeded();
  await p.screenshot({ path: `${out}/app-${scheme}-1-age.png` });
  const d = new Date(); d.setFullYear(d.getFullYear() - 30);
  await p.fill('#app-birth-date', d.toISOString().slice(0, 10));
  await p.click('.app-age-save');
  await p.click('[data-ci-start]');
  await p.click('#ci-step-feeling label:has(input[value="calm"])');
  await p.click('#ci-step-feeling .ci-next');
  for (const id of ['mind', 'difficult', 'self']) await p.click(`#ci-step-${id} .ci-skip`);
  await p.click('.ci-finish');
  await p.locator('.app-foryou').scrollIntoViewIfNeeded();
  await p.screenshot({ path: `${out}/app-${scheme}-2-for-your-age.png` });
  await p.click('.ci-tabs a[href="#ci-journal"]');
  await p.fill('#ci-entry', 'A made-up journal entry for the screenshot.');
  await p.click('.ci-add-entry');
  await p.click('.ci-entry .app-share');
  await p.screenshot({ path: `${out}/app-${scheme}-3-share.png` });
  await ctx.close();
}
await b.close();
server.close();

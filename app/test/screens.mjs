// Phone-size screenshots of the app's age setup and age-based screens, for people to look at.
// Desktop Chromium, not a phone. Usage: node test/screens.mjs <folder>
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
const years = (n) => { const d = new Date(); d.setFullYear(d.getFullYear() - n); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); };

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto(base + 'check-in/');
await p.waitForSelector('html.app-ready');
await p.locator('.app-age-accuracy').scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/age-1-accuracy.png` });
await p.fill('#app-birth-date', years(15));
await p.click('.app-age-save');
await p.locator('.app-age-confirm').scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/age-2-confirm-teen.png` });
await p.click('.app-age-yes');
await p.locator('.app-age-box').scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/age-3-today-teen.png` });
await p.click('.ci-tabs a[href="#ci-journey"]');
await p.click('.app-age-change');
await p.fill('#app-birth-date', years(72));
await p.click('.app-age-save');
await p.click('.app-age-yes');
await p.click('.ci-tabs a[href="#ci-today"]');
await p.locator('.app-age-box').scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/age-4-today-older-large-text.png` });
await p.click('.ci-tabs a[href="#ci-journey"]');
await p.locator('.app-settings').scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/age-5-journey-settings-older.png` });
await ctx.close();
await b.close();
server.close();

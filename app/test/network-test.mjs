// Nothing leaves the phone. Every screen of the app is walked, in both languages and from a
// first launch, with every request to anywhere outside the app blocked and counted. One attempt
// fails the test.
//   node test/network-test.mjs      (part of `npm test`)
// The only things a person can do that open something outside the app are links to the phone's
// own apps (call, text, the browser for 988's chat and for Quick exit). Those are links the
// person taps; the app itself asks for nothing. They are listed and checked here too.
// Desktop Chromium with stand-ins for the phone, muted. Not a phone.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, counter, pagePath, SEEDED } from './helpers.mjs';
import { walk, walkFirstLaunch } from './app-screens.mjs';
import { openBrowser } from './quiet.mjs';

const { check, tally } = counter();
const { base, close } = await serve();
const browser = await openBrowser();

async function newPage(lang, seed) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const attempts = [];
  // Block and record every request that is not for one of the app's own files. WebSockets,
  // beacons, and service-worker fetches come through the same route.
  await context.route((url) => !url.href.startsWith(base), (route) => { attempts.push(`${route.request().method()} ${route.request().url()} (${route.request().resourceType()})`); return route.abort(); });
  await context.addInitScript(() => {
    window.__tidelight = { clockRate: 1, locationAuthorization: 'whenInUse', notificationAuthorization: 'authorized', position: { latitude: 1, longitude: 1 }, pickContact: async () => ({ name: 'A made-up friend', phone: '555-0100' }) };
    // Other ways out of a page that a route can miss: count them too.
    window.__ways = [];
    const note = (name) => function wrapped(...args) { window.__ways.push(name + ' ' + String(args[0]).slice(0, 80)); throw new Error('blocked by the network test'); };
    if (navigator.sendBeacon) navigator.sendBeacon = note('sendBeacon');
    window.WebSocket = note('WebSocket');
    window.EventSource = note('EventSource');
    if (window.RTCPeerConnection) window.RTCPeerConnection = note('RTCPeerConnection');
  });
  if (seed) await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  await page.goto(base + pagePath(lang));
  await page.waitForSelector('html.app-ready');
  return { context, page, attempts };
}

console.log('A full walk of the app with the network blocked');
for (const lang of ['en', 'es']) {
  const first = await newPage(lang, false);
  let pages = 0;
  await walkFirstLaunch(first.page, async () => { pages += 1; });
  const firstWays = await first.page.evaluate(() => window.__ways);
  check(first.attempts.length === 0 && firstWays.length === 0, `${lang}: a first launch, through all ${pages} onboarding pages, asks for nothing outside the app` + (first.attempts.length ? ': ' + first.attempts.slice(0, 3).join(', ') : '') + (firstWays.length ? ': ' + firstWays.join(', ') : ''));
  await first.context.close();

  const { context, page, attempts } = await newPage(lang, true);
  const unreached = [];
  let screens = 0;
  await walk(page, async (screen, p, problem) => { if (problem) unreached.push(screen.id); else screens += 1; });
  const ways = await page.evaluate(() => window.__ways);
  check(unreached.length === 0, `${lang}: all ${screens} screens were reached` + (unreached.length ? ': not ' + unreached.join(', ') : ''));
  check(attempts.length === 0, `${lang}: across every screen, a check-in, a journal visit, a meditation, the share notice, and the place alert, the app made 0 requests to anywhere outside itself` + (attempts.length ? ': ' + attempts.slice(0, 4).join(', ') : ''));
  check(ways.length === 0, `${lang}: and opened no socket, beacon, or peer connection` + (ways.length ? ': ' + ways.join(', ') : ''));
  const storage = await page.evaluate(() => ({ cookies: document.cookie.length, workers: navigator.serviceWorker ? 'has' : 'none' }));
  check(storage.cookies === 0, `${lang}: the app sets no cookies`);
  await context.close();
}

// ---------- what the built app could reach, read from its own files ----------
console.log('\nWhat the app\'s own files point at');
{
  const www = fileURLToPath(new URL('../www/', import.meta.url));
  const assets = readdirSync(join(www, 'assets')).filter((f) => /\.(js|css)$/.test(f));
  const found = new Set();
  for (const file of assets) for (const m of readFileSync(join(www, 'assets', file), 'utf8').matchAll(/https?:\/\/[a-z0-9.-]+[^\s"'`)<>\\]*/gi)) found.add(m[0].replace(/[.,;]+$/, ''));
  // Addresses that may appear in the app's scripts and styles: none are ever requested by the
  // app. They are where a person's own tap can lead, or names used inside the code.
  const allowed = [/^https:\/\/www\.weather\.gov\/?$/, /^https?:\/\/www\.w3\.org\//, /^https:\/\/(chat\.)?988lifeline\.org\//, /^https?:\/\/localhost\b/, /^https:\/\/capacitorjs\.com\//, /^https?:\/\/x\/?$/];
  const odd = [...found].filter((url) => !allowed.some((pattern) => pattern.test(url)));
  check(odd.length === 0, `the app's scripts and styles name no outside address beyond the known few (${found.size} found)` + (odd.length ? ': ' + odd.slice(0, 5).join(', ') : ''));
  const page = readFileSync(join(www, 'check-in', 'index.html'), 'utf8');
  const policy = (page.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/) || [])[1] || '';
  check(/default-src 'none'/.test(policy) && /connect-src 'self'/.test(policy) && !/https?:/.test(policy.replace(/'sha256-[^']+'/g, '')), 'the page\'s own security policy allows connections to the app itself and nowhere else');
  const loaded = [...page.matchAll(/<(?:script|link|img|audio|video|source|iframe)\b[^>]*?(?:src|href)="([^"]+)"/g)].map((m) => m[1]).filter((u) => /^(https?:)?\/\//.test(u) && !/rel="(alternate|canonical)"/.test(page.slice(Math.max(0, page.indexOf(u) - 200), page.indexOf(u))));
  const loadedOutside = loaded.filter((u) => !/weather\.gov|988lifeline\.org|stillwatersps\.github\.io/.test(u));
  check(loadedOutside.length === 0, 'the page loads no script, style, image, sound, or frame from another site' + (loadedOutside.length ? ': ' + loadedOutside.join(', ') : ''));
}

await browser.close();
close();
console.log(`\n${tally.passes} passed, ${tally.failures} failed. Desktop Chromium only, with stand-ins for the phone; not a phone.`);
process.exit(tally.failures ? 1 : 0);

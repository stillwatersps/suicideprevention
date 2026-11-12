// Measures a cold launch in the booted iOS Simulator, several times, and prints the median.
//   node tools/launch-time.mjs [runs=5]
// The app must already be installed (build it and `xcrun simctl install booted <App.app>`).
// Each run stops the app, starts it muted (the same argument `npm run sim:launch` passes), and
// times two moments from the app's own console output:
//   native  - the Tidelight plugin has loaded (the app's own code is running)
//   page    - "WebView loaded": the page and its scripts have finished loading
// It is a Simulator on a Mac, not a phone: use the numbers to compare builds, not as phone times.
import { spawn, execFileSync } from 'node:child_process';

const APP = 'org.tidelight.app';
const runs = Number(process.argv[2]) || 5;
const median = (list) => { const s = [...list].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : Math.round((s[s.length / 2 - 1] + s[s.length / 2]) / 2); };
const quiet = (fn) => { try { fn(); } catch (e) { /* not running */ } };

function once() {
  return new Promise((resolve) => {
    quiet(() => execFileSync('xcrun', ['simctl', 'terminate', 'booted', APP], { stdio: 'ignore' }));
    const started = Date.now();
    const marks = {};
    const child = spawn('xcrun', ['simctl', 'launch', '--console-pty', 'booted', APP, '-TidelightQuiet', 'YES']);
    const done = () => { child.kill(); resolve(marks); };
    const timer = setTimeout(done, 30000);
    let text = '';
    const read = (chunk) => {
      text += chunk;
      if (!marks.native && text.includes('quiet test run')) marks.native = Date.now() - started;
      if (!marks.page && text.includes('WebView loaded')) { marks.page = Date.now() - started; clearTimeout(timer); done(); }
    };
    child.stdout.on('data', read);
    child.stderr.on('data', read);
  });
}

const results = [];
for (let i = 0; i < runs; i += 1) {
  const marks = await once();
  results.push(marks);
  console.log(`run ${i + 1}: native ${marks.native ?? 'not seen'} ms, page ${marks.page ?? 'not seen within 30 s'} ms`);
  await new Promise((ok) => setTimeout(ok, 1500));
}
quiet(() => execFileSync('xcrun', ['simctl', 'terminate', 'booted', APP], { stdio: 'ignore' }));
const pages = results.map((r) => r.page).filter(Boolean);
const natives = results.map((r) => r.native).filter(Boolean);
console.log(`\nMedian of ${pages.length}: native ${natives.length ? median(natives) : '?'} ms, page loaded ${pages.length ? median(pages) : '?'} ms (iOS Simulator, cold start, muted).`);

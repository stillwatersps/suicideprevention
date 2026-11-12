// Fills in the "Screen by screen" part of notes/REVIEWER-PACKET.md: for every screen and state of
// the app, the exact words a person sees, in English, and a picture.
//   node tools/reviewer-walkthrough.mjs      (after a build)
// The words are read from the running app, so they are the app's own, never retyped. The parts
// that are on every screen (crisis strip, review and privacy notices, Support) are described once
// in the packet and left out here. Pictures go to app/design/after-launch-pass/reviewer/ and stay
// on this computer. Desktop Chromium with made-up data, muted; not a phone.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, pagePath, SEEDED } from '../test/helpers.mjs';
import { walk, walkFirstLaunch } from '../test/app-screens.mjs';
import { openBrowser } from '../test/quiet.mjs';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const packet = join(appDir, '..', 'notes', 'REVIEWER-PACKET.md');
const shots = join(appDir, 'design', 'after-launch-pass', 'reviewer');
const START = '<!-- WALKTHROUGH:START -->';
const END = '<!-- WALKTHROUGH:END -->';
mkdirSync(shots, { recursive: true });

// What each screen is for, in a line. The words under it come from the app.
const ABOUT = {
  'onboarding-welcome': 'The first thing a new person sees.',
  'onboarding-age': 'Asks a date of birth once, to choose an age group. Only the group is kept.',
  'onboarding-name': 'Asks for an optional first name, used in the greeting.',
  'onboarding-count': 'How many check-ins a day the person would like, from 1 to 5.',
  'onboarding-times': 'When the person wakes and goes to bed, to space the check-ins.',
  'onboarding-style': 'Chooses between two voices for the app\'s prompts.',
  'onboarding-location': 'Offers to save one "home spot". Optional.',
  'onboarding-notifications': 'Offers check-in reminders. Optional.',
  'onboarding-done': 'The end of setup.',
  home: 'The first tab: a greeting, the next check-in, the streak, and four quick tools.',
  'home-menu-open': 'Home with the website\'s menu open (links to the site\'s other pages).',
  streak: 'Opened from the streak card on Home.',
  settings: 'Opened from the gear on Home.',
  checkin: 'The second tab: every kind of check-in, the journal, and the person\'s history.',
  'flow-mood': 'The quick check-in: one tap on a mood, and optional tags and a note.',
  'flow-done': 'The end of an ordinary quick check-in (mood Okay, Good, or Great).',
  'daily-question': 'The longer Daily check-in, first of five questions.',
  'daily-needs': 'The Daily check-in\'s last question, with a 988 and 911 line.',
  'daily-result': 'What the Daily check-in shows at the end: ideas chosen from the answers.',
  share: 'The notice shown before anything is shared.',
  journal: 'A private journal.',
  rediscover: 'Prompts about things the person used to enjoy.',
  hope: 'The Hope box: the person\'s own reasons, words, and photos.',
  journey: 'The person\'s history, sharing, and "Delete everything".',
  meditate: 'The third tab: a suggested session and four types.',
  builder: 'Builds a custom session from length, feeling, and sound.',
  history: 'Past sessions.',
  player: 'A session in progress. The crisis strip stays on screen above it.',
  'player-end': 'The question shown when a session is ended early.',
  complete: 'The end of a session, with an optional "how do you feel now".',
  'complete-support': 'The end of a session after the person answers "Very low" or "Low".',
  location: 'The fourth tab, before "Places that are hard for me" is turned on.',
  'location-on': 'The fourth tab with the feature turned on.',
  'place-alert': 'What opens from the notification after the person has stayed at one of their places.',
  friends: 'The fifth tab: My circle, and sharing check-ins.',
  'flow-support': 'What a quick check-in shows at once after "Very low" or "Low", instead of the thanks line.',
  'daily-result-heavy': 'The Daily check-in\'s result after choosing a heavy feeling (here, Sad).',
};

// The words on screen now, without the parts that are on every screen. Those parts are taken out
// of the layout for a moment while the words are read, then put back.
function wordsOnScreen(screenId) {
  const main = document.querySelector('main') || document.body;
  const frame = ['.review-note', '.tl-review', '#support', '.ci-support', '.ci-privacy', '.lang-switch'];
  // The place alert stays open once shown; it belongs to its own screen only.
  if (screenId !== 'place-alert') frame.push('#app-place-alert');
  const hidden = [];
  for (const selector of frame) for (const el of document.querySelectorAll(selector)) { hidden.push([el, el.style.display]); el.style.display = 'none'; }
  const text = main.innerText;
  for (const [el, was] of hidden) el.style.display = was;
  const lines = text.split('\n').map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean);
  return lines.filter((line, i) => line !== lines[i - 1]);
}

const { base, close } = await serve();
const browser = await openBrowser();
const sections = [];
let number = 0;

async function record(screen, page, problem) {
  number += 1;
  const file = `${String(number).padStart(2, '0')}-${screen.id}.png`;
  let lines = [];
  if (!problem) {
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(shots, file), fullPage: false });
    lines = await page.evaluate(wordsOnScreen, screen.id);
    // "I'm okay" closes the place alert, so it isn't in the pictures that follow.
    if (screen.id === 'place-alert' && await page.isVisible('#app-place-alert .app-alert-okay')) await page.click('#app-place-alert .app-alert-okay');
  }
  const about = ABOUT[screen.id] || '';
  sections.push([`### ${number}. ${screen.name}`, '', about, '', `Picture: \`app/design/after-launch-pass/reviewer/${file}\``, '', problem ? '(This screen could not be reached when the packet was made.)' : lines.map((line) => '> ' + line.replace(/([<>*_`[\]])/g, '\\$1')).join('  \n'), ''].join('\n'));
}

const init = () => { window.__tidelight = { clockRate: 1, locationAuthorization: 'whenInUse', notificationAuthorization: 'authorized', position: { latitude: 1, longitude: 1 }, pickContact: async () => ({ name: 'A made-up friend', phone: '555-0100' }) }; };
{
  const context = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 });
  await context.addInitScript(init);
  const page = await context.newPage();
  await page.goto(base + pagePath('en'));
  await page.waitForSelector('html.app-ready');
  await walkFirstLaunch(page, record);
  await context.close();
}
{
  const context = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 });
  await context.addInitScript(init);
  await context.addInitScript(SEEDED);
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  await page.goto(base + pagePath('en'));
  await page.waitForSelector('html.app-ready');
  await walk(page, record);
  await context.close();
}
await browser.close();
close();

const before = readFileSync(packet, 'utf8');
if (!before.includes(START) || !before.includes(END)) { console.log('notes/REVIEWER-PACKET.md has lost its WALKTHROUGH marks.'); process.exit(1); }
const body = sections.join('\n');
writeFileSync(packet, before.slice(0, before.indexOf(START) + START.length) + '\n\n' + body + '\n' + before.slice(before.indexOf(END)));
console.log(`Wrote ${number} screens into notes/REVIEWER-PACKET.md, and their pictures into app/design/after-launch-pass/reviewer/.`);

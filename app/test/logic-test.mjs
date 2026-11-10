// Tests the app's pure logic with Node alone: the check-in summary, the time slots, the reminders,
// and the places settings. No browser, no phone. Run with `node test/logic-test.mjs`.
import assert from 'node:assert/strict';
import { slotFor, defaultReminders, parseTime, timeText, fill, summaryText, joinNames, defaultPlacesConfig, newId, MAX_PLACES, MAX_PEOPLE, DWELL_CHOICES } from '../src/logic.js';
import { ageOn, groupFor } from '../src/ages.js';

let passes = 0;
let failures = 0;
function test(name, fn) {
  try { fn(); passes++; console.log('  ok   ' + name); } catch (e) { failures++; console.log('  FAIL ' + name + '\n       ' + e.message); }
}

const words = {
  title: 'Tidelight check-ins', feeling: 'feeling', needs: 'Needs:', none: 'No check-ins on these days.',
  footer: 'Shared by me from the Tidelight app.', slots: { morning: 'Morning', midday: 'Midday', afternoon: 'After school or work', evening: 'Before bed' },
};
const at = (y, m, d, h, min) => new Date(y, m - 1, d, h, min).getTime();
const now = new Date(2026, 10, 10, 20, 0); // Tuesday, November 10, 2026, 8 pm

console.log('\nTime of day');
test('files each time of day under the right check-in', () => {
  assert.equal(slotFor(new Date(2026, 0, 1, 7, 59)), 'morning');
  assert.equal(slotFor(new Date(2026, 0, 1, 11, 0)), 'midday');
  assert.equal(slotFor(new Date(2026, 0, 1, 15, 40)), 'afternoon');
  assert.equal(slotFor(new Date(2026, 0, 1, 21, 15)), 'evening');
  assert.equal(slotFor(new Date(2026, 0, 1, 2, 0)), 'evening', 'the small hours count as before bed');
});

console.log('\nThe summary that can be shared');
test('a day with check-ins lists each one with its time, feeling and needs', () => {
  const log = [
    { at: at(2026, 11, 10, 8, 5), feeling: 'Tired', needs: ['Rest'] },
    { at: at(2026, 11, 10, 15, 40), feeling: 'Okay', needs: ['Someone to talk to', 'Quiet'] },
  ];
  const text = summaryText(log, { days: 1, now, words, lang: 'en' });
  assert.match(text, /^Tidelight check-ins, Tuesday, November 10\n/);
  assert.match(text, /Morning, 8:05 AM: feeling tired\. Needs: rest\./);
  assert.match(text, /After school or work, 3:40 PM: feeling okay\. Needs: someone to talk to, quiet\./);
  assert.ok(text.endsWith('\n\nShared by me from the Tidelight app.'), 'ends with the footer');
});
test('a day with nothing says so and still has the footer', () => {
  const text = summaryText([], { days: 1, now, words, lang: 'en' });
  assert.equal(text, 'Tidelight check-ins, Tuesday, November 10\nNo check-ins on these days.\n\nShared by me from the Tidelight app.');
});
test('the last 7 days includes only those days, grouped by day, oldest first', () => {
  const log = [
    { at: at(2026, 11, 3, 9, 0), feeling: 'Calm', needs: [] },       // 8 days ago: left out
    { at: at(2026, 11, 4, 9, 0), feeling: 'Sad', needs: [] },        // 7th day back: included
    { at: at(2026, 11, 10, 21, 30), feeling: 'Hopeful', needs: [] },
    { at: at(2026, 11, 7, 12, 10), feeling: '', needs: ['Rest'] },
    { at: at(2026, 11, 11, 8, 0), feeling: 'Future', needs: [] },    // tomorrow: left out
  ];
  const text = summaryText(log, { days: 7, now, words, lang: 'en' });
  assert.match(text, /^Tidelight check-ins, Wednesday, November 4 – Tuesday, November 10\n/);
  assert.doesNotMatch(text, /calm/);
  assert.doesNotMatch(text, /future/i);
  const sad = text.indexOf('sad');
  const rest = text.indexOf('Needs: rest');
  const hopeful = text.indexOf('hopeful');
  assert.ok(sad > 0 && sad < rest && rest < hopeful, 'oldest first');
  assert.match(text, /\nSaturday, November 7\nMidday, 12:10 PM\. Needs: rest\./, 'a check-in with no feeling still shows its needs');
});
test('the summary never includes written words or scores, only what was chosen', () => {
  const log = [{ at: at(2026, 11, 10, 8, 0), feeling: 'Okay', needs: [], text: 'a private journal line', score: 7 }];
  const text = summaryText(log, { days: 1, now, words, lang: 'en' });
  assert.doesNotMatch(text, /private journal/);
  assert.doesNotMatch(text, /7/);
});
test('unreadable dates are skipped', () => {
  const text = summaryText([{ at: 'not a date', feeling: 'Okay', needs: [] }], { days: 1, now, words, lang: 'en' });
  assert.match(text, /No check-ins on these days/);
});

console.log('\nReminders');
test('all four reminders start off, with sensible times', () => {
  const r = defaultReminders();
  assert.deepEqual(r.map((x) => x.slot), ['morning', 'midday', 'afternoon', 'evening']);
  assert.ok(r.every((x) => x.enabled === false));
  assert.deepEqual(r.map((x) => timeText(x.hour, x.minute)), ['08:00', '12:00', '15:30', '21:00']);
});
test('times are read and written in 24-hour form', () => {
  assert.deepEqual(parseTime('07:45'), { hour: 7, minute: 45 });
  assert.deepEqual(parseTime('23:59'), { hour: 23, minute: 59 });
  assert.equal(parseTime('24:00'), null);
  assert.equal(parseTime('nope'), null);
  assert.equal(timeText(7, 5), '07:05');
});

console.log('\nPlaces that are hard for me');
test('starts off with no places, no people, and a 20-minute wait', () => {
  const c = defaultPlacesConfig('hello');
  assert.equal(c.enabled, false);
  assert.deepEqual(c.places, []);
  assert.deepEqual(c.contacts, []);
  assert.equal(c.dwellMinutes, 20);
  assert.equal(c.countdownSeconds, 30);
  assert.equal(c.showPlaceOnLockScreen, false);
  assert.equal(c.message, 'hello');
});
test('the limits match the phone (20 places) and the design (5 people, 10 to 30 minutes)', () => {
  assert.equal(MAX_PLACES, 20);
  assert.equal(MAX_PEOPLE, 5);
  assert.deepEqual(DWELL_CHOICES, [10, 20, 30]);
});
test('placeholders are filled and missing values leave nothing behind', () => {
  assert.equal(fill("You've been at {place} for {minutes} minutes.", { place: 'the bridge', minutes: 20 }), "You've been at the bridge for 20 minutes.");
  assert.equal(fill('{a}{b}', { a: 'x' }), 'x');
});
test('names join into a sentence', () => {
  assert.equal(joinNames([], 'and'), '');
  assert.equal(joinNames(['Ana'], 'and'), 'Ana');
  assert.equal(joinNames(['Ana', 'Sam'], 'and'), 'Ana and Sam');
  assert.equal(joinNames(['Ana', 'Sam', 'Lee'], 'y'), 'Ana, Sam y Lee');
});
test('new ids differ', () => { assert.notEqual(newId(), newId()); });

console.log('\nAges');
test('age groups', () => {
  assert.equal(groupFor(12), 'child');
  assert.equal(groupFor(13), 'teen');
  assert.equal(groupFor(18), 'young');
  assert.equal(groupFor(25), 'adult');
  assert.equal(groupFor(65), 'older');
  assert.equal(ageOn(new Date(2010, 10, 11), new Date(2026, 10, 10)), 15, 'the day before a birthday');
});

console.log(`\n${passes} passed, ${failures} failed. Logic only; no browser and no phone.`);
process.exit(failures ? 1 : 0);

// The safety rules that can be proved without a browser: what counts as a very low check-in,
// when a day is "quiet", what a notification may say, how streaks may speak, and that every new
// screen is marked as a draft. Each test names the rule it holds. See notes/LAUNCH-READINESS.md,
// "Safety rules and their tests".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isLowMood, isHeavyFeeling, showsSupport, isQuietDay } from '../../src/logic/safety.js';
import { CONFIG } from '../../src/core/config.js';
import { dateKey, addDays, daysBetween, evaluate, monthGrid, weekRow, recordCheckIn, emptyStreak } from '../../src/logic/streaks.js';

const text = (name) => readFileSync(new URL('../../src/text/' + name, import.meta.url), 'utf8');
const words = (html) => Object.fromEntries(Array.from(html.matchAll(/<span data-word="([^"]+)"(?: data-style="([^"]+)")?>([^<]*)<\/span>/g)).map((m) => [m[1] + (m[2] ? '.' + m[2] : ''), m[3]]));
const EN = words(text('redesign.en.html'));
const ES = words(text('redesign.es.html'));
const OLD_EN = words(text('en.html'));
const OLD_ES = words(text('es.html'));

// ---------- Rule: a very low mood or a heavy feeling shows support at once ----------
test('a mood of 1 or 2 is very low; 3, 4, and 5 are not', () => {
  assert.equal(CONFIG.checkIn.lowMoodMax, 2, 'the line is at 2: changing it is a clinical decision, not a code change');
  for (const mood of [1, 2, '1', '2']) assert.equal(isLowMood(mood), true, `mood ${mood}`);
  for (const mood of [3, 4, 5, '3', '5']) assert.equal(isLowMood(mood), false, `mood ${mood}`);
});
test('a missing or broken mood is not treated as an answer', () => {
  for (const mood of [undefined, null, '', 0, NaN, 'low', 1.5, -1, 6, {}, []]) assert.equal(isLowMood(mood), false, `mood ${String(mood)}`);
});
test('the five heavy feelings, and only those, count as distress on the Daily check-in', () => {
  assert.deepEqual([...CONFIG.checkIn.distressFeelings].sort(), ['anxious', 'disconnected', 'exhausted', 'overwhelmed', 'sad']);
  for (const feeling of ['overwhelmed', 'sad', 'anxious', 'disconnected', 'exhausted']) assert.equal(isHeavyFeeling(feeling), true, feeling);
  for (const feeling of ['hopeful', 'calm', 'okay', 'unsure', '', undefined, null, 'SAD']) assert.equal(isHeavyFeeling(feeling), false, String(feeling));
});
test('every kind of check-in that should show support does, in every combination', () => {
  for (let mood = 1; mood <= 5; mood += 1) {
    assert.equal(showsSupport({ kind: 'quick', mood }), mood <= 2, `quick check-in, mood ${mood}`);
    assert.equal(showsSupport({ kind: 'meditation', mood }), mood <= 2, `after a meditation, mood ${mood}`);
  }
  for (const feeling of ['hopeful', 'calm', 'okay', 'unsure', 'overwhelmed', 'sad', 'anxious', 'disconnected', 'exhausted']) {
    assert.equal(showsSupport({ kind: 'daily', feeling }), isHeavyFeeling(feeling), `Daily check-in, ${feeling}`);
  }
  // A skipped question is not distress, and a broken record never throws.
  for (const detail of [{ kind: 'daily', feeling: '' }, { kind: 'daily' }, { kind: 'quick' }, {}, null, undefined, { kind: 'other', mood: 1 }]) assert.equal(showsSupport(detail), false);
});

// ---------- Rule: after a very low check-in the day is quiet, until the next calendar day ----------
test('a quiet day lasts for that calendar day only', () => {
  assert.equal(isQuietDay('2026-11-30', '2026-11-30'), true);
  assert.equal(isQuietDay('2026-11-30', '2026-12-01'), false, 'the next day is not quiet');
  assert.equal(isQuietDay('2026-12-01', '2026-11-30'), false, 'a clock moved back does not make another day quiet');
  for (const broken of [undefined, null, '', '2026-12-1', 20261201, {}]) assert.equal(isQuietDay(broken, '2026-12-01'), false, String(broken));
});
test('the quiet day and today are written the same way on the 1st to the 9th (the "days 1 to 9" bug)', () => {
  for (let day = 1; day <= 9; day += 1) {
    const key = dateKey(new Date(2026, 11, day, 9, 0));
    assert.equal(key, `2026-12-0${day}`, 'two digits, always');
    assert.equal(isQuietDay(key, dateKey(new Date(2026, 11, day, 23, 59))), true, `quiet all day on the ${day}th`);
  }
  assert.equal(dateKey(new Date(2026, 0, 1, 0, 0)), '2026-01-01');
});

// ---------- Rule: dates never break the record ----------
test('month ends, the year end, and a leap day are whole calendar days', () => {
  assert.equal(addDays('2026-11-30', 1), '2026-12-01');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(addDays('2028-02-29', 1), '2028-03-01');
  assert.equal(addDays('2027-03-01', -1), '2027-02-28');
  assert.equal(daysBetween('2026-12-31', '2027-01-01'), 1);
});
test('a check-in on the last evening of a month and one on the 1st are two days in a row', () => {
  const days = {};
  recordCheckIn(days, '2026-11-30', 1);
  let out = evaluate({ streak: null, days, todayKey: '2026-11-30', goal: 1 });
  recordCheckIn(out.days, '2026-12-01', 1);
  out = evaluate({ streak: out.streak, days: out.days, todayKey: '2026-12-01', goal: 1 });
  assert.equal(out.streak.current, 2);
  const december = monthGrid(out.days, '2026-12-01').filter(Boolean);
  assert.equal(december.length, 31);
  assert.equal(december[0].key, '2026-12-01');
  assert.equal(december.filter((cell) => cell.state === 'complete').length, 1, 'only the 1st is marked in December');
  assert.equal(weekRow(out.days, '2026-12-01').length, 7);
});
test('a clock set backward does not crash, erase, or invent days', () => {
  const days = {};
  for (const key of ['2026-11-10', '2026-11-11', '2026-11-12']) recordCheckIn(days, key, 1);
  const forward = evaluate({ streak: null, days, todayKey: '2026-11-12', goal: 1 });
  assert.equal(forward.streak.current, 3);
  // The phone's date is now a week earlier than the last day the app settled.
  const back = evaluate({ streak: forward.streak, days: forward.days, todayKey: '2026-11-05', goal: 1 });
  assert.ok(Number.isInteger(back.streak.current) && back.streak.current >= 0, 'the streak is still a whole number, never negative');
  assert.ok(back.streak.best >= 3, 'the best is kept');
  for (const key of ['2026-11-10', '2026-11-11', '2026-11-12']) assert.equal(back.days[key].checkInsCompleted, 1, `${key} is still on record`);
  assert.equal(Object.keys(back.days).filter((key) => key < '2026-11-05').length, 0, 'no days are made up before the first real one');
  // And when the clock is right again, nothing was lost.
  const again = evaluate({ streak: back.streak, days: back.days, todayKey: '2026-11-12', goal: 1 });
  assert.equal(again.streak.current, 3);
});
test('a first-ever launch and a long absence both settle without error', () => {
  const first = evaluate({ streak: null, days: {}, todayKey: '2026-12-01', goal: 3 });
  assert.equal(first.streak.current, 0);
  assert.deepEqual(first.events.milestone || null, null);
  const away = evaluate({ streak: Object.assign(emptyStreak(), { lastEvaluatedDate: '2025-01-01' }), days: {}, todayKey: '2026-12-01', goal: 3 });
  assert.equal(away.streak.current, 0, 'nearly two years away is worked out, not looped over forever');
});

// ---------- Rule: notifications and the lock screen are discreet ----------
const NEVER_ON_A_NOTIFICATION = /suicid|crisis|crisi|mood|ánimo|animo|depress|deprim|self.?harm|autolesi|988|911|lifeline|check.?in on you|worried/i;
test('check-in reminders never mention suicide, crisis, mood, or a crisis line, in either language', () => {
  for (const [name, set] of [['English', EN], ['Spanish', ES]]) {
    const lines = Object.entries(set).filter(([key]) => key.startsWith('rem.title') || key.startsWith('rem.body'));
    assert.ok(lines.length >= 3, `${name}: a title and a body for each style`);
    for (const [key, line] of lines) assert.ok(line.trim().length > 0 && !NEVER_ON_A_NOTIFICATION.test(line), `${name} ${key}: "${line}"`);
  }
});
test('the place notification\'s default words say nothing private', () => {
  for (const [name, set] of [['English', OLD_EN], ['Spanish', OLD_ES]]) {
    for (const key of ['notifTitle', 'notifBody']) assert.ok(set[key] && !NEVER_ON_A_NOTIFICATION.test(set[key]), `${name} ${key}: "${set[key]}"`);
    assert.ok(!/\{place\}|\{minutes\}/.test(set.notifBody), `${name}: the default body names no place and no time`);
    assert.ok(/\{place\}/.test(set.notifBodyWithPlace), `${name}: the place is named only in the version the person switches on`);
  }
});

// ---------- Rule: streak language stays gentle ----------
const BLAME = /\bmiss(ed|ing)?\b.*\b(streak|day)s?\b.*\b(lost|broke|fail)|you (lost|broke|failed)|lost your|broke your|failed|failure|shame|guilt|perdiste|rompiste|fallaste|fracas|culpa|vergüenza/i;
test('no streak line blames, shames, or says a streak was lost', () => {
  for (const [name, set] of [['English', EN], ['Spanish', ES]]) {
    const lines = Object.entries(set).filter(([key]) => key.startsWith('streak.'));
    assert.ok(lines.length >= 6, `${name}: the streak lines are in the text source`);
    for (const [key, line] of lines) assert.ok(!BLAME.test(line), `${name} ${key}: "${line}"`);
  }
});

// ---------- Rule: every new screen is marked "Draft for review" ----------
test('every screen and onboarding page of the redesign carries the draft mark, in both languages', () => {
  for (const [name, file, mark] of [['English', 'redesign.en.html', 'Draft for review'], ['Spanish', 'redesign.es.html', 'Borrador para revisión']]) {
    const html = text(file);
    const screens = html.split(/<section class="tl-screen/).slice(1).map((part) => part.slice(0, part.indexOf('</section>')));
    assert.ok(screens.length >= 10, `${name}: the screens are in the text source`);
    // The older sections' holder shows them unchanged; they carry the website's own review notice.
    const unmarked = screens.filter((screen) => !/id="tl-legacy"/.test(screen.slice(0, 200)) && !(screen.includes('class="tl-draft-tag"') && screen.includes('href="#tl-review"')));
    assert.deepEqual(unmarked.map((screen) => (screen.match(/id="([^"]+)"/) || [])[1]), [], `${name}: screens without the draft mark`);
    assert.ok(html.includes(mark), name);
    assert.ok(/id="tl-review"/.test(html), `${name}: the notice the marks link to exists`);
    assert.ok(html.split('class="tl-draft-tag"').length - 1 >= screens.length - 1, `${name}: one mark per screen`);
  }
});

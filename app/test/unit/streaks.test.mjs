// Unit tests for streaks (BUILD-SPEC 3D), all through local "YYYY-MM-DD" keys.
import test from 'node:test';
import assert from 'node:assert/strict';
import { dateKey, addDays, daysBetween, isoWeek, weekdayIndex, emptyStreak, isComplete, ensureDay, recordCheckIn, recordMeditation,
  evaluate, streakEndingAt, weekRow, monthGrid, nextFreezeDay, daysFromLog } from '../../src/logic/streaks.js';
import { CONFIG } from '../../src/core/config.js';

const cfg = (over) => Object.assign({}, CONFIG.streak, over);
const HOUR = 3600000;
// A helper that lives through days: do(n check-ins, m meditations) on a key, then evaluate.
function world(start = '2026-11-02', goal = 3, config = cfg()) { // November 2, 2026 is a Monday
  const w = { days: {}, streak: null, goal, key: start, ms: Date.UTC(2026, 10, 2, 15), events: null };
  w.open = (key = w.key) => {
    w.ms += daysBetween(w.key, key) * 24 * HOUR;
    w.key = key;
    const out = evaluate({ streak: w.streak, days: w.days, todayKey: key, nowMs: w.ms, goal: w.goal, config });
    w.streak = out.streak; w.events = out.events;
    return w;
  };
  w.checkIn = (n = 1) => { for (let i = 0; i < n; i += 1) recordCheckIn(w.days, w.key, w.goal, config.rule); return w.open(); };
  w.meditate = (n = 1) => { for (let i = 0; i < n; i += 1) recordMeditation(w.days, w.key, w.goal, config.rule); return w.open(); };
  w.next = (n = 1) => w.open(addDays(w.key, n));
  w.completeDays = (n) => { for (let i = 0; i < n; i += 1) { w.checkIn(w.goal); if (i < n - 1) w.next(); } return w; };
  return w.open();
}

test('date keys, calendar arithmetic, and weeks', () => {
  assert.equal(dateKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(addDays('2026-02-28', 1), '2026-03-01');
  assert.equal(addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(addDays('2026-01-01', -1), '2025-12-31');
  assert.equal(daysBetween('2026-03-07', '2026-03-09'), 2);
  assert.equal(weekdayIndex('2026-11-02'), 0, 'a Monday');
  assert.equal(weekdayIndex('2026-11-08'), 6, 'a Sunday');
  assert.equal(isoWeek('2026-11-02'), '2026-W45');
  assert.equal(isoWeek('2026-11-08'), '2026-W45');
  assert.equal(isoWeek('2026-11-09'), '2026-W46');
  assert.equal(isoWeek('2027-01-01'), '2026-W53');
  assert.equal(isoWeek('2024-12-30'), '2025-W01');
});

test('a complete day under both rules', () => {
  const day = (c, m, g = 3) => ({ checkInsCompleted: c, meditationsCompleted: m, checkInGoal: g });
  assert.equal(isComplete(day(3, 0), 'allCheckIns'), true);
  assert.equal(isComplete(day(2, 5), 'allCheckIns'), false, 'meditations do not count under allCheckIns');
  assert.equal(isComplete(day(3, 0), 'either'), true);
  assert.equal(isComplete(day(1, 1), 'either'), true, 'one check-in and one meditation');
  assert.equal(isComplete(day(0, 2), 'either'), false, 'a meditation alone is not enough');
  assert.equal(isComplete(day(2, 0), 'either'), false);
  assert.equal(isComplete(null), false);
  assert.equal(CONFIG.streak.rule, 'either', 'the default rule');
});

test('the streak grows by one for each complete day, and today counts once complete', () => {
  const w = world();
  assert.equal(w.streak.current, 0);
  w.checkIn(2);
  assert.equal(w.streak.current, 0, 'two of three is not complete yet');
  w.checkIn(1);
  assert.equal(w.streak.current, 1, 'updates at once when the day completes');
  w.next().meditate().checkIn();
  assert.equal(w.streak.current, 2, 'one check-in and one meditation complete a day under "either"');
  assert.equal(w.streak.best, 2);
});

test('today in progress does not break the streak', () => {
  const w = world().completeDays(3);
  w.next();
  assert.equal(w.streak.current, 3, 'a new day with nothing done yet keeps the streak');
  assert.equal(w.events.broken, null);
  w.checkIn(1);
  assert.equal(w.streak.current, 3);
  assert.equal(w.days[w.key].status, 'inProgress');
});

test('a missed day with a freeze is frozen, and the streak continues', () => {
  const w = world().completeDays(3); // Monday to Wednesday; one freeze from the start
  assert.equal(w.streak.freezesAvailable, 1);
  w.next(2); // Thursday missed, now Friday
  assert.equal(w.days['2026-11-05'].status, 'frozen');
  assert.equal(w.streak.freezesAvailable, 0);
  assert.equal(w.streak.current, 4, 'frozen days count: three complete and one frozen');
  assert.equal(w.events.broken, null);
  assert.deepEqual(w.events.frozenDays, ['2026-11-05']);
  w.checkIn(3);
  assert.equal(w.streak.current, 5);
});

test('a missed day without a freeze resets the streak, and the best stays', () => {
  const w = world('2026-11-02', 3, cfg({ freezePerWeek: 0 })).completeDays(3);
  assert.equal(w.streak.freezesAvailable, 0);
  w.next(2);
  assert.equal(w.days['2026-11-05'].status, 'missed');
  assert.equal(w.streak.current, 0);
  assert.equal(w.streak.best, 3, 'best never decreases');
  assert.deepEqual(w.events.broken, { was: 3 });
  assert.deepEqual(w.streak.brokenNotice, { was: 3, at: '2026-11-05' });
});

test('two missed days with one freeze reset the streak', () => {
  const w = world().completeDays(3);
  w.next(3); // Thursday and Friday missed, now Saturday
  assert.equal(w.days['2026-11-05'].status, 'frozen', 'the one freeze covers the first missed day');
  assert.equal(w.days['2026-11-06'].status, 'missed');
  assert.equal(w.streak.current, 0);
  assert.equal(w.streak.freezesAvailable, 0);
});

test('two missed days in a row use two freezes, when two are held', () => {
  const w = world().completeDays(3);
  w.streak.freezesAvailable = 2;
  w.next(3);
  assert.equal(w.days['2026-11-05'].status, 'frozen');
  assert.equal(w.days['2026-11-06'].status, 'frozen');
  assert.equal(w.streak.current, 5);
  assert.equal(w.streak.freezesAvailable, 0);
});

test('a freeze is never spent when there is no streak to protect', () => {
  const w = world();
  w.next(3);
  assert.equal(w.streak.freezesAvailable, 1);
  assert.equal(w.days['2026-11-03'].status, 'missed');
  assert.equal(w.events.broken, null, 'nothing was broken');
});

test('one freeze arrives each Monday, and at most two are held', () => {
  const w = world(); // Monday November 2, starts with one
  assert.equal(w.streak.freezesAvailable, 1);
  w.next(6); // Sunday
  assert.equal(w.streak.freezesAvailable, 1, 'none mid-week');
  w.next(1); // Monday November 9
  assert.equal(w.streak.freezesAvailable, 2);
  w.next(7); // Monday November 16
  assert.equal(w.streak.freezesAvailable, 2, 'capped at two');
  assert.equal(w.streak.lastFreezeGrantWeek, '2026-W47');
  assert.equal(nextFreezeDay('2026-11-11'), '2026-11-16');
  assert.equal(nextFreezeDay('2026-11-16'), '2026-11-23', 'on a Monday, the next one is a week away');
});

test('a Monday freeze arrives before that Monday is settled', () => {
  const w = world('2026-11-06').completeDays(3); // Friday, Saturday, Sunday
  w.streak.freezesAvailable = 0;
  w.next(2); // Monday missed, now Tuesday: Monday's new freeze covers Monday
  assert.equal(w.days['2026-11-09'].status, 'frozen');
  assert.equal(w.streak.current, 4);
});

test('changing the goal mid-day applies from the next day', () => {
  const w = world('2026-11-02', 3);
  w.checkIn(1);
  w.goal = 1; // the person lowers "check-ins per day" during the day
  w.open();
  assert.equal(w.days[w.key].checkInGoal, 3, 'today keeps the goal it started with');
  assert.equal(w.streak.current, 0, 'one of three is still not complete today');
  w.checkIn(2);
  assert.equal(w.streak.current, 1);
  w.next();
  assert.equal(w.days[w.key].checkInGoal, 1, 'the new goal is used from the next day');
  w.checkIn(1);
  assert.equal(w.streak.current, 2);
});

test('the app not opened for five days is worked out correctly on return', () => {
  const w = world().completeDays(4); // Monday to Thursday
  w.streak.freezesAvailable = 2;
  w.next(6); // five days untouched (Friday to Tuesday), now Wednesday November 11
  const statuses = ['2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10'].map((k) => w.days[k].status);
  assert.deepEqual(statuses, ['frozen', 'frozen', 'missed', 'missed', 'missed']);
  assert.equal(w.streak.current, 0);
  assert.equal(w.streak.best, 6, 'four complete days and two frozen ones');
  assert.deepEqual(w.events.broken, { was: 6 });
  assert.equal(w.streak.freezesAvailable, 1, 'the Monday in between brought one');
  assert.equal(w.streak.lastEvaluatedDate, '2026-11-10');
  w.checkIn(3);
  assert.equal(w.streak.current, 1, 'a new start');
});

test('working it out twice changes nothing', () => {
  const w = world().completeDays(3);
  w.next(2);
  const before = JSON.stringify([w.streak, w.days]);
  w.open(); w.open();
  const after = JSON.parse(JSON.stringify([w.streak, w.days]));
  after[0].lastSeenMs = JSON.parse(before)[0].lastSeenMs;
  assert.equal(JSON.stringify(after), before);
});

test('a midnight boundary: 11:59 pm and 12:00 am are different days', () => {
  const late = new Date(2026, 10, 3, 23, 59, 30);
  const early = new Date(2026, 10, 4, 0, 0, 0);
  assert.equal(dateKey(late), '2026-11-03');
  assert.equal(dateKey(early), '2026-11-04');
  const days = {};
  recordCheckIn(days, dateKey(late), 1);
  recordCheckIn(days, dateKey(early), 1);
  const out = evaluate({ streak: null, days, todayKey: '2026-11-04', nowMs: early.getTime(), goal: 1 });
  assert.equal(out.streak.current, 2, 'each check-in counts for its own day');
});

test('daylight saving: days stay whole days when the clocks change', () => {
  const previous = process.env.TZ;
  process.env.TZ = 'America/New_York';
  try {
    // Clocks went forward on March 8, 2026 (a 23-hour day) and back on November 1, 2026 (25 hours).
    for (const [y, m, d] of [[2026, 2, 7], [2026, 9, 31]]) {
      const keys = [0, 1, 2].map((i) => dateKey(new Date(y, m, d + i, 12)));
      assert.equal(daysBetween(keys[0], keys[1]), 1);
      assert.equal(daysBetween(keys[1], keys[2]), 1);
      assert.equal(addDays(keys[0], 2), keys[2]);
      assert.equal(dateKey(new Date(y, m, d + 1, 0, 30)), keys[1], 'half past midnight on the change day');
      assert.equal(dateKey(new Date(y, m, d + 1, 23, 30)), keys[1], 'half past eleven on the change day');
    }
    const w = world('2026-10-30', 1).completeDays(4); // through November 2, across the change
    assert.equal(w.streak.current, 4);
  } finally {
    if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous;
  }
});

test('time zones: the same moment is filed under the local day, and travel does not break a streak', () => {
  const previous = process.env.TZ;
  const moment = new Date(Date.UTC(2026, 10, 4, 3, 30)); // 3:30 am UTC on November 4
  try {
    process.env.TZ = 'America/Los_Angeles';
    assert.equal(dateKey(moment), '2026-11-03', 'still the evening of the 3rd in Los Angeles');
    process.env.TZ = 'Asia/Tokyo';
    assert.equal(dateKey(moment), '2026-11-04', 'already the 4th in Tokyo');
  } finally {
    if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous;
  }
  // Flying east across the date line: checked in on the 3rd, lands 14 hours later on the 5th.
  // The 4th never really happened for this person, so it is frozen at no cost.
  const east = world('2026-11-02', 1).completeDays(2);
  east.streak.freezesAvailable = 0;
  const landed = evaluate({ streak: east.streak, days: east.days, todayKey: '2026-11-05', nowMs: east.ms + 14 * HOUR, goal: 1 });
  assert.equal(landed.days['2026-11-04'].status, 'frozen');
  assert.equal(landed.days['2026-11-04'].travel, true);
  assert.equal(landed.streak.current, 3);
  assert.equal(landed.events.broken, null);
  // A real missed day (more than a day of real time) is still a missed day.
  const slow = world('2026-11-02', 1).completeDays(2);
  slow.streak.freezesAvailable = 0;
  const later = evaluate({ streak: slow.streak, days: slow.days, todayKey: '2026-11-05', nowMs: slow.ms + 48 * HOUR, goal: 1 });
  assert.equal(later.days['2026-11-04'].status, 'missed');
  // Flying west: the local date goes back a day. Nothing is settled twice, nothing breaks.
  const west = world('2026-11-02', 1).completeDays(3);
  const back = evaluate({ streak: west.streak, days: west.days, todayKey: '2026-11-03', nowMs: west.ms + 5 * HOUR, goal: 1 });
  assert.equal(back.streak.current, 2, 'the streak as of that local day');
  assert.equal(back.streak.best, 3);
  assert.equal(back.events.broken, null);
  const again = evaluate({ streak: back.streak, days: back.days, todayKey: '2026-11-05', nowMs: west.ms + 30 * HOUR, goal: 1 });
  assert.equal(again.streak.current, 3, 'the day already completed still counts');
});

test('ordinary daily use never gets a free frozen day', () => {
  const w = world('2026-11-02', 1).completeDays(2);
  w.streak.freezesAvailable = 0;
  w.next(); // Wednesday, opened but nothing done
  const out = evaluate({ streak: w.streak, days: w.days, todayKey: '2026-11-05', nowMs: w.ms + 20 * HOUR, goal: 1 });
  assert.equal(out.days['2026-11-04'].status, 'missed', 'a day that was lived and missed is missed');
});

test('milestones are reported once each', () => {
  const w = world('2026-11-02', 1).completeDays(3);
  assert.equal(w.events.milestone, 3);
  w.streak.celebrated.push(3);
  w.open();
  assert.equal(w.events.milestone, null);
  w.next().checkIn();
  assert.equal(w.events.milestone, null, 'four is not a milestone');
  assert.deepEqual(CONFIG.streak.milestones, [3, 7, 14, 30, 50, 100, 200, 365]);
});

test('the week row and the month grid', () => {
  const w = world().completeDays(2); // Monday, Tuesday
  w.next(2); // Wednesday frozen, now Thursday
  const row = weekRow(w.days, w.key);
  assert.deepEqual(row.map((d) => d.state), ['complete', 'complete', 'frozen', 'today', 'ahead', 'ahead', 'ahead']);
  assert.equal(row[0].key, '2026-11-02');
  const grid = monthGrid(w.days, w.key);
  assert.equal(grid.length % 7, 0);
  assert.equal(grid.filter(Boolean).length, 30, 'November has 30 days');
  assert.equal(grid.indexOf(grid.find(Boolean)), 6, 'November 1, 2026 is a Sunday: the last column');
  assert.equal(grid.find((c) => c && c.key === '2026-11-04').state, 'frozen');
});

test('older check-ins become days, so history from before streaks is kept', () => {
  const log = [{ t: new Date(2026, 10, 9, 8).toISOString() }, { t: new Date(2026, 10, 9, 20).toISOString() }, { t: new Date(2026, 10, 10, 9).toISOString() }, { t: 'not a date' }];
  const days = daysFromLog(log, 2);
  assert.equal(days['2026-11-09'].checkInsCompleted, 2);
  assert.equal(days['2026-11-09'].status, 'complete');
  assert.equal(days['2026-11-10'].checkInsCompleted, 1);
  const out = evaluate({ streak: null, days, todayKey: '2026-11-11', nowMs: 1, goal: 2 });
  assert.equal(out.days['2026-11-10'].status, 'frozen', 'the starting freeze covers the incomplete day');
  assert.equal(out.streak.current, 2);
  assert.equal(streakEndingAt(out.days, '2026-11-10'), 2);
  assert.ok(ensureDay(out.days, '2026-11-11', 2));
  assert.deepEqual(emptyStreak().celebrated, []);
});

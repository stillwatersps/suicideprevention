// Unit tests for Phase 2's pure logic: check-in time spreading, the reminder plan, the setup
// checklist, and the style profile.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spreadTimes, effectiveTimes, planReminders, nextCheckInTime, toMinutes, fromMinutes } from '../../src/logic/spread.js';
import { deriveChecklist, checklistProgress, CHECKLIST } from '../../src/logic/checklist.js';
import { profileFor, PROFILES, STYLES } from '../../src/logic/style-profile.js';
import { defaultSettings } from '../../src/core/migrations.js';

test('times convert to minutes and back', () => {
  assert.equal(toMinutes('07:30'), 450);
  assert.equal(toMinutes('7:30'), null);
  assert.equal(toMinutes('24:00'), null);
  assert.equal(fromMinutes(450), '07:30');
  assert.equal(fromMinutes(1440 + 65), '01:05');
});

test('check-ins spread evenly between waking and bedtime', () => {
  assert.deepEqual(spreadTimes(1, '07:00', '22:00'), ['14:30']);
  assert.deepEqual(spreadTimes(3, '07:00', '22:00'), ['09:30', '14:30', '19:30']);
  assert.deepEqual(spreadTimes(5, '07:00', '22:00'), ['08:30', '11:30', '14:30', '17:30', '20:30']);
});

test('every count from 1 to 5 gives that many times, in order, inside the waking day, on 5-minute marks', () => {
  for (let n = 1; n <= 5; n += 1) {
    const times = spreadTimes(n, '06:40', '23:10');
    assert.equal(times.length, n);
    assert.deepEqual(times.slice().sort(), times);
    times.forEach((t) => {
      assert.ok(toMinutes(t) > toMinutes('06:40') && toMinutes(t) < toMinutes('23:10'));
      assert.equal(toMinutes(t) % 5, 0);
    });
    const gaps = times.slice(1).map((t, i) => toMinutes(t) - toMinutes(times[i]));
    gaps.forEach((gap) => assert.ok(Math.abs(gap - gaps[0]) <= 5, 'gaps are even'));
  }
});

test('a bedtime after midnight still spreads through the waking hours', () => {
  const times = spreadTimes(2, '10:00', '02:00');
  assert.deepEqual(times, ['14:00', '22:00']);
});

test('bad input falls back to sensible defaults instead of failing', () => {
  assert.equal(spreadTimes(0, 'x', 'y').length, 1);
  assert.equal(spreadTimes(3, '', '').length, 3);
});

test('the person\'s own times are used only when there is one per check-in', () => {
  const base = defaultSettings();
  assert.deepEqual(effectiveTimes({ ...base, checkInsPerDay: 2, customTimes: ['21:15', '07:45'] }), ['07:45', '21:15']);
  assert.deepEqual(effectiveTimes({ ...base, checkInsPerDay: 3, customTimes: ['21:15', '07:45'] }), ['09:30', '14:30', '19:30']);
  assert.deepEqual(effectiveTimes({ ...base, customTimes: null }), ['09:30', '14:30', '19:30']);
});

test('the reminder plan sets one reminder per time, for the days ahead, never in the past', () => {
  const now = new Date(2026, 10, 11, 12, 0);
  const plan = planReminders({ now, times: ['09:30', '14:30', '19:30'], days: 3 });
  assert.equal(plan.length, 2 + 3 + 3);
  assert.ok(plan.every((p) => p.at > now));
  assert.equal(new Set(plan.map((p) => p.id)).size, plan.length, 'ids are unique');
  assert.equal(plan[0].at.getHours(), 14);
});

test('a slot already covered by today\'s check-ins is skipped, today only', () => {
  const now = new Date(2026, 10, 11, 8, 0);
  const times = ['09:30', '14:30', '19:30'];
  assert.equal(planReminders({ now, times, checkInsToday: 0, days: 2 }).length, 6);
  const one = planReminders({ now, times, checkInsToday: 1, days: 2 });
  assert.equal(one.length, 5);
  assert.equal(one[0].at.getHours(), 14, 'the first of today\'s reminders is dropped');
  const all = planReminders({ now, times, checkInsToday: 3, days: 2 });
  assert.equal(all.length, 3, 'nothing more today, tomorrow as usual');
  assert.ok(all.every((p) => p.at.getDate() === 12));
});

test('the plan never exceeds what a phone keeps pending', () => {
  const now = new Date(2026, 10, 11, 0, 0);
  const plan = planReminders({ now, times: ['08:00', '10:00', '12:00', '14:00', '16:00'], days: 14, maxPending: 60 });
  assert.ok(plan.length <= 60);
  assert.equal(plan.length, 60);
  assert.deepEqual(planReminders({ now, times: [] }), []);
});

test('the plan crosses a month end and a daylight saving change on real calendar days', () => {
  const now = new Date(2026, 9, 30, 23, 0); // October 30; clocks change November 1 in the U.S.
  const plan = planReminders({ now, times: ['09:30'], days: 4 });
  assert.deepEqual(plan.map((p) => p.at.getDate()), [31, 1, 2]);
  assert.ok(plan.every((p) => p.at.getHours() === 9 && p.at.getMinutes() === 30));
});

test('the next check-in time is the first one left today', () => {
  const times = ['09:30', '14:30', '19:30'];
  assert.equal(nextCheckInTime({ now: new Date(2026, 10, 11, 8, 0), times }), '09:30');
  assert.equal(nextCheckInTime({ now: new Date(2026, 10, 11, 8, 0), times, checkInsToday: 1 }), '14:30');
  assert.equal(nextCheckInTime({ now: new Date(2026, 10, 11, 15, 0), times }), '19:30');
  assert.equal(nextCheckInTime({ now: new Date(2026, 10, 11, 21, 0), times }), null);
});

test('the checklist is worked out from real state', () => {
  const none = deriveChecklist({});
  assert.deepEqual(none.map((i) => i.id), CHECKLIST);
  assert.equal(checklistProgress(none).done, 0);
  const facts = { name: ' Sam ', countChosen: true, styleChosen: true, locationPermission: 'granted', home: { latitude: 1, longitude: 2 },
    notificationPermission: 'granted', remindersOn: true, checkInCount: 2, meditationCount: 1 };
  const all = deriveChecklist(facts);
  assert.deepEqual(checklistProgress(all), { done: 8, total: 8, complete: true });
});

test('a permission taken away later shows as not done again', () => {
  const facts = { name: 'Sam', locationPermission: 'denied', notificationPermission: 'denied', remindersOn: true, home: null };
  const items = Object.fromEntries(deriveChecklist(facts).map((i) => [i.id, i.done]));
  assert.equal(items.location, false);
  assert.equal(items.notifications, false);
  assert.equal(items.homeSpot, false);
  assert.equal(items.name, true);
  assert.equal(deriveChecklist({ name: '   ' })[0].done, false, 'a blank name is not a name');
  assert.equal(deriveChecklist({ notificationPermission: 'granted', remindersOn: false })[5].done, false, 'allowed but switched off is not on');
});

test('the style profile: Calm is slower with a breath first, Straightforward is quicker', () => {
  assert.deepEqual(STYLES, ['calm', 'straightforward']);
  assert.equal(profileFor('calm').speed, 1.4);
  assert.equal(profileFor('straightforward').speed, 0.8);
  assert.equal(profileFor('calm').breathBeforeCheckIn, true);
  assert.equal(profileFor('straightforward').breathBeforeCheckIn, false);
  assert.equal(profileFor('calm').hapticIntensity, 'light');
  assert.equal(profileFor('straightforward').hapticIntensity, 'medium');
  assert.equal(profileFor('nonsense'), PROFILES.calm, 'an unknown style falls back to Calm');
  assert.throws(() => { 'use strict'; PROFILES.calm.speed = 9; });
});

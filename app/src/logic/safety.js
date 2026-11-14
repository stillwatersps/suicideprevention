// The app's safety rules that are pure logic, in one place, so each has one implementation and
// one set of tests (test/unit/safety-rules.test.mjs). Screens ask these; they never decide alone.
//
//  - A very low mood (1 or 2 of 5) on a quick check-in, or after a meditation, shows crisis
//    support at once instead of the usual ending.
//  - A heavy feeling on the Daily check-in shows support at the top of its results.
//  - Either one makes the day "quiet": nothing celebrates, and no dawn is shown, until the
//    person's next calendar day.
import { CONFIG } from '../core/config.js';

// Only a mood that was actually chosen can be low. A missing answer is not an answer.
export function isLowMood(mood) {
  const value = Number(mood);
  return Number.isInteger(value) && value >= 1 && value <= CONFIG.checkIn.lowMoodMax;
}

export function isHeavyFeeling(feeling) {
  return CONFIG.checkIn.distressFeelings.indexOf(feeling) !== -1;
}

// A finished check-in, as the app announces it: { kind: 'quick', mood } or { kind: 'daily', feeling }.
export function showsSupport(checkIn) {
  const detail = checkIn || {};
  return (detail.kind === 'quick' && isLowMood(detail.mood)) || (detail.kind === 'daily' && isHeavyFeeling(detail.feeling)) || (detail.kind === 'meditation' && isLowMood(detail.mood));
}

// The day stays quiet only for the calendar day it was set on. Both are local "YYYY-MM-DD" keys.
// A key from another day (yesterday, or a clock that was moved) is not today.
export function isQuietDay(quietDay, todayKey) {
  return typeof quietDay === 'string' && quietDay.length === 10 && quietDay === todayKey;
}

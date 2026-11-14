// Streaks: a gentle count of days in a row, with freezes so a missed day doesn't have to end it.
// Pure: dates come in as local "YYYY-MM-DD" keys, so Node can test midnight, time zones, and
// daylight saving without a phone. All the numbers are in core/config.js.
//
// A day is the person's local calendar day. Each day has a record; once a day has ended it is
// settled as complete, frozen, or missed, and never changed back. The streak is read from those
// records, so working it out twice gives the same answer.
import { CONFIG } from '../core/config.js';

const pad = (n) => String(n).padStart(2, '0');

// The local calendar day of a Date, as "YYYY-MM-DD".
export function dateKey(date) {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}
const toUTC = (key) => { const [y, m, d] = key.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const fromUTC = (ms) => { const d = new Date(ms); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); };
// Calendar arithmetic on keys, so a 23- or 25-hour day is still one day.
export function addDays(key, n) { return fromUTC(toUTC(key) + n * 86400000); }
export function daysBetween(a, b) { return Math.round((toUTC(b) - toUTC(a)) / 86400000); }
// 0 = Monday ... 6 = Sunday.
export function weekdayIndex(key) { return (new Date(toUTC(key)).getUTCDay() + 6) % 7; }
// The ISO week a day belongs to, "YYYY-Www". Weeks start on Monday.
export function isoWeek(key) {
  const thursday = new Date(toUTC(key) + (3 - weekdayIndex(key)) * 86400000);
  const jan4 = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((thursday - jan4) / 86400000 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  return thursday.getUTCFullYear() + '-W' + pad(week);
}

export function emptyStreak() {
  return { current: 0, best: 0, freezesAvailable: 0, lastFreezeGrantWeek: null, lastEvaluatedDate: null, celebrated: [], brokenNotice: null, lastSeenMs: null, lastSeenKey: null };
}
function newDay(key, goal) {
  return { dateKey: key, checkInsCompleted: 0, checkInGoal: goal, meditationsCompleted: 0, status: 'inProgress' };
}

// 'allCheckIns': every check-in of that day's goal. 'either': that, or one check-in and one meditation.
export function isComplete(day, rule = CONFIG.streak.rule) {
  if (!day) return false;
  const all = day.checkInsCompleted >= day.checkInGoal;
  if (rule === 'allCheckIns') return all;
  return all || (day.checkInsCompleted >= 1 && day.meditationsCompleted >= 1);
}

// Today's record, made the first time the day is touched. It snapshots the goal, so changing
// "check-ins per day" in the middle of a day applies from the next day.
export function ensureDay(days, key, goal) {
  if (!days[key]) days[key] = newDay(key, goal);
  return days[key];
}
function settleIfComplete(day, rule) {
  if (isComplete(day, rule)) day.status = 'complete';
}
export function recordCheckIn(days, key, goal, rule = CONFIG.streak.rule) {
  const day = ensureDay(days, key, goal);
  day.checkInsCompleted += 1;
  settleIfComplete(day, rule);
  return day;
}
export function recordMeditation(days, key, goal, rule = CONFIG.streak.rule) {
  const day = ensureDay(days, key, goal);
  day.meditationsCompleted += 1;
  settleIfComplete(day, rule);
  return day;
}

const counts = (day) => Boolean(day) && (day.status === 'complete' || day.status === 'frozen');
// How many days in a row, ending on this day, are complete or frozen.
export function streakEndingAt(days, key) {
  let n = 0;
  for (let k = key; counts(days[k]); k = addDays(k, -1)) n += 1;
  return n;
}

// Settles every day that has ended since the last time, grants weekly freezes, and reads the
// streak. Call it when the app opens, when it returns to the front, and after any activity.
// Returns { streak, days, events: { broken: { was } | null, milestone: n | null, frozenDays: [] } }.
export function evaluate({ streak, days, todayKey, nowMs = 0, goal, config = CONFIG.streak }) {
  const s = Object.assign(emptyStreak(), streak || {});
  s.celebrated = (s.celebrated || []).slice();
  const events = { broken: null, milestone: null, frozenDays: [] };
  const yesterday = addDays(todayKey, -1);

  if (!s.lastEvaluatedDate) {
    // First run: start counting from the earliest day on record (older check-ins), or from today.
    const known = Object.keys(days).filter((k) => k < todayKey).sort();
    s.lastEvaluatedDate = known.length ? addDays(known[0], -1) : yesterday;
    s.lastFreezeGrantWeek = isoWeek(known.length ? known[0] : todayKey);
    s.freezesAvailable = Math.min(config.freezeMax, config.freezePerWeek);
  }

  // A calendar day that passed in much less than a real day (a long flight east, a date-line
  // crossing) was never really lived. It is frozen at no cost rather than counted as missed.
  const gap = daysBetween(s.lastEvaluatedDate, yesterday);
  const hours = s.lastSeenMs ? (nowMs - s.lastSeenMs) / 3600000 : Infinity;
  const skippedOne = Boolean(s.lastSeenKey) && daysBetween(s.lastSeenKey, todayKey) === 2;
  const phantom = skippedOne && hours >= 0 && hours < config.travelGraceHours ? yesterday : null;

  const grant = (key) => {
    const week = isoWeek(key);
    if (week === s.lastFreezeGrantWeek) return;
    s.lastFreezeGrantWeek = week;
    s.freezesAvailable = Math.min(config.freezeMax, s.freezesAvailable + config.freezePerWeek);
  };

  let lastGoal = goal;
  const first = gap > 400 ? addDays(yesterday, -400) : addDays(s.lastEvaluatedDate, 1);
  for (let key = first; key <= yesterday; key = addDays(key, 1)) {
    grant(key); // a new week's freeze arrives at its Monday, before that Monday is settled
    const day = days[key] || (days[key] = newDay(key, lastGoal));
    lastGoal = day.checkInGoal;
    if (day.status !== 'inProgress') continue; // settled before (the clock moved back): leave it
    const running = streakEndingAt(days, addDays(key, -1));
    if (isComplete(day, config.rule)) {
      day.status = 'complete';
    } else if (key === phantom) {
      day.status = 'frozen';
      day.travel = true;
    } else if (running > 0 && s.freezesAvailable > 0) {
      day.status = 'frozen';
      s.freezesAvailable -= 1;
      events.frozenDays.push(key);
    } else {
      day.status = 'missed';
      if (running > 0) { events.broken = { was: running }; s.brokenNotice = { was: running, at: key }; }
    }
    if (day.status !== 'missed') s.best = Math.max(s.best || 0, running + 1);
  }
  grant(todayKey);
  if (yesterday > s.lastEvaluatedDate) s.lastEvaluatedDate = yesterday;

  // Today counts as soon as it is complete, and never breaks the streak while it is in progress.
  const today = ensureDay(days, todayKey, goal);
  settleIfComplete(today, config.rule);
  s.current = today.status === 'complete' ? streakEndingAt(days, todayKey) : streakEndingAt(days, yesterday);
  s.best = Math.max(s.best || 0, s.current);
  s.lastSeenMs = nowMs;
  s.lastSeenKey = todayKey;
  if (config.milestones.indexOf(s.current) !== -1 && s.celebrated.indexOf(s.current) === -1) events.milestone = s.current;

  // Keep a little over a year of days.
  const cutoff = addDays(todayKey, -400);
  Object.keys(days).forEach((key) => { if (key < cutoff) delete days[key]; });
  return { streak: s, days, events };
}

// The seven days of the week that holds `todayKey`, Monday to Sunday, for the dot row.
// Each is { key, state }: 'complete', 'frozen', 'missed', 'today', or 'ahead' / 'none'.
export function weekRow(days, todayKey) {
  const monday = addDays(todayKey, -weekdayIndex(todayKey));
  const out = [];
  for (let i = 0; i < 7; i += 1) {
    const key = addDays(monday, i);
    const day = days[key];
    let state = 'none';
    if (key > todayKey) state = 'ahead';
    else if (day && day.status === 'complete') state = 'complete';
    else if (key === todayKey) state = 'today';
    else if (day && (day.status === 'frozen' || day.status === 'missed')) state = day.status;
    out.push({ key, state });
  }
  return out;
}

// The month that holds `todayKey`, as weeks of seven cells (null outside the month), Monday first.
export function monthGrid(days, todayKey) {
  const [y, m] = todayKey.split('-').map(Number);
  const first = y + '-' + pad(m) + '-01';
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = new Array(weekdayIndex(first)).fill(null);
  for (let d = 1; d <= count; d += 1) {
    const key = y + '-' + pad(m) + '-' + pad(d);
    const day = days[key];
    let state = 'none';
    if (key > todayKey) state = 'ahead';
    else if (day && day.status === 'complete') state = 'complete';
    else if (key === todayKey) state = 'today';
    else if (day && (day.status === 'frozen' || day.status === 'missed')) state = day.status;
    cells.push({ key, day: d, state });
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

// The next Monday on or after tomorrow: when the next freeze arrives.
export function nextFreezeDay(todayKey) {
  return addDays(todayKey, 7 - weekdayIndex(todayKey));
}

// Older check-ins (from before streaks existed) become day records, so history isn't lost.
export function daysFromLog(log, goal, rule = CONFIG.streak.rule) {
  const days = {};
  (log || []).forEach((item) => {
    const date = new Date(item.t);
    if (!isNaN(date)) recordCheckIn(days, dateKey(date), goal, rule);
  });
  return days;
}

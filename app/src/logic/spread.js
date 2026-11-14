// Check-in times: spread evenly through the waking day, and the plan of reminders that follows.
// Pure: no browser or phone here, so Node can test it.

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function toMinutes(hhmm) {
  const m = TIME.exec(String(hhmm));
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}
export function fromMinutes(total) {
  const t = ((Math.round(total) % 1440) + 1440) % 1440;
  return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
}

// `count` times, evenly spaced between waking and bedtime, each in the middle of its share of the
// day and rounded to 5 minutes. A bedtime after midnight (wake 09:00, sleep 01:00) works.
export function spreadTimes(count, wake, sleep) {
  const n = Math.max(1, Math.floor(Number(count) || 1));
  const start = toMinutes(wake) ?? 7 * 60;
  let end = toMinutes(sleep) ?? 22 * 60;
  if (end <= start) end += 1440;
  const span = end - start;
  const out = [];
  for (let i = 0; i < n; i += 1) out.push(fromMinutes(Math.round((start + (span * (i + 0.5)) / n) / 5) * 5));
  return out;
}

// The times in use: the person's own, if they set exactly as many as they check in, else the spread.
export function effectiveTimes(settings) {
  const custom = settings.customTimes;
  if (Array.isArray(custom) && custom.length === settings.checkInsPerDay && custom.every((t) => toMinutes(t) !== null)) {
    return custom.slice().sort();
  }
  return spreadTimes(settings.checkInsPerDay, settings.wakeTime, settings.sleepTime);
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Which reminders to set, from now on. One per check-in time, for the next few days, each on its
// own date so that today's can be left out once check-ins are done: after k check-ins today, the
// first k of today's times are dropped. Past times are never set.
// Returns [{ id, at: Date, slot, day }], at most `maxPending`.
export function planReminders({ now, times, checkInsToday = 0, days = 14, maxPending = 60, firstId = 201 }) {
  const sorted = times.slice().sort();
  const perDay = sorted.length;
  if (!perDay) return [];
  const dayCount = Math.max(1, Math.min(days, Math.floor(maxPending / perDay)));
  const out = [];
  for (let day = 0; day < dayCount; day += 1) {
    sorted.forEach((time, slot) => {
      const minutes = toMinutes(time);
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, Math.floor(minutes / 60), minutes % 60, 0, 0);
      if (at <= now) return;
      if (day === 0 && sameDay(at, now) && slot < checkInsToday) return;
      out.push({ id: firstId + day * 5 + slot, at, slot, day });
    });
  }
  return out;
}

// The next check-in time today that hasn't passed and isn't already covered, or null.
export function nextCheckInTime({ now, times, checkInsToday = 0 }) {
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const sorted = times.slice().sort();
  for (let slot = checkInsToday; slot < sorted.length; slot += 1) {
    if (toMinutes(sorted[slot]) > minutesNow) return sorted[slot];
  }
  return null;
}

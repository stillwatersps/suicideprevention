// "Three good things": each day, up to three things that went all right, in the person's own
// words. Pure rules, no browser and no phone. Nothing here counts days, keeps a streak, or
// compares one day with another. A draft: no licensed reviewer has seen it.

export const emptyGood = () => ({ days: [] });

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const tidy = (value, maxLength) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength) : '');

// Whatever was stored comes back as a clean list of days, newest first, or empty: never broken.
// A day keeps at most `perDay` things; a day with none is dropped; only the newest `keepDays` stay.
export function cleanGood(stored, limits) {
  const days = stored && typeof stored === 'object' && !Array.isArray(stored) && Array.isArray(stored.days) ? stored.days : [];
  const seen = new Set();
  const out = [];
  for (const entry of days) {
    if (!entry || typeof entry !== 'object' || typeof entry.day !== 'string' || !DAY.test(entry.day) || seen.has(entry.day)) continue;
    const things = (Array.isArray(entry.things) ? entry.things : []).map((thing) => tidy(thing, limits.maxLength)).filter(Boolean).slice(0, limits.perDay);
    if (!things.length) continue;
    seen.add(entry.day);
    out.push({ day: entry.day, things });
  }
  out.sort((a, b) => (a.day < b.day ? 1 : -1));
  return { days: out.slice(0, limits.keepDays) };
}

// The things kept for one day (a copy), or none.
export const thingsOn = (good, day) => { const entry = good.days.find((d) => d.day === day); return entry ? entry.things.slice() : []; };

// One day's things replaced by what was typed. Empty lines are left out; a day left with nothing
// is removed. The same things again change nothing (the same object comes back).
export function setDay(good, day, things, limits) {
  if (!DAY.test(String(day))) return good;
  const next = (Array.isArray(things) ? things : []).map((thing) => tidy(thing, limits.maxLength)).filter(Boolean).slice(0, limits.perDay);
  if (JSON.stringify(next) === JSON.stringify(thingsOn(good, day))) return good;
  const others = good.days.filter((d) => d.day !== day);
  return cleanGood({ days: next.length ? others.concat([{ day, things: next }]) : others }, limits);
}

// Earlier days to show: the newest few, never the day being written.
export const earlier = (good, today, count) => good.days.filter((d) => d.day !== today).slice(0, count);

// For a copy of the person's data: every day kept, newest first, as lines.
export function goodLines(good, sayDay) {
  const lines = [];
  good.days.forEach((d) => { lines.push(sayDay(d.day)); d.things.forEach((thing) => lines.push('- ' + thing)); });
  return lines;
}

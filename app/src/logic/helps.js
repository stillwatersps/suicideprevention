// "What tends to help": on the days a person chose Good or Great in a quick check-in, what else
// did they record that day? A tag, a meditation, a journal entry. Counted from their own entries,
// on the phone, and never stored.
//
// What this is not, on purpose: it is not a score, a chart, or a trend, it never counts or lists
// hard days, and it never says one thing caused another. It only looks at the better days, and
// only says what was also there. Pure: no browser and no phone in here, so Node can test it.
// A draft. No licensed reviewer has seen the idea or the rule below.

// A better day is one with at least one quick check-in at this mood or above (4 is Good, 5 Great).
export const BETTER_MOOD = 4;

const dayOf = (value, dateKey) => {
  const date = new Date(value);
  return isNaN(date) ? '' : dateKey(date);
};

// log: the check-in log ({ t, kind, mood, tags }); sessions: meditations ({ startedAt, completed });
// journalDates: when journal entries were written. `sinceKey` is the first day that counts and
// `dateKey` turns a Date into the day it belongs to (local time, the same one the streak uses).
// Returns { days, enough, items: [{ kind: 'tag' | 'meditation' | 'journal', name, count }] }.
export function whatHelps({ log, sessions, journalDates, sinceKey, dateKey, limits }) {
  const better = new Set();
  const tagsByDay = new Map();
  for (const item of Array.isArray(log) ? log : []) {
    if (!item || typeof item !== 'object') continue;
    const day = dayOf(item.t, dateKey);
    if (!day || day < sinceKey) continue;
    const mood = Number(item.mood);
    if (item.kind === 'quick' && Number.isInteger(mood) && mood >= BETTER_MOOD && mood <= 5) better.add(day);
    for (const tag of Array.isArray(item.tags) ? item.tags : []) {
      if (typeof tag !== 'string' || !tag.trim()) continue;
      if (!tagsByDay.has(day)) tagsByDay.set(day, new Set());
      tagsByDay.get(day).add(tag.trim().slice(0, 40));
    }
  }
  const counts = new Map();
  const add = (kind, name) => { const key = kind + '\n' + name; counts.set(key, (counts.get(key) || 0) + 1); };
  const daysWith = (list, when, keep) => new Set((Array.isArray(list) ? list : []).filter((x) => x && (!keep || keep(x))).map((x) => dayOf(when(x), dateKey)).filter(Boolean));
  const meditated = daysWith(sessions, (s) => s.startedAt, (s) => typeof s === 'object' && s.completed === true);
  const wrote = daysWith(journalDates, (d) => d);
  for (const day of better) {
    for (const tag of tagsByDay.get(day) || []) add('tag', tag);
    if (meditated.has(day)) add('meditation', '');
    if (wrote.has(day)) add('journal', '');
  }
  const items = [...counts].map(([key, count]) => { const [kind, name] = key.split('\n'); return { kind, name, count }; })
    .filter((item) => item.count >= limits.minCount)
    .sort((a, b) => b.count - a.count || a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name))
    .slice(0, limits.maxItems);
  return { days: better.size, enough: better.size >= limits.minDays, items };
}

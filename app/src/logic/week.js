// "My week, in words": a few plain sentences about the last seven days. Pure rules, no browser.
// On purpose it has no numbers in what it says: nothing is counted out loud, averaged, scored,
// charted, or compared with another week, and nothing about mood is interpreted. A draft.

// On how many different days something was recorded. `when` gives an item's time.
export function distinctDays(items, when, dateKey) {
  const days = new Set();
  (Array.isArray(items) ? items : []).forEach((item) => { const date = new Date(when(item)); if (!isNaN(date)) days.add(dateKey(date)); });
  return days.size;
}
// Which sentences to show, as word keys, in order. Always at least one.
export function weekKeys({ checkinDays = 0, sessions = 0, goodDays = 0 } = {}) {
  const keys = [checkinDays <= 0 ? 'week.checkins.none' : checkinDays <= 2 ? 'week.checkins.few' : checkinDays <= 5 ? 'week.checkins.some' : 'week.checkins.most'];
  if (sessions > 0) keys.push('week.sessions');
  if (goodDays > 0) keys.push('week.good');
  return keys;
}

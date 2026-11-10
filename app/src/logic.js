// Pure logic for the phone app, with no browser or phone in it, so it can be tested with Node alone.
// Draft, not reviewed. Nothing here reads what the person wrote: the summary uses only the feeling
// and needs they chose, and there are no scores.

export const SLOTS = ['morning', 'midday', 'afternoon', 'evening'];

// Which of the four daily check-ins a time of day belongs to.
export function slotFor(date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  return 'evening';
}

// The four reminders, all off until the person turns one on.
export function defaultReminders() {
  return [
    { slot: 'morning', hour: 8, minute: 0, enabled: false },
    { slot: 'midday', hour: 12, minute: 0, enabled: false },
    { slot: 'afternoon', hour: 15, minute: 30, enabled: false },
    { slot: 'evening', hour: 21, minute: 0, enabled: false },
  ];
}

export function parseTime(text) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(text || '');
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export function timeText(hour, minute) {
  return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
}

// Fills {name} placeholders. A missing value leaves an empty string, never the placeholder.
export function fill(template, values) {
  return String(template || '').replace(/\{([a-zA-Z]+)\}/g, (all, key) => (values[key] === undefined || values[key] === null ? '' : String(values[key])));
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// The plain-text summary of check-ins over `days` days ending today, for the person to read, change,
// and share if they choose. `log` holds {at, feeling, needs} per check-in; `words` holds every
// phrase from the app's text files: title, slots {morning, midday, afternoon, evening}, feeling,
// needs, none, footer. It never includes journal entries or reflections, and there are no scores.
export function summaryText(log, { days, now, words, lang }) {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1), 0, 0, 0, 0);
  const inRange = (log || [])
    .map((entry) => ({ ...entry, date: new Date(entry.at) }))
    .filter((entry) => !isNaN(entry.date) && entry.date >= start && entry.date <= end)
    .sort((a, b) => a.date - b.date);
  const dayName = (d) => { try { return d.toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric' }); } catch (e) { return d.toDateString(); } };
  const timeName = (d) => { try { return d.toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit' }); } catch (e) { return d.toTimeString().slice(0, 5); } };
  const lines = [];
  if (days === 1) lines.push(words.title + ', ' + dayName(now));
  else lines.push(words.title + ', ' + dayName(start) + ' – ' + dayName(now));
  if (!inRange.length) {
    lines.push(words.none);
  } else {
    let lastDay = null;
    for (const entry of inRange) {
      if (days > 1 && (!lastDay || !sameDay(lastDay, entry.date))) {
        lines.push('');
        lines.push(dayName(entry.date));
        lastDay = entry.date;
      }
      const slot = words.slots[slotFor(entry.date)] || '';
      let line = slot + ', ' + timeName(entry.date);
      if (entry.feeling) line += ': ' + words.feeling + ' ' + entry.feeling.toLowerCase();
      if (entry.needs && entry.needs.length) line += '. ' + words.needs + ' ' + entry.needs.map((n) => n.toLowerCase()).join(', ');
      lines.push(line + '.');
    }
  }
  lines.push('');
  lines.push(words.footer);
  return lines.join('\n');
}

// Keeps the places and people within what the phone can watch: at most 20 places, at most 5 people.
export const MAX_PLACES = 20;
export const MAX_PEOPLE = 5;
export const DWELL_CHOICES = [10, 20, 30];

export function defaultPlacesConfig(message) {
  return { enabled: false, dwellMinutes: 20, countdownSeconds: 30, showPlaceOnLockScreen: false, message: message || '', places: [], contacts: [] };
}

// A short id for a place, from the time and a little randomness; not secret, only unique on one phone.
export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// The names of the chosen people, joined for a sentence: "Ana", "Ana and Sam", "Ana, Sam and Lee".
export function joinNames(names, andWord) {
  const list = (names || []).filter(Boolean);
  if (list.length <= 1) return list.join('');
  return list.slice(0, -1).join(', ') + ' ' + andWord + ' ' + list[list.length - 1];
}

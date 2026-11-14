// "Suggested for you": one pure function, easy to read and to change. It looks only at what it
// is handed (the time, headphones, whether the person is near their own saved home spot, and
// what they already did today), never reads anything they wrote, and sends nothing anywhere.
import { CONFIG } from '../core/config.js';
import { toMinutes } from './spread.js';

// Between 9:30 pm and 4:00 am (the window crosses midnight).
export function inSleepHours(minutesOfDay, hours = CONFIG.meditation.sleepHours) {
  const from = toMinutes(hours.from);
  const to = toMinutes(hours.to);
  return from > to ? minutesOfDay >= from || minutesOfDay < to : minutesOfDay >= from && minutesOfDay < to;
}

// context: { minutesOfDay, headphones: true/false, atHome: true/false/null, silent: true/false/null,
//            doneTypesToday: ['silent', ...] }
// atHome is null when location isn't allowed or there is no home spot: location rules are then
// skipped quietly. silent is null when the phone won't say (iPhone never does): at home that is
// treated as "sound is fine", because the phone's own switch still silences it.
// Returns { type, reason, voice } where reason is a word key: suggest.<reason>.
export function suggestMeditation(context) {
  const c = context || {};
  const done = c.doneTypesToday || [];
  const matches = [];
  // 1. Late evening and night: Sleep.
  if (inSleepHours(c.minutesOfDay ?? 12 * 60)) matches.push({ type: 'sleep', reason: 'sleep', voice: true });
  // 2. At home, with headphones or with sound allowed: Deep session.
  if (c.atHome === true && (c.headphones === true || c.silent !== true)) matches.push({ type: 'deep', reason: 'home', voice: true });
  // 3. Headphones on, away from home: Quick reset, with voice.
  if (c.headphones === true && c.atHome !== true) matches.push({ type: 'quick', reason: 'onTheGo', voice: true });
  // 4. Otherwise: Silent, which works anywhere.
  matches.push({ type: 'silent', reason: 'anywhere', voice: false });
  // 5. Already did that one today? The next best that fits, then anything not done yet.
  const fresh = matches.find((m) => done.indexOf(m.type) === -1);
  if (fresh) return fresh;
  const other = ['quick', 'silent', 'deep', 'sleep'].find((type) => done.indexOf(type) === -1 && (type !== 'sleep' || inSleepHours(c.minutesOfDay ?? 12 * 60)));
  return other ? { type: other, reason: 'another', voice: other !== 'silent' } : matches[0];
}

// The types finished today (60% or more), for rule 5.
export function typesDoneOn(sessions, dayKey, keyOf) {
  return (sessions || []).filter((s) => s.completed && keyOf(new Date(s.startedAt)) === dayKey).map((s) => s.type);
}

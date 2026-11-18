// A reminder for one time the person picks (to check in on someone; later, an appointment).
// Pure rules, no browser and no phone. What the phone shows for it is fixed words that say
// nothing about anyone; the name the person may type is only ever shown inside the app.

export const emptyOnce = () => ({ who: '', at: '' });
const tidy = (value, maxLength) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength) : '');

// The time typed into the page ("2026-11-20T09:30", the phone's own clock), as a Date: only if it
// is a real time, later than now, and no more than `maxDays` ahead. Otherwise null.
export function pickedTime(value, now, maxDays) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return null;
  const date = new Date(value);
  if (isNaN(date)) return null;
  const ahead = date.getTime() - now.getTime();
  return ahead > 0 && ahead <= maxDays * 86400000 ? date : null;
}
// Whatever was stored, made safe: a short name or none, and a readable time or none.
export function cleanOnce(stored, limits) {
  const from = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  const date = typeof from.at === 'string' && from.at ? new Date(from.at) : null;
  return { who: tidy(from.who, limits.maxLength), at: date && !isNaN(date) ? date.toISOString() : '' };
}
// 'none' (no time kept), 'ahead', or 'passed'.
export function onceState(once, now) {
  if (!once.at) return 'none';
  return new Date(once.at).getTime() > now.getTime() ? 'ahead' : 'passed';
}
// The value a "date and time" field shows for a kept time, in the phone's own clock.
export function fieldValue(iso) {
  const d = new Date(iso);
  if (!iso || isNaN(d)) return '';
  const two = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}T${two(d.getHours())}:${two(d.getMinutes())}`;
}

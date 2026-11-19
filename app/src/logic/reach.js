// "Reach someone I trust": a short message, ready ahead of time, for someone in the person's own
// circle. The person chooses who, sees the words, and sends it themselves. Pure rules, no browser
// and no phone. A draft: no licensed reviewer has seen it.
import { dialable } from './plan.js';

export const emptyReach = () => ({ message: '', updatedAt: '' });

// Whatever was stored comes back whole or empty, never broken: this is used in a hard moment.
export function cleanReach(stored, limits) {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored) || typeof stored.message !== 'string') return emptyReach();
  const message = stored.message.slice(0, limits.maxLength).trim();
  if (!message) return emptyReach();
  return { message, updatedAt: typeof stored.updatedAt === 'string' ? stored.updatedAt : '' };
}

// The person's own words replace the ones the screen starts with. The same words as the screen's,
// or none, keep nothing: then the screen's own words are used, in whichever language it is in.
export function writeReach(reach, text, starting, limits, now) {
  const next = String(text == null ? '' : text).slice(0, limits.maxLength).trim();
  const kept = next && next !== String(starting || '').trim() ? next : '';
  if (kept === (reach && reach.message ? reach.message : '')) return reach;
  return kept ? { message: kept, updatedAt: now } : emptyReach();
}

// What goes in the message: the person's words if they saved any, otherwise the screen's.
export const messageFor = (reach, starting) => (reach && reach.message ? reach.message : String(starting || '').trim());

// The people in the circle who can be reached: a name and a number a phone can use. Anything
// else that was stored is left out.
export function reachable(circle, max) {
  const people = circle && Array.isArray(circle.people) ? circle.people : [];
  return people
    .filter((p) => p && typeof p === 'object' && typeof p.phone === 'string' && dialable(p.phone).replace(/\D/g, '').length >= 3)
    .map((p) => ({ name: typeof p.name === 'string' && p.name.trim() ? p.name.trim().slice(0, 60) : p.phone.trim(), phone: p.phone.trim(), dial: dialable(p.phone) }))
    .slice(0, max);
}

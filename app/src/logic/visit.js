// "For my next appointment": short lines the person wants to bring up, and a time to be reminded.
// Pure rules, no browser and no phone. A draft: no licensed reviewer has seen it.
import { cleanOnce } from './once.js';

export const emptyVisit = () => ({ notes: [], at: '' });
const tidy = (value, maxLength) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength) : '');

// Whatever was stored, made safe: a short list of short lines, and a readable time or none.
export function cleanVisit(stored, limits) {
  const from = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  const notes = (Array.isArray(from.notes) ? from.notes : []).map((note) => tidy(note, limits.maxLength)).filter(Boolean).slice(0, limits.maxItems);
  return { notes, at: cleanOnce({ at: from.at }, { maxLength: 0 }).at };
}
export const isFull = (visit, limits) => visit.notes.length >= limits.maxItems;
// A new line added at the end, unless it is empty or the list is full. Returns the same visit then.
export function addNote(visit, text, limits) {
  const line = tidy(text, limits.maxLength);
  if (!line || isFull(visit, limits)) return visit;
  return { notes: visit.notes.concat([line]), at: visit.at };
}
export function removeNote(visit, index) {
  return { notes: visit.notes.filter((note, i) => i !== index), at: visit.at };
}

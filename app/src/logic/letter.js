// "A letter to myself": words a person writes on a steadier day, to read on a hard one. One
// letter, in their own words. The app suggests nothing and fills nothing in. Pure rules, no
// browser and no phone. A draft: no licensed reviewer has seen it.

export const emptyLetter = () => ({ text: '', updatedAt: '' });

// Whatever was stored comes back as a whole letter or an empty one, never something broken:
// the letter is read in a hard moment.
export function cleanLetter(stored, limits) {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored) || typeof stored.text !== 'string') return emptyLetter();
  const text = stored.text.slice(0, limits.maxLength).trim();
  if (!text) return emptyLetter();
  return { text, updatedAt: typeof stored.updatedAt === 'string' ? stored.updatedAt : '' };
}

export const hasLetter = (letter) => Boolean(letter && typeof letter.text === 'string' && letter.text.trim());

// The letter with new words. Line breaks are the person's and are kept; only the ends are trimmed.
// Nothing but spaces is no letter, and the same words again change nothing (the same object comes back).
export function writeLetter(letter, text, limits, now) {
  const next = String(text == null ? '' : text).slice(0, limits.maxLength).trim();
  if (next === (letter && letter.text ? letter.text : '')) return letter;
  return next ? { text: next, updatedAt: now } : emptyLetter();
}

// For a copy of the person's data: the letter as lines, or nothing.
export const letterLines = (letter) => (hasLetter(letter) ? letter.text.split('\n') : []);

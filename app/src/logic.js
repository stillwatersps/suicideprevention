// Pure logic for "Places that are hard for me", with no browser or phone in it, so Node can test it.
// Draft, not reviewed.

// Fills {name} placeholders. A missing value leaves an empty string, never the placeholder.
export function fill(template, values) {
  return String(template || '').replace(/\{([a-zA-Z]+)\}/g, (all, key) => (values[key] === undefined || values[key] === null ? '' : String(values[key])));
}

// The phone watches at most 20 places; the design allows at most 5 people and three dwell times.
export const MAX_PLACES = 20;
export const MAX_PEOPLE = 5;
export const DWELL_CHOICES = [10, 20, 30];

// Off until the person turns it on: no places, no people, a 20-minute wait, a 30-second countdown,
// neutral words on the lock screen, and the default message from the page.
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

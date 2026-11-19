// A reminder in the person's own words. A reminder shows on the lock screen, so the app's rule
// holds for these words too: nothing about mood, crisis, or getting help. Pure rules, no browser.
// A draft: no licensed reviewer has seen the list below.

// A reminder may not contain any of these, in English or Spanish, matched without accents or
// capitals. PARTS match anywhere in the line (so "skill" and "pillow" are refused too: the list
// errs on the side of refusing). WORDS match only as whole words ("cut", not "cute").
const PARTS = ['suicid', 'kill', 'dying', 'death', 'crisis', 'self-harm', 'self harm', 'selfharm', 'mood', 'feel', 'depress', 'anxi', 'panic', 'therap', 'counsel', 'psych', 'medic',
  'pill', 'mental', 'safety plan', 'hotline', 'lifeline', 'tidelight',
  'matar', 'morir', 'muert', 'autolesi', 'cortar', 'animo', 'sentir', 'siento', 'triste', 'depres', 'ansie', 'panico', 'terap', 'psic', 'pastilla', 'plan de seguridad'];
const WORDS = ['die', 'dead', 'cut', 'sad', 'hurt', 'harm', 'meds', '988', '911', 'dano'];
const plain = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// One line, no control characters, at most `maxLength` long. Anything that isn't text is empty.
export function tidyWords(value, maxLength) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength) : '';
}
// True when the words say nothing a stranger reading the lock screen shouldn't learn.
export function isDiscreet(words) {
  const text = ' ' + plain(words) + ' ';
  return !PARTS.some((part) => text.includes(part)) && !WORDS.some((word) => new RegExp('[^a-z0-9]' + word + '[^a-z0-9]').test(text));
}
// The words a reminder will really use: the person's, if they are there and discreet; else none.
export function ownWords(stored, maxLength) {
  const words = tidyWords(stored, maxLength);
  return words && isDiscreet(words) ? words : '';
}

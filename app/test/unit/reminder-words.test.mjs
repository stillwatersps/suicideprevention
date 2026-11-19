// A reminder in the person's own words: what is refused, and what a reminder really says.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tidyWords, isDiscreet, ownWords } from '../../src/logic/reminder-words.js';
import { CONFIG } from '../../src/core/config.js';

const MAX = CONFIG.reminders.ownMaxLength;

test('the words are one short line', () => {
  assert.equal(MAX, 60);
  assert.equal(tidyWords('  water   the\nplants \t', MAX), 'water the plants');
  assert.equal(tidyWords('x'.repeat(200), MAX).length, 60);
  for (const bad of [null, undefined, 7, {}, [], true]) assert.equal(tidyWords(bad, MAX), '');
  assert.match(readFileSync(new URL('../../src/core/migrations.js', import.meta.url), 'utf8'), /reminderWords: '',/, 'empty until the person writes some');
});

test('ordinary words are allowed', () => {
  for (const ok of ['Water the plants', 'Tea time', 'Blue door', 'Hola, un momento para ti', '🌊', 'Step outside for a minute', 'Sadie needs a walk', 'Medium roast', 'Cute dog photos', 'Diet coke', 'Ring Sam']) assert.ok(isDiscreet(ok), ok);
});

test('anything about mood, crisis, or getting help is refused, in English and Spanish, however it is typed', () => {
  for (const no of ['How is your mood?', 'Feeling sad again', 'Call 988', 'crisis check', 'Take your meds', 'Therapy at 4', 'Don\'t kill yourself', 'SUICIDE watch', 'Open Tidelight', 'my safety plan', 'depressed?',
    '¿Cómo está tu ánimo?', 'Me siento triste', 'Terapia a las 4', 'Tómate la pastilla', 'ANSIEDAD', 'Pánico', 'do not cut', 'you won\'t die', 'psychiatrist', 'anxious?', 'self-harm']) {
    assert.equal(isDiscreet(no), false, no);
    assert.equal(ownWords(no, MAX), '', no);
  }
});

test('a reminder uses the person\'s words only when they are there and discreet', () => {
  assert.equal(ownWords('  Tea   time ', MAX), 'Tea time');
  assert.equal(ownWords('', MAX), '');
  assert.equal(ownWords({ words: 'x' }, MAX), '');
});

test('the screen warns about the lock screen, in both languages', () => {
  const read = (lang) => readFileSync(new URL(`../../src/text/redesign.${lang}.html`, import.meta.url), 'utf8');
  assert.match(read('en'), /A reminder shows on the lock screen, where anyone near the phone can read it\./);
  assert.match(read('es'), /Un recordatorio aparece en la pantalla de bloqueo, donde cualquier persona cerca del teléfono puede leerlo\./);
});

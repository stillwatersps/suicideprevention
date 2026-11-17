// "A letter to myself": the rules, with no browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { emptyLetter, cleanLetter, hasLetter, writeLetter, letterLines } from '../../src/logic/letter.js';
import { CONFIG } from '../../src/core/config.js';
import { KEYS } from '../../src/core/storage.js';

const limits = { maxLength: 40 };
const NOW = '2026-11-16T12:00:00.000Z';

test('a letter is the person\'s own words, kept with their line breaks', () => {
  const letter = writeLetter(emptyLetter(), '  Dear me,\nthis will pass.  ', limits, NOW);
  assert.deepEqual(letter, { text: 'Dear me,\nthis will pass.', updatedAt: NOW });
  assert.ok(hasLetter(letter));
  assert.deepEqual(letterLines(letter), ['Dear me,', 'this will pass.']);
});

test('nothing but spaces is no letter, and clearing the words removes it', () => {
  assert.deepEqual(writeLetter(emptyLetter(), '   \n ', limits, NOW), emptyLetter());
  const letter = writeLetter(emptyLetter(), 'Words', limits, NOW);
  assert.deepEqual(writeLetter(letter, '', limits, NOW), emptyLetter());
  assert.ok(!hasLetter(emptyLetter()));
  assert.deepEqual(letterLines(emptyLetter()), []);
});

test('the same words again change nothing', () => {
  const letter = writeLetter(emptyLetter(), 'Words', limits, NOW);
  assert.equal(writeLetter(letter, ' Words ', limits, 'later'), letter);
});

test('a letter longer than the limit is cut at the limit, never refused', () => {
  const letter = writeLetter(emptyLetter(), 'x'.repeat(100), limits, NOW);
  assert.equal(letter.text.length, 40);
});

test('whatever was stored comes back whole or empty', () => {
  for (const bad of [null, undefined, 7, 'a letter', [], ['x'], {}, { text: 5 }, { text: null }, { text: '   ' }, { words: 'x' }]) {
    assert.deepEqual(cleanLetter(bad, limits), emptyLetter(), JSON.stringify(bad));
  }
  assert.deepEqual(cleanLetter({ text: 'Kept', updatedAt: 5, extra: 'x' }, limits), { text: 'Kept', updatedAt: '' });
  assert.equal(cleanLetter({ text: 'y'.repeat(90), updatedAt: NOW }, limits).text.length, 40);
});

test('the limit is one number, the screen says it, and the letter has its own key', () => {
  assert.ok(CONFIG.letter.maxLength >= 500 && CONFIG.letter.maxLength <= 5000);
  const page = readFileSync(new URL('../../src/text/redesign.en.html', import.meta.url), 'utf8');
  assert.match(page, new RegExp(`id="tl-letter-text"[^>]*maxlength="${CONFIG.letter.maxLength}"`));
  assert.equal(KEYS.letter, 'tidelight.letter.v1');
});

test('the app writes none of the letter: no suggested words anywhere in the rules or the screen\'s script', () => {
  for (const file of ['../../src/logic/letter.js', '../../src/ui/letter.js']) {
    const code = readFileSync(new URL(file, import.meta.url), 'utf8').replace(/^\s*\/\/.*$/gm, '');
    assert.ok(!/placeholder|suggest|example|template/i.test(code), file + ' offers words for the letter');
  }
  const page = readFileSync(new URL('../../src/text/redesign.en.html', import.meta.url), 'utf8');
  const field = page.match(/<textarea[^>]*id="tl-letter-text"[^>]*>([^<]*)<\/textarea>/);
  assert.ok(field && field[1] === '' && !/placeholder=/.test(field[0]), 'the letter field starts with words in it');
});

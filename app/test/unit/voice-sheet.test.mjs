// The voice recording sheet lists every line a person would record, with the file name the app
// looks for. It is made from the app's own words, and these checks fail if it falls behind them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSheet, scriptLines, SHEET } from '../../tools/voice-sheet.mjs';
import { voiceClipPath, resolveVoice } from '../../src/logic/meditations.js';

test('the sheet in the notes is the one the app\'s words make today', () => {
  assert.equal(readFileSync(SHEET, 'utf8'), buildSheet(), 'run: node tools/voice-sheet.mjs');
});

test('every script line exists in both voices and both languages', () => {
  const en = scriptLines('en');
  const es = scriptLines('es');
  assert.ok(en.length >= 18 && en.length % 2 === 0);
  assert.deepEqual(es.map((l) => l.id + ' ' + l.style), en.map((l) => l.id + ' ' + l.style));
  for (const line of [...en, ...es]) assert.ok(line.words.length > 10, `${line.id} (${line.style}) has no words`);
  for (const id of new Set(en.map((l) => l.id))) assert.deepEqual(en.filter((l) => l.id === id).map((l) => l.style).sort(), ['calm', 'straightforward']);
});

test('each file name in the sheet is exactly the one the app would play', () => {
  const sheet = buildSheet();
  for (const lang of ['en', 'es']) {
    for (const line of scriptLines(lang)) {
      const path = voiceClipPath(line.id, line.style, lang);
      assert.ok(sheet.includes('`' + path + '`'), path + ' is not in the sheet');
      // With that file in the build, the app picks the recording; without it, the phone's own voice.
      assert.deepEqual(resolveVoice(line.id, line.style, lang, { voice: [path] }, true), { kind: 'clip', path: 'voice/' + path });
      assert.deepEqual(resolveVoice(line.id, line.style, lang, { voice: [] }, true), { kind: 'tts' });
    }
  }
});

test('the sheet says plainly that nothing should be recorded before review', () => {
  const sheet = buildSheet();
  assert.match(sheet, /Record nothing yet/);
  assert.match(sheet, /no licensed reviewer has read them/);
});

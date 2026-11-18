// "For my next appointment": the rules for its list. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyVisit, cleanVisit, addNote, removeNote, isFull } from '../../src/logic/visit.js';
import { CONFIG } from '../../src/core/config.js';

const L = CONFIG.visit;

test('whatever was stored comes back clean', () => {
  for (const bad of [null, 7, 'x', [], {}, { notes: 'all', at: 'nonsense' }, { notes: [null, 7, {}, '   '] }]) assert.deepEqual(cleanVisit(bad, L), emptyVisit());
  const kept = cleanVisit({ notes: ['  A   made-up thing ', 'x'.repeat(300), ...Array(20).fill('more')], at: '2026-11-20T09:30:00.000Z' }, L);
  assert.equal(kept.notes.length, 8);
  assert.equal(kept.notes[0], 'A made-up thing');
  assert.equal(kept.notes[1].length, 140);
  assert.equal(kept.at, '2026-11-20T09:30:00.000Z');
});

test('lines are added at the end, never empty, never past the limit, and can be removed', () => {
  let v = emptyVisit();
  assert.equal(addNote(v, '   ', L), v, 'an empty line changes nothing');
  v = addNote(v, 'First made-up thing', L);
  v = addNote(v, 'Second', L);
  assert.deepEqual(v.notes, ['First made-up thing', 'Second']);
  v = removeNote(v, 0);
  assert.deepEqual(v.notes, ['Second']);
  for (let i = 0; i < 20; i += 1) v = addNote(v, 'Line ' + i, L);
  assert.equal(v.notes.length, L.maxItems);
  assert.ok(isFull(v, L));
  assert.equal(addNote(v, 'One more', L), v);
  assert.equal(addNote(Object.assign(emptyVisit(), { at: 'x' }), 'Keeps the time', L).at, 'x');
});

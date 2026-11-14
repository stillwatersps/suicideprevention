// Unit tests for the text of "a copy of my data", and the lock setting's default. Run: npm run test:unit
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExport, oneLine, listOf } from '../../src/logic/export.js';
import { defaultSettings } from '../../src/core/migrations.js';
import { createStore, memoryBackend, KEYS } from '../../src/core/storage.js';

const words = { title: 'A copy', made: 'Made today.', note: 'Not locked.', none: 'Nothing saved.' };

test('the file starts with its title, date, and warning, then each section under its heading', () => {
  const text = buildExport({ ...words, sections: [{ heading: 'Check-ins', lines: ['Monday', '- Morning: okay.'] }, { heading: 'Journal', lines: [] }] });
  assert.equal(text, 'A copy\nMade today.\nNot locked.\n\nCHECK-INS\nMonday\n- Morning: okay.\n\nJOURNAL\nNothing saved.\n');
});

test('an empty section still appears and says nothing is saved', () => {
  const text = buildExport({ ...words, sections: [{ heading: 'Hope box', lines: ['', null, undefined, '   '] }] });
  assert.match(text, /HOPE BOX\nNothing saved\.\n$/);
});

test('an entry of several lines keeps its line breaks, with an empty line before the next', () => {
  const text = buildExport({ ...words, sections: [{ heading: 'Journal', lines: ['Monday\nFirst line\nSecond line', 'Tuesday\nAnother'] }] });
  assert.match(text, /JOURNAL\nMonday\nFirst line\nSecond line\n\nTuesday\nAnother\n$/);
});

test('nothing damaged shows as "undefined", "null", or an object', () => {
  const text = buildExport({ title: undefined, made: null, note: 'x', none: 'None', sections: [{ heading: undefined, lines: [undefined, null, 'ok'] }, {}] });
  assert.doesNotMatch(text, /undefined|null|\[object/);
});

test('oneLine flattens line breaks and never writes a missing value', () => {
  assert.equal(oneLine('  a\n\n b\t c '), 'a b c');
  assert.equal(oneLine(undefined), '');
  assert.equal(oneLine(null), '');
  assert.equal(oneLine(42), '42');
});

test('listOf leaves out anything that is not a kept item', () => {
  assert.deepEqual(listOf('not a list'), []);
  assert.deepEqual(listOf([null, 3, 'x', { text: 'kept' }, { other: 1 }], (item) => typeof item.text === 'string'), [{ text: 'kept' }]);
});

test('the app lock is off until someone turns it on, and older settings read as off', async () => {
  assert.equal(defaultSettings().appLock, false);
  const store = createStore(memoryBackend({ [KEYS.settings]: JSON.stringify({ checkInsPerDay: 2 }) }));
  assert.equal((await store.get(KEYS.settings, defaultSettings())).appLock, false, 'settings saved before the lock existed');
});

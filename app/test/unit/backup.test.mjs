// A backup file: what goes in, and what is accepted back. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBackup, readBackup, withoutTimes, BACKUP_KIND } from '../../src/logic/backup.js';

const limits = { keys: ['tidelight.plan.v1', 'tidelight.agegroup.v1', 'tidelight.settings'], schema: 2, maxBytes: 100000, maxValue: 5000 };
const file = (over) => JSON.stringify(Object.assign({ kind: BACKUP_KIND, version: 1, schema: 2, made: '2026-11-17T12:00:00.000Z', data: { 'tidelight.plan.v1': '{"signs":["A made-up sign"]}', 'tidelight.agegroup.v1': 'adult' } }, over));

test('a backup holds what is stored, as stored, and nothing that isn\'t', () => {
  const text = buildBackup({ 'tidelight.plan.v1': '{"signs":["A made-up sign"]}', 'tidelight.agegroup.v1': 'adult', 'tidelight.settings': null }, { schema: 2, made: '2026-11-17T12:00:00.000Z' });
  const back = JSON.parse(text);
  assert.equal(back.kind, BACKUP_KIND);
  assert.deepEqual(back.data, { 'tidelight.agegroup.v1': 'adult', 'tidelight.plan.v1': '{"signs":["A made-up sign"]}' });
  const read = readBackup(text, limits);
  assert.equal(read.ok, true);
  assert.deepEqual(read.data, back.data);
});

test('only this app\'s own keys come back, each as text of a sane size', () => {
  const read = readBackup(file({ data: { 'tidelight.plan.v1': 'x'.repeat(6000), 'tidelight.agegroup.v1': 'teen', 'someone.elses.key': 'x', 'tidelight.settings': { not: 'text' }, __proto__: 'x' } }), limits);
  assert.equal(read.ok, true);
  assert.deepEqual(read.data, { 'tidelight.agegroup.v1': 'teen' });
});

test('anything that isn\'t a backup file is refused, and so is one from a newer app', () => {
  for (const bad of ['', 'not json', '[]', '7', 'null', '{}', file({ kind: 'something-else' }), file({ data: [] }), file({ schema: 'two' }), file({ schema: 0 }), file({ version: 0 }), 'x'.repeat(200000)]) {
    assert.deepEqual(readBackup(bad, limits), { ok: false, why: 'notOne' }, bad.slice(0, 40));
  }
  for (const bad of [null, undefined, 7, {}]) assert.equal(readBackup(bad, limits).ok, false);
  assert.deepEqual(readBackup(file({ schema: 3 }), limits), { ok: false, why: 'newer' });
  assert.deepEqual(readBackup(file({ version: 2 }), limits), { ok: false, why: 'newer' });
  assert.equal(readBackup(file({ schema: 1 }), limits).ok, true, 'an older one is fine: the app brings it up to date when it opens');
});

test('a restored reminder time is cleared, because the phone no longer has the reminder', () => {
  assert.equal(withoutTimes('{"who":"A made-up name","at":"2026-11-20T09:30:00.000Z"}'), '{"who":"A made-up name","at":""}');
  assert.equal(withoutTimes('{"notes":["x"],"at":""}'), '{"notes":["x"],"at":""}');
  assert.equal(withoutTimes('not json'), 'not json');
  assert.equal(withoutTimes('[1,2]'), '[1,2]');
});

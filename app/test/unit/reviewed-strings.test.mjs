// Reviewed wording is locked. Every word the app shows or speaks (src/text/) is compared with a
// snapshot of what the reviewer has seen or is waiting to see. Any change, removal, or addition
// fails here until the snapshot is rewritten on purpose, after the reviewer approves:
//   node tools/strings.mjs snapshot <git-ref-of-the-approved-version>
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { currentStrings, difference, isWording, SNAPSHOT } from '../../tools/strings.mjs';

const snapshot = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
const now = currentStrings();
const without = (list, remove) => { const left = [...list]; for (const item of remove) { const at = left.indexOf(item); if (at >= 0) left.splice(at, 1); } return left; };

test('the text sources are the same files the snapshot was taken from', () => {
  assert.deepEqual(Object.keys(now).sort(), Object.keys(snapshot.reviewed).sort());
});

for (const name of Object.keys(snapshot.reviewed)) {
  test(`${name}: no reviewed wording has changed, moved out, or been added to`, () => {
    const expected = [...without(snapshot.reviewed[name], snapshot.picturesNowIcons[name] || []), ...(snapshot.addedSince[name] || [])];
    const { gone, added } = difference(expected, now[name] || []);
    assert.deepEqual(gone, [], 'wording is gone or changed. Restore it, or get it approved and rewrite the snapshot');
    assert.deepEqual(added, [], 'new wording is not in the snapshot. New lines need review before the snapshot is rewritten');
  });
}

test('the only reviewed strings no longer in the text are pictures (lone emoji), never words', () => {
  for (const [name, list] of Object.entries(snapshot.picturesNowIcons)) for (const text of list) assert.ok(!isWording(text), `${name}: "${text}" is wording`);
});

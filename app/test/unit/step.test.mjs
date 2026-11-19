// "One small thing for today": the rules, with no browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ownList, dayNumber, pickStep } from '../../src/logic/step.js';

const LIST = ['Walk to the corner', 'Call my sister', 'Draw something'];

test('only the person\'s own lines are used, in their order', () => {
  assert.deepEqual(ownList(['  Walk to\nthe corner ', '', 7, null, 'Draw something']), ['Walk to the corner', 'Draw something']);
  for (const bad of [null, undefined, 'a line', 4, {}]) assert.deepEqual(ownList(bad), []);
});

test('the same day always shows the same line, and a different day may show another', () => {
  assert.equal(pickStep(LIST, '2026-11-17'), pickStep(LIST, '2026-11-17'));
  const week = ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'].map((day) => pickStep(LIST, day));
  assert.ok(new Set(week).size > 1, 'a week never changes the line');
  week.forEach((line) => assert.ok(LIST.includes(line)));
});

test('"Another one" moves through the whole list and comes back round', () => {
  const day = '2026-11-17';
  const seen = [0, 1, 2, 3].map((skip) => pickStep(LIST, day, skip));
  assert.equal(new Set(seen.slice(0, 3)).size, 3);
  assert.equal(seen[3], seen[0]);
  assert.equal(pickStep(LIST, day, -4), seen[0]);
  assert.equal(pickStep(LIST, day, NaN), seen[0]);
});

test('an empty list gives nothing, and one line is always that line', () => {
  assert.equal(pickStep([], '2026-11-17'), '');
  assert.equal(pickStep(['Only this'], '2026-11-17', 5), 'Only this');
  assert.ok(Number.isInteger(dayNumber('2026-11-17')) && dayNumber('2026-11-17') >= 0);
});

test('the app adds no line of its own, keeps nothing, and counts nothing', () => {
  const code = readFileSync(new URL('../../src/ui/step.js', import.meta.url), 'utf8').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/store\.|save\(|replace\(|localStorage|KEYS\./.test(code), 'the card stores something');
  assert.ok(!/haptic\('(success|celebrate|milestone)'|streak|score|done/i.test(code), 'the card counts, ticks off, or celebrates');
  assert.match(code, /isQuiet\(\)/, 'the card shows on a day with a very low check-in');
});

// "Three good things": the rules, with no browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { emptyGood, cleanGood, thingsOn, setDay, earlier, goodLines } from '../../src/logic/good.js';
import { CONFIG } from '../../src/core/config.js';
import { KEYS } from '../../src/core/storage.js';

const limits = { perDay: 3, maxLength: 20, keepDays: 4 };

test('a day keeps up to three things, in the order written, without the empty lines', () => {
  const good = setDay(emptyGood(), '2026-11-16', ['  A cup of tea  ', '', 'The bus came', 'A fourth', 'A fifth'], limits);
  assert.deepEqual(good.days, [{ day: '2026-11-16', things: ['A cup of tea', 'The bus came', 'A fourth'] }]);
  assert.deepEqual(thingsOn(good, '2026-11-16'), ['A cup of tea', 'The bus came', 'A fourth']);
  assert.deepEqual(thingsOn(good, '2026-11-15'), []);
});

test('a long line is cut at the limit, and line breaks become spaces', () => {
  const good = setDay(emptyGood(), '2026-11-16', ['x'.repeat(50), 'two\nlines'], limits);
  assert.equal(good.days[0].things[0].length, 20);
  assert.equal(good.days[0].things[1], 'two lines');
});

test('the same things again change nothing; clearing a day removes it', () => {
  const good = setDay(emptyGood(), '2026-11-16', ['Tea'], limits);
  assert.equal(setDay(good, '2026-11-16', [' Tea '], limits), good);
  assert.deepEqual(setDay(good, '2026-11-16', ['', '  '], limits), emptyGood());
  assert.equal(setDay(good, 'yesterday', ['Tea'], limits), good);
});

test('days are kept newest first, and only the newest few', () => {
  let good = emptyGood();
  for (const day of ['2026-11-10', '2026-11-14', '2026-11-12', '2026-11-16', '2026-11-11', '2026-11-15']) good = setDay(good, day, ['Thing on ' + day.slice(8)], limits);
  assert.deepEqual(good.days.map((d) => d.day), ['2026-11-16', '2026-11-15', '2026-11-14', '2026-11-12']);
  assert.deepEqual(earlier(good, '2026-11-16', 2).map((d) => d.day), ['2026-11-15', '2026-11-14']);
});

test('whatever was stored comes back clean or empty', () => {
  for (const bad of [null, undefined, 4, 'x', [], {}, { days: 'none' }, { days: [null, 3, {}, { day: 'soon', things: ['x'] }, { day: '2026-11-16', things: 'x' }, { day: '2026-11-16', things: [null, 7, '  '] }] }]) {
    assert.deepEqual(cleanGood(bad, limits), emptyGood(), JSON.stringify(bad));
  }
  const mixed = cleanGood({ days: [{ day: '2026-11-15', things: ['Kept', 9, '<b>also kept</b>'] }, { day: '2026-11-15', things: ['A second copy of the day'] }, { day: '2026-11-16', things: ['Newer'] }] }, limits);
  assert.deepEqual(mixed.days, [{ day: '2026-11-16', things: ['Newer'] }, { day: '2026-11-15', things: ['Kept', '<b>also kept</b>'] }]);
});

test('a copy of the data lists each day and its things', () => {
  const good = setDay(setDay(emptyGood(), '2026-11-15', ['Tea'], limits), '2026-11-16', ['Sun', 'A call'], limits);
  assert.deepEqual(goodLines(good, (day) => 'On ' + day), ['On 2026-11-16', '- Sun', '- A call', 'On 2026-11-15', '- Tea']);
});

test('nothing is counted or compared: no streak, score, total, or average in the rules or the screen\'s script', () => {
  for (const file of ['../../src/logic/good.js', '../../src/ui/good.js']) {
    const code = readFileSync(new URL(file, import.meta.url), 'utf8').replace(/^\s*\/\/.*$/gm, '');
    assert.ok(!/streak|score|average|total|percent|haptic\('(success|celebrate|milestone)'/i.test(code), file + ' counts or celebrates');
  }
});

test('the numbers are in one place, the screen says them, and it has its own key', () => {
  assert.equal(CONFIG.good.perDay, 3);
  const page = readFileSync(new URL('../../src/text/redesign.en.html', import.meta.url), 'utf8');
  const screen = page.slice(page.indexOf('id="tl-good"'), page.indexOf('</section>', page.indexOf('id="tl-good"')));
  assert.equal((screen.match(/data-good-thing/g) || []).length, CONFIG.good.perDay);
  assert.match(screen, new RegExp(`maxlength="${CONFIG.good.maxLength}"`));
  assert.match(screen, /up to three/i);
  assert.equal(KEYS.good, 'tidelight.good.v1');
});

// "What tends to help": what else was recorded on the days a person chose Good or Great.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whatHelps, BETTER_MOOD } from '../../src/logic/helps.js';
import { dateKey } from '../../src/logic/streaks.js';

const limits = { minDays: 3, minCount: 2, maxItems: 6 };
const at = (day, hour = 12) => new Date(2026, 10, day, hour).toISOString();
const quick = (day, mood, tags = []) => ({ t: at(day), kind: 'quick', mood, tags });
const run = (extra) => whatHelps(Object.assign({ log: [], sessions: [], journalDates: [], sinceKey: '2026-11-01', dateKey, limits }, extra));

test('a better day is one with a quick check-in of Good or Great', () => {
  assert.equal(BETTER_MOOD, 4);
  const out = run({ log: [quick(2, 4), quick(3, 5), quick(4, 3), quick(5, 2), quick(6, 1), quick(7, 4), quick(7, 1)] });
  assert.equal(out.days, 3, 'days 2, 3, and 7; a day counts once however many check-ins it had');
  assert.equal(out.enough, true);
});

test('with fewer better days than the minimum, it says there is not enough yet', () => {
  const out = run({ log: [quick(2, 5, ['Grateful']), quick(3, 4, ['Grateful'])] });
  assert.equal(out.enough, false);
  assert.equal(out.days, 2);
});

test('it counts what else was recorded on those days: tags, a meditation, a journal entry', () => {
  const out = run({
    log: [quick(2, 4, ['Grateful', 'Tired']), quick(3, 5, ['Grateful']), quick(4, 4, ['Focused']), quick(5, 4, ['Grateful']), quick(6, 1, ['Tired']), quick(7, 2, ['Tired'])],
    sessions: [{ startedAt: at(2), completed: true }, { startedAt: at(3), completed: true }, { startedAt: at(4), completed: false }, { startedAt: at(6), completed: true }],
    journalDates: [at(3, 20), at(5, 8), at(6, 8)],
  });
  assert.equal(out.days, 4);
  assert.deepEqual(out.items, [
    { kind: 'tag', name: 'Grateful', count: 3 },
    { kind: 'journal', name: '', count: 2 },
    { kind: 'meditation', name: '', count: 2 },
  ]);
});

test('hard days are never counted, listed, or compared', () => {
  const out = run({ log: [quick(2, 1, ['Tired']), quick(3, 2, ['Tired']), quick(4, 1, ['Tired']), quick(5, 2, ['Anxious'])], sessions: [{ startedAt: at(2), completed: true }] });
  assert.deepEqual(out, { days: 0, enough: false, items: [] });
  assert.deepEqual(Object.keys(out).sort(), ['days', 'enough', 'items'], 'there is no field for hard days, a score, or a trend');
});

test('something recorded on only one better day is left out', () => {
  const out = run({ log: [quick(2, 4, ['Happy']), quick(3, 4, ['Focused']), quick(4, 5, ['Stressed'])] });
  assert.equal(out.enough, true);
  assert.deepEqual(out.items, []);
});

test('only the days since the start of the window count', () => {
  const out = run({ sinceKey: '2026-11-05', log: [quick(2, 5, ['Grateful']), quick(3, 5, ['Grateful']), quick(5, 5, ['Grateful']), quick(6, 4, ['Grateful']), quick(7, 4, ['Grateful'])] });
  assert.equal(out.days, 3);
  assert.deepEqual(out.items, [{ kind: 'tag', name: 'Grateful', count: 3 }]);
});

test('a tag chosen twice in one day counts once for that day, and the list is kept short', () => {
  const tags = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const out = run({ log: [quick(2, 4, tags), quick(2, 5, tags), quick(3, 4, tags), quick(4, 4, tags)] });
  assert.equal(out.items.length, limits.maxItems);
  assert.ok(out.items.every((item) => item.count === 3));
});

test('damaged entries are skipped, never thrown on', () => {
  const out = run({
    log: [null, 7, 'text', {}, { t: 'not a date', kind: 'quick', mood: 5 }, { t: at(2), kind: 'quick', mood: 'x' }, { t: at(2), kind: 'quick', mood: 9 }, { t: at(3), kind: 'daily', mood: 5 }, { t: at(4), kind: 'quick', mood: 5, tags: [null, 3, '', '  ', 'Kept', 'x'.repeat(200)] }],
    sessions: [null, 'x', { startedAt: 'nope', completed: true }, { completed: true }],
    journalDates: [null, 'nope', 12],
  });
  assert.equal(out.days, 1);
  assert.deepEqual(run({ log: 'nope', sessions: 5, journalDates: {} }), { days: 0, enough: false, items: [] });
});

test('the numbers the screen says are the numbers the app uses', async () => {
  const { CONFIG } = await import('../../src/core/config.js');
  const { readFileSync } = await import('node:fs');
  const words = readFileSync(new URL('../../src/text/redesign.en.html', import.meta.url), 'utf8');
  assert.deepEqual([CONFIG.helps.days, CONFIG.helps.minDays, CONFIG.helps.minCount], [30, 3, 2]);
  assert.match(words, /from the last 30 days/);
  assert.match(words, /After three days with a quick check-in of Good or Great/);
  assert.match(words, /on two or more of those days/);
});

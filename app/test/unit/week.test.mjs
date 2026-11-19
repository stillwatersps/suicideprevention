// "My week, in words": which sentences show, and that none of them counts. No browser, no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { weekKeys, distinctDays } from '../../src/logic/week.js';
import { dateKey } from '../../src/logic/streaks.js';

const read = (lang) => readFileSync(new URL(`../../src/text/redesign.${lang}.html`, import.meta.url), 'utf8');
const sentences = (page) => [...page.matchAll(/data-word="(week\.[\w.]+)">([^<]+)</g)].map((m) => ({ key: m[1], words: m[2] }));

test('the check-in sentence follows how many days had one, in four plain steps', () => {
  const first = (n) => weekKeys({ checkinDays: n })[0];
  assert.equal(first(0), 'week.checkins.none');
  assert.deepEqual([1, 2].map(first), ['week.checkins.few', 'week.checkins.few']);
  assert.deepEqual([3, 4, 5].map(first), Array(3).fill('week.checkins.some'));
  assert.deepEqual([6, 7, 9].map(first), Array(3).fill('week.checkins.most'));
  assert.deepEqual(weekKeys(), ['week.checkins.none']);
  assert.deepEqual(weekKeys({ checkinDays: 4, sessions: 2, goodDays: 1 }), ['week.checkins.some', 'week.sessions', 'week.good']);
  assert.deepEqual(weekKeys({ checkinDays: 0, sessions: 0, goodDays: 3 }), ['week.checkins.none', 'week.good']);
});

test('days are counted once each, and unreadable times are left out', () => {
  const items = [{ t: '2026-11-16T08:00:00' }, { t: '2026-11-16T21:00:00' }, { t: '2026-11-17T09:00:00' }, { t: 'nonsense' }, {}];
  assert.equal(distinctDays(items, (i) => i.t, dateKey), 2);
  assert.equal(distinctDays(null, (i) => i.t, dateKey), 0);
});

test('every sentence exists in both languages and none has a number, a score, or a comparison', () => {
  const keys = ['week.checkins.none', 'week.checkins.few', 'week.checkins.some', 'week.checkins.most', 'week.sessions', 'week.good'];
  for (const lang of ['en', 'es']) {
    const found = sentences(read(lang));
    assert.deepEqual(found.map((s) => s.key), keys, lang);
    for (const s of found) {
      assert.ok(s.words.length > 15, s.key);
      assert.ok(!/\d|%|score|streak|average|better|worse|more than|less than|great|well done|puntaje|racha|promedio|mejor|peor|más que|menos que/i.test(s.words), `${lang} ${s.key}: ${s.words}`);
    }
  }
  assert.ok(!/average|score|percent|compare/i.test(readFileSync(new URL('../../src/logic/week.js', import.meta.url), 'utf8').replace(/\/\/.*$/gm, '')));
});

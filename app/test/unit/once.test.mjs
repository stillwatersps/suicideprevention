// One reminder at a time the person picks: the rules. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { emptyOnce, pickedTime, cleanOnce, onceState, fieldValue } from '../../src/logic/once.js';
import { CONFIG } from '../../src/core/config.js';

const now = new Date(2026, 10, 17, 12, 0, 0);
const L = CONFIG.follow;

test('a picked time counts only if it is real, later than now, and within the limit', () => {
  assert.equal(pickedTime('2026-11-17T12:30', now, L.maxDays).getTime(), new Date(2026, 10, 17, 12, 30).getTime());
  assert.ok(pickedTime('2027-11-01T09:00', now, L.maxDays));
  for (const bad of ['', '2026-11-17T11:59', '2026-11-17T12:00', '2028-01-01T09:00', 'tomorrow', '2026-13-40T99:99', null, 7, {}]) assert.equal(pickedTime(bad, now, L.maxDays), null, String(bad));
});

test('whatever was stored comes back clean', () => {
  for (const bad of [null, 7, 'x', [], {}, { who: 7, at: 'nonsense' }, { at: {} }]) assert.deepEqual(cleanOnce(bad, L), emptyOnce());
  const kept = cleanOnce({ who: '  A   made-up name ' + 'x'.repeat(80), at: '2026-11-20T09:30:00.000Z', extra: 1 }, L);
  assert.equal(kept.who.length, 40);
  assert.ok(kept.who.startsWith('A made-up name'));
  assert.equal(kept.at, '2026-11-20T09:30:00.000Z');
});

test('a kept time is ahead or passed, and shows in the field in the phone\'s own clock', () => {
  assert.equal(onceState(emptyOnce(), now), 'none');
  assert.equal(onceState({ who: '', at: new Date(2026, 10, 18, 9, 0).toISOString() }, now), 'ahead');
  assert.equal(onceState({ who: '', at: new Date(2026, 10, 16, 9, 0).toISOString() }, now), 'passed');
  assert.equal(fieldValue(new Date(2026, 10, 18, 9, 5).toISOString()), '2026-11-18T09:05');
  assert.equal(fieldValue(''), '');
});

test('what the phone shows is fixed words that say nothing about anyone, in both languages', () => {
  for (const lang of ['en', 'es']) {
    const html = readFileSync(new URL(`../../src/text/redesign.${lang}.html`, import.meta.url), 'utf8');
    const body = (/data-word="once\.body">([^<]+)</.exec(html) || [])[1] || '';
    assert.ok(body.length > 8 && !/\{|suicid|crisis|mood|feel|988|friend|check in|ánimo|sentir|amig/i.test(body), lang + ': ' + body);
  }
  const code = readFileSync(new URL('../../src/ui/once.js', import.meta.url), 'utf8');
  assert.ok(!/who|name/.test(code.replace(/\/\/.*$/gm, '').replace(/sayWhen|onceWords/g, '')), 'the reminder is never given a name');
});

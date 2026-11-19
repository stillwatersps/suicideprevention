// "Darker at night": when it is night, with no browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { isNight, minutesOf, nightEnd } from '../../src/logic/night.js';

const at = (h, m = 0) => new Date(2026, 10, 16, h, m, 0);

test('a night that crosses midnight: from bed time up to wake time', () => {
  assert.equal(isNight(at(21, 59), '22:00', '07:00'), false);
  assert.equal(isNight(at(22, 0), '22:00', '07:00'), true);
  assert.equal(isNight(at(23, 59), '22:00', '07:00'), true);
  assert.equal(isNight(at(0, 0), '22:00', '07:00'), true);
  assert.equal(isNight(at(6, 59), '22:00', '07:00'), true);
  assert.equal(isNight(at(7, 0), '22:00', '07:00'), false);
  assert.equal(isNight(at(13, 0), '22:00', '07:00'), false);
});

test('a night that does not cross midnight', () => {
  assert.equal(isNight(at(0, 30), '01:00', '09:00'), false);
  assert.equal(isNight(at(1, 0), '01:00', '09:00'), true);
  assert.equal(isNight(at(8, 59), '01:00', '09:00'), true);
  assert.equal(isNight(at(9, 0), '01:00', '09:00'), false);
  assert.equal(isNight(at(23, 0), '01:00', '09:00'), false);
});

test('times that can\'t be read, or the same time twice, are never night', () => {
  for (const [bed, wake] of [['22:00', '22:00'], [null, '07:00'], ['22:00', undefined], ['25:00', '07:00'], ['22:61', '07:00'], ['ten', 'seven'], [2200, 700], ['', '']]) {
    assert.equal(isNight(at(23, 0), bed, wake), false, JSON.stringify([bed, wake]));
  }
  assert.equal(isNight('now', '22:00', '07:00'), false);
  assert.equal(isNight(new Date('nonsense'), '22:00', '07:00'), false);
});

test('"HH:MM" becomes minutes since midnight', () => {
  assert.equal(minutesOf('00:00'), 0);
  assert.equal(minutesOf('7:05'), 425);
  assert.equal(minutesOf('23:59'), 1439);
  assert.equal(minutesOf('24:00'), null);
});

test('the night ends the next time the clock reads the wake time', () => {
  assert.equal(nightEnd(at(23, 0), '07:00').getTime(), new Date(2026, 10, 17, 7, 0, 0).getTime());
  assert.equal(nightEnd(at(2, 30), '07:00').getTime(), new Date(2026, 10, 16, 7, 0, 0).getTime());
  assert.equal(nightEnd(at(7, 0), '07:00').getTime(), new Date(2026, 10, 17, 7, 0, 0).getTime());
  assert.equal(nightEnd(at(23, 0), 'soon'), null);
});

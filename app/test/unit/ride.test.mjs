// "Ten minutes at a time": where the clock is, with no browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ridePosition, rideNext, rideClock } from '../../src/logic/ride.js';
import { CONFIG } from '../../src/core/config.js';

const config = { steps: 5, stepSeconds: 120 };

test('each step lasts its time, and the last second of one is not the first of the next', () => {
  assert.deepEqual(ridePosition(0, config), { step: 0, left: 120, done: false });
  assert.deepEqual(ridePosition(119.2, config), { step: 0, left: 1, done: false });
  assert.deepEqual(ridePosition(120, config), { step: 1, left: 120, done: false });
  assert.deepEqual(ridePosition(599, config), { step: 4, left: 1, done: false });
  assert.deepEqual(ridePosition(600, config), { step: 4, left: 0, done: true });
  assert.deepEqual(ridePosition(5000, config), { step: 4, left: 0, done: true });
});

test('a clock that makes no sense counts as the start', () => {
  for (const bad of [-5, NaN, undefined, null, Infinity, 'soon']) {
    const at = ridePosition(bad, config);
    assert.ok(at.step === 0 || (bad === Infinity && at.step === 0), String(bad));
    assert.equal(at.done, false, String(bad));
  }
});

test('"Next step" moves to the start of the following step, and from the last step to the end', () => {
  assert.equal(rideNext(0, config), 120);
  assert.equal(rideNext(130, config), 240);
  assert.equal(rideNext(599, config), 600);
  assert.equal(rideNext(600, config), 600);
  assert.equal(ridePosition(rideNext(481, config), config).done, true);
});

test('the clock reads as minutes and seconds', () => {
  assert.equal(rideClock(120), '2:00');
  assert.equal(rideClock(95), '1:35');
  assert.equal(rideClock(5), '0:05');
  assert.equal(rideClock(-3), '0:00');
  assert.equal(rideClock(NaN), '0:00');
});

test('the screen\'s words agree with the numbers: ten minutes, five steps, two minutes each', () => {
  const { steps, stepSeconds } = CONFIG.ride;
  assert.equal(steps * stepSeconds, 600);
  const page = readFileSync(new URL('../../src/text/redesign.en.html', import.meta.url), 'utf8');
  const screen = page.slice(page.indexOf('id="tl-ride"'), page.indexOf('id="tl-expect"'));
  assert.match(screen, /ten minutes/i);
  assert.match(screen, /five small steps, two minutes each/);
  for (let n = 1; n <= steps; n += 1) assert.match(page, new RegExp(`data-word="ride\\.step\\.${n}">[^<]{20,}`), 'step ' + n + ' has no words');
  assert.ok(!new RegExp(`data-word="ride\\.step\\.${steps + 1}"`).test(page), 'there are more step words than steps');
});

test('nothing is kept, counted, or celebrated, and no step names a method', () => {
  const code = readFileSync(new URL('../../src/ui/ride.js', import.meta.url), 'utf8').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/store\.|replace\(|save\(|localStorage|KEYS\./.test(code), 'the screen stores something');
  assert.ok(!/haptic\('(success|celebrate|milestone)'/.test(code) && !/streak/i.test(code), 'the screen celebrates or touches the streak');
  assert.match(code, /goQuiet\(\)/, '"Still hard" does not make the day quiet');
  const page = readFileSync(new URL('../../src/text/redesign.en.html', import.meta.url), 'utf8');
  const words = [...page.matchAll(/data-word="ride\.step\.\d">([^<]+)</g)].map((m) => m[1]).join(' ');
  assert.ok(!/pill|medic|knife|gun|rope|blade|bridge|alcohol|drink a|drug/i.test(words.replace(/Drink it slowly|glass of water/g, '')), 'a step names something it should not: ' + words);
});

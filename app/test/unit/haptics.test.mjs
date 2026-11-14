// Unit tests for the haptics helper's pure parts (BUILD-SPEC 7A): the pattern table, the 50 ms
// throttle, the global switch, and devices with no haptics.
import test from 'node:test';
import assert from 'node:assert/strict';
import { HAPTICS, PATTERN_NAMES, patternFor, breathPulse, createThrottle, createHaptics } from '../../src/logic/haptic-patterns.js';

function rig(over = {}) {
  let t = 0;
  const fired = [];
  const later = [];
  const settings = { on: true, style: 'calm' };
  const helper = createHaptics(Object.assign({
    driver: (pulse) => fired.push(pulse), now: () => t, isOn: () => settings.on, getStyle: () => settings.style,
    schedule: (fn, ms) => later.push({ fn, ms }),
  }, over));
  return { helper, fired, later, settings, advance: (ms) => { t += ms; }, flush: () => later.splice(0).forEach((job) => job.fn()) };
}

test('every named pattern exists for both styles', () => {
  assert.deepEqual(PATTERN_NAMES, ['tap', 'select', 'sliderTick', 'sliderTickStrong', 'toggle', 'success', 'milestone', 'warning']);
  for (const name of PATTERN_NAMES) for (const style of ['calm', 'straightforward']) {
    const pulses = patternFor(name, style);
    assert.ok(pulses.length >= 1, `${name} ${style}`);
    pulses.forEach((p) => { assert.ok(['light', 'medium', 'soft', 'selection', 'success', 'warning'].includes(p.style)); assert.ok(p.intensity > 0 && p.intensity <= 1); });
  }
  assert.equal(patternFor('toggle', 'calm')[0].style, 'light');
  assert.equal(patternFor('toggle', 'straightforward')[0].style, 'medium');
  assert.equal(patternFor('milestone', 'calm').length, 3, 'a three-pulse celebration');
  assert.ok(patternFor('milestone', 'straightforward')[2].intensity > patternFor('milestone', 'calm')[2].intensity, 'stronger in Straightforward');
  assert.deepEqual(patternFor('nonsense', 'calm'), []);
  assert.equal(patternFor('tap', 'unknown'), HAPTICS.tap.calm, 'an unknown style falls back to Calm');
});

test('the same pattern can\'t fire more than once every 50 ms', () => {
  let t = 0;
  const allow = createThrottle(() => t);
  assert.equal(allow('sliderTick'), true);
  t = 49;
  assert.equal(allow('sliderTick'), false);
  assert.equal(allow('tap'), true, 'a different pattern is not held back');
  t = 50;
  assert.equal(allow('sliderTick'), true);
  const r = rig();
  for (let i = 0; i < 20; i += 1) { r.helper.fire('sliderTick'); r.advance(10); } // a fast slider: 200 ms
  assert.equal(r.fired.length, 4);
});

test('the Haptics setting silences everything except haptic breathing', () => {
  const r = rig();
  r.settings.on = false;
  PATTERN_NAMES.forEach((name) => { r.helper.fire(name); r.advance(100); });
  r.flush();
  assert.equal(r.fired.length, 0);
  r.helper.breath(0.8);
  assert.equal(r.fired.length, 1, 'breathing has its own switch');
});

test('a multi-pulse pattern plays in order, spaced out', () => {
  const r = rig();
  assert.equal(r.helper.fire('milestone'), 3);
  assert.equal(r.fired.length, 1, 'the first pulse at once');
  assert.deepEqual(r.later.map((job) => job.ms), [140, 280]);
  r.flush();
  assert.equal(r.fired.length, 3);
});

test('a device with no haptics does nothing, and nothing breaks', () => {
  const r = rig({ driver: null });
  assert.equal(r.helper.fire('tap'), 0);
  assert.equal(r.helper.breath(1), 0);
  assert.equal(r.fired.length, 0);
});

test('breath pulses follow the style: Calm stays light, Straightforward reaches medium', () => {
  assert.equal(breathPulse(1, 'calm').style, 'light');
  assert.equal(breathPulse(0.2, 'calm').style, 'soft');
  assert.equal(breathPulse(1, 'straightforward').style, 'medium');
  assert.ok(breathPulse(1, 'calm').intensity < breathPulse(1, 'straightforward').intensity);
  assert.ok(breathPulse(5, 'calm').intensity <= 1 && breathPulse(-1, 'calm').intensity > 0);
});

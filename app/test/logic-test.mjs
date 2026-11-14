// Tests the places logic with Node alone: no browser, no phone. Run with `node test/logic-test.mjs`.
import assert from 'node:assert/strict';
import { fill, joinNames, defaultPlacesConfig, newId, MAX_PLACES, MAX_PEOPLE, DWELL_CHOICES } from '../src/logic.js';

let passes = 0;
let failures = 0;
function test(name, fn) {
  try { fn(); passes++; console.log('  ok   ' + name); } catch (e) { failures++; console.log('  FAIL ' + name + '\n       ' + e.message); }
}

console.log('\nPlaces that are hard for me');
test('starts off with no places, no people, and a 20-minute wait', () => {
  const c = defaultPlacesConfig('hello');
  assert.equal(c.enabled, false);
  assert.deepEqual(c.places, []);
  assert.deepEqual(c.contacts, []);
  assert.equal(c.dwellMinutes, 20);
  assert.equal(c.countdownSeconds, 30);
  assert.equal(c.showPlaceOnLockScreen, false);
  assert.equal(c.message, 'hello');
});
test('the limits match the phone (20 places) and the design (5 people, 10 to 30 minutes)', () => {
  assert.equal(MAX_PLACES, 20);
  assert.equal(MAX_PEOPLE, 5);
  assert.deepEqual(DWELL_CHOICES, [10, 20, 30]);
});
test('placeholders are filled and missing values leave nothing behind', () => {
  assert.equal(fill("You've been at {place} for {minutes} minutes.", { place: 'the bridge', minutes: 20 }), "You've been at the bridge for 20 minutes.");
  assert.equal(fill('{a}{b}', { a: 'x' }), 'x');
});
test('names join into a sentence', () => {
  assert.equal(joinNames([], 'and'), '');
  assert.equal(joinNames(['Ana'], 'and'), 'Ana');
  assert.equal(joinNames(['Ana', 'Sam'], 'and'), 'Ana and Sam');
  assert.equal(joinNames(['Ana', 'Sam', 'Lee'], 'y'), 'Ana, Sam y Lee');
});
test('new ids differ', () => { assert.notEqual(newId(), newId()); });

console.log(`\n${passes} passed, ${failures} failed. Logic only; no browser and no phone.`);
process.exit(failures ? 1 : 0);

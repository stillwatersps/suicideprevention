// "Reach someone I trust": the rules, with no browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { emptyReach, cleanReach, writeReach, messageFor, reachable } from '../../src/logic/reach.js';
import { CONFIG } from '../../src/core/config.js';
import { KEYS } from '../../src/core/storage.js';

const limits = { maxLength: 50 };
const START = 'The words the screen starts with.';
const NOW = '2026-11-16T12:00:00.000Z';

test('the screen\'s own words are used until the person saves their own', () => {
  assert.equal(messageFor(emptyReach(), START), START);
  const mine = writeReach(emptyReach(), '  Call me when you can.  ', START, limits, NOW);
  assert.deepEqual(mine, { message: 'Call me when you can.', updatedAt: NOW });
  assert.equal(messageFor(mine, START), 'Call me when you can.');
});

test('saving the screen\'s own words, or nothing, keeps nothing', () => {
  assert.deepEqual(writeReach(emptyReach(), START, START, limits, NOW), emptyReach());
  const mine = writeReach(emptyReach(), 'Mine', START, limits, NOW);
  assert.deepEqual(writeReach(mine, '   ', START, limits, NOW), emptyReach());
  assert.deepEqual(writeReach(mine, START, START, limits, NOW), emptyReach());
  assert.equal(writeReach(mine, ' Mine ', START, limits, 'later'), mine);
});

test('a long message is cut at the limit, never refused', () => {
  assert.equal(writeReach(emptyReach(), 'x'.repeat(200), START, limits, NOW).message.length, 50);
});

test('whatever was stored comes back whole or empty', () => {
  for (const bad of [null, undefined, 3, 'words', [], {}, { message: 9 }, { message: '  ' }]) assert.deepEqual(cleanReach(bad, limits), emptyReach(), JSON.stringify(bad));
  assert.deepEqual(cleanReach({ message: 'Kept', updatedAt: 1, more: true }, limits), { message: 'Kept', updatedAt: '' });
});

test('only people with a number a phone can use are offered, and never more than the circle holds', () => {
  const circle = { people: [{ name: 'Sam (made up)', phone: '(555) 010-0199' }, { name: 'No number', phone: '' }, null, 7, { phone: '555-0100' }, { name: 'Letters', phone: 'abc' }, { name: 'x'.repeat(90), phone: '+1 555 010 0123' }] };
  const people = reachable(circle, 5);
  assert.deepEqual(people.map((p) => p.name), ['Sam (made up)', '555-0100', 'x'.repeat(60)]);
  assert.deepEqual(people.map((p) => p.dial), ['5550100199', '5550100', '+15550100123']);
  assert.equal(reachable(circle, 2).length, 2);
  for (const bad of [null, undefined, 'x', [], {}, { people: 'nobody' }]) assert.deepEqual(reachable(bad, 5), []);
});

test('the limit is one number, the screen says it, and the message has its own key', () => {
  assert.ok(CONFIG.reach.maxLength >= 100 && CONFIG.reach.maxLength <= 500);
  const page = readFileSync(new URL('../../src/text/redesign.en.html', import.meta.url), 'utf8');
  assert.match(page, new RegExp(`id="tl-reach-text"[^>]*maxlength="${CONFIG.reach.maxLength}"`));
  assert.equal(KEYS.reach, 'tidelight.reach.v1');
});

test('the message is never sent by the app, and never to a crisis line', () => {
  const code = readFileSync(new URL('../../src/ui/reach.js', import.meta.url), 'utf8').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|composeMessage/.test(code), 'the screen sends something itself');
  assert.ok(!/988|911|741741/.test(code), 'a crisis number is in the script: those are markup on the page, never a message target');
  assert.match(code, /smsLink\(\[person\.phone\]/, 'a message goes to more than the one person tapped');
  // The starting words mention no method, no plan, and nothing that reads as an emergency call for help.
  const page = readFileSync(new URL('../../src/text/redesign.en.html', import.meta.url), 'utf8');
  const start = page.match(/data-word="reach\.start">([^<]+)</)[1];
  assert.ok(start.length > 20 && start.length <= CONFIG.reach.maxLength);
  assert.ok(!/suicid|kill|die|emergency|911|988/i.test(start), 'the starting words say too much: ' + start);
});

// The safety plan's logic: what is kept, what is thrown away, and what a copy of it says.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PARTS, TEXT_PARTS, PEOPLE_PARTS, emptyPlan, cleanPlan, addEntry, removeEntry, planLines, isEmpty, isFull, tidyLine, tidyPhone, dialable } from '../../src/logic/plan.js';
import { CONFIG } from '../../src/core/config.js';

const limits = CONFIG.plan;

test('a plan has six parts, in the order the website gives them', () => {
  assert.deepEqual(PARTS, ['signs', 'coping', 'distract', 'people', 'pros', 'safer']);
  assert.deepEqual([...TEXT_PARTS, ...PEOPLE_PARTS].sort(), [...PARTS].sort());
  assert.ok(isEmpty(emptyPlan()));
});

test('a line is kept as one line, trimmed, and cut at the limit', () => {
  assert.equal(tidyLine('  a walk\n by   the river  ', 120), 'a walk by the river');
  assert.equal(tidyLine('x'.repeat(500), limits.maxLength).length, limits.maxLength);
  assert.equal(tidyLine(null, 120), '');
  assert.equal(tidyLine(undefined, 120), '');
});

test('a phone number keeps only what a phone can dial', () => {
  assert.equal(tidyPhone(' (555) 010-0100 <b>'), '(555) 010-0100');
  assert.equal(dialable('+1 (555) 010-0100'), '+15550100100');
  assert.equal(dialable('javascript:alert(1)'), '1');
  assert.equal(tidyPhone(null), '');
});

test('adding: text parts take a line, people parts take a name and maybe a number', () => {
  let plan = emptyPlan();
  plan = addEntry(plan, 'signs', '  I stop answering messages ', limits, 'now');
  plan = addEntry(plan, 'people', { name: 'A made-up friend', phone: '555-0100' }, limits, 'now');
  plan = addEntry(plan, 'pros', { name: 'A made-up counselor' }, limits, 'now');
  assert.deepEqual(plan.signs, ['I stop answering messages']);
  assert.deepEqual(plan.people, [{ name: 'A made-up friend', phone: '555-0100' }]);
  assert.deepEqual(plan.pros, [{ name: 'A made-up counselor', phone: '' }]);
  assert.equal(plan.updatedAt, 'now');
  assert.ok(!isEmpty(plan));
});

test('adding nothing, the same thing twice, or to a part that does not exist changes nothing', () => {
  const plan = addEntry(emptyPlan(), 'coping', 'Music', limits, 'a');
  assert.equal(addEntry(plan, 'coping', '   ', limits, 'b'), plan);
  assert.equal(addEntry(plan, 'coping', 'Music', limits, 'b'), plan);
  assert.equal(addEntry(plan, 'nowhere', 'Music', limits, 'b'), plan);
  assert.equal(addEntry(plan, 'people', { name: '', phone: '' }, limits, 'b'), plan);
  const withFriend = addEntry(plan, 'people', { name: 'Sam', phone: '555 0100' }, limits, 'b');
  assert.equal(addEntry(withFriend, 'people', { name: 'Sam', phone: '(555) 0100' }, limits, 'c'), withFriend);
});

test('a person with a number and no name is listed by the number', () => {
  const plan = addEntry(emptyPlan(), 'people', { name: '', phone: '555-0100' }, limits, 'a');
  assert.deepEqual(plan.people, [{ name: '555-0100', phone: '555-0100' }]);
});

test('each part holds no more than the limit', () => {
  let plan = emptyPlan();
  for (let i = 0; i < limits.maxItems + 5; i += 1) plan = addEntry(plan, 'safer', 'Thing ' + i, limits, 'a');
  assert.equal(plan.safer.length, limits.maxItems);
  assert.ok(isFull(plan, 'safer', limits));
  assert.ok(!isFull(plan, 'signs', limits));
});

test('removing takes one entry out and leaves the rest in order', () => {
  let plan = emptyPlan();
  for (const line of ['one', 'two', 'three']) plan = addEntry(plan, 'distract', line, limits, 'a');
  const after = removeEntry(plan, 'distract', 1, 'b');
  assert.deepEqual(after.distract, ['one', 'three']);
  assert.equal(after.updatedAt, 'b');
  assert.equal(removeEntry(plan, 'distract', 9, 'b'), plan);
  assert.equal(removeEntry(plan, 'distract', -1, 'b'), plan);
  assert.equal(removeEntry(plan, 'nowhere', 0, 'b'), plan);
});

test('whatever was stored is made safe: damaged parts are empty, damaged entries are left out', () => {
  for (const damaged of [null, undefined, 'a sentence', 42, [], [1, 2], { signs: 'not a list' }, { signs: [null, 3, {}, ''] }, { people: [null, 'x', { phone: '1' }, { name: 5 }] }]) {
    assert.deepEqual(cleanPlan(damaged, limits), emptyPlan());
  }
  const kept = cleanPlan({ signs: ['ok', null, 'x'.repeat(999)], people: [{ name: 'Sam', phone: '555<script>' }, null], extra: 'ignored', updatedAt: 7 }, limits);
  assert.deepEqual(kept.signs, ['ok', 'x'.repeat(limits.maxLength)]);
  assert.deepEqual(kept.people, [{ name: 'Sam', phone: '555' }]);
  assert.equal(kept.updatedAt, '');
  assert.equal(kept.extra, undefined);
  const many = cleanPlan({ coping: Array.from({ length: 50 }, (v, i) => 'c' + i) }, limits);
  assert.equal(many.coping.length, limits.maxItems);
});

test('a copy of the plan lists each part that has something in it, under its name', () => {
  let plan = emptyPlan();
  plan = addEntry(plan, 'signs', 'I stop sleeping', limits, 'a');
  plan = addEntry(plan, 'people', { name: 'Sam', phone: '555-0100' }, limits, 'a');
  plan = addEntry(plan, 'pros', { name: 'A counselor' }, limits, 'a');
  const headings = { signs: 'SIGNS', coping: 'COPING', distract: 'DISTRACT', people: 'PEOPLE', pros: 'PROS', safer: 'SAFER' };
  assert.deepEqual(planLines(plan, headings), ['SIGNS', '- I stop sleeping', 'PEOPLE', '- Sam, 555-0100', 'PROS', '- A counselor']);
  assert.deepEqual(planLines(emptyPlan(), headings), []);
});

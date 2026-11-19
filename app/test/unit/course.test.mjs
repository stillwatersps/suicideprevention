// "A first week": its rules and its words. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STEPS, emptyCourse, cleanCourse, isDone, setDone, nextStep, courseLines } from '../../src/logic/course.js';
import { CONFIG } from '../../src/core/config.js';

const L = CONFIG.course;
const read = (file) => readFileSync(new URL('../../src/' + file, import.meta.url), 'utf8');
const screenOf = (page) => page.slice(page.indexOf('id="tl-course"'), page.indexOf('</section>', page.indexOf('id="tl-course"')));

test('whatever was stored comes back clean', () => {
  for (const bad of [null, 7, 'x', [], {}, { done: 'all' }, { done: [null, 'a', -1, 7, 99, 1.5, {}] }]) assert.deepEqual(cleanCourse(bad, L), { done: [] });
  assert.deepEqual(cleanCourse({ done: [6, 2, 2, 0, 6], extra: 'x' }, L), { done: [0, 2, 6] });
});

test('a tick can be made and taken back, and "up next" is the first step not ticked', () => {
  let c = emptyCourse();
  assert.equal(nextStep(c, L), 0);
  c = setDone(c, 0, true, L); c = setDone(c, 2, true, L);
  assert.ok(isDone(c, 0) && !isDone(c, 1) && isDone(c, 2));
  assert.equal(nextStep(c, L), 1);
  c = setDone(c, 0, false, L);
  assert.deepEqual(c, { done: [2] });
  for (let i = 0; i < L.steps; i += 1) c = setDone(c, i, true, L);
  assert.equal(nextStep(c, L), -1);
  assert.deepEqual(courseLines({ done: [1, 3] }, ['a', 'b', 'c', 'd']), ['- b', '- d']);
});

test('only step numbers are kept: no dates, no count, nothing about how long it took', () => {
  const kept = JSON.stringify(setDone(setDone(emptyCourse(), 3, true, L), 1, true, L));
  assert.equal(kept, '{"done":[1,3]}');
  assert.ok(!/Date|streak|count/i.test(read('logic/course.js').replace(/\/\/.*$/gm, '')));
});

test('the screen has a step for each of the seven, in both languages, and never counts or scores', () => {
  assert.equal(STEPS.length, L.steps);
  for (const file of ['text/redesign.en.html', 'text/redesign.es.html']) {
    const screen = screenOf(read(file));
    assert.equal((screen.match(/data-course-step/g) || []).length, 7, file);
    assert.equal((screen.match(/data-course-open/g) || []).length, 7, file);
    assert.equal((screen.match(/type="checkbox"/g) || []).length, 7, file);
    const text = screen.replace(/<[^>]+>/g, ' ');
    assert.ok(!/streak|in a row|score|percent|%|racha|puntos/i.test(text), file);
  }
  assert.match(screenOf(read('text/redesign.en.html')), /Nothing is lost if you miss a day, and nothing here is counted\./);
});

test('every step that is a screen exists as a screen', () => {
  const page = read('text/redesign.en.html');
  for (const id of STEPS.filter((s) => !['reset', 'scan', 'walk'].includes(s))) assert.ok(page.includes(`id="tl-${id}"`), id);
});

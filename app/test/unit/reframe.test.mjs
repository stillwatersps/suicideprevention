// "Another way to see it": read from its files. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../../src/' + file, import.meta.url), 'utf8');
const screenOf = (page) => page.slice(page.indexOf('id="tl-reframe"'), page.indexOf('</section>', page.indexOf('id="tl-reframe"')));

test('four questions, each with an empty field of the person\'s own, in both languages', () => {
  for (const file of ['text/redesign.en.html', 'text/redesign.es.html']) {
    const screen = screenOf(read(file));
    const fields = [...screen.matchAll(/<textarea[^>]*data-reframe-answer[^>]*>([^<]*)<\/textarea>/g)];
    assert.equal(fields.length, 4, file);
    fields.forEach((field) => { assert.equal(field[1], '', 'a field starts with words in it'); assert.ok(!/placeholder=/.test(field[0]), 'a field suggests an answer'); });
    assert.equal((screen.match(/<label for="tl-reframe-\d">[^<]{8,}<\/label>/g) || []).length, 4);
  }
});

test('nothing typed is kept anywhere, and it is cleared on leaving, on Quick exit, and on Delete everything', () => {
  const code = read('ui/reframe.js').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/store\.|save\(|replace\(|localStorage|sessionStorage|KEYS\.|share|handFile/i.test(code), 'the screen keeps or sends what is typed');
  assert.match(code, /shell\.onHide\('reframe', clear\)/);
  assert.match(code, /tidelight-back-from-exit/);
  assert.match(code, /tidelight-erased/);
});

test('the screen says what it is not for, before the questions', () => {
  const screen = screenOf(read('text/redesign.en.html'));
  const text = screen.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  assert.match(text, /thoughts of ending your life/);
  assert.match(text, /988/);
  assert.ok(screen.indexOf('thoughts of ending your life') < screen.indexOf('data-reframe-answer'), 'the questions come before the line about what this is not for');
  assert.match(text, /nothing you write here is kept/i);
  assert.ok(!/distort|irrational|wrong to think|negative thinking/i.test(text), 'the screen tells the person their thought is a mistake');
});

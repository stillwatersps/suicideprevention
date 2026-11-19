// "After a crisis": read from its words. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../../src/text/' + file, import.meta.url), 'utf8');
const screenOf = (page) => page.slice(page.indexOf('id="tl-after"'), page.indexOf('</section>', page.indexOf('id="tl-after"')));
const textOf = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('five steps, the crisis lines, and nothing to fill in, in both languages', () => {
  for (const file of ['redesign.en.html', 'redesign.es.html']) {
    const screen = screenOf(read(file));
    assert.equal((screen.match(/class="tl-after-step"/g) || []).length, 5, file);
    for (const href of ['tel:988', 'sms:988', 'tel:911']) assert.ok(screen.includes(`href="${href}`), file + ' ' + href);
    assert.ok(!/<input|<textarea/.test(screen), file);
    assert.match(screen, /class="tl-draft-tag"/);
  }
});

test('it says, near the top, that the thoughts coming back is not failure, and where help is', () => {
  const screen = screenOf(read('redesign.en.html'));
  const first = screen.indexOf('<strong>If the thoughts come back');
  assert.ok(first > 0 && first < screen.indexOf('tl-after-steps'));
  assert.match(screen, /The buttons to call or text 988 and to call 911 are at the top of every screen/);
});

test('it names no method, makes no promise, blames nobody, and defers to the people treating the person', () => {
  const text = textOf(screenOf(read('redesign.en.html')));
  assert.ok(!/attempt|overdos|pills|gun|firearm|rope|knife|blade|jump/i.test(text), 'it names a method, or an attempt');
  assert.ok(!/you should|you must|will feel better|get over|move on|lucky|selfish|your fault|cure/i.test(text));
  assert.match(text, /It is not advice from the people treating you; where the two differ, follow them\./);
  assert.ok(!/streak|congrat|well done|proud/i.test(text));
});

test('every way on leads to a screen that exists, and it is never offered on a support step', () => {
  const page = read('redesign.en.html');
  for (const target of ['plan', 'visit', 'reach', 'care']) { assert.ok(screenOf(page).includes(`data-tl-push="${target}"`), target); assert.ok(page.includes(`id="tl-${target}"`), 'no screen ' + target); }
  const pushes = [...page.matchAll(/data-tl-push="after"([^>]*)>/g)];
  assert.equal(pushes.length, 1, 'one way in');
  assert.ok(!pushes[0][1].includes('data-tl-over'));
});

// "Being kind to yourself": read from its words. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../../src/text/' + file, import.meta.url), 'utf8');
const screenOf = (page) => page.slice(page.indexOf('id="tl-kind"'), page.indexOf('</section>', page.indexOf('id="tl-kind"')));

test('three exercises, each a name and plain words, with nothing to type or keep, in both languages', () => {
  for (const file of ['redesign.en.html', 'redesign.es.html']) {
    const screen = screenOf(read(file));
    const parts = [...screen.matchAll(/<div class="tl-panel tl-ground-part tl-kind-part">\s*<h3 class="tl-headline">([^<]{5,})<\/h3>\s*<p class="tl-sub">([^<]{40,})<\/p>\s*<\/div>/g)];
    assert.equal(parts.length, 3, file);
    assert.ok(!/<input|<textarea|<button(?![^>]*data-tl-back)/.test(screen), file + ': the screen has something to fill in or press');
  }
});

test('the three crisis lines are on the screen, and it says they are', () => {
  const screen = screenOf(read('redesign.en.html'));
  for (const href of ['tel:988', 'sms:988', 'tel:911']) assert.ok(screen.includes(`href="${href}"`), href);
  assert.match(screen, /These don't replace help from a person\./);
});

test('nothing blames, promises, or tells the person what they should feel', () => {
  const text = screenOf(read('redesign.en.html')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  assert.ok(!/you should|you must|just (think|be|stop)|will feel better|always works|cure|fix/i.test(text), text);
});

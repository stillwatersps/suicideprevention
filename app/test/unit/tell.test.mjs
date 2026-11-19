// "Words for telling someone": read from its words. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../../src/' + file, import.meta.url), 'utf8');
const screenOf = (page) => page.slice(page.indexOf('id="tl-tell"'), page.indexOf('</section>', page.indexOf('id="tl-tell"')));
const lines = (screen) => [...screen.matchAll(/data-tell-words>([^<]+)</g)].map((m) => m[1]);

test('eight ways to start in four groups, each with its Copy button, in both languages', () => {
  for (const file of ['text/redesign.en.html', 'text/redesign.es.html']) {
    const screen = screenOf(read(file));
    assert.equal(lines(screen).length, 8, file);
    assert.equal((screen.match(/data-tell-copy/g) || []).length, 8, file);
    assert.equal((screen.match(/<h3 class="tl-headline">/g) || []).length, 4, file);
    assert.ok(lines(screen).every((line) => line.length > 20), file);
  }
});

test('every line is in the first person, and one names suicide plainly', () => {
  const all = lines(screenOf(read('text/redesign.en.html')));
  assert.ok(all.every((line) => /\b(I|I've|I'm|me)\b/.test(line)), 'each is something the person says about themself');
  assert.equal(all.filter((line) => /suicide/.test(line)).length, 1);
  assert.ok(!all.some((line) => /kill|die|end it|burden|sorry to bother|goodbye/i.test(line)), 'no method, no goodbye, nothing that calls the person a burden');
});

test('the three crisis lines are on the screen, and it says the app sends nothing', () => {
  const screen = screenOf(read('text/redesign.en.html'));
  for (const href of ['tel:988', 'sms:988', 'tel:911']) assert.ok(screen.includes(`href="${href}"`), href);
  assert.match(screen, /Nothing here is sent by the app\./);
});

test('Copy only puts words on the clipboard: nothing is kept or sent', () => {
  const code = read('ui/tell.js').replace(/\/\/.*$/gm, '');
  assert.ok(!/localStorage|sessionStorage|store\.|save\(|fetch\(|Share\.|sms:|mailto:/.test(code));
  assert.match(code, /navigator\.clipboard\.writeText/);
});

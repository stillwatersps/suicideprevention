// "Wind down for sleep": read from its files. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../../src/' + file, import.meta.url), 'utf8');
const screenOf = (page) => page.slice(page.indexOf('id="tl-wind"'), page.indexOf('id="tl-expect"'));

test('four steps, each a plain tick box, in both languages', () => {
  for (const file of ['text/redesign.en.html', 'text/redesign.es.html']) {
    const screen = screenOf(read(file));
    const steps = [...screen.matchAll(/<label class="tl-switch" data-wind-step><span>([^<]{15,})<\/span><input type="checkbox"><\/label>/g)].map((m) => m[1]);
    assert.equal(steps.length, 4, file + ': ' + steps.length + ' steps');
    assert.equal(new Set(steps).size, 4);
  }
});

test('the ticks are never kept, and nothing is counted or celebrated', () => {
  const code = read('ui/wind.js').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/store\.|save\(|replace\(|localStorage|KEYS\./.test(code), 'the screen stores something');
  assert.ok(!/haptic\(|streak|count|score/i.test(code), 'the screen counts or celebrates');
  assert.match(code, /startType\('sleep'\)/);
});

test('the screen says help does not have to wait for morning, and names nothing to take', () => {
  const text = screenOf(read('text/redesign.en.html')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  assert.match(text, /you don't have to wait for morning/);
  assert.match(text, /988/);
  assert.ok(!/pill|medic|melatonin|alcohol|drink|dose|supplement/i.test(text), 'the screen mentions something to take');
});

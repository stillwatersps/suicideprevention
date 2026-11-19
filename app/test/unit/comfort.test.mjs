// Comfort settings: what the code may and may not do. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../../src/' + file, import.meta.url), 'utf8');

test('all three are off until turned on', () => {
  const defaults = read('core/migrations.js');
  for (const name of ['alwaysDark', 'easyRead', 'readAloud']) assert.match(defaults, new RegExp(name + ': false,'));
});

test('read aloud uses only the phone\'s own voice, on a tap, and never reads a field', () => {
  const code = read('ui/comfort.js').replace(/\/\/.*$/gm, '');
  assert.ok(!/fetch\(|XMLHttpRequest|Audio\(|\.value\b|localStorage|sessionStorage/.test(code), 'it sends, plays, stores, or reads a field');
  assert.match(code, /speechSynthesis\.speak/);
  assert.match(code, /visibilitychange/);
  assert.match(code, /pagehide/);
  assert.ok(!/input|textarea|select/.test(code.match(/\$\$\('([^']+)', screen\)/)[1]), 'fields are not among what is read');
});

test('the screen warns that others can hear, in both languages', () => {
  assert.match(read('text/redesign.en.html'), /so anyone nearby can hear it\. Tap it again to stop\. It never reads what you are typing\./);
  assert.match(read('text/redesign.es.html'), /así que cualquier persona cerca puede oírla\./);
});

test('easier reading changes spacing and underlines only, with no color or size of its own', () => {
  const css = read('redesign.css');
  const rules = css.split('\n').filter((line) => line.includes('html.tl-easy'));
  assert.ok(rules.length >= 3);
  assert.ok(!rules.some((line) => /color|font-size|background/.test(line)));
});

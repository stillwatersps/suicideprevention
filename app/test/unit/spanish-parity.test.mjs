// English and Spanish say the same things, block by block: the same blocks, the same word keys,
// the same controls, the same places for numbers and names, the same crisis targets, and no line
// left in English by accident. This compares structure, never meaning: the Spanish is an
// unreviewed AI translation, and only a fluent reader can say whether it is right.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { appDir, stringsOfHtml, isWording } from '../../tools/strings.mjs';

const textDir = join(appDir, 'src', 'text');
const PAIRS = readdirSync(textDir).filter((f) => /(^|\.)en\.html$/.test(f)).map((en) => [en, en.replace(/en\.html$/, 'es.html')]);
const SAME = JSON.parse(readFileSync(join(appDir, 'test', 'fixtures', 'same-in-spanish.json'), 'utf8'));
const read = (name) => readFileSync(join(textDir, name), 'utf8');
const sorted = (list) => [...list].sort();
const all = (text, re) => [...text.matchAll(re)].map((m) => m[1]);

// One file, cut into its named blocks.
function blocks(html) {
  const out = {};
  const parts = html.split(/<!-- BLOCK:([a-z0-9-]+) -->/);
  for (let i = 1; i < parts.length; i += 2) out[parts[i]] = parts[i + 1];
  return out;
}
// Each word key and the text inside it.
function words(html) {
  const out = {};
  for (const m of html.matchAll(/<(\w+)\b[^>]*\bdata-word="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) (out[m[2]] = out[m[2]] || []).push(m[3].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
  return out;
}
const slots = (text) => sorted(all(text, /(\{[a-zA-Z]+\})/g));
const crisisTargets = (html) => sorted(all(html, /href="((?:tel|sms):[^"]+)"/g));
const controls = (html) => ['button', 'a', 'input', 'select', 'textarea', 'details', 'summary'].map((tag) => `${tag}:${(html.match(new RegExp('<' + tag + '\\b', 'g')) || []).length}`).join(' ');

for (const [enName, esName] of PAIRS) {
  const en = read(enName);
  const es = read(esName);
  const enBlocks = blocks(en);
  const esBlocks = blocks(es);

  test(`${esName} has every block and word key of ${enName}, and no others`, () => {
    assert.deepEqual(sorted(Object.keys(esBlocks)), sorted(Object.keys(enBlocks)));
    assert.deepEqual(sorted(Object.keys(words(es))), sorted(Object.keys(words(en))));
  });

  test(`${esName}: every block has the same controls and the same crisis targets as English`, () => {
    for (const name of Object.keys(enBlocks)) {
      assert.equal(controls(esBlocks[name] || ''), controls(enBlocks[name]), `block ${name}: controls differ`);
      assert.deepEqual(crisisTargets(esBlocks[name] || ''), crisisTargets(enBlocks[name]), `block ${name}: call and text targets differ`);
    }
  });

  test(`${esName}: every word key keeps its places for numbers and names`, () => {
    const a = words(en);
    const b = words(es);
    for (const key of Object.keys(a)) {
      assert.equal((b[key] || []).length, a[key].length, `word ${key}: a different number of versions`);
      a[key].forEach((text, i) => assert.deepEqual(slots(b[key][i]), slots(text), `word ${key}: ${text} / ${b[key][i]}`));
      b[key].forEach((text) => assert.ok(text.length > 0, `word ${key} is empty in Spanish`));
    }
  });

  test(`${esName}: no line is the same as the English, apart from the known few`, () => {
    const english = new Set(stringsOfHtml(en).filter(isWording));
    const same = [...new Set(stringsOfHtml(es).filter(isWording).filter((text) => english.has(text)))].map((text) => text.replace(/^\[[a-z-]+\] /, ''));
    const unexpected = [...new Set(same)].filter((text) => !SAME.same.includes(text));
    assert.deepEqual(unexpected, [], 'in Spanish and identical to English (add to test/fixtures/same-in-spanish.json only if that is right)');
  });

  test(`${esName}: no line was left in English`, () => {
    // Words that are common in English and are not Spanish words.
    const english = /\b(the|your|you|and|with|this|that|is|are|of|to)\b/i;
    const left = stringsOfHtml(es).filter(isWording).map((text) => text.replace(/^\[[a-z-]+\] /, '')).filter((text) => english.test(text) && !SAME.englishOnPurpose.some((part) => text.includes(part)));
    assert.deepEqual(left, []);
  });
}

test('the Spanish says of itself that it is an unreviewed AI translation', () => {
  assert.match(read('redesign.es.html').replace(/\s+/g, ' '), /ninguna persona hispanohablante ha revisado la traducción/);
});

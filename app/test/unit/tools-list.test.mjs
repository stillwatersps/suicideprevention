// "All tools": the whole list, the search, and when the crisis lines show. No browser, no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TOOLS, MORE, EVERY, anyTool, toolById, findTools, asksForHelp } from '../../src/logic/tools.js';
import { ICONS, TABS } from '../../src/ui/icons.js';

const read = (lang) => readFileSync(new URL(`../../src/text/redesign.${lang}.html`, import.meta.url), 'utf8');
const word = (page, key) => { const m = new RegExp(`data-word="${key.replace(/\./g, '\\.')}">([^<]+)<`).exec(page); return m ? m[1] : ''; };

test('every tool has a name and a line in both languages, an icon, and one way to open that exists', () => {
  const [en, es] = [read('en'), read('es')];
  assert.equal(EVERY.length, TOOLS.length + MORE.length);
  assert.equal(new Set(EVERY.map((tool) => tool.id)).size, EVERY.length);
  for (const tool of EVERY) {
    for (const page of [en, es]) { assert.ok(word(page, 'tool.' + tool.id).length > 3, tool.id); assert.ok(word(page, 'tool.' + tool.id + '.about').length > 8, tool.id + ' line'); }
    assert.ok(ICONS[tool.icon], tool.id + ' icon');
    assert.equal([tool.push, tool.legacy, tool.session, tool.go].filter(Boolean).length, 1, tool.id);
    if (tool.push) assert.ok(en.includes(`id="tl-${tool.push}"`), 'no screen for ' + tool.id);
    if (tool.go) assert.ok(TABS.some((tab) => tab.id === tool.go), 'no tab for ' + tool.id);
  }
  for (const tool of MORE) { assert.equal(toolById(tool.id), null, tool.id + ' can\'t be pinned'); assert.equal(anyTool(tool.id), tool); }
});

test('search matches a name or a line, whatever the capitals or accents, and every word typed must match', () => {
  const en = read('en');
  const es = read('es');
  const find = (page, q) => findTools(EVERY, q, (tool) => word(page, 'tool.' + tool.id) + ' ' + word(page, 'tool.' + tool.id + '.about')).map((tool) => tool.id);
  assert.equal(find(en, '').length, EVERY.length);
  assert.equal(find(en, '   ').length, EVERY.length);
  assert.deepEqual(find(en, 'SLEEP'), ['wind']);
  assert.ok(find(en, 'breath').includes('reset'));
  assert.deepEqual(find(en, 'safety plan'), ['plan']);
  assert.deepEqual(find(en, 'plan zzz'), []);
  assert.deepEqual(find(es, 'respiracion'), find(es, 'RESPIRACIÓN'));
  assert.ok(find(es, 'respiracion').includes('reset'));
  assert.deepEqual(find(es, 'dormir'), ['wind']);
});

test('words that read like a search for urgent help show the crisis lines; ordinary words don\'t', () => {
  for (const q of ['suicide', 'Suicidal thoughts', 'kill myself', 'i want to die', 'help', 'HELP ME', 'crisis', '988', 'emergency', 'overdose', 'hurt myself', 'self-harm', 'end it',
    'suicidio', 'ayuda', 'quiero morir', 'matarme', 'emergencia', 'hacerme daño', 'sos']) assert.equal(asksForHelp(q), true, q);
  for (const q of ['', 'sleep', 'breathe', 'journal', 'diet', 'plan', 'letter', 'dormir', 'respirar', 'walk', 'kind']) assert.equal(asksForHelp(q), false, q);
});

test('nothing in the search keeps what was typed', () => {
  const code = readFileSync(new URL('../../src/ui/tools-list.js', import.meta.url), 'utf8').replace(/\/\/.*$/gm, '');
  assert.ok(!/localStorage|sessionStorage|store\.|save\(|replace\(|fetch\(|devLog|console\./.test(code));
});

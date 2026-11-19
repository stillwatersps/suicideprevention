// "My toolkit": the list of tools and the rules for pinning. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TOOLS, toolById, emptyToolkit, cleanToolkit, isPinned, setPinned } from '../../src/logic/tools.js';
import { ICONS } from '../../src/ui/icons.js';
import { CONFIG } from '../../src/core/config.js';

const L = CONFIG.toolkit;
const read = (lang) => readFileSync(new URL(`../../src/text/redesign.${lang}.html`, import.meta.url), 'utf8');

test('every tool has a name in both languages, an icon, and one way to open that exists', () => {
  const [en, es] = [read('en'), read('es')];
  assert.equal(new Set(TOOLS.map((tool) => tool.id)).size, TOOLS.length);
  for (const tool of TOOLS) {
    for (const page of [en, es]) assert.ok(new RegExp(`data-word="tool\\.${tool.id}">[^<]{3,}<`).test(page), tool.id);
    assert.ok(ICONS[tool.icon], tool.id + ' icon ' + tool.icon);
    assert.equal([tool.push, tool.legacy, tool.session].filter(Boolean).length, 1, tool.id);
    if (tool.push) assert.ok(en.includes(`id="tl-${tool.push}"`), 'no screen for ' + tool.id);
    if (tool.session) assert.ok(CONFIG.meditation.lengths[tool.session].includes(tool.minutes), tool.id);
  }
});

test('no crisis line is a tool: they can\'t be pinned, so they can\'t be unpinned', () => {
  assert.ok(!TOOLS.some((tool) => /988|911|crisis|support/i.test(JSON.stringify(tool))));
});

test('whatever was stored comes back clean', () => {
  for (const bad of [null, 7, 'x', [], {}, { pinned: 'all' }, { pinned: [null, 7, {}, 'nope'] }]) assert.deepEqual(cleanToolkit(bad, L), { pinned: [] });
  assert.deepEqual(cleanToolkit({ pinned: ['plan', 'plan', 'x', 'ground', 'reset', 'good', 'kind'] }, L), { pinned: ['plan', 'ground', 'reset', 'good'] });
});

test('at most four are pinned; a fifth is refused and says so; unpinning makes room', () => {
  let kit = emptyToolkit();
  for (const id of ['ground', 'plan', 'reset', 'hope']) { const r = setPinned(kit, id, true, L); assert.equal(r.full, false); kit = r.toolkit; }
  assert.deepEqual(kit.pinned, ['ground', 'plan', 'reset', 'hope']);
  const fifth = setPinned(kit, 'good', true, L);
  assert.equal(fifth.full, true);
  assert.deepEqual(fifth.toolkit.pinned, kit.pinned);
  assert.equal(setPinned(kit, 'plan', true, L).full, false, 'pinning one already pinned is not "full"');
  kit = setPinned(kit, 'plan', false, L).toolkit;
  assert.ok(!isPinned(kit, 'plan') && kit.pinned.length === 3);
  assert.deepEqual(setPinned(kit, 'good', true, L).toolkit.pinned, ['ground', 'reset', 'hope', 'good']);
  assert.deepEqual(setPinned(kit, 'made-up', true, L).toolkit.pinned, kit.pinned);
  assert.equal(toolById('made-up'), null);
});

// The safety plan as a page to print or keep. No browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { planPage, emptyPlan, PARTS } from '../../src/logic/plan.js';

const headings = Object.fromEntries(PARTS.map((part, i) => [part, `${i + 1}. Heading for ${part}`]));
const words = { title: 'My safety plan', made: 'Made on a day.', note: 'My own words.', now: 'If I need help right now', call988: 'Call or text 988.', call911: 'Call 911.' };

test('the page has the title, each part that has something, and the crisis lines last', () => {
  const plan = Object.assign(emptyPlan(), { signs: ['A made-up sign'], people: [{ name: 'A made-up friend', phone: '555 0100' }, { name: 'No number', phone: '' }], safer: ['A made-up step'] });
  const page = planPage(plan, headings, words);
  assert.equal(page, ['MY SAFETY PLAN', 'Made on a day.', 'My own words.', '', '1. Heading for signs', '- A made-up sign', '', '4. Heading for people', '- A made-up friend, 555 0100', '- No number', '',
    '6. Heading for safer', '- A made-up step', '', 'IF I NEED HELP RIGHT NOW', 'Call or text 988.', 'Call 911.', ''].join('\n'));
});

test('an empty plan still gives a page with the crisis lines', () => {
  const page = planPage(emptyPlan(), headings, words);
  assert.ok(page.endsWith('IF I NEED HELP RIGHT NOW\nCall or text 988.\nCall 911.\n'));
  assert.ok(!page.includes('Heading for'));
});

test('the page\'s own words exist in both languages and name 988 and 911', () => {
  for (const lang of ['en', 'es']) {
    const html = readFileSync(new URL(`../../src/text/redesign.${lang}.html`, import.meta.url), 'utf8');
    const word = (key) => (new RegExp(`data-word="${key.replace(/\./g, '\\.')}">([^<]+)<`).exec(html) || [])[1] || '';
    for (const key of ['plan.page.fileName', 'plan.page.made', 'plan.page.note', 'plan.page.now', 'plan.page.done', 'plan.page.failed']) assert.ok(word(key).length > 8, lang + ' ' + key);
    assert.match(word('plan.page.call988'), /988/);
    assert.match(word('plan.page.call911'), /911/);
    assert.match(word('plan.page.fileName'), /^[a-z-]+\.txt$/);
  }
});

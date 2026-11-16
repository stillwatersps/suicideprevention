// "A summary for an appointment": only what the person ticked, in their own words, and nothing
// counted or interpreted. Pure logic; no browser and no phone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSummary, sincePeriod, periodDays } from '../../src/logic/summary.js';
import { CONFIG } from '../../src/core/config.js';

const WORDS = { title: 'TITLE', made: 'MADE', note: 'NOTE', none: 'NONE', ask: 'Ask', checkins: 'Check-ins', journal: 'Journal', plan: 'Plan' };
const FULL = { words: WORDS, checkins: ['Monday', '- Morning: Good.'], journal: ['A made-up entry'], plan: ['Signs', '- A made-up sign'], ask: '' };
const key = (date) => date.toISOString().slice(0, 10);

test('nothing ticked and nothing typed makes no page at all', () => {
  const out = buildSummary({ ...FULL, choices: { checkins: false, journal: false, plan: false } });
  assert.deepEqual(out, { empty: true, text: '' });
  assert.equal(buildSummary({ ...FULL, choices: null }).empty, true);
});

test('only what is ticked goes on the page', () => {
  const out = buildSummary({ ...FULL, choices: { checkins: true, journal: false, plan: false } });
  assert.equal(out.empty, false);
  assert.match(out.text, /CHECK-INS\nMonday\n- Morning: Good\./);
  assert.doesNotMatch(out.text, /JOURNAL|PLAN|made-up entry|made-up sign/);
  const all = buildSummary({ ...FULL, choices: { checkins: true, journal: true, plan: true } }).text;
  assert.ok(all.indexOf('CHECK-INS') < all.indexOf('JOURNAL') && all.indexOf('JOURNAL') < all.indexOf('PLAN'));
});

test('a choice counts only when it is exactly true', () => {
  const out = buildSummary({ ...FULL, choices: { checkins: 'yes', journal: 1, plan: {} } });
  assert.equal(out.empty, true);
});

test('the page starts with its title, when it was made, and that it is not a medical record', () => {
  const out = buildSummary({ ...FULL, choices: { plan: true } });
  assert.equal(out.text.split('\n').slice(0, 3).join('|'), 'TITLE|MADE|NOTE');
});

test('what the person typed comes first, trimmed, and held to the limit', () => {
  const out = buildSummary({ ...FULL, ask: '  A made-up question?  ', choices: { checkins: true } });
  assert.ok(out.text.indexOf('ASK\nA made-up question?') < out.text.indexOf('CHECK-INS'));
  const long = buildSummary({ ...FULL, ask: 'x'.repeat(900), choices: {}, maxAsk: 300 });
  assert.equal(long.empty, false);
  assert.equal(long.text.match(/x+/)[0].length, 300);
  assert.equal(buildSummary({ ...FULL, ask: '   ', choices: {} }).empty, true);
});

test('a ticked part with nothing in it says so, and never "undefined"', () => {
  const out = buildSummary({ words: WORDS, choices: { checkins: true, journal: true, plan: true }, checkins: [], journal: null, plan: undefined, ask: null });
  assert.equal(out.text.match(/NONE/g).length, 3);
  assert.doesNotMatch(out.text, /undefined|null|NaN/);
});

test('nothing is counted, averaged, or scored: the page holds only the lines it was given', () => {
  const out = buildSummary({ ...FULL, choices: { checkins: true, journal: true, plan: true } });
  const given = new Set(['TITLE', 'MADE', 'NOTE', 'CHECK-INS', 'JOURNAL', 'PLAN', '', ...FULL.checkins, ...FULL.journal, ...FULL.plan]);
  for (const line of out.text.split('\n')) assert.ok(given.has(line), 'a line that was not given: ' + line);
  const source = readFileSync(new URL('../../src/logic/summary.js', import.meta.url), 'utf8').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(source, /average|score|Math\.(round|max|min)|reduce\(|mood/i);
});

test('the period keeps what falls inside it and leaves out anything without a readable time', () => {
  const day = (n) => { const d = new Date('2026-11-15T12:00:00Z'); d.setUTCDate(d.getUTCDate() - n); return d.toISOString(); };
  const items = [{ t: day(0) }, { t: day(13) }, { t: day(14) }, { t: 'not a time' }, null, 'text', { t: undefined }];
  const kept = sincePeriod(items, (item) => item.t, key(new Date(day(13))), key);
  assert.deepEqual(kept.map((item) => item.t), [day(0), day(13)]);
  assert.deepEqual(sincePeriod(null, (item) => item.t, '2026-01-01', key), []);
});

test('how far back is one of the lengths the app offers, whatever the page says', () => {
  const allowed = CONFIG.summary.days;
  assert.equal(periodDays('30', allowed), 30);
  assert.equal(periodDays('9999', allowed), allowed[0]);
  assert.equal(periodDays(undefined, allowed), allowed[0]);
});

test('the screen offers the lengths and the limit that the configuration holds', () => {
  const html = readFileSync(new URL('../../src/text/redesign.en.html', import.meta.url), 'utf8');
  const offered = [...html.matchAll(/name="tl-summary-days" value="(\d+)"/g)].map((m) => Number(m[1]));
  assert.deepEqual(offered, CONFIG.summary.days);
  for (const days of CONFIG.summary.days) assert.ok(html.includes(`The last ${days} days`), `the words say ${days} days`);
  assert.ok(html.includes(`id="tl-summary-ask" rows="3" maxlength="${CONFIG.summary.maxAsk}"`), 'the field holds what the configuration allows');
});

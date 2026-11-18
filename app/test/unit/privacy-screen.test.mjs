// "Your privacy in Tidelight": the screen that says what the app keeps. It is checked against the
// app's own list of stored things, so a new stored thing can't be added without this screen (or
// this test) saying so, and it may not claim more than the code does.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { KEYS } from '../../src/core/storage.js';

const read = (file) => readFileSync(new URL('../../src/text/' + file, import.meta.url), 'utf8');
const screenOf = (html) => {
  const match = html.match(/<section class="tl-screen" id="tl-privacy"[\s\S]*?<\/section>/);
  assert.ok(match, 'the privacy screen is in the page');
  return match[0];
};
const textOf = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const en = screenOf(read('redesign.en.html'));
const es = screenOf(read('redesign.es.html'));

// Each stored thing, and the words on the screen that cover it. A thing the app keeps only to run
// (no words of the person's) is covered by "your settings".
const COVERED = {
  checkin: 'your journal',
  log: 'your check-ins',
  plan: 'your safety plan',
  visit: 'your notes for an appointment',
  follow: 'the reminder you set to check in on someone',
  toolkit: 'the tools you pinned to Home',
  course: 'the steps you ticked in A first week',
  letter: 'your letter to yourself',
  reach: 'your message for a hard moment',
  good: 'your three good things',
  hope: 'your Hope box',
  circle: 'the people and places you add',
  places: 'the people and places you add',
  sessions: 'your meditation history',
  presets: 'your saved meditations',
  streak: 'your streak',
  days: 'your streak',
  profile: 'your name',
  ageGroup: 'your age group',
  home: 'your home spot',
  settings: 'your settings',
  textSize: 'your settings',
  language: 'your settings',
  onboarding: 'your settings',
  oldReminders: 'your settings',
};

test('every stored thing is covered by words on the privacy screen', () => {
  const text = textOf(en);
  for (const key of Object.keys(KEYS)) {
    assert.ok(COVERED[key], `"${key}" is stored but this test doesn't say which words on the privacy screen cover it`);
    assert.ok(text.includes(COVERED[key]), `the privacy screen no longer says "${COVERED[key]}" (for ${key})`);
  }
});

test('it says it is not a privacy policy, and that no lawyer has read it, in both languages', () => {
  assert.match(textOf(en), /This is not a privacy policy\./);
  assert.match(textOf(en), /No lawyer has written or read it\./);
  assert.match(textOf(es), /Esto no es una política de privacidad\./);
  assert.match(textOf(es), /Ningún abogado la ha escrito ni leído\./);
  for (const html of [en, es]) assert.match(html, /class="tl-draft-tag"/);
});

test('it names every way something leaves the phone', () => {
  const text = textOf(en);
  for (const way of ['Messages screen', 'share sheet', 'iCloud or Google backup', "open your phone's own Phone and Messages apps", "open in your phone's browser"]) {
    assert.ok(text.includes(way), 'missing: ' + way);
  }
});

test('it says what goes to Apple Health, and that nothing is read from it', () => {
  const text = textOf(en);
  assert.match(text, /only if you turn on "Add meditations to Apple Health" in Settings/);
  assert.match(text, /mindful minutes/);
  assert.match(text, /No check-ins, no moods, and nothing you write go there, and Tidelight reads nothing from Health\./);
  assert.match(text, /can go to your iCloud, and other apps you have allowed can read it/);
});

test('it claims nothing the code can\'t back up', () => {
  for (const html of [en, es]) {
    assert.doesNotMatch(textOf(html), /encrypt|cifrad|HIPAA|COPPA|GDPR|anonym|anónim|guarantee|garantiz|100%|secure|segura?\b(?! de)|confidential|confidencial/i);
  }
});

test('nothing on it folds, and it has no control but Back', () => {
  for (const html of [en, es]) {
    assert.doesNotMatch(html, /<details|<summary|data-tl-more|hidden>[^<]*<\/(p|li|h3)>/);
    assert.equal((html.match(/<button\b/g) || []).length, 1);
    assert.equal((html.match(/<(input|select|textarea)\b/g) || []).length, 0);
    assert.equal((html.match(/<a\b/g) || []).length, 1, 'only the "Draft for review" link');
  }
});

test('Spanish has the same headings, paragraphs, and list items as English', () => {
  const shape = (html) => (html.match(/<(h2|h3|p|li|ul)\b/g) || []).join(' ');
  assert.equal(shape(es), shape(en));
  assert.ok((en.match(/<h3\b/g) || []).length >= 7);
});

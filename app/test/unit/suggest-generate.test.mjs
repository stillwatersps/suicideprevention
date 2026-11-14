// Unit tests for the smart suggestion (BUILD-SPEC 5C, 5D) and the builder's generator (6B).
import test from 'node:test';
import assert from 'node:assert/strict';
import { suggestMeditation, inSleepHours, typesDoneOn } from '../../src/logic/suggest.js';
import { generateMeditation, cleanChoices, defaultChoices, SITUATIONS, titleFor } from '../../src/logic/generate.js';
import { cycleLength, totalSeconds } from '../../src/logic/timeline.js';
import { audioPlan, WORLDS, SOUNDS } from '../../src/logic/meditations.js';
import { dateKey } from '../../src/logic/streaks.js';

const at = (h, m = 0) => h * 60 + m;
const day = { minutesOfDay: at(14), headphones: false, atHome: false, silent: null, doneTypesToday: [] };

test('rule 1: between 9:30 pm and 4:00 am, Sleep', () => {
  assert.equal(inSleepHours(at(21, 29)), false);
  assert.equal(inSleepHours(at(21, 30)), true);
  assert.equal(inSleepHours(at(23, 59)), true);
  assert.equal(inSleepHours(at(0)), true);
  assert.equal(inSleepHours(at(3, 59)), true);
  assert.equal(inSleepHours(at(4)), false);
  assert.deepEqual(suggestMeditation({ ...day, minutesOfDay: at(22), atHome: true, headphones: true }), { type: 'sleep', reason: 'sleep', voice: true }, 'Sleep wins over everything at night');
});

test('rule 2: at home with headphones, or with sound allowed, Deep session', () => {
  assert.equal(suggestMeditation({ ...day, atHome: true, headphones: true }).type, 'deep');
  assert.equal(suggestMeditation({ ...day, atHome: true, silent: false }).type, 'deep');
  assert.equal(suggestMeditation({ ...day, atHome: true, silent: null }).type, 'deep', 'an unreadable silent switch counts as sound allowed at home');
  assert.equal(suggestMeditation({ ...day, atHome: true, silent: true }).type, 'silent', 'at home on silent with no headphones: Silent');
  assert.equal(suggestMeditation({ ...day, atHome: true, silent: true, headphones: true }).type, 'deep');
  assert.equal(suggestMeditation({ ...day, atHome: true }).reason, 'home');
});

test('rule 3: headphones on and not at home, Quick reset with voice', () => {
  assert.deepEqual(suggestMeditation({ ...day, headphones: true }), { type: 'quick', reason: 'onTheGo', voice: true });
});

test('rule 4: otherwise, Silent', () => {
  assert.deepEqual(suggestMeditation(day), { type: 'silent', reason: 'anywhere', voice: false });
  assert.equal(suggestMeditation({}).type, 'silent', 'nothing known at all: Silent');
  assert.equal(suggestMeditation(undefined).type, 'silent');
});

test('with no location permission, location rules are skipped quietly', () => {
  assert.equal(suggestMeditation({ ...day, atHome: null }).type, 'silent');
  assert.equal(suggestMeditation({ ...day, atHome: null, headphones: true }).type, 'quick', 'headphones still count when home is unknown');
  assert.equal(suggestMeditation({ ...day, atHome: null, minutesOfDay: at(23) }).type, 'sleep');
});

test('rule 5: a type already done today gives way to the next best', () => {
  assert.equal(suggestMeditation({ ...day, doneTypesToday: ['silent'] }).type, 'quick');
  assert.equal(suggestMeditation({ ...day, doneTypesToday: ['silent'] }).reason, 'another');
  assert.equal(suggestMeditation({ ...day, atHome: true, doneTypesToday: ['deep'] }).type, 'silent', 'the next rule that fits');
  assert.equal(suggestMeditation({ ...day, headphones: true, doneTypesToday: ['quick'] }).type, 'silent');
  assert.equal(suggestMeditation({ ...day, minutesOfDay: at(22), atHome: true, doneTypesToday: ['sleep'] }).type, 'deep');
  assert.equal(suggestMeditation({ ...day, doneTypesToday: ['silent', 'quick'] }).type, 'deep');
  assert.notEqual(suggestMeditation({ ...day, doneTypesToday: ['silent', 'quick', 'deep'] }).type, 'sleep', 'Sleep is never suggested in the daytime');
  assert.equal(suggestMeditation({ ...day, doneTypesToday: ['silent', 'quick', 'deep', 'sleep'] }).type, 'silent', 'everything done: the first fit again');
});

test('the types done today are the completed sessions of that local day', () => {
  const now = new Date(2026, 10, 11, 15);
  const sessions = [
    { type: 'quick', completed: true, startedAt: new Date(2026, 10, 11, 9).toISOString() },
    { type: 'deep', completed: false, startedAt: new Date(2026, 10, 11, 10).toISOString() },
    { type: 'sleep', completed: true, startedAt: new Date(2026, 10, 10, 23).toISOString() },
  ];
  assert.deepEqual(typesDoneOn(sessions, dateKey(now), dateKey), ['quick']);
  assert.deepEqual(typesDoneOn(null, dateKey(now), dateKey), []);
});

// ---- The generator.
const everyChoice = () => {
  const out = [];
  for (let L = 1; L <= 30; L += 1) for (const situation of SITUATIONS) for (const bodyScan of [false, true]) out.push({ lengthMinutes: L, situation, bodyScan });
  return out;
};

test('the total is exactly the length chosen, for every length from 1 to 30 and every situation', () => {
  for (const choices of everyChoice()) {
    const m = generateMeditation(choices);
    assert.equal(totalSeconds(m), choices.lengthMinutes * 60, JSON.stringify(choices));
    assert.equal(m.totalSeconds, choices.lengthMinutes * 60);
  }
});

test('no segment is empty or negative, and breathing is whole breaths only', () => {
  for (const choices of everyChoice()) {
    const m = generateMeditation(choices);
    m.segments.forEach((s) => {
      assert.ok(Number.isInteger(s.durationSeconds) && s.durationSeconds > 0, `${JSON.stringify(choices)}: ${s.kind} ${s.durationSeconds}`);
      if (s.kind === 'breathing') {
        assert.equal(s.durationSeconds % cycleLength(s.breathingPattern), 0);
        assert.equal(s.durationSeconds / cycleLength(s.breathingPattern), s.cycles);
      }
    });
    assert.equal(m.segments[0].kind, 'intro');
    assert.equal(m.segments[m.segments.length - 1].kind, 'outro');
    assert.ok(m.segments.some((s) => s.kind === 'breathing'), `${JSON.stringify(choices)} has breathing`);
  }
});

test('each situation uses its pattern', () => {
  const first = (situation) => generateMeditation({ lengthMinutes: 5, situation }).segments.find((s) => s.kind === 'breathing').breathingPattern;
  const shape = (p) => [p.inhale, p.holdIn, p.exhale, p.holdOut].join('-');
  assert.equal(shape(first('stressed')), '4-7-8-0');
  assert.equal(shape(first('focus')), '4-4-4-4');
  assert.equal(shape(first('energize')), '4-0-2-0');
  assert.equal(shape(first('sleep')), '4-0-8-0');
  assert.equal(shape(first('breathe')), '4-0-6-0');
  assert.equal(defaultChoices().situation, 'breathe', 'Just breathe is the default');
});

test('Stressed: never more than 4 breaths of 4-7-8 in a row, alternating with 4-0-6-0', () => {
  for (let L = 1; L <= 30; L += 1) {
    const breathing = generateMeditation({ lengthMinutes: L, situation: 'stressed', bodyScan: true }).segments.filter((s) => s.kind === 'breathing');
    breathing.forEach((s) => { if (s.breathingPattern.holdIn === 7) assert.ok(s.cycles <= 4, `${L} minutes: ${s.cycles} in a row`); });
    if (L >= 4) assert.ok(breathing.some((s) => s.breathingPattern.exhale === 6), `${L} minutes alternates`);
  }
});

test('Energize: at most two minutes of 4-0-2-0, then 4-0-4-0', () => {
  for (let L = 1; L <= 30; L += 1) {
    const breathing = generateMeditation({ lengthMinutes: L, situation: 'energize' }).segments.filter((s) => s.kind === 'breathing');
    const fast = breathing.filter((s) => s.breathingPattern.exhale === 2).reduce((sum, s) => sum + s.durationSeconds, 0);
    assert.ok(fast <= 120, `${L} minutes: ${fast} seconds of the fast pattern`);
    const firstSlow = breathing.findIndex((s) => s.breathingPattern.exhale === 4);
    if (firstSlow !== -1) assert.ok(breathing.slice(firstSlow).every((s) => s.breathingPattern.exhale === 4), 'once eased, it stays eased');
    if (L >= 5) assert.ok(firstSlow !== -1, `${L} minutes eases into 4-0-4-0`);
  }
});

test('Sleep: the exhale lengthens from 8 toward 10 and never shortens', () => {
  for (let L = 3; L <= 30; L += 1) {
    const exhales = generateMeditation({ lengthMinutes: L, situation: 'sleep', bodyScan: true }).segments.filter((s) => s.kind === 'breathing').map((s) => s.breathingPattern.exhale);
    assert.deepEqual(exhales.slice().sort((a, b) => a - b), exhales, `${L} minutes: ${exhales}`);
    assert.equal(exhales[0], 8);
    assert.ok(Math.max(...exhales) <= 10);
    if (L >= 5) assert.equal(exhales[exhales.length - 1], 10);
  }
});

test('a body scan appears only when it is on and the session is 8 minutes or more', () => {
  for (let L = 1; L <= 30; L += 1) {
    const has = (bodyScan) => generateMeditation({ lengthMinutes: L, bodyScan }).segments.some((s) => s.kind === 'bodyScan');
    assert.equal(has(false), false);
    assert.equal(has(true), L >= 8, `${L} minutes`);
  }
  const scan = generateMeditation({ lengthMinutes: 20, bodyScan: true }).segments.find((s) => s.kind === 'bodyScan');
  assert.ok(scan.durationSeconds >= 90 && scan.durationSeconds <= 300);
});

test('the order of segments follows the length', () => {
  const kinds = (choices) => generateMeditation(choices).segments.map((s) => s.kind).filter((k, i, all) => k !== all[i - 1]).join(' ');
  assert.equal(kinds({ lengthMinutes: 5, situation: 'focus' }), 'intro breathing outro');
  assert.equal(kinds({ lengthMinutes: 12, situation: 'breathe', bodyScan: true }), 'intro breathing bodyScan breathing silence outro');
  assert.equal(kinds({ lengthMinutes: 12, situation: 'breathe' }), 'intro breathing silence outro');
  assert.equal(kinds({ lengthMinutes: 20, situation: 'breathe', bodyScan: true }), 'intro breathing bodyScan silence breathing silence breathing outro');
  assert.equal(kinds({ lengthMinutes: 9, situation: 'breathe', bodyScan: true }), 'intro breathing bodyScan breathing outro', 'no silence under 10 minutes');
});

test('a 1-minute session still has an intro, breathing, and an outro', () => {
  for (const situation of SITUATIONS) {
    const m = generateMeditation({ lengthMinutes: 1, situation });
    const [intro, outro] = [m.segments[0], m.segments[m.segments.length - 1]];
    assert.ok(intro.durationSeconds >= 5 && intro.durationSeconds < 20, 'the intro shrinks below its usual 20 seconds');
    assert.ok(outro.durationSeconds >= 5 && outro.durationSeconds < 30);
    const breathing = m.segments.filter((s) => s.kind === 'breathing').reduce((sum, s) => sum + s.durationSeconds, 0);
    assert.ok(breathing >= 30, `${situation}: ${breathing} seconds of breathing in one minute`);
  }
  const usual = generateMeditation({ lengthMinutes: 5 });
  assert.equal(usual.segments[0].durationSeconds, 30, 'longer sessions keep the usual intro: 10% of the time');
  assert.equal(generateMeditation({ lengthMinutes: 30 }).segments[0].durationSeconds, 60, 'capped at a minute');
});

test('choices carry through, bad choices are made safe, and the title is made', () => {
  const m = generateMeditation({ lengthMinutes: 12, situation: 'focus', world: 'forest', sound: 'rain', voice: true, haptics: false, style: 'straightforward' }, { situation: 'Focus', world: 'Forest' });
  assert.deepEqual([m.world, m.backgroundSound, m.voiceEnabled, m.hapticBreathing, m.style, m.type], ['forest', 'rain', true, false, 'straightforward', 'custom']);
  assert.equal(m.title, '12-min Focus · Forest');
  assert.equal(m.segments[0].voiceScriptId, 'intro.custom');
  assert.deepEqual(audioPlan(m, {}), { ambient: 'rain', voice: true });
  assert.deepEqual(audioPlan(generateMeditation({ sound: 'none', voice: false }), {}), { ambient: 'none', voice: false }, 'the "Bus ride" kind of preset is silent');
  const safe = cleanChoices({ lengthMinutes: 99, situation: 'x', sound: 'y', world: 'z', style: 'w' });
  assert.deepEqual([safe.lengthMinutes, safe.situation, safe.sound, safe.world, safe.style], [30, 'breathe', 'none', 'ocean', 'calm']);
  assert.equal(cleanChoices({ lengthMinutes: 0 }).lengthMinutes, 5);
  assert.equal(cleanChoices({ lengthMinutes: -3 }).lengthMinutes, 1);
  assert.equal(titleFor({ lengthMinutes: 3, situation: 'sleep', world: 'nightSky' }), '3-min sleep · nightSky');
  for (const world of WORLDS) for (const sound of SOUNDS) assert.equal(totalSeconds(generateMeditation({ lengthMinutes: 7, world, sound })), 420);
  assert.equal(generateMeditation({ lengthMinutes: 5, situation: 'focus' }).id, generateMeditation({ lengthMinutes: 5, situation: 'focus' }).id, 'the same choices give the same meditation');
});

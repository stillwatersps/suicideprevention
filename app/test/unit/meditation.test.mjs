// Unit tests for the meditation engine's pure parts (BUILD-SPEC 4I and 5D): the timeline, the
// built-in types as data, what may sound, the voice fallback, the 60% rule, and haptic breaths.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PHASES, cycleLength, totalSeconds, buildSchedule, phaseAt, breathLevel, stateAt, createTimeline } from '../../src/logic/timeline.js';
import { TYPES, PATTERNS, breaths, breathPlan, builtIn, enforce, audioPlan, voiceClipPath, resolveVoice, countsAsComplete, sessionRecord,
  minutesMeditated, breathPulses } from '../../src/logic/meditations.js';
import { CONFIG } from '../../src/core/config.js';

const sample = {
  id: 'sample', type: 'custom', segments: [
    { kind: 'intro', durationSeconds: 5 },
    { kind: 'breathing', durationSeconds: 32, breathingPattern: PATTERNS.box },
    { kind: 'silence', durationSeconds: 10 },
    { kind: 'breathing', durationSeconds: 20, breathingPattern: PATTERNS.calm },
    { kind: 'outro', durationSeconds: 5 },
  ],
};
function fakeClock() { let t = 1000; return { now: () => t, advance: (ms) => { t += ms; } }; }

test('the schedule lays segments end to end and the total is exact', () => {
  const schedule = buildSchedule(sample);
  assert.deepEqual(schedule.map((e) => [e.start, e.end]), [[0, 5], [5, 37], [37, 47], [47, 67], [67, 72]]);
  assert.equal(totalSeconds(sample), 72);
  assert.equal(cycleLength(PATTERNS.box), 16);
});

test('a breath moves through its phases in order, skipping empty ones', () => {
  assert.deepEqual([0, 3.9, 4, 7.9, 8, 12, 15.9, 16].map((t) => phaseAt(PATTERNS.box, t).phase), ['inhale', 'inhale', 'holdIn', 'holdIn', 'exhale', 'holdOut', 'holdOut', 'inhale']);
  assert.deepEqual([0, 4, 9.9, 10].map((t) => phaseAt(PATTERNS.calm, t).phase), ['inhale', 'exhale', 'exhale', 'inhale'], '4-0-6-0 has no holds');
  assert.equal(phaseAt(PATTERNS.calm, 7).phaseProgress, 0.5);
  assert.deepEqual(PHASES, ['inhale', 'holdIn', 'exhale', 'holdOut']);
  assert.equal(breathLevel('inhale', 0.25), 0.25);
  assert.equal(breathLevel('holdIn', 0.5), 1);
  assert.equal(breathLevel('exhale', 0.25), 0.75);
  assert.equal(breathLevel('holdOut', 0.5), 0);
});

test('the timeline gives the right segment and phase sequence', () => {
  const seen = [];
  for (let t = 0; t < 72; t += 0.5) {
    const s = stateAt(sample, t);
    const label = s.segment.kind + (s.phase ? ':' + s.phase : '');
    if (seen[seen.length - 1] !== label) seen.push(label);
  }
  assert.deepEqual(seen, ['intro',
    'breathing:inhale', 'breathing:holdIn', 'breathing:exhale', 'breathing:holdOut', 'breathing:inhale', 'breathing:holdIn', 'breathing:exhale', 'breathing:holdOut',
    'silence', 'breathing:inhale', 'breathing:exhale', 'breathing:inhale', 'breathing:exhale', 'outro']);
  const mid = stateAt(sample, 21);
  assert.equal(mid.segmentIndex, 1);
  assert.equal(mid.cycle, 1, 'the second cycle of the box');
  assert.equal(mid.phase, 'inhale');
  assert.equal(mid.phaseRemaining, 4);
  assert.equal(stateAt(sample, 36).totalProgress, 0.5);
  assert.equal(stateAt(sample, 72).done, true);
  assert.equal(stateAt(sample, 500).elapsed, 72, 'never runs past the end');
  assert.equal(stateAt(sample, 40).phase, null, 'no breath phase outside breathing');
  assert.ok(stateAt(sample, 40).breath >= 0 && stateAt(sample, 40).breath <= 1);
});

test('total duration is exact whatever the frame rate', () => {
  for (const frame of [16, 33, 250, 1900]) {
    const clock = fakeClock();
    const timeline = createTimeline(sample, clock.now);
    timeline.start();
    let ticks = 0;
    while (!timeline.finished() && ticks < 100000) { clock.advance(frame); timeline.tick(); ticks += 1; }
    assert.ok(Math.abs(ticks * frame / 1000 - 72) <= frame / 1000 + 0.001, `finishes at 72 seconds with ${frame} ms frames`);
    assert.equal(timeline.elapsed(), 72);
  }
});

test('pause and resume keep the timing right', () => {
  const clock = fakeClock();
  const timeline = createTimeline(sample, clock.now);
  timeline.start();
  clock.advance(10000);
  timeline.pause();
  assert.equal(timeline.playing(), false);
  clock.advance(60000); // a minute away
  assert.equal(timeline.elapsed(), 10, 'time does not pass while paused');
  timeline.resume();
  clock.advance(5000);
  assert.equal(timeline.elapsed(), 15);
  assert.equal(timeline.tick().segment.kind, 'breathing');
  timeline.pause(); timeline.pause();
  timeline.resume(); timeline.resume();
  clock.advance(1000);
  assert.equal(timeline.elapsed(), 16, 'pausing or resuming twice changes nothing');
});

test('layers are told when the segment, the phase, or the pattern changes, and once at the end', () => {
  const clock = fakeClock();
  const timeline = createTimeline(sample, clock.now);
  const log = { segment: 0, phase: 0, pattern: 0, finished: 0 };
  const stop = timeline.subscribe((state, changed) => Object.keys(log).forEach((k) => { if (changed[k]) log[k] += 1; }));
  timeline.start();
  while (!timeline.finished()) { clock.advance(100); timeline.tick(); }
  clock.advance(5000); timeline.tick(); timeline.tick();
  assert.equal(log.segment, 5);
  assert.equal(log.finished, 1);
  assert.equal(log.pattern, 5, 'none, box, none, calm, none');
  assert.ok(log.phase >= 14);
  stop();
  timeline.tick();
});

test('time missed in the background is added back', () => {
  const clock = fakeClock();
  const timeline = createTimeline(sample, clock.now);
  timeline.start();
  clock.advance(4000);
  timeline.addMissed(20000); // the page's clock stood still for 20 seconds
  assert.equal(timeline.elapsed(), 24);
  timeline.pause();
  timeline.addMissed(5000);
  assert.equal(timeline.elapsed(), 24, 'nothing is added while paused');
});

test('breathing is always whole breaths', () => {
  const run = breaths(PATTERNS.box, 50);
  assert.equal(run.used, 48);
  assert.equal(run.left, 2);
  assert.equal(run.segments[0].cycles, 3);
  assert.deepEqual(breaths(PATTERNS.box, 10).segments, []);
  const plan = breathPlan([{ pattern: PATTERNS.stressed, maxCycles: 4 }, { pattern: PATTERNS.calm, maxCycles: 4 }], 300);
  assert.deepEqual(plan.segments.map((s) => [s.breathingPattern.name, s.cycles]), [['stressed', 4], ['calm', 4], ['stressed', 4], ['calm', 4], ['stressed', 3], ['calm', 1]]);
  assert.equal(plan.used + plan.left, 300);
  assert.equal(plan.left, 1);
  plan.segments.forEach((s) => assert.equal(s.durationSeconds % cycleLength(s.breathingPattern), 0));
});

test('every built-in type and length is exactly as long as it says, with no empty segment', () => {
  for (const type of TYPES) {
    for (const minutes of CONFIG.meditation.lengths[type]) {
      for (const style of ['calm', 'straightforward']) {
        const m = builtIn(type, { minutes, style });
        assert.equal(totalSeconds(m), minutes * 60, `${type} ${minutes}`);
        assert.equal(m.totalSeconds, minutes * 60);
        m.segments.forEach((s) => {
          assert.ok(s.durationSeconds > 0, `${type} ${minutes}: ${s.kind} has time`);
          if (s.kind === 'breathing') assert.equal(s.durationSeconds % cycleLength(s.breathingPattern), 0, 'whole breaths');
        });
        assert.equal(m.style, style);
      }
    }
  }
});

test('the four types have the structure the spec gives them', () => {
  const kinds = (m) => m.segments.map((s) => s.kind).filter((k, i, all) => k !== all[i - 1]);
  const silent = builtIn('silent', { minutes: 3 });
  assert.deepEqual(kinds(silent), ['intro', 'breathing', 'outro']);
  assert.equal(silent.segments[1].breathingPattern, PATTERNS.calm);
  assert.equal(silent.world, 'ocean');
  assert.equal(silent.hapticBreathing, true);
  assert.ok(silent.segments.every((s) => !s.voiceScriptId), 'Silent has words on screen only');
  const quick = builtIn('quick');
  assert.deepEqual(quick.segments.map((s) => [s.kind, s.durationSeconds]), [['intro', 5], ['breathing', 48], ['outro', 7]]);
  assert.equal(quick.segments[1].breathingPattern, PATTERNS.box);
  assert.equal(quick.world, 'forest');
  const deep = builtIn('deep', { minutes: 15 });
  assert.deepEqual(kinds(deep), ['intro', 'breathing', 'bodyScan', 'silence', 'breathing', 'outro']);
  assert.equal(deep.voiceEnabled, true);
  assert.equal(deep.world, 'ocean');
  const sleep = builtIn('sleep', { minutes: 20 });
  assert.deepEqual(kinds(sleep), ['intro', 'breathing', 'bodyScan', 'silence']);
  const exhales = sleep.segments.filter((s) => s.kind === 'breathing').map((s) => s.breathingPattern.exhale);
  assert.deepEqual(exhales, [8, 9, 10], 'the breaths slow over time');
  assert.equal(sleep.completionScreen, false, 'Sleep has no completion screen');
  assert.equal(sleep.fadeOutSeconds, 180, 'its sound fades over the last three minutes');
  assert.ok(sleep.dim > 0);
  assert.equal(sleep.hapticBreathing, false);
  assert.equal(sleep.world, 'nightSky');
  assert.ok(sleep.segments[sleep.segments.length - 1].durationSeconds > 240, 'a long quiet at the end');
  assert.equal(builtIn('deep', { minutes: 7 }).totalSeconds, 600, 'an unknown length falls back to the first');
  assert.throws(() => builtIn('nope'));
});

test('options change the world, the sound, the voice, and haptics', () => {
  const m = builtIn('deep', { minutes: 10, world: 'forest', sound: 'brownNoise', voice: false, haptics: true });
  assert.deepEqual([m.world, m.backgroundSound, m.voiceEnabled, m.hapticBreathing], ['forest', 'brownNoise', false, true]);
  assert.equal(builtIn('deep', { world: 'mars', sound: 'jazz' }).world, 'ocean', 'unknown choices are ignored');
});

test('Silent never plays audio, whatever the settings say', () => {
  const silent = builtIn('silent', { minutes: 5, sound: 'rain', voice: true });
  assert.equal(silent.backgroundSound, 'none');
  assert.equal(silent.voiceEnabled, false);
  assert.deepEqual(audioPlan(silent, { sound: true, voice: true }), { ambient: 'none', voice: false });
  // Even a Silent meditation that was tampered with stays silent.
  const forced = Object.assign({}, silent, { backgroundSound: 'ocean', voiceEnabled: true });
  assert.deepEqual(audioPlan(forced, { sound: true, voice: true }), { ambient: 'none', voice: false });
  assert.equal(enforce(Object.assign({}, forced, { segments: silent.segments })).backgroundSound, 'none');
});

test('no audio plays when sound is off, and each switch works on its own', () => {
  const deep = builtIn('deep', { minutes: 10 });
  assert.deepEqual(audioPlan(deep, {}), { ambient: 'ocean', voice: true });
  assert.deepEqual(audioPlan(deep, { sound: false }), { ambient: 'none', voice: false });
  assert.deepEqual(audioPlan(deep, { voice: false }), { ambient: 'ocean', voice: false });
  assert.deepEqual(audioPlan(builtIn('deep', { sound: 'none' }), {}), { ambient: 'none', voice: true });
});

test('the voice falls back to text-to-speech when no recording exists', () => {
  assert.equal(voiceClipPath('intro.deep', 'calm', 'en'), 'en/intro.deep_calm.mp3');
  const manifest = { voice: ['en/intro.deep_calm.mp3'], ambient: [] };
  assert.deepEqual(resolveVoice('intro.deep', 'calm', 'en', manifest, true), { kind: 'clip', path: 'voice/en/intro.deep_calm.mp3' });
  assert.deepEqual(resolveVoice('intro.deep', 'straightforward', 'en', manifest, true), { kind: 'tts' }, 'a missing style falls back');
  assert.deepEqual(resolveVoice('intro.deep', 'calm', 'es', manifest, true), { kind: 'tts' }, 'a missing language falls back');
  assert.deepEqual(resolveVoice('outro.deep', 'calm', 'en', { voice: [] }, true), { kind: 'tts' });
  assert.deepEqual(resolveVoice('outro.deep', 'calm', 'en', null, false), { kind: 'none' }, 'no recording and no speech: words on screen only');
});

test('the 60% rule', () => {
  assert.equal(countsAsComplete(180, 300), true);
  assert.equal(countsAsComplete(179, 300), false);
  assert.equal(countsAsComplete(300, 300), true);
  assert.equal(countsAsComplete(0, 0), false);
  const m = builtIn('silent', { minutes: 5 });
  const almost = sessionRecord({ meditation: m, startedAt: '2026-11-11T10:00:00.000Z', completedSeconds: 100 });
  assert.equal(almost.completed, false);
  const enough = sessionRecord({ meditation: m, startedAt: '2026-11-11T10:00:00.000Z', completedSeconds: 181.4, moodAfter: 4 });
  assert.deepEqual([enough.completed, enough.completedSeconds, enough.moodAfter, enough.meditationId, enough.type], [true, 181, 4, 'silent-5', 'silent']);
  assert.equal(sessionRecord({ meditation: m, startedAt: 'x', completedSeconds: 9999 }).completedSeconds, 300, 'never more than the whole');
  assert.equal(minutesMeditated([almost, enough]), 5);
});

test('haptic breathing is spaced pulses that rise on the inhale and fade on the exhale', () => {
  const up = breathPulses('inhale', 4);
  assert.ok(up.length >= 4 && up.length <= 10, 'discrete pulses, not a buzz');
  assert.deepEqual(up.map((p) => p.strength).slice().sort((a, b) => a - b), up.map((p) => p.strength), 'strengthening');
  up.slice(1).forEach((p, i) => assert.ok(p.at - up[i].at >= CONFIG.haptics.breathPulseGapMs - 1, 'spaced apart'));
  const down = breathPulses('exhale', 6);
  const body = down.slice(0, -1).map((p) => p.strength);
  assert.deepEqual(body.slice().sort((a, b) => b - a), body, 'fading');
  assert.ok(down[down.length - 1].strength <= 0.25, 'ending on one soft tap');
  assert.ok(down.every((p) => p.at < 6000 && p.strength > 0 && p.strength <= 1));
  assert.deepEqual(breathPulses('holdIn', 7), [{ at: 0, strength: 0.15 }], 'a hold is one very light tick');
  assert.deepEqual(breathPulses('holdOut', 0), []);
});

// The custom meditation builder's generator: choices in, a meditation out. Pure, so every length
// from 1 to 30 minutes and every situation can be tested. The total is always exactly the length
// chosen, and breathing is always whole breaths. (BUILD-SPEC 6B.)
import { CONFIG } from '../core/config.js';
import { cycleLength, totalSeconds } from './timeline.js';
import { PATTERNS, WORLDS, SOUNDS } from './meditations.js';

export const SITUATIONS = ['stressed', 'focus', 'energize', 'sleep', 'breathe'];
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const seg = (kind, durationSeconds, extra) => Object.assign({ kind, durationSeconds }, extra || {});

export function defaultChoices(over) {
  return Object.assign({ lengthMinutes: 5, situation: 'breathe', sound: 'none', world: 'ocean', voice: false, haptics: true, bodyScan: false, style: 'calm' }, over || {});
}
// Makes any saved or half-filled choices safe to use.
export function cleanChoices(raw) {
  const c = defaultChoices(raw);
  c.lengthMinutes = clamp(Math.round(Number(c.lengthMinutes) || 5), CONFIG.builder.minMinutes, CONFIG.builder.maxMinutes);
  if (SITUATIONS.indexOf(c.situation) === -1) c.situation = 'breathe';
  if (SOUNDS.indexOf(c.sound) === -1) c.sound = 'none';
  if (WORLDS.indexOf(c.world) === -1) c.world = 'ocean';
  c.style = c.style === 'straightforward' ? 'straightforward' : 'calm';
  c.voice = Boolean(c.voice); c.haptics = Boolean(c.haptics); c.bodyScan = Boolean(c.bodyScan);
  return c;
}

// Which pattern the next breath uses, for each situation. `used` is the breathing time so far,
// `total` all the breathing time in the session, `run` how many breaths in a row used this pattern.
const NEXT = {
  // 4-7-8 for at most 4 breaths in a row, then 4 breaths of 4-0-6-0, so it stays comfortable.
  stressed: (state) => (state.block === 'stressed' && state.run >= CONFIG.builder.stressedMaxCycles ? 'calm'
    : state.block === 'calm' && state.run >= CONFIG.builder.stressedMaxCycles ? 'stressed' : state.block || 'stressed'),
  focus: () => 'box',
  // 4-0-2-0 for at most two minutes, then it eases into 4-0-4-0.
  energize: (state) => (state.used + cycleLength(PATTERNS.energize) <= CONFIG.builder.energizeMaxSeconds ? 'energize' : 'even'),
  // 4-0-8-0, with the exhale lengthening toward 10 over the session.
  sleep: (state) => (state.used < state.total / 3 ? 'sleep' : state.used < (2 * state.total) / 3 ? 'sleep9' : 'sleep10'),
  breathe: () => 'calm',
};

function breathRunner(situation, total) {
  const state = { used: 0, total, block: null, run: 0 };
  // Fills `budget` seconds with whole breaths. Returns { segments, left }.
  return (budget) => {
    const segments = [];
    let left = budget;
    for (;;) {
      const name = NEXT[situation](state);
      const p = PATTERNS[name];
      const length = cycleLength(p);
      if (length > left) break;
      if (state.block === name) state.run += 1; else { state.block = name; state.run = 1; }
      state.used += length;
      left -= length;
      const last = segments[segments.length - 1];
      if (last && last.breathingPattern === p) { last.durationSeconds += length; last.cycles += 1; } else segments.push(seg('breathing', length, { breathingPattern: p, cycles: 1 }));
    }
    return { segments, left };
  };
}

// choices: { lengthMinutes 1-30, situation, sound, world, voice, haptics, bodyScan, style }.
// labels (optional): { situation, world } words for the title.
export function generateMeditation(rawChoices, labels) {
  const c = cleanChoices(rawChoices);
  const L = c.lengthMinutes;
  const T = L * 60;
  let intro = clamp(Math.round(0.10 * T), 20, 60);
  let outro = clamp(Math.round(0.08 * T), 15, 45);
  // Very short sessions: the intro and outro shrink below their usual floor, so breathing still fits.
  if (L < 3) { intro = Math.max(5, Math.round(0.10 * T)); outro = Math.max(5, Math.round(0.08 * T)); }
  const body = T - intro - outro;
  const withScan = c.bodyScan && L >= CONFIG.builder.bodyScanFromMinutes;
  const scan = withScan ? clamp(Math.round(0.25 * body), 90, 300) : 0;
  const silence = L >= CONFIG.builder.silenceFromMinutes ? clamp(Math.round(0.15 * body), 60, 240) : 0;
  const breathingTime = body - scan - silence;
  const take = breathRunner(c.situation, breathingTime);

  const scanSeg = () => (scan ? [seg('bodyScan', scan, { voiceScriptId: 'bodyScan', screenTextId: 'bodyScan' })] : []);
  const quiet = (seconds) => (seconds > 0 ? [seg('silence', seconds, { screenTextId: 'silence' })] : []);
  let middle = [];
  let spare = 0; // seconds no whole breath could use
  const breathe = (share) => { const run = take(share); spare += run.left; return run.segments; };

  if (L < 8) {
    middle = [...breathe(breathingTime), ...quiet(silence)];
  } else if (L <= 15) {
    const first = Math.round(breathingTime * 0.6);
    middle = [...breathe(first), ...scanSeg(), ...breathe(breathingTime - first), ...quiet(silence)];
  } else {
    const first = Math.round(breathingTime * 0.4);
    const second = Math.round(breathingTime * 0.3);
    const half = Math.round(silence / 2);
    middle = [...breathe(first), ...scanSeg(), ...quiet(half), ...breathe(second), ...quiet(silence - half), ...breathe(breathingTime - first - second)];
  }
  // The seconds left over go to the last silence, or to the outro, so the total is exactly T.
  const silences = middle.filter((s) => s.kind === 'silence');
  if (spare > 0 && silences.length) silences[silences.length - 1].durationSeconds += spare;
  else if (spare >= 10 && L < 8) middle.push(seg('silence', spare, { screenTextId: 'silence' }));
  else outro += spare;

  // Neighbouring breathing with the same pattern becomes one segment.
  const merged = [];
  middle.forEach((s) => {
    const last = merged[merged.length - 1];
    if (last && s.kind === 'breathing' && last.kind === 'breathing' && last.breathingPattern === s.breathingPattern) { last.durationSeconds += s.durationSeconds; last.cycles += s.cycles; } else merged.push(s);
  });

  const meditation = {
    id: 'custom-' + [L, c.situation, c.world, c.sound, c.voice ? 'v' : '', c.haptics ? 'h' : '', withScan ? 'b' : '', c.style].join('-'),
    title: titleFor(c, labels), type: 'custom', totalSeconds: T, world: c.world, backgroundSound: c.sound,
    voiceEnabled: c.voice, hapticBreathing: c.haptics, style: c.style, dim: 0, fadeOutSeconds: CONFIG.meditation.ambientFadeOutSeconds, completionScreen: true,
    segments: [seg('intro', intro, { voiceScriptId: 'intro.custom', screenTextId: 'intro.custom' }), ...merged, seg('outro', outro, { voiceScriptId: 'outro.custom', screenTextId: 'outro.custom' })],
  };
  meditation.totalSeconds = totalSeconds(meditation);
  return meditation;
}

// "12-min Focus · Forest"
export function titleFor(choices, labels) {
  const l = labels || {};
  return choices.lengthMinutes + '-min ' + (l.situation || choices.situation) + ' · ' + (l.world || choices.world);
}

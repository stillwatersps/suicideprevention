// Meditations are data, not screens. This file builds them (the four built-in types), decides
// what may sound (Silent never does), finds the voice for a line (a recording if one exists,
// else the phone's own text-to-speech), and keeps the session record and the 60% rule.
// Pure: nothing here touches a browser or a phone. The words live in src/text/redesign.*.html,
// keyed by voiceScriptId ("script.<id>") and screenTextId ("screen.<id>").
import { CONFIG } from '../core/config.js';
import { cycleLength, totalSeconds } from './timeline.js';

export const TYPES = ['silent', 'quick', 'deep', 'sleep'];
export const WORLDS = ['ocean', 'forest', 'nightSky'];
export const SOUNDS = ['none', 'rain', 'ocean', 'whiteNoise', 'brownNoise'];

const pattern = (name, inhale, holdIn, exhale, holdOut) => Object.freeze({ name, inhale, holdIn, exhale, holdOut });
export const PATTERNS = Object.freeze({
  calm: pattern('calm', 4, 0, 6, 0),
  box: pattern('box', 4, 4, 4, 4),
  sleep: pattern('sleep', 4, 0, 8, 0),
  sleep9: pattern('sleep9', 4, 0, 9, 0),
  sleep10: pattern('sleep10', 4, 0, 10, 0),
  stressed: pattern('stressed', 4, 7, 8, 0),
  energize: pattern('energize', 4, 0, 2, 0),
  even: pattern('even', 4, 0, 4, 0),
});

const seg = (kind, durationSeconds, extra) => Object.assign({ kind, durationSeconds }, extra || {});
const spoken = (id) => ({ voiceScriptId: id, screenTextId: id });

// Whole breaths only: as many cycles of `p` as fit in `seconds`.
// Returns { segments: [one breathing segment, or none], used, left }.
export function breaths(p, seconds, extra) {
  const cycles = Math.floor(seconds / cycleLength(p));
  const used = cycles * cycleLength(p);
  return { segments: cycles > 0 ? [seg('breathing', used, Object.assign({ breathingPattern: p, cycles }, extra || {}))] : [], used, left: seconds - used };
}
// A run of breathing that follows a plan of blocks, each { pattern, maxSeconds or maxCycles },
// repeated in order until the time is used. Returns { segments, used, left }.
export function breathPlan(blocks, seconds) {
  const segments = [];
  let left = seconds;
  for (let i = 0, idle = 0; left > 0 && idle < blocks.length; i += 1) {
    const block = blocks[i % blocks.length];
    if (block.once && i >= blocks.length) { idle += 1; continue; }
    const cap = Math.min(left, block.maxSeconds ?? Infinity, (block.maxCycles ?? Infinity) * cycleLength(block.pattern));
    const run = breaths(block.pattern, cap);
    if (!run.used) { idle += 1; continue; }
    idle = 0;
    const previous = segments[segments.length - 1];
    if (previous && previous.breathingPattern === block.pattern) {
      previous.durationSeconds += run.used;
      previous.cycles += run.segments[0].cycles;
    } else {
      segments.push(run.segments[0]);
    }
    left -= run.used;
  }
  return { segments, used: seconds - left, left };
}

function base(type, minutes, style, over) {
  return Object.assign({
    id: type + '-' + minutes, title: '', type, totalSeconds: minutes * 60, world: 'ocean', backgroundSound: 'none',
    voiceEnabled: false, hapticBreathing: true, style: style || 'calm', dim: 0, fadeOutSeconds: CONFIG.meditation.ambientFadeOutSeconds,
    completionScreen: true, segments: [],
  }, over);
}

// The four built-in types, as data. options: { minutes, style, world, sound, voice, haptics }.
export function builtIn(type, options = {}) {
  const lengths = CONFIG.meditation.lengths[type];
  if (!lengths) throw new Error('unknown meditation type: ' + type);
  const minutes = lengths.indexOf(options.minutes) !== -1 ? options.minutes : lengths[0];
  const T = minutes * 60;
  const style = options.style || 'calm';
  let m;
  if (type === 'silent') {
    // Works anywhere, with the sound off: words on screen, then breathing, then words.
    m = base(type, minutes, style, { world: 'ocean', hapticBreathing: true });
    const body = breaths(PATTERNS.calm, T - 30);
    m.segments = [seg('intro', 15, { screenTextId: 'intro.silent' }), ...body.segments, seg('outro', 15 + body.left, { screenTextId: 'outro.silent' })];
  } else if (type === 'quick') {
    m = base(type, minutes, style, { world: 'forest', voiceEnabled: true, hapticBreathing: true });
    const body = breaths(PATTERNS.box, T - 10);
    m.segments = [seg('intro', 5, spoken('intro.quick')), ...body.segments, seg('outro', 5 + body.left, spoken('outro.quick'))];
  } else if (type === 'deep') {
    m = base(type, minutes, style, { world: 'ocean', backgroundSound: 'ocean', voiceEnabled: true, hapticBreathing: false });
    const [intro, outro] = [45, 40];
    const bodyTime = T - intro - outro;
    const scan = Math.round(bodyTime * 0.3);
    const silence = Math.round(bodyTime * 0.2);
    const first = breaths(PATTERNS.calm, Math.round(bodyTime * 0.3));
    const second = breaths(PATTERNS.calm, bodyTime - scan - silence - first.used);
    m.segments = [seg('intro', intro, spoken('intro.deep')), ...first.segments, seg('bodyScan', scan, spoken('bodyScan')),
      seg('silence', silence + second.left, { screenTextId: 'silence' }), ...second.segments, seg('outro', outro, spoken('outro.deep'))];
  } else {
    // Sleep: breaths that slow, a body scan, then a long quiet. The sound fades over the last
    // three minutes, the screen dims, and there is no completion screen: it just goes dark.
    m = base(type, minutes, style, { world: 'nightSky', backgroundSound: 'rain', voiceEnabled: true, hapticBreathing: false,
      dim: CONFIG.meditation.sleepDim, fadeOutSeconds: Math.min(CONFIG.meditation.sleepFadeSeconds, T / 2), completionScreen: false, voiceSoft: true });
    const intro = 40;
    const breathing = breathPlan([{ pattern: PATTERNS.sleep, maxSeconds: Math.round(T * 0.12), once: true }, { pattern: PATTERNS.sleep9, maxSeconds: Math.round(T * 0.12), once: true },
      { pattern: PATTERNS.sleep10, maxSeconds: Math.round(T * 0.12), once: true }], Math.round(T * 0.36));
    const scan = Math.round(T * 0.25);
    m.segments = [seg('intro', intro, spoken('intro.sleep')), ...breathing.segments, seg('bodyScan', scan, spoken('bodyScan.sleep')),
      seg('silence', T - intro - breathing.used - scan, { screenTextId: 'silence.sleep' })];
  }
  if (WORLDS.indexOf(options.world) !== -1) m.world = options.world;
  if (SOUNDS.indexOf(options.sound) !== -1) m.backgroundSound = options.sound;
  if (typeof options.voice === 'boolean') m.voiceEnabled = options.voice && type !== 'silent';
  if (typeof options.haptics === 'boolean') m.hapticBreathing = options.haptics;
  return enforce(m);
}

// Rules no option can change. Silent never has sound or voice.
export function enforce(meditation) {
  if (meditation.type === 'silent') { meditation.backgroundSound = 'none'; meditation.voiceEnabled = false; }
  meditation.totalSeconds = totalSeconds(meditation);
  return meditation;
}

// What may actually sound for this session, given the meditation and the person's switches.
// Silent is always { ambient: 'none', voice: false }, whatever the settings say.
export function audioPlan(meditation, switches = {}) {
  if (meditation.type === 'silent') return { ambient: 'none', voice: false };
  const soundOn = switches.sound !== false;
  return {
    ambient: soundOn && SOUNDS.indexOf(meditation.backgroundSound) > 0 ? meditation.backgroundSound : 'none',
    voice: soundOn && switches.voice !== false && Boolean(meditation.voiceEnabled),
  };
}

// Recorded voice clips are named assets/voice/<language>/<scriptId>_<style>.mp3.
export function voiceClipPath(scriptId, style, language) {
  return language + '/' + scriptId + '_' + style + '.mp3';
}
// A recording if the build found one, else the phone's own text-to-speech, else nothing.
export function resolveVoice(scriptId, style, language, manifest, canSpeak) {
  const path = voiceClipPath(scriptId, style, language);
  if (manifest && Array.isArray(manifest.voice) && manifest.voice.indexOf(path) !== -1) return { kind: 'clip', path: 'voice/' + path };
  return canSpeak ? { kind: 'tts' } : { kind: 'none' };
}

// A session counts as a meditation once 60% of it was done.
export function countsAsComplete(completedSeconds, total, fraction = CONFIG.meditation.completeFraction) {
  return total > 0 && completedSeconds / total >= fraction;
}
export function sessionRecord({ meditation, startedAt, completedSeconds, moodAfter }) {
  const done = Math.max(0, Math.min(meditation.totalSeconds, Math.round(completedSeconds)));
  const record = {
    id: startedAt + '-' + meditation.id, meditationId: meditation.id, type: meditation.type, startedAt,
    totalSeconds: meditation.totalSeconds, completedSeconds: done, completed: countsAsComplete(done, meditation.totalSeconds),
  };
  if (moodAfter) record.moodAfter = moodAfter;
  return record;
}
export function minutesMeditated(sessions) {
  return Math.round((sessions || []).reduce((sum, s) => sum + (s.completedSeconds || 0), 0) / 60);
}

// The haptic breath: discrete, spaced pulses, never a continuous buzz. Inhale strengthens toward
// its end, exhale fades and ends on one soft tap, a hold is one very light tick.
// Returns [{ at: ms from the start of the phase, strength: 0 to 1 }].
export function breathPulses(phase, seconds, gapMs = CONFIG.haptics.breathPulseGapMs) {
  if (phase === 'holdIn' || phase === 'holdOut') return seconds > 0 ? [{ at: 0, strength: 0.15 }] : [];
  const count = Math.max(2, Math.floor((seconds * 1000) / gapMs));
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const p = count === 1 ? 1 : i / (count - 1);
    out.push({ at: Math.round(i * gapMs), strength: phase === 'inhale' ? 0.25 + 0.75 * p : 1 - 0.75 * p });
  }
  if (phase === 'exhale') out.push({ at: Math.round(seconds * 1000) - 60, strength: 0.2 });
  return out.filter((pulse) => pulse.at >= 0 && pulse.at < seconds * 1000);
}

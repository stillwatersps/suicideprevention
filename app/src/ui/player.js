// The meditation player. One timeline owns the clock; five layers listen to it and know nothing
// of each other: the world, the breathing guide, the voice, the ambient sound, and haptics.
// The tab bar steps aside for the session. The crisis strip stays on screen the whole time, the
// stage carries its own "Get Support Now" and "Draft for review", and the rest of the safety
// frame is still in the page below.
import { CONFIG } from '../core/config.js';
import { createTimeline } from '../logic/timeline.js';
import { audioPlan, sessionRecord, breathPulses, minutesMeditated } from '../logic/meditations.js';
import { t, lang } from './words.js';
import { state, replace, reducedMotion } from './state.js';
import { choiceGroup } from './components.js';
import { haptic, breathHaptic } from './haptics.js';
import { createWorld } from './worlds.js';
import { createAudio } from './audio.js';
import { keepAwake } from './device.js';
import { celebrate } from './celebrate.js';
import { drawFaces, isLowMood } from './checkin.js';
import { devLog } from '../core/dev.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
const hooks = () => (typeof window !== 'undefined' && window.__tidelight) || {};
let shellRef = null;
let ctx = null;
let session = null; // everything about the session that is playing
let faces = null;

// A monotonic clock. Tests may speed it up; a phone never does.
function clock() {
  const rate = Number(hooks().clockRate) || 1;
  const origin = performance.now();
  return () => origin + (performance.now() - origin) * rate;
}
const manifest = () => { try { return JSON.parse($('.tl-words').getAttribute('data-audio') || '{}'); } catch (e) { return {}; } };
const assetBase = () => (lang() === 'es' ? '../../assets/' : '../assets/');

// ---- Layer: the breathing guide. A circle that grows on the inhale, holds, and shrinks.
function guideLayer(meditation, switches) {
  const box = $('#tl-guide');
  const circle = $('.tl-guide-circle', box);
  const word = $('#tl-guide-word');
  const count = $('#tl-guide-count');
  let cyclesSeen = 0;
  return (s, changed) => {
    const breathing = Boolean(s.phase);
    box.classList.toggle('is-resting', !breathing);
    circle.style.transform = 'scale(' + (0.55 + 0.45 * (breathing ? s.breath : 0.5 + 0.1 * Math.sin(s.elapsed / 3))).toFixed(3) + ')';
    if (changed.pattern) cyclesSeen = 0; // a new pattern brings the words back
    if (changed.phase && breathing) {
      if (s.phase === 'inhale') cyclesSeen += 1;
      const key = s.phase === 'inhale' ? 'guide.in' : s.phase === 'exhale' ? 'guide.out' : 'guide.hold';
      word.textContent = t(key, null, meditation.style);
    }
    // After the first few breaths the words fade, so the person can just follow the circle.
    const faded = !breathing || cyclesSeen > CONFIG.meditation.guideTextCycles;
    word.classList.toggle('is-faded', faded);
    count.hidden = !switches.countdown || !breathing;
    if (!count.hidden) count.textContent = String(Math.max(1, Math.ceil(s.phaseRemaining)));
  };
}

// ---- Layer: words on screen and the voice. One line per segment.
function voiceLayer(meditation, switches, audio) {
  const line = $('#tl-screen-text');
  return (s, changed) => {
    if (!changed.segment || !s.segment || s.done) return;
    const screenText = s.segment.screenTextId ? t('screen.' + s.segment.screenTextId, null, meditation.style) : '';
    line.textContent = screenText;
    line.classList.toggle('is-on', Boolean(screenText));
    const plan = audioPlan(meditation, switches);
    if (s.segment.voiceScriptId && plan.voice) {
      audio().speak(s.segment.voiceScriptId, t('script.' + s.segment.voiceScriptId, null, meditation.style), meditation.style, Boolean(meditation.voiceSoft));
    }
  };
}

// ---- Layer: haptic breathing. Spaced pulses, set when a phase begins, cleared on pause.
function hapticLayer(switches) {
  let timers = [];
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const layer = (s, changed) => {
    if (!changed.phase) return;
    clear();
    if (!switches.haptics || !s.phase || !session || !session.timeline.playing()) return;
    const rate = Number(hooks().clockRate) || 1;
    breathPulses(s.phase, s.phaseSeconds).forEach((pulse) => {
      timers.push(setTimeout(() => { if (session && session.timeline.playing() && switches.haptics) breathHaptic(pulse.strength); }, pulse.at / rate));
    });
  };
  layer.clear = clear;
  return layer;
}

function showControls(on) {
  const controls = $('#tl-controls');
  controls.hidden = !on;
  clearTimeout(showControls.timer);
  if (on && session && session.timeline.playing() && $('#tl-end-confirm').hidden) {
    showControls.timer = setTimeout(() => { if (!controls.contains(document.activeElement) || !document.activeElement.matches(':focus-visible')) controls.hidden = true; }, CONFIG.meditation.controlsVisibleMs);
  }
}
function renderToggles() {
  const s = session.switches;
  const plan = audioPlan(session.meditation, s);
  const silent = session.meditation.type === 'silent';
  const set = (id, on, disabled) => { const b = $(id); b.setAttribute('aria-pressed', String(Boolean(on))); b.disabled = Boolean(disabled); };
  set('#tl-toggle-sound', s.sound && !silent, silent);
  set('#tl-toggle-voice', plan.voice, silent || !session.meditation.voiceEnabled);
  set('#tl-toggle-haptics', s.haptics, false);
  $('#tl-player-pause-label').textContent = t(session.timeline.playing() ? 'player.pause' : 'player.resume');
  $('#tl-player-pause').setAttribute('data-state', session.timeline.playing() ? 'playing' : 'paused');
}

function loop() {
  if (!session) return;
  session.timeline.tick();
  if (session && !session.over) session.frame = requestAnimationFrame(loop);
}

async function applySound() {
  const plan = audioPlan(session.meditation, session.switches);
  if (plan.ambient === 'none') { if (session.audio) session.audio.stopAmbient(0.4); session.ambientOn = false; return; }
  if (!session.ambientOn) { session.ambientOn = true; await session.getAudio().startAmbient(plan.ambient); }
}

// Starts a session. `meditation` is data from logic/meditations.js or logic/generate.js.
export async function playMeditation(meditation, source) {
  if (session) await endSession(false);
  const stage = $('#tl-stage');
  const reduced = reducedMotion();
  const prefs = state.settings.meditation;
  const switches = { sound: true, voice: prefs.voice !== false, haptics: Boolean(meditation.hapticBreathing), countdown: Boolean(prefs.countdown) };
  session = {
    meditation, source: source || null, switches, over: false, startedAt: new Date().toISOString(), audio: null, ambientOn: false, fading: false,
    getAudio() { if (!session.audio) { session.audio = createAudio({ manifest: manifest(), assetBase: assetBase(), language: lang() }); session.audio.setVolume(prefs.ambientVolume); } return session.audio; },
  };
  session.timeline = createTimeline(meditation, clock());
  if (hooks().onSession) hooks().onSession({ id: meditation.id, type: meditation.type, total: meditation.totalSeconds });
  renderToggles();
  $('#tl-complete').hidden = true;
  stage.hidden = false;
  $('#tl-end-confirm').hidden = true;
  $('#tl-screen-text').textContent = '';
  $('#tl-guide-word').textContent = '';
  stage.setAttribute('data-world', meditation.world);
  shellRef.setFull(true);
  shellRef.push('player');
  stage.scrollIntoView({ block: 'start' });

  const world = createWorld($('#tl-world'), meditation.world, { reduced });
  session.world = world;
  const haptics = hapticLayer(switches);
  session.haptics = haptics;
  const layers = [
    (s) => {
      // Sleep dims the screen, and the last minute fades to dark.
      const remaining = s.total - s.elapsed;
      const closing = meditation.completionScreen === false ? Math.max(0, 1 - remaining / 60) : 0;
      world.draw(s.breath, s.elapsed, Math.max(meditation.dim || 0, closing * 0.95));
      $('#tl-player-bar').style.transform = 'scaleX(' + s.totalProgress.toFixed(4) + ')';
    },
    guideLayer(meditation, switches),
    voiceLayer(meditation, switches, session.getAudio),
    haptics,
    (s) => {
      // The ambient sound fades out toward the end (three minutes for Sleep).
      const remaining = s.total - s.elapsed;
      if (session && session.audio && session.ambientOn && !session.fading && remaining <= meditation.fadeOutSeconds) {
        session.fading = true;
        session.audio.fadeOutAmbient(remaining / (Number(hooks().clockRate) || 1));
      }
    },
    (s, changed) => { if (changed.finished) finish(); },
  ];
  layers.forEach((layer) => session.timeline.subscribe(layer));

  await keepAwake(true);
  await applySound();
  session.timeline.start();
  renderToggles();
  showControls(false);
  session.frame = requestAnimationFrame(loop);
  // When frames stop (the screen locked, another app in front), keep time once a second.
  session.heartbeat = setInterval(() => { if (session && document.visibilityState !== 'visible') session.timeline.tick(); }, 1000);
}

async function record(completedSeconds, moodAfter) {
  const entry = sessionRecord({ meditation: session.meditation, startedAt: session.startedAt, completedSeconds, moodAfter });
  const sessions = [entry].concat(state.sessions.filter((s) => s.id !== entry.id)).slice(0, CONFIG.meditation.maxSessionsKept);
  await replace('sessions', sessions);
  return entry;
}

function stopLayers() {
  cancelAnimationFrame(session.frame);
  clearInterval(session.heartbeat);
  session.over = true;
  session.haptics.clear();
  if (session.audio) session.audio.close();
  keepAwake(false);
}

// The timeline reached its end.
async function finish() {
  if (!session || session.over) return;
  stopLayers();
  const entry = await record(session.meditation.totalSeconds);
  if (entry.completed && !session.counted) { session.counted = true; await ctx.onMeditationDone(entry); }
  if (session.meditation.completionScreen === false) {
    // Sleep: no completion screen. The stage stays dark; a tap brings the controls to leave.
    $('#tl-stage').classList.add('is-dark');
    $('#tl-screen-text').textContent = '';
    return;
  }
  showCompletion(entry);
}

function showCompletion(entry) {
  const quiet = ctx.isQuiet();
  $('#tl-stage').hidden = true;
  const box = $('#tl-complete');
  box.hidden = false;
  $('#tl-complete-support').hidden = true;
  $('#tl-complete-body').hidden = false;
  faces.set([]);
  const minutes = Math.max(1, Math.round(entry.completedSeconds / 60));
  $('#tl-complete-minutes').textContent = t(minutes === 1 ? 'player.minute' : 'player.minutes', { minutes });
  $('#tl-complete-total').textContent = t('player.total', { minutes: minutesMeditated(state.sessions) });
  $('#tl-complete-favorite').hidden = !session.source || Boolean(session.source.presetId);
  $('#tl-complete-favorite').disabled = false;
  window.scrollTo(0, 0);
  $('#tl-complete-title').focus({ preventScroll: true });
  if (!quiet) { haptic('success'); celebrate(); }
}

// Ending early (after "End session?"), or leaving the player any other way.
async function endSession(showResult) {
  if (!session) return;
  const done = session.timeline.elapsed();
  const finished = session.over;
  if (!finished) {
    session.timeline.pause();
    stopLayers();
    const entry = await record(done);
    if (entry.completed && !session.counted) { session.counted = true; await ctx.onMeditationDone(entry); }
    if (showResult && entry.completed && session.meditation.completionScreen !== false) { showCompletion(entry); return; }
  }
  close();
}
function close() {
  $('#tl-stage').classList.remove('is-dark');
  session = null;
  shellRef.setFull(false);
  shellRef.go('meditate');
  shellRef.go('meditate');
  if (ctx.onPlayerClosed) ctx.onPlayerClosed();
}

export function initPlayer(shell, context) {
  shellRef = shell;
  ctx = context;
  const stage = $('#tl-stage');
  if (!stage) return;
  drawFaces($('#tl-complete'));

  // Tap anywhere on the stage: the controls show for three seconds.
  stage.addEventListener('click', (event) => {
    if (event.target.closest('#tl-controls, .tl-player-top')) return;
    showControls($('#tl-controls').hidden);
  });
  $('#tl-player-pause').addEventListener('click', () => {
    if (!session || session.over) return;
    haptic('tap');
    if (session.timeline.playing()) { session.timeline.pause(); session.haptics.clear(); if (session.audio) session.audio.pause(); keepAwake(false); } else { session.timeline.resume(); if (session.audio) session.audio.resume(); keepAwake(true); }
    renderToggles();
    showControls(true);
  });
  $('#tl-player-end').addEventListener('click', () => {
    if (session && session.over) { close(); return; }
    haptic('warning');
    $('#tl-end-confirm').hidden = false;
    showControls(true);
    $('#tl-end-yes').focus();
  });
  $('#tl-end-no').addEventListener('click', () => { $('#tl-end-confirm').hidden = true; showControls(true); });
  $('#tl-end-yes').addEventListener('click', () => endSession(true));
  // Each layer has its own switch, and each works in the middle of a session.
  const toggles = { '#tl-toggle-sound': 'sound', '#tl-toggle-voice': 'voice', '#tl-toggle-haptics': 'haptics' };
  Object.keys(toggles).forEach((id) => $(id).addEventListener('click', async () => {
    if (!session) return;
    const name = toggles[id];
    session.switches[name] = !session.switches[name];
    haptic('toggle');
    if (name === 'haptics' && !session.switches.haptics) session.haptics.clear();
    if (name !== 'haptics') {
      if (!audioPlan(session.meditation, session.switches).voice && session.audio) session.audio.stopVoice();
      await applySound().catch((e) => devLog('sound switch', e));
    }
    renderToggles();
    showControls(true);
  }));
  // "Get Support Now" on the stage: pause, then go to the 988 panel in the page below.
  $('.tl-player-support').addEventListener('click', () => {
    if (session && !session.over && session.timeline.playing()) { session.timeline.pause(); session.haptics.clear(); if (session.audio) session.audio.pause(); renderToggles(); }
  });

  // The completion screen.
  faces = choiceGroup($('#tl-complete-faces'), {
    onChange: async (value) => {
      const mood = Number(value);
      if (session) await record(session.meditation.totalSeconds, mood);
      // A very low mood after a session: support options at once, no celebration.
      const low = isLowMood(mood);
      $('#tl-complete-support').hidden = !low;
      $('#tl-complete-body').hidden = low;
      if (low) { ctx.goQuiet(); $('#tl-complete-support').focus({ preventScroll: true }); }
    },
  });
  $$('[data-player-done]').forEach((button) => button.addEventListener('click', close));
  $('#tl-complete-favorite').addEventListener('click', async () => {
    if (!session || !session.source) return;
    await ctx.saveFavorite(session.source);
    $('#tl-complete-favorite').disabled = true;
    haptic('success');
  });

  // Back from the background: the page's clock may have stood still. Add the time it missed.
  let hiddenAt = null;
  document.addEventListener('visibilitychange', () => {
    if (!session || session.over) return;
    if (document.visibilityState === 'hidden') { hiddenAt = { wall: Date.now(), perf: performance.now() }; return; }
    if (hiddenAt) {
      const missed = (Date.now() - hiddenAt.wall) - (performance.now() - hiddenAt.perf);
      if (missed > 50) session.timeline.addMissed(missed * (Number(hooks().clockRate) || 1));
      hiddenAt = null;
    }
    session.timeline.tick();
  });
  window.addEventListener('resize', () => { if (session && session.world) session.world.resize(); });
  // Leaving the player some other way (a tab from the keyboard, a link) ends the session cleanly.
  shell.onHide('player', () => { if (session) { const s = session; if (!s.over) endSession(false); else { session = null; shell.setFull(false); } } });
}


// Sound for a meditation: the ambient layer and the voice layer. Nothing is made here unless a
// session asks for it, so a Silent session, or one with sound off, never opens the audio system.
// - Ambient: white and brown noise are made in code. Rain and ocean are made-in-code stand-ins
//   until a founder adds real loops (assets/ambient/rain.mp3, ocean.mp3). Every loop is blended
//   across its join, so there is no gap. It fades in, fades out, and dips while the voice speaks.
// - Voice: a recording when the build found one, else the phone's own text-to-speech, slow and
//   calm. With neither, the words still show on screen.
// The phone's ring/silent switch is respected by the phone itself: nothing here overrides it.
import { CONFIG } from '../core/config.js';
import { resolveVoice } from '../logic/meditations.js';
import { devLog } from '../core/dev.js';

const hooks = () => (typeof window !== 'undefined' && window.__tidelight) || {};
const LOOP_SECONDS = 6;
const BLEND_SECONDS = 0.6;

// Blends the end of a loop into its start, so the join can't be heard.
export function blendLoop(data, blend) {
  const usable = data.length - blend;
  for (let i = 0; i < blend; i += 1) {
    const t = i / blend;
    data[i] = data[i] * t + data[usable + i] * (1 - t);
  }
  return usable;
}
function noise(kind, data) {
  let last = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (kind === 'whiteNoise' || kind === 'rain') { data[i] = white * 0.35; continue; }
    last = (last + 0.02 * white) / 1.02; // brown: each sample leans on the last
    data[i] = last * 3.2;
  }
}

export function createAudio({ manifest, assetBase, language }) {
  let context = null;
  let ambientGain = null;
  let duckGain = null;
  let source = null;
  let clip = null;
  let volume = CONFIG.meditation.ambientVolume;
  const Ctx = window.AudioContext || window.webkitAudioContext;

  function open() {
    if (context || !Ctx) return context;
    context = new Ctx();
    ambientGain = context.createGain();
    duckGain = context.createGain();
    ambientGain.gain.value = 0;
    ambientGain.connect(duckGain);
    duckGain.connect(context.destination);
    return context;
  }
  async function loopBuffer(kind) {
    const file = manifest && Array.isArray(manifest.ambient) && manifest.ambient.find((name) => name.replace(/\.[a-z0-9]+$/, '') === kind);
    if (file) {
      try {
        const bytes = await (await fetch(assetBase + 'ambient/' + file)).arrayBuffer();
        const decoded = await context.decodeAudioData(bytes);
        const blend = Math.floor(BLEND_SECONDS * decoded.sampleRate);
        let usable = decoded.length;
        for (let c = 0; c < decoded.numberOfChannels; c += 1) usable = blendLoop(decoded.getChannelData(c), blend);
        return { buffer: decoded, loopEnd: usable / decoded.sampleRate };
      } catch (e) { devLog('ambient file ' + file, e); }
    }
    const rate = context.sampleRate;
    const buffer = context.createBuffer(1, Math.floor(LOOP_SECONDS * rate), rate);
    const data = buffer.getChannelData(0);
    noise(kind, data);
    return { buffer, loopEnd: blendLoop(data, Math.floor(BLEND_SECONDS * rate)) / rate };
  }

  const api = {
    opened: () => Boolean(context),
    setVolume(v) { volume = Math.max(0, Math.min(1, v)); if (ambientGain && source) ambientGain.gain.setTargetAtTime(volume, context.currentTime, 0.1); },
    // Starts the ambient loop and fades it in.
    async startAmbient(kind, fadeSeconds = CONFIG.meditation.ambientFadeInSeconds) {
      api.stopAmbient(0);
      if (!kind || kind === 'none' || !open()) return false;
      if (hooks().onAmbient) hooks().onAmbient(kind);
      try {
        if (context.state === 'suspended') await context.resume();
        const { buffer, loopEnd } = await loopBuffer(kind);
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.loopEnd = loopEnd;
        let node = source;
        const filter = (type, frequency) => { const f = context.createBiquadFilter(); f.type = type; f.frequency.value = frequency; node.connect(f); node = f; };
        if (kind === 'rain') { filter('highpass', 900); filter('lowpass', 7000); }
        if (kind === 'ocean') {
          filter('lowpass', 520);
          const swell = context.createGain();
          const lfo = context.createOscillator();
          const depth = context.createGain();
          lfo.frequency.value = 0.11; // one slow wave about every nine seconds
          depth.gain.value = 0.45;
          swell.gain.value = 0.55;
          lfo.connect(depth); depth.connect(swell.gain); lfo.start();
          node.connect(swell); node = swell;
        }
        node.connect(ambientGain);
        const now = context.currentTime;
        ambientGain.gain.cancelScheduledValues(now);
        ambientGain.gain.setValueAtTime(0, now);
        ambientGain.gain.linearRampToValueAtTime(volume, now + fadeSeconds);
        source.start();
        return true;
      } catch (e) { devLog('ambient', e); return false; }
    },
    fadeOutAmbient(seconds = CONFIG.meditation.ambientFadeOutSeconds) {
      if (!context || !source) return;
      const now = context.currentTime;
      ambientGain.gain.cancelScheduledValues(now);
      ambientGain.gain.setValueAtTime(ambientGain.gain.value, now);
      ambientGain.gain.linearRampToValueAtTime(0, now + Math.max(0.05, seconds));
    },
    stopAmbient(fadeSeconds = 0.3) {
      if (!source) return;
      const old = source;
      source = null;
      api.fadeOutSource(old, fadeSeconds);
    },
    fadeOutSource(old, fadeSeconds) {
      try {
        const now = context.currentTime;
        ambientGain.gain.cancelScheduledValues(now);
        ambientGain.gain.setTargetAtTime(0, now, Math.max(0.01, fadeSeconds / 3));
        old.stop(now + fadeSeconds + 0.05);
      } catch (e) { /* already stopped */ }
    },
    pause() { if (context && context.state === 'running') context.suspend(); if (clip) clip.pause(); if (window.speechSynthesis) window.speechSynthesis.pause(); },
    resume() { if (context && context.state === 'suspended') context.resume(); if (clip) clip.play().catch(() => {}); if (window.speechSynthesis) window.speechSynthesis.resume(); },
    // The ambient sound dips while the voice speaks, and comes back after.
    duck(on) {
      if (!duckGain) return;
      duckGain.gain.setTargetAtTime(on ? CONFIG.meditation.duckTo : 1, context.currentTime, 0.25);
    },
    // Says one line: a recording if there is one, else text-to-speech. Returns which was used.
    speak(scriptId, text, style, soft) {
      api.stopVoice();
      const choice = resolveVoice(scriptId, style, language, manifest, Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance));
      if (hooks().onSpeak) hooks().onSpeak({ scriptId, text, kind: choice.kind });
      const done = () => api.duck(false);
      if (choice.kind === 'clip') {
        clip = new Audio(assetBase + choice.path);
        clip.volume = soft ? 0.5 : 0.9;
        clip.addEventListener('ended', done);
        clip.addEventListener('error', done);
        api.duck(true);
        clip.play().catch(done);
      } else if (choice.kind === 'tts' && text) {
        const line = new SpeechSynthesisUtterance(text);
        line.lang = language;
        line.rate = CONFIG.meditation.voiceRate;
        line.pitch = CONFIG.meditation.voicePitch;
        line.volume = soft ? 0.45 : 0.9;
        line.onend = done;
        line.onerror = done;
        api.duck(true);
        window.speechSynthesis.speak(line);
      }
      return choice.kind;
    },
    stopVoice() {
      if (clip) { clip.pause(); clip = null; }
      if (window.speechSynthesis && window.speechSynthesis.speaking) window.speechSynthesis.cancel();
      api.duck(false);
    },
    // A short listen to a sound, for the builder's chips.
    async preview(kind, ms = CONFIG.builder.soundPreviewMs) {
      const ok = await api.startAmbient(kind, 0.3);
      if (ok) setTimeout(() => api.stopAmbient(0.4), ms);
      return ok;
    },
    close() {
      api.stopVoice();
      api.stopAmbient(0.2);
      const old = context;
      context = null;
      if (old) setTimeout(() => old.close().catch(() => {}), 400);
    },
  };
  return api;
}

// The custom meditation builder and presets. One scrolling screen: a live preview, a length
// slider, a situation (which sets the breathing), sound, world, a few switches, and the style.
// A preset keeps the choices, not the finished meditation, so it is made fresh each time and
// picks up any improvement to the generator. Everything stays on this phone.
import { CONFIG } from '../core/config.js';
import { generateMeditation, cleanChoices, defaultChoices } from '../logic/generate.js';
import { phaseAt, breathLevel } from '../logic/timeline.js';
import { t } from './words.js';
import { state, replace, style, reducedMotion } from './state.js';
import { choiceGroup } from './components.js';
import { haptic } from './haptics.js';
import { createWorld } from './worlds.js';
import { createAudio } from './audio.js';
import { playMeditation } from './player.js';
import { startType } from './meditate.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
let shellRef = null;
let choices = defaultChoices();
let editing = null; // the preset being edited, if any
let groups = {};
const preview = { world: null, frame: 0, started: 0, pattern: null };
let previewAudio = null;

const labelsFor = (c) => ({ situation: t('situation.' + c.situation), world: t('world.' + c.world) });
const titleOf = (c) => t('builder.title', { minutes: c.lengthMinutes, situation: t('situation.' + c.situation), world: t('world.' + c.world) });
const newId = () => 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const STARTERS = () => [
  { id: 'starter-bus', name: t('preset.bus'), starter: true, choices: defaultChoices({ lengthMinutes: 5, situation: 'breathe', sound: 'none', voice: false, haptics: true, world: 'ocean', style: style() }) },
  { id: 'starter-bed', name: t('preset.bed'), starter: true, choices: defaultChoices({ lengthMinutes: 15, situation: 'sleep', sound: 'rain', voice: true, haptics: false, world: 'nightSky', bodyScan: true, style: style() }) },
];

function build(c, name) {
  const meditation = generateMeditation(c, labelsFor(c));
  meditation.title = name || titleOf(c);
  return meditation;
}

// ---- The live preview: the chosen world and the chosen breathing, on a loop, only while shown.
function drawPreview(now) {
  if ($('#tl-builder').hidden) { preview.frame = 0; return; }
  const seconds = (now - preview.started) / 1000;
  const p = preview.pattern ? phaseAt(preview.pattern, seconds) : { phase: 'inhale', phaseProgress: 0.5 };
  const level = reducedMotion() ? 0.6 : breathLevel(p.phase, p.phaseProgress);
  preview.world.draw(level, seconds, 0);
  $('#tl-builder-circle').style.transform = 'scale(' + (0.55 + 0.45 * level).toFixed(3) + ')';
  preview.frame = requestAnimationFrame(drawPreview);
}
function startPreview() {
  preview.world = createWorld($('#tl-builder-world'), choices.world, { reduced: reducedMotion() });
  preview.started = performance.now();
  if (!preview.frame) preview.frame = requestAnimationFrame(drawPreview);
}
function stopPreview() {
  cancelAnimationFrame(preview.frame);
  preview.frame = 0;
  if (previewAudio) { previewAudio.close(); previewAudio = null; }
}

function render() {
  const slider = $('#tl-builder-length');
  slider.value = String(choices.lengthMinutes);
  const out = $('#tl-builder-length-out');
  out.textContent = t('builder.minutes', { minutes: choices.lengthMinutes });
  out.style.left = (((choices.lengthMinutes - CONFIG.builder.minMinutes) / (CONFIG.builder.maxMinutes - CONFIG.builder.minMinutes)) * 100).toFixed(1) + '%';
  slider.setAttribute('aria-valuetext', out.textContent);
  groups.situation.set(choices.situation);
  groups.sound.set(choices.sound);
  groups.world.set(choices.world);
  groups.style.set(choices.style);
  $('#tl-builder-voice').checked = choices.voice;
  $('#tl-builder-haptics').checked = choices.haptics;
  const scanOk = choices.lengthMinutes >= CONFIG.builder.bodyScanFromMinutes;
  $('#tl-builder-scan-row').hidden = !scanOk; // a body scan only fits in 8 minutes or more
  $('#tl-builder-scan').checked = choices.bodyScan && scanOk;
  const first = build(choices).segments.find((part) => part.kind === 'breathing');
  preview.pattern = first ? first.breathingPattern : null;
  $('#tl-builder-summary').textContent = t('builder.summary', { title: titleOf(choices), breaths: t('pattern.' + choices.situation) });
}
function set(change) {
  const worldChanged = change.world && change.world !== choices.world;
  const patternChanged = change.situation && change.situation !== choices.situation;
  choices = cleanChoices(Object.assign({}, choices, change));
  render();
  // The preview follows at once when the world or the situation changes.
  if (worldChanged) preview.world = createWorld($('#tl-builder-world'), choices.world, { reduced: reducedMotion() });
  if (patternChanged) preview.started = performance.now();
}

export function openBuilder(preset) {
  editing = preset && !preset.starter ? preset : null;
  const prefs = state.settings.meditation;
  choices = cleanChoices(preset ? preset.choices : { lengthMinutes: prefs.defaultMinutes, sound: prefs.defaultSound, voice: false, haptics: prefs.hapticBreathing !== false, style: style() });
  $('#tl-builder-name-box').hidden = true;
  $('#tl-builder-note').textContent = '';
  shellRef.push('builder');
  render();
}

// ---- Presets.
const list = () => state.presets;
const full = () => list().length >= CONFIG.builder.presetMax;
async function savePreset(name) {
  const clean = name.trim().slice(0, CONFIG.builder.presetNameMax) || titleOf(choices).slice(0, CONFIG.builder.presetNameMax);
  if (editing) {
    await replace('presets', list().map((p) => (p.id === editing.id ? Object.assign({}, p, { name: clean, choices: Object.assign({}, choices) }) : p)));
  } else {
    if (full()) return false;
    await replace('presets', list().concat([{ id: newId(), name: clean, choices: Object.assign({}, choices) }]));
  }
  return true;
}
function startPreset(preset) {
  if (preset.builtIn) return startType(preset.builtIn.type, { minutes: preset.builtIn.minutes, world: preset.builtIn.world, sound: preset.builtIn.sound });
  const c = cleanChoices(preset.choices);
  return playMeditation(build(c, preset.name), { key: 'preset-' + preset.id, name: preset.name, presetId: preset.id });
}
function detail(preset) {
  if (preset.builtIn) return t('builder.minutes', { minutes: preset.builtIn.minutes });
  return titleOf(cleanChoices(preset.choices));
}

export function renderPresets() {
  const box = $('#tl-presets-list');
  if (!box) return;
  const template = $('#tl-preset-template');
  const shown = list().length ? list() : (state.onboarding.startersHidden ? [] : STARTERS());
  box.textContent = '';
  shown.forEach((preset) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const is = (name) => $('[data-preset="' + name + '"]', item);
    $('.tl-preset-name', item).textContent = preset.name;
    $('.tl-preset-detail', item).textContent = detail(preset);
    $('.tl-preset-suggested', item).hidden = !preset.starter;
    is('keep').hidden = !preset.starter;
    is('more').hidden = Boolean(preset.starter);
    is('edit').hidden = Boolean(preset.builtIn);
    is('start').setAttribute('aria-label', t('preset.startLabel', { name: preset.name }));
    const more = $('.tl-preset-more', item);
    const input = $('.tl-preset-rename input', item);
    input.value = preset.name;
    const note = (key) => { $('#tl-presets-note').textContent = key ? t(key) : ''; };
    is('start').addEventListener('click', () => startPreset(preset));
    is('keep').addEventListener('click', async () => {
      if (full()) { note('preset.full'); return; }
      await replace('presets', list().concat([{ id: newId(), name: preset.name, choices: preset.choices }]));
      haptic('success');
      renderPresets();
    });
    is('more').addEventListener('click', () => { more.hidden = !more.hidden; is('more').setAttribute('aria-expanded', String(!more.hidden)); });
    is('rename').addEventListener('click', async () => {
      const name = input.value.trim().slice(0, CONFIG.builder.presetNameMax);
      if (!name) { input.focus(); return; }
      await replace('presets', list().map((p) => (p.id === preset.id ? Object.assign({}, p, { name }) : p)));
      renderPresets();
    });
    is('edit').addEventListener('click', () => openBuilder(preset));
    is('duplicate').addEventListener('click', async () => {
      if (full()) { note('preset.full'); return; }
      const copy = Object.assign({}, preset, { id: newId(), name: t('preset.copy', { name: preset.name }).slice(0, CONFIG.builder.presetNameMax) });
      await replace('presets', list().concat([copy]));
      renderPresets();
    });
    is('delete').addEventListener('click', () => { haptic('warning'); $('.tl-preset-confirm', item).hidden = false; is('delete-yes').focus(); });
    is('delete-no').addEventListener('click', () => { $('.tl-preset-confirm', item).hidden = true; });
    is('delete-yes').addEventListener('click', async () => {
      await replace('presets', list().filter((p) => p.id !== preset.id));
      renderPresets();
    });
    box.appendChild(item);
  });
  $('#tl-presets-empty').hidden = shown.length > 0;
}

export function initBuilder(shell) {
  shellRef = shell;
  if (!$('#tl-builder')) return;
  groups = {
    situation: choiceGroup($('#tl-builder-situation'), { onChange: (value) => set({ situation: value }) }),
    world: choiceGroup($('#tl-builder-worlds'), { onChange: (value) => set({ world: value }) }),
    style: choiceGroup($('#tl-builder-style'), { onChange: (value) => set({ style: value }) }),
    // Tapping a sound plays three seconds of it.
    sound: choiceGroup($('#tl-builder-sound'), { onChange: (value) => {
      set({ sound: value });
      if (previewAudio) previewAudio.close();
      previewAudio = null;
      if (value !== 'none') {
        let manifest = {};
        try { manifest = JSON.parse($('.tl-words').getAttribute('data-audio') || '{}'); } catch (e) { manifest = {}; }
        previewAudio = createAudio({ manifest, assetBase: document.documentElement.lang === 'es' ? '../../assets/' : '../assets/', language: document.documentElement.lang });
        previewAudio.setVolume(state.settings.meditation.ambientVolume);
        previewAudio.preview(value);
      }
    } }),
  };
  // The length slider: whole minutes, a tick for each, a stronger one every five.
  const slider = $('#tl-builder-length');
  slider.min = String(CONFIG.builder.minMinutes);
  slider.max = String(CONFIG.builder.maxMinutes);
  slider.addEventListener('input', () => {
    const minutes = Number(slider.value);
    if (minutes === choices.lengthMinutes) return;
    haptic(minutes % CONFIG.builder.strongTickEvery === 0 ? 'sliderTickStrong' : 'sliderTick');
    set({ lengthMinutes: minutes });
  });
  const switches = { '#tl-builder-voice': 'voice', '#tl-builder-haptics': 'haptics', '#tl-builder-scan': 'bodyScan' };
  Object.keys(switches).forEach((sel) => $(sel).addEventListener('change', (e) => { haptic('toggle'); set({ [switches[sel]]: e.target.checked }); }));

  $('#tl-builder-start').addEventListener('click', () => {
    stopPreview();
    playMeditation(build(choices, editing ? editing.name : ''), { key: 'custom-' + JSON.stringify(choices), name: editing ? editing.name : titleOf(choices), choices: Object.assign({}, choices), presetId: editing ? editing.id : null });
  });
  // Save preset: the name field opens with a suggestion already in it.
  $('#tl-builder-save').addEventListener('click', () => {
    const note = $('#tl-builder-note');
    if (!editing && full()) { note.textContent = t('preset.full'); return; }
    note.textContent = '';
    $('#tl-builder-name-box').hidden = false;
    const input = $('#tl-builder-name');
    input.maxLength = CONFIG.builder.presetNameMax;
    input.value = (editing ? editing.name : titleOf(choices)).slice(0, CONFIG.builder.presetNameMax);
    input.focus();
    input.select();
  });
  $('#tl-builder-name-cancel').addEventListener('click', () => { $('#tl-builder-name-box').hidden = true; });
  $('#tl-builder-name-save').addEventListener('click', async () => {
    const ok = await savePreset($('#tl-builder-name').value);
    $('#tl-builder-name-box').hidden = true;
    $('#tl-builder-note').textContent = t(ok ? 'preset.saved' : 'preset.full');
    if (ok) haptic('success');
    renderPresets();
  });
  $('#tl-build-card').addEventListener('click', () => openBuilder(null));

  // Small still pictures of each world on its card.
  $$('.tl-thumb').forEach((canvas) => { const world = createWorld(canvas, canvas.getAttribute('data-world'), { reduced: true }); for (let i = 0; i < 40; i += 1) world.draw(0.7, 3, 0); });
  shell.onShow('builder', () => { render(); startPreview(); });
  shell.onHide('builder', stopPreview);
  shell.onShow('meditate', renderPresets);
  renderPresets();
}

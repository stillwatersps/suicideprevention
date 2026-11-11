// The quick check-in: (Calm only) one breath, a mood, optional tags and a note, done. A very low
// mood shows crisis support options right away instead of the usual thanks, and never returns to
// Home by itself. Nothing typed here is read, scored, or sent anywhere.
import { CONFIG } from '../core/config.js';
import { t } from './words.js';
import { state, style, profile } from './state.js';
import { choiceGroup } from './components.js';
import { haptic } from './haptics.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
const SVG = 'http://www.w3.org/2000/svg';
// Mouth curves for the five faces, from very low to great. Shape carries the meaning, not color.
const MOUTHS = { 1: 'M9 17.500c2-2.500 4-2.500 6 0', 2: 'M9 16.500c2-1.200 4-1.200 6 0', 3: 'M9 16h6', 4: 'M9 15c2 1.800 4 1.800 6 0', 5: 'M8 14c2.500 3.500 5.500 3.500 8 0' };
let timers = [];
let faces = null;
let tags = null;
let shellRef = null;
let ctx = null;

export function drawFaces(scope) {
  $$('[data-tl-face]', scope).forEach((slot) => {
    if (slot.firstChild) return;
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'tl-icon tl-face-art');
    const path = document.createElementNS(SVG, 'path');
    path.setAttribute('d', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 10v.010M15 10v.010' + MOUTHS[slot.getAttribute('data-tl-face')]);
    svg.appendChild(path);
    slot.appendChild(svg);
  });
}

function step(name) {
  $$('.tl-flow-step', $('#tl-flow')).forEach((part) => { part.hidden = part.getAttribute('data-flow') !== name; });
}
function clearTimers() { timers.forEach(clearTimeout); timers = []; }
function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

function start() {
  clearTimers();
  faces.set([]);
  tags.set([]);
  $('#tl-flow-note').value = '';
  $('#tl-flow-more').hidden = true;
  $('#tl-flow-prompt').textContent = t('checkin.prompt', null, style());
  if (profile().breathBeforeCheckIn) {
    $('#tl-flow-breath-word').textContent = t('checkin.breath', null, style());
    step('breath');
    later(() => step('mood'), CONFIG.checkIn.breathSeconds * 1000);
  } else {
    step('mood');
  }
}

export const isLowMood = (mood) => Number(mood) <= CONFIG.checkIn.lowMoodMax;

async function finish() {
  const mood = Number(faces.get());
  if (!mood) return;
  const labels = tags.get().map((id) => t('tag.' + id));
  await ctx.addQuickCheckIn({ mood, moodLabel: t('mood.' + mood), tagIds: tags.get(), tags: labels, note: $('#tl-flow-note').value.trim().slice(0, CONFIG.checkIn.noteMaxLength) });
  if (isLowMood(mood)) {
    // Support comes first: no celebration, no streak, and the screen stays until the person leaves it.
    step('support');
    const box = $('#tl-flow-support');
    window.scrollTo(0, 0);
    box.focus({ preventScroll: true });
    return;
  }
  haptic('success');
  $('#tl-flow-thanks').textContent = t('checkin.done', null, style());
  step('done');
  later(() => { if (!$('#tl-flow').hidden) shellRef.go('home'); }, CONFIG.checkIn.doneReturnMs);
}

export function initCheckin(shell, context) {
  shellRef = shell;
  ctx = context;
  const flow = $('#tl-flow');
  if (!flow) return;
  drawFaces(flow);
  faces = choiceGroup($('#tl-flow-faces'), { onChange: () => { $('#tl-flow-more').hidden = false; } });
  tags = choiceGroup($('#tl-flow-tags'), { multiple: true });
  $('#tl-flow-skip').addEventListener('click', () => { clearTimers(); step('mood'); });
  $('#tl-flow-done').addEventListener('click', finish);
  shell.onShow('flow', start);
  shell.onHide('flow', clearTimers);

  // The five-question Daily check-in: a heavy feeling shows support at the top of its results.
  const support = $('#tl-result-support');
  window.addEventListener('tidelight-checkin', (event) => {
    const detail = event.detail || {};
    if (detail.kind !== 'daily' || !support) return;
    const heavy = CONFIG.checkIn.distressFeelings.indexOf(detail.feeling) !== -1;
    support.classList.toggle('ci-off', !heavy);
    if (heavy) { support.scrollIntoView({ block: 'start' }); support.focus({ preventScroll: true }); }
  });
  document.addEventListener('click', (event) => {
    if (support && event.target.closest('.ci-restart, [data-ci-start], .ci-erase-yes')) support.classList.add('ci-off');
  });
}

// Today's check-ins, on the Check-in tab.
export function renderToday(lines) {
  const list = $('#tl-today-list');
  if (!list) return;
  list.textContent = '';
  lines.forEach((line) => {
    const item = document.createElement('li');
    item.className = 'tl-sub';
    item.textContent = line;
    list.appendChild(item);
  });
  $('#tl-today-empty').hidden = lines.length > 0;
}

// Marks today as a day with a very low check-in: no celebrations for the rest of it.
export function quietForToday(dateKey) { state.quietToday = dateKey; }

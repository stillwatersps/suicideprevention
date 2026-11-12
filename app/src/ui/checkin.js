// The quick check-in: (Calm only) one breath, a mood, optional tags and a note, done. A very low
// mood shows crisis support options right away instead of the usual ending. Nothing typed here is read, scored, or sent anywhere.
import { CONFIG } from '../core/config.js';
import { t } from './words.js';
import { style, profile } from './state.js';
import { choiceGroup } from './components.js';
import { haptic } from './haptics.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
let timers = [];
let faces = null;
let tags = null;
let shellRef = null;
let ctx = null;

// The horizon above the check-in: light arrives as the person goes. It only ever grows; skipping
// a step never dims it. It is not a score.
let light = 0;
function arrive(level) {
  const bar = $('#tl-flow-horizon');
  if (!bar) return;
  light = Math.max(light, level);
  bar.style.setProperty('--h-light', String(0.2 + 0.7 * light));
  bar.style.setProperty('--h-width', (18 + 52 * light).toFixed(0) + '%');
}

function step(name) {
  $$('.tl-flow-step', $('#tl-flow')).forEach((part) => { part.hidden = part.getAttribute('data-flow') !== name; });
  // The horizon is for ordinary check-ins. On the support step there is no light and no decoration.
  $('#tl-flow-horizon').hidden = name === 'support';
}
function clearTimers() { timers.forEach(clearTimeout); timers = []; }
function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

function start() {
  clearTimers();
  light = 0;
  $('#tl-flow-horizon').classList.remove('tl-horizon-complete');
  arrive(0.1);
  faces.set([]);
  tags.set([]);
  $('#tl-flow-note').value = '';
  $('#tl-flow-more').hidden = true;
  $('#tl-flow-prompt').textContent = t('checkin.prompt', null, style());
  if (profile().breathBeforeCheckIn) {
    $('#tl-flow-breath-word').textContent = t('checkin.breath', null, style());
    step('breath');
    later(() => { step('mood'); arrive(0.3); }, CONFIG.checkIn.breathSeconds * 1000);
  } else {
    step('mood');
    arrive(0.3);
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
  // An ordinary check-in ends on the full dawn, one warm line, and a choice of two. Nothing is
  // scored and nothing bursts. (After a very low mood this is never reached: support came first.)
  haptic('success');
  $('#tl-flow-thanks').textContent = t('checkin.done', null, style());
  arrive(1);
  $('#tl-flow-horizon').classList.add('tl-horizon-complete');
  step('done');
  window.scrollTo(0, 0);
}

export function initCheckin(shell, context) {
  shellRef = shell;
  ctx = context;
  const flow = $('#tl-flow');
  if (!flow) return;
  faces = choiceGroup($('#tl-flow-faces'), { onChange: () => { $('#tl-flow-more').hidden = false; arrive(0.6); } });
  tags = choiceGroup($('#tl-flow-tags'), { multiple: true, onChange: () => arrive(0.75) });
  $('#tl-flow-skip').addEventListener('click', () => { clearTimers(); step('mood'); arrive(0.3); });
  $('#tl-flow-breathe').addEventListener('click', () => ctx.startReset());
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


// "Ten minutes at a time": five small steps, two minutes each, to get through the next ten
// minutes. Silent, and it keeps nothing. Call 988, Text 988, and Call 911 are on the screen the
// whole time (its last lines) as well as in the strip. At the end, or on Stop, it asks how things
// are; "Still hard" shows support at once and makes the day quiet, like a very low check-in.
// The clock's rules are in src/logic/ride.js. A draft: no licensed reviewer has seen it.
import { CONFIG } from '../core/config.js';
import { ridePosition, rideNext, rideClock } from '../logic/ride.js';
import { goQuiet } from './state.js';
import { t } from './words.js';
import { haptic } from './haptics.js';
import { keepAwake } from './device.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const config = CONFIG.ride;
const hooks = () => (typeof window !== 'undefined' && window.__tidelight) || {};
// A running ten minutes: seconds already counted, and when counting last (re)started.
let run = null;
let ticker = null;
let shown = -1;

const elapsed = () => (run ? run.before + ((Date.now() - run.since) / 1000) * (Number(hooks().clockRate) || 1) : 0);

function face(which) {
  $('#tl-ride-start-box').hidden = which !== 'start';
  $('#tl-ride-step-box').hidden = which !== 'step';
  $('#tl-ride-end-box').hidden = which !== 'end';
}

function stopClock() {
  clearInterval(ticker);
  ticker = null;
  run = null;
  shown = -1;
  keepAwake(false);
}

function finish(whole) {
  stopClock();
  face('end');
  $('#tl-ride-passed').hidden = !whole;
  $('#tl-ride-easier-whole').hidden = !whole; // stopped early, the app doesn't say ten minutes were got through
  $('#tl-ride-easier-note').hidden = true;
  $('#tl-ride-hard-note').hidden = true;
  $('#tl-ride-end-title').focus({ preventScroll: true });
}

function draw() {
  if (!run) return;
  const at = ridePosition(elapsed(), config);
  if (at.done) { finish(true); return; }
  $('#tl-ride-time').textContent = rideClock(at.left);
  if (at.step === shown) return;
  // A new step: its words, its place in the five, and one soft tap. The heading takes the focus
  // so a screen reader says it; the ticking clock is never read out.
  const first = shown === -1;
  shown = at.step;
  $('#tl-ride-count').textContent = t('ride.count', { step: at.step + 1, total: config.steps });
  $('#tl-ride-step').textContent = t('ride.step.' + (at.step + 1));
  $('#tl-ride-next').textContent = t(at.step + 1 === config.steps ? 'ride.finish' : 'ride.next');
  if (!first) haptic('select');
  $('#tl-ride-step').focus({ preventScroll: true });
}

export function initRide(shell) {
  const screen = $('#tl-ride');
  if (!screen) return;

  $('#tl-ride-start').addEventListener('click', () => {
    run = { before: 0, since: Date.now() };
    shown = -1;
    face('step');
    keepAwake(true);
    draw();
    ticker = setInterval(draw, 250);
  });
  $('#tl-ride-next').addEventListener('click', () => {
    if (!run) return;
    run = { before: rideNext(elapsed(), config), since: Date.now() };
    draw();
  });
  $('#tl-ride-stop').addEventListener('click', () => finish(false));
  $('#tl-ride-again').addEventListener('click', () => { face('start'); $('#tl-ride-start').focus(); });
  $('#tl-ride-easier').addEventListener('click', () => {
    $('#tl-ride-hard-note').hidden = true;
    $('#tl-ride-easier-note').hidden = false;
    $('#tl-ride-easier-note').focus({ preventScroll: true });
  });
  // Still hard: support at once. The crisis buttons are the screen's last lines; they are brought
  // into view, and the day is made quiet so nothing celebrates.
  $('#tl-ride-hard').addEventListener('click', () => {
    $('#tl-ride-easier-note').hidden = true;
    $('#tl-ride-hard-note').hidden = false;
    goQuiet();
    $('#tl-ride-hard-note').scrollIntoView({ block: 'start' });
    $('#tl-ride-hard-note').focus({ preventScroll: true });
  });

  // Leaving the screen ends the ten minutes; coming back starts from the beginning.
  shell.onShow('ride', () => { if (!run) face('start'); });
  if (shell.onHide) shell.onHide('ride', stopClock);
  document.addEventListener('tidelight-back-from-exit', () => { stopClock(); face('start'); });
  face('start');
}

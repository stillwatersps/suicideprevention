// The app lock: off until turned on in Settings. When it is on, the phone confirms who is holding
// it (Face ID, Touch ID, or the phone's own passcode) before the app shows anything saved.
// The lock covers the app's own screens only. The crisis strip, Quick exit, Get Support Now, the
// Support panel, the Spanish link, and the review notices are outside it and are never covered,
// and neither is the alert for a place the person chose. The app keeps no code of its own, so
// there is nothing to forget: if the phone has no passcode any more, the app opens.
import { t } from './words.js';
import { state, save } from './state.js';
import { Tidelight } from '../native.js';
import { devLog } from '../core/dev.js';
import { toTop } from './components.js';

const root = document.documentElement;
const $ = (sel) => document.querySelector(sel);
let asking = false;

async function status() {
  try { return await Tidelight.lockStatus(); } catch (e) { return { available: false, reason: 'unsupported', unlocked: true }; }
}
// Where the crisis strip ends while it is pinned to the top of the screen, in points; 0 when it
// has scrolled away (the largest text sizes).
function stripBottom() {
  const strip = document.querySelector('.crisis-bar');
  if (!strip) return 0;
  const box = strip.getBoundingClientRect();
  return box.top <= 1 && box.bottom > 0 ? Math.round(box.bottom) : 0;
}
// While the lock is on, the phone puts a plain cover over the app as it leaves the screen, for
// the app switcher, and keeps it until this page has its lock screen up again
// (TidelightPlugin.swift). The cover starts below the crisis strip, so the strip is never under it.
async function tellPhone(enabled) {
  try { await Tidelight.setLock({ enabled, top: stripBottom() }); } catch (e) { devLog('lock setting', e); }
}

// Coming back, the page tells the phone once it has drawn what it now shows (two frames on), and
// the phone lifts its cover only after that and after the app is fully in front again. Otherwise
// the screen the person left could show for a moment. Resolves when the cover is off, or after a
// short wait if the phone never answers, so the person is never left waiting.
function phoneCoverLifted() {
  const drawn = new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      try { Promise.resolve(Tidelight.lockDrawn()).then(resolve, (e) => { devLog('lock drawn', e); resolve(); }); } catch (e) { devLog('lock drawn', e); resolve(); }
    }));
  });
  return Promise.race([drawn, new Promise((resolve) => setTimeout(resolve, 2500))]);
}
// The app is back in front: cover it if it should be covered, let the phone lift its own cover,
// and only then ask the phone to confirm the person, so the lock screen and Get Support Now are
// on screen before the phone's question is.
async function cameBack() {
  let locked = false;
  try { locked = await checkLock({ prompt: false }); } catch (e) { devLog('lock check', e); }
  await phoneCoverLifted();
  if (locked && isLocked()) ask();
}

export const isLocked = () => root.classList.contains('tl-locked');

function cover() {
  const screen = $('#tl-lock');
  if (!screen || isLocked()) return;
  root.classList.add('tl-locked');
  screen.hidden = false;
  $('#tl-lock-note').hidden = true;
  toTop();
  screen.focus({ preventScroll: true });
}
function uncover() {
  const screen = $('#tl-lock');
  if (screen) screen.hidden = true;
  if (!isLocked()) return;
  root.classList.remove('tl-locked');
}

// Asks the phone once. A "no", or closing the phone's question, leaves the lock screen up with
// its Unlock button; nothing is counted and nothing is erased.
async function ask() {
  if (asking) return;
  asking = true;
  let open = false;
  try {
    const result = await Tidelight.unlock({ reason: t('lock.reason') });
    open = Boolean(result && (result.ok || result.available === false));
  } catch (e) { devLog('unlock', e); }
  asking = false;
  if (open) uncover(); else if (isLocked()) $('#tl-lock-note').hidden = false;
}

// Covers the app if the lock is on and the phone hasn't confirmed the person since the app was
// last in the background. True when the app is covered.
export async function checkLock({ prompt = true } = {}) {
  if (!state.settings.appLock || !state.onboarding.completed) { uncover(); return false; }
  const now = await status();
  if (!now.available || now.unlocked) { uncover(); return false; }
  cover();
  if (prompt) ask();
  return true;
}

export async function initLock() {
  if (!$('#tl-lock')) return false;
  $('#tl-lock-open').addEventListener('click', ask);
  document.addEventListener('visibilitychange', () => {
    // Leaving the app covers it at once, so the app switcher shows the lock screen.
    if (document.visibilityState === 'hidden') { if (state.settings.appLock && state.onboarding.completed && !asking) { cover(); tellPhone(true); } } else cameBack();
  });
  await tellPhone(Boolean(state.settings.appLock));
  return checkLock();
}

// Turning the lock on asks the phone first, so a lock that can't be opened is never set.
// Returns 'on', or why not: 'noPasscode', 'unsupported', 'failed'.
export async function turnLockOn() {
  const now = await status();
  if (!now.available) return now.reason === 'noPasscode' ? 'noPasscode' : 'unsupported';
  let ok = false;
  asking = true;
  try { ok = Boolean((await Tidelight.unlock({ reason: t('lock.reason') })).ok); } catch (e) { devLog('lock on', e); }
  asking = false;
  if (!ok) return 'failed';
  await save('settings', { appLock: true });
  await tellPhone(true);
  return 'on';
}
export async function turnLockOff() {
  await save('settings', { appLock: false });
  await tellPhone(false);
  uncover();
}

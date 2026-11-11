// The Settings screen: check-ins, notifications, meditation, feel, the home spot, and a hidden
// Developer section behind seven taps on the version. Every change is saved at once and applied.
import { CONFIG } from '../core/config.js';
import { effectiveTimes } from '../logic/spread.js';
import { devLines } from '../core/dev.js';
import { t } from './words.js';
import { state, save, clear } from './state.js';
import { stepper, choiceGroup, el } from './components.js';
import { haptic } from './haptics.js';
import { isNative, notificationPermission, requestNotificationPermission, requestLocationPermission, currentPosition, pendingNotifications } from './device.js';
import { syncReminders, sendTestReminder, reminderWords } from './reminders.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
let ctx = null;
let count = null;
let styleGroup = null;
let lengthGroup = null;
let soundGroup = null;
let versionTaps = 0;
const devActions = [];

// Other parts of the app add their own developer tools here (the streak, meditation).
export function addDevAction(fn) { devActions.push(fn); }

async function change(patch) {
  await save('settings', patch);
  await afterChange();
}
async function afterChange() {
  const result = await syncReminders(ctx.checkInsToday());
  renderSettings(result);
  if (ctx.onSettings) ctx.onSettings();
}

function renderTimesEditor() {
  const list = $('#tl-set-times');
  list.textContent = '';
  effectiveTimes(state.settings).forEach((time, i) => {
    const item = el('li', 'tl-field');
    const id = 'tl-set-time-' + i;
    const label = el('label', '', t('set.timeLabel', { number: i + 1 }));
    label.setAttribute('for', id);
    const input = el('input', 'tl-input');
    input.type = 'time';
    input.id = id;
    input.value = time;
    input.addEventListener('change', async () => {
      const all = Array.from(list.querySelectorAll('input')).map((box) => box.value);
      if (all.every((value) => /^\d\d:\d\d$/.test(value))) await change({ customTimes: all.slice().sort() });
    });
    item.append(label, input);
    list.appendChild(item);
  });
}

export function renderSettings(reminderResult) {
  const s = state.settings;
  if (!$('#tl-settings')) return;
  if (document.activeElement !== $('#tl-set-name')) $('#tl-set-name').value = state.profile.name || '';
  count.set(s.checkInsPerDay);
  $('#tl-set-wake').value = s.wakeTime;
  $('#tl-set-sleep').value = s.sleepTime;
  renderTimesEditor();
  styleGroup.set(s.checkInStyle);
  $('#tl-set-reminders').checked = Boolean(s.remindersOn);
  document.querySelectorAll('.tl-rem-sample').forEach((node) => { node.textContent = reminderWords().body; });
  $('#tl-set-rem-web').hidden = isNative() || !s.remindersOn || Boolean(reminderResult && reminderResult.set);
  $('#tl-set-rem-denied').hidden = !(reminderResult && reminderResult.blocked === 'denied');
  lengthGroup.set(String(s.meditation.defaultMinutes));
  soundGroup.set(s.meditation.defaultSound);
  $('#tl-set-voice').checked = Boolean(s.meditation.voice);
  $('#tl-set-haptic-breath').checked = Boolean(s.meditation.hapticBreathing);
  $('#tl-set-countdown').checked = Boolean(s.meditation.countdown);
  $('#tl-set-haptics').checked = Boolean(s.haptics);
  $('#tl-set-reduce').checked = Boolean(s.reduceMotion);
  $('#tl-set-streaks').checked = Boolean(s.streaksOn);
  const home = state.home ? t('set.homeSaved') : t('set.homeNone');
  $('#tl-set-home-state').textContent = home;
  $('#tl-set-home-clear').hidden = !state.home;
  const card = $('#tl-location-home-state');
  if (card) card.textContent = home;
}

async function renderDeveloper() {
  $('#tl-dev-phase').textContent = t('dev.phase', { phase: ($('.tl-words').getAttribute('data-phase') || '').trim() });
  const fill = (list, lines) => {
    list.textContent = '';
    (lines.length ? lines : [t('dev.none')]).forEach((line) => list.appendChild(el('li', 'tl-caption', line)));
  };
  const pending = await pendingNotifications();
  fill($('#tl-dev-pending'), pending.map((n) => '#' + n.id + '  ' + (n.at ? new Date(n.at).toLocaleString() : '')));
  fill($('#tl-dev-log'), devLines());
}

export function initSettings(shell, context) {
  ctx = context;
  if (!$('#tl-settings')) return;
  count = stepper($('#tl-set-count'), {
    min: CONFIG.checkIn.perDayMin, max: CONFIG.checkIn.perDayMax, value: state.settings.checkInsPerDay,
    onChange: (value) => change({ checkInsPerDay: value, countChosen: true, customTimes: null }),
  });
  styleGroup = choiceGroup($('#tl-set-style'), { onChange: (value) => change({ checkInStyle: value, styleChosen: true }) });
  lengthGroup = choiceGroup($('#tl-set-length'), { onChange: (value) => change({ meditation: { defaultMinutes: Number(value) } }) });
  soundGroup = choiceGroup($('#tl-set-sound'), { onChange: (value) => change({ meditation: { defaultSound: value } }) });
  $('#tl-set-wake').addEventListener('change', (e) => { if (e.target.value) change({ wakeTime: e.target.value, customTimes: null }); });
  $('#tl-set-sleep').addEventListener('change', (e) => { if (e.target.value) change({ sleepTime: e.target.value, customTimes: null }); });
  $('#tl-set-name').addEventListener('change', async (e) => { await save('profile', { name: e.target.value.trim() }); if (ctx.onSettings) ctx.onSettings(); });

  const toggles = {
    '#tl-set-voice': (on) => ({ meditation: { voice: on } }),
    '#tl-set-haptic-breath': (on) => ({ meditation: { hapticBreathing: on } }),
    '#tl-set-countdown': (on) => ({ meditation: { countdown: on } }),
    '#tl-set-haptics': (on) => ({ haptics: on }),
    '#tl-set-reduce': (on) => ({ reduceMotion: on }),
    '#tl-set-streaks': (on) => ({ streaksOn: on }),
  };
  Object.keys(toggles).forEach((sel) => $(sel).addEventListener('change', (e) => { haptic('toggle'); change(toggles[sel](e.target.checked)); }));

  // Reminders are opt-in: turning them on asks the phone, and a "no" turns the switch back off.
  $('#tl-set-reminders').addEventListener('change', async (e) => {
    haptic('toggle');
    if (e.target.checked) {
      let permission = await notificationPermission();
      if (permission === 'prompt') permission = await requestNotificationPermission();
      if (permission === 'denied') {
        await save('settings', { remindersOn: false });
        renderSettings({ blocked: 'denied' });
        return;
      }
    }
    await change({ remindersOn: e.target.checked });
  });
  $('#tl-set-test').addEventListener('click', async () => {
    await sendTestReminder();
    $('#tl-set-test-note').hidden = false;
  });

  $('#tl-set-home-save').addEventListener('click', async () => {
    const permission = await requestLocationPermission();
    const here = permission === 'granted' ? await currentPosition() : null;
    if (here) { await save('home', { latitude: here.latitude, longitude: here.longitude, savedAt: new Date().toISOString() }); haptic('success'); }
    renderSettings();
    if (!here) $('#tl-set-home-state').textContent = t(permission === 'denied' ? 'ob.locationDenied' : permission === 'unavailable' ? 'ob.locationUnavailable' : 'ob.homeFailed');
    if (ctx.onSettings) ctx.onSettings();
  });
  $('#tl-set-home-clear').addEventListener('click', async () => { haptic('warning'); await clear('home'); renderSettings(); if (ctx.onSettings) ctx.onSettings(); });

  // Seven taps on the version open the Developer section.
  $('#tl-version').addEventListener('click', () => {
    versionTaps += 1;
    if (versionTaps >= CONFIG.developer.tapsToUnlock) { $('#tl-developer').hidden = false; renderDeveloper(); }
  });
  $('#tl-dev-onboarding').addEventListener('click', async () => { await save('onboarding', { completed: false, setupCelebrated: false }); ctx.restartOnboarding(); });
  devActions.forEach((fn) => fn({ refresh: renderDeveloper }));

  shell.onShow('settings', async () => { renderSettings(await syncReminders(ctx.checkInsToday())); if (!$('#tl-developer').hidden) renderDeveloper(); });
  renderSettings();
}

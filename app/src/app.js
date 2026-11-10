// Tidelight phone app layer for the Daily check-in. Draft, not reviewed.
// Runs only in the app's copy of the page (app/www), never on the website.
// - Saves the check-in on this phone only (Capacitor Preferences; browser storage when tried in a
//   desktop browser). Nothing is ever sent to Tidelight.
// - Asks for a date of birth once, keeps only the age group, and forgets the date.
// - Shares one entry through the phone's own share sheet, only when the person taps Share.
// - Keeps a line per check-in (time of day, feeling, needs) on this phone, and shares a day's or
//   a week's lines the same way, only when the person taps Share.
// - Sets up to four daily reminders, shown by the phone itself, each off until turned on.
// Every word it shows is already in the page, from app/src/text/*.html.
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const STATE_KEY = 'tidelight.checkin.v1';
const GROUP_KEY = 'tidelight.agegroup.v1';
const TEXT_KEY = 'tidelight.textsize.v1';
const LOG_KEY = 'tidelight.log.v1';
const REM_KEY = 'tidelight.reminders.v1';
const GROUPS = ['child', 'teen', 'young', 'adult', 'older'];
const SLOTS = ['morning', 'midday', 'afternoon', 'evening'];
const REM_IDS = { morning: 101, midday: 102, afternoon: 103, evening: 104 };

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
const native = Capacitor.isNativePlatform();

// ---- Storage on this phone only.
async function load(key) {
  if (native) return (await Preferences.get({ key })).value;
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}
async function save(key, value) {
  if (native) return Preferences.set({ key, value });
  try { window.localStorage.setItem(key, value); } catch (e) { /* storage blocked: nothing kept */ }
}

// Age in whole years on a given day. Exported for the tests.
export function ageOn(birth, today) {
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}
export function groupFor(age) {
  if (age < 13) return 'child';
  if (age < 18) return 'teen';
  if (age < 25) return 'young';
  if (age < 65) return 'adult';
  return 'older';
}
// Which of the four daily check-ins a time of day belongs to. Exported for the tests.
export function slotFor(date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  return 'evening';
}

function start() {
  const api = window.TidelightCheckIn;
  const body = $('.ci-body');
  if (!api || !body) return;
  document.documentElement.classList.add('app');

  // ---- Age setup.
  const ageBox = $('#app-age');
  const dateInput = $('#app-birth-date');
  const problem = $('.app-age-problem');
  let group = null;

  const askPart = $('.app-age-ask');
  const confirmPart = $('.app-age-confirm');
  let pending = null;

  // Show everything meant for one age group, and hide the others: the box at the top of Today,
  // the card in today's results, and the list of what the app does for that age.
  function applyGroup(which) {
    $$('[data-age-group]').forEach((el) => el.classList.toggle('ci-off', el.getAttribute('data-age-group') !== which));
    const name = $('.app-group-names [data-age-group="' + which + '"]');
    $$('.app-group-name').forEach((el) => { el.textContent = name ? name.textContent : ''; });
  }

  // Larger text: on by default for 65 and over, and anyone can change it.
  let largeText = false;
  function applyText() { document.documentElement.classList.toggle('app-large-text', largeText); }
  $('.app-text-toggle').addEventListener('click', async () => {
    largeText = !largeText;
    applyText();
    await save(TEXT_KEY, largeText ? 'large' : 'regular');
  });

  function askAge(on) {
    document.documentElement.classList.toggle('app-asking-age', on);
    ageBox.classList.toggle('ci-off', !on);
    askPart.classList.remove('ci-off');
    confirmPart.classList.add('ci-off');
    pending = null;
    if (on) { dateInput.value = ''; problem.classList.add('ci-off'); ageBox.focus(); }
  }
  $('.app-age-save').addEventListener('click', () => {
    const value = dateInput.value;
    const birth = value ? new Date(value + 'T12:00:00') : null;
    const today = new Date();
    if (!birth || isNaN(birth) || birth > today || ageOn(birth, today) > 120) {
      problem.classList.remove('ci-off');
      dateInput.focus();
      return;
    }
    pending = groupFor(ageOn(birth, today));
    dateInput.value = ''; // The date itself is never stored.
    // Ask the person to check the group before anything is kept, because the right group matters.
    applyGroup(pending);
    askPart.classList.add('ci-off');
    confirmPart.classList.remove('ci-off');
    confirmPart.focus();
  });
  $('.app-age-redo').addEventListener('click', () => {
    applyGroup(group);
    askAge(true);
    dateInput.focus();
  });
  $('.app-age-yes').addEventListener('click', async () => {
    if (!pending) return;
    const first = group === null;
    group = pending;
    await save(GROUP_KEY, group);
    if (first || (await load(TEXT_KEY)) === null) {
      largeText = group === 'older';
      applyText();
    }
    applyGroup(group);
    askAge(false);
    $('#page-title').scrollIntoView({ block: 'start' });
  });
  $('.app-age-change').addEventListener('click', () => { askAge(true); ageBox.scrollIntoView({ block: 'start' }); });

  // ---- Saving: whenever something changes, keep a copy on this phone.
  let lastSaved = '';
  async function persist() {
    const json = JSON.stringify(api.getState());
    if (json === lastSaved) return;
    lastSaved = json;
    await save(STATE_KEY, json);
  }
  let timer = null;
  function soon() { clearTimeout(timer); timer = setTimeout(persist, 250); }
  body.addEventListener('click', soon, true);
  body.addEventListener('change', soon, true);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') persist(); });

  // ---- Share one entry through the phone's share sheet.
  const panel = $('#app-share-panel');
  const shareText = $('#app-share-text');
  const intro = $('#app-share-intro');
  const copied = $('.app-share-copied');
  let returnTo = null;
  function openShare(text, from) {
    returnTo = from;
    shareText.value = text;
    intro.checked = false;
    copied.classList.add('ci-off');
    panel.classList.remove('ci-off');
    panel.scrollIntoView({ block: 'start' });
    panel.focus();
  }
  function closeShare() {
    panel.classList.add('ci-off');
    if (returnTo) returnTo.focus();
  }
  function textOf(button) {
    const kind = button.getAttribute('data-share');
    if (kind === 'result') {
      const feeling = $('.ci-fill-feeling').textContent.trim();
      return feeling ? $('.app-share-feeling-text').textContent.trim() + ' ' + feeling : '';
    }
    const entry = button.closest('.ci-entry');
    if (entry) {
      return ['.ci-entry-prompt', '.ci-entry-text'].map((s) => $(s, entry).textContent.trim()).filter(Boolean).join('\n\n');
    }
    const item = button.closest('.ci-item');
    return item ? $('.ci-item-text', item).textContent.trim() : '';
  }
  document.addEventListener('click', (event) => {
    const button = event.target.closest('.app-share');
    if (!button) return;
    const text = textOf(button);
    if (text) openShare(text, button);
  });
  $('.app-share-cancel').addEventListener('click', closeShare);
  $('.app-share-go').addEventListener('click', async () => {
    let text = shareText.value.trim();
    if (!text) { shareText.focus(); return; }
    if (intro.checked) text = $('.app-share-intro-text').textContent.trim() + '\n\n' + text;
    try {
      if (native) await Share.share({ text });
      else if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); copied.classList.remove('ci-off'); return; }
      closeShare();
    } catch (e) {
      // Cancelled in the share sheet: leave the panel open so nothing is lost.
    }
  });

  // ---- Today's check-ins: one line per check-in, filed by the time of day, kept on this phone.
  const lang = document.documentElement.lang || 'en';
  let log = [];
  const word = (sel) => { const el = $(sel); return el ? el.textContent.trim() : ''; };
  const slotName = (slot) => word('.app-slot[data-slot="' + slot + '"]') || slot;
  function timeOf(date) {
    try { return date.toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; }
  }
  function dayOf(date) {
    try { return date.toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric' }); } catch (e) { return date.toDateString(); }
  }
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function lineFor(item) {
    const parts = [];
    if (item.feeling) parts.push(word('.app-log-feeling-text') + ' ' + item.feeling);
    if (item.needs && item.needs.length) parts.push(word('.app-log-needs-text') + ' ' + item.needs.join(', '));
    return slotName(item.slot) + ', ' + timeOf(new Date(item.t)) + ': ' + parts.join('. ') + '.';
  }
  function renderLog() {
    const list = $('.app-log');
    if (!list) return;
    list.textContent = '';
    const today = new Date();
    const todays = log.filter((item) => sameDay(new Date(item.t), today));
    todays.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = lineFor(item);
      list.appendChild(li);
    });
    $('.app-log-empty').classList.toggle('ci-off', todays.length > 0);
  }
  async function saveLog() { await save(LOG_KEY, JSON.stringify(log)); }
  // The page's own script records the check-in on this same click. This runs after it.
  document.addEventListener('click', async (event) => {
    if (!event.target.closest('.ci-finish')) return;
    const current = api.getState();
    const needs = $$('#ci-step-need input:checked').map((input) => {
      const spans = input.parentNode.querySelectorAll('span:not(.ci-light)');
      return spans.length ? spans[spans.length - 1].textContent.trim() : input.value;
    });
    if (!current.feelingLabel && !needs.length) return;
    const now = new Date();
    log.push({ t: now.toISOString(), slot: slotFor(now), feeling: current.feelingLabel || '', needs });
    renderLog();
    await saveLog();
  });
  document.addEventListener('click', async (event) => {
    if (!event.target.closest('.ci-erase-yes')) return;
    log = [];
    renderLog();
    await saveLog();
  });
  // A day's or a week's check-ins as plain text, which the person reads and can change first.
  function summary(days) {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
    const items = log.filter((item) => new Date(item.t) >= from);
    const lines = [word('.app-sum-title') + (days === 1 ? ', ' + dayOf(now) : '')];
    if (!items.length) lines.push(word('.app-sum-none'));
    let lastDay = null;
    items.forEach((item) => {
      const date = new Date(item.t);
      if (days > 1 && (!lastDay || !sameDay(lastDay, date))) { lines.push('', dayOf(date)); lastDay = date; }
      lines.push(lineFor(item));
    });
    lines.push('', word('.app-sum-footer'));
    return lines.join('\n');
  }
  $$('.app-share-days').forEach((button) => {
    button.addEventListener('click', () => openShare(summary(Number(button.getAttribute('data-days')) || 1), button));
  });

  // ---- Check-in reminders: four, each off until turned on, shown by the phone itself. Their
  // words never mention the person, and nothing is sent anywhere.
  const remBox = $('#app-reminders');
  let reminders = {};
  function remDefaults() {
    const out = {};
    SLOTS.forEach((slot) => {
      const input = $('.app-rem-time[data-slot="' + slot + '"]');
      out[slot] = { on: false, time: input ? input.value : '08:00' };
    });
    return out;
  }
  function showReminders() {
    SLOTS.forEach((slot) => {
      const r = reminders[slot];
      $('.app-rem-on[data-slot="' + slot + '"]').checked = Boolean(r && r.on);
      if (r && r.time) $('.app-rem-time[data-slot="' + slot + '"]').value = r.time;
    });
    const anyOn = SLOTS.some((slot) => reminders[slot].on);
    $('.app-rem-web').classList.toggle('ci-off', native || !anyOn);
  }
  async function scheduleReminders() {
    const wanted = SLOTS.filter((slot) => reminders[slot].on);
    $('.app-rem-denied').classList.add('ci-off');
    if (!native) return;
    if (wanted.length) {
      let perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') {
        SLOTS.forEach((slot) => { reminders[slot].on = false; });
        showReminders();
        $('.app-rem-denied').classList.remove('ci-off');
        await save(REM_KEY, JSON.stringify(reminders));
        return;
      }
    }
    await LocalNotifications.cancel({ notifications: SLOTS.map((slot) => ({ id: REM_IDS[slot] })) });
    if (!wanted.length) return;
    await LocalNotifications.schedule({
      notifications: wanted.map((slot) => {
        const at = reminders[slot].time.split(':').map(Number);
        return {
          id: REM_IDS[slot],
          title: word('.app-rem-title'),
          body: word('.app-rem-body'),
          schedule: { on: { hour: at[0], minute: at[1] }, allowWhileIdle: true },
        };
      }),
    });
  }
  if (remBox) {
    remBox.addEventListener('change', async (event) => {
      const input = event.target.closest('.app-rem-on, .app-rem-time');
      if (!input) return;
      const slot = input.getAttribute('data-slot');
      if (input.classList.contains('app-rem-on')) reminders[slot].on = input.checked;
      else if (/^\d\d:\d\d$/.test(input.value)) reminders[slot].time = input.value;
      showReminders();
      await save(REM_KEY, JSON.stringify(reminders));
      try { await scheduleReminders(); } catch (e) { /* the phone refused: the choices are kept, no reminder is set */ }
    });
  }

  // ---- Load what's saved, then ask for the age group if it isn't known yet.
  (async () => {
    panel.classList.add('ci-off');
    try { log = JSON.parse((await load(LOG_KEY)) || '[]'); } catch (e) { log = []; }
    if (!Array.isArray(log)) log = [];
    reminders = remDefaults();
    try {
      const kept = JSON.parse((await load(REM_KEY)) || '{}');
      SLOTS.forEach((slot) => {
        if (kept[slot]) reminders[slot] = { on: Boolean(kept[slot].on), time: /^\d\d:\d\d$/.test(kept[slot].time) ? kept[slot].time : reminders[slot].time };
      });
    } catch (e) { /* unreadable: every reminder off */ }
    if (remBox) showReminders();
    $('.app-rem-denied').classList.add('ci-off');
    renderLog();
    const saved = await load(STATE_KEY);
    if (saved) {
      try { api.setState(JSON.parse(saved)); lastSaved = saved; } catch (e) { /* unreadable: start fresh */ }
    }
    const kept = await load(GROUP_KEY);
    group = GROUPS.indexOf(kept) >= 0 ? kept : null;
    const textChoice = await load(TEXT_KEY);
    largeText = textChoice === 'large' || (textChoice === null && group === 'older');
    applyText();
    applyGroup(group);
    if (group) askAge(false); else askAge(true);
    document.documentElement.classList.add('app-ready');
  })();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();

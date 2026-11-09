// Tidelight phone app layer for the Daily check-in. Draft, not reviewed.
// Runs only in the app's copy of the page (app/www), never on the website.
// - Saves the check-in on this phone only (Capacitor Preferences; browser storage when tried in a
//   desktop browser). Nothing is ever sent to Tidelight.
// - Asks for a date of birth once, keeps only the age group, and forgets the date.
// - Shares one entry through the phone's own share sheet, only when the person taps Share.
// Every word it shows is already in the page, from app/src/text/*.html.
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

const STATE_KEY = 'tidelight.checkin.v1';
const GROUP_KEY = 'tidelight.agegroup.v1';
const TEXT_KEY = 'tidelight.textsize.v1';
const GROUPS = ['child', 'teen', 'young', 'adult', 'older'];

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

  // ---- Load what's saved, then ask for the age group if it isn't known yet.
  (async () => {
    panel.classList.add('ci-off');
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

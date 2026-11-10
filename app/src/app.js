// Tidelight phone app layer for the Daily check-in. Draft, not reviewed.
// Runs only in the app's copy of the page (app/www), never on the website.
// - Saves the check-in on this phone only (Capacitor Preferences; browser storage when tried in a
//   desktop browser). Nothing is ever sent to Tidelight.
// - Asks for a date of birth once, keeps only the age group, and forgets the date.
// - Shares one entry through the phone's own share sheet, only when the person taps Share.
// - Keeps a line per check-in (time of day, feeling, needs) on this phone, and shares a day's or
//   a week's lines the same way, only when the person taps Share.
// - Sets up to four daily reminders, shown by the phone itself, each off until turned on.
// - "Places that are hard for me" (idea E1): the person's own places, people, dwell time, and
//   message, kept on this phone and watched by the phone itself. Off until turned on.
// Every word it shows is already in the page, from app/src/text/*.html.
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
// Places that are hard for me (idea E1): the phone side and the pure logic. A draft.
import { Tidelight } from './native.js';
import { fill, MAX_PLACES, MAX_PEOPLE, DWELL_CHOICES, defaultPlacesConfig, newId, joinNames } from './logic.js';

const STATE_KEY = 'tidelight.checkin.v1';
const GROUP_KEY = 'tidelight.agegroup.v1';
const TEXT_KEY = 'tidelight.textsize.v1';
const LOG_KEY = 'tidelight.log.v1';
const REM_KEY = 'tidelight.reminders.v1';
const PLACES_KEY = 'tidelight.places.v1';
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

  // ---- Places that are hard for me (idea E1). Off until turned on; the app suggests no places.
  const placesBox = $('.app-places');
  const placesOn = $('.app-places-on');
  const placesSetup = $('.app-places-setup');
  const placeWords = {};
  $$('.app-places-words [data-word]').forEach((el) => { placeWords[el.getAttribute('data-word')] = el.textContent.trim(); });
  const mapWords = {};
  Object.keys(placeWords).forEach((key) => {
    if (key.startsWith('map')) mapWords[key.slice(3, 4).toLowerCase() + key.slice(4)] = placeWords[key];
  });
  let places = defaultPlacesConfig($('.app-places-message-default').textContent.trim());
  let placesStatus = null;
  const dwellSelect = $('.app-dwell');
  const placesStatusLine = $('.app-places-status');
  $('.app-places-web').classList.toggle('ci-off', native);
  $('.app-places-notif').classList.add('ci-off');

  function nativeConfig() {
    return {
      enabled: places.enabled,
      dwellMinutes: places.dwellMinutes,
      countdownSeconds: places.countdownSeconds,
      message: places.message,
      showPlaceOnLockScreen: places.showPlaceOnLockScreen,
      places: places.places.map((p) => ({ id: p.id, name: p.name, latitude: p.latitude, longitude: p.longitude, radius: p.radius })),
      contacts: places.contacts.map((c) => ({ name: c.name, phone: c.phone })),
      words: {
        title: placeWords.notifTitle, body: placeWords.notifBody, bodyWithPlace: placeWords.notifBodyWithPlace,
        okay: placeWords.notifOkay, send: placeWords.notifSend, call988: placeWords.notifCall988, call911: placeWords.notifCall911,
      },
    };
  }
  function renderPlaces() {
    placesOn.checked = places.enabled;
    placesSetup.classList.toggle('ci-off', !places.enabled);
    const list = $('.app-places-list');
    list.textContent = '';
    const template = $('.app-place-template');
    places.places.forEach((place) => {
      const item = template.content.firstElementChild.cloneNode(true);
      $('.app-place-name', item).textContent = place.name;
      $('.app-place-radius', item).textContent = fill(placeWords.radiusText, { meters: Math.round(place.radius) });
      $('.app-place-edit', item).addEventListener('click', () => editPlace(place));
      $('.app-place-remove', item).addEventListener('click', async () => {
        places.places = places.places.filter((other) => other.id !== place.id);
        await applyPlaces();
        $('.app-place-add').focus();
      });
      list.appendChild(item);
    });
    $('.app-places-empty').classList.toggle('ci-off', places.places.length > 0);
    $('.app-places-full').classList.toggle('ci-off', places.places.length < MAX_PLACES);
    $('.app-place-add').disabled = places.places.length >= MAX_PLACES;

    const people = $('.app-people-list');
    people.textContent = '';
    const personTemplate = $('.app-person-template');
    places.contacts.forEach((contact, index) => {
      const item = personTemplate.content.firstElementChild.cloneNode(true);
      $('.app-person-name', item).textContent = contact.name;
      $('.app-person-phone', item).textContent = contact.phone;
      $('.app-person-remove', item).addEventListener('click', async () => {
        places.contacts.splice(index, 1);
        await applyPlaces();
        $('.app-person-add').focus();
      });
      people.appendChild(item);
    });
    $('.app-people-empty').classList.toggle('ci-off', places.contacts.length > 0);
    $('.app-people-full').classList.toggle('ci-off', places.contacts.length < MAX_PEOPLE);
    $('.app-person-add').disabled = places.contacts.length >= MAX_PEOPLE;

    dwellSelect.value = String(places.dwellMinutes);
    $('.app-places-lock').checked = places.showPlaceOnLockScreen;
    $('.app-places-message').value = places.message;
    renderPlacesStatus();
  }
  function renderPlacesStatus() {
    const auth = placesStatus ? placesStatus.locationAuthorization : 'notDetermined';
    $$('.app-places-perm-state [data-auth]').forEach((el) => el.classList.toggle('ci-off', el.getAttribute('data-auth') !== auth));
    $('.app-places-allow').classList.toggle('ci-off', !native || auth === 'always' || auth === 'denied' || auth === 'restricted');
    $('.app-places-notif').classList.toggle('ci-off', !(placesStatus && placesStatus.notificationAuthorization === 'denied'));
    $('.app-dwell-test').classList.toggle('ci-off', !(placesStatus && placesStatus.debugBuild));
    $('.app-places-test').classList.toggle('ci-off', !(placesStatus && placesStatus.debugBuild && places.places.length));
    $('.app-places-unavailable').classList.toggle('ci-off', !(native && placesStatus && placesStatus.monitoringAvailable === false));
    if (!places.enabled) placesStatusLine.textContent = placeWords.off;
    else if (!places.places.length) placesStatusLine.textContent = placeWords.watchingNone;
    else placesStatusLine.textContent = fill(placeWords.watching, { count: placesStatus && native ? placesStatus.monitoredCount : places.places.length });
  }
  async function applyPlaces() {
    await save(PLACES_KEY, JSON.stringify(places));
    try { placesStatus = Object.assign(placesStatus || {}, await Tidelight.setPlaces({ config: nativeConfig() })); } catch (e) { /* keep the last status */ }
    if (native && places.enabled) {
      const asked = await Tidelight.requestNotificationPermission();
      if (placesStatus) placesStatus.notificationAuthorization = asked.granted ? 'authorized' : 'denied';
    }
    renderPlaces();
  }
  async function refreshPlacesStatus() {
    try { placesStatus = await Tidelight.getStatus(); } catch (e) { placesStatus = null; }
    renderPlacesStatus();
  }
  placesOn.addEventListener('change', async () => {
    places.enabled = placesOn.checked;
    await applyPlaces();
    if (places.enabled && native) {
      const auth = placesStatus && placesStatus.locationAuthorization;
      if (auth === 'notDetermined' || auth === 'whenInUse') { placesStatus = await Tidelight.requestLocationPermission(); renderPlacesStatus(); }
    }
  });
  $('.app-places-allow').addEventListener('click', async () => {
    placesStatus = await Tidelight.requestLocationPermission();
    renderPlacesStatus();
  });
  async function editPlace(existing) {
    const options = { words: mapWords, radius: existing ? existing.radius : 200 };
    if (existing) Object.assign(options, { name: existing.name, latitude: existing.latitude, longitude: existing.longitude });
    let picked;
    try { picked = await Tidelight.pickPlace(options); } catch (e) { picked = { cancelled: true }; }
    if (!picked || picked.cancelled) return;
    if (existing) {
      Object.assign(existing, { name: picked.name, latitude: picked.latitude, longitude: picked.longitude, radius: picked.radius });
    } else {
      places.places.push({ id: newId(), name: picked.name, latitude: picked.latitude, longitude: picked.longitude, radius: picked.radius });
    }
    await applyPlaces();
  }
  $('.app-place-add').addEventListener('click', () => { if (places.places.length < MAX_PLACES) editPlace(null); });
  $('.app-person-add').addEventListener('click', async () => {
    if (places.contacts.length >= MAX_PEOPLE) return;
    let picked;
    try { picked = await Tidelight.pickContact(); } catch (e) { picked = { cancelled: true }; }
    if (!picked || picked.cancelled || !picked.phone) return;
    places.contacts.push({ name: picked.name || picked.phone, phone: picked.phone });
    await applyPlaces();
  });
  dwellSelect.addEventListener('change', () => {
    const minutes = Number(dwellSelect.value);
    places.dwellMinutes = DWELL_CHOICES.indexOf(minutes) >= 0 || minutes === 1 ? minutes : 20;
    applyPlaces();
  });
  $('.app-places-test-enter').addEventListener('click', async () => {
    if (places.places.length) { try { await Tidelight.debugEnterPlace({ placeId: places.places[0].id }); } catch (e) { /* not a test build */ } }
  });
  $('.app-places-lock').addEventListener('change', (event) => { places.showPlaceOnLockScreen = event.target.checked; applyPlaces(); });
  let messageTimer = null;
  $('.app-places-message').addEventListener('input', (event) => {
    places.message = event.target.value;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(applyPlaces, 600);
  });
  try { Tidelight.addListener('statusChange', (status) => { placesStatus = Object.assign(placesStatus || {}, status); renderPlacesStatus(); }); } catch (e) { /* web */ }

  // ---- The alert screen: the person has stayed at one of their places for the dwell time.
  const alertBox = $('.app-place-alert');
  alertBox.classList.add('ci-off');
  let alertInfo = null;
  let countdown = null;
  let secondsLeft = 0;
  function alertLine(selector, on) { $(selector, alertBox).classList.toggle('ci-off', !on); }
  function stopCountdown() { clearInterval(countdown); countdown = null; alertLine('.app-alert-countdown', false); }
  function showAlert(info, sendNow) {
    alertInfo = info;
    $('.app-alert-place').textContent = info.placeName || '';
    $('.app-alert-minutes').textContent = String(info.minutes != null ? info.minutes : places.dwellMinutes);
    const names = places.contacts.map((c) => c.name);
    $('.app-alert-names').textContent = joinNames(names, placeWords.and);
    const nobody = names.length === 0;
    alertLine('.app-alert-intro', !nobody);
    alertLine('.app-alert-nobody', nobody);
    $('.app-alert-send').disabled = nobody;
    ['.app-alert-okay-done', '.app-alert-opened', '.app-alert-fallback', '.app-alert-sent', '.app-alert-cancelled', '.app-alert-close-row'].forEach((sel) => alertLine(sel, false));
    alertLine('.ci-step-buttons', true);
    alertBox.classList.remove('ci-off');
    alertBox.scrollIntoView({ block: 'start' });
    alertBox.focus();
    stopCountdown();
    if (nobody) return;
    if (sendNow) { sendAlertMessage(); return; }
    secondsLeft = places.countdownSeconds;
    $('.app-alert-seconds').textContent = String(secondsLeft);
    alertLine('.app-alert-countdown', true);
    countdown = setInterval(() => {
      secondsLeft -= 1;
      $('.app-alert-seconds').textContent = String(Math.max(0, secondsLeft));
      if (secondsLeft <= 0) { stopCountdown(); sendAlertMessage(); }
    }, 1000);
  }
  async function sendAlertMessage() {
    stopCountdown();
    let outcome;
    try {
      outcome = await Tidelight.composeMessage({ placeId: alertInfo ? alertInfo.placeId : null, message: places.message, linkLabel: placeWords.linkLabel });
    } catch (e) { outcome = { result: 'failed' }; }
    if (alertInfo && alertInfo.placeId) { try { await Tidelight.acknowledgeAlert({ placeId: alertInfo.placeId }); } catch (e) { /* web */ } }
    alertLine('.app-alert-opened', false);
    alertLine('.app-alert-fallback', Boolean(outcome.fallback));
    alertLine('.app-alert-sent', outcome.result === 'sent');
    alertLine('.app-alert-cancelled', outcome.result === 'cancelled' || outcome.result === 'failed');
    alertLine('.app-alert-close-row', true);
  }
  $('.app-alert-send').addEventListener('click', () => { if (places.contacts.length) sendAlertMessage(); });
  $('.app-alert-okay').addEventListener('click', async () => {
    stopCountdown();
    if (alertInfo && alertInfo.placeId) { try { await Tidelight.acknowledgeAlert({ placeId: alertInfo.placeId }); } catch (e) { /* web */ } }
    alertLine('.ci-step-buttons', false);
    alertLine('.app-alert-okay-done', true);
    alertLine('.app-alert-close-row', true);
  });
  $('.app-alert-close').addEventListener('click', () => { stopCountdown(); alertBox.classList.add('ci-off'); alertInfo = null; });
  async function checkForAlert(sendNow) {
    let pending = {};
    try { pending = await Tidelight.getPendingAlert(); } catch (e) { pending = {}; }
    if (pending && pending.placeId) showAlert(pending, sendNow);
  }
  try { Tidelight.addListener('placeAlert', (info) => showAlert(info, false)); } catch (e) { /* web */ }
  window.addEventListener('tidelight-launch', (event) => {
    const target = event.detail || '';
    if (target === '#app-place-alert-send') checkForAlert(true);
    else if (target === '#app-place-alert') checkForAlert(false);
    else if (target === '#ci-today') $('.ci-tabs a[href="#ci-today"]').click();
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { refreshPlacesStatus(); if (!alertInfo) checkForAlert(false); } });

  // Delete everything also removes the places and the people, and turns the feature off.
  document.addEventListener('click', async (event) => {
    if (!event.target.closest('.ci-erase-yes')) return;
    places = defaultPlacesConfig($('.app-places-message-default').textContent.trim());
    await applyPlaces();
  });

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
    // Places that are hard for me (E1).
    try {
      const savedPlaces = JSON.parse((await load(PLACES_KEY)) || 'null');
      if (savedPlaces && typeof savedPlaces === 'object') places = Object.assign(places, savedPlaces);
      if (!Array.isArray(places.places)) places.places = [];
      if (!Array.isArray(places.contacts)) places.contacts = [];
    } catch (e) { /* unreadable: start fresh */ }
    await refreshPlacesStatus();
    renderPlaces();
    if (native) {
      // Tell the phone the current settings and words at every start, in case they changed.
      try { placesStatus = Object.assign(placesStatus || {}, await Tidelight.setPlaces({ config: nativeConfig() })); renderPlacesStatus(); } catch (e) { /* no phone */ }
    }
    const kept = await load(GROUP_KEY);
    group = GROUPS.indexOf(kept) >= 0 ? kept : null;
    const textChoice = await load(TEXT_KEY);
    largeText = textChoice === 'large' || (textChoice === null && group === 'older');
    applyText();
    applyGroup(group);
    if (group) askAge(false); else askAge(true);
    document.documentElement.classList.add('app-ready');
    // Places that are hard for me (E1): opened from a notification, or with an alert already due.
    const hash = location.hash;
    if (hash === '#app-place-alert' || hash === '#app-place-alert-send') checkForAlert(hash === '#app-place-alert-send');
    else checkForAlert(false);
    try { const launch = await Tidelight.takeLaunchTarget(); if (launch && launch.target) window.dispatchEvent(new CustomEvent('tidelight-launch', { detail: launch.target })); } catch (e) { /* web */ }
  })();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();

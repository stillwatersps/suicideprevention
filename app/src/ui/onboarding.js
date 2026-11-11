// Onboarding: a few swipeable pages, shown once. Every page but the first can be skipped, except
// the date of birth, which the project's rules require; skipped steps stay on Home's setup list.
// The safety frame stays on screen on every page.
import { CONFIG } from '../core/config.js';
import { spreadTimes } from '../logic/spread.js';
import { profileFor } from '../logic/style-profile.js';
import { t, clockText } from './words.js';
import { state, save, applyStyle } from './state.js';
import { stepper, choiceGroup, el } from './components.js';
import { haptic } from './haptics.js';
import { locationPermission, requestLocationPermission, currentPosition, requestNotificationPermission } from './device.js';
import { syncReminders } from './reminders.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
const ALL = ['welcome', 'age', 'name', 'count', 'times', 'style', 'location', 'notifications', 'done'];
let pages = ALL;
let index = 0;
let ageOnly = false;
let shellRef = null;
let ctx = null;
let pickedCount = CONFIG.checkIn.perDayDefault;
let pickedStyle = null;
let previewTimer = null;

const screen = () => $('#tl-onboarding');
const pageEl = (name) => $('.tl-ob-page[data-ob="' + name + '"]', screen());
const current = () => pages[index];

// The times a count, a wake time, and a bedtime give, as small chips. Used here and in Settings.
export function renderTimes(list, times) {
  list.textContent = '';
  times.forEach((time) => list.appendChild(el('li', 'tl-badge', clockText(time))));
}
function refreshPreviews() {
  const times = spreadTimes(pickedCount, $('#tl-ob-wake').value, $('#tl-ob-sleep').value);
  $$('[data-tl-times]', screen()).forEach((list) => renderTimes(list, times));
}

function show(i, focus) {
  index = Math.max(0, Math.min(pages.length - 1, i));
  const name = current();
  $$('.tl-ob-page', screen()).forEach((page) => { page.hidden = page.getAttribute('data-ob') !== name; });
  const fixed = name === 'welcome' || name === 'done' || name === 'age';
  $('#tl-ob-back').hidden = index === 0 || ageOnly;
  $('#tl-ob-skip').hidden = fixed;
  const dots = $('#tl-ob-dots');
  dots.textContent = '';
  dots.hidden = ageOnly;
  pages.forEach((page, n) => dots.appendChild(el('li', n === index ? 'is-on' : '')));
  $('#tl-ob-step').textContent = ageOnly ? '' : t('ob.step', { step: index + 1, total: pages.length });
  if (name === 'location') refreshLocation();
  if (focus !== false) {
    window.scrollTo(0, 0);
    const heading = $('h2, h3', pageEl(name));
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }
}

// Leaving a page forward keeps what was chosen on it.
async function keep(name) {
  if (name === 'name') await save('profile', { name: $('#tl-ob-name').value.trim() });
  if (name === 'count') await save('settings', { checkInsPerDay: pickedCount, countChosen: true, customTimes: null });
  if (name === 'times') await save('settings', { wakeTime: $('#tl-ob-wake').value || CONFIG.checkIn.wakeDefault, sleepTime: $('#tl-ob-sleep').value || CONFIG.checkIn.sleepDefault, customTimes: null });
  if (name === 'style' && pickedStyle) await save('settings', { checkInStyle: pickedStyle, styleChosen: true });
}
async function next(keepIt) {
  if (current() === 'age') return; // the date of birth has its own buttons, and can't be skipped
  if (keepIt) await keep(current());
  haptic('select');
  show(index + 1);
}
function back() {
  if (index === 0 || ageOnly) return;
  haptic('select');
  show(index - 1);
}

async function refreshLocation() {
  const permission = await locationPermission();
  $('#tl-ob-location').hidden = permission === 'granted';
  $('#tl-ob-home').hidden = permission !== 'granted' || Boolean(state.home);
  const note = $('#tl-ob-location-note');
  if (state.home) note.textContent = t('ob.homeSaved');
  else if (permission === 'granted') note.textContent = t('ob.locationGranted');
  else if (permission === 'denied') note.textContent = t('ob.locationDenied');
  else note.textContent = '';
}

function previewStyle(value) {
  const box = $('#tl-ob-style-preview');
  const p = profileFor(value);
  clearTimeout(previewTimer);
  box.style.setProperty('--tl-speed', String(p.speed));
  $('p', box).textContent = t('checkin.prompt', null, value);
  box.classList.remove('is-playing');
  void box.offsetWidth;
  box.classList.add('is-playing');
  previewTimer = setTimeout(() => box.classList.remove('is-playing'), CONFIG.onboarding.stylePreviewMs);
}

async function finish() {
  await save('onboarding', { completed: true });
  haptic('success');
  shellRef.setFull(false);
  shellRef.go('home');
  shellRef.go('home');
  if (ctx.onFinished) ctx.onFinished();
}

export function startOnboarding() {
  ageOnly = false;
  pages = ALL.filter((name) => name !== 'age' || !ctx.getGroup());
  pickedCount = state.settings.checkInsPerDay;
  pickedStyle = null;
  $('#tl-ob-name').value = state.profile.name || '';
  $('#tl-ob-wake').value = state.settings.wakeTime;
  $('#tl-ob-sleep').value = state.settings.sleepTime;
  countStepper.set(pickedCount);
  refreshPreviews();
  shellRef.setFull(true);
  shellRef.push('onboarding');
  show(0, false);
}
// "Enter my date of birth again", from Settings: the age page alone, then back to Settings.
function startAgeOnly() {
  ageOnly = true;
  pages = ['age'];
  shellRef.setFull(true);
  shellRef.push('onboarding');
  show(0);
}

let countStepper = null;
export function initOnboarding(shell, context) {
  shellRef = shell;
  ctx = context;
  const box = screen();
  if (!box) return;
  const age = $('#app-age');
  if (age) $('#tl-ob-age-slot').appendChild(age);

  countStepper = stepper($('#tl-ob-count'), {
    min: CONFIG.checkIn.perDayMin, max: CONFIG.checkIn.perDayMax, value: pickedCount,
    onChange: (value) => { pickedCount = value; refreshPreviews(); },
  });
  ['#tl-ob-wake', '#tl-ob-sleep'].forEach((sel) => $(sel).addEventListener('change', refreshPreviews));
  choiceGroup($('#tl-ob-style'), { onChange: (value) => { pickedStyle = value; previewStyle(value); } });

  box.addEventListener('click', (event) => { if (event.target.closest('[data-ob-next]')) next(true); });
  $('#tl-ob-skip').addEventListener('click', () => next(false));
  $('#tl-ob-back').addEventListener('click', back);
  $('#tl-ob-start').addEventListener('click', finish);

  // The date of birth: confirming it moves on. Asked again from Settings, it returns there.
  document.addEventListener('click', (event) => {
    if (event.target.closest('.app-age-yes')) {
      if (ageOnly) { ageOnly = false; shell.setFull(false); shell.back(); } else if (current() === 'age' && !screen().hidden) show(index + 1);
    }
    if (event.target.closest('.app-age-change')) startAgeOnly();
  });

  $('#tl-ob-location').addEventListener('click', async () => {
    const permission = await requestLocationPermission();
    if (permission === 'unavailable') $('#tl-ob-location-note').textContent = t('ob.locationUnavailable');
    else await refreshLocation();
    if (ctx.onPermission) ctx.onPermission();
  });
  $('#tl-ob-home').addEventListener('click', async () => {
    const here = await currentPosition();
    if (here) await save('home', { latitude: here.latitude, longitude: here.longitude, savedAt: new Date().toISOString() });
    else $('#tl-ob-location-note').textContent = t('ob.homeFailed');
    if (here) { haptic('success'); await refreshLocation(); }
  });
  $('#tl-ob-notify').addEventListener('click', async () => {
    const permission = await requestNotificationPermission();
    const note = $('#tl-ob-notify-note');
    if (permission === 'granted') {
      await save('settings', { remindersOn: true });
      await syncReminders(ctx.checkInsToday());
      note.textContent = t('ob.notifyGranted');
      $('#tl-ob-notify').hidden = true;
      haptic('success');
    } else {
      note.textContent = t(permission === 'denied' ? 'ob.notifyDenied' : 'ob.notifyUnavailable');
    }
    if (ctx.onPermission) ctx.onPermission();
  });

  // Swipe: right goes back, left goes on (never past the date of birth).
  let startX = 0;
  let startY = 0;
  box.addEventListener('touchstart', (event) => { startX = event.touches[0].clientX; startY = event.touches[0].clientY; }, { passive: true });
  box.addEventListener('touchend', (event) => {
    if (event.target.closest('input, textarea, select')) return;
    const dx = event.changedTouches[0].clientX - startX;
    const dy = event.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 60 || Math.abs(dy) > 50) return;
    if (dx > 0) back(); else if (current() !== 'done') next(true);
  }, { passive: true });

  applyStyle();
}

// The setup checklist on Home: a ring ("Setup 5/8") that opens a list of what's left, each with
// one button that does it. Every item is read from the app's real state each time.
import { deriveChecklist, checklistProgress } from '../logic/checklist.js';
import { t } from './words.js';
import { state, save, isQuiet } from './state.js';
import { progressRing } from './components.js';
import { haptic } from './haptics.js';
import { celebrate } from './celebrate.js';
import { locationPermission, notificationPermission, requestLocationPermission, requestNotificationPermission, currentPosition } from './device.js';
import { syncReminders } from './reminders.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
let ring = null;
let ctx = null;
let shellRef = null;

export async function setupFacts() {
  return {
    name: state.profile.name,
    countChosen: state.settings.countChosen,
    styleChosen: state.settings.styleChosen,
    locationPermission: await locationPermission(),
    home: state.home,
    notificationPermission: await notificationPermission(),
    remindersOn: state.settings.remindersOn,
    checkInCount: ctx.checkInCount(),
    meditationCount: state.sessions.filter((s) => s.completed).length,
  };
}

export async function renderSetup() {
  const box = $('#tl-home-setup');
  if (!box) return;
  const items = deriveChecklist(await setupFacts());
  const progress = checklistProgress(items);
  const finished = state.onboarding.setupCelebrated;
  box.hidden = !state.onboarding.completed || finished || progress.complete;
  ring.set(progress.done / progress.total, t('setup.ring', progress));
  $('#tl-setup-count').textContent = t('setup.count', progress);
  items.forEach((item) => {
    const row = $('[data-setup="' + item.id + '"]', box);
    if (row) row.hidden = item.done;
  });
  const keep = $('[data-setup-do="count"]', box);
  keep.textContent = keep.getAttribute('data-words').replace('{count}', String(state.settings.checkInsPerDay));
  // All done: a small, quiet "complete" card, once. Then the ring is gone for good.
  if (progress.complete && !finished && state.onboarding.completed) {
    await save('onboarding', { setupCelebrated: true });
    $('#tl-setup-done').hidden = false;
    haptic('success');
    if (!isQuiet()) celebrate();
  }
}

async function act(what) {
  const note = $('#tl-setup-note');
  note.textContent = '';
  if (what === 'name') {
    const name = $('#tl-setup-name').value.trim();
    if (!name) { $('#tl-setup-name').focus(); return; }
    await save('profile', { name });
  } else if (what === 'count') {
    await save('settings', { countChosen: true });
  } else if (what === 'style') {
    shellRef.push('settings');
    $('#tl-set-style-title').scrollIntoView({ block: 'center' });
    return;
  } else if (what === 'location') {
    const answer = await requestLocationPermission();
    if (answer !== 'granted') note.textContent = t(answer === 'denied' ? 'setup.denied' : 'setup.unavailable');
  } else if (what === 'homeSpot') {
    if ((await requestLocationPermission()) !== 'granted') { note.textContent = t('setup.denied'); return; }
    const here = await currentPosition();
    if (here) await save('home', { latitude: here.latitude, longitude: here.longitude, savedAt: new Date().toISOString() });
    else note.textContent = t('ob.homeFailed');
  } else if (what === 'notifications') {
    const answer = await requestNotificationPermission();
    if (answer === 'granted') { await save('settings', { remindersOn: true }); await syncReminders(ctx.checkInsToday()); }
    else note.textContent = t(answer === 'denied' ? 'setup.denied' : 'setup.unavailable');
  } else if (what === 'firstCheckIn') {
    shellRef.push('flow');
    return;
  } else if (what === 'firstMeditation') {
    shellRef.go('meditate');
    return;
  }
  haptic('tap');
  await renderSetup();
}

export function initSetup(shell, context) {
  shellRef = shell;
  ctx = context;
  const box = $('#tl-home-setup');
  if (!box) return;
  ring = progressRing($('#tl-setup-ring'));
  const keep = $('[data-setup-do="count"]', box);
  keep.setAttribute('data-words', keep.textContent);
  const open = $('#tl-setup-open');
  open.addEventListener('click', () => {
    const list = $('#tl-setup-list');
    list.hidden = !list.hidden;
    open.setAttribute('aria-expanded', String(!list.hidden));
  });
  $$('[data-setup-do]', box).forEach((button) => button.addEventListener('click', () => act(button.getAttribute('data-setup-do'))));
  shell.onShow('home', renderSetup);
}

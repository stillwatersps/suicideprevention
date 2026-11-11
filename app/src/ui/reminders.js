// Check-in reminders: one per check-in time, shown by the phone itself. The words are discreet
// (they never mention mood, crisis, or anything about the person) and come from the page.
import { CONFIG } from '../core/config.js';
import { effectiveTimes, planReminders } from '../logic/spread.js';
import { t } from './words.js';
import { state, style } from './state.js';
import { notificationPermission, setNotifications } from './device.js';

// Every id the app has ever used for a reminder, so stale ones are always cleared.
function allIds() {
  const ids = CONFIG.reminders.oldIds.slice();
  for (let i = 0; i < CONFIG.reminders.maxDays * 5; i += 1) ids.push(CONFIG.reminders.firstId + i);
  return ids;
}

export function reminderWords() {
  return { title: t('rem.title'), body: t('rem.body', null, style()) };
}

// Sets the reminders again from the settings. Call it whenever a related setting changes, the app
// opens, or a check-in is done (a slot already covered today gets no reminder).
// Returns { set: n } or { blocked: 'denied' | 'prompt' | 'unavailable' }.
export async function syncReminders(checkInsToday) {
  const settings = state.settings;
  if (!settings.remindersOn) { await setNotifications([], allIds()); return { set: 0 }; }
  const permission = await notificationPermission();
  if (permission !== 'granted') { await setNotifications([], allIds()); return { blocked: permission }; }
  const words = reminderWords();
  const plan = planReminders({
    now: new Date(), times: effectiveTimes(settings), checkInsToday: checkInsToday || 0,
    days: CONFIG.reminders.maxDays, maxPending: CONFIG.reminders.maxPending, firstId: CONFIG.reminders.firstId,
  });
  await setNotifications(plan.map((p) => ({ id: p.id, at: p.at, title: words.title, body: words.body })), allIds());
  return { set: plan.length };
}

export async function sendTestReminder() {
  const words = reminderWords();
  const at = new Date(Date.now() + CONFIG.reminders.testDelayMs);
  await setNotifications([{ id: CONFIG.reminders.testId, at, title: words.title, body: words.body }], [CONFIG.reminders.testId]);
}

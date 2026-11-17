// Settings, Notifications: the person's own words for a check-in reminder. They are kept with the
// settings on this phone, shown by the phone itself, and refused if they would say anything about
// mood, crisis, or getting help (src/logic/reminder-words.js). Delete everything removes them.
import { CONFIG } from '../core/config.js';
import { tidyWords, isDiscreet } from '../logic/reminder-words.js';
import { state, save } from './state.js';
import { t } from './words.js';
import { syncReminders, reminderWords } from './reminders.js';

const $ = (sel) => document.querySelector(sel);

export function initReminderWords(shell, ctx) {
  const field = $('#tl-set-rem-words');
  if (!field) return;
  const status = $('#tl-set-rem-words-status');
  const say = (key) => { status.textContent = key ? t(key) : ''; status.hidden = !key; };
  const sample = () => document.querySelectorAll('.tl-rem-sample').forEach((node) => { node.textContent = reminderWords().body; });
  const show = () => { if (document.activeElement !== field) field.value = tidyWords(state.settings.reminderWords, CONFIG.reminders.ownMaxLength); };
  const keep = async (words) => {
    await save('settings', { reminderWords: words });
    await syncReminders(ctx.checkInsToday());
    sample();
  };
  $('#tl-set-rem-words-save').addEventListener('click', async () => {
    const words = tidyWords(field.value, CONFIG.reminders.ownMaxLength);
    if (words && !isDiscreet(words)) { say('rem.ownRefused'); return; }
    field.value = words;
    await keep(words);
    say(words ? 'rem.ownSaved' : 'rem.ownCleared');
  });
  // Delete everything: the words go, and reminders already set go back to the usual words.
  window.addEventListener('tidelight-erased', async () => { field.value = ''; say(''); await keep(''); });
  shell.onShow('settings', () => { say(''); show(); });
  show();
}

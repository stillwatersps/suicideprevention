// Apple Health, and only if the person turns on "Add meditations to Apple Health" in Settings.
// Tidelight adds one kind of entry to Health: mindful minutes for a finished meditation, with
// when it started and how long it lasted. Never a mood, a check-in, or a word, and it reads
// nothing from Health. The phone's part is in TidelightHealth.swift; a browser, an Android phone,
// and an iPad without Health have none, and there the setting is not shown at all. A draft.
import { Tidelight } from '../native.js';
import { CONFIG } from '../core/config.js';
import { state, save } from './state.js';
import { t } from './words.js';
import { haptic } from './haptics.js';
import { devLog } from '../core/dev.js';

const $ = (sel) => document.querySelector(sel);
// Meditations already handed to Health since the app opened, so none is added twice.
const added = new Set();

// 'unavailable', 'notDetermined', 'allowed', or 'denied'. Anything unexpected counts as unavailable.
async function healthStatus() {
  try {
    const status = (await Tidelight.healthStatus()).status;
    return ['notDetermined', 'allowed', 'denied'].includes(status) ? status : 'unavailable';
  } catch (e) { devLog('health status', e); return 'unavailable'; }
}

// One finished meditation. Says nothing if it can't be added: the meditation itself is kept either way.
export async function addMindfulMinutes(entry) {
  if (!state.settings.health || !entry || !entry.completed || added.has(entry.id)) return false;
  const startedAt = new Date(entry.startedAt).getTime();
  const seconds = Math.round(Number(entry.completedSeconds) || 0);
  if (isNaN(startedAt) || seconds < CONFIG.health.minSeconds) return false;
  added.add(entry.id);
  try { return Boolean((await Tidelight.healthWrite({ startedAt, seconds })).saved); } catch (e) { devLog('health write', e); return false; }
}

// Removes the entries Tidelight added to Health, and nothing else. True when Health said it did.
export async function removeFromHealth() {
  try { return Boolean((await Tidelight.healthRemoveAll()).removed); } catch (e) { devLog('health remove', e); return false; }
}

async function render() {
  const box = $('#tl-set-health-box');
  if (!box) return;
  const status = await healthStatus();
  box.hidden = status === 'unavailable';
  if (status === 'unavailable') return;
  // If Health's own permission was taken away since, the switch says so by being off.
  if (state.settings.health && status !== 'allowed') await save('settings', { health: false });
  $('#tl-set-health').checked = Boolean(state.settings.health);
}

export function initHealth(shell) {
  const toggle = $('#tl-set-health');
  if (!toggle) return;
  const note = $('#tl-set-health-note');
  const say = (key) => { note.textContent = t(key); note.hidden = false; };
  shell.onShow('settings', () => { note.hidden = true; render(); });
  // Off until turned on, and turning it on asks the phone first. A "no" turns it back off and says why.
  toggle.addEventListener('change', async () => {
    haptic('toggle');
    note.hidden = true;
    if (toggle.checked) {
      let status = 'unavailable';
      try { status = (await Tidelight.healthAsk()).status; } catch (e) { devLog('health ask', e); }
      await save('settings', { health: status === 'allowed' });
      if (status !== 'allowed') say('health.denied');
    } else {
      await save('settings', { health: false });
    }
    render();
  });
  $('#tl-set-health-remove').addEventListener('click', async () => {
    note.hidden = true;
    say((await removeFromHealth()) ? 'health.removed' : 'health.removeFailed');
  });
  // Delete everything also removes what Tidelight added to Health, where the phone has Health.
  window.addEventListener('tidelight-erased', async () => {
    if ((await healthStatus()) === 'allowed') await removeFromHealth();
  });
  render();
}

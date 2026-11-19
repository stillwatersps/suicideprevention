// Settings, "A backup file": makes one file with what the app keeps on this phone and hands it to
// the phone's share sheet; and reads one back, after asking, in place of what is here. The app
// sends nothing itself and keeps no record of where a file went. A draft.
import { store } from '../core/device-storage.js';
import { KEYS, SCHEMA_KEY, SCHEMA_VERSION } from '../core/storage.js';
import { CONFIG } from '../core/config.js';
import { buildBackup, readBackup, withoutTimes } from '../logic/backup.js';
import { handFile } from './export.js';
import { t } from './words.js';
import { devLog } from '../core/dev.js';

const $ = (sel) => document.querySelector(sel);
// Everything the app stores, except the four older reminders (read once, long ago, by a migration).
const BACKED_UP = Object.keys(KEYS).filter((name) => name !== 'oldReminders').map((name) => KEYS[name]);
const TIMED = ['follow', 'visit'].map((name) => KEYS[name]).filter(Boolean);

export async function backupText() {
  const values = {};
  for (const key of BACKED_UP) values[key] = await store.getRaw(key);
  return buildBackup(values, { schema: await store.schemaVersion(), made: new Date().toISOString() });
}

export function initBackup() {
  const make = $('#tl-set-backup-make');
  const file = $('#tl-set-restore-file');
  if (!make || !file) return;
  const ask = $('#tl-set-restore-ask');
  const note = $('#tl-set-restore-note');
  let waiting = null; // a file that was read and is waiting for the person's answer
  const say = (key) => { note.textContent = key ? t(key) : ''; note.hidden = !key; if (key) note.focus({ preventScroll: true }); };
  const done = () => { waiting = null; ask.hidden = true; file.value = ''; };

  make.addEventListener('click', async () => {
    const made = $('#tl-set-backup-note');
    made.hidden = true;
    let outcome = 'failed';
    try { outcome = await handFile(t('backup.fileName'), await backupText()); } catch (e) { devLog('backup', e); }
    if (outcome === 'cancelled') return; // the sheet was closed: nothing happened, so nothing to say
    made.textContent = t(outcome === 'done' ? 'backup.done' : 'backup.failed');
    made.hidden = false;
  });

  file.addEventListener('change', async () => {
    say('');
    const picked = file.files && file.files[0];
    if (!picked) { done(); return; }
    let text = '';
    try { text = picked.size > CONFIG.backup.maxBytes ? '' : await picked.text(); } catch (e) { text = ''; }
    const read = readBackup(text, { keys: BACKED_UP, schema: SCHEMA_VERSION, maxBytes: CONFIG.backup.maxBytes, maxValue: CONFIG.backup.maxValue });
    if (!read.ok) { done(); say(read.why === 'newer' ? 'backup.newer' : 'backup.notOne'); return; }
    waiting = read;
    ask.hidden = false;
    $('#tl-set-restore-yes').focus({ preventScroll: true });
  });
  $('#tl-set-restore-no').addEventListener('click', () => { done(); say('backup.kept'); });
  $('#tl-set-restore-yes').addEventListener('click', async () => {
    const read = waiting;
    done();
    if (!read) return;
    try {
      // Replace: a key the file doesn't have is removed, so nothing of the old phone's is mixed in.
      for (const key of BACKED_UP) {
        if (typeof read.data[key] === 'string') await store.setRaw(key, TIMED.includes(key) ? withoutTimes(read.data[key]) : read.data[key]);
        else await store.remove(key);
      }
      await store.setRaw(SCHEMA_KEY, String(read.schema));
    } catch (e) { devLog('restore', e); say('backup.problem'); return; }
    try { sessionStorage.setItem('tidelight.restored', '1'); } catch (e) { /* the line after reopening is skipped */ }
    // The app starts again from what is now stored, the same way it does when it is opened.
    location.reload();
  });
  // After the restart: say it worked, once, where the person was.
  let restored = false;
  try { restored = sessionStorage.getItem('tidelight.restored') === '1'; sessionStorage.removeItem('tidelight.restored'); } catch (e) { restored = false; }
  if (restored) { note.textContent = t('backup.restored'); note.hidden = false; }
}

// "Darker at night": between the time the person goes to bed and the time they wake up (both in
// Settings), the app uses its dark colors, whatever the phone is set to. Off until turned on.
// The rule is in src/logic/night.js; the colors are the app's own dark colors, copied for this by
// the build (tools/night-css.mjs). The crisis strip's colors are the same by day and by night.
import { isNight, nightEnd } from '../logic/night.js';
import { state, save, onChange } from './state.js';

const $ = (sel) => document.querySelector(sel);
const root = document.documentElement;
// For this visit only: when tonight ends. The website's pages inside the app can't read the
// settings, so app-return.js reads this instead and is dark until then.
const MARK = 'tidelight.night-until';

export function applyNight(now) {
  const moment = now || new Date();
  const s = state.settings;
  const always = Boolean(s.alwaysDark); // Settings, "Always use the dark colors"
  const on = always || (Boolean(s.nightMode) && isNight(moment, s.sleepTime, s.wakeTime));
  root.classList.toggle('tl-night', on);
  try {
    // Always dark: the website's pages inside the app are told "until this time tomorrow", and told
    // again every half minute while the app is open.
    const end = always ? new Date(moment.getTime() + 86400000) : on ? nightEnd(moment, s.wakeTime) : null;
    if (end) window.sessionStorage.setItem(MARK, String(end.getTime())); else window.sessionStorage.removeItem(MARK);
  } catch (e) { /* no session storage: the app's own screens are still right */ }
  return on;
}

export function initNight(shell) {
  const toggle = $('#tl-set-night');
  if (toggle) {
    const show = () => { toggle.checked = Boolean(state.settings.nightMode); };
    toggle.addEventListener('change', async () => {
      await save('settings', { nightMode: toggle.checked });
      applyNight();
    });
    shell.onShow('settings', show);
    show();
  }
  applyNight();
  // Bed time and wake time arrive while the app is open, or while it is away.
  setInterval(() => applyNight(), 30000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') applyNight(); });
  // Changing either time in Settings changes tonight at once.
  onChange((what) => { if (what === 'settings') applyNight(); });
}

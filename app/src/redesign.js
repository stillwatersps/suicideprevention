// The redesigned app (app/BUILD-SPEC.md): tabs, onboarding, streaks, and meditation, on top of the
// older app layer in app.js. A draft, not reviewed. Nothing here sends anything anywhere.
import { initShell, shell } from './ui/shell.js';
import { initHome, renderHome } from './ui/home.js';
import { initCheckin, renderToday, isLowMood } from './ui/checkin.js';
import { initOnboarding, startOnboarding } from './ui/onboarding.js';
import { initSetup, renderSetup } from './ui/setup.js';
import { initSettings, renderSettings } from './ui/settings.js';
import { syncReminders } from './ui/reminders.js';
import { initStreaks, refreshStreak, addCheckInToStreak } from './ui/streaks-ui.js';
import { loadState, state, clear } from './ui/state.js';
import { CONFIG } from './core/config.js';
import { devLog } from './core/dev.js';

const todayKey = () => { const d = new Date(); return [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-'); };

// Called by app.js once what's saved has been loaded, before the page is shown.
export async function initRedesign(context) {
  if (!document.getElementById('tl-app')) return;
  await loadState();
  initShell();
  const ctx = Object.assign({}, context, {
    checkInsToday: () => context.todaysLog().length,
    checkInCount: () => context.getLog().length,
    restartOnboarding: () => startOnboarding(),
  });
  const refresh = () => {
    renderHome(ctx);
    renderToday(context.todayLines());
    renderSettings();
    renderSetup().catch((e) => devLog('setup list', e));
  };
  ctx.onSettings = () => { refreshStreak().then(refresh); };
  ctx.onPermission = refresh;
  ctx.onFinished = () => { refreshStreak().then(refresh); };
  initHome(shell, ctx);
  initCheckin(shell, ctx);
  initSetup(shell, ctx);
  initSettings(shell, ctx);
  initStreaks(shell, ctx);
  initOnboarding(shell, ctx);

  window.addEventListener('tidelight-checkin', async (event) => {
    const detail = event.detail || {};
    // A very low check-in: nothing celebrates for the rest of today.
    if ((detail.kind === 'quick' && isLowMood(detail.mood)) || CONFIG.checkIn.distressFeelings.indexOf(detail.feeling) !== -1) state.quietToday = todayKey();
    await addCheckInToStreak();
    await syncReminders(ctx.checkInsToday());
    refresh();
  });
  // Delete everything also removes the name, the home spot, the streak, and meditation history.
  window.addEventListener('tidelight-erased', async () => {
    for (const name of ['profile', 'home', 'days', 'streak', 'sessions']) await clear(name);
    await refreshStreak();
    refresh();
  });
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'visible') return;
    await refreshStreak(); // days that ended while the app was away
    await syncReminders(ctx.checkInsToday());
    refresh();
  });

  await refreshStreak();
  await syncReminders(ctx.checkInsToday());
  refresh();
  if (!state.onboarding.completed) startOnboarding();
}

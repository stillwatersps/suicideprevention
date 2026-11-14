// The redesigned app (app/BUILD-SPEC.md): tabs, onboarding, streaks, and meditation, on top of the
// older app layer in app.js. A draft, not reviewed. Nothing here sends anything anywhere.
import { initShell, shell } from './ui/shell.js';
import { initHome, renderHome } from './ui/home.js';
import { initCheckin, renderToday } from './ui/checkin.js';
import { showsSupport } from './logic/safety.js';
import { initOnboarding, startOnboarding } from './ui/onboarding.js';
import { initSetup, renderSetup } from './ui/setup.js';
import { initSettings, renderSettings } from './ui/settings.js';
import { syncReminders } from './ui/reminders.js';
import { initStreaks, refreshStreak, addCheckInToStreak, addMeditationToStreak } from './ui/streaks-ui.js';
import { initPlayer } from './ui/player.js';
import { initMeditate, renderSuggestion, renderHistory, startType } from './ui/meditate.js';
import { initBuilder, renderPresets } from './ui/builder.js';
import { initFeel } from './ui/feel.js';
import { initSections } from './ui/sections.js';
import { initLock } from './ui/lock.js';
import { keepNamesHonest } from './ui/components.js';
import { replace, isQuiet, goQuiet } from './ui/state.js';
import { loadState, state, clear } from './ui/state.js';
import { CONFIG } from './core/config.js';
import { store } from './core/device-storage.js';
import { KEYS } from './core/storage.js';
import { devLog } from './core/dev.js';

// Called by app.js once what's saved has been loaded, before the page is shown.
export async function initRedesign(context) {
  if (!document.getElementById('tl-app')) return false;
  // The language the person chose with "Leer en español" or "Read in English" is remembered on
  // the phone, so the app opens in it next time. The link itself stays on every screen.
  const other = document.querySelector('.lang-switch a');
  const here = document.documentElement.lang || 'en';
  const wanted = await store.getRaw(KEYS.language);
  if (other && wanted && wanted !== here && wanted === other.getAttribute('hreflang')) { location.replace(other.getAttribute('href')); return false; }
  if (other) {
    other.addEventListener('click', async (event) => {
      event.preventDefault();
      try { await store.setRaw(KEYS.language, other.getAttribute('hreflang')); } catch (e) { devLog('language', e); }
      location.href = other.getAttribute('href');
    });
  }
  await loadState();
  // The app lock, if the person turned it on, covers the screens before any of them is filled in.
  await initLock();
  initShell();
  initFeel();
  initSections();
  const ctx = Object.assign({}, context, {
    checkInsToday: () => context.todaysLog().length,
    checkInCount: () => context.getLog().length,
    restartOnboarding: () => startOnboarding(),
  });
  const refresh = () => {
    renderHome(ctx);
    renderToday(context.todayLines(), context.removeCheckIn);
    renderSettings();
    renderSetup().catch((e) => devLog('setup list', e));
    renderHistory();
    renderSuggestion();
    renderPresets();
  };
  ctx.onSettings = () => { refreshStreak().then(refresh); };
  ctx.onPermission = refresh;
  ctx.onFinished = () => { refreshStreak().then(refresh); };
  initHome(shell, ctx);
  initCheckin(shell, ctx);
  initSetup(shell, ctx);
  initSettings(shell, ctx);
  initStreaks(shell, ctx);
  // The meditation player: a finished session (60% or more) counts toward today and the setup list.
  ctx.isQuiet = isQuiet;
  ctx.goQuiet = goQuiet;
  ctx.onMeditationDone = async () => { await addMeditationToStreak(); refresh(); };
  ctx.onPlayerClosed = refresh;
  ctx.saveFavorite = async (source) => {
    const name = source.name || source.type;
    if (state.presets.some((p) => p.favoriteOf === source.key)) return;
    await replace('presets', state.presets.concat([{ id: 'fav-' + Date.now().toString(36), name, favoriteOf: source.key, builtIn: source.builtIn || null, choices: source.choices || null }]).slice(-CONFIG.builder.presetMax));
  };
  initPlayer(shell, ctx);
  initMeditate(shell, ctx);
  ctx.startReset = () => startType('quick', { minutes: 1 });
  initBuilder(shell, ctx);
  initOnboarding(shell, ctx);
  keepNamesHonest(document.getElementById('tl-app'));

  window.addEventListener('tidelight-checkin', async (event) => {
    const detail = event.detail || {};
    // A very low check-in: nothing celebrates for the rest of today.
    if (showsSupport(detail)) await goQuiet();
    await addCheckInToStreak();
    await syncReminders(ctx.checkInsToday());
    refresh();
  });
  // One check-in was removed: today's count, the reminders, and the lists follow.
  window.addEventListener('tidelight-checkin-removed', async () => {
    await syncReminders(ctx.checkInsToday());
    refresh();
  });
  // Delete everything also removes the name, the home spot, the streak, and meditation history.
  window.addEventListener('tidelight-erased', async () => {
    for (const name of ['profile', 'home', 'days', 'streak', 'sessions']) await clear(name);
    await refreshStreak();
    refresh();
  });
  // After Quick exit the app opens on Home, never on the entry or check-in that had been open
  // (app-return.js says when). Setting up for the first time stays where it was.
  document.addEventListener('tidelight-back-from-exit', () => { if (state.onboarding.completed) shell.home(); });
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
  return true; // the newer screens are up (false above: not on this page, or leaving for the other language)
}

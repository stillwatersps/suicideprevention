// The redesigned app (app/BUILD-SPEC.md): tabs, onboarding, streaks, and meditation, on top of the
// older app layer in app.js. A draft, not reviewed. Nothing here sends anything anywhere.
import { initShell, shell } from './ui/shell.js';
import { initHome, renderHome } from './ui/home.js';
import { initCheckin, renderToday } from './ui/checkin.js';
import { showsSupport } from './logic/safety.js';
import { initOnboarding, startOnboarding, leaveAgeOnly } from './ui/onboarding.js';
import { initSetup, renderSetup } from './ui/setup.js';
import { initSettings, renderSettings } from './ui/settings.js';
import { syncReminders } from './ui/reminders.js';
import { initStreaks, refreshStreak, addCheckInToStreak, addMeditationToStreak } from './ui/streaks-ui.js';
import { initPlayer } from './ui/player.js';
import { initMeditate, renderSuggestion, renderHistory, startType } from './ui/meditate.js';
import { initBuilder, renderPresets } from './ui/builder.js';
import { initFeel } from './ui/feel.js';
import { initSections } from './ui/sections.js';
import { initLock, isLocked } from './ui/lock.js';
import { Tidelight } from './native.js';
import { initPlan, renderPlan } from './ui/plan.js';
import { initReminderWords } from './ui/reminder-words.js';
import { initToolkit, renderToolkit } from './ui/toolkit.js';
import { initCourse, renderCourse } from './ui/course.js';
import { initLetter, renderLetter } from './ui/letter.js';
import { initReach, renderReach } from './ui/reach.js';
import { initGood, renderGood } from './ui/good.js';
import { initRide } from './ui/ride.js';
import { initNearby } from './ui/nearby.js';
import { initWind } from './ui/wind.js';
import { initReframe } from './ui/reframe.js';
import { initStep } from './ui/step.js';
import { initNight } from './ui/night.js';
import { initHelps } from './ui/helps.js';
import { initSummary } from './ui/summary.js';
import { initHealth, addMindfulMinutes } from './ui/health.js';
import { initSaveNote } from './ui/save-note.js';
import { keepNamesHonest } from './ui/components.js';
import { replace, isQuiet, goQuiet } from './ui/state.js';
import { loadState, state, clear } from './ui/state.js';
import { onReminderTap } from './ui/device.js';
import { CONFIG } from './core/config.js';
import { store } from './core/device-storage.js';
import { KEYS } from './core/storage.js';
import { devLog } from './core/dev.js';

// The same name app-tabbar.js writes under.
const LANGUAGE_TAPPED = 'tidelight.language.tapped';

// Called by app.js once what's saved has been loaded, before the page is shown.
export async function initRedesign(context) {
  if (!document.getElementById('tl-app')) return false;
  // The language the person chose with "Leer en español" or "Read in English" is remembered on
  // the phone, so the app opens in it next time. The link itself stays on every screen.
  const other = document.querySelector('.lang-switch a');
  const here = document.documentElement.lang || 'en';
  let wanted = await store.getRaw(KEYS.language);
  // The link was tapped on one of the website's pages inside the app (app-tabbar.js notes it for
  // this visit): that is the person's choice too, and it is kept here, where the app can save.
  let tapped = null;
  try { tapped = window.sessionStorage.getItem(LANGUAGE_TAPPED); window.sessionStorage.removeItem(LANGUAGE_TAPPED); } catch (e) { /* no session storage */ }
  if ((tapped === 'en' || tapped === 'es') && tapped !== wanted) {
    wanted = tapped;
    try { await store.setRaw(KEYS.language, tapped); } catch (e) { devLog('language', e); }
  }
  // Going to the other language keeps the tab or screen the address asked for. 'leaving' tells
  // app.js to stop there: this page must not use up the place a widget or shortcut asked for.
  if (other && wanted && wanted !== here && wanted === other.getAttribute('hreflang')) { location.replace(other.getAttribute('href') + location.hash); return 'leaving'; }
  if (other) {
    other.addEventListener('click', async (event) => {
      event.preventDefault();
      try { await store.setRaw(KEYS.language, other.getAttribute('hreflang')); } catch (e) { devLog('language', e); }
      location.href = other.getAttribute('href');
    });
  }
  initSaveNote();
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
  initPlan(shell, ctx);
  initReminderWords(shell, ctx);
  initToolkit(shell);
  initCourse(shell);
  initLetter(shell);
  initReach(shell);
  initGood(shell);
  initRide(shell);
  initNearby();
  initWind(shell);
  initReframe(shell);
  // The person's own "things you'd like to try", as the older check-in page holds them now.
  initStep(shell, () => (context.api && context.api.getState ? context.api.getState().explore : []));
  initNight(shell);
  initHelps(shell, ctx);
  initSummary(shell, ctx);
  initHealth(shell);
  // The meditation player: a finished session (60% or more) counts toward today and the setup list.
  ctx.isQuiet = isQuiet;
  ctx.goQuiet = goQuiet;
  // A finished meditation counts toward today, and, only if the person turned that on, is added
  // to Apple Health as mindful minutes.
  ctx.onMeditationDone = async (entry) => { await addMeditationToStreak(); addMindfulMinutes(entry); refresh(); };
  ctx.onPlayerClosed = refresh;
  ctx.saveFavorite = async (source) => {
    const name = source.name || source.type;
    if (state.presets.some((p) => p.favoriteOf === source.key)) return true;
    // The list is full: say so (the player does), and remove nothing the person saved.
    if (state.presets.length >= CONFIG.builder.presetMax) return false;
    await replace('presets', state.presets.concat([{ id: 'fav-' + Date.now().toString(36), name, favoriteOf: source.key, builtIn: source.builtIn || null, choices: source.choices || null }]));
    return true;
  };
  initPlayer(shell, ctx);
  initMeditate(shell, ctx);
  ctx.startReset = () => startType('quick', { minutes: 1 });
  // Grounding's "Breathe for a minute" is the same silent one-minute reset.
  const groundBreathe = document.getElementById('tl-ground-breathe');
  if (groundBreathe) groundBreathe.addEventListener('click', () => ctx.startReset());
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
  // Delete everything also removes the name, the home spot, the streak, meditation history, and
  // the safety plan.
  window.addEventListener('tidelight-erased', async () => {
    for (const name of ['profile', 'home', 'days', 'streak', 'sessions', 'plan', 'letter', 'reach', 'good', 'course', 'toolkit']) await clear(name);
    renderPlan();
    renderToolkit();
    renderCourse();
    renderLetter();
    renderReach();
    renderGood();
    await refreshStreak();
    refresh();
  });
  // Opened from the widget, at a place it names: the safety plan, or a minute of breathing. The
  // phone hands over only that one word. Setting up for the first time is never skipped, and the
  // app lock, if it is on, still covers the plan; a breathing minute never starts behind the lock.
  window.addEventListener('tidelight-launch', (event) => {
    const target = event.detail || '';
    if (target !== '#tl-plan' && target !== '#tl-breathe') return;
    // The phone keeps the place until the page takes it; taking it here means it is used once.
    try { Promise.resolve(Tidelight.takeLaunchTarget()).catch(() => {}); } catch (e) { /* web */ }
    if (!state.onboarding.completed) return;
    leaveAgeOnly();
    if (target === '#tl-plan') shell.pushOver('plan');
    else if (!isLocked()) ctx.startReset();
  });
  // A tapped check-in reminder opens the Check-in tab (shell.js listens). Never during first setup.
  onReminderTap(() => { if (!state.onboarding.completed) return; leaveAgeOnly(); window.dispatchEvent(new CustomEvent('tidelight-launch', { detail: '#ci-today' })); });
  // After Quick exit the app opens on Home, never on the entry or check-in that had been open
  // (app-return.js says when). Setting up for the first time stays where it was.
  document.addEventListener('tidelight-back-from-exit', () => { if (state.onboarding.completed) { leaveAgeOnly(); shell.home(); } });
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

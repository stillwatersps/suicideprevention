// What the redesign keeps on the phone, loaded once and held here: one source of truth for
// settings, the person's name, onboarding, the home spot, days, the streak, sessions, and presets.
// Everything is saved through the storage layer. Nothing here sends anything anywhere.
import { store } from '../core/device-storage.js';
import { KEYS } from '../core/storage.js';
import { defaultSettings } from '../core/migrations.js';
import { profileFor } from '../logic/style-profile.js';
import { dateKey } from '../logic/streaks.js';
import { isQuietDay } from '../logic/safety.js';

export const state = {
  settings: defaultSettings(),
  profile: { name: '' },
  onboarding: { completed: false, setupCelebrated: false },
  home: null, // { latitude, longitude, savedAt }
  days: {},
  streak: null,
  sessions: [],
  presets: [],
};

const DEFAULTS = {
  settings: () => defaultSettings(),
  profile: () => ({ name: '' }),
  onboarding: () => ({ completed: false, setupCelebrated: false }),
  home: () => null,
  days: () => ({}),
  streak: () => null,
  sessions: () => [],
  presets: () => [],
};
const listeners = [];

export function onChange(fn) { listeners.push(fn); }
function tell(what) { listeners.forEach((fn) => fn(what)); }

export async function loadState() {
  for (const name of Object.keys(DEFAULTS)) state[name] = await store.get(KEYS[name], DEFAULTS[name]());
  applyStyle();
}
// save('settings', { checkInsPerDay: 4 }) lays the change over what's there; arrays and null replace.
export async function save(name, change) {
  const current = state[name];
  const plain = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
  if (plain(current) && plain(change)) {
    Object.keys(change).forEach((key) => {
      current[key] = plain(current[key]) && plain(change[key]) ? Object.assign({}, current[key], change[key]) : change[key];
    });
  } else {
    state[name] = change;
  }
  await store.set(KEYS[name], state[name]);
  if (name === 'settings') applyStyle();
  tell(name);
}
// Puts a whole new value in place (days, the streak, sessions, presets).
export async function replace(name, value) {
  state[name] = value;
  await store.set(KEYS[name], value);
  tell(name);
}
export async function clear(name) {
  state[name] = DEFAULTS[name]();
  await store.remove(KEYS[name]);
  tell(name);
}

// A day with a very low check-in is "quiet": nothing celebrates for the rest of it. The day is
// kept on the phone with the onboarding record, so closing and reopening the app doesn't forget.
export const todayKey = () => dateKey(new Date());
export const isQuiet = () => isQuietDay(state.onboarding.quietDay, todayKey());
export async function goQuiet() { if (!isQuiet()) await save('onboarding', { quietDay: todayKey() }); }

export const style = () => state.settings.checkInStyle;
export const profile = () => profileFor(state.settings.checkInStyle);
export function reducedMotion() {
  return Boolean(state.settings.reduceMotion) || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

// The style and motion choices reach the stylesheet as classes and one speed number.
export function applyStyle() {
  const root = document.documentElement;
  const p = profile();
  root.classList.toggle('tl-style-calm', p.id === 'calm');
  root.classList.toggle('tl-style-straightforward', p.id === 'straightforward');
  root.classList.toggle('tl-reduce', Boolean(state.settings.reduceMotion));
  root.style.setProperty('--tl-speed', String(p.speed));
}

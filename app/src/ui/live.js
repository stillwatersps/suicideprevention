// "Show a breathing session on the Lock Screen" (Settings, iPhone only, off until turned on).
// While a 1-minute reset or a "Breathe in a pattern" session runs, the phone's Lock Screen shows
// the app's name, the word "Breathing", and the time left. The phone is told one thing: how long
// the session is. It is taken down when the session ends, is paused, or is left.
import { Capacitor } from '@capacitor/core';
import { Tidelight } from '../native.js';
import { state, save } from './state.js';

const $ = (sel) => document.querySelector(sel);
const hooks = () => window.__tidelight || {};
// Only sessions that are breathing and nothing else. A sleep session never shows on the Lock Screen.
export const LIVE_TYPES = ['quick', 'breathe'];
let showing = false;

export const liveAvailable = () => Capacitor.getPlatform() === 'ios' || Boolean(hooks().onActivity);

export function liveStart(meditation) {
  if (!state.settings.lockScreenBreathing || !liveAvailable() || LIVE_TYPES.indexOf(meditation.type) === -1) return;
  showing = true;
  try { Promise.resolve(Tidelight.startBreathingActivity({ seconds: meditation.totalSeconds })).catch(() => {}); } catch (e) { /* the session goes on without it */ }
}
export function liveEnd() {
  if (!showing) return;
  showing = false;
  try { Promise.resolve(Tidelight.endBreathingActivity()).catch(() => {}); } catch (e) { /* nothing was showing */ }
}

export function initLive(shell) {
  const box = $('#tl-set-live-box');
  const toggle = $('#tl-set-live');
  if (!box || !toggle) return;
  box.hidden = !liveAvailable();
  const show = () => { toggle.checked = Boolean(state.settings.lockScreenBreathing); };
  toggle.addEventListener('change', async () => {
    await save('settings', { lockScreenBreathing: toggle.checked });
    if (!toggle.checked) liveEnd();
  });
  shell.onShow('settings', show);
  show();
}

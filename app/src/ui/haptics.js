// The haptics helper. Screens call haptic('tap') and the like; they never call the phone's API.
// On iPhone the project's own plugin makes the pulse; elsewhere the browser's vibrate does, where
// it exists; on a device with neither, nothing happens and nothing breaks.
// The global Haptics setting silences everything here except haptic breathing, which has its own.
import { Capacitor } from '@capacitor/core';
import { Tidelight } from '../native.js';
import { createHaptics } from '../logic/haptic-patterns.js';
import { state, style } from './state.js';

const MS = { selection: 8, soft: 10, light: 14, medium: 24, success: 30, warning: 36 };
const hooks = () => (typeof window !== 'undefined' && window.__tidelight) || {};

function findDriver() {
  if (Capacitor.getPlatform() === 'ios' || hooks().onHaptic) {
    return (pulse) => { Tidelight.haptic({ style: pulse.style, intensity: pulse.intensity }).catch(() => {}); };
  }
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    return (pulse) => { try { navigator.vibrate(Math.round((MS[pulse.style] || 14) * (0.6 + 0.4 * (pulse.intensity ?? 1)))); } catch (e) { /* not allowed: stay quiet */ } };
  }
  return null;
}

let helper = null;
function get() {
  if (!helper) {
    helper = createHaptics({
      driver: findDriver(),
      now: () => (typeof performance !== 'undefined' ? performance.now() : Date.now()),
      isOn: () => Boolean(state.settings.haptics) && document.visibilityState === 'visible',
      getStyle: style,
      schedule: (fn, ms) => setTimeout(fn, ms),
    });
  }
  return helper;
}

export function haptic(name) { return get().fire(name); }
// Haptic breathing: its own switch (in Settings and in the player), not the global one.
export function breathHaptic(strength) { return get().breath(strength); }

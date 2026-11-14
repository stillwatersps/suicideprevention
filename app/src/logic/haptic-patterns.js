// Named haptic patterns, by check-in style. Pure: the phone's part is handed in as a driver, so
// Node can test the table and the throttle. Screens ask for a pattern by name through
// src/ui/haptics.js and never call the phone's haptics themselves.
import { CONFIG } from '../core/config.js';

// Each pattern is a list of pulses: { style, intensity (0 to 1), after (ms since the last pulse) }.
// Styles the phone knows: 'light', 'medium', 'soft', 'selection', 'success', 'warning'.
const one = (style, intensity = 1) => [{ style, intensity, after: 0 }];
export const HAPTICS = Object.freeze({
  tap: { calm: one('light', 0.7), straightforward: one('light') },
  select: { calm: one('selection'), straightforward: one('selection') },
  sliderTick: { calm: one('soft', 0.4), straightforward: one('light', 0.6) },
  sliderTickStrong: { calm: one('light', 0.8), straightforward: one('medium', 0.8) },
  toggle: { calm: one('light'), straightforward: one('medium') },
  success: { calm: one('soft', 0.9), straightforward: one('success') },
  milestone: {
    calm: [{ style: 'light', intensity: 0.7, after: 0 }, { style: 'light', intensity: 0.85, after: 140 }, { style: 'medium', intensity: 0.8, after: 140 }],
    straightforward: [{ style: 'medium', intensity: 0.8, after: 0 }, { style: 'medium', intensity: 0.9, after: 120 }, { style: 'medium', intensity: 1, after: 120 }],
  },
  warning: { calm: one('light', 0.9), straightforward: one('warning') },
});
export const PATTERN_NAMES = Object.freeze(Object.keys(HAPTICS));

export function patternFor(name, style) {
  const entry = HAPTICS[name];
  if (!entry) return [];
  return entry[style] || entry.calm;
}

// One breath pulse, by strength (0 to 1) and style: Calm stays light, Straightforward goes to medium.
export function breathPulse(strength, style) {
  const s = Math.max(0, Math.min(1, strength));
  if (style === 'straightforward') return { style: s > 0.6 ? 'medium' : 'light', intensity: 0.4 + 0.6 * s, after: 0 };
  return { style: s > 0.5 ? 'light' : 'soft', intensity: 0.3 + 0.5 * s, after: 0 };
}

// The same pattern can't fire more than once every 50 ms (a fast slider would otherwise buzz).
export function createThrottle(now, gapMs = CONFIG.haptics.throttleMs) {
  const last = new Map();
  return (name) => {
    const t = now();
    if (last.has(name) && t - last.get(name) < gapMs) return false;
    last.set(name, t);
    return true;
  };
}

// The helper itself. driver(pulse) performs one pulse, or is null on a device with no haptics.
// isOn() is the global Haptics setting; breathing has its own switch and ignores it.
export function createHaptics({ driver, now, isOn, getStyle, schedule }) {
  const allow = createThrottle(now);
  const play = (pulses) => {
    if (!driver) return 0;
    let delay = 0;
    pulses.forEach((pulse) => {
      delay += pulse.after || 0;
      if (delay === 0) driver(pulse); else schedule(() => driver(pulse), delay);
    });
    return pulses.length;
  };
  return {
    fire(name) {
      if (!isOn() || !allow(name)) return 0;
      return play(patternFor(name, getStyle()));
    },
    breath(strength) { return play([breathPulse(strength, getStyle())]); },
  };
}

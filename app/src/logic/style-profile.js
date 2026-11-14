// The check-in style, read by the whole app. Two profiles: Calm is softer and slower,
// Straightforward is clipped and quick. Both are kind. The words for each style are in
// src/text/redesign.*.html, keyed by data-style; this file holds everything that isn't words.
import { CONFIG } from '../core/config.js';

export const STYLES = ['calm', 'straightforward'];

export const PROFILES = Object.freeze({
  calm: Object.freeze({
    id: 'calm',
    speed: CONFIG.motion.calmMultiplier, // animation duration multiplier
    transition: 'fade',
    hapticIntensity: 'light',
    breathBeforeCheckIn: true, // one optional guided breath before answering
    guideCountdown: false,
  }),
  straightforward: Object.freeze({
    id: 'straightforward',
    speed: CONFIG.motion.straightforwardMultiplier,
    transition: 'slide',
    hapticIntensity: 'medium',
    breathBeforeCheckIn: false,
    guideCountdown: true,
  }),
});

export function profileFor(style) {
  return PROFILES[style] || PROFILES[CONFIG.checkIn.styleDefault];
}

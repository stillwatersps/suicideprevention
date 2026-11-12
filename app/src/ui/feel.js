// Touch feedback for the whole redesign, wired in one place: every button, card, and tile gives a
// light tap, every switch a toggle. Chips, choice cards, faces, tabs, the stepper, and the slider give
// their own (select or a tick) where they are handled. Screens never call the phone's haptics.
import { haptic } from './haptics.js';

const TAPPABLE = '.tl-btn, .tl-icon-btn, .tl-card-action, .tl-scene-chip, .tl-tile, .tl-month-card';
// Crisis controls give no feedback of the app's own: nothing on the way to help should buzz, and
// nothing there could be mistaken for an error.
const CRISIS = '.tl-support-actions, .tl-support-now, .tl-crisis-btn, .tl-player-support, [href="#support"], [href^="tel:"], [href^="sms:"]';
const OWN = '[data-value], .tl-tab, .tl-stepper, #tl-player-end, [data-preset="delete"], #tl-set-home-clear, #tl-ob-start, #tl-flow-done';

export function initFeel() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest(TAPPABLE);
    if (!target || target.disabled || target.closest(OWN) || target.closest(CRISIS)) return;
    if (!target.closest('.tl-app, .tl-tabbar')) return;
    haptic('tap');
  });
  document.addEventListener('change', (event) => {
    if (event.target.matches && event.target.matches('.tl-app input[type="checkbox"]')) haptic('toggle');
  });
}

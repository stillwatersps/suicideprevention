// Touch feedback for the whole redesign, wired in one place: every button and card gives a light
// tap, every switch a toggle. Chips, choice cards, faces, tabs, the stepper, and the slider give
// their own (select or a tick) where they are handled. Screens never call the phone's haptics.
import { haptic } from './haptics.js';

const TAPPABLE = '.tl-btn, .tl-icon-btn, .tl-card-action, .tl-scene-chip';
const OWN = '[data-value], .tl-tab, .tl-stepper, #tl-player-end, [data-preset="delete"], #tl-set-home-clear, #tl-ob-start, #tl-flow-done';

export function initFeel() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest(TAPPABLE);
    if (!target || target.disabled || target.closest(OWN)) return;
    if (!target.closest('.tl-app, .tl-tabbar')) return;
    haptic('tap');
  });
  document.addEventListener('change', (event) => {
    if (event.target.matches && event.target.matches('.tl-app input[type="checkbox"]')) haptic('toggle');
  });
}

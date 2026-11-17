// "Wind down for sleep": four small things to do before bed, ticked off one at a time, then the
// Sleep session. The ticks are only on the screen: nothing is kept, and they are cleared each
// time the screen opens. A draft: no licensed reviewer has seen it.
import { startType } from './meditate.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));

export function initWind(shell) {
  const screen = $('#tl-wind');
  if (!screen) return;
  const boxes = () => $$('[data-wind-step] input', screen);
  const clear = () => boxes().forEach((box) => { box.checked = false; });
  $('#tl-wind-start').addEventListener('click', () => { startType('sleep'); });
  shell.onShow('wind', clear);
  clear();
}

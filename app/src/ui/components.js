// Shared building blocks for the redesign: icons, buttons' press and haptic hook, the stepper,
// the progress ring, chips, and choice cards. Looks come from redesign.css and the tokens.
import { haptic } from './haptics.js';
import { CONFIG } from '../core/config.js';
import { ICONS } from './icons.js';

const SVG = 'http://www.w3.org/2000/svg';
export function icon(name, large) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', 'tl-icon' + (large ? ' tl-icon-lg' : ''));
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('d', ICONS[name] || ICONS.horizon);
  svg.appendChild(path);
  return svg;
}

// Every [data-tl-icon="name"] placeholder in the word blocks gets its drawing.
export function drawIcons(scope) {
  (scope || document).querySelectorAll('[data-tl-icon]').forEach((el) => {
    if (el.firstChild) return;
    el.appendChild(icon(el.getAttribute('data-tl-icon'), el.hasAttribute('data-tl-large')));
  });
}

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

// Stepper: minus, a large number, plus. The markup is in the word blocks.
export function stepper(root, { min, max, value, onChange }) {
  const out = root.querySelector('.tl-stepper-value');
  const [less, more] = [root.querySelector('[data-tl-step="-1"]'), root.querySelector('[data-tl-step="1"]')];
  let current = value;
  function show() {
    out.textContent = String(current);
    less.disabled = current <= min;
    more.disabled = current >= max;
  }
  function step(by) {
    const next = Math.max(min, Math.min(max, current + by));
    if (next === current) return;
    current = next;
    haptic('sliderTick');
    show();
    onChange(current);
  }
  less.addEventListener('click', () => step(-1));
  more.addEventListener('click', () => step(1));
  show();
  return { set(v) { current = Math.max(min, Math.min(max, v)); show(); }, get: () => current };
}

// A slim progress line. The markup is <span class="tl-progress"><span></span></span>.
export function progressLine(root) {
  const bar = root.querySelector('span');
  return { set(fraction) { bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, fraction)).toFixed(3) + ')'; } };
}

// A group of choice cards or chips where one (or several) can be picked.
export function choiceGroup(root, { multiple = false, onChange }) {
  const items = () => Array.from(root.querySelectorAll('[data-value]'));
  function picked() { return items().filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.getAttribute('data-value')); }
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-value]');
    if (!button || !root.contains(button) || button.disabled) return;
    const on = button.getAttribute('aria-pressed') === 'true';
    if (multiple) button.setAttribute('aria-pressed', String(!on));
    else items().forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    haptic('select');
    if (onChange) onChange(multiple ? picked() : button.getAttribute('data-value'), button);
  });
  return {
    get: () => (multiple ? picked() : picked()[0] || null),
    set(value) {
      const wanted = Array.isArray(value) ? value.map(String) : [String(value)];
      items().forEach((b) => b.setAttribute('aria-pressed', String(wanted.includes(b.getAttribute('data-value')))));
    },
  };
}

// Numbers that change count up or down instead of jumping, unless motion is reduced.
export function animateNumber(node, to, reduced) {
  const from = Number(node.textContent) || 0;
  if (reduced || from === to || !window.requestAnimationFrame) { node.textContent = String(to); return; }
  const start = performance.now();
  const span = CONFIG.motion.numberMs;
  (function frame(now) {
    const p = Math.min(1, (now - start) / span);
    node.textContent = String(Math.round(from + (to - from) * p));
    if (p < 1) requestAnimationFrame(frame);
  })(start);
}

// A control whose spoken name was written separately from the words on it (a card that reads
// "Next check-in, at 2:30 PM, Start" but is named "Start a check-in") is hard to use by voice:
// people say what they see. This keeps the written name and puts the words on screen in front of
// it. No word is added or changed: both parts are already in the text.
const tidyText = (text) => String(text || '').replace(/\s+/g, ' ').trim();
export function honestName(control) {
  // `data-tl-name` is the name as written; `data-tl-said` is the name this function last gave.
  // If the label is no longer what was last said, a screen has written a new name: start from it.
  const current = control.getAttribute('aria-label') || '';
  const written = control.getAttribute('data-tl-said') === current ? (control.getAttribute('data-tl-name') || '') : current;
  if (!written) return;
  const seen = tidyText(control.innerText || '');
  const name = !seen || written.toLowerCase().includes(seen.toLowerCase()) ? written : `${seen}. ${written}`;
  control.setAttribute('data-tl-name', written);
  control.setAttribute('data-tl-said', name);
  if (current !== name) control.setAttribute('aria-label', name);
}
export function keepNamesHonest(root) {
  if (!root) return;
  const all = () => root.querySelectorAll('button[aria-label], a[aria-label]').forEach(honestName);
  all();
  if (!window.MutationObserver) return;
  let waiting = false;
  new MutationObserver(() => { if (waiting) return; waiting = true; requestAnimationFrame(() => { waiting = false; all(); }); })
    .observe(root, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'aria-label'] });
}


// Shared building blocks for the redesign: icons, buttons' press and haptic hook, the stepper,
// the progress ring, chips, and choice cards. Looks come from redesign.css and the tokens.
import { haptic } from './haptics.js';

const SVG = 'http://www.w3.org/2000/svg';
// 24 by 24 line icons, drawn here so nothing loads from anywhere.
const ICONS = {
  wave: 'M2 9c3-3 5-3 8 0s5 3 8 0 3-2 4-2M2 15c3-3 5-3 8 0s5 3 8 0 3-2 4-2',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  lotus: 'M12 5c2 2.5 2 6.5 0 11-2-4.5-2-8.500 0-11zM4 11c3 0 6 2 8 5-4 1-7-1-8-5zM20 11c-3 0-6 2-8 5 4 1 7-1 8-5zM5 19h14',
  pin: 'M12 21s6-5.6 6-10.500a6 6 0 0 0-12 0C6 15.400 12 21 12 21zM12 8.500a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  people: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 19c0-3 2.700-5 6-5s6 2 6 5M16 5.500a3 3 0 0 1 0 5.500M17.500 14.300c2 .600 3.500 2.300 3.500 4.700',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 12a7 7 0 0 0-.100-1.300l2-1.500-2-3.400-2.300.900a7 7 0 0 0-2.200-1.300L14 3h-4l-.400 2.400a7 7 0 0 0-2.200 1.300l-2.300-.900-2 3.400 2 1.500a7 7 0 0 0 0 2.600l-2 1.500 2 3.400 2.300-.900a7 7 0 0 0 2.200 1.300L10 21h4l.400-2.400a7 7 0 0 0 2.200-1.300l2.300.900 2-3.400-2-1.500c.100-.400.100-.800.100-1.300z',
  back: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  check: 'M5 12.500l4.500 4.500L19 7.500',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  book: 'M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4zM5 17a3 3 0 0 1 3-3h10',
  spark: 'M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3',
  box: 'M4 8l8-4 8 4v8l-8 4-8-4V8zM4 8l8 4 8-4M12 12v8',
  path: 'M5 19c0-6 14-4 14-10a3 3 0 0 0-6 0M5 19h.010M19 5h.010',
  bolt: 'M13 3L5 13h6l-1 8 8-10h-6l1-8z',
  moon: 'M20 14.500A8 8 0 0 1 9.500 4a7 7 0 1 0 10.500 10.500z',
  quiet: 'M5 9v6h3l5 4V5L8 9H5zM17 9l4 6M21 9l-4 6',
  sound: 'M5 9v6h3l5 4V5L8 9H5zM16.500 9a4 4 0 0 1 0 6M19 6.500a8 8 0 0 1 0 11',
  voice: 'M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v3',
  vibrate: 'M8 5h8v14H8zM4 9v6M20 9v6',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 4l13 8-13 8V4z',
  close: 'M6 6l12 12M18 6L6 18',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l1.500 2h-15L6 16zM10 20a2 2 0 0 0 4 0',
  home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4v-9z',
  snow: 'M12 3v18M4.200 7.500l15.600 9M19.800 7.500l-15.600 9',
  star: 'M12 4l2.400 5 5.600.800-4 3.900.900 5.500-4.900-2.600-4.900 2.600.900-5.500-4-3.900 5.600-.800L12 4z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  sliders: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.500v.010',
  trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
  edit: 'M4 20h4l10-10-4-4L4 16v4zM13 7l4 4',
  copy: 'M9 9h10v11H9zM5 15V4h10',
  tree: 'M12 3l6 9h-3l4 6H5l4-6H6l6-9zM12 18v3',
  rain: 'M7 15a4 4 0 0 1 .500-8 5.500 5.500 0 0 1 10.500 1.500A3.500 3.500 0 0 1 17.500 15H7zM9 18l-1 2.500M13 18l-1 2.500M17 18l-1 2.500',
  noise: 'M3 12h2l2-5 3 10 3-13 3 11 2-5h3',
};

export function icon(name, large) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', 'tl-icon' + (large ? ' tl-icon-lg' : ''));
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('d', ICONS[name] || ICONS.wave);
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

// ProgressRing: an animated circle with a label in the middle.
export function progressRing(root) {
  const R = 44;
  const C = 2 * Math.PI * R;
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('aria-hidden', 'true');
  const circle = (cls) => {
    const c = document.createElementNS(SVG, 'circle');
    c.setAttribute('cx', '50'); c.setAttribute('cy', '50'); c.setAttribute('r', String(R));
    c.setAttribute('class', cls);
    svg.appendChild(c);
    return c;
  };
  circle('tl-ring-track');
  const bar = circle('tl-ring-bar');
  bar.style.strokeDasharray = String(C);
  const label = el('span', 'tl-ring-label');
  root.classList.add('tl-ring');
  root.textContent = '';
  root.append(svg, label);
  return {
    set(fraction, text) {
      bar.style.strokeDashoffset = String(C * (1 - Math.max(0, Math.min(1, fraction))));
      label.textContent = text;
    },
  };
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
  const span = 400;
  (function frame(now) {
    const p = Math.min(1, (now - start) / span);
    node.textContent = String(Math.round(from + (to - from) * p));
    if (p < 1) requestAnimationFrame(frame);
  })(start);
}

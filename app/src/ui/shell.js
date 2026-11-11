// The app's shell: five bottom tabs, each with its own stack of screens. Adding a tab is one
// line in TABS (plus its word and its screen in src/text/redesign.*.html).
// The safety frame (crisis strip, Exit, Get Support Now, the Spanish link, the review notices,
// privacy, Support, and the 988 panel) is outside the shell and is never hidden by it.
import { t } from './words.js';
import { icon, drawIcons, el } from './components.js';
import { haptic } from './haptics.js';

export const TABS = [
  { id: 'home', icon: 'wave' },
  { id: 'checkin', icon: 'heart' },
  { id: 'meditate', icon: 'lotus' },
  { id: 'location', icon: 'pin' },
  { id: 'friends', icon: 'people' },
];

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
const root = document.documentElement;
const stacks = {};
const showHandlers = {};
const hideHandlers = {};
let active = 'home';
let bar = null;

const screenEl = (name) => document.getElementById('tl-' + name);
const top = (tab) => stacks[tab][stacks[tab].length - 1];

function render(focus) {
  const showing = top(active);
  $$('.tl-screen').forEach((screen) => {
    const on = screen.id === 'tl-' + showing;
    if (on && screen.hidden) {
      screen.hidden = false;
      screen.classList.remove('tl-fade');
      void screen.offsetWidth; // restart the fade
      screen.classList.add('tl-fade');
    } else if (!on && !screen.hidden) {
      screen.hidden = true;
      const name = screen.id.slice(3);
      (hideHandlers[name] || []).forEach((fn) => fn());
    }
  });
  $$('.tl-tab', bar).forEach((button) => {
    if (button.getAttribute('data-tl-tab-btn') === active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  (showHandlers[showing] || []).forEach((fn) => fn());
  if (focus) {
    window.scrollTo(0, 0);
    const screen = screenEl(showing);
    if (screen) screen.focus({ preventScroll: true });
  }
}

export const shell = {
  current: () => ({ tab: active, screen: top(active) }),
  onShow(name, fn) { (showHandlers[name] = showHandlers[name] || []).push(fn); },
  onHide(name, fn) { (hideHandlers[name] = hideHandlers[name] || []).push(fn); },
  // Tapping the tab you're on goes back to its first screen and scrolls to the top.
  go(tab) {
    if (!stacks[tab]) return;
    if (tab === active) stacks[tab].length = 1;
    active = tab;
    render(true);
  },
  push(name) {
    const screen = screenEl(name);
    if (!screen) return;
    const tab = screen.getAttribute('data-tl-tab') || active;
    active = tab;
    if (name === tab) { stacks[tab].length = 1; render(true); return; }
    const at = stacks[tab].indexOf(name);
    if (at >= 0) stacks[tab].length = at + 1; else stacks[tab].push(name);
    render(true);
  },
  back() {
    if (stacks[active].length > 1) stacks[active].length -= 1;
    render(true);
  },
  // A full-screen moment (onboarding, a meditation): the tab bar steps aside. The safety frame stays.
  setFull(on) { root.classList.toggle('tl-full', Boolean(on)); },
  // The older sections (Today, Rediscover, Journal, Hope box, Your journey) open inside Check-in.
  openLegacy(panelId, start) {
    shell.push('legacy');
    if (start) { const go = $('[data-ci-start]'); if (go) go.click(); return; }
    const tab = $('.ci-tabs a[href="#' + panelId + '"]');
    if (tab) tab.click();
  },
  // Show whatever screen holds this element, then scroll to it.
  reveal(target) {
    if (!target) return false;
    const screen = target.closest('.tl-screen');
    if (!screen) return false;
    if (screen.hidden) shell.push(screen.id.slice(3));
    const panel = target.closest('.ci-panel');
    if (panel && panel.classList.contains('ci-off')) {
      const tab = $('.ci-tabs a[href="#' + panel.id + '"]');
      if (tab) tab.click();
    }
    target.scrollIntoView({ block: 'start' });
    return true;
  },
};

function buildTabBar() {
  bar = $('#tl-tabbar');
  const list = el('ul');
  TABS.forEach((tab) => {
    const button = el('button', 'tl-tab');
    button.type = 'button';
    button.setAttribute('data-tl-tab-btn', tab.id);
    button.append(icon(tab.icon), el('span', 'tl-tab-label', t('tab.' + tab.id)));
    button.addEventListener('click', () => { haptic('select'); shell.go(tab.id); });
    const item = el('li');
    item.appendChild(button);
    list.appendChild(item);
    stacks[tab.id] = [tab.id];
  });
  bar.appendChild(list);
}

// The older sections keep their own row of tabs. They move, unchanged, into one screen.
function adoptLegacy() {
  const legacy = $('#tl-legacy');
  const body = $('.ci-body');
  $$('.ci-tabs, .ci-panel', body).forEach((part) => { if (part.parentNode === body) legacy.appendChild(part); });
}
// Sections that now have a tab or a screen of their own move there, whole and unchanged.
function relocate(selector, slot) {
  const part = $(selector);
  const home = $(slot);
  if (part && home) home.appendChild(part);
}

export function initShell() {
  root.classList.add('tl');
  // The height of the crisis strip, which stays above everything, for screens that fill the rest.
  const strip = $('.crisis-bar');
  const measure = () => { if (strip) root.style.setProperty('--tl-top', strip.offsetHeight + 'px'); };
  measure();
  window.addEventListener('resize', measure);
  buildTabBar();
  adoptLegacy();
  relocate('.app-places', '#tl-location-slot');
  relocate('.app-circle', '#tl-friends-slot');
  relocate('.app-settings', '#tl-settings-age-slot');
  drawIcons();

  document.addEventListener('click', (event) => {
    const go = event.target.closest('[data-tl-go]');
    if (go) { shell.go(go.getAttribute('data-tl-go')); return; }
    const push = event.target.closest('[data-tl-push]');
    if (push) {
      shell.push(push.getAttribute('data-tl-push'));
      const anchor = push.getAttribute('data-tl-anchor') && document.getElementById(push.getAttribute('data-tl-anchor'));
      if (anchor) anchor.scrollIntoView({ block: 'start' });
      return;
    }
    const legacy = event.target.closest('[data-tl-legacy]');
    if (legacy) { shell.openLegacy(legacy.getAttribute('data-tl-legacy'), legacy.hasAttribute('data-tl-start')); return; }
    if (event.target.closest('[data-tl-back]')) { shell.back(); return; }
    // A link to something on another screen (for example "Your journey") opens that screen first.
    const link = event.target.closest('a[href^="#"]');
    if (link && link.getAttribute('href').length > 1) {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      const screen = target && target.closest('.tl-screen');
      if (screen && screen.hidden) {
        shell.push(screen.id.slice(3));
        if (!target.closest('.ci-panel')) {
          event.preventDefault();
          target.scrollIntoView({ block: 'start' });
          if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
        }
      }
    }
  });
  // The phone opened the app from a check-in reminder.
  window.addEventListener('tidelight-launch', (event) => { if (event.detail === '#ci-today') shell.go('checkin'); });
  const hashTarget = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
  if (hashTarget && hashTarget.closest('.tl-screen')) shell.reveal(hashTarget); else render(false);
}

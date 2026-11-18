// Settings, three comforts: always use the dark colors, easier reading, and a "Read aloud" button.
// All three are off until turned on, and are kept with the settings on this phone.
// Read aloud uses the phone's own voice (nothing is sent anywhere), only when its button is
// tapped, and reads what is on the screen: never what is in a field being typed in.
import { state, save } from './state.js';
import { t, lang } from './words.js';
import { el } from './components.js';
import { applyNight } from './night.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
const root = document.documentElement;
const hooks = () => window.__tidelight || {};
let reading = null; // the button of the screen being read
const buttons = []; // each screen's Back row and its Read aloud button, on the page only while the setting is on

function applyComfort() {
  root.classList.toggle('tl-easy', Boolean(state.settings.easyRead));
  root.classList.toggle('tl-reads', Boolean(state.settings.readAloud));
  if (!state.settings.readAloud) stopReading();
  buttons.forEach(([head, button]) => {
    if (!state.settings.readAloud) { if (button.isConnected) head.removeChild(button); } else if (!button.isConnected) head.appendChild(button);
  });
}

// The words on a screen, in order: headings, paragraphs, list items, labels, and the two lines of
// a card. Nothing hidden, nothing in the Back row, and never the contents of a field.
export function screenWords(screen) {
  const parts = [];
  $$('h2, h3, h4, p, li, label, .tl-card-title, .tl-card-sub', screen).forEach((node) => {
    if (node.closest('[hidden], .tl-legacy-head, .tl-draft-tag') || !node.getClientRects().length) return;
    if (node.querySelector('p, li, h3, h4, label, .tl-card-title')) return; // its parts are read on their own
    const text = node.textContent.replace(/\s+/g, ' ').trim();
    if (text) parts.push(text);
  });
  return parts;
}

export function stopReading() {
  if (!reading) return;
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* nothing was speaking */ }
  reading.textContent = t('read.start');
  reading.setAttribute('aria-pressed', 'false');
  reading = null;
}

function read(screen, button) {
  const parts = screenWords(screen);
  stopReading();
  if (hooks().onReadAloud) {
    hooks().onReadAloud({ text: parts.join(' '), lang: lang() }); // automated runs: recorded, never spoken
  } else if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
    const line = new window.SpeechSynthesisUtterance(parts.join('. '));
    line.lang = lang();
    line.onend = () => { if (reading === button) stopReading(); };
    line.onerror = line.onend;
    window.speechSynthesis.speak(line);
  } else {
    button.textContent = t('read.none');
    return;
  }
  reading = button;
  button.textContent = t('read.stop');
  button.setAttribute('aria-pressed', 'true');
}

export function initComfort(shell) {
  const switches = { '#tl-set-dark': 'alwaysDark', '#tl-set-easy': 'easyRead', '#tl-set-read': 'readAloud' };
  if (!$('#tl-set-dark')) return;
  const show = () => Object.keys(switches).forEach((sel) => { $(sel).checked = Boolean(state.settings[switches[sel]]); });
  Object.keys(switches).forEach((sel) => {
    $(sel).addEventListener('change', async (event) => {
      await save('settings', { [switches[sel]]: event.target.checked });
      applyComfort();
      applyNight();
    });
  });
  // One button for the Back row of each screen that has one. It is put on the page only while Read aloud
  // is on, so a screen that asks for nothing has no extra control otherwise.
  $$('.tl-screen').forEach((screen) => {
    const head = $('.tl-legacy-head', screen);
    if (!head || !$('[data-tl-back]', head)) return;
    const button = el('button', 'tl-btn tl-btn-quiet tl-read', t('read.start'));
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => { if (reading === button) stopReading(); else read(screen, button); });
    buttons.push([head, button]);
    shell.onHide(screen.id.slice(3), () => { if (reading === button) stopReading(); });
  });
  // Leaving the app, or Quick exit, stops the voice at once.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') stopReading(); });
  window.addEventListener('pagehide', stopReading);
  shell.onShow('settings', show);
  show();
  applyComfort();
}

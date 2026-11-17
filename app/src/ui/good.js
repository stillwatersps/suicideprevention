// "Three good things": each day, up to three things that went all right, in the person's own
// words, kept on this phone only. The rules are in src/logic/good.js; this draws the screen and
// saves it. Nothing is counted, compared, or celebrated, and a day with nothing is never
// remarked on. A draft: no licensed reviewer has seen it.
import { CONFIG } from '../core/config.js';
import { thingsOn, setDay, earlier } from '../logic/good.js';
import { state, replace, todayKey } from './state.js';
import { t, lang } from './words.js';
import { el } from './components.js';
import { devLog } from '../core/dev.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
const limits = CONFIG.good;

// "2026-11-16" as the person would say it: "Monday, November 16".
export function sayDay(day) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d, 12).toLocaleDateString(lang(), { weekday: 'long', month: 'long', day: 'numeric' });
}

function say(key) {
  const status = $('#tl-good-status');
  status.textContent = key ? t(key) : '';
  status.hidden = !key;
}

function dayRow(entry) {
  const item = el('li', 'tl-good-day');
  item.appendChild(el('span', 'tl-label', sayDay(entry.day)));
  const list = el('ul', 'tl-good-things');
  entry.things.forEach((thing) => list.appendChild(el('li', '', thing)));
  item.appendChild(list);
  const remove = el('button', 'tl-btn tl-btn-quiet', t('good.remove'));
  remove.type = 'button';
  remove.setAttribute('aria-label', t('good.removeDay', { day: sayDay(entry.day) }));
  remove.setAttribute('data-good-remove', entry.day);
  item.appendChild(remove);
  return item;
}

export function renderGood() {
  if (!$('#tl-good')) return;
  const today = todayKey();
  const mine = thingsOn(state.good, today);
  $$('[data-good-thing]').forEach((field, i) => { if (field !== document.activeElement) field.value = mine[i] || ''; });
  const before = earlier(state.good, today, limits.showDays);
  const list = $('#tl-good-earlier');
  list.textContent = '';
  before.forEach((entry) => list.appendChild(dayRow(entry)));
  $('#tl-good-earlier-box').hidden = before.length === 0;
}

async function keep(next, saidKey) {
  if (next !== state.good) { try { await replace('good', next); } catch (e) { devLog('good things', e); state.good = next; } }
  renderGood();
  say(saidKey);
  $('#tl-good-status').focus();
}

export function initGood(shell) {
  const screen = $('#tl-good');
  if (!screen) return;
  const save = () => keep(setDay(state.good, todayKey(), $$('[data-good-thing]').map((field) => field.value), limits), 'good.saved');
  $('#tl-good-save').addEventListener('click', save);
  screen.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || !event.target.matches('[data-good-thing]')) return;
    event.preventDefault();
    save();
  });
  screen.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-good-remove]');
    if (remove) keep(setDay(state.good, remove.getAttribute('data-good-remove'), [], limits), 'good.removed');
  });
  shell.onShow('good', () => { say(''); renderGood(); });
  renderGood();
}

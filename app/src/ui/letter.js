// "A letter to myself": one letter in the person's own words, written on a steadier day and
// kept on this phone only, to read on a hard one. The rules are in src/logic/letter.js; this
// draws it and saves it. The app writes none of it. Once there is a letter, "Read my letter"
// appears on the support screens, always below the crisis buttons. A draft: no licensed
// reviewer has seen it.
import { CONFIG } from '../core/config.js';
import { hasLetter, writeLetter, emptyLetter } from '../logic/letter.js';
import { state, replace } from './state.js';
import { t } from './words.js';
import { haptic } from './haptics.js';
import { devLog } from '../core/dev.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
const limits = CONFIG.letter;

// The letter as plain text, for "Make a copy of my data".
export const letterText = () => (hasLetter(state.letter) ? state.letter.text : '');

function say(key) {
  const status = $('#tl-letter-status');
  status.textContent = key ? t(key) : '';
  status.hidden = !key;
}

// Two faces of one screen: the letter to read, or the field to write it in.
function show(writing) {
  const written = hasLetter(state.letter);
  $('#tl-letter-read').hidden = !written || writing;
  $('#tl-letter-write').hidden = written && !writing;
  $('#tl-letter-remove').hidden = !written;
  $('#tl-letter-cancel').hidden = !written;
  if (!$('#tl-letter-write').hidden) $('#tl-letter-text').value = state.letter.text;
  $('#tl-letter-words').textContent = state.letter.text;
  $('#tl-letter-confirm').hidden = true;
}

export function renderLetter() {
  if (!$('#tl-letter')) return;
  show(false);
  // The way in from the support screens appears once there is a letter.
  $$('[data-letter-open]').forEach((button) => { button.hidden = !hasLetter(state.letter); });
}

async function keep(next, saidKey) {
  try { await replace('letter', next); } catch (e) { devLog('letter', e); state.letter = next; }
  renderLetter();
  say(saidKey);
}

export function initLetter(shell) {
  const screen = $('#tl-letter');
  if (!screen) return;

  $('#tl-letter-save').addEventListener('click', async () => {
    const next = writeLetter(state.letter, $('#tl-letter-text').value, limits, new Date().toISOString());
    if (!hasLetter(next) && !hasLetter(state.letter)) { $('#tl-letter-text').focus(); return; }
    if (next === state.letter) { show(false); return; }
    await keep(next, hasLetter(next) ? 'letter.saved' : 'letter.removed');
    haptic('select');
    $('#tl-letter-status').focus();
  });
  $('#tl-letter-change').addEventListener('click', () => { say(''); show(true); $('#tl-letter-text').focus(); });
  $('#tl-letter-cancel').addEventListener('click', () => { say(''); show(false); $('#tl-letter-change').focus(); });
  // Removing asks once: a letter can't be brought back.
  $('#tl-letter-remove').addEventListener('click', () => { $('#tl-letter-confirm').hidden = false; $('#tl-letter-remove-yes').focus(); });
  $('#tl-letter-remove-no').addEventListener('click', () => { $('#tl-letter-confirm').hidden = true; $('#tl-letter-remove').focus(); });
  $('#tl-letter-remove-yes').addEventListener('click', async () => {
    await keep(emptyLetter(), 'letter.removed');
    $('#tl-letter-status').focus();
  });

  shell.onShow('letter', () => { say(''); renderLetter(); });
  renderLetter();
}

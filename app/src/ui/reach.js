// "Reach someone I trust": a short message, ready ahead of time, for someone in My circle. The
// person chooses who, can change the words, and sends it themselves from the phone's own
// messages; the app sends nothing. The rules are in src/logic/reach.js. It is offered on the
// support step only when the circle has someone in it, and always below the crisis buttons.
// A draft: no licensed reviewer has seen it.
import { Capacitor } from '@capacitor/core';
import { CONFIG } from '../core/config.js';
import { KEYS } from '../core/storage.js';
import { store } from '../core/device-storage.js';
import { smsLink } from '../extras-logic.js';
import { writeReach, messageFor, reachable } from '../logic/reach.js';
import { state, replace } from './state.js';
import { t } from './words.js';
import { el } from './components.js';
import { devLog } from '../core/dev.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
const limits = CONFIG.reach;
let people = [];

// The message as plain text, for "Make a copy of my data": only words the person saved.
export const reachText = () => (state.reach && state.reach.message ? state.reach.message : '');

function say(key) {
  const status = $('#tl-reach-status');
  status.textContent = key ? t(key) : '';
  status.hidden = !key;
}

async function readCircle() {
  let circle = null;
  // My circle is kept by the older layer as text (src/extras.js); read it the way a copy of the data does.
  try { circle = JSON.parse((await store.getRaw(KEYS.circle)) || 'null'); } catch (e) { devLog('reach circle', e); }
  people = reachable(circle, CONFIG.reach.maxPeople);
  return people;
}

function row(person, index) {
  const line = el('li', 'tl-plan-item');
  line.appendChild(el('span', 'tl-plan-text', person.name));
  const actions = el('span', 'tl-row');
  const message = el('button', 'tl-btn tl-btn-secondary', t('reach.message', { name: person.name }));
  message.type = 'button';
  message.setAttribute('data-reach-message', String(index));
  const call = el('a', 'tl-btn tl-btn-secondary', t('plan.call', { name: person.name }));
  call.href = 'tel:' + person.dial;
  actions.append(message, call);
  line.appendChild(actions);
  return line;
}

export async function renderReach() {
  if (!$('#tl-reach')) return;
  await readCircle();
  const list = $('#tl-reach-people');
  list.textContent = '';
  people.forEach((person, index) => list.appendChild(row(person, index)));
  list.hidden = people.length === 0;
  $('#tl-reach-nobody').hidden = people.length > 0;
  if (document.activeElement !== $('#tl-reach-text')) $('#tl-reach-text').value = messageFor(state.reach, t('reach.start'));
  // The way in from the support step appears once there is someone to reach.
  $$('[data-reach-open]').forEach((button) => { button.hidden = people.length === 0; });
}

export function initReach(shell) {
  const screen = $('#tl-reach');
  if (!screen) return;

  $('#tl-reach-save').addEventListener('click', async () => {
    const next = writeReach(state.reach, $('#tl-reach-text').value, t('reach.start'), limits, new Date().toISOString());
    if (next !== state.reach) { try { await replace('reach', next); } catch (e) { devLog('reach', e); state.reach = next; } }
    $('#tl-reach-text').value = messageFor(state.reach, t('reach.start'));
    say('reach.saved');
    $('#tl-reach-status').focus();
  });

  screen.addEventListener('click', (event) => {
    const button = event.target.closest('[data-reach-message]');
    if (!button) return;
    const person = people[Number(button.getAttribute('data-reach-message'))];
    if (!person) return;
    // What is in the field now is what goes: the person sees the words before the phone's
    // messages open, and nothing is sent until they tap Send there.
    const words = $('#tl-reach-text').value.trim().slice(0, limits.maxLength) || t('reach.start');
    const link = smsLink([person.phone], words, Capacitor.getPlatform());
    say('reach.opened');
    const hook = window.__tidelight && window.__tidelight.onSms;
    if (hook) hook(link); else window.location.href = link;
  });

  shell.onShow('reach', () => { say(''); renderReach(); });
  // My circle changes on its own screen; the support step's button follows it.
  document.addEventListener('tidelight-circle-changed', () => { renderReach(); });
  renderReach();
}

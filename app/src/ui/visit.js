// "For my next appointment" (#tl-visit, on the Check-in tab): a short list of things to bring
// up, and one reminder at a time the person picks. The phone's reminder says only "A reminder you
// set." A draft: no licensed reviewer has seen it.
import { CONFIG } from '../core/config.js';
import { addNote, removeNote, isFull, emptyVisit } from '../logic/visit.js';
import { pickedTime, onceState, fieldValue } from '../logic/once.js';
import { state, save, replace } from './state.js';
import { t } from './words.js';
import { el } from './components.js';
import { setOnce, cancelOnce, sayWhen, onceWords } from './once.js';

const $ = (sel) => document.querySelector(sel);
const limits = () => CONFIG.visit;
const ID = () => CONFIG.reminders.visitId;

export function renderVisit() {
  if (!$('#tl-visit')) return 'none';
  const visit = state.visit;
  const list = $('#tl-visit-notes');
  list.textContent = '';
  visit.notes.forEach((note, index) => {
    const line = el('li', 'tl-plan-item');
    line.appendChild(el('span', 'tl-plan-text', note));
    const remove = el('button', 'tl-btn tl-btn-quiet', t('plan.remove'));
    remove.type = 'button';
    remove.setAttribute('aria-label', t('plan.removeNamed', { text: note }));
    remove.setAttribute('data-visit-remove', String(index));
    const actions = el('span', 'tl-row');
    actions.appendChild(remove);
    line.appendChild(actions);
    list.appendChild(line);
  });
  list.hidden = visit.notes.length === 0;
  const full = isFull(visit, limits());
  $('#tl-visit-full').textContent = t('plan.full', { count: limits().maxItems });
  $('#tl-visit-full').hidden = !full;
  $('#tl-visit-new').disabled = full;
  $('#tl-visit-add').disabled = full;
  const where = onceState({ at: visit.at }, new Date());
  const when = $('#tl-visit-when');
  if (document.activeElement !== when) when.value = where === 'ahead' ? fieldValue(visit.at) : '';
  $('#tl-visit-remove').hidden = where === 'none';
  document.querySelectorAll('[data-once-sample]').forEach((node) => { node.textContent = onceWords().body; });
  return where;
}

export function initVisit(shell) {
  if (!$('#tl-visit')) return;
  const status = $('#tl-visit-status');
  const say = (key, values) => { status.textContent = key ? t(key, values) : ''; status.hidden = !key; };
  const add = async () => {
    const field = $('#tl-visit-new');
    const next = addNote(state.visit, field.value, limits());
    if (next === state.visit) { field.focus(); return; }
    await replace('visit', next);
    field.value = '';
    renderVisit();
    say('plan.saved');
    if (!field.disabled) field.focus();
  };
  $('#tl-visit-add').addEventListener('click', add);
  $('#tl-visit-new').addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); add(); } });
  $('#tl-visit-notes').addEventListener('click', async (event) => {
    const button = event.target.closest('[data-visit-remove]');
    if (!button) return;
    await replace('visit', removeNote(state.visit, Number(button.getAttribute('data-visit-remove'))));
    renderVisit();
    say('plan.removed');
    $('#tl-visit-notes-title').setAttribute('tabindex', '-1');
    $('#tl-visit-notes-title').focus({ preventScroll: true });
  });
  $('#tl-visit-set').addEventListener('click', async () => {
    const date = pickedTime($('#tl-visit-when').value, new Date(), limits().maxDays);
    if (!date) { say('once.past'); return; }
    const outcome = await setOnce(ID(), date);
    if (outcome !== 'set') { say('once.denied'); return; }
    await save('visit', { at: date.toISOString() });
    renderVisit();
    say('once.set', { when: sayWhen(date.toISOString()) });
  });
  $('#tl-visit-remove').addEventListener('click', async () => {
    await cancelOnce(ID());
    await save('visit', { at: '' });
    renderVisit();
    say('once.removed');
  });
  // Delete everything: the app's own erase clears what is kept; the phone's reminder goes too.
  window.addEventListener('tidelight-erased', () => { cancelOnce(ID()); setTimeout(renderVisit, 0); });
  shell.onShow('visit', () => { const where = renderVisit(); say(where === 'passed' ? 'once.passed' : where === 'ahead' ? 'once.set' : '', where === 'ahead' ? { when: sayWhen(state.visit.at) } : null); });
  if (!state.visit) state.visit = emptyVisit();
  renderVisit();
}

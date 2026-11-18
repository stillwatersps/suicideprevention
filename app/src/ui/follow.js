// "A reminder to check in on someone" (#tl-follow, on the Friends tab): one reminder, for a time
// the person picks. The name they may type is kept on this phone and shown only on this screen;
// the phone's reminder never shows it. A draft: no licensed reviewer has seen it.
import { CONFIG } from '../core/config.js';
import { pickedTime, onceState, fieldValue, emptyOnce } from '../logic/once.js';
import { state, save } from './state.js';
import { t } from './words.js';
import { setOnce, cancelOnce, sayWhen, onceWords } from './once.js';

const $ = (sel) => document.querySelector(sel);
const ID = () => CONFIG.reminders.followId;

export function renderFollow() {
  if (!$('#tl-follow')) return;
  const kept = state.follow;
  const where = onceState(kept, new Date());
  const who = $('#tl-follow-who');
  const when = $('#tl-follow-when');
  if (document.activeElement !== who) who.value = kept.who;
  if (document.activeElement !== when) when.value = where === 'ahead' ? fieldValue(kept.at) : '';
  $('#tl-follow-remove').hidden = where === 'none' && !kept.who;
  document.querySelectorAll('[data-once-sample]').forEach((node) => { node.textContent = onceWords().body; });
  return where;
}

export function initFollow(shell) {
  if (!$('#tl-follow')) return;
  const status = $('#tl-follow-status');
  const say = (key, values) => { status.textContent = key ? t(key, values) : ''; status.hidden = !key; if (key) status.focus({ preventScroll: true }); };
  $('#tl-follow-set').addEventListener('click', async () => {
    const date = pickedTime($('#tl-follow-when').value, new Date(), CONFIG.follow.maxDays);
    if (!date) { say('once.past'); return; }
    const outcome = await setOnce(ID(), date);
    if (outcome !== 'set') { say('once.denied'); return; }
    await save('follow', { who: $('#tl-follow-who').value.replace(/\s+/g, ' ').trim().slice(0, CONFIG.follow.maxLength), at: date.toISOString() });
    renderFollow();
    say('once.set', { when: sayWhen(date.toISOString()) });
  });
  $('#tl-follow-remove').addEventListener('click', async () => {
    await cancelOnce(ID());
    await save('follow', emptyOnce());
    renderFollow();
    say('once.removed');
  });
  // Delete everything: the app's own erase clears what is kept; the phone's reminder goes too.
  window.addEventListener('tidelight-erased', () => { cancelOnce(ID()); setTimeout(renderFollow, 0); });
  shell.onShow('follow', () => { const where = renderFollow(); say(where === 'passed' ? 'once.passed' : where === 'ahead' ? 'once.set' : '', where === 'ahead' ? { when: sayWhen(state.follow.at) } : null); });
  renderFollow();
}

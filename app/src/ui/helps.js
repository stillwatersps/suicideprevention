// "What tends to help": on the days the person chose Good or Great, what else did they record?
// Worked out from their own entries each time the screen opens (src/logic/helps.js) and never
// stored. Not a score, not a chart, and hard days are never counted or shown. A draft.
import { CONFIG } from '../core/config.js';
import { whatHelps } from '../logic/helps.js';
import { dateKey } from '../logic/streaks.js';
import { state } from './state.js';
import { t } from './words.js';
import { el } from './components.js';

const $ = (sel) => document.querySelector(sel);

export function renderHelps(ctx) {
  if (!$('#tl-helps')) return;
  const since = new Date();
  since.setDate(since.getDate() - (CONFIG.helps.days - 1));
  const page = ctx.api.getState() || {};
  const out = whatHelps({
    log: ctx.getLog(),
    sessions: state.sessions,
    journalDates: (Array.isArray(page.entries) ? page.entries : []).map((entry) => entry && entry.date),
    sinceKey: dateKey(since),
    dateKey,
    limits: CONFIG.helps,
  });
  $('#tl-helps-none').hidden = out.enough;
  $('#tl-helps-some').hidden = !out.enough;
  if (!out.enough) return;
  $('#tl-helps-lead').textContent = t('helps.lead', { days: out.days });
  const list = $('#tl-helps-list');
  list.textContent = '';
  out.items.forEach((item) => {
    // A tag is shown in the words the person tapped; the other two have names of their own.
    const name = item.kind === 'tag' ? item.name : t('helps.' + item.kind);
    list.appendChild(el('li', 'tl-helps-item', t('helps.item', { name, count: item.count, days: out.days })));
  });
  list.hidden = out.items.length === 0;
  $('#tl-helps-nothing').hidden = out.items.length > 0;
}

export function initHelps(shell, ctx) {
  if (!$('#tl-helps')) return;
  shell.onShow('helps', () => renderHelps(ctx));
}

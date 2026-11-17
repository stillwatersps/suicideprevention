// "My week, in words" (#tl-week, on the Check-in tab): a few sentences about the last seven days
// and the person's own check-in lines from them. Put together each time the screen opens
// (src/logic/week.js). Nothing is kept, and nothing is counted on the screen. A draft.
import { CONFIG } from '../core/config.js';
import { sincePeriod } from '../logic/summary.js';
import { weekKeys, distinctDays } from '../logic/week.js';
import { oneLine } from '../logic/export.js';
import { dateKey } from '../logic/streaks.js';
import { state } from './state.js';
import { t } from './words.js';
import { el } from './components.js';

const $ = (sel) => document.querySelector(sel);

function render(ctx) {
  const since = new Date();
  since.setDate(since.getDate() - (CONFIG.week.days - 1));
  const sinceKey = dateKey(since);
  let log = [];
  try { log = sincePeriod(ctx.logLines(), (entry) => entry.t, sinceKey, dateKey); } catch (e) { log = []; }
  const sessions = sincePeriod(state.sessions, (s) => s.startedAt, sinceKey, dateKey);
  const goodDays = (state.good && Array.isArray(state.good.days) ? state.good.days : []).filter((d) => d.day >= sinceKey).length;
  const lines = $('#tl-week-lines');
  lines.textContent = '';
  weekKeys({ checkinDays: distinctDays(log, (entry) => entry.t, dateKey), sessions: sessions.length, goodDays }).forEach((key) => lines.appendChild(el('li', '', t(key))));
  const own = $('#tl-week-own');
  own.textContent = '';
  let lastDay = null;
  log.slice(0, CONFIG.week.maxLines).forEach((entry) => {
    if (entry.day !== lastDay) { own.appendChild(el('li', 'tl-week-day', oneLine(entry.day))); lastDay = entry.day; }
    own.appendChild(el('li', '', oneLine(entry.line)));
  });
  $('#tl-week-own-box').hidden = log.length === 0;
}

export function initWeek(shell, ctx) {
  if (!$('#tl-week')) return;
  shell.onShow('week', () => render(ctx));
}

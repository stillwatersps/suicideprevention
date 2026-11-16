// "A summary for an appointment": the person ticks what goes on a short page of their own
// records, sees every word of it, and hands it to the phone's share sheet. Put together each time
// from what is on the phone (src/logic/summary.js). Nothing ticked or typed here is kept, and
// nothing leaves unless they send it. A draft.
import { CONFIG } from '../core/config.js';
import { buildSummary, sincePeriod, periodDays } from '../logic/summary.js';
import { oneLine, listOf } from '../logic/export.js';
import { PARTS, planLines } from '../logic/plan.js';
import { dateKey } from '../logic/streaks.js';
import { handFile } from './export.js';
import { state } from './state.js';
import { t, lang } from './words.js';
import { devLog } from '../core/dev.js';

const $ = (sel) => document.querySelector(sel);
const heading = (sel) => { const node = $(sel); return node ? node.textContent.trim() : ''; };
const when = (value, options) => {
  const date = new Date(value);
  if (isNaN(date)) return '';
  try { return date.toLocaleString(lang(), options); } catch (e) { return date.toISOString(); }
};

// Exported for the tests: the page as it would be shared right now, from what is ticked.
export function summaryText(ctx) {
  const days = periodDays(($('input[name="tl-summary-days"]:checked') || {}).value, CONFIG.summary.days);
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const sinceKey = dateKey(since);

  const checkins = [];
  let lastDay = null;
  sincePeriod(ctx.logLines(), (entry) => entry.t, sinceKey, dateKey).forEach((entry) => {
    if (entry.day !== lastDay) { checkins.push(entry.day); lastDay = entry.day; }
    checkins.push('- ' + oneLine(entry.line));
  });

  const page = ctx.api.getState() || {};
  const journal = sincePeriod(listOf(page.entries, (entry) => typeof entry.text === 'string'), (entry) => entry.date, sinceKey, dateKey).map((entry) => [
    [when(entry.date, { year: 'numeric', month: 'long', day: 'numeric' }), oneLine(entry.mood)].filter(Boolean).join(' · '), oneLine(entry.prompt), String(entry.text).trim(),
  ].filter(Boolean).join('\n'));

  const plan = planLines(state.plan, Object.fromEntries(PARTS.map((part) => [part, heading('#tl-plan-' + part + '-title')])));

  return buildSummary({
    words: {
      title: t('summary.title'),
      made: t('summary.made', { date: when(new Date(), { year: 'numeric', month: 'long', day: 'numeric' }), days }),
      note: t('summary.note'),
      none: t('summary.none'),
      ask: t('summary.ask'),
      checkins: t('export.checkins'),
      journal: heading('#ci-journal-title'),
      plan: t('plan.title'),
    },
    choices: { checkins: $('#tl-summary-checkins').checked, journal: $('#tl-summary-journal').checked, plan: $('#tl-summary-plan').checked },
    checkins,
    journal,
    plan,
    ask: $('#tl-summary-ask').value,
    maxAsk: CONFIG.summary.maxAsk,
  });
}

// The page shows every word that would be shared, and offers to share only when there is a page.
function render(ctx) {
  const out = summaryText(ctx);
  $('#tl-summary-empty').hidden = !out.empty;
  $('#tl-summary-out').hidden = out.empty;
  $('#tl-summary-preview').textContent = out.text;
  $('#tl-summary-note').hidden = true;
}

// Each visit starts the same way: check-ins ticked, the rest not, and nothing typed. Nothing is
// left on from last time, because none of it is kept.
function startOver() {
  $('#tl-summary-checkins').checked = true;
  $('#tl-summary-journal').checked = false;
  $('#tl-summary-plan').checked = false;
  $('#tl-summary-ask').value = '';
  const first = $('input[name="tl-summary-days"]');
  if (first) first.checked = true;
}

export function initSummary(shell, ctx) {
  const screen = $('#tl-summary');
  if (!screen) return;
  shell.onShow('summary', () => { if (!shell.isBack || !shell.isBack()) startOver(); render(ctx); });
  screen.addEventListener('change', () => render(ctx));
  $('#tl-summary-ask').addEventListener('input', () => render(ctx));
  $('#tl-summary-share').addEventListener('click', async () => {
    const note = $('#tl-summary-note');
    note.hidden = true;
    const out = summaryText(ctx);
    if (out.empty) return;
    let outcome = 'failed';
    try { outcome = await handFile(t('summary.fileName'), out.text); } catch (e) { devLog('summary', e); }
    if (outcome === 'cancelled') return; // the sheet was closed: nothing happened, so nothing to say
    note.textContent = t(outcome === 'done' ? 'summary.done' : 'summary.failed');
    note.hidden = false;
  });
}

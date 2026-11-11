// "Days you checked in this month": a row of soft dots on Home and a calendar behind it. This is
// how the streak feature is shown since the visual redesign. Presentation only: the streak data
// underneath (days, freezes, best) is still worked out and stored, pending a reviewer's answer on
// whether streaks belong in this app. Nothing here counts days in a row, shows a zero, or says a
// day was missed. It can be turned off in Settings, and turning it off loses nothing.
import { dateKey, evaluate, recordCheckIn, recordMeditation, monthGrid, daysFromLog, addDays, emptyStreak } from '../logic/streaks.js';
import { t, lang } from './words.js';
import { state, replace } from './state.js';
import { el } from './components.js';
import { addDevAction } from './settings.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
let ctx = null;
const todayKey = () => dateKey(new Date());
const goal = () => state.settings.checkInsPerDay;

function dayName(key, style) {
  const [y, m, d] = key.split('-').map(Number);
  try { return new Date(y, m - 1, d).toLocaleDateString(lang(), style); } catch (e) { return key; }
}

// Settles ended days, saves, and shows the result. Returns what happened (milestone, broken).
export async function refreshStreak() {
  if (!state.streak && !Object.keys(state.days).length) state.days = daysFromLog(ctx.getLog(), goal());
  const out = evaluate({ streak: state.streak, days: state.days, todayKey: todayKey(), nowMs: Date.now(), goal: goal() });
  // The streak itself is still worked out and kept (a reviewer's open question), but nothing on
  // screen counts days in a row, celebrates a milestone, or says a run ended.
  if (out.events.milestone) out.streak.celebrated.push(out.events.milestone);
  out.streak.brokenNotice = null;
  await replace('days', out.days);
  await replace('streak', out.streak);
  render();
  return out.events;
}
export async function addCheckInToStreak() {
  recordCheckIn(state.days, todayKey(), goal());
  return refreshStreak();
}
export async function addMeditationToStreak() {
  recordMeditation(state.days, todayKey(), goal());
  return refreshStreak();
}

// A day shows as checked in when it has at least one check-in. Other days are an empty outline:
// never red, never crossed out, never called missed. The count only goes up within a month.
const checkedIn = (key) => Boolean(state.days[key] && state.days[key].checkInsCompleted > 0);

function monthCells() {
  return monthGrid(state.days, todayKey()).map((cell) => (cell ? { key: cell.key, day: cell.day, on: checkedIn(cell.key), today: cell.key === todayKey() } : null));
}
function dots(list, cells, numbers) {
  list.textContent = '';
  cells.forEach((cell) => {
    const dot = el('li', 'tl-day' + (cell ? (cell.on ? ' is-complete' : '') + (cell.today ? ' is-today' : '') : ' is-blank'));
    if (cell && numbers) dot.textContent = String(cell.day);
    list.appendChild(dot);
  });
}

function render() {
  const card = $('#tl-home-streak');
  if (!card) return;
  const on = Boolean(state.settings.streaksOn) && state.onboarding.completed;
  card.hidden = !on;
  if (!on) return;
  const cells = monthCells();
  const days = cells.filter(Boolean);
  const count = days.filter((cell) => cell.on).length;
  const words = count === 1 ? t('month.one') : t('month.words', { count });
  // Before the first check-in there is no zero to greet anyone: a quiet horizon and one line.
  $('#tl-streak-card').hidden = count === 0;
  $('#tl-streak-first').hidden = count > 0;
  dots($('#tl-streak-week'), days, false);
  $('#tl-streak-week-words').textContent = words;
  $('#tl-streak-card').setAttribute('aria-label', t('month.cardLabel', { count }));

  $('#tl-streak-month-title').textContent = dayName(todayKey(), { month: 'long', year: 'numeric' });
  $('#tl-streak-count').textContent = words;
  const heads = $('#tl-streak-heads');
  heads.textContent = '';
  for (let i = 0; i < 7; i += 1) heads.appendChild(el('li', '', dayName(addDays('2026-11-02', i), { weekday: 'narrow' })));
  dots($('#tl-streak-month'), cells, true);
}

export function initStreaks(shell, context) {
  ctx = context;
  if (!$('#tl-home-streak')) return;
  shell.onShow('home', render);
  shell.onShow('streak', render);

  addDevAction(({ refresh }) => {
    $('#tl-dev-streak').addEventListener('click', async () => {
      await replace('days', {});
      await replace('streak', null);
      await refreshStreak();
      refresh();
    });
    // Four weeks of made-up days, to look at the heatmap: mostly complete, a frozen day, a gap.
    $('#tl-dev-seed').addEventListener('click', async () => {
      const days = {};
      const pattern = 'ccccfccmmcccccccfcccccmccccc';
      for (let i = 0; i < pattern.length; i += 1) {
        const key = addDays(todayKey(), i - pattern.length);
        const done = pattern[i] === 'c';
        days[key] = { dateKey: key, checkInsCompleted: done ? goal() : 0, checkInGoal: goal(), meditationsCompleted: 0,
          status: { c: 'complete', f: 'frozen', m: 'missed' }[pattern[i]] };
      }
      await replace('days', days);
      await replace('streak', Object.assign(emptyStreak(), { lastEvaluatedDate: addDays(todayKey(), -1), lastFreezeGrantWeek: null, freezesAvailable: 1, best: 9, celebrated: [3, 7] }));
      await refreshStreak();
      refresh();
    });
  });
}

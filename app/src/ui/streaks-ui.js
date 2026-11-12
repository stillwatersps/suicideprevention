// Streaks on screen: the Home card, the detail screen with its month, milestones, and the gentle
// "new start" card. The words are the ones awaiting review; the visual redesign changed only how
// they look (dots drawn in the new tokens, no burst at a milestone).
// A founder's rules: streak language stays gentle; nothing here ever shows in
// or near a crisis or support screen (and nothing celebrates on a day with a very low check-in);
// streaks can be turned off in Settings, and turning them off loses nothing.
import { CONFIG } from '../core/config.js';
import { evaluate, recordCheckIn, recordMeditation, weekRow, monthGrid, nextFreezeDay, daysFromLog, addDays, emptyStreak } from '../logic/streaks.js';
import { t, lang } from './words.js';
import { state, replace, reducedMotion, isQuiet as quiet, todayKey } from './state.js';
import { el, animateNumber } from './components.js';
import { haptic } from './haptics.js';
import { addDevAction } from './settings.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
let ctx = null;
const goal = () => state.settings.checkInsPerDay;

function dayName(key, style) {
  const [y, m, d] = key.split('-').map(Number);
  try { return new Date(y, m - 1, d).toLocaleDateString(lang(), style); } catch (e) { return key; }
}

// Settles ended days, saves, and shows the result. Returns what happened (milestone, broken).
export async function refreshStreak() {
  if (!state.streak && !Object.keys(state.days).length) state.days = daysFromLog(ctx.getLog(), goal());
  const out = evaluate({ streak: state.streak, days: state.days, todayKey: todayKey(), nowMs: Date.now(), goal: goal() });
  // A milestone on a quiet day, or with streaks off, passes without a celebration.
  const show = out.events.milestone && state.settings.streaksOn && !quiet();
  if (out.events.milestone) out.streak.celebrated.push(out.events.milestone);
  await replace('days', out.days);
  await replace('streak', out.streak);
  render();
  if (show) showMilestone(out.events.milestone);
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

// The legend's own words ("Done", "Frozen", "Rest day", "Today"), read from the page.
function legendWord(state) {
  const mark = $(`#tl-streak .tl-legend .tl-day.is-${state}`);
  return mark && mark.parentNode ? mark.parentNode.textContent.replace(/\s+/g, ' ').trim() : '';
}

function dots(list, cells, withNumbers) {
  list.textContent = '';
  cells.forEach((cell) => {
    const dot = el('li', 'tl-day' + (cell ? ' is-' + cell.state : ' is-blank'));
    // Each state is drawn by the stylesheet (filled, soft, dashed, ringed); the month also shows the date.
    if (cell && withNumbers) {
      dot.textContent = String(cell.day);
      // A screen reader hears the date and, where the legend has a word for it, the day's state.
      const word = legendWord(cell.state);
      if (word) dot.setAttribute('aria-label', `${cell.day}, ${word}`);
    }
    list.appendChild(dot);
  });
}

function render() {
  const card = $('#tl-home-streak');
  if (!card) return;
  const s = state.streak || emptyStreak();
  const on = Boolean(state.settings.streaksOn) && state.onboarding.completed;
  card.hidden = !on;
  const fresh = $('#tl-streak-fresh');
  fresh.hidden = !(on && s.brokenNotice && !quiet());
  if (!fresh.hidden) $('#tl-streak-fresh-line').textContent = t('streak.fresh', { best: s.best });
  if (!on) { $('#tl-milestone').hidden = true; return; }

  const week = weekRow(state.days, todayKey());
  animateNumber($('#tl-streak-number'), s.current, reducedMotion());
  $('#tl-streak-label').textContent = t(s.current === 1 ? 'streak.day' : 'streak.days');
  dots($('#tl-streak-week'), week, false);
  const tally = (name) => week.filter((d) => d.state === name).length;
  $('#tl-streak-week-words').textContent = t('streak.weekWords', { complete: tally('complete'), frozen: tally('frozen'), missed: tally('missed') });
  $('#tl-streak-freezes-count').textContent = String(s.freezesAvailable);
  $('#tl-streak-card').setAttribute('aria-label', t('streak.cardLabel', { count: s.current, freezes: s.freezesAvailable }));

  // The detail screen.
  $('#tl-streak-current').textContent = String(s.current);
  $('#tl-streak-best').textContent = String(s.best);
  $('#tl-streak-month-title').textContent = dayName(todayKey(), { month: 'long', year: 'numeric' });
  const heads = $('#tl-streak-heads');
  heads.textContent = '';
  for (let i = 0; i < 7; i += 1) heads.appendChild(el('li', '', dayName(addDays('2026-11-02', i), { weekday: 'narrow' })));
  dots($('#tl-streak-month'), monthGrid(state.days, todayKey()), true);
  $('#tl-streak-freeze-line').textContent = t(s.freezesAvailable >= CONFIG.streak.freezeMax ? 'streak.freezeFull' : 'streak.freezeNext',
    { count: s.freezesAvailable, day: dayName(nextFreezeDay(todayKey()), { weekday: 'long' }) });
}

function showMilestone(days) {
  const box = $('#tl-milestone');
  $('#tl-milestone-line').textContent = t('streak.milestone', { days });
  box.hidden = false;
  haptic('milestone');
}

export function initStreaks(shell, context) {
  ctx = context;
  if (!$('#tl-home-streak')) return;
  $('#tl-milestone-ok').addEventListener('click', () => { $('#tl-milestone').hidden = true; });
  $('#tl-streak-fresh-ok').addEventListener('click', async () => {
    await replace('streak', Object.assign({}, state.streak, { brokenNotice: null }));
    render();
  });
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

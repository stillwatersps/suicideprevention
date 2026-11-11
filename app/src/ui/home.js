// The Home tab: a greeting, then cards. The setup ring, the streak card, and the suggested
// meditation each have their own slot and their own file.
import { effectiveTimes, nextCheckInTime } from '../logic/spread.js';
import { t, clockText } from './words.js';
import { state } from './state.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);

// Which greeting fits the hour. Exported for the tests.
export function greetingKey(hour) {
  if (hour >= 5 && hour < 12) return 'greet.morning';
  if (hour >= 12 && hour < 18) return 'greet.afternoon';
  if (hour >= 18 && hour < 22) return 'greet.evening';
  return 'greet.night';
}

export function renderHome(ctx) {
  const line = $('.tl-greeting');
  if (!line) return;
  const hello = t(greetingKey(new Date().getHours()));
  const name = (state.profile.name || '').trim();
  line.textContent = name ? t('greet.withName', { greeting: hello, name }) : hello;

  // The line under the greeting is the Daily check-in's own headline, already on this page.
  const lineBox = $('#tl-home-line');
  const source = $('#page-title');
  if (lineBox && source && !lineBox.firstChild) {
    const words = source.textContent.trim();
    const lit = t('home.highlight');
    const at = lit ? words.indexOf(lit) : -1;
    if (at === -1) lineBox.textContent = words;
    else {
      const mark = document.createElement('span');
      mark.className = 'tl-highlight';
      mark.textContent = lit;
      lineBox.append(words.slice(0, at), mark, words.slice(at + lit.length));
    }
  }
  const done = ctx.checkInsToday();
  const when = $('#tl-home-next-when');
  if (done >= state.settings.checkInsPerDay) {
    when.textContent = t('home.nextDone');
  } else {
    const next = nextCheckInTime({ now: new Date(), times: effectiveTimes(state.settings), checkInsToday: done });
    when.textContent = next ? t('home.nextAt', { time: clockText(next) }) : t('home.nextAny');
  }
  // One feature card: the check-in while any are left today, then the suggested meditation.
  const left = done < state.settings.checkInsPerDay;
  $('#tl-home-next').classList.toggle('tl-feature', left);
  $('#tl-home-suggest').classList.toggle('tl-feature', !left);
}

export function initHome(shell, ctx) {
  renderHome(ctx);
  shell.onShow('home', () => renderHome(ctx));
}

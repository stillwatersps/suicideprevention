// The Home tab: a greeting, then cards. Later phases fill the setup ring, the streak card, and
// the suggested meditation; each has its own slot here.
import { t } from './words.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
let personName = '';

// Which greeting fits the hour. Exported for the tests.
export function greetingKey(hour) {
  if (hour >= 5 && hour < 12) return 'greet.morning';
  if (hour >= 12 && hour < 18) return 'greet.afternoon';
  if (hour >= 18 && hour < 22) return 'greet.evening';
  return 'greet.night';
}

export function renderGreeting(name) {
  if (name !== undefined) personName = name || '';
  const line = $('.tl-greeting');
  if (!line) return;
  const hello = t(greetingKey(new Date().getHours()));
  line.textContent = personName ? t('greet.withName', { greeting: hello, name: personName }) : hello;
}

export function initHome(shell) {
  renderGreeting();
  shell.onShow('home', () => renderGreeting());
}

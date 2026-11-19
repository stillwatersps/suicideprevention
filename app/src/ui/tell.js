// "Words for telling someone" (#tl-tell, on the Friends tab): a few ways to start, each with a
// Copy button. Copy puts the words on the phone's clipboard and nothing else: the app sends
// nothing, keeps nothing, and doesn't know where the words go. A draft.
import { t } from './words.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));

async function copy(words) {
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) return false;
    await navigator.clipboard.writeText(words);
    return true;
  } catch (e) { return false; }
}

export function initTell(shell) {
  const screen = $('#tl-tell');
  if (!screen) return;
  const status = $('#tl-tell-status');
  $$('.tl-tell-line', screen).forEach((line) => {
    const words = $('[data-tell-words]', line).textContent.trim();
    const button = $('[data-tell-copy]', line);
    button.setAttribute('aria-label', t('tell.copyLabel', { words }));
    button.addEventListener('click', async () => {
      const done = await copy(words);
      status.textContent = t(done ? 'tell.copied' : 'tell.failed');
      line.appendChild(status); // under the line that was tapped, where the person is looking
      status.hidden = false;
      status.focus({ preventScroll: true });
    });
  });
  shell.onShow('tell', () => { status.hidden = true; });
}

// "A first week" (#tl-course, on the Meditate tab): seven steps, each one something the app already
// has. A step opens its screen or starts its session; a tick is the person's own, and can be taken
// back. On a day with a very low check-in the closing line stays hidden. A draft.
import { CONFIG } from '../core/config.js';
import { STEPS, isDone, setDone, nextStep, emptyCourse } from '../logic/course.js';
import { state, save, isQuiet } from './state.js';
import { startType } from './meditate.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
// Steps that are sessions; every other step is a screen of the same name.
const SESSIONS = { reset: () => startType('quick', { minutes: 1 }), scan: () => startType('scan', { minutes: 5 }), walk: () => startType('walk', { minutes: 5 }) };

export function renderCourse() {
  const screen = $('#tl-course');
  if (!screen) return;
  const next = nextStep(state.course, CONFIG.course);
  $$('[data-course-step]', screen).forEach((item, i) => {
    $('input', item).checked = isDone(state.course, i);
    $('[data-course-next]', item).hidden = i !== next;
    if (i === next) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
  });
  $('#tl-course-all').hidden = next !== -1 || isQuiet();
  $('#tl-course-again').hidden = state.course.done.length === 0;
}

export function initCourse(shell) {
  const screen = $('#tl-course');
  if (!screen) return;
  $$('[data-course-step]', screen).forEach((item, i) => {
    $('input', item).addEventListener('change', async (event) => {
      await save('course', setDone(state.course, i, event.target.checked, CONFIG.course));
      renderCourse();
    });
    $('[data-course-open]', item).addEventListener('click', () => { const id = STEPS[i]; if (SESSIONS[id]) SESSIONS[id](); else shell.push(id); });
  });
  $('#tl-course-again').addEventListener('click', async () => {
    await save('course', emptyCourse());
    renderCourse();
    $('#tl-course-title').focus({ preventScroll: true });
  });
  shell.onShow('course', renderCourse);
  window.addEventListener('tidelight-checkin', () => setTimeout(renderCourse, 0));
  renderCourse();
}

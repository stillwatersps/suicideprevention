// "Another way to see it": four questions for a heavy thought, answered in the person's own
// words. It is a place to think, not a record: nothing typed here is kept, and it is cleared when
// the person leaves the screen, taps "Clear what I wrote", or uses Quick exit. The app writes
// none of the answers. A draft: no licensed reviewer has seen it.
const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));

export function initReframe(shell) {
  const screen = $('#tl-reframe');
  if (!screen) return;
  const fields = () => $$('[data-reframe-answer]', screen);
  const clear = () => fields().forEach((field) => { field.value = ''; });
  $('#tl-reframe-clear').addEventListener('click', () => { clear(); fields()[0].focus(); });
  shell.onHide('reframe', clear);
  document.addEventListener('tidelight-back-from-exit', clear);
  window.addEventListener('tidelight-erased', clear);
  clear();
}

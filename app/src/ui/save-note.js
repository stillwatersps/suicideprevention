// Shows one calm line when the phone couldn't keep something, and takes it away when the person
// taps "Got it". It sits at the bottom of the screen, above the tab bar, never near the crisis
// strip at the top, and the page grows by its height so nothing under it is out of reach. Where
// there is no room for that, it sits in the page itself.
import { SAVE_FAILED } from '../core/save-note.js';

export function initSaveNote() {
  const note = document.getElementById('tl-save-note');
  if (!note) return;
  const root = document.documentElement;
  const strip = document.querySelector('.crisis-bar');
  const bar = document.getElementById('tl-tabbar');
  const AIR = 24; // points of room the line needs around it
  // Laid over the bottom of the screen when there is room between the crisis strip and the tab
  // bar; otherwise in the page itself. Then the page's bottom padding is told how tall it is.
  const fit = () => {
    note.classList.remove('tl-save-note-inline');
    if (!note.hidden) {
      const room = window.innerHeight - (strip ? strip.getBoundingClientRect().bottom : 0) - (bar ? bar.offsetHeight : 0);
      if (note.scrollHeight + AIR > room) note.classList.add('tl-save-note-inline');
    }
    const over = !note.hidden && !note.classList.contains('tl-save-note-inline');
    root.style.setProperty('--tl-save-note', over ? note.offsetHeight + 'px' : '0px');
  };
  window.addEventListener(SAVE_FAILED, () => {
    if (!note.hidden) return; // already said, and not yet acknowledged
    note.hidden = false;
    root.classList.add('tl-save-noted');
    fit();
  });
  document.getElementById('tl-save-note-ok').addEventListener('click', () => {
    note.hidden = true;
    root.classList.remove('tl-save-noted');
    fit();
  });
  window.addEventListener('resize', fit);
  fit(); // the page's bottom padding reads this, so it always has a value
}

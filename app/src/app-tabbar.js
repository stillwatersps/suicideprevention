// The website's pages inside the app (Get help, Not sure, For teens, and the rest) carry the same
// five tabs as the app's own screens, so there is always a way back. tools/build-redesign.mjs
// writes the bar into each page as plain links; this only keeps its labels fitting,
// and keeps the crisis strip from taking most of a short screen (ui/strip-fit.js).
import { watchTabBar } from './ui/tabbar-fit.js';
import { watchStrip } from './ui/strip-fit.js';

// "Leer en español" or "Read in English" tapped on one of these pages is the person's choice of
// language. These pages can't save to the phone, so the choice is noted for this visit and the
// Daily check-in page keeps it (redesign.js). Without this, a tab opened the other language again.
const noteLanguage = () => {
  const link = document.querySelector('.lang-switch a');
  if (!link) return;
  link.addEventListener('click', () => { try { window.sessionStorage.setItem('tidelight.language.tapped', link.getAttribute('hreflang') || ''); } catch (e) { /* the link still works */ } });
};
const start = () => { watchTabBar(document.getElementById('tl-tabbar')); watchStrip(document.querySelector('.crisis-bar')); noteLanguage(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

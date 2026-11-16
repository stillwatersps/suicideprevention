// The crisis strip's words stop growing at 28 points (tokens.css). On a short screen, with long
// words (Spanish) or a wider font than the phone's usual one, even 28 points can make the strip
// taller than most of the screen, and then its last line (call 911) has to be scrolled to inside
// the strip. So where the strip would take more than 70% of the screen's height, its words are
// set smaller, a point at a time, never below 18 (the phone's usual size is 17). Every word and
// every control stays, and each control keeps its full tap size. One implementation, used by the
// app's own screens (shell.js) and by the website's pages inside the app (app-tabbar.js).
const MOST = 0.7;   // of the screen's height
const CAP = 28;     // points; the same figure as --crisis-size-cap
const FLOOR = 18;   // points

export function fitStrip(strip) {
  if (!strip) return;
  strip.style.removeProperty('--crisis-size-cap');
  const room = window.innerHeight * MOST;
  if (!room) return;
  for (let cap = CAP - 1; strip.scrollHeight > room && cap >= FLOOR; cap -= 1) strip.style.setProperty('--crisis-size-cap', cap + 'px');
}

// Fit now, and again whenever the room, the text size, or the words change.
export function watchStrip(strip) {
  if (!strip) return;
  let waiting = false;
  const soon = () => { if (waiting) return; waiting = true; requestAnimationFrame(() => { waiting = false; fitStrip(strip); }); };
  window.addEventListener('resize', soon);
  if (window.MutationObserver) new MutationObserver(soon).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'lang', 'data-text-size'] });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
  fitStrip(strip);
}

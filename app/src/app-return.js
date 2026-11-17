// App only, loaded on every page, before anything else of the app's.
// Quick exit hides the page at once and opens weather.gov in the phone's browser. Inside the app
// the page itself stays where it was, hidden. Coming back to the app, there is no address bar and
// no Back, so a hidden page would leave a blank app with no 988, no 911, and no way out but
// closing it. So whenever the app comes back into view, the page is shown again. The website does
// the same for its Home Screen app (assets/menu.js). This file must not depend on the app's bundle:
// it has to work even if every other script fails.
// A page that was hidden by Quick exit also says so as it comes back, so the app can open on Home
// rather than on the journal entry or check-in the person had been in (redesign.js listens).
(function () {
  // "Darker at night" (src/ui/night.js): the Daily check-in page notes, for this visit only, when
  // tonight ends. Until then every page in the app starts dark, before anything is drawn.
  try {
    var until = Number(window.sessionStorage.getItem('tidelight.night-until'));
    if (until && until > Date.now()) document.documentElement.classList.add('tl-night');
  } catch (e) { /* no session storage: the page follows the phone */ }
  function show() {
    var afterExit = document.documentElement.hidden === true;
    document.documentElement.hidden = false;
    if (!afterExit) return;
    try { document.dispatchEvent(new Event('tidelight-back-from-exit')); } catch (e) { /* the page is shown; that is what matters */ }
  }
  // With the app lock on, the phone covers the app when it leaves the screen and keeps the cover
  // until a page says it has drawn its lock screen (TidelightPlugin.swift, lockDrawn). Only the
  // Daily check-in page has one. Every other page in the app is a website page with nothing saved
  // on it, so it says "drawn" at once; otherwise the cover sat over the page, and the crisis
  // services listed on it, for three seconds.
  function liftCover() {
    if (document.getElementById('tl-lock')) return;
    try {
      var phone = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Tidelight;
      if (phone && phone.lockDrawn) Promise.resolve(phone.lockDrawn()).catch(function () { /* the cover lifts by itself after three seconds */ });
    } catch (e) { /* the same */ }
  }
  function back() { show(); liftCover(); }
  window.addEventListener('pageshow', back);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') back(); });
}());

// App only, loaded on every page, before anything else of the app's.
// Quick exit hides the page at once and opens weather.gov in the phone's browser. Inside the app
// the page itself stays where it was, hidden. Coming back to the app, there is no address bar and
// no Back, so a hidden page would leave a blank app with no 988, no 911, and no way out but
// closing it. So whenever the app comes back into view, the page is shown again. The website does
// the same for its Home Screen app (assets/menu.js). This file must not depend on the app's bundle:
// it has to work even if every other script fails.
(function () {
  function show() { document.documentElement.hidden = false; }
  window.addEventListener('pageshow', show);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') show(); });
}());

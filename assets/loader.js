// The welcome screen on the homepage, asked for by one founder on November 10, 2026. A proposal.
// It shows once per visit, for about a second and a half, then gets out of the way. It never shows:
// - without JavaScript (the page shows at once),
// - to people who ask their device for less motion,
// - again when moving around the site in the same tab (it remembers in window.name, which the
//   browser clears when the tab leaves the site; nothing is stored).
// Any tap or key closes it at once. It sends and stores nothing.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || window.name === 'tidelight-welcomed') return;
  window.name = 'tidelight-welcomed';
  root.classList.add('tl-loading');
  var started = Date.now();
  var MIN = 1400;
  var MAX = 2600;
  var done = false;
  function finish() {
    if (done) return;
    done = true;
    root.classList.add('tl-leaving');
    setTimeout(function () {
      root.classList.remove('tl-loading', 'tl-leaving');
      var loader = document.getElementById('tl-loader');
      if (loader) loader.hidden = true;
    }, 450);
  }
  function soon() { setTimeout(finish, Math.max(0, MIN - (Date.now() - started))); }
  setTimeout(finish, MAX);
  window.addEventListener('load', soon);
  document.addEventListener('keydown', finish, true);
  document.addEventListener('DOMContentLoaded', function () {
    var loader = document.getElementById('tl-loader');
    if (!loader) { finish(); return; }
    loader.addEventListener('click', finish);
  });
})();

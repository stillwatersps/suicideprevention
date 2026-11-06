// Site script: the phone menu, quick exit, folded sections, and offline support.
// It sends nothing anywhere and stores nothing about the visitor.

// Opens and closes the phone navigation menu.
(function () {
  var button = document.querySelector('.menu-button');
  var nav = document.getElementById('site-nav');
  if (!button || !nav) return;

  function isOpen() {
    return button.getAttribute('aria-expanded') === 'true';
  }

  function setOpen(open) {
    button.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }

  button.addEventListener('click', function () {
    setOpen(!isOpen());
  });

  // Close after choosing a link.
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) setOpen(false);
  });

  // Escape closes the menu and returns focus to the button.
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      button.focus();
    }
  });

  // Tapping anywhere else closes the menu.
  document.addEventListener('click', function (event) {
    if (isOpen() && !nav.contains(event.target) && !button.contains(event.target)) {
      setOpen(false);
    }
  });

  // Tabbing out of the menu, in either direction, closes it so it never covers the focused item.
  function closeIfFocusLeft(event) {
    var next = event.relatedTarget;
    if (isOpen() && next && !nav.contains(next) && next !== button) {
      setOpen(false);
    }
  }
  nav.addEventListener('focusout', closeIfFocusLeft);
  button.addEventListener('focusout', closeIfFocusLeft);

  // The desktop header has no menu button, so reset the state when the layout changes.
  var desktop = window.matchMedia('(min-width: 960px)');
  function resetOnDesktop() {
    if (desktop.matches) setOpen(false);
  }
  if (desktop.addEventListener) {
    desktop.addEventListener('change', resetOnDesktop);
  } else if (desktop.addListener) {
    desktop.addListener(resetOnDesktop);
  }
})();

// Quick exit: leave for the neutral page in the link, replacing this page in the
// tab's history so Back does not return here. Without JavaScript the link still works.
(function () {
  var exit = document.querySelector('.quick-exit');
  if (!exit) return;
  exit.addEventListener('click', function (event) {
    event.preventDefault();
    window.location.replace(exit.href);
  });
})();

// Folded sections: open the one a link points to, so "On this page" links always land on visible text.
(function () {
  function openTarget() {
    var id = decodeURIComponent(window.location.hash.slice(1));
    var target = id && document.getElementById(id);
    if (!target) return;
    // Open any fold around the target, and a section's own "Show more" fold.
    var fold = target.closest('details');
    while (fold) {
      fold.open = true;
      fold = fold.parentElement && fold.parentElement.closest('details');
    }
    var own = target.querySelector(':scope > details.more');
    if (own) own.open = true;
  }
  window.addEventListener('hashchange', openTarget);
  openTarget();
})();

// Offline support: lets pages that were visited before open with no signal.
// The worker only keeps this site's own files. See sw.js.
(function () {
  var local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!('serviceWorker' in navigator) || (location.protocol !== 'https:' && !local)) return;
  var script = document.currentScript || document.querySelector('script[src$="menu.js"]');
  if (!script) return;
  var root = new URL('../', script.src);
  navigator.serviceWorker.register(new URL('sw.js', root).href, { scope: root.pathname }).catch(function () {});
})();

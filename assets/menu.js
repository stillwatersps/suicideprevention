// Site script: the phone menu, folded sections, and offline support.
// It sends nothing anywhere. The only thing it asks a browser to keep is the offline copy
// of this site's own files. See sw.js.

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

// Quick exit's click handler is the small script in each page's head, so it works from the
// first moment. It blanks the page while the neutral site loads. If a person ever comes back
// to this page, for example in a home screen app with no address bar, show it again, because
// a blank page with no way out is worse. A person waiting for the neutral site sees no change.
function showPageAgain() {
  document.documentElement.hidden = false;
}
window.addEventListener('pageshow', showPageAgain);
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible') showPageAgain();
});

// Feelings opened on the Not sure page close when leaving it, so Back doesn't show them.
window.addEventListener('pagehide', function () {
  Array.prototype.forEach.call(document.querySelectorAll('details.feeling[open]'), function (fold) {
    fold.open = false;
  });
});

// Folded sections: open the one a link points to, so "On this page" links always land on visible text.
(function () {
  function openTarget() {
    var id;
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch (error) {
      return; // A garbled address. Nothing to open, and the rest of this script must still run.
    }
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
  // Respect a person's data-saving setting, since this downloads the whole site in the background.
  if (navigator.connection && navigator.connection.saveData) return;
  var script = document.currentScript || document.querySelector('script[src$="menu.js"]');
  if (!script) return;
  var root = new URL('../', script.src);
  function register() {
    navigator.serviceWorker.register(new URL('sw.js', root).href, { scope: root.pathname }).catch(function () {});
  }
  // Wait until the page has loaded, so saving files never slows down the crisis numbers.
  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register);
  }
})();

// With no connection, say that this may be a saved copy, and what still needs service.
(function () {
  var main = document.getElementById('main');
  if (!main) return;
  var spanish = document.documentElement.lang === 'es';
  var text = spanish
    ? 'Estás sin conexión. Esta puede ser una copia guardada, así que podría estar desactualizada. Llamar y enviar textos requieren servicio telefónico.'
    : "You're offline. This may be a saved copy, so it could be out of date. Calling and texting need phone service.";
  var note = null;
  function update() {
    if (navigator.onLine === false && !note) {
      note = document.createElement('p');
      note.className = 'offline-note';
      note.setAttribute('role', 'status');
      note.textContent = text;
      main.insertBefore(note, main.firstChild);
    } else if (navigator.onLine !== false && note) {
      note.parentNode.removeChild(note);
      note = null;
    }
  }
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
})();

// Printing: folded sections print open, then go back to how they were.
(function () {
  var reopened = [];
  window.addEventListener('beforeprint', function () {
    reopened = Array.prototype.filter.call(document.querySelectorAll('details:not([open])'), function (fold) {
      fold.open = true;
      return true;
    });
  });
  window.addEventListener('afterprint', function () {
    reopened.forEach(function (fold) { fold.open = false; });
    reopened = [];
  });
})();

// Print button on the wallet card page. Hidden until JavaScript can run it.
(function () {
  var button = document.querySelector('.print-button');
  if (!button || !window.print) return;
  button.hidden = false;
  button.addEventListener('click', function () { window.print(); });
})();

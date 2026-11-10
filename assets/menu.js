// Site script: the phone menu, Quick exit from the keyboard, the Spanish link for Spanish browsers,
// folded sections, and offline support. It sends nothing anywhere. The only thing it asks a browser
// to keep is the offline copy of this site's own files. See sw.js.

// Opens and closes the phone navigation menu.
(function () {
  // The head script waits 3 seconds for this, then shows the page list as plain links instead.
  window.tidelightMenuReady = true;
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
  var desktop = window.matchMedia('(min-width: 960px) and (min-width: 60em)');
  function resetOnDesktop() {
    if (desktop.matches) setOpen(false);
  }
  if (desktop.addEventListener) {
    desktop.addEventListener('change', resetOnDesktop);
  } else if (desktop.addListener) {
    desktop.addListener(resetOnDesktop);
  }
})();

// Quick exit from the keyboard: Escape pressed twice within about a second leaves exactly as the
// Quick exit button does, because it clicks that button, and the page's head script does the rest.
// It listens on the way down, before the menu's own Escape handler, so an Escape that closes the
// open menu does only that and doesn't count. Nothing happens while a text field has focus, such as
// the Daily check-in's boxes, where Escape has other uses. Any other key starts the count again,
// and a held-down key counts once. Draft; see notes/CONTENT-REVIEW.md.
(function () {
  var exit = document.querySelector('.quick-exit');
  if (!exit) return;
  var WITHIN_MS = 1000;
  var last = 0;
  var NOT_TEXT = /^(button|checkbox|radio|submit|reset|image|range|color|file)$/i;
  function isTextField(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
    return el.tagName === 'INPUT' && !NOT_TEXT.test(el.getAttribute('type') || '');
  }
  window.addEventListener('keydown', function (event) {
    if (event.repeat) return;
    var plain = !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.isComposing;
    var menuOpen = document.querySelector('.menu-button[aria-expanded="true"]');
    if ((event.key !== 'Escape' && event.key !== 'Esc') || !plain || menuOpen || isTextField(event.target)) {
      last = 0;
      return;
    }
    var now = Date.now();
    if (last && now - last <= WITHIN_MS) {
      last = 0;
      exit.click();
    } else {
      last = now;
    }
  }, true);
})();

// The Spanish link for Spanish browsers: when the browser's first preferred language is Spanish, an
// English page's "Leer en español" link stands out more. It only reads the browser's language setting.
// The words don't change, nothing is stored or sent, and without this script the link looks as it
// always does. Draft; see notes/CONTENT-REVIEW.md.
(function () {
  if (!/^en(-|$)/i.test(document.documentElement.lang || '')) return;
  var first = (navigator.languages && navigator.languages[0]) || navigator.language || '';
  if (!/^es(-|$)/i.test(first)) return;
  var link = document.querySelector('.lang-switch a[hreflang="es"]');
  if (link) link.classList.add('lang-offer');
})();

// Quick exit's click handler is the small script in each page's head, so it works from the
// first moment. It blanks the page while the neutral site loads. Show the page again only when
// a person really comes back to it: with Back, or in a Home Screen app, where weather.gov can
// open on top and a blank app with no address bar would leave no way out. In a browser tab,
// switching apps and returning before weather.gov appears keeps the page blank, so Quick exit
// isn't undone in front of someone else.
function showPageAgain() {
  document.documentElement.hidden = false;
}
function isHomeScreenApp() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
}
window.addEventListener('pageshow', showPageAgain);
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible' && isHomeScreenApp()) showPageAgain();
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
  // A screen reader announces a change only in a live region that was already on the page, so an
  // empty one waits from the start and gets the words when the connection drops.
  var live = document.createElement('p');
  live.className = 'visually-hidden';
  live.setAttribute('role', 'status');
  document.body.appendChild(live);
  function update() {
    if (navigator.onLine === false && !note) {
      note = document.createElement('p');
      note.className = 'offline-note';
      note.textContent = text;
      main.insertBefore(note, main.firstChild);
      live.textContent = text;
    } else if (navigator.onLine !== false && note) {
      note.parentNode.removeChild(note);
      note = null;
      live.textContent = '';
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
  var hint = document.querySelector('.print-hint');
  if (hint) hint.hidden = false;
  button.addEventListener('click', function () { window.print(); });
})();

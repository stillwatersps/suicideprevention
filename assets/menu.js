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

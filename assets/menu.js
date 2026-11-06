// Opens and closes the phone navigation menu.
(function () {
  var button = document.querySelector('.menu-button');
  var nav = document.getElementById('site-nav');
  if (!button || !nav) return;

  function setOpen(open) {
    button.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }

  button.addEventListener('click', function () {
    setOpen(button.getAttribute('aria-expanded') !== 'true');
  });

  // Close after choosing a link, or with Escape, returning focus to the button.
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      button.focus();
    }
  });
})();

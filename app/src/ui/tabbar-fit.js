// The tab bar's five labels don't fit side by side at the largest text sizes on a small phone.
// Then the bar shows icons only. The labels stay in the page for screen readers (visually hidden,
// not removed), and every tab keeps its full tap target. One implementation, used by the app's own
// tab bar (shell.js) and by the tab bar on the website's pages inside the app (app-tabbar.js).
const TAB_AIR = 8; // points of room a label needs inside its tab

export function fitTabBar(bar) {
  if (!bar) return;
  const labels = Array.from(bar.querySelectorAll('.tl-tab-label'));
  labels.forEach((label) => label.classList.remove('visually-hidden'));
  bar.classList.remove('is-compact');
  const tight = labels.some((label) => label.parentNode.clientWidth > 0 && label.scrollWidth + TAB_AIR > label.parentNode.clientWidth);
  if (!tight) return;
  labels.forEach((label) => label.classList.add('visually-hidden'));
  bar.classList.add('is-compact');
}

// Fit now, and again whenever the room or the text size changes.
export function watchTabBar(bar) {
  if (!bar) return;
  let waiting = false;
  const soon = () => { if (waiting) return; waiting = true; requestAnimationFrame(() => { waiting = false; fitTabBar(bar); }); };
  window.addEventListener('resize', soon);
  if (window.ResizeObserver) new ResizeObserver(soon).observe(bar);
  // The text size setting and the page's own font size live on the root element.
  if (window.MutationObserver) new MutationObserver(soon).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-text-size'] });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
  soon();
}

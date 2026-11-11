// Long explanations in Location and Friends become short sections: the same words, in the same
// order, with the how-it-works detail under a "Learn more" row a person can open. Nothing is
// reworded and nothing leaves the page. What always stays in view: anything about urgent help
// (988, 911), the paragraphs beside turning Places on and allowing location, status lines, and
// every control.
import { t } from './words.js';
import { el, icon } from './components.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
const aboutUrgentHelp = (node) => /988|911/.test(node.textContent);

// Moves the given nodes, in order, into `body` under one "Learn more" row placed before `place`.
function learnMore(nodes, place, body) {
  const box = el('details', 'tl-more');
  const row = el('summary', 'tl-more-row');
  row.append(el('span', '', t('more.learn')), icon('next'));
  place.parentNode.insertBefore(box, place);
  nodes.forEach((node) => body.appendChild(node));
  box.append(row, body);
}

export function initSections() {
  // Places that are hard for me: under a heading, the plain paragraph that explains how it works.
  const places = $('#app-places');
  if (places) {
    places.classList.add('tl-sectioned');
    $$('.app-places-setup h4', places).forEach((heading) => {
      const next = heading.nextElementSibling;
      if (next && next.tagName === 'P' && !next.className && !aboutUrgentHelp(next)) learnMore([next], next, el('div', 'tl-more-body'));
    });
  }
  // My circle: the how-it-works points fold away. The point about urgent help stays where it is.
  const circle = $('#app-circle');
  const points = circle && $('.app-accommodations', circle);
  if (points) {
    circle.classList.add('tl-sectioned');
    const detail = Array.from(points.children).filter((point) => !aboutUrgentHelp(point));
    // The row sits above the points that stay, where the folded ones used to begin.
    if (detail.length && detail.length < points.children.length) learnMore(detail, points, el('ul', points.className + ' tl-more-body'));
  }
}

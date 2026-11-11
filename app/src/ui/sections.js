// Location and Friends are short sections with room between them. Only plain how-to text folds
// under a "Learn more" row: nothing is reworded, and nothing leaves the page.
// A founder's rule: every word about privacy or consent stays in view, always. That is anything
// about what is stored, where data stays, who gets a message, and that a sent message can't be
// undone. So do lines about urgent help (988, 911), status lines, and every control. If you are
// not sure a paragraph is only how-to, leave it in view.
// Folded today, and nothing else:
//   - Places: how to add a place (the paragraph under the heading above the list of places).
//   - My circle: how to share something (the paragraph just before "What I've shared").
import { t } from './words.js';
import { el, icon } from './components.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const plainParagraph = (node) => Boolean(node) && node.tagName === 'P' && !node.className && !/988|911/.test(node.textContent);

// Moves one how-to paragraph under a "Learn more" row, in the place where it stood.
function learnMore(paragraph) {
  const box = el('details', 'tl-more');
  const row = el('summary', 'tl-more-row');
  row.append(el('span', '', t('more.learn')), icon('next'));
  const body = el('div', 'tl-more-body');
  paragraph.parentNode.insertBefore(box, paragraph);
  body.appendChild(paragraph);
  box.append(row, body);
}

export function initSections() {
  const places = $('#app-places');
  if (places) {
    places.classList.add('tl-sectioned');
    // Walk back from the list of places to its heading; the how-to is the paragraph right after it.
    let node = $('.app-places-list', places);
    while (node && node.tagName !== 'H4') node = node.previousElementSibling;
    if (node && plainParagraph(node.nextElementSibling)) learnMore(node.nextElementSibling);
  }
  const circle = $('#app-circle');
  if (circle) {
    circle.classList.add('tl-sectioned');
    const shared = $('#app-circle-log-title', circle);
    if (shared && plainParagraph(shared.previousElementSibling)) learnMore(shared.previousElementSibling);
  }
}

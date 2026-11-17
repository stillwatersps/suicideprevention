// "All tools" (#tl-tools, opened from Home): every tool in one list, with a search field. What is
// typed is only ever in the field: it is not kept, logged, or sent, and it is cleared when the
// screen is left. Words that read like a search for urgent help show the crisis lines first.
import { EVERY, findTools, asksForHelp } from '../logic/tools.js';
import { t } from './words.js';
import { el, icon } from './components.js';
import { openTool } from './toolkit.js';

const $ = (sel) => document.querySelector(sel);

export function initToolsList(shell) {
  const list = $('#tl-tools-list');
  const field = $('#tl-tools-search');
  if (!list || !field) return;
  const status = $('#tl-tools-status');
  const textOf = (tool) => t('tool.' + tool.id) + ' ' + t('tool.' + tool.id + '.about');
  const rows = {};
  EVERY.forEach((tool) => {
    const item = el('li');
    const button = el('button', 'tl-card tl-card-action');
    button.type = 'button';
    button.setAttribute('data-tool-open', tool.id);
    const mark = el('span', 'tl-card-icon');
    mark.appendChild(icon(tool.icon));
    const text = el('span', 'tl-card-text');
    text.append(el('span', 'tl-card-title', t('tool.' + tool.id)), ' ', el('span', 'tl-card-sub', t('tool.' + tool.id + '.about')));
    const go = el('span', 'tl-card-go');
    go.appendChild(icon('next'));
    button.append(mark, text, go);
    item.appendChild(button);
    list.appendChild(item);
    rows[tool.id] = item;
  });
  const filter = () => {
    const query = field.value;
    const found = findTools(EVERY, query, textOf).map((tool) => tool.id);
    EVERY.forEach((tool) => { rows[tool.id].hidden = found.indexOf(tool.id) === -1; });
    $('#tl-tools-crisis').hidden = !asksForHelp(query);
    const typed = query.trim().length > 0;
    status.textContent = !typed ? '' : t(found.length ? 'tools.some' : 'tools.none');
    status.hidden = !typed;
  };
  field.addEventListener('input', filter);
  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tool-open]');
    if (button) openTool(shell, button.getAttribute('data-tool-open'));
  });
  const clear = () => { field.value = ''; filter(); };
  shell.onHide('tools', clear);
  window.addEventListener('pageshow', clear); // back from Quick exit: nothing typed is left
  filter();
}

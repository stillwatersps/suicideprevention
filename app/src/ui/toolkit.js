// "My toolkit": up to four tools the person pins to Home (#tl-home-toolkit), chosen on their own
// screen (#tl-toolkit). Only the tools' ids are kept. A draft: no licensed reviewer has seen it.
import { CONFIG } from '../core/config.js';
import { TOOLS, toolById, isPinned, setPinned } from '../logic/tools.js';
import { state, save } from './state.js';
import { t } from './words.js';
import { el, icon } from './components.js';
import { startType } from './meditate.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));

// Opens a tool the way its own row or card does.
export function openTool(shell, id) {
  const tool = toolById(id);
  if (!tool) return;
  if (tool.session) startType(tool.session, { minutes: tool.minutes });
  else if (tool.legacy) shell.openLegacy(tool.legacy);
  else shell.push(tool.push);
}

export function renderToolkit() {
  const list = $('#tl-home-toolkit-list');
  if (!list) return;
  const pinned = state.toolkit.pinned;
  list.textContent = '';
  pinned.forEach((id) => {
    const button = el('button', 'tl-btn tl-btn-secondary');
    button.type = 'button';
    button.setAttribute('data-toolkit-open', id);
    button.append(icon(toolById(id).icon), el('span', '', t('tool.' + id)));
    list.appendChild(button);
  });
  list.hidden = pinned.length === 0;
  $('#tl-home-toolkit-empty').hidden = pinned.length > 0;
  $$('#tl-toolkit-list input').forEach((box) => { box.checked = isPinned(state.toolkit, box.getAttribute('data-tool')); });
}

export function initToolkit(shell) {
  const chooser = $('#tl-toolkit-list');
  if (!chooser || !$('#tl-home-toolkit')) return;
  const status = $('#tl-toolkit-status');
  TOOLS.forEach((tool) => {
    const row = el('label', 'tl-switch');
    const box = el('input');
    box.type = 'checkbox';
    box.setAttribute('data-tool', tool.id);
    row.append(el('span', '', t('tool.' + tool.id)), box);
    chooser.appendChild(row);
  });
  chooser.addEventListener('change', async (event) => {
    const box = event.target.closest('input[data-tool]');
    if (!box) return;
    const result = setPinned(state.toolkit, box.getAttribute('data-tool'), box.checked, CONFIG.toolkit);
    status.hidden = !result.full;
    await save('toolkit', result.toolkit);
    renderToolkit();
  });
  $('#tl-home-toolkit-list').addEventListener('click', (event) => {
    const button = event.target.closest('[data-toolkit-open]');
    if (button) openTool(shell, button.getAttribute('data-toolkit-open'));
  });
  shell.onShow('home', renderToolkit);
  shell.onShow('toolkit', () => { status.hidden = true; renderToolkit(); });
  renderToolkit();
}

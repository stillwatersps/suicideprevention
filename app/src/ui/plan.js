// "My safety plan": six short lists in the person's own words, kept on this phone only, to read
// in a hard moment. The rules for what a plan holds are in src/logic/plan.js; this draws it and
// saves it. Call 988, Text 988, and Call 911 are part of the screen itself (part 5) and are never
// entries a person can remove. A draft: no licensed reviewer has seen it.
import { CONFIG } from '../core/config.js';
import { PARTS, PEOPLE_PARTS, addEntry, removeEntry, isFull, isEmpty, planLines, dialable } from '../logic/plan.js';
import { Tidelight } from '../native.js';
import { state, replace } from './state.js';
import { t } from './words.js';
import { el } from './components.js';
import { haptic } from './haptics.js';
import { devLog } from '../core/dev.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
const limits = CONFIG.plan;
const partBox = (part) => $('#tl-plan [data-plan-part="' + part + '"]');
// Each part's name as the screen shows it, for a copy of the plan.
const headings = () => Object.fromEntries(PARTS.map((part) => [part, $('#tl-plan-' + part + '-title').textContent.trim()]));

// The plan as plain text: for sharing it, and for "Make a copy of my data".
export function planText() {
  const lines = planLines(state.plan, headings());
  return lines.length ? [t('plan.title'), ...lines].join('\n') : '';
}

function say(key) {
  const status = $('#tl-plan-status');
  status.textContent = t(key);
  status.hidden = false;
}

function row(part, item, index) {
  const line = el('li', 'tl-plan-item');
  const person = PEOPLE_PARTS.includes(part);
  const text = person ? [item.name, item.phone].filter(Boolean).join(', ') : item;
  line.appendChild(el('span', 'tl-plan-text', text));
  const actions = el('span', 'tl-row');
  // A person with a number can be called from here. It is their own person, never a crisis line.
  if (person && dialable(item.phone)) {
    const call = el('a', 'tl-btn tl-btn-secondary tl-plan-call', t('plan.call', { name: item.name }));
    call.href = 'tel:' + dialable(item.phone);
    actions.appendChild(call);
  }
  const remove = el('button', 'tl-btn tl-btn-quiet', t('plan.remove'));
  remove.type = 'button';
  remove.setAttribute('aria-label', t('plan.removeNamed', { text }));
  remove.setAttribute('data-plan-remove', String(index));
  actions.appendChild(remove);
  line.appendChild(actions);
  return line;
}

export function renderPlan() {
  if (!$('#tl-plan')) return;
  for (const part of PARTS) {
    const box = partBox(part);
    const list = $('.tl-plan-list', box);
    list.textContent = '';
    state.plan[part].forEach((item, index) => list.appendChild(row(part, item, index)));
    list.hidden = state.plan[part].length === 0;
    const full = isFull(state.plan, part, limits);
    const note = $('[data-plan-full]', box);
    note.textContent = t('plan.full', { count: limits.maxItems });
    note.hidden = !full;
    $$('input, [data-plan-add], [data-plan-pick]', box).forEach((control) => { control.disabled = full; });
  }
  // Sharing, and the way in from the support screen, appear once there is something in the plan.
  const empty = isEmpty(state.plan);
  $('#tl-plan-share-box').hidden = empty;
  $$('[data-plan-open]').forEach((button) => { button.hidden = empty; });
}

async function keep(next, saidKey) {
  if (next === state.plan) return false;
  try { await replace('plan', next); } catch (e) { devLog('plan', e); state.plan = next; }
  renderPlan();
  say(saidKey);
  return true;
}

export function initPlan(shell, ctx) {
  const screen = $('#tl-plan');
  if (!screen) return;
  const now = () => new Date().toISOString();

  async function add(part) {
    const box = partBox(part);
    let entry;
    if (PEOPLE_PARTS.includes(part)) entry = { name: $('[data-plan-name]', box).value, phone: $('[data-plan-phone]', box).value };
    else entry = $('[data-plan-text]', box).value;
    const kept = await keep(addEntry(state.plan, part, entry, limits, now()), 'plan.saved');
    if (!kept) { $('input', box).focus(); return; }
    haptic('select');
    $$('input', box).forEach((input) => { input.value = ''; });
    // The next thing to add goes in the same place, unless this part is now full.
    const first = $('input:not([disabled])', box);
    if (first) first.focus(); else $('#tl-plan-status').focus();
  }

  screen.addEventListener('click', async (event) => {
    const box = event.target.closest('[data-plan-part]');
    if (!box) return;
    const part = box.getAttribute('data-plan-part');
    if (event.target.closest('[data-plan-add]')) { await add(part); return; }
    const remove = event.target.closest('[data-plan-remove]');
    if (remove) {
      await keep(removeEntry(state.plan, part, Number(remove.getAttribute('data-plan-remove')), now()), 'plan.removed');
      // What was focused is gone: the part's own name takes the focus, so a screen reader stays put.
      const title = $('.tl-headline', box);
      title.setAttribute('tabindex', '-1');
      title.focus();
      return;
    }
    if (event.target.closest('[data-plan-pick]')) {
      // The phone's own contact picker hands over the one person tapped, and nothing else.
      let picked;
      try { picked = await Tidelight.pickContact(); } catch (e) { picked = { cancelled: true }; }
      if (!picked || picked.cancelled) return;
      await keep(addEntry(state.plan, part, { name: picked.name || picked.phone, phone: picked.phone }, limits, now()), 'plan.saved');
    }
  });
  // Return in a field adds what was typed, as the Add button does.
  screen.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || !event.target.matches('input')) return;
    const box = event.target.closest('[data-plan-part]');
    if (!box) return;
    event.preventDefault();
    add(box.getAttribute('data-plan-part'));
  });

  // Sharing goes through the same notice as every other share: who sees it, that it can't be
  // taken back, and that it isn't a way to get urgent help. The person reads the words first.
  $('#tl-plan-share').addEventListener('click', (event) => {
    const text = planText();
    if (text && ctx.share) ctx.share(text, event.currentTarget);
  });

  shell.onShow('plan', () => { $('#tl-plan-status').hidden = true; renderPlan(); });
  renderPlan();
}

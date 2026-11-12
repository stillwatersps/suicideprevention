// The Meditate tab: a suggestion, the four built-in types, presets, the builder's door, and
// history. Starting a session is one tap. Location is read only here, on demand, to see whether
// the person is near their own saved home spot; it is never watched, kept, or sent.
import { CONFIG } from '../core/config.js';
import { builtIn, minutesMeditated } from '../logic/meditations.js';
import { suggestMeditation, typesDoneOn } from '../logic/suggest.js';
import { dateKey } from '../logic/streaks.js';
import { toMinutes } from '../logic/spread.js';
import { t, lang } from './words.js';
import { state, style } from './state.js';
import { choiceGroup, el } from './components.js';
import { audioRoute, locationPermission, currentPosition, distanceMeters } from './device.js';
import { playMeditation } from './player.js';
import { addDevAction } from './settings.js';
import { devLog } from '../core/dev.js';

const $ = (sel, scope) => (scope || document).querySelector(sel);
const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
const cards = {}; // per type: { length, world, sound } choice groups
let suggestion = { type: 'silent', reason: 'anywhere', voice: false };
let nearHome = { at: 0, value: null };
const pretend = { time: '', headphones: '', home: '' }; // Developer overrides

const typeName = (type) => t('med.' + type);
const tri = (value) => (value === 'yes' ? true : value === 'no' ? false : undefined);

// Whether the person is within about 150 m of their home spot. Asked at most every ten minutes,
// only while a screen that shows the suggestion is open. null when it can't be known.
async function atHome() {
  if (!state.home) return null;
  if (Date.now() - nearHome.at < 600000) return nearHome.value;
  let value = null;
  try {
    if ((await locationPermission()) === 'granted') {
      const here = await currentPosition();
      if (here) value = distanceMeters(here, state.home) <= CONFIG.meditation.homeRadiusMeters;
    }
  } catch (e) { devLog('near home', e); }
  nearHome = { at: Date.now(), value };
  return value;
}

export async function suggestionContext() {
  const now = new Date();
  const route = await audioRoute();
  const forced = { headphones: tri(pretend.headphones), home: tri(pretend.home) };
  return {
    minutesOfDay: pretend.time ? toMinutes(pretend.time) : now.getHours() * 60 + now.getMinutes(),
    headphones: forced.headphones === undefined ? route.headphones : forced.headphones,
    atHome: forced.home === undefined ? await atHome() : forced.home,
    silent: route.silent,
    doneTypesToday: typesDoneOn(state.sessions, dateKey(now), dateKey),
  };
}

// The options a type starts with: the card's choices, then the person's settings.
function optionsFor(type, over) {
  const card = cards[type];
  const prefs = state.settings.meditation;
  const options = { minutes: card ? Number(card.length.get()) : undefined, style: style() };
  if (card && card.world.get()) options.world = card.world.get();
  if (card && card.sound && card.sound.get()) options.sound = card.sound.get();
  if (prefs.voice === false) options.voice = false;
  if (prefs.hapticBreathing === false) options.haptics = false;
  return Object.assign(options, over || {});
}
export function startType(type, over) {
  const options = optionsFor(type, over);
  const meditation = builtIn(type, options);
  const minutes = meditation.totalSeconds / 60;
  meditation.title = t('med.withLength', { name: typeName(type), minutes });
  return playMeditation(meditation, { key: type + '-' + minutes, name: meditation.title, builtIn: { type, minutes, world: meditation.world, sound: meditation.backgroundSound } });
}

export async function renderSuggestion() {
  const waiting = $$('#tl-suggest-card, #tl-home-suggest');
  if (!$('[data-suggest-title]').textContent) waiting.forEach((card) => card.classList.add('tl-shimmer'));
  try { suggestion = suggestMeditation(await suggestionContext()); } catch (e) { devLog('suggestion', e); }
  $$('[data-suggest-title]').forEach((node) => { node.textContent = typeName(suggestion.type); });
  $$('[data-suggest-reason]').forEach((node) => { node.textContent = t('suggest.' + suggestion.reason); });
  $$('#tl-suggest-card .tl-cover, #tl-home-suggest .tl-cover').forEach((cover) => cover.setAttribute('data-cover', suggestion.type));
  $$('#tl-suggest-card, #tl-home-suggest').forEach((card) => card.setAttribute('aria-label', t('med.startLabel', { minutes: CONFIG.meditation.lengths[suggestion.type][0], name: typeName(suggestion.type) }) + '. ' + t('suggest.' + suggestion.reason)));
  waiting.forEach((card) => card.classList.remove('tl-shimmer'));
  const line = $('#tl-dev-suggest');
  if (line) line.textContent = typeName(suggestion.type) + ': ' + t('suggest.' + suggestion.reason);
  return suggestion;
}

function when(iso) {
  try { return new Date(iso).toLocaleString(lang(), { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return iso; }
}
export function renderHistory() {
  const total = t('history.total', { minutes: minutesMeditated(state.sessions) });
  $$('[data-history-total]').forEach((node) => { node.textContent = total; });
  const list = $('#tl-history-list');
  if (!list) return;
  list.textContent = '';
  state.sessions.forEach((s) => {
    const item = el('li', 'tl-card');
    const text = el('span', 'tl-card-text');
    const minutes = Math.max(1, Math.round(s.completedSeconds / 60));
    text.append(el('span', 'tl-card-title', t(s.completed ? 'history.item' : 'history.partial', { name: typeName(s.type), minutes })), el('span', 'tl-card-sub', when(s.startedAt)));
    item.append(el('span', 'tl-card-icon'), text);
    list.appendChild(item);
  });
  $('#tl-history-empty').hidden = state.sessions.length > 0;
}

function labelStart(card) {
  const type = card.getAttribute('data-type');
  $('[data-type-start]', card).setAttribute('aria-label', t('med.startLabel', { minutes: cards[type].length.get(), name: typeName(type) }));
}

export function initMeditate(shell) {
  if (!$('#tl-types')) return;
  $$('.tl-type').forEach((card) => {
    const type = card.getAttribute('data-type');
    const more = $('.tl-type-more', card);
    const options = $('[data-type-options]', card);
    cards[type] = {
      length: choiceGroup($('[data-type-length]', card), { onChange: () => labelStart(card) }),
      world: choiceGroup($('[data-type-world]', card), {}),
      sound: $('[data-type-sound]', card) ? choiceGroup($('[data-type-sound]', card), {}) : null,
    };
    const defaults = builtIn(type, {});
    cards[type].world.set(defaults.world);
    if (cards[type].sound) cards[type].sound.set(defaults.backgroundSound);
    labelStart(card);
    const toggle = () => { more.hidden = !more.hidden; options.setAttribute('aria-expanded', String(!more.hidden)); };
    options.addEventListener('click', toggle);
    $('[data-type-start]', card).addEventListener('click', () => startType(type));
    // A long press on the card opens its options too.
    let press = null;
    card.addEventListener('touchstart', (event) => { if (!event.target.closest('button')) press = setTimeout(() => { press = null; if (more.hidden) toggle(); }, 500); }, { passive: true });
    ['touchend', 'touchmove', 'touchcancel'].forEach((name) => card.addEventListener(name, () => clearTimeout(press), { passive: true }));
  });
  const startSuggested = () => startType(suggestion.type, suggestion.voice === false ? { voice: false } : {});
  $('#tl-suggest-card').addEventListener('click', startSuggested);
  $('#tl-home-suggest').addEventListener('click', startSuggested);
  $('#tl-home-reset').addEventListener('click', () => startType('quick', { minutes: 1 }));

  shell.onShow('meditate', () => { renderSuggestion(); renderHistory(); });
  shell.onShow('home', renderSuggestion);
  shell.onShow('history', renderHistory);
  addDevAction(() => {
    const read = () => { pretend.time = $('#tl-dev-time').value; pretend.headphones = $('#tl-dev-headphones').value; pretend.home = $('#tl-dev-home').value; renderSuggestion(); };
    ['#tl-dev-time', '#tl-dev-headphones', '#tl-dev-home'].forEach((sel) => $(sel).addEventListener('change', read));
  });
  renderSuggestion();
  renderHistory();
}

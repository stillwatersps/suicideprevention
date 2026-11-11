// Scripts never hold words for people. Every word is in the page, from src/text/redesign.*.html,
// in a hidden table of `data-word` entries. Some words come in two voices, keyed by check-in style.
const cache = new Map();

function find(key, style) {
  const id = key + '|' + (style || '');
  if (cache.has(id)) return cache.get(id);
  const all = Array.from(document.querySelectorAll('.tl-words [data-word="' + key + '"]'));
  const hit = (style && all.find((el) => el.getAttribute('data-style') === style)) || all.find((el) => !el.hasAttribute('data-style')) || all[0];
  const text = hit ? hit.textContent.trim() : '';
  cache.set(id, text);
  return text;
}

// t('streak.best', { best: 12 }) fills {best}. A missing word comes back empty, never as a key.
export function t(key, values, style) {
  const text = find(key, style);
  if (!values) return text;
  return text.replace(/\{([a-zA-Z]+)\}/g, (all, name) => (values[name] === undefined || values[name] === null ? '' : String(values[name])));
}
export function hasWord(key) { return find(key) !== ''; }
export function lang() { return document.documentElement.lang || 'en'; }

// A time of day such as "07:30", shown the way the phone's language writes it.
export function clockText(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  const date = new Date(2026, 0, 1, h || 0, m || 0);
  try { return date.toLocaleTimeString(lang(), { hour: 'numeric', minute: '2-digit' }); } catch (e) { return hhmm; }
}

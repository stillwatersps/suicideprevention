// The tools a person can open from a list (My toolkit; later, a list of every tool), as data:
// an id and how it opens. Names are words in src/text ("tool.<id>"). Pure rules, no browser.
// The crisis lines are not tools: they are on every screen and can't be pinned or unpinned.
export const TOOLS = Object.freeze([
  { id: 'reset', icon: 'wind', session: 'quick', minutes: 1 },
  { id: 'ground', icon: 'stone', push: 'ground' },
  { id: 'ride', icon: 'clock', push: 'ride' },
  { id: 'plan', icon: 'lifebuoy', push: 'plan' },
  { id: 'letter', icon: 'edit', push: 'letter' },
  { id: 'hope', icon: 'box', legacy: 'app-hope' },
  { id: 'good', icon: 'star', push: 'good' },
  { id: 'reframe', icon: 'spark', push: 'reframe' },
  { id: 'kind', icon: 'heart', push: 'kind' },
  { id: 'journal', icon: 'book', legacy: 'ci-journal' },
  { id: 'wind', icon: 'moon', push: 'wind' },
  { id: 'helps', icon: 'check', push: 'helps' },
  { id: 'course', icon: 'path', push: 'course' },
  { id: 'nearby', icon: 'pin', push: 'nearby' },
].map(Object.freeze));
export const toolById = (id) => TOOLS.find((tool) => tool.id === id) || null;

// Tools that are in the list of every tool but can't be pinned: each has a tab, a tile, or a row
// of its own already. `go` opens a tab.
export const MORE = Object.freeze([
  { id: 'checkin', icon: 'heart', push: 'flow' },
  { id: 'meditate', icon: 'horizon', go: 'meditate' },
  { id: 'week', icon: 'clock', push: 'week' },
  { id: 'summary', icon: 'copy', push: 'summary' },
  { id: 'reach', icon: 'people', push: 'reach' },
  { id: 'circle', icon: 'people', go: 'friends' },
  { id: 'rediscover', icon: 'spark', legacy: 'ci-rediscover' },
  { id: 'journey', icon: 'path', legacy: 'ci-journey' },
].map(Object.freeze));
export const EVERY = Object.freeze(TOOLS.concat(MORE));
export const anyTool = (id) => EVERY.find((tool) => tool.id === id) || null;

const plain = (text) => String(text === null || text === undefined ? '' : text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
// The tools that match what was typed: every word typed must be somewhere in the tool's name or
// its line. Capitals and accents don't matter. Nothing typed matches every tool.
export function findTools(list, query, textOf) {
  const words = plain(query).split(' ').filter(Boolean);
  return list.filter((tool) => { const text = plain(textOf(tool)); return words.every((word) => text.includes(word)); });
}
// True when what was typed reads like someone looking for urgent help. The list of tools then
// shows the crisis lines first. It errs on the side of showing them.
const HELP_PARTS = ['suicid', 'kill', 'dying', 'crisis', 'emergenc', 'overdos', 'self-harm', 'self harm', 'selfharm', 'hurt', 'harm', 'help', 'hotline', 'lifeline', 'end my life', 'end it',
  'matar', 'morir', 'muert', 'autolesi', 'sobredosis', 'ayuda', 'quitarme la vida', 'hacerme dano'];
const HELP_WORDS = ['die', 'dead', '988', '911', 'sos'];
export function asksForHelp(query) {
  const text = ' ' + plain(query) + ' ';
  return HELP_PARTS.some((part) => text.includes(part)) || HELP_WORDS.some((word) => new RegExp('[^a-z0-9]' + word + '[^a-z0-9]').test(text));
}

export const emptyToolkit = () => ({ pinned: [] });
// Whatever was stored comes back as a clean list of known tools, in the order pinned: never broken.
export function cleanToolkit(stored, limits) {
  const list = stored && typeof stored === 'object' && !Array.isArray(stored) && Array.isArray(stored.pinned) ? stored.pinned : [];
  return { pinned: [...new Set(list.filter((id) => typeof id === 'string' && toolById(id)))].slice(0, limits.max) };
}
export const isPinned = (toolkit, id) => toolkit.pinned.indexOf(id) !== -1;
// Pin or unpin one tool. Returns { toolkit, full }: `full` is true when a pin was refused
// because the most that fit are already pinned.
export function setPinned(toolkit, id, on, limits) {
  const rest = toolkit.pinned.filter((item) => item !== id);
  if (!on || !toolById(id)) return { toolkit: cleanToolkit({ pinned: rest }, limits), full: false };
  if (rest.length >= limits.max) return { toolkit: cleanToolkit(toolkit, limits), full: true };
  return { toolkit: cleanToolkit({ pinned: rest.concat([id]) }, limits), full: false };
}

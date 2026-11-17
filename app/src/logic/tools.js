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

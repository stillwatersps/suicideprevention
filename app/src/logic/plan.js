// The safety plan: a short list, in the person's own words, of what to do when things get hard.
// Six parts, in the order the website's Get Help page gives them (after the Stanley-Brown Safety
// Planning Intervention). Pure: no browser and no phone in here, so Node can test it.
// A draft. No licensed reviewer has seen the parts, their order, or their names.

// Parts that hold a line of text, and parts that hold a person (a name, and a phone number if
// they gave one).
export const TEXT_PARTS = ['signs', 'coping', 'distract', 'safer'];
export const PEOPLE_PARTS = ['people', 'pros'];
// The order on screen and in a copy of the plan.
export const PARTS = ['signs', 'coping', 'distract', 'people', 'pros', 'safer'];

export const emptyPlan = () => ({ signs: [], coping: [], distract: [], people: [], pros: [], safer: [], updatedAt: '' });

// One line, as typed: no line breaks, no runs of spaces, no longer than the limit.
export function tidyLine(value, maxLength) {
  return String(value === null || value === undefined ? '' : value).replace(/\s+/g, ' ').trim().slice(0, maxLength);
}
// A phone number as typed, kept to what a phone can dial.
export function tidyPhone(value) {
  return String(value === null || value === undefined ? '' : value).replace(/[^\d+*#(). -]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
}
// What goes after "tel:" for a number as typed.
export const dialable = (phone) => tidyPhone(phone).replace(/[^\d+*#]/g, '');

// Whatever was stored, made safe to use: damaged parts become empty, damaged entries are left
// out, long ones are cut, and no part holds more than the limit.
export function cleanPlan(value, limits) {
  const plan = emptyPlan();
  const from = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  for (const part of TEXT_PARTS) {
    plan[part] = (Array.isArray(from[part]) ? from[part] : [])
      .filter((item) => typeof item === 'string').map((item) => tidyLine(item, limits.maxLength)).filter(Boolean).slice(0, limits.maxItems);
  }
  for (const part of PEOPLE_PARTS) {
    plan[part] = (Array.isArray(from[part]) ? from[part] : [])
      .filter((item) => item && typeof item === 'object' && typeof item.name === 'string')
      .map((item) => ({ name: tidyLine(item.name, limits.maxLength), phone: tidyPhone(item.phone) }))
      .filter((item) => item.name).slice(0, limits.maxItems);
  }
  plan.updatedAt = typeof from.updatedAt === 'string' ? from.updatedAt.slice(0, 40) : '';
  return plan;
}

export const isFull = (plan, part, limits) => plan[part].length >= limits.maxItems;
export const isEmpty = (plan) => PARTS.every((part) => plan[part].length === 0);

// Adds one entry and returns a new plan; the same plan comes back if the entry is empty, the
// part is full, or the part isn't one. `entry` is a line of text, or { name, phone } for a person.
export function addEntry(plan, part, entry, limits, now) {
  if (!PARTS.includes(part) || isFull(plan, part, limits)) return plan;
  let item;
  if (PEOPLE_PARTS.includes(part)) {
    const name = tidyLine(entry && entry.name, limits.maxLength);
    const phone = tidyPhone(entry && entry.phone);
    if (!name && !phone) return plan;
    item = { name: name || phone, phone };
    if (plan[part].some((mine) => mine.name === item.name && dialable(mine.phone) === dialable(item.phone))) return plan;
  } else {
    item = tidyLine(entry, limits.maxLength);
    if (!item || plan[part].includes(item)) return plan;
  }
  return Object.assign({}, plan, { [part]: plan[part].concat([item]), updatedAt: now || plan.updatedAt });
}

export function removeEntry(plan, part, index, now) {
  if (!PARTS.includes(part) || index < 0 || index >= plan[part].length) return plan;
  return Object.assign({}, plan, { [part]: plan[part].filter((item, i) => i !== index), updatedAt: now || plan.updatedAt });
}

// The plan as lines of plain text, for a copy of the person's data and for sharing it. `headings`
// maps each part to its name on screen. A part with nothing in it is left out.
export function planLines(plan, headings) {
  const out = [];
  for (const part of PARTS) {
    if (!plan[part].length) continue;
    out.push(headings[part]);
    for (const item of plan[part]) out.push('- ' + (typeof item === 'string' ? item : [item.name, item.phone].filter(Boolean).join(', ')));
  }
  return out;
}

// The plan as one plain page to print or keep: its title, when it was made, each part that has
// something in it, and always, at the end, the crisis lines. words: { title, made, note, now,
// call988, call911 }. The crisis lines are on the page even if the plan is empty.
export function planPage(plan, headings, words) {
  const out = [String(words.title).toUpperCase(), words.made, words.note];
  for (const part of PARTS) {
    if (!plan[part].length) continue;
    out.push('', headings[part]);
    for (const item of plan[part]) out.push('- ' + (typeof item === 'string' ? item : [item.name, item.phone].filter(Boolean).join(', ')));
  }
  out.push('', String(words.now).toUpperCase(), words.call988, words.call911);
  return out.join('\n') + '\n';
}

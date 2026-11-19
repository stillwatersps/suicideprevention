// "One small thing for today": one line from the person's own list of things they'd like to try
// (kept by the older check-in page), a different one each day. The app adds nothing to the list
// and suggests nothing of its own. Pure rules, no browser and no phone.

// The list as stored, cleaned: short lines of the person's own, in their order.
export function ownList(stored) {
  return (Array.isArray(stored) ? stored : []).filter((line) => typeof line === 'string' && line.trim()).map((line) => line.replace(/\s+/g, ' ').trim());
}

// A steady number for a day ("2026-11-17"), so the same day always starts on the same line.
export function dayNumber(day) {
  let n = 0;
  for (const ch of String(day)) n = (n * 31 + ch.charCodeAt(0)) % 100003;
  return n;
}

// Today's line, or '' when the list is empty. `skip` moves on by that many ("Another one").
export function pickStep(list, day, skip = 0) {
  if (!list.length) return '';
  const moved = Number.isFinite(skip) ? Math.max(0, Math.floor(skip)) : 0;
  return list[(dayNumber(day) + moved) % list.length];
}

// A backup file: what the app keeps on the phone, as it is stored, in one file the app can read
// back. Pure rules, no browser and no phone. The file is not locked: the screen says so.
// Photos are not in it (they are not kept with the rest).
export const BACKUP_KIND = 'tidelight-backup';
export const BACKUP_VERSION = 1;

// values: { storageKey: the stored text, or null }. Only what is stored goes in.
export function buildBackup(values, { schema, made }) {
  const data = {};
  Object.keys(values).sort().forEach((key) => { if (typeof values[key] === 'string') data[key] = values[key]; });
  return JSON.stringify({ kind: BACKUP_KIND, version: BACKUP_VERSION, schema, made, data }, null, 1) + '\n';
}

// Reads a file's text. Returns { ok: true, schema, data } with only the keys this app knows,
// each a piece of text no longer than the limit; or { ok: false, why: 'notOne' | 'newer' }.
export function readBackup(text, { keys, schema, maxBytes, maxValue }) {
  if (typeof text !== 'string' || !text.length || text.length > maxBytes) return { ok: false, why: 'notOne' };
  let file;
  try { file = JSON.parse(text); } catch (e) { return { ok: false, why: 'notOne' }; }
  const plain = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
  if (!plain(file) || file.kind !== BACKUP_KIND || !plain(file.data) || !Number.isInteger(file.schema) || file.schema < 1) return { ok: false, why: 'notOne' };
  if (file.version !== BACKUP_VERSION || file.schema > schema) return { ok: false, why: file.version > BACKUP_VERSION || file.schema > schema ? 'newer' : 'notOne' };
  const data = {};
  keys.forEach((key) => { const value = file.data[key]; if (typeof value === 'string' && value.length <= maxValue) data[key] = value; });
  return { ok: true, schema: file.schema, data };
}

// A reminder for a time is set on the phone, not in the file: a restored copy says no time is
// set, so the screen never claims a reminder the phone doesn't have.
export function withoutTimes(value) {
  try {
    const kept = JSON.parse(value);
    if (kept && typeof kept === 'object' && !Array.isArray(kept) && 'at' in kept) { kept.at = ''; return JSON.stringify(kept); }
  } catch (e) { /* not JSON: left as it is, and cleaned when the app reads it */ }
  return value;
}

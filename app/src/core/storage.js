// The app's one storage layer. Everything kept on the phone goes through here, as JSON under a
// `tidelight.` key, with a schema version so a stored shape can change through a migration.
// Nothing here sends anything anywhere: the backend is the phone's own Preferences (or the
// browser's localStorage when the app is tried in a desktop browser).
// This file has no browser or phone code in it, so Node can test it with an in-memory backend.

export const SCHEMA_KEY = 'tidelight.schema';
// 1: before the redesign (no schema key stored). 2: the redesign (settings, days, streak, ...).
export const SCHEMA_VERSION = 2;

// Every key the app stores, old and new. The older keys keep their names and shapes.
export const KEYS = Object.freeze({
  checkin: 'tidelight.checkin.v1', // the Daily check-in's state (journal, lists, calendar)
  ageGroup: 'tidelight.agegroup.v1', // plain text, not JSON
  textSize: 'tidelight.textsize.v1', // plain text, not JSON
  log: 'tidelight.log.v1', // one line per check-in
  oldReminders: 'tidelight.reminders.v1', // the four older reminders; read once by the migration
  places: 'tidelight.places.v1',
  hope: 'tidelight.hope.v1',
  circle: 'tidelight.circle.v1',
  settings: 'tidelight.settings',
  profile: 'tidelight.profile',
  onboarding: 'tidelight.onboarding',
  home: 'tidelight.home',
  days: 'tidelight.days',
  streak: 'tidelight.streak',
  sessions: 'tidelight.sessions',
  presets: 'tidelight.presets',
  language: 'tidelight.language', // plain text
});

export function memoryBackend(initial) {
  const data = new Map(Object.entries(initial || {}));
  return {
    async get(key) { return data.has(key) ? data.get(key) : null; },
    async set(key, value) { data.set(key, String(value)); },
    async remove(key) { data.delete(key); },
    dump() { return Object.fromEntries(data); },
  };
}

// migrations: { 2: async (store) => {...}, 3: ... }, run in order from the stored version + 1.
export function createStore(backend, migrations = {}, version = SCHEMA_VERSION) {
  const store = {
    getRaw: (key) => backend.get(key),
    setRaw: (key, value) => backend.set(key, String(value)),
    remove: (key) => backend.remove(key),
    // JSON get: the fallback comes back when nothing is stored or it can't be read. When the
    // fallback is a plain object, stored fields are laid over it, so new fields get their defaults.
    async get(key, fallback) {
      let value;
      try { value = JSON.parse((await backend.get(key)) ?? 'null'); } catch (e) { value = null; }
      if (value === null || value === undefined) return clone(fallback);
      if (isPlain(fallback)) return isPlain(value) ? merge(clone(fallback), value) : clone(fallback);
      if (Array.isArray(fallback)) return Array.isArray(value) ? value : clone(fallback);
      return typeof value === typeof fallback || fallback === null || fallback === undefined ? value : clone(fallback);
    },
    async set(key, value) { await backend.set(key, JSON.stringify(value)); },
    async schemaVersion() {
      const stored = Number(await backend.get(SCHEMA_KEY));
      return Number.isInteger(stored) && stored > 0 ? stored : 1;
    },
    // Brings stored data up to this build's version. Returns the versions it ran.
    async migrate() {
      const from = await store.schemaVersion();
      const ran = [];
      for (let v = from + 1; v <= version; v += 1) {
        if (migrations[v]) await migrations[v](store);
        await backend.set(SCHEMA_KEY, String(v));
        ran.push(v);
      }
      if (!ran.length && (await backend.get(SCHEMA_KEY)) === null) await backend.set(SCHEMA_KEY, String(from));
      return ran;
    },
  };
  return store;
}

function isPlain(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
function merge(base, over) {
  Object.keys(over).forEach((key) => {
    base[key] = isPlain(base[key]) && isPlain(over[key]) ? merge(base[key], over[key]) : over[key];
  });
  return base;
}

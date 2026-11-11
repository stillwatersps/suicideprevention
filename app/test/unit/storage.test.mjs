// Unit tests for the storage layer, the migrations, and the config module. Run: npm run test:unit
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, memoryBackend, KEYS, SCHEMA_KEY, SCHEMA_VERSION } from '../../src/core/storage.js';
import { MIGRATIONS, defaultSettings } from '../../src/core/migrations.js';
import { CONFIG } from '../../src/core/config.js';

test('get returns the fallback when nothing is stored or it is unreadable', async () => {
  const backend = memoryBackend({ 'tidelight.broken': '{not json' });
  const store = createStore(backend);
  assert.deepEqual(await store.get('tidelight.none', { a: 1 }), { a: 1 });
  assert.deepEqual(await store.get('tidelight.broken', []), []);
});

test('set then get round-trips, and stored fields are laid over the defaults', async () => {
  const store = createStore(memoryBackend());
  await store.set(KEYS.settings, { checkInsPerDay: 5, meditation: { voice: false } });
  const settings = await store.get(KEYS.settings, defaultSettings());
  assert.equal(settings.checkInsPerDay, 5);
  assert.equal(settings.meditation.voice, false);
  assert.equal(settings.meditation.hapticBreathing, true, 'a field added later gets its default');
  assert.equal(settings.wakeTime, CONFIG.checkIn.wakeDefault);
});

test('a stored value of the wrong kind falls back', async () => {
  const store = createStore(memoryBackend({ 'tidelight.days': '"text"', 'tidelight.sessions': '{"a":1}' }));
  assert.deepEqual(await store.get(KEYS.days, {}), {});
  assert.deepEqual(await store.get(KEYS.sessions, []), []);
});

test('the fallback is copied, never shared', async () => {
  const store = createStore(memoryBackend());
  const fallback = { list: [] };
  const first = await store.get('tidelight.x', fallback);
  first.list.push(1);
  assert.deepEqual(fallback, { list: [] });
});

test('a fresh install is brought to the current schema version', async () => {
  const backend = memoryBackend();
  const store = createStore(backend, MIGRATIONS);
  assert.equal(await store.schemaVersion(), 1);
  const ran = await store.migrate();
  assert.deepEqual(ran, [2]);
  assert.equal(await backend.get(SCHEMA_KEY), String(SCHEMA_VERSION));
  assert.deepEqual(await store.get(KEYS.settings, null), defaultSettings());
  assert.deepEqual(await store.migrate(), [], 'migrations run once');
});

test('migration 2 turns the four older reminders into check-ins a day, and keeps the old key', async () => {
  const old = { morning: { on: true, time: '07:45' }, midday: { on: false, time: '12:00' }, afternoon: { on: false, time: '15:30' }, evening: { on: true, time: '21:15' } };
  const backend = memoryBackend({ [KEYS.oldReminders]: JSON.stringify(old), [KEYS.log]: '[{"t":"2026-11-09T13:05:00.000Z","slot":"morning","feeling":"Okay","needs":[]}]' });
  const store = createStore(backend, MIGRATIONS);
  await store.migrate();
  const settings = await store.get(KEYS.settings, defaultSettings());
  assert.equal(settings.remindersOn, true);
  assert.equal(settings.checkInsPerDay, 2);
  assert.deepEqual(settings.customTimes, ['07:45', '21:15']);
  assert.equal(JSON.parse(await backend.get(KEYS.oldReminders)).morning.time, '07:45', 'the old key is untouched');
  assert.equal((await store.get(KEYS.log, [])).length, 1, 'older check-ins still read');
});

test('migration 2 leaves reminders off when none was on, and never overwrites settings', async () => {
  const off = { morning: { on: false, time: '08:00' } };
  const store = createStore(memoryBackend({ [KEYS.oldReminders]: JSON.stringify(off) }), MIGRATIONS);
  await store.migrate();
  assert.equal((await store.get(KEYS.settings, defaultSettings())).remindersOn, false);

  const kept = createStore(memoryBackend({ [KEYS.settings]: '{"checkInsPerDay":4}' }), MIGRATIONS);
  await kept.migrate();
  assert.equal((await kept.get(KEYS.settings, defaultSettings())).checkInsPerDay, 4);
});

test('unreadable older reminders do not stop the migration', async () => {
  const store = createStore(memoryBackend({ [KEYS.oldReminders]: 'not json' }), MIGRATIONS);
  await store.migrate();
  assert.equal((await store.get(KEYS.settings, defaultSettings())).remindersOn, false);
});

test('every stored key is namespaced', () => {
  Object.values(KEYS).forEach((key) => assert.match(key, /^tidelight\./));
  assert.equal(new Set(Object.values(KEYS)).size, Object.values(KEYS).length, 'no two names share a key');
});

test('the config module is frozen and holds sane values', () => {
  assert.throws(() => { 'use strict'; CONFIG.streak.freezeMax = 9; });
  assert.ok(CONFIG.checkIn.perDayMin <= CONFIG.checkIn.perDayDefault && CONFIG.checkIn.perDayDefault <= CONFIG.checkIn.perDayMax);
  assert.ok(CONFIG.meditation.completeFraction > 0 && CONFIG.meditation.completeFraction <= 1);
  assert.ok(['either', 'allCheckIns'].includes(CONFIG.streak.rule));
  assert.ok(CONFIG.reminders.maxPending <= 64);
  assert.deepEqual([...CONFIG.streak.milestones].sort((a, b) => a - b), [...CONFIG.streak.milestones]);
});

// The storage backend on a real device: the phone's Preferences in the app, and the browser's
// localStorage when the app is tried in a desktop browser. On this phone only; nothing is sent.
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { createStore } from './storage.js';
import { MIGRATIONS } from './migrations.js';

const native = Capacitor.isNativePlatform();

export const deviceBackend = {
  async get(key) {
    if (native) return (await Preferences.get({ key })).value;
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  },
  async set(key, value) {
    if (native) return Preferences.set({ key, value });
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage blocked: nothing kept */ }
    return undefined;
  },
  async remove(key) {
    if (native) return Preferences.remove({ key });
    try { window.localStorage.removeItem(key); } catch (e) { /* storage blocked */ }
    return undefined;
  },
};

export const store = createStore(deviceBackend, MIGRATIONS);

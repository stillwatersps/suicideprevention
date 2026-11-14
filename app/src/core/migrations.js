// Migrations for what the app keeps on the phone. Each one runs once, in order, and must leave
// older data readable. Pure: it only talks to the store it is given, so Node can test it.
import { KEYS } from './storage.js';
import { CONFIG } from './config.js';

const TIME = /^\d\d:\d\d$/;

export function defaultSettings() {
  return {
    checkInsPerDay: CONFIG.checkIn.perDayDefault,
    wakeTime: CONFIG.checkIn.wakeDefault,
    sleepTime: CONFIG.checkIn.sleepDefault,
    checkInStyle: CONFIG.checkIn.styleDefault,
    styleChosen: false, // true once the person picks a style themself
    countChosen: false, // true once the person picks how many check-ins a day
    remindersOn: false,
    customTimes: null, // null: spread evenly between wake and sleep
    streaksOn: CONFIG.streak.enabledDefault,
    haptics: true,
    reduceMotion: false,
    meditation: {
      defaultMinutes: CONFIG.meditation.defaultMinutes,
      defaultSound: CONFIG.meditation.defaultSound,
      voice: true,
      hapticBreathing: true,
      countdown: false,
      ambientVolume: CONFIG.meditation.ambientVolume,
    },
  };
}

export const MIGRATIONS = {
  // 1 -> 2: the redesign. The four older reminders (morning, midday, afternoon, evening, each
  // with its own switch and time) become "N check-ins a day" with the same times. The old key is
  // left in place, unread from now on, so an older build could still read it.
  2: async (store) => {
    const existing = await store.getRaw(KEYS.settings);
    if (existing !== null) return;
    const settings = defaultSettings();
    let old = null;
    try { old = JSON.parse((await store.getRaw(KEYS.oldReminders)) || 'null'); } catch (e) { old = null; }
    if (old && typeof old === 'object') {
      const times = ['morning', 'midday', 'afternoon', 'evening']
        .filter((slot) => old[slot] && old[slot].on && TIME.test(old[slot].time))
        .map((slot) => old[slot].time)
        .sort();
      if (times.length) {
        settings.remindersOn = true;
        settings.checkInsPerDay = times.length;
        settings.countChosen = true;
        settings.customTimes = times;
        settings.migratedFrom = 'reminders.v1';
      }
    }
    await store.set(KEYS.settings, settings);
  },
};

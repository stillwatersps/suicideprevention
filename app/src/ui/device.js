// What the phone itself does for the redesign: permissions, one location on request, reminders,
// keeping the screen awake, and the audio route. In a desktop browser these are stand-ins, and
// tests set window.__tidelight to pretend. Location is read only when the person asks or opens a
// screen that needs it; it is never watched here, and it never leaves the phone.
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Tidelight } from '../native.js';
import { devLog } from '../core/dev.js';

const native = Capacitor.isNativePlatform();
const android = Capacitor.getPlatform() === 'android';
const hooks = () => (typeof window !== 'undefined' && window.__tidelight) || {};
const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
export const isNative = () => native;

function fromAuthorization(value) {
  if (value === 'whenInUse' || value === 'always' || value === 'authorized') return 'granted';
  if (value === 'denied' || value === 'restricted') return 'denied';
  if (value === 'notDetermined') return 'prompt';
  return 'unavailable';
}

// 'granted', 'denied', 'prompt' (not asked yet), or 'unavailable' (a desktop browser).
export async function locationPermission() {
  if (android && navigator.permissions) {
    try { return (await navigator.permissions.query({ name: 'geolocation' })).state; } catch (e) { return 'prompt'; }
  }
  try { return fromAuthorization((await Tidelight.getStatus()).locationAuthorization); } catch (e) { return 'unavailable'; }
}

// Asks the phone's own question, "while using the app" only. If the person already answered, the
// phone isn't asked again here (the "always" question belongs to Places that are hard for me).
export async function requestLocationPermission() {
  const before = await locationPermission();
  if (before !== 'prompt') return before;
  if (android) return (await currentPosition()) ? 'granted' : locationPermission();
  try { await Tidelight.requestLocationPermission(); } catch (e) { devLog('location permission', e); }
  for (let i = 0; i < 40; i += 1) {
    const now = await locationPermission();
    if (now !== 'prompt') return now;
    if (!native) break;
    await wait(500); // the phone's question is on screen; wait for the answer
  }
  return locationPermission();
}

// Where the phone is right now, once. Returns { latitude, longitude } or null.
export async function currentPosition() {
  if (android && navigator.geolocation) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
        () => resolve(null), { maximumAge: 60000, timeout: 15000 });
    });
  }
  try {
    const found = await Tidelight.getCurrentLocation();
    return found && Number.isFinite(found.latitude) && Number.isFinite(found.longitude) ? { latitude: found.latitude, longitude: found.longitude } : null;
  } catch (e) { devLog('location', e); return null; }
}

export async function notificationPermission() {
  if (native) {
    try {
      const display = (await LocalNotifications.checkPermissions()).display;
      return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'prompt';
    } catch (e) { return 'unavailable'; }
  }
  return fromAuthorization(hooks().notificationAuthorization);
}
export async function requestNotificationPermission() {
  if (native) {
    try {
      const display = (await LocalNotifications.requestPermissions()).display;
      return display === 'granted' ? 'granted' : 'denied';
    } catch (e) { devLog('notification permission', e); return 'unavailable'; }
  }
  if (hooks().grantNotifications !== undefined) hooks().notificationAuthorization = hooks().grantNotifications ? 'authorized' : 'denied';
  return notificationPermission();
}

// Replaces the app's reminders: cancels every id in cancelIds, then sets `list`
// ([{ id, title, body, at: Date }]). The phone shows them itself; nothing is sent anywhere.
export async function setNotifications(list, cancelIds) {
  if (hooks().onSchedule) hooks().onSchedule(list.map((n) => ({ id: n.id, title: n.title, body: n.body, at: n.at.toISOString() })), cancelIds);
  if (!native) return;
  try {
    if (cancelIds.length) await LocalNotifications.cancel({ notifications: cancelIds.map((id) => ({ id })) });
    if (list.length) {
      await LocalNotifications.schedule({
        notifications: list.map((n) => ({ id: n.id, title: n.title, body: n.body, schedule: { at: n.at, allowWhileIdle: true } })),
      });
    }
  } catch (e) { devLog('reminders', e); }
}
export async function pendingNotifications() {
  if (!native) return hooks().scheduled || [];
  try {
    return (await LocalNotifications.getPending()).notifications.map((n) => ({ id: n.id, at: n.schedule && n.schedule.at ? new Date(n.schedule.at).toISOString() : '' }));
  } catch (e) { return []; }
}

let wakeLock = null;
export async function keepAwake(on) {
  try { await Tidelight.setKeepAwake({ on }); } catch (e) { /* no phone */ }
  try {
    if (on && navigator.wakeLock && !wakeLock) wakeLock = await navigator.wakeLock.request('screen');
    if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) { wakeLock = null; }
}

// { headphones: true/false, silent: true/false/null }. iPhone can't tell an app about its silent
// switch, so silent is usually null (unknown).
export async function audioRoute() {
  try {
    const route = await Tidelight.getAudioRoute();
    return { headphones: Boolean(route.headphones), silent: route.silentKnown ? Boolean(route.silent) : null };
  } catch (e) { return { headphones: false, silent: null }; }
}

// Meters between two points on the ground (haversine).
export function distanceMeters(a, b) {
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

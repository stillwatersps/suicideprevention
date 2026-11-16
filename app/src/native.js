// The phone side of the app, reached from the page. On a phone, `Tidelight` is the Swift plugin in
// app/ios/App/App/TidelightPlugin.swift. In a desktop browser (the tests), the stand-in below runs
// instead: it keeps what it's given in memory, shows no notification, watches no place, and sends
// nothing. Tests set window.__tidelight hooks to pretend a place or a person was chosen.
import { registerPlugin } from '@capacitor/core';

const hooks = () => (typeof window !== 'undefined' && window.__tidelight) || {};

const webStandIn = {
  config: null,
  composed: [],
  async getStatus() {
    return {
      platform: 'web', locationAuthorization: hooks().locationAuthorization || 'unavailable', notificationAuthorization: hooks().notificationAuthorization || 'unavailable',
      monitoringAvailable: false, monitoredCount: 0, maxPlaces: 20, canSendText: false, debugBuild: false,
      enabled: Boolean(this.config && this.config.enabled), monitoringProblems: {},
    };
  },
  async requestLocationPermission() {
    if (hooks().grantLocation !== undefined) hooks().locationAuthorization = hooks().grantLocation ? 'whenInUse' : 'denied';
    return this.getStatus();
  },
  async requestNotificationPermission() {
    if (hooks().grantNotifications !== undefined) hooks().notificationAuthorization = hooks().grantNotifications ? 'authorized' : 'denied';
    return { granted: hooks().notificationAuthorization === 'authorized' };
  },
  async pickPlace(options) {
    const pick = hooks().pickPlace;
    return pick ? pick(options) : { cancelled: true };
  },
  async pickContact() {
    const pick = hooks().pickContact;
    return pick ? pick() : { cancelled: true };
  },
  // One photo from the phone's library, as a data URL. Never the camera.
  async pickPhoto() {
    const pick = hooks().pickPhoto;
    return pick ? pick() : { cancelled: true };
  },
  // The app lock. A test sets window.__tidelight.lock = { unlocked, allow, noPasscode } to pretend
  // to be a phone with a passcode; without it, the lock is not available here.
  async lockStatus() {
    const lock = hooks().lock;
    if (!lock) return { available: false, reason: 'unsupported', unlocked: true };
    if (lock.noPasscode) return { available: false, reason: 'noPasscode', unlocked: true };
    return { available: true, reason: '', unlocked: Boolean(lock.unlocked) };
  },
  async unlock(options) {
    const lock = hooks().lock;
    if (!lock || lock.noPasscode) return { ok: false, available: false };
    lock.asked = (lock.asked || 0) + 1;
    lock.reason = options && options.reason;
    if (lock.allow !== false) lock.unlocked = true;
    return { ok: lock.allow !== false, available: true };
  },
  async lockDrawn() { if (hooks().lock) hooks().lock.drawn = (hooks().lock.drawn || 0) + 1; },
  async setLock(options) { if (hooks().lock) Object.assign(hooks().lock, { enabled: Boolean(options && options.enabled), top: options && options.top }); },
  // Apple Health. A test sets window.__tidelight.health = { status, grant } to pretend to be an
  // iPhone; without it there is no Health here, and the setting is not shown. Nothing is written.
  async healthStatus() { const health = hooks().health; return { status: health ? health.status || 'notDetermined' : 'unavailable' }; },
  async healthAsk() {
    const health = hooks().health;
    if (!health) return { status: 'unavailable' };
    if (health.status !== 'allowed' && health.status !== 'denied') health.status = health.grant === false ? 'denied' : 'allowed';
    return { status: health.status };
  },
  async healthWrite(options) {
    const health = hooks().health;
    if (!health || health.status !== 'allowed') return { saved: false };
    (health.written = health.written || []).push(options);
    return { saved: true };
  },
  async healthRemoveAll() {
    const health = hooks().health;
    if (!health || health.failRemove) return { removed: false, count: 0 };
    const count = (health.written || []).length;
    health.written = [];
    health.removed = (health.removed || 0) + 1;
    return { removed: true, count };
  },
  // One text file handed to the phone's share sheet. Here a test reads it; nothing is sent.
  async shareFile(options) {
    if (hooks().onShareFile) return hooks().onShareFile(options) || { completed: true };
    return { unavailable: true };
  },
  async setPlaces({ config }) {
    this.config = config;
    if (hooks().onSetPlaces) hooks().onSetPlaces(config);
    return this.getStatus();
  },
  async getPendingAlert() { return hooks().pendingAlert || {}; },
  async acknowledgeAlert({ placeId }) { if (hooks().onAcknowledge) hooks().onAcknowledge(placeId); },
  async composeMessage(options) {
    this.composed.push(options);
    if (hooks().onCompose) hooks().onCompose(options);
    return { result: 'unavailable', fallback: true };
  },
  // Tests pretend the app was opened at a named place (a notification, or the widget).
  async takeLaunchTarget() { const target = hooks().launchTarget || ''; if (target) hooks().launchTarget = ''; return { target }; },
  async debugEnterPlace() { return { done: false }; },
  // The redesign: one location on request, haptics, keeping the screen awake, the audio route.
  // In a browser these are stand-ins; tests set window.__tidelight to pretend.
  async getCurrentLocation() {
    const position = hooks().position;
    return position ? { latitude: position.latitude, longitude: position.longitude, accuracy: 50 } : { unavailable: true };
  },
  async haptic(options) { if (hooks().onHaptic) hooks().onHaptic(options); },
  async setKeepAwake(options) { if (hooks().onKeepAwake) hooks().onKeepAwake(options.on); return { on: options.on }; },
  async getAudioRoute() { return { headphones: Boolean(hooks().headphones), silentKnown: false }; },
  addListener() { return { remove() {} }; },
};

export const Tidelight = registerPlugin('Tidelight', { web: () => webStandIn });

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
      platform: 'web', locationAuthorization: 'unavailable', notificationAuthorization: 'unavailable',
      monitoringAvailable: false, monitoredCount: 0, maxPlaces: 20, canSendText: false, debugBuild: false,
      enabled: Boolean(this.config && this.config.enabled), monitoringProblems: {},
    };
  },
  async requestLocationPermission() { return this.getStatus(); },
  async requestNotificationPermission() { return { granted: false }; },
  async pickPlace(options) {
    const pick = hooks().pickPlace;
    return pick ? pick(options) : { cancelled: true };
  },
  async pickContact() {
    const pick = hooks().pickContact;
    return pick ? pick() : { cancelled: true };
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
  async takeLaunchTarget() { return { target: '' }; },
  async debugEnterPlace() { return { done: false }; },
  addListener() { return { remove() {} }; },
};

export const Tidelight = registerPlugin('Tidelight', { web: () => webStandIn });

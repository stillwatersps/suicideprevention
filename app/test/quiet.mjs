// Automated runs make no sound. Every test and tool opens its browser here: Chromium starts with
// its audio muted, and each page gets a script that silences the three ways the app can be heard
// (text-to-speech, recordings, and generated sound). The app's own audio code is not changed and
// still runs in full: a spoken line still starts, takes a moment, and ends; sounds still play,
// into a gain of zero. The iOS Simulator gets the same script from a debug-only launch argument
// (TidelightPlugin.swift); a unit test keeps the two copies identical.
import { createRequire } from 'node:module';

// Plain script, no backslashes or backticks, so the same text can sit in a Swift string.
export const QUIET_SOURCE = `(function () {
  if (window.__tidelightQuiet) return;
  window.__tidelightQuiet = true;
  var current = null;
  var fire = function (line, type) { try { line.dispatchEvent(new Event(type)); } catch (e) { if (typeof line['on' + type] === 'function') line['on' + type]({ type: type }); } };
  var speech = {
    speaking: false, pending: false, paused: false, onvoiceschanged: null,
    getVoices: function () { return []; },
    speak: function (line) {
      speech.cancel();
      current = line; speech.speaking = true; fire(line, 'start');
      var ms = Math.min(4000, 400 + String((line && line.text) || '').length * 40);
      line.__quietTimer = setTimeout(function () { if (current !== line) return; current = null; speech.speaking = false; fire(line, 'end'); }, ms);
    },
    cancel: function () { if (!current) return; var line = current; current = null; speech.speaking = false; clearTimeout(line.__quietTimer); fire(line, 'error'); },
    pause: function () { speech.paused = true; },
    resume: function () { speech.paused = false; },
    addEventListener: function () {}, removeEventListener: function () {}
  };
  try { Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: function () { return speech; } }); } catch (e) { /* stays as it was */ }
  var Media = window.HTMLMediaElement;
  if (Media && Media.prototype.play) {
    var play = Media.prototype.play;
    Media.prototype.play = function () { this.muted = true; return play.apply(this, arguments); };
  }
  var Real = window.AudioContext || window.webkitAudioContext;
  var Base = window.BaseAudioContext || Real;
  var out = Real && Base && Object.getOwnPropertyDescriptor(Base.prototype, 'destination');
  if (Real && out && out.get) {
    var Quiet = class extends Real {
      get destination() {
        if (!this.__quietOut) { this.__quietOut = this.createGain(); this.__quietOut.gain.value = 0; this.__quietOut.connect(out.get.call(this)); }
        return this.__quietOut;
      }
    };
    if (window.AudioContext) window.AudioContext = Quiet;
    if (window.webkitAudioContext) window.webkitAudioContext = Quiet;
  }
})();`;

// A muted Chromium whose every page is quiet. Use this instead of chromium.launch (lint checks).
export async function openBrowser(options = {}) {
  const { chromium } = createRequire(import.meta.url)('playwright');
  const browser = await chromium.launch({ ...options, args: [...(options.args || []), '--mute-audio'] });
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async (...args) => {
    const context = await newContext(...args);
    await context.addInitScript(QUIET_SOURCE);
    return context;
  };
  browser.newPage = async (...args) => (await browser.newContext(...args)).newPage();
  return browser;
}

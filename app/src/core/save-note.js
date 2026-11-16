// When the phone can't keep something (its storage is full, or it refuses the write), the app
// says so, once, in plain words, instead of losing it silently. Every place that writes to the
// phone calls saveFailed(); src/ui/save-note.js shows the line. Nothing is sent anywhere, and
// nothing about what failed to save is recorded.
export const SAVE_FAILED = 'tidelight-save-failed';

export function saveFailed() {
  try { window.dispatchEvent(new CustomEvent(SAVE_FAILED)); } catch (e) { /* no page to tell (a unit test) */ }
}

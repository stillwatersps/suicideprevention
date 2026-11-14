// Notes for developers, kept in memory only: never printed, never stored, never sent. The hidden
// Developer section in Settings can show the last few. People using the app never see raw errors.
const MAX = 40;
const lines = [];

export function devLog(what, error) {
  const detail = error && error.message ? ': ' + error.message : '';
  lines.push(new Date().toISOString().slice(11, 19) + ' ' + what + detail);
  if (lines.length > MAX) lines.shift();
}
export function devLines() { return lines.slice(); }

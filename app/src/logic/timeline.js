// The meditation timeline. It owns the clock and says, for any moment, which segment is playing,
// which breath phase, and how far along. The five layers (world, guide, voice, sound, haptics)
// only listen to it, so they stay in step and stay independent of each other.
// Pure: the clock is handed in, so Node can test it. Time comes from a monotonic clock, never from
// counted frames, so a dropped frame or a paused screen can't make a session run long or short.

export const PHASES = ['inhale', 'holdIn', 'exhale', 'holdOut'];

export function cycleLength(pattern) {
  return pattern.inhale + pattern.holdIn + pattern.exhale + pattern.holdOut;
}
export function totalSeconds(meditation) {
  return meditation.segments.reduce((sum, segment) => sum + segment.durationSeconds, 0);
}
// Each segment with its start and end, in seconds from the beginning.
export function buildSchedule(meditation) {
  let at = 0;
  return meditation.segments.map((segment, index) => {
    const entry = { index, segment, start: at, end: at + segment.durationSeconds };
    at = entry.end;
    return entry;
  });
}

// Where a breath is `into` seconds after a cycle began.
export function phaseAt(pattern, into) {
  let left = into % cycleLength(pattern);
  for (const phase of PHASES) {
    const seconds = pattern[phase];
    if (seconds > 0 && left < seconds) return { phase, phaseSeconds: seconds, phaseElapsed: left, phaseProgress: left / seconds };
    left -= seconds;
  }
  return { phase: 'inhale', phaseSeconds: pattern.inhale, phaseElapsed: 0, phaseProgress: 0 };
}
// How full the breath is, 0 (empty) to 1 (full), for the worlds and the guide.
export function breathLevel(phase, progress) {
  if (phase === 'inhale') return progress;
  if (phase === 'holdIn') return 1;
  if (phase === 'exhale') return 1 - progress;
  return 0;
}

// Everything about the moment `t` seconds in.
export function stateAt(meditation, t, schedule = buildSchedule(meditation)) {
  const total = schedule.length ? schedule[schedule.length - 1].end : 0;
  const elapsed = Math.max(0, Math.min(total, t));
  const done = t >= total;
  let entry = schedule[schedule.length - 1];
  for (const candidate of schedule) { if (elapsed < candidate.end) { entry = candidate; break; } }
  const segment = entry ? entry.segment : null;
  const segmentElapsed = entry ? elapsed - entry.start : 0;
  const out = {
    done, elapsed, total, totalProgress: total ? elapsed / total : 1,
    segmentIndex: entry ? entry.index : -1, segment, segmentElapsed,
    segmentProgress: segment && segment.durationSeconds ? segmentElapsed / segment.durationSeconds : 1,
    phase: null, phaseProgress: 0, phaseSeconds: 0, phaseRemaining: 0, cycle: 0,
    // Outside breathing, the world still moves, on a slow, even swell.
    breath: 0.5 - 0.5 * Math.cos((elapsed / 10) * 2 * Math.PI),
  };
  if (segment && segment.kind === 'breathing' && segment.breathingPattern && !done) {
    const p = phaseAt(segment.breathingPattern, segmentElapsed);
    out.phase = p.phase;
    out.phaseProgress = p.phaseProgress;
    out.phaseSeconds = p.phaseSeconds;
    out.phaseRemaining = p.phaseSeconds - p.phaseElapsed;
    out.cycle = Math.floor(segmentElapsed / cycleLength(segment.breathingPattern));
    out.breath = breathLevel(p.phase, p.phaseProgress);
  }
  return out;
}

// The controller. `now` returns milliseconds from a monotonic clock.
export function createTimeline(meditation, now) {
  const schedule = buildSchedule(meditation);
  const listeners = new Set();
  let banked = 0; // milliseconds played before the last pause
  let since = null; // when the current run began, or null while paused
  let last = null;
  let finished = false;

  const elapsedMs = () => banked + (since === null ? 0 : Math.max(0, now() - since));
  const api = {
    schedule,
    total: schedule.length ? schedule[schedule.length - 1].end : 0,
    playing: () => since !== null,
    finished: () => finished,
    elapsed: () => elapsedMs() / 1000,
    state: () => stateAt(meditation, elapsedMs() / 1000, schedule),
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    start() { if (since === null && !finished) since = now(); return api.tick(); },
    pause() { if (since !== null) { banked = elapsedMs(); since = null; } return api.tick(); },
    resume() { return api.start(); },
    // After the app was in the background: the page's clock may have stopped. Add what it missed.
    addMissed(ms) { if (since !== null && ms > 0) banked += ms; },
    // Reads the clock and tells every layer. Call it on each frame; calling it rarely is fine too.
    tick() {
      const state = api.state();
      const changed = {
        segment: !last || last.segmentIndex !== state.segmentIndex,
        phase: !last || last.phase !== state.phase || last.cycle !== state.cycle || last.segmentIndex !== state.segmentIndex,
        pattern: !last || patternName(last.segment) !== patternName(state.segment),
        finished: state.done && !finished,
      };
      if (state.done && !finished) { finished = true; banked = api.total * 1000; since = null; }
      last = state;
      listeners.forEach((fn) => fn(state, changed));
      return state;
    },
  };
  return api;
}

function patternName(segment) {
  const p = segment && segment.breathingPattern;
  return p ? [p.inhale, p.holdIn, p.exhale, p.holdOut].join('-') : '';
}

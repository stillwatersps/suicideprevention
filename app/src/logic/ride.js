// "Ten minutes at a time": a few small steps, a set time each, to get through the next ten
// minutes. Pure rules for where the clock is, with no browser and no phone. A draft: no licensed
// reviewer has seen it.

// Where someone is after `elapsed` seconds: which step (from 0), how long is left in it, and
// whether the whole time has passed. Bad input counts as the start.
export function ridePosition(elapsed, config) {
  const total = config.steps * config.stepSeconds;
  const at = Math.max(0, Math.min(Number.isFinite(elapsed) ? elapsed : 0, total));
  if (at >= total) return { step: config.steps - 1, left: 0, done: true };
  const step = Math.floor(at / config.stepSeconds);
  return { step, left: Math.ceil(config.stepSeconds - (at - step * config.stepSeconds)), done: false };
}

// "Next step": the time already spent becomes the start of the following step. From the last
// step it is the end.
export function rideNext(elapsed, config) {
  const { step } = ridePosition(elapsed, config);
  return Math.min((step + 1) * config.stepSeconds, config.steps * config.stepSeconds);
}

// Seconds as a clock face: 95 is "1:35".
export function rideClock(seconds) {
  const whole = Math.max(0, Math.round(Number.isFinite(seconds) ? seconds : 0));
  return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
}

// Every tunable number in the redesigned app, in one place. Change behavior here, not in screens.
// Draft: none of these values has been seen by a licensed reviewer.

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

export const CONFIG = deepFreeze({
  checkIn: {
    perDayMin: 1,
    perDayMax: 5,
    perDayDefault: 3,
    wakeDefault: '07:00',
    sleepDefault: '22:00',
    styleDefault: 'calm',
    breathSeconds: 5, // Calm only: one guided breath before the mood pick
    lowMoodMax: 2, // moods 1 and 2 show support instead of the short done line, and never auto-return
    // Feelings in the five-question Daily check-in that show support at the top of its results.
    distressFeelings: ['overwhelmed', 'sad', 'anxious', 'disconnected', 'exhausted'],
    noteMaxLength: 120,
    tags: ['tired', 'stressed', 'happy', 'focused', 'anxious', 'grateful'],
  },
  reminders: {
    firstId: 201, // local notification ids 201 and up; 101 to 104 were the four older reminders
    oldIds: [101, 102, 103, 104],
    maxPending: 60, // iPhone keeps at most 64 pending notifications per app
    maxDays: 14,
    testDelayMs: 5000,
    testId: 299,
    ownMaxLength: 60, // the person's own words for a reminder
  },
  streak: {
    enabledDefault: true,
    rule: 'either', // 'either' or 'allCheckIns'
    freezeMax: 2,
    freezePerWeek: 1,
    milestones: [3, 7, 14, 30, 50, 100, 200, 365],
    travelGraceHours: 26, // a calendar day skipped in less real time than this is not counted as missed
  },
  meditation: {
    completeFraction: 0.6, // a session counts once 60% of it was done
    defaultMinutes: 5,
    defaultSound: 'none',
    controlsVisibleMs: 3000,
    guideTextCycles: 3, // the breathing words fade after this many cycles
    ambientFadeInSeconds: 3,
    ambientFadeOutSeconds: 5,
    sleepFadeSeconds: 180, // Sleep: sound fades over the last 3 minutes
    sleepDim: 0.55,
    duckTo: 0.35, // ambient volume while the voice speaks
    voiceRate: 0.82,
    voicePitch: 0.9,
    ambientVolume: 0.5,
    maxSessionsKept: 400,
    lengths: { silent: [3, 5], quick: [1], deep: [10, 15, 20], sleep: [10, 20], sound: [5, 15, 30], scan: [5, 10], walk: [5, 10, 15], breathe: [1, 3, 5] },
    homeRadiusMeters: 150,
    sleepHours: { from: '21:30', to: '04:00' },
    particles: 14,
  },
  builder: {
    minMinutes: 1,
    maxMinutes: 30,
    bodyScanFromMinutes: 8,
    silenceFromMinutes: 10,
    stressedMaxCycles: 4,
    energizeMaxSeconds: 120,
    sleepExhaleMax: 10,
    presetMax: 20,
    presetNameMax: 24,
    soundPreviewMs: 3000,
    strongTickEvery: 5,
  },
  haptics: {
    throttleMs: 50,
    breathPulseGapMs: 450, // discrete, spaced pulses: never a continuous vibration
  },
  motion: { pressScale: 0.96, calmMultiplier: 1.4, straightforwardMultiplier: 0.8, numberMs: 400 },
  onboarding: { stylePreviewMs: 2000 },
  developer: { tapsToUnlock: 7 },
  // "What tends to help": the last 30 days, shown once there are three better days, and only what
  // was recorded on two or more of them. The screen's own words say these numbers; change both together.
  helps: { days: 30, minDays: 3, minCount: 2, maxItems: 6 },
  // A summary for an appointment: how far back it may look, and how much the person may type on it.
  // The screen's own words and its field say these numbers; change both together.
  summary: { days: [14, 30], maxAsk: 300 },
  // Apple Health: a finished meditation shorter than this is not added as mindful minutes.
  health: { minSeconds: 60 },
  // The safety plan: a short list, so each part stays short enough to read in a hard moment.
  plan: { maxItems: 8, maxLength: 120 },
  // My week, in words: the last seven days, and at most this many of the person's own lines.
  week: { days: 7, maxLines: 30 },
  // My toolkit: at most four tools pinned to Home.
  toolkit: { max: 4 },
  // A first week: seven steps, each ticked or not.
  course: { steps: 7 },
  // A letter to myself: long enough for a real letter, short enough to read in a hard moment.
  letter: { maxLength: 2000 },
  // A message for a hard moment: short enough to be a text. As many people as My circle holds.
  reach: { maxLength: 300, maxPeople: 5 },
  // Three good things: three short lines a day; the newest 90 days are kept and the last 7 are shown.
  good: { perDay: 3, maxLength: 140, keepDays: 90, showDays: 7 },
  // Ten minutes at a time: five steps of two minutes. The screen's words say the same numbers.
  ride: { steps: 5, stepSeconds: 120 },
});

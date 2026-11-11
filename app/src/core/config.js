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
    doneReturnMs: 2000, // back to Home after the done screen
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
    lengths: { silent: [3, 5], quick: [1], deep: [10, 15, 20], sleep: [10, 20] },
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
});

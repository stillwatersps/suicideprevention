# Tidelight app: what changed in the redesign

A draft, built November 11, 2026, from one founder's build spec (`BUILD-SPEC.md`). Nothing is
published, no reviewer has read the words, and it has not run on a real phone. `PROGRESS.md` has
the decisions behind each line.

## Phase 0: audit and foundation
- A storage layer with a schema version and migrations (`src/core/storage.js`, `migrations.js`).
- One place for every tunable number (`src/core/config.js`).
- A lint with no new packages (`tools/lint.mjs`) and unit tests on Node's own runner (`test/unit/`).
- The app's instructions (`CLAUDE.md`) and the build record (`PROGRESS.md`).

## Phase 1: design system and tabs
- Design tokens for color (light and dark, AA contrast checked by a test), type, spacing, radius,
  motion, and elevation (`src/tokens.css`).
- Shared components: pill buttons, cards, big choice cards, chips, a stepper, a progress ring,
  badges, empty states.
- Five bottom tabs, each with its own stack: Home, Check-in, Meditate, Location, Friends. Settings
  opens from a gear on Home.
- Every older section has a place: the Daily check-in, Journal, Rediscover, Hope box, and Your
  journey under Check-in; Places that are hard for me under Location; My circle under Friends.
- The crisis strip, Exit, Get Support Now, the Spanish link, both review notices, the privacy
  notice, Support, and the 988 panel stay on every screen, in full.
- The app starts on its own screen instead of the website's Home page.

## Phase 2: onboarding, setup, and check-in settings
- Onboarding: welcome, date of birth (still required), name, check-ins per day, wake and bedtime,
  style, location and a home spot, reminders, done. Shown once.
- A setup ring on Home that lists what's left, worked out from the app's real state.
- Two check-in styles, Calm and Straightforward, that change the words, the flow, and the speed.
- A quick check-in: a mood from five faces, optional tags and a note.
- **A very low mood shows Call 988, Text 988, and Call 911 at once.** So do heavy feelings in the
  five-question Daily check-in.
- Reminders: one per check-in time, spread through the waking day, with discreet words. The four
  older reminders carry over.
- A Settings screen, with a hidden Developer section behind seven taps on the version.

## Phase 3: streaks
- Days in a row, with freezes (one a week, two at most) that cover a missed day.
- A streak card on Home, a streak screen with the month, milestones, and a gentle "new start" card.
- Streaks can be turned off. Nothing celebrates on a day with a very low check-in.

## Phase 4: the meditation engine
- A timeline that owns the clock, and five layers that follow it: three worlds drawn in code
  (Ocean, Forest, Night Sky), a breathing guide, a voice (recordings if added, else the phone's
  text-to-speech), ambient sound (made in code, with seamless loops), and haptic breathing.
- A player with Pause, End (it asks first), and a switch for each layer. The crisis strip stays on
  screen; the stage has its own Get Support Now.
- A completion screen, a session record, and the 60% rule.

## Phase 5: meditation types and suggestions
- Silent (never any sound), 1-minute reset, Deep session, and Sleep (no completion screen).
- "Suggested for you", from the time, headphones, and whether the person is near their own home
  spot. Location is read only while the app is open.
- Session history and total minutes.

## Phase 6: the custom builder
- Length (1 to 30 minutes), situation, sound, world, voice, haptics, body scan, and style, with a
  live preview.
- A generator whose total is always exact, tested over every length and situation.
- Presets: save, rename, edit, duplicate, delete, 20 at most, and two starter suggestions.

## Phase 7: haptics and polish
- One haptics helper with named patterns, a 50 ms throttle, and a setting that silences everything
  but haptic breathing.
- Press states, style-speed transitions, counting numbers, a shimmer, one shared celebration, and
  Reduce Motion throughout.

## Phase 8: final checks and handoff
- `TESTING_CHECKLIST.md` for a real phone, this file, and the final `CLAUDE.md`.
- The reviewer's questions in `notes/CONTENT-REVIEW.md`, and the words packet rebuilt.

## Visual identity: "Dawn at the Shoreline" (`DESIGN-BRIEF.md`)

A visual layer only: no feature was added, removed, or renamed, and no stored data changed.

- New tokens in `src/tokens.css` (ink, sand, paper, shell, coral, seafoam, dawn; five mood tones;
  a night palette), a type scale in Fraunces and Figtree (both bundled, OFL), 4-point spacing,
  four radii, one shadow, one easing curve. The lint fails on any raw color outside the token file.
- The horizon: a flat line with light gathering at its edge, drawn in code. Home's hero, the
  check-in's progress, completion, empty states, and the Ocean scene. No waves.
- Paper grain on the background, a low highlight behind one phrase on Home, line icons at one
  stroke weight, and no emoji in the interface.
- Surfaces: one feature card per section, list rows with hairlines, tinted tiles for quick tools,
  and plain text on the page. Coral primary buttons, a tab bar with a dot on the current tab.
- The crisis strip, Exit, Get Support Now, and the support panel's Call 988 are ink on paper (or
  paper on ink): the plainest, highest-contrast things on screen, with no texture or motion.
- Streaks keep every word they had. Their days are drawn as dots in the new look (a shape for each
  state, never red), and a milestone no longer sets off a burst.
- Location and Friends: short sections with headings and room, and how-it-works detail under
  "Learn more" rows. No word changed. Urgent-help lines and consent paragraphs stay in view.
- The Daily check-in's first question shows its nine feelings as tiles, two across.
- At the largest text on a small phone the tab bar shows icons only; the names stay for screen readers.
- Mood choices are a tone and a word, not faces. A finished check-in stays on the dawn with two
  choices instead of returning Home by itself. The confetti burst is gone.
- The launch screen and the web view behind the page are sand (night tide in dark mode).
- Automated runs are muted (`test/quiet.mjs`, and a debug-only Simulator launch argument).

## What did not change
- The website's pages and words. One app-only line was added to `assets/check-in.js`.
- Crisis numbers, crisis wording, the review notices, and the privacy notice, except two sentences
  that had to stay true: Delete everything's note now lists the new data it removes, and Your
  journey's note no longer says there are no streaks.

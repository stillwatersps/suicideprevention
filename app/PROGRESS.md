# Tidelight Build Progress
Last updated: 2026-11-11 (checkpoint: usage limit reached mid-phase)
Current branch: app/visual-identity
Current phase: Visual identity, phases 2 to 6 of 10 — built, NOT yet verified
Current step: Checkpoint commit. The full test suite has not passed on this commit. See "Resume instructions (visual identity)"

## Visual identity ("Dawn at the Shoreline") — in progress
A second brief from the same founder (`app/DESIGN-BRIEF.md`): a new look, visual layer only. Branch `app/visual-identity`, cut from `app/redesign-dev`; a draft pull request into `app/redesign-dev` at the end. Working in checkpoints: one commit per phase, this file updated each time, the full test suite only at the end of a phase.

- [x] V1 — Audit: 400 "before" pictures (not committed), `design/AUDIT.md`, `tools/screens.mjs`
- [x] V2 — Design tokens, Fraunces and Figtree bundled, raw-hex lint
- [~] V3 — The horizon component (built; tests not yet green)
- [~] V4 — Grain, illustration, icons (emoji out of the interface) (built; tests not yet green)
- [~] V5 — (built; tests not yet green) Components: buttons, surfaces, month dots in place of the streak card, chips, inputs, tab bar, review banner, crisis bar
- [~] V6 — Screen by screen, the player, the launch screen (built; launch screen not yet compiled or seen in the Simulator)
- [ ] V7 — Motion and haptics
- [ ] V8 — Accessibility
- [ ] V9 — Microcopy (decorative only)
- [ ] V10 — "After" pictures, comparison, checks, notes, draft pull request

### Automated runs make no sound (a founder's instruction, November 11, 2026)

The meditation voice guide was playing out loud during browser tests and Simulator checks. Every
automated run is now muted, without changing the app's own audio code:

- **Browser tests and tools** (`npm test`, `tools/screens.mjs`, `tools/word-count.mjs`): every
  browser is opened with `openBrowser()` from `test/quiet.mjs`. Chromium starts with
  `--mute-audio`, and every page gets a script that replaces text-to-speech with a silent stand-in
  (each line still starts, takes a moment, and ends), mutes recordings, and sends generated sound
  into a gain of zero. The lint fails if a test or tool opens a browser any other way.
- **iOS Simulator**: launch the app with `npm run sim:launch` (it passes `-TidelightQuiet YES`).
  A debug-only, Simulator-only hook in `TidelightPlugin.swift` then gives each page the same
  script. Without that argument, and in every release build, nothing changes. Do not launch the
  app in the Simulator any other way during an automated run. A unit test
  (`test/unit/quiet.test.mjs`) keeps the two copies of the script identical.
- The website's own checks in the repository's `tools/` were left alone: the website plays no sound.
- Checked: the script in muted desktop Chromium (speech stand-in, zero gain, muted media). In the
  iOS Simulator (iPhone 17), the debug build installs the script when launched with the argument
  and not without it (seen in the app's console). Not checked: the script's effect inside the
  Simulator's own web view, which nobody listened to. Not on a real phone.

### Design brief vs. project rules
- The brief's `design/` folder is `app/design/`: the repository's `design/` holds the website's original homepage design. The notes in it (`AUDIT.md`, `TOKENS.md`, `COMPARISON.md`, `README.md`) are committed; the pictures are not.
- "Launch the app in the Simulator (iPhone 17 and iPhone SE)": this Mac has no iPhone SE simulator, and driving every screen and state by hand in a simulator costs more than the usage allows. The pictures come from desktop Chromium at both phone sizes (`tools/screens.mjs`), with a few iPhone 17 Simulator pictures beside them. Said plainly wherever results are reported.

- Streaks (brief section 6.3 against "do not change copy awaiting review"): the streak card, streak screen, milestone card, "new start" card, and freeze lines are no longer shown, so their words left the text source. In their place: "Days you checked in this month" (dots on Home, a calendar behind them), never a zero, no missed or lost wording. The streak data and logic are untouched and still stored. The Settings switch is relabeled "Check-in days on Home".
- A finished quick check-in no longer returns Home by itself: the brief asks for the dawn, one line, and two choices ("Breathe for a minute", "Back to home").
- The confetti burst (`celebrate.js`) is removed: the brief says no confetti. Completion is the dawn. On a day with a very low check-in there is no dawn either.
- Mood choices are a tone and a word (no faces). Emoji used alone as pictures became line icons; the one emoji inside a sentence awaiting review was left.
- Coral and the faint ink were darkened from the brief's values to pass contrast. Not added because they would be new features: seek buttons in the player, filter chips on Meditate, initials avatars for friends.
- The old Splash image set is still in the iOS project, unused; it was not deleted.

### Resume instructions (visual identity)
On `app/visual-identity`. The last commit is a checkpoint: lint and unit tests pass, the browser tests were mid-run and are NOT confirmed green, and the Swift changes for the launch screen (`LaunchScreen.storyboard`, `LaunchSand.colorset`, `MainViewController.swift`) have not been compiled.
1. `cd app && npm test`. Fix what fails in `test/redesign-test.mjs` (the month tests and `identityTests` are new and have never run; the accessibility sweep clicks `#tl-streak-card`, which is hidden until a first check-in). Also expect `test/app-test.mjs` and `test/extras-test.mjs` to need small fixes for restyled buttons.
2. Build for the Simulator (`LANG=en_US.UTF-8 npm run sync`, then `xcodebuild` as in the Phase 8 record), install, and start it only with `npm run sim:launch` (muted). Check the launch screen is sand with no white flash.
3. `node tools/screens.mjs after`, look at dark mode, Spanish, the small phone, and largest text; fix overflow. Then V7 to V9 (motion is mostly in `src/redesign-identity.css`; check 44-point targets and labels; list copy changes).
4. V10: `design/COMPARISON.md`, add reviewer questions to `notes/CONTENT-REVIEW.md` (the tide mood tones, the month dots replacing streaks, the new short lines), `npm run words`, a worklog in `notes/worklogs/`, `python3 tools/check_site.py` (and the three other root checks, since notes change), push, and open a draft pull request into `app/redesign-dev` with the copy-change table.

## Completed phases
- [x] Phase 0 — Audit & foundation (merged to app/redesign-dev)
- [x] Phase 1 — Design system & bottom tab navigation (merged to app/redesign-dev)
- [x] Phase 2 — Onboarding, setup checklist & check-in settings (merged to app/redesign-dev)
- [x] Phase 3 — Streaks (merged to app/redesign-dev)
- [x] Phase 4 — Interactive meditation engine (merged to app/redesign-dev)
- [x] Phase 5 — Meditation types & smart suggestions (merged to app/redesign-dev)
- [x] Phase 6 — Custom meditation builder (merged to app/redesign-dev)
- [x] Phase 7 — Haptics & interaction polish (merged to app/redesign-dev)
- [x] Phase 8 — Final QA & handoff (merged to app/redesign-dev)

## Remaining
- Nothing to build. For people: a real-phone pass (`TESTING_CHECKLIST.md`), the reviewer's and the lawyer's answers (`notes/CONTENT-REVIEW.md`), and both founders' decision on whether to keep this direction.

## A founder's safety rules (November 11, 2026). They override the build spec
1. Never remove, shorten, hide, or move behind a tap any safety feature: the "In immediate danger, call 911" banner, the Exit button, "Get Support Now", any crisis line (e.g. 988), the "Draft for review" notices, or the Spanish link. The 50% text cut does not apply to these. They stay visible on every screen where they appear now.
2. If a check-in shows very low mood or distress, show crisis support options right away instead of just logging it.
3. Streaks: no streak, celebration, or "you missed a day" message ever appears in or near crisis or support screens. Keep all streak language gentle. Make streaks a setting users can turn off.
4. Notifications and the lock screen must be discreet. Never mention suicide, crisis, or mood in notification text (e.g. "Time for your check-in").
5. Mark all new user-facing wellness copy and meditation scripts as "Draft for review" using the existing review system, the same way current pages are marked.
6. Location data stays on the device and is used only for the features described.

## Phase 0 audit: what the app was before the redesign
- **Stack:** Capacitor 7 with plain HTML, CSS, and JavaScript. No framework, no router, no state library. `tools/build.mjs` copies the website into `www/` and adds the app's word blocks to the Daily check-in page (English and Spanish); esbuild bundles `src/app.js`.
- **Navigation:** one long page per language. The website's own tab row (Today, Rediscover, Journal, Hope box, Your journey, Support) shows one panel at a time.
- **State:** the website's `assets/check-in.js` holds the check-in in memory and offers `window.TidelightCheckIn`; `src/app.js` saves it and everything else.
- **Storage:** Capacitor Preferences (localStorage in a desktop browser), keys `tidelight.checkin.v1`, `agegroup.v1`, `textsize.v1`, `log.v1`, `reminders.v1`, `places.v1`, `hope.v1`, `circle.v1`, plus an IndexedDB store for Hope box photos.
- **Features found:** age setup and age-based boxes; the five-question Daily check-in with suggestions; Rediscover; Journal; Hope box; Your journey (calendar, today's check-ins, kept lists, four reminders, Places that are hard for me, age group, My circle, Delete everything); share panel; place alert screen; the crisis strip, Quick exit, "Get Support Now", the 988 panel, and the Spanish twin page.
- **Tests before:** 5 logic, 194 app, 56 extras checks in desktop Chromium. No linter, no unit-test runner.
- **Blockers fixed in Phase 0:** no storage layer (added `src/core/storage.js` with a schema version and migrations); no config module (added `src/core/config.js`); no lint or unit-test runner (added `tools/lint.mjs` and Node's own test runner, both inside `npm test`, which GitHub already runs).
- **Logged, not fixed:** the app starts on the website's Home page, not the app screen (Phase 1 sets the start path); `src/extras.js` keeps its own copies of the load and save helpers (left alone: it is the other founder's file); two separate lists of people (Places and My circle).
- **Words on screen before the redesign** (desktop Chromium, 390 by 844, all visible text on the page): first open 720; Today 674; first question 701; result 881; Rediscover 726; Journal 681; Hope box 768; Your journey 1,336; Your journey with Places on 1,788.

## Phase 1 record
- **Plan:** tokens in `src/tokens.css`; components and shell in `src/redesign.css`, `src/ui/components.js`, `src/ui/shell.js`; words in `src/text/redesign.en.html` and `redesign.es.html`; `tools/build-redesign.mjs` adds them to the app's page. Risk: the website's own button and heading styles win over new ones (fixed by scoping the new rules under `html.tl`).
- **Where the older sections went:** Home (new). Check-in tab: Daily check-in, Journal, Rediscover, Hope box, Your journey, each opened from a card, with the older row of tabs kept inside. Location tab: Places that are hard for me. Friends tab: My circle, and a card to Share check-ins. Settings (gear on Home): the age group and text size, and a card to Delete everything (which stays in Your journey, as the privacy notice says). Meditate: an empty state until Phase 5.
- **Text diet, words on screen** (`node tools/word-count.mjs`; desktop Chromium, 390 by 844). The safety frame, about 600 words, is on every screen in full and is not part of the diet.

| Screen now | Words on the screen itself | Before, without the safety frame (estimate) | Change |
| --- | --- | --- | --- |
| Home | 17 | 128 (Today) | 87% fewer |
| Check-in | 29 | 128 (Today) | 77% fewer |
| Meditate | 12 | new | |
| Location, Places off | 137 | part of Your journey, 790 | 83% fewer than Your journey |
| Friends, My circle | 204 | part of Your journey, 790 | 74% fewer than Your journey |
| Settings | 111 | part of Your journey, 790 | 86% fewer than Your journey |
| Your journey | 348 | 790 | 56% fewer |
| Daily check-in, first question | 123 | 155 | 21% fewer |
| Journal | 103 | 135 | 24% fewer |
| Rediscover | 148 | 180 | 18% fewer |
| Hope box | 190 | 222 | 14% fewer |

  The four older sections at the bottom did not reach 50%. Their words are the website's own (shared with its review packet) or are consent, privacy, and crisis wording, which the founder's rule 1 protects. Cutting them is a decision for the founders and the reviewer, not for this build.

## Phase 2 record
- **Plan:** pure logic in `src/logic/spread.js` (time spreading, reminder plan), `checklist.js`, `style-profile.js`; screens in `src/ui/onboarding.js`, `checkin.js`, `setup.js`, `settings.js`, `reminders.js`; one state holder `src/ui/state.js`; the phone's part in `src/ui/device.js` and four new methods in the Swift plugin. Risks: permissions can't be exercised in Chromium (stand-ins only), and the Swift additions are uncompiled until the Simulator build in Phase 8.
- **Saved under:** `tidelight.settings` (check-ins per day, wake and sleep, style, reminders, custom times, meditation defaults, haptics, reduce motion, streaks on), `tidelight.profile` (name), `tidelight.onboarding`, `tidelight.home` (one spot). Schema version 2.
- **Spanish:** `src/text/redesign.es.html` is made from the English blocks and `src/text/redesign.es.json` by `npm run words:es`, so the two can't drift apart. Crisis sentences are whole-line entries copied from the existing Spanish pages (press 2; text AYUDA).

## Phase 3 record
- **Plan:** pure logic in `src/logic/streaks.js`, on local "YYYY-MM-DD" keys, with every case in the spec's 3D as a unit test (`test/unit/streaks.test.mjs`, 21 tests); screens in `src/ui/streaks-ui.js`; one shared celebration in `src/ui/celebrate.js`. Saved under `tidelight.days` and `tidelight.streak`. Risk: streaks for people at risk; see the reviewer's questions in `notes/CONTENT-REVIEW.md`.
- **How it settles days:** each ended day is settled once as complete, frozen, or missed, in order, when the app opens, returns to the front, or records activity. The streak is read from those records, so working it out twice changes nothing.

## Phase 4 record
- **Plan:** `src/logic/timeline.js` owns the clock (monotonic, handed in) and reports segment, breath phase, and progress; `src/logic/meditations.js` holds meditations as data, the audio rules, the voice fallback, the session record, and the 60% rule; `src/ui/player.js` runs five layers that only listen to the timeline: `worlds.js` (canvas scenes), the breathing guide, the voice, `audio.js` (ambient), and haptic breathing. Risks: sound, speech, haptics, and screen wake can't be judged in Chromium; they are stand-ins there.
- **Words:** voice lines are `script.<id>` and on-screen lines `screen.<id>` in `src/text/redesign.en.html`, each in a Calm and a Straightforward voice where they differ.
- **Recordings:** a voice clip is `app/assets/voice/<language>/<scriptId>_<style>.mp3` (for example `app/assets/voice/en/intro.deep_calm.mp3`). The build lists what exists; anything missing is spoken by the phone's text-to-speech. Ambient loops are `app/assets/ambient/rain.mp3` and `ocean.mp3`.

## Phase 5 record
- **Plan:** `src/logic/suggest.js` (one pure function, rules in order, unit tested rule by rule) and `src/ui/meditate.js` (the tab: suggestion, four type cards, presets, Build your own, History). The four types are data from `builtIn()` in `src/logic/meditations.js`. Developer tools can pretend the time, headphones, and "at home" to see each rule. `src/logic/generate.js` and its tests (Phase 6's generator) were written alongside and are already in.

## Phase 6 record
- **Plan:** `src/logic/generate.js` is the spec's algorithm as a pure function, tested over every length from 1 to 30, every situation, with and without a body scan (300 combinations): exact total, whole breaths, no empty segment, and the Stressed, Energize, and Sleep rules. `src/ui/builder.js` is the screen and presets (`tidelight.presets`, choices only).

## Phase 7 record
- **Plan:** one helper (`src/ui/haptics.js`) over a pure pattern table and throttle (`src/logic/haptic-patterns.js`, unit tested); `src/ui/feel.js` wires taps and switches for every screen by delegation. Felt on a phone only: Chromium records the calls, nothing more.
- **Every interaction that changed, and its haptic** (Calm / Straightforward):

| Interaction | Pattern | Where it is wired |
| --- | --- | --- |
| Every button and card (`.tl-btn`, `.tl-icon-btn`, `.tl-card-action`, the player's chips) | `tap` (light / light) | `feel.js` |
| Tab bar | `select` | `shell.js` |
| Mood faces, tag chips, style and situation cards, length, sound and world chips | `select` | `components.js` (choiceGroup) |
| Stepper (check-ins per day) | `sliderTick` (very light / light) | `components.js` (stepper) |
| Builder's length slider: each whole minute | `sliderTick`; at 5, 10, 15, 20, 25, 30 `sliderTickStrong` | `builder.js` |
| Every switch (Settings, builder, reminders) | `toggle` (light / medium) | `feel.js`, `settings.js`, `builder.js` |
| Player's sound, voice, and haptics switches | `toggle` | `player.js` |
| Check-in done (not after a very low mood) | `success` | `checkin.js` |
| Meditation done (not on a quiet day) | `success` | `player.js` |
| Setup complete, a saved home spot, a saved or kept preset, onboarding finished, reminders turned on | `success` | `setup.js`, `settings.js`, `builder.js`, `onboarding.js` |
| Streak milestone | `milestone` (three pulses) | `streaks-ui.js` |
| Onboarding page changes, forward and back | `select` | `onboarding.js` |
| "End session?", deleting a preset, clearing the home spot | `warning` | `player.js`, `builder.js`, `settings.js` |
| Haptic breathing during a session | rising pulses on the inhale, one light tick on a hold, fading pulses and a soft tap on the exhale | `player.js` |
| Pull-to-refresh | not used anywhere, so nothing to wire | |

- **Motion:** every tappable control scales to 0.96 on press and springs back; screens fade (Calm) or slide (Straightforward) at the style's speed; the streak number counts up; the setup ring and the slider's number move with their values; a shimmer stands in for the suggestion while it is worked out; one shared celebration (`celebrate.js`). Reduce Motion (the phone's setting or the app's) turns all of it into still or fading changes.
- **Performance and battery:** screens that aren't showing are `display: none`, so their CSS animations don't run; the player's frame loop, the builder's preview, and the celebration stop when their screen is left; haptics never fire while the app is in the background, and haptic breathing only during a session that is playing. In desktop Chromium the player drew about 60 frames a second. Not profiled on a phone.

## Phase 8 record
- **Tests, last full run:** 1095 checks, 0 failed. Unit tests (Node's runner): 88. Older logic test: 5. App browser test: 180. Hope box and My circle browser test: 56. Redesign browser test: 766, which includes an accessibility sweep of every screen (each control has a spoken name, each new control is at least 44 points, no sideways scrolling) in light mode and in dark mode at 135% text on a 375-point screen. All in **desktop Chromium, with stand-ins for everything a phone does**.
- **The website's own checks** (one website file changed): `python3 tools/check_site.py` passed. `tools/test_browser.py` (desktop Chrome and its phone-size emulation): 6,034 checks passed. `tools/test_webkit.py` (WebKit in a window on this Mac, not iOS Safari): 207 checks, 0 problems. `tools/make_review_packet.py` and `npm run words` were rerun; the app words packet has 1,521 numbered lines.
- **iOS Simulator** (iPhone 17, iOS 27.2, a debug build from Xcode; the Swift additions compile with no warnings of their own): the app opens on its own screen, not the website's Home; onboarding pages, Home with the tab bar above the home indicator, and a Silent session drawing the ocean were seen. Two problems were found there and fixed: the first line of the crisis strip sat under the status bar on every page of the app (now below it, on all pages), and two quick taps zoomed the page and could slide the strip out of view (now prevented; pinch-to-zoom still works). **Not exercised in the Simulator:** the permission questions, reminders arriving, sound, speech, haptics, Spanish, dark mode, a session to its end.
- **A real phone:** nothing. **Android:** nothing; this Mac has no Android tools.
- **Data from before the redesign:** covered by a browser test that starts from the older stored shapes (age group, four reminders, check-in log, journal, kept lists) and by unit tests of migration 2.
- **Clean-up:** unused exports removed; no console output in app code (the lint enforces it); a bug found in review was fixed (the "quiet day" used an unpadded date in one place, so on a day of the month under 10 a very low check-in would not have silenced celebrations; it is now one key, kept on the phone, with a test).
- **Words on screen, final count** (`node tools/word-count.mjs`):

Safety frame, kept in full on every screen: about 597 words.

| Screen now | Words on the screen itself | With the safety frame |
| --- | --- | --- |
| Onboarding: welcome | 13 | 610 |
| Onboarding: age | 152 | 749 |
| Onboarding: name | 21 | 618 |
| Onboarding: count | 20 | 617 |
| Onboarding: times | 25 | 622 |
| Onboarding: style | 23 | 620 |
| Onboarding: location | 44 | 641 |
| Onboarding: notifications | 29 | 626 |
| Onboarding: done | 12 | 609 |
| Home | 45 | 647 |
| Check-in | 43 | 645 |
| Meditate | 83 | 685 |
| Location (Places off) | 143 | 745 |
| Friends (My circle) | 204 | 806 |
| Settings | 282 | 884 |
| Daily check-in, first question | 111 | 713 |
| Journal | 103 | 705 |
| Rediscover | 148 | 750 |
| Hope box | 190 | 792 |
| Your journey | 297 | 899 |

| Screen before the redesign | Whole page | Without the safety frame (estimate) |
| --- | --- | --- |
| First open (age question) | 720 | 179 |
| Today | 674 | 133 |
| Check-in, first question | 701 | 160 |
| Check-in, result | 881 | 340 |
| Rediscover | 726 | 185 |
| Journal | 681 | 140 |
| Hope box | 768 | 227 |
| Your journey (reminders, places, circle, settings) | 1336 | 795 |
| Your journey with Places turned on | 1788 | 1247 |

## Decisions made
- Kept Capacitor, HTML, CSS, and JavaScript — the brief from the founder's session says not to port, and the reviewed words stay in one place.
- Integration branch is `app/redesign-dev`, cut from pull request 19's branch with pull requests 20 and 21 merged in; phases are `feature/p*` branches merged back with merge commits — `main` publishes the website, so the spec's `dev` from `main` can't be used.
- Included pull request 21 (My circle and Hope box, the other founder's draft) — it sits directly on pull request 20, the Friends tab needs it, and leaving it out would guarantee a conflict later. Its files are changed as little as possible.
- The spec's files live in `app/` (`CLAUDE.md`, `PROGRESS.md`, `TESTING_CHECKLIST.md`, `CHANGELOG.md`, `BUILD-SPEC.md`) — the root `CLAUDE.md` is the founders' shared file.
- No TypeScript and no ESLint — the project has neither, and the spec says to avoid new dependencies. `tools/lint.mjs` checks that scripts parse, that app code has no console output, outside addresses, or ways to send data, that redesign styles use tokens only, and that English and Spanish word sources match.
- Unit tests use Node's built-in runner (`node --test`) — no new dependency.
- Migration 2 (the four older reminders become "N check-ins a day" at the same times) ships with the storage layer in Phase 0; the old key is left in place.
- Developer notes are kept in memory only (`src/core/dev.js`), never printed or stored — the lint forbids console output in app code.
- Safety frame: the crisis strip, Exit, the header with "Get Support Now", the Spanish link, the full "Draft for review" notice, the privacy notice, the Support section, and the 988 panel stay on every screen, in the page's normal flow, exactly as worded now. New screens are added between the Spanish link and the notice. (Founder's rule 1.)

- Text diet: no consent, privacy, or crisis sentence was collapsed or cut in Places, My circle, sharing, or age setup. The cut comes from giving each section its own screen. Explanations that open on a tap (`.tl-more`) are reserved for new, non-safety words — founder's rule 1 forbids moving safety text behind a tap, and most of that older text is about consent.
- Pill buttons and rounded cards in the new screens, although the website chose square buttons on November 9 — the build spec, from a founder, asks for pills in the app. The website and the older sections keep square buttons.
- The page's background uses the new `bg` token; the older sections otherwise keep the website's Shoreline colors and its dark mode — changing more risks the contrast of reviewed pages.
- The Location tab is labeled "Location" (spec) and its screen is titled "Places". One sentence in the place alert now says "on the Location tab" instead of "in Your journey", because that section moved.
- The app now starts on the app screen (`server.appStartPath` in `capacitor.config.json`), not the website's Home page. To check in the Simulator.
- Tabs have no browser-history entries; each pushed screen has a visible Back button. Android's hardware back button is untested.
- On iPhone the new screens follow the phone's text size (`font: -apple-system-body`), unless the app's own "larger text" is on. Chromium can't show this; to check in the Simulator and on a phone.

- Onboarding keeps the date of birth as its second page and it can't be skipped — the project's November 9 decision makes the age group required; the spec's "Skip on every page" loses. People who already gave it aren't asked again.
- Onboarding, the check-in, the setup list, and celebrations are ordinary screens in the page, never sheets or overlays — an overlay would cover Get Support Now, the Spanish link, and the review notices (founder's rule 1). The setup list opens in place under its ring.
- Check-in times sit in the middle of equal shares of the waking day, rounded to 5 minutes (3 a day, 7:00 to 22:00, gives 9:30, 14:30, 19:30).
- Reminders are dated notifications for up to 14 days (at most 60 pending), set again whenever the app opens, a check-in is done, or a setting changes. After k check-ins today, the first k of today's times are dropped. If the app isn't opened for two weeks, reminders stop on their own — a nudge that fades rather than nags; a question for the reviewer.
- Reminder words: Calm keeps the existing "A moment to check in, if you'd like."; Straightforward says "Time for your check-in." (the founder's model). No emoji, nothing about mood or the person (rule 4). The spec's "Time for a gentle check-in 🌊" and "Check-in time." were not used.
- The four older reminders (morning, midday, after school, before bed) became "N check-ins a day"; migration 2 carries over the ones that were on, at their times. Their section in Your journey and its hint on Today are gone; Settings has them now.
- The quick check-in is new; the five-question Daily check-in is unchanged and both count as a check-in. Reworking the five questions would change the website's page.
- Very low mood (rule 2): moods 1 and 2 of 5 show Call 988, Text 988, and Call 911 at once, in place of the thanks line, and the screen stays until the person leaves it. In the Daily check-in, the feelings overwhelmed, sad, anxious, disconnected, and exhausted show a support block at the top of the results. Which moods and feelings should do this is a question for the reviewer. Nothing typed is read, and there is no score.
- A very low check-in makes the rest of that day "quiet": no celebration, no milestone, no "new start" card (rule 3).
- The five moods are line-drawn faces with a word under each, not emoji — shape and words carry the meaning, not color.
- A check-in's note shows in the person's own list and is never part of "Share today's check-ins".
- Delete everything now also removes the name, the home spot, the streak, and meditation history, and its note says so. Your journey's note no longer says "There are no streaks or scores", because there are streaks now; it says "Nothing here is scored."
- Location for the home spot asks for "while using the app" only, reads one location when asked, and keeps one spot on the phone. The iPhone permission sentence in `Info.plist` now covers it. For a lawyer to read.
- The website's `assets/check-in.js` gained one app-only method, `addCheckIn`, so a quick check-in marks the calendar without touching what's typed elsewhere. The website never calls it.
- "Notifications enabled" on the setup list means the phone allows them and reminders are switched on.
- Haptics, keep-awake, one-shot location, and the audio route are four small methods added to the project's own Swift plugin, with `navigator.vibrate` and the Wake Lock API as fallbacks — no new packages, so no CocoaPods change. Android has no native part and uses the fallbacks.

- Frozen days count toward the streak number, as the spec's definition says ("consecutive complete (or frozen) days").
- A freeze is never spent when there is no streak to protect, and a new install starts with one freeze.
- A calendar day skipped in under 26 hours of real time (a long flight east) is frozen at no cost instead of counted as missed; flying west settles nothing twice.
- Check-ins from before streaks existed become day records the first time, so history isn't lost.
- Milestones are a card at the top of Home with a short burst confined to the app's area, not a full-screen takeover — a takeover would cover the safety frame (founder's rule 1). On a day with a very low check-in, or with streaks off, a milestone passes silently and isn't shown later (rule 3).
- The "new start" card never shows on a day with a very low check-in; it waits for another day. Missed days are called "rest days" on screen.
- Streaks can be turned off in Settings (rule 3). Days are still recorded quietly, so turning them back on loses nothing.
- The streak card sits on Home only. Home's own page still ends with the Support section and the 988 panel, as every page does; the card is at the top and they are at the bottom, more than a screen apart. Whether that is far enough is a question for the reviewer.

- The player is a screen in the page that fills the space under the crisis strip, not a layer over everything — Call 988, Text 988, Call 911, and Exit stay on screen during a session, the stage carries its own "Get Support Now" and "Draft for review", and the rest of the safety frame is in the page below (founder's rule 1). "Get Support Now" pauses the session first.
- Sleep has no completion screen, as the spec says: the stage dims over the last minute and stays dark; a tap brings the controls to leave. The crisis strip stays lit above it. A question for the reviewer.
- A very low mood on the completion screen shows Call 988, Text 988, and Call 911 at once, in place of "Well done" (rule 2 applied to the mood pick after a session).
- Haptics can't run with the screen locked from a web view, so the screen is kept awake during a session (the plugin's `setKeepAwake`, with the Wake Lock API as a fallback) and Sleep dims it instead.
- When the app is in the background the page's clock can stop; on return, the time missed is added back, and a once-a-second heartbeat keeps time when frames stop.
- Rain and ocean are made-in-code stand-ins (filtered noise, and noise with a slow swell) until real loops are added. White and brown noise are made in code for good. Every loop is blended across its join.
- The phone's silent switch is left to the phone: nothing overrides it. iPhone doesn't tell an app whether it is on.
- The worlds' colors are scene art in `src/ui/worlds.js`, not interface tokens.
- The breathing guide's countdown is one setting ("Count each breath"), off to start in both styles.

- iPhone never tells an app whether its silent switch is on, so "silent" is unknown there. At home, unknown counts as "sound is fine" (rule 2 can match), because the phone's own switch still silences the app.
- "Near home" reads the phone's location once, only while Home or Meditate is open, at most every ten minutes, and only if a home spot is saved and location is allowed. Otherwise the location rule is skipped without a word.
- A type's options (world, sound) open in place under its card, from an "Options" button or a long press — a sheet would cover the safety frame, and a long press alone can't be reached with a screen reader.
- When the suggested type was already done today, the next rule that fits is used, then any type not done yet. Sleep is never suggested outside its hours.
- Voice and haptic breathing in Settings act as master switches: off there means off for every session, whatever the type's default.

- Sessions of 1 and 2 minutes use an intro and outro of 10% and 8% of the time (at least 5 seconds each) instead of the 20- and 15-second floors, so breathing still fits. From 3 minutes the spec's clamps apply.
- Breathing time is split by time (60/40, or 40/30/30) and each part is filled with whole breaths; seconds no whole breath can use go to the last silence, or to the outro when there is no silence, so the total is exact.
- Stressed alternates 4 breaths of 4-7-8 with 4 breaths of 4-0-6-0 for the whole session. Energize uses 4-0-2-0 for at most 120 seconds in all. Sleep's exhale is 8, then 9, then 10, a third of the breathing time each.
- The builder's voice guide starts off, whatever the setting, so a new custom session is silent unless the person turns sound on ("works silently").
- The two starter presets ("Bus ride", "Before bed") show as suggestions only while there are no presets; keeping one saves it.
- "Save as favorite" on the completion screen saves a preset: the type and length for a built-in, the choices for a custom one.
- Preset options (rename, edit, duplicate, delete) open in place under "More", and Delete asks first, in place.
- The builder's fifth situation is labeled "Sleepy" on its card, so the Spanish word for the Sleep type and for the feeling can differ.

- The global Haptics setting silences every pattern except haptic breathing, which follows its own switch (Settings, the builder, and the player), as the spec says.
- Haptics on iPhone come from the project's own plugin; on Android the browser's `navigator.vibrate` stands in, which can't vary strength — a known difference to hear about from an Android phone.

- Every page in the app (the website's pages too) now runs edge to edge with its crisis strip pushed below the iPhone status bar (`src/app-safe-area.css`, added by the build). Before this, the strip's first line was under the status bar in the Simulator.
- The safety frame takes roughly the top 40% of an iPhone 17 screen before the new part of a screen begins (crisis strip, header with Get Support Now, the Spanish link). That is the cost of the founder's rule 1; shrinking any of it is a founders' decision.

- `npm run test:unit` names the test files (`test/unit/*.test.mjs`) instead of the folder — GitHub's runner has Node 24, where `node --test` doesn't take a folder; this Mac's Node 26 does. Found on the pull request's first complete run.

## Known bugs / TODOs
- The app shows a blank screen for a moment at launch in the Simulator's debug build, before the first page — measure on a phone against the spec's 2 seconds — `ios/App/App/Base.lproj/LaunchScreen.storyboard`, `src/app.js` — medium.
- The Simulator kept the age group from an earlier install after the app was deleted (a Simulator habit with stored preferences), so a truly fresh first launch with the date-of-birth page was seen only in Chromium — low.
- Two lists of people (Places and My circle) still exist — noted in pull request 21 — low.
- Frame rate and battery during a long session are unmeasured on a phone — `src/ui/player.js`, `src/ui/worlds.js` — medium.
- Text-to-speech voice quality, the audio session while the phone is locked, and whether sound continues in the background are unknown until a real phone — `src/ui/audio.js` — medium.
- The Swift additions in `ios/App/App/TidelightPlugin.swift` are not compiled yet — to build in the Simulator in Phase 8 — high until done.
- Android hardware Back inside tabs — `src/ui/shell.js` — low (untested; no Android toolchain on this Mac).

## Assets needed from the human
All optional: the app works without them (text-to-speech and made-in-code sound stand in). Each must be royalty-free or licensed, and each voice line is unreviewed draft wording until the reviewer has read `src/text/redesign.en.html`.
- `app/assets/ambient/rain.mp3` — a rain loop, 20 to 60 seconds, that can repeat — put it in `app/assets/ambient/`
- `app/assets/ambient/ocean.mp3` — an ocean loop, 20 to 60 seconds — put it in `app/assets/ambient/`
- `app/assets/voice/en/<scriptId>_<style>.mp3` and `app/assets/voice/es/...` — voice recordings, one per script and style. Scripts: `intro.quick`, `outro.quick`, `intro.deep`, `bodyScan`, `outro.deep`, `intro.sleep`, `bodyScan.sleep`, `intro.custom`, `outro.custom`. Styles: `calm`, `straightforward`. Example: `app/assets/voice/en/intro.deep_calm.mp3`. The words to record are the `script.*` lines in `app/src/text/redesign.en.html` (Spanish in `redesign.es.json`).

## Resume instructions
All nine phases are done and merged into `app/redesign-dev` (draft pull request 25 into `app/first-build`). Do not start another phase. If asked to continue this work:
1. Fetch, then check that pull requests 19, 20, 21, and 25 haven't moved; merge their bases in if they have (never force-push, never touch `main` or `app/first-build`).
2. Run `npm test` in `app/` and `python3 tools/check_site.py` before any push.
3. Take changes from people in this order: the founders' decision on direction, the reviewer's answers to `notes/CONTENT-REVIEW.md`, the lawyer's on location and ages, then findings from `TESTING_CHECKLIST.md` on a real phone.
4. Words change in `src/text/redesign.en.html` and `src/text/redesign.es.json` only, then `npm run words:es` and `npm run words`.

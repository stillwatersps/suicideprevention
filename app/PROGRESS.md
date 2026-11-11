# Tidelight Build Progress
Last updated: 2026-11-11 16:00 EST
Current branch: feature/p5-meditation-types
Current phase: 5 — Meditation types & smart suggestions
Current step: Phase 5 finished; merging into app/redesign-dev, then Phase 6

## Completed phases
- [x] Phase 0 — Audit & foundation (merged to app/redesign-dev)
- [x] Phase 1 — Design system & bottom tab navigation (merged to app/redesign-dev)
- [x] Phase 2 — Onboarding, setup checklist & check-in settings (merged to app/redesign-dev)
- [x] Phase 3 — Streaks (merged to app/redesign-dev)
- [x] Phase 4 — Interactive meditation engine (merged to app/redesign-dev)
- [x] Phase 5 — Meditation types & smart suggestions (merged to app/redesign-dev)

## Remaining
- [ ] Phase 6 — Custom meditation builder
- [ ] Phase 7 — Haptics & interaction polish
- [ ] Phase 8 — Final QA & handoff

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

## Known bugs / TODOs
- Text-to-speech voice quality, the audio session while the phone is locked, and whether sound continues in the background are unknown until a real phone — `src/ui/audio.js` — medium.
- The Swift additions in `ios/App/App/TidelightPlugin.swift` are not compiled yet — to build in the Simulator in Phase 8 — high until done.
- Android hardware Back inside tabs — `src/ui/shell.js` — low (untested; no Android toolchain on this Mac).

## Assets needed from the human
All optional: the app works without them (text-to-speech and made-in-code sound stand in). Each must be royalty-free or licensed, and each voice line is unreviewed draft wording until the reviewer has read `src/text/redesign.en.html`.
- `app/assets/ambient/rain.mp3` — a rain loop, 20 to 60 seconds, that can repeat — put it in `app/assets/ambient/`
- `app/assets/ambient/ocean.mp3` — an ocean loop, 20 to 60 seconds — put it in `app/assets/ambient/`
- `app/assets/voice/en/<scriptId>_<style>.mp3` and `app/assets/voice/es/...` — voice recordings, one per script and style. Scripts: `intro.quick`, `outro.quick`, `intro.deep`, `bodyScan`, `outro.deep`, `intro.sleep`, `bodyScan.sleep`, `intro.custom`, `affirmation`, `outro.custom`. Styles: `calm`, `straightforward`. Example: `app/assets/voice/en/intro.deep_calm.mp3`. The words to record are the `script.*` lines in `app/src/text/redesign.en.html` (Spanish in `redesign.es.json`).

## Resume instructions
On branch `app/redesign-dev`, create `feature/p6-meditation-builder` and start Phase 6. The generator (`src/logic/generate.js`) and its tests exist. Build the screen `#tl-builder` (live preview, length slider, situation cards, sound chips with a 3-second preview, world cards, toggles, style, Start, Save preset), `src/ui/builder.js`, and presets in `tidelight.presets` (choices only; rename, edit, duplicate, delete; at most 20; two starter suggestions). Run `npm test` in `app/` before merging.

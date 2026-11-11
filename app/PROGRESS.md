# Tidelight Build Progress
Last updated: 2026-11-11 13:10 EST
Current branch: feature/p2-onboarding-settings
Current phase: 2 — Onboarding, setup checklist & check-in settings
Current step: Phase 2 finished; merging into app/redesign-dev, then Phase 3

## Completed phases
- [x] Phase 0 — Audit & foundation (merged to app/redesign-dev)
- [x] Phase 1 — Design system & bottom tab navigation (merged to app/redesign-dev)
- [x] Phase 2 — Onboarding, setup checklist & check-in settings (merged to app/redesign-dev)

## Remaining
- [ ] Phase 3 — Streaks
- [ ] Phase 4 — Interactive meditation engine
- [ ] Phase 5 — Meditation types & smart suggestions
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

## Known bugs / TODOs
- The Swift additions in `ios/App/App/TidelightPlugin.swift` are not compiled yet — to build in the Simulator in Phase 8 — high until done.
- Android hardware Back inside tabs — `src/ui/shell.js` — low (untested; no Android toolchain on this Mac).

## Assets needed from the human
- None yet (voice recordings and rain/ocean loops will be listed in Phase 4).

## Resume instructions
On branch `app/redesign-dev`, create `feature/p3-streaks` and start Phase 3. `src/logic/streaks.js`, `test/unit/streaks.test.mjs`, `src/ui/streaks-ui.js`, and `src/ui/celebrate.js` may already exist uncommitted or committed: wire them into `src/redesign.js`, add the streak card, detail screen, milestone and "new start" cards to `src/text/redesign.en.html` (then `npm run words:es`), style them, and add browser tests. Run `npm test` in `app/` before merging.

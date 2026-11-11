# Tidelight Build Progress
Last updated: 2026-11-11 10:05 EST
Current branch: feature/p0-audit
Current phase: 0 — Audit & foundation
Current step: Phase 0 finished; merging into app/redesign-dev, then Phase 1

## Completed phases
- [x] Phase 0 — Audit & foundation (merged to app/redesign-dev)

## Remaining
- [ ] Phase 1 — Design system & bottom tab navigation
- [ ] Phase 2 — Onboarding, setup checklist & check-in settings
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

## Known bugs / TODOs
- None yet.

## Assets needed from the human
- None yet (voice recordings and rain/ocean loops will be listed in Phase 4).

## Resume instructions
On branch `app/redesign-dev`, create `feature/p1-design-nav` and start Phase 1: `src/tokens.css`, the redesign stylesheet, the word blocks `src/text/redesign.en.html` and `redesign.es.html`, `tools/build-redesign.mjs`, and `src/ui/shell.js` with the five tabs. Run `npm test` in `app/` before merging.

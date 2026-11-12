# Tidelight — Launch Readiness & Quality Hardening Brief

**Estimated length:** 9–13 hours of focused work across several sessions.
**Goal:** Take Tidelight from "redesigned and passing tests" to "ready for professional review, a lawyer's read, and a private TestFlight beta" — without adding features and without touching reviewed wording.

You are the lead engineer, QA lead and release manager for Tidelight, a check-in, meditation and suicide-prevention support app. The visual redesign is done (PR 26). This brief is about making the app **trustworthy**: every crisis path works every time, every safety rule is enforced by a test, the app is accessible, fast, private, fully bilingual, and comes with a clean package for the reviewer, the lawyer and the App Store.

Read this whole brief, `CLAUDE.md`, `app/PROGRESS.md`, `notes/CONTENT-REVIEW.md`, `app/BUILD-SPEC.md`, `notes/DESIGN-BRIEF.md` (if present) and the latest worklog in `notes/worklogs/` before writing any code.

---

## 0. Ground rules (override everything else in this brief)

1. **Existing project rules win.** Everything in `CLAUDE.md` and `app/PROGRESS.md` (including the six safety rules) overrides this brief. Log any conflict in `app/PROGRESS.md` under "Launch brief vs. project rules" and follow the project rule.
2. **No new features.** Fix, test, measure, document. If something looks like it needs a new feature, write it up in `notes/LAUNCH-BACKLOG.md` instead.
3. **No wording changes to reviewed or pending content.** Crisis, consent, privacy, clinical, location and safety wording stays exactly as is. Typos and broken grammar in that wording go into `notes/CONTENT-REVIEW.md` as questions, not fixes. Purely technical strings (accessibility labels that don't exist yet, test names, docs) are fine to write.
4. **Crisis access can only get more reliable, never less visible.** No change may move, hide, shrink, delay, restyle to lower contrast, or add a step in front of: the 988 call/text bar, 911, Exit, Get Support Now.
5. **No network.** Do not add analytics, crash reporting, remote config, fonts or images from the internet, or any SDK that phones home. If an existing dependency makes network calls, report it; don't remove functionality without asking.
6. **Never:** merge any PR, push to `main`, submit anything to App Store Connect, create accounts, sign up for services, contact any person, change signing teams or bundle IDs, or delete user data paths. Draft PRs only.
7. **Don't break anything.** All existing unit tests, browser checks, WebKit checks and root checks must pass at the end of every phase.
8. **Muted runs.** All Simulator and browser runs stay muted (speech synthesis stubbed in tests), as set up in the redesign.
9. **Branch:** check whether PR 25 and PR 26 are merged into `app/redesign-dev`.
   - If both are merged: branch `app/launch-readiness` from `app/redesign-dev`.
   - If not: branch from `app/visual-identity` (PR 26's branch) and say so clearly in the PR and `PROGRESS.md`.
   Commit at the end of every phase with a clear message.

### Usage and checkpoint rules (this will span several usage windows)
- After every phase: run that phase's tests, commit, and update `app/PROGRESS.md` with **"Launch brief: Phase N done. Next: Phase N+1, step X."**
- Keep chat output short: one or two lines per phase. Put detail in files, not chat.
- Run the full suite at phase ends, not after every small edit.
- If the user says **"checkpoint"**, stop at the next safe point, commit, and write the exact next step in `PROGRESS.md`.
- When resuming, read `PROGRESS.md` first and continue from the recorded step. Never redo a finished phase.

### Order of priority
Phases are ordered by importance. If time or usage runs out, the earlier phases matter far more than the later ones. **Phases 1–3 are the core of this brief.**

---

## Phase 0 — Finish and verify PR 26 wording (≈30–45 min) ★ do this first

PR 26 (`app/visual-identity`) folded some privacy and consent paragraphs behind "Learn more" rows and, in an earlier commit, temporarily replaced streak wording. Before any launch work, confirm PR 26 leaves every word of reviewed content exactly as it was **and** keeps privacy and consent wording visible. Do this work on `app/visual-identity` and push it to PR 26 as its own commit, then follow rule 9 to create the launch branch.

### 0.1 Check what's already done
Read PR 26's latest commits, `app/PROGRESS.md` and `notes/CONTENT-REVIEW.md`. If a "keep privacy and consent wording visible" fix is already committed, verify it against 0.2–0.4 below instead of redoing it.

### 0.2 Privacy and consent wording always visible
On **Location** and **Friends / My circle** (and any other screen that got "Learn more" rows), these must be visible without tapping anything, in English and Spanish, at every text size:
- what data is stored and where it stays (e.g., that chosen people's details stay on the phone);
- what the location feature does, the location permission paragraph, and "what the phone shows";
- who receives a message, what it says, and that a sent message can't be taken back;
- every line mentioning 988 or 911;
- anything a person needs to know **before** they turn a feature on or send something.

Only purely explanatory or how-to text may stay behind "Learn more." If you're unsure whether a paragraph is privacy or consent wording, keep it visible and add it to `notes/CONTENT-REVIEW.md` as a question.

### 0.3 Zero wording changes to reviewed content
- Diff every user-facing string (English and Spanish string files, plus any wording inside templates or components) between `app/redesign-dev` (before PR 26) and the head of `app/visual-identity`.
- Any reviewed or pending-review string that changed, moved to a different screen, or disappeared must be restored exactly, unless the change is purely whitespace from layout. This includes the streak wording ("0 day streak" on day one, the milestone and "new start" cards, the Settings switch), "1 minutes in all," and every check-in option.
- Record the diff result in `notes/LAUNCH-READINESS.md` under "PR 26 wording check": strings compared, strings changed (should be zero), and what was restored.

### 0.4 Lock it with tests
Add tests (in the default `npm test` run) that:
- assert each privacy and consent paragraph from 0.2 is rendered and visible (not inside a collapsed element, not `display: none`, not zero height) on page load, in English and Spanish;
- assert the "Learn more" rows contain only text from an explicit allow-list of how-to paragraphs;
- compare every reviewed string against a snapshot taken from `app/redesign-dev`, so any future wording change to reviewed content fails the build until the snapshot is deliberately updated after reviewer approval.

### 0.5 Update the review notes and push
- In `notes/CONTENT-REVIEW.md`, update the "privacy wording behind Learn more" question: list which paragraphs are now always visible, which remain folded and why, so the reviewer and lawyer can confirm.
- Rebuild in the iPhone 17 Simulator (muted), screenshot Location and Friends in light and dark, English and Spanish, into `design/after/` (git-ignored).
- Run all suites, commit ("PR 26: keep privacy and consent wording visible; lock reviewed strings"), push to `app/visual-identity`, update the PR 26 description, and add a line to `app/PROGRESS.md`: "Launch brief: Phase 0 done. Next: Phase 1."
- Do not merge PR 26 and do not watch its checks.

---

## Phase 1 — Orientation and baseline (≈30 min)

1. Confirm branch state (see rule 9), pull latest, install dependencies, run every test suite and record the baseline numbers (unit tests, browser checks, WebKit checks, root checks, lint) in `notes/LAUNCH-READINESS.md` under "Baseline."
2. Build and launch in the iPhone 17 Simulator, muted. Record cold-launch time (see Phase 5 for method).
3. Create `notes/LAUNCH-READINESS.md` with one section per phase. This file is the main deliverable: every phase writes its findings, fixes and remaining risks there.
4. Create `notes/LAUNCH-BACKLOG.md` for anything out of scope (feature ideas, larger refactors, things needing a decision).

---

## Phase 2 — Crisis path reliability (≈2–3 h) ★ most important

Every crisis entry point must work, every time, from everywhere, and a test must fail loudly if one ever breaks.

### 2.1 Inventory
Find every crisis entry point in the app: the persistent strip (Call 988, Text 988, 911), Get Support Now, Exit, the Get Support screen, any "Get help" tiles or rows, crisis links inside check-in results, Hope box, Friends/My circle "reach out" actions, and Spanish equivalents. Record each in a table in `notes/LAUNCH-READINESS.md`:

| ID | Screen | Element | Action (exact URL/handler) | Language | Visible without scrolling? | Taps from Home |

### 2.2 Correctness
- Verify every `tel:` and `sms:` link uses the correct format for iOS (e.g., `tel:988`, `sms:988`, `tel:911`) and that the native layer (Capacitor or whatever the project uses) opens the system dialer/Messages rather than failing silently in a web view. Check the iOS config (e.g., `Info.plist`, allowed URL schemes, navigation allow-lists) so these links are never blocked.
- Verify Exit does exactly what the project spec says it does, quickly, in every state (mid check-in, in a sheet, during meditation playback, in Spanish).
- Verify crisis elements work: offline (airplane mode in the Simulator / network disabled in browser tests), on first launch before setup, mid-onboarding, with a modal or sheet open, during meditation audio, at the largest Dynamic Type size, in dark mode, with VoiceOver focus order (crisis strip reachable first or near-first), and after the app returns from background.
- Confirm no crisis action depends on anything that can fail: no network, no permissions, no data load, no animation completion, no async init. If it does, fix the dependency without changing the visible element.

### 2.3 Automated guarantees
Add a dedicated test file (e.g., `tests/crisis-paths.test.*`) that fails if:
- any crisis element from the inventory is missing from any screen where it appears today,
- any crisis link's target URL changes,
- any crisis element's computed text contrast drops below 7:1,
- any crisis element's tap target drops below 44×44,
- any crisis element is covered by another element (hit-test the center point),
- any crisis element is hidden at the largest text size or in dark mode,
- the number of taps from Home to calling 988 increases.
Add the crisis test to the default `npm test` run. Document how it works in `notes/LAUNCH-READINESS.md`.

### 2.4 Report
"Crisis path report": inventory table, every scenario tested and result, anything that could not be tested in the Simulator (e.g., an actual call), and the exact manual steps the founders must do on a real iPhone. Put the manual steps in `app/TESTING_CHECKLIST.md` too (add, don't rewrite existing content).

---

## Phase 3 — Safety logic: every rule has a test (≈1.5–2 h)

1. List every safety rule in `CLAUDE.md`, `app/PROGRESS.md`, `app/BUILD-SPEC.md` and `notes/CONTENT-REVIEW.md` (including: no celebration or dawn after a very low check-in, review banners on every page, streak presentation never punitive, optional questions, location data stays on device, etc.).
2. Build a table in `notes/LAUNCH-READINESS.md`: **Rule → where it's enforced in code → test(s) that prove it → status.**
3. For every rule without a test, write one. For every rule enforced in more than one place inconsistently, fix the inconsistency (behavior must match the documented rule; if the rule is ambiguous, write a question in `CONTENT-REVIEW.md` and leave behavior as is).
4. Edge cases to test explicitly:
   - very low check-in answers in every combination that triggers support logic, in English and Spanish;
   - skipped questions, all questions skipped, app killed mid check-in, check-in resumed next day;
   - date edges: midnight, month boundaries, the 1st of the month (remember the earlier "days 1 to 9" bug), time zone change, daylight saving change, device clock set backward;
   - first-ever launch vs. returning user vs. user upgrading from an older build's stored data.
5. Add a single test command (e.g., `npm run test:safety`) that runs Phase 2 and Phase 3 tests together, and mention it in `CLAUDE.md` so every future session runs it before committing.

---

## Phase 4 — Accessibility audit and fixes (≈1.5–2 h)

1. Add an automated accessibility check to the browser test run (e.g., axe-core, bundled as a dev dependency) across every screen and state, light and dark, English and Spanish. Fix every serious and critical issue that doesn't require changing reviewed wording.
2. Check and fix:
   - every interactive element has an accessible name (write labels for icon-only buttons; label text is technical, so it's allowed, but match existing wording where a visible label exists);
   - logical focus order on every screen; focus moves correctly when sheets open and close; focus is never trapped;
   - decorative elements (horizon, grain, illustrations) hidden from assistive tech;
   - mood tiles announce their word and selected state, not their color;
   - Dynamic Type: test at default, large, and the largest accessibility size on iPhone 17 (and iPhone SE if a simulator is available; if not, emulate a 375×667 viewport in browser tests);
   - Reduce Motion and Increase Contrast honored;
   - color is never the only signal.
3. Add a contrast test that checks every text/background token pair used in the app against WCAG AA (AAA for crisis), so a future color change can't silently break contrast.
4. Write "Accessibility report" in `notes/LAUNCH-READINESS.md`: what was checked, what was fixed, what still needs a human with VoiceOver on a real phone (with exact steps).

---

## Phase 5 — Performance and launch time (≈1–1.5 h)

Target from the spec: usable within 2 seconds of launch.

1. Measure cold launch to first interactive screen in the Simulator 5 times, record median. Also measure in the WebKit test harness (time to first contentful paint and to interactive). Record the method so it can be repeated.
2. Find and fix the biggest costs without changing behavior:
   - subset and compress the bundled fonts (Fraunces, Figtree) to the characters needed for English and Spanish; use `font-display` that avoids invisible text;
   - lazy-load screens not needed for Home and the crisis strip;
   - make sure the crisis strip renders in the first frame, before any data loads;
   - optimize any images and the grain texture;
   - remove unused CSS and JS; check bundle size before and after.
3. Check memory and smoothness: scrolling long lists (100+ journal entries, a full year of check-ins), meditation playback for 30+ minutes, app backgrounded and resumed repeatedly.
4. Add a simple performance budget test (bundle size ceiling, number of startup requests = 0 network) so it can't regress.
5. Record before/after numbers in `notes/LAUNCH-READINESS.md`.

---

## Phase 6 — Reliability, data and error handling (≈1–1.5 h)

1. List every piece of data the app stores, where (local storage, IndexedDB, native preferences, files), its format and version.
2. Test and harden:
   - corrupted or partial stored data (malformed JSON, missing fields, wrong types): the app must still open, crisis strip must still work, and the user must never see a blank screen;
   - large data (several years of check-ins, hundreds of journal entries, long text, emoji, right-to-left characters in names);
   - storage full or unavailable;
   - upgrading from the previous build's data format (write migration tests using fixture data that matches the older format; do not change the stored format unless a migration already exists and is broken);
   - app killed during a save.
3. Add a top-level error boundary (or the stack's equivalent) that shows a calm fallback screen **with the crisis strip still visible and working** if any screen crashes. Use existing wording for any visible text; if no suitable wording exists, use the crisis strip alone and log a copy question.
4. Make sure no error ever shows a stack trace or technical message to the user.
5. Add fuzz-style tests for the check-in and journal inputs.
6. Report in `notes/LAUNCH-READINESS.md`.

---

## Phase 7 — Privacy and permissions audit (≈1 h)

1. **Network:** add a test that fails if the app makes any network request during a full walkthrough of every screen (block all requests in the browser harness and assert none were attempted). Also scan dependencies and native plugins for anything that phones home; report findings.
2. **Data inventory:** produce `notes/PRIVACY-INVENTORY.md`: every data type collected or stored, purpose, where it lives, whether it ever leaves the device, retention, and how a user can delete it (only document existing behavior).
3. **Permissions:** list every iOS permission the app requests (location, notifications, contacts, microphone, etc.), when it's requested, and the exact `Info.plist` usage string. Check each request happens only when the user reaches the related feature, with an explanation screen first (existing behavior; don't add new screens; report gaps in the backlog).
4. **App Store privacy label draft:** based on the inventory, draft the answers for Apple's App Privacy questionnaire in `notes/APP-STORE-PRIVACY-DRAFT.md`, clearly marked **"DRAFT — for founder and lawyer review. Not legal advice."**
5. **Dependency licenses:** list every third-party package and its license in `notes/THIRD-PARTY-LICENSES.md`; flag any license that requires attribution in the app or is incompatible with App Store distribution.
6. Do **not** write or change a privacy policy or terms. If none exists, note it as a launch blocker in `notes/LAUNCH-BACKLOG.md`.

---

## Phase 8 — Spanish parity (≈45 min)

1. Add a test that fails if any English string key has no Spanish counterpart (and vice versa), or if any Spanish string is identical to English where it shouldn't be.
2. Walk every screen in Spanish at default and largest text sizes; fix truncation, overlap and layout breaks (layout only, no wording changes).
3. Check that Spanish crisis elements link to the same verified targets as English. If the spec or reviewer hasn't addressed Spanish-language crisis options (for example, whether to mention that 988 offers Spanish support), add a question to `CONTENT-REVIEW.md`; don't add wording.
4. Report missing or suspicious translations as reviewer questions with screen and key.

---

## Phase 9 — Code health (≈1–1.5 h)

Behavior must not change in this phase; tests prove it.

1. Remove dead code, unused files, unused dependencies, and leftover debug logging (especially anything that logs user content).
2. Make lint and type checks (if the project uses types) pass with zero warnings, or document every remaining warning with a reason.
3. Consolidate duplicated logic, especially duplicated safety or date logic (keep one implementation, test it once, use it everywhere).
4. Run the package manager's audit and update only patch/minor versions that fix known security issues; don't do major upgrades (put those in the backlog).
5. Make sure `README.md` (or `app/README.md`) explains in plain steps: install, run in browser, run in Simulator, run on a real iPhone, run all tests, run safety tests. Add, don't rewrite existing sections.
6. Update `CLAUDE.md` with the new commands and rules from this brief (test:safety before every commit, no raw colors, no network, crisis tests must pass).

---

## Phase 10 — Visual polish leftovers (≈45 min)

Only finishing touches from the redesign; no new design direction.
1. Dark mode pass on every screen and state, including sheets, empty states, errors and the fallback screen from Phase 6.
2. Small-phone pass (iPhone SE size or a 375×667 viewport): nothing clipped, crisis strip intact, tab bar behaves.
3. Fix any inconsistencies against the tokens (spacing, radius, type scale) found during Phases 2–9.
4. Screenshot every screen in light/dark, English/Spanish into `design/after-launch-pass/` (git-ignored) and update `app/design/COMPARISON.md` instructions if needed.

---

## Phase 11 — Packages for the humans (≈1–1.5 h)

These documents save the founders, reviewer and lawyer hours. All marked as drafts. No sending, no contacting anyone.

### 11.1 Reviewer packet — `notes/REVIEWER-PACKET.md`
For the suicide-prevention professional:
- One-paragraph plain description of the app and who it's for.
- Screen-by-screen walkthrough: screen name, what it does, the exact wording shown (copied from the source strings), and a screenshot path.
- Every open question from `notes/CONTENT-REVIEW.md`, grouped and numbered by priority (crisis and safety first, then streaks and rewards, then privacy wording, then everything else), each with: the question, where it appears, current behavior, and the options.
- A short "what we need from you" list with a suggested order, so the reviewer can work in under two hours.

### 11.2 Lawyer packet — `notes/LEGAL-PACKET.md`
Location wording, privacy wording, messaging wording ("sent messages can't be taken back"), the data inventory, the App Store privacy draft, permissions and usage strings, the age and audience question, and a list of specific questions. Marked "Not legal advice — prepared for counsel."

### 11.3 App Store readiness — `notes/APP-STORE-READINESS.md`
- Draft listing: name, subtitle options, promotional text, description, keywords (no clinical claims, no "#1", no awards, no claims we can't prove), all marked "DRAFT — pending review."
- Draft App Review notes explaining the crisis features, that the app does not provide medical treatment, how reviewers can test it without placing real calls, and that no account is needed (if true).
- A checklist against Apple's App Review Guidelines most relevant to this app (health and medical apps, user safety, data collection and storage, privacy, minors if relevant), each item marked met / not met / needs human decision, with evidence.
- Age rating questionnaire draft answers with reasoning, flagged for founder decision.
- Build readiness: version and build numbers, app icon set present at all sizes, launch screen, required `Info.plist` keys, export compliance question, and what's missing for TestFlight. **Do not change signing or bundle settings.**
- App Store screenshots (if not already done in the design brief, Phase 12): 6 drafts at 6.9" size following the design tokens, filenames ending in `-DRAFT`.

### 11.4 Founder summary — `notes/FOUNDER-SUMMARY.md`
One page: what's ready, what's blocked and on whom (reviewer, lawyer, founders, Apple account), top 10 risks ranked, and a recommended order of next steps with time estimates.

---

## Phase 12 — Final verification and pull request (≈30–45 min)

1. Run every suite: unit, browser, WebKit, root checks, lint, types, `test:safety`, accessibility, contrast, network-block, performance budget, Spanish parity. All must pass.
2. Rebuild and launch in the Simulator (muted); confirm launch time and that Home, Check-in, Get Support, Location and Friends render correctly in light and dark.
3. Fill in the final results table in `notes/LAUNCH-READINESS.md`: baseline vs. final for every metric (test counts, launch time, bundle size, accessibility issues, contrast failures, network requests).
4. Update `app/PROGRESS.md`, `CLAUDE.md` and a new worklog in `notes/worklogs/`.
5. Push `app/launch-readiness` and open a **draft PR** into `app/redesign-dev` with: summary, results table, list of new tests, list of documents created, every wording question added to `CONTENT-REVIEW.md`, everything in `LAUNCH-BACKLOG.md`, and what still requires a real iPhone.
6. Do not watch the PR's checks afterward.
7. Finish with a short chat summary (under 15 lines): what's done, what's blocked, the 3 biggest remaining risks, and the 3 things the founders should do next.

---

## Definition of done

- [ ] PR 26: privacy and consent wording visible on Location and Friends; zero reviewed strings changed; reviewed-string snapshot test and visibility tests in place; pushed to PR 26
- [ ] Crisis inventory complete; every crisis path tested in every listed state; crisis tests in the default test run
- [ ] Every documented safety rule has at least one test; `npm run test:safety` exists and is in `CLAUDE.md`
- [ ] Zero serious/critical automated accessibility issues; contrast test in place
- [ ] Cold launch measured before/after; crisis strip renders in the first frame
- [ ] App survives corrupted, huge and old-format data with the crisis strip working
- [ ] Network-block test passes; privacy inventory, permissions list, privacy label draft and license list written
- [ ] Spanish parity test passes
- [ ] Lint and types clean; no dead code or debug logging of user content
- [ ] Reviewer packet, legal packet, App Store readiness doc and founder summary written and marked as drafts
- [ ] All suites pass; draft PR open; `PROGRESS.md` updated; no wording of reviewed content changed

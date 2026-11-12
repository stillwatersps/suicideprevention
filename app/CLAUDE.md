# Tidelight phone app: instructions for Claude Code

Read the repository's root `CLAUDE.md` first. It holds the two founders' shared rules, and it wins.
This file covers only the phone app in `app/`. If `app/PROGRESS.md` exists, read it next and
resume from its "Resume instructions".

## What this is

Tidelight is a suicide prevention project. The phone app is a calm, check-in-based companion
people can use anywhere: a few short check-ins a day, breathing and meditation sessions that work
in silence, and their own people and places. The redesign (`app/BUILD-SPEC.md`) aims for fewer
words, more touch, and no friction, on top of everything the app already did. **It is a draft.
No licensed reviewer, fluent Spanish reader, or lawyer has seen its words, and it has not run on
a real phone.**

## Rules that are never traded away

- **Crisis help is one tap away on every screen.** The crisis strip (Call 988, Text 988, Call 911,
  Quick exit) stays on screen in every tab, every onboarding page, Settings, and the meditation
  player. Take numbers and markup from the existing pages and `notes/SAFETY.md`, never from memory.
- **Never place a call, send a text, start a chat, or submit a form on a crisis service**, on any
  device or simulator. Stop at the dial or compose screen.
- **Nothing typed or recorded leaves the phone.** No analytics, no network calls, no outside
  fonts, scripts, or embeds. Location is read on demand only. The app keeps no list of places
  beyond the person's own.
- **Every word is in `src/text/`, in English and Spanish together.** Never put words for people
  in a script. The Spanish is an unreviewed AI translation and says so. After changing words, run
  `npm run words` and add the reviewer's questions to `notes/CONTENT-REVIEW.md`.
- **Never shorten or remove crisis wording, the draft-for-review notice, or privacy wording.**
- **Stored data stays readable.** Change a stored shape only with a migration in
  `src/core/migrations.js` and a bumped `SCHEMA_VERSION`.
- **Never merge into `main`** (it publishes the website) and never push to `app/first-build`.
  The repository is public: no names, email addresses, `@`-mentions, or local paths in anything
  committed.

## Automated runs make no sound

A founder's instruction. Tests, tools, and Simulator checks never play audio out loud, and the
app's own audio code is never changed to achieve that.

- Open every test or tool browser with `openBrowser()` from `test/quiet.mjs` (muted Chromium, plus
  a page script that silences speech, recordings, and generated sound). The lint enforces it.
- Launch the app in the iOS Simulator with `npm run sim:launch`, which passes `-TidelightQuiet YES`
  to a debug-only, Simulator-only hook in `TidelightPlugin.swift`. Never with a plain launch.
- If the quiet script changes, change both copies (`test/quiet.mjs` and the Swift string); a unit
  test compares them.

## A founder's safety rules for the redesign (November 11, 2026). They override the build spec

1. **Never remove, shorten, hide, or move behind a tap any safety feature**: the "In immediate
   danger, call 911" banner, the Exit button, "Get Support Now", any crisis line (988 and the
   others), the "Draft for review" notices, or the Spanish link. The 50% text cut does not apply
   to them. They stay visible on every screen where they appeared before the redesign.
2. **A check-in that shows very low mood or distress shows crisis support options right away**,
   instead of just logging it.
3. **Streaks**: no streak, celebration, or "you missed a day" message ever appears in or near a
   crisis or support screen. All streak language stays gentle. Streaks are a setting people can
   turn off.
4. **Notifications and the lock screen are discreet.** Never mention suicide, crisis, or mood in
   notification text. "Time for your check-in" is the model.
5. **All new wellness copy and meditation scripts are marked "Draft for review"** with the
   existing review system, the same way the pages are marked.
6. **Location data stays on the device** and is used only for the features described.

## Stack

- Capacitor 7 (`@capacitor/core`, `ios`, `android`), plain HTML, CSS, and JavaScript modules.
  No framework, no TypeScript. esbuild bundles `src/app.js` into one file.
- Plugins: Preferences, Share, Local Notifications, and the project's own `Tidelight` Swift plugin
  (`ios/App/App/TidelightPlugin.swift`, with a browser stand-in in `src/native.js`).
- Tests: Node's built-in runner for pure logic (`test/unit/`), and Playwright in desktop Chromium
  for the screens (`test/*-test.mjs`), with stand-ins for everything a phone does.

## Install, run, test, build

```bash
cd app
npm ci
npx playwright install chromium
npm test          # lint, unit tests, build, then every browser test
npm run lint      # scripts parse, nothing can leave the phone, token-only styles, word twins match
npm run test:unit # pure logic only, fast
npm run build     # makes app/www from the website plus the app's blocks
npm run words     # rebuilds notes/review-packet/tidelight-app-words.html
npm run words:es  # makes src/text/redesign.es.html from the English blocks and redesign.es.json
npm run test:safety # every crisis path and every safety rule (about 8 minutes). Run before EVERY commit
npm run test:crisis # the crisis paths alone
npm run sim:launch  # starts the installed app in the booted Simulator, muted (automated runs)
LANG=en_US.UTF-8 npm run sync   # build, then copy into the iOS and Android projects (needs CocoaPods)
```

Before every push, also run `python3 tools/check_site.py` from the repository root.

**Before every commit that touches `app/src/`, run `npm run test:safety`.** It must pass. It
covers every crisis control on every screen (`test/crisis-test.mjs`, against the inventory in
`test/fixtures/crisis-inventory.json`) and every written safety rule (`test/safety-test.mjs`,
`test/unit/safety-rules.test.mjs`); `notes/LAUNCH-READINESS.md` has the table of rules and tests.
Never re-record the crisis inventory or rewrite the wording snapshot to make a failure go away.

## Architecture after the redesign

- **Tabs** (`src/ui/shell.js`): `TABS` in `src/ui/icons.js` is the one list; adding a tab is one line there, plus its
  word (`tab.<id>`) and its screen (`<section class="tl-screen" id="tl-<id>" data-tl-tab="<id>">`)
  in `src/text/redesign.en.html`. Each tab keeps its own stack; `shell.push('name')` shows
  `#tl-name`. The older sections live in `#tl-legacy`, inside Check-in. `shell.setFull(true)` hides
  the tab bar (onboarding, the player) and never hides the safety frame.
- **The tab bar is on every page inside the app.** The app's own two pages build it in
  `shell.js` (buttons). Every other page (the website's pages: Get help, Not sure, and the rest)
  gets the same five tabs as plain links, written in by `tools/build-redesign.mjs` from `TABS` and
  `ICONS` in `src/ui/icons.js` and the `tab.*` words, styled by `src/app-tabbar.css` in the
  website's own colors. `test/pages-test.mjs` walks all of them. A new page needs nothing; a new
  tab is one line in `TABS`. The public website never gets the bar.
- **Design system** ("Dawn at the Shoreline", `DESIGN-BRIEF.md`, notes in `design/`): every color,
  size, radius, duration, and font is a token in `src/tokens.css` (`--ink`, `--sand`, `--paper`,
  `--coral`, `--seafoam`, `--dawn`, `--mood-1..5`, `--scene-*`, `--space-*`, `--radius-*`,
  `--text-*`; the older `--tl-*` names are aliases). The lint fails on a raw color anywhere in
  `src/` outside that file, and on a size or duration outside it in the redesign's stylesheets.
  `src/redesign.css` holds layout; `src/redesign-identity.css` loads last and holds the look.
  Button-like rules start with `html.tl` so they win over the website's own button rule.
  - **Crisis controls are plain on purpose**: `--crisis-bg`/`--crisis-text` for the strip,
    `--crisis-btn-bg`/`--crisis-btn-text` for Get Support Now and Call 988. At least 7 to 1 (a unit
    test checks), no grain, no animation, no highlight, no haptic of the app's own, never coral.
  - **The horizon** (`.tl-horizon`, with `-hero`, `-progress`, `-complete`, `-quiet`) is the one
    signature shape: a flat line with light at its edge. No waves. It is decoration
    (`aria-hidden`) and never appears on a support screen or on a "quiet" day.
  - **Surfaces**: one `.tl-feature` card per section, rows with hairlines for lists, `.tl-tile` for
    quick tools, plain type on the page for the rest. One coral button per section.
  - **Fonts** are files in `src/fonts/` (Fraunces, Figtree, with their licenses). Never link a font.
  - **Streak wording is the reviewed-or-awaiting-review wording; restyle it, never rewrite it.**
    Days are dots whose state is a shape as well as a color (filled, soft with a ring, dashed,
    double ring). Never red, and a milestone sets off no burst.
  - **Only plain how-to text folds under "Learn more"** (`src/ui/sections.js`), and it is never
    cut. A founder's rule: every word about privacy or consent stays in view, always: what is
    stored, where data stays, who gets a message, that a sent message can't be undone. So do lines
    about urgent help (988, 911), status lines, and controls. Two paragraphs fold today (how to add
    a place, how to share). When unsure whether a paragraph is only how-to, leave it in view.
  - **The tab bar** shows icons only when its labels can't fit (`fitTabBar` in `src/ui/shell.js`);
    the labels stay in the page for screen readers.
- **Words**: every word is in `src/text/redesign.en.html`. Scripts read them with `t('key')` from
  `src/ui/words.js`; a word with two voices has `data-style="calm"` and `"straightforward"`.
  Spanish is `src/text/redesign.es.json`; `npm run words:es` makes `redesign.es.html` from the two,
  and fails if a line has no Spanish. Crisis sentences are whole-line entries copied from the
  existing Spanish pages.
- **State and storage**: `src/ui/state.js` holds what's loaded (`state.settings`, `profile`,
  `onboarding`, `home`, `days`, `streak`, `sessions`, `presets`); `save(name, change)` merges,
  `replace(name, value)` swaps. Keys are in `KEYS` in `src/core/storage.js`: the older
  `tidelight.checkin.v1`, `agegroup.v1`, `textsize.v1`, `log.v1`, `reminders.v1` (read once),
  `places.v1`, `hope.v1`, `circle.v1`, and the new `tidelight.settings`, `profile`, `onboarding`,
  `home`, `days`, `streak`, `sessions`, `presets`, `schema`.
- **Config** (`src/core/config.js`): streak rules, check-in limits, reminder limits, meditation
  timings, builder limits, haptic timings. Change behavior there.
- **Check-ins**: `src/ui/checkin.js` is the quick check-in; `app.js` keeps the log and fires
  `tidelight-checkin` for both kinds. Moods 1 and 2, and the feelings in
  `CONFIG.checkIn.distressFeelings`, show support at once and make the day "quiet". Those rules
  have one implementation, `src/logic/safety.js` (`isLowMood`, `isHeavyFeeling`, `showsSupport`,
  `isQuietDay`): screens ask it and never decide on their own.
- **Streaks**: `src/logic/streaks.js` (pure, local `YYYY-MM-DD` keys); `src/ui/streaks-ui.js`.
- **Meditation engine**: a meditation is data (`src/logic/meditations.js`: `builtIn(type, options)`).
  `src/logic/timeline.js` owns the clock; `src/ui/player.js` subscribes five layers to it
  (`worlds.js`, the guide, the voice and ambient sound in `audio.js`, haptic breathing).
  `audioPlan()` decides what may sound; Silent is always nothing.
- **Voice clips**: `app/assets/voice/<language>/<scriptId>_<style>.mp3`, for example
  `app/assets/voice/en/intro.deep_calm.mp3`. Ambient loops: `app/assets/ambient/rain.mp3`,
  `ocean.mp3`. The build lists what exists; anything missing falls back to text-to-speech or to
  sound made in code.
- **Builder algorithm**: `src/logic/generate.js`, `generateMeditation(choices)`. Intro 10% and outro
  8% of the time (clamped), an optional body scan from 8 minutes, silence from 10, the rest whole
  breaths by situation, leftover seconds to silence or the outro so the total is exact.
- **Suggestions**: `src/logic/suggest.js`, `suggestMeditation(context)`, rules in order.
- **Haptics**: screens call `haptic('name')` from `src/ui/haptics.js`; patterns and the throttle are
  in `src/logic/haptic-patterns.js`; `src/ui/feel.js` wires taps and switches for every screen.
- **The phone's part**: `src/ui/device.js` (permissions, one location, reminders, keep-awake, audio
  route) over `src/native.js` and the Swift plugin. Tests pretend through `window.__tidelight`.

## Where things go

| Path | What belongs there |
| --- | --- |
| `src/core/` | Storage layer (`storage.js`, `device-storage.js`, `migrations.js`), tunable numbers (`config.js`), developer notes (`dev.js`) |
| `src/logic/` | Pure logic with no browser or phone in it, each with unit tests |
| `src/ui/` | Screens and components. They read words from the page, numbers from `config.js`, and data through the store |
| `src/text/*.html`, `redesign.es.json` | Every word, as named blocks, one file per language |
| `src/tokens.css` | Design tokens. Every other redesign stylesheet uses only these |
| `src/redesign-identity.css`, `src/fonts/`, `src/grain*.svg` | The look: loads after `redesign.css`. Fonts and paper grain are local files |
| `design/` | Design notes: `AUDIT.md`, `TOKENS.md` (generated by `tools/token-report.mjs`), `COMPARISON.md`. Pictures from `tools/screens.mjs` stay on your computer |
| `test/quiet.mjs` | The muted browser every test and tool opens |
| `test/crisis-test.mjs`, `test/safety-test.mjs`, `test/fixtures/` | Crisis paths and safety rules on screen; the crisis inventory, the wording snapshot, and the "Learn more" allow-list |
| `src/app-return.js` | Loaded on every page, apart from the bundle: shows the page again when the app comes back after Quick exit |
| `src/app.js`, `src/extras.js` | The older app layer and the Hope box / My circle layer |
| `tools/` | Build steps, the lint, the words packet |
| `test/unit/` | `*.test.mjs` for `src/core/` and `src/logic/` |
| `ios/`, `android/` | Native projects. Edit by hand only for settings and the `Tidelight` plugin |

## Conventions (match what exists)

- Two-space indent, single quotes, semicolons, `const` first. Small functions with a one-line
  comment that says why, in plain words.
- Class names: `ci-` is the website's check-in, `app-` the older app layer, `tl-` the redesign.
- Stored keys start with `tidelight.` and are listed in `KEYS` in `src/core/storage.js`.
- The page has a strict Content Security Policy: no inline scripts and no `style="..."`
  attributes. Set styles from scripts through `element.style` or classes.
- Scripts never hold words. Read them from the page with the helpers in `src/ui/words.js`.
- Tests say what a person would see. A test may never contact a crisis service.

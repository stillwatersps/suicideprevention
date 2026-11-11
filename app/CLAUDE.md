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
LANG=en_US.UTF-8 npm run sync   # build, then copy into the iOS and Android projects (needs CocoaPods)
```

Before every push, also run `python3 tools/check_site.py` from the repository root.

## Where things go

| Path | What belongs there |
| --- | --- |
| `src/core/` | Storage layer (`storage.js`, `device-storage.js`, `migrations.js`), tunable numbers (`config.js`), developer notes (`dev.js`) |
| `src/logic/` | Pure logic with no browser or phone in it, each with unit tests |
| `src/ui/` | Screens and components. They read words from the page, numbers from `config.js`, and data through the store |
| `src/text/*.html` | Every word, as named blocks, one file per language |
| `src/tokens.css` | Design tokens. Every other redesign stylesheet uses only these |
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

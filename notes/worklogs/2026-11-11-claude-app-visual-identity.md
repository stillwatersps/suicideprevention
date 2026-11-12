---
type: handoff
owner: Claude, at one founder's request
branch: app/visual-identity
---

# Phone app visual identity from a founder's design brief

Date: November 11, 2026

One founder sent a design brief for the phone app's look, "Dawn at the Shoreline"
(`app/DESIGN-BRIEF.md`), to be carried out on top of the redesign in pull request 25. The same
founder also asked that automated test runs stop playing the meditation voice out loud.
**The other founder hasn't seen the brief. No licensed reviewer or fluent Spanish reader has seen
any of it. It has not run on a real phone. It publishes nothing.**

## Completed

On `app/visual-identity`, draft pull request 26 into `app/redesign-dev`. In `app/` only, plus these
notes.

- **Look:** new color, type, spacing, and motion tokens; Fraunces and Figtree bundled as files; a
  horizon drawn in code as the app's one signature shape (Home, check-in, completion, onboarding);
  paper grain; line icons in place of emoji; one feature card per section, rows, and tinted tiles
  in place of a card for everything; a tab bar with a dot on the current tab; a night palette.
- **Crisis controls:** same words and places. The strip, Exit, Get Support Now, and Call 988 are
  now dark ink and paper at 7 to 1 or better, with no texture or motion, and give no haptic.
- **Streaks (changed back in a follow-up, see below):** first built as "Days you checked in this month" as dots and a calendar. No count
  of days in a row, no milestone or "new start" card, never a zero, no missed days. The streak data
  is still stored.
- **Check-in:** mood is a tone and a word instead of a face; a finished check-in stays on the dawn
  with two choices instead of returning Home; the burst of drops is gone. After a very low mood
  there is no horizon or dawn at all, that screen or later that day.
- **Launch:** the launch screen and the web view behind the page are sand (night in dark mode).
- **Muted automated runs:** tests and tools open one muted browser (`app/test/quiet.mjs`); the
  Simulator is started with `npm run sim:launch`. The app's audio code is unchanged.
- **A bug fixed on the way:** the Hope box ran off the side of a small phone at the largest text.

## Checked

- `npm test` in `app/` (before the follow-ups): lint clean; 92 unit tests, then 5, 180, 56, and 837 browser checks, 0 failed.
  Desktop Chromium with stand-ins for the phone, muted. Not a phone.
- New tests cover: crisis controls at 7 to 1 in light and dark, with no texture or animation; both
  fonts loading from the app's own files with no outside request; Reduce Motion; no dawn and no
  horizon after a very low check-in; no haptic on crisis controls; no sideways scrolling at the largest text, Hope box included.
- iOS Simulator (iPhone 17, launched muted): the app compiles; the launch screen is sand with no
  white flash; Home and Meditate look as in the pictures, with both fonts. Nothing else was
  walked through there. Nobody listened to confirm the Simulator is silent.
- Pictures: 400 "before" and 400 "after" from desktop Chromium at two phone sizes, light and dark,
  English and Spanish, and the largest text. Looked at as contact sheets, not one by one.
- Root checks (`check_site.py`, `test_browser.py`, `test_webkit.py`, `make_review_packet.py`):
  all four pass. `check_site.py`: 21 pages, all checks passed. `test_browser.py`: all passed (desktop Chrome and its phone-size emulation). `test_webkit.py`: 207 checks in WebKit on a Mac, 0 problems (not iOS Safari). The review packet was rebuilt.
- **Not checked:** a real phone; VoiceOver by ear; haptics; an iPhone SE simulator (this Mac has none).

## Follow-up, the same day (a founder's four requests on the pull request)

- **Streak wording restored.** Every streak line is as it was before this branch; only the look
  changed (dots with a shape per state, a line icon for the snowflake, no burst).
- **Location and Friends:** short sections under their existing headings, with more room. Only
  plain how-to text folds under "Learn more" (how to add a place; how to share). No word changed.
  By a second instruction from the founder, all privacy and consent wording stays in view: what
  is stored, where data stays, who gets a message, and that a sent message can't be undone.
- **Daily check-in, first question:** nine feelings as tiles, two across; one list at large text.
- **Tab bar:** icons only when the labels can't fit; names kept for screen readers; 44-point targets.
- Checked: `npm test`: lint clean; 92 unit tests; 5, 180, 56, and 889 browser checks; 0 failed (desktop Chromium with stand-ins, muted). New checks cover the restored streak screens, the "Learn more" rows (closed to begin with, no control or 988/911 line inside, opening changes no words), the nine tiles in their order, and the icons-only tab bar with 44-point targets and spoken names. The small-phone pictures were looked at for the four changes. Not on a real phone. After the second instruction (privacy and consent wording always in view): 92 unit tests and 5, 180, 56, and 900 browser checks, 0 failed. Rebuilt in the iPhone 17 Simulator and launched muted; Home, Check-in, Location, Friends, and Get Support were pictured in light and dark mode.

## Not done, and why

- Seek buttons in the player and filter chips on Meditate: new features, outside a visual brief.
- Pictures from an iPhone SE simulator: this Mac has none. The small-phone pictures are from
  desktop Chromium at 375 by 667.
- "1 minutes in all" on the completion and History screens is an older wording slip. It is copy
  awaiting review, so it was left and is listed here.
- The old splash image is still in the iOS project, unused.

## Decisions for both founders

- A new person sees "0 day streak" on Home, as before the redesign. Should a zero be shown?
- Coral for the main action and ink for crisis controls: agree, or pick differently?
- The questions for the reviewer are in [[CONTENT-REVIEW]] under "Questions about the app's visual
  redesign".

## Next step

Both founders compare the screens (`app/design/COMPARISON.md` says how to make the pictures), read
the copy-change table in the pull request, and try the branch on a real phone with
`app/TESTING_CHECKLIST.md`. Merging this pull request changes only `app/redesign-dev`.

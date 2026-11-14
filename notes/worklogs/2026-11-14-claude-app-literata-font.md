---
type: handoff
owner: Claude, at one founder's request
branch: app/literata-font
---

# Phone app fonts: Literata headlines, the phone's own font for body text

Date: November 14, 2026

One founder said the app's fonts looked too much like other AI-made apps and asked for ideas. Claude
drew the Home, Check-in, and Meditate screens side by side in the current fonts and five
alternatives, and the founder chose Literata headlines with the phone's own font for body text.
**The other founder hasn't seen it. It has not run on a real phone. It publishes nothing.**

## Completed

On `app/literata-font`, a draft pull request into `app/launch-readiness` (pull request 27's branch).
In `app/` only, plus these notes.

- `app/src/fonts/`: `Literata-latin.woff2` (52 KB) and `Literata-OFL.txt` added; the Fraunces and
  Figtree files and their licenses removed. The font file is the Latin part of Literata, upright,
  weights 200 to 900, unchanged from the `@fontsource-variable/literata` package, version 5.3.0.
- `app/src/tokens.css`: one `@font-face`, and the two font tokens. Headlines use Literata; body
  text uses the phone's own font, so nothing is loaded for it.
- `app/src/redesign-identity.css`: the app's name in the header is set at the 18 px token. Literata
  is about a seventh wider than Fraunces, and Get Support Now had dropped to a second row at 402,
  375 and 360 px wide.
- Tests: `test/unit/tokens.test.mjs`, `test/redesign-test.mjs` and `test/budget-test.mjs` now expect
  one bundled font, Literata, and a 60 KB ceiling for fonts (it was 150 KB for two).
- Notes: [[DECISIONS]], [[STATUS]], [[TASKS]], [[THIRD-PARTY-LICENSES]], [[LAUNCH-BACKLOG]],
  [[LAUNCH-READINESS]], `app/CLAUDE.md`, `app/CHANGELOG.md`, and a dated note in
  `app/DESIGN-BRIEF.md` and `app/design/COMPARISON.md`.

No wording, color, crisis control, or behavior changed. The website's own fonts are untouched.

## Checked

All on November 14, 2026, in desktop Chromium on a Mac with stand-ins for the phone. **Not on a phone,
not in the iOS Simulator, and not on Android.**

- `npm test` in `app/`: the lint, 131 unit tests, and 2,305 browser checks, 0 failed. The first run
  stopped before the accessibility audit because one test package was not installed on this
  computer; after `npm install`, the five suites that had not started were run one by one and passed
  (accessibility 217, size budget 12, damaged data 37, nothing leaves the phone 13, pages 349).
- The tests now check that headlines draw in Literata from the app's own file, that body text
  names no bundled font, that one font file is loaded, and that fonts total under 60 KB.
- Header, measured at 402, 393, 375, 360 and 320 px wide in English and Spanish: Get Support Now
  sits beside the name at every width where it did before (English down to 360, Spanish down to
  375) and wraps below it only where it already did (320 in both, 360 in Spanish).
- Looked at by eye: Home in English at 402 px and in Spanish at 375 px. Not looked at: dark mode,
  the largest text size, and the other screens beyond the preview's Check-in and Meditate.
- `python3 tools/check_site.py`: all checks passed. No website page changed, so the website's
  browser and WebKit tests and the review packets were not re-run.

## Decisions and open questions

- The choice is recorded in [[DECISIONS]] as one founder's, not agreed by both.
- On Android the body font is Roboto, so the two phones will differ slightly. Nobody has looked at
  it on an Android phone or emulator.
- The preview used this Mac's copy of San Francisco. On an iPhone the app asks the phone for it,
  which should look the same, but nobody has checked.
- Literata's file covers English and Spanish letters and marks. It was seen drawing "Buenos días"
  and "Próximo registro" in desktop Chromium.

## Next step

The other founder looks at the pull request. Both try it on a real iPhone and Android phone with
`app/TESTING_CHECKLIST.md`, looking at headlines at the largest text size in Spanish, where words
are longest.

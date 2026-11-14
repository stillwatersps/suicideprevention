---
type: handoff
owner: Claude, at one founder's request
branch: app/pre-review-fixes
---

# Phone app: four fixes before review, and two held back

Date: November 14, 2026

One founder asked what would improve the app before it goes to a lawyer and a licensed reviewer, and
then asked for six small items to be built. Four are built. Two are not, because they conflict with
the app's written safety rules. **The other founder hasn't seen this. No reviewer or lawyer has. It
has not run on a real phone. It publishes nothing.**

## Completed

On `app/pre-review-fixes`, a draft pull request into `app/literata-font`. In `app/` only, plus notes.

- **Home after Quick exit.** `app/src/app-return.js` says when a page hidden by Quick exit is shown
  again; `app/src/redesign.js` then calls the new `shell.home()` (`app/src/ui/shell.js`), which puts
  every tab back at its first screen and shows Home. A meditation that was playing ends, and
  `app/src/ui/player.js` no longer pulls the app back to Meditate when the person is already
  elsewhere. Setting up for the first time stays where it was.
- **"1 minute in all."** Two new lines in `app/src/text/redesign.en.html` (`player.totalOne`,
  `history.totalOne`), their Spanish in `redesign.es.json` ("1 minuto en total"), and the choice
  between singular and plural in `player.js` and `meditate.js`. The plural line is unchanged. The new
  lines are in the wording snapshot's `addedSince` list, not its reviewed list.
- **Hope box photos from the library only, on iPhone.** A new `pickPhoto` in
  `app/ios/App/App/TidelightPlugin.swift` opens the system photo picker, makes the chosen photo
  smaller, and hands it to the page; `app/src/extras.js` uses it on iPhone in place of the page's
  file chooser. No permission is asked and no purpose sentence is needed.
- **Privacy manifest.** `app/ios/App/App/PrivacyInfo.xcprivacy`, added to the Xcode project. A
  draft.
- Tests for each, the reviewer's screen-by-screen words and the word list rebuilt, and notes:
  [[DECISIONS]], [[STATUS]], [[TASKS]], [[LAUNCH-BACKLOG]], [[CONTENT-REVIEW]], [[REVIEWER-PACKET]],
  [[APP-STORE-READINESS]], [[PRIVACY-INVENTORY]], `app/TESTING_CHECKLIST.md`, `app/CHANGELOG.md`.

## Not built, and why

- **A short crisis strip at the three largest text sizes.** The short form drops "Need help now?"
  and "In immediate danger,". `app/CLAUDE.md`, safety rule 1: never shorten crisis wording or the
  911 banner.
- **Taller tap areas for the eight crisis links inside sentences.** [[LAUNCH-READINESS]] found the
  taller areas overlap between lines, so a tap for 988 could land on 911.

Both are in [[LAUNCH-BACKLOG]] for both founders and the reviewer.

## Checked

All on November 14, 2026. **Not on a real phone, and not on Android.**

- `npm test` in `app/`, desktop Chromium with stand-ins for the phone: the lint, 131 unit tests, and
  2,329 browser checks. In the full run one accessibility check timed out reaching a screen
  (Spanish, dark mode, the Daily check-in's first question), which stopped the run. Run again by
  itself, the accessibility suite passed in full (217 of 217), and the four suites after it were
  run one by one and passed. So every suite has passed, but not all in one unbroken run.
- New checks: after Quick exit from Home, a check-in, the journal, the open menu, and a meditation,
  the app opens on Home with the tab bar back (both languages); one minute reads "1 minute in all"
  and "1 minuto en total"; with the phone's photo picker, a tap opens the picker and not the file
  chooser, a chosen photo is added, closing it adds nothing, and an unreadable photo shows the
  existing message.
- iOS Simulator (iPhone 17, iOS 27.2), a debug build made here with Xcode: the app opened with the
  Literata headlines. In the Hope box, "Choose File" opened the phone's photo picker, with its note
  that Tidelight can only access what is selected and no camera choice; choosing a photo added it;
  closing the picker added nothing and showed no message. Exit from the Hope box hid the page, and
  bringing the app back showed Home. The built app contains `PrivacyInfo.xcprivacy`. The Simulator
  has no camera, so "no camera choice" there does not prove it on a phone; the picker itself has
  none by design.
- `python3 tools/check_site.py`: all checks passed. No website page changed, so the website's
  browser and WebKit tests and the website's review packets were not re-run.
- Not checked: Spanish in the Simulator, VoiceOver, a real photo library, and what Safari showed
  after Exit.

## Decisions and open questions

- All four are one founder's choice, recorded in [[DECISIONS]] as proposals.
- The reviewer still answers whether Home is right after Quick exit, and confirms "1 minute in all".
- A lawyer confirms the privacy manifest, above all "nothing collected", given that the phone's own
  backup copies the app's data.
- While the phone's photo picker is open it covers the crisis strip, as the contact picker and the
  share sheet do. It is the phone's own screen and closes with one tap.
- Android still uses the page's file chooser for Hope box photos. Nobody has built or opened the
  app on Android.
- Leaving the meditation player by another route (a keyboard tab) now leaves the person where they
  went. Before, it pulled them back to Meditate.

## Next step

The other founder looks at the pull request. On a real iPhone, run the two new steps in
`app/TESTING_CHECKLIST.md`, section 9. Both founders decide the two items that were not built, with
the reviewer.

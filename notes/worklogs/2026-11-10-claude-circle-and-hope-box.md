---
type: handoff
owner: Claude Code (cloud session), at one founder's request
branch: app/my-circle-and-hope-box
---

# My circle (E2, no accounts) and Hope box (F9)

Date: November 10, 2026.

**State when written: pushed to `app/my-circle-and-hope-box`, a draft pull request into
`app/hard-places-and-reminders`. Not merged. Publishes nothing. Never run on a phone.** No reviewer,
fluent reader, or lawyer has seen it.

## What was asked

One founder asked to build E2 (support circle), F9 (hope box), and F3 (alert chosen people near a
hard place), to finish what was nearly done, and not to interrupt the other founder's sessions.

## What was built, and what wasn't

| Idea | Built here | Not built |
| --- | --- | --- |
| E2, My circle | Up to 5 chosen people, kept on the phone. "Send to my circle" in the share panel opens the phone's Messages app addressed to all of them, with the chosen words filled in; the person taps Send. A list, for the person only, of what they opened for their circle. Teens are told the circle doesn't have to include a parent | **Accounts, a server, and circle members seeing entries inside an app.** That is the version in [[IDEAS]]; it needs everything in [[CHECK-IN-BACKEND]]'s server table, and `CLAUDE.md` says the app sends nothing to Tidelight. Both founders would need to choose it |
| F9, Hope box | Its own tab: words (a reason, something kind someone said, a song or place, something else) and photos, kept in the app on the phone. Never sent, never part of Share. Delete everything empties it | Voice notes. Showing the hope box from a safety plan (there is no safety plan screen yet, idea F1) |
| F3, alerts to chosen people | Nothing new. **The other founder's session already built it** on `app/hard-places-and-reminders` (places, wait time, alert screen, countdown, Messages composer), and stopped before seeing it work in the Simulator. This branch sits on top of that work and doesn't change it | Android has no place-watching code yet. Nobody has seen the iPhone alert fire |
| Nearly done: the app's words for reviewers | `app/tools/make-words-packet.mjs` writes `notes/review-packet/tidelight-app-words.html`: every line the app adds, numbered, English and Spanish, 493 lines | A PDF. Print the page from a browser |

## How it stays out of the other session's way

- New files only, except two one-line hooks: an `import './extras.js'` in `app/src/app.js`, and an
  `await import('./build-extras.mjs')` at the end of `app/tools/build.mjs`. `app/package.json` gains
  the new test in `npm test`.
- The circle keeps its own list of people. It can copy the people from "Places that are hard for
  me", but never changes that list. **Two lists of people is a wart; one shared list would be
  better** once the Places work settles.
- Messages opens through an `sms:` link, so no Swift or Kotlin changed.

## Files

- New: `app/src/extras.js`, `extras-logic.js`, `extras.css`, `app/src/text/extras.en.html`,
  `extras.es.html`, `app/tools/build-extras.mjs`, `app/tools/make-words-packet.mjs`,
  `app/test/extras-test.mjs`, `notes/review-packet/tidelight-app-words.html`, this handoff.
- The app's copy of the check-in page allows `blob:` images, so hope box photos can show. The
  website's own pages are unchanged.

## Checked

Desktop Chromium on Linux, November 10, 2026. **Not on a phone or a simulator.** The contact picker
and Messages were stand-ins.

| Check | Result |
| --- | --- |
| `node test/extras-test.mjs` | 56 of 56 passed, 26 in each language plus 4 helper checks |
| `node test/app-test.mjs` (the other session's tests, unchanged) | 194 of 194 passed |
| `node test/logic-test.mjs` (the other session's) | 5 of 5 passed |
| `python3 tools/check_site.py` | All checks passed |

## To check on a real phone

- That the `sms:` link opens Messages with every person filled in, on iPhone and on Android. The
  two phones spell the link differently, and neither spelling has been tried.
- That choosing a photo works inside the app, and that photos are still there after closing it.
- Whether hope box photos are part of iCloud or Google backups. The app tells people they may not be.

## Questions for the reviewer

- Is a hope box helpful without a clinician, and for which ages? Claude hasn't read the research on
  it, so the app makes no claim.
- Is the circle's wording clear that it isn't urgent help, and that sent messages can't be taken back?
- For under-13s the app says to choose a circle with a grown-up. Is that right?

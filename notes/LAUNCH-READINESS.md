---
aliases: [Launch readiness]
status: in progress. A working record, one section per phase
---

# Launch readiness: what was checked, fixed, and left

[[00 START HERE|Back to Start Here]]

From one founder's launch readiness brief (November 12, 2026): take the phone app from "redesigned
and passing tests" to "ready for a professional's review, a lawyer's read, and a private TestFlight
beta", with no new features and no change to reviewed wording. **Nothing here has run on a real
phone. No reviewer or lawyer has seen the app. This note is not a sign-off.**

Each phase writes its findings, fixes, and remaining risks below. Out-of-scope ideas go to
[[LAUNCH-BACKLOG]]. The step-by-step state is in `app/PROGRESS.md`.

## Baseline (Phase 1)

Taken November 12, 2026, on `app/launch-readiness`, cut from `app/visual-identity` at the Phase 0
commit. Pull requests 25 and 26 were both still open, so this branch carries their commits.

| What | Command | Baseline |
| --- | --- | --- |
| Lint | `npm run lint` in `app/` | clean (scripts parse, no outside addresses, token-only styles, word sources match, muted browsers) |
| Unit tests | `npm run test:unit` | 101 pass, 0 fail |
| Logic checks | part of `npm test` | 5 pass |
| App layer, browser | part of `npm test` | 180 pass |
| Hope box and My circle, browser | part of `npm test` | 56 pass |
| Redesign, browser | part of `npm test` | 928 pass |
| Website checks | `python3 tools/check_site.py` | pass, 21 pages |
| Website in Chrome | `python3 tools/test_browser.py` | pass, 6,034 checks |
| Website in WebKit on a Mac | `python3 tools/test_webkit.py` | 207 checks, 0 problems |
| Review packet | `python3 tools/make_review_packet.py` | builds |
| Cold launch, iPhone 17 Simulator | `node tools/launch-time.mjs 5` in `app/` | median 1,684 ms to "page loaded" (1,305 ms to the app's own code); the first launch after installing took 7,285 ms |
| App folder the phone loads | `du -sh app/www` | 1.8 MB |
| Largest files | | `app.js` 233 KB, Fraunces 121 KB, `styles.css` 61 KB, `redesign-identity.css` 38 KB, `redesign.css` 34 KB, Figtree 20 KB |

All browser numbers are desktop Chromium with stand-ins for the phone, muted. The launch time is a
Simulator on a Mac. Neither is a phone.

How launch time is measured: `tools/launch-time.mjs` stops the app, starts it muted in the booted
Simulator, and times two lines of the app's own console output: the Tidelight plugin loading (the
app's code is running) and Capacitor's "WebView loaded" (the page and its scripts have loaded). It
does this five times and reports the median.

Noticed while taking the baseline, for later phases:

- Every launch prints "JS Eval error: A JavaScript exception occurred" once, before the page loads,
  with or without the muting argument. The app then works. Phase 6 finds the cause.
- The first launch after an install, or after the Simulator restarts, is several times slower than
  the rest (7.3 s against 1.7 s). Phase 5 looks at it.

## PR 26 wording check (Phase 0)

Pull request 26 (`app/visual-identity`) is a look-only change. This section records that it leaves
every word of reviewed or pending-review content as it was on `app/redesign-dev`, and keeps privacy
and consent wording in view.

### How the words were compared

`node tools/strings.mjs diff app/redesign-dev`, run in `app/`. It pulls every string a person sees or
hears out of the seven text sources in `app/src/text/` (the text between tags, and the `aria-label`,
`alt`, `placeholder`, `title`, and `data-words` attributes; for the Spanish dictionary, each English
line with its Spanish) and compares the two versions, counting repeats.

| Text source | Strings on `app/redesign-dev` | Wording changed or gone before this check | Wording changed or gone now |
| --- | --- | --- | --- |
| `en.html` | 229 | 0 | 0 |
| `es.html` | 228 | 0 | 0 |
| `extras.en.html` | 58 | 0 | 0 |
| `extras.es.html` | 58 | 0 | 0 |
| `redesign.en.html` | 547 | 4 | 0 |
| `redesign.es.html` | 547 | 4 | 0 |
| `redesign.es.json` | 330 | 0 | 0 |
| **All** | **1,997** | **8** | **0** |

### What was restored in this check

| String | What pull request 26 had done | Now |
| --- | --- | --- |
| "Check in" (Home's quick row) | Removed; the row had become "1-min reset", "Meditate", "Hope box", "Get help" | Back, first in the row as before: "Check in", "Meditate", "1-min reset", then "Get help". The added "Hope box" shortcut is gone (the Hope box itself is where it always was, under Check-in) |
| "Setup {done}/{total}" | Reworded to "{done} of {total} set up" | Restored |
| "{done}/{total}" (it sat inside the setup ring) | Removed with the ring | Restored, beside the progress line that replaced the ring |
| "Quick actions" (a spoken label) | Reworded to "Quick tools" | Restored |

The Spanish of each came back with it ("Registrarme", "Configuración {done}/{total}",
"{done}/{total}", "Acciones rápidas").

Restored earlier, in pull request 26's own follow-up commits, and confirmed here by the comparison:
every streak line ("0 day streak" on day one, "Your streak", "Now", "Best", "Done", "Frozen", "Rest
day", the two lines that explain what counts and what a freeze does, the milestone and "new start"
cards with "Got it", "Turn streaks off in Settings", and the Settings switch "Streaks" with its note).
"1 minutes in all" and every check-in option were never changed.

### Not restored, and why: 16 pictures

Sixteen strings from `app/redesign-dev` are not in the text now. None is wording: each was a lone
emoji used as a picture and hidden from screen readers (`aria-hidden="true"`): 🌊 four times, ⚡ four
times, ❄️ twice, and ✓, 🌙, 🎯, 😮‍💨, 😴, 🤫 once each. They sat on the style, meditation type, and
"how do you feel" choice cards, and in the streak row and legend. The visual redesign drew them as
line icons and dots, at the founder's design brief ("emoji out of the interface"). Every emoji inside
a sentence is untouched ("New wave, new start 🌊 …", "❄️ {count} held…", "Thank you for checking in
with yourself 💙"). The snapshot records the sixteen by name, and the test refuses any string with a
letter or number in that list. It is a reviewer question in [[CONTENT-REVIEW]].

### New strings pull request 26 added (pending review, not changes)

"Get help" (Home tile to Support), "Breathe for a minute", "Back to home", "{time} left", "Learn
more", "Tidelight" (above the welcome heading), "Get Support Now" (a second copy, first in Settings),
and "everything figured out" (the phrase of the page's own heading that is highlighted on Home; not
shown as separate text). Each has Spanish in the dictionary.

### Privacy and consent wording in view

On Location and Friends, in English and Spanish, at the ordinary and the largest text size, with no
tap: what the feature does; "This is off until you turn it on…"; the location permission paragraph;
the paragraphs under "People you trust", "What the phone shows", and "Your message"; "Passing through
a place does nothing…"; all of "Good to know"; all five My circle points (no accounts, what they see,
nothing sent by itself, can't be taken back, not for urgent help with 988 and 911); and the note about
what is kept on this phone.

Folded under "Learn more", and nothing else (the allow-list is `app/test/fixtures/learn-more-allow.json`):

1. Places, under "Your places": "Add a place by choosing it on a map, or by searching an address.
   Give it a name only you need to understand, and choose how close counts."
2. My circle: "To share something, tap Share on a check-in, a journal entry, or something you kept,
   then choose "Send to my circle"."

No other screen has "Learn more" rows.

### Tests that lock it (all in `npm test`)

- `app/test/unit/reviewed-strings.test.mjs`: the text sources must equal the snapshot
  (`app/test/fixtures/reviewed-strings.json`, taken from `app/redesign-dev`, plus the new strings
  listed above). Any changed, removed, or added string fails the build until the snapshot is
  rewritten on purpose with `node tools/strings.mjs snapshot <approved-version>`, and the tool
  refuses to write a snapshot if wording is gone.
- `privacyInViewTests` in `app/test/redesign-test.mjs`: each paragraph above is rendered, not inside
  a closed row, not hidden, and has height, as the tab opens and with Places turned on, in both
  languages and at both text sizes; no line with 988 or 911 is folded; the "Learn more" rows hold
  only allow-listed text.

### Result

- Reviewed strings compared: 1,997 across seven text sources. Changed, moved, or gone: **0** (8 before this check: 4 in English, 4 in Spanish). Pictures replaced by icons: 16 per language, none of them wording.
- `npm test` in `app/`: lint clean; 101 unit tests (9 new for the snapshot); 5, 180, 56, and 928 browser checks; 0 failed. Desktop Chromium with stand-ins for the phone, muted.
- Root checks (`check_site.py`, `test_browser.py`, `test_webkit.py`, `make_review_packet.py`): all four pass (`check_site.py`: 21 pages; `test_webkit.py`: 207 checks in WebKit on a Mac, 0 problems).
- iOS Simulator (iPhone 17, rebuilt, launched muted): Location and Friends pictured in light and dark, English and Spanish (eight pictures, in `app/design/after/simulator-iphone17/` on the computer that took them, not committed). The opening paragraphs and all visible points read as described above. Places was not turned on in the Simulator, because that asks the phone for location; the paragraphs under its headings were checked in the browser tests only.
- Seen on the way: after a restart of the Simulator, the first launch showed only the background color for about twenty seconds before the page appeared; a second launch was immediate. Not explained yet. Phase 5 measures launch time and Phase 6 covers a blank screen.
- Not checked: a real phone.

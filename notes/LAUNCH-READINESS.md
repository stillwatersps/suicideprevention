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

## Crisis path report (Phase 2)

Every way to reach 988, 911, Quick exit, and Support must be there and must work, on every screen,
every time. This phase listed them all, checked each in every state a browser test can reach, fixed
what was wrong, and added a test that fails if one ever breaks.

### What was wrong, and is fixed

1. **After Quick exit, the app came back blank. (Serious.)** In the app, Quick exit hides the page
   and the phone opens weather.gov in Safari, as designed. But the app's own page stayed hidden. A
   person who came back to Tidelight saw an empty screen: no strip, no 988, no 911, and no way out
   but closing the app from the app switcher. Seen in the iPhone 17 Simulator. The website already
   handles this for its Home Screen app; the phone app was missing the same handling. Fixed by
   `app/src/app-return.js`, a ten-line script loaded on every page of the app, before and apart
   from the app's own bundle, so it works even if every other script fails: whenever the app comes
   back into view, the page is shown again.
2. **"call 911" in the strip was 43 points wide**, one under the 44-point target. It is 44 now.
3. **The "Support" link in the older sections' row of links was at 6.9 to 1 contrast**, just under
   the 7 to 1 this project holds crisis controls to. It is full ink now (14 to 1 or better).
4. **In Spanish, at the phone's very largest text size, "llama al 911" could not be reached.** On
   iPhone the app follows the phone's text size. At the largest accessibility size the Spanish
   strip grew taller than the screen, and because the strip stays fixed at the top, its last line
   sat below the bottom edge where no scrolling could bring it up. Now the strip never grows past
   the screen and scrolls within itself, so every control in it can be reached. Nothing in the
   strip is hidden, shortened, or made smaller.

### What was checked and found sound

- **Link formats.** Every call link is `tel:988` or `tel:911` and every text link is `sms:988`:
  the plain forms iOS expects. No link carries a body, a country code, or spaces.
- **The phone's side.** A tap on a `tel:` or `sms:` link is not an in-app page, so Capacitor hands
  it to iOS (`UIApplication.open`), which shows the phone's own call sheet or Messages. Nothing in
  `Info.plist` or the app's config blocks or needs to allow these: there is no navigation
  allow-list in `capacitor.config.json`, and the app never asks iOS "can you open this?" (which is
  what would need a declared scheme). The chat link and Quick exit's destination are outside web
  addresses and open in Safari the same way.
- **Nothing a crisis control depends on can fail.** The strip, Get Support Now, and the 988 panel
  are plain links in the page itself. They are there and full size with every script turned off,
  and with the app's own script missing. They need no network, no permission, no stored data, and
  no animation to finish.
- **Order.** The strip comes before the page's content, and its four controls are the first things
  a keyboard or screen reader reaches.
- **One tap from Home to calling 988:** the strip's link is on screen as Home opens.

### The inventory

Recorded from the app itself by `node test/crisis-test.mjs --record`, and kept in
`app/test/fixtures/crisis-inventory.json`: 37 screens in each language, 392 crisis controls in each.
The screens are the nine first-launch pages (the age question and each onboarding page) and 28
more: Home, Home with the site menu open, Your streak, Settings, the Check-in tab, a quick check-in
(choosing a mood, finished, and support after a very low mood), the Daily check-in (first question,
"what do you need", result, result after a heavy feeling), the share notice, Journal, Rediscover,
Hope box, Your journey, Meditate, the builder, history, the player (running, and with "End
session?" open), a finished meditation (and with a very low mood after), Location (Places off and
on), the place alert, and Friends.

The four strip controls, Get Support Now, and the 988 panel's Call, Text, and Chat are on all 37.
One row below per distinct control; "a link inside a sentence" marks the small ones (see "Known
limits").

**English** (37 screens, 392 controls in all)

| ID | Screen | Element | Action | Language | Visible without scrolling? | Taps from Home |
| --- | --- | --- | --- | --- | --- | --- |
| EN-01 | Crisis strip (top of every screen) | Quick exit | `https://www.weather.gov/` | English | yes, always | 1 |
| EN-02 | Crisis strip (top of every screen) | Call 988 | `tel:988` | English | yes, always | 1 |
| EN-03 | Crisis strip (top of every screen) | text 988 | `sms:988` | English | yes, always | 1 |
| EN-04 | Crisis strip (top of every screen) | call 911 | `tel:911` | English | yes, always | 1 |
| EN-05 | Header | Get Support Now | `#support` | English | on most screens; not when the page is scrolled | 1 (then the panel is on screen) |
| EN-06 | 988 panel (in the page, every screen) | Call 988Talk to a counselor | `tel:988` | English | no: scroll or tap Get Support Now | 2 (Get Support Now, then this) |
| EN-07 | 988 panel (in the page, every screen) | Text 988Send any message | `sms:988` | English | no: scroll or tap Get Support Now | 2 (Get Support Now, then this) |
| EN-08 | 988 panel (in the page, every screen) | Chat OnlineWeb chat with 988 | `https://chat.988lifeline.org/` | English | no: scroll or tap Get Support Now | 2 (Get Support Now, then this) |
| EN-09 | 988 panel (in the page, every screen) | 988lifeline.org (a link inside a sentence) | `https://988lifeline.org/` | English | no: scroll or tap Get Support Now | 2 (Get Support Now, then this) |
| EN-10 | Age question (first launch) | call 988 (a link inside a sentence) | `tel:988` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-11 | Age question (first launch) | text 988 (a link inside a sentence) | `sms:988` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-12 | Age question (first launch) | call 911 (a link inside a sentence) | `tel:911` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-13 | Home, quick row | Get help | `#support` | English | a short scroll on that screen | 1 |
| EN-14 | Settings, first item | Get Support Now | `#support` | English | yes when that screen opens | on that screen: 1 once there |
| EN-15 | Older sections, their row of links | Support | `#support` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-16 | Daily check-in, "what do you need" | call 988 (a link inside a sentence) | `tel:988` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-17 | Daily check-in, "what do you need" | text 988 (a link inside a sentence) | `sms:988` | English | yes when that screen opens | on that screen: 1 once there |
| EN-18 | Daily check-in, "what do you need" | call 911 (a link inside a sentence) | `tel:911` | English | yes when that screen opens | on that screen: 1 once there |
| EN-19 | Share notice | call 988 (a link inside a sentence) | `tel:988` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-20 | Share notice | text 988 (a link inside a sentence) | `sms:988` | English | yes when that screen opens | on that screen: 1 once there |
| EN-21 | Share notice | call 911 (a link inside a sentence) | `tel:911` | English | yes when that screen opens | on that screen: 1 once there |
| EN-22 | Hope box | call 988 (a link inside a sentence) | `tel:988` | English | yes when that screen opens | on that screen: 1 once there |
| EN-23 | Hope box | text 988 (a link inside a sentence) | `sms:988` | English | yes when that screen opens | on that screen: 1 once there |
| EN-24 | Hope box | call 911 (a link inside a sentence) | `tel:911` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-25 | Meditation player | Get Support Now | `#support` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-26 | After a meditation, very low mood | Call 988 | `tel:988` | English | yes when that screen opens | on that screen: 1 once there |
| EN-27 | After a meditation, very low mood | Text 988 | `sms:988` | English | yes when that screen opens | on that screen: 1 once there |
| EN-28 | After a meditation, very low mood | In immediate danger, call 911 | `tel:911` | English | yes when that screen opens | on that screen: 1 once there |
| EN-29 | After a meditation, very low mood | More ways to get support | `#support` | English | yes when that screen opens | on that screen: 1 once there |
| EN-30 | Places that are hard for me | call 988 (a link inside a sentence) | `tel:988` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-31 | Places that are hard for me | text 988 (a link inside a sentence) | `sms:988` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-32 | Places that are hard for me | call 911 (a link inside a sentence) | `tel:911` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-33 | Place alert | call 988 (a link inside a sentence) | `tel:988` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-34 | Place alert | text 988 (a link inside a sentence) | `sms:988` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-35 | Place alert | call 911 (a link inside a sentence) | `tel:911` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-36 | My circle | call 988 (a link inside a sentence) | `tel:988` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-37 | My circle | text 988 (a link inside a sentence) | `sms:988` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-38 | My circle | call 911 (a link inside a sentence) | `tel:911` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-39 | After a quick check-in, very low mood | Call 988 | `tel:988` | English | yes when that screen opens | on that screen: 1 once there |
| EN-40 | After a quick check-in, very low mood | Text 988 | `sms:988` | English | yes when that screen opens | on that screen: 1 once there |
| EN-41 | After a quick check-in, very low mood | In immediate danger, call 911 | `tel:911` | English | yes when that screen opens | on that screen: 1 once there |
| EN-42 | After a quick check-in, very low mood | More ways to get support | `#support` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-43 | Daily check-in result, heavy feeling | call 988 (a link inside a sentence) | `tel:988` | English | a short scroll on that screen | on that screen: 1 once there |
| EN-44 | Daily check-in result, heavy feeling | text 988 (a link inside a sentence) | `sms:988` | English | yes when that screen opens | on that screen: 1 once there |
| EN-45 | Daily check-in result, heavy feeling | call 911 (a link inside a sentence) | `tel:911` | English | yes when that screen opens | on that screen: 1 once there |
| EN-46 | Daily check-in result, heavy feeling | More ways to get support (a link inside a sentence) | `#support` | English | yes when that screen opens | on that screen: 1 once there |

**Spanish** (37 screens, 392 controls in all)

| ID | Screen | Element | Action | Language | Visible without scrolling? | Taps from Home |
| --- | --- | --- | --- | --- | --- | --- |
| ES-01 | Crisis strip (top of every screen) | Salida rápida | `https://www.weather.gov/` | Spanish | yes, always | 1 |
| ES-02 | Crisis strip (top of every screen) | Llama al 988 | `tel:988` | Spanish | yes, always | 1 |
| ES-03 | Crisis strip (top of every screen) | envía AYUDA al 988 | `sms:988` | Spanish | yes, always | 1 |
| ES-04 | Crisis strip (top of every screen) | llama al 911 | `tel:911` | Spanish | yes, always | 1 |
| ES-05 | Header | Obtén apoyo ahora | `#support` | Spanish | on most screens; not when the page is scrolled | 1 (then the panel is on screen) |
| ES-06 | 988 panel (in the page, every screen) | Llamar al 988Marca 2 para español | `tel:988` | Spanish | no: scroll or tap Get Support Now | 2 (Get Support Now, then this) |
| ES-07 | 988 panel (in the page, every screen) | Texto al 988Escribe AYUDA | `sms:988` | Spanish | no: scroll or tap Get Support Now | 2 (Get Support Now, then this) |
| ES-08 | 988 panel (in the page, every screen) | Chatear en líneaChat en español con la 988 | `https://chat.988lifeline.org/?lang=es` | Spanish | no: scroll or tap Get Support Now | 2 (Get Support Now, then this) |
| ES-09 | Age question (first launch) | llamar al 988 (a link inside a sentence) | `tel:988` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-10 | Age question (first launch) | enviar AYUDA al 988 (a link inside a sentence) | `sms:988` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-11 | Age question (first launch) | llama al 911 (a link inside a sentence) | `tel:911` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-12 | Home, quick row | Obtener ayuda | `#support` | Spanish | a short scroll on that screen | 1 |
| ES-13 | Settings, first item | Obtén apoyo ahora | `#support` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-14 | Older sections, their row of links | Apoyo | `#support` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-15 | Daily check-in, "what do you need" | llamar al 988 (a link inside a sentence) | `tel:988` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-16 | Daily check-in, "what do you need" | enviar AYUDA al 988 (a link inside a sentence) | `sms:988` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-17 | Daily check-in, "what do you need" | llama al 911 (a link inside a sentence) | `tel:911` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-18 | Share notice | llama al 988 (a link inside a sentence) | `tel:988` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-19 | Share notice | envía AYUDA al 988 (a link inside a sentence) | `sms:988` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-20 | Share notice | llama al 911 (a link inside a sentence) | `tel:911` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-21 | Hope box | llama al 988 (a link inside a sentence) | `tel:988` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-22 | Hope box | envía AYUDA al 988 (a link inside a sentence) | `sms:988` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-23 | Hope box | llama al 911 (a link inside a sentence) | `tel:911` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-24 | Meditation player | Obtén apoyo ahora | `#support` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-25 | After a meditation, very low mood | Llamar al 988 y marcar 2 | `tel:988` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-26 | After a meditation, very low mood | Enviar AYUDA al 988 | `sms:988` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-27 | After a meditation, very low mood | Si hay peligro inmediato, llama al 911 | `tel:911` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-28 | After a meditation, very low mood | Más formas de recibir apoyo | `#support` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-29 | Places that are hard for me | llama al 988 (a link inside a sentence) | `tel:988` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-30 | Places that are hard for me | envía AYUDA al 988 (a link inside a sentence) | `sms:988` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-31 | Places that are hard for me | llama al 911 (a link inside a sentence) | `tel:911` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-32 | Place alert | llamar al 988 (a link inside a sentence) | `tel:988` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-33 | Place alert | enviar AYUDA al 988 (a link inside a sentence) | `sms:988` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-34 | Place alert | llama al 911 (a link inside a sentence) | `tel:911` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-35 | My circle | llama al 988 (a link inside a sentence) | `tel:988` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-36 | My circle | envía AYUDA al 988 (a link inside a sentence) | `sms:988` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-37 | My circle | llama al 911 (a link inside a sentence) | `tel:911` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-38 | After a quick check-in, very low mood | Llamar al 988 y marcar 2 | `tel:988` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-39 | After a quick check-in, very low mood | Enviar AYUDA al 988 | `sms:988` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-40 | After a quick check-in, very low mood | Si hay peligro inmediato, llama al 911 | `tel:911` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-41 | After a quick check-in, very low mood | Más formas de recibir apoyo | `#support` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-42 | Daily check-in result, heavy feeling | llamar al 988 (a link inside a sentence) | `tel:988` | Spanish | a short scroll on that screen | on that screen: 1 once there |
| ES-43 | Daily check-in result, heavy feeling | enviar AYUDA al 988 (a link inside a sentence) | `sms:988` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-44 | Daily check-in result, heavy feeling | llama al 911 (a link inside a sentence) | `tel:911` | Spanish | yes when that screen opens | on that screen: 1 once there |
| ES-45 | Daily check-in result, heavy feeling | Más formas de recibir apoyo (a link inside a sentence) | `#support` | Spanish | yes when that screen opens | on that screen: 1 once there |

One known difference between the languages, from the website's own pages: where the English 988
panel ends with a link to 988lifeline.org, the Spanish panel links to 988's Spanish chat a second
time. Every other control matches, screen for screen.

### How the test works (`app/test/crisis-test.mjs`, in `npm test`; alone: `npm run test:crisis`)

It walks every screen in the inventory, in English and Spanish, in light mode, dark mode, and at
135% text, and once more in English with the network off. On each screen, for each control the
inventory lists, it fails if the control:

- is missing or hidden;
- leads anywhere other than the recorded address (and the whole inventory may only use eight
  addresses: `tel:988`, `sms:988`, `tel:911`, `#support`, weather.gov, 988lifeline.org, and 988's
  chat in English and Spanish);
- has words under 7 to 1 contrast against what is behind them;
- is under 44 by 44 points, if it is a button, a tile, or in the strip;
- has anything on top of the middle of it (it is hit-tested);
- runs off the side of the screen;
- or, for the strip, is not in view with no scrolling.

It also fails if a screen can't be reached, if any script error happens on the way, or if anything
is requested from outside the app. Then it checks: the inventory itself (the strip in view and
full size on every screen; a way to Support on every screen; Spanish matching English); the page
with scripts off and with the app's script missing; reading order; one tap from Home; coming back
from the background; the strip at 175%, 250%, and 331% text (the phone's largest); and Quick exit
from Home, mid check-in, with the menu open, and during a meditation, each followed by coming back
to the app. The number of taps from Home to calling 988 can't rise without failing "the strip is
in view as Home opens".

No call, text, or chat is ever started. Links are read and measured, never followed, and Quick
exit's destination is answered with an empty reply so nothing outside the app loads.

To add a crisis control on purpose, re-record the inventory. Never re-record to make a failure go
away.

### Scenarios and results

| Scenario | How it was tested | Result |
| --- | --- | --- |
| Every screen, English and Spanish, light | Browser test | pass |
| Dark mode | Browser test | pass |
| Largest ordinary text (135%) | Browser test | pass |
| The phone's largest accessibility text (175%, 250%, 331%) | Browser test, strip only | failed in Spanish at 331% before the fix (911 unreachable); passes now. Call 988 is in view at every size; in Spanish at 331%, 911 is reached by scrolling the strip. See "Known limits" for the rest of the page |
| Network off | Browser test, English | pass |
| First launch, before setup, and each onboarding page | Browser test | pass |
| A sheet or menu open (site menu, "End session?", the share notice, the place alert) | Browser test | pass |
| During a meditation (sound muted in tests) | Browser test | pass |
| Scripts off; the app's script missing | Browser test | pass |
| Reading and focus order | Browser test | pass |
| Back from the background | Browser test (the page's own events), and by hand in the Simulator | pass |
| Quick exit, then back to the app | Browser test, and by hand in the iPhone 17 Simulator | failed before the fix (blank app); passes now: Safari opens weather.gov, and coming back shows the app with its strip |
| Text 988 opens Messages | Not run: see below | needs a real iPhone |
| Call 988 and Call 911 show the call sheet | Can't be run: the Simulator has no Phone app | needs a real iPhone |
| VoiceOver reading the strip first | DOM order only | needs a person with VoiceOver |

`npm run test:crisis`: 334 checks, 0 failed (about five minutes). The full `npm test` result for this phase is in `app/PROGRESS.md`.

### What could not be tested here

- **An actual call sheet or Messages screen.** The Simulator has no Phone app, and this project's
  rule is never to place a call or send a text to a crisis service on any device or simulator. The
  links and the way Capacitor hands them to iOS were read, not exercised. The exact steps for a
  real iPhone are in `app/TESTING_CHECKLIST.md`, section 1b: fourteen checks, each stopping at the
  phone's own screen.
- **VoiceOver**, by ear.
- **Screen Time or parental restrictions that block Safari.** If the phone can't open a browser,
  Quick exit still hides the page, and going to the Home Screen and back shows it again. That is
  reasoned from the code and not seen on a phone.

### Known limits (not changed; see [[LAUNCH-BACKLOG]])

- **Crisis links inside sentences are text-sized.** In the Hope box, My circle, Places, the share
  notice, the place alert, the age question, and two Daily check-in screens, "call 988", "text 988",
  and "call 911" sit inside a sentence and are about 19 points tall. Making their tap area taller
  would make neighboring links on the next line overlap, so a tap meant for 988 could land on 911.
  They are left as they are; each of those screens also has the strip's full-size controls at the
  top. The test holds them to at least their current height and to nothing covering them.
- **At the phone's three largest accessibility text sizes, the strip and the tab bar take most of
  the screen.** On iPhone the app follows the phone's text size. At a 40-point body the strip is
  403 points tall and 310 points are left for everything else; at the largest, a 53-point body,
  the strip (752) and the tab bar (213) together are taller than the screen, and in Spanish the
  strip alone fills it. The strip itself stays whole and usable, which is what this phase guarantees. The page behind it is not usable at that
  size. Changing the strip is a decision for the founders and the reviewer; Phase 4 takes up the
  tab bar and the page.

## Safety rules and their tests (Phase 3)

Every safety rule written down in `CLAUDE.md`, `app/CLAUDE.md`, `app/PROGRESS.md`,
`app/BUILD-SPEC.md`, [[SAFETY]], and [[CONTENT-REVIEW]], where the app enforces it, and the test
that fails if it stops being true. Run them all with `npm run test:safety` in `app/` (about seven
minutes); they are also part of `npm test`.

"Unit" tests are in `app/test/unit/`; "crisis" is `app/test/crisis-test.mjs`; "safety" is
`app/test/safety-test.mjs`; "redesign" is `app/test/redesign-test.mjs`.

| # | Rule | Where it is enforced | Test that proves it | Status |
| --- | --- | --- | --- | --- |
| 1 | Crisis help is one tap away on every screen: Call 988, Text 988, Call 911, Quick exit | Plain links in every page's own markup; `app-safe-area.css` keeps the strip clear of the status bar and inside the screen | crisis: every screen, both languages, light, dark, large text, offline, scripts off | tested |
| 2 | No dead crisis controls: each leads where it says | The page's markup | crisis: every link's address is checked against the inventory, and only eight addresses are allowed | tested |
| 3 | Quick exit hides the page at once, leaves for a neutral site, and never leaves a blank app | The page's first script; `src/app-return.js` | crisis: "Quick exit", from four states, in both languages | tested (was broken; fixed in Phase 2) |
| 4 | Never remove, shorten, hide, or move behind a tap: the 911 line, Exit, Get Support Now, any crisis line, the "Draft for review" notices, the language link | Markup in the page flow; nothing new is an overlay | crisis (controls); safety: "Draft notices and the language link on every screen"; unit `reviewed-strings` (wording) | tested |
| 5 | A very low mood (1 or 2) on a quick check-in shows support at once, instead of the usual ending | `src/logic/safety.js` `isLowMood`; `src/ui/checkin.js` `finish` | unit `safety-rules`; safety: moods 1 to 5, both languages | tested |
| 6 | A heavy feeling on the Daily check-in shows 988 and 911 at the top of its results | `src/logic/safety.js` `isHeavyFeeling`; `src/ui/checkin.js` | unit `safety-rules`; safety: all nine feelings, both languages | tested |
| 7 | A very low mood after a meditation shows support, with no dawn | `src/ui/player.js` | safety: moods 1, 2, 3, 5 after a session | tested |
| 8 | After a very low check-in nothing celebrates, and no dawn is shown, for the rest of that calendar day | `src/logic/safety.js` `isQuietDay`; `src/ui/state.js`; `checkin.js`, `player.js`, `streaks-ui.js`, `setup.js` | unit `safety-rules`; safety: "A quiet day stays quiet, and ends at midnight"; redesign: `identityTests`, `streakTests` | tested (one gap fixed, below) |
| 9 | Streaks: no streak, milestone, or "new start" message in or near a support screen | `src/ui/streaks-ui.js` (cards live on Home only; skipped on a quiet day) | safety: "Streaks keep away from support"; redesign: `streakTests` | tested |
| 10 | Streak language stays gentle; a missed day is a "rest day" | `src/text/redesign.en.html`, `.es.json` | unit `safety-rules`: no streak line blames or shames, in either language; unit `reviewed-strings` locks the lines | tested |
| 11 | Streaks can be turned off, and turning them off loses nothing | Settings; `src/ui/streaks-ui.js` | safety; redesign: `streakTests` | tested |
| 12 | Notifications and the lock screen are discreet: never suicide, crisis, or mood | `src/text/` (`rem.*`, `notifBody`); `src/ui/reminders.js` | unit `safety-rules` (the lines themselves, both languages); safety: what the app actually schedules, both styles, both languages | tested, with one open question (below) |
| 13 | All new copy is marked "Draft for review" | A draft mark on every screen, linking to the notice | unit `safety-rules` (every screen in both text sources); safety (the mark is on screen) | tested |
| 14 | Location stays on the phone and is read only when the person asks | `src/ui/device.js`; no network at all | safety: no read on any tab or in Settings; exactly one read on "Save where I am"; nothing requested outside the app | tested |
| 15 | Nothing typed or recorded leaves the phone; no analytics, outside fonts, scripts, or embeds | The page's Content Security Policy; the lint | lint (no outside address in `src/`); every browser test fails on any outside request; Phase 7 adds a full walkthrough | tested |
| 16 | Every word is in `src/text/`, English and Spanish together | The lint; `tools/make-redesign-es.mjs` | lint (word sources match); unit `reviewed-strings` | tested |
| 17 | Reviewed wording is never changed, shortened, or removed | The snapshot | unit `reviewed-strings`; redesign: `privacyInViewTests` | tested |
| 18 | Every question is optional; a skipped answer is never treated as distress | The Daily check-in's Skip on each step; `isLowMood` ignores a missing mood | unit `safety-rules`; safety: "Questions can be skipped" | tested |
| 19 | Stored data stays readable across versions | `src/core/migrations.js` | unit `storage`; safety: "upgrading from an older version" | tested |
| 20 | Dates never break the record: midnight, month ends, the 1st to the 9th, time zones, daylight saving, a clock set back | `src/logic/streaks.js` (local `YYYY-MM-DD` keys, always two digits) | unit `streaks` (midnight, time zones, daylight saving), unit `safety-rules` (month and year ends, leap day, the 1st to the 9th, clock set back); safety: across midnight and a month end, then the clock set back | tested |
| 21 | Closing the app part-way never leaves a half check-in or a blank screen | Check-ins are kept only on Done | safety: "Closed in the middle of a check-in" | tested |
| 22 | Automated runs make no sound, and never contact a crisis service | `test/quiet.mjs`; outside requests are stopped in every test | lint (every browser is the muted one); unit `quiet`; crisis and safety fail on any outside request | tested |
| 23 | Crisis controls are plain: 7 to 1 contrast, no texture, no animation, never coral | `src/tokens.css`, `src/redesign-identity.css` | unit `tokens`; redesign: `identityTests`; crisis (contrast of every control) | tested |
| 24 | Write for minors too; follow safe messaging guidance | The wording itself | none possible: this is the reviewer's judgment | needs the reviewer |
| 25 | Never merge into `main`, never push to `app/first-build`, no names or addresses in anything committed | People and assistants | none (a rule for those who commit) | by practice |

### What Phase 3 changed

- **One implementation of the support rules.** "Is this mood very low?" and "is this feeling
  heavy?" were written out in three files. They are now in `src/logic/safety.js`, used by the quick
  check-in, the Daily check-in, the player, and the quiet-day logic, with one set of unit tests.
- **A gap in the quiet-day rule, fixed.** After a very low check-in, a later ordinary check-in the
  same day still ended on the full dawn (a finished meditation already did not). Now it ends with
  its thanks line and its two choices and no dawn. No wording changed.
- **A missing mood is not a low mood.** The old test was "is the number 2 or less", which a missing
  answer (zero) would have passed. Nothing in the app could reach that case, but the rule now says
  what it means: only a mood of 1 or 2 that was actually chosen.

### Edge cases tested

- Very low answers in every combination that triggers support: quick check-in moods 1 to 5, all
  nine Daily check-in feelings, and moods after a meditation, in English and Spanish.
- Skipped questions: each Daily check-in question, and all of them at once.
- The app closed part-way through a quick check-in and through the Daily check-in.
- A check-in at 11:50 at night on November 30, then the app opened at ten past midnight on
  December 1: yesterday's check-ins leave "Today", the quiet day ends, the calendar shows
  December from the 1st, both days are on record under two-digit dates, and the streak carries
  over the month end.
- The phone's clock set back ten days: the app opens, nothing is lost.
- Time zones and daylight saving: already covered by the streak unit tests, which run the same
  moment through New York and Los Angeles and across both clock changes.
- A first launch, a returning person, and a person upgrading from the build before the redesign
  (older check-ins and the four old reminders).

Result: `npm test` in `app/`: 115 unit tests (14 new), then 5, 180, 56, 928, 334 (crisis), and 174 (safety) browser checks; 0 failed. `npm run test:safety` runs the crisis and safety tests and the unit tests for rules, dates, wording, tokens, and muting.

### Open question found in this phase

The place alert's notification has four buttons: "I'm okay", "Send my message", **"Call 988"**, and
**"Call 911"**. They show when a person long-presses the notification, which can be on the lock
screen. That puts "988" on a notification, against the founder's rule that notifications never
mention crisis; but they are also two of the fastest ways to reach help. The two rules pull against
each other, so nothing was changed. It is a question in [[CONTENT-REVIEW]] and in [[LAUNCH-BACKLOG]].

## Accessibility report (Phase 4)

### What was checked

An automated audit, `app/test/a11y-test.mjs`, now part of `npm test`. It uses axe-core (a
test-only tool, never shipped in the app) on all 37 screens and states, in English and Spanish,
in light and dark mode, against WCAG 2.0, 2.1, and 2.2 at levels A and AA. Any serious or critical
finding fails the build. It then checks what the tool can't judge for this app:

- every link, button, and field on every screen has a spoken name;
- nothing forces its own place in the focus order;
- focus moves to the support options after a very low check-in, into Settings when it opens, back
  to Home when it closes, into "End session?" when it opens, and back to the player after;
- the horizon, scenes, icons, covers, tone squares, and the row of day dots are hidden from
  screen readers on every screen;
- the five moods are buttons named by their word, announced as pressed when chosen, with a check
  mark beside the color;
- the nine feelings are radio buttons in a named group;
- the four kinds of day in the streak legend differ in fill, outline, or ring, not only color;
- links inside sentences are underlined;
- Reduce Motion stops animation; Increase Contrast darkens outlines and soft text and turns the
  paper grain off;
- at five text sizes (default, 135%, 175%, 250%, and 331%, the phone's largest), no tab scrolls
  sideways, the tab bar keeps full-size targets and stays a bar, and Get Support Now stays within
  the screen.

Contrast is covered three ways: the unit test `tokens` checks each text and background token pair
(AA for ordinary text, 7 to 1 for crisis colors); the audit measures real text on every screen in
both modes; and the crisis test measures every crisis control.

### What was found and fixed

| Finding | Where | Fix |
| --- | --- | --- |
| Spoken names that did not include the words on screen (serious). A card showing "Next check-in, At 2:30 PM, Start" was named only "Start a check-in", so someone using Voice Control could not say what they saw | Home's next check-in and suggestion cards, the Check-in tab's quick check-in card, Meditate's suggestion card, the version line in Settings | The words on screen now come first in the spoken name, followed by the written name. No word was added or changed: both parts were already in the text |
| Tap targets overlapping each other (serious) | The older sections' row of links (Today, Journal, Rediscover, Hope box, Your journey, Support) | Each link is its own 44-point target with space between |
| The streak calendar read only numbers: "1, 2, 3…" with no way to hear which days were done, frozen, or rest days | Your streak | Each day now says its date and its state in the legend's own words ("12, Done") |
| At the phone's largest text sizes, rows ran off the side of the screen | Cards with a button at the end, the week's dots, Meditate's rows, Home's top row, "Learn more" rows | Rows wrap when their parts no longer fit, at any size |
| At the largest text size, Get Support Now ran off the side | The header | It wraps onto two lines |
| The tab bar grew to a quarter of the screen at the largest text sizes | The tab bar | Its height and icons stop growing at a cap; every tab keeps a full target |

The earlier phases' accessibility fixes are counted there: the strip's 43-point link, the 6.9 to 1
"Support" link, and the strip that could not be scrolled at the largest size.

### Results

`npm run test:a11y`: 217 checks, 0 failed. Serious or critical findings: 0 on all 37 screens in both languages and both modes (there were 52 failing screen audits on the first run, from three kinds of finding). Moderate or minor findings: 0.

### The phone's text sizes

On iPhone the app follows the phone's text size setting, including the five "Larger Accessibility
Sizes". With the fixes above, no screen scrolls sideways at any size, and the tab bar is 89 points
tall at most. What remains is the crisis strip, which was deliberately not changed:

| Text size | Strip height (English / Spanish) | Left for the page on an iPhone 17 |
| --- | --- | --- |
| Default | 98 / 98 points | 711 / 711 points |
| 135% | 129 / 219 | 658 / 568 |
| 175% (first accessibility size) | 281 / 322 | 504 / 463 |
| 250% | 403 / 513 | 382 / 272 |
| 331% (the largest) | 752 / 874 (the whole screen) | 33 / none |

At the two largest sizes the page behind the strip is hard or impossible to use, in Spanish
especially. The strip itself stays whole and reachable. This is the decision in
[[LAUNCH-BACKLOG]] under "The strip at the largest accessibility text sizes".

### What still needs a person with a real phone

Automated checks find perhaps a third of real barriers. These need someone using the phone's own
accessibility features. The steps are in `app/TESTING_CHECKLIST.md`, section 10.

1. **VoiceOver, start to finish.** Turn it on (Settings, Accessibility, VoiceOver). Swipe through
   Home from the top: the strip's four controls come first. Do a quick check-in by swiping and
   double-tapping only. Choose "Very low": VoiceOver should land on the support options. Start a
   meditation and end it. Open Your streak and swipe through the calendar: each day should say its
   date and "Done", "Frozen", or "Rest day".
2. **Voice Control.** Say "Tap Start", "Tap Call 988" (then cancel), "Tap Check-in".
3. **Larger Accessibility Sizes**, at the middle and the largest setting, in English and Spanish.
4. **Reduce Motion, Increase Contrast, Bold Text, and Smart Invert**, one at a time.
5. **A hardware keyboard or Switch Control**: Tab from the top; nothing should trap focus.
6. **Does the meditation's voice talk over VoiceOver?** Nobody has listened.

### Lesser findings from the audit (not failing)

None. The audit reported no moderate or minor finding either, on any screen.

## Performance (Phase 5)

The spec's target is "usable within 2 seconds of launch".

### Numbers, before and after

| What | Baseline | Now | How measured |
| --- | --- | --- | --- |
| Cold launch to "page loaded", iPhone 17 Simulator, median of 5 | 1,684 ms | 1,724 ms (no real change: runs vary by about 50 ms) | `node tools/launch-time.mjs 5` |
| The app's own script (`assets/app.js`) | 233 KB | 125 KB | file size; it is now minified |
| Every stylesheet | 153 KB | 153 KB | file sizes |
| Both fonts | 138 KB | 138 KB | file sizes |
| The whole app folder | 1,876 KB | 1,665 KB | `du` |
| Files the app loads at start | 16 | 16 | browser test |
| Requests to anywhere outside the app at start | 0 | 0 | browser test |
| First paint, desktop Chromium, median of 5 | not measured | about 30 ms | browser test |
| Ready to use, desktop Chromium, median of 5 | not measured | about 110 ms | browser test |
| Crisis strip on screen, with the app's script held back 1.5 s | not measured | about 50 ms | browser test |

The desktop numbers only show that nothing is grossly slow; a phone is several times slower. The
Simulator number is the closest thing here to a phone, and it is a Mac.

### What was done

- **Launch time did not change** (1,684 ms before, 1,724 ms after, inside the run-to-run spread). In the
  Simulator, launch is the system starting its web view, about 1.3 s before the page begins; the
  size of the app's script is not what it waits on. Both numbers are under the 2-second target,
  on a Mac. A real phone has not been measured.
- **The app's script is minified** (`tools/build.mjs`): 233 KB to 125 KB, less to read and parse at
  launch. Behavior is unchanged; every browser test runs against the minified file.
- **The crisis strip is in the first paint.** It is plain markup at the top of the page, styled by
  the first stylesheet, and needs no script. A test now holds the app's script back for a second
  and a half and checks the strip is on screen, full size, and usable in the meantime.
- **A budget test** (`app/test/budget-test.mjs`, in `npm test`) fails if the script passes 150 KB,
  the stylesheets 175 KB, the fonts 150 KB, the whole folder 2,100 KB, any single file 300 KB, the
  start-up file count 24, or if anything outside the app is requested at start.

### What was looked at and left

- **The fonts are already as small as they sensibly get.** Both files are the Latin-only subsets,
  compressed (woff2), and use `font-display: swap`, so text shows at once in a system font and
  changes when the font arrives. Subsetting them further to the exact characters the app uses was
  tried and saved 4% (121 KB to 116 KB for Fraunces). Narrowing their weight range made them
  larger, not smaller. The real saving, about 80 KB, would be to drop two of Fraunces's four
  design axes ("soft" and "wonk"), which changes the shape of headings: a design decision, in
  [[LAUNCH-BACKLOG]].
- **Loading screens only when needed.** The app is one page with one 125 KB script and loads 16
  small local files; there is no network. Splitting it would add complexity for a few
  milliseconds. Left as it is.
- **The paper grain** is two 400-byte SVG files. Nothing to gain.
- **Unused styles.** The website's own stylesheet (61 KB) carries rules for pages the app's
  check-in screen doesn't use; it is the website's file and is shared with the other pages inside
  the app. Left.
- **The first launch after installing** (or after the Simulator restarts) took 7.3 s against 1.7 s
  for every later launch. That is the system starting its web engine for the first time; a real
  phone keeps that warm. It needs measuring on a real phone: `app/TESTING_CHECKLIST.md`.
- **"JS Eval error" at every launch.** Capacitor tells the page "the app became active" before the
  page exists, and logs the failure. It is harmless and comes from Capacitor, not this app.

### Memory and smoothness (tested in Phase 6's resilience test)

With three years of check-ins (3,285), 600 meditations, and long notes, the app opens in under
200 ms on a desktop; Home, Your journey, History, Friends, and Your streak all open and fit.
Fifty trips to the background and back and a full session grew memory by less than 1 MB. History
shows every one of the 600 sessions in one list; paging it is in [[LAUNCH-BACKLOG]]. A real
30-minute session on a real phone, with the screen kept awake, has not been run.

## Reliability, data, and errors (Phase 6)

### What the app stores

Listed in full, with formats and versions, in [[PRIVACY-INVENTORY]]: 18 keys in the phone's
key-and-value storage and one small photo database.

### What was tested (`app/test/resilience-test.mjs`, in `npm test`)

- **Damaged data.** Each of the 18 stored things, damaged ten ways (cut off mid-save, the word
  "null", a list where a record belongs, a record where a list belongs, a bare number, a bare
  sentence with markup in it, the right shape with wrong insides, a list of broken entries, a
  megabyte of one letter, and nothing at all): 180 launches. Then everything damaged at once, in
  both languages. The app must reach a real screen, with the crisis strip and the 988 panel whole,
  nothing technical on screen, and no script error.
- **Storage full, and storage refusing everything.** The app opens; a very low check-in still
  shows its support options even though it can't be saved.
- **Years of data,** with names in Hebrew, Arabic, and emoji, a 10,000-character journal entry
  with markup in it (kept as plain text), and an over-long check-in note (cut to its limit).
- **The app's own code failing to start.**
- **An error while the app is in use.**
- **Upgrading from the older data format:** in the safety test (Phase 3) and the storage unit tests.

### What was found and fixed

1. **A damaged Hope box entry stopped the Hope box from drawing** (a script error, "cannot read
   'kind' of null"). The rest of the app still worked. Damaged entries are now left out instead:
   in the Hope box and in My circle's people and list.
2. **If the newer screens failed to start, the page could be left with no screen at all**: the
   safety frame, and nothing else. There is now a fallback. If the newer screens (tabs,
   onboarding, streaks, meditation) throw an error while starting, or start without any screen
   showing, the page opens again in its older layout: the Daily check-in page as it was before the
   tabs, with the same crisis strip, Get Support Now, Support, and review notices. It uses only
   wording that already exists; nothing was written for it. It lasts until the app is closed, and
   the next launch tries the newer screens again. If the whole app layer fails, the page falls back
   to the website's own version of itself.
3. Everything else passed first time: the storage layer already falls back to defaults for
   anything unreadable or of the wrong kind.

No error message, stack trace, or technical word reaches the screen in any of these cases. The
only place errors are recorded is the developer log, which is in memory, off unless the hidden
Developer section is opened, and never stored or sent.

### What a save looks like if the app is closed mid-way

Each stored thing is written whole, as one value, by the phone's own storage. A write that is cut
off leaves either the old value or an unreadable one; an unreadable one is treated as "nothing
stored" for that one thing (the "cut off mid-save" case above), and the rest is untouched.

### Results

`node test/resilience-test.mjs`: 33 checks, 0 failed (desktop Chromium, with stand-ins for the phone).

## Privacy and permissions (Phase 7)

### Network

`app/test/network-test.mjs` (in `npm test`) walks all 37 screens and states in both languages,
with every request to anywhere outside the app blocked and counted, and with sockets, beacons, and
peer connections trapped. Result: **0 attempts.** It also reads the built app's scripts and styles
for any outside address (one found: weather.gov, Quick exit's destination, which only a person's
tap opens), checks the page's own security policy allows connections to the app itself and
nowhere else, and that the app sets no cookies.

What ships with the app that could reach a network, and doesn't:

| Part | Could it contact a server? | Does it, here? |
| --- | --- | --- |
| Capacitor core | It includes an HTTP plugin and a cookies plugin, both off unless turned on in `capacitor.config.json` | No: neither is turned on |
| Capacitor Preferences | No | No |
| Capacitor Share | No (it opens the phone's Share sheet) | No |
| Capacitor Local Notifications | No (notifications are scheduled on the phone) | No |
| The project's own `Tidelight` plugin | No network code. It opens the phone's Messages screen and contact picker, and uses location on the phone | No |
| The website's offline helper (`sw.js`) | It fetches the site's own pages for offline use, in a web browser | Not on iPhone: the system doesn't offer that feature to pages inside an app, and every page is already a local file |

No analytics, crash reporting, advertising, remote configuration, or fonts or images from the
internet were found or added.

### Data

[[PRIVACY-INVENTORY]]: every stored item, why, where, whether it leaves the phone, how long it is
kept, and how it is deleted. Draft answers for Apple's App Privacy questions are in
`notes/APP-STORE-PRIVACY-DRAFT.md`, marked as a draft for founder and lawyer review.

### Permissions the app can ask for

| Permission | When it is asked | Explained first? | The phone's own sentence (`Info.plist`) |
| --- | --- | --- | --- |
| Location, while using the app | When the person taps "Allow location" (onboarding, the setup list, Settings, or Places), or "Save where I am" | Yes: each of those buttons sits under a sentence saying what location is for and that it stays on the phone | "To save a home spot you choose, and to check whether you're near it when the app suggests a meditation. And only if you turn on "Places that are hard for me": to notice when this phone enters a place you chose, and to put your location in a message you choose to send. Your location stays on this phone. Nothing is tracked or sent otherwise." |
| Location, always | Only inside "Places that are hard for me", after it is turned on, when the person taps to allow it | Yes: the Permission paragraph in Places, which is always in view | "Only if you turn on "Places that are hard for me": "Always" lets the phone notice a place you chose even when Tidelight is closed. Your location stays on this phone and is never sent unless you choose to send it." |
| Notifications | When the person taps "Turn on reminders" (onboarding, the setup list, or Settings), or turns on Places | Yes: "A reminder never says anything about you." and the Places wording | None: iOS shows its own question for notifications |
| Contacts | Never asked. Choosing a person opens the phone's own contact picker, which hands the app only the one contact the person taps | Yes, in My circle and Places | None needed for the picker |
| Photos | Never asked. Adding a Hope box photo opens the phone's own photo picker | Yes, in the Hope box | None needed for the picker |
| Camera | Not asked for by the app. **Needs a check on a real phone:** the photo chooser is a web file picker, and iOS may offer "Take Photo" in it. The app has no camera sentence in `Info.plist`; if that option appears and is tapped without one, iOS closes the app | n/a | Missing. See [[LAUNCH-BACKLOG]] |
| Microphone, motion, Bluetooth, tracking, health | Never | n/a | None |

Every request happens only when the person reaches the feature and taps; none at launch. The
safety test checks that opening every tab and Settings reads the location zero times.

### Licenses

[[THIRD-PARTY-LICENSES]]: 7 packages ship with the app (Capacitor and its plugins, MIT; one helper,
0BSD) and two fonts (Open Font License, with their license files). Nothing is incompatible with App
Store distribution. One gap: the MIT license asks that its notice travel with the app, and the app
has no acknowledgements screen yet.

### Blockers found in this phase (all in [[LAUNCH-BACKLOG]])

- No privacy policy and no terms exist. Apple requires a privacy policy address for every app.
- No acknowledgements screen for the MIT notices.
- The camera question above.
- The app has no privacy manifest file of its own (Apple asks apps to declare why they use certain
  system features; this app uses the phone's key-and-value storage).

### Results

`node test/network-test.mjs`: 13 checks, 0 failed. `npm test` at the end of Phase 7: 115 unit tests, then 5, 180, 56, 928, 334 (crisis), 174 (safety), 217 (accessibility), 12 (budget), 33 (resilience), and 13 (network) checks in the browser; 0 failed.

## The tab bar on every page (a founder's request, November 12)

Not part of the brief. A founder asked for it while the work was under way.

**Before:** the five tabs (Home, Check-in, Meditate, Location, Friends) were only on the app's own
screens. The website's pages inside the app (Get help, Help someone, Not sure, For teens, After a
loss, Research, About, the wallet card, the site's home page, and their Spanish twins: 19 pages)
had none, so a person who opened one from the menu or from "More ways to get support" had no
obvious way back.

**Now:** each of those pages carries the same bar, in the same order, with the same icons and
names, in the page's language. Each tab is a plain link to that screen of the app. The names are
the app's existing words, so nothing new needs review. At the largest text sizes the bar shows
icons only and keeps the names for screen readers, as the app's own bar does.

**What it doesn't touch:** the crisis strip, Quick exit, Get Support Now, and every word on those
pages. The bar is at the bottom; the strip is at the top. The public website is unchanged: the
bar is written only into the app's copy of each page, when the app is built.

**Tested** (`app/test/pages-test.mjs`, 349 checks, in `npm test`): on all 19 pages, light and
dark, the bar is there with five tabs of at least 44 points; Call 988, Text 988, Call 911, and
Quick exit are all present, uncovered, and above it; the last line of each page scrolls clear of
it; nothing outside the app is requested; and tapping each tab opens the right screen of the app,
in the same language, at the top, with the crisis strip and Get Support Now on screen. It was
also tried once in the iPhone 17 Simulator: Get Help shows the bar, and its Meditate tab opens
the app's Meditate screen.

**Looks slightly different from the app's own bar:** on these pages the bar uses the website's
colors and font, because those pages keep the website's look. Giving every page the app's look is
a design decision, in [[LAUNCH-BACKLOG]].

## Spanish parity (Phase 8)

The Spanish is an unreviewed AI translation, and the app says so. This phase checked structure,
not meaning: only a fluent reader can say whether the Spanish is right.

### What is tested

- **`app/test/unit/spanish-parity.test.mjs`** (16 tests, in `npm test`). For each of the three
  pairs of word files: Spanish has every block and word key English has, and no others; every
  block has the same number of buttons, links, fields, and menus; every block has the same call
  and text targets (988, 911); every word keeps its places for numbers and names (`{count}`,
  `{name}`); no Spanish line is identical to its English, apart from 18 that should be (the app's
  name, numbers, "min", "No", and lines that are only places for other words, listed in
  `app/test/fixtures/same-in-spanish.json`); and no Spanish line contains common English words.
- **The lint** already failed on a missing Spanish block or key, and **`npm run words:es`** fails
  if any English line has no Spanish.
- **On screen, in Spanish** (already in Phases 2 and 4, `crisis-test.mjs` and `a11y-test.mjs`): all
  37 screens and states are walked in Spanish as well as English. Every crisis control is present,
  44 points or more, and goes to the same target as its English twin, apart from the one
  difference noted below; the automated accessibility audit passes in light and dark; nothing runs
  off the side of the screen at five text sizes up to the phone's largest; and the crisis strip
  can be reached at each.

### What was found

- No missing or untranslated line.
- No layout break in Spanish that English doesn't also have. Spanish lines are longer, and the two
  places where that mattered were fixed in Phases 2 and 4 (the 911 link at the largest text size;
  the tab bar's labels).
- **Crisis targets are the same in both languages**, with one difference that was already there:
  the Spanish 988 panel's last link goes to 988's Spanish chat, where the English one goes to
  988lifeline.org. It is a question for the reviewer, not a fault.
- Spanish crisis wording is not a word-for-word translation, on purpose: "Llamar al 988 y marcar
  2" and "Enviar AYUDA al 988" follow 988's own instructions for Spanish. That wording is copied
  from the website's Spanish pages and was not touched.

### Questions for a fluent reader

Added to [[CONTENT-REVIEW]], "Questions from the launch readiness work", with the screen and the
word's key for each: the mood words ("Mal" for "Low"), "congelador" for a streak freeze, "1 días
seguidos", "Buenas noches" used for both evening and night, and the builder's "Ahora mismo
siento" before its choices.

## Code health (Phase 9)

Behavior did not change in this phase; the full suite passed before and after.

### Removed

- **Nine style rules nothing used** (`src/redesign.css`, `src/redesign-identity.css`): an empty-state
  block, a "done" mark, an old face drawing, and two "quiet" variants that the code never applied.
- **The styles of the older reminders panel** (`src/app.css`, about 30 lines). The panel itself was
  replaced by Settings in the redesign; only its styles were left.
- **One unused helper** (`hasWord` in `src/ui/words.js`).
- **A second copy of "what day is today"** in the streak screen; it now uses the one in `src/ui/state.js`.
- **A second copy of the tab bar's label-fitting**: one implementation (`src/ui/tabbar-fit.js`) now
  serves the app's own bar and the bar on the website's pages.

### Looked at and kept

- **Twenty design tokens that look unused.** Seven are the website's own variables, which the app
  overrides so its pages take the app's colors. Seven are read by name by the meditation scenes.
  Six are part of the design brief's scales, which a unit test defines. None was removed.
- **Four exports only tests use** (`memoryBackend`, `STYLES`, `TYPES`, `PATTERN_NAMES`): kept for the tests.
- **Every test and tool file** is referenced by a script, a test, or a note. No file was unused.
- **Dependencies:** six ship with the app, all Capacitor; four are build and test tools. All are used.

### Checks

- **Lint:** 0 problems, 0 warnings (`npm run lint`: scripts parse, nothing can leave the phone,
  token-only styles, word files match, muted browsers). The project has no type checker.
- **Debug logging:** the app never writes to the console. Its developer log (`src/core/dev.js`)
  keeps the last 40 lines in memory only, each a fixed label and an error's message: for example
  "location permission: denied". No check-in, note, journal entry, name, or location is ever put
  in it. It is shown only in the hidden Developer section, and is never stored or sent.
- **Safety and date logic have one implementation each:** `src/logic/safety.js` (Phase 3) and
  `dateKey` in `src/logic/streaks.js`, with `todayKey` in `src/ui/state.js`.
- **`npm audit`:** 0 known vulnerabilities, so nothing was updated. No major upgrade was made.
- **A fault in the test server** was found and fixed (`test/helpers.mjs`): a request for a missing
  file crashed the server instead of answering "not found". It affected tests only.

### Documents

- `app/README.md` gained "Step by step: install, look, test": install, look in a browser
  (`npm start`, new), the Simulator, a real iPhone, every test, and the safety tests.
- `app/CLAUDE.md` gained "Rules from the launch readiness work" and the new commands.

## Visual polish (Phase 10)

No new design. A pass over what was already there, in pictures: 452 of them, every screen and
state, English and Spanish, light and dark, a small phone (375 by 667) and a large one (402 by
874), plus two passes at the largest text size, the website's pages with their new tab bar, and
the fallback layout. They are made with `node tools/screens.mjs after-launch-pass` in `app/` and
saved to `app/design/after-launch-pass/` on the computer that runs it; they are not in the
repository.

### Found and fixed

- **The crisis strip in the fallback layout, in dark mode, was nearly unreadable** (1.7 to 1).
  The fallback is what a person sees if the newer screens fail to start (Phase 6). In it, the
  website's own rule for the strip took its background from a token the app uses for something
  else, which is pale in dark mode, under white words. The strip now uses the same plain crisis
  colors in the fallback as everywhere else: 14.6 to 1 in light, 15.9 to 1 in dark. The
  resilience test now measures it in both languages and both modes, and the automated
  accessibility audit of the fallback finds nothing else.

### Looked at and found sound

About sixty of the pictures were looked at one by one, chosen to cover each kind of screen in each
mode; the automated audit (Phase 4) measures contrast and overflow on all of them.

- **Dark mode**, every screen and state: sheets, the player, empty states, the support screens,
  the share notice, the place alert. Nothing unreadable, nothing left in light colors.
- **The small phone:** nothing clipped and nothing running off the side; the tab bar keeps its
  five tabs; the crisis strip is whole. The tests already measure this at five text sizes.
- **Tokens:** the lint allows no color outside the token file and no size outside it in the
  redesign's styles, so there was nothing to reconcile by hand. The new tab bar stylesheet for the
  website's pages uses the website's own color variables and sizes that match the tokens.

### Noticed, and left for a decision

- **On the small phone the safety frame takes close to half the screen** before a screen's own
  content starts: the crisis strip, the header with Get Support Now, the language link, and the
  "Draft for review" mark. None of it may shrink or move under a founder's rules, so it was left.
  It is in [[LAUNCH-BACKLOG]] with the strip's large-text question.

### App Store pictures

Six draft pictures at the 6.9-inch size (1320 by 2868) are made by
`node tools/screens.mjs after-launch-pass store`: Home, the quick check-in, Meditate, the Hope
box, My circle, and Support. They are plain captures of real screens with made-up data, with no
captions or frames, and each file name ends in `-DRAFT` because the wording in them is unreviewed.

## Final results (Phase 12)

November 12, 2026, on `app/launch-readiness`. Every suite was run at the end, on the final code.

| What | Baseline (Phase 1) | Final |
| --- | --- | --- |
| Lint | clean | clean |
| Unit tests | 101 pass | 131 pass, 0 fail |
| Browser checks in `npm test` | 1,169 (four suites) | 2,305 (eleven suites), 0 fail |
| of which: crisis paths | no test | 334 |
| of which: safety rules | no test | 174, plus 14 unit tests |
| of which: accessibility | no test | 217 |
| of which: performance budget | no test | 12 |
| of which: damaged data and failures | no test | 37 |
| of which: nothing leaves the phone | no test | 13 |
| of which: the tab bar on every page | did not exist | 349 |
| Spanish parity | lint only | 16 unit tests |
| Swift logic for places (`npm run test:ios`) | not run at baseline | 11 pass |
| Website checks (`check_site.py`) | pass, 21 pages | pass, 21 pages |
| Website in Chrome (`test_browser.py`) | pass | pass |
| Website in WebKit (`test_webkit.py`) | 207 checks, 0 problems | 207 checks, 0 problems |
| Time for `npm test` | not timed | about 26 minutes |
| Cold launch, iPhone 17 Simulator, median of 5 | 1,684 ms | 1,771 ms (no real change; see Phase 5) |
| The app's own script | 233 KB | 126 KB |
| The whole app folder | 1,876 KB | 1,701 KB |
| Serious or critical accessibility findings (automated) | not measured; 52 failing screen audits on the first run | 0, on 37 screens, two languages, light and dark |
| Crisis controls under 7 to 1 contrast | 2 found (a Support link at 6.9; the strip in the dark fallback at 1.7) | 0 |
| Full-size crisis controls under 44 points | 1 found (43 points) | 0 |
| Crisis controls unreachable | 2 found (blank app after Quick exit; 911 in Spanish at the largest text) | 0 |
| Requests to anywhere outside the app | 0 at start-up (not tested elsewhere) | 0 on every screen, tested |
| Reviewed wording changed without review | 4 strings (in pull request 26) | 0, and locked by a test |
| Written safety rules with a test | not counted | 25 of 25 |

All browser numbers are desktop Chromium with stand-ins for the phone, muted. The launch time is a
Simulator on a Mac. **None of it is a phone.**

### Faults found and fixed in this work (12), and one request

1. The app came back blank, with no crisis strip, after Quick exit.
2. "Llama al 911" could not be reached in Spanish at the phone's largest text.
3. A crisis strip link was 43 points wide.
4. A Support link was 6.9 to 1.
5. A dawn showed on a later check-in on a day that had a very low one.
6. The older check-in tabs overlapped each other's tap targets.
7. Cards and the header ran off the side, and the tab bar grew, at the largest text.
8. Get Support Now ran off the side at 331% text.
9. Calendar days had no spoken state.
10. A damaged Hope box entry stopped the Hope box from drawing.
11. The page could be left with no screen if the newer screens failed to start.
12. The crisis strip was 1.7 to 1 in the fallback layout in dark mode.

And one feature, at a founder's request: the website's pages inside the app had no tab bar, and
so no obvious way back. They have one now.

### In the Simulator at the end

Rebuilt and launched muted on iPhone 17. Home, Check-in, Location, Friends, and Get Support were
looked at in light and in dark, and Get Help with its tab bar in light; all rendered correctly.
The eleven pictures are in `app/design/after-launch-pass/simulator-iphone17/` on the computer that
took them.

### What still needs a real iPhone

Everything in `app/TESTING_CHECKLIST.md`. Most of all: the crisis buttons as far as the dial and
compose screens (section 1b); notifications and their lock-screen wording; "Always" location and
a place alert with the app closed; the contact picker and Messages; whether the photo chooser
offers the camera; VoiceOver; the phone's largest text sizes; launch time; a 30-minute session
with the screen locked partway; backup and restore; and the tab bar on the website's pages.


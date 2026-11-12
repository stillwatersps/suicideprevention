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


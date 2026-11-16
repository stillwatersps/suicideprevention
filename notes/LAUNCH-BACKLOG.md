---
aliases: [Launch backlog]
status: a list for the founders to decide on. Nothing here is agreed or scheduled
---

# Launch backlog: found on the way, out of scope

[[00 START HERE|Back to Start Here]]

Things noticed during the launch readiness work ([[LAUNCH-READINESS]]) that need a new feature, a
larger change, or a decision. Nothing here was built. Each line says what, why it matters, and who
decides.

## Wording (for the reviewer; not changed)

- "1 minutes in all" on the meditation completion and History screens reads wrong for one minute.
  The line is awaiting review, so it was left. It is a question in [[CONTENT-REVIEW]].
  **Changed on `app/pre-review-fixes`, November 14, 2026, at one founder's request:** exactly one minute now reads "1 minute in
  all" ("1 minuto en total"), a new line beside the old one, which is unchanged. The reviewer still confirms it.

## Crisis paths (decisions for the founders and the reviewer)

- **The strip at the largest accessibility text sizes.** At a 40-point body and above (three of the
  phone's twelve text sizes), the strip takes about half the screen or more, and at the largest
  size nothing else fits. Options: show the strip's short form ("Call 988 · Text 988 · Call 911",
  which the website already uses on a phone held sideways) at those sizes; cap how far the strip's
  text grows; or let the strip scroll away at those sizes. Each changes how the strip looks, so
  none was done. Who decides: both founders, with the reviewer.
  **Built one way on November 15, 2026, as a draft:** one founder chose the third option below, every word
  kept with the strip's words held at 28 points. The short form was not used. The other founder and the
  reviewer still decide; the questions are in [[CONTENT-REVIEW]], "Questions about the app's next features".
  **Looked at again on November 14, 2026, and still not done.** One founder asked for the short form.
  The short form leaves out "Need help now?" and "In immediate danger,", and the app's first safety
  rule (`app/CLAUDE.md`) says never to shorten crisis wording or the 911 banner. So it stays a
  decision for both founders and the reviewer.
  **Pictures for that decision**, drawn the same day in desktop Chromium at phone size, with nothing in
  the app changed: ![[attachments/crisis-strip-options-2026-11-14/english.png|420]]
  ![[attachments/crisis-strip-options-2026-11-14/spanish.png|420]]
  They show the strip now, the short form, and a third option: every word kept, with the strip's
  text and spacing no longer growing past 28 points. Share of a 402 by 874 point screen the strip takes:

  | | Now | Short form | Full words, capped |
  | --- | --- | --- | --- |
  | English, 40-point body | 39% | 26% | 28% |
  | English, largest (53-point) | 86% | 60% | 28% |
  | Spanish, 40-point body | 52% | 46% | 33% |
  | Spanish, largest (53-point) | 100%, and "llama al 911" needs scrolling | 71% | 33% |

  The capped option changes no wording, but it shows crisis controls smaller than the text size the
  person chose, and the app's rules also say no change may shrink them. Its column is a rough sketch
  made by overriding styles, not a finished design. Claude suggests the capped option be the one
  put to the reviewer. Still for both founders and the reviewer.
- **What the app shows after Quick exit.** Coming back to the app after Quick exit now shows the
  screen the person was on (before, it showed nothing). Should it instead open on Home, so a
  journal entry or check-in isn't the first thing on screen? Who decides: the reviewer.
  **Changed on `app/pre-review-fixes`, November 14, 2026, at one founder's request:** it now opens on Home, with every tab back at
  its first screen, and a meditation that was playing ends. A proposal; the reviewer's question stays open.
- **Crisis links inside sentences are small** (about 19 points tall) in eight places. Making each
  its own line or button would change how reviewed wording is laid out. Who decides: the reviewer.
  **Looked at again on November 14, 2026, and still not done.** Making only the tap area taller makes
  neighboring links overlap, so a tap meant for 988 could land on 911 ([[LAUNCH-READINESS]]). The
  safe fix is a new layout for those sentences, which is the reviewer's call.
- **The Spanish 988 panel has no link to 988lifeline.org**, where the English one does (it links to
  the Spanish chat twice). This comes from the website's pages. Who decides: the reviewer.

## Safety rules (decisions)

- **"Call 988" and "Call 911" as buttons on the place alert's notification.** A founder's rule says
  notifications never mention crisis; these buttons name 988 on a notification that can sit on the
  lock screen. They are also crisis controls, which may never be removed. Options: keep them (the
  person set this alert up for themselves); show them only when the phone is unlocked (iOS can
  require that for a notification's buttons); or remove them and rely on the alert screen. Who
  decides: both founders, with the reviewer.
- **The check-in's light on a quiet day.** After a very low check-in the finished check-in no
  longer shows the dawn that day. The small strip of light that grows while a person answers is
  still shown. Should that be off for the day too? Who decides: the reviewer.

## Accessibility (decisions and larger work)

- **Fraunces could be about 80 KB smaller** by dropping two of its four design axes, but headings
  would change shape slightly. See the performance report. Who decides: the founder who wrote the
  design brief. **Answered on `app/literata-font`, November 14, 2026, if that branch is merged:**
  that founder chose Literata for headlines and the phone's own font for body text. The fonts
  the app carries go from 141 KB to 52 KB.

## Performance and reliability

- **Meditation history shows every session in one list** (600 in the test). It works, but a long
  list should be paged or grouped by month. A small feature. Who decides: either founder.
- **Launch time on a real phone,** first launch after installing and ordinary launches, has not
  been measured. Who: whoever has the phone; steps in `app/TESTING_CHECKLIST.md`.
- **A real 30-minute session on a real phone,** screen kept awake, then the phone locked and
  unlocked. Not run.
- **When the app can't save** (the phone's storage is full), a check-in still works and shows
  support, but nothing tells the person it wasn't kept. Telling them needs new wording. Who
  decides: the reviewer, then a founder.
- **The older layout is the fallback** if the newer screens fail to start. It is not covered by
  the newer tests beyond "it opens, with the crisis strip". If the older layout is ever removed,
  the fallback needs replacing first.

## Privacy, permissions, and the App Store (blockers)

- **No privacy policy and no terms.** Required by Apple for every app, and by good practice for
  this one. Not written here on purpose: it is a lawyer's document. Who: the founders, with a lawyer.
- **No acknowledgements screen.** The MIT license of Capacitor and its plugins asks for its notice
  to travel with the app. Usually a "Licenses" row in Settings. Needs a new screen and wording.
  **Added on `app/privacy-package`, November 14, 2026:** Settings, About, "Open-source licenses". The
  notices are read from the installed packages and the font's license file when the app is built,
  never retyped, and are shown in English in both languages. A lawyer should confirm it is enough.
- **Camera.** Adding a Hope box photo uses a web file chooser. On a real iPhone it may offer
  "Take Photo". The app declares no reason for using the camera, and iOS closes an app that opens
  the camera without one. Either add the sentence (wording needed from a founder) or limit the
  chooser to the photo library. Check on a real phone first.
  **Done on `app/pre-review-fixes`, November 14, 2026:** on iPhone the Hope box now opens the phone's own photo picker, which shows
  the library only, needs no permission, and never offers the camera. Seen working in the iOS
  Simulator. Android still uses the page's file chooser; nobody has looked at it there.
- **A privacy manifest** (`PrivacyInfo.xcprivacy`) for the app's own use of the phone's
  key-and-value storage. Capacitor's packages carry their own; the app has none.
  **Added on `app/pre-review-fixes`, November 14, 2026** as a draft for a lawyer to confirm: no tracking, nothing collected, and one
  reason for the storage (reading back what the app itself saved).
- **A single check-in can't be deleted, and nothing can be exported.** Only "Delete everything".
  Privacy laws in some states give people rights to their data; since it never leaves the phone
  this may not apply, but a lawyer should say. Would be new features.
  **Built on `app/privacy-package`, November 14, 2026, as a draft:** Remove on each of today's
  check-ins and each meditation in the history, and "Make a copy of my data" in Settings. Left
  over: a check-in from an earlier day can't be removed on its own, because earlier days aren't
  listed anywhere in the app.
- **The app lock, new on `app/privacy-package`, has limits to decide on.** It uses the phone's own
  check (Face ID, Touch ID, or the phone's passcode), so someone who knows the phone's passcode,
  such as a parent, can still open the app. A code of the app's own would close that gap, but a
  forgotten code would mean deleting everything, which is a risk for a person who keeps a Hope box
  and a plan here. For both founders and the reviewer. Also: the lock does not encrypt what is
  saved; if the newer screens fail to start and the app falls back to its older layout, the lock
  is not applied; and Android has no lock yet, because the app's own plugin is iPhone only (the
  switch says it isn't available there). The picture the phone keeps for the app switcher is
  covered by code that has not been seen on a real phone.
- **"Make a copy of my data" on Android** falls back to sharing the words as text, not as a file.

## Design

- **The website's pages inside the app keep the website's look** (its colors and fonts), while the
  app's own screens use "Dawn at the Shoreline". The tab bar is now on both, but the two looks
  differ. Restyling the website's pages inside the app is a design task of its own, and would
  need the crisis strip's contrast checked again on every page. Who decides: both founders.
- **The website's pages at very large text on a small screen.** At 300% text on a 320-point
  screen, some cards on Get Help run off the side. Inside the app these pages don't follow the
  phone's text size, so a person would not normally see this; it is the website's own layout and
  belongs with the website's work. Found while testing the tab bar.
- **The safety frame on a small phone.** On a 375 by 667 screen, the crisis strip, the header, the
  language link, and the "Draft for review" mark take close to half the screen before a screen's
  own content starts. Shortening any of them is against a founder's safety rules, so it needs a
  decision from both founders and the reviewer, together with the strip's large-text question.
- **The Support section at the very largest text on the smallest phone.** On a 320-point screen at
  331% text, the Support section that sits below every screen (the website's own block, with the 988
  panel) is 16 points wider than the screen. Its buttons stay on screen and full size. It is the
  website's layout and reviewed markup, so it was left; found while testing the safety plan.
- **The widget is iPhone only, iOS 17 and later,** and has never been seen on a Home Screen: only its
  files and the app's side were checked. Android has none. It also needs its own entry in an Apple
  Developer account (its identifier is the app's with `.widget` added) before the app can be signed
  for a real phone. Who: a founder, with the account.
- **The meditation voice needs a person.** The app is ready to play recordings and
  [[VOICE-RECORDING-SHEET]] lists the 36 to make, but someone has to record them, after the
  reviewer has approved the scripts, and agree in writing to their use. Who: the founders.


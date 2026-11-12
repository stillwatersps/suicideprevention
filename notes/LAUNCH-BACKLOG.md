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

## Crisis paths (decisions for the founders and the reviewer)

- **The strip at the largest accessibility text sizes.** At a 40-point body and above (three of the
  phone's twelve text sizes), the strip takes about half the screen or more, and at the largest
  size nothing else fits. Options: show the strip's short form ("Call 988 · Text 988 · Call 911",
  which the website already uses on a phone held sideways) at those sizes; cap how far the strip's
  text grows; or let the strip scroll away at those sizes. Each changes how the strip looks, so
  none was done. Who decides: both founders, with the reviewer.
- **What the app shows after Quick exit.** Coming back to the app after Quick exit now shows the
  screen the person was on (before, it showed nothing). Should it instead open on Home, so a
  journal entry or check-in isn't the first thing on screen? Who decides: the reviewer.
- **Crisis links inside sentences are small** (about 19 points tall) in eight places. Making each
  its own line or button would change how reviewed wording is laid out. Who decides: the reviewer.
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
  design brief.

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
- **Camera.** Adding a Hope box photo uses a web file chooser. On a real iPhone it may offer
  "Take Photo". The app declares no reason for using the camera, and iOS closes an app that opens
  the camera without one. Either add the sentence (wording needed from a founder) or limit the
  chooser to the photo library. Check on a real phone first.
- **A privacy manifest** (`PrivacyInfo.xcprivacy`) for the app's own use of the phone's
  key-and-value storage. Capacitor's packages carry their own; the app has none.
- **A single check-in can't be deleted, and nothing can be exported.** Only "Delete everything".
  Privacy laws in some states give people rights to their data; since it never leaves the phone
  this may not apply, but a lawyer should say. Would be new features.

## Design

- **The website's pages inside the app keep the website's look** (its colors and fonts), while the
  app's own screens use "Dawn at the Shoreline". The tab bar is now on both, but the two looks
  differ. Restyling the website's pages inside the app is a design task of its own, and would
  need the crisis strip's contrast checked again on every page. Who decides: both founders.
- **The website's pages at very large text on a small screen.** At 300% text on a 320-point
  screen, some cards on Get Help run off the side. Inside the app these pages don't follow the
  phone's text size, so a person would not normally see this; it is the website's own layout and
  belongs with the website's work. Found while testing the tab bar.


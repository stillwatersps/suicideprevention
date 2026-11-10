---
type: handoff
owner: Claude, at one founder's request
branch: app/hard-places-and-reminders
---

# "Places that are hard for me" (idea E1) in the phone app

Date: November 10, 2026, overnight.

**State when written: pushed to `app/hard-places-and-reminders`, a draft pull request into
`app/first-build` (pull request 16's branch). Built on top of `app/daily-check-ins` (pull request 19),
so it contains that branch's reminders and shared check-ins unchanged. Not merged. Merging publishes
nothing: `app/` isn't part of the website.** Run in the iOS Simulator only, never on a real phone. No
reviewer, fluent reader, or lawyer has seen it. Everything here is a proposal for both founders.

## What was asked, and what was built

One founder asked for a location-based alert that shares their location with chosen people after a
set time near a hard place, and for the four daily check-ins with sharing. The session that built
pull request 19 took the check-ins (Feature 2); this branch has Feature 1 only, following
[[LOCATION-ALERT]]'s route A and its order: the person's own places, a wait time, a one-tap send
through Messages, neutral lock-screen words, and **no built-in list of places**.

| Part | What it does |
| --- | --- |
| Your journey, "Places that are hard for me" | Off until turned on. Permission state and an Allow button; up to 20 places (map pin or address search, a name, a radius of 100 to 500 m), each editable and removable; up to 5 people from the phone's contact picker (name and number, kept on the phone); a wait of 10, 20, or 30 minutes; a lock-screen choice (neutral words by default); the message to send, editable; a "Good to know" list of limits; 988 and 911 |
| The phone's side (Swift) | `PlaceWatcher` registers one region per place with iOS and, on entry, schedules the dwell notification for entry time plus the wait; exit cancels it. `DwellTracker` (pure Swift, tested) decides what to schedule or cancel and keeps "I'm okay" from re-alerting until the phone leaves. The notification carries four actions: I'm okay, Send my message, Call 988, Call 911 |
| The alert screen | Opens from the notification, or on its own if an alert is due when the app opens. Names the place, the minutes, and the people; counts down 30 seconds, then opens the phone's Messages composer with the people and the message plus a map link filled in. The person taps Send there; iOS never lets an app send a text itself. "I'm okay" cancels and the phone won't ask again during that visit. 988 and 911 stay on the screen |
| Where the words are | `app/src/text/en.html` and `es.html`, blocks `places` and `place-alert`. The native code has no wording of its own; the page passes it the notification's words, the map picker's labels, and the message. The two iOS permission sentences are in `app/ios/App/App/Info.plist` |
| Delete everything | Also removes the places and people and turns the feature off. Reminders and the age group stay, as before |

Also fixed, because the app couldn't run on this Mac's Xcode 27 SDK at all: the scene life cycle
(`SceneDelegate.swift` and the manifest in `Info.plist`; the app crashed at launch without it), the
deployment target raised to iOS 15 in the project and `Podfile`, and a router in
`MainViewController.swift` so a link to `check-in/` opens that folder's page (Capacitor's own router
sent every page to Home).

## Logistics, as built and as documented on screen

- **Permission.** iOS asks "while using" first and "always" later, on its own schedule. The screen
  says so and shows which the phone has granted. Without "always", a closed app can't notice a place.
- **Background.** Region entry and exit wake the app even when closed; `PlaceWatcher` starts in the
  app delegate so the event is handled. No `location` background mode and no continuous tracking.
- **Phone off, no signal, battery.** The screen says plainly that it can't work when the phone is off,
  in airplane mode, out of battery, has location off, or is underground, and that noticing can take
  a few minutes. Region monitoring is low-power by design.
- **False alerts.** Passing through does nothing (the dwell); the person picks the radius (under about
  100 m is unreliable, and the screen says so); "I'm okay" suppresses repeats for that visit.
- **The 20-region limit** is enforced in the page and in `PlaceWatcher`; the screen says "up to 20".
- **What's stored.** Places, people, wait time, message, and the tracker's entry times, in the app's
  own storage on the phone (`CapacitorStorage.tidelight.places.v1`, `tidelight.places.config.v1`,
  `tidelight.places.tracker.v1`). Nothing on a server; Tidelight has none. No visit history is kept.
- **Sending.** The composer is `MFMessageComposeViewController`; the Simulator can't send texts, so
  the share sheet stands in there and the screen says so. No background sending exists on iOS.
- **The founder's wish for a built-in list** was not built. The reasons are in [[IDEAS]] (top),
  [[LOCATION-ALERT]] ("Where the places come from"), and [[SAFETY]] rule 4: no public dataset exists;
  a list in a public repository publishes exactly what safe messaging says to leave out; almost
  everyone at such places is not in crisis, so the alerts would be wrong for most and taught to be
  ignored; and a stale or incomplete list is a liability question for a lawyer.

## Files

- New: `app/ios/App/App/TidelightPlugin.swift`, `PlaceWatcher.swift`, `PlacePickerViewController.swift`,
  `MainViewController.swift`, `SceneDelegate.swift`; `app/ios/TidelightLogic/` (package, `DwellTracker.swift`,
  tests); `app/src/native.js`, `app/src/logic.js`, `app/test/logic-test.mjs`; this handoff.
- Changed: `app/ios/App/App.xcodeproj/project.pbxproj`, `App.xcworkspace/contents.xcworkspacedata`, `Info.plist`,
  `Main.storyboard`, `AppDelegate.swift`, `Podfile`, `Podfile.lock`; `app/src/app.js`, `app.css`,
  `text/en.html`, `text/es.html`; `app/tools/build.mjs`; `app/test/app-test.mjs`; `app/package.json`;
  `app/README.md`; notes [[IDEAS]], [[TASKS]], [[STATUS]], [[CONTENT-REVIEW]].
- **Files both this branch and pull request 19 touch**, for whoever merges: `app/src/app.js`,
  `app/src/app.css`, `app/src/text/en.html`, `app/src/text/es.html`, `app/tools/build.mjs`,
  `app/test/app-test.mjs`, `app/package.json`, `app/ios/App/Podfile`, `app/README.md`, and the notes
  above. This branch includes pull request 19's commit, so merging 19 first and then this one is
  clean. The blocks `reminders`, `reminders-hint`, and `today-log` are untouched; the erase note got
  one added sentence; the places section sits between the reminders and the age group.

## Checked

| Check | Result |
| --- | --- |
| `cd app && npm test` (build, logic tests, browser tests) | 5 logic checks and 194 browser checks pass, 97 per language, in desktop Chromium with stand-ins for the map picker, the contact picker, and the phone |
| `cd app/ios/TidelightLogic && swift test` | 11 of 11 pass: entering schedules after the wait, passing through never alerts, "I'm okay" holds until exit, dwell changes reschedule, removal and reset cancel, saving as JSON round-trips |
| `xcodebuild` for the iOS Simulator | Builds with no errors and no warnings in the app's own files (the remaining warnings are Capacitor's deprecations) |
| iPhone 17 Simulator, iOS 27.2 | Launches; Daily check-in opens from the menu; the places switch asks for location permission with the app's wording; the map picker opens, "Use where I am now" pins the simulated location, a place saves and lists with its radius; the contact picker opens with iOS's private-access notice and a picked number lists; the 1-minute test wait saves; everything survives relaunch; the test-build "Pretend I just arrived" button schedules the dwell notification, which arrived one minute later on the lock screen with the neutral words while the app was in the background; opening the app went straight to the alert screen with the place, minutes, and person; the countdown reached zero and opened the share sheet (the Simulator's stand-in for Messages) with the message; cancelling left "Nothing was sent"; "I'm okay" marked the visit so the phone won't ask again |
| Not sent | No message, call, or text was sent. The share sheet was cancelled |

**Not checked, needs a real iPhone:** region monitoring itself (the Simulator reports it unavailable,
so entry and exit were simulated by the test button), the two-step "always" permission flow, the
Messages composer with people filled in, the notification's four actions (long-press didn't expand in
the Simulator), a launch from a notification tap while the app is closed, battery over days, and
Spanish on a phone. Also not done: the Android side (no native code there yet).

## Decisions, all easy to reverse

The wait defaults to 20 minutes; the countdown is 30 seconds; the lock screen is neutral unless chosen;
at most 5 people; a test-build-only 1-minute wait and entry button (`#if DEBUG`, hidden in release).
Capacitor's own notification handler is replaced by the plugin's, which passes any notification that
isn't its own to the LocalNotifications plugin, so pull request 19's reminders keep working.

## Open issues

- The iOS 27 fixes (scene life cycle, iOS 15 target, folder routing) belong to every app branch; if
  pull request 19 or 16 is run on a Mac with Xcode 27, it needs them too.
- Quick exit inside the app opens Safari, as on the website; a tap near it right after a native sheet
  closes can trigger it.
- The map search uses Apple's map search, which needs a signal; pins by touch work without one.
- Reviewer questions are in [[CONTENT-REVIEW]] under "Questions about the phone app".

## Next step

Both founders read this and [[LOCATION-ALERT]] and decide; the reviewer reads the `places` and
`place-alert` blocks and the questions; a lawyer advises on minors and location data; a founder with
a Mac and an iPhone runs it on the phone with the app closed, following [[PHONE-TEST]].

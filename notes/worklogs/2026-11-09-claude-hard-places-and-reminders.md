---
type: handoff
owner: Claude Code, at one founder's request
branch: app/hard-places-and-reminders
status: partial. Pushed to the task branch; no pull request yet. Not reviewed, not run on a real phone
---

# Hard places (E1) and check-in reminders: overnight build, stopped partway

Date: November 9, 2026, evening. The session's usage limit was reached mid-test, so this is a
partial handoff. Everything below is a proposal for both founders, the reviewer and a lawyer.
Nothing merges into `main`, and the website publishes nothing from this.

## Built (on this branch, cut from `app/first-build`)

- **Native iPhone plugin** (`app/ios/App/App/TidelightPlugin.swift`, `PlaceWatcher.swift`,
  `PlacePickerViewController.swift`): region monitoring with CLCircularRegion (at most 20), a dwell
  timer as a local notification scheduled on entry and cancelled on exit, a map picker (pin, address
  search, radius 100 to 500 m, a name), the phone's own contact picker (no permission; only the
  tapped contact reaches the app), the Messages composer with people and message filled in (the
  person taps Send; iOS never lets an app send a text itself; the Simulator can't send texts, so the
  share sheet opens instead), a PDF of a check-in summary through the share sheet, and the four
  daily reminders as repeating local notifications. The notification actions are I'm okay, Send my
  message, Call 988, Call 911. Lock-screen words are neutral ("Your plan is here.") unless the person
  chooses to show the place and time.
- **Pure dwell logic** in `app/ios/TidelightLogic` (Swift package): entered, exited, I'm okay
  (no second alert until they leave), dwell changes, place removal, reset. `swift test`: 11 of 11 pass.
- **Page side** (`app/src/app.js`, `logic.js`, `native.js`, `ages.js`, text in `app/src/text/en.html`
  and `es.html`): the Places section in Your journey (switch, permission state, places list with
  edit and remove, people up to 5, dwell 10/20/30 minutes plus a 1-minute choice in test builds only,
  lock-screen choice, editable message, limits list, 988 and 911), the alert screen with a 30-second
  countdown, I'm okay, Send now, 988 and 911; Today's check-ins list; Share today / last 7 days as
  text or PDF; four reminders with times. Every word is in the text files; the native code has none
  of its own except the two iOS location permission sentences in `Info.plist`.
- **Tests**: `node test/logic-test.mjs` 14 pass; `node test/app-test.mjs` 192 pass (Chromium, with
  stand-ins for the phone). `npm test` runs both after the build.
- **Fixes needed to run on the iOS 27 SDK at all** (the first-build app had never run on a phone):
  deployment target 15.0 (project and Podfile), a `SceneDelegate` (the SDK requires the scene life
  cycle; the app crashed at launch without it), and a router that opens a folder's own
  `index.html` (Capacitor's router sent every page to Home). CocoaPods needs `LANG=en_US.UTF-8`.

## Checked in the iOS Simulator (iPhone 17, iOS 27.2)

Launches; Daily check-in opens; reminder switch asks for notification permission and keeps the
setting after relaunch; Places switch asks for location permission with the app's wording; map
picker opens, "Use where I am now" pins the simulated location, a place saves and lists; contact
picker opens with the private-access notice and a picked contact lists; the 1-minute test dwell
saves. All settings survive a relaunch (seen in the app's preferences file).

**Not yet seen working**: the region never registered in the Simulator (no start-monitoring call in
the log, tracker stayed empty), so the dwell notification, the alert screen on the phone, the
composer fallback, the 9 pm reminder firing, and the PDF were not exercised there. Diagnostic
logging was added to `PlaceWatcher.swift` and built, but not yet run. The browser tests cover the
alert screen flow with a stand-in.

## Open issues

- Another session was building the reminders and sharing half on branch `app/daily-check-ins`
  (worktree `suicideprevention-overnight`, uncommitted) at the same time. Both need reconciling.
- Quick exit inside the app opens Safari; a tap near it after a native sheet closes triggers it.
- The founder's wish for a built-in list of places: not built. See IDEAS E1 and LOCATION-ALERT.

## Next step

Run the app with the new logging, make region monitoring register (check `isMonitoringAvailable`
and Always permission in the Simulator), trigger the 1-minute dwell, cancel at the composer; then
update IDEAS, TASKS, STATUS, CONTENT-REVIEW, and open the draft pull request into `app/first-build`.

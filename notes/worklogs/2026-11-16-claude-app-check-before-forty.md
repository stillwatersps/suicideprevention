---
type: handoff
owner: Claude, at one founder's request
branch: app/next-features
---

# A full check of the phone app, before forty more features

[[00 START HERE|Back to Start Here]]

One founder asked for forty more features, and first for a full check of the app and its code. This is that
check. Its fixes are on `app/next-features` (draft pull request 32). **It publishes nothing**, and nothing
here has run on a real phone.

## What was checked

- The app's whole test suite and the four repository checks.
- Two independent reads of the code: all of the JavaScript, and everything else (the iPhone and Android
  projects, the build tools, the checks GitHub runs).
- The app built and opened in the iPhone 17 Simulator and, for the first time, in an iPad Simulator.
- Why pull request 32's checks failed on GitHub.

## Faults found and fixed

On the safety rules:
- **"Setup complete" and its buzz could arrive on a very low check-in**, with the support step on screen. It
  now waits for another day.
- **The map for choosing a place covered the crisis strip.** It now opens below the strip.
- **A very low check-in that the phone could not save might not have reached the support step.** It does now.
- **On a short screen with a wider font, the crisis strip filled the whole screen** at the largest text, and
  its last line had to be scrolled to. Its words are now set smaller, a point at a time and never under 18,
  where the strip would take more than 70% of the screen. This is why pull request 32 failed on GitHub:
  GitHub's computers have a wider font than a Mac or an iPhone. See [[DECISIONS]].

On an iPhone:
- A check-in reminder that fired while the app was open showed nothing, "Send a test notification" included.
- Tapping a reminder did nothing more than open the app. It now opens the Check-in tab.
- Opening a saved place to rename it moved its pin to wherever the phone was.
- With the app lock on, coming back to the app on Get help or another website page showed a blank cover for
  three seconds.
- Two check-in time fields side by side ran past the edge of their panel.
- A phone set to Spanish was asked for Face ID, Health, and location in English, and lost the place a widget
  or shortcut asked for.
- VoiceOver read the map as "mapLabel".

In the app's own screens:
- "Leer en español" tapped on a website page inside the app was forgotten at the next tab.
- Leaving "Enter my date of birth again" by Quick exit hid the tab bar until the app was restarted.
- The words in the share notice stayed on the page after Quick exit.
- Choosing a mood after a meditation ended early changed its length to the full length.
- "Save as favorite" with 20 saved meditations silently removed the oldest.
- A check-in time field vanished while its time was being typed.
- Setting up again threw away check-in times carried over from the older app.
- The older "Today's check-ins" list still showed yesterday after midnight.
- The app could write an empty copy over the journal if it was hidden in its first moments.
- Two starts of a meditation at once left an empty session in the history.

`app/test/faults-test.mjs`, `app/test/unit/native-fixes.test.mjs`, and `app/test/unit/permission-words.test.mjs`
hold each of these fixed.

## Changed on purpose

- **The size ceiling for the app's script went from 150 KB to 260 KB.** The script was at 149 KB; the fixes
  took it to 152, and forty more screens need room. The reason is in [[LAUNCH-READINESS]]. The limit of 300 KB
  for any one file stays.

## Found and not fixed

- **The Android app does not work, and has never been built.** Every link to another page would show Home;
  the part of the app that talks to the phone (places, contacts, the lock) does not exist on Android; the
  app asks for no location permission there. This Mac has no Android tools, so none of it can be tried
  here. It needs its own task.
- **The checks GitHub runs build no iPhone or Android code.** A mistake in Swift passes them.
- The watch app's "Call 988" and "Call 911" probably dial on a tap. Already an open question in [[CONTENT-REVIEW]].
- "The phone can't save" cannot appear on a real phone: the phone's storage never reports a failed write.
- "Enter my date of birth again" has no Cancel.
- My circle has no way to add a person except the iPhone's contact picker.
- The version number is written three times in the Xcode project (app, widget, watch) and must be changed together.
- The app has no icon of its own yet.
- A wrong value in the saved places would stop every place from being watched, silently.

## Checked

- The full suite and the four repository checks passed after the fixes.
- In the iPhone Simulator, muted: the app opens; a test reminder shows with the app open; the time fields fit;
  the map opens below the strip.
- In an iPad Simulator: the app opens on its first screen with the crisis strip.
- **Not checked:** a real phone, and whether GitHub's checks now pass (they run after the push).

## Remaining

- The forty features, one at a time, on a new branch on top of this one.
- A founder decides about Android.

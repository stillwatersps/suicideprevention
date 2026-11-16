---
type: handoff
owner: Claude, at one founder's request
branch: app/next-features
---

# Twenty more features for the phone app

[[00 START HERE|Back to Start Here]]

One founder asked Claude to list 20 features that would make the app better, then to build all of them, one
at a time, with a full check after each before starting the next. This is a draft on `app/next-features`,
built on top of `app/privacy-package` (pull request 31), as draft pull request 32 into that branch. **It
publishes nothing.** The other founder hasn't seen it, no reviewer or lawyer has, and none of it has run on a
real phone, iPad, or watch.

Most of it adds wording. Every new line is in `app/src/text/` in English and Spanish (the Spanish is an
unreviewed AI translation) and is recorded as added since the reviewer's snapshot, never as reviewed. The
reviewed wording is unchanged.

## Completed

Four of the twenty were already built by pull requests 30 and 31 (the app lock, Remove on one item, a copy of
my data, meditation history by month). The other sixteen, each its own commit:

1. **My safety plan**: six parts in the person's own words, with Call 988, Text 988, and Call 911 fixed in it.
2. **The crisis strip at the largest text**: its words stop growing at 28 points so the screen under it stays
   usable; every word and control stays. One founder chose this from two options.
3. **AYUDA filled in** for Spanish texts to 988, in the app's copy of the Spanish pages.
4. **"What happens when you reach out to 988"** and 9. **"Other ways to reach someone"**: the Get Help page's
   own sections shown inside the app, copied word for word when the app is built.
5. **Grounding**: four short exercises, under the crisis buttons on the support screen and on the Check-in tab.
6. **A Home Screen and Lock Screen widget** (iPhone): discreet words only; a tap opens a breathing minute or
   the plan.
8. **Recorded voice**, as far as it can go without a person: `notes/VOICE-RECORDING-SHEET.md` lists all 36
   recordings and the file name the app looks for.
10. **What tends to help**: what else was recorded on days the person chose Good or Great. No score or chart;
    hard days are never counted.
13. **The app says when the phone can't save**, once, never near the crisis strip.
15. **An optional last line** on anything shared, for the person receiving it: what they can do if worried.
16. **"Helping someone you're worried about"**: the Help Someone page's own content inside the app, on Friends.
17. **A summary for an appointment**: the person ticks what goes on it and sees every word before sharing.
18. **"Your privacy in Tidelight"**: a plain description of what the app keeps, marked as not a privacy policy.
19. **Shortcuts** ("A minute to breathe", "My plan") and **Apple Health** (mindful minutes only, off until
    turned on, nothing read). One founder chose to build Health.
20. **The iPad layout** (the column sits in the middle on a wide screen) and **an Apple Watch app** (a silent
    breathing minute and the three crisis lines). One founder chose to build the watch app.

Faults found and fixed along the way: Back from a screen opened on the support step started a new check-in;
one damaged check-in entry stopped the app from starting; at the largest text on a small phone, Support landed
off the screen after Get Support Now, and a long switch label pushed the switch itself off the screen; on an
iPad on its side, the crisis strip scrolled away with the page.

`app/PROGRESS.md` ("Next features") has one line per feature with its files and tests, and `app/CLAUDE.md` has
the rules each one must keep.

## Checked

- After every feature: `npm test` in `app/` (lint, unit tests, a build, and every browser test, about 45
  minutes), then `tools/check_site.py`, `tools/test_browser.py`, `tools/test_webkit.py`, and
  `tools/make_review_packet.py`. All passed each time. Desktop Chromium with stand-ins for everything a phone
  does; muted.
- The crisis inventory gained the new screens only. Every existing entry was compared each time and is
  unchanged, apart from feature 3's own change (the Spanish text address gained `?&body=AYUDA`), which
  `app/PROGRESS.md` records.
- In the iPhone 17 Simulator, muted: the widget's addresses, texting as far as the compose screen (never
  sent), the phone's Health sheet (write-only, Mindful Minutes), one meditation written to Health and removed
  again, and both shortcuts in the Shortcuts app.
- One older test turned out to pass only on some weekdays (it expected one streak freeze, and a new week's
  freeze arrives on its Monday). It now compares the screen with what the phone holds. The app did not change.
- The iPad layout was checked in Chromium at four iPad sizes, not in an iPad Simulator.
- **Not checked, because it can't be here:** a real iPhone, iPad, or Android phone; Siri; the widget on a Home
  Screen; whether 988 shows as the recipient of a text; **the watch app, which was built and has never run**.
  `app/TESTING_CHECKLIST.md` sections 1d to 1h list what a person must try.

## Decisions that are a founder's, a reviewer's, or a lawyer's

All in [[CONTENT-REVIEW]] under "Questions about the app's next features", and in [[DECISIONS]]. The largest:

- **Apple Health changes what "stays on this phone" means.** With it on, a record that the person meditated,
  under the app's name, sits in Apple's Health store.
- **On a watch, a tap on "Call 988" or "Call 911" may dial at once.** Nobody has seen it. It must be tried on
  a real watch before anyone uses the watch app.
- **The privacy screen is not a privacy policy.** A real one is still a launch blocker.
- The safety plan, grounding, the summary, and the last line on a share are new clinical wording no reviewer
  has seen.
- The app now has one entitlement (HealthKit), a widget target, and a watch target. No team, signing identity,
  or bundle identifier was chosen or changed.

## Remaining

- Both founders read the draft pull request and decide which of the twenty to keep.
- The reviewer and a lawyer answer the questions in [[CONTENT-REVIEW]].
- Someone tries sections 1d to 1h of `app/TESTING_CHECKLIST.md` on real devices.
- A follow-up noticed and not fixed: at the largest text on a 320-point phone, the website's own Support panel
  runs 16 points off the side. It was there before this work.

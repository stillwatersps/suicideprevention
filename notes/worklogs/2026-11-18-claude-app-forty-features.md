---
type: handoff
owner: Claude, at one founder's request
branch: app/forty-features
---

# Forty features for the phone app, one at a time

[[00 START HERE|Back to Start Here]]

One founder asked for forty features and then for all of them built, one at a time, with a full check after
each. The other founder hasn't seen the list. They are on `app/forty-features`, cut from `app/next-features`
(draft pull request 32), as a draft pull request into that branch. **It publishes nothing. No clinician, fluent
Spanish reader, or lawyer has read any of the new words, and nothing here has run on a real phone.**

## What was built

Seven of the forty were in the app already and were not built again: the Hope box (1), "Making my space safer"
in the safety plan (7), crisis lines by need (8), the journal with prompts (11), feeling words in the Daily
check-in (12), "Suggested for you" on Home (23), and My circle (27). The other thirty-three are one commit
each. `app/PROGRESS.md` has a line for every one with its files and tests; `app/CLAUDE.md` has the rules each
one must keep.

- **In a hard moment:** a letter to myself (2), reach someone I trust (3), ten minutes at a time (4), tense and
  release in Grounding (5), darker at night (6), care near me (9), just sound (10).
- **Day to day:** wind down for sleep (13), three good things (14), one small thing for today (15), another way
  to see it (16), a body scan (17), being kind to yourself (18), a mindful walk (19), a first week (20), a choice
  of breathing patterns (21), my toolkit (22), reminders in the person's own words (24), my week in words (25),
  a list of every tool with a search (26).
- **With other people:** words for telling someone (28), the safety plan as a page to print or keep (29), a
  private reminder to check in on someone (30), for my next appointment (31), support over time (32).
- **For specific people:** for teens (33), for parents and caregivers (34), for veterans and for LGBTQ+ young
  people (35), after a crisis (36), after a loss (37).
- **The phone itself:** an interactive widget and a breathing session on the Lock Screen (38), a backup file
  and restoring from it (39), comfort settings (40).

Screens 32, 33, 34, 35, and 37 hold no wording of their own: the build copies the website pages' own sections
into them (`app/tools/site-screens.mjs`), and a test compares every word.

## Checked

After every feature: the app's whole suite (`npm test` in `app/`) and the four repository checks, all passing
before its commit. The suite ended at about 51 groups of checks; a full run takes about an hour.

Faults the checks found along the way, each fixed in the commit of the feature that found it:

- **Service buttons on the teen screen read at 5.6 to 1** in light colors, under the 7 to 1 that crisis
  controls need (33). Screens that copy a website section now use the same plain buttons as "Other ways to
  reach someone".
- **"Keep going" in the player's "End session?" left the keyboard on a hidden button**, an older fault a test
  had been passing by timing (34). Focus now goes back to End, and the test waits before it looks.
- **The Spanish app page passed its 300 KB ceiling** (36). The ceiling was kept; the build now strips the
  indentation from the app's two pages.
- **A new button reused an id and did nothing** (39). Renamed.
- **On a small phone at 200% text, the plus button of "check-ins a day" was off the side of the screen**, an
  older fault (40). The stepper and the version line now wrap.
- **The Read aloud button was first added, hidden, to every screen**, which gave the privacy screen a third
  control (40). It is now put on a screen only while the setting is on.

Runs that were repeated, and why (nothing else was run twice):

- Features 18 and 19: the Mac went to sleep during the run, three times in all. Later runs watched for that.
- Feature 37: the website browser check missed two Quick exit checks on Get Help while the live weather.gov
  was slow to answer; run again by itself with the same files, it passed 95 of 95. **That check depends on an
  outside website's speed**, which is worth changing.
- Feature 38: two runs stopped at checks that time this computer (the player's frames a second, and a scroll
  finishing within 0.7 seconds) while another app was using the processor and graphics. Run again with the
  Mac quiet. Nothing in feature 38 touches either. **Both checks time the computer, not the app**, and
  will fail on a busy one.

## The rundown: the whole app, after the last feature

A founder asked for this: once everything was built, every feature and button checked against what it was
meant to do.

**How it was done.** The full suite passed on the last feature's commit. Then the finished app was walked in
the iPhone 17 Simulator, muted, in four parts: Home and Settings; the Check-in tab; Meditate, Location, and
Friends; and Spanish (**the Spanish walk had not been done when this was written**). Each walk was done by a Claude helper driving the Simulator with taps and screenshots,
writing a line for each screen. Claude then looked again at every fault a walk reported before fixing or
listing it; two reported faults turned out not to be faults (Pause in the player works; Exit does reach the
weather page). About 140 screens and states were walked in English. **A Simulator is not a phone**, and none
of this was seen by a person.

**One slip.** During the Check-in walk a tap landed on "Text 988" in the safety plan while the page was still
moving. Messages opened with nothing typed; nothing was sent, and it was closed. Later walks kept every tap
well away from those buttons. No call was placed and no message was sent at any point.

### What worked, by tab

- **Home:** the greeting, next check-in, "Suggested for you", the quick tiles, "One small thing for today" and
  "My list", My toolkit (pin, unpin, open), All tools (the list, search, and the crisis lines above the results
  for a search that reads like a need for help), the streak card and screen, the 1-minute reset to its end,
  Get Support Now, and Exit (the weather page; opening the app again shows Home with nothing left open).
- **Settings:** every switch turned on and off again: haptics, streaks, reminders, a test notification,
  reminders in my own words (kept "Time to stretch"; refused "check your mood" and said why), Darker at night,
  Always dark, Easier reading, Read aloud (the button appears in the Back row, changes to "Stop reading", and
  is gone when the switch is off), the Lock Screen switch, the check-ins stepper (stops at 1 and 5), "A copy
  of my data" and "Make a backup file" (share sheets, closed without sharing), "Your privacy in Tidelight",
  licenses.
- **Check-in:** the quick check-in and Today, the Daily check-in's first questions, A letter to myself (saved,
  still there, asks before removing), Ten minutes at a time (the three crisis lines stay on screen), Care near
  me, Three good things, Another way to see it (Clear empties it; nothing kept after leaving), Being kind to
  yourself, After a crisis, Support over time, For teens, For veterans, For LGBTQ+ young people, My week in
  words (sentences, no numbers), For my next appointment and its reminder, A summary for an appointment, My
  safety plan (lines added and removed, kept across a restart; part 5's three crisis lines can't be removed;
  "Make the page" opened a share sheet for a text file), Other ways to reach someone, Grounding's five
  exercises, the journal, the Hope box, Your journey.
- **Meditate:** all eight kinds of session opened and ended; the full player check (Pause, Resume, End, "Keep
  going") on Silent and Breathe in a pattern, with all three patterns and the line about dizziness; the
  1-minute reset to its finished screen; Wind down for sleep (ticks cleared on coming back); A first week;
  History; a suggested preset kept, started, and deleted.
- **Location**, with location not allowed: it says plainly that the phone isn't allowing it; the controls that
  don't need location worked; the map opened and Cancel saved nothing.
- **Friends:** My circle (a sample contact added and removed), Reach someone I trust (read; its message
  edited), Words for telling someone, a reminder to check in on someone (set, shown, removed), After a loss
  and Helping someone you're worried about (read).

### Faults found and fixed

All but the last four are older than the forty features. Each has a check that holds it.

- **The meditation player sat low on an iPhone**, with its bottom edge, the time left, and "End session?" below
  the screen. It was put in place with a slow scroll that a touch stopped part-way, and an iPhone also leaves
  room for its status bar, which the crisis strip already covers. It is now placed at once, measured against
  the strip, and "End session?" is always on the screen without moving the player's own Get Support Now.
- **The words at the top of the player showed through the End and sound buttons.** They now move below them
  while the controls show.
- **A new session showed the last one's time left** for a moment.
- **A new screen could open part-way down its page** if a tab was tapped while the last page was scrolled. The
  same slow scroll brought the support step into view after a very low check-in. Both now happen at once.
- **Back from a tool opened from "All tools", "My toolkit", or "A first week" went to another tab.** It returns
  to the list it was opened from.
- **After a finished check-in, the Check-in tab opened on a new check-in.**
- **"Finish setting up" on Home drew its progress line as a circle over the card's words.**
- **Settings jumped** when "Easier reading" or the text size changed what was above the switch.
- **The date and time field for a reminder ran past the edge of its card** (features 30 and 31).
- **"Ten minutes at a time" said "You got through ten minutes"** after "Stop here" at ten seconds (feature 4).
  The same words, split: the first sentence is only said after the whole ten minutes.
- **"Copied" was shown at the top of "Words for telling someone"**, out of sight of the button (feature 28).

### Seen and left as it is, for the founders

- **On an iPhone the quick check-in shows only "Very low" and "Low" before scrolling**; the other three moods
  are below the bottom of the screen, and the "One slow breath first" line sits at the bottom edge. The
  website's header and the Spanish link take the top third of every screen. A design question, not changed.
- A tab remembers the screen that was open on it; a second tap on the tab goes to its first screen.
- A session ended after a few seconds is kept as "1 minute", and History's total counts it as one.
- The website's footer is at the bottom of the app's pages, with its words about "this site" and its web host.
- A journal entry and a person in My circle are removed without asking first; the letter asks.
- "Restore from a backup file" is the phone's plain "Choose File" control.
- With a reminder in the person's own words, the line in Settings reads `says "Time to stretch" Nothing…`,
  with no full stop between.
- Location's "Home spot" row opens Settings, on the Home tab.
- The contacts picker and the map took three or four seconds to open in the Simulator.
- "Finish setting up" says its count twice ("Setup 4/8" and "4/8").

### Not tried

The app lock and Apple Health (both ask the phone for something a Simulator walk shouldn't answer), "Delete
everything", "Set up again", restoring from a backup past the file chooser, anything that needs location,
opening Messages from "Reach someone I trust", every call, text, and chat link (the crisis test reads where
each one leads), the widget, the Lock Screen session, the watch app, and an iPad.

## Known limits

- **"After a crisis" (36) is the highest-risk new wording, and the first thing a clinician should read.**
- The safety plan page (29) is a text file, not a PDF.
- A tap on the two one-time reminders (30, 31) opens the check-in, like any reminder, not their own screens.
- There is no screen for new parents (35): the website names no service for them yet.
- The backup file (39) is not locked, and its screen says so. Whether it should be is a founder's decision.
- The interactive widget and the Lock Screen session (38) were built for the Simulator and have never run.
  A widget can't be put on a Home Screen by the tools used here, so nobody has seen it.
- Android is not working and has never been built.

## Decisions and open questions

Proposals, none decided, are in [[DECISIONS]]: reminders in the person's own words (24), the Lock Screen
session (38), and the unlocked backup file (39). Each new feature's questions for a reviewer are in
[[CONTENT-REVIEW]].

## Next step

Both founders read the list in `app/PROGRESS.md` and decide what stays. A clinician reads the new words,
"After a crisis" first; a fluent Spanish reader reads the Spanish. Then try it on a real iPhone: nothing here
has run on one.

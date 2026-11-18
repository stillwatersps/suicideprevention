# Tidelight Build Progress
Last updated: 2026-11-17 (forty features, feature 34)
Current branch: app/forty-features (cut from app/next-features, pull request 32, on November 16)
Current phase: Forty features: a founder's second list, built one at a time with a full check after each
Current step: Forty features: see the list just below. The first unticked line is the next one to build.

## Forty features — in progress

One founder asked Claude for forty features (November 16, 2026), then for all of them, **one at a time, with a
full check after each before the next**: `npm test` in `app/`, then the four checks at the repository root.
The other founder hasn't seen the list. Each feature is its own commit on `app/forty-features`. A founder's
standing instruction: check the plan's usage at each feature; stop with everything committed and pushed before
5% is left, and pick up here when it resets.

Already in the app before this list, so not built again (checked that each is reachable and tested): the Hope
box (1), "Making my space safer" in the safety plan (7), crisis lines by need on "Other ways to reach someone"
(8), the journal with prompts (11), feeling words in the Daily check-in (12), "Suggested for you" on Home by
time of day and place (23), My circle (27).

In a hard moment
- [x] 1 — Hope box (already built)
- [x] 2 — A letter to myself: `src/logic/letter.js`, `src/ui/letter.js`, `test/unit/letter.test.mjs`, `test/letter-test.mjs` (69 checks); one letter in the person's own words, on the Check-in tab and, once written, on the support step under the crisis buttons; in the crisis inventory, the data copy, Delete everything, the privacy screen, and behind the app lock
- [x] 3 — Reach someone I trust: `src/logic/reach.js`, `src/ui/reach.js`, `test/unit/reach.test.mjs`, `test/reach-test.mjs`; a short message ready ahead of time for one person in My circle, on the Friends tab and, when the circle has someone in it, on the support step under the crisis buttons; the phone's own messages open with the words filled in and the person sends it; the app sends nothing and keeps only words the person changed and saved
- [x] 4 — Ten minutes at a time: `src/logic/ride.js`, `src/ui/ride.js`, `test/unit/ride.test.mjs`, `test/ride-test.mjs`; five small steps of two minutes, silent, storing nothing, on the Check-in tab and on the support step under the crisis buttons; Call 988, Text 988, and Call 911 are on the screen the whole time; at the end or on "Stop here" it asks how things are, and "Still hard" shows support at once and makes the day quiet
- [x] 5 — Quick body skills: "Tense and release" is the fifth exercise in Grounding (`#tl-ground`), between "Feet on the floor" and "A slower breath"; "Something cold" and the paced breath were already there; `test/ground-test.mjs` now expects five
- [x] 6 — Darker at night: `src/logic/night.js`, `src/ui/night.js`, `tools/night-css.mjs`, `test/unit/night.test.mjs`, `test/unit/night-css.test.mjs`, `test/night-test.mjs`; a switch in Settings (`settings.nightMode`, off by default): between bed time and wake time the app uses its dark colors on a phone set to light; the build makes a night copy of every dark rule; the website's pages inside the app follow through a session-only note of when tonight ends; at night everything, the crisis strip included, looks as it does on a phone set to dark
- [x] 7 — "Make my space safer" (already built: part 6 of the safety plan)
- [x] 8 — Crisis lines by need (already built: "Other ways to reach someone")
- [x] 9 — Care near me: `src/ui/nearby.js`, `test/unit/nearby.test.mjs`, `test/nearby-test.mjs`; one link that opens the phone's own maps at a search for emergency rooms (the address is markup, with nothing about the person in it; the app reads no location), on the Check-in tab and the support step; "Other ways to reach someone" is one tap away
- [x] 10 — Just sound: a fifth built-in type, `sound`, in `src/logic/meditations.js` (`TYPES`, `CONFIG.meditation.lengths.sound`), with its card on the Meditate tab: rain, ocean, white or brown noise for 5, 15, or 30 minutes, no voice, no breathing guide, no taps; `test/sound-test.mjs`

Day to day
- [x] 11 — Journal with prompts (already built)
- [x] 12 — Feeling words (already built: the Daily check-in)
- [x] 13 — Wind down for sleep: `#tl-wind` on the Meditate tab, `src/ui/wind.js`, `test/unit/wind.test.mjs`, `test/wind-test.mjs`; four small steps to tick off (never stored, cleared each time), then "Start the Sleep session"; says help does not have to wait for morning
- [x] 14 — Three good things: `src/logic/good.js`, `src/ui/good.js`, `test/unit/good.test.mjs`, `test/good-test.mjs`; up to three short lines a day in the person's own words (`tidelight.good.v1`, newest 90 days kept, last 7 shown), on the Check-in tab; nothing counted or celebrated; never offered on the support step; in the data copy, Delete everything, the privacy screen, and behind the app lock
- [x] 15 — One small thing for today: a card on Home (`#tl-home-step`, `src/logic/step.js`, `src/ui/step.js`, `test/unit/step.test.mjs`, `test/step-test.mjs`) showing one line a day from the person's own "Things you'd like to try" (the older page's list, read only); "Another one" and "My list"; the app adds no line, stores nothing, never asks whether it was done; hidden on a quiet day
- [x] 16 — Another way to see it: `#tl-reframe` on the Check-in tab, `src/ui/reframe.js`, `test/unit/reframe.test.mjs`, `test/reframe-test.mjs`; four questions for a heavy thought, answered in the person's own words; nothing typed is kept (cleared on leaving, on Quick exit, and by its own button); says first that it isn't for thoughts of ending your life; never on the support step
- [x] 17 — Body scan: a sixth built-in type, `scan` (`TYPES`, `builtIn`, `CONFIG.meditation.lengths.scan`), 5 or 10 minutes, with its card on the Meditate tab; every line is one the Deep session already says (`intro.deep`, `bodyScan`, `outro.deep`), so the voice recording sheet is unchanged; `test/scan-test.mjs`. Muscle relaxation is "Tense and release" in Grounding (feature 5): a spoken version would need new script lines and recordings, and was not written
- [x] 18 — Being kind to yourself: `#tl-kind` on the Check-in tab (markup only, no script): three short self-compassion exercises in plain words, with 988 and 911 at its end; nothing to type, nothing kept; `test/unit/kind.test.mjs`, `test/kind-test.mjs`
- [x] 19 — A mindful walk: a seventh built-in type, `walk` (5, 10 or 15 minutes), with its card on the Meditate tab; four new spoken lines in two styles and two languages (`intro.walk`, `walk.steps`, `walk.around`, `outro.walk`), which are in the voice recording sheet; no breathing circle and no taps, and its first line says to put the phone in a pocket and watch where you're going; `test/unit/walk.test.mjs`, `test/walk-test.mjs`
- [x] 20 — A first week: `#tl-course` on the Meditate tab, `src/logic/course.js`, `src/ui/course.js`, `tidelight.course.v1` (step numbers only, no dates); seven steps, each one something the app already has (1-minute reset, Grounding, Body scan, Three good things, A mindful walk, Being kind to yourself, My safety plan); a tick is the person's own and can be taken back; nothing is counted, and the closing line is hidden on a quiet day; in the copy of my data, the erase, and the privacy screen; `test/unit/course.test.mjs`, `test/course-test.mjs`
- [x] 21 — A choice of breathing patterns: an eighth built-in type, `breathe`, with a pattern picked on its card (`BREATHE`: calm 4-6, box 4-4-4-4, 4-7-8), for 1, 3 or 5 minutes; breathing only, nothing spoken; the card says to stop if it makes you dizzy; a favorite keeps its pattern; `test/unit/breathe.test.mjs`, `test/breathe-test.mjs`
- [x] 22 — My toolkit: a card on Home (`#tl-home-toolkit`) with up to four tools the person pins, chosen on `#tl-toolkit`; `src/logic/tools.js` (the list of tools as data, `TOOLS`, which a list of every tool can reuse), `src/ui/toolkit.js`, `tidelight.toolkit.v1` (ids only); the crisis lines are not tools and can't be pinned or unpinned; in the copy of my data, the erase, and the privacy screen; `test/unit/toolkit.test.mjs`, `test/toolkit-test.mjs`
- [x] 23 — Home adapts (already built: "Suggested for you")
- [x] 24 — Reminders in the person's own words: a field in Settings, Notifications (`#tl-set-rem-words`), kept as `settings.reminderWords`; `src/logic/reminder-words.js` refuses words about mood, crisis, or getting help (English and Spanish), and a refused or missing line means the app's usual words; the screen warns that a reminder shows on the lock screen; in the copy of my data, and removed by Delete everything; `test/unit/reminder-words.test.mjs`, `test/reminder-words-test.mjs`
- [x] 25 — My week, in words: `#tl-week` on the Check-in tab, `src/logic/week.js`, `src/ui/week.js`; a few plain sentences about the last seven days (check-ins, meditations, good things) and the person's own check-in lines; no numbers, scores, charts, or comparisons, by a unit test; put together each time and never kept; the three crisis lines are on the screen; `test/unit/week.test.mjs`, `test/week-test.mjs`
- [x] 26 — A searchable list of every tool: `#tl-tools`, opened from Home's toolkit card ("All tools"), `src/ui/tools-list.js`; twenty-two tools from `EVERY` in `src/logic/tools.js` (the fourteen that can be pinned and eight that have a tab or row already), each a name and a line; search matches either, without capitals or accents; what is typed is never kept and is cleared on leaving; a search that reads like a need for urgent help shows the three crisis lines first (`asksForHelp`); `test/unit/tools-list.test.mjs`, `test/tools-test.mjs`

With other people
- [x] 27 — My circle (already built)
- [x] 28 — Words for telling someone: `#tl-tell` on the Friends tab, `src/ui/tell.js`; eight ways to start in four groups (starting the conversation, in writing, thoughts of suicide, what to ask for), each with a Copy button that puts the words on the phone's clipboard and nothing else; the three crisis lines are on the screen; nothing kept, nothing sent; `test/unit/tell.test.mjs`, `test/tell-test.mjs`
- [x] 29 — The safety plan as a page to print or keep: "A page to print or keep" on the plan screen (`#tl-plan-page`), `planPage()` in `src/logic/plan.js`; one plain text file handed to the phone's share sheet (from there: Print, or Save to Files), with every part that has something in it and always 988 and 911 at the end; nothing is kept about where it went; it is a text file, not a PDF: a real PDF needs native code that was not written; `test/unit/plan-page.test.mjs`, `test/plan-page-test.mjs`
- [x] 30 — For supporters, a private reminder to check in on someone: `#tl-follow` on the Friends tab, `src/logic/once.js`, `src/ui/once.js`, `src/ui/follow.js`, `tidelight.follow.v1` (a name the person may type, and a time); the phone's notification (id 298) says only "A reminder you set." and never the name; in the copy of my data, the erase (which also cancels the notification), and the privacy screen; `test/unit/once.test.mjs`, `test/follow-test.mjs`
- [x] 31 — Therapy companion: `#tl-visit`, "For my next appointment", on the Check-in tab; `src/logic/visit.js`, `src/ui/visit.js`, `tidelight.visit.v1`; up to eight things to bring up, in the person's own words, and one reminder (notification id 297) that says only "A reminder you set."; leads on to "A summary for an appointment"; in the copy of my data, the erase (which also cancels the notification), and the privacy screen; `test/unit/visit.test.mjs`, `test/visit-test.mjs`
- [x] 32 — Links to low-cost care: `#tl-care` on the Check-in tab shows the Get Help page's own section "Support over time" (talk to a health care provider, FindTreatment.gov, SAMHSA's National Helpline), word for word; `tools/site-screens.mjs` is the one place that says which screens show which page's sections (`SITE_SCREENS`, `<!-- SITE:name -->` in the markup), and `test/site-test.mjs` compares every such screen with its page

For specific people
- [x] 33 — Teen wording: `#tl-teens` on the Check-in tab shows the For teens page's own opening and four sections (reaching out yourself, telling an adult you trust, what stays private, a friend you're worried about), word for word, through `SITE_SCREENS`; the row is shown to everyone, whatever age group was picked
- [x] 34 — A guide for parents and caregivers: `#tl-parents` on the Friends tab shows the Help Someone page's own section "If it's a child or teen" (a parent or caregiver, at school, a young person worried about a friend), word for word, through `SITE_SCREENS`; no new guide was written: a fuller one is for a clinician to write on the website, and the app will show it
- [ ] 35 — Pages for veterans, LGBTQ+ people, and new parents
- [ ] 36 — After a crisis
- [ ] 37 — For people who lost someone to suicide (the website's page, shown in the app)

The phone itself
- [ ] 38 — An interactive widget and a Live Activity for a breathing minute
- [ ] 39 — Restore from "a copy of my data"
- [ ] 40 — Comfort settings: appearance, easier reading, read aloud

### Resume instructions (forty features)

Work in the worktree on `app/forty-features`. Build the first unticked feature above. Before its commit: `npm
test` in `app/` (shut the Simulator down first: it makes the long run flaky), then `tools/check_site.py`,
`tools/test_browser.py`, `tools/test_webkit.py`, and `tools/make_review_packet.py` from the root. A new screen
goes in `test/app-screens.mjs` and the crisis inventory is re-recorded for it (`node test/crisis-test.mjs
--record`), with every existing entry compared and unchanged. New words: `npm run words:es`, then
`node app/tools/strings.mjs snapshot app/redesign-dev` from the root (the reviewed count must stay 1997), and a
question in `notes/CONTENT-REVIEW.md`. Tick the line here, commit, push, go on. At the end: a draft pull request
into `app/next-features`, a handoff in `notes/worklogs/`, and the status, task, and decision notes.

**After the last feature (a founder's instruction, November 16, 2026): a full rundown of the whole app.** Every
feature and every button, old and new, checked that it does what it was planned to do: the full suite, then a
walk through every screen in the iPhone Simulator (muted, `npm run sim:launch`; never complete a call or send a
text), in English and Spanish, with the result written up screen by screen in the handoff, faults fixed or listed.
The founder is away while this runs: keep going without asking, one feature after another.

## A full check before forty more features — November 16, 2026

A founder asked for forty more features and, first, a full check of the app and its code. Two independent
reads of the code, the full suite, and a run in the iPhone and iPad Simulators found about thirty faults.
Those that could be fixed and checked here are fixed on `app/next-features`; the handoff
`notes/worklogs/2026-11-16-claude-app-check-before-forty.md` lists each, and what was left (Android does not
work and has never been built; GitHub's checks build no native code). New tests: `test/faults-test.mjs`,
`test/unit/native-fixes.test.mjs`, `test/unit/permission-words.test.mjs`; `test/strip-test.mjs` now also runs
with a wide font, which is what failed on GitHub.

## Next features — in progress
One founder asked Claude for twenty features that would make the app better (November 15, 2026), then asked for all of them, **one at a time, with a thorough check after each before the next**. The other founder hasn't seen the list. Each feature is its own commit on `app/next-features`. The check after each: `npm test` in `app/` (every suite), the four root checks, and, when native code changed, a build and a look in the iOS Simulator (muted). New wording is marked "Draft for review", is in both languages, and has its questions in `notes/CONTENT-REVIEW.md`, "Questions about the app's next features".

Already built by other sessions before this list was started, so not built again: app lock (7), removing one item (11), a copy of your data (12), meditation history by month (14), a licenses screen and a draft privacy manifest (part of 18).

- [x] 1 — My safety plan: `src/logic/plan.js`, `src/ui/plan.js`, `test/unit/plan.test.mjs`, `test/plan-test.mjs`; in the crisis inventory, the damaged-data test, the data copy, Delete everything, and behind the app lock
- [x] 2 — The crisis strip at the largest text sizes: every word kept, the strip's words held at 28 points and its tap targets at 56 (the founder chose this over the short form, so safety rule 1 is not overridden). 86% of the screen becomes 27% (English) and 32% (Spanish) on an iPhone 17. `test/strip-test.mjs` (112 checks); tried in the Simulator at the phone's largest text setting
- [x] 3 — "AYUDA" filled in for Spanish texts to 988, in the app's copy of the Spanish pages (98 links on the app's screens, and every Spanish website page inside the app); English and the PRIDE link unchanged; the public website unchanged. Six new checks in `test/crisis-test.mjs`. Seen in the Simulator as far as the compose screen; **the recipient is not confirmed on a real phone**
- [x] 4 — "What happens when you reach out to 988": a screen that shows the Get Help page's own section word for word, copied at build time (no new clinical wording), with 988 and 911 at its end; reached from the support screen and part 5 of the plan. Back from it, and from the plan, now returns to the support screen instead of starting a new check-in. `test/expect-test.mjs` (42 checks)
- [x] 5 — Grounding: a screen with four short exercises (5-4-3-2-1, something cold, feet on the floor, a slower breath with the app's silent one-minute circle), on the support screen under the crisis buttons and on the Check-in tab; stores nothing; 988 and 911 at its end. New AI-written wording, with questions for the reviewer. `test/ground-test.mjs` (44 checks)
- [x] 6 — A Home Screen and Lock Screen widget for iPhone (iOS 17 and later): a new target `TidelightWidget`, discreet words only, no access to anything saved; a tap opens the app at a breathing minute or the safety plan through `tidelight://open/...`, behind the app lock if it is on. `test/unit/widget.test.mjs` (6) and `test/open-test.mjs` (24). In the Simulator the app compiles with the widget inside it and both addresses were seen working; **the widget itself has not been seen on a Home Screen**
- [x] 7 — App lock (already built, pull request 31)
- [x] 8 — Recorded voice, as far as it can be built without a person: `notes/VOICE-RECORDING-SHEET.md` lists all 36 recordings (9 lines, 2 voices, 2 languages) with the exact file name the app looks for and how to record them; made by `tools/voice-sheet.mjs`, and `test/unit/voice-sheet.test.mjs` fails if it falls behind the app. The app already plays a recording when its file exists. **Nothing is recorded, and nothing should be before the scripts are reviewed**
- [x] 9 — "Other ways to reach someone" inside the app: the Get Help page's own list of services by need, word for word and link for link, copied at build time (no new wording); reached from the support screen and part 5 of the plan. AYUDA is now filled in wherever a link says it, including the Spanish block of an English page. `test/ways-test.mjs` (46 checks)
- [x] 10 — What tends to help: on the days of the last 30 with a quick check-in of Good or Great, what else was recorded on two or more of them (a tag, a meditation, a journal entry). No score, chart, or trend; hard days are never counted or shown; nothing is stored. `src/logic/helps.js`, `test/unit/helps.test.mjs` (9), `test/helps-test.mjs` (45). **A fault found and fixed:** one damaged entry in the check-in log stopped the whole app from starting; the log is now cleaned when loaded, and the damaged-data test checks it
- [x] 11 — Remove one item (already built, pull request 31)
- [x] 12 — A copy of my data (already built, pull request 31)
- [x] 13 — When the phone can't save, the app says so: one line, once, above the tab bar and never near the crisis strip, with "Got it"; every write reports a failure (`src/core/save-note.js`). `test/save-test.mjs` (41 checks). **A fault found and fixed:** at the largest text on a small phone, anything scrolled to, such as Support after Get Support Now, landed off the screen, because the website's fixed allowance for the strip was taller than the screen; it now follows the strip's real height, and `test/strip-test.mjs` checks every size (136 checks)
- [x] 14 — Meditation history by month (already built, pull request 30)
- [x] 15 — An optional last line for the person who receives a shared message: a box in the share notice, off until ticked and off again each time, that shows the exact sentence it adds (911 for immediate danger; 988 about someone you're worried about). Added to what is shared and to a message to My circle. `test/share-note-test.mjs` (26 checks). These words reach people who did not choose the app, so the reviewer's and a lawyer's questions matter most here
- [x] 16 — "Helping someone you're worried about" inside the app, on the Friends tab: the Help Someone page's own opening and six sections, word for word and link for link, copied at build time (no new wording), with every folded part open. The page's 911 line and 988 links come with it. `test/helping-test.mjs` (38 checks)
- [x] 17 — A summary for an appointment, on the Check-in tab: the person chooses 14 or 30 days and what goes on it (check-ins, journal entries, the safety plan, one thing to ask or say), sees every word, and hands it to the share sheet as a text file. Nothing ticked or typed is kept; nothing is counted or interpreted. `src/logic/summary.js`, `test/unit/summary.test.mjs` (10), `test/summary-test.mjs`. New AI-written wording, with questions for the reviewer. Not promised: printing (the share sheet's own Print has not been seen on a phone)
- [x] 18 — "Your privacy in Tidelight", in Settings under About: a plain description of what the app keeps and where it goes, in eight short parts, marked first as not a privacy policy and not read by a lawyer. Every word in view. `test/unit/privacy-screen.test.mjs` (6) fails if the app stores something the screen doesn't cover; `test/privacy-screen-test.mjs`. New AI-written wording. **A privacy policy is still missing and is still a launch blocker**
- [x] 19 — Shortcuts and Apple Health, iPhone only. **Shortcuts:** "A minute to breathe" and "My plan" in the Shortcuts app, search, and Siri (`TidelightShortcuts.swift`, iOS 16 and later), discreet like the widget; each only opens the app at that place. **Apple Health** (a founder said to build it): a setting, off until turned on, that adds each finished meditation to Health as mindful minutes and nothing else; no read access is asked for; a button and "Delete everything" remove what was added (`TidelightHealth.swift`, `src/ui/health.js`). The app now has one entitlement and the purpose string `NSHealthUpdateUsageDescription`. `test/unit/shortcuts-health.test.mjs` (8), `test/health-test.mjs`. The privacy screen gained a part about Health. Seen in the iPhone 17 Simulator, muted: the phone's own Health sheet asks only to write Mindful Minutes; a finished one-minute meditation appeared in the Health app as 1 minute and nothing else; the remove button took it out again; both shortcuts show in the Shortcuts app and "My plan" opened the plan. Not seen: Siri, a shortcut starting the app from closed, a real phone. **A fault found and fixed:** at the largest text on a small phone a long switch label pushed the switch itself off the screen (the app-lock switch too); labels now wrap. **It changes what "stays on this phone" means**; questions for the reviewer and a lawyer are in `notes/CONTENT-REVIEW.md`
- [x] 20 — The iPad layout and an Apple Watch app. **iPad:** the app's column now sits in the middle of a wide screen, in line with the tab bar (it sat left of the middle on an iPad on its side); `test/ipad-test.mjs` (58 checks) walks every screen at four iPad sizes. **A fault found and fixed:** on a screen 960 points wide or more the crisis strip scrolled away with the page (the website's desktop layout); in the app it now stays pinned at every width (`src/app-safe-area.css`). Chromium at iPad sizes only; not seen in an iPad Simulator or on an iPad. **Watch** (a founder said to build it): a new target `TidelightWatch` (watchOS 10 and later, `org.tidelight.app.watchkitapp`, added by `tools/add-watch-target.rb`, no team set): a silent breathing minute, and the phone app's own three crisis lines on its first screen. It stores nothing, reads nothing, and has no notifications or complication. `test/unit/watch.test.mjs` (7). **Built for the watch Simulator; never run: there is no watch Simulator on this computer and no watch.** Whether a tap on "Call 988" dials at once on a watch is unknown and must be checked before anyone uses it

### Next features vs. project rules
- **Feature 3 changed existing entries in the crisis inventory**, which the founder's November 15 answer (new screens only) did not cover. The change is the feature itself, which the founder asked for by name: in Spanish, the address of each text link to 988 that says AYUDA gained `?&body=AYUDA`. It was compared entry by entry: English is identical, 98 Spanish entries changed in exactly that way, and nothing else changed.
- **The crisis inventory** gains entries for each new screen. The app's rules say to ask a founder before re-recording it; the founder said yes on November 15 for new screens only. After each recording, every earlier entry and the order are compared with the file before and must be unchanged.
- **Feature 2 against safety rule 1** ("never shorten the 911 banner"): the short form was declined on November 14 for that reason. On November 15 the founder first chose to build it as a draft, then, shown the three pictured options, chose "full words, capped" instead. So nothing is shortened and rule 1 stands. What is new is that the strip is shown smaller than the text size the person chose, above about twice the usual size; that is a question for the other founder and the reviewer.
- **Features 6, 19, and 20** need new signed targets or an entitlement in Xcode. The launch brief's "never change signing or bundle settings" was that brief's rule; the founder chose to build all three on November 15. No team, account, or App Store setting is touched, and none can be tested on a real device here.

## Launch readiness brief — finished November 12, 2026
A third brief from the same founder (`app/LAUNCH-BRIEF.md`, November 12, 2026): harden, test, measure, and document. No new features, no change to reviewed wording, no network, draft pull requests only. The record of findings is `notes/LAUNCH-READINESS.md`; out-of-scope ideas go to `notes/LAUNCH-BACKLOG.md`. Checkpoints: commit and update this file after every phase; full suite at phase ends; stop cleanly on "checkpoint"; never redo a finished phase.

- [x] L0 — Pull request 26 wording: every reviewed string restored and locked by a snapshot test; privacy and consent wording in view and locked by a test. Pushed to pull request 26
- [x] L1 — Branch `app/launch-readiness`, baseline numbers (in `notes/LAUNCH-READINESS.md`), readiness and backlog notes, `tools/launch-time.mjs`
- [x] L2 — Crisis path reliability: 37 screens and 392 controls per language inventoried; four bugs fixed (blank app after Quick exit; 911 unreachable in Spanish at the largest text; a 43-point target; a 6.9 to 1 link); `test/crisis-test.mjs` in `npm test` (334 checks). `npm test`: 101 unit, 5, 180, 56, 928, 334, 0 failed
- [x] L3 — A test for every safety rule: 25 rules in a table in `notes/LAUNCH-READINESS.md`; `src/logic/safety.js` (one implementation); `test/unit/safety-rules.test.mjs` (14) and `test/safety-test.mjs` (174); one gap fixed (no dawn on a later check-in on a quiet day); `npm run test:safety`. `npm test`: 115 unit, 5, 180, 56, 928, 334, 174, 0 failed
- [x] L4 — Accessibility audit and fixes: `axe-core` (a test-only dependency) on all 37 screens, both languages, light and dark, with 0 serious or critical findings; spoken names kept honest (`keepNamesHonest`); calendar days say their state; layouts wrap and the tab bar stops growing at the phone's largest text; Get Support Now no longer runs off the side at 331%. `test/a11y-test.mjs` (217 checks) and `test/app-screens.mjs` (the one list of screens) in `npm test`
- [x] L5 — Performance and launch time: the app's script is minified (233 KB to 125 KB); the crisis strip is on screen before the script loads (tested); `test/budget-test.mjs` (12 checks) in `npm test`. Fonts left as they are (already subsets)
- [x] L6 — Data reliability and error handling: 18 stored things damaged ten ways each, storage full or refusing, three years of data, a start-up failure, runtime errors. Two faults fixed (a damaged Hope box entry; a near-blank page when the newer screens fail to start, which now falls back to the older layout). `test/resilience-test.mjs` (33 checks) in `npm test`
- [x] L7 — Privacy and permissions audit: every screen walked with the network blocked, 0 attempts (`test/network-test.mjs`, 13 checks, in `npm test`); `notes/PRIVACY-INVENTORY.md`, `notes/APP-STORE-PRIVACY-DRAFT.md`, `notes/THIRD-PARTY-LICENSES.md`; permissions table in `notes/LAUNCH-READINESS.md`. Blockers found: no privacy policy, no acknowledgements screen, a possible missing camera sentence, no privacy manifest
- [x] A founder's request, between L7 and L8 — the tab bar on every page inside the app (19 website pages, both languages): `src/app-tabbar.css`, `src/app-tabbar.js`, `src/ui/icons.js`, `src/ui/tabbar-fit.js`, written into each page by `tools/build-redesign.mjs`; `test/pages-test.mjs` (349 checks) in `npm test`
- [x] L8 — Spanish parity: `test/unit/spanish-parity.test.mjs` (16 tests: same blocks, keys, controls, crisis targets, and places for numbers; no line left in English; 18 lines rightly identical, in `test/fixtures/same-in-spanish.json`). Nothing missing or untranslated. Six questions for a fluent reader in `notes/CONTENT-REVIEW.md`
- [x] L9 — Code health: nine unused style rules, the older reminders panel's styles, one unused helper, and two duplicated helpers removed; lint clean; `npm audit` clean; no user content in any log; README gained step-by-step instructions and `npm start`; `app/CLAUDE.md` gained the rules from this brief. Twenty tokens that look unused were kept, with reasons in `notes/LAUNCH-READINESS.md`
- [x] L10 — Visual polish leftovers: 452 pictures of every screen (both languages, light and dark, two phone sizes, largest text, the website's pages, the fallback); one fault found and fixed (the crisis strip in the fallback layout was 1.7 to 1 in dark mode; now 15.9 to 1, and tested); six App Store draft pictures; `tools/screens.mjs` takes them all
- [x] L11 — Packets, all drafts, none sent to anyone: `notes/REVIEWER-PACKET.md` (37 screens with their exact wording, filled in by `tools/reviewer-walkthrough.mjs`, and 54 questions by priority), `notes/LEGAL-PACKET.md` (23 questions), `notes/APP-STORE-READINESS.md` (draft listing, review notes, guideline checklist, age rating, build readiness), `notes/FOUNDER-SUMMARY.md` (one page). Linked from the notes' Start Here page
- [x] L12 — Final verification: every suite on the final code (131 unit, 2,305 browser checks, 11 Swift, the four root checks; 0 failed); rebuilt and looked at in the Simulator, light and dark; final table in `notes/LAUNCH-READINESS.md`; worklog `notes/worklogs/2026-11-12-claude-app-launch-readiness.md`; draft pull request 27 into `app/redesign-dev`

### Launch brief vs. project rules
- **Branch:** pull requests 25 and 26 are both open, so `app/launch-readiness` is cut from `app/visual-identity` (pull request 26's branch), as the brief's rule 9 says. Its draft pull request will show pull request 26's commits until that merges.
- **"Restore every changed string" against the design brief's "emoji out of the interface":** sixteen lone emoji that were pictures (hidden from screen readers) stay as line icons. They are not wording. Every word, and every emoji inside a sentence, is as it was. Recorded in `notes/LAUNCH-READINESS.md` and asked in `notes/CONTENT-REVIEW.md`.
- **Phase 0 restored four strings** the visual redesign had changed: "Check in" on Home's quick row (and removed the added "Hope box" tile), "Setup {done}/{total}", "{done}/{total}", and the spoken label "Quick actions".
- The brief's `design/after/` is `app/design/after/` (see "Design brief vs. project rules" below). `notes/DESIGN-BRIEF.md` does not exist; the design brief is `app/DESIGN-BRIEF.md`.

- **Crisis strip and the brief's rule 4 ("never restyle, shrink, or hide"):** two changes touched the strip, both to make it more reachable and neither changing how it looks at ordinary sizes: "call 911" got a 44-point minimum width, and the strip may no longer grow taller than the screen (it scrolls within itself at the phone's very largest text). Switching to the strip's short form at those sizes would hide words, so it was not done; it is in `notes/LAUNCH-BACKLOG.md`.
- **Inline crisis links against "every crisis element at least 44 by 44":** links inside a sentence ("call 988 … call 911") are text-height. Enlarging them would overlap neighboring links. They are recorded as such in the inventory and held to their current size; the strip's full-size controls are on the same screens.

- **"No new features" against a founder's request on November 12:** partway through the brief, the founder asked for the bottom tab bar on every page inside the app, because the website's pages (Get help, Not sure, For teens, and the rest) had none and so no way back. Done as its own commit between Phases 7 and 8. It adds no wording (the five tab names and the bar's spoken name are the existing ones), stores nothing, and sits at the bottom, away from the crisis strip. The public website is untouched: the bar is added only to the app's copy of each page.

### Resume instructions (launch brief)
Read `app/LAUNCH-BRIEF.md` section 0 first. Then start the first unchecked phase above, on `app/launch-readiness` (create it from `app/visual-identity` if it does not exist: `git switch -c app/launch-readiness`). Run `npm test` in `app/` and the four root checks at each phase end, commit, tick the box, and rewrite "Current step". Simulator runs: `npm run sim:launch` only (muted).

## Visual identity ("Dawn at the Shoreline") — in progress
A second brief from the same founder (`app/DESIGN-BRIEF.md`): a new look, visual layer only. Branch `app/visual-identity`, cut from `app/redesign-dev`; a draft pull request into `app/redesign-dev` at the end. Working in checkpoints: one commit per phase, this file updated each time, the full test suite only at the end of a phase.

- [x] V1 — Audit: 400 "before" pictures (not committed), `design/AUDIT.md`, `tools/screens.mjs`
- [x] V2 — Design tokens, Fraunces and Figtree bundled, raw-hex lint
- [x] V3 — The horizon component
- [x] V4 — Grain, illustration, icons (emoji out of the interface)
- [x] V5 — Components: buttons, surfaces, month dots in place of the streak card, chips, inputs, tab bar, review banner, crisis bar
- [x] V6 — Screen by screen, the player, the launch screen (sand, seen in the iPhone 17 Simulator)
- [x] V7 — Motion and haptics (one easing curve, fade and drift, Reduce Motion; no haptic on crisis controls)
- [x] V8 — Accessibility (crisis buttons turn light in dark mode; 44-point targets; Hope box overflow at largest text fixed)
- [x] V9 — Microcopy (decorative only; the table is in the pull request)
- [x] V10 — "After" pictures, comparison, checks, notes, draft pull request

### Automated runs make no sound (a founder's instruction, November 11, 2026)

The meditation voice guide was playing out loud during browser tests and Simulator checks. Every
automated run is now muted, without changing the app's own audio code:

- **Browser tests and tools** (`npm test`, `tools/screens.mjs`, `tools/word-count.mjs`): every
  browser is opened with `openBrowser()` from `test/quiet.mjs`. Chromium starts with
  `--mute-audio`, and every page gets a script that replaces text-to-speech with a silent stand-in
  (each line still starts, takes a moment, and ends), mutes recordings, and sends generated sound
  into a gain of zero. The lint fails if a test or tool opens a browser any other way.
- **iOS Simulator**: launch the app with `npm run sim:launch` (it passes `-TidelightQuiet YES`).
  A debug-only, Simulator-only hook in `TidelightPlugin.swift` then gives each page the same
  script. Without that argument, and in every release build, nothing changes. Do not launch the
  app in the Simulator any other way during an automated run. A unit test
  (`test/unit/quiet.test.mjs`) keeps the two copies of the script identical.
- The website's own checks in the repository's `tools/` were left alone: the website plays no sound.
- Checked: the script in muted desktop Chromium (speech stand-in, zero gain, muted media). In the
  iOS Simulator (iPhone 17), the debug build installs the script when launched with the argument
  and not without it (seen in the app's console). Not checked: the script's effect inside the
  Simulator's own web view, which nobody listened to. Not on a real phone.

### Design brief vs. project rules
- The brief's `design/` folder is `app/design/`: the repository's `design/` holds the website's original homepage design. The notes in it (`AUDIT.md`, `TOKENS.md`, `COMPARISON.md`, `README.md`) are committed; the pictures are not.
- "Launch the app in the Simulator (iPhone 17 and iPhone SE)": this Mac has no iPhone SE simulator, and driving every screen and state by hand in a simulator costs more than the usage allows. The pictures come from desktop Chromium at both phone sizes (`tools/screens.mjs`), with a few iPhone 17 Simulator pictures beside them. Said plainly wherever results are reported.

- Streaks (brief section 6.3 against "do not change copy awaiting review"): first built as "Days you checked in this month", which dropped the streak screens' wording. **A founder asked for the original wording back (follow-up 1), so the project rule won:** every streak line is as it was on `app/redesign-dev`; only the look changed (dots with a shape per state, never red; a line icon where the snowflake emoji stood alone; no burst at a milestone). The brief's "never a zero for a new user" is therefore not met: a first day reads "0 day streak", as before. It is a reviewer question.
- A finished quick check-in no longer returns Home by itself: the brief asks for the dawn, one line, and two choices ("Breathe for a minute", "Back to home").
- The confetti burst (`celebrate.js`) is removed: the brief says no confetti. Completion is the dawn. On a day with a very low check-in there is no dawn either.
- Mood choices are a tone and a word (no faces). Emoji used alone as pictures became line icons; the one emoji inside a sentence awaiting review was left.
- Coral and the faint ink were darkened from the brief's values to pass contrast. Not added because they would be new features: seek buttons in the player, filter chips on Meditate, initials avatars for friends.
- The old Splash image set is still in the iOS project, unused; it was not deleted.

### Results (visual identity)
- `npm test` in `app/` (before the follow-ups): lint clean; 92 unit tests, then 5, 180, 56, and 837 browser checks, 0 failed.
  Desktop Chromium with stand-ins for the phone, muted. Not a phone.
- New tests cover: crisis controls at 7 to 1 in light and dark, with no texture or animation; both
  fonts loading from the app's own files with no outside request; Reduce Motion; no dawn and no
  horizon after a very low check-in; no haptic on crisis controls; no sideways scrolling at the largest text, Hope box included.
- iOS Simulator (iPhone 17, launched muted): the app compiles; the launch screen is sand with no
  white flash; Home and Meditate look as in the pictures, with both fonts. Nothing else was
  walked through there. Nobody listened to confirm the Simulator is silent.
- Pictures: 400 "before" and 400 "after" from desktop Chromium at two phone sizes, light and dark,
  English and Spanish, and the largest text. Looked at as contact sheets, not one by one.
- Root checks (`check_site.py`, `test_browser.py`, `test_webkit.py`, `make_review_packet.py`):
  all four pass. `check_site.py`: 21 pages, all checks passed. `test_browser.py`: all passed (desktop Chrome and its phone-size emulation). `test_webkit.py`: 207 checks in WebKit on a Mac, 0 problems (not iOS Safari). The review packet was rebuilt.
- **Not checked:** a real phone; VoiceOver by ear; haptics; an iPhone SE simulator (this Mac has none).

### Follow-ups on pull request 26 (a founder's four requests, November 11, 2026)
1. **Streak wording restored**; visual change only. Noted in `notes/CONTENT-REVIEW.md`.
2. **Location and Friends:** short sections under their existing headings, with more room, and "Learn more" rows (`src/ui/sections.js`). No word changed or left the page. **A second instruction from the founder narrowed this:** all privacy and consent wording stays in view, always (what is stored, where data stays, who gets a message, that a sent message can't be undone); only plain how-to text folds. Folded, and nothing else: in Places, the how-to under "Your places" ("Add a place by choosing it on a map, or by searching an address. Give it a name only you need to understand, and choose how close counts."); in My circle, the how-to before "What I've shared with my circle" ("To share something, tap Share on a check-in, a journal entry, or something you kept, then choose \"Send to my circle\"."). The first version also folded three privacy paragraphs in Places and four My circle points; those are back in view.
3. **Daily check-in, first question:** tiles two across, one list at large text. The page has nine feelings, not ten; all nine are there in the same order with the same values.
4. **Tab bar:** the shell hides the labels (kept for screen readers) when any label can't fit its tab with a little room, and shows them again when they can. Tabs keep their 44-point targets.
Checked: `npm test`: lint clean; 92 unit tests; 5, 180, 56, and 889 browser checks; 0 failed (desktop Chromium with stand-ins, muted). New checks cover the restored streak screens, the "Learn more" rows (closed to begin with, no control or 988/911 line inside, opening changes no words), the nine tiles in their order, and the icons-only tab bar with 44-point targets and spoken names. The small-phone pictures were looked at for the four changes. Not on a real phone. After the second instruction (privacy and consent wording always in view): 92 unit tests and 5, 180, 56, and 900 browser checks, 0 failed. Rebuilt in the iPhone 17 Simulator and launched muted; Home, Check-in, Location, Friends, and Get Support were pictured in light and dark mode.

### Copy changes (visual identity)
Changed: nothing (the two changed lines were restored in the launch brief's Phase 0).
New: "Get help" (a Home tile), "Breathe for a minute", "Back to home", "{time} left", "Tidelight" (above the welcome heading), "Get Support Now" (first in Settings; the same words as the header button), "Learn more" (rows on Location and Friends).
Emoji used alone as pictures became line icons (the choice cards, and the snowflake and tick in the streak row and legend). Emoji inside sentences are untouched.
No streak, crisis, consent, privacy, or review-notice wording changed.

### Resume instructions (visual identity)
Nothing is in progress. If picking this up again: read the pull request's comments first. Likely next steps are a real-phone pass with `TESTING_CHECKLIST.md`, the reviewer's answers to "Questions about the app's visual redesign" in `notes/CONTENT-REVIEW.md`, and then either removing the stored streak numbers or bringing a reviewed streak display back. Start the Simulator only with `npm run sim:launch`.

## Completed phases
- [x] Phase 0 — Audit & foundation (merged to app/redesign-dev)
- [x] Phase 1 — Design system & bottom tab navigation (merged to app/redesign-dev)
- [x] Phase 2 — Onboarding, setup checklist & check-in settings (merged to app/redesign-dev)
- [x] Phase 3 — Streaks (merged to app/redesign-dev)
- [x] Phase 4 — Interactive meditation engine (merged to app/redesign-dev)
- [x] Phase 5 — Meditation types & smart suggestions (merged to app/redesign-dev)
- [x] Phase 6 — Custom meditation builder (merged to app/redesign-dev)
- [x] Phase 7 — Haptics & interaction polish (merged to app/redesign-dev)
- [x] Phase 8 — Final QA & handoff (merged to app/redesign-dev)

## Remaining
- Nothing to build. For people: a real-phone pass (`TESTING_CHECKLIST.md`), the reviewer's and the lawyer's answers (`notes/CONTENT-REVIEW.md`), and both founders' decision on whether to keep this direction.

## A founder's safety rules (November 11, 2026). They override the build spec
1. Never remove, shorten, hide, or move behind a tap any safety feature: the "In immediate danger, call 911" banner, the Exit button, "Get Support Now", any crisis line (e.g. 988), the "Draft for review" notices, or the Spanish link. The 50% text cut does not apply to these. They stay visible on every screen where they appear now.
2. If a check-in shows very low mood or distress, show crisis support options right away instead of just logging it.
3. Streaks: no streak, celebration, or "you missed a day" message ever appears in or near crisis or support screens. Keep all streak language gentle. Make streaks a setting users can turn off.
4. Notifications and the lock screen must be discreet. Never mention suicide, crisis, or mood in notification text (e.g. "Time for your check-in").
5. Mark all new user-facing wellness copy and meditation scripts as "Draft for review" using the existing review system, the same way current pages are marked.
6. Location data stays on the device and is used only for the features described.

## Phase 0 audit: what the app was before the redesign
- **Stack:** Capacitor 7 with plain HTML, CSS, and JavaScript. No framework, no router, no state library. `tools/build.mjs` copies the website into `www/` and adds the app's word blocks to the Daily check-in page (English and Spanish); esbuild bundles `src/app.js`.
- **Navigation:** one long page per language. The website's own tab row (Today, Rediscover, Journal, Hope box, Your journey, Support) shows one panel at a time.
- **State:** the website's `assets/check-in.js` holds the check-in in memory and offers `window.TidelightCheckIn`; `src/app.js` saves it and everything else.
- **Storage:** Capacitor Preferences (localStorage in a desktop browser), keys `tidelight.checkin.v1`, `agegroup.v1`, `textsize.v1`, `log.v1`, `reminders.v1`, `places.v1`, `hope.v1`, `circle.v1`, plus an IndexedDB store for Hope box photos.
- **Features found:** age setup and age-based boxes; the five-question Daily check-in with suggestions; Rediscover; Journal; Hope box; Your journey (calendar, today's check-ins, kept lists, four reminders, Places that are hard for me, age group, My circle, Delete everything); share panel; place alert screen; the crisis strip, Quick exit, "Get Support Now", the 988 panel, and the Spanish twin page.
- **Tests before:** 5 logic, 194 app, 56 extras checks in desktop Chromium. No linter, no unit-test runner.
- **Blockers fixed in Phase 0:** no storage layer (added `src/core/storage.js` with a schema version and migrations); no config module (added `src/core/config.js`); no lint or unit-test runner (added `tools/lint.mjs` and Node's own test runner, both inside `npm test`, which GitHub already runs).
- **Logged, not fixed:** the app starts on the website's Home page, not the app screen (Phase 1 sets the start path); `src/extras.js` keeps its own copies of the load and save helpers (left alone: it is the other founder's file); two separate lists of people (Places and My circle).
- **Words on screen before the redesign** (desktop Chromium, 390 by 844, all visible text on the page): first open 720; Today 674; first question 701; result 881; Rediscover 726; Journal 681; Hope box 768; Your journey 1,336; Your journey with Places on 1,788.

## Phase 1 record
- **Plan:** tokens in `src/tokens.css`; components and shell in `src/redesign.css`, `src/ui/components.js`, `src/ui/shell.js`; words in `src/text/redesign.en.html` and `redesign.es.html`; `tools/build-redesign.mjs` adds them to the app's page. Risk: the website's own button and heading styles win over new ones (fixed by scoping the new rules under `html.tl`).
- **Where the older sections went:** Home (new). Check-in tab: Daily check-in, Journal, Rediscover, Hope box, Your journey, each opened from a card, with the older row of tabs kept inside. Location tab: Places that are hard for me. Friends tab: My circle, and a card to Share check-ins. Settings (gear on Home): the age group and text size, and a card to Delete everything (which stays in Your journey, as the privacy notice says). Meditate: an empty state until Phase 5.
- **Text diet, words on screen** (`node tools/word-count.mjs`; desktop Chromium, 390 by 844). The safety frame, about 600 words, is on every screen in full and is not part of the diet.

| Screen now | Words on the screen itself | Before, without the safety frame (estimate) | Change |
| --- | --- | --- | --- |
| Home | 17 | 128 (Today) | 87% fewer |
| Check-in | 29 | 128 (Today) | 77% fewer |
| Meditate | 12 | new | |
| Location, Places off | 137 | part of Your journey, 790 | 83% fewer than Your journey |
| Friends, My circle | 204 | part of Your journey, 790 | 74% fewer than Your journey |
| Settings | 111 | part of Your journey, 790 | 86% fewer than Your journey |
| Your journey | 348 | 790 | 56% fewer |
| Daily check-in, first question | 123 | 155 | 21% fewer |
| Journal | 103 | 135 | 24% fewer |
| Rediscover | 148 | 180 | 18% fewer |
| Hope box | 190 | 222 | 14% fewer |

  The four older sections at the bottom did not reach 50%. Their words are the website's own (shared with its review packet) or are consent, privacy, and crisis wording, which the founder's rule 1 protects. Cutting them is a decision for the founders and the reviewer, not for this build.

## Phase 2 record
- **Plan:** pure logic in `src/logic/spread.js` (time spreading, reminder plan), `checklist.js`, `style-profile.js`; screens in `src/ui/onboarding.js`, `checkin.js`, `setup.js`, `settings.js`, `reminders.js`; one state holder `src/ui/state.js`; the phone's part in `src/ui/device.js` and four new methods in the Swift plugin. Risks: permissions can't be exercised in Chromium (stand-ins only), and the Swift additions are uncompiled until the Simulator build in Phase 8.
- **Saved under:** `tidelight.settings` (check-ins per day, wake and sleep, style, reminders, custom times, meditation defaults, haptics, reduce motion, streaks on), `tidelight.profile` (name), `tidelight.onboarding`, `tidelight.home` (one spot). Schema version 2.
- **Spanish:** `src/text/redesign.es.html` is made from the English blocks and `src/text/redesign.es.json` by `npm run words:es`, so the two can't drift apart. Crisis sentences are whole-line entries copied from the existing Spanish pages (press 2; text AYUDA).

## Phase 3 record
- **Plan:** pure logic in `src/logic/streaks.js`, on local "YYYY-MM-DD" keys, with every case in the spec's 3D as a unit test (`test/unit/streaks.test.mjs`, 21 tests); screens in `src/ui/streaks-ui.js`; one shared celebration in `src/ui/celebrate.js`. Saved under `tidelight.days` and `tidelight.streak`. Risk: streaks for people at risk; see the reviewer's questions in `notes/CONTENT-REVIEW.md`.
- **How it settles days:** each ended day is settled once as complete, frozen, or missed, in order, when the app opens, returns to the front, or records activity. The streak is read from those records, so working it out twice changes nothing.

## Phase 4 record
- **Plan:** `src/logic/timeline.js` owns the clock (monotonic, handed in) and reports segment, breath phase, and progress; `src/logic/meditations.js` holds meditations as data, the audio rules, the voice fallback, the session record, and the 60% rule; `src/ui/player.js` runs five layers that only listen to the timeline: `worlds.js` (canvas scenes), the breathing guide, the voice, `audio.js` (ambient), and haptic breathing. Risks: sound, speech, haptics, and screen wake can't be judged in Chromium; they are stand-ins there.
- **Words:** voice lines are `script.<id>` and on-screen lines `screen.<id>` in `src/text/redesign.en.html`, each in a Calm and a Straightforward voice where they differ.
- **Recordings:** a voice clip is `app/assets/voice/<language>/<scriptId>_<style>.mp3` (for example `app/assets/voice/en/intro.deep_calm.mp3`). The build lists what exists; anything missing is spoken by the phone's text-to-speech. Ambient loops are `app/assets/ambient/rain.mp3` and `ocean.mp3`.

## Phase 5 record
- **Plan:** `src/logic/suggest.js` (one pure function, rules in order, unit tested rule by rule) and `src/ui/meditate.js` (the tab: suggestion, four type cards, presets, Build your own, History). The four types are data from `builtIn()` in `src/logic/meditations.js`. Developer tools can pretend the time, headphones, and "at home" to see each rule. `src/logic/generate.js` and its tests (Phase 6's generator) were written alongside and are already in.

## Phase 6 record
- **Plan:** `src/logic/generate.js` is the spec's algorithm as a pure function, tested over every length from 1 to 30, every situation, with and without a body scan (300 combinations): exact total, whole breaths, no empty segment, and the Stressed, Energize, and Sleep rules. `src/ui/builder.js` is the screen and presets (`tidelight.presets`, choices only).

## Phase 7 record
- **Plan:** one helper (`src/ui/haptics.js`) over a pure pattern table and throttle (`src/logic/haptic-patterns.js`, unit tested); `src/ui/feel.js` wires taps and switches for every screen by delegation. Felt on a phone only: Chromium records the calls, nothing more.
- **Every interaction that changed, and its haptic** (Calm / Straightforward):

| Interaction | Pattern | Where it is wired |
| --- | --- | --- |
| Every button and card (`.tl-btn`, `.tl-icon-btn`, `.tl-card-action`, the player's chips) | `tap` (light / light) | `feel.js` |
| Tab bar | `select` | `shell.js` |
| Mood faces, tag chips, style and situation cards, length, sound and world chips | `select` | `components.js` (choiceGroup) |
| Stepper (check-ins per day) | `sliderTick` (very light / light) | `components.js` (stepper) |
| Builder's length slider: each whole minute | `sliderTick`; at 5, 10, 15, 20, 25, 30 `sliderTickStrong` | `builder.js` |
| Every switch (Settings, builder, reminders) | `toggle` (light / medium) | `feel.js`, `settings.js`, `builder.js` |
| Player's sound, voice, and haptics switches | `toggle` | `player.js` |
| Check-in done (not after a very low mood) | `success` | `checkin.js` |
| Meditation done (not on a quiet day) | `success` | `player.js` |
| Setup complete, a saved home spot, a saved or kept preset, onboarding finished, reminders turned on | `success` | `setup.js`, `settings.js`, `builder.js`, `onboarding.js` |
| Streak milestone | `milestone` (three pulses) | `streaks-ui.js` |
| Onboarding page changes, forward and back | `select` | `onboarding.js` |
| "End session?", deleting a preset, clearing the home spot | `warning` | `player.js`, `builder.js`, `settings.js` |
| Haptic breathing during a session | rising pulses on the inhale, one light tick on a hold, fading pulses and a soft tap on the exhale | `player.js` |
| Pull-to-refresh | not used anywhere, so nothing to wire | |

- **Motion:** every tappable control scales to 0.96 on press and springs back; screens fade (Calm) or slide (Straightforward) at the style's speed; the streak number counts up; the setup ring and the slider's number move with their values; a shimmer stands in for the suggestion while it is worked out; one shared celebration (`celebrate.js`). Reduce Motion (the phone's setting or the app's) turns all of it into still or fading changes.
- **Performance and battery:** screens that aren't showing are `display: none`, so their CSS animations don't run; the player's frame loop, the builder's preview, and the celebration stop when their screen is left; haptics never fire while the app is in the background, and haptic breathing only during a session that is playing. In desktop Chromium the player drew about 60 frames a second. Not profiled on a phone.

## Phase 8 record
- **Tests, last full run:** 1095 checks, 0 failed. Unit tests (Node's runner): 88. Older logic test: 5. App browser test: 180. Hope box and My circle browser test: 56. Redesign browser test: 766, which includes an accessibility sweep of every screen (each control has a spoken name, each new control is at least 44 points, no sideways scrolling) in light mode and in dark mode at 135% text on a 375-point screen. All in **desktop Chromium, with stand-ins for everything a phone does**.
- **The website's own checks** (one website file changed): `python3 tools/check_site.py` passed. `tools/test_browser.py` (desktop Chrome and its phone-size emulation): 6,034 checks passed. `tools/test_webkit.py` (WebKit in a window on this Mac, not iOS Safari): 207 checks, 0 problems. `tools/make_review_packet.py` and `npm run words` were rerun; the app words packet has 1,521 numbered lines.
- **iOS Simulator** (iPhone 17, iOS 27.2, a debug build from Xcode; the Swift additions compile with no warnings of their own): the app opens on its own screen, not the website's Home; onboarding pages, Home with the tab bar above the home indicator, and a Silent session drawing the ocean were seen. Two problems were found there and fixed: the first line of the crisis strip sat under the status bar on every page of the app (now below it, on all pages), and two quick taps zoomed the page and could slide the strip out of view (now prevented; pinch-to-zoom still works). **Not exercised in the Simulator:** the permission questions, reminders arriving, sound, speech, haptics, Spanish, dark mode, a session to its end.
- **A real phone:** nothing. **Android:** nothing; this Mac has no Android tools.
- **Data from before the redesign:** covered by a browser test that starts from the older stored shapes (age group, four reminders, check-in log, journal, kept lists) and by unit tests of migration 2.
- **Clean-up:** unused exports removed; no console output in app code (the lint enforces it); a bug found in review was fixed (the "quiet day" used an unpadded date in one place, so on a day of the month under 10 a very low check-in would not have silenced celebrations; it is now one key, kept on the phone, with a test).
- **Words on screen, final count** (`node tools/word-count.mjs`):

Safety frame, kept in full on every screen: about 597 words.

| Screen now | Words on the screen itself | With the safety frame |
| --- | --- | --- |
| Onboarding: welcome | 13 | 610 |
| Onboarding: age | 152 | 749 |
| Onboarding: name | 21 | 618 |
| Onboarding: count | 20 | 617 |
| Onboarding: times | 25 | 622 |
| Onboarding: style | 23 | 620 |
| Onboarding: location | 44 | 641 |
| Onboarding: notifications | 29 | 626 |
| Onboarding: done | 12 | 609 |
| Home | 45 | 647 |
| Check-in | 43 | 645 |
| Meditate | 83 | 685 |
| Location (Places off) | 143 | 745 |
| Friends (My circle) | 204 | 806 |
| Settings | 282 | 884 |
| Daily check-in, first question | 111 | 713 |
| Journal | 103 | 705 |
| Rediscover | 148 | 750 |
| Hope box | 190 | 792 |
| Your journey | 297 | 899 |

| Screen before the redesign | Whole page | Without the safety frame (estimate) |
| --- | --- | --- |
| First open (age question) | 720 | 179 |
| Today | 674 | 133 |
| Check-in, first question | 701 | 160 |
| Check-in, result | 881 | 340 |
| Rediscover | 726 | 185 |
| Journal | 681 | 140 |
| Hope box | 768 | 227 |
| Your journey (reminders, places, circle, settings) | 1336 | 795 |
| Your journey with Places turned on | 1788 | 1247 |

## Decisions made
- Kept Capacitor, HTML, CSS, and JavaScript — the brief from the founder's session says not to port, and the reviewed words stay in one place.
- Integration branch is `app/redesign-dev`, cut from pull request 19's branch with pull requests 20 and 21 merged in; phases are `feature/p*` branches merged back with merge commits — `main` publishes the website, so the spec's `dev` from `main` can't be used.
- Included pull request 21 (My circle and Hope box, the other founder's draft) — it sits directly on pull request 20, the Friends tab needs it, and leaving it out would guarantee a conflict later. Its files are changed as little as possible.
- The spec's files live in `app/` (`CLAUDE.md`, `PROGRESS.md`, `TESTING_CHECKLIST.md`, `CHANGELOG.md`, `BUILD-SPEC.md`) — the root `CLAUDE.md` is the founders' shared file.
- No TypeScript and no ESLint — the project has neither, and the spec says to avoid new dependencies. `tools/lint.mjs` checks that scripts parse, that app code has no console output, outside addresses, or ways to send data, that redesign styles use tokens only, and that English and Spanish word sources match.
- Unit tests use Node's built-in runner (`node --test`) — no new dependency.
- Migration 2 (the four older reminders become "N check-ins a day" at the same times) ships with the storage layer in Phase 0; the old key is left in place.
- Developer notes are kept in memory only (`src/core/dev.js`), never printed or stored — the lint forbids console output in app code.
- Safety frame: the crisis strip, Exit, the header with "Get Support Now", the Spanish link, the full "Draft for review" notice, the privacy notice, the Support section, and the 988 panel stay on every screen, in the page's normal flow, exactly as worded now. New screens are added between the Spanish link and the notice. (Founder's rule 1.)

- Text diet: no consent, privacy, or crisis sentence was collapsed or cut in Places, My circle, sharing, or age setup. The cut comes from giving each section its own screen. Explanations that open on a tap (`.tl-more`) are reserved for new, non-safety words — founder's rule 1 forbids moving safety text behind a tap, and most of that older text is about consent.
- Pill buttons and rounded cards in the new screens, although the website chose square buttons on November 9 — the build spec, from a founder, asks for pills in the app. The website and the older sections keep square buttons.
- The page's background uses the new `bg` token; the older sections otherwise keep the website's Shoreline colors and its dark mode — changing more risks the contrast of reviewed pages.
- The Location tab is labeled "Location" (spec) and its screen is titled "Places". One sentence in the place alert now says "on the Location tab" instead of "in Your journey", because that section moved.
- The app now starts on the app screen (`server.appStartPath` in `capacitor.config.json`), not the website's Home page. To check in the Simulator.
- Tabs have no browser-history entries; each pushed screen has a visible Back button. Android's hardware back button is untested.
- On iPhone the new screens follow the phone's text size (`font: -apple-system-body`), unless the app's own "larger text" is on. Chromium can't show this; to check in the Simulator and on a phone.

- Onboarding keeps the date of birth as its second page and it can't be skipped — the project's November 9 decision makes the age group required; the spec's "Skip on every page" loses. People who already gave it aren't asked again.
- Onboarding, the check-in, the setup list, and celebrations are ordinary screens in the page, never sheets or overlays — an overlay would cover Get Support Now, the Spanish link, and the review notices (founder's rule 1). The setup list opens in place under its ring.
- Check-in times sit in the middle of equal shares of the waking day, rounded to 5 minutes (3 a day, 7:00 to 22:00, gives 9:30, 14:30, 19:30).
- Reminders are dated notifications for up to 14 days (at most 60 pending), set again whenever the app opens, a check-in is done, or a setting changes. After k check-ins today, the first k of today's times are dropped. If the app isn't opened for two weeks, reminders stop on their own — a nudge that fades rather than nags; a question for the reviewer.
- Reminder words: Calm keeps the existing "A moment to check in, if you'd like."; Straightforward says "Time for your check-in." (the founder's model). No emoji, nothing about mood or the person (rule 4). The spec's "Time for a gentle check-in 🌊" and "Check-in time." were not used.
- The four older reminders (morning, midday, after school, before bed) became "N check-ins a day"; migration 2 carries over the ones that were on, at their times. Their section in Your journey and its hint on Today are gone; Settings has them now.
- The quick check-in is new; the five-question Daily check-in is unchanged and both count as a check-in. Reworking the five questions would change the website's page.
- Very low mood (rule 2): moods 1 and 2 of 5 show Call 988, Text 988, and Call 911 at once, in place of the thanks line, and the screen stays until the person leaves it. In the Daily check-in, the feelings overwhelmed, sad, anxious, disconnected, and exhausted show a support block at the top of the results. Which moods and feelings should do this is a question for the reviewer. Nothing typed is read, and there is no score.
- A very low check-in makes the rest of that day "quiet": no celebration, no milestone, no "new start" card (rule 3).
- The five moods are line-drawn faces with a word under each, not emoji — shape and words carry the meaning, not color.
- A check-in's note shows in the person's own list and is never part of "Share today's check-ins".
- Delete everything now also removes the name, the home spot, the streak, and meditation history, and its note says so. Your journey's note no longer says "There are no streaks or scores", because there are streaks now; it says "Nothing here is scored."
- Location for the home spot asks for "while using the app" only, reads one location when asked, and keeps one spot on the phone. The iPhone permission sentence in `Info.plist` now covers it. For a lawyer to read.
- The website's `assets/check-in.js` gained one app-only method, `addCheckIn`, so a quick check-in marks the calendar without touching what's typed elsewhere. The website never calls it.
- "Notifications enabled" on the setup list means the phone allows them and reminders are switched on.
- Haptics, keep-awake, one-shot location, and the audio route are four small methods added to the project's own Swift plugin, with `navigator.vibrate` and the Wake Lock API as fallbacks — no new packages, so no CocoaPods change. Android has no native part and uses the fallbacks.

- Frozen days count toward the streak number, as the spec's definition says ("consecutive complete (or frozen) days").
- A freeze is never spent when there is no streak to protect, and a new install starts with one freeze.
- A calendar day skipped in under 26 hours of real time (a long flight east) is frozen at no cost instead of counted as missed; flying west settles nothing twice.
- Check-ins from before streaks existed become day records the first time, so history isn't lost.
- Milestones are a card at the top of Home with a short burst confined to the app's area, not a full-screen takeover — a takeover would cover the safety frame (founder's rule 1). On a day with a very low check-in, or with streaks off, a milestone passes silently and isn't shown later (rule 3).
- The "new start" card never shows on a day with a very low check-in; it waits for another day. Missed days are called "rest days" on screen.
- Streaks can be turned off in Settings (rule 3). Days are still recorded quietly, so turning them back on loses nothing.
- The streak card sits on Home only. Home's own page still ends with the Support section and the 988 panel, as every page does; the card is at the top and they are at the bottom, more than a screen apart. Whether that is far enough is a question for the reviewer.

- The player is a screen in the page that fills the space under the crisis strip, not a layer over everything — Call 988, Text 988, Call 911, and Exit stay on screen during a session, the stage carries its own "Get Support Now" and "Draft for review", and the rest of the safety frame is in the page below (founder's rule 1). "Get Support Now" pauses the session first.
- Sleep has no completion screen, as the spec says: the stage dims over the last minute and stays dark; a tap brings the controls to leave. The crisis strip stays lit above it. A question for the reviewer.
- A very low mood on the completion screen shows Call 988, Text 988, and Call 911 at once, in place of "Well done" (rule 2 applied to the mood pick after a session).
- Haptics can't run with the screen locked from a web view, so the screen is kept awake during a session (the plugin's `setKeepAwake`, with the Wake Lock API as a fallback) and Sleep dims it instead.
- When the app is in the background the page's clock can stop; on return, the time missed is added back, and a once-a-second heartbeat keeps time when frames stop.
- Rain and ocean are made-in-code stand-ins (filtered noise, and noise with a slow swell) until real loops are added. White and brown noise are made in code for good. Every loop is blended across its join.
- The phone's silent switch is left to the phone: nothing overrides it. iPhone doesn't tell an app whether it is on.
- The worlds' colors are scene art in `src/ui/worlds.js`, not interface tokens.
- The breathing guide's countdown is one setting ("Count each breath"), off to start in both styles.

- iPhone never tells an app whether its silent switch is on, so "silent" is unknown there. At home, unknown counts as "sound is fine" (rule 2 can match), because the phone's own switch still silences the app.
- "Near home" reads the phone's location once, only while Home or Meditate is open, at most every ten minutes, and only if a home spot is saved and location is allowed. Otherwise the location rule is skipped without a word.
- A type's options (world, sound) open in place under its card, from an "Options" button or a long press — a sheet would cover the safety frame, and a long press alone can't be reached with a screen reader.
- When the suggested type was already done today, the next rule that fits is used, then any type not done yet. Sleep is never suggested outside its hours.
- Voice and haptic breathing in Settings act as master switches: off there means off for every session, whatever the type's default.

- Sessions of 1 and 2 minutes use an intro and outro of 10% and 8% of the time (at least 5 seconds each) instead of the 20- and 15-second floors, so breathing still fits. From 3 minutes the spec's clamps apply.
- Breathing time is split by time (60/40, or 40/30/30) and each part is filled with whole breaths; seconds no whole breath can use go to the last silence, or to the outro when there is no silence, so the total is exact.
- Stressed alternates 4 breaths of 4-7-8 with 4 breaths of 4-0-6-0 for the whole session. Energize uses 4-0-2-0 for at most 120 seconds in all. Sleep's exhale is 8, then 9, then 10, a third of the breathing time each.
- The builder's voice guide starts off, whatever the setting, so a new custom session is silent unless the person turns sound on ("works silently").
- The two starter presets ("Bus ride", "Before bed") show as suggestions only while there are no presets; keeping one saves it.
- "Save as favorite" on the completion screen saves a preset: the type and length for a built-in, the choices for a custom one.
- Preset options (rename, edit, duplicate, delete) open in place under "More", and Delete asks first, in place.
- The builder's fifth situation is labeled "Sleepy" on its card, so the Spanish word for the Sleep type and for the feeling can differ.

- The global Haptics setting silences every pattern except haptic breathing, which follows its own switch (Settings, the builder, and the player), as the spec says.
- Haptics on iPhone come from the project's own plugin; on Android the browser's `navigator.vibrate` stands in, which can't vary strength — a known difference to hear about from an Android phone.

- Every page in the app (the website's pages too) now runs edge to edge with its crisis strip pushed below the iPhone status bar (`src/app-safe-area.css`, added by the build). Before this, the strip's first line was under the status bar in the Simulator.
- The safety frame takes roughly the top 40% of an iPhone 17 screen before the new part of a screen begins (crisis strip, header with Get Support Now, the Spanish link). That is the cost of the founder's rule 1; shrinking any of it is a founders' decision.

- `npm run test:unit` names the test files (`test/unit/*.test.mjs`) instead of the folder — GitHub's runner has Node 24, where `node --test` doesn't take a folder; this Mac's Node 26 does. Found on the pull request's first complete run.

## Known bugs / TODOs
- The app shows a blank screen for a moment at launch in the Simulator's debug build, before the first page — measure on a phone against the spec's 2 seconds — `ios/App/App/Base.lproj/LaunchScreen.storyboard`, `src/app.js` — medium.
- The Simulator kept the age group from an earlier install after the app was deleted (a Simulator habit with stored preferences), so a truly fresh first launch with the date-of-birth page was seen only in Chromium — low.
- Two lists of people (Places and My circle) still exist — noted in pull request 21 — low.
- Frame rate and battery during a long session are unmeasured on a phone — `src/ui/player.js`, `src/ui/worlds.js` — medium.
- Text-to-speech voice quality, the audio session while the phone is locked, and whether sound continues in the background are unknown until a real phone — `src/ui/audio.js` — medium.
- The Swift additions in `ios/App/App/TidelightPlugin.swift` are not compiled yet — to build in the Simulator in Phase 8 — high until done.
- Android hardware Back inside tabs — `src/ui/shell.js` — low (untested; no Android toolchain on this Mac).

## Assets needed from the human
All optional: the app works without them (text-to-speech and made-in-code sound stand in). Each must be royalty-free or licensed, and each voice line is unreviewed draft wording until the reviewer has read `src/text/redesign.en.html`.
- `app/assets/ambient/rain.mp3` — a rain loop, 20 to 60 seconds, that can repeat — put it in `app/assets/ambient/`
- `app/assets/ambient/ocean.mp3` — an ocean loop, 20 to 60 seconds — put it in `app/assets/ambient/`
- `app/assets/voice/en/<scriptId>_<style>.mp3` and `app/assets/voice/es/...` — voice recordings, one per script and style. Scripts: `intro.quick`, `outro.quick`, `intro.deep`, `bodyScan`, `outro.deep`, `intro.sleep`, `bodyScan.sleep`, `intro.custom`, `outro.custom`. Styles: `calm`, `straightforward`. Example: `app/assets/voice/en/intro.deep_calm.mp3`. The words to record are the `script.*` lines in `app/src/text/redesign.en.html` (Spanish in `redesign.es.json`).

## Resume instructions
All nine phases are done and merged into `app/redesign-dev` (draft pull request 25 into `app/first-build`). Do not start another phase. If asked to continue this work:
1. Fetch, then check that pull requests 19, 20, 21, and 25 haven't moved; merge their bases in if they have (never force-push, never touch `main` or `app/first-build`).
2. Run `npm test` in `app/` and `python3 tools/check_site.py` before any push.
3. Take changes from people in this order: the founders' decision on direction, the reviewer's answers to `notes/CONTENT-REVIEW.md`, the lawyer's on location and ages, then findings from `TESTING_CHECKLIST.md` on a real phone.
4. Words change in `src/text/redesign.en.html` and `src/text/redesign.es.json` only, then `npm run words:es` and `npm run words`.

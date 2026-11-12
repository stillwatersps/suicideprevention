---
aliases: [Founder summary, Launch summary]
status: DRAFT, written by an AI assistant for both founders. One page
---

# Founder summary: where the phone app stands

[[00 START HERE|Back to Start Here]]

November 12, 2026, after the launch readiness work on the branch `app/launch-readiness` (draft
pull request 27 into `app/redesign-dev`; **not merged, not on the public website, not in any app
store**). Detail and evidence: [[LAUNCH-READINESS]].

## What's ready

- **Crisis help can't quietly break.** Call 988, Text 988, Call 911, Quick exit, and Get Support
  Now are checked on all 37 screens and states, in both languages, at every text size, on every
  test run. Twelve real faults were found and fixed along the way, including a blank app after
  Quick exit, a 911 link that couldn't be reached in Spanish at the largest text, and a crisis
  strip that was nearly unreadable in one dark-mode case.
- **Every written safety rule has a test** (25 rules), and the wording a reviewer will see is
  locked: a test fails if a reviewed line changes.
- **Accessibility:** no serious finding from the automated audit, in light and dark. The app
  follows the phone's text size.
- **Nothing leaves the phone.** A test walks every screen with the network blocked: 0 attempts.
- **It survives bad data:** damaged, huge, or old stored data still opens to a real screen with
  crisis help working.
- **The tab bar is on every page inside the app**, including Get Help, Not sure, and the
  website's other pages, so there is always a way back.
- **Documents for the people you need:** [[REVIEWER-PACKET]], [[LEGAL-PACKET]],
  [[APP-STORE-READINESS]], [[PRIVACY-INVENTORY]].

## What's blocked, and on whom

| Blocked | Waiting on |
| --- | --- |
| Every word in the app. An AI wrote it; nobody qualified has read it | **A licensed suicide prevention reviewer** (not found yet) |
| The Spanish | **A fluent Spanish reader** |
| A privacy policy, terms, the ages question, who the publisher is | **A lawyer** |
| Whether under-13s are included; whether streaks and the location feature ship; one build spec only one founder has seen | **Both founders** |
| Running on a real iPhone; TestFlight; the App Store | **An Apple Developer account** and a phone |
| Recorded meditation voice, final icon | **Founders** (assets) |

## Top 10 risks, most serious first

1. **Unreviewed clinical wording reaches someone in crisis.** The app says "Draft for review" on
   every screen, but the repository is public and the app could be built by anyone.
2. **Streaks, milestones, and a "dawn" reward in a suicide prevention app.** They may add pressure
   or a sense of failure. The reviewer may say to remove them.
3. **Minors, with no legal advice.** A date of birth is asked and children under 13 are let in.
4. **The location feature fails silently** (phone off, no signal) and someone relies on it.
5. **It has never run on a real phone.** Calls, texts, notifications, background location, the
   photo chooser, and VoiceOver are all untested where it counts.
6. **No privacy policy, and promises on screen** ("never", "on this phone only") that the phone's
   own backup complicates.
7. **Apple may reject it**: a health app from individuals, calling its own content a draft, built
   from web pages, asking for "Always" location.
8. **The crisis strip at the largest text sizes** takes half the screen or more. Left alone on
   purpose; it needs a decision.
9. **Spanish wording errors** in a crisis context, found by nobody because nobody fluent has read it.
10. **One founder hasn't seen the build spec or the design brief** this app follows.

## Recommended next steps, in order

| # | Step | Who | Time |
| --- | --- | --- | --- |
| 1 | Both founders read this page and [[LAUNCH-READINESS]]'s summary, and agree on ages, streaks, and the location feature | Both founders | 1 to 2 hours |
| 2 | Find a licensed reviewer and send [[REVIEWER-PACKET]] with its pictures | Founders | Days to weeks to find; about 2 hours of their time |
| 3 | Find a lawyer and send [[LEGAL-PACKET]] | Founders | Days to weeks; 1 to 2 hours of their time to start |
| 4 | Run the app on your own iPhone and work through `app/TESTING_CHECKLIST.md` | Either founder | 2 to 3 hours |
| 5 | Review pull requests 25, 26, and this one, in that order | Both founders | 1 to 2 hours |
| 6 | Apply the reviewer's and lawyer's changes; remove "Draft for review" only where approved | Founders, with Claude | 1 to 3 days |
| 7 | Find a fluent Spanish reader, or plan an English-only first release | Founders | Days |
| 8 | Apple Developer account, in an organization's name if the lawyer advises | Founders | 1 to 2 weeks for approval |
| 9 | TestFlight with a few trusted testers, then the items in [[APP-STORE-READINESS]], section 5 | Founders, with Claude | 1 to 2 weeks |
| 10 | Decide the items in [[LAUNCH-BACKLOG]] | Both founders | 1 hour |

Nothing in this work was merged, published, submitted, or sent to anyone.

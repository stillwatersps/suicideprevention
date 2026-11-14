---
type: handoff
owner: Claude, at one founder's request
branch: app/privacy-package
---

# Privacy features for the phone app

[[00 START HERE|Back to Start Here]]

One founder asked for the privacy features Claude had listed earlier that day. This is a draft on
`app/privacy-package`, built on top of `app/review-version` (pull request 30), as a draft pull request
into that branch. **It publishes nothing.** The other founder hasn't seen it, no reviewer or lawyer
has, and the lock has never run on a real phone.

It adds wording, which the earlier work on this branch avoided. Every new line is in `app/src/text/`
in English and Spanish, and is recorded as added since the reviewer's snapshot, not as reviewed.

## Completed

- **Lock the app** (Settings, Your data). Off until turned on. Turning it on asks the phone first, so a
  lock that can't be opened is never set. The phone's own Face ID, Touch ID, or passcode opens it; the
  app keeps no code. Leaving the app covers it at once, and on iPhone a plain cover goes over it for the
  app switcher, starting below the crisis strip, and keeps it until the lock screen is drawn again. The crisis strip, Quick exit, Get Support Now, the Support panel, the Spanish link, both
  review notices, and a place alert are never covered. If the phone has no passcode any more, the app
  opens. First launch is never behind the lock. Files: `app/src/ui/lock.js`, the `tl-locked` rules at the
  end of `app/src/redesign.css`, and `lockStatus`, `unlock`, and `setLock` in
  `app/ios/App/App/TidelightPlugin.swift`, with a Face ID sentence in `Info.plist`.
- **Remove one item.** Each of today's check-ins has Remove, on the Check-in tab and in Your journey, and
  so does each meditation in History. A journal entry, a kept idea, and a Hope box item could already be
  removed one at a time.
- **Make a copy of my data** (Settings). One plain text file with twelve sections, handed to the phone's
  share sheet (`shareFile` in the plugin), written to the app's temporary folder and deleted when the
  sheet closes. No photos. `app/src/ui/export.js`, `app/src/logic/export.js`.
- **A sentence about backups** in Settings, in view. The older lines that say "on this phone only" were
  left as they are; [[CONTENT-REVIEW]] lists them for the reviewer and a lawyer.
- **Open-source licenses** (Settings, About). `app/tools/build-redesign.mjs` reads each shipped package's
  license file and the font's, and writes them into the screen.
- Notes: [[DECISIONS]], [[STATUS]], [[TASKS]], [[CONTENT-REVIEW]] (a new section of questions),
  [[PRIVACY-INVENTORY]], [[LAUNCH-BACKLOG]], [[THIRD-PARTY-LICENSES]], [[APP-STORE-READINESS]],
  [[CODE-MAP]], `app/CLAUDE.md`, `app/CHANGELOG.md`, and section 9b of `app/TESTING_CHECKLIST.md`.

## Checked

All on November 14, 2026. **Not on a real phone, and not on Android.**

- `npm test` in `app/`, desktop Chromium with stand-ins for the phone, on the final code, **in two
  parts**: the lint, 138 unit tests, and 2,527 browser checks, 0 failed. The first part ran through
  the privacy test (5, 180, 62, 934, and 172 checks). In that same run the crisis suite could not
  reach two quick check-in screens in English (a 5-second tap timed out) while the iPhone app was
  being built on the same computer. The run was stopped there, and the crisis suite and the six
  after it were run again from the start on a quiet computer and passed: crisis paths 364, safety
  rules 174, accessibility 225, the size budget 12, damaged data 37, the network blocked 13, and the
  website's pages inside the app 349.
- New: `app/test/privacy-test.mjs`, 172 checks in both languages, and `app/test/unit/export.test.mjs`.
  They cover removing one check-in and one session; the copy of your data (what is in it, that
  closing the share sheet says nothing, that nothing is sent); the licenses screen; and the lock:
  off by default, the three ways turning it on can fail, a cold start locked, leaving and coming
  back, the safety frame while locked, Get Support Now while locked, a place alert while locked,
  nothing saved readable while locked, a phone whose passcode was removed, and first launch.
  **The phone's own check of who is holding it is a stand-in in these tests.**
- The crisis inventory: recorded again, then compared with the earlier file. Only the two new
  screens were added, in both languages; every earlier entry and the order are unchanged.
- **iOS Simulator** (iPhone 17, iOS 27.2), a debug build of this branch made with Xcode, in English
  and light mode, with Face ID pretended by the Simulator: Settings shows Your data; "Make a copy of
  my data" opens the phone's share sheet with a text file; turning the lock on asks for Face ID;
  the app starts locked; a face that doesn't match leaves the lock screen up with its line; Get
  Support Now opens Support while locked; a matching face opens the app; and the licenses screen
  opens. Two faults were found there and fixed. First, coming back to the app showed the screen
  the person had left for a moment, because a page can't redraw while the app is in the background.
  Now the phone's cover stays until the app is in front and the lock screen is drawn, the cover
  starts below the crisis strip, and Face ID is asked only after that; seen working. Second, a
  focus ring was drawn around the whole lock screen; removed. No call, text, or chat was started.
- `python3 tools/check_site.py`: all checks passed, and the review packets were rebuilt. No website
  page changed, so the website's browser and WebKit tests were not re-run.
- Not checked: a real phone; Android; the app switcher's picture by eye; Touch ID and the phone's
  passcode screen; "Save to Files" to the end and the saved file opened; Spanish, dark mode, and
  the largest text sizes by eye (the automated tests cover them); VoiceOver.

## Decisions and open questions

- **The phone's passcode, not a code of the app's own.** Nothing to forget, and nothing stored. Someone
  who knows the phone's passcode can open the app, and the screen says so. For both founders and the reviewer.
- **Only today's check-ins can be removed one at a time,** because earlier days aren't listed anywhere.
- **Removing a check-in leaves the day marked** on the calendar and in the streak, and a "quiet" day
  stays quiet. The screen says the day stays marked.
- **Two screens were added to the crisis inventory** (`app/test/fixtures/crisis-inventory.json`): the
  licenses screen and the lock screen, in both languages. The app's rules say to ask a founder before
  re-recording it. A founder asked for these screens; the file was recorded again and then compared
  entry by entry with the earlier one: every screen that was already there is unchanged, and the order
  is the same. The two new screens have the same crisis controls as Settings.
- **Not built:** a lock on Android (the app's own plugin is iPhone only; the switch says the lock isn't
  available there), a lock in the older fallback layout, encryption of what is saved, and removing a
  check-in from an earlier day. All in [[LAUNCH-BACKLOG]].

## Next step

1. Both founders decide whether to keep each feature, and the lock's design.
2. The reviewer and a lawyer read "Questions about the app's privacy features" in [[CONTENT-REVIEW]].
3. Someone runs section 9b of `app/TESTING_CHECKLIST.md` on a real iPhone.
4. If kept, merge this pull request into `app/review-version`. The reviewer packet on this branch
   already has the two new screens (38 and 39) and five new questions (A15, A16, C7, C8, C9).

## Pictures

From the iOS Simulator, not a phone, in `notes/attachments/app-privacy-package-2026-11-14/`:

![[attachments/app-privacy-package-2026-11-14/simulator-01-settings-your-data.jpg]]
![[attachments/app-privacy-package-2026-11-14/simulator-02-copy-of-my-data.jpg]]
![[attachments/app-privacy-package-2026-11-14/simulator-03-locked.jpg]]
![[attachments/app-privacy-package-2026-11-14/simulator-04-support-while-locked.jpg]]
![[attachments/app-privacy-package-2026-11-14/simulator-05-coming-back-covered.jpg]]

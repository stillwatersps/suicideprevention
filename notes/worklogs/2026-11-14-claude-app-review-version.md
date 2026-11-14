---
type: handoff
owner: Claude, at one founder's request
branch: app/review-version
---

# The phone app as one version, ready to hand to reviewers

Date: November 14, 2026

One founder asked for a "review-ready" package: the app in one place, the rest of the template
look removed, a reviewer packet that starts with what matters, meditation history by month, and a
fresh Simulator run. **The other founder hasn't seen it. No reviewer or lawyer has. It has not run
on a real phone. It publishes nothing.**

## Completed

On `app/review-version`, one draft pull request into `claude/jolly-mayer-2m6eno`.

- **One version.** The branch starts from `app/pre-review-fixes`, which already held every app
  branch (checked one by one: first build, daily check-ins, places and reminders, My circle and
  Hope box, the redesign, the look, launch readiness, the font, the fixes). Pull request 5's branch
  was merged in. Three notes conflicted, [[DECISIONS]], [[TASKS]] and [[STATUS]], and both sides were
  kept. No page or app file was in that merge.
- **History by month.** `app/src/ui/meditate.js` puts each month's sessions in their own list
  under the month's name, from the phone's own date wording. `#tl-history-list` is now a plain
  container; the template in `app/src/text/redesign.en.html` changed, with no words.
- **A plainer look**, one block at the end of `app/src/redesign-identity.css`: sentence-case small
  labels; rounded-rectangle buttons and chips, pill kept for crisis buttons; no glow and no grain.
  Before-and-after pictures are in `notes/attachments/app-review-version-2026-11-14/`.
- **Reviewer packet.** `app/tools/reviewer-walkthrough.mjs` prints the same 37 screens, with the
  same numbers, in four parts: support and crisis screens, check-in questions, streaks and
  rewards, everything else. A screen that names 988 or 911 in its own words is marked.
  [[REVIEWER-PACKET]] has a new section, "Where the words came from".
- **Pictures from the iOS Simulator** of the main screens, in the same attachments folder.

## Checked

All on November 14, 2026. **Not on a real phone, and not on Android.**

- **Nothing left out.** Each of the nine app branches was checked to be inside this branch before
  the merge. The merge with pull request 5's branch touched notes only.
- `npm test` in `app/`, desktop Chromium with stand-ins for the phone: the lint, 131 unit tests, and
  2,333 browser checks, 0 failed, in one unbroken run. After that run, two slips in the plainer look
  were fixed (below), and the five suites that look at styles were run again on the final code and
  passed: the redesign (934), crisis paths (350), safety rules (174), accessibility (217), and
  the size budget (12).
- New check: history grouped by month, two months, each list named by its month, in both
  languages.
- **iOS Simulator** (iPhone 17, iOS 27.2), a debug build of this branch made with Xcode: Home, the
  Check-in tab, Meditate, Location, Friends and Settings opened and were photographed, in English,
  light mode. The first pass showed two slips in the plainer look: the Get Support Now button in
  Settings had lost its pill shape, and section titles such as "You" were in the headline font. Both
  were fixed, the app was rebuilt, and the pictures were taken again.
- Before-and-after pictures of the plainer look were made in desktop Chromium at phone size.
- `python3 tools/check_site.py`: all checks passed, and the review packets were rebuilt. No website
  page changed, so the website's browser and WebKit tests were not re-run.
- Not checked: Spanish and dark mode by eye, VoiceOver, the largest text sizes by eye, and anything
  that needs a phone (calls, texts, notifications, location, haptics, sound).

## Decisions and open questions

- All of it is one founder's choice, recorded in [[DECISIONS]] as a proposal.
- **The older app pull requests:** this branch contains all nine. The founder who asked for this
  had opened 19, 20, 25, 26, 27, 28 and 29, and had Claude close those seven the same day, each with
  a comment pointing here; their branches are kept. Pull requests 16 and 21 were opened by the other
  founder and are still open, for that founder to close.
- The plainer look contradicts the design brief in three places. The brief has a dated note.
- The packet is reordered, not shorter: every screen's words are still in it. Parts 1 to 3 are the
  must-read and are a small share of it.
- "Where the words came from" says nothing is quoted from 988. That follows from how the pages
  were written and from [[SAFETY]]; nobody compared every sentence with 988's pages for this.

## Next step

Both founders review this one pull request and decide on the plainer look. Then run the app on a
real iPhone with `app/TESTING_CHECKLIST.md`, and send [[REVIEWER-PACKET]] and [[LEGAL-PACKET]], with
pictures, once a reviewer and a lawyer are found.

## Pictures

The plainer look, before and after (desktop Chromium at phone size):

![[attachments/app-review-version-2026-11-14/plainer-look-before-after.jpg]]

The combined app in the iOS Simulator:

![[attachments/app-review-version-2026-11-14/simulator-01-home.jpg|240]]
![[attachments/app-review-version-2026-11-14/simulator-02-check-in.jpg|240]]
![[attachments/app-review-version-2026-11-14/simulator-03-meditate.jpg|240]]
![[attachments/app-review-version-2026-11-14/simulator-04-location.jpg|240]]
![[attachments/app-review-version-2026-11-14/simulator-05-friends.jpg|240]]
![[attachments/app-review-version-2026-11-14/simulator-06-settings.jpg|240]]

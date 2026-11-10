# Task board

[[00 START HERE|Back to Start Here]]

Choose one small task at a time. Record its owner and branch when you start.
Planning tasks below are suggestions; ownership has not been agreed.

## Setup completed

- [x] Create and publish the shared starter repository.
- [x] Add the supplied homepage SVG and preview.
- [x] Prepare a shared Obsidian vault with a Start Here page.
- [x] Connect the short project notes to Claude's instructions.

## Ready to choose

- [ ] **⚠️ Important, first for attention:** the licensed reviewer looks at idea E1, "Places that
  are hard for me", an opt-in safety-plan feature for the phone app, and the question about it at
  the top of [[CONTENT-REVIEW]]. One founder likes it (Nov 9, 2026); the other founder decides too.
  Nothing is built. Owner: the founder arranging the review. Details at the top of [[IDEAS]].
- [ ] **⚠️ Important:** decide which app suggestions at the end of [[AGE-STRATEGIES]] to build, after
  the reviewer has read them. One founder marked them Important on November 9, 2026, and said not to
  build them yet. Owner: both founders, with the reviewer.
- [ ] Decide what the public GitHub Pages link should show until the site is
  reviewed. Owner: both. See [[DECISIONS]]. Do this first: merging publishes. The one-page
  option is built as draft pull request 12, next to pull request 8.
- [ ] Read [[FOUNDER-BRIEF]] and [[LAUNCH-CHECKLIST]], and name an owner for each part of
  [[UPKEEP]]. Owner: both.
- [ ] Agree who reviews the content. Pull request 5 and [[RESEARCH-BRIEF]] name a
  licensed therapist, arranged by the founder who supplied the brief. Confirm that
  person also covers the draft pages and [[CONTENT-REVIEW]], and whether to add a
  suicide prevention specialist, someone with lived experience, or someone who works
  with young people. Owner: unassigned.
- [ ] Tap-test call and text links on a real iPhone and Android phone, stopping at
  the dial or compose screen. Owner: unassigned. Checklist in [[CONTENT-REVIEW]].
- [ ] Read each crisis resource in [[SAFETY]] on the provider's site and fill in
  "Person confirmed". Owner: unassigned.
- [ ] Confirm the 988 LGBTQ+ youth option (press 3, PRIDE to 988) with 988, including
  its age range and any chat route. The draft Get Help page lists it. Owner:
  unassigned. See [[SAFETY]].
- [ ] Agree on the safety ground rules in [[SAFETY]]. Owner: unassigned, needs both
  founders' agreement.
- [ ] Confirm both people can download the project, open this vault, and open the
  project in Claude Code. Owner: both. Branch: not needed.
- [ ] Agree on supported ages and whether the prototype needs saved data.
  Owner: both. Branch: to choose. One founder chose every age, with date of birth at sign-up
  (Nov 9, 2026, idea E3 in [[IDEAS]]); the other founder decides too, and a lawyer advises on under-13s.
- [ ] Choose website tools after agreeing on first-version scope.
  Owner: both. Branch: to choose.
- [ ] Review the planning drafts on `planning/morning-brief` and merge or revise.
  They predate the website. Owner: both. Branch: `planning/morning-brief`.
- [ ] Licensed therapist reviews [[RESEARCH-BRIEF]] and fills in its review
  tracker. Owner: the founder who supplied the brief arranges it. Branch: not
  needed for the review; record results on a task branch.
- [ ] After review, put approved sections on the website and reconcile them with
  the draft page text on `claude/jolly-mayer-2m6eno`. [[CONTENT-REVIEW]] has a
  table comparing the two. Owner: unassigned.

- [ ] GitHub settings for the approved ideas: require a second founder's approval
  on `main` (A2), switch Pages to publish with GitHub Actions just before merging
  pull request 5 (A3), and turn off Issues and the Wiki (A4). Owner: the repository
  owner. Steps in [[worklogs/2026-11-06-claude-approved-ideas]].
- [ ] A fluent Spanish reader checks all nine pages in `es/` and the Spanish lines on the English pages, using
  `notes/review-packet/tidelight-spanish-review-packet.pdf`. Owner: unassigned.
- [ ] Give `notes/review-packet/tidelight-review-packet.pdf` to the licensed therapist, and
  record the results in [[CONTENT-REVIEW]]. Owner: the founder arranging the review.
- [ ] Someone with lived experience of a suicide loss reads After a loss. Owner: unassigned.
- [ ] A lawyer reads About and privacy. Owner: unassigned.
- [ ] Try the first version on a real iPhone and Android phone, using [[PHONE-TEST]]. Owner:
  both. The iOS Simulator run on November 7 doesn't replace this.
- [ ] Decide on idea D4, recovery stories, in [[IDEAS]]. Owner: both.
- [ ] Close or keep draft pull requests 1, 7 and 8 (idea C5). Owner: the founder who
  opened them. Pull request 5 now covers what 7 and 8 fix.
- [ ] Run the small user test in [[USER-TEST]] after the reviewer approves the plan.
  Owner: unassigned.
- [ ] Agree who gets failed-run notices from the daily and monthly checks. GitHub sends a
  scheduled workflow's notices to one account: the one that created it, last changed its
  schedule lines, or re-enabled it. That founder checks their notification settings, and the
  other checks the Actions tab on a set day. Owner: both.

- [ ] Check the name Tidelight against existing organizations and trademarks before
  buying a domain or printing cards. Owner: both. The rename is in [[DECISIONS]].
- [ ] Optional: rename the GitHub organization `stillwatersps`. This changes the
  website address, so update `tools/check_live.py`, the 404 page links, and the notes
  in the same change. Owner: the repository owner.

## In progress

Nothing else has been claimed. Add an owner above when you start.

## Ready for review

- [ ] My circle (E2, no accounts) and Hope box (F9) in the phone app, at one founder's request. Owner:
  Claude. Branch: `app/circle-and-hope-box`, draft pull request into `app/hard-places-and-reminders`.
  Not merged, never run on a phone. Handoff: [[worklogs/2026-11-10-claude-circle-and-hope-box]].
- [ ] Give `notes/review-packet/tidelight-app-words.html` (every word the app adds, numbered) to the
  licensed reviewer and the fluent Spanish reader. Owner: unassigned.

- [ ] Phone app first draft: on-phone saving, age setup, and Share this reflection for the Daily check-in,
  at one founder's request. Owner: Claude. Branch: `app/first-build`, draft pull request into
  `claude/jolly-mayer-2m6eno`. Not merged, never run on a phone. Next: the reviewer reads
  `app/src/text/en.html` and [[AGE-STRATEGIES]], a fluent reader checks `app/src/text/es.html`, a lawyer
  advises on under-13s, and someone tries it on a real iPhone and Android phone. Handoff:
  [[worklogs/2026-11-09-claude-phone-app-first-build]].
- [ ] Add the app's words (`app/src/text/`) to the review packets, so the reviewer's packet covers them.
  Owner: unassigned.

- [ ] Daily check-in page, English and Spanish, at one founder's request. Owner: Claude. Branch:
  `site/daily-check-in`, merged into `claude/jolly-mayer-2m6eno` (pull request 5's branch) on
  November 9, 2026, at a founder's request. Not on `main`. Both founders decide whether typing
  belongs on the site and whether to build the phone app one founder chose for saving ([[CHECK-IN-BACKEND]]).

- [ ] Choose a visual design: Shoreline, now merged into pull request 5's branch at one founder's
  request on November 9, 2026, or signage (pull request 11, still open). Owner: both. Comparison screenshots are in
  [[worklogs/2026-11-08-claude-shoreline-redesign]].
- [ ] Shoreline redesign, stylesheet only, at one founder's request. Owner: Claude. Branch:
  `site/pro-max-redesign`, merged into `site/first-version-finish` and then pull request 5's branch on
  November 9, 2026, at a founder's request. Not on `main`.

Move a task here when its branch is ready for the other person to review.

- [ ] Fix navigation, phone layout, and accessibility, and draft page content.
  Owner: Claude, at the user's request. Branch: `site/phone-accessibility-content`,
  pull request 6 into `claude/jolly-mayer-2m6eno`, the branch behind draft pull request 5.
  Handoff: [[worklogs/2026-11-06-claude-site-improvements]]. Merged into that branch on
  November 6, 2026. Not on `main`.
- [ ] Write the Get Help, Help Someone, and Research pages. First drafts are in the
  same pull requests. They still need professional review before anyone relies on
  them.
- [ ] Verify crisis resources on provider sites. Claude read each page; see
  [[SAFETY]]. A person still needs to confirm them.
- [ ] Correct `main`'s notes, with no page changes, so `main` stops saying pull
  request 4 is unmerged. Owner: Claude, at the user's request. Branch:
  `claude/charming-swartz-e8d31c`, draft pull request 7 into `main`. Not merged. A
  founder decides: merging publishes those notes. Its description covers the
  conflict with pull request 5.
- [ ] Correct the four known problems on the live pages, with no draft content. Owner:
  Claude, at the user's request. Branch: `site/live-page-corrections`, draft pull
  request 8 into `main`. Not merged. A founder decides: merging publishes. No qualified
  person has reviewed the wording. Its description says what to weigh, including the
  conflict with pull request 5.

- [ ] Build nine approved ideas: automatic checks, website-only publishing, offline
  support, dark mode, a shorter Get Help, quick exit, and Spanish pages. Owner:
  Claude, at one founder's request. Branch: `claude/jolly-mayer-2m6eno`, draft pull
  request 5. Handoff: [[worklogs/2026-11-06-claude-approved-ideas]]. Not merged.

- [ ] Build the second batch: live-site and link monitoring, a readability report,
  myths and facts, printable wallet cards, a teen page, and a user test plan. Owner:
  Claude, at one founder's request. Branch: `claude/jolly-mayer-2m6eno`, draft pull
  request 5. Handoff: [[worklogs/2026-11-06-claude-second-batch]]. Not merged.

- [ ] Finish the first version for testing and review: Not sure page, After a loss page, About
  and privacy page, save 988 to contacts, review status, Spanish Research page, review packets,
  browser tests, and phone test steps. Owner: Claude, at one founder's request. Branch:
  `site/first-version-build`, pull request 9 into `claude/jolly-mayer-2m6eno`. Handoff:
  [[worklogs/2026-11-06-claude-first-version]]. Merged into that branch on November 7, 2026, at a
  founder's request. Not on `main`. No qualified person has reviewed it.

- [ ] Finish the first version's audit, tests, and notes: every checked audit finding applied in
  both languages, three code reviews and their fixes, iOS Simulator tests and the landscape fix
  they found, a stricter publish check, and the audit's questions for the reviewer. Owner:
  Claude, at one founder's request. Branch: `site/first-version-finish`, pull request 10, merged into
  `claude/jolly-mayer-2m6eno` on November 9, 2026, at a founder's request. Handoff:
  [[worklogs/2026-11-07-claude-first-version-finish]]. Not on `main`. No qualified person has reviewed it.

- [ ] Write a one-page first-version description and main user journey: [[FIRST-VERSION]].
  Owner: Claude, at one founder's request. Built on a branch on one computer and merged into
  `site/first-version-finish` (draft pull request 10) on November 7, 2026, in commit `911e7fe`. Handoff:
  [[worklogs/2026-11-07-claude-first-version-brief]]. Not on `main`. A proposal: both founders need
  to agree it.

- [ ] Give the Spanish lines on English pages their own sections in the Spanish packet, and make
  the publish check need them approved. Owner: Claude, at one founder's request. Built on a branch
  on one computer and merged into `site/first-version-finish` (draft pull request 10) on November 7,
  2026, in commit `7d05f06`. Handoff: [[worklogs/2026-11-07-claude-spanish-sections]]. Not on `main`. No
  fluent reader has checked any Spanish.

- [ ] Keep a compact crisis strip on screen with larger text and on older phones on their side.
  Owner: Claude, at one founder's request. Branch: `site/compact-crisis-strip`, draft pull request
  13, merged into `site/first-version-finish` and then pull request 5's branch on November 9, 2026, at
  a founder's request. Handoff: [[worklogs/2026-11-07-claude-compact-strip]]. A proposal for both
  founders and the reviewer. Pull request 11 would now conflict with it and with Shoreline.

- [ ] Build a one-page public site as an option for open decision 1. Owner: Claude, at one
  founder's request. Branch: `site/minimal-public-preview`, draft pull request 12 into
  `main`. Its handoff is on that branch. Not merged. **Merging publishes.** Both founders decide,
  together with pull requests 5, 7 and 8. No qualified person has reviewed the wording.

## Completed work

Move finished tasks here and link their handoff note.

- [x] Merge the first homepage, phone layout included, with a real photo.
  Built by Claude at the user's request; merged through pull request 3.
  Handoff: [[worklogs/2026-11-06-claude-homepage-first-build]].
  This records the merge, not clinical review or production readiness.
- [x] Add placeholder pages and link them from the menu, cards, and footer.
  Merged through pull request 4 on November 5, 2026, Eastern time, commit `d610002`.
  Handoff: [[worklogs/2026-11-06-claude-site-pages]].

Use [[templates/Task|The task template]]. Keep detailed notes in
[[worklogs/README|Worklogs]]. Coordinate before both people edit this board.

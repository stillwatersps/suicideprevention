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
  the top of [[CONTENT-REVIEW]]. Both founders agreed on Nov 9, 2026, that it waits for the reviewer.
  Nothing is built. Owner: the founder arranging the review. Details at the top of [[IDEAS]].
- [x] Decide what the public GitHub Pages link should show until the site is reviewed. Both
  founders chose pull request 12, the one crisis page, on November 9, 2026. See [[DECISIONS]].
- [ ] Publish the one crisis page. Pull request 12 has a website-only publish step since November
  9. Both founders approve and merge it; the repository owner switches Pages to GitHub Actions and
  re-runs the latest Site run, in the order its description gives; pull request 8 is closed. Owner:
  both. **Merging publishes.**
- [ ] Answer whether the Daily check-in saves to the person's own iCloud or Google account, or to
  a Tidelight account, which needs a server. Owner: both. Nothing is built until then.
- [ ] Each founder moves any private notes outside the project folder (decided November 9).
  Owner: each founder.
- [ ] Read [[FOUNDER-BRIEF]] and [[LAUNCH-CHECKLIST]], and name an owner for each part of
  [[UPKEEP]]. Owner: both.
- [x] Agree who reviews the content. Both founders decided on November 9, 2026: the licensed
  therapist reviews the research brief, every draft page, and the phone app's words. A fluent
  Spanish reader is still to be found.
- [ ] Tap-test call and text links on a real iPhone and Android phone, stopping at
  the dial or compose screen. Owner: unassigned. Checklist in [[CONTENT-REVIEW]].
- [ ] Read each crisis resource in [[SAFETY]] on the provider's site and fill in
  "Person confirmed". Owner: unassigned.
- [ ] Confirm the 988 LGBTQ+ youth option (press 3, PRIDE to 988) with 988, including
  its age range and any chat route. The draft Get Help page lists it. Owner:
  unassigned. See [[SAFETY]].
- [ ] Both founders read the safety ground rules in [[SAFETY]] and the crisis rules in
  `CLAUDE.md`, change anything needed, and record them as agreed in [[DECISIONS]]. Agreed as the
  next step on November 9, 2026. Owner: both.
- [ ] Both founders read the updated [[FIRST-VERSION]] and agree it. Owner: both.
- [ ] Confirm both people can download the project, open this vault, and open the
  project in Claude Code. Owner: both. Branch: not needed.
- [x] Agree on supported ages. Both founders decided on November 9, 2026: every age, with date of
  birth at sign-up in the app, and the app held back from under-13s until a lawyer advises. The
  website asks no age. Saved data is the check-in question above.
- [ ] Choose website tools after agreeing on first-version scope.
  Owner: both. Branch: to choose.
- [x] Review the planning drafts on `planning/morning-brief` and merge or revise.
  Merged into `main` as pull request 1 on November 9, 2026, now in `notes/planning/`. They predate
  the website.
- [ ] Licensed therapist reviews [[RESEARCH-BRIEF]] and fills in its review
  tracker. Owner: the founder who supplied the brief arranges it. Branch: not
  needed for the review; record results on a task branch.
- [ ] After review, put approved sections on the website and reconcile them with
  the draft page text on `claude/jolly-mayer-2m6eno`. [[CONTENT-REVIEW]] has a
  table comparing the two. Owner: unassigned.

- [x] GitHub settings both founders agreed on November 9, 2026: Issues and the Wiki off (A4) and
  one approval required for every merge into `main`, administrators included (A2). Done November 9,
  2026, at a founder's request.
- [ ] Switch Pages to GitHub Actions (A3), right after pull request 12 merges, then re-run the
  latest Site run. Owner: the repository owner. Steps in pull request 12's description and
  [[worklogs/2026-11-06-claude-approved-ideas]].
- [ ] A fluent Spanish reader checks all nine pages in `es/` and the Spanish lines on the English pages, using
  `notes/review-packet/tidelight-spanish-review-packet.pdf`. Owner: unassigned.
- [ ] Give `notes/review-packet/tidelight-review-packet.pdf` to the licensed therapist, and
  record the results in [[CONTENT-REVIEW]]. Owner: the founder arranging the review.
- [ ] Someone with lived experience of a suicide loss reads After a loss. Owner: unassigned.
- [ ] A lawyer reads About and privacy, and advises on under-13s (COPPA) and the app stores'
  rules before the app is offered to them. Owner: unassigned.
- [ ] Try the first version on a real iPhone and Android phone, using [[PHONE-TEST]]. Owner:
  both. The iOS Simulator run on November 7 doesn't replace this.
- [ ] Decide on idea D4, recovery stories, in [[IDEAS]]. Owner: both.
- [ ] Close draft pull request 8 (idea C5), as both founders decided on November 9, 2026, with
  pull request 12 replacing those pages. Owner: the founder who opened it. Pull requests 1 and 7 were merged into `main` on November 9.
- [ ] Run the small user test in [[USER-TEST]] after the reviewer approves the plan.
  Owner: unassigned.
- [ ] Name who rechecks the crisis numbers monthly, and who gets failed-run notices from the
  daily and monthly checks. Both founders agreed on November 9, 2026, to split the two jobs. GitHub sends a
  scheduled workflow's notices to one account: the one that created it, last changed its
  schedule lines, or re-enabled it. That founder checks their notification settings, and the
  other checks the Actions tab on a set day. Owner: both.

- [ ] Check the name Tidelight against the U.S. trademark office's search and existing
  organizations before buying a domain or printing cards. Both founders agreed to keep the name
  on November 9, 2026. Owner: both. The rename is in [[DECISIONS]].
- [ ] Optional: rename the GitHub organization `stillwatersps`. This changes the
  website address, so update `tools/check_live.py`, the 404 page links, and the notes
  in the same change. Owner: the repository owner.

## In progress

Nothing else has been claimed. Add an owner above when you start.

## Ready for review

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
- [ ] Correct the four known problems on the live pages, with no draft content. Owner:
  Claude, at the user's request. Branch: `site/live-page-corrections`, draft pull
  request 8 into `main`. Not merged. Both founders chose on November 9, 2026, to close it once
  pull request 12 merges, since 12 replaces those pages.

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
  `main`. Its handoff is on that branch. Not merged. **Merging publishes.** Both founders chose it
  on November 9, 2026, and it now has a website-only publish step. Next: mark it ready for review,
  the founder who didn't open it approves it, and then merge it in the order its description gives.
  No qualified person has reviewed the wording, and no person has confirmed its numbers or tried
  its links on a real phone.

- [ ] Build the ideas approved November 8: strip fixes, packet and test tools, privacy, four more crisis lines, two new
  draft pages, and a section on a friend online. Owner: Claude, at one founder's request. Branch: `site/approved-items-1110`,
  a draft pull request into `claude/jolly-mayer-2m6eno`. Not merged. Content is a draft for the licensed reviewer and a
  fluent Spanish reader; no person has confirmed the new crisis lines.

## Completed work

Move finished tasks here and link their handoff note.

- [x] Merge the first homepage, phone layout included, with a real photo.
  Built by Claude at the user's request; merged through pull request 3.
  Handoff: [[worklogs/2026-11-06-claude-homepage-first-build]].
  This records the merge, not clinical review or production readiness.
- [x] Add placeholder pages and link them from the menu, cards, and footer.
  Merged through pull request 4 on November 5, 2026, Eastern time, commit `d610002`.
  Handoff: [[worklogs/2026-11-06-claude-site-pages]].
- [x] Correct `main`'s notes, with no page changes, so `main` stops saying pull
  request 4 is unmerged. Built by Claude at the user's request on
  `claude/charming-swartz-e8d31c`. Merged into `main` through pull request 7 on November 9,
  2026, by a founder, so those notes are public.
  Handoff: [[worklogs/2026-11-06-claude-main-notes-correction]].

Use [[templates/Task|The task template]]. Keep detailed notes in
[[worklogs/README|Worklogs]]. Coordinate before both people edit this board.

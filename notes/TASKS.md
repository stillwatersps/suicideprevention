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

- [ ] Decide what the public GitHub Pages link should show until the site is
  reviewed. Owner: both. See [[DECISIONS]]. Do this first: merging publishes.
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
- [ ] Write a one-page first-version description and main user journey.
  Owner: unassigned. Branch: to choose.
- [ ] Agree on supported ages and whether the prototype needs saved data.
  Owner: both. Branch: to choose.
- [ ] Choose website tools after agreeing on first-version scope.
  Owner: both. Branch: to choose.
- [ ] Review the planning drafts on `planning/morning-brief` and merge or revise.
  They predate the website. Owner: both. Branch: `planning/morning-brief`.
- [ ] Licensed therapist reviews [[RESEARCH-BRIEF]] and fills in its review
  tracker. Owner: the founder who supplied the brief arranges it. Branch: not
  needed for the review; record results on a task branch.
- [ ] After review, put approved sections on the website and reconcile them with
  the draft page text on `site/phone-accessibility-content`. [[CONTENT-REVIEW]] has a
  table comparing the two. Owner: unassigned.

- [ ] GitHub settings for the approved ideas: require a second founder's approval
  on `main` (A2), switch Pages to publish with GitHub Actions just before merging
  pull request 5 (A3), and turn off Issues and the Wiki (A4). Owner: the repository
  owner. Steps in [[worklogs/2026-11-06-claude-approved-ideas]].
- [ ] A fluent Spanish reader checks all nine pages in `es/`, using
  `notes/review-packet/stillwater-spanish-review-packet.pdf`. Owner: unassigned.
- [ ] Give `notes/review-packet/stillwater-review-packet.pdf` to the licensed therapist, and
  record the results in [[CONTENT-REVIEW]]. Owner: the founder arranging the review.
- [ ] Someone with lived experience of a suicide loss reads After a loss. Owner: unassigned.
- [ ] A lawyer reads About and privacy. Owner: unassigned.
- [ ] Try the first version on a real iPhone and Android phone, using [[PHONE-TEST]]. Owner:
  both.
- [ ] Decide on idea D4, recovery stories, in [[IDEAS]]. Owner: both.
- [ ] Close or keep draft pull requests 1, 7 and 8 (idea C5). Owner: the founder who
  opened them. Pull request 5 now covers what 7 and 8 fix.
- [ ] Run the small user test in [[USER-TEST]] after the reviewer approves the plan.
  Owner: unassigned.
- [ ] Turn on GitHub notifications for failed workflow runs, so the daily and monthly
  checks reach a founder. Owner: both.

## In progress

Nothing else has been claimed. Add an owner above when you start.

## Ready for review

Move a task here when its branch is ready for the other person to review.

- [ ] Fix navigation, phone layout, and accessibility, and draft page content.
  Owner: Claude, at the user's request. Branch: `site/phone-accessibility-content`,
  draft pull request 6 into `claude/jolly-mayer-2m6eno`, which is draft pull
  request 5. Handoff: [[worklogs/2026-11-06-claude-site-improvements]]. Not merged.
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
  `site/first-version-build`, draft pull request {PR} into `claude/jolly-mayer-2m6eno`. Handoff:
  [[worklogs/2026-11-06-claude-first-version]]. Not merged. No qualified person has reviewed it.

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

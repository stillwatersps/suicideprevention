# Current status

Repository state checked: November 6, 2026. Check GitHub if this looks out of date.

## Current phase

Public early preview: the homepage and three placeholder pages. First drafts of the
page content are waiting for review in draft pull requests. Shared project memory
and product planning continue.

## What is where

| Where | What | State |
| --- | --- | --- |
| `main` | Homepage, placeholder Get Help, Help Someone, and Research pages, and these notes | Public through GitHub Pages |
| `claude/jolly-mayer-2m6eno` | Draft page content, site fixes, `notes/CONTENT-REVIEW.md`, and the research brief `notes/RESEARCH-BRIEF.md` | [Draft pull request 5](https://github.com/stillwatersps/suicideprevention/pull/5) into `main`. **Not merged, not on the public website** |
| `site/phone-accessibility-content` | A second round of fixes and updated notes, on top of that branch | [Draft pull request 6](https://github.com/stillwatersps/suicideprevention/pull/6) into `claude/jolly-mayer-2m6eno`. **Not merged, not on the public website** |
| `site/live-page-corrections` | Only the four known issues below, on the live pages, plus a handoff | [Draft pull request 8](https://github.com/stillwatersps/suicideprevention/pull/8) into `main`. **Not merged, not on the public website** |

Not merged doesn't mean private: the repository is public, so anyone can read them
on GitHub. You can also read them by switching branch in GitHub Desktop; Obsidian
shows whichever branch your project folder is on. Git refuses that switch if another
folder on the same computer already has the branch open.

Merging pull request 6 publishes nothing. Merging pull request 5 into `main`
publishes it within about a minute, notes included, so it holds for review by both
founders and a licensed therapist. Pull request 8 is separate: merging it publishes
its page corrections the same way, and no qualified person has reviewed that wording.

## In place

- The shared starter repository is saved on GitHub.
- A local clone is available on this Mac.
- The supplied Stillwater homepage SVG is in `design/homepage.svg`.
- These notes are an Obsidian vault in `notes/`.
- Claude Code has instructions to read the brief, status, tasks, and decisions.
- The vault is confirmed on GitHub: a fresh download of `main` contains it.
- The first homepage is merged into shared `main` through pull request 3.
  It uses HTML, CSS, a small navigation script, and the sunset photo assets.
- GitHub Pages is configured for `main` at
  https://stillwatersps.github.io/suicideprevention/. The Pages API reported
  `built` when checked. Content review and product readiness are separate tasks.
- Draft safety ground rules and crisis resources to verify are in [[SAFETY]].
- Planning drafts for scope and the phone layout are on the unmerged branch
  `planning/morning-brief`.
- The first homepage's earlier handoff is at
  [[worklogs/2026-11-06-claude-homepage-first-build|the homepage handoff]].
- Both Claude sessions use saved project notes as the shared reference;
  [[SHARED-MEMORY]] explains the save, upload, download, and reread loop.
- Placeholder pages Get Help, Help Someone and Research, linked from the menu,
  homepage cards and every footer, are merged into `main` through pull request 4.
  They and the homepage are public at
  https://stillwatersps.github.io/suicideprevention/. On `main` they still need
  content. See [[worklogs/2026-11-06-claude-site-pages|the pages handoff]].
- The handoff for this correction to the status and task notes is at
  [[worklogs/2026-11-06-claude-main-notes-correction|the notes correction handoff]].

## Known issues on `main`

Public now. Draft pull requests 5 and 6 correct each of these, and draft pull request
8 corrects only these. None of those corrections is public until a pull request merges.

- The footer says content "is still being reviewed", which overstates it. No
  qualified person has reviewed it.
- Pages have no `noindex` tag, so search engines may list them. Adding the tag is
  still a proposal.
- The homepage says "Privacy first" and doesn't mention that the web host logs
  visitors' IP addresses.
- Help Someone says to "call or text 988 together", which the official pages Claude
  read don't describe.

## Still to confirm

- The other collaborator has downloaded the latest project and opened this vault.
- Both people have opened the local project in Claude Code.
- First-version features and supported age ranges.
- Saved-data needs, future website tools, and content review ownership.
- Whether to keep GitHub Pages public before crisis content is reviewed.

## Next useful step

Both people download the latest shared main branch and ask their active Claude
session to reread the core notes and recent handoffs. Then read draft pull
requests 5 and 6, review the public pages, and choose separate next tasks from
[[TASKS]].

## End-of-session update

Keep this page short: current phase, completed work, open questions, and next
step. Put detailed changes in a task-specific handoff in `worklogs/`.

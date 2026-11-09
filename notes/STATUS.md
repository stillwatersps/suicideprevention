# Current status

## If this note is on `main`

Added November 7, 2026, and updated November 9. If you are reading this on `main`, the public site
is the one-page crisis page from the branch `site/minimal-public-preview`: 988, 911, and what the
website is, in English and Spanish, at its four page addresses and at any missing address. Both
founders chose it on November 9, 2026, until the content is reviewed, and chose to publish the
website without the notes. The decisions are recorded in `notes/DECISIONS.md` on pull request 5's
branch, through pull request 18.

`.github/workflows/site.yml` publishes only the page and the two files it loads, once the
repository owner sets Settings > Pages to "GitHub Actions" and re-runs that workflow's latest run on
`main` from the Actions tab. Until then, Pages also serves these notes, `README.md`, and `CLAUDE.md`
as plain files. The rest of this note predates the crisis page and still describes the photo
homepage, and so do [[PROJECT]], [[00 START HERE]], [[DESIGN]], and `README.md`. See
[[worklogs/2026-11-07-claude-minimal-public-preview|the crisis page handoff]] and
[[worklogs/2026-11-09-claude-one-page-publish|the publish step handoff]].

Repository state checked: November 6, 2026. Check GitHub if this looks out of date.

## Current phase

Public early preview: the homepage and three placeholder pages. First drafts of the
page content are waiting for review in draft pull requests. Shared project memory
and product planning continue.

## What is where

| Where | What | State |
| --- | --- | --- |
| `main` | Homepage, placeholder Get Help, Help Someone, and Research pages, and these notes | Public through GitHub Pages |
| `claude/jolly-mayer-2m6eno` | Draft page content, Spanish pages, a teen page, wallet cards, quick exit, offline support, automatic checks, `notes/CONTENT-REVIEW.md`, and the research brief `notes/RESEARCH-BRIEF.md`. Pull request 6 has merged into this branch | [Draft pull request 5](https://github.com/stillwatersps/suicideprevention/pull/5) into `main`. **Not merged, not on the public website** |
| `site/first-version-build` | The rest of the first version, for phone testing and human review: new pages, review packets, and browser tests | [Draft pull request 9](https://github.com/stillwatersps/suicideprevention/pull/9) into `claude/jolly-mayer-2m6eno`. **Not merged, not on the public website** |
| `site/live-page-corrections` | Only the four known issues below, on the live pages, plus a handoff | [Draft pull request 8](https://github.com/stillwatersps/suicideprevention/pull/8) into `main`. **Not merged, not on the public website** |

Not merged doesn't mean private: the repository is public, so anyone can read them
on GitHub. You can also read them by switching branch in GitHub Desktop; Obsidian
shows whichever branch your project folder is on. Git refuses that switch if another
folder on the same computer already has the branch open.

Merging pull request 9 publishes nothing. Merging pull request 5 into `main`
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

Public now. Draft pull request 5 corrects each of these, and draft pull request 8
corrects only these. None of those corrections is public until a pull request merges.

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
requests 5 and 9, review the public pages, and choose separate next tasks from
[[TASKS]].

## End-of-session update

Keep this page short: current phase, completed work, open questions, and next
step. Put detailed changes in a task-specific handoff in `worklogs/`.

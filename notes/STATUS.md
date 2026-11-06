# Current status

Checked November 6, 2026, on the task branch named below. A note inside a pull
request can't say when it merged, so check GitHub if this looks out of date.

## What is where

| Where | What | State |
| --- | --- | --- |
| `main`, commit `d610002` when checked | Homepage, placeholder Get Help, Help Someone, and Research pages, notes | Public through GitHub Pages |
| `claude/jolly-mayer-2m6eno`, commit `5554c53` when checked | First round of phone, accessibility, and navigation fixes, draft page content, a 404 page, a check script, plus the [[RESEARCH-BRIEF]] PDF and notes, combined at a founder's request | Draft pull request 5 into `main`, **not merged, not on the public website** |
| `site/phone-accessibility-content` | Everything above, plus a second round: fixes from an independent review, stronger site checks, and these updated notes | Draft pull request 6 into `claude/jolly-mayer-2m6eno`, so pull request 5 stays the one place to review. **Not merged, not on the public website** |
| `planning/morning-brief` | First planning drafts | Draft pull request 1, not merged, partly out of date |

Unmerged doesn't mean private. The repository is public, so anyone on GitHub can
read every branch.

Your Obsidian shows whichever branch your project folder is on. To read these notes
before merging, switch your project to that branch in GitHub Desktop, or read them on
GitHub. On `main` you won't see them until the branch is merged and you download `main`.

## Current phase

A public early preview of the website, with unreviewed draft content waiting on task
branches. Product decisions and professional review have not happened yet.

## In place on main

- The shared repository, the Obsidian vault in `notes/`, and Claude's instructions.
- The supplied design in `design/homepage.svg`.
- Homepage and three placeholder pages, merged through pull requests 3 and 4 and
  public at https://stillwatersps.github.io/suicideprevention/.
- [[SHARED-MEMORY]] explains how notes reach the other computer.

## On the task branches, waiting for review

- See [[worklogs/2026-11-06-claude-site-improvements|the handoff]] for what changed
  and what was checked.
- Draft content on all three pages, marked for review. [[CONTENT-REVIEW]] lists
  every call, text, and chat control, and every question for a qualified reviewer.
- [[SAFETY]] now records each crisis resource and where it was read.
- Pages ask search engines not to list them. This is a proposal in [[DECISIONS]].
- A founder-supplied research and website-copy brief (PDF plus a searchable copy)
  is in [[RESEARCH-BRIEF]], awaiting a licensed therapist's review. Review it
  alongside [[CONTENT-REVIEW]]; both cover the same three pages, and the page text
  did not come from the brief.

## Known issues

On `main`, and public now. The task branches correct each of these:

- The footer says content "is still being reviewed", which overstates it.
- Pages have no `noindex` tag, so search engines may list them.
- The homepage says "Privacy first" and doesn't mention that the web host logs
  visitors' IP addresses.
- Help Someone says to "call or text 988 together". The official pages Claude read
  don't describe that, so the draft dropped it.
- `notes/STATUS.md` and `notes/TASKS.md` on `main` still say pull request 4 is not
  merged, and page writing has not started. A session opened on `main` reads that as
  true. See [[TASKS]] for a proposed notes-only correction.

Everywhere:

- No qualified person has reviewed any crisis or health wording, on `main` or on
  the task branches.
- Pages publishes every file on `main`, including these notes, so unverified or
  draft notes are public web addresses. See the open decision in [[DECISIONS]].
- One merge publishes notes and pages together, so corrected notes can't reach
  `main` while the pages wait for review. Same open decision.
- Call and text links have never been tried on a real phone, or with VoiceOver or
  TalkBack.

## Still to confirm

- Both people have the latest project on their computers and can open this vault.
- What the public site should show until review.
- Who reviews crisis content, and who re-checks the numbers.
- First-version scope, supported ages, and saved-data needs.

## Next useful step

Both founders read pull requests 5 and 6 and [[CONTENT-REVIEW]], then decide what the
public site should show. Merging pull request 6 into `claude/jolly-mayer-2m6eno`
doesn't publish anything. Merging pull request 5 into `main` publishes, so do that
only after the decision.

## End-of-session update

Keep this page short: current phase, completed work, open questions, and next
step. Put detailed changes in a task-specific handoff in `worklogs/`.

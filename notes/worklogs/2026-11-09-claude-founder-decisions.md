---
type: handoff
owner: Claude, at one founder's request
branch: notes/founder-decisions
---

# Both founders' decisions, recorded

Date: November 9, 2026

## Completed

Claude listed 14 questions both founders needed to answer before more building or merging. Founder A
answered them, and founder B agreed to every answer the same day. Claude recorded them:

- [[DECISIONS]]: a new entry with all 14 answers, and open decisions 1 to 7 marked settled, so
  `tools/launch_gate.py` counts none as open.
- [[STATUS]]: the phase, what's still to confirm, and a new next-step list in order.
- [[TASKS]]: settled tasks ticked, and new ones added: publishing the one crisis page, the check-in
  saving question, and moving private notes.
- [[FIRST-VERSION]]: updated with the decisions, as answer 10 asked: what the public site shows until
  review, every age, the Daily check-in, the two designs, and the phone app.

Notes only. No page, stylesheet, or tool changed.

## Checked

- `python3 tools/check_site.py`: see the pull request for the result.
- Each answer was copied from the shared question list both founders used. Claude checked three
  answers against the repository before recording them:
  - The GitHub Actions publish step is only on pull request 5's branch, and it runs
    `tools/launch_gate.py --publish`, which stops publishing until reviews are recorded. So `main`
    needs its own step before pull request 12 can publish that way.
  - Pull request 11, signage, merges cleanly into pull request 5's branch since its November 9
    rework. The question list said it still conflicted.
  - Pull request 16, the phone app, saves the check-in on the phone only.

## Decisions and open questions

- Answer 8 says the check-in saves "to their own account". That could mean the person's iCloud or
  Google account, with no server, or a Tidelight account, which needs one. Recorded as a question for
  both founders. Claude builds neither until it's answered.
- Answer 6, the design, and answer 11, the safety rules, are agreed next steps, not choices yet.
- Owners for each step weren't named.

## Update, later November 9

A founder merged pull requests 1 and 7 into `main` that morning. These notes already said so; Claude
updated what was left: `main`'s commit (`ad0ba65`) and contents in [[STATUS]], pull request 11's
target, pull request 12's state and what it needs before merging (marked ready for review, the other
founder's approval, and a person confirming its numbers and trying its links on real phones), the
notes-correction task moved to Completed in [[TASKS]], idea C5 in [[IDEAS]], and one line in
[[FOUNDER-BRIEF]]. Checked on GitHub: the live site matches `main`, pull request 12 merges cleanly
with it, and its publish check passes on the merged result.

## Next step

Merge pull request 17, then this one, into pull request 5's branch. Neither publishes. Then follow the
order in [[STATUS]]: GitHub settings, booking the reviewer, and publishing the one crisis page.

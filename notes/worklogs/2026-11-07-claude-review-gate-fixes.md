---
type: handoff
owner: Claude Code, at one founder's request
branch: worktree-agent-aef8562de812bfb14, based on a967bba
---

# Publish gate: approvals tied to the reviewed text

Date: November 7, 2026. Fixes from two independent reviews of the publish gate and the tools. Local
commit only, not pushed or merged.

## What changed

- **Each approval is tied to the text the reviewer read.** Every section of the review packets has a
  fingerprint, a 12-character code made from that section's text as the packet shows it. Both packets
  print it in the sign-off table and explain it. A record now ends with it:
  `- Get Help: licensed clinical social worker, 2026-12-01, approved, a1b2c3d4e5f6`. If the text changes
  later, the approval stops counting, and `tools/launch_gate.py --publish` stops publishing.
- **Only the right reviewer counts.** English sections need a licensed mental health professional from a
  fixed list of roles, and Spanish sections a fluent or native Spanish reader. Records by anyone else, such
  as a lawyer or a school counselor, are left out entirely, so they can't approve a section or hide a
  clinician's rejection. Their reviews go under a new "Other reviews" heading in [[CONTENT-REVIEW]], which
  the gate never reads.
- **Every page needs a review section.** `tools/check_site.py` and the gate both fail otherwise. The 404
  page's Spanish sentence is now its own section, "Página no encontrada", in the Spanish packet.
- **The About pages can't claim an approval** unless the newest record approves the current text.
- **More review-claim wording is caught,** such as "has reviewed" and "revisó", unless the sentence denies it.
- **A record dated after today doesn't count** and stops publishing, and so does any line the gate can't read.
- **The launch list** counts a phone test only from a "Real phone test:" line that isn't a Simulator or
  emulation note, and needs an iPhone and an Android phone. "Not yet" or "pending" never counts as a
  person's confirmation in [[SAFETY]].
- Notes: [[LAUNCH-CHECKLIST]], [[REVIEWER-NOTES]], "Review records" in [[CONTENT-REVIEW]], [[PHONE-TEST]],
  and step 7 of [[UPKEEP]] describe the exact form.
- The review packets are rebuilt. Only the sign-off parts and the new Spanish 404 section changed.

## Decisions

- An approval with a fingerprint that no longer matches isn't a site-check failure, only a note, because
  it's the normal state after an edit. The publish step is what stops.
- Removing the draft labels at launch changes every fingerprint, so the final text needs a final approval.
  [[LAUNCH-CHECKLIST]] section 6 says to do those edits on one branch and record the new lines before merging.

## Checked

- `python3 tools/check_site.py` and `python3 tools/launch_gate.py --self-test` (58 made-up cases) pass.
- On scratch copies with made-up records: all approved publishes; a changed sentence, a school counselor's
  record, a lawyer after a clinician's rejection, a future date, and a new page without a section all stop it.
- `python3 tools/make_review_packet.py` built both packets, HTML and PDF.
- Each new planted bug in `tools/test_the_tests.py` was caught, run one at a time with `--only`.

## Still open

- Get Help, After a loss, and the wallet card also have Spanish lines on the English pages. Their Spanish
  twins have similar text, but those exact lines only reach the therapist's packet.
- The review on admin bypass of branch protection (its M4) wasn't part of this task.

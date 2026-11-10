---
type: handoff
owner: Claude Code, one step of a workflow run at one founder's request
branch: build/sources-1109, from 830f766 of claude/jolly-mayer-2m6eno (draft pull request 5's branch)
---

# The November 8 crisis-source recheck and name scan, brought onto pull request 5's branch

Date: November 9, 2026, Eastern time.

**State when written: local only.** Local commits on `build/sources-1109`. Not pushed, no pull request,
not merged, and not on the public website. Notes, one comment in a check tool, and rebuilt review
packets: no website page, stylesheet, or site script changed, and no crisis number or wording on a
page changed. No qualified person has reviewed anything here, and no person has confirmed any crisis
detail.

## Completed

- **Merged** the local branch `build/recheck-2026-11-08` at `6f9109c` (based on `e608945`), with its
  handoff [[worklogs/2026-11-08-claude-recheck]] and [[NAME-CHECK]]. It brings the November 8 reads of
  all 13 crisis resources, the LGBTQ+ youth and FCC notes, findtreatment.gov off `KNOWN_BLOCKERS` in
  `tools/check_site.py`, two made-up link answers in its `--self-test`, one planted bug in
  `tools/test_the_tests.py`, and links to [[NAME-CHECK]] from [[DECISIONS]] and [[00 START HERE]].
- **Conflicts and how they were settled:**

| File | Settled by |
| --- | --- |
| [[SAFETY]], "Read on" column | The base said "Nov 6 and 9, 2026" for the 988 and 988 in Spanish rows, from the November 9 re-read in [[worklogs/2026-11-09-claude-founder-decisions]]. The recheck said "Nov 8, 2026" for every row. Kept the recheck's rows, including its added Spanish Get Help page on the 988 in Spanish row, and made those two "Nov 8 and 9, 2026" after reading both pages again today (below). A short note under the table says what each read found |
| `notes/TASKS.md` | Kept the base's version, which already has the November 9 wording for the name task. This step was asked not to edit `notes/TASKS.md`, so the recheck's one line linking [[NAME-CHECK]] from it was left out. Whoever next edits the board can add it |
| `notes/review-packet/` | Rebuilt from the merged notes, not taken from either side |

- **[[NAME-CHECK]]:** its last bullet said the other founder's agreement to the name wasn't recorded. It
  now says both founders agreed on November 9 to keep the name and check the trademark search first,
  as item 12 of the November 9 entry in [[DECISIONS]] records.
- **[[CONTENT-REVIEW]], the Deaf and hard of hearing card question:** now says what [[SAFETY]] says
  about the FCC text-to-911 page: 403 on November 6, 7 and 8, so the monthly check lists it for a
  person; read twice in the built-in browser on November 8; the Deaf card, the 911 card, their Spanish
  twins, and the "Emergency services" row match it; a person should still open it.
- **`tools/check_site.py`:** findtreatment.gov stays off `KNOWN_BLOCKERS`. The link check found it
  answering twice today (below). The comment now says so. No rule changed.

## What was read today, and how

November 9, 2026, about 8:30 to 8:34 p.m. Eastern, in the Claude desktop app's built-in browser, in two
tabs opened for this and closed afterwards. Read as page text and from the page's code. Nothing was
called, texted, chatted, typed, or submitted; no call, text, or chat control was clicked, and no chat
address or chat page was opened. 988's cookie banner was declined with "I Reject".

| Page | What it shows |
| --- | --- |
| https://988lifeline.org/get-help/ | Call, Text, and Chat buttons leading to tel:988, sms:988, and chat.988lifeline.org. "To call a Spanish-speaking counselor, dial 988 and then press 2", text AYUDA to 988, and start a chat in Spanish, with the same in Spanish. The directory says 24/7 for 988 and for 988 in Spanish. The Veterans Crisis Line by calling 988 and pressing 1, texting 838255, or chatting. The notice that the LGBTQ+ youth "Press 3 option" has been restored |
| https://988lifeline.org/es/obten-ayuda/ | Llama, Textea, and Chatea lead to tel:988, sms:988, and https://chat.988lifeline.org/?lang=es; one "CHATEA CON 988 LIFELINE" link leads to https://chat.988lifeline.org/ without ?lang=es. Open 24 hours a day, 7 days a week. No cookie banner showed in the text read |

**No difference** from the November 8 record or the earlier November 9 re-read, and none from the
pages' wording, so no page changed and nothing goes in alerts. The other 11 rows weren't read again
today: the two records didn't differ there.

## findtreatment.gov and the link check

A small script outside the project passed only the site's two findtreatment.gov links,
https://findtreatment.gov/ and https://findtreatment.gov/es/, to `check_links` in `tools/check_site.py`,
twice, at 8:34:28 and 8:34:33 p.m. Eastern, with `KNOWN_BLOCKERS` as the merge left it
(chat.988lifeline.org and www.fcc.gov). Both links answered 200 both times, with no notes or failures.
The 988 chat addresses weren't requested. The full `--check-links` wasn't run, because it requests them.

## Checked

On a Mac, November 9, 2026. None of these is a phone test or a content review. Results are in the
section below, filled in after the final run.

## Not run

`tools/test_browser.py` and `tools/test_webkit.py`, because no page, stylesheet, or site script changed.
The rest of `tools/test_the_tests.py`, beyond the planted bugs this merge brought. The full
`tools/check_site.py --check-links`, which requests the 988 chat addresses. The live
`tools/check_crisis_sources.py` on every provider page. `tools/check_live.py --local`,
`tools/check_readability.py`, and the full suite. The iOS Simulator wasn't used, and nothing was tried
on a real phone. The FCC page and the other provider pages weren't opened today.

## Open points

- A person reads each provider's page and fills in "Person confirmed" in [[SAFETY]]. These reads don't
  replace that.
- [[CONTENT-REVIEW]]'s Spanish pages section says "The FCC's English and Spanish text-to-911 pages
  don't say" whether 911 takes Spanish. [[SAFETY]] records only the English FCC page, and this step
  didn't open a Spanish one. A person, or a later step, can record the Spanish page in [[SAFETY]].
- The pages still say an AI assistant compared the crisis numbers and links on November 6, 2026. That
  is still true. [[UPKEEP]] moves that date after a person's check.
- `tools/check_crisis_sources.py` doesn't read 988's Spanish Get Help page, so the monthly check won't
  notice if the ?lang=es chat address changes there.
- The USPTO search and the rest of [[NAME-CHECK]]'s last list are for a person or a lawyer.
- `notes/STATUS.md` and `notes/TASKS.md` weren't changed in this step. Whoever merges this branch can
  add a line to each, including the [[NAME-CHECK]] link the board left out.

## Next step

A founder reads this branch. If it is wanted, push it and open a pull request into
`claude/jolly-mayer-2m6eno`, or merge it there. Merging into that branch publishes nothing.

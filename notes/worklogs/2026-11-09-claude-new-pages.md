---
type: handoff
owner: Claude Code, at one founder's request
branch: build/new-pages-1109
---

# Two new draft pages: Make a safety plan, and After a suicide attempt

Date: November 9, 2026, with an update on November 10 at the end.

**State when written: local only,** on branch `build/new-pages-1109`, made from `830f766`, the tip of
`claude/jolly-mayer-2m6eno` (draft pull request 5's branch). Not pushed, not in any pull request, not
on the public website. No qualified person has reviewed either page, no fluent reader has checked the
Spanish, nobody who has survived an attempt has read it, and nothing was tried on a real phone.

## What was asked

Build two new draft pages, each with a Spanish twin, on the Shoreline look, following the "adding a
page" rules in `CLAUDE.md`:

1. **Make a safety plan**: what a safety plan is, the usual steps in plain words, and a blank plan to
   print and fill in by hand. Nothing typed, saved, or sent. Separate from idea E1 in the phone app,
   which this work doesn't touch.
2. **After a suicide attempt**: for people who survived an attempt and their families, what can help
   in the days and weeks after, how to reach 988 and 911, and where to find more.

## Completed

| Page | Address | What it has |
| --- | --- | --- |
| Make a safety plan | `safety-plan/` | Right now box, what a plan is, six steps (warning signs, things that help on your own, people and places, people to ask for help, professionals and crisis lines, making your space safer), making and keeping a plan, and a blank plan. On paper only the blank plan prints, on two pages in desktop Chrome, with 988 and 911 on it |
| Haz un plan de seguridad | `es/plan-de-seguridad/` | Spanish twin, an unreviewed AI translation. Its blank plan gives 988 press 2 and AYUDA |
| After a suicide attempt | `after-an-attempt/` | Right now box, if you survived, the days and weeks after, care and follow-up, a plan for hard moments, talking with others, a part for families, and where to find more |
| Después de un intento de suicidio | `es/despues-de-un-intento/` | Spanish twin, an unreviewed AI translation |

Both pages are drafts with the review note, the crisis strip, Quick exit, and the 988 panel, like
every other page. No method details. The blank plan is in Tidelight's own words, not a copy of the
Stanley-Brown form, and the page links that form through Get Help.

## Files

- New: the four pages above and this handoff.
- `assets/styles.css`: one marked block at the end for the blank plan (`.sp-*`). It reuses the wallet
  card page's `.print-area` and `print-page`, so only the plan prints. Pull request 11 swaps this
  stylesheet, so the block would need copying across.
- Every page's footer lists both pages. The phone menu doesn't, because it is already long.
- Get Help: a link under "Planning for a hard moment" and two pills in "More on this site". Help
  Someone: a link in "Follow up" to the family part of After a suicide attempt, and two pills. Same in
  both Spanish twins.
- `sw.js` (offline list, version 9), `.github/workflows/site.yml` (publish list), both About pages'
  review lists, `tools/make_review_packet.py` (sections PLAN, ATT, E-PLAN, E-ATT), rebuilt packets,
  `README.md`.
- `tools/check_site.py`: `SOURCES_READ_LATER`. Every page shows one date for its sources, and the older
  pages' sources were checked November 6. These four pages' sources were read November 9 and again November 10,
  so they share a date of their own, compared with each other. When every page's sources are checked again,
  move both dates with `tools/set_checked_date.py` and empty the set.
- `tools/test_browser.py`: the print test now treats only pages with wallet cards as card pages, and
  checks that the blank plan prints on one or two pages with 988 and 911.
- `tools/test_the_tests.py`: seven planted bugs (below).
- Notes: [[CONTENT-REVIEW]] (page status, the print control, questions, how the sources were read),
  [[SAFETY]] (988 pages read again November 9), [[FIRST-VERSION]] (both pages as drafts, two journeys).
  [[STATUS]] and [[TASKS]] were left for whoever merges this.

## Sources read November 9, 2026

In the built-in browser: 988's Get Help, What to Expect, and Help Someone Else pages; SPRC's Safety
Planning Guide and Stanley-Brown Safety Plan resource pages; FindTreatment.gov. Through a page reader
that returns the text with quotes: AFSP's After an attempt and When a loved one has made an attempt;
NIMH's Frequently Asked Questions About Suicide and Suicide Prevention; the Stanley-Brown site; SPRC's
Care Transitions.

Could not be read: SAMHSA's guides for attempt survivors and families (After an Attempt, and A Journey
Toward Health and Hope). Its library showed a human verification page and the old store links now go
elsewhere, so they aren't cited. 988's old attempt survivors page answers "not found". SPRC's quick
guide is a PDF of page images, so only its resource page is cited.

## Checks

All on this Mac, November 9, 2026. Desktop Chrome and its phone-size emulation, and macOS WebKit, are
kept apart. Nothing ran on a real phone or in the iOS Simulator.

- `python3 tools/check_site.py`: "Checked 25 pages. 117 different outside links." and "All checks
  passed.", with no "out of date" note after the packets were rebuilt.
- `tools/test_browser.py --only print,keyboard,jumps,nojs,language,offline,folds` on the four new
  pages, on the final text: keyboard 523, jumps 137, folds 4, language 4, nojs 4, print 4, offline 20
  checks passed, 0 failures. Desktop Chrome and phone-size emulation only.
- `tools/test_browser.py --only links,matrix,textsize,folds,a11ytree,modes` on the new pages and on Get
  Help, Help Someone, and their twins, before the last sentence edits: links 428, matrix 240, textsize
  144, folds 28, a11ytree 8, modes 32 passed, 0 failures. Notes only for small inline call links, as on
  Get Help already.
- `tools/test_webkit.py`, every page: "243 checks in WebKit on this Mac, 0 problems." Again on the two
  attempt pages after the last edits: 27 checks each, 0 problems. macOS WebKit, not iOS Safari.
- `tools/test_the_tests.py --only` "safety plan" (4 of 4 caught), "added later" (2 of 2), "left out of
  the" (13 of 13, including the offline-list and review-packet bugs that list pages), "blank printouts"
  (1 of 1), "wallet card" (1 of 1).
- The printed plan was looked at as a print-media screenshot in desktop Chrome: two pages in English
  and in Spanish.
- Not run: the full suite, the outside link check (`--check-links`), and the other browser groups
  (menu, quickexit, reducedmotion, contact, speed, privacy).

## Decisions made, easy to reverse

- **Footer, not the phone menu.** Both pages are in every footer and linked from Get Help and Help
  Someone. The phone menu already has nine entries.
- **Print only the blank plan,** reusing the wallet card page's print rules, with the draft notice and
  "not a crisis service" printed on it.
- **No firearms or medicines named** in "making your space safer", though AFSP's family page and NIMH
  name or point to them. A reviewer question.
- **One page for survivors and families,** with a part for families. A reviewer question.

## Open points

- Every reviewer question is in [[CONTENT-REVIEW]], "Questions about Make a safety plan and After a
  suicide attempt".
- A person should open SAMHSA's guides and decide whether to add them.
- Print the blank plan on a real printer, in English and Spanish, and fill one in by hand.
- Try both pages on a real phone ([[PHONE-TEST]] doesn't list them yet).
- [[STATUS]] and [[TASKS]] need a line for this branch when it is shared.

## Next step

A founder reviews the branch and decides whether to push it and open a draft pull request into
`claude/jolly-mayer-2m6eno`. Merging there publishes nothing.

## Update, November 10, 2026

Same branch, still **local only**. A second session picked up this branch and checked it again.

- **Sources read again.** Every source on both pages was read again in the built-in browser on November
  10, 2026: 988's Get Help, What to Expect, and Help Someone Else; AFSP's After an attempt and When a
  loved one has made an attempt; SPRC's Care Transitions, Safety Planning Guide, and Stanley-Brown Safety
  Plan pages; the Stanley-Brown site; NIMH's FAQ and Suicide Prevention pages; FindTreatment.gov. The
  claims still match. The four pages' source date is now November 10 (`Checked November 10, 2026` and
  `Fuentes consultadas el 10 de noviembre de 2026`), and the two planted bugs that quote it follow.
- **One wording change.** AFSP's safety plan list says to call 988, so After a suicide attempt's list
  item is now "Calling 988", not "Calling or texting 988", and the Spanish twin matches.
- **SAMHSA's guides, tried again.** The library opened today. A Journey Toward Health and Hope's product
  page gives October 2015; the family guide's old address answered "not found"; the guide files refused
  automated reads (403). Still not read or cited. They predate 988, so they may give older numbers. In
  [[CONTENT-REVIEW]].
- **Notes:** [[SAFETY]] records the 988 and NIMH re-read; [[CONTENT-REVIEW]] says how and when the
  sources were read; packets rebuilt.

Checks on November 10, on this Mac:

- `python3 tools/check_site.py`: "Checked 25 pages. 117 different outside links." and "All checks
  passed. This does not replace a real phone test or a content review.", with no "out of date" note.
- `tools/test_browser.py --only print,keyboard,jumps,nojs,language,offline` on the four new pages and on
  Get Help, Help Someone, and their twins: keyboard 1315, jumps 301, language 8, nojs 8, print 8,
  offline 24 checks passed, 0 distinct failures. "All browser checks passed." Desktop Chrome and its
  phone-size emulation only.
- `tools/test_webkit.py`: "243 checks in WebKit on this Mac, 0 problems." macOS WebKit, not iOS Safari.
- `tools/test_the_tests.py --only`: "safety plan" 4 of 4, "added later" 2 of 2, "left out of the" 13 of
  13, "blank printouts" 1 of 1, "wallet card" 1 of 1, "new page" 1 of 1 caught.
- Not run: the full suite, `--check-links`, and the browser groups links, matrix, textsize, folds, menu,
  quickexit, reducedmotion, contact, a11ytree, speed, modes, and privacy. Nothing on a real phone or in
  the iOS Simulator.

## Update, November 10, 2026: review fixes

Owner: Claude Code, at one founder's request. Branch `fix/new-pages-1109`, made from `2dfaf6f`, the tip
of `build/new-pages-1109`. **State when written: local only.** Not pushed, not in any pull request.

An AI code review raised two must-fix findings. Both were reproduced first.

- **The printed blank plan had text over its write-in lines.** Printing to PDF in desktop Chrome, the
  same way the print test does, showed the closing note ("A draft from Tidelight...", and the Spanish
  "Un borrador de Tidelight...") on top of step 6's second and third lines on page 2. The earlier
  "two pages" check above was a print-media screenshot, which can't show page splits. Cause: the plan
  was a grid, which Chrome splits badly across pages. Fix: in the marked `.sp-*` print block in
  `assets/styles.css`, the plan and its steps are blocks with margins in print. Every page of the PDFs
  was then looked at, English and Spanish, light and dark mode: two pages each, with 988 and 911, and
  nothing printed over the lines. `tools/test_browser.py`'s print test now fails if the plan or its
  steps print as grid or flex, with a planted bug in `tools/test_the_tests.py`. It checks the cause, not
  the overlap itself, which only shows in a PDF.
- **The safety plan page gave the evidence without its limits.** Both languages now add Get Help's two
  sentences: some of the research paired the plan with clinician contact and follow-up, so it doesn't
  show what a plan made alone would do, and for children and teens a review found no clear benefit.
  The two reviews are now in both pages' sources (10).

Sources read November 10, 2026, in the built-in browser: Nuij and colleagues 2021, full text on
Cambridge Core (every plan was made face to face with a clinician, four of six studies added it to usual
care, and the authors ask whether follow-up calls play a role); Albaum and colleagues 2025, abstract and
2026 correction notice on Europe PMC (10 studies, 5 pooled, no significant association). PubMed and JAMA
Pediatrics showed browser checks, which were left alone, so the page links what was read.

Smaller findings, as reviewer questions in [[CONTENT-REVIEW]] rather than page changes: whether the
printed plan should credit the Stanley-Brown steps, and the unsourced line "The time after leaving a
hospital is when support matters most" on After a suicide attempt, which assumes a hospital stay.

Checks, on this Mac, November 10, 2026:

- `python3 tools/check_site.py`: "Checked 25 pages. 119 different outside links." and "All checks
  passed. This does not replace a real phone test or a content review.", with no "out of date" note
  after the packets were rebuilt.
- `tools/test_browser.py --only links,print,keyboard,jumps,nojs,language,offline,folds,textsize,modes
  --pages plan`: links 105, textsize 36, keyboard 256, jumps 57, folds 2, language 2, nojs 2, print 2,
  offline 18, modes 8 checks passed, 0 distinct failures. `--only print --pages card,tarjeta`: print 2
  passed. Desktop Chrome and its phone-size emulation only.
- `tools/test_webkit.py`: "243 checks in WebKit on this Mac, 0 problems." macOS WebKit, not iOS Safari.
- `tools/test_the_tests.py --only "safety plan"`: all 5 caught, including the new one; `--only "wallet
  card"`: 1 of 1.
- Not run: the full suite, `--check-links`, the other browser groups, a real printer, a real phone, the
  iOS Simulator.

Next step: a founder decides whether to take these fixes into `build/new-pages-1109`.

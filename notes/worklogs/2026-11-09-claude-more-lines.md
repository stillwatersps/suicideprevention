---
type: handoff
owner: Claude, at one founder's request
branch: build/more-lines-1109
---

# Task handoff: more lines and what to say on Get Help

Date: November 9, 2026, updated November 10, 2026. State when written: local only. Not pushed, no pull request, not on `main`.

Branch `build/more-lines-1109`, started from `830f766`, the tip of `claude/jolly-mayer-2m6eno` (draft
pull request 5), which uses the Shoreline stylesheet. Merging it there publishes nothing.

## Completed

Two drafts on Get Help and its Spanish twin, both for the licensed reviewer, and the Spanish marked as
an unreviewed AI translation like the rest of that page.

- **What to say when you call or text 988** (`#what-to-say`), first among the page's sections. It says
  you don't need special words, gives five example first words labelled as Tidelight's, not 988's, and
  says what 988 says happens next. On November 10 its text steps were corrected to say a "Wait" message
  comes, as 988's pages say, rather than that it may. The Spanish version starts with the Spanish routes and gives
  «siguiente», from 988's Spanish What to Expect page.
- **Lines for specific groups** (`#more-lines`), after "Other ways to reach someone": a first paragraph
  that names each group, says which keep set hours, and says 988 is open any time, then four cards
  behind Show more:
  - National Maternal Mental Health Hotline (HRSA). 24/7, English and Spanish. The card says HRSA's
    pages don't call it a crisis line or say what to do in an emergency.
  - Disaster Distress Helpline (SAMHSA). 24/7 crisis support, press 2 for Spanish.
  - Teen Line (Didi Hirsch). Not open all day and night: calls 6 to 10 p.m. and texts 6 to 9 p.m.
    Pacific. English only, up to age 19.
  - Trans Lifeline. Not open all day and night: weekdays 10 a.m. to 6 p.m. Pacific. Phone only, press 2
    for Spanish, and no emergency services without the caller's explicit request.
- **Left off:** the Friendship Line for older adults. Its page says it serves people in California and
  doesn't say whether others are served. Recorded in [[SAFETY]] without its numbers.

Files:

- `get-help/index.html`, `es/obtener-ayuda/index.html`: both sections, table of contents, sources (38
  on the English page).
- `notes/SAFETY.md`: four new table rows, so the site check now allows their numbers; notes on what a
  person should confirm; the Friendship Line under "Left off"; HRSA's page under "Only a person can
  check"; TEEN added to the blank-text-message note; 988's texting row read again.
- `tools/check_crisis_sources.py`: five provider pages checked monthly, with their keyword next to its
  number and their set hours; 9 new self-test cases.
- `tools/check_site.py`: `mchb.hrsa.gov` added to `KNOWN_BLOCKERS`, because HRSA's page answered 403 to
  both of the monthly check's reads. Without it, every monthly run and the link check would fail.
- `tools/test_the_tests.py`: 12 planted bugs, all named "a group line".
- `notes/CONTENT-REVIEW.md`: control rows, how the sources were read, reviewer questions, and a
  human-only checklist item. Review packets rebuilt.

`sw.js`: VERSION not changed. Its rule is to change it when the core file list changes or a crisis
detail is corrected. Neither happened: no page was added, and these are new details, not corrections.
Get Help is read from the network first, so visitors with a connection get the new version.

## Sources read, November 9 and 10, 2026

All in the desktop app's built-in browser, on both days. On November 10 every detail on the two
sections still matched, apart from the Wait message above. Nothing was called, texted, chatted, or submitted, and no
chat page was opened.

- HRSA: https://mchb.hrsa.gov/programs-impact/national-maternal-mental-health-hotline and its Spanish
  page https://mchb.hrsa.gov/es/programas-impacto/linea-nacional-asistencia-salud-mental-materna
- SAMHSA: https://www.samhsa.gov/find-help/helplines/disaster-distress-helpline and its Spanish page
  https://www.samhsa.gov/find-help/helplines/disaster-distress-helpline/espanol
- Didi Hirsch: https://didihirsch.org/teenline/ and https://didihirsch.org/teenline/hotline-support/
- Trans Lifeline: https://translifeline.org/hotline/ and https://translifeline.org/es/linea-de-ayuda/
- Institute on Aging: https://www.ioaging.org/friendship-line/ (not used)
- 988: https://988lifeline.org/, https://988lifeline.org/get-help/,
  https://988lifeline.org/get-help/what-to-expect/, its Spanish What to Expect page
  https://988lifeline.org/es/obten-ayuda/que-puede-esperar/,
  https://988lifeline.org/faq/texting-the-988-lifeline/,
  https://988lifeline.org/faq/calling-the-988-lifeline/, and https://988lifeline.org/help-someone-else/

The saved patch from November 8 for this task was used only as a reference. Every number, hour, and
claim was read again on November 9, and again on November 10.

## Checked

Results below are from November 10, 2026, after the re-read. Desktop Chrome and its phone-size emulation, and macOS WebKit. Not a real phone, not the iOS Simulator,
not a screen reader, and not a content review.

- `python3 tools/check_site.py`: all checks passed, no "out of date" note.
- `python3 tools/check_site.py --check-links`: all checks passed. HRSA's two pages are notes (403), like
  the FCC's and 988's chat.
- `python3 tools/check_site.py --self-test`: all 5 made-up link answers read correctly.
- `python3 tools/check_crisis_sources.py --self-test`: all 29 made-up cases read correctly.
- `python3 tools/check_crisis_sources.py`, against the live pages: every new detail found on SAMHSA's,
  Teen Line's, and Trans Lifeline's pages. HRSA's page answered 403 on November 9, which led to the
  `KNOWN_BLOCKERS` change, and again on November 10: "Checked 17 provider pages, 2 left for a person
  to open" (HRSA and the FCC).
- `python3 tools/test_the_tests.py --only "group line"`: all 12 planted bugs caught. Existing related
  ones rerun one by one, all caught.
- `python3 tools/test_browser.py` with links, matrix, textsize, keyboard, jumps, folds, language,
  a11ytree, print, contact, privacy, and nojs, for `get-help` and `obtener-ayuda`: all passed. Four
  notes per page about tap targets in "Right now" are older than this work (seen November 9).
- `python3 tools/test_webkit.py --pages get-help` and `--pages obtener-ayuda`: 27 checks, 0 problems,
  each.
- Not run: the full suite, the menu, quickexit, offline, speed, modes, and reducedmotion groups.

## Decisions and open questions

Nothing here is agreed by the founders or reviewed by a qualified person. Questions for the reviewer are
in [[CONTENT-REVIEW]], under "Questions about the November 9 Get Help additions". The main ones:

- Which lines Get Help should list, and whether For Teens should list Teen Line and Trans Lifeline.
- Whether the five example first words are right.
- How to say that two lines keep set hours, and that HRSA's pages don't call its line a crisis line.
- A person should ask SAMHSA about Spanish by text, the Institute on Aging about callers outside
  California, Trans Lifeline about its current holiday closures, and Teen Line about daylight saving.

## Next step

A founder reviews the branch and decides whether to merge it into `claude/jolly-mayer-2m6eno`. Then the
reviewer reads the two sections in the rebuilt packet, and a person reads HRSA's page in a browser.

---
type: handoff
owner: Claude Code (cloud session), at one founder's request
branch: claude/jolly-mayer-2m6eno
---

# Second batch of approved ideas

Date: November 6, 2026.

One founder approved C2, C3, C4, C5, C6, D1, D2 and D3 from [[IDEAS]]. The other
founder has not agreed yet. See [[DECISIONS]].

## Completed

| Idea | What was built | Files |
| --- | --- | --- |
| C2 Monthly link check | GitHub opens every outside link on the 1st of each month. Providers that block scripts are listed for a person, not failed | `.github/workflows/monitor.yml` |
| C3 Daily live check | Every morning, every live page must load and show 988, 911 and the "not a crisis service" line | `tools/check_live.py`, `.github/workflows/monitor.yml` |
| C4 Plain language | Report of reading level and sentences over 25 words; runs with every pull request, information only | `tools/check_readability.py`, `.github/workflows/site.yml` |
| C6 User test | Plan with safety steps, 7 made-up tasks, and questions | [[USER-TEST]] |
| D1 Myths and facts | Five facts at the top of Research, each linking to where its source is cited. Also in Spanish | `research/`, `es/investigacion/` |
| D2 Wallet card | Page with a poster and 8 wallet-size cards per sheet, print button, cut lines. Text only from the [[SAFETY]] table. English and Spanish | `card/`, `es/tarjeta/`, `assets/styles.css`, `assets/menu.js` |
| D3 For Teens | Page built from Get Help and Help Someone text: reaching out yourself, trusted adults, privacy, a worried friend. English and Spanish. In the main menu | `teens/`, `es/adolescentes/` |

Also: "For Teens" and "Adolescentes" are in every main menu, "Wallet card" and
"Tarjeta para imprimir" in every footer, and Get Help links to the teen page.
The offline list in `sw.js` (now version 2) and the publish list include the new
pages. `tools/check_site.py` now accepts pages linked from the footer only.

**C5 is on hold.** Draft pull requests 1, 7 and 8 were opened by the other founder's
account, so they were not closed. Closing is reversible and keeps the branches.

## Checked

- `python3 tools/check_site.py`: all checks passed, 13 pages.
- All 13 pages at 320, 390 and 1440 pixels, light and dark: no sideways scrolling,
  no errors, contrast at least WCAG AA. Folds and quick exit still work.
- `tools/check_live.py` against a local copy: 12 pages pass; a copy with a broken
  911 link fails, as it should.
- Printed the card pages to PDF: page 1 is the poster, page 2 is eight 3.5 by 2
  inch cards with dashed cut lines; the site header, crisis strip, quick exit and
  footer don't print.
- Readability: English pages read at about grade 3 to 7; 56 long sentences listed.
- Both workflow files parse.

Not checked: the scheduled runs themselves (they only start once on `main`), real
phones, real printers, and the content.

## Decisions and open questions

- Scheduled failures notify the GitHub account that last changed the schedule
  lines. A founder should check their notification settings, or watch the Actions tab.
- GitHub pauses schedules in a public repository after 60 days without commits.
- Reviewer questions for D1 to D3 and the long sentences are in [[CONTENT-REVIEW]].

## Next step

The other founder reviews [[IDEAS]] and pull request 5, and decides about pull
requests 1, 7 and 8.

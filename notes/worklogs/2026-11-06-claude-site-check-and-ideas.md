---
type: handoff
owner: Claude Code (cloud session), at the user's request
branch: claude/jolly-mayer-2m6eno
---

# Site check and improvement ideas

Date: November 6, 2026.

## Checked

Tested the newest version (`site/phone-accessibility-content`, commit `cd404ed`,
draft pull request 6) and the live `main` (commit `d610002`), without changing
either.

- `python3 tools/check_site.py` on the newest branch: all checks passed, 5 pages.
- Served the newest branch the way GitHub Pages does and rendered Home, Get Help,
  Help Someone, Research and the 404 page at 320, 390 and 1440 pixels: no sideways
  scrolling, no script or file errors, every internal link and section jump works,
  call and text links present, the phone menu opens.
- Live `main`: the same browser test passed on its 4 pages. The latest GitHub
  Pages deploy (for pull request 4) succeeded.
- Basic accessibility: one main heading per page, no skipped heading levels,
  every image has alt text. Links that looked unnamed are all inside collapsed
  "Sources" sections, so they are fine.
- The 988 LGBTQ+ youth option on Get Help matches [[SAFETY]] and [[DECISIONS]] on
  that branch: shown as a draft, with a reviewer question.

Not checked: real phones, screen readers, and the content itself.

## Completed

- Wrote [[IDEAS]]: 13 proposals, split into ones that need no clinical review and
  ones that need the licensed reviewer. None is approved.

## Next step

Founders mark each idea in [[IDEAS]] and move approved ones to [[TASKS]].

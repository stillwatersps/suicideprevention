---
type: handoff
owner: Claude Code (cloud session), at one founder's request
branch: claude/jolly-mayer-2m6eno
---

# Merging every pull request that publishes nothing

Date: November 9, 2026.

**State when written: merged into `claude/jolly-mayer-2m6eno`, pull request 5's branch. Not on
`main`, not on the public website.** The other founder's agreement isn't recorded.

## What was asked

One founder asked to merge all the pull requests. Claude explained that three of them (5, 8 and 12)
publish to the public website, that 12 conflicts with 5 and 8, and that 11 (signage) and 14
(Shoreline) are rival designs for the same stylesheet. The founder chose to merge only those that
publish nothing.

## What was merged

| Pull request | Branch | Into |
| --- | --- | --- |
| 15, Daily check-in | `site/daily-check-in` | `site/pro-max-redesign` |
| 14, Shoreline | `site/pro-max-redesign` | `site/first-version-finish` |
| 13, compact crisis strip | `site/compact-crisis-strip` | `site/first-version-finish` |
| 10, first version finish | `site/first-version-finish` | `claude/jolly-mayer-2m6eno` |

Left open: 5, 8 and 12 (they publish), and 11, signage, which would now conflict with Shoreline.

## Fixes the combined version needed

The full browser tests found 27 problems when the compact strip met Shoreline and the check-in:

- The two Daily check-in pages, built after the compact strip, lacked its markup, so the full strip
  pinned on short screens and took up to 43% of the height. They now have it.
- On a 640 px screen with 200% text, the homepage's three cards ran 2 to 24 px off screen. They now
  stack into one column on tablet-width screens with larger text. At the default text size,
  nothing changes.
- The review packets had merge conflicts and were rebuilt.

## Checked

In Chromium on Linux, November 9, 2026. Not on a real phone.

| Check | Result |
| --- | --- |
| `python3 tools/check_site.py` | All checks passed, 21 pages |
| `python3 tools/test_browser.py` | All groups passed, after the fixes |
| `python3 tools/test_the_tests.py --only strip` | See the result line below |

## Next step

Both founders look at pull request 5's branch, choose between Shoreline (now on it) and signage, and
decide what the public site should show ([[DECISIONS]], open decision 1).

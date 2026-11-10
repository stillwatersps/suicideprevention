---
type: handoff
owner: Claude, at one founder's request
branch: build/strip-1109
---

# Crisis strip fixes, November 9 and 10

Owner: Claude, at one founder's request. Branch: `build/strip-1109`, from 830f766, the tip of
`claude/jolly-mayer-2m6eno` (draft pull request 5's branch). Started November 9 and stopped by a
usage limit; finished November 10, 2026. **State when written: local only.** Not pushed, no pull
request, not merged, not on the public website. A proposal for both founders and the reviewer, like
the rest of the strip work in [[DECISIONS]]. No qualified person has reviewed any of it, and nothing
was tried on a real phone. The iOS Simulator wasn't used in this task.

## What changed

1. **The compact strip's last local work, merged** (a3f051a, November 9): `site/compact-crisis-strip`
   at deb6f2f, with the full strip's floors in px, the check that the compact block's English and
   Spanish copies match, and the iOS Simulator record of November 8 with its screenshots, in
   [[worklogs/2026-11-07-claude-compact-strip]]. The stylesheet merged cleanly onto Shoreline, which
   changes only the strip's colors and fonts. Packets rebuilt.
2. **The earlier review's points** (41f5dca, November 9, and this session):
   - The copy check in `tools/check_site.py` evens out spacing before comparing, and fails on a rule
     inside one copy's block that isn't written for that language. Its `--self-test` tries ten
     made-up edits both ways, one of them added today. It now also compares a rule for the page's
     root, `html[lang="..."]`, in each copy, which is where the compact strip sets its jump padding.
   - The jump padding rules at the top of `assets/styles.css` and their comments are rewritten (item
     3 below), so they match where the strip pins.
   - The compact strip handoff says nine of the ten November 8 planted bugs replace exact lines.
   - [[DECISIONS]]: the floors sentence now lists every kind of screen that pinned the strip with 75%
     text before the floors and scrolls it away now, measured again on Shoreline today (see below).
     The earlier review named Spanish pages 536 to 543 px wide; today's measurement, at every second
     width, found 528 to 543 px, from about 181 px tall.
3. **Jump links** ("Where a jump link stops" in `assets/styles.css`). Before, one length in rem left
   links behind the pinned strip with smaller text, such as 84 px of padding under a 96 px strip at
   12 px text, and on Spanish pages 481 px wide, where the strip takes three rows, and it pushed
   links into the lower half of short screens with larger text, where nothing is pinned. Now the
   padding is the larger of `--jump-px`, the pinned area's height at the default text size plus
   about 14 px, set by width in px, and `--jump-em`, the same height in rem, set by width in em, at
   most half the screen. With smaller text the strip and header are never taller at the same width
   in px, and with larger text never taller in rem at the same width in em, measured at every text
   size from 16 to 32 px. Where nothing is pinned, the rules that unpin the strip or header set both
   to 1rem; the compact strip sets its own, in both copies.
   - Wide screens: the sticky header now unpins where it would take more than half the screen
     (under 15.25em tall), and without JavaScript, where it holds the whole menu with larger text (up
     to 12.1rem), where it would take more than a third (under 36.25em tall). Before, without
     JavaScript, at 960 px wide with 32 px text, the header was 357 px tall, taller than a 301 px
     screen. The header's widths were measured on all 21 pages, because the current page's menu item
     is bold, which moves them a few px.
4. **Narrow screens just over 300 px tall** ("Narrow screens just over 300px tall"). At the default
   text size the pinned full strip took up to 61% of the height (Spanish, 257 by 301). Now:
   - where it would take more than a quarter, the compact strip pins where its row fits: a new outer
     limit, under 384 px tall and up to 703 px wide (and 43.99em, so smaller text keeps its one-row
     full strip), from 312 px wide in English and 544 px in Spanish;
   - where the row doesn't fit, the full strip stays pinned up to a third of the height, and above a
     third it scrolls away and Quick exit floats: English up to 299 by 353 and 259 by 418; Spanish up
     to 366 by 353, 324 by 418, 320 by 491 and 278 by 556. Each limit is three times the strip's
     measured height there;
   - Spanish pages 481 to 504 px wide under 568 px tall, and 481 to 622 px wide under 485 px tall,
     leave out the strip's extra words, which made it 142 px or 121 px tall there.
   The trade-off is in [[DECISIONS]], and a question for the reviewer in [[CONTENT-REVIEW]].
   Measured at the default size, both languages, every width from 240 to 959 px at 18 heights from
   301 to 600 either side of each limit, and every third width at every sixth height: no pinned strip takes more than a third (worst 33.3%), and it takes more than a quarter
   only where the compact row doesn't fit (English 257 to 311 px wide, Spanish 257 to 543 and 704 to
   707). Every size that pinned at a quarter or less is unchanged at the default size. With smaller
   text the new limits follow the default size, so some sizes that pinned at a quarter or less with
   75% or 87.5% text now scroll the strip away, such as a Spanish page 258 by 450 at 75%.
5. **More test sizes** in `tools/test_browser.py` and, at the default text size, `tools/test_webkit.py`.
   They are typical sizes, not measured on devices: an Android phone in split-screen upright (412 by
   400, 360 by 330) and on its side (456 by 380), a foldable's cover screen (280 by 653) and the
   same in split-screen (280 by 320), its inner screen (700 by 840, 840 by 700), and very small
   screens (240 by 320, 280 by 280). `EXPECT` says which strip each must show in each language. Some
   also run with 75%, 150% or 200% text. The matrix also sweeps 38 widths by 21 heights at the
   default size, both languages, for the rules in item 4. No page problem showed at these nine
   sizes, check-in pages included. Two showed elsewhere: the header in item 3, fixed, and the
   floating Quick exit on narrow, tall screens, not fixed (see "Not done, and open"). The audit's
   NOTE lines, links in sentences under the project's 44 px aim, are the same kind as at other
   narrow sizes.

Tests added: the jumps group compares the scroll padding with what is pinned at 56 widths by 25
heights and 11 text sizes from 12 to 32 px, with and without JavaScript, on one English and one
Spanish page, and four more sizes follow every jump link. Fourteen planted bugs are new and one is
rewritten: seven for jump links and the header, five for item 4 in Chrome and one in WebKit, and
one for the copy check. The jumps test also fails where nothing is pinned and a link would stop
over a quarter of the screen down. The text size test now also fails where smaller text pins the
strip and 100% doesn't, as "Floors in px" says it must not, and tries 640 by 290 and 250 by 500 at
75%, where only the floors in px decide. Three older planted bugs were updated, because the new
rules hid what they plant: the compact strip's floors removed from its outer limits, the full
strip's width floor removed, and jump links stopping low where the strip scrolls away.

## Measured

All in desktop Chrome's phone-size emulation on this Mac, November 10, 2026, on the Shoreline
stylesheet, unless it says WebKit. Words wrap differently in other fonts, so on a phone the widths
can be a little off.

| What | Result |
| --- | --- |
| Full strip height at the default size, English | 141.5 px up to 259 px wide (139.5 on screens 480 px tall or less), 119.75 up to 299 (117.75), 98 (96) on two rows, 48 on one row from 759 px, or 704 px when 480 px tall or less |
| Full strip height at the default size, Spanish | 185.5 up to 278 (183.5), 163.75 up to 320 (161.75), 141.5 up to 324 (139.5), 119.75 up to 366 (117.75), 98 (96); over 480 px tall, 142 from 481 to 504 and 121.05 to 622; 48 on one row from 708 px when 480 px tall or less |
| Header height on wide screens, all 21 pages | 73 px; 96 px up to 1042 px wide in English and 1303 in Spanish; 122 px up to 1031 px in Spanish. Without JavaScript and with larger text, up to 12.1rem |
| Worst pinned share, narrow screens 300 to 600 px tall, before and after | Every third width from 240 to 959 px, every sixth height from 300 to 600. 12 px text: 37.0% before, 31.4% after; 14 px: 52.0%, 32.8%; 16 px: 60.0%, 33.3%; 18 px: 55.2%, 46.5%; 20, 24 and 28 px unchanged at 45.7%, 42.2% and 40.2%; at 32 px the full strip doesn't pin there |

## Checked

Exact result lines are in the final report of this task. Before the final commit: `check_site.py`
and its `--self-test`, the test_browser groups matrix, textsize and jumps, `test_webkit.py` (543
checks, 0 problems), and every planted bug added or touched here, all passing. A first full run, on
022d939, found two planted bugs that the new rules hid, fixed since, and stopped twice when Chrome
closed its connection in the jumps group, and once on a WebKit page that didn't load, while other
sessions loaded this Mac (load average about 20). The full suite was run again on the final commit.

## Not done, and open

- **Quick exit on narrow, tall screens, found, not fixed.** Up to 256 px wide the full strip scrolls
  away and Quick exit floats in the corner. On a tall screen, from about 844 px at the default text
  size and 600 px at 75%, such as 250 by 844, it covers a crisis button on the first screen of
  some pages, at 250 px wide 7 of 21 pages at 844 px tall and 17 at 1000 px. This was so before
  this task. A possible fix, not built: pin the full strip there while it takes a third of the
  height or less, as item 4 does. At 250 px wide it is 142 px tall in English and 164 px in
  Spanish. It would change the full strip's width floor, so it needs its own measurements and
  tests.
- **Larger text on narrow, short screens.** With 18 to 28 px text the full strip can still take 40
  to 46% of a narrow screen 300 to 600 px tall, as before. The limits in item 4 are in px for the
  default size. Open for both founders.
- **The 4 px band.** Spanish pages 704 to 707 px wide under 384 px tall pin the two-row full strip
  at up to 32%, though the compact row would fit, because the compact strip's outer limits are
  shared with English, which shows one row there.
- **Larger text and jump links.** Where the strip has fewer rows with larger text than the padding
  allows for, a link can stop lower than it needs to, at most half the screen.
- **Fonts.** Every width here is from macOS fonts. On Android, Roboto may wrap at other widths. A
  real phone test, from [[PHONE-TEST]], would show it.
- **Pull request 11** rewrites the same stylesheet. Whichever merges second needs the strip's
  heights measured again, and the jump padding values with them.

## Next step

A founder reads the new strip entry in [[DECISIONS]] and the question in [[CONTENT-REVIEW]], then
tries a phone in split-screen, upright and on its side, with [[PHONE-TEST]].

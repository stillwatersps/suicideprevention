---
type: handoff
owner: Claude Code, at one founder's request
branch: site/compact-crisis-strip, from build/compact-strip (based on f2e6a70), combined with 7d05f06
---

# Compact crisis strip

Date: November 7, 2026. A proposal for both founders, not agreed by either yet. **State when written:
local commits only, not pushed or merged.** `site/compact-crisis-strip` is meant to become a draft pull
request into `site/first-version-finish`, the branch behind draft pull request 10. Merging it there
publishes nothing.

## What changed

- **A compact strip where the full one used to scroll away.** On short screens, such as older phones
  on their side, and with larger text on a phone on its side, the pinned strip becomes one row: "Call
  988 · Text 988 · Call 911", with Quick exit inside. In Spanish: "Llama al 988 y marca 2 · Envía AYUDA
  al 988 · Llama al 911". It pins only where that row fits and takes a quarter of the screen's height
  or less. Every size that pinned before looks the same, and where the row doesn't fit, the strip
  scrolls away as before and Quick exit floats. See the strip entry in [[DECISIONS]].
- **All 19 pages.** The strip's lead-in words, its "or" (", o" in Spanish) and its end periods are
  wrapped in spans, so the stylesheet can hide them. No word or link changed, so each link still shows
  its number, and the site check's label and number checks pass.
- **`assets/styles.css`.** One new block after the Quick exit rules, with a copy for each language,
  because the Spanish row is about 1.7 times as long: it needs 34em of width where English needs
  19.5em. Both leave about 3% to spare at the default text size. Each width limit also has a floor in
  px, 312 px in English and 544 px in Spanish, because about 72 px of the row, its padding and Quick
  exit's frame, gap and icon, doesn't shrink with a smaller text setting. The height limits keep the
  row to a quarter of the screen at any text size. In the compact row, dots replace "or" and the
  lead-ins, and a screen reader still hears each link's full name.
- **Tests.** `tools/test_browser.py`: 568x300 and 640x290 join the sizes where the strip must pin; on
  phones on their side a pinned strip must be one row of 25% or less; 750x292 joins the larger-text
  sizes, with a list of where the strip must still pin at 150% and 200%, by language; Quick exit is
  tested inside the compact strip at 640x290. The audit now centers each crisis link twice before
  checking it can be tapped, because WebKit with a desktop scrollbar left the first scroll short at
  640x290. `tools/test_webkit.py`: the two new sizes and the one-row check. `tools/test_the_tests.py`:
  seven planted bugs. More checks came after the review below.
- **Notes.** The strip entry in [[DECISIONS]], a question for the reviewer in [[CONTENT-REVIEW]], a
  row in [[PHONE-TEST]], and the strip item in [[FOUNDER-BRIEF]].

## After an independent review

An AI reviewer found three problems. Each was checked first, and each was real.

- **The tests couldn't catch a broken limit.** With the height limit removed, the strip pinned at
  568x150 and 640x180 at 27% to 32% of the screen, and with the English width limit lowered to 1em it
  pinned on two rows at 320x568 with 200% text. The tests passed both. Now:
  - Wherever the compact strip pins, at every size and text size, in Chrome and WebKit, it must be one
    row of 25% or less. The audit reports whether the compact strip is in use, and the share of the
    screen to a hundredth of a percent.
  - Quick exit must ride inside a pinned strip, and float in the corner wherever the strip scrolls
    away, at every size.
  - 640x180, below the height limit, joins the sizes. The strip must scroll away there.
  - At 568x300 and 640x290 the compact strip must be in use in both languages. This also proves the
    audit can tell.
  - 568x300 and 640x290 join the larger-text sizes. English must pin at 150% on both, and at 200% on
    640x290.
  - 75% text at 236x200 and 410x200, just past where the width limits would be without their floors in
    px. English must pin at 410x200.
  - Seven more planted bugs: the height limit removed, the English width limit lowered, each floor in
    px removed, the full strip pinned on a screen too short for it, Quick exit scrolling away with the
    strip, and a class renamed so the audit can't see the compact strip.
- **[[FOUNDER-BRIEF]] still described the old behavior** and called the question open. Its strip item
  now says where the compact strip pins in each language, and where it still scrolls away.
- **With a default text size under 16px, the compact row could wrap to two rows and stay pinned,**
  covering 38% to 48% of the screen. Desktop Chrome's "Small" font size, 12px, did this at 234 to 238
  px wide in English, and at 408 to 413 px in Spanish. At 13px, Spanish did it at 442 px. The floors in
  px fix this. A check of 3,670 cases near the limits, at 12px to 32px, found 28 such cases before the
  fix and none after, and every case at 16px or more is unchanged.

## Measured

Desktop Chrome's phone-size emulation, the home page in each language, with the text size set to 100%,
150% and 200%. "Before" is f2e6a70.

| Size | Text | English | Spanish |
| --- | --- | --- | --- |
| 640x290 | 100% | Scrolled away (92 px) → one row, 48 px, 17% | Same as English |
| 568x300 | 100% | Scrolled away (92 px) → one row, 48 px, 16% | Same as English |
| 844x390 | 150% | Scrolled away (108 px) → one row, 56 px, 14% | Same as English |
| 750x292 | 150% | Scrolled away (108 px) → one row, 56 px, 19% | Still scrolls away |
| 640x290 | 150% | Scrolled away (108 px) → one row, 56 px, 19% | Still scrolls away |
| 568x300 | 150% | Scrolled away (105 px) → one row, 55 px, 18% | Still scrolls away |
| 844x390 | 200% | Scrolled away (129 px) → one row, 66 px, 17% | Still scrolls away |
| 750x292 | 200% | Scrolled away (124 px) → one row, 64 px, 22% | Still scrolls away |
| 640x290 | 200% | Scrolled away (124 px) → one row, 64 px, 22% | Still scrolls away |

Unchanged in both languages: 390x844, 320x568, 768x1024 and 1440x900 at every text size, 750x292 and
844x390 at 100%, and 568x300 at 200%. At 390x844 with 200% text, and 320x568 with 150% or more, one row
can't fit, so the strip still scrolls away there.

Also changed, found after the review: at 320x225, the tests' 1280 by 900 desktop window zoomed to 400%,
the English strip now pins as one row, 48 px, 21%. The Spanish one scrolls away there as before. With
text smaller than the default, the compact strip needs as much width as at 100%: 312 px in English and
544 px in Spanish. Narrower than that it scrolls away, as before this branch.

## Checked

On `build/compact-strip` at 7f07136, a local branch that isn't on GitHub, before it was combined with
7d05f06. Final results, after the review fixes:

- `python3 tools/check_site.py`: all checks passed. Its one note says the review packets are out of date.
- `python3 tools/test_browser.py`, every group: all browser checks passed, in desktop Chrome and its
  phone-size emulation. Matrix 570 checks, text size 342, Quick exit 87, keyboard 2,594, and the rest.
- `python3 tools/test_webkit.py`: 189 checks, 0 problems. Before the review, its first run found 20 at
  the two new sizes: the Spanish width limit, and the short first scroll described above. Both are fixed.
- `python3 tools/test_the_tests.py --only strip` caught all 33 planted bugs, `--only "Quick exit"` all 14,
  and `--only "audit losing sight"` its one. On 7f07136 and later, `--only strip` selects 34, because
  the audit bug's name says strip too. The full run on the combined branch, below, caught all 138.
- The reviewer's two broken limits, planted again on the fixed branch: the browser tests now fail both.
- Screenshots in Chrome at 640x290 and 568x300, light and dark, and in WebKit at those sizes, checked by
  eye before the review. After it, Chrome at 640x180, and with 75% text at 236x200, 312x200, 410x200
  and 544x200.
- Not tried on a real phone, in the iOS Simulator, or with a screen reader.

## Combined with pull request 10's branch

`site/compact-crisis-strip` is `build/compact-strip` (7f07136) merged with 7d05f06, the newest commit
of `site/first-version-finish` when this was done. 7d05f06 brings the first-version brief,
[[FIRST-VERSION]], and the Spanish review sections, with two new failures in `tools/check_site.py`:
text that no review packet shows, and English-page text that looks Spanish but isn't marked
`lang="es"`. See [[worklogs/2026-11-07-claude-spanish-sections|that handoff]].

- **No conflicts.** Git merged `notes/CONTENT-REVIEW.md` and `tools/test_the_tests.py` on its own,
  because the two sides changed different lines. Both sides are kept: this branch's question about the
  compact strip, the other side's notes on Spanish review records, and all 138 planted bugs on a Mac,
  the 124 on 7d05f06 and the 14 this branch added.
- **The new checks pass with the strip's spans,** with no change. The spans sit inside the strip's two
  paragraphs, which the packets number, so none of the strip's text is outside them. The English strip
  has no Spanish, and the Spanish strip is on the Spanish pages, marked `lang="es"`. 7d05f06 changes no
  page or stylesheet, so the pages here are the same as on `build/compact-strip`.
- **Review packets rebuilt,** HTML and PDF. Against 7d05f06, the HTML changed in two places only: the
  compact strip's question for the reviewer, in Part 6 of the therapist's packet, and the packet
  fingerprint in both packets. No section's fingerprint changed, because the spans change no word of
  the strip.
- **Offline copies:** `sw.js` keeps `VERSION = 'tidelight-v7'`. Its rule is to change it when the list
  of core files changes or a crisis detail is corrected, and neither happened. The strip shows the same
  numbers and words, only fewer of them on short screens. The worker asks the network first, so a
  visitor with a connection gets the new stylesheet without a new version.

Checked on the combined branch, on a Mac, November 7, 2026, at commit 31a7d29. After that only notes
changed: this handoff, and two more notes under "After a second review", below. The results:

- `python3 tools/check_site.py`: all checks passed, 19 pages. Before the rebuild, its one note said the
  review packets were out of date. After it, there is no note. `--self-test`: all 5 made-up link answers
  read correctly.
- `python3 tools/launch_gate.py --self-test`: all 61 made-up cases read correctly.
  `python3 tools/check_crisis_sources.py --self-test`: all 20 made-up cases read correctly.
- `python3 tools/check_live.py --local`: all 18 pages load and show their crisis help, and so do a wrong
  address and 6 files. No notes or tools are published. `python3 tools/check_readability.py` ran without
  errors.
- `python3 tools/test_browser.py`, every group: all browser checks passed, in desktop Chrome and its
  phone-size emulation. Matrix 570 checks, text size 342, Quick exit 87, keyboard 2,594, and the rest.
  It took 318 seconds, while another copy's planted-bug run used the same Mac.
- `python3 tools/test_webkit.py`: 189 checks in macOS WebKit, 0 problems, in 86 seconds.
- `python3 tools/test_the_tests.py`, in full: the untouched copy passed all 25 test groups and 6 other
  checks, and all 138 planted bugs were caught, in 684 seconds.
- `python3 tools/make_review_packet.py --no-pdf` afterwards left the packet HTML unchanged, so the
  packets were current, and nothing in the project was left changed.
- Not tried on a real phone, in the iOS Simulator, or with a screen reader.

## Overlap with draft pull request 11

Draft pull request 11 (`site/signage-redesign`, another session's work, into `site/first-version-finish`)
rewrites `assets/styles.css` for a new visual design. That's why the compact strip has a pull request of
its own. Whichever of the two merges second must:

- Carry the compact block, both language copies, onto the other stylesheet.
- Measure the width floors again, 19.5em and 312 px in English and 34em and 544 px in Spanish, and the
  height limit, because they depend on the strip's font, padding and Quick exit's size. Keep about 3% to
  spare at the default text size, and allow for WebKit's 17 px scrollbar at 568x300, described below.
- Run the strip tests again, in `tools/test_browser.py` and `tools/test_webkit.py`, and the planted bugs:
  `python3 tools/test_the_tests.py --only strip`, which includes the renamed-class bug, and
  `--only "Quick exit"`.
- Update the planted bugs with the stylesheet. They are of two kinds. Those that replace exact lines of
  the compact block stop the whole run with an error once those lines change. Those that add rules under
  the full strip's limits, such as `(max-height: 18.75em) and (max-width: 43.99em)` or
  `(max-height: 15em)`, always apply: if those limits move, they go stale without an error, and the run
  reports them missed, or caught for an unrelated reason. Check that each is still caught for the right
  reason.
- Added November 8: carry the floors in px of the full strip's limits too, from "Floors in px" in
  `assets/styles.css`, and those of the rules that follow them. Each floor is its limit in em times 16,
  so if the other stylesheet moves a limit, move its floor with it. The ten planted bugs added that day
  replace exact lines, so they stop the run with an error if those lines change, and
  `python3 tools/check_site.py` fails if the compact block's two copies differ.

Pull request 11 was read on November 7, without changing it, at its commit 4422a15 and again at fc366a3,
which merges 7d05f06 into the redesign and was its newest commit when this was written. It doesn't
change the strip's markup on the pages. Both branches change six of the same pages, Home, About and
Research in each language, in different places, and also `notes/DECISIONS.md`, `tools/test_the_tests.py`
and the review packets. A trial merge of fc366a3 with this branch, made without changing either,
conflicts only in `assets/styles.css` and the five files in `notes/review-packet/`. The six pages,
`notes/DECISIONS.md` and `tools/test_the_tests.py` merge on their own. Rebuild the packets after merging.

## After a second review

An AI reviewer read the combined branch at 4488478, without changing it. Its findings were all in
notes, and each was checked before anything changed. Fixed here:

- [[DECISIONS]] and [[FOUNDER-BRIEF]] gave this proposal's branch as `build/compact-strip`, a local
  branch that isn't on GitHub. Both now name `site/compact-crisis-strip`.
- In this handoff: the opening line now gives the state when written; the planted-bug results say why
  `--only strip` selects 34; and the section on pull request 11 names fc366a3, the conflicts a merge
  would show, and how each kind of planted bug fails when the stylesheet changes.

Left for others:

- [[TASKS]] still says the first-version brief is on `build/first-version-brief` and not merged, though
  911e7fe merged it into `site/first-version-finish`. The text is the same as on 7d05f06, so the session
  that updates pull request 10's notes corrects it there.
- Whether the fluent Spanish reader should also be asked about the compact row's Spanish wording is
  open, as below. Put the question in the draft pull request's description, for the founders.

Checked afterwards, on a Mac, November 7, 2026: `python3 tools/check_site.py`: all checks passed, 19
pages, with no note, so the review packets are current. `python3 tools/make_review_packet.py --no-pdf`
left the packet HTML unchanged, because the packets read none of these notes. No page, stylesheet or
tool changed, so the browser, WebKit and planted-bug tests weren't run again.

## Before the pull request

The first review's point on [[DECISIONS]], marked low and not fixed then, was still true, so it is
fixed here:

- The strip entry said the compact strip "pins wherever that row fits and takes a quarter of the
  screen's height or less". The height limit is stricter than that: at least 192 px at the default
  text size, 265 px at 150% and about 266 px at 200% (`assets/styles.css`, the limit inside the
  compact block). So a few short screens with larger text, such as 640 by 264 at 150%, still scroll
  it away though one row would fit. The entry now says so.
- The rewrite had dropped the November 6 entry's open question, "Whether larger text should still
  pin the strip is open", and its known limit for older phones on their side. Both are back, saying
  what holds without this proposal, which answers the question only once both founders agree.
- The reviewer question in [[CONTENT-REVIEW]] said the strip shortens "on a short screen ... or with
  larger text", which suggests larger text alone shortens it. An upright phone with larger text never
  gets the compact row. It now says "on a short screen, such as a phone on its side, including with
  larger text". The review packets were rebuilt, because the therapist's packet shows that question.

## November 8: floors for the full strip, and a check that the two copies match

Date: November 8, 2026. Still a proposal for both founders, not agreed by either. **State when written:
local commits on `site/compact-crisis-strip` after dda20fe, not pushed, so draft pull request 13 doesn't
show them yet.**

### What changed

- **Floors in px for the full strip's own limits.** They were set in em only, so with text smaller than
  the default they shrank too, and the full strip pinned on screens too small for it: at 232 by 240 with
  75% text, on two rows taking 47% of the height in English, and on three rows taking 65% in Spanish.
  Each limit now also has a floor in px, its value at the default 16px text. So with smaller text, as at
  the default size, the full strip stops pinning at 256 px wide or less, at 300 px tall or less up to
  703.84 px wide, and at 240 px tall or less, and the compact strip pins instead where it fits. Two
  limits that add to the strip's height have floors too: its extra words, such as "any time", stay
  hidden on screens up to 480 px wide or up to 480 px tall, and its 6 px gap between rows needs
  480.16 px of height. The rules that follow where the strip pins have the same floors: Quick exit
  riding inside the strip, the compact strip's outer limits, and the taller jump padding under 360 px
  wide. See "Floors in px" in `assets/styles.css`. At the default text size and larger the em limits
  are the larger, so the floors change nothing there.
- **A check that the compact block's two copies match.** `tools/check_site.py` already reads the
  stylesheet, so the check is there. It finds the rules written once for `html[lang="en"]` and once for
  `html[lang="es"]` inside the same @media blocks, and compares them rule by rule. Only the width limits
  around each copy may differ, and only in their numbers. Its message says what differs, for example
  ".strip-or has width: .25rem in English but width: .5rem in Spanish".
- **Tests.** `tools/test_browser.py` adds six sizes with 75% text, 232x240, 250x350, 400x290, 750x185,
  750x370 and 320x390, each past one of the floors. A size with text below 100% is now also measured at
  100%, and compared with it: with smaller text the strip must stay pinned wherever it is pinned at
  100%, and a pinned strip may take more than 25% of the height only where it already does at 100%.
  The jump link test adds 260x250 with 75% text, and a rule that a jump leaves its target in the top
  half of the screen. `tools/test_webkit.py` tries the same six sizes at the default text size.
  `tools/test_the_tests.py` adds ten planted bugs: eight that each remove one floor, or one rule's
  floors, the Spanish copy of the compact block changed alone, and one for WebKit, below.
- **An audit fix for WebKit.** At the six new sizes, WebKit at first reported 32 places where a floating
  Quick exit covered text at a page's end, the same on dda20fe. All were inside closed "Show sources"
  folds: macOS WebKit gives a closed fold's text boxes, though nothing is drawn there. The audit's other
  checks already skipped folded text, and now this one does too. The Chrome tests open every fold before
  the audit, so they are unchanged. The new WebKit planted bug, a floating Quick exit over a page's last
  line, shows that real text still counts.
- **Not changed:** no page, wording, crisis number, reviewer question or phone step, so the review
  packets, [[CONTENT-REVIEW]] and [[PHONE-TEST]] stay as they were. The packets read neither the
  stylesheet nor the tools. `sw.js` keeps its version, because its list of core files and the crisis
  details are the same.

### Measured

Desktop Chrome's phone-size emulation, with the text size set the way `tools/test_browser.py` sets it,
on the home page in each language, at 12, 13, 14, 15, 16, 18, 20, 24 and 32 px text. At each text size:
every width from 180 to 1024 px and height from 150 to 1000 px within 1 px of a limit of the strip,
Quick exit or the compact block, both at that text size and at the limit's value at 16 px, and some
common screen sizes. That is 76,394 cases, measured on dda20fe and after. Each records whether the
strip pins, which strip, its rows and share of the height, where Quick exit is, and the jump padding,
row gap and extra words. Measuring by resizing one loaded page agreed with reloading the page for each
case, on a sample of 2,000 cases, before and after. At 32 px, 424 cases 255 to 257 px wide couldn't be
measured at their own size, because the page is wider than the screen there and the emulated phone
zooms out. They are the same before and after.

- 13,512 cases changed, all at 12 to 15 px. None changed at 16 px or more, and none of another 32,976
  sizes measured at 16 px alone.
- Below 16 px the strip now pins, full or compact, exactly where it does at 16 px, in every case.
- A pinned strip taking more than 25% of the height where 16 px takes 25% or less: 6,633 cases at 12 to
  15 px before, none after.
- Unchanged, as asked: at 18 to 32 px, 1,116 cases take more than 25% where 16 px takes 25% or less,
  the same before and after. Larger text makes the strip's rows taller and its words longer, so just
  past its limits it can take more rows than at 16 px: at 20 px, 704 by 376 takes two rows and 27% in
  English, where 16 px takes one row and 13%, and 375 by 389 takes three rows and 44% in Spanish, where
  16 px takes two rows and 25%.

Every changed case, by kind. Counts are English / Spanish.

| Change | 12 px | 13 px | 14 px | 15 px | Widths | Heights | Share before | Share after |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Full strip pinned, now the compact strip | 1032 / 444 | 899 / 515 | 903 / 463 | 589 / 265 | 312-959 | 192-300 | 16-47.92% | 16-25% |
| Full strip pinned over 25%, now scrolls away | 439 / 1042 | 189 / 610 | 158 / 632 | 138 / 502 | 193-959 | 181-668 | 25.06-75.94% | 0% |
| Full strip pinned at 25% or less, now scrolls away | 91 / 76 | 87 / 50 | 52 / 18 | 52 / 12 | 193-543 | 192-845 | 11.6-25% | 0% |
| Full strip still pinned, without the extra words or the wider gap | 767 / 767 | 402 / 402 | 434 / 434 | 352 / 352 | 257-959 | 361-845 | 10-40.24% | 10-39.8% |
| Scrolls away before and after, with only the jump padding, extra words or row gap changed | 60 / 60 | 40 / 40 | 38 / 38 | 34 / 34 | 191-961 | 226-480 | 0% | 0% |

A pinned strip that still takes more than 25% after the change does so at 16 px too, at that size.

Some of the cases, with 75% text (12 px):

| Size | English, before → after | Spanish, before → after | At 100% text |
| --- | --- | --- | --- |
| 232x240 | two rows, 46.59% → scrolls away | three rows, 64.92% → scrolls away | scrolls away |
| 250x350 | two rows, 27.43% → scrolls away | two rows, 31.95% → scrolls away | scrolls away |
| 400x290 | two rows, 33.1% → compact, 16.55% | two rows, 33.1% → scrolls away | English compact, Spanish scrolls away |
| 750x185 | one row, 25.95% → scrolls away | the same | scrolls away |
| 750x370 | one row, 12.97%, unchanged | two rows, 26.49% → one row, 12.97% | one row, 12.97% |
| 320x390 | two rows, 25.13% → 24.62% | two rows, 25.13% → 24.62% | English 24.62%, Spanish 30.02% |
| 250x844 | two rows, 11.61% → scrolls away | two rows, 13.48% → scrolls away | scrolls away |
| 543x290 | one row, 16.55% → compact, 16.55% | one row, 16.55% → scrolls away | English compact, Spanish scrolls away |
| 640x290, 568x300 | one row → compact, 16.55% and 16% | the same | compact |
| 750x292, 844x390 | one row, 16.44% and 12.31%, unchanged | the same | the same |

In macOS WebKit at the default text size, the six new sizes behave as in Chrome: the strip scrolls away
at 232x240, 250x350 and 750x185, and at 400x290 in Spanish; the English compact strip pins at 400x290;
the full strip pins at 320x390 and 750x370. At 320x390 the Spanish strip takes three rows, 41.3%, as
WebKit's 17 px scrollbar leaves 303 px for the page.

### Checked

On a Mac, November 8, 2026, on the changed files before they were committed:

- `python3 tools/check_site.py`: all checks passed, 19 pages, with no note, so the review packets are
  current. The new check failed, naming the difference, on seven made-up edits of the stylesheet: a
  value, a declaration, a rule or a selector changed in one copy only, declarations reordered, a
  width limit turned into a height limit, and no Spanish copy. It passed on a changed width limit.
- `python3 tools/test_browser.py --only textsize`: 608 checks passed, in 54 seconds. `--only jumps`:
  676 checks passed. On dda20fe's stylesheet the same tests fail at every new size.
- `python3 tools/test_webkit.py`: 303 checks in macOS WebKit, 0 problems.
- `python3 tools/test_the_tests.py`: `--only floor` caught all 7, the five new floor bugs and the
  compact strip's two width floors; `--only "smaller text"` both; `--only "jump links stopping low"`,
  `--only "copy of the compact"` and `--only "last line only in Safari"` one each. Each new bug was
  also run alone, to see that the size and rule meant for it catch it.
- Not tried on a real phone, in the iOS Simulator, or with a screen reader.

## Decisions and open questions

- A proposal only. A qualified reviewer should weigh the short wording, which drops "Need help now?"
  and "In immediate danger,": see [[CONTENT-REVIEW]].
- Safari's **aA** button on an iPhone zooms the whole page, so it should act like a smaller screen
  rather than larger text. At 125%, an iPhone 17 on its side would be about 600 by 234, which gets the
  compact strip in both languages; at 150%, about 500 by 195, English only. Not tried on a real phone.
- On this Mac, WebKit draws a 17 px scrollbar and measures media queries without it, so 568x300 acts
  like 551 px wide there. The Spanish limit was set to fit that too.
- The two language blocks in the stylesheet must stay alike apart from their width. Since November 8,
  `tools/check_site.py` compares them. It compares only rules written for both languages inside the
  same @media blocks: a Spanish-only rule elsewhere, such as the Spanish jump padding, isn't compared,
  and a copy split into two blocks fails the check.
- The floors in px give up some sizes where the row would fit with smaller text, such as English 240 to
  311 px wide with 75% text. The strip scrolls away there, as it did before this branch. One floor per
  language is simpler than a rule for each text size.
- Found while checking, and not changed here, because it was so before this branch: with text smaller
  than the default, the full strip's own limits, set in em only, shrink too. With 75% text, on short
  screens the full strip can pin over a quarter of the screen: at 232 by 240, 47% on two rows in
  English and 65% on three rows in Spanish. f2e6a70 measures the same. Floors in px for those limits
  would be a separate change. They were added on November 8, above.
- The November 8 floors give up 438 of the measured cases where smaller text pinned the full strip at a
  quarter of the height or less: screens 256 px wide or less and 389 px tall or more, such as 250 by
  844 with 75% text, and Spanish pages 536 to 543 px wide and 192 to 300 px tall with 75% text, just
  too narrow for the Spanish compact row. The strip scrolls away there, as it does at the default size.
  A floor per limit is simpler than a rule for each text size.
- Left without a floor on November 8: the height limit of the two-row rule for taller screens. At 15 px
  text, 704 to 711 px wide and 451 to 480 px tall, the strip takes two rows, 20% to 21% of the height,
  where 16 px takes one. It stays under a quarter, and the second row keeps Call 911 apart.
- Found on November 8 and not changed, because it was so before: jump links can stop behind the pinned
  strip with smaller text, because the jump padding is set in rem and shrinks while the strip's 44 px
  rows don't. At 12 px, 1,101 of the 3,195 pinned English cases measured, such as 269 by 301, where the
  padding is 84 px and the two rows 96 px. At the default text size it happens on Spanish pages 481 and
  482 px wide, 481 px tall or more: the padding is 136 px and the strip 142 px, on three rows. The
  jump link test doesn't try those sizes. A floor for the padding would be a separate change.
- Larger text, unchanged as asked: just past the strip's limits, 18 to 32 px text can pin it on more
  rows than 16 px, over a quarter of the height where 16 px takes less, in 1,116 measured cases. See
  "Measured" in the November 8 section. Whether larger text should still pin the strip there is part of
  the open question in [[DECISIONS]].
- Also found and not changed: with 75% text, Home's closing "Call" link is 21 px wide, and the "FAQ"
  source link on Get Help and the teen page, in both languages, is 23 px. The audit's floor is 24 px, so
  the 75% test cases skip that one rule and measure only the crisis strip's tap targets.
- At 640x180, where the strip scrolls away, the floating Quick exit covers the right end of the header's
  Get Support Now button until the page scrolls. It did the same before this branch, at that size.
- The review packets were rebuilt after combining with 7d05f06, as above. Rebuild them again after any
  later merge, because they fingerprint every page and the reviewer questions.
- The Spanish packet shows the full Spanish strip, not the compact row. The compact row uses the same
  words, fewer of them, with each link's first letter made a capital, such as "Envía AYUDA al 988". Only
  the therapist's packet asks about the short wording, in Part 6. Whether the fluent Spanish reader
  should be asked too is open.
- [[STATUS]] and [[TASKS]] don't mention this branch yet. The session that merges pull request 10's
  branch records this pull request there.

## Next step

Open `site/compact-crisis-strip` as a draft pull request into `site/first-version-finish`, with the
question about the Spanish reader in its description. Both founders decide whether to keep the compact
strip. Try it on a real phone on its side with larger text, using the new row in [[PHONE-TEST]].

November 8: the branch is draft pull request 13, which shows it up to dda20fe. Push the November 8
commits so it shows them too. This session didn't push.

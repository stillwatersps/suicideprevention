---
type: handoff
owner: Claude Code, at one founder's request
branch: build/compact-strip, based on f2e6a70
---

# Compact crisis strip

Date: November 7, 2026. A proposal for both founders, not agreed by either yet. Local commit only,
not pushed or merged.

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

Final results, after the review fixes:

- `python3 tools/check_site.py`: all checks passed. Its one note says the review packets are out of date.
- `python3 tools/test_browser.py`, every group: all browser checks passed, in desktop Chrome and its
  phone-size emulation. Matrix 570 checks, text size 342, Quick exit 87, keyboard 2,594, and the rest.
- `python3 tools/test_webkit.py`: 189 checks, 0 problems. Before the review, its first run found 20 at
  the two new sizes: the Spanish width limit, and the short first scroll described above. Both are fixed.
- `python3 tools/test_the_tests.py --only strip` caught all 33 planted bugs, `--only "Quick exit"` all 14,
  and `--only "audit losing sight"` its one.
- The reviewer's two broken limits, planted again on the fixed branch: the browser tests now fail both.
- Screenshots in Chrome at 640x290 and 568x300, light and dark, and in WebKit at those sizes, checked by
  eye before the review. After it, Chrome at 640x180, and with 75% text at 236x200, 312x200, 410x200
  and 544x200.
- Not tried on a real phone, in the iOS Simulator, or with a screen reader.

## Decisions and open questions

- A proposal only. A qualified reviewer should weigh the short wording, which drops "Need help now?"
  and "In immediate danger,": see [[CONTENT-REVIEW]].
- Safari's **aA** button on an iPhone zooms the whole page, so it should act like a smaller screen
  rather than larger text. At 125%, an iPhone 17 on its side would be about 600 by 234, which gets the
  compact strip in both languages; at 150%, about 500 by 195, English only. Not tried on a real phone.
- On this Mac, WebKit draws a 17 px scrollbar and measures media queries without it, so 568x300 acts
  like 551 px wide there. The Spanish limit was set to fit that too.
- The two language blocks in the stylesheet must stay alike apart from their width. No check compares
  them yet.
- The floors in px give up some sizes where the row would fit with smaller text, such as English 240 to
  311 px wide with 75% text. The strip scrolls away there, as it did before this branch. One floor per
  language is simpler than a rule for each text size.
- Found while checking, and not changed here, because it was so before this branch: with text smaller
  than the default, the full strip's own limits, set in em only, shrink too. With 75% text, on short
  screens the full strip can pin over a quarter of the screen: at 232 by 240, 47% on two rows in
  English and 65% on three rows in Spanish. f2e6a70 measures the same. Floors in px for those limits
  would be a separate change.
- Also found and not changed: with 75% text, Home's closing "Call" link is 21 px wide, and the "FAQ"
  source link on Get Help and the teen page, in both languages, is 23 px. The audit's floor is 24 px, so
  the 75% test cases skip that one rule and measure only the crisis strip's tap targets.
- At 640x180, where the strip scrolls away, the floating Quick exit covers the right end of the header's
  Get Support Now button until the page scrolls. It did the same before this branch, at that size.
- The review packets are out of date, because they fingerprint every page and the reviewer questions:
  rebuild them with `python3 tools/make_review_packet.py` once this branch is combined with others.
- [[STATUS]] and [[TASKS]] don't mention this branch yet. Add it when the branches are combined.

## Next step

Both founders decide whether to keep the compact strip. Try it on a real phone on its side with larger
text, using the new row in [[PHONE-TEST]].

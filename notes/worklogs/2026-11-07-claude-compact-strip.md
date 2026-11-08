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
  19.5em. Both leave about 3% to spare at the default text size. The height limits keep the row to a
  quarter of the screen at any text size. In the compact row, dots replace "or" and the lead-ins, and a
  screen reader still hears each link's full name.
- **Tests.** `tools/test_browser.py`: 568x300 and 640x290 join the sizes where the strip must pin; on
  phones on their side a pinned strip must be one row of 25% or less; 750x292 joins the larger-text
  sizes, with a list of where the strip must still pin at 150% and 200%, by language; Quick exit is
  tested inside the compact strip at 640x290. The audit now centers each crisis link twice before
  checking it can be tapped, because WebKit with a desktop scrollbar left the first scroll short at
  640x290. `tools/test_webkit.py`: the two new sizes and the one-row check. `tools/test_the_tests.py`:
  seven planted bugs.
- **Notes.** The strip entry in [[DECISIONS]], a question for the reviewer in [[CONTENT-REVIEW]], and a
  row in [[PHONE-TEST]].

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

## Checked

- `python3 tools/check_site.py`: all checks passed. Its one note says the review packets are out of date.
- `python3 tools/test_browser.py`, every group: all browser checks passed, in desktop Chrome and its
  phone-size emulation.
- `python3 tools/test_webkit.py`: 189 checks, 0 problems. Its first run found 20, at the two new sizes:
  the Spanish width limit, and the short first scroll described above. Both are fixed.
- `python3 tools/test_the_tests.py --only strip` caught all 27 planted bugs, and `--only "Quick exit"` all
  13. Each of the seven new bugs was also caught when run on its own.
- Screenshots in Chrome and WebKit at 640x290 and 568x300, light and dark, checked by eye.
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
- The review packets are out of date, because they fingerprint every page and the reviewer questions:
  rebuild them with `python3 tools/make_review_packet.py` once this branch is combined with others.
- [[STATUS]] and [[TASKS]] don't mention this branch yet. Add it when the branches are combined.

## Next step

Both founders decide whether to keep the compact strip. Try it on a real phone on its side with larger
text, using the new row in [[PHONE-TEST]].

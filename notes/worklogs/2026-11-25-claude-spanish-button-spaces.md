---
type: handoff
owner: Claude Code, in a session started from the phone app session
branch: fix/spanish-pill-spacing
---

# Spaces back in six Spanish buttons

Date: November 25, 2026.

**State when written: pushed to `fix/spanish-pill-spacing`, a draft pull request into
`claude/jolly-mayer-2m6eno`. Not merged, not on the public website.** A layout fix only. No
wording, number or link changed, and no crisis service was contacted.

## The fault

A walk of the phone app in the iPhone Simulator on November 19, 2026 found Spanish buttons
reading "EnviarPRIDEal 988", "EnviarHOMEal 741741" and "EnviarSTARTal 678-678". The website's
own pages had the same fault. It was confirmed here in a browser at 375 pixels wide before
anything changed: the gap either side of the inner word measured 0.

The cause is in `assets/styles.css`. `.pill` uses `display: inline-flex`, which lays a button's
parts out side by side. A button written as `Enviar <span lang="en">PRIDE</span> al 988` becomes
three parts, and the spaces between them are dropped. It touched six buttons, three each in
`es/obtener-ayuda/index.html` and `es/adolescentes/index.html`. English buttons hold plain text,
so they were never affected.

## Completed

| File | Change |
| --- | --- |
| `assets/styles.css` | One rule, `.pill > span[lang] { margin: 0 0.25em; }`, with a comment. It is the same rule the phone app's own stylesheet uses on `app/forty-features`, so the two agree and don't add up |
| `tools/test_browser.py` | The page audit now reports "words run together": wherever a flex or grid box has its own words beside a word in a tag, with a space between them in the page's source, there must be a gap on screen when they share a line. It runs in the matrix, text size and modes groups, on every page |
| `tools/test_webkit.py` | Reports the same finding in WebKit |
| `tools/test_the_tests.py` | A planted bug, "words in a button running together", that removes the margin and must be caught |
| `notes/STATUS.md` | One row for this branch |

At the button's 16 pixel bold text a real space is about 3.8 pixels wide and the margin is 4. Each
of the six buttons is 8 pixels wider than before and the same 44 pixels tall.

## Checked

- In a browser, both Spanish pages at 375 and 1440 pixels wide, in light and dark: the six
  buttons read "Enviar PRIDE al 988", "Enviar HOME al 741741" and "Enviar START al 678-678",
  with a 4 pixel gap either side of the inner word.
- `python3 tools/check_site.py`: passed. Its note that the review packets are out of date is
  also there on the untouched branch, and a stylesheet change doesn't affect it.
- `python3 tools/test_the_tests.py --only "running together"`: the planted bug was caught.
- `python3 tools/test_browser.py`: all 18 groups passed, 0 failures, in desktop Chrome and its
  phone-size emulation.
- `python3 tools/test_webkit.py`: 207 checks, 0 problems, in WebKit on a Mac.

Not checked: a real phone, a screen reader, and the full `tools/test_the_tests.py` run.

## Decisions and open questions

- The margin stands in for a space; it is not one. Selecting and copying a button's text is as
  it was before. Writing the buttons without the inner tag would give real spaces, but the tag
  tells a screen reader to say the word in English, so the pages were left alone.
- When `app/forty-features` and this branch meet, the rule will be in both stylesheets with the
  same value. The app's copy can then be removed, or left; either is harmless.

## Next step

A founder reads the draft pull request and decides whether to merge it into
`claude/jolly-mayer-2m6eno`. Merging publishes nothing.

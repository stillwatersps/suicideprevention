---
type: handoff
owner: Claude Code, at a founder's request
branch: site/live-page-corrections
---

# Corrections to four known problems on the live pages

Date: November 6, 2026. Updated November 7, 2026.

Written as a draft pull request into `main`, not merged. The founders decide whether
to merge or close it, and merging publishes within about a minute. No qualified person
has reviewed this wording. The wording and `noindex` are proposals.

## Completed

Changed only these lines in `index.html`, `get-help/index.html`,
`help-someone/index.html`, and `research/index.html`:

- Every footer no longer says content "is still being reviewed". It says a suicide
  prevention professional has not reviewed it.
- Every page has a `noindex` tag.
- The homepage's "Privacy first" became "Your privacy", and it adds that the web host
  logs visitors' IP addresses.
- Help Someone no longer says to "call or text 988 together". Only the word "together"
  was removed.

The footer and privacy words come from `site/phone-accessibility-content`. No crisis
number or link was added, changed, or removed. This differs from that branch in three
places:

- The urgent note keeps `main`'s sentence, minus "together". The branch has a longer
  note with links for 911 and 988.
- The privacy line has no link. The branch's link goes to a footer paragraph that
  `main` doesn't have. That paragraph wasn't brought over.
- `noindex` has no comment beside it. The branch's comment points to a [[DECISIONS]]
  entry that `main` doesn't have.

## Checked

- All four pages on a local copy at 375, 768, and 1440 px wide: no console errors, and
  only the site's own files load. Nothing on the pages was clicked.
- Compared with a copy of `main` at 320, 375, 768, 1024, 1440, and 1920 px: same
  elements and links, no sideways scrolling, and only the intended text differs.
- After the urgent note became `main`'s sentence minus "together", Help Someone compared
  with `main` at 320, 375, 390, 768, 1024, 1440, and 1920 px: the Call 988 button is in
  the same place or about 25 px higher, with no sideways scrolling. On all four pages at
  375 px, no console errors, and only the site's own files load. Nothing was clicked.
- Read on November 6: 988's Get Help and Help Someone Else pages, SAMHSA's Suicide
  Prevention page, the FCC's text-to-911 page, and GitHub's Pages documentation.
- The site's chat link goes to a different address from 988's own. A headers-only
  request showed that it redirects to 988's address. The chat page wasn't opened.
- A merge test with pull request 5's head conflicts in the four pages. With pull
  request 7, it doesn't conflict.

`tools/check_site.py` isn't on `main`. A scratch copy reports the same 32 problems before
and after this change, all for things only the draft branches add or fix. So it can't
show these pages are right. It only showed nothing new failed, and its four `noindex`
notes went away.

Not checked: real phones, screen readers, clinical accuracy, or whether search engines
already list these pages.

## Decisions and open questions

- A first draft of this change used the draft branch's longer urgent note, which pushed
  Help Someone's Call 988 button below a phone's first screen. At 375 by 812, its top
  moved from 764 px to 864 px. One founder chose to remove only "together" instead, so
  the button stays where it is on `main`.
- "If it is safe" isn't in SAMHSA's wording. SAMHSA lists 911 first, then 988, and
  staying with the person further down. This note says to stay first and puts 911 last,
  as it does on `main`. A qualified reviewer should decide both.
- This doesn't settle what the public site should show until review. That's an open
  decision in `notes/DECISIONS.md` on the draft branches.

## Next step

The founders merge or close the pull request. Then:

- If this merged and pull request 5 merges later, keep pull request 5's text in every
  conflict in the four pages.
- If pull request 5 merged first, close this one.
- If this merged, `notes/STATUS.md` in pull requests 5 and 7 still lists these four as
  known problems on `main`, so update those lines. This task left those notes alone.

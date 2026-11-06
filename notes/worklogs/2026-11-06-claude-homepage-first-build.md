---
type: handoff
owner: Claude Code (cloud session), at the user's request
branch: claude/jolly-mayer-2m6eno
---

# First homepage build

Date: November 6, 2026.

## Completed

- Built the homepage from `design/homepage.svg` as plain HTML and CSS with no
  build step: `index.html`, `assets/styles.css`, `assets/menu.js`.
  GitHub Pages serves it as-is. `.nojekyll` stops Pages from also turning the
  Markdown notes into web pages.
- Replaced the illustrated sunset and hills with a real photo: "Joshua tree at
  sunset in Queen Valley" by Emily Hassell, National Park Service. It is public
  domain (no attribution required); it is credited in the footer anyway.
  Source: https://commons.wikimedia.org/wiki/File:Joshua_tree_at_sunset_in_Queen_Valley_(50601665443).jpg
  Files: `assets/images/joshua-tree-sunset-{800,1600}.{jpg,webp}`.
- Phone layout: stacked crisis buttons near the top, a menu button, the photo
  below the crisis buttons, and stacked trust items and cards.
- Applied the [[SAFETY]] ground rules:
  - A crisis bar on every screen: "Call or text 988 any time. In immediate
    danger, call 911."
  - Call 988 uses `tel:988`, Text 988 uses `sms:988`, Chat Online goes to
    `https://988lifeline.org/chat/`. A plain-text fallback is shown for devices
    that can't call or text.
  - Wording changed from the design so it does not imply Stillwater runs a
    crisis line: "Available 24/7" became "988 is available 24/7", and the
    footer says Stillwater is not a crisis service.
  - "Confidentiality and privacy" became "Privacy first: Stillwater has no
    sign-ups, forms, or tracking", which is true of this static page.
  - The two resource cards without pages yet say "coming soon" instead of
    linking nowhere. "I'm worried about someone" also points to 988 and 911.
- Left out from the design: the search button and the nav dropdown arrows,
  since there is nothing for them to open yet. Nav links jump to page sections.
- Fonts are system fonts (Georgia and Arial) so no outside font service sees
  visitors.

## Checked

- Rendered in Chromium at 320, 390, 768 and 1440 pixels wide: no sideways
  scrolling and no script errors.
- The phone menu opens, closes with Escape, and returns focus to the button.
  Without JavaScript the nav links stay visible.
- Text contrast is at least 5.3:1 everywhere measured (WCAG AA needs 4.5:1).
- `988lifeline.org` loads and `/chat/` redirects to the 988 chat service.
  Inner 988 pages could not be checked (the site blocked automated requests),
  so none are linked.
- Not checked: real phones, screen readers, and whether `sms:988` opens
  correctly on every device.

## Decisions and open questions

- Plain HTML and CSS is a starting point, not an agreed tool choice. It can be
  moved into a framework later.
- **Merging makes this public** at https://stillwatersps.github.io/suicideprevention/.
  [[SAFETY]] asks whether a public preview should exist before content review.
- The changed wording above needs both founders' agreement.

## Next step

Review the pull request on a phone. Decide whether to merge now (public) or
after content review. Then pick up the "coming soon" pages.

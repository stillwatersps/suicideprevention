# Design record for the app's visual identity

One founder's design brief ("Dawn at the Shoreline", November 2026) asked for a new look for the
phone app without changing what it does. This folder is its record.

| File | What it is |
| --- | --- |
| `AUDIT.md` | What looked generic before, screen by screen, and every raw value found |
| `TOKENS.md` | The final colors with their measured contrast ratios |
| `COMPARISON.md` | Before and after, screen by screen |
| `before/`, `after/`, `appstore/` | Pictures. **Not committed**: they stay on the computer that made them |

To make the pictures again, in `app/`: `npm run build`, then `node tools/screens.mjs after`.
They come from desktop Chromium at two phone sizes (375 by 667, the iPhone SE size, and 402 by 874,
the iPhone 17 size), in light and dark, English and Spanish, plus the largest text size. They are
not from a phone. A few iOS Simulator pictures sit in `simulator-iphone-17/`.

This folder is `app/design/` because the repository's own `design/` folder holds the website's
original homepage design, which is shared project material.

# Homepage design

[[00 START HERE|Back to Start Here]]

![[attachments/homepage-preview.png]]

## Supplied reference

- Name displayed in the supplied design: Stillwater, the project's earlier name.
  The website now uses Tidelight (November 7, 2026).
- Original canvas: desktop, 1440 by 1100.
- Source in the repository: `design/homepage.svg`.
- Exact original pasted source: `design/source/homepage-original.txt`.
- The image above is a copy of `design/homepage-preview.png`.

The SVG in `design/` is the source design. In the built homepage
(`index.html`), the illustrated sunset and hills are replaced by a real
public-domain photo of a Joshua tree at sunset (National Park Service). Update this reference image when the
source design changes.

## Visual direction

- Warm cream background, forest green and plum accents.
- Serif headings and sans-serif body text.
- A soft landscape illustration and rounded support cards.
- Prominent routes to support and resources.

## How the website differs from the drawing

The drawing is a static reference. The working website is `index.html` and its
pages. It keeps the drawing's colors, type, and layout at 1440 pixels wide, and
changes these on purpose:

- A real sunset photo replaces the illustration.
- A crisis strip with call and text links sits at the top of every page. The links
  have not been tried on a real phone yet.
- Text and buttons stay on the cream panel at every width, never over the photo.
- The white crisis buttons have a thin green edge so they stand out.
- The header has a menu button on phones and tablets. Search and the menu arrows
  are left out until they have something to open.
- Wording names the 988 Lifeline as the provider of round-the-clock support
  ([[SAFETY]] rule 3), so some labels differ from the drawing.

## Second proposed redesign, November 8, 2026: Shoreline

On branch `site/pro-max-redesign`, not merged, and not agreed by either founder. One founder
asked for a redesign with the same limits as the signage one, using the ui-ux-pro-max design
skill. It keeps the current layout and changes only the look:

- **Paper and ink.** Warm off-white paper, near-black ink, text at WCAG AAA contrast (7:1) in
  light and dark.
- **One tide blue means help.** The crisis strip, Call 988 (the only solid button), links,
  and a tide-pool panel with a tide edge around the call, text, and chat buttons on every page,
  Home included.
- **A dawn brown for notices,** such as the draft-for-review note and the current page.
- **The phone's own fonts.** Its serif for headings, its sans for reading. Nothing loaded
  from another site.
- **Thin lines, no shadows or gradients, no motion.** A two-band "shoreline" under each page
  heading and above the footer.

Compared with the signage redesign: calmer and quieter, closer to a reading app than a public
sign, and Call 988 is tide blue rather than amber. See
[[worklogs/2026-11-08-claude-shoreline-redesign]] for screenshots of all three.

## Open questions

- Should inner pages also show the sunset photo? They use a plain gradient now,
  which keeps crisis pages light on phones.
- What wording do the founders and the content reviewer agree on?
  See [[CONTENT-REVIEW]].

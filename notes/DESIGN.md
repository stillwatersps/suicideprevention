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

## Proposed redesign, November 7, 2026

On branch `site/signage-redesign`, not merged, and not agreed by both founders. It replaces
the cream panel, serif headings, and rounded cards above with public-service signage: bold
system type, a forest-green help sign on every page, an amber Call 988 button, and square
corners. The supplied SVG stays as the original reference. See
[[worklogs/2026-11-07-claude-signage-redesign]] for screenshots and the design rules.

## Open questions

- Should inner pages also show the sunset photo? They use a plain gradient now,
  which keeps crisis pages light on phones.
- What wording do the founders and the content reviewer agree on?
  See [[CONTENT-REVIEW]].

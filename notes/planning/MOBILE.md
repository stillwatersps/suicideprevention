# Stillwater mobile homepage plan

Planning draft for review. No application code or release content has been created.

## First implementation task

Build a responsive homepage from the supplied SVG using real headings, text,
links, and buttons. Keep the SVG as a design reference rather than shrinking the
entire drawing into one image. Preserve the cream background, forest green and
plum accents, serif headings, and calm landscape treatment.

## Phone layout

1. **Header:** compact brand, a visible support action, and a clearly labeled menu
   button. Put secondary navigation inside the menu. Include search only once it
   has a defined purpose and works.
2. **Hero:** a short heading followed by readable supporting text. Use flexible
   type and natural wrapping. Start with 16–24 CSS pixels of side padding and
   roughly 16-pixel body text as design preferences, then verify on devices.
3. **Support actions:** stack the three actions in a single column near the top.
   Keep their labels visible; icons supplement the labels. Decorative landscape
   artwork moves behind or below the content and does not obscure text.
4. **Supporting information:** stack the three trust items into short rows. The
   availability and counselor wording needs to identify the external service
   being described before it becomes release content.
5. **Resource cards:** stack the three cards vertically. Make each card's action
   clear, with a descriptive destination rather than an unlabeled arrow alone.
6. **Closing banner:** wrap the text naturally and give it comfortable padding.
   Begin without a fixed bottom bar; add one only if it improves access without
   hiding content or keyboard focus.

## Screen behavior

- Header and hero support actions lead to the same clearly explained support
  choices, accessible without account creation.
- Calling, texting, and external web support are distinct, user-initiated actions.
  Explain what each opens. Show usable text if the device cannot launch the action.
- A menu button opens and closes navigation, exposes its expanded state, works
  from the keyboard, and returns focus predictably when dismissed.
- The three resource cards lead to defined pages or sections. Draft screens
  identify unfinished destinations clearly; release screens have no dead controls.
- Keep focus indicators visible. Mark decorative artwork accordingly so it does
  not clutter a screen reader's reading order.

## Acceptance checks for the eventual build

- At 320, 390, 768, and 1440 CSS pixels wide, text and controls remain usable with
  no clipped headings or horizontal page scrolling. Also check desktop reflow at
  400% zoom from a 1280-pixel-wide viewport. This follows the WCAG reflow baseline.
  [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- Aim for 44-by-44 CSS pixel primary action areas as a project design preference.
  WCAG 2.2 AA specifies a 24-by-24 minimum or applicable spacing/other exceptions;
  the larger project target should not be confused with that minimum.
  [W3C: Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Measure the implemented foreground/background pairs: ordinary text needs at
  least 4.5:1 contrast; qualifying large text needs 3:1. Measure actual backgrounds,
  including gradients. No contrast pass is claimed for the supplied SVG here.
  [W3C: Contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- Test keyboard navigation and a mobile screen reader manually. Verify heading
  order, link names, menu state, and each support action's behavior on real devices.

## Independent companion task

While one collaborator handles the homepage layout, the other prepares a content
and destination inventory: each visible label, its destination, its source, its
reviewer, and whether it is ready. Record exact supported ages and data needs as
open decisions. Keep this work in separate notes until the first scope is agreed.

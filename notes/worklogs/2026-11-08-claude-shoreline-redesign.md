---
type: handoff
owner: Claude Code (cloud session), at one founder's request
branch: site/pro-max-redesign
---

# Shoreline: a second proposed redesign

Date: November 8, 2026.

**State when written: pushed to `site/pro-max-redesign`, opened as a draft pull request into
`site/first-version-finish` (draft pull request 10). Not merged, not on the public website.**
Merging it into pull request 10's branch publishes nothing. No qualified person has reviewed any
content, the Spanish is still an unreviewed AI translation, and nothing was tried on a real phone.

## What was asked

One founder asked Claude to install the ui-ux-pro-max design skill
(github.com/nextlevelbuilder/ui-ux-pro-max-skill, MIT license) and redesign the site with the
same limits the other founder gave for the signage redesign (pull request 11):

- A complete new look that doesn't look like a generic template.
- No change to wording, links, phone numbers, page addresses, or behavior, so the review
  packets stay valid.
- The crisis strip, Quick exit, and menu keep their breakpoints and behavior.
- Nothing loaded from other sites ([[SAFETY]] rule 5).

The founder chose to keep it on its own branch beside pull request 11, so both founders can
compare and pick one.

## How the skill was used

- The skill was read in full before use. Its search script only reads local data files. It was
  installed for this cloud session only, not added to this project.
- Its first design-system suggestion was rejected: a testimonial carousel, "neumorphism" (which
  the skill rates high-risk for accessibility), Google Fonts, and scroll animation from an outside
  script. Those conflict with [[SAFETY]] rule 5 or with a crisis site.
- A narrower retry matched "Accessible & Ethical" (high contrast, large text, visible focus, no
  motion; for healthcare and public services). Its "E-Ink / Paper" style supplied the calm
  reading feel. Skill guidance on contrast, focus not obscured, and touch targets was applied.

## The design

![[attachments/redesign-shoreline-2026-11-08/cmp-phone-home.jpg]]

![[attachments/redesign-shoreline-2026-11-08/cmp-phone-gethelp.jpg]]

![[attachments/redesign-shoreline-2026-11-08/cmp-phone-dark.jpg]]

![[attachments/redesign-shoreline-2026-11-08/cmp-desktop-home.jpg]]

Each image shows, left to right: the current look (pull request 10), signage (pull request 11),
and Shoreline.

| Element | Rule |
| --- | --- |
| Color | Paper `#FBF9F4`, ink `#13222C`. One tide blue `#0B4F6C` for everything that is help. A dawn brown `#7A400C` for notices, labels, and the current page. Dark mode: night tide, `#0E171D` with light ink |
| Contrast | Text measured at 7:1 or more (WCAG AAA) for the main pairs, light and dark |
| The help panel | A pale tide pool with a 6px tide edge around call, text, and chat on every page, Home included. Call 988 is the only solid button |
| Type | The device's own serif for headings and its own sans for reading. No outside fonts |
| Shapes | 10px corners, thin lines, no shadows, no gradients. Square-ish 8px corners for small buttons |
| Signature | Two thin tide bands, the "shoreline", under each page heading and above the footer |
| Motion | None |

## What changed

- `assets/styles.css` only: one marked block, "Shoreline", near the end, before the print rules.
  It changes colors, type, borders, and shapes. Every layout, crisis strip, menu, and Quick exit
  rule is unchanged.
- Two layout fixes the tests asked for: the numbered steps and the closing banner may wrap long
  words at large text, because the phone's own font is wider than Arial.
- No page, wording, link, or number changed. Review packets need no rebuild.
- Notes: this handoff, [[STATUS]], [[TASKS]], [[DESIGN]], [[DECISIONS]], and the screenshots.

## Checked

All on November 8, 2026, in Chromium on Linux. None of this is a real phone.

| Check | Result |
| --- | --- |
| `python3 tools/check_site.py` | All checks passed, 19 pages |
| `python3 tools/test_browser.py`, all 18 groups | 5,178 checks, 0 failures. The first run found two problems, both fixed: panels printed dark from dark mode, and at 200% text on a 320px phone two places pushed the page sideways |
| `python3 tools/test_the_tests.py` | See the pull request; it runs longer than one command allows here |
| Real iPhone or Android phone | **Not done.** See [[PHONE-TEST]] |

## Decisions and open questions

- Neither founder has chosen a design. Choose one of the current look, signage, or Shoreline.
- Pull requests 11 and this one both change `assets/styles.css`, so only one should merge.

## Next step

Both founders compare the three designs, ideally on a phone with [[PHONE-TEST]], and record the
choice in [[DECISIONS]].

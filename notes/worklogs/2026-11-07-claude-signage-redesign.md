---
type: handoff
owner: Claude Code (desktop session), at one founder's request
branch: site/signage-redesign
---

# A new visual design for the whole site

Date: November 7, 2026. Reworked November 9, 2026.

**State when updated: draft pull request 11 into `claude/jolly-mayer-2m6eno`, pull request 5's
branch. Not merged, not on the public website.** Merging it publishes nothing. No qualified person
has reviewed any content, and the Spanish is still an unreviewed AI translation.

## November 9: reworked to replace Shoreline

On November 9 one founder merged Shoreline, a rival design, into pull request 5's branch, with the
compact crisis strip and the Daily check-in page. The same founder then asked for pull request 11
to be reworked so merging it swaps Shoreline for signage. Neither founder has chosen between them.

- `assets/styles.css` is the signage stylesheet, with the compact strip's rules kept as written. Its
  pinned Quick exit gets the same quiet edge and amber focus ring as signage's. The Shoreline layer
  is left out.
- The Daily check-in is restyled in signage: square controls, heavy rules, ink buttons, and amber
  for what a person has chosen. Every class the page and its script use is still styled.
- The notes keep both designs' entries. Pull request 11 now goes into `claude/jolly-mayer-2m6eno`,
  because pull request 10 is merged there.
- The review packets were rebuilt. Apart from the build stamp they match pull request 5's branch,
  so no text a reviewer reads changed.

![[attachments/redesign-2026-11-07/cmp-checkin.jpg]]

![[attachments/redesign-2026-11-07/cmp-strip.jpg]]

The checks for the rework are at the end of this note.

One founder asked for a redesign, then, after a first pass in a "printed field guide" style, asked
for a complete redesign that doesn't look like a generic template. This branch holds the second
design only. The first pass was never committed.

## The design

![[attachments/redesign-2026-11-07/cmp-home-desktop.jpg]]

![[attachments/redesign-2026-11-07/cmp-phone.jpg]]

Public-service signage rather than soft cards:

| Element | Rule |
| --- | --- |
| Type | The device's own sans (San Francisco on iPhone, Roboto on Android, Segoe on Windows), bold and set large. The serif wordmark stays. Body 17px, line height 1.6, reading width about 65 characters |
| The help sign | Home's opening and every page's crisis panel are one forest-green block holding call, text, and chat, so help looks the same everywhere |
| Strongest action | Call 988 is amber with dark text, the only amber button. Text and chat are outlined in white on the green |
| Color jobs | Forest green for help, amber for the main action and focus on green, sand for the trust row, plum only for the draft-for-review notice |
| Shapes | Square corners, flat color, 3px rules to open sections and lists, 1px rules between rows. No gradients, shadows on content, icon tiles, pills, or spaced capital labels |
| Home | Desktop: the help sign and the photo split the first screen, edge to edge. Phone: the help sign, then the photo. The five paths are a numbered index (01 to 05) |
| Reading pages | Research and About get a contents column in the margin on wide screens. Elsewhere the contents list stays in reading order |
| Folds | A plus when closed and a minus when open. An open "Show more" turns dark, and its text hangs from a dark rule |
| Motion | None. Nothing moves, so reduced motion needs no exceptions |

Two homepage compositions were compared before choosing, the photo beside the headline and the photo
below the actions. On desktop the second left half the first screen empty and pushed the photo below
the fold, so the split won. On phones the two are the same.

## What changed

- `assets/styles.css`: rewritten. The crisis strip, Quick exit, and menu rules keep the same
  breakpoints and behavior. New rules keep a column clear for Quick exit on wide screens with large
  text, and shrink titles on short screens such as a phone on its side.
- `index.html`, `es/index.html`: removed the decorative icon tiles from the trust row and the paths,
  the unused hero curve, and the second arrow color. All decorative and hidden from screen readers.
- `research/`, `about/`, and their Spanish twins: the page body has a `page-reading` class for the
  contents column.
- Notes: this handoff, [[STATUS]], [[TASKS]], [[DECISIONS]], [[DESIGN]], and the rebuilt review packets.

No wording, link, phone number, route, or behavior changed. Every review section's fingerprint is the
same before and after (19 of 19), so the packets show the same text.

## Checked

All on November 7, 2026, on this branch, on a Mac. None of this is a real phone.

| Check | Kind | Result |
| --- | --- | --- |
| `tools/check_site.py` | Reads the files | RESULT_CHECK_SITE |
| `tools/test_browser.py`, all groups | Desktop Chrome and its phone-size emulation | RESULT_BROWSER |
| `tools/test_webkit.py` | macOS WebKit in a window, not iOS | RESULT_WEBKIT |
| `tools/test_the_tests.py` | Plants one bug at a time | RESULT_PLANTED |
| iOS Simulator, iPhone 17, iOS 27.2, Safari | Simulated iPhone | Home in portrait: the whole help sign, with Call 988, is on the first screen. On its side the strip stays pinned as one row with Exit, after scrolling too. Nothing was tapped |
| Real iPhone or Android phone | Not run | **Not done.** See [[PHONE-TEST]] |

The first Chrome run found three things the design had to fix:

- At 150 to 200% text on wide screens, the floating Quick exit covered the third crisis button.
- An arrow that moved on hover counted as motion.
- Light link colors printed faintly from dark mode.

All are fixed, and the groups were rerun.

![[attachments/redesign-2026-11-07/cmp-states.jpg]]

![[attachments/redesign-2026-11-07/cmp-reading-desktop.jpg]]

Simulator screenshots: `attachments/redesign-2026-11-07/simulator-*.jpg`.

## For the reviewer: wording the design didn't change

These read as if Tidelight provides support (SAFETY rule 3). The design kept them as they are:

- The header's "Suicide prevention & support" under the wordmark.
- The header button "Get Support Now". "Call or text 988" would say what happens.
- "Find suicide prevention support" above the home headline.

## Open

- Both founders look at it on a real phone, with [[PHONE-TEST]].
- The bold system type looks different on Android and Windows than on an iPhone. Check one of each.
- Decide whether amber should also mark the call buttons in Get Help's "Right now" box.

- The Daily check-in itself is a proposal: typing on the page narrows [[SAFETY]] rule 5, and no
  reviewer has seen it. The rework only restyles it.

## Next step

Both founders compare Shoreline (now on pull request 5's branch) and signage on a phone, and choose.
For signage, merge pull request 11 into `claude/jolly-mayer-2m6eno`. For Shoreline, close it. Either
way nothing is published.

## Checked after the November 9 rework

All on November 9, 2026, on this branch, on a Mac. None of this is a real phone.

| Check | Kind | Result |
| --- | --- | --- |
| `tools/check_site.py` | Reads the files | All checks passed, 21 pages |
| `tools/test_browser.py`, all 18 groups | Desktop Chrome and its phone-size emulation | First run: 39 problems in three groups, all from two causes. The check-in page's section tabs overlapped when they wrapped onto a second row, and Home's closing band ran off a 640 px screen at 200% text. Both fixed, then matrix, text size, and modes rerun: 0 failures. The other 15 groups passed on the first run |
| `tools/test_webkit.py` | macOS WebKit in a window, not iOS | First run: 23 problems, all the same tab overlap. After the fix: 207 checks, 0 problems |
| `tools/test_the_tests.py` | Plants one bug at a time | All 138 planted bugs caught. Run before the two small fixes above |
| Screenshots | Chrome | The check-in page in light, dark, and Spanish, and the compact strip pinned on a 640 by 290 screen. See above |
| Real iPhone or Android phone | Not run | **Not done** |

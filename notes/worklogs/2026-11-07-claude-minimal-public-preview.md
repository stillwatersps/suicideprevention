---
type: handoff
owner: Claude Code, at a founder's request
branch: site/minimal-public-preview
---

# Option: one crisis page in place of the live preview

Date: November 7, 2026. Built on `main` at `d610002`. When written: committed on this branch,
local only. Not pushed, no pull request, not merged.

Fixed the same day after an independent AI review found two problems. The Spanish part left out
the draft, privacy, and AI notes, so a Spanish reader wasn't told the page is unreviewed. And
`main`'s `notes/SAFETY.md`, published with the page, still said its crisis numbers were listed
from memory. Both are fixed below. An AI review is not human review.

A second independent review then left four low-severity points, fixed that evening and listed
under "Second review" below. It was not a qualified person's review of the wording.

A third independent AI review left six more points, two of them marked to fix, none above low
severity. Each was reproduced first. All six are fixed, as listed under "Third review" below.

## What it is

An option for open decision 1, "What should the public site show until review?", in
`notes/DECISIONS.md` on the task branches: cut the site to one page with 988, 911, and what the
project is. **It settles nothing until both founders choose it.** No qualified person has
reviewed its wording.

Merging this branch into `main` publishes it within about a minute. Browsers may keep the old
page for up to 10 minutes. It replaces the four live pages:

| Address | Today | With this branch |
| --- | --- | --- |
| `/` | Homepage | The crisis page |
| `/get-help/`, `/help-someone/`, `/research/` | Placeholder pages | The same page, so old links and search results still reach help |
| Any missing address | GitHub's own error page | `404.html`: the same page, plus a line in each language saying that address has no page |

Pages still serves `main`'s notes, `README.md`, and `CLAUDE.md`, as open decision 2 describes.
They don't change here. The old stylesheet, menu script, and photos stay, unused.

## What the page says

- Call or text 988, or chat at chat.988lifeline.org, any time, day or night.
- In immediate danger, call 911.
- In Spanish, marked `lang="es"`, everything the English says: the opening question, call 988
  and press 2, text AYUDA to 988, chat at chat.988lifeline.org/?lang=es, the computer or tablet
  line, and call 911. Then an About part in Spanish with each note below, the link to GitHub's
  statement marked as a page in English, and a line saying an AI translated all the Spanish and
  no fluent reader has checked it.
- `404.html` also says, in both languages, that there's no page at that address.
- The website is an early project, not a crisis service. Its other pages aren't ready, and no
  qualified person has reviewed it. 988 and 911 are real services, separate from it.
- Privacy: no sign-ups, forms, analytics, or cookies. GitHub says it logs and stores visitors'
  IP addresses for security. The page links GitHub's statement, which Claude read on November 7.
- An AI assistant drafted the page and compared its numbers with each provider's website on
  November 6, 2026. No person has confirmed them or tried the links on a phone.
- On paper only, a line after the English help and one after the Spanish help repeat sentences
  the About parts already use: "This website is an early project. It is not a crisis service. No
  qualified person has reviewed this page yet. An AI assistant drafted this page." The Spanish
  line says the same in Spanish, then adds the Spanish About part's two sentences saying an AI
  translated all the Spanish and no fluent reader has checked it. The About parts print on a
  second sheet, so without these lines a single printed sheet didn't say what the website is, or
  that its Spanish is an unreviewed AI translation.

Each call and text link shows its number: Call 988, Text 988, Call 911, Llama al 988 y marca 2,
Envía AYUDA por texto al 988, Llama al 911. The crisis details come from three rows of the
resource table in `notes/SAFETY.md` on `site/first-version-finish`, read on the providers' pages.

`main`'s own `notes/SAFETY.md` was an older draft, listed from memory. This branch copies those
three rows into it word for word, with that note's warning that the FCC's text-to-911 page
refused automated reads. Its other rows stay marked as listed from memory and not checked. Where
the two copies disagree, pull request 5's `SAFETY.md` supersedes this one.

## Choices made here, all easy to reverse

- **No project name.** `main` says Stillwater, and the rename to Tidelight doesn't have both
  founders' agreement yet. The title is "Get help now: 988 and 911".
- **No Quick exit and no script.** Quick exit is a question for the reviewer.
- **Locked down.** Each page asks search engines not to list it, tells other sites nothing
  about where a visitor came from, and lets only this site's own files load.
- **Spanish on the same page, not in `es/`.** The project's rule asks for a Spanish twin in
  `es/`. Here the twin is the Spanish part of each page, which says everything the English says,
  so both change in one file and there is one page to review. A founder should confirm this
  exception. The Spanish About part sits right after the Spanish help, not in the footer, so a
  Spanish reader finds it without reading past the English.
- **A small icon, `assets/preview-icon.svg`.** Without one, browsers ask for a `favicon.ico`
  that doesn't exist, and that shows as an error.
- **`404.html`'s two file paths start at `/suicideprevention/`,** because GitHub Pages shows
  that file at any depth. They name the repository, so change them if it is renamed.
- **On short screens, the buttons' minimum height stays 56px.** On screens 420px tall or less,
  such as a phone on its side, the minimum is 56px instead of 3.5rem, which grows with the text
  setting. So with larger text a button is only as tall as its words need: a one-line button is
  63px at 150% and 75px at 200%, down from 84px and 112px. At the default text size nothing
  changes. With larger text, Call 988 sits higher. That is for a larger default text size, as
  Chrome's text-size setting gives. With page zoom the rule changes nothing. See "Where Call 988
  sits" below.
- **On paper, tighter spacing and no not-found line.** Smaller gaps above headings and buttons
  make room for the two print-only lines on sheet 1. `404.html`'s not-found lines don't print,
  because an address means nothing on paper.

## Files

- `index.html` is the source. `get-help/`, `help-someone/`, and `research/` hold copies that
  differ only by `../` before the two file paths. `404.html` differs by its title, those paths,
  and its not-found line in each language. Change all five together, in both languages.
- New: `assets/preview.css`, `assets/preview-icon.svg`, and this note.
- Changed: the resource table in `notes/SAFETY.md`, as above, and a short section at the top of
  `notes/STATUS.md`. On this branch that note is `main`'s old copy, which describes the photo
  homepage as live. The new section says that if the note is on `main`, the public site is this
  one-page crisis page at its four page addresses and at any missing address, and that Pages
  still serves the notes, `README.md`, and `CLAUDE.md` as plain files. It says the rest of the
  note predates the page, and so do `notes/PROJECT.md`, `notes/00 START HERE.md`,
  `notes/DESIGN.md`, and `README.md`, which still describe the photo homepage. Everything else in
  it is unchanged.
- Not changed: those four notes. Pull request 5 rewrites all four, so editing them here would add
  four more conflicts. If this branch merges first, the section at the top of `notes/STATUS.md`
  points them out until pull request 5 replaces them.

## Second review

Four low-severity points, each fixed here:

1. **The short-screen comment overstated the rule.** `assets/preview.css` said its rule for short
   screens keeps Call 988 on the first screen. Measured, it doesn't always: see the table below.
   The comment now says what the rule does and where Call 988 can still fall below. The rule also
   gained one line, the 56px minimum height above. That keeps Call 988 on the first screen at one
   more of the sizes measured: 750x292 with 150% text, the size of Safari on an iPhone 17 on its
   side as measured in the iOS Simulator on the task branches. That gain comes only with Chrome's
   text-size setting. With page zoom, which is how Safari on an iPhone enlarges text as far as
   Claude knows, this rule changes nothing: emulated in desktop Chrome, Call 988 is about 28px
   below the first screen at 750x292 and 150% zoom, with or without it.
2. **A single printed sheet carried no draft label.** Every call, text, and chat option printed
   on sheet 1, but the English draft labels and the "not a crisis service" line printed on sheet
   2, and so did the Spanish ones. Each language now has a print-only line on sheet 1, in
   sentences the page already uses. Adding them pushed the Spanish help onto sheet 2, so the
   print spacing is tighter and `404.html`'s not-found lines don't print. When the Spanish help
   didn't fit on sheet 1, Chrome moved it to sheet 2 whole, its print-only line with it, so the
   line stays with the help it describes.
3. **`notes/STATUS.md` described the photo homepage as live.** It now starts with the short
   section described under Files.
4. **The first phone test came only after merging.** "Try it on a phone before merging" below
   gives a way to try the pages on a phone first.

## Third review

Six points, two of them marked to fix. Each was reproduced before anything changed:

1. **`notes/STATUS.md` said the crisis page is at every address.** It isn't. After a merge, Pages
   still serves `main`'s notes, `README.md`, `CLAUDE.md`, the design files, and the old
   stylesheet, menu script, and photos as plain files. The live site answers 200 for each of
   those today, and this branch deletes none of them. The section now says the page is at its
   four page addresses and at any missing address, and that Pages still serves the notes,
   `README.md`, and `CLAUDE.md`, as open decision 2 on the task branches describes.
2. **The short-screen comment and choice still overstated the 56px rule.** Measured, no button
   stays 56px tall with larger text. A one-line button is 63px at 150% and 75px at 200%, down
   from 84px and 112px. Only the minimum height stopped growing. `assets/preview.css` and the
   choice above now say so.
3. **A single printed sheet had no AI note.** Both AI notes printed only on sheet 2, so sheet 1's
   Spanish help wasn't marked as an unreviewed AI translation, which the project's rule for
   Spanish pages asks for. Sheet 1 now also says "An AI assistant drafted this page." in English.
   In Spanish it says that sentence's twin, then that an AI translated all the Spanish and no
   fluent reader has checked it. Every sentence added is one the About parts already use. Room
   left on sheet 1 went from about 61 to 37px on Letter, and from 127 to 79px on A4, for `/` and
   for a missing address alike.
4. **The 56px gain was tied to Safari on an iPhone.** Point 1 of the second review and "Where
   Call 988 sits" below now say the gain needs Chrome's text-size setting, and that with page
   zoom the rule changes nothing, with the emulated numbers.
5. **Other notes still describe the photo homepage.** After a merge, `notes/PROJECT.md`,
   `notes/00 START HERE.md`, `notes/DESIGN.md`, and `README.md` would too. The section at the top
   of `notes/STATUS.md` now names them. They aren't changed, as Files above says.
6. **An empty `PREVIEW` would serve the project folder.** If the phone steps' first line were
   skipped, for example in a partial paste, `cd "$PREVIEW"` would succeed and stay in the project
   folder, in zsh and bash, and the server would share `.git` and the notes. The server line is
   now `cd "${PREVIEW:?}" && python3 -m http.server 8000 --bind 0.0.0.0`, which stops with an
   error instead, and the clean-up line uses the same guard.

## Where Call 988 sits on the first screen

Measured in desktop Chrome 157, headless, with phone sizes emulated, at Chrome's default text
size of 16, 24, and 32px (100%, 150%, and 200%). Each cell gives where the bottom edge of Call
988 sits, in CSS pixels from the top of the page before any scrolling, against the screen's
height. Real phones also show browser bars, and their own text settings may work differently,
for example by zooming the page. Neither is measured here.

| Screen | Text | `/` and the other three addresses | A missing address (404.html) |
| --- | --- | --- | --- |
| 568x320 | 100% | on (222 of 320) | on (254 of 320) |
| 568x320 | 150% | **below** by 3 | **below** by 83 |
| 568x320 | 200% | **below** by 208 | **below** by 312 |
| 640x360 | 100% | on (196 of 360) | on (228 of 360) |
| 640x360 | 150% | on (283 of 360) | on (327 of 360) |
| 640x360 | 200% | **below** by 114 | **below** by 218 |
| 667x375 | 100% | on (196 of 375) | on (228 of 375) |
| 667x375 | 150% | on (283 of 375) | on (327 of 375) |
| 667x375 | 200% | **below** by 99 | **below** by 203 |
| 750x292 | 100% | on (196 of 292) | on (228 of 292) |
| 750x292 | 150% | on (283 of 292) | **below** by 35 |
| 750x292 | 200% | **below** by 111 | **below** by 215 |
| 844x390 | 100% | on (196 of 390) | on (228 of 390) |
| 844x390 | 150% | on (242 of 390) | on (286 of 390) |
| 844x390 | 200% | on (349 of 390) | **below** by 15 |
| 390x844 | 100% | on (300 of 844) | on (356 of 844) |
| 390x844 | 150% | on (454 of 844) | on (534 of 844) |
| 390x844 | 200% | on (767 of 844) | **below** by 75 |
| 320x568 | 100% | on (327 of 568) | on (383 of 568) |
| 320x568 | 150% | on (495 of 568) | **below** by 43 |
| 320x568 | 200% | **below** by 304 | **below** by 504 |

Call 988 is on the first screen in 26 of these 42, and in all 14 at the default text size.
Before the 56px minimum height it was 25: 750x292 at 150% ended 12px below. The shorter buttons
moved Call 988 up 21px at 150% and 37px at 200% on the five screens on their side, and changed
nothing at 100% or on the two upright ones. `404.html` sits lower because its notice adds a line,
or more with larger text. Fitting more would take smaller text, or the buttons before the opening
question, which changes the reading order, so neither was done.

Page zoom is different. It lays the page out in a smaller screen at 16px text, where 56px and
3.5rem are the same, so the 56px minimum changes nothing. Safari on an iPhone enlarges text this
way, as far as Claude knows; that wasn't tried on a phone. Emulated in desktop Chrome by loading
the zoomed size at 16px text, with the same results with and without the 56px minimum (at
`bcc26d3`): 750x292 at 150% zoom (500x195) puts Call 988 28px below the first screen, and 60px
on `404.html`. 568x320 at 150% (379x213) puts it 72px and 128px below, 844x390 at 150%
(563x260) keeps it on the screen on both, and 750x292 at 200% (375x146) puts it 140px and 196px
below.

## Try it on a phone before merging

Copy only the site files into a new, empty folder, and serve that. **Never serve the repository
folder itself:** anyone on the network could then read the `.git` folder, with the project's
whole history, and the notes.

1. In Terminal, in the project folder with this branch checked out, run:

   ```sh
   PREVIEW="$(mktemp -d)"
   mkdir -p "$PREVIEW/suicideprevention/assets"
   cp -R index.html 404.html get-help help-someone research "$PREVIEW/suicideprevention/"
   cp assets/preview.css assets/preview-icon.svg "$PREVIEW/suicideprevention/assets/"
   cd "${PREVIEW:?}" && python3 -m http.server 8000 --bind 0.0.0.0
   ```

   The `suicideprevention` folder matches the address GitHub Pages uses, which `404.html`'s two
   file paths need. macOS may ask whether Python may accept incoming network connections. If the
   last line stops with "parameter not set" or "parameter null or not set", `PREVIEW` is empty,
   for example because the first line was skipped: start again from the first line. Without
   that guard, the server would share the project folder.
2. Find the Mac's local network address in System Settings, under Wi-Fi, Details. Or run
   `ipconfig getifaddr en0` in a second Terminal window, and `en1` if that prints nothing.
3. On a phone on the same Wi-Fi, open `http://<that address>:8000/suicideprevention/`. Add
   `get-help/`, `help-someone/`, or `research/` for the other addresses, and `404.html` for the
   not-found version: this server answers a missing address with its own error page, not
   `404.html`. It is plain http, not https.
4. Tap each call and text link, check the number on the dial or compose screen, and cancel.
   Never place the call or send the text, and don't start a chat.
5. Press Control-C to stop the server. Then, in the same window, run `rm -rf "${PREVIEW:?}"`.

Use a trusted network, such as home Wi-Fi: while the server runs, anyone on that network can
open these pages.

Checked only in headless desktop Chrome on this Mac, with `--bind 127.0.0.1` in place of
`--bind 0.0.0.0`, so nothing else could connect, and a new empty folder as in step 1. The four
addresses and `404.html` loaded styled, with all six call and text links, no console errors or
failed requests, and nothing from another site, and the icon was served. A missing address got
Python's own 404 page. `.git` and `notes` answered 404, and the top folder listed only
`suicideprevention/`. After the third review, step 1 and step 5 ran again as written above, in
zsh, with the same results, and step 5 removed the folder. With `PREVIEW` unset, the guarded
line started no server, in zsh or bash. Not done: serving to the network, or any phone.

## Checked

`main` has no test tools, so the checks ran from scripts written for this task, not committed.
They read call and text links but never tapped, clicked, or followed one, and the browsers could
reach nothing but this computer. All of them ran again after the second review's fixes, and
again after the third's.

- Static checks on all five pages: strict HTML parse, head tags, no scripts or inline styles,
  relative links, labels that show their numbers, Spanish marked `lang="es"`, no project name,
  and crisis details that match the SAFETY rows. After the first review, also: each English
  draft, privacy, AI, and computer-or-tablet sentence on screen, and its Spanish twin inside
  `lang="es"`; the same links in both parts; the not-found line on `404.html` only, in both
  languages; the Spanish GitHub link marked as a page in English; every class styled and every
  style used; and the three rows in `notes/SAFETY.md` word for word as on
  `site/first-version-finish`. After the second, also: one print-only line in each language, in
  its place and in the About parts' words, hidden on screen and shown in print. After the third,
  the print-only lines' new words, and that the About parts still carry each AI sentence apart
  from those lines. 0 problems. 55 of 55 planted faults caught, each by the check meant for it.
  `aba3b4b`, the commit before the third review's fixes, fails the updated checks 10 times.
  (`bcc26d3`, before the second review's fixes, failed the checks of that time 12 times, and the
  commit before the first review's fixes failed the checks of its time 76 times.)
- Desktop Chrome 157, headless, with phone sizes emulated and the site served under
  `/suicideprevention/` as GitHub Pages does: 70 page loads, the 4 addresses and 3 missing
  ones at 320x568, 390x844, 750x292, 844x390, and 1440x900, light and dark. Each had the right
  status (200, or 404 with this page), no console errors or failed requests, no request to
  another site, no sideways scroll, every link at least 44px and not covered, Call 988 on the
  first screen, one h1 with headings in order, Chrome's parsed page matching the source, the
  Spanish notes on screen, the print-only lines hidden, and the not-found lines only at missing
  addresses. Lowest text contrast: 7.62:1 light, 10.18:1 dark. All passed.
- Desktop Chrome, other checks: with the stylesheet blocked, 18 loads, readable in order with
  every option and no sideways scroll, and the print-only lines then show like everything else.
  Larger text: the table above, measured separately, and the test now requires Call 988 on the
  first screen at 750x292 with 150% text. Keyboard: all 11 links in order, each with a visible
  ring. Nothing moves. The jump to Spanish works.
- Print, in desktop Chrome on Letter paper with Chrome's default margins, for the page and for a
  missing address, light and dark: black on white on two sheets. Read back from each PDF, sheet 1
  has all eight call, text, and chat options and both print-only lines, with their AI sentences,
  sheet 2 has both About parts with GitHub's address, and no not-found line prints. After the
  third review, also on A4, and with Chrome's own header and footer, light and dark, for both:
  two sheets each time, with all of that on sheet 1. Room left on sheet 1: about 37px on Letter
  and 79px on A4. Other browsers' margins and headers differ, and weren't tried.
- WebKit on this Mac, in a WKWebView window: 50 page audits at the same sizes, light and dark,
  with the English and Spanish sentences, the not-found lines, and the hidden print-only lines
  checked too: 0 problems. This is not iOS Safari and not a phone.
- The phone steps: headless desktop Chrome only, as described above.
- After the third review, the table above was measured again with the same 42 results, and the
  short-screen buttons measured 56px at 100%, 63px at 150%, and 75px at 200% on all five screens
  on their side, against 56, 84, and 112px at `bcc26d3`.

Not tested: any real phone, the iOS Simulator, VoiceOver or TalkBack, Firefox, printing from
Safari or Firefox, the live site (nothing is published), or what the chat links open.

## Next step

- Both founders choose among the options for decision 1. If they choose this one, push the
  branch, open a pull request into `main`, review it, merge, and check the live site.
- Before merging, a person can try the pages on a real phone with the steps above. After
  merging, check the live site the same way. Either way, stop at the dial or compose screen and
  never call or text. That is the "Never test on a crisis line" rule in `notes/SAFETY.md` on the
  task branches.
- It changes the same four pages as draft pull requests 5 and 8. If it merges, 8 isn't needed,
  and 5 will conflict in those pages, `404.html`, `notes/SAFETY.md`, and `notes/STATUS.md`. Take
  5's versions once 5 is approved. Its `SAFETY.md` supersedes this one.
- Draft pull request 7 also edits `notes/STATUS.md`, near the top. Merging both needs a conflict
  resolution that keeps both: this branch's section first, then pull request 7's corrections,
  which also predate the one-page crisis page.
- A fluent Spanish reader checks the Spanish part, its print-only line included, and a founder
  confirms the exception to the `es/` rule.
- Record the choice in `DECISIONS.md`.

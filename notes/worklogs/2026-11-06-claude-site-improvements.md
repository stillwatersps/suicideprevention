---
type: handoff
owner: Claude Code, at one founder's request, working overnight
branch: site/phone-accessibility-content
---

# Website fixes and draft page content

Date: November 6, 2026, Eastern time. Worked from about 11:15 p.m. on November 5.

**State:** pushed to `site/phone-accessibility-content`, in draft pull request
6 into `claude/jolly-mayer-2m6eno`. That branch is draft pull request 5 into
`main`. **Nothing is merged.** `main` is unchanged at `d610002`, so none of this is on
the public website, though anyone can read the branch on GitHub.

No qualified person has reviewed any of this content. Merging pull request 5 into
`main` would publish it.

## Completed

**Phones and tablets**

- The logo and menu icon were squeezed on any phone under about 400 px, and at 320 px
  the menu button was an empty pill. Nothing shrinks now, and the header stays on one
  row from 320 px up.
- Up to 959 px wide, the crisis strip stays pinned while the header scrolls away, and
  its numbers are links. The exceptions are in [[DECISIONS]].
- Inner page tops are tighter. On a 390 px phone, Call 988 starts about 406 px down on
  Home and 460 px on Get Help and Research, down from about 600. On Help Someone it's
  668 px, because the urgent note comes first.

**Desktop**

- On laptop widths, homepage text ran onto the dark photo and became unreadable. It
  now stays on the cream panel from 960 to 1920 px. The 1440 px layout still follows
  the design.

**Navigation**

- Every page offers the same destinations. The phone menu has Home, and the current
  page is marked.
- A new 404 page keeps crisis options on screen, at shallow and deep broken addresses.
- "Ayuda en español" on every page goes to a Spanish block on Get Help.
- A favicon stops a browser error on every page.

**Accessibility**

- White crisis buttons have a visible edge. Focus rings work on green and on cream.
- Tap targets are 44 px outside sentences, with one exception under Known limits.
- The menu closes on an outside tap, Escape, or tabbing out in either direction, and
  shows without JavaScript.
- Focused items and jump targets no longer land behind the pinned strip.
- The photo follows the words in reading order, Spanish text is marked `lang="es"`,
  the brand link's name includes its visible words, and Windows high-contrast mode is
  handled.

**Draft content, marked for review on each page**

- Get Help: what happens when you call, text, or chat, cost, what stays private, when
  emergency services get involved, other services, support over time, safety plans,
  and under 18.
- Help Someone: warning signs, NIMH's five steps, what helps and what to avoid, children
  and teens, worrying posts online, and looking after yourself.
- Research: findings with a "What it can't show" line, and what the page can't tell you.
- Stillwater is kept apart from the services it links to. Each page lists its sources.

**Checks and notes**

- `tools/check_site.py` was rewritten. It compares call and text links with the numbers
  in [[SAFETY]], label against destination, and flags hidden crisis controls, missing
  files, anything loaded from another site, unsafe language in text and attributes, and
  broken Obsidian links. It works without git.
- [[STATUS]], [[TASKS]], and [[DECISIONS]] now say what is on `main`, what is on each
  branch, and what is only proposed.
- [[CONTENT-REVIEW]] lists every crisis control, every reviewer question, how each
  research finding was read, and how the pages compare with [[RESEARCH-BRIEF]].
- [[SAFETY]] records where each crisis resource was read.
- Crisis content rules in `CLAUDE.md` are a proposal for both founders.

**Files:** `index.html`, `get-help/index.html`, `help-someone/index.html`,
`research/index.html`, `404.html`, `assets/styles.css`, `assets/menu.js`,
`assets/favicon.svg`, `tools/check_site.py`, `CLAUDE.md`, `README.md`,
`design/README.md`, and these notes.

## Checked

All browser checks ran in Chromium on a local copy that behaves like GitHub Pages.

| Check | Result |
| --- | --- |
| `python3 tools/check_site.py --check-links` | Passed. Six outside pages blocked the script, so they were opened in a browser. Five opened. The Comtois journal page showed a browser check, which Claude left alone |
| Planted 67 kinds of breakage in copies of the site | The checker caught all 67. The untouched copy passed |
| Crisis numbers re-read on provider pages, November 6 | All match the site and [[SAFETY]] |
| 5 page types at 19 widths, 280 to 1920 px, after the last change. An earlier run covered 25 widths | No sideways scrolling, no hero text on the photo, header button on screen, no tap target under 44 px outside sentences |
| Text enlarged to 150% and 200%, at 390 and 320 px | No sideways scrolling |
| Keyboard with real key presses at 390 px | Skip link, strip, Menu, Enter, Space, Escape, and Shift+Tab out of the menu all behave |
| Scripted focus through every link, both directions: 5 page types at 390 px, Get Help at 320 px, Get Help and Help Someone at 1280 px | Nothing landed behind the strip, with source lists opened at 390 px |
| Menu without JavaScript | Links show and the button is hidden |
| Loading, in a fresh tab | No console errors on the four main pages. Every file loaded, no images were broken, and nothing was requested from another site. The 404 page logs its own expected 404 |
| Screenshots at 390, 768, and 1440 px | Looked right. See below |
| Independent review | Six separate agents reviewed the first version: Get Help, Help Someone, Research, safe messaging, accessibility and code, and notes. Their findings were fixed, or are in [[CONTENT-REVIEW]] for a person |

An AI review is not a clinical review. Those agents read sources and measured pages.
They can't say whether the wording is right for a person in crisis.

**Not checked:** real phones, VoiceOver, and TalkBack. No call, text, chat, or form was
placed or submitted on purpose, so the recorded 988 menu is unverified. The Obsidian
app wasn't opened; links were checked by script.

**Disclosed:**

- One review agent's automated click test, in a throwaway headless Chrome, landed on
  Call 988 and Text 988 buttons, so those links may have been activated. It found no
  sign of a call or text, then added a guard that cancels such clicks.
- One review agent sent a browser-style user agent to a 988 page once. The page refused
  it, the agent did not retry, and it read the page through its normal tool instead.

## Known limits

- Crisis strip links are about 32 px tall on phones, which keeps the strip short. That
  is over the 24 px accessibility minimum, under the project's 44 px target. On a 390
  by 844 phone, the larger Call 988 button is on the first screen of every page.
- If a page's own font size is overridden to 200%, for example by a browser extension,
  the strip stays pinned and takes about 217 px at 390 px wide. Browser text size
  settings do unpin it.
- Below 320 px wide, the header wraps to two rows, with nothing cut off.
- Chrome's headless mode won't go narrower than 500 px, so phone screenshots here came
  from the app's browser pane.

## Screenshots

From a local copy on November 6. No URL bar shows, and these are draft pages.

![[attachments/qa-2026-11-06/home-phone.jpg|260]]
![[attachments/qa-2026-11-06/scrolled-phone.jpg|260]]
![[attachments/qa-2026-11-06/menu-open-phone.jpg|260]]
![[attachments/qa-2026-11-06/get-help-phone.jpg|260]]
![[attachments/qa-2026-11-06/help-someone-phone.jpg|260]]
![[attachments/qa-2026-11-06/research-phone.jpg|260]]
![[attachments/qa-2026-11-06/not-found-phone.jpg|260]]
![[attachments/qa-2026-11-06/home-tablet.jpg|420]]
![[attachments/qa-2026-11-06/get-help-tablet.jpg|420]]
![[attachments/qa-2026-11-06/home-desktop.jpg]]
![[attachments/qa-2026-11-06/get-help-desktop.jpg]]
![[attachments/qa-2026-11-06/help-someone-desktop.jpg]]
![[attachments/qa-2026-11-06/research-desktop.jpg]]

## Decisions and open questions

Claude's choices are listed as proposals in [[DECISIONS]], along with the open
decisions for both founders. Reviewer questions are in [[CONTENT-REVIEW]].

Corrections to earlier records:

- The first homepage handoff said `.nojekyll` stops the notes becoming web pages. They
  are still public as raw files, such as `/notes/SAFETY.md`. A correction was added.
- The plan posted on pull request 1 mentioned `notes/SAFETY.html`. That address no
  longer exists, for the same reason.
- This branch's first notes said the 988 LGBTQ+ youth option was left off because
  official pages disagreed. They don't: 988 lists it, and SAMHSA's older FAQ is silent.
  It is now on the Get Help page as a draft for a person to confirm.
- [[CONTENT-REVIEW]] said the Help Someone urgent note follows SAMHSA's order. It doesn't:
  SAMHSA lists 988 right after 911, and staying with the person further down. That review
  note now says so. The page text is unchanged, for the reviewer to decide.

## Next step

1. Both founders read pull request 5, pull request 6, and [[CONTENT-REVIEW]].
2. Decide what the public site shows until review. Merging pull request 6 into
   the combined branch publishes nothing. Merging pull request 5 into `main` does.
3. Decide whether to correct `main`'s notes now: merge or close draft pull request 7,
   which changes notes only.
4. Decide whether to correct the four known problems on the live pages now: merge or
   close draft pull request 8.
5. Tap-test the call and text links on real phones, stopping at the dial or compose
   screen.
6. Share [[CONTENT-REVIEW]] and [[RESEARCH-BRIEF]] with the licensed therapist.

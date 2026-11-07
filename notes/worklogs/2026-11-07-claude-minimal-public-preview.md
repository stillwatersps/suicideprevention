---
type: handoff
owner: Claude Code, at a founder's request
branch: site/minimal-public-preview
---

# Option: one crisis page in place of the live preview

Date: November 7, 2026. Built on `main` at `d610002`. When written: committed on this branch,
local only. Not pushed, no pull request, not merged.

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
| Any missing address | GitHub's own error page | `404.html`: the same page, plus a line saying that address has no page |

Pages still serves `main`'s notes, `README.md`, and `CLAUDE.md`, as open decision 2 describes.
They don't change here. The old stylesheet, menu script, and photos stay, unused.

## What the page says

- Call or text 988, or chat at chat.988lifeline.org, any time, day or night.
- In immediate danger, call 911.
- In Spanish, marked `lang="es"`: call 988 and press 2, text AYUDA to 988, chat at
  chat.988lifeline.org/?lang=es, and call 911. It says an AI translated it and no fluent reader
  has checked it.
- The website is an early project, not a crisis service. Its other pages aren't ready, and no
  qualified person has reviewed it. 988 and 911 are real services, separate from it.
- Privacy: no sign-ups, forms, analytics, or cookies. GitHub says it logs and stores visitors'
  IP addresses for security. The page links GitHub's statement, which Claude read on November 7.
- An AI assistant drafted the page and compared its numbers with each provider's website on
  November 6, 2026. No person has confirmed them or tried the links on a phone.

Each call and text link shows its number: Call 988, Text 988, Call 911, Llama al 988 y marca 2,
Envía AYUDA por texto al 988, Llama al 911. The crisis details come from the resource table in
`notes/SAFETY.md` on `site/first-version-finish`, whose rows were read on the providers' pages.
`main`'s own `SAFETY.md` is an older draft whose numbers were never checked.

## Choices made here, all easy to reverse

- **No project name.** `main` says Stillwater, and the rename to Tidelight doesn't have both
  founders' agreement yet. The title is "Get help now: 988 and 911".
- **No Quick exit and no script.** Quick exit is a question for the reviewer.
- **Locked down.** Each page asks search engines not to list it, tells other sites nothing
  about where a visitor came from, and lets only this site's own files load.
- **Spanish on the same page,** not a separate `es/` page, so there is one page to review.
- **A small icon, `assets/preview-icon.svg`.** Without one, browsers ask for a `favicon.ico`
  that doesn't exist, and that shows as an error.
- **`404.html`'s two file paths start at `/suicideprevention/`,** because GitHub Pages shows
  that file at any depth. They name the repository, so change them if it is renamed.

## Files

- `index.html` is the source. `get-help/`, `help-someone/`, and `research/` hold copies that
  differ only by `../` before the two file paths. `404.html` differs by its title, those paths,
  and its one extra line. Change all five together.
- New: `assets/preview.css`, `assets/preview-icon.svg`, and this note.

## Checked

`main` has no test tools, so the checks ran from scripts written for this task, not committed.
They read call and text links but never tapped, clicked, or followed one, and the browsers could
reach nothing but this computer.

- Static checks on all five pages: strict HTML parse, head tags, no scripts or inline styles,
  relative links, labels that show their numbers, Spanish marked `lang="es"`, no project name,
  and crisis details that match the SAFETY rows: 0 problems. 17 of 17 planted faults caught.
- Desktop Chrome 157, headless, with phone sizes emulated and the site served under
  `/suicideprevention/` as GitHub Pages does: 70 page loads, the 4 addresses and 3 missing
  ones at 320x568, 390x844, 750x292, 844x390, and 1440x900, light and dark. Each had the right
  status (200, or 404 with this page), no console errors or failed requests, no request to
  another site, no sideways scroll, every link at least 44px and not covered, Call 988 on the
  first screen, one h1 with headings in order, and Chrome's parsed page matching the source.
  Lowest text contrast: 7.62:1 light, 10.18:1 dark. All passed.
- Chrome with the stylesheet blocked: 18 loads, readable in order with every option, no
  sideways scroll. Text at 150% and 200%: passed, though at 200% Call 988 needs a scroll on a
  320px screen. Keyboard: all 10 links in order, each with a visible ring. Nothing moves. Print:
  black on white on two sheets, with all the help on the first. The jump to Spanish works.
- WebKit on this Mac, in a WKWebView window: 50 page audits at the same sizes, light and
  dark, 0 problems. This is not iOS Safari and not a phone.

Not tested: any real phone, the iOS Simulator, VoiceOver or TalkBack, Firefox, the live site
(nothing is published), or what the chat links open.

## Next step

- Both founders choose among the options for decision 1. If they choose this one, push the
  branch, open a pull request into `main`, review it, merge, and check the live site.
- When it is live, a person taps each call and text link on a real phone and stops at the dial
  or compose screen, never calling or texting. That is the "Never test on a crisis line" rule in
  `notes/SAFETY.md` on the task branches.
- It changes the same four pages as draft pull requests 5 and 8. If it merges, 8 isn't needed,
  and 5 will conflict in those pages and `404.html`. Take 5's versions once 5 is approved.
- Record the choice in `DECISIONS.md`.

---
type: handoff
owner: Claude Code (cloud session), at one founder's request
branch: claude/jolly-mayer-2m6eno
---

# Nine approved ideas

Date: November 6, 2026.

One founder approved A1, A2, A3, A4, A6, A7, B1, B2 and B6 from [[IDEAS]]. The other
founder has not agreed yet. See [[DECISIONS]].

First, the other session's `site/phone-accessibility-content` (draft pull request 6)
was merged into this branch, so this work builds on the newest pages. That merge
doesn't publish anything.

## Completed

| Idea | What was built | Files |
| --- | --- | --- |
| A1 Automatic checks | GitHub runs `tools/check_site.py` on every pull request | `.github/workflows/site.yml` |
| A3 Website only | On a change to `main`, the same workflow checks, then publishes only the website files (22 files, no notes). It stops if a page would be left out or a `.md` file would be published | `.github/workflows/site.yml` |
| A6 Offline | After one visit, pages load with no signal. Network first, saved copy only as a fallback. Only this site's own files; nothing sent or stored about visitors. "Add to home screen" icon | `sw.js`, `manifest.webmanifest`, `assets/icon-*.png`, `assets/menu.js` |
| A7 Dark mode | Follows the phone or computer setting | `assets/styles.css` |
| B1 Shorter Get Help | "Right now" box with four steps from existing page text; four long sections fold behind "Show more". "Other ways to reach someone" stays open. Contents links open the right fold | `get-help/index.html`, `assets/menu.js` |
| B2 Quick exit | Button on every page that opens weather.gov and replaces the page in the tab's history. Works without JavaScript as a plain link | every page, `assets/menu.js`, `assets/styles.css` |
| B6 Spanish | `es/` with Home, Get Help (Obtener ayuda) and Help Someone (Ayudar a alguien) fully translated, and Research pointing to the English page for now. Spanish crisis details come from [[SAFETY]]. "Leer en español" / "Read in English" on every page | `es/`, every English page |

`tools/check_site.py` now also checks Spanish pages by Spanish rules, the quick exit
on every page, the language link, and that the offline worker only lists real files
and never touches other sites. `CLAUDE.md` and the README say how to keep the
Spanish pages and the offline list up to date.

## Checked

- `python3 tools/check_site.py`: all checks passed, 9 pages.
- Broke the Spanish pages and the offline worker on purpose in a throwaway copy,
  seven ways; each break was caught, and the copy passed again once restored.
- Served the site the way GitHub Pages does and opened all 9 pages at 320, 390 and
  1440 pixels, in light and dark mode: no sideways scrolling, no errors, text
  contrast at least WCAG AA everywhere measured.
- Folded sections start closed and open from "On this page" links and from a
  direct address.
- Quick exit: the history length stays the same, and Back goes to the page before.
- Offline: after one visit, 16 files were saved; Get Help, the Spanish Get Help and
  Research opened with the network off; an unvisited address showed the page-not-
  found page with the crisis numbers. No request went to another site.
- The publish step was run locally: it copies 22 files and no notes.

Not checked: real phones, screen readers, how GitHub runs the workflow (it runs
once the branch is pushed), and the content itself.

## GitHub settings only a founder can change

The repository owner does these on github.com, in the repository's **Settings**.

**A4: turn off Issues and the Wiki.** Settings, General, Features: untick Issues
and Wikis.

**A2: require the other founder's approval.** Settings, Branches (or Rules,
Rulesets), add a rule for `main`: require a pull request before merging, require
1 approval, and require the status check "Check the website" to pass (it appears
in the list after the workflow has run once). Claude's pull requests are opened
from one founder's account, so the other founder is the one who approves them.

**A3: publish only the website.** Settings, Pages, Build and deployment, Source:
choose **GitHub Actions**. Do this right before merging pull request 5, then merge,
then check that the "Site" run under the Actions tab is green. Until then, Pages
keeps publishing every file on `main`, notes included. The repository itself stays
public either way.

## Decisions and open questions

- All nine are proposals until the other founder agrees.
- B1, B2 and B6 change crisis wording and stay drafts. Questions for the reviewer
  and a fluent Spanish reader are in [[CONTENT-REVIEW]].
- Offline copies leave a trace on shared devices. Listed in [[STATUS]] and
  [[CONTENT-REVIEW]].

## Next step

The other founder reads [[IDEAS]] and pull request 5. A founder changes the three
GitHub settings above when ready. Nothing here is on the public website until pull
request 5 is merged.

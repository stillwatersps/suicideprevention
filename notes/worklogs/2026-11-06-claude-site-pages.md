---
type: handoff
owner: Claude Code (cloud session), at the user's request
branch: claude/jolly-mayer-2m6eno
---

# Placeholder pages and site navigation

Date: November 6, 2026.

## Completed

Added three pages, with headings and a "being written" note but no real
content yet:

| Page | Address | Purpose |
| --- | --- | --- |
| Get Help | `/get-help/` | Getting help for yourself and what to expect |
| Help Someone | `/help-someone/` | Guiding someone you're worried about to support |
| Research | `/research/` | What studies show about prevention and getting support |

How visitors reach them:

- The main menu on every page: Get Help, Help Someone, Research, About.
  The current page is highlighted.
- The three homepage cards now open these pages instead of saying "coming soon".
- Links to every page in every footer, so they are reachable on phones
  without opening the menu.
- A "← Home" link at the top of each new page.

Each new page also has the crisis strip, Call/Text/Chat 988 buttons near the
top (the "Get Support Now" button jumps to them), and the About footer, per
[[SAFETY]]. The Help Someone page adds: "If they may be in danger right now,
stay with them if it is safe, and call or text 988 together, or call 911."

Each page is a folder with an `index.html`, so addresses stay short. The pages
were written from the homepage's header and footer; if the header changes,
update all four `index.html` files.

## Checked

- All four pages at 320, 390 and 1440 pixels wide: no sideways scrolling, no
  script errors, no failed file loads.
- Every internal link and `#` jump on every page points to a real page or
  section. The phone menu opens on every page.

## Decisions and open questions

- Page names were chosen by Claude at the user's request; rename freely.
- The Research page needs sources a reviewer trusts. Each claim should link to
  its study or to an official summary.
- All page content should follow safe messaging guidance in [[SAFETY]].

## Sync record

- November 6, 2026: pull request #4 opened. The other collaborator then added
  the shared-memory routine directly to `main` (commit `def6389`). Merged that
  `main` into this branch. Their `STATUS` and `TASKS` text was kept and this
  task's lines were added to it; nothing of theirs was removed.
- State at that point: pushed to `claude/jolly-mayer-2m6eno`, **not merged
  into `main`**.

## Next step

Write the content for each page. See the new tasks in [[TASKS]].

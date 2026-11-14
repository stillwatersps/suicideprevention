---
type: handoff
owner: Claude Code (desktop session), proposed by Claude
branch: claude/charming-swartz-e8d31c
---

# Correct main's status and task notes

Date: November 6, 2026.

**When written, this was draft pull request 7, not merged.** Claude proposed the
correction, and the founders hadn't agreed to it. If you're reading this on `main`,
a founder has merged it.

## Why

`main`'s notes said pull request 4 wasn't merged and page writing hadn't started. A
Claude session opened on `main` would read that as true. Draft pull request 5 has
corrected notes, but merging it also publishes draft pages that are waiting for
review. So this pull request corrects the notes on their own.

## Completed

- [[STATUS]]: says pull requests 3 and 4 are merged and the pages are public. Adds
  "What is where" and "Known issues on `main`". Updates the date, phase, and next
  step, and links this note.
- [[TASKS]]: moves pull request 4 to completed work. Moves the three page tasks to
  ready for review, and says first drafts are in draft pull requests 5 and 9 and that
  no qualified person has reviewed them.
- This note. The task first allowed only the two notes above. A founder then asked
  for this note so the work's context shows in Obsidian.

No page text changed.

## How notes reach Obsidian

- Obsidian shows the `notes/` folder of whichever branch your project folder is on.
- Work on a branch isn't in your usual Obsidian until it's merged into `main` and you
  click "Pull origin" in GitHub Desktop.
- To read a branch sooner, use GitHub, or switch branch in GitHub Desktop. Git refuses
  that switch if another folder on the same computer already has the branch open. In
  that case, you can open that folder's `notes/` as its own vault to read it.
- Conversations aren't saved in the notes. Only what a session writes down is.

## Checked

| Check | Result |
| --- | --- |
| Base | `main` stayed at `d610002` from start to finish |
| Pull requests, using `gh` | 3, 4, and 6 merged. 1, 5, 7, 8, and 9 are open drafts |
| Public site | Homepage, three placeholder pages, and `notes/STATUS.md` all load. The Pages API reported `built` at `d610002` |
| Known issues on `main` | Footer wording on all four pages. No robots tag on any page, and no `robots.txt`. "Privacy first" on the homepage, and no page mentions logs or IP addresses. "call or text 988 together" on Help Someone |
| Web host | GitHub's Pages documentation says it logs and stores visitors' IP addresses |
| Draft corrections | The heads of pull requests 5, 8, and 9 each change all four known issues |
| Obsidian links | `tools/check_site.py` isn't on `main`, so a throwaway script checked every link in these notes against `main`'s files. All resolve, and none points to a note that exists only on a branch |
| Later merges, simulated | With the heads of pull requests 5 and 9: conflicts in `STATUS` and `TASKS` only. With the head of pull request 8: no conflicts |
| Branch switch | Git refused to switch a folder to a branch another folder had open. GitHub Desktop itself wasn't tried |

## Not checked

- The notes weren't opened in Obsidian, so how the tables look there wasn't seen.
- The "988 together" issue rests on earlier review notes, `notes/CONTENT-REVIEW.md` on
  the draft branches. This session re-read only 988's Help Someone Else page, which
  doesn't describe it. A qualified reviewer should settle this.
- Clinical accuracy. This needs a qualified person.

## Decisions and open questions

No lasting decision was made here, so [[DECISIONS]] is unchanged.

- Open: merge or close this pull request. Merging publishes these notes within about
  a minute, so the founders decide.
- This records the four known issues and doesn't fix them. Draft pull request 8 would
  fix only those. Draft pull request 5 would fix them along with everything else in it.

## Next step

A founder merges or closes pull request 7.

- **If it merges:** click "Pull origin" in GitHub Desktop to see it in Obsidian.
- **When pull request 5 merges later:** keep its text in `STATUS` and `TASKS` when
  GitHub shows the conflict. This note stays. Lines in pull request 5's notes that call
  this pull request unmerged will then need updating.
- **If pull request 8 merges:** update the four known issues in `STATUS`, whichever
  merges first.
- **If pull request 5 merges first:** close this one. It's no longer needed.

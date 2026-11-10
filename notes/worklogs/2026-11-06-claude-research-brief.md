---
type: handoff
owner: Claude Code (cloud session), at the user's request
branch: claude/jolly-mayer-2m6eno
---

# Research brief added to the vault

Date: November 6, 2026.

## Completed

- Saved the founder-supplied PDF, unchanged, as
  `notes/attachments/research-and-website-copy-2026-11.pdf` (12 pages).
- Added [[RESEARCH-BRIEF]]: the PDF embedded for Obsidian, the full text copied
  in Markdown so it is searchable, a review tracker for the therapist, and
  Claude's questions for the reviewer.
- Added one rule to `CLAUDE.md`: read the brief before writing health, crisis,
  or research wording, and publish only reviewer-approved sections. This is how
  both Claude sessions "remember" it; nothing is stored in private Claude memory.
- Linked the brief from [[00 START HERE]], [[STATUS]] and [[TASKS]].

## Checked

- The Markdown copy was compared section by section with the PDF.
- PDF metadata holds no personal names (author field: "python-docx").
- No website pages were changed; nothing from the brief is published.
- The five source URLs in the brief were not opened: this session's network
  does not allow those sites.

## Decisions and open questions

- Pathways A and B are interactive and Pathway B mentions saving journal text,
  which conflicts with [[SAFETY]] rule 5. Listed for the reviewer and founders.
- The brief overlaps with the unmerged draft page text on branch
  `site/phone-accessibility-content`. Review both together.
- Once on `main`, GitHub Pages also serves this PDF and note at public
  addresses, like every other note. It contains no personal information.

## Next step

Share the PDF or [[RESEARCH-BRIEF]] with the licensed therapist. Record each
section's result in the tracker, then move approved text onto the pages.

## Sync record

- November 6, 2026: at a founder's request to keep the work together, merged
  `site/phone-accessibility-content` (the other session's page drafts, 404 page,
  check script and updated notes) into this branch. Conflicts were only in
  [[00 START HERE]] and [[STATUS]]; the other session's text was kept and the
  research brief lines were added to it. `python3 tools/check_site.py` passed
  (5 pages).
- State: pushed to `claude/jolly-mayer-2m6eno` and opened as draft pull request 5.
  The founder chose not to merge until both founders agree and the therapist
  has reviewed the content. Not on `main`.

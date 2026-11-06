# Shared memory and repository sync

Date: November 5, 2026.
Owner: assistant, at the user's request.
Branch: `setup/shared-context-sync`.

## Completed

- Downloaded the latest shared main into this Mac's local project, including
  the first homepage and its handoff notes.
- Added [[SHARED-MEMORY|A shared second-brain guide]] describing what is saved,
  how it reaches the other computer, and how active Claude sessions refresh it.
- Strengthened Claude's instructions to read current notes, record meaningful
  progress, and distinguish local, pushed, and merged work.
- Reconciled stale notes that still said there was no website code or that the
  first homepage was awaiting merge. Git history confirms pull request #3 merged.
- Kept local unrelated files outside this change.

## Checked

- Core Claude imports and internal note links resolve.
- GitHub main contains the homepage and its files.
- The GitHub Pages API reports main as its source and status `built`.
- App code and clinical content were not changed by this memory update.

## Next step

Both collaborators download the latest shared main and ask an already-open
Claude session to reread current status, decisions, tasks, and recent handoffs.
During future work, share the task's notes with its project changes and merge
before expecting the other person's main branch to contain them.

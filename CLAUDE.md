# Shared project instructions

This is a new suicide prevention website project for two collaborators.
The first intended platform is a phone-friendly website, launching in the U.S.
The intended audience includes adults and minors; exact age ranges are undecided.

## Shared context

Read these short shared notes at the start of a session:

@notes/PROJECT.md
@notes/STATUS.md
@notes/TASKS.md
@notes/DECISIONS.md

Read other notes and design files only when relevant to the current task.
For any health, crisis, or research wording on the website, read
notes/RESEARCH-BRIEF.md first. Publish a section only after its review tracker
shows approval by a licensed reviewer; until then, label any use of it as a draft.
Inspect notes/ and design/ for existing project material before creating new files.
Use notes/worklogs/ for concise task handoffs, with one file per task.
Shared notes are the handoff between collaborators; conversations are separate.
The Obsidian vault is notes/. Its entry point is notes/00 START HERE.md.
Update notes/STATUS.md when a task changes the project state.
Use notes/templates/ for task and handoff structures. Keep detailed worklogs
separate from the short core notes.

## Working together

- Check the current branch and any uncommitted changes before editing.
- Preserve existing work, notes, and design files.
- After the initial setup, use a separate branch for each task.
- Commit current changes on the current task branch before switching branches.
  Base new work on the latest shared default branch.
- Agree on a task and owner before starting; keep changes focused on that task.
- Before finishing, update the relevant task and write a short handoff describing
  what changed, what was checked, what remains, and any important decisions.
- Share code, notes, and design changes together when they relate to one task.
- Do not overwrite someone else's notes to resolve a conflict; preserve both
  contributions and reconcile them.

## Shared memory routine

- At the start of work, fetch the shared repository and check the current branch,
  remote updates, and local changes. Update a clean default branch with a
  fast-forward only when doing so preserves local work. Do not discard or
  automatically stash someone else's files to make a sync succeed.
- After downloading changes, explicitly reread the four core notes above and
  relevant recent worklogs. An existing conversation may still contain an older
  snapshot; reconcile it with the current files before proceeding.
- During a meaningful task, keep a short task-specific note in notes/worklogs/.
  Record the owner, branch, changed files, decisions, checks, open issues, and
  next step. Record partial progress before a long session ends.
- Keep notes/STATUS.md and notes/TASKS.md accurate. Add confirmed decisions to
  notes/DECISIONS.md; label proposals and unfinished work clearly.
- Include the relevant notes with the task's code/design changes when saving and
  sharing that task. Stage named project files, not unrelated or personal notes.
- Report whether work is local only, pushed to a task branch, or merged into
  shared main. Do not tell the other collaborator it is on main without checking.
- Save concise project summaries, not raw conversations or private account
  memory. For the human-readable sync loop, see notes/SHARED-MEMORY.md.

## Current project state

Read notes/STATUS.md, README.md, and the current files for the phase and any
available run/check instructions. Verify old handoffs against the current branch
instead of assuming their descriptions still apply.
Keep credentials, personal journals, and real users' health information out of
this repository. Use fictional examples for prototypes.

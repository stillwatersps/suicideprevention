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
@notes/SAFETY.md

Before changing code, read notes/CODE-MAP.md: where every file is, what to edit for each kind of
change, and which checks to run. Keep it current when the layout changes.
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
- After downloading changes, explicitly reread the core notes listed above and
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

## Crisis content rules

Proposed on a task branch, for both founders to confirm. Follow them until then.

- Never place test calls, send test texts, start chats, or submit forms on a crisis
  service, on any page or device.
- Take crisis numbers and claims from the provider's own page, and record the page
  and date in notes/SAFETY.md. Never write them from memory.
- Read every source you cite. Keep draft health content marked for review, and do
  not describe it as reviewed until a qualified person has signed off.
- Merging into main publishes the website. Do not merge crisis wording without both
  founders' review, until open decision 4 in notes/DECISIONS.md is settled.
- Everything on main, and in this public repository, is public. Keep personal names,
  email addresses, and local file paths out of notes and pull requests.
- Before sharing a website change, run `python3 tools/check_site.py`.
- Only the Daily check-in (check-in/ and es/registro-diario/) may have places to type or choose.
  Nothing typed there may leave the page or be stored until both founders agree to the plan in
  notes/CHECK-IN-BACKEND.md. tools/check_site.py enforces this.
- The phone app in app/ is built from the website and never published by it. It may save on the
  phone only, never send anything to Tidelight. Every word it adds is in app/src/text/, in English and
  Spanish. Before sharing an app change, run `npm test` in app/.
- Each English page has a Spanish twin in es/. Change both together, and keep the
  Spanish pages marked as an unreviewed AI translation until a fluent reader signs off.
- When adding a page, add it to the CORE list in sw.js (and change its VERSION) and,
  for a new top-level folder, to the copy list in .github/workflows/site.yml. Also add it
  to the review list on the About pages and to tools/make_review_packet.py.
- Before sharing a page change, also run `python3 tools/test_browser.py` if Chrome is
  installed, `python3 tools/test_webkit.py` on a Mac, and rebuild the packets with
  `python3 tools/make_review_packet.py`.
- Never say something was tested on a phone unless it was. Keep desktop browser, phone-size
  emulation, WebKit on a Mac, iOS Simulator, and real phone results apart. See notes/PHONE-TEST.md.

## Current project state

Read notes/STATUS.md, README.md, and the current files for the phase and any
available run/check instructions. Verify old handoffs against the current branch
instead of assuming their descriptions still apply.
Keep credentials, personal journals, and real users' health information out of
this repository. Use fictional examples for prototypes.

# Stillwater shared project

Shared workspace for planning a phone-friendly suicide prevention website.
It contains a design reference, an Obsidian vault, and Claude Code instructions.
App implementation has not begun.

## Open the shared notebook

1. In GitHub Desktop, select this repository, then **Fetch origin** and
   **Pull origin** if updates are available.
2. In Obsidian's vault manager, choose **Open folder as vault**.
3. Select the `notes` folder inside your local `suicideprevention` project.
4. Open **00 START HERE**.

The vault is already created. Each person opens their own local copy of this
existing folder once. No additional empty vault or Obsidian Sync subscription
is needed for this GitHub workflow.

## Open in Claude Code

Select the whole local `suicideprevention` project folder containing `CLAUDE.md`.
Claude's instructions import the brief, status, task board, and decisions.
Each person uses their own Claude access and conversation.

## What is inside

| Location | Purpose |
| --- | --- |
| `CLAUDE.md` | Shared Claude Code instructions |
| `notes/00 START HERE.md` | Obsidian home page |
| `notes/PROJECT.md` | Project brief |
| `notes/STATUS.md` | Current progress and next steps |
| `notes/TASKS.md` | Task board |
| `notes/DECISIONS.md` | Lasting decisions |
| `notes/DESIGN.md` | Homepage preview and design questions |
| `notes/WORKFLOW.md` | Collaboration instructions |
| `notes/templates/` | Task and handoff templates |
| `notes/worklogs/` | Detailed handoffs |
| `design/` | Supplied SVG and original pasted source |
| `index.html`, `assets/` | The homepage, served by GitHub Pages |
| `get-help/`, `help-someone/`, `research/` | Other website pages |

## Work independently

The shared second-brain guide is `notes/SHARED-MEMORY.md`. Claude saves progress,
decisions, and handoffs in the notes; those notes travel with the task through
GitHub. After downloading updates, Obsidian refreshes them and an active Claude
session should reread them. GitHub pushes and pulls are still required; this is
not automatic conversation synchronization.

Download the latest default branch, create a task branch, and work on one agreed
task. Update the relevant notes and handoff, commit and upload, then have the
other person review and merge. Both download the merged work before starting
the next task. Full instructions are in `notes/WORKFLOW.md`.

GitHub shares saved notes and code when you upload and pull. Live typing and
Claude conversations stay separate.

## First-time GitHub setup

The repository owner invites the other GitHub account through the repository's
access settings. After accepting, each person uses GitHub Desktop's
**File > Clone Repository > URL** with:

https://github.com/stillwatersps/suicideprevention.git

The repository is already initialized. The earlier starter ZIP does not need
to be copied again.

## Official guides

- [Open an existing folder as an Obsidian vault](https://obsidian.md/help/manage-vaults)
- [Shared Claude Code instructions](https://code.claude.com/docs/en/memory)
- [Clone with GitHub Desktop](https://docs.github.com/en/desktop/adding-and-cloning-repositories/cloning-and-forking-repositories-from-github-desktop)

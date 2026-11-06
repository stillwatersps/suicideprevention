# Stillwater shared project

Shared workspace for a phone-friendly suicide prevention website.
It contains the website (plain HTML, CSS, and one small script), a design
reference, an Obsidian vault, and Claude Code instructions.
GitHub Pages publishes the `main` branch as a public website, so merging into
`main` publishes. The content has not had professional review yet; see
`notes/STATUS.md` for the current state.

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
Claude's instructions import the brief, status, task board, decisions, and safety
baseline.
Each person uses their own Claude access and conversation.

## What is inside

| Location | Purpose |
| --- | --- |
| `CLAUDE.md` | Shared Claude Code instructions |
| `notes/00 START HERE.md` | Obsidian home page |
| `notes/PROJECT.md` | Project brief |
| `notes/STATUS.md` | Current progress and next steps |
| `notes/TASKS.md` | Task board |
| `notes/DECISIONS.md` | Decisions, proposals, and open questions |
| `notes/SAFETY.md` | Crisis resources, where each was read, and content ground rules |
| `notes/CONTENT-REVIEW.md` | Every crisis control, and questions for a qualified reviewer |
| `notes/RESEARCH-BRIEF.md` | Founder-supplied research and website copy, awaiting review |
| `notes/DESIGN.md` | Homepage preview and design questions |
| `notes/WORKFLOW.md` | Collaboration instructions |
| `notes/SHARED-MEMORY.md` | How notes reach the other person and their Claude session |
| `notes/templates/` | Task and handoff templates |
| `notes/worklogs/` | Detailed handoffs |
| `design/` | Supplied SVG and original pasted source |
| `index.html`, `assets/` | The homepage, served by GitHub Pages |
| `get-help/`, `help-someone/`, `research/` | Other website pages |
| `404.html` | Shown for any missing address, keeps crisis help on screen |
| `tools/check_site.py` | Checks pages, links, and Obsidian notes |

## Check the website

Run these from the project folder. They need only Python 3, use git if it is there,
and change nothing.

```bash
python3 tools/check_site.py
```

```bash
python3 tools/check_site.py --check-links
```

The second command also loads every outside link. To see the site on your own
computer, run `python3 -m http.server 8000` and open `http://localhost:8000/`.
The 404 page only works fully on GitHub Pages. To see it locally, run the same command
from the folder that holds your project folder, and open
`http://localhost:8000/suicideprevention/404.html`.
Passing these checks does not replace testing on a real phone or a content
review. `notes/CONTENT-REVIEW.md` lists what still needs a person.

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

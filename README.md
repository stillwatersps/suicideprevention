# Tidelight shared project

Shared workspace for a phone-friendly suicide prevention website.
It contains the website (plain HTML, CSS, a site script, and an offline service worker), a design
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
| `es/` | Spanish pages, an AI translation awaiting a fluent reader |
| `sw.js`, `manifest.webmanifest`, `assets/icon-*.png` | Offline support and the home screen icon |
| `.github/workflows/site.yml` | Runs the checks on pull requests. Once Pages is set to GitHub Actions, it publishes only the website from `main` |
| `.github/workflows/monitor.yml` | Daily: the live site shows its crisis help. Monthly: outside links that allow automated checks still open, the rest are listed for a person, and each provider page that can be read still shows our crisis details |
| `tools/check_live.py`, `tools/check_readability.py` | Live-site check, and a plain-language report |
| `teens/`, `card/` | For Teens page, and printable wallet cards and poster |
| `check-in/`, `assets/check-in.js` | Daily check-in, which saves nothing. See `notes/CHECK-IN-BACKEND.md` |
| `not-sure/`, `after-a-loss/`, `about/` | Not sure what you're feeling?, After a loss, and About and privacy |
| `assets/*.vcf` | Contact cards for saving 988 to a phone |
| `tools/preview_server.py` | Serves the site the way GitHub Pages will, on this computer or a phone on the same Wi-Fi |
| `tools/test_browser.py`, `tools/browser.py` | Browser tests, using Python and the Chrome already on the computer |
| `tools/make_review_packet.py`, `notes/review-packet/` | Printable packets for the therapist and a fluent Spanish reader. With `--changes`, short packets of only what changed since each reviewer's approvals |
| `notes/PHONE-TEST.md` | How to test on a real phone |
| `notes/FOUNDER-BRIEF.md`, `notes/LAUNCH-CHECKLIST.md`, `notes/REVIEWER-NOTES.md`, `notes/UPKEEP.md` | Decisions, the path to launch, notes for reviewers, and upkeep |
| `notes/FIRST-VERSION.md` | What the first version is and isn't, and its main journeys. A proposal |
| `tools/launch_gate.py` | Shows what's still in the way of launching. Once Pages is set to GitHub Actions, it stops publishing unless a qualified reviewer's approval of each section's current text is recorded |
| `tools/check_crisis_sources.py` | Checks that each provider's page still shows our crisis details |
| `tools/set_checked_date.py` | Updates the "last checked" date on every page, after a real re-check |
| `tools/test_the_tests.py` | Plants bugs in a copy of the site to prove the browser tests catch them |
| `tools/test_webkit.py` | On a Mac, runs the layout audit and main behaviors in WebKit. Not iOS and not a phone |

## Check the website

Run these from the project folder. They need only Python 3, use git if it is there,
and change nothing.

```bash
python3 tools/check_site.py
```

```bash
python3 tools/check_site.py --check-links
```

```bash
python3 tools/make_review_packet.py --self-test
```

The second command also loads every outside link. The third checks the review packet tool on made-up cases,
such as a crisis line taken off one page, and changes nothing. To see the site the way GitHub Pages
will serve it, including the 404 page:

```bash
python3 tools/preview_server.py
```

Then open `http://localhost:8000/suicideprevention/`. To test on a phone, see
`notes/PHONE-TEST.md`. To test in a real browser, if Google Chrome is installed:

```bash
python3 tools/test_browser.py
```

It takes a few minutes, uses a throwaway Chrome profile, and never calls, texts, or
submits anything. If you change a page, rebuild the review packets:

```bash
python3 tools/make_review_packet.py
```

Where this workflow exists, on `main` or on a pull request's branch, GitHub runs the first check, the
tools' self-tests, the packet tool's among them, and the browser tests automatically. Pull requests 1, 7, and 8 don't have it, so nothing checks them automatically.
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

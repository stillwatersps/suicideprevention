# Working together

[[00 START HERE|Back to Start Here]]

## Open the project on each computer

1. Download the `stillwatersps/suicideprevention` repository in GitHub Desktop.
2. In Obsidian's vault manager, choose **Open folder as vault** and select the
   `notes` folder inside the local `suicideprevention` project.
3. Open [[00 START HERE|Start Here]].
4. In Claude Code, select the whole `suicideprevention` folder containing
   `CLAUDE.md`, so Claude can use the notes and design files.

The vault already contains notes and settings. Each person opens their own local
copy once. Neither person needs to create another empty vault.

## Start a task

1. Commit unfinished changes on their current task branch before switching.
2. Switch to the default branch, then **Fetch origin** and **Pull origin** if
   changes are available in GitHub Desktop.
3. Read [[STATUS]] and [[TASKS]]. Agree who owns the next task.
4. Create a task branch, for example `planning/mobile-layout`.
5. Copy [[templates/Task|The task template]] into `worklogs/` using a dated,
   distinctive filename such as `2026-11-06-mobile-layout.md`. Leave personal names
   out of it, because anything merged into `main` is public.
6. Work with Claude Code, Obsidian, or your design tools.

The built-in Templates feature is configured to use `templates/`. You can also
use Obsidian's command palette and choose **Templates: Insert template**.

Each person can work on a different task at the same time. Coordinate before
editing the same file and use separate handoff files.

## Finish a task

1. Update the task and relevant decisions.
2. Write a summary using [[templates/Handoff|The handoff template]].
3. Update [[STATUS]] with what the next person needs to know.
4. Review the changed files in GitHub Desktop, enter a summary, and commit. Desktop
   selects every changed file by default, so untick anything personal. The vault
   folder can hold private notes, and anything committed to `main` becomes public.
5. Publish or push the branch, then create a pull request.
6. Have the other collaborator review it and combine it with the shared project.
   Merging publishes the website within about a minute.
7. After a merge, update [[STATUS]] and [[TASKS]] to say so. A note inside a pull
   request can't say it merged.
8. Both download the updated default branch before starting the next task.

## Claude session reminder

Ask Claude to read `CLAUDE.md` and the shared notes before working. At the end,
ask it to update the status, relevant decisions, and task handoff. The notes are
the written handoff; Claude conversations remain separate.
An already-open Claude session should reread the core notes and recent handoffs
after downloading someone else's changes. See [[SHARED-MEMORY|Our shared second brain]]
for exactly what is shared and what still needs a push or pull.

## If the other computer looks out of date

Check that it uses the same repository and default branch, then fetch and pull
in GitHub Desktop. Saved notes reach the other person through GitHub.

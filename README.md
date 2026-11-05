# Shared project starter

Starter workspace for `stillwatersps/suicideprevention`.

This kit contains shared notes, Claude Code instructions, and the supplied
Stillwater homepage SVG. Add your existing project-only Obsidian notes.
There is no app code yet.

## 1. Give both people access

Use separate GitHub accounts. The repository owner opens:

https://github.com/stillwatersps/suicideprevention

Then chooses Settings > Collaborators > Add people, invites the other person's
GitHub account, and has them accept the invitation. If the repository belongs
to an organization, its owner may need to grant access through that organization.

## 2. Both download the shared project

Install GitHub Desktop from https://desktop.github.com/ and sign in to your own
GitHub account. In GitHub Desktop, choose File > Clone Repository > URL and enter:

https://github.com/stillwatersps/suicideprevention.git

Choose a local folder and click Clone. Keep track of that local folder: it is
the project folder you will open in Claude Code. An empty repository is fine.

## 3. One person adds the starting files

Only one person does this first import; the other downloads the result afterward.

1. Unzip the starter kit.
2. Copy the contents of `shared-project-starter` into the cloned project folder.
   Copy the files inside the folder, rather than adding another nested starter
   folder. Include the hidden `.gitignore` file; on Mac, Command + Shift + Period
   shows hidden files. Preserve existing files and merge any existing instructions
   or ignore rules instead of replacing them.
3. Copy the existing project-only Obsidian notes into `notes/`. Preserve their
   structure and any attachments they use. Keep personal notes elsewhere.
4. The supplied homepage SVG is already in `design/homepage.svg`. Add any other
   design references to `design/`, preserving their filenames.
5. In GitHub Desktop, review the Changes list, enter a summary such as
   "Create shared workspace", and commit to the default branch.
6. Click Push origin, or Publish branch if that is the button shown for the first
   commit. This sends the starting files to the existing GitHub repository.
7. The other person clicks Fetch origin, then Pull origin if updates are offered.

## 4. Open the same workspace on both computers

In Claude Code, open or start a session in the cloned project folder that contains
`CLAUDE.md`. Each person uses their own Claude access.

In Obsidian, open the project's `notes/` folder as a vault. Your friend can keep
the original vault while checking the copied notes and attachments. Once the
shared copy is verified, edit the shared notes in this project folder.

GitHub is the way this setup shares project notes and code between computers.
Changes do not appear on the other computer until they are uploaded and pulled.
Claude Code loads `CLAUDE.md`, which imports the short shared project notes.
Your conversations stay separate; write lasting decisions and task handoffs in
the shared notes.

## 5. Use this routine for each task

1. Commit current changes on your current task branch before switching branches.
   In GitHub Desktop, switch to the default branch and fetch/pull its latest changes.
2. Choose Current Branch > New Branch. Give the task a descriptive name, such as
   `design/home-screen` or `research/support-content`.
3. Work in Claude Code or Obsidian. Agree who owns the task to reduce overlapping
   edits. Both collaborators can work at the same time on different tasks.
4. Update the relevant notes and add a short task handoff in `notes/worklogs/`.
5. Review the changes, commit them, and click Publish branch or Push origin.
6. Create a pull request: a proposal to combine your task with the shared project.
   Have the other person review it, then merge it when ready.
7. Both switch back to the default branch and pull the combined result before
   starting the next task.

GitHub Desktop handles the uploading and downloading, so you do not need to learn
terminal Git commands to start collaborating.

## Check that it works

- Both people can see the same files on GitHub and on their own computers.
- Both can open the project in Claude Code and the notes in Obsidian.
- One person changes a sample note on a task branch and publishes it.
- The other person can review the change, and both can pull it after it is merged.
- Claude can summarize `notes/PROJECT.md` and identify the next task.

After that, the shared workspace is ready for choosing and building the website.

## Official guides

- Invite a collaborator: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository
- Clone with GitHub Desktop: https://docs.github.com/en/desktop/adding-and-cloning-repositories/cloning-and-forking-repositories-from-github-desktop
- Work on branches: https://docs.github.com/en/desktop/making-changes-in-a-branch/managing-branches-in-github-desktop
- Shared Claude instructions: https://code.claude.com/docs/en/memory
- Obsidian stores notes in a folder: https://obsidian.md/help/data-storage

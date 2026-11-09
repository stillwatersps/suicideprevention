---
type: handoff
owner: Claude, at one founder's request
branch: site/minimal-public-preview
---

# Publish only the one crisis page

Date: November 9, 2026

## Completed

On November 9, 2026, both founders chose pull request 12's crisis page until the content is reviewed
(answer 1), and chose to publish the website without the notes (answer 4). The publish step for that
was only on pull request 5's branch, and it waits for review sign-offs, so it couldn't publish this
page. Claude added one to this branch:

- `.github/workflows/site.yml`: on every pull request and every change to `main`, it copies only
  `index.html`, `404.html`, `get-help/`, `help-someone/`, `research/`, and the two files they load,
  `assets/preview.css` and `assets/preview-icon.svg`. Then it checks the copy, and publishes it only
  on `main`. Notes, designs, `CLAUDE.md`, `README.md`, and the old pictures and scripts stay out.
- It stops before publishing if:
  - a page is missing call 988, text 988, call 911, the 988 chat link, or its noindex tag;
  - any call or text link, in either language, goes anywhere but 988 or 911;
  - a page links to a file that isn't published;
  - a new page exists that isn't on the list;
  - a file that isn't HTML, CSS, or SVG would be published.
- It uses the same action versions as pull request 5's version. Each pinned commit matches its
  release tag on GitHub, checked November 9, 2026.
- [[STATUS]]'s top section now says what happens once this is on `main`.

It has the same name as pull request 5's version. When pull request 5 merges after this, take that
version.

## Checked

- Ran the copy-and-check step from the workflow file on a copy of this branch, on a Mac: it passes
  and lists the seven published files.
- 11 planted faults, each in its own copy, all stopped it. They covered:
  - each crisis link changed, including only the Spanish call link;
  - noindex removed;
  - a stylesheet or icon that isn't published;
  - a new page missing from the list;
  - a note inside a page folder.
- The first run missed three of the planted faults, because each page has its call and text links
  twice, once in English and once in Spanish. The check now also rejects any call or text link that
  isn't 988 or 911.
- GitHub runs the checking part on pull request 12. The pull request shows the result.
- The publish part can't run until it's on `main` and Pages is set to GitHub Actions, so it hasn't
  been tried. Nothing was published.

## Decisions and open questions

- The order to go live, for the repository owner:
  1. Both founders approve and merge pull request 12. This publishes the page through the old
     setting within about a minute, notes included.
  2. In Settings > Pages, set Source to "GitHub Actions".
  3. In the Actions tab, open the latest "Site" run on `main` and choose "Re-run all jobs".
  4. Check that the site shows the crisis page, and that an address under `notes/` shows the
     page-not-found page.
- Close pull request 8 after pull request 12 merges.

## Next step

Both founders approve pull request 12, then follow the order above.

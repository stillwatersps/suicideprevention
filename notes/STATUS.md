# Current status

Checked November 9, 2026, on the task branch named below. A note inside a pull
request can't say when it merged, so check GitHub if this looks out of date.

## What is where

| Where | What | State |
| --- | --- | --- |
| `main`, commit `ad0ba65` when checked | Homepage, placeholder Get Help, Help Someone, and Research pages, notes, and since November 9 the planning drafts and the November 6 notes correction (pull requests 1 and 7) | Public through GitHub Pages |
| `claude/jolly-mayer-2m6eno` | Everything below from `site/phone-accessibility-content`, the [[RESEARCH-BRIEF]] PDF and notes, and improvement ideas one founder approved: Spanish pages, quick exit, dark mode, offline support, a shorter Get Help, automatic checks, website-only publishing, live-site monitoring, a readability report, myths and facts, printable wallet cards, and a teen page. See [[worklogs/2026-11-06-claude-approved-ideas\|first batch]] and [[worklogs/2026-11-06-claude-second-batch\|second batch]] | Draft pull request 5 into `main`, **not merged, not on the public website** |
| `site/first-version-finish` | Everything on the branch below, renamed Tidelight, plus the November 7 work: every finding of a 14-area AI audit checked and applied in both languages, three independent code reviews and their fixes, an iPhone landscape fix found in the iOS Simulator, a stricter publish check, the audit's questions for the reviewer, and rebuilt review packets. Later on November 7 it also took in a one-page first-version description, [[FIRST-VERSION]], and review sections for the Spanish lines on English pages. See [[worklogs/2026-11-07-claude-first-version-finish\|the handoff]] | Merged into `claude/jolly-mayer-2m6eno` on November 9, 2026, at a founder's request, with pull requests 13, 14 and 15 merged into it first. Closes pull request 10. **Not on the public website** |
| `site/compact-crisis-strip` | A compact one-row crisis strip that stays on screen with larger text and on older phones on their side, where the full strip scrolls away. A proposal. Its handoff is on that branch | Merged into `site/first-version-finish`, and so into `claude/jolly-mayer-2m6eno`, on November 9, 2026, at a founder's request. Closes pull request 13. **Not on the public website** |
| `site/signage-redesign` | A new visual design for every page, built in a separate session at one founder's request | Draft pull request 11 into `claude/jolly-mayer-2m6eno`. Merging it swaps Shoreline for signage there and publishes nothing. **Not merged.** See its description |
| `site/pro-max-redesign` | A second proposed visual design, "Shoreline", built with the ui-ux-pro-max design skill at one founder's request: paper and ink, one tide blue for help, AAA contrast, stylesheet only. An alternative to pull request 11. See [[worklogs/2026-11-08-claude-shoreline-redesign\|the handoff]] | Merged into `site/first-version-finish`, and so into `claude/jolly-mayer-2m6eno`, on November 9, 2026, at a founder's request, so Shoreline is now the look on pull request 5. Closes pull request 14. Pull request 11, signage, stays open. **Not on the public website** |
| `site/daily-check-in` | A Daily check-in and self-discovery page in English and Spanish, built from one founder's spec on Shoreline. Works in the page; saves nothing. One founder chose a phone app with iCloud or Google backup for saving; not built. See [[worklogs/2026-11-09-claude-daily-check-in\|the handoff]] and [[CHECK-IN-BACKEND]] | Merged into `site/pro-max-redesign`, and so into `claude/jolly-mayer-2m6eno`, on November 9, 2026, at a founder's request. Closes pull request 15. **Not on the public website** |
| `site/minimal-public-preview` | One crisis page with 988 and 911 in English and Spanish, in place of the four live pages: option B for open decision 1 in [[DECISIONS]]. Its handoff is on that branch | Draft pull request 12 into `main`, **not merged.** Both founders chose it on November 9, and it now has a website-only publish step. **Merging publishes it within about a minute.** It replaces the same pages as pull requests 5 and 8, so it conflicts with both |
| `site/first-version-build` | Everything on the branch above, plus the rest of the first version: Not sure what you're feeling?, After a loss, About and privacy, saving 988 to contacts, review status, the full Spanish Research page, review packets, phone test steps, and browser tests. See [[worklogs/2026-11-06-claude-first-version\|the handoff]] | Merged into `claude/jolly-mayer-2m6eno` on November 7, 2026, at a founder's request, which closes pull request 9. **Not on the public website** |
| `site/phone-accessibility-content` | A second round: fixes from an independent review, stronger site checks, and updated notes | Merged into `claude/jolly-mayer-2m6eno` on November 6, 2026, at a founder's request, so pull request 6 is closed by that merge. Pull request 5 is the one place to review. **Not on the public website** |
| `notes/founder-decisions` | Both founders' answers to 14 questions recorded in [[DECISIONS]], this note, [[TASKS]], and an updated [[FIRST-VERSION]]. See [[worklogs/2026-11-09-claude-founder-decisions\|the handoff]] | A draft pull request into `claude/jolly-mayer-2m6eno`, built on pull request 17. Publishes nothing. **Not on the public website** |
| `claude/charming-swartz-e8d31c`, commit `546308d` when checked | Corrections to `notes/STATUS.md` and `notes/TASKS.md` on `main`, plus a handoff, no page changes | Merged into `main` as pull request 7 on November 9, 2026, so those notes are public |
| `site/live-page-corrections`, commit `dd44812` when checked | Only the first four known issues below, on the four live pages, plus a handoff. No draft content | Draft pull request 8 into `main`, **not merged**. Merging publishes those page changes and the handoff. Its description covers the conflict with pull request 5 |
| `planning/morning-brief` | First planning drafts, now in `notes/planning/` | Merged into `main` as pull request 1 on November 9, 2026, so they are public. Partly out of date |

Unmerged doesn't mean private. The repository is public, so anyone on GitHub can
read every branch.

Your Obsidian shows whichever branch your project folder is on. To read these notes
before merging, switch your project to that branch in GitHub Desktop, or read them on
GitHub. On `main` you won't see them until the branch is merged and you download `main`.

## Current phase

`main` is a public early preview. A complete first version, with unreviewed draft content, is
on a task branch, ready for phone testing and human review. It is not ready for the public.
Both founders agreed 14 decisions on November 9, 2026, listed in [[DECISIONS]]; most still
need a setting changed or work done. Professional review hasn't happened yet. It has been tried in desktop
Chrome, phone-size emulation, WebKit on a Mac, and the iOS Simulator (iPhone 17, iOS 27.2), but
not on a real phone.

## In place on main

- The shared repository, the Obsidian vault in `notes/`, and Claude's instructions.
- The supplied design in `design/homepage.svg`.
- Homepage and three placeholder pages, merged through pull requests 3 and 4 and
  public at https://stillwatersps.github.io/suicideprevention/.
- The first planning drafts in `notes/planning/` and the November 6 correction to `main`'s status
  and task notes, merged through pull requests 1 and 7 on November 9, 2026, by a founder.
- [[SHARED-MEMORY]] explains how notes reach the other computer.

## On the task branches, waiting for review

- See [[worklogs/2026-11-06-claude-site-improvements|the handoff]] for what changed
  and what was checked.
- Draft content on every page except the page-not-found page, marked for review. [[CONTENT-REVIEW]] lists
  every call, text, and chat control, and every question for a qualified reviewer.
- [[SAFETY]] now records each crisis resource and where it was read.
- Pages ask search engines not to list them. This is a proposal in [[DECISIONS]].
- A founder-supplied research and website-copy brief (PDF plus a searchable copy)
  is in [[RESEARCH-BRIEF]], awaiting a licensed therapist's review. Review it
  alongside [[CONTENT-REVIEW]], which compares it with the draft pages. The Not sure page
  uses Pathway A's wording, word for word.

- A complete first version on `claude/jolly-mayer-2m6eno` (pull request 5): 19 pages in English and Spanish,
  renamed from Stillwater to Tidelight on November 7, 2026. See [[worklogs/2026-11-07-claude-rename-tidelight|the rename handoff]].
  [[PHONE-TEST]] says how to try it on a phone. `notes/review-packet/` has printable packets
  for the licensed therapist and a fluent Spanish reader. See
  [[worklogs/2026-11-06-claude-first-version|the handoff]] for what was and wasn't tested.
- The November 7 audit, code reviews, and Simulator results are on `site/first-version-finish`,
  draft pull request 10. See [[worklogs/2026-11-07-claude-first-version-finish|that handoff]].
- [[FIRST-VERSION]] describes what the first version is and isn't, and its main journeys, for both
  founders to correct and agree. See [[worklogs/2026-11-07-claude-first-version-brief|its handoff]].
- The Spanish lines on English pages, such as the links to Spanish every page shares and the Spanish
  parts of Get Help, After a loss, the wallet card and the page-not-found page, now have their own
  sections in the Spanish packet, and the publish check needs a fluent reader's approval for them.
  See [[worklogs/2026-11-07-claude-spanish-sections|that handoff]].

## Known issues

- Offline support (idea A6) saves copies of this site's pages on a visitor's phone or
  computer. On a shared device that is another trace of the visit, like browser
  history, and Quick exit can't remove it. A question for the reviewer in
  [[CONTENT-REVIEW]].
- The Spanish pages are an AI translation no fluent reader has checked. Many outside
  sources and services they point to are in English only.
- Quick exit only replaces the current page. Back can still reach Tidelight pages opened
  earlier in that tab, as testing showed. The About pages say so.
- The teen page and the wallet cards are drafts. Supported ages are undecided, and
  the cards should not be printed for handing out until reviewed.
- Some sentences on the pages are over 25 words, most of them in Spanish. Many are research
  summaries, and the longest explain when 988 may involve emergency services.
  `tools/check_readability.py` lists them for the reviewer.
- With larger text, and on short screens 568 to 703 px wide such as older phones on their side,
  the full crisis strip scrolls away. A compact one-row strip now pins there instead, merged into
  pull request 5's branch on November 9, 2026 (it was pull request 13). Still a proposal for both
  founders and the reviewer. See [[DECISIONS]].

On `main`, and public now. The task branches correct each of these, and draft pull
request 8 would correct the first four on its own:

- The footer says content "is still being reviewed", which overstates it.
- Pages have no `noindex` tag, so search engines may list them.
- The homepage says "Privacy first" and doesn't mention that the web host logs
  visitors' IP addresses.
- Help Someone says to "call or text 988 together". The official pages Claude read
  don't describe that, so the draft dropped it.
- `notes/STATUS.md` and `notes/TASKS.md` on `main` describe the project as of November 6, from
  pull request 7, merged November 9. A session opened on `main` reads that older picture. See [[TASKS]].

Everywhere:

- No qualified person has reviewed any crisis or health wording, on `main` or on
  the task branches.
- Pages publishes every file on `main`, including these notes, so unverified or
  draft notes are public web addresses. Both founders decided on November 9 to publish the
  website only, through GitHub Actions. Not done yet.
- Until then, merging pull request 5 publishes notes and pages together.
- Call and text links have never been tried on a real phone, or with VoiceOver or
  TalkBack. The iOS Simulator showed the contact card and Quick exit, but it can't place calls.

## Still to confirm

- Both people have the latest project on their computers and can open this vault.
- Which design, after trying both on a real phone.
- Whether the check-in saves to the person's iCloud or Google account, or to a Tidelight account.
- The names: who rechecks crisis numbers, who gets GitHub's emails, the Spanish reader, a lawyer.

## Next useful step

Both founders agreed these on November 9, 2026. Details in [[DECISIONS]] and [[TASKS]].

1. **In GitHub's settings, today:** turn off Issues and the Wiki, and require the other founder's
   approval for merges into `main`. The repository owner does this.
2. **Book the licensed therapist and find a fluent Spanish reader.** Give them the packets in
   `notes/review-packet/`, and record results in [[CONTENT-REVIEW]]. The reviewer looks first at idea
   E1 in [[IDEAS]], marked Important. Everything in pull request 5 waits for this.
3. **Publish the one crisis page.** Pull request 12 now has a website-only publish step, added
   November 9. Mark it ready for review, since GitHub won't merge a draft. The founder who didn't
   open it approves it on GitHub, and then either founder merges it. Then the repository owner switches Pages to
   GitHub Actions and re-runs the latest Site run, in the order its description gives. Then close
   pull request 8. Merging publishes. Before or right after the merge, a founder reads 988's Get
   Help page to confirm the page's numbers and words, fills in "Person confirmed" in [[SAFETY]], and taps each link on a real iPhone and Android
   phone, stopping at the dial or message screen. Nobody has done either yet.
4. **Try Shoreline and signage on a real phone,** using [[PHONE-TEST]], and merge or close pull
   request 11.
5. **Both founders read** the updated [[FIRST-VERSION]], [[SAFETY]], and the crisis rules in
   `CLAUDE.md`, and record them as agreed. Merge pull request 17 into pull request 5's branch.
6. **Smaller steps:** the trademark check, a lawyer for under-13s, owners for upkeep, and private
   notes moved outside the project folder.

On November 9, 2026, at one founder's request, every pull request that publishes nothing was merged
into `claude/jolly-mayer-2m6eno`: 15 (Daily check-in) into 14 (Shoreline), 14 and 13 (compact strip)
into 10, and 10 into pull request 5's branch. Pull request 11 (signage) stays open, because it
rewrites the same stylesheet as Shoreline. Merging pull
request 5 into `main` publishes everything, so do that only after the decision and review. Pull
requests 8 and 12 are separate, and merging either one publishes it: 8 corrects four problems on
`main`'s pages, and 12 replaces those pages with one crisis page. Pull requests 1 and 7 were merged
into `main` on November 9. Pull request 11 goes into this branch and publishes nothing; merging it
swaps Shoreline for signage.

## End-of-session update

Keep this page short: current phase, completed work, open questions, and next
step. Put detailed changes in a task-specific handoff in `worklogs/`.

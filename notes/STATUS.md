# Current status

Checked November 11, 2026, on the task branch named below. A note inside a pull
request can't say when it merged, so check GitHub if this looks out of date.

## What is where

| Where | What | State |
| --- | --- | --- |
| `main`, commit `ad0ba65` when checked | Homepage, placeholder Get Help, Help Someone, and Research pages, notes, and since November 9 the notes from pull requests 1 and 7 | Public through GitHub Pages |
| `claude/jolly-mayer-2m6eno` | Everything below from `site/phone-accessibility-content`, the [[RESEARCH-BRIEF]] PDF and notes, and improvement ideas one founder approved: Spanish pages, quick exit, dark mode, offline support, a shorter Get Help, automatic checks, website-only publishing, live-site monitoring, a readability report, myths and facts, printable wallet cards, and a teen page. See [[worklogs/2026-11-06-claude-approved-ideas\|first batch]] and [[worklogs/2026-11-06-claude-second-batch\|second batch]] | Draft pull request 5 into `main`, **not merged, not on the public website** |
| `site/first-version-finish` | Everything on the branch below, renamed Tidelight, plus the November 7 work: every finding of a 14-area AI audit checked and applied in both languages, three independent code reviews and their fixes, an iPhone landscape fix found in the iOS Simulator, a stricter publish check, the audit's questions for the reviewer, and rebuilt review packets. Later on November 7 it also took in a one-page first-version description, [[FIRST-VERSION]], and review sections for the Spanish lines on English pages. See [[worklogs/2026-11-07-claude-first-version-finish\|the handoff]] | Merged into `claude/jolly-mayer-2m6eno` on November 9, 2026, at a founder's request, with pull requests 13, 14 and 15 merged into it first. Closes pull request 10. **Not on the public website** |
| `site/compact-crisis-strip` | A compact one-row crisis strip that stays on screen with larger text and on older phones on their side, where the full strip scrolls away. A proposal. Its handoff is on that branch | Merged into `site/first-version-finish`, and so into `claude/jolly-mayer-2m6eno`, on November 9, 2026, at a founder's request. Closes pull request 13. **Not on the public website** |
| `site/signage-redesign` | A new visual design for every page, built in a separate session at one founder's request | Draft pull request 11 into `site/first-version-finish`. Merging it publishes nothing. **Not merged.** See its description |
| `site/pro-max-redesign` | A second proposed visual design, "Shoreline", built with the ui-ux-pro-max design skill at one founder's request: paper and ink, one tide blue for help, AAA contrast, stylesheet only. An alternative to pull request 11. See [[worklogs/2026-11-08-claude-shoreline-redesign\|the handoff]] | Merged into `site/first-version-finish`, and so into `claude/jolly-mayer-2m6eno`, on November 9, 2026, at a founder's request, so Shoreline is now the look on pull request 5. Closes pull request 14. Pull request 11, signage, stays open. **Not on the public website** |
| `site/daily-check-in` | A Daily check-in and self-discovery page in English and Spanish, built from one founder's spec on Shoreline. Works in the page; saves nothing. One founder chose a phone app with iCloud or Google backup for saving; not built. See [[worklogs/2026-11-09-claude-daily-check-in\|the handoff]] and [[CHECK-IN-BACKEND]] | Merged into `site/pro-max-redesign`, and so into `claude/jolly-mayer-2m6eno`, on November 9, 2026, at a founder's request. Closes pull request 15. **Not on the public website** |
| `app/first-build` | The phone app's first draft in `app/`: the website's pages in a Capacitor app, with on-phone saving, age setup by date of birth (idea E3), and Share this reflection (E2a) for the Daily check-in, plus [[AGE-STRATEGIES]]. See [[worklogs/2026-11-09-claude-phone-app-first-build\|the handoff]] | Draft pull request into `claude/jolly-mayer-2m6eno`. Merging it publishes nothing: the app isn't part of the website. **Not merged, never run on a phone** |
| `app/redesign-dev` | A redesign of the phone app from one founder's build spec (`app/BUILD-SPEC.md`): five bottom tabs, onboarding, a quick check-in in two styles, streaks, a meditation player with four types and a builder, and haptics. It sits on `app/daily-check-ins`, `app/hard-places-and-reminders`, and `app/my-circle-and-hope-box`. The crisis strip, Exit, Get Support Now, the Spanish link, and the review notices stay on every screen. See [[worklogs/2026-11-11-claude-app-redesign\|the handoff]] and `app/PROGRESS.md` | Draft pull request 25 into `app/first-build`. Merging it publishes nothing. **Not merged.** The other founder hasn't seen the spec; no reviewer or lawyer has seen it; never run on a real phone |
| `app/hard-places-and-reminders` | In the app: "Places that are hard for me" (idea E1), built on top of `app/daily-check-ins`. The person adds their own places on a map, chooses up to 5 people from their contacts, a wait time, and a message; the phone watches the places itself and, after the wait, shows a neutral notification; the alert screen counts down and then opens the phone's Messages composer, which the person still has to tap Send in. No built-in list of places. Also the iOS 27 fixes that let the app run at all (scene life cycle, iOS 15 target, folder routing). See [[worklogs/2026-11-10-claude-hard-places\|the handoff]] | Draft pull request into `app/first-build`. Publishes nothing. **Not merged, run in the iOS Simulator only, never on a real phone; the reviewer hasn't seen it** |
| `app/daily-check-ins` | In the app: four optional check-in reminders (morning, midday, after school or work, before bed), today's check-ins listed in Your journey, and Share today's check-ins or Share the last 7 days through the share sheet. The app's tests now run on GitHub, and saved dates read as dates again after the app reopens. Three notes: [[LOCATION-ALERT]] (the logistics of alerting chosen people near a hard place), [[CHECK-IN-SCHEDULE]], and [[IDEAS-ROUND-3]] (forty ideas). See [[worklogs/2026-11-09-claude-daily-check-ins\|the handoff]] | Draft pull request into `app/first-build`. Publishes nothing. **Not merged, never run on a phone** |
| `site/minimal-public-preview` | One crisis page with 988 and 911 in English and Spanish, in place of the four live pages: option B for open decision 1 in [[DECISIONS]]. Its handoff is on that branch | Draft pull request 12 into `main`, **not merged. Merging publishes it within about a minute.** It replaces the same pages as pull requests 5 and 8, so it conflicts with both |
| `site/first-version-build` | Everything on the branch above, plus the rest of the first version: Not sure what you're feeling?, After a loss, About and privacy, saving 988 to contacts, review status, the full Spanish Research page, review packets, phone test steps, and browser tests. See [[worklogs/2026-11-06-claude-first-version\|the handoff]] | Merged into `claude/jolly-mayer-2m6eno` on November 7, 2026, at a founder's request, which closes pull request 9. **Not on the public website** |
| `site/phone-accessibility-content` | A second round: fixes from an independent review, stronger site checks, and updated notes | Merged into `claude/jolly-mayer-2m6eno` on November 6, 2026, at a founder's request, so pull request 6 is closed by that merge. Pull request 5 is the one place to review. **Not on the public website** |
| `claude/charming-swartz-e8d31c`, commit `546308d` | Corrections to `notes/STATUS.md` and `notes/TASKS.md` on `main`, plus a handoff, no page changes | Pull request 7, merged into `main` on November 9, 2026, by a founder. **Public on `main`** |
| `site/live-page-corrections`, commit `dd44812` when checked | Only the first four known issues below, on the four live pages, plus a handoff. No draft content | Draft pull request 8 into `main`, **not merged**. Merging publishes those page changes and the handoff. Its description covers the conflict with pull request 5 |
| `planning/morning-brief` | First planning drafts | Pull request 1, merged into `main` on November 9, 2026, by a founder. **Public on `main`**, partly out of date |

Unmerged doesn't mean private. The repository is public, so anyone on GitHub can
read every branch.

Your Obsidian shows whichever branch your project folder is on. To read these notes
before merging, switch your project to that branch in GitHub Desktop, or read them on
GitHub. On `main` you won't see them until the branch is merged and you download `main`.

## Current phase

`main` is a public early preview. A complete first version, with unreviewed draft content, is
on a task branch, ready for phone testing and human review. It is not ready for the public.
Product decisions and professional review have not happened yet. It has been tried in desktop
Chrome, phone-size emulation, WebKit on a Mac, and the iOS Simulator (iPhone 17, iOS 27.2), but
not on a real phone.

## In place on main

- The shared repository, the Obsidian vault in `notes/`, and Claude's instructions.
- The supplied design in `design/homepage.svg`.
- Homepage and three placeholder pages, merged through pull requests 3 and 4 and
  public at https://stillwatersps.github.io/suicideprevention/.
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
- `notes/STATUS.md` and `notes/TASKS.md` on `main` still say pull request 4 is not
  merged, and page writing has not started. A session opened on `main` reads that as
  true. Draft pull request 7 would correct that. See [[TASKS]].

Everywhere:

- No qualified person has reviewed any crisis or health wording, on `main` or on
  the task branches.
- Pages publishes every file on `main`, including these notes, so unverified or
  draft notes are public web addresses. See the open decision in [[DECISIONS]].
- Merging pull request 5 publishes notes and pages together, so its corrected notes
  can't reach `main` while the pages wait for review. Same open decision.
- Call and text links have never been tried on a real phone, or with VoiceOver or
  TalkBack. The iOS Simulator showed the contact card and Quick exit, but it can't place calls.

## Still to confirm

- Both people have the latest project on their computers and can open this vault.
- What the public site should show until review.
- Who reviews crisis content, and who re-checks the numbers.
- First-version scope, supported ages, and saved-data needs. One founder chose every age, with
  date of birth at sign-up in the app (idea E3 in [[IDEAS]]).

## Next useful step

0. **Important, first for attention:** the licensed reviewer looks at idea E1 in [[IDEAS]], the
   opt-in "Places that are hard for me" safety-plan feature for the phone app. One founder chose it
   on November 9, 2026. Not built. In the notes on `claude/jolly-mayer-2m6eno`.
   Also **Important:** the app suggestions at the end of [[AGE-STRATEGIES]], marked by the same
   founder to come back to. Not built. On `app/first-build`.
1. Try the first version on a real phone, using [[PHONE-TEST]], from pull request 5's branch,
   `claude/jolly-mayer-2m6eno`, which now holds everything except signage (pull request 11).
2. Both founders read [[FOUNDER-BRIEF]], [[FIRST-VERSION]], [[LAUNCH-CHECKLIST]], [[IDEAS]], and the open
   decisions in [[DECISIONS]], and decide what the public site should show until review. Draft pull
   request 12 is the one-page option, ready to compare.
3. Give `notes/review-packet/tidelight-review-packet.pdf` to the licensed therapist, and the
   Spanish packet to a fluent reader. Record results in "Review records" in [[CONTENT-REVIEW]].

On November 9, 2026, at one founder's request, every pull request that publishes nothing was merged
into `claude/jolly-mayer-2m6eno`: 15 (Daily check-in) into 14 (Shoreline), 14 and 13 (compact strip)
into 10, and 10 into pull request 5's branch. Pull request 11 (signage) stays open, because it
rewrites the same stylesheet as Shoreline. Merging pull
request 5 into `main` publishes everything, so do that only after the decision and review. Pull
requests 7, 8 and 12 are separate, and merging any one publishes it: 7 corrects `main`'s notes,
8 corrects four problems on its pages, and 12 replaces those pages with one crisis page. Merge
or close each one. Pull request 11 goes into `site/first-version-finish` and publishes nothing; it
would now conflict with Shoreline.

Later on November 9, 2026, one founder asked for forty ideas and for two of them worked out in full. Both founders now read
[[LOCATION-ALERT]] and [[CHECK-IN-SCHEDULE]] and decide, go through [[IDEAS-ROUND-3]], and the reviewer reads the app's new
words. The reminders and shared check-ins are a draft on `app/daily-check-ins`, never run on a phone.

Overnight into November 10, 2026, one founder asked for idea E1 to be built. It is a draft on
`app/hard-places-and-reminders`, run in the iOS Simulator and never on a real phone. The reviewer and a lawyer see
it before anyone uses it; see the questions in [[CONTENT-REVIEW]] under "Questions about the phone app".

## End-of-session update

Keep this page short: current phase, completed work, open questions, and next
step. Put detailed changes in a task-specific handoff in `worklogs/`.

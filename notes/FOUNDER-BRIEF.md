---
aliases: [Founder brief, Decisions needed]
status: proposal for both founders
---

# Decisions the founders need to make

[[00 START HERE|Back to Start Here]]

A first version is built and can be tested. Nothing more can move toward launch without you. Claude wrote this,
and each recommendation is only a suggestion. Record what you decide in [[DECISIONS]], with who agreed.
[[LAUNCH-CHECKLIST]] shows the order of everything else.

## Most urgent: what the public sees today

`main` is public now. It has the homepage and three placeholder pages, and it says its content "is still being
reviewed", which isn't true yet.

| Option | Good | Bad |
| --- | --- | --- |
| A. Merge pull request 8 | Takes minutes. Fixes the four known problems | Still public with no review |
| B. One page with 988, 911, and what Tidelight is | Keeps the part that helps most, with the least risk | Needs a small build |
| C. Turn GitHub Pages off | No unreviewed content anywhere | Nothing to show anyone |
| D. Leave it as it is | No work | The site keeps saying something untrue |

**Recommendation:** A today, because it corrects something untrue, then decide between B and C. The notes on
`main` are also public, and pull request 7 corrects the stale ones.

## Decisions for both of you

| # | Decision | Recommendation | Why it matters |
| --- | --- | --- | --- |
| 1 | Who reviews? Does the licensed therapist also cover the draft pages? | Yes, and add someone with lived experience of a loss and someone who works with young people | One person can't cover all of this |
| 2 | How is a sign-off recorded? | Role, date, and result in [[CONTENT-REVIEW]]. Keep anything personal outside this public project | The site's review list and checks read this |
| 3 | Which ages? Under-13s? | Don't gate access. Ask a lawyer about under-13s and the teen wording | The teen page exists, and ages are undecided |
| 4 | Does the Not Sure page belong? | Ask the therapist first. It's easy to remove | A reflection page may not suit someone in crisis |
| 5 | Do you both accept the built ideas in [[IDEAS]]? | Read them together. Each founder approved a different list, and neither has agreed to the other's | Nothing is agreed until you both say so |
| 6 | Should merging need the other founder's approval? | Yes | Merging publishes within about a minute, and `main` has no protection |
| 7 | Should the site publish without the notes? | Yes, with GitHub Actions. The workflow is built and needs one setting | Every note on `main` has a public address today |
| 8 | Keep the publish safety check? | Yes, until reviews are recorded | It stops unreviewed content going live by accident. See [[LAUNCH-CHECKLIST]] |
| 9 | What if someone contacts the project in crisis? | Turn off Issues and the Wiki, and add no contact route until you have a plan and a person to answer | A message nobody sees could do real harm |
| 10 | Who is the publisher? Is Tidelight the final name? | Ask a lawyer, and check trademarks before buying a domain | Both affect what the site must say |
| 11 | A custom domain? | Decide after the name. It changes the page-not-found links and the checks | The current address includes `/suicideprevention/` |
| 12 | Who does upkeep? | Name one person for each part of [[UPKEEP]] | Numbers change, and someone has to notice |
| 13 | Keep or close pull requests 1, 7, and 8? | Close 1. Merge 7 and 8 if `main` stays public for a while | Pull request 5 covers them once it merges |

## What's ready, and what isn't

**Ready for you to try:** all 19 pages in English and Spanish, and quick exit, offline support, dark mode, printing, saving 988 to
contacts, review packets, phone test steps, and automatic checks. See [[STATUS]].

**Not done, and not doable by Claude:**

- Clinical review, fluent Spanish review, legal review, and review by people with lived experience
- Tests on real phones, and with VoiceOver and TalkBack
- A person confirming each crisis detail in [[SAFETY]]
- The GitHub settings, which the repository owner changes

To see the current list at any time:

```bash
python3 tools/launch_gate.py
```

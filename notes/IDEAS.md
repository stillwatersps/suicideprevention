---
aliases: [Ideas, Improvement ideas]
status: proposals awaiting founder approval
---

# Ideas to improve the website

[[00 START HERE|Back to Start Here]]

Proposed by Claude on November 6, 2026, after checking every page. **One founder approved nine on November 6, 2026; the other founder
has not weighed in yet.** Mark each one Approved, Not now, or No, with who agreed and the
date, and move approved ones to [[TASKS]]. Ideas that change crisis or health
wording also need the licensed reviewer (see [[RESEARCH-BRIEF]] and
[[CONTENT-REVIEW]]).

## Group A: no clinical review needed

| # | Idea | Why | Founder decision |
| --- | --- | --- | --- |
| A1 | Run `tools/check_site.py` automatically on every pull request | A broken crisis link would be caught before anyone can merge it | Approved by one founder, Nov 6, 2026. Built on draft pull request 5 |
| A2 | Require the other founder's approval before merging into `main` | Merging publishes within about a minute. Open decision 4 in [[DECISIONS]] | Approved by one founder, Nov 6, 2026. A GitHub setting, not code: see the handoff |
| A3 | Publish only the website, not the notes | Today every note, including drafts, has a public web address. Open decision 2 in [[DECISIONS]] | Approved by one founder, Nov 6, 2026. Built; needs one GitHub setting |
| A4 | Turn off GitHub Issues and the Wiki | Removes a public place where someone in crisis could post. Open decision 5 in [[DECISIONS]] | Approved by one founder, Nov 6, 2026. A GitHub setting, not code: see the handoff |
| A5 | "Save 988 to your contacts" button | One tap opens a contact card. Nothing is sent or stored | Asked for by the other founder, Nov 6, 2026. Built on draft pull request 9, for review |
| A6 | Crisis info works offline and can be added to the home screen | The crisis numbers still load with a weak signal | Approved by one founder, Nov 6, 2026. Built on draft pull request 5 |
| A7 | Calm dark mode that follows the phone's setting | Easier to read at night, when many people search for help | Approved by one founder, Nov 6, 2026. Built on draft pull request 5 |

## Group B: needs the licensed reviewer before publishing

| # | Idea | Why | Founder decision |
| --- | --- | --- | --- |
| B1 | A short "Right now" box at the top of Get Help, with longer sections folded below | Get Help is about 2,000 words, roughly 27 phone screens. Someone in distress may not scroll | Approved by one founder, Nov 6, 2026. Built on draft pull request 5 |
| B2 | Quick-exit button | Helps people on a shared device or in an unsafe home. Already a reviewer question | Approved by one founder, Nov 6, 2026. Built on draft pull request 5 |
| B3 | "Not sure what you're feeling?" page (Pathway A in [[RESEARCH-BRIEF]]) | A gentle way in. Nothing to type, nothing saved or sent, no score | Asked for by the other founder, Nov 6, 2026. Built on draft pull request 9, for review |
| B4 | "After a loss" page for people bereaved by suicide | Section 4 of [[RESEARCH-BRIEF]]. No page covers this audience yet | Asked for by the other founder, Nov 6, 2026. Built on draft pull request 9, for review |
| B5 | "Last reviewed" date and reviewer role on every page | The brief asks for it, and it shows visitors the content is checked | Asked for by the other founder, Nov 6, 2026. Built on draft pull request 9, for review. Every page says draft, and the About pages list each page as pending. No reviewer or date is shown until a review is recorded |
| B6 | Spanish versions of the main pages | 988 offers Spanish support; the site has one Spanish section. Needs a fluent reviewer | Approved by one founder, Nov 6, 2026. Built on draft pull request 5 |

## Second batch, November 6, 2026

Proposed by Claude after the first nine were built. One founder approved C2 to C6 and
D1 to D3 on November 6, 2026; the other founder has not weighed in yet.

### Group C: helps the review and keeps the site working

| # | Idea | Why | Founder decision |
| --- | --- | --- | --- |
| C1 | A review packet for the therapist: every draft sentence on the site and in [[RESEARCH-BRIEF]], numbered, as one printable document with space for notes | Reviewing four web pages, two languages and a PDF is hard. One packet makes the review faster and the sign-off easy to record | Asked for by the other founder, Nov 6, 2026. Built on draft pull request 9, for review. See `notes/review-packet/` |
| C2 | Monthly automatic link check: GitHub opens every crisis and source link once a month and flags any that break | [[SAFETY]] proposes monthly rechecks. This catches a moved 988 page before a visitor does | Approved by one founder, Nov 6, 2026. Built: starts once on `main` |
| C3 | Daily check that the live site loads and its crisis strip is there | Finds out within a day if a publish or a GitHub problem breaks the site | Approved by one founder, Nov 6, 2026. Built: starts once on `main` |
| C4 | Plain-language check: flag sentences that are long or hard to read | The audience includes minors and people in distress. Some draft paragraphs are long | Approved by one founder, Nov 6, 2026. Built as a report |
| C5 | Close or merge the old draft pull requests (1, 7, 8) | Pull request 5 now covers what 7 and 8 fix. Fewer open pull requests means less confusion | Approved by one founder, Nov 6, 2026. On hold: the other founder opened these pull requests |
| C6 | A short test with 3 to 5 people using made-up situations, such as "find how to text for help in Spanish" | Shows whether real people can find help fast, before launch. Nobody shares anything personal | Approved by one founder, Nov 6, 2026. Plan written in [[USER-TEST]]; not run |

### Group D: new content, needs the licensed reviewer

| # | Idea | Why | Founder decision |
| --- | --- | --- | --- |
| D1 | "Myths and facts" section, from section 1 of [[RESEARCH-BRIEF]] | For example, asking someone about suicide does not plant the idea. Clears up fears that stop people from helping | Approved by one founder, Nov 6, 2026. Built on draft pull request 5 |
| D2 | Printable wallet card or poster with 988, 911 and the Spanish options | Schools, clinics and families can hand it out. Works without a phone or a signal | Approved by one founder, Nov 6, 2026. Built on draft pull request 5 |
| D3 | A page for teens, once supported ages are decided | Young people need their own wording about trusted adults, school, and privacy | Approved by one founder, Nov 6, 2026. Built on draft pull request 5; ages still undecided |
| D4 | Recovery stories from people with lived experience, with consent and safe messaging | Safe messaging guidance recommends hope and recovery stories. Needs a careful consent process | Not chosen yet (Nov 6, 2026) |

## Not proposed

Accounts, saved journals, AI chat, and risk scores. They conflict with [[SAFETY]]
rule 5 and the brief's own limits. Also not proposed: a "Was this helpful?" button or
any feedback form, because it would collect data from visitors who may be in distress.

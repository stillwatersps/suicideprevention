---
aliases: [Ideas, Improvement ideas]
status: proposals awaiting founder approval
---

# Ideas to improve the website

[[00 START HERE|Back to Start Here]]

Proposed by Claude on November 6, 2026, after checking every page. **Each founder approved or asked for a different list on November 6, 2026, and
neither has agreed to the other's yet.** Mark each one Approved, Not now, or No, with who agreed and the
date, and move approved ones to [[TASKS]]. Ideas that change crisis or health
wording also need the licensed reviewer (see [[RESEARCH-BRIEF]] and
[[CONTENT-REVIEW]]).

**November 9, 2026:** forty more ideas are in [[IDEAS-ROUND-3]]. Two were worked out in full at one
founder's request: alerting chosen people when someone stays near a hard place ([[LOCATION-ALERT]]) and
four daily check-ins shared with a guardian or a doctor ([[CHECK-IN-SCHEDULE]], partly built as a draft).

## ⚠️ Important, first for attention: location alerts and idea E1 (November 9, 2026)

One founder asked whether the planned phone app ([[CHECK-IN-BACKEND]]) could use location
services to send a notification when someone is at a bridge or another place known for suicide,
prompting them to stop and reach out. **Recorded as asked, not approved, not built. It needs the
licensed reviewer before anything is designed further.**

**Can it be done?** Technically, yes. iPhones and Android phones let an app watch a small number
of places and wake when the phone enters one (called geofencing), even with the app closed. It can
run on the phone, so the location need never reach Tidelight. It needs the user to allow location
"always", which both stores review closely for a health app.

**Why Claude doesn't recommend the version that ships a list of places:**

- **The list itself is the risk.** Safe messaging guidance, summarized in [[SAFETY]], says to leave
  out locations. A list built into the app, and kept in this public repository, would publish
  exactly that, and anyone could pull it out of the app.
- **Most people at those places are not in crisis.** People cross bridges every day. Repeated
  suicide alerts would be upsetting, would teach people to ignore them, and on a shared or
  checked phone a lock-screen alert could reveal something private, including about a minor.
- **"Rethink their decision" assumes intent** the app can't know. A wrong guess can feel
  accusing.
- **Always-on location** for a mental-health app is a big privacy ask, and it changes the promise
  that the app keeps nothing.
- **Evidence.** Claude hasn't read research on whether location alerts help, so this note makes
  no claim either way. What helps at such places, such as barriers, signs, and crisis phones, is
  the work of the place's owners, not an app. The reviewer should advise.

**A safer version to ask the reviewer about (E1):**

| # | Idea | How it would work | Founder decision |
| --- | --- | --- | --- |
| E1 | "Places that are hard for me", part of a personal safety plan in the app | Off by default. The person chooses their own places, if any, on a map, and nothing is suggested. The app ships with no list. Places stay on the phone and are deleted with Delete everything. When the phone enters one, a quiet notification with neutral words on the lock screen (for example "Tidelight: your plan is here") opens a screen with their own reasons, people they chose, and 988 and 911. The person can pause or remove it at any time | **Important.** One founder likes it and marked it first for attention, Nov 9, 2026. The other founder hasn't agreed. **Built as a draft** on branch `app/hard-places-and-reminders` (November 10, 2026), following [[LOCATION-ALERT]]'s route A: the person's own places, a wait time, and a one-tap send through Messages; no built-in list. Never run on a real phone; the reviewer hasn't seen it. Handoff: [[worklogs/2026-11-10-claude-hard-places]] |

The version with a built-in list of places is set aside: see "Not proposed" below.

## Phone app idea, November 9, 2026: a support circle (E2)

One founder asked for this idea to be recorded. **An idea only: not approved by the other founder,
not reviewed, not built.**

**The idea.** A person signs up for an account and invites people they trust, such as a parent, a
doctor, a therapist, or a friend, who sign up too. Together they form a circle. The circle can see
how the person is doing. In the reflections and journal, the person chooses, entry by entry,
whether to share with the circle or keep it private, so the app still feels like a safe space.

| # | Idea | How it could work | Founder decision |
| --- | --- | --- | --- |
| E2 | Support circle | The person creates the circle and is the only one who can invite or remove people. Everything is private unless they tap "Share with my circle" on one check-in or reflection. They can unshare, pause the circle, or leave it at any time. Circle members see only what was shared, never scores or a summary of the person's mood | Asked for by one founder, Nov 9, 2026. Not approved, not built. Needs the licensed reviewer and a lawyer first |

**What it would change.** Claude's notes for both founders and the reviewer:

- **It needs accounts and a server.** People on different phones can only see each other's
  entries through a server. That reverses the phone app plan in [[CHECK-IN-BACKEND]], where
  nothing reaches Tidelight, and brings back everything in its accounts-and-server table:
  encryption (ideally end-to-end, so Tidelight can't read shared entries), a privacy policy,
  deleting, breaches, and someone to run and pay for it. "Not proposed" below also lists accounts.
- **Nobody at Tidelight watches, but the circle does.** If someone shares something worrying, a
  parent might see it hours later, or a therapist might not see it until the next session. The
  app must say clearly that sharing isn't a way to ask for urgent help, keep 988 and 911 on
  screen, and give circle members guidance on what to do if they're worried.
- **Choosing must stay free.** People can feel pressure to share, or be asked to show what they
  kept private. Sharing should be off by default, with no sign to the circle of how much is kept
  private.
- **Minors and parents.** A teen might write less honestly if a parent can see it, and not every
  home is safe. Whether parents can join, and who controls the circle for someone under 18, are
  questions for the reviewer and a lawyer, after supported ages are decided ([[DECISIONS]], open
  decision 6).
- **Doctors and therapists.** If a clinician uses the app as part of care, U.S. health privacy
  law (HIPAA) and their own professional rules may apply. A lawyer should advise before
  clinicians are invited.
- **No monitoring features.** No alerts to the circle based on what someone writes, no mood
  charts, and no reading of entries, matching the spec's rule on scoring and analysis.

**A smaller first step, chosen (E2a):**

| # | Idea | How it would work | Founder decision |
| --- | --- | --- | --- |
| E2a | "Share this reflection" button in the phone app | A button on a kept reflection, check-in, or journal entry opens the phone's own share sheet. The person picks who gets it and how (text, email, or another app) and can read or change the words before sending. Nothing goes to Tidelight, and nothing is shared unless they tap it. No accounts and no server, so it fits the phone app plan in [[CHECK-IN-BACKEND]] | Chosen by one founder, Nov 9, 2026. The other founder hasn't agreed. **Built in the phone app draft** (`app/`, branch `app/first-build`), not reviewed |

Notes for building it:

- **Not on the website yet.** `CLAUDE.md` and [[SAFETY]] rule 5 say nothing typed on the website's
  check-in may leave the page until both founders agree. A share button on the website would
  break that, so it's planned for the app. Putting it on the website too needs both founders and a
  change to `tools/check_site.py`.
- **Say what sharing means** next to the button: the message goes to the person chosen, is kept in
  their messages or email, and Tidelight can't take it back.
- **Not a way to ask for urgent help.** The person who receives it may not see it for hours. Keep
  988 and 911 next to the button.
- **A short line of wording** may be added at the top, chosen by the person, such as "I wanted to
  share this with you." The reviewer approves any suggested wording.

## Phone app idea, November 9, 2026: help shaped by age (E3)

> **⚠️ Important.** One founder marked the app suggestions at the end of [[AGE-STRATEGIES]] as
> Important on November 9, 2026, to build later: a note for the grown-up with a child, keeping
> "an adult you trust" for teens, letting teens choose a support circle, plan reminders for adults,
> and call reminders for older adults. Not built yet, and the reviewer sees them first.

One founder chose, on November 9, 2026: every age is supported; date of birth is required at
sign-up; and the age group decides how the app helps, using what research shows works for that
age group. **Not agreed by the other founder, not reviewed, not built.** It also answers open
decision 6 in [[DECISIONS]] for this founder.

| # | Idea | How it could work | Founder decision |
| --- | --- | --- | --- |
| E3 | Help shaped by age group | Sign-up asks for date of birth, required. The app works out an age group and keeps only that. Each group gets the suggestions, wording, and resources the reviewer approves for it. For example, younger people get trusted-adult and school wording, the way the teen page does now | Chosen by one founder, Nov 9, 2026. **Built in the phone app draft** (`app/`, branch `app/first-build`), with the research in [[AGE-STRATEGIES]]. Needs the licensed reviewer and a lawyer before anyone uses it |

Claude's notes for both founders, the reviewer, and a lawyer:

- **Crisis help comes before sign-up.** 988, 911, and Quick exit work with no sign-up and no birth
  date. Nobody in crisis should meet a required box first.
- **Sign-up and the phone app plan.** The plan in [[CHECK-IN-BACKEND]] has no accounts. Sign-up
  there would mean a setup screen on the phone: the birth date is asked once and stays on the
  phone. A circle (E2) would need real accounts.
- **Keep less.** Work out the age group, then keep only the group, not the full birth date.
- **Under 13.** U.S. COPPA rules, and Apple's and Google's rules for apps used by children, apply.
  The Federal Trade Commission has guidance on asking ages in a neutral way. A lawyer should
  advise before building, including on parental consent.
- **Wrong birth dates.** Some people will enter a different age, by mistake or on purpose. Every
  group's content must be safe for anyone.
- **Which help works for which age.** The research brief ([[RESEARCH-BRIEF]]) mentions a trusted
  adult for young people and WHO's adolescent life skills, and warns not to mix age groups when
  reading numbers. It doesn't set out help by age group. The reviewer should name the age groups
  and approve what each one gets, from sources Claude or the reviewer has read. Example groups to
  start the discussion, not a proposal: under 13, 13 to 17, 18 to 24, 25 to 64, and 65 and over.
- **The website.** The website has no sign-up and asks no age. The teen page stays as it is.

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
D1 to D3 on November 6, 2026. The other founder hasn't agreed to them yet.

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

Also not proposed (Nov 9, 2026): an app list of places known for suicide, or alerts sent to
everyone near such a place. See the Important section at the top.

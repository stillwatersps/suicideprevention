---
type: handoff
owner: Claude Code, one step of a workflow run at one founder's request
branch: build/recheck-2026-11-08, based on e608945 of site/first-version-finish
---

# Crisis resources and outside links read again, and a first scan of the name

Date: November 8, 2026, Eastern time.

**State when written: local only.** Local commits on `build/recheck-2026-11-08`. Not pushed, no pull
request, not merged, and not on the public website. Notes and rebuilt review packets only: no website
page changed. No qualified person has reviewed anything here, and no person has confirmed any crisis
detail.

## Completed

| File | What changed |
| --- | --- |
| [[SAFETY]] | "Read on" is now Nov 8, 2026 in all 13 rows. A short note under the table, the two draft items, the two left-off items, and the FCC item say what was read on November 8 |
| [[NAME-CHECK]] | New. A first scan of the name Tidelight by an AI assistant. Not a trademark search and not legal advice |
| [[DECISIONS]], [[TASKS]], [[00 START HERE]] | One line each linking [[NAME-CHECK]], from the rename entry, the name task, and the project map |
| `notes/review-packet/` | Rebuilt, because [[SAFETY]] is part of their fingerprint. Fingerprint `06135801a631`, was `715c9a471f3f` |

## What was read, when, and how

November 8, 2026, between about 6:58 and 7:16 a.m. Eastern, in the Claude desktop app's built-in
browser, in one tab, as page text. Nothing was called, texted, chatted, or submitted. No call, text,
or chat control was clicked, and no chat address or chat page was opened. 988's cookie banner was
declined with "I Reject". No other provider page showed a cookie banner in the text read.

| Row in [[SAFETY]] | Pages read | Result |
| --- | --- | --- |
| 988 Suicide & Crisis Lifeline | Get Help | Matches: call and text 988, a chat link to chat.988lifeline.org, and "24/7" in its directory |
| 988 by text, first steps | Texting FAQ, What to Expect, Spanish What to Expect | Matches: any message, "Next", a brief survey, a "Wait" message, and «siguiente», encuesta, «espere» |
| 988 in Spanish | Get Help, Spanish Get Help, Spanish What to Expect | Matches, with one note below the table: press 2 and AYUDA are on the English page, and the address ending in ?lang=es is on the Spanish pages' Chatea button |
| 988 in other languages | Its FAQ | Matches: more than 240 languages, voice calls only, ask for an interpreter or say the language |
| 988 for Deaf and hard of hearing people | Deaf page | Matches: dial 988 with a videophone number, relay or 711 then 988, text, chat |
| 988 for LGBTQ+ youth | What to Expect, and the notice on 988's pages | Matches: press 3, PRIDE, and "has been restored" |
| Veterans Crisis Line | Home page and call page | Matches: dial 988 then press 1, text 838255, chat, 24/7 |
| Crisis Text Line | FAQ, terms of service, privacy policy | Matches: HOME to 741741, free on the four carriers named, standard rates on others, and "Message & data rates may apply" in both the terms and the privacy policy |
| The Trevor Project | Get Help, terms of service | Matches: the call, text, and TTY numbers, START, chat, and 24/7 |
| SAMHSA National Helpline | Helpline page | Matches: both numbers, English and Spanish, 24/7, and that it doesn't provide counseling |
| TAPS | Suicide loss page | Matches: its number and "CALL 24/7" |
| FindTreatment.gov | Home page | Matches: a treatment finder that calls itself confidential and anonymous |
| Emergency services | FCC text-to-911 page | It opened in the built-in browser, though scripts still get 403. Matches: available only in certain places, a voice call whenever possible, a bounce-back message, and TTY or relay. Last updated or reviewed January 6, 2020 |

**The pages' wording.** For each row, a script listed every distinct sentence on the 19 pages, in both
languages, with its number or keyword, and each was compared with the provider's page. Every claim
matched, including the Crisis Text Line card's lines on prepaid plans, Google Voice and TextNow, and
WhatsApp, The Trevor Project's lines on under 25, interpreters, and phone or computer, the Veterans
Crisis Line card, the TAPS lines on After a loss, and the 911 card. The line that contacting 988 needs
no insurance matches SAMHSA's 988 FAQ. Not read again: the Veterans Crisis Line's Spanish chat page,
which is a chat page.

**The draft and left-off items.**

- 988 LGBTQ+ youth: The Trevor Project's statement, dated October 1, 2026, says the service resumed on
  September 30, 2026, after ending in July 2025. A House caucus statement dated September 30, 2026 gives
  the same day. The November 6 note doesn't record which House statement it used, so this may be a
  different one. SAMHSA's 988 FAQ ("Last Updated: 12/16/2025") and performance page ("Last Updated:
  10/13/2026") still don't mention it. 988's Spanish FAQ still says the service isn't available in
  Spanish, and its page data gives June 21, 2024 as its last change.
- TTY in Spanish: both 988 pages say what they said before. The TTY FAQ's page data also gives June 21,
  2024.
- Crisis Text Line in Spanish: no change. Its FAQ also showed a box saying to text HOME or HOLA.
- Veterans Crisis Line TTY: the call page still says relay or 711, then 988. The older VA pages weren't
  opened.

## Differences

**No crisis number, keyword, hour, or claim differs from what its provider's page says today,** so no
row is marked for a person to check beyond the usual "Person confirmed" column, and no page wording
changed. Noted, but not differences:

1. The 988 Spanish chat address ending in ?lang=es isn't on the English Get Help page the row lists. That
   page links chat.988lifeline.org and says to start a chat in Spanish. The address is on 988's Spanish
   pages. Whether the English page ever showed it isn't known. The row's "Official page" is unchanged,
   and a note under the table names the Spanish page.
2. The FCC page opens in a browser but still refuses scripts, so the monthly check still lists it.
3. `tools/check_crisis_sources.py` read findtreatment.gov this time ("ok"), though `tools/check_site.py`
   lists it among sites known to block scripts.
4. The first JAMA article link showed a bot check in the built-in browser too ("Just a moment...",
   403). Claude didn't wait for it or try to get past it, and didn't try the second, on the same site.

## Outside links

`tools/check_site.py --check-links` loads each outside link once, read only. Result: 112 links, 105
answered (90 with 200, 15 PubMed pages with 203), and 7 blocked scripts with 403: both 988 chat
addresses, two JAMA articles, two CDC pages, and the FCC's text-to-911 page. This is the same as
November 7, with no new failure. The one redirect printed is AFSP's Healing Conversations request
link, which goes to forms.monday.com, as After a loss already says. Both CDC pages opened normally in
the built-in browser. The chat addresses weren't opened.

## The name

[[NAME-CHECK]] has the details. In short: a UK company named Tidelight Ltd sells a tide lamp and makes a
tide-times app named Tidelight, and a design brand sells a lamp named Tidelight. No Tidelight in health,
mental health, crisis support, or wellness came up. Close names in health include TidalHealth, which
offers crisis care in Maryland, and Tidewell Hospice in Florida. tidelight.org, tidelight.com, and
tidelight.app are all registered. The USPTO search page opened without an account, but no search was
run there, because that submits its search form.

## Checked

On a Mac, November 8, 2026. None of these is a phone test or a content review.

| Command | Result line | Exit, time |
| --- | --- | --- |
| `python3 tools/check_site.py`, before any change | "All checks passed. This does not replace a real phone test or a content review." 19 pages, 112 outside links | 0, 1.5 s |
| `python3 tools/check_site.py --check-links` | "All checks passed. This does not replace a real phone test or a content review." with the 7 notes above | 0, 46 s |
| `python3 tools/check_crisis_sources.py` | "Checked 12 provider pages, 1 left for a person to open." 11 pages ok, the FCC page unread (403) | 0, 21 s |
| `python3 tools/make_review_packet.py` | Wrote both packets, as HTML and PDF | 0, 2 s |
| Checks on the final files | See "Checks on this commit" below | |

### Checks on this commit

Run on this commit's files, staged, just before committing, at 7:20 a.m. Eastern. Each took a second
or less, and an earlier run at 7:19 gave the same results.

| Command | Result line | Exit |
| --- | --- | --- |
| `python3 tools/check_site.py` | "All checks passed. This does not replace a real phone test or a content review." 19 pages, 112 outside links, no notes, so the packets are current | 0 |
| `python3 tools/check_site.py --self-test` | "All 5 made-up link answers were read correctly." | 0 |
| `python3 tools/check_crisis_sources.py --self-test` | "All 20 made-up cases were read correctly, and every crisis number in notes/SAFETY.md has a check." | 0 |
| `python3 tools/launch_gate.py --self-test` | "All 61 made-up cases were read correctly." | 0 |

### Not run

`tools/test_browser.py`, `tools/test_webkit.py`, `tools/test_the_tests.py`, `tools/check_live.py --local`,
`tools/check_readability.py`, and the full suite. This task changed no page, script, or style, only notes
and the rebuilt packets. The iOS Simulator wasn't used, since another session is using it, and nothing
was tried on a real phone.

## Open points

- A person reads each provider's page and fills in "Person confirmed" in [[SAFETY]]. This read doesn't
  replace that.
- The pages still say an AI assistant compared the crisis numbers and links on November 6, 2026. That is
  still true. [[UPKEEP]] moves that date after a person's check, with `tools/set_checked_date.py`, so this
  task left it.
- Whether to list 988's Spanish Get Help page in the "988 in Spanish" row's "Official page" column.
- `tools/check_site.py` still lists findtreatment.gov as a site that blocks scripts. It read normally today.
- The Deaf card question in [[CONTENT-REVIEW]] says the FCC page refused AI reads. That was the automated
  reads. A person should still open it.
- The USPTO search, and everything else listed at the end of [[NAME-CHECK]], is for a person or a lawyer.
- `notes/STATUS.md` wasn't changed in this task. Whoever merges this branch can add a line there.

## Next step

A founder reads this branch. If it is wanted, push it and open a pull request into
`site/first-version-finish`, or merge it there. Merging into that branch publishes nothing.

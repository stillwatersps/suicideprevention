---
type: handoff
owner: Claude Code, one step of a workflow run at one founder's request
branch: build/recheck-2026-11-08, based on e608945 of site/first-version-finish
---

# Crisis resources and outside links read again, and a first scan of the name

Date: November 8, 2026, Eastern time.

**State when written: local only.** Two local commits on `build/recheck-2026-11-08`: the morning's read,
and an afternoon follow-up after an independent review. Not pushed, no pull request, not merged, and not
on the public website. Notes, two check tools, and rebuilt review packets: no website page changed. No
qualified person has reviewed anything here, and no person has confirmed any crisis detail.

## Completed

In the morning:

| File | What changed |
| --- | --- |
| [[SAFETY]] | "Read on" is now Nov 8, 2026 in all 13 rows. A short note under the table, the two draft items, the two left-off items, and the FCC item say what was read on November 8 |
| [[NAME-CHECK]] | New. A first scan of the name Tidelight by an AI assistant. Not a trademark search and not legal advice |
| [[DECISIONS]], [[TASKS]], [[00 START HERE]] | One line each linking [[NAME-CHECK]], from the rename entry, the name task, and the project map |
| `notes/review-packet/` | Rebuilt, because [[SAFETY]] is part of their fingerprint. Fingerprint `06135801a631`, was `715c9a471f3f` |

In the afternoon, after an independent review of the morning's commit:

| File | What changed |
| --- | --- |
| [[SAFETY]] | The "988 in Spanish" row also lists 988's Spanish Get Help page, where the chat address ending in ?lang=es is, so the note under the table that raised this is gone. The 988 LGBTQ+ youth item gives the address and date of The Trevor Project's statement and of the House caucus statement, and says exactly what SAMHSA's 988 performance page and its dashboard show. The FCC item also names the Deaf and hard of hearing card, and the second read |
| [[CONTENT-REVIEW]] | The Deaf card question now says what [[SAFETY]] says: the FCC page refuses automated reads, Claude read it in the built-in browser on November 8, the card matches it, and a person should still open it and confirm the wording |
| [[NAME-CHECK]] | Adds Tide Mood AI, a mood-tracking app, with its App Store link and the date |
| `tools/check_site.py` | findtreatment.gov is off `KNOWN_BLOCKERS`, so a block from it now fails the link check instead of being a note. Two made-up cases in `--self-test` check that rule: a block from a crisis service not on the list fails, and one from a service on it is only a note |
| `tools/test_the_tests.py` | One planted bug: the link check counting a crisis service's block as fine |
| `notes/review-packet/` | Rebuilt. Fingerprint `006e3e62e203`, was `06135801a631` |
| This handoff | The afternoon's reads and checks, the performance page, and the times of the final checks |

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
  different one. SAMHSA's 988 FAQ ("Last Updated: 12/16/2025") doesn't mention it. SAMHSA's 988
  performance page ("Last Updated: 10/13/2026") doesn't name it in its text, but the dashboard on that
  page shows an "Option 3" that ended on July 17, 2025, the day press 3 ended. This note first said the
  page didn't mention it, which an independent review corrected. The afternoon table below has the
  addresses and what each shows. 988's Spanish FAQ still
  says the service isn't available in Spanish, and its page data gives June 21, 2024 as its last change.
- TTY in Spanish: both 988 pages say what they said before. The TTY FAQ's page data also gives June 21,
  2024.
- Crisis Text Line in Spanish: no change. Its FAQ also showed a box saying to text HOME or HOLA.
- Veterans Crisis Line TTY: the call page still says relay or 711, then 988. The older VA pages weren't
  opened.

**In the afternoon.** Between about 2:39 and 2:43 p.m. Eastern, in one new tab of the built-in browser,
closed afterwards. Web searches, and the two organizations' own lists of statements, led to the
addresses, and each page was then opened. Pages were read as text, except the SAMHSA dashboard, whose
text the page reader couldn't reach, so it was read from screenshots. Nothing was called, texted,
chatted, typed, or submitted, and no call, text, or chat control was clicked.

| Page | Address | What it shows |
| --- | --- | --- |
| The Trevor Project's statement | https://www.thetrevorproject.org/blog/the-trevor-project-applauds-the-return-of-the-988-lifelines-press-3-specialized-services-for-lgbtq-youth/ | Dated October 1, 2026, and begins "September 30, 2026 – Today". Press 3 resumed after it was discontinued in July 2025. Its timeline gives July 17, 2025 for the end and September 30, 2026 for the return |
| The Congressional Equality Caucus's statement, found in the caucus's press release list | https://equality.house.gov/cec-celebrates-988-return | Dated September 30, 2026. Says the specialized services for LGBTQI+ youth resumed on September 30th |
| SAMHSA's 988 performance page | https://www.samhsa.gov/mental-health/988/performance-metrics | "Last Updated: 10/13/2026". Its text names the Veterans Crisis Line, Spanish language services, and answering in the caller's state or territory as the choices. On the dashboard's Service Type tab: "The Option 3 service type existed from September 2022 through July 17, 2025", and data notes giving Option 3 a pilot from September 2022 to June 2023 and full service from July 2023 to July 17, 2025. Its dates run to 9/30/2026. The tab doesn't say whom Option 3 serves, and nothing on it says Option 3 returned |
| 988's Spanish Get Help page | https://988lifeline.org/es/obten-ayuda/ | Its Llama, Textea, and Chatea buttons lead to tel:988, sms:988, and https://chat.988lifeline.org/?lang=es, read from the page's code, not clicked. One more link, "CHATEA CON 988 LIFELINE", leads to chat.988lifeline.org without ?lang=es. It says the network is open 24 hours a day, 7 days a week. Its cookie banner was declined with "Rechazo" |
| The FCC's text-to-911 page | https://www.fcc.gov/consumers/guides/what-you-need-know-about-text-911 | The same as in the morning. The Deaf and hard of hearing card on Get Help, and its Spanish twin, match it |
| Tide Mood AI | https://apps.apple.com/us/app/tide-mood-ai/id6755097960 | A mood-tracking app in the Health & Fitness category, version 1.0.6 of December 18, 2025 |

On the dashboard, only the Service Type tab was clicked. Its Routed, Definitions, and About tabs weren't
opened, and no filter, list, hover, or download was used. Its text was cut off at the browser pane's
width, so that tab's view was set to 1500 by 1100 pixels while reading it, then set back.

## Differences

**No crisis number, keyword, hour, or claim differs from what its provider's page says today,** so no
row is marked for a person to check beyond the usual "Person confirmed" column, and no page wording
changed. Noted, but not differences:

1. The 988 Spanish chat address ending in ?lang=es isn't on the English Get Help page the row lists. That
   page links chat.988lifeline.org and says to start a chat in Spanish. The address is on 988's Spanish
   pages. Whether the English page ever showed it isn't known. Settled in the afternoon: the row also lists
   988's Spanish Get Help page now, read then, and the note under the table is gone.
2. The FCC page opens in a browser but still refuses scripts, so the monthly check still lists it.
3. `tools/check_crisis_sources.py` read findtreatment.gov this time ("ok"), though `tools/check_site.py`
   listed it among sites known to block scripts. Settled in the afternoon: see "Outside links".
4. The first JAMA article link showed a bot check in the built-in browser too ("Just a moment...",
   403). Claude didn't wait for it or try to get past it, and didn't try the second, on the same site.

## Outside links

`tools/check_site.py --check-links` loads each outside link once, read only. Result: 112 links, 105
answered (90 with 200, 15 PubMed pages with 203), and 7 blocked scripts with 403: both 988 chat
addresses, two JAMA articles, two CDC pages, and the FCC's text-to-911 page. This is the same as
November 7, with no new failure. The one redirect printed is AFSP's Healing Conversations request
link, which goes to forms.monday.com, as After a loss already says. Both CDC pages opened normally in
the built-in browser. The chat addresses weren't opened.

**findtreatment.gov, in the afternoon.** The project's link check, `check_links` in `tools/check_site.py`,
ran twice on the site's two findtreatment.gov links, at 2:38 and 2:43 p.m. Eastern. Both times
https://findtreatment.gov/ and https://findtreatment.gov/es/ answered 200, with no notes. A small script
outside the project collected the outside links the way `check_site.py` does and passed only those two
to `check_links`, so the 988 chat addresses weren't requested. So findtreatment.gov came off
`KNOWN_BLOCKERS`. The monthly crisis source check's own page check, run once on https://findtreatment.gov/
at 2:43 p.m., got a nearly empty page from a plain read (200, 4 words) and the whole page in Chrome (200,
649 words), so its result was "ok".

## The name

[[NAME-CHECK]] has the details. In short: a UK company named Tidelight Ltd sells a tide lamp and makes a
tide-times app named Tidelight, and a design brand sells a lamp named Tidelight. No Tidelight in health,
mental health, crisis support, or wellness came up. Close names in health include TidalHealth, which
offers crisis care in Maryland, and Tidewell Hospice in Florida. tidelight.org, tidelight.com, and
tidelight.app are all registered. The USPTO search page opened without an account, but no search was
run there, because that submits its search form. In the afternoon, Tide Mood AI was added: an
independent review noticed the morning's scan had left out this mood-tracking app, and its App Store
listing was opened to confirm it exists.

## Checked

On a Mac, November 8, 2026. None of these is a phone test or a content review.

| Command | Result line | Exit, time |
| --- | --- | --- |
| `python3 tools/check_site.py`, before any change | "All checks passed. This does not replace a real phone test or a content review." 19 pages, 112 outside links | 0, 1.5 s |
| `python3 tools/check_site.py --check-links` | "All checks passed. This does not replace a real phone test or a content review." with the 7 notes above | 0, 46 s |
| `python3 tools/check_crisis_sources.py` | "Checked 12 provider pages, 1 left for a person to open." 11 pages ok, the FCC page unread (403) | 0, 21 s |
| `python3 tools/make_review_packet.py` | Wrote both packets, as HTML and PDF | 0, 2 s |
| Checks on the final files | See the two sections below | |

### Checks on the morning commit

Run on that commit's files, staged, just before committing, at 7:20 a.m. Eastern. An earlier run at
7:19 gave the same results. This note first said each took a second or less. That was wrong for
`launch_gate.py --self-test`: an independent review measured about 2 seconds, and it took 12 to 15
seconds in the afternoon runs below, on a busier Mac.

| Command | Result line | Exit |
| --- | --- | --- |
| `python3 tools/check_site.py` | "All checks passed. This does not replace a real phone test or a content review." 19 pages, 112 outside links, no notes, so the packets are current | 0 |
| `python3 tools/check_site.py --self-test` | "All 5 made-up link answers were read correctly." | 0 |
| `python3 tools/check_crisis_sources.py --self-test` | "All 20 made-up cases were read correctly, and every crisis number in notes/SAFETY.md has a check." | 0 |
| `python3 tools/launch_gate.py --self-test` | "All 61 made-up cases were read correctly." | 0 |

### Checks on the afternoon commit

The last five were run on this commit's files at 2:54 p.m. Eastern, before their results were written
into this table, and `check_site.py` again after that, with the same result. Times are wall-clock times
on a Mac busy with other work (load average about 8), so they are longer than on an idle one.

| Command | Result line | Exit, time |
| --- | --- | --- |
| Link check on the findtreatment.gov links only, twice | Both links 200 both times, no notes or failures | 0, under 1 s each |
| `check_page` from `tools/check_crisis_sources.py`, on https://findtreatment.gov/ only | "ok": plain read 4 words, Chrome 649 words | 0, 6 s |
| `python3 tools/make_review_packet.py`, last run at 2:53 p.m. | Wrote both packets, as HTML and PDF. Fingerprint `006e3e62e203` | 0, 13 s |
| `python3 tools/check_site.py` | "All checks passed. This does not replace a real phone test or a content review." 19 pages, 112 outside links, no notes, so the packets are current | 0, 4.4 s |
| `python3 tools/check_site.py --self-test` | "All 7 made-up link answers were read correctly." | 0, 0.3 s |
| `python3 tools/check_crisis_sources.py --self-test` | "All 20 made-up cases were read correctly, and every crisis number in notes/SAFETY.md has a check." | 0, 0.4 s |
| `python3 tools/launch_gate.py --self-test` | "All 61 made-up cases were read correctly." | 0, 12.9 s. Earlier runs that afternoon took 12.0, 12.4, and 14.7 s |
| `python3 tools/test_the_tests.py --only "counted as fine"` | "All 2 planted bugs were caught." Both link check bugs, on `check_site.py --self-test` | 0, 1.5 s |

### Not run

In the morning: `tools/test_browser.py`, `tools/test_webkit.py`, `tools/test_the_tests.py`,
`tools/check_live.py --local`, `tools/check_readability.py`, and the full suite. That commit changed no
page, script, or style, only notes and the rebuilt packets.

In the afternoon: `tools/test_browser.py` and `tools/test_webkit.py`, because no page, stylesheet, or
site script changed, only notes, two Python check tools, and the packets. The rest of
`tools/test_the_tests.py`, beyond the two planted bugs for the link check's self-test. The full
`tools/check_site.py --check-links`, which requests the 988 chat addresses. The live
`tools/check_crisis_sources.py` on every provider page. `tools/check_live.py --local`,
`tools/check_readability.py`, and the full suite. The iOS Simulator wasn't used, and nothing was tried
on a real phone.

## Open points

- A person reads each provider's page and fills in "Person confirmed" in [[SAFETY]]. These reads don't
  replace that.
- The pages still say an AI assistant compared the crisis numbers and links on November 6, 2026. That is
  still true. [[UPKEEP]] moves that date after a person's check, with `tools/set_checked_date.py`, so this
  task left it.
- With findtreatment.gov off `KNOWN_BLOCKERS`, the monthly checks now fail, instead of leaving a note,
  if it blocks scripts again: the link check on a 403 or 429, and the crisis source check if Chrome also
  gets a nearly empty page, as the old comment said it once did. A plain read still gets one. If that
  happens, a person opens the site, and it can go back on the list.
- `tools/check_crisis_sources.py` doesn't read 988's Spanish Get Help page, so the monthly check doesn't
  notice if the ?lang=es chat address changes there. The row's English page is still checked.
- `tools/launch_gate.py --self-test` reads and parses the site's pages about 590 times, which is why it
  takes seconds. Not changed here.
- The USPTO search, and everything else listed at the end of [[NAME-CHECK]], is for a person or a lawyer.
- `notes/STATUS.md` wasn't changed in this task. Whoever merges this branch can add a line there.

## Next step

A founder reads this branch. If it is wanted, push it and open a pull request into
`site/first-version-finish`, or merge it there. Merging into that branch publishes nothing.

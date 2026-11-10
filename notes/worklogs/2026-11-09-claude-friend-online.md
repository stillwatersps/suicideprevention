---
type: handoff
owner: Claude Code, as a workflow task in one founder's session
branch: build/friend-online-1109, cut from 830f766, the tip of claude/jolly-mayer-2m6eno (draft pull request 5)
---

# A draft section on helping a friend who posts about suicide online

Date: November 9, 2026. Updated November 10, 2026, when a second run of the same task read every
source again, found each still said what is recorded here, rebuilt the packets, and ran the checks
again (see "November 10" below).

**State when written: local only.** Commits on `build/friend-online-1109` on one computer. Not pushed,
no pull request, not merged, and not on the public website. No qualified person has reviewed any of
it, and the Spanish is an unreviewed AI translation.

This finishes an earlier attempt, `build/friend-online-1108` at `f0bd2fb`, which was cut from an older
base before the Shoreline stylesheet and the Daily check-in. Its page changes applied cleanly here. Every
line was checked again and every source read again on November 9. Two descriptions that couldn't be
confirmed that day were dropped (see "Decisions").

## Completed

- **Help Someone** (`help-someone/index.html`): the one-paragraph section "If you see a worrying post
  online" is now "If a friend posts about suicide online". It keeps the id `online`, so links to it
  still work. It opens with "take it seriously, even if it sounds like a joke", then five steps:
  call 911 if they may be in immediate danger; reach out privately if you feel able to; if you're a
  teen, tell a trusted adult, even if your friend asks you to keep it secret; report the post with
  the platform's own tools, linking 988's page on how to report on each platform; and don't share or
  repost it, except to show someone who can help. It ends with calling or texting 988 for advice, and
  a link to #chatsafe that says its phone numbers are Australia's and gives 988 and 911 instead. An
  HTML comment above the section marks it as a draft and names its sources.
- **Spanish Help Someone** (`es/ayudar-a-alguien/index.html`): the same section, translated by an AI
  assistant. It gives the Spanish routes, call 988 and press 2, or text AYUDA to 988, and marks 988's
  and #chatsafe's pages as English. The page's existing notice already says no fluent reader has
  checked the translation.
- **For Teens and its Spanish twin**: the line that points to Help Someone now also links the new
  section. No other teen text changed.
- **Source lists**: both Help Someone pages list #chatsafe's Responding and Talking pages, so each has
  17. The lists still say "Checked November 6, 2026", because `tools/check_site.py` needs every page to
  show one date for its sources. A sentence says the two #chatsafe pages were read later.
- **[[CONTENT-REVIEW]]**: eight questions under "Help Someone: if a friend posts about suicide online",
  a pointer from the older question about worrying posts, and three rows in the controls table.
- **[[SAFETY]]**: "Read November 9, 2026, for the section on posts online" records each page read and
  what it says. The resource table is unchanged: the section adds no number or keyword.
- **Planted bugs** (`tools/test_the_tests.py`): a renamed section target, caught by the browser link
  test (For Teens) and by the site check (the Spanish teen page).
- **Review packets** rebuilt, HTML and PDF.

Not changed: styles, scripts, `sw.js` (no new page), the site workflow, the About pages' review list
and `tools/make_review_packet.py` (no new page), [[STATUS]] and [[TASKS]].

## Sources read

All on November 9, 2026, by Claude, in the Claude desktop app's built-in browser. Nothing was called,
texted, chatted, reported, or submitted, and no chat page or report form was opened.

| Page | Used for |
| --- | --- |
| 988, Support on Social Media, https://988lifeline.org/help-someone-else/support-on-social-media/ | Safety teams reach out to the person; how to report on 11 platforms; Tumblr no longer responds directly; call 911 if someone may be at imminent risk |
| 988, Help Someone Else, https://988lifeline.org/help-someone-else/ | Never keep a friend's plan to hurt themselves secret; contact 988 at any time if a friend is struggling |
| 988, Ayude a Alguien Más, https://988lifeline.org/es/ayude-a-alguien-mas/ | The Spanish twin: call 988 at any time; no social media section |
| 988, Get Help, https://988lifeline.org/get-help/ | Call or text 988; in Spanish, press 2 or text AYUDA |
| #chatsafe, Responding, https://www.orygen.org.au/chatsafe/responding | Take it seriously, even as a joke; emergency help before a secret; choices depend on you and how well you know them; a supportive comment or DM; report the post |
| #chatsafe, Talking, https://www.orygen.org.au/chatsafe/talking | Don't post or share unsafe images or videos; report unsafe content |
| #chatsafe home and International guidelines list | Its numbers are Australian; a U.S. English edition and a Spanish edition for Mexico exist (not read); the copyright notice |
| CDC, How to Talk to a Friend, https://www.cdc.gov/free-mind/teens/talk-to-a-friend.html (last reviewed March 27, 2026) | A parent or a trusted adult such as a coach, teacher, or school counselor |
| Meta Safety Center, suicide prevention, https://www.meta.com/safety/topics/wellbeing/suicide-prevention/ | A reviewer question only: Meta alerts emergency services for a wellness check when it thinks the risk is imminent. Not cited on the page |

Not read: the #chatsafe guideline editions themselves, and 988's social media toolkit PDF. Nothing on
the pages comes from them.

## Checked

On a Mac, November 9, 2026. None of these is a real phone, and the iOS Simulator wasn't used.

| Check | Kind | Result |
| --- | --- | --- |
| `python3 tools/check_site.py` | Reads the files | "All checks passed", 21 pages, 114 outside links, no note that the packets are out of date |
| `python3 tools/make_review_packet.py` | Builds the packets | Both packets rebuilt, HTML and PDF |
| `python3 tools/check_readability.py` | Report only | No sentence from the new section listed |
| `python3 tools/test_browser.py --pages help-someone,teens,ayudar-a-alguien,adolescentes`, all 18 groups | Desktop Chrome and its phone-size emulation | "All browser checks passed", 0 failures in every group |
| `python3 tools/test_webkit.py`, every page | macOS WebKit in a window, not iOS | "207 checks in WebKit on this Mac, 0 problems" |
| `python3 tools/test_the_tests.py --only "a link to a section on another page"` | Planted bugs | "All 2 planted bugs were caught" |

Not run: the full suite, the full planted-bug run, and the browser tests on other pages, since only
these four pages changed.

### November 10

Every page in "Sources read" above was read again on November 10, 2026, in the built-in browser, the
same way: nothing called, texted, chatted, reported, or submitted. Each still says what the table and
[[SAFETY]] record, including Orygen's copyright notice, the 16 editions on its international list, the
CDC page's "Last Reviewed: March 27, 2026", and Meta's wellness check. Nothing on the pages changed
except the HTML comments, and [[SAFETY]] and [[CONTENT-REVIEW]] now say the pages were read again.

| Check, November 10, 2026 | Kind | Result |
| --- | --- | --- |
| `python3 tools/make_review_packet.py` | Builds the packets | Both packets rebuilt, HTML and PDF |
| `python3 tools/check_site.py` | Reads the files | "All checks passed", 21 pages, 114 outside links, no note that the packets are out of date |
| `python3 tools/check_readability.py` | Report only | No sentence from the new section listed |
| `python3 tools/test_browser.py --pages help-someone,teens,ayudar-a-alguien,adolescentes`, all 18 groups | Desktop Chrome and its phone-size emulation | "All browser checks passed", 0 distinct failures in every group |
| `python3 tools/test_webkit.py`, every page | macOS WebKit in a window, not iOS | "207 checks in WebKit on this Mac, 0 problems" |
| `python3 tools/test_the_tests.py --only "a link to a section on another page"` | Planted bugs | "All 2 planted bugs were caught" |

Still not run: the full suite and the full planted-bug run. No real phone, and no iOS Simulator.

## Decisions and open questions

Proposals, for both founders and the reviewer. None is agreed.

- **911 comes first** in the list, as in the urgent note at the top of the page. The task listed it
  last.
- **"Don't share or repost it" is Claude's wording.** #chatsafe says not to share unsafe images or
  videos and to report unsafe content. A reviewer question asks whether it could make a teen slow to
  show an adult.
- **No new call or text links** in the section. The pinned strip and the urgent note have them.
- **#chatsafe is paraphrased, never copied,** because Orygen's footer says no part may be reproduced
  without its written permission.
- **Dropped from the earlier attempt** because they couldn't be confirmed on November 9: calling
  Orygen a youth mental health research organization (the pages now just say it is in Australia),
  and two reviewer-question claims, that #chatsafe says a school counselor tells a parent and that
  Meta can bring help without a known location, plus a Spanish edition of #chatsafe for parents in
  Chile.
- **The source date.** At the next full check of the sources (`tools/set_checked_date.py --part
  sources`), delete the sentence saying the two #chatsafe pages were read later, in both languages.

## Merging

Other branches that rebuild the review packets or edit [[SAFETY]] or [[CONTENT-REVIEW]] will conflict in
those files. Whichever merges second: keep both changes in each note, rebuild the packets with
`python3 tools/make_review_packet.py`, and run `python3 tools/check_site.py` until it shows no note that
the packets are out of date.

## Next step

A founder reads the section in both languages and decides whether it goes to the licensed therapist
with the packet, and the Spanish to a fluent reader. Try the For Teens link and the section on a real
phone with [[PHONE-TEST]].

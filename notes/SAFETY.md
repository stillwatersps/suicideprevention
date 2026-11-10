---
aliases: [Safety, Crisis resources]
status: draft for review
---

# Safety baseline

[[00 START HERE|Back to Start Here]]

Draft, November 6, 2026. These are proposed ground rules for a suicide
prevention website, not approved decisions or a clinical review. A qualified
suicide prevention professional should review content before people rely on it.
[[CONTENT-REVIEW]] lists what that review needs to cover.

## Ground rules for every page we publish

GitHub Pages is on, so anything on `main` can be seen by the public.

1. **Crisis help is always one tap away.** Every page shows how to reach the
   988 Suicide & Crisis Lifeline and 911, in plain text a visitor can read even
   if a call or text link does not work on their device. [[DECISIONS]] says how the
   draft site does this at each screen size, and where it takes two steps.
2. **No dead crisis controls.** A button that says "call", "text" or "chat"
   either works and says where it goes, or it is not shown. Placeholders are
   fine for resource cards, never for crisis actions.
3. **Say what Tidelight is.** Tidelight is not a crisis service unless the
   founders decide to staff one. Wording such as "24/7" or "talk to a counselor"
   names the outside service that actually provides it.
4. **Follow safe messaging guidance.** No method details, no describing suicide
   as a solution or as inevitable, no sensational images. Emphasize help,
   hope, coping and recovery stories. Sources are below.
5. **Collect nothing sensitive for now.** No forms, accounts, analytics or
   tracking that could record a visitor's distress until a data decision is made.
   No third-party scripts, fonts, or embeds, because each one sends visitors' IP
   addresses to another company. Do not claim that no data is collected at all:
   GitHub says it logs and stores the IP address of every GitHub Pages visitor
   for security. Proposed November 9, 2026, not agreed by both founders: the Daily
   check-in alone may have places to type and choose, as long as nothing typed leaves
   the page or is stored. `tools/check_site.py` allows only checkboxes, radio buttons,
   and text boxes there, and fails if its script could send or store anything. Saving
   isn't built; see [[CHECK-IN-BACKEND]].
6. **Write for minors too.** Plain language and youth-appropriate resources,
   since the audience includes minors. Ages are still undecided.
7. **Never test on a crisis line.** Do not place test calls, send test texts,
   start chats, or submit forms on a crisis service. These are real services for
   people in crisis. To test a link on a phone, tap it, stop at the dial or
   compose screen, and cancel.

## U.S. crisis resources

"Read on" means Claude read the provider's own page in a browser on that date,
without calling, texting, chatting, or submitting anything. It does not mean a
person has confirmed it. A founder should read each page and fill in the last
column. Recheck close to publication and at least monthly (proposed).

| Resource | How to reach it | Official page | Read on | Person confirmed |
| --- | --- | --- | --- | --- |
| 988 Suicide & Crisis Lifeline | Call or text 988; chat at chat.988lifeline.org. 24/7 | https://988lifeline.org/get-help/ | Nov 8, 9 and 10, 2026 | |
| 988 by text, first steps | Send any message to 988. Reply NEXT to accept the terms of service, answer a brief survey, then a Wait message comes before a counselor. 988's Spanish What to Expect page lists the same steps and says the word "siguiente" accepts the terms | https://988lifeline.org/faq/texting-the-988-lifeline/ and https://988lifeline.org/get-help/what-to-expect/ (Spanish: https://988lifeline.org/es/obten-ayuda/que-puede-esperar/) | Nov 8, 2026 | |
| 988 in Spanish | Call 988, then press 2; text AYUDA to 988; chat at chat.988lifeline.org/?lang=es | https://988lifeline.org/get-help/ (Spanish: https://988lifeline.org/es/obten-ayuda/) | Nov 8, 9 and 10, 2026 | |
| 988 in other languages | Call 988 and ask for an interpreter or say the language. More than 240 languages, voice only | https://988lifeline.org/faq/calling-the-988-lifeline/faq-is-the-988-lifeline-available-in-other-languages-for-non-english-speakers/ | Nov 8, 2026 | |
| 988 for Deaf and hard of hearing people | Dial 988 from a videophone; TTY users use a relay service or dial 711, then 988; text; chat | https://988lifeline.org/deaf-hard-of-hearing-hearing-loss/ | Nov 8, 2026 | |
| 988 for LGBTQ+ youth (see the note below) | Call 988, then press 3; text PRIDE to 988 | https://988lifeline.org/get-help/what-to-expect/ | Nov 8, 2026 | |
| Veterans Crisis Line | Dial 988, then press 1; text 838255; chat | https://www.veteranscrisisline.net | Nov 8, 2026 | |
| Crisis Text Line | Text HOME to 741741. Its FAQ says free on AT&T, T-Mobile, Sprint, and Verizon, and standard text rates on other carriers. Its terms and privacy policy say message and data rates may apply. A person should ask which holds | https://www.crisistextline.org/about-us/faq/ | Nov 8, 2026 | |
| The Trevor Project (LGBTQ+ young people) | Call 1-866-488-7386; text START to 678-678; chat; TTY 1-866-803-3699 | https://www.thetrevorproject.org/get-help/ | Nov 8, 2026 | |
| SAMHSA National Helpline (referrals, not a crisis line) | 1-800-662-4357; TTY 1-800-487-4889. English and Spanish, 24/7 | https://www.samhsa.gov/find-help/helplines/national-helpline | Nov 8, 2026 | |
| TAPS (support after a military suicide loss) | Call 1-800-959-8277, 24/7 | https://www.taps.org/suicide | Nov 8, 2026 | |
| National Maternal Mental Health Hotline (HRSA; for people who are pregnant or just had a baby, and their partners and families. Its pages don't call it a crisis line) | Call or text 1-833-852-6262, also written with letters (see below); chat from its page. 24/7, English and Spanish; interpreters for over sixty languages; TTY or another relay service | https://mchb.hrsa.gov/programs-impact/national-maternal-mental-health-hotline (Spanish: https://mchb.hrsa.gov/es/programas-impacto/linea-nacional-asistencia-salud-mental-materna) | Nov 9 and 10, 2026 | |
| Disaster Distress Helpline (SAMHSA; crisis counseling for emotional distress related to a natural or human-caused disaster) | Call or text 1-800-985-5990, 24/7. Spanish: press 2. American Sign Language: call or text through a relay provider. Interpreters for over a hundred languages | https://www.samhsa.gov/find-help/helplines/disaster-distress-helpline (Spanish: https://www.samhsa.gov/find-help/helplines/disaster-distress-helpline/espanol) | Nov 9 and 10, 2026 | |
| Teen Line (Didi Hirsch Mental Health Services; trained teen volunteers, for young people up to age 19; not open all day and night) | Call 1-800-852-8336, every night 6 to 10 p.m. Pacific; text TEEN to 839863, 6 to 9 p.m. Pacific. After hours, calls go to adult counselors at Didi Hirsch, and texts get no reply. English only | https://didihirsch.org/teenline/ and https://didihirsch.org/teenline/hotline-support/ | Nov 9 and 10, 2026 | |
| Trans Lifeline (peer support run by trans people, for trans and questioning people. Its pages call it a peer support service and say you don't need to be in a crisis to call. Not open all day and night) | Call 1-877-565-8860, Monday to Friday, 10 a.m. to 6 p.m. Pacific (1 to 9 p.m. Eastern); closed on some holidays. Press 2 for Spanish. Phone only: its FAQ says text chat is being prepared | https://translifeline.org/hotline/ (Spanish: https://translifeline.org/es/linea-de-ayuda/) | Nov 9 and 10, 2026 | |
| FindTreatment.gov (treatment finder) | Website | https://findtreatment.gov | Nov 8, 2026 | |
| Emergency services | Call 911. Text-to-911 works only in some places; call if you can | https://www.fcc.gov/consumers/guides/what-you-need-know-about-text-911 | Nov 8, 2026 | |

The two "Nov 8, 9 and 10" rows: Claude read 988's English Get Help page on November 8, twice on
November 9, 2026, in two sessions, and on November 10, and its Spanish Get Help page on November 8, 9
and 10. The November 8 and 10 reads and the second November 9 read were in the Claude desktop app's
built-in browser. Each read of the English page found call or text 988, dial 988 and press 2 for
Spanish, text AYUDA to 988, and chat in Spanish. The November 8 and 10 reads and the second November
9 read also found chat buttons leading to chat.988lifeline.org and "24/7" in its directory. Each read
of the Spanish page found Chatea buttons leading to chat.988lifeline.org/?lang=es, read from the
page's code, not clicked. See [[worklogs/2026-11-08-claude-recheck]],
[[worklogs/2026-11-09-claude-founder-decisions]], and [[worklogs/2026-11-09-claude-sources]].

### On the website as a draft, a person must confirm

- **988 LGBTQ+ youth option.** 988's Get Help page says the service has been
  restored, and its What to Expect page lists press 3 on a call and PRIDE to 988 by
  text. The Trevor Project and a U.S. House statement date its return to September
  30, 2026. SAMHSA's 988 FAQ (December 2025) doesn't mention it. SAMHSA's 988
  performance page (October 2026) doesn't name it either. A dashboard on that page shows an
  "Option 3" service type that ended on July 17, 2025, without saying whom it served, as
  described below.
  No official page gives its age range or chat route. The Trevor
  Project is not part of it, so the Get Help page lists the two apart.
  988's Spanish FAQ on this service says "Este servicio no está disponible en español en
  este momento." Read November 6, 2026. The page has no date and may predate the service's
  return, so a person should ask 988 whether it is current.
  [[CONTENT-REVIEW]] asks the reviewer about this.
  Read again November 8, 2026, in the Claude desktop app's built-in browser, and all of this
  still holds. The Trevor Project's statement dated October 1, 2026
  (https://www.thetrevorproject.org/blog/the-trevor-project-applauds-the-return-of-the-988-lifelines-press-3-specialized-services-for-lgbtq-youth/)
  says the service ended in July 2025 and resumed on September 30, 2026, and its timeline says
  press 3 ended on July 17, 2025. The Congressional Equality Caucus's statement dated September
  30, 2026 (https://equality.house.gov/cec-celebrates-988-return) gives the same day for its
  return. SAMHSA's 988 performance page
  (https://www.samhsa.gov/mental-health/988/performance-metrics, "Last Updated: 10/13/2026")
  names only the Veterans Crisis Line, Spanish language services, and answering in the caller's
  state or territory as the choices a caller makes, in its text and in the flowchart it links
  (https://www.samhsa.gov/sites/default/files/988-what-happens-flowchart-2025.jpg). The Service
  Type tab of the dashboard on that page says "The Option 3 service type existed from September
  2022 through July 17, 2025", and its data notes give Option 3 full service from July 2023 to
  July 17, 2025. The tab doesn't say whom Option 3 served, and the dashboard's other tabs and
  lists weren't opened, but July 17, 2025 is the day The Trevor Project's timeline gives for the
  end of press 3. Nothing on that tab says it returned, and the dashboard's data run to
  September 30, 2026. None of the 988 or
  SAMHSA pages read gives an age range or a chat route. The Spanish FAQ still shows no date, but
  the page's hidden data says it was last changed on June 21, 2024, so it was probably written
  before the service ended and returned. See [[worklogs/2026-11-08-claude-recheck]].
- **TTY in Spanish.** 988's Spanish pages disagree. Its Deaf page gives relay or 711, then
  988. Its TTY FAQ, which has no date, says "Este servicio no está disponible en español en
  este momento." The Spanish Get Help page reports both. Ask 988 or a Deaf-led organization
  which holds. Read again November 8, 2026: both pages say the same as before, and the TTY
  FAQ's hidden page data also says it was last changed on June 21, 2024.
- **Lines for specific groups, added November 9, 2026.** The National Maternal Mental Health
  Hotline, the Disaster Distress Helpline, Teen Line, and Trans Lifeline are on Get Help and its
  Spanish twin as drafts. Claude read each provider's own pages that day in the desktop app's
  built-in browser, without calling, texting, chatting, or submitting anything, and opened no chat
  page. Claude read them all again the same way on November 10, 2026, and every detail below still
  held. A person should confirm these points:
  - HRSA's English and Spanish pages describe listening, local support groups, and referrals. Neither
    calls the maternal hotline a crisis line, mentions 911 or 988, or says what to do in an
    emergency. Both show the number in their call and text links and as 1-833-TLC-MAMA; the Spanish
    page also writes it out. The chat button leads to a separate chat page, which wasn't opened.
  - SAMHSA's English page calls the Disaster Distress Helpline a crisis support service, open 24/7.
    Its English and Spanish pages put "press 2" for Spanish after "call or text", and neither says
    how to choose Spanish by text. The Get Help pages say to call and press 2.
  - Teen Line gives its hours as PST on its FAQ and PT on its help page, and doesn't say whether
    they move with daylight saving time. Its FAQ says after-hours calls go to adult counselors at
    Didi Hirsch's Suicide Prevention Center for 24/7 support. Its help page says a text after hours
    gets no response, and points to 988. Its own text buttons fill in the word TEEN; the site's text
    link opens a blank message, like its other text links.
  - Trans Lifeline's English and Spanish hotline pages list holiday closures for 2025 only. They say
    to try "calling or texting again" when busy, but its FAQ says text-based chat is still being
    prepared, so the site lists phone only. It says it won't call emergency services or police
    without the caller's explicit request, even if they say someone is in danger, but may report
    credible threats of violence to others, and follows laws on suspected child abuse and neglect.
    Calls are recorded and deleted after 90 days. Its Canadian number isn't used.

### Left off the website until a person confirms

- **Crisis Text Line in Spanish.** The provider's pages disagree on the keyword
  (HOLA or AYUDA). Read again November 7, 2026: its FAQ (https://www.crisistextline.org/about-us/faq/) says it supports English
  and Spanish, gives HELLO or HOLA, and lists a separate WhatsApp number for Spanish. Its
  Spanish page (https://www.crisistextline.org/es/) says AYUDA. The Spanish pages say it
  supports Spanish and that the word isn't confirmed. A person should ask Crisis Text Line.
  Read again November 8, 2026: no change, so HOLA and AYUDA still disagree. The FAQ also
  showed a box saying to text HOME or HOLA.
- **Veterans Crisis Line TTY number.** Older VA pages list a 10-digit TTY number.
  The current call page says to use a relay service or dial 711, then 988. Read again
  November 8, 2026 (https://www.veteranscrisisline.net/get-help-now/call/): it still says
  that. The older VA pages weren't opened again.
- **Friendship Line (Institute on Aging), for older adults.** Read November 9 and 10, 2026, at
  https://www.ioaging.org/friendship-line/. The page calls it the nation's only accredited 24-hour
  toll-free emotional support line for older adults, caregivers, and adults with disabilities, and
  lists crisis intervention and suicide prevention among its services. The same page says it serves
  adults 60 and over and adults with disabilities in California. It doesn't say whether callers
  outside California are served, so it isn't on the site, and its numbers aren't recorded here. A
  person should ask the Institute on Aging.

### Only a person can check

- The FCC's text-to-911 page. It refuses automated reads (403 on November 6, 7 and 8, 2026), so
  the monthly check can't read it and lists it for a person. On November 8, Claude read it in
  the Claude desktop app's built-in browser. It says text-to-911 is only available in certain
  places, to make a voice call to 911 whenever possible, that a text where the service isn't
  available should bring an automatic bounce-back message, and that people who are deaf, hard
  of hearing or speech disabled should use a TTY or relay service if text-to-911 isn't
  available. It gives January 6, 2020 as its last update or review. The 911 card and the Deaf
  and hard of hearing card on Get Help, their Spanish twins, and the "Emergency services" row
  above match it. Read again in the built-in browser later on November 8, with the same result.
  A person should still open it and confirm the wording.
- HRSA's National Maternal Mental Health Hotline page. Claude read it in the desktop app's browser on
  November 9 and 10, 2026, but it answered 403 to `tools/check_crisis_sources.py` on both days. The
  monthly check lists it for a person to open, like the FCC's page.

- That the Call and Text links open the dial and compose screens on a real iPhone
  and Android phone, with the right number filled in. Stop there and cancel.
- That the text links behave as expected with no message filled in. They open a blank
  message. To reach 988's Spanish or LGBTQ+ youth service, The Trevor Project, or Teen Line, the
  person has to type the word (AYUDA, PRIDE, START, or TEEN). Crisis Text Line says a first
  message to 741741 can say anything.
- The recorded menu on a 988 call. Nobody here has listened to it live, and it
  must not be tested by calling. Ask 988 or listen to the audio on its website.

## Guidance to read before writing content

- Framework for Successful Messaging (Action Alliance): https://suicidepreventionmessaging.org/safety
- Recommendations for reporting on suicide (SAVE): https://www.save.org/media/media-recommendations/
  (reportingonsuicide.org now redirects here)
- #chatsafe guidelines for young people online (Orygen): https://www.orygen.org.au/chatsafe
  (Australian phone numbers, and reproduction needs permission, so link to it)
- NIMH action steps: https://www.nimh.nih.gov/health/publications/5-action-steps-to-help-someone-having-thoughts-of-suicide

Claude's working summary, for the reviewer to confirm. It draws on those sources and
the 988 pages, and not every point appears on every page listed:

- Say "died by suicide". Avoid "committed", "successful", "failed", and
  "completed", and say a person is thinking of suicide rather than calling them
  "suicidal" where you can.
- Leave out methods, locations, and personal details of people who have died.
- Don't present suicide as common, inevitable, heroic, or a solution, or name a
  single cause. Use statistics sparingly, only when they help someone act.
- Pair hope with a specific step. Say who answers a crisis line and what to expect.
- Describe 988 as separate from 911, and don't promise what a local response will be.

## Open questions

- Who on the team, or which advisor, reviews crisis content before release? A
  founder's brief names a licensed therapist. Record the role and the date, never
  personal details.
- Should a public preview exist at all before that review? See [[DECISIONS]].
- How often are crisis numbers re-checked, and by whom? Monthly is proposed.
- What happens if someone contacts the project in crisis? There is no contact
  route on the site now, and GitHub Issues are on for this public repository.
- If a number changes or a link breaks: who fixes it, how fast, and when can a fix
  skip the second person's review? `tools/check_site.py` compares every call and text
  link with the numbers in the table above, so keep them in its second column, and
  checks that each link's label matches. It checks numbers printed on the wallet
  card and poster pages too. It can't check keywords such as AYUDA or START, or numbers in
  plain sentences on other pages, so search the pages for those by eye.

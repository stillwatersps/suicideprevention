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
| 988 Suicide & Crisis Lifeline | Call or text 988; chat at chat.988lifeline.org. 24/7 | https://988lifeline.org/get-help/ | Nov 6 and 9, 2026 | |
| 988 by text, first steps | Send any message to 988. Reply NEXT to accept the terms of service, answer a brief survey, then a Wait message comes before a counselor. 988's Spanish What to Expect page lists the same steps and says the word "siguiente" accepts the terms | https://988lifeline.org/faq/texting-the-988-lifeline/ and https://988lifeline.org/get-help/what-to-expect/ (Spanish: https://988lifeline.org/es/obten-ayuda/que-puede-esperar/) | Nov 7, 2026 | |
| 988 in Spanish | Call 988, then press 2; text AYUDA to 988; chat at chat.988lifeline.org/?lang=es | https://988lifeline.org/get-help/ | Nov 6 and 9, 2026 | |
| 988 in other languages | Call 988 and ask for an interpreter or say the language. More than 240 languages, voice only | https://988lifeline.org/faq/calling-the-988-lifeline/faq-is-the-988-lifeline-available-in-other-languages-for-non-english-speakers/ | Nov 6, 2026 | |
| 988 for Deaf and hard of hearing people | Dial 988 from a videophone; TTY users use a relay service or dial 711, then 988; text; chat | https://988lifeline.org/deaf-hard-of-hearing-hearing-loss/ | Nov 6, 2026 | |
| 988 for LGBTQ+ youth (see the note below) | Call 988, then press 3; text PRIDE to 988 | https://988lifeline.org/get-help/what-to-expect/ | Nov 6, 2026 | |
| Veterans Crisis Line | Dial 988, then press 1; text 838255; chat | https://www.veteranscrisisline.net | Nov 6, 2026 | |
| Crisis Text Line | Text HOME to 741741. Its FAQ says free on AT&T, T-Mobile, Sprint, and Verizon, and standard text rates on other carriers. Its terms and privacy policy say message and data rates may apply. A person should ask which holds | https://www.crisistextline.org/about-us/faq/ | Nov 6, 2026 | |
| The Trevor Project (LGBTQ+ young people) | Call 1-866-488-7386; text START to 678-678; chat; TTY 1-866-803-3699 | https://www.thetrevorproject.org/get-help/ | Nov 6, 2026 | |
| SAMHSA National Helpline (referrals, not a crisis line) | 1-800-662-4357; TTY 1-800-487-4889. English and Spanish, 24/7 | https://www.samhsa.gov/find-help/helplines/national-helpline | Nov 6, 2026 | |
| TAPS (support after a military suicide loss) | Call 1-800-959-8277, 24/7 | https://www.taps.org/suicide | Nov 7, 2026 | |
| FindTreatment.gov (treatment finder) | Website | https://findtreatment.gov | Nov 6, 2026 | |
| Emergency services | Call 911. Text-to-911 works only in some places; call if you can | https://www.fcc.gov/consumers/guides/what-you-need-know-about-text-911 | Nov 6, 2026 | |

### On the website as a draft, a person must confirm

- **988 LGBTQ+ youth option.** 988's Get Help page says the service has been
  restored, and its What to Expect page lists press 3 on a call and PRIDE to 988 by
  text. The Trevor Project and a U.S. House statement date its return to September
  30, 2026. SAMHSA's FAQ (December 2025) and performance page (October 2026) do not
  mention it, and no official page gives its age range or chat route. The Trevor
  Project is not part of it, so the Get Help page lists the two apart.
  988's Spanish FAQ on this service says "Este servicio no está disponible en español en
  este momento." Read November 6, 2026. The page has no date and may predate the service's
  return, so a person should ask 988 whether it is current.
  [[CONTENT-REVIEW]] asks the reviewer about this.
- **TTY in Spanish.** 988's Spanish pages disagree. Its Deaf page gives relay or 711, then
  988. Its TTY FAQ, which has no date, says "Este servicio no está disponible en español en
  este momento." The Spanish Get Help page reports both. Ask 988 or a Deaf-led organization
  which holds.

### Left off the website until a person confirms

- **Crisis Text Line in Spanish.** The provider's pages disagree on the keyword
  (HOLA or AYUDA). Read again November 7, 2026: its FAQ (https://www.crisistextline.org/about-us/faq/) says it supports English
  and Spanish, gives HELLO or HOLA, and lists a separate WhatsApp number for Spanish. Its
  Spanish page (https://www.crisistextline.org/es/) says AYUDA. The Spanish pages say it
  supports Spanish and that the word isn't confirmed. A person should ask Crisis Text Line.
- **Veterans Crisis Line TTY number.** Older VA pages list a 10-digit TTY number.
  The current call page says to use a relay service or dial 711, then 988.

### Only a person can check

- The FCC's text-to-911 page. It refused automated reads on November 6 and 7, 2026 (403), so
  the 911 card on Get Help, its Spanish twin, and the "Emergency services" row above rest on
  earlier reads. A person should open it in a browser and confirm the wording.

- That the Call and Text links open the dial and compose screens on a real iPhone
  and Android phone, with the right number filled in. Stop there and cancel.
- That the text links behave as expected with no message filled in. They open a blank
  message. To reach 988's Spanish or LGBTQ+ youth service, or The Trevor Project, the person
  has to type the word (AYUDA, PRIDE, or START). Crisis Text Line says a first message to
  741741 can say anything.
- The recorded menu on a 988 call. Nobody here has listened to it live, and it
  must not be tested by calling. Ask 988 or listen to the audio on its website.

### Read November 9, 2026, for the section on posts online

Claude read these in the desktop app's built-in browser for the draft section "If a friend posts
about suicide online" on Help Someone and its Spanish twin, and read every one again on November 10,
2026, when each still said what is recorded below. Nothing was called, texted, chatted,
reported, or submitted, no platform's report form was opened, and no person has confirmed them. The
section adds no new number or keyword, and the resource table above is unchanged.

- **988's Get Help page** (https://988lifeline.org/get-help/) lists call, text, and chat, and for
  Spanish, dial 988 then press 2, or text AYUDA to 988, as the rows for 988 and 988 in Spanish above
  say.
- **988's Support on Social Media page**
  (https://988lifeline.org/help-someone-else/support-on-social-media/) says that if you're worried
  about someone on social media, you can contact safety teams, who will reach out to connect the
  person with help. It explains how to report on 11 platforms and links their report or help pages:
  Discord, Facebook, Instagram, Pinterest, Reddit, Snapchat, TikTok, Twitch, X, YouTube, and Bluesky.
  It notes that Tumblr no longer responds directly to reports of suicide or self-harm. In its advice
  for people who run online communities, it says to call 911 if the person may be at imminent risk.
- **988's Help Someone Else page** (https://988lifeline.org/help-someone-else/) says never to keep
  it a secret if a friend tells you about a plan to hurt themselves, and to contact 988 at any time
  if a friend is struggling. Its Spanish twin (https://988lifeline.org/es/ayude-a-alguien-mas/) says
  to call 988 at any time if a friend is struggling, and has no section on social media.
- **#chatsafe, from Orygen in Australia** (https://www.orygen.org.au/chatsafe/responding and
  https://www.orygen.org.au/chatsafe/talking). Responding says to take a worrying post seriously,
  even if it's said as a joke; to call emergency services if someone may be in danger right now,
  since life-saving help matters more than a secret; that what you do can depend on how you feel and
  how well you know the person; and to report the post. Talking says not to post or share unsafe
  images or videos, and to report unsafe content. Its emergency number and helplines are
  Australia's, so the pages say to use 988 and 911 in the U.S. and copy none of its numbers. It also
  says calling emergency services and reporting won't get the person into trouble. The pages leave
  that out, because Meta's page below says a report can lead to a wellness check. Orygen's footer
  says no part may be reproduced without its prior written permission, so the pages paraphrase
  #chatsafe and link to it.
- **CDC, How to Talk to a Friend** (https://www.cdc.gov/free-mind/teens/talk-to-a-friend.html, last
  reviewed March 27, 2026) suggests a parent or a trusted adult such as a coach, teacher, or school
  counselor.
- **Meta's Safety Center page on suicide prevention**
  (https://www.meta.com/safety/topics/wellbeing/suicide-prevention/) says Meta reviews reported
  posts and, when it thinks there is an imminent risk of harm, alerts first responders or emergency
  services for a wellness check. Read for a question in [[CONTENT-REVIEW]]. The pages don't cite it.

## Guidance to read before writing content

- Framework for Successful Messaging (Action Alliance): https://suicidepreventionmessaging.org/safety
- Recommendations for reporting on suicide (SAVE): https://www.save.org/media/media-recommendations/
  (reportingonsuicide.org now redirects here)
- #chatsafe guidelines for young people online (Orygen): https://www.orygen.org.au/chatsafe
  (Australian phone numbers, and reproduction needs permission, so link to it). Its Responding and
  Talking pages were read November 9, 2026, for Help Someone. For visitors outside Australia, its
  home page links a list of international guidelines, which includes a U.S. English edition and a
  Spanish edition for Mexico. Nobody here has read either.
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

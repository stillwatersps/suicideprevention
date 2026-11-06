---
aliases: [Content review, Action map]
status: draft for review
---

# Content review and action map

[[00 START HERE|Back to Start Here]]

What the website says and does, where each claim comes from, and what still needs
a person. Claude drafted the page text and these notes. **No qualified person has
reviewed them.**

Claude re-read every crisis number on the provider's own page on November 6, 2026,
Eastern time, and ran the outside link check that day. It read the longer claims and
research during the overnight run on November 5 and 6. Most research links go to
PubMed records, not journal pages. "How each finding was read", below, says which
sources were read in full.

## Page status

| Page | Content | Source list | Review |
| --- | --- | --- | --- |
| Home (`index.html`) | Links out, role wording | [[SAFETY]] | Not reviewed |
| Get Help (`get-help/`) | Draft | On the page | Not reviewed |
| Help Someone (`help-someone/`) | Draft | On the page | Not reviewed |
| Research (`research/`) | Draft | One or more links per finding | Not reviewed |
| Page not found (`404.html`) | Crisis options and links | [[SAFETY]] | Not reviewed |
| Spanish home (`es/`) | AI translation of Home | [[SAFETY]] | Not reviewed; no fluent reader yet |
| Spanish Get Help (`es/obtener-ayuda/`) | AI translation, Spanish options first | English source list | Not reviewed; no fluent reader yet |
| Spanish Help Someone (`es/ayudar-a-alguien/`) | AI translation | English source list | Not reviewed; no fluent reader yet |
| Spanish Research (`es/investigacion/`) | AI translation of the whole page | English citations | Not reviewed; no fluent reader yet |
| For Teens (`teens/`) | Draft, repeats Get Help and Help Someone text | On the page | Not reviewed; ages undecided |
| Spanish For Teens (`es/adolescentes/`) | AI translation | English source list | Not reviewed; no fluent reader yet |
| Wallet card (`card/`) | Draft card and poster from [[SAFETY]] | [[SAFETY]] | Not reviewed; don't hand out yet |
| Spanish wallet card (`es/tarjeta/`) | AI translation | [[SAFETY]] | Not reviewed; no fluent reader yet |
| Not sure (`not-sure/`) | Draft, from Pathway A and NIMH and SAMHSA pages | On the page | Not reviewed |
| Spanish Not sure (`es/que-siento/`) | AI translation | On the page | Not reviewed; no fluent reader yet |
| After a loss (`after-a-loss/`) | Draft, from AFSP, SAVE, TAPS and the CDC | On the page | Not reviewed; needs someone with lived experience of loss |
| Spanish After a loss (`es/despues-de-una-perdida/`) | AI translation | On the page | Not reviewed; no fluent reader yet |
| About and privacy (`about/`) | Draft; behavior described was tested in a browser | On the page | Not reviewed; needs a lawyer |
| Spanish About (`es/acerca-de/`) | AI translation | On the page | Not reviewed; no fluent reader yet |

Every draft page says so on screen. Remove those notes only after review.

## Review records

`tools/check_site.py` reads this section, along with the review list on the About pages. Add one line per
finished review, with the page or section, the reviewer's role, the date, and the result.
Never add personal contact details. Update the list on the About pages at the same time.

- No review has been recorded.

## What each control does

"Link format only" means nobody has tapped it on a phone. The phone test for all of
these: tap, stop at the dial or compose screen, and cancel.

| Control | Where | Goes to | Provider | Checked | Needs a person |
| --- | --- | --- | --- | --- | --- |
| Call 988 | Crisis strip, buttons, closing banner, Help Someone urgent note | `tel:988` | 988 Lifeline | Link format only | Phone test |
| Text 988 | Crisis strip, buttons, closing banner, Help Someone urgent note | `sms:988` | 988 Lifeline | Link format only | Phone test |
| Call 911 | Crisis strip, Get Help, Help Someone urgent note | `tel:911` | Local 911 | Link format only | Phone test. Decide whether it should be a link at all |
| Chat Online | Buttons, closing banner | chat.988lifeline.org | 988 Lifeline | Page opens; form not submitted | Open on a phone |
| Ayuda en español | Every page | Spanish block on Get Help | Stillwater | Tested in browser | Spanish reviewer |
| Llamar al 988 | Get Help, Spanish block | `tel:988` | 988 Lifeline | Link format only | Phone test, Spanish reviewer |
| Enviar AYUDA al 988 | Get Help, Spanish block | `sms:988`, message blank | 988 Lifeline | Link format only | Phone test, Spanish reviewer |
| Chatear en español | Get Help, Spanish block | chat.988lifeline.org/?lang=es | 988 Lifeline | Page opens in Spanish; form not submitted | Spanish reviewer |
| 988lifeline.org | Fallback line | 988lifeline.org | 988 Lifeline | Page opens | None |
| Confidentiality statement | Get Help | 988's page | 988 Lifeline | Page opens | None |
| 988 options for Deaf and hard of hearing people | Get Help | 988's page | 988 Lifeline | Page opens | Deaf reviewer or Deaf-led organization |
| Call 988 (other languages) | Get Help | `tel:988` | 988 Lifeline | Link format only | Phone test |
| Call 988, then press 1 | Get Help | `tel:988` | Veterans Crisis Line | Link format only | Phone test |
| Text 838255 | Get Help | `sms:838255` | Veterans Crisis Line | Link format only | Phone test |
| Veterans Crisis Line chat | Get Help | VCL chat page | Veterans Crisis Line | Page opens | None |
| Call 988, then press 3 | Get Help | `tel:988` | 988 LGBTQ+ youth service | Link format only | Phone test. Confirm the option with 988 |
| Text PRIDE to 988 | Get Help | `sms:988`, message blank | 988 LGBTQ+ youth service | Link format only | Phone test. Confirm the option with 988 |
| Call 1-866-488-7386 | Get Help | `tel:+18664887386` | The Trevor Project | Link format only | Phone test |
| Text START to 678-678 | Get Help | `sms:678678`, message blank | The Trevor Project | Link format only | Phone test |
| Trevor Project chat and TTY | Get Help | Trevor's help page | The Trevor Project | Page opens | None |
| Text HOME to 741741 | Get Help | `sms:741741`, message blank | Crisis Text Line | Link format only | Phone test |
| Crisis Text Line website | Get Help | crisistextline.org | Crisis Text Line | Page opens | None |
| 1-800-662-4357 | Get Help | `tel:+18006624357` | SAMHSA | Link format only | Phone test |
| 1-800-487-4889 (TTY) | Get Help | `tel:+18004874889` | SAMHSA | Link format only | Phone test |
| FindTreatment.gov | Get Help | findtreatment.gov | SAMHSA | Page opens | None |
| A form (PDF) | Get Help | Stanley-Brown safety plan PDF | Its developers | File loads | See the question on permission |
| How this works on different platforms | Help Someone | 988's social media page | 988 Lifeline | Page opens | None |
| Our web host logs visitors' IP addresses | Home | Privacy line in the footer | Stillwater | Tested in browser | Lawyer question |
| GitHub says it logs and stores visitors' IP addresses | Every footer | GitHub's documentation | GitHub | Page opens | Lawyer question |
| Get Support Now | Header | Crisis options on the same page | Stillwater | Tested in browser | Founders: is the label right? |
| Quick exit / Salida rápida | Every page, bottom right | https://www.weather.gov/ | Stillwater | Tested in browser: Back skips the page that was left, but can still reach earlier Stillwater pages | Reviewer: label, destination, and what it can't hide |
| Save 988 to your contacts / Guarda el 988 en tus contactos | Get Help, For Teens, Wallet card, About, and their Spanish twins | `assets/988-lifeline.vcf`, `assets/988-linea-es.vcf` | Stillwater | File checked. See `notes/worklogs/2026-11-06-claude-first-version.md` for phone tests | Save on a real iPhone and Android phone |
| Llamar al 988 (marca 2) / Enviar AYUDA al 988 / Chatear en español | Spanish pages | `tel:988`, `sms:988`, chat.988lifeline.org/?lang=es | 988 Lifeline | Link format only | Phone test; fluent reader |
| Menu | Header, phones and tablets | Opens the page list | Stillwater | Tested in browser | Real phone with a screen reader |
| Three homepage cards | Home | Get Help, Help Someone, Research | Stillwater | Tested in browser | None |
| Show sources | Get Help, Help Someone | Opens the source list | Stillwater | Tested in browser | None |

Text and chat with a crisis service start with automated steps. Texting asks you
to accept terms and answer a few questions. Chat asks for a zip code, whether you are
having thoughts of suicide, and how upset you feel. The Get Help page says so.

## Questions for the qualified reviewer

Wording is proposed. Nothing here is clinical advice.

**Crisis wording on every page**

- "Need help now?" replaced "In crisis?", and "Not sure what you need?" replaced
  "Not in crisis?", so a distressed visitor is not asked to judge their own risk.
  Are these better?
- Should 911 be a tap-to-call link in the pinned strip? Phones ask before calling,
  but an accidental tap is possible, and some people fear a police response.
- The header's "Suicide prevention & support" tagline and "Get Support Now" button
  both come from the supplied design. Both read as if Stillwater provides support, and
  the button doesn't say who does. Claude's suggestion: "Find suicide prevention
  support" and "Call or text 988".
- The text links open a blank message (`sms:741741`, `sms:678678`, and `sms:988` for
  AYUDA and PRIDE), so a person in distress has to remember the keyword. The label on
  the button is all that reminds them. Is that acceptable?
- Is the privacy wording right? The homepage says "Stillwater has no sign-ups, forms,
  or tracking. Our web host logs visitors' IP addresses." Each footer says "no
  sign-ups, forms, analytics, or cookies" and links GitHub's statement. A lawyer should
  read this too.
- Footers and draft notes say an AI assistant drafted the content and compared numbers
  and links with each provider's website. Is that the right way to say it, and should
  it stay after review?

**Get Help**

- Is it right to tell people that 988 counselors may contact emergency services,
  with 988's own figure of fewer than 2 in 100 calls? The page also says, from 988's
  terms, that you may not get a say, and that the terms ask you to call 911 first for
  an immediate threat. It is honest, but could it put someone off calling?
- Should the page list the 988 LGBTQ+ youth option (press 3, PRIDE to 988), and how?
  988's own pages list it, none states an age range or chat route, and SAMHSA's older
  FAQ doesn't mention it. The Trevor Project is not part of it, so the page lists them
  apart. See [[SAFETY]].
- Is the description of a safety plan suitable for someone making one alone? The
  developers present it as made with a clinician, and evidence for teens using one
  alone is thin. See the Research page.
- The Stanley-Brown developers require written permission to reword their form or
  put it into a website. The page describes safety plans in general and links to
  their PDF. Is that enough? Should the project ask them?
- Should the page add more about shared devices and phone bills, or a quick-exit
  button?

**Under 18**

- What should minors be told about confidentiality? The page says conversations
  are confidential with limits. It tells them to expect a school counselor to tell a
  parent or guardian, because the American School Counselor Association calls that
  "non-negotiable", even at 18. The exception is when a parent's abuse or neglect is
  the reason, when the counselor contacts child protective services. Could this wording
  put a teen off telling a counselor?
- 988's terms mention insurance statements that could reach a parent when a center
  bills insurance. The page says so. Is that the right level of detail?
- What should a teen do if no trusted adult is available, or home is not safe?
- A lawyer should look at minors' privacy and the under-13 question.

**Help Someone**

- The urgent note doesn't follow SAMHSA's order. SAMHSA's Suicide Prevention page, read
  November 6, lists calling 911 if danger seems imminent, then calling or texting 988,
  and further down staying with the person or making sure another caring person is
  there. The note puts staying second and 988 last. "If it is safe" is Claude's addition,
  not SAMHSA's. Is the order right, and should that phrase stay? No general official
  page describes calling 988 together, so the page no longer tells people to.
- The warning signs follow NIMH's 2025 list with no urgent tier, because official
  sources sort urgent signs differently. Is that right?
- Sources differ on when not to leave someone alone. The general rule on the page
  follows NIMH: when they say they are going to end their life. The National
  Association of School Psychologists sets a much lower bar for young people showing
  signs, with constant supervision. The parent paragraph sits between the two: stay
  close when a child has a plan or can't stop thinking about ending their life. Are
  these the right thresholds?
- The page keeps safety advice general and names no items: "remove or safely store
  anything they could use to hurt themselves". NIMH, SAMHSA, 988, and the school
  psychologists all tell helpers to remove means. Is it specific enough? The page's
  advice is from those sources, and the Research page has no study of steps at home.
  One review turned up during checking, Spitzer 2024 (PMID 38324739, not read in
  full), reports most studies of counseling families on this at high risk of bias.
- Some sources listed on this page, such as the VA caregiver toolkit, name specific
  items. Nobody has checked every source link for this. Should they stay linked?
- For a young person whose friend told them by text or online, the page says to keep
  talking if you can while you get an adult, or call or text 988. That wording is
  Claude's, because the sources don't cover it. Is it right?

**Research**

- Are the findings fair? Each has a "What it can't show" line. Please check every
  number against its source.
- Is it right to include the study on news coverage of celebrity deaths? It is
  worded without figures and says it does not apply to talking with someone.
- Two papers are cited without links because they name methods. Should they be linked?
  Open these knowing that: Steeg 2025,
  https://pmc.ncbi.nlm.nih.gov/articles/PMC12699607/, and the BMJ 2020 review,
  https://pmc.ncbi.nlm.nih.gov/articles/PMC7190013/. The other research and source
  links were not all checked for this.
- The page dropped a figure: about 4 in 10 interviewed callers had suicidal thoughts
  again by the interview, about two weeks later on average (Gould 2025, 40.8%). A
  figure with no step can read as "calling doesn't last", so the page says "Some people
  had suicidal thoughts again later" and says they can reach out again. Was that right?
- Albaum 2025: the printed result for suicidal thoughts (Hedges g 0.11, 95% CI 0.01 to
  0.21) excludes zero and sits on the side favoring the comparison group, while the
  authors call it not significant. Figure 2A shows the same. The page says a benefit
  has not been shown and that the studies can't settle small effects in either
  direction. Please read the figure, and consider asking the authors.
- Steeg 2025: evidence is weak for one policy area studied mainly in the U.S. The page
  only says strength varies by approach. Should it say more, for a U.S. site?
- Studies of messages alone are mixed, including Witt 2021, Skopp 2023, and Reger 2024
  and 2026. The page gives one such trial (Comtois). Should it say more?
- Evidence moved recently: the caring messages trial was published November 2, 2026,
  and the 988 mortality paper has published letters and a reply. Recheck before release.

**Spanish**

- A fluent Spanish speaker should check the Spanish block on Get Help. Claude wrote
  it from 988's English and Spanish pages.

## How each finding was read

Claude read these, not a person. "Summary tool" means a fetch tool that returns a
summary instead of the raw page, so treat fine detail as second-hand. PubMed records
came through NCBI's official service, because PubMed's web pages show a browser check.
No block or browser check was bypassed.

| Finding | Source | How it was read | Still unconfirmed |
| --- | --- | --- | --- |
| Many callers say the call helped | Gould 2025 | Full text | |
| Studies of crisis lines are limited | Hoffberg 2020 | Full text | |
| Early research since 988 | Patel 2026 | Summary tool, PubMed record | Fine detail |
| Early research since 988 | Letters from Herring and Purtle, authors' reply | PubMed records, journal previews | Purtle and the reply showed only a preview |
| Asking does not raise thoughts | Polihronis 2022 | Abstract; full text blocked | "Pooled 8 randomized trials" is likely right but unconfirmed. The abstract says 8 studies were pooled and, separately, that 8 RCTs gave the strongest evidence |
| Asking does not raise thoughts | McGuire 2026 | Abstract | |
| Safety planning in adults | Nuij 2021 | Full text, University of Glasgow copy; journal page blocked | |
| Safety planning in children and teens | Albaum 2025, corrected 2026 | Full text and Figure 2; correction through summary tool | The question above |
| Follow-up after an attempt | Homan 2026 | Full text | |
| Follow-up after an attempt | Comtois 2026 | Summary tool, PubMed abstract for the main numbers. The journal page showed a browser check on November 6, not bypassed | Recruitment and control-care wording. A person should open it |
| Safer surroundings | Steeg 2025 | Full text, method details not recorded | |
| Treatment | Witt 2021 | Abstract and plain-language summary | |
| Treatment | Sim 2025 | Abstract | |
| Treatment | Cottrell 2026 | Abstract; full report blocked | Comparison groups, and the direction of its suicidal thoughts exception at 6 months |
| News coverage | BMJ 2020 review | Full text, method details not recorded | |
| Stories of coping | Niederkrotenthaler 2022 | Abstract; full text blocked | How soon after the stories outcomes were measured |
| What this page can't tell you | van der Burgt 2024 | Abstract, full text searched for specific points | |

### How the first-version pages' sources were read

Claude read these on November 6, 2026, in a real browser where possible, and one separate AI
session checked about 112 statements against them. Neither is human review. Not read in full: the
AFSP booklets and toolkits, which are image-only flipbooks, so the pages only link to them. 988's
old loss survivors page now answers "not found", so it isn't cited.

## How the pages compare with the research brief

[[RESEARCH-BRIEF]] and the draft pages were written separately. **The page text did
not come from the brief,** and nothing from the brief is on the website. Review them
together and pick one wording for each page. This is Claude's comparison, for the
reviewer.

| Brief section | Closest draft on the pages | To settle |
| --- | --- | --- |
| 1. Understanding suicide | None. Help Someone and Research cover asking about suicide | Add definitions and myths? |
| 2. Causes and risk factors | None | Add this? [[SAFETY]] says not to name a single cause |
| 3. Warning signs | Help Someone, signs and five steps | The drafts follow NIMH's list, and the brief's list differs. Choose one |
| 3. Urgent support | Crisis strip and buttons | Same direction |
| 4. Families, schools, communities | Help Someone: child or teen, look after yourself | The drafts say nothing about grief after a suicide or support for schools afterward. Add this? |
| 5. Evidence-based prevention | Research page | The brief covers levels and WHO's LIVE LIFE. The drafts cover single findings with limits |
| 6. Treatment and recovery | Get Help: support over time, safety plans. Research: treatment | Same direction. The brief calls a safety plan collaborative |
| 7. Statistics | None. The drafts use no population statistics | The brief's numbers need rechecking, and [[SAFETY]] asks for few |
| 8. Technology and website design | Project guidance | Matches [[SAFETY]] rules |
| Pathways A and B | None. These are interactive tools and were not built | Product decision. Pathway B's saved journal conflicts with [[SAFETY]] rule 5 |
| Pathway C | Research and Help Someone | The brief wants short modules and last-reviewed dates |
| Universal requirements | Crisis strip, [[SAFETY]] rules | The brief says to adapt by region, and the site is U.S.-only |

## Questions about the approved ideas

Built at one founder's request on November 6, 2026. Wording is proposed.

- **Right now box (B1).** Get Help now opens with four short steps, and four long
  sections fold behind "Show more". Every line repeats text already on the page.
  Are the steps right, and is anything folded that someone in crisis needs to see
  at once? "Other ways to reach someone" stays open on purpose.
- **Quick exit (B2).** It opens weather.gov and replaces only the current page in the
  tab's history. Back can still reach Stillwater pages opened earlier in that tab. It
  can't clear earlier history, other tabs, or saved offline copies. The About pages say
  so; should the button itself say more? Is the label right, and is weather.gov a good
  neutral destination?
- **Offline copies (A6).** After one visit, the site's pages are saved on the device
  so the numbers load without a signal. On a shared device that is a trace of the
  visit. Is the benefit worth it, and should the privacy note mention it?
- **Spanish (B6).** An AI translated Home, Get Help and Help Someone. A fluent
  reader should check every line, and the reviewer should decide whether the
  wording should avoid masculine-only forms such as "No estás solo" and "estés
  listo". The pages use "tú", like 988's own Spanish pages. Texting steps in
  Spanish are described as possibly different from English, because no one has
  seen them.

## Questions about the second batch

- **Myths and facts (D1),** at the top of Research. Each heading states the fact,
  and the myth comes second, because repeating a myth as a headline can make it
  stick. Is that the right format? Is "Most 988 calls don't involve emergency
  services" helpful, or could it read as a promise?
- **Wallet card and poster (D2).** The printed text comes only from the [[SAFETY]]
  table. Is the selection right (988, Spanish, veterans, The Trevor Project, Deaf
  and hard of hearing, 911)? Should the card name Stillwater at all?
- **For Teens (D3).** Built before ages are decided. Every paragraph repeats text
  from Get Help or Help Someone. What should a teen read first? What if no adult
  feels safe? A lawyer should look at the privacy wording for minors.
- **Long sentences (C4).** `python3 tools/check_readability.py` lists 56 sentences
  over 25 words. Most explain when 988 may involve emergency services. Can they be
  shortened without losing accuracy?

## Questions about the first-version additions

Built on November 6, 2026, at one founder's request, on branch `site/first-version-build`.
The other founder hasn't agreed yet. Wording is proposed.

- **Not sure what you're feeling? (B3).** The page has no typing, saving, or scores: a person
  taps to open short notes on five feelings. The heading and opening come from Pathway A in
  the brief. Pathway B's journal was not built. 988 and 911 come first on the page. Is a
  reflection page right for someone in crisis at all? Should "Numb or empty" send people to
  988 this directly? The page avoids NIMH's diagnostic definitions, and keeps only its advice
  to talk to a provider if a low mood doesn't go away. Is that right?
- **After a loss (B4).** "It's not your fault" is a heading. TAPS says it, and the CDC says
  suicide has no single cause, but someone may feel the site can't know their situation. Is the
  wording right? The list of feelings is AFSP's, including relief and thoughts of suicide.
  Should it say more about thoughts of suicide after a loss? The trauma paragraph sits inside a
  fold on purpose, with no details of any death. Is that right? The page lists outside groups
  that Stillwater hasn't vetted, and AFSP and SAVE say they don't vet groups either. Someone with
  lived experience of loss should read this page.
- **Save 988 to contacts (A5).** A contact on a shared phone can be seen by others, and the page
  says so. Should the button appear on the teen page?
- **About and privacy.** It says plainly that nobody at Stillwater watches the site and there is
  no way to send a message. A lawyer should read this page too.
- **Quick exit limits.** Testing showed that Back can still reach earlier Stillwater pages in the
  same tab, because only the current page is replaced. The About pages now say so. An earlier note
  said Back doesn't return to Stillwater, which was only true when one page had been opened.
- **For Teens, from an independent AI check.** "Its rules don't set a minimum age" rests on
  finding no age limit in 988's terms and privacy policy, not on 988 saying so. "It is separate
  from The Trevor Project" has no source on the page; [[SAFETY]] explains where it comes from.
  Telling a teen to expect a school counselor to tell a parent is accurate, but could deter them.
  Should it say why, and that 988 stays available?
- **Spanish Research page.** It was translated before the English version was reviewed, at a
  founder's request, so that the Spanish pages are complete for review. If the English changes,
  the Spanish must change too.

## Human-only checklist

- [ ] Founders decide what the public site shows until review. See [[DECISIONS]].
- [ ] Find a qualified suicide prevention reviewer, and if possible someone with
      lived experience and someone who works with young people.
- [ ] Tap-test every phone and text link on a real iPhone and Android phone. Stop at
      the dial or compose screen and cancel. Never complete a call or text. Note
      whether the text links open with a blank message.
- [ ] Test with VoiceOver and TalkBack, large text settings, and a slow connection.
- [ ] Read each provider page in [[SAFETY]] and fill in "Person confirmed".
- [ ] Open the sources marked unconfirmed in the table above, and the Comtois journal
      page, in an ordinary browser.
- [ ] Ask a lawyer: who is the publisher, what disclaimers are needed, minors and
      under-13 privacy, and whether the host's IP logging matters.
- [ ] Check the name Stillwater against existing organizations and trademarks before
      buying a domain. Ask the reviewer how the name and the lone tree photo read to
      someone in distress.

## What was left out on purpose

Accounts, forms, tracking, AI counseling, risk scoring, and specific coping
exercises. No official source lists coping exercises for a suicidal crisis, and
general self-care lists should not become crisis instructions without review.

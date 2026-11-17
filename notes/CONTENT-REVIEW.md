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

## ⚠️ Important, first for attention: idea E1

One founder asked that this come first, November 9, 2026.

- **Location alerts in the phone app.** One founder asked about an alert when someone is at a
  place known for suicide. Claude recorded it in [[IDEAS]] and suggested, instead of a built-in
  list of places, an opt-in safety-plan feature where the person picks their own places (E1). Is
  either version safe and helpful? What should the notification say, if anything, and what does
  the research show?
  See [[IDEAS]], at the top, for the idea and Claude's concerns about a built-in list of places.

## Page status

| Page | Content | Source list | Review |
| --- | --- | --- | --- |
| Home (`index.html`) | Links out, role wording | [[SAFETY]] | Not reviewed |
| Get Help (`get-help/`) | Draft | On the page | Not reviewed |
| Help Someone (`help-someone/`) | Draft | On the page | Not reviewed |
| Research (`research/`) | Draft | On the page. Each finding names its source. Three papers have no link on purpose, and the myths section links to other Tidelight pages | Not reviewed |
| Page not found (`404.html`) | Crisis options and links | [[SAFETY]] | Not reviewed |
| Spanish home (`es/`) | AI translation of Home | [[SAFETY]] | Not reviewed; no fluent reader yet |
| Spanish Get Help (`es/obtener-ayuda/`) | AI translation, Spanish options first | Source list on the page, mostly in English | Not reviewed; no fluent reader yet |
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
| Daily check-in (`check-in/`) | Draft, from a founder's spec. Questions, suggestions, and prompts written by Claude | None; general well-being ideas, not health claims | Not reviewed |
| Spanish Daily check-in (`es/registro-diario/`) | AI translation | None | Not reviewed; no fluent reader yet |
| The app's redesign: check-in prompts, streak messages, meditation scripts, onboarding, settings (`app/src/text/redesign.en.html`) | Draft, from one founder's build spec (`app/BUILD-SPEC.md`). Written by Claude | None; general well-being wording, not health claims | Not reviewed. Every new screen says "Draft for review" |
| Spanish app redesign (`app/src/text/redesign.es.json`, which makes `redesign.es.html`) | AI translation | None | Not reviewed; no fluent reader yet |

Every draft page says so on screen. Remove those notes only after review.

## Review records

The publish step (`tools/launch_gate.py`) and `tools/check_site.py` read this section. Only the licensed
clinician's and the fluent Spanish reader's results go here, one line per section of the packets'
sign-off tables. Each line looks exactly like this example, dash included, on a line of its own:
`- Get Help: licensed clinical social worker, 2026-12-01, approved, a1b2c3d4e5f6`

The four parts, separated by commas:

1. **The section's name**, exactly as the packet's sign-off table prints it, such as `Get Help`,
   `Text on every page (Part 1)`, `Español en Get Help` or `Página no encontrada`.
2. **The reviewer's role**, never their name. For English sections, only a licensed mental health
   professional counts: licensed clinical social worker (LCSW), licensed professional counselor (LPC),
   licensed mental health counselor (LMHC), licensed marriage and family therapist (LMFT), psychologist,
   psychiatrist, psychiatric nurse practitioner, licensed therapist, or licensed counselor. A role that also
   says legal, counsel (as in a lawyer), physical, occupational, speech, school, volunteer, non-clinical, or
   AI doesn't count. For Spanish sections, only a fluent or native Spanish reader counts, such as "fluent
   Spanish reader", "native Spanish speaker", "hablante nativa de español" or "persona hispanohablante".
   AI, machine translation, or translation software never counts.
3. **The date** as YYYY-MM-DD. A date after today doesn't count, and stops publishing until it's fixed.
4. **The result, then the fingerprint.** Only `approved`, or `approved with changes, changes made`, lets the
   site publish. Any other result, such as `not for the website`, keeps that section from publishing. Copy the
   fingerprint from beside the section in the sign-off table.

**Spanish lines on the English pages.** Some English pages have lines in Spanish, such as "Leer en español"
and the Spanish part of Get Help. They have sections of their own in Part 3 of the Spanish packet, so only a
fluent Spanish reader approves them, like any Spanish section. `Español en cada página en inglés` holds the
Spanish in the parts every English page shares, such as the links to Spanish. `Español en Get Help`,
`Español en After a loss`, `Español en Wallet card and poster` and `Página no encontrada` hold each page's
own Spanish lines. The tools find Spanish by its `lang="es"` mark, so mark every Spanish line that way.
`tools/check_site.py` fails if an English page has text marked Spanish that no section holds, even a few words
in an English sentence. It also fails on English-page text that looks Spanish but has no mark, by letters such
as ñ or é, or words such as "al 988". Spanish with none of those and no mark isn't found. And it fails on any
visible text, in either language, that sits outside the parts the packets number, such as a sentence in a
div, because no reviewer would see it.

**What the fingerprint means.** It's a 12-character code made from the section's text, as the packet shows
it. When any word of that section changes, its fingerprint changes. An approval only counts while its
fingerprint matches the text on the website now. So after a change, even a small one such as a corrected
crisis number, the old approval stops counting and publishing stops. To fix that, rebuild the packets with
`python3 tools/make_review_packet.py`, show the reviewer what changed, and add a new line with the new date
and the new fingerprint. Keep the old line as history. `python3 tools/launch_gate.py` says which sections
don't match.

**Which line counts.** For each section, only lines by the right kind of reviewer are read, and of those
the newest decides. If two are on the same date, a result that isn't an approval wins. A line by anyone else
is left out entirely, so it can't approve a section or cancel a clinician's rejection.

**A line the tools can't read stops every publish,** even with `PUBLISH_UNREVIEWED`, because
`tools/check_site.py` fails on it. Run `python3 tools/check_site.py` after adding lines.

Never add personal contact details. Update the list on the About pages at the same time: a section shows
"Pending" until a line for it exists, and "Approved" (or similar) only once its newest line approves its
current text. Otherwise it shows "Changes needed" or "Not approved" (in Spanish, "Cambios pedidos" or
"No aprobada"). A page's Spanish result covers its Spanish page and the page's own Spanish lines, if it
has any. So Get Help's shows "Approved" only once `Obtener ayuda` and `Español en Get Help` are both approved.

- No review has been recorded.

## Other reviews

The publish step never reads this section. Record here the results of every other review in
[[LAUNCH-CHECKLIST]] section 2: someone with lived experience of a suicide loss, someone who works with young
people, a lawyer, and a Deaf reviewer or Deaf-led organization. Use the same form as above, without a
fingerprint if you like. A founder decides what to do with each result before launch.

- No other review has been recorded.

## What each control does

"Link format only" means nobody has tapped it on a phone. The phone test for all of
these: tap, stop at the dial or compose screen, and cancel.

| Control | Where | Goes to | Provider | Checked | Needs a person |
| --- | --- | --- | --- | --- | --- |
| Call 988 | Crisis strip, buttons, closing banner, Help Someone urgent note | `tel:988` | 988 Lifeline | Link format only | Phone test |
| Text 988 | Crisis strip, buttons, closing banner, Help Someone urgent note | `sms:988` | 988 Lifeline | Link format only | Phone test |
| Call 911 | Crisis strip, Get Help, For Teens, Not sure, After a loss, Help Someone urgent note, and their Spanish twins | `tel:911` | Local 911 | Link format only | Phone test. Decide whether it should be a link at all |
| Chat Online | Buttons, closing banner | chat.988lifeline.org | 988 Lifeline | Page opens; form not submitted | Open on a phone |
| Text 988 / Chat with 988 (Enviar AYUDA al 988 / Chatear en español) | Deaf or hard of hearing card on Get Help, For Teens, and their Spanish twins | `sms:988`, chat.988lifeline.org | 988 Lifeline | Link format only | Phone test, a Deaf-led reviewer |
| Deaf or hard of hearing / Personas sordas o con dificultades auditivas | Under the crisis buttons on every page | The Deaf card on Get Help | Tidelight | Tested in browser | A Deaf-led reviewer: is the wording right? |
| Go to the feelings / Ir a los sentimientos | Not sure | The list of feelings on the same page | Tidelight | Tested in browser | Reviewer |
| Print poster and wallet cards / Imprimir el cartel y las tarjetas | Wallet card | The phone's or computer's print screen | Tidelight | Print view tested in browser | Print one on a real printer |
| Ayuda en español | Every English page | Spanish block on Get Help | Tidelight | Tested in browser | Spanish reviewer |
| Llamar al 988 y marcar 2 | Get Help, Spanish block; Spanish Get Help | `tel:988` | 988 Lifeline | Link format only | Phone test, Spanish reviewer |
| Enviar AYUDA al 988 | Get Help, Spanish block | `sms:988`, message blank | 988 Lifeline | Link format only | Phone test, Spanish reviewer |
| Chatear en español | Get Help, Spanish block | chat.988lifeline.org/?lang=es | 988 Lifeline | Page opens in Spanish; form not submitted | Spanish reviewer |
| 988lifeline.org | Fallback line | 988lifeline.org | 988 Lifeline | Page opens | None |
| Confidentiality statement | Get Help | 988's page | 988 Lifeline | Page opens | None |
| 988 options for Deaf and hard of hearing people | Get Help | 988's page | 988 Lifeline | Page opens | Deaf reviewer or Deaf-led organization |
| Call 988 (other languages) | Get Help | `tel:988` | 988 Lifeline | Link format only | Phone test |
| Call 988, then press 1 | Get Help | `tel:988` | Veterans Crisis Line | Link format only | Phone test |
| Text 838255 | Get Help | `sms:838255` | Veterans Crisis Line | Link format only | Phone test |
| Veterans Crisis Line chat | Get Help | VCL chat page | Veterans Crisis Line | Page opens | None |
| Call 988, then press 3 | Get Help, For Teens, and their Spanish twins | `tel:988` | 988 LGBTQ+ youth service | Link format only | Phone test. Confirm the option with 988 |
| Text PRIDE to 988 | Get Help, For Teens, and their Spanish twins | `sms:988`, message blank | 988 LGBTQ+ youth service | Link format only | Phone test. Confirm the option with 988 |
| Call 1-866-488-7386 | Get Help, For Teens, and their Spanish twins | `tel:+18664887386` | The Trevor Project | Link format only | Phone test |
| Call 1-800-959-8277 | After a loss and its Spanish twin | `tel:+18009598277` | TAPS, for people who lost someone who served in the military | Link format only | Phone test, reviewer: is it right to list it? |
| Text START to 678-678 | Get Help, For Teens, and their Spanish twins | `sms:678678`, message blank | The Trevor Project | Link format only | Phone test |
| Trevor Project chat and TTY | Get Help | Trevor's help page | The Trevor Project | Page opens | None |
| Text HOME to 741741 | Get Help, For Teens, and their Spanish twins | `sms:741741`, message blank | Crisis Text Line | Link format only | Phone test |
| Crisis Text Line website | Get Help | crisistextline.org | Crisis Text Line | Page opens | None |
| 1-800-662-4357 | Get Help | `tel:+18006624357` | SAMHSA | Link format only | Phone test |
| 1-800-487-4889 (TTY) | Get Help | `tel:+18004874889` | SAMHSA | Link format only | Phone test |
| FindTreatment.gov | Get Help | findtreatment.gov | SAMHSA | Page opens | None |
| A form (PDF) | Get Help | Stanley-Brown safety plan PDF | Its developers | File loads | See the question on permission |
| How this works on different platforms | Help Someone | 988's social media page | 988 Lifeline | Page opens | None |
| Our web host logs visitors' IP addresses | Home | Privacy section of the About page | Tidelight | Tested in browser | Lawyer question |
| GitHub says it logs and stores visitors' IP addresses | Every footer | GitHub's documentation | GitHub | Page opens | Lawyer question |
| Get Support Now | Header | Crisis options on the same page. On Home it rings the three buttons already on screen; on other pages it jumps to them | Tidelight | Tested in browser | Founders: is the label right? |
| Quick exit / Salida rápida | Every page. In the pinned strip on phones and tablets, bottom right on desktops | https://www.weather.gov/ | Tidelight | Tested in browser: the page goes blank at once, and Back skips the page that was left. Back can still reach earlier Tidelight pages, and that page too after a link within it | Reviewer: label, destination, placement, and what it can't hide |
| Save 988 to your contacts / Guarda el 988 en tus contactos | Get Help, For Teens, Wallet card, About, and their Spanish twins | `assets/988-lifeline.vcf`, `assets/988-linea-es.vcf` | Tidelight | File checked. Not tried on a phone | Save on a real iPhone and Android phone |
| Llamar al 988, marca 2 para español / Texto al 988, escribe AYUDA / Chatear en línea / Llama al 988 / envía AYUDA al 988 / llama al 911 | Crisis strip and buttons on every Spanish page, and inside sentences on some | `tel:988`, `sms:988`, `tel:911`, chat.988lifeline.org/?lang=es | 988 Lifeline; local 911 | Link format only | Phone test; fluent reader |
| Llamar al 988 (otros idiomas) / Llamar al 988 y marcar 1 / Texto al 838255 / Chat de la Línea de Crisis para Veteranos / Llamar al 1-800-662-4357 / 1-800-487-4889 (TTY) / Llamar al 911 | Spanish Get Help | `tel:988`, `sms:838255`, `veteranscrisisline.net/es/como-ayudamos/chat/`, `tel:+18006624357`, `tel:+18004874889`, `tel:911` | 988 Lifeline; Veterans Crisis Line; SAMHSA; local 911 | Link format only | Phone test; fluent reader |
| Llamar al 988 y marcar 3 / Enviar PRIDE al 988 / Llamar al 1-866-488-7386 / Enviar START al 678-678 / Enviar HOME al 741741 / Llama al 911 | Spanish Get Help and Spanish For Teens | `tel:988`, `sms:988`, `tel:+18664887386`, `sms:678678`, `sms:741741`, `tel:911` | 988 LGBTQ+ youth service; The Trevor Project; Crisis Text Line; local 911 | Link format only | Phone test; fluent reader. Confirm the 988 option with 988 |
| Menu | Header, phones and tablets | Opens the page list | Tidelight | Tested in browser | Real phone with a screen reader |
| Five homepage cards | Home | Get Help, Help Someone, Research, Not sure, After a loss | Tidelight | Tested in browser | None |
| Show sources / Ver fuentes / Mostrar fuentes | Get Help, Help Someone, For Teens, Not sure, After a loss, About, and their Spanish twins | Opens the source list | Tidelight | Tested in browser | None |

Text and chat with a crisis service start with automated steps. Texting asks you
to accept terms and answer a few questions. The Get Help page says chat asks for a zip
code, whether you are having thoughts of suicide, and how upset you feel. A later check
could not confirm those details, because the chat page showed a security check. A person
needs to open it.

## Questions for the qualified reviewer

Wording is proposed. Nothing here is clinical advice.

**Crisis wording on every page**

- "Need help now?" replaced "In crisis?", and "Not sure what you need?" replaced
  "Not in crisis?", so a distressed visitor is not asked to judge their own risk.
  Are these better?
- Should 911 be a tap-to-call link in the pinned strip? Phones ask before calling,
  but an accidental tap is possible, and some people fear a police response.
- A proposal: on a short screen, such as a phone on its side, including with larger text, the pinned
  strip shortens to one row: "Call 988 · Text 988 · Call 911" ("Llama al 988 y marca 2 · Envía
  AYUDA al 988 · Llama al 911"). It drops "Need help now?" and "In immediate danger,", so nothing
  on screen says when 911 is the right call. Screen readers still hear "Call 911, emergency
  services". Is that acceptable where space is short? See [[DECISIONS]].
- The header's "Suicide prevention & support" tagline and "Get Support Now" button
  both come from the supplied design. Both read as if Tidelight provides support, and
  the button doesn't say who does. Claude's suggestion: "Find suicide prevention
  support" and "Call or text 988".
- The text links open a blank message (`sms:741741`, `sms:678678`, and `sms:988` for
  AYUDA and PRIDE). For START, AYUDA, and PRIDE, a person in distress has to remember the
  word, and the label on the button is all that reminds them. That isn't so for 741741:
  Crisis Text Line says the first message can say anything, and that a word like HOME helps
  it know how you found it. Its own website buttons fill in a word with a link that has a
  body (`sms:741741?&body=HOME`). Is a blank message acceptable, and should these links
  fill in the word too?
- Is the privacy wording right? The homepage says "Tidelight has no sign-ups, forms,
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
  apart. See [[SAFETY]]. The Advocate reported on October 1, 2026 that HHS was asked whether
  counselors would recognize transgender and nonbinary young people's identities and use
  their chosen names and pronouns. It says HHS did not answer directly, and the 988 pages
  read don't say. What, if anything, should this card say for those young people? Which
  service should come first on Get Help? For Teens lists The Trevor Project first. A person
  should read the article and ask 988. The Trevor Project's October 1, 2026 statement says a
  June 9, 2026 letter to Congress confirmed the restart and noted the service must comply with
  what The Trevor Project calls an anti-transgender executive order. The letter itself was not
  read, and no 988 or SAMHSA page read says what this means for callers. Ask 988 or SAMHSA.
- Is the description of a safety plan suitable for someone making one alone? The
  developers present it as made with a clinician, and evidence for teens using one
  alone is thin. See the Research page.
- The Stanley-Brown developers require written permission to reword their form or
  put it into a website. The page describes safety plans in general and links to
  their PDF. Is that enough? Should the project ask them?
- The page now has a short paragraph on shared devices and phone bills, and a Quick exit
  button. Is that enough?

**Under 18**

- What should minors be told about confidentiality? The page says conversations
  are confidential with limits. It tells them to expect a school counselor to tell a
  parent or guardian, because the American School Counselor Association calls that
  "non-negotiable", even at 18. The exception is when the student says a parent's or
  guardian's abuse or neglect is the reason, when the counselor must contact child
  protective services. Could this wording
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
  not SAMHSA's. Is the order right, and should that phrase stay? "If it is safe" or "if you
  can do it safely" appears in three more sentences on this page, and on For Teens and the
  Spanish pages, so please make one decision for all of them. The national pages Claude read
  don't describe calling 988 together, so the page no longer tells people to. At least one
  state health department's 988 FAQ does: Nebraska's
  (https://dhhs.ne.gov/Pages/988-Frequently-Asked-Questions.aspx). It suggests offering to sit
  with the person while they call, text, or chat, if they are open to it. The same FAQ gives a
  veterans menu option that differs from the national press 1, so it isn't a source for
  numbers. Should the page offer this?
- No page says what to do if someone has already tried to end their life or has already hurt
  themselves. SAMHSA's FAQ lists an attempt in progress first among reasons to call 911, and
  the VA toolkit says 911 or the nearest emergency room. Should step 3 add a plain line for
  this, and should the site mention the emergency room at all?
- The page gives one trigger two thresholds. The general list says to stay and call 911, or
  call or text 988, when someone says they are going to end their life. The young person's
  paragraph, here and on For Teens, says to "call 911 if it's an emergency", which asks a
  young person to judge. That wording tracks NIMH and SAMHSA, and "treat it as an emergency"
  would go further than any source read. CDC's page on helping a friend has no such condition.
  One possible wording: "call 911, or call or text 988, and get an adult". Which should young
  people get?
- For a worrying post, the page offers 911 and the site's safety team. 911 needs a location,
  and a reader often won't know where the person is. No source read says what to do then.
  Should it mention calling or texting 988 for advice, or telling a trusted adult?
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
- Some sources listed on this page name specific items. A separate AI keyword check of all 13
  sources, which can miss things and did not cover images, found mentions in six: the VA caregiver
  toolkit most of all, then NIMH's FAQ, 988's Help Someone Else page, the American Academy of Child
  and Adolescent Psychiatry, the school psychologists' page, and SAMHSA's 988 FAQ. Get
  Help and Not sure also link NIMH's FAQ, and the page relies on it for treatment and safety plan
  claims. Should each stay linked, sit behind a note, or be replaced? Removing one could remove
  the support for a claim, so please decide link by link.
- The school psychologists' page calls suicide the leading cause of death among school-age
  youth, and two other sources here say second-leading, for different age ranges. The site
  repeats none of these figures and nobody has checked them against CDC data. Don't quote one
  without checking.
- For a young person whose friend told them by text or online, the page says to keep
  talking if you can while you get an adult, or call or text 988. That wording is
  Claude's, because the sources don't cover it. Is it right?

**Research**

- Are the findings fair? Each has a "What it can't show" line. Please check every
  number against its source.
- Is it right to include the study on news coverage of celebrity deaths? It is
  worded without figures and says it does not apply to talking with someone.
- Three papers are cited without links because they name methods. Should they be linked?
  Open these knowing that: Steeg 2025,
  https://pmc.ncbi.nlm.nih.gov/articles/PMC12699607/, the BMJ 2020 review,
  https://pmc.ncbi.nlm.nih.gov/articles/PMC7190013/, and Witt 2021,
  https://pmc.ncbi.nlm.nih.gov/articles/PMC8094743/, whose full text names and ranks methods.
  The pages no longer say why they aren't linked, because that line told readers where
  method details are. Is a citation with no link and no reason clear enough? The other research and source
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
- A commentary published with the caring messages trial (PMID 42970295, read only through
  the summary tool) raises low power and a scale validated in younger people, and calls it
  premature to conclude that the messages don't work. Should the limit line say so?
- Witt 2021 gives higher certainty ratings to two other therapies, each resting on one or
  two trials, and the authors call for more study. The page names only cognitive behavioral
  therapy, whose effect wasn't seen at the end of treatment. Should it say more?
- The myth "Effective help exists, and recovery is possible" links to a section that calls
  the evidence uncertain. That section's heading and limit line explain why, but is the
  link's wording enough of a bridge?
- A large trial published October 28, 2026 (PMID 42946687) compared calls and two-way texts
  after a suicidal crisis, with 723 teens and 797 adults, on top of usual care, with no group
  that went without this follow-up. It isn't on the page, and nothing on the page is wrong
  because of it. Should it be added at the recheck?
- A letter and an authors' reply exist on the adult safety planning review (PMID 35354503).
  Nobody has read them, because the journal blocked the check. A person should open them.
- Gould 2025 was funded through a SAMHSA grant by way of a Vibrant contract, one author is
  affiliated with Vibrant, callers were paid $50 for the interview, and the authors declare
  no conflicts. Should the limit line say so, for a study of a service this site recommends?

**Spanish**

- A fluent Spanish speaker should check the Spanish block on Get Help. Claude wrote
  it from 988's English and Spanish pages.
- 988's undated Spanish FAQs say its LGBTQ+ youth service and TTY aren't available in
  Spanish. The Spanish pages now say so, and give the Spanish route. 988's Spanish Deaf page
  still gives relay or 711 for TTY. Ask 988 which holds, and whether the FAQs are current.

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
| Follow-up after an attempt | Comtois 2026 | PubMed abstract for the main numbers. Journal page through the summary tool on November 6. In a real browser it showed a browser check, not bypassed | Recruitment and control-care wording are second-hand. A person should open it |
| Safer surroundings | Steeg 2025 | Full text, method details not recorded | |
| Treatment | Witt 2021 | Abstract and plain-language summary. An audit later opened the full text, which names methods, so the citation has no link | |
| Treatment | Sim 2025 | Abstract | |
| Treatment | Cottrell 2026 | Abstract; full report blocked | The direction of its suicidal thoughts exception at 6 months |
| News coverage | BMJ 2020 review | Full text, method details not recorded | |
| Stories of coping | Niederkrotenthaler 2022 | Full text, University of Melbourne repository copy; journal page blocked | |
| What this page can't tell you | van der Burgt 2024 | Abstract, full text searched for specific points | |

### How the first-version pages' sources were read

Claude read these on November 6, 2026, in a real browser where possible, and one separate AI
session checked about 112 statements against them. Neither is human review. Not read line by line: the
AFSP booklets and toolkits. They are flipbooks that show page images, but each page's text is
stored alongside, and each also has a PDF, so they can be searched. A word search on November 6,
2026, with reading around each hit, found sample sentences naming a method in Children, Teens and
Suicide Loss (flipbook pages 9, 10, and 19), its Spanish version (pages 9, 10, 11, and 20), and the
Spanish guide (page 19). Surviving a Suicide Loss had no method wording, and the workplace toolkit
only advises against sharing the method. The reviewer and someone with lived experience of loss
should decide whether these links stay. No person has read them line by line. 988's
old loss survivors page now answers "not found", so it isn't cited.

## How the pages compare with the research brief

The first drafts of Get Help, Help Someone, and Research were written separately from
[[RESEARCH-BRIEF]]. The Not sure page uses it directly: its heading, opening paragraph, and
prompt are Pathway A's, word for word. [[IDEAS]] also names section 1 as the start of the
Research myths and section 4 as the reason for After a loss, but their wording comes from
other sources. All of this is draft, and the tracker shows no section approved. Review them
together and pick one wording for each page. This is Claude's comparison, for the reviewer.

| Brief section | Closest draft on the pages | To settle |
| --- | --- | --- |
| 1. Understanding suicide | Research: Myths and facts. Help Someone and Research also cover asking about suicide | Add definitions? |
| 2. Causes and risk factors | None | Add this? [[SAFETY]] says not to name a single cause |
| 3. Warning signs | Help Someone, signs and five steps | The drafts follow NIMH's list, and the brief's list differs. Choose one |
| 3. Urgent support | Crisis strip and buttons | Same direction |
| 4. Families, schools, communities | After a loss. Help Someone: child or teen, look after yourself | Compare the wording |
| 5. Evidence-based prevention | Research page | The brief covers levels and WHO's LIVE LIFE. The drafts cover single findings with limits |
| 6. Treatment and recovery | Get Help: support over time, safety plans. Research: treatment | Same direction. The brief calls a safety plan collaborative |
| 7. Statistics | None. The drafts use no population statistics | The brief's numbers need rechecking, and [[SAFETY]] asks for few |
| 8. Technology and website design | Project guidance | Matches [[SAFETY]] rules |
| Pathways A and B | Pathway A: Not sure page, tap to open, nothing to type. Pathway B: not built | Is a reflection page right at all? Pathway B's saved journal conflicts with [[SAFETY]] rule 5 |
| Pathway C | Research and Help Someone | The brief wants short modules and last-reviewed dates |
| Universal requirements | Crisis strip, [[SAFETY]] rules | The brief says to adapt by region, and the site is U.S.-only |

## Questions about the approved ideas

Built at one founder's request on November 6, 2026. Wording is proposed.

- **Right now box (B1).** Get Help has four short steps in a box below the crisis buttons
  and their notes, with call, text, and chat links in the first step, and four long sections
  fold behind "Show more". On a phone the box is on the second screen. Every line repeats text
  already on the page.
  Are the steps right, and is anything folded that someone in crisis needs to see
  at once? "Other ways to reach someone" stays open on purpose.
- **Quick exit (B2).** It opens weather.gov and replaces only the current page in the
  tab's history. Back can still reach Tidelight pages opened earlier in that tab. It
  can't clear earlier history, other tabs, or saved offline copies. The About pages say
  so; should the button itself say more? Is the label right, and is weather.gov a good
  neutral destination?
- **Offline copies (A6).** After one visit, the site's pages are saved on the device
  so the numbers load without a signal. On a shared device that is a trace of the
  visit. Is the benefit worth it, and is what the About pages and footers say about it enough?
- **Spanish (B6).** An AI translated all nine pages in `es/`. A fluent
  reader should check every line, and the reviewer should decide whether the
  wording should avoid masculine-only forms such as "No estás solo" and "estés
  listo". The pages use "tú". 988's own Spanish pages mostly use "usted", with "tú" in
  buttons and headings. Texting steps in
  Spanish are described as possibly different from English, because no one has
  seen them.

## Questions about the second batch

- **Myths and facts (D1),** at the top of Research. Each heading states the fact,
  and the myth comes second, because repeating a myth as a headline can make it
  stick. Is that the right format? Is "Most 988 calls don't involve emergency
  services" helpful, or could it read as a promise?
- **Wallet card and poster (D2).** The printed text comes only from the [[SAFETY]]
  table. Is the selection right? The card lists 988, Spanish, veterans, and 911.
  The poster also lists The Trevor Project and Deaf and hard of hearing. Should the card name Tidelight at all? The Spanish poster has
  a SAMHSA referral line where the English poster has The Trevor Project, so it has no line
  for LGBTQ+ young people. That line also leaves out SAMHSA's instruction to select the
  option to speak with a national representative for Spanish. Which lines should the Spanish
  poster carry? A fluent reader should weigh in too.
- **For Teens (D3).** Built before ages are decided. Most of the text repeats Get Help or
  Help Someone, and the packet marks repeats. The opening and the Quick exit line are new.
  What should a teen read first? What if no adult
  feels safe? A lawyer should look at the privacy wording for minors.
- **Long sentences (C4).** `python3 tools/check_readability.py` lists sentences over 25
  words. Many are research summaries, and the longest explain when 988 may involve emergency
  services. [[SHORTER-SENTENCES]] has
  proposed rewrites. The pages haven't changed. Can they be shortened without losing accuracy?

## Questions about the first-version additions

Built on November 6, 2026, at one founder's request, on branch `site/first-version-build`.
The other founder hasn't agreed yet. Wording is proposed.

- **Not sure what you're feeling? (B3).** The page has no typing, saving, or scores: a person
  taps to open short notes on five feelings. The heading and opening come from Pathway A in
  the brief. Pathway B's journal was not built. 988 and 911 come first on the page. Is a
  reflection page right for someone in crisis at all? Should "Numb or empty" send people to
  988 this directly? The page leaves out NIMH's full diagnostic definitions. It keeps NIMH's
  advice on when to talk to a provider, and names a lasting "empty" mood as a sign of
  depression. Is that right?
- **After a loss (B4).** "It's not your fault" is a heading. TAPS says it, and the CDC says
  suicide has no single cause, but someone may feel the site can't know their situation. Is the
  wording right? The list of feelings is AFSP's, including relief and thoughts of suicide.
  Should it say more about thoughts of suicide after a loss? The trauma paragraph sits inside a
  fold on purpose, with no details of any death. Is that right? The page lists outside groups
  that Tidelight hasn't vetted, and AFSP and SAVE say they don't vet groups either. Someone with
  lived experience of loss should read this page.
- **Save 988 to contacts (A5).** A contact on a shared phone can be seen by others, and the page
  says so. Should the button appear on the teen page?
- **About and privacy.** It says plainly that nobody at Tidelight watches the site and there is
  no way to send a message. A lawyer should read this page too.
- **Quick exit limits.** Testing showed that Back can still reach earlier Tidelight pages in the
  same tab, because only the current page is replaced. The About pages now say so. An earlier note
  said Back doesn't return to Tidelight, which was only true when one page had been opened.
- **For Teens, from an independent AI check.** "Its rules don't set a minimum age" rests on
  988's Terms of Service (August 2026), which say you don't have to give your age or date of
  birth, and its nondiscrimination statement, which says it doesn't exclude anyone because of
  age. SAMHSA's FAQ says anyone can use 988. "It is separate
  from The Trevor Project" now cites The Trevor Project's October 1, 2026 statement. That statement
  also gives a national figure on LGBTQ+ youth and suicide. Should the pages link to it?
  Telling a teen to expect a school counselor to tell a parent is accurate, but could deter them.
  Should it say why, and that 988 stays available?
- **Spanish Research page.** It was translated before the English version was reviewed, at a
  founder's request, so that the Spanish pages are complete for review. If the English changes,
  the Spanish must change too.

## Questions from the November 7 audit

AI auditors raised these on November 7, 2026, after checking the pages against their sources; a
qualified reviewer decides each one, and nothing here has been reviewed.

### Every page

- Should the pinned strip say what to do if you aren't sure it's an emergency, such as "Not sure
  which? Call or text 988", or give a short, non-graphic example of when to call 911 from SAMHSA's
  988 FAQ? 988's terms ask people facing an immediate threat to their safety to call 911 first. No
  source read says a 988 counselor helps a caller decide.
- Is the cue on the Text 988 buttons right, or too much text? They now say "Send any message" (988's
  texting FAQ), with a line below: reply NEXT to accept 988's terms, answer a brief survey, and wait
  for a counselor (988's What to Expect page).
- Is Quick exit's spoken label right? Screen readers hear "Quick exit: leave this site now for the
  weather.gov home page" before the 988 links, which could sound like the site telling someone to
  go. Would "Quick exit, goes to weather.gov" ("Salida rápida, va a weather.gov") be better, with
  the crisis line heard first? Its x often means close, so someone could tap it to clear it away and
  leave at once. Should the x stay?
- Should a future web address avoid the word suicide? Today's address has it, as do some page
  titles. Google says a school, employer, or internet provider that manages a network may see
  activity even in Incognito (https://support.google.com/chrome/answer/9845881). Browser history can
  also sync to other devices, which no page mentions: should About and For Teens? A lawyer should
  weigh in for minors.

### Home

- Is "See what research shows about what helps, and what is still being studied" better than
  "...about suicide prevention, and where the evidence is still thin" (same in Spanish)? The
  Framework for Successful Messaging asks messages to say prevention works, and warns that problems
  without solutions can make suicide seem unsolvable.

### Get Help

- Should the bill sentence move after the figure that fewer than 2 in 100 calls involve emergency
  services? "What it costs" says, from 988's terms, that you may get a bill, such as for an
  ambulance, if a counselor contacts emergency services. Someone worried about money could read that
  as a reason not to call. The question above covers police and consent, not cost.
- Should "What stays private" add, with attribution, that 988 doesn't have your precise location
  (SAMHSA's 988 FAQ), and can't trace people the way 911 can (988's tracing FAQ)? Today it says that
  in rare emergencies counselors must give your number or IP address to 911, which may ask for your
  exact location. This matters to someone afraid of being found. Both languages.
- Could "For children and teens, a review of brief programs built around a safety plan found no
  clear benefit" read to a teen as "plans don't work for me"? A possible wording: "For children and
  teens there is less research, and one review of brief programs couldn't show a clear benefit. A
  pediatrician or therapist can help you make a plan, and you can call or text 988 any time."
- Is the Deaf or hard of hearing card's emergency advice right, and enough? It now says texting 911
  only works in some places and, if it isn't available, to use a TTY or relay service. Its FCC
  source (https://www.fcc.gov/consumers/guides/what-you-need-know-about-text-911) refused AI reads,
  so a person needs to open it.
- For someone with immigration fears, should Get Help say, in both languages, that you don't have to
  give your citizenship status (988's Spanish terms, August 2026) or speak English (988's Spanish
  services page), without promising what police or 911 will do?
- Should Get Help and For Teens repeat, near the buttons, About's draft note that in Chrome on
  Android an Incognito tab asks "Leave Incognito mode?" before a Call or Text link opens, and Stay
  cancels it? A teen on a shared phone may well use Incognito.
- Should NIMH's Child and Adolescent Mental Health page stay linked from Get Help, For Teens, and
  their Spanish twins? Its list of signs names two self-harm behaviors. Please decide it with the
  link-by-link question above. The Trevor Project's Get Help page is also unchecked.

### Help Someone

- Should "the responsibility doesn't have to be yours alone" become "...and you don't have to do
  this alone"? "Responsibility" could suggest that keeping someone alive is partly the helper's job,
  and add guilt after a death. 988's page says only to take care of yourself and reach out for
  support.
- Should the warning signs, and the top of Research, tell someone bereaved by suicide that this
  isn't a list of what they should have seen, and point to After a loss? They may check the signs
  against their memories. AFSP's Surviving a Suicide Loss guide says many people hide their
  distress, and that even with signs not every suicide can be prevented. Also for someone with lived
  experience.
- Should two sources behind the parent advice stay linked? The American Academy of Child and
  Adolescent Psychiatry says suicide may look like a solution to some teens, and the American
  Academy of Pediatrics gives survey percentages and names two groups as especially at risk. Both
  may conflict with safe messaging guidance, and removing either means rechecking advice. A person
  should check this AI word search.
- Should Help Someone say 988 can sometimes talk with the helper and the person they're worried
  about at the same time? 988's Spanish services page says so; its English pages don't, so ask 988.

### For Teens

- Should the page say things can get better, for example "Hard feelings can change, and support can
  help", and on which source? The school psychologists' page says to reassure young people they
  won't feel like this forever. SAVE's one-pager says coping skills, support, and treatment work for
  most people who have thoughts of suicide. Should it also point to a doctor or counselor?
- Could the paragraph on monitored school devices, and software that alerts staff, scare a teen off
  reaching out? It suggests a device at a friend's house or a library. The software sentence rests
  on RAND's abstract and an unlisted vendor page.
- Should For Teens, and Get Help's under-18 section, give the context Get Help's main section gives?
  They say 988 may share information with 911, police, or a mobile crisis team without permission,
  but no more. Candidates: fewer than 2 in 100 calls involve emergency services (988, all calls);
  most people are helped without 911 (SAMHSA); saying you feel suicidal doesn't necessarily bring
  emergency services (Crisis Text Line); you can ask 988 not to share your details. Keep Get Help's
  "not a guarantee" caution.
- Should For Teens say whether each service will tell parents, not only The Trevor Project? 988's
  FAQ says it can't give out call records without a court order. Crisis Text Line says what you
  share stays private except in rare cases when a life is at risk, and describes required abuse
  reports. Is "If emergency services or a child welfare agency get involved, your parents may find
  out that way", an inference, right to include?
- Should the school counselor paragraph tell a teen who is scared of what could happen at home to
  say so to the counselor first? The model school policy the page cites (2019) says staff should
  talk with the student about that risk and may delay contact, and that child protection officials
  replace parents if abuse or neglect is suspected. Rules differ by state. For a clinician and a
  lawyer.
- Should For Teens tell LGBTQ+ students that, under the same policy (printed page 16), a school
  telling a parent should keep their sexual orientation or gender identity confidential, especially
  if they haven't told the parent, and share only the suicide risk? It is a 2019 template, and state
  laws weren't checked. For a clinician and a lawyer.
- Adding to the question above on a teen with no safe adult: should For Teens add "If home doesn't
  feel safe"? Candidates, unconfirmed: the Childhelp National Child Abuse Hotline
  (childhelphotline.org), not a reporting line, which may still have to share in some cases, such as
  a caller who says they intend to act on suicidal thoughts; and the National Runaway Safeline
  (1800runaway.org), which explains when it must report. A person must confirm each number first.
- If that section is added, should it also say "If you can't talk out loud, text or chat" and "You
  can talk without giving your name or where you live"? A lawyer should say what can be said about
  teens getting ongoing care without a parent, which differs by state.
- Adding to the question above on Save 988 and the teen page: is the warning enough? Should it say
  you don't have to save 988 if someone might check your phone, that deleting a call or text may not
  remove every trace, and that a friend's phone or a library computer may be safer? The Trevor
  Project's terms suggest not saving its number; Crisis Text Line's FAQ says to save its number.

### Not sure

- Should the Overwhelmed, Sad, and Anxious notes each end with a 988 line, such as "If this feels
  like too much, or you're having thoughts of suicide, you can call or text 988 any time"? Only Numb
  or empty and Unsure mention 988 now, though NIMH's matching pages each give it. Should Sad's
  "these feelings usually pass" be completed or dropped? NIMH goes on to say depression is
  different. Both languages.
- Should the page add "Angry or irritable"? NIMH's Depression page says children and adolescents may
  be irritable rather than sad.
- Is the "Go to the feelings" link, which jumps past the crisis box and draft notice, right for
  someone who may be overwhelmed, or should nothing skip the crisis box?

### After a loss

- Should "It's not your fault" add three points from AFSP's Surviving a Suicide Loss guide (printed
  pages 5-7): even when there are signs, not every suicide can be prevented; you may never know
  exactly why; and you don't need all the answers to begin to heal? Every page header reads "Suicide
  prevention & support".
- Which source should back "suicide doesn't have just one cause"? The CDC page cited is about
  prevention and gives costs per suicide. TAPS says suicide "is rarely the result of a singular
  issue", but explains it as wanting to end pain and seeing no other way, and the Framework warns
  against simple explanations. Should the TAPS link stay?
- Should a short "The first few days" section near the top say what AFSP's practical page covers
  (police, medical examiner, viewing the body, funeral, obituary, media), so a reader can prepare?
  It names no method but is frank about the body, and today it is a clause far down the page. Would
  a short notice help?
- If the AFSP booklet links stay (asked above), should a notice come first, such as "This booklet
  gives example wording for telling a child how someone died. Some of it is hard to read."? SAVE's
  Safe Messaging Guidelines recommend one. Should the label say it is for parents and caregivers,
  and the English link move away from the teen paragraph below it? Spanish booklets too.
- Should the children's section say what to do if a child or teen talks about wanting to die, or to
  be with the person who died? AFSP's Children, Teens and Suicide Loss (printed pages 25-26, 35-37)
  says such talk is common but should be taken seriously, to ask directly, and to consult a mental
  health professional, and that a family member's suicide may raise a child's risk. SAVE adds
  calling 988. Link Help Someone too?
- How firmly should the page say to tell a child the truth? It says AFSP leaves it to parents, as
  AFSP's web page does, but AFSP's booklet (printed page 5) and guide (page 16) say to tell them as
  soon as possible, so they hear it from you first.
- Should the page add "With a teen, listen to their worries first"? AFSP's booklet (printed page 32)
  says to acknowledge a teen's fears and guilt first, because teens may withdraw if reassured before
  they feel understood.
- Should a clinician word a short paragraph on prolonged grief? AFSP's guide (printed pages 10-11)
  says some people stay stuck at the same intensity for six months or more, that specific treatments
  exist, and suggests an evaluation for depression, PTSD, or prolonged grief.
- Should a clinician add when to get medical care right away? AFSP's list of physical symptoms
  includes chest pain and breathing problems, which the page leaves out before calling these
  reactions normal.

### Research

- Could Witt 2021, cited without a link, link to its PubMed record
  (https://pubmed.ncbi.nlm.nih.gov/33884617/), whose abstract defines self-harm only in general
  terms? The Albaum and Comtois full-text links showed a browser check, so nobody has checked them
  for method wording.
- Should the caring messages trial stop saying "709 American Indian and Alaska Native adults at high
  suicide risk"? It is the only English text tying a named group to suicide risk, which the
  Framework warns against. A possible start: "A separate 2026 trial in American Indian and Alaska
  Native communities included 709 adults who..." (PubMed 42970293). But 85.2% had ever made an
  attempt, so "who had thoughts of suicide" is too narrow. A reader from these communities should
  see it.
- Should the news coverage finding say what safe messaging guidance does? The review's authors call
  responsible reporting guidelines the best population-wide response, and SAVE's one-pager says
  stories with resources and hope can lead people to seek help. Before linking any guidance: page 2
  of SAVE's one-pager names items, and one Framework tips page names a location.
- Should Gould 2025 add its most hopeful result: "About 7 in 10 said the call did a lot to stop them
  from ending their life, and about 1 in 5 said it did a little"? The abstract's 88.1% who said it
  stopped them combines 69.6% and 18.5%, and 10.1% said it didn't apply. The same limits apply.

### Wallet card

- Should the page warn that a printed card can be seen by others, so keep it somewhere you feel
  safe? It names the "988 Suicide & Crisis Lifeline" ("Línea 988 de Prevención del Suicidio y
  Crisis" in Spanish). Is naming suicide on a printed card right, in both languages?
- Should the printed sheet carry a draft mark and a checked-on date? It has neither, and the page
  suggests handing cards out at a school while its draft note says not to yet.

### About

- For the lawyer: should About say visitors' IP addresses also reach Fastly? Live GitHub Pages
  responses pass through it, and GitHub's subprocessor list names it for content delivery
  (https://docs.github.com/en/site-policy/privacy-policies/github-subprocessors). Nobody here has
  read what Fastly logs or keeps.
- Should About add that offline copies are saved again each time a page opens with a connection, so
  someone looking in the browser's storage could tell from their dates which pages were opened, and
  roughly when?

### Spanish pages

- Should the Spanish pages name a reply word for texting 988, as English names NEXT? 988's Spanish
  What to Expect page gives «siguiente»; its Spanish services page describes no terms step. Ask 988
  which applies to AYUDA.
- Should the Spanish pages say anything about 911 in Spanish, and from which current source? None
  says whether a caller can ask for Spanish, or whether a Spanish text will be understood. The FCC's
  English and Spanish text-to-911 pages don't say.
- Should Spanish Get Help link the Stanley-Brown developers' Spanish safety plan form (February
  2025), instead of or beside the English one? Its step 6 is reported to be more specific.
- Should the pages say "la 988"? They do in many headings and buttons. 988's Spanish site says "la
  Línea 988" or "Línea 988" for the service, and "el 988" or "al 988" for the number.
- Adding to the question above on masculine-only forms: what one approach should every page take?
  Spanish Help Someone mixes "la persona" in the five steps, masculine forms ("atrapado") in the
  signs, and "lo" in the child section.
- Is tú right on every page, including those for parents and bereaved adults? This corrects the note
  above: 988's Spanish pages mostly use usted, with tú in buttons and headings. NIMH's use usted.
- On Spanish After a loss, which reads better: AFSP's English name with the gloss "es una fundación
  estadounidense para la prevención del suicidio", as AFSP's Spanish material mostly does, or
  "Fundación Estadounidense para la Prevención del Suicidio"? Please also check the sentence on
  pressing "Translate" on the Healing Conversations form.
- Should After a loss link AFSP's Spanish site (es.afsp.org) for Spanish readers? It has Healing
  Conversations ("Conversaciones que Sanan") and a support group page mostly in Spanish, but reads
  machine-translated and calls the person who died "alguien suicida". Do the form and volunteer work
  in Spanish?

---

## Questions about the Daily check-in

Built November 9, 2026, at one founder's request, from their written spec. Wording is proposed.

- **Typing on a suicide prevention site.** The Not sure page was built with nothing to type, on
  purpose. The check-in asks people to write about what's been difficult. Is that right for
  someone who may be in crisis? Nothing is sent or saved, and the page says so three times.
- **The feelings list** (Hopeful, Calm, Okay, Unsure, Overwhelmed, Sad, Anxious, Disconnected,
  Exhausted) and **the needs list**. Is anything missing, or worded in a way that could hurt?
  Should there be an option such as "I'm thinking about suicide"? Today the 988 and 911 line is
  always on the needs step, and choosing "Someone to talk to" puts 988 first in the results.
- **The 30 suggestions and ideas** in the "See every suggestion" and "See every idea" lists.
  They are general well-being ideas, never treatment, and picked only from the feeling and needs
  chosen, never from what was written. Are any unsafe for someone in distress, such as suggesting
  time alone? Should "Revisit something you used to enjoy" or "Look through old photos" (left
  out) be avoided after a loss?
- **Your journey** has no streaks, scores, or missed-day marks. Is the calendar helpful, or could
  an empty month feel like failure?
- **Minors.** The journal and reflections invite private writing from people who may be under 18.
  What should the page say about shared or school devices?
- **Spanish.** The feelings are phrased as states ("Con tristeza") to avoid gendered forms. A
  fluent reader should check them.
- **A support circle (idea E2).** One founder asked about a circle where a person, and people they
  invite such as parents, a doctor, or a therapist, can see shared check-ins and reflections, with
  each entry private unless the person shares it. Is it safe and helpful? What should circle
  members be told to do if a shared entry worries them? Should parents of minors be able to join,
  and who controls a minor's circle? See [[IDEAS]].
- **Help shaped by age (idea E3).** One founder chose every age, with date of birth required at
  sign-up and help chosen by age group. Which age groups, and which kinds of help, have good
  evidence for each? What should a child under 13 see? Should crisis options ever depend on age?
  See [[IDEAS]].
- **Share this reflection (idea E2a).** One founder chose a button in the phone app that sends one
  reflection to a person the user picks, through the phone's share sheet. What should the app say
  next to it, so people know who will see it and that it isn't a way to get urgent help?
  See [[IDEAS]].

## Questions about the phone app

Built November 9, 2026, at one founder's request, on branch `app/first-build`. Every word it adds is in
`app/src/text/en.html` and `app/src/text/es.html`. Not in the review packets yet.

- **Age setup.** Is asking a date of birth before the check-in right, given that 988 and 911 stay on
  screen and the question says help doesn't need it? What should a child under 13 see?
- **For your age.** Five short cards, one per age group, drawn from [[AGE-STRATEGIES]]. Are they safe
  and accurate? The teen card says to make a plan with a trusted adult, because a 2025 review found
  no benefit from safety plans alone for teens.
- **Accuracy and accommodations.** The age question now says an accurate date matters, and a
  check step shows the age group and its accommodations before anything is kept. Is the accuracy
  wording right, and could it pressure a child to lie, or to give up? Are the five "top of Today"
  boxes in `app/src/text/` safe and accurate, especially the one for the grown-up with a child?
- **Sharing.** Is the notice before sharing clear enough about who sees it and that it isn't a way to
  get urgent help?
- **Saving.** Is the privacy wording about the phone, its backups, and Delete everything accurate and
  plain? A lawyer should read it too.
- **Reminders and shared check-ins** (added November 9, 2026, branch `app/daily-check-ins`). Four
  optional reminders, morning, midday, after school or work, and before bed, each off until turned
  on. The notification says only "A moment to check in, if you'd like." Is that safe on a lock
  screen? Are four invitations a day too many for someone in distress, or is choosing them enough?
  Your journey lists today's check-ins ("Morning, 8:05: feeling: tired. Needs: rest.") and offers
  Share today's check-ins and Share the last 7 days, through the same notice as Share this
  reflection. Is that the right level of detail to send a parent or a clinician? Should a minor be
  pointed toward sharing with a guardian, or only allowed to? See [[CHECK-IN-SCHEDULE]].
- **Location alerts, worked out** (November 9, 2026). [[LOCATION-ALERT]] lays out how an alert to
  chosen people could work when someone stays near a hard place. Please read its questions at the
  end before any of it is built.
- **"Places that are hard for me" (E1), built as a draft** (November 10, 2026, branch
  `app/hard-places-and-reminders`, never run on a real phone). Every word is in `app/src/text/en.html`
  and `es.html`, in the blocks named `places` and `place-alert`, plus two iOS permission sentences in
  `app/ios/App/App/Info.plist`. Please look at:
  - **The alert's wording.** The lock screen says only "Tidelight. Your plan is here." unless the
    person chooses to show the place and time. The screen inside says "You've been at [name] for
    [N] minutes. You set this up for yourself. Would you like to send your message, with where you
    are, to [names]?" with "Send my message now", "I'm okay", 988 and 911. Is "You set this up for
    yourself" the right reminder of consent? Is the title too direct?
  - **The wait times**: 10, 20, or 30 minutes, 20 to start. Too short, too long, or should there be
    no wait, as E1 first proposed?
  - **The countdown**: after the person opens the alert, the message opens in Messages after 30
    seconds unless they tap "I'm okay". Should it always wait for a tap instead?
  - **The default message** to the chosen people: "I'm having a hard time right now and I'd like you
    to call me. I set this up in Tidelight to send when I stay at a place that's hard for me. Here's
    where I am:" followed by a map link. The person can change it.
  - **Minors**: a parent or guardian is the obvious person to choose, and the obvious problem when home
    isn't safe. Does a minor's choice of people, or a guardian adding a place, need consent rules?
    A lawyer should also advise on "always" location permission and location data for minors.
  - **No built-in list of places**, as [[LOCATION-ALERT]] recommends. One founder had asked for one;
    the handoff explains why it wasn't built. Do you agree?

## Questions about the app's redesign

Built November 11, 2026, from one founder's build spec, on branch `app/redesign-dev` (a draft pull request into
`app/first-build`). The other founder hasn't seen the spec. Every new word is in `app/src/text/redesign.en.html`
and, in Spanish, `app/src/text/redesign.es.json`; `notes/review-packet/tidelight-app-words.html` lists each line with
a number. The same founder added six safety rules that override the spec; they are in `app/CLAUDE.md`. Please look at
these first:

- **Streaks, for people at risk.** The app counts days in a row with check-ins, with "freezes" that cover a missed
  day. Is any streak safe for someone in a low period, or does it add pressure and a sense of failure when it ends?
  Streaks can be turned off in Settings. Should they start off, or not exist?
- **When a streak ends.** The next time Home opens, a card says "New wave, new start 🌊 Your best is still {best}
  days." Missed days are called "rest days". Is that gentle enough, or should nothing be said at all? The card never
  shows on a day with a very low check-in.
- **Milestones** at 3, 7, 14, 30, 50, 100, 200, and 365 days show "{days} days. One wave at a time 🌊" with a short
  burst of drops. Is celebrating a count right in this app?
- **The five mood faces.** The quick check-in asks for one of five faces: Very low, Low, Okay, Good, Great. Is a
  five-point mood pick appropriate here, and are those the right words? The mood is stored on the phone as a number
  from 1 to 5. It is never shown as a score or a chart.
- **What a very low mood does.** Moods 1 and 2 replace the thanks line with "That sounds really hard. You don't have
  to carry it alone. You can talk to someone right now." and Call 988, Text 988, and Call 911. Is 1 and 2 the right
  line, and are those the right words? Could it feel like an alarm to someone who is often at 2?
- **The Daily check-in's heavy feelings.** Overwhelmed, sad, anxious, disconnected, and exhausted now show "That
  sounds heavy. You don't have to carry it alone." with 988 and 911 at the top of the results. Which feelings should?
- **The two styles.** Calm asks "Take a moment… how are you feeling right now?" and ends "Thank you for checking in
  with yourself 💙". Straightforward asks "How are you?" and ends "Logged. Nice." Is "Logged. Nice." acceptable after
  an ordinary check-in? (It is never shown after a very low one.)
- **Tags.** Tired, Stressed, Happy, Focused, Anxious, Grateful. Are these the right six, and is anything missing
  that a person at risk would look for and not find?
- **A Sleep meditation with no completion screen.** It dims and stays dark, as sleep apps do. The crisis strip stays
  lit above it. Is ending in darkness and silence right for someone alone at night?
- **The meditation scripts** (`script.*` lines): a body scan, long silences, "There is nothing left to do today."
  Could any line read badly to someone thinking about suicide? Meditation can bring distress up for some people;
  the scripts say "you can stop at any time". Is that enough?
- **The "wellness app like Calm" framing.** The spec asks for the feel of Calm, Headspace, and Finch. Does that
  framing fit a suicide prevention app, and does it risk making the app look like care it isn't? Every new screen
  says "Draft for review", and the 988 panel is on every screen.
- **Asking for a name.** Onboarding asks "What should we call you?" (optional, kept on the phone, shown in the
  greeting). Should an app like this ask at all, and what should a child be told?
- **The Friends tab.** It holds My circle and a card to share check-ins. Is "Friends" the right word for people who
  may be a parent, a doctor, or a therapist?
- **Reminders.** "A moment to check in, if you'd like." (Calm) and "Time for your check-in." (Straightforward), up
  to five a day, off until turned on. They stop by themselves if the app isn't opened for two weeks. Is fading out
  right, or should a long silence do something else?
- **Meditation suggestions from location.** Near the person's own saved home spot, the app suggests a longer
  session. One spot, kept on the phone, read only while the app is open. A lawyer should read the wording in
  Settings, in onboarding, and the iPhone permission sentence in `app/ios/App/App/Info.plist`.
- **The safety frame.** The crisis strip, Exit, Get Support Now, the Spanish link, both review notices, the privacy
  notice, Support, and the 988 panel are on every screen in full. During a meditation the strip stays on screen and
  the rest is below the stage. Is that enough during a session?

## Questions about the app's visual redesign

Built November 11, 2026, from the same founder's design brief (`app/DESIGN-BRIEF.md`), on branch
`app/visual-identity` (a draft pull request into `app/redesign-dev`). A new look only: no feature was added or
removed, and no crisis, consent, privacy, or clinical wording was changed. The other founder hasn't seen the brief.
Three things on screen did change, and they touch the questions above:

- **Streak wording is unchanged (restored November 11, 2026).** A first version of this branch replaced the streak
  card, the streak screen, the milestone card, and the "new start" card with a "days you checked in this month"
  view, which dropped wording you had not yet reviewed. A founder asked for that wording back. Every streak line
  is again exactly as in the questions above ("Your streak", "Now", "Best", "Frozen", "Rest day", the two lines
  that explain what counts and what a freeze does, "New wave, new start", the milestone line, the Settings switch
  "Streaks"). Only the look changed: days are drawn as dots (filled for done, a soft dot with a ring for frozen, a
  dashed ring for a rest day, a double ring for today, never red), a snowflake line icon stands where the emoji
  stood alone, and a milestone no longer sets off a burst of drops. The first three questions above stand as
  written. One more: a new person still sees "0 day streak" on Home. Should a zero be shown?
- **Mood is a tone and a word, not a face.** The five choices keep their words (Very low, Low, Okay, Good, Great).
  Each has a colored square: a slate blue for Very low, a muted violet for Low, a sand yellow for Okay, a soft
  green for Good, a light blue for Great. No red and no green-for-good. Is color beside a mood word helpful, or
  could the darker tones read as a judgment?
- **How a check-in ends.** An ordinary check-in now stays on its last screen: a horizon at full dawn, the same
  thanks line as before, and two buttons, "Breathe for a minute" and "Back to home". It no longer returns to Home
  by itself, and the burst of drops is gone everywhere. After a very low mood none of that shows: the support
  screen has no horizon and no decoration, and a meditation finished later that day ends without the dawn. Is a
  dawn right after an ordinary check-in, or is it still a kind of reward?
- **New short lines** (all marked "Draft for review" with the rest): "Get help" (a Home tile that goes to
  Support), "Breathe for a minute", "Back to home", "{time} left" in the player, and "Learn more". One phrase of
  the page's own heading is highlighted on Home ("everything figured out"). Crisis words are never highlighted.
  A check on November 12 compared every string with the version before this branch: no reviewed or
  pending-review wording is changed, moved, or gone ([[LAUNCH-READINESS]], "PR 26 wording check"). A test now fails
  if any of it changes.
- **Sixteen emoji that stood alone as pictures are now line icons or dots.** 🌊, ⚡, 🤫, 🌙, 😮‍💨, 🎯, and 😴 on the
  style, meditation type, and "how do you feel" cards, and ❄️ and ✓ in the streak row and legend. They were hidden
  from screen readers and no word beside them changed. Every emoji inside a sentence is as it was. Did any of
  those pictures carry meaning a person would miss, for example the wave beside "Calm" or the snowflake beside
  the freeze count?
- **"1 minutes in all."** After a one-minute meditation, the completion and History screens read "1 minutes in
  all". It is your wording to change, so it was left. Should it read "1 minute in all"?
  **On `app/pre-review-fixes` (November 14, 2026), at one founder's request, it does:** "1 minute in all", and in
  Spanish "1 minuto en total". The line for every other number is unchanged. Is that right?
- **"Learn more" on Location and Friends. For the reviewer and the lawyer to confirm.** A founder's rule: every
  word about privacy or consent stays in view, always. No word changed.
  - **Always in view, with no tap, in English and Spanish, at every text size:** in "Places that are hard for
    me", the two opening paragraphs (what it does; "This is off until you turn it on…", what stays on the phone,
    nobody is told), the location permission paragraph, and the paragraphs under "People you trust" (their name
    and number stay on this phone; they aren't told), "How long before the phone checks in with you", "What the
    phone shows" (what the notification and lock screen say), and "Your message" (who it goes to and how), and
    all of "Good to know". In "My circle", the opening paragraph, all five points (no accounts; they see only
    what you send; nothing is sent by itself; once sent it can't be taken back; it isn't a way to get urgent
    help, with 988 and 911), and the note about the list kept on this phone.
  - **Folded under "Learn more", because they only say how to do something:** in Places, under "Your places":
    "Add a place by choosing it on a map, or by searching an address. Give it a name only you need to
    understand, and choose how close counts." In My circle: "To share something, tap Share on a check-in, a
    journal entry, or something you kept, then choose 'Send to my circle'."
  - A test fails if anything else is ever folded, or if any paragraph above stops being in view.
  - Is either folded paragraph something a person needs to see before deciding? "Give it a name only you need to
    understand" is partly advice about privacy; should it stay open?
- **The Daily check-in's first question** shows its nine feelings as tiles, two across (one list at the largest
  text). Same nine, same order, same words. Does putting "Hopeful" beside "Calm" and "Overwhelmed" beside "Sad"
  read differently from one long list?
- **The tab bar at the largest text on a small phone** shows icons only; the five names stay for screen readers.
  Are a house, a heart, a lotus, a pin, and two people clear enough without words?
- **The crisis strip changed color, not content.** It, Exit, Get Support Now, and Call 988 in the support panel are
  now dark ink on paper or paper on ink, with no texture and no animation, at a contrast of at least 7 to 1. Same
  words, same places, same size or larger. Please confirm nothing about them reads as quieter than before.
- **Spanish.** The new lines are an AI translation like the rest: "Obtener ayuda",
  "Respirar un minuto", "Volver al inicio", "Quedan {time}", "Más información".

## Questions from the launch readiness work

Found November 12, 2026, while testing every crisis path and safety rule ([[LAUNCH-READINESS]]). No wording was
changed for any of them.

- **"Call 988" and "Call 911" on a notification.** The place alert's notification ("Your plan is here.") has four
  buttons that appear when it is long-pressed, including on the lock screen: "I'm okay", "Send my message",
  "Call 988", "Call 911". A founder's rule says notifications never mention crisis. These two buttons do, and they
  are also quick ways to reach help. Keep them, show them only once the phone is unlocked, or remove them?
- **After Quick exit, the app comes back on the screen the person left.** Before this work it came back blank,
  with no crisis strip, which was a bug. Should it instead come back on Home, so a journal entry or a check-in is
  not the first thing on screen if someone else picks up the phone?
  **On `app/pre-review-fixes` (November 14, 2026), at one founder's request, it now comes back on Home.** A
  check-in or meditation that was under way is not kept. Is Home right, or should the person return to where they were?
- **The crisis strip at the phone's largest text sizes.** The app follows the phone's text size. At the three
  largest accessibility sizes the strip takes half the screen or more, and at the very largest (in Spanish) it
  fills the screen and has to be scrolled to reach "llama al 911". The strip was not changed. Should it use its
  short form ("Call 988 · Text 988 · Call 911", already used when a phone is held sideways) at those sizes?
  **Added November 14, 2026:** or should it keep every word and simply stop growing past a 28-point text size,
  which keeps it to about a third of the screen but shows it smaller than the size the person chose? Pictures
  of all three are in [[LAUNCH-BACKLOG]].
- **Crisis links inside sentences** ("call 988 or text 988 … call 911" in the Hope box, My circle, Places, the
  share notice, the place alert, the age question, and two Daily check-in screens) are the size of the text, about
  19 points tall, and close together. Each of those screens also has the full-size strip. Should those sentences
  become buttons or separate lines?
- **The Spanish 988 panel** ends with a second link to 988's Spanish chat, where the English panel links to
  988lifeline.org. Is that intended?
- **A later check-in on a day that had a very low one** now ends with its thanks line and two choices but no
  dawn. The thin strip of light that grows during the check-in still shows. Is that the right line to draw?

For a fluent Spanish reader (found by comparing the two languages line by line; nothing was changed):

- **Mood words** (quick check-in, keys `mood.1` to `mood.5`): "Very low, Low, Okay, Good, Great" are "Muy mal, Mal,
  Regular, Bien, Muy bien". "Mal" is "bad", which is a judgment that "low" isn't. Is there a better pair, such as
  "Muy bajo de ánimo / Bajo de ánimo"?
- **A streak "freeze"** (Home and Your streak, for example the line "Si falta un día, un congelador ❄️ lo cubre." and the keys `streak.freezeNext`, `streak.freezeFull`) is "congelador", which is
  the kitchen appliance. Would "pausa" or "día protegido" read better? The English question about streaks comes first.
- **"1 días seguidos"** (Home, keys `streak.day` and `streak.days`, which share one Spanish line): with a count of 1, the Spanish reads "1 días seguidos". English
  avoids this ("1 day streak"). It needs a singular form, which is a wording change.
- **"Good evening" and "Good night"** (Home greeting, keys `greet.evening`, `greet.night`) are both "Buenas noches".
  Fine in Spanish, noted so nobody thinks one is missing.
- **The meditation builder's "Right now I'm"** (the first label on "Build your own") is "Ahora mismo siento", followed by the choices
  "Estrés, Ansiedad, Concentración, Energía, Sueño, Solo respirar". The last one doesn't follow from "siento".
- **Feelings as nouns.** Tags and feelings are nouns ("Cansancio", "Estrés", "Alegría") to avoid gendered endings.
  This follows the website's Spanish pages. Does it read naturally on a button?

## Questions about the app's privacy features

Added November 14, 2026, on `app/privacy-package`, at one founder's request: an app lock, removing one
check-in, a copy of your data, a sentence about backups, and a licenses screen. Every new line is
in `app/src/text/` in both languages and is listed as added since the reviewer's snapshot, not as
reviewed. For the licensed reviewer and a lawyer.

- **Should a suicide prevention app have a lock at all?** It keeps a journal and a Hope box private
  on a shared phone. It also puts one step between a person and their own Hope box, people, and
  plan. Crisis help is never behind it: Call 988, Text 988, Call 911, Quick exit, Get Support Now,
  the Support panel, and a place alert all work while the app is locked. Is that the right line?
- **The phone's passcode, or a code of the app's own?** The lock uses the phone's own check, so a
  parent or partner who knows the phone's passcode can open the app, and the screen says so
  ("Someone who knows that passcode can still open the app."). A separate code would be more
  private for a teenager and could be forgotten. Which is safer for this audience?
- **The lock screen's words:** "Tidelight is locked", "Unlock to see what you've saved. Crisis help
  at the top of the screen and Get Support Now work without unlocking.", "Unlock", and "That didn't
  unlock. Try again when you're ready." Are they clear, and is anything missing for someone in a
  hard moment who can't get past the lock?
- **Removing one check-in** says "Removed. The day stays marked on your calendar." The words are
  gone, and the day still counts toward the streak. Is that right, or should removing a very low
  check-in also end that day's "quiet" state? It doesn't today.
- **A copy of your data** makes a plain text file with everything written in the app. The screen
  warns "The file isn't locked. Anyone who gets it can read it, and Tidelight can't take it back."
  Is the warning strong enough for a minor, who may be asked by someone else to make one?
- **Backups.** Settings now says "If this phone's iCloud or Google backup is on, the backup can
  include what Tidelight saves on this phone: check-ins, journal, Hope box, people, places, and
  settings. Tidelight itself receives nothing." The Daily check-in's own notice already said this
  about check-ins. These older lines say "on this phone only" or "never sent anywhere" without
  mentioning a backup, and were left unchanged because reviewed wording is locked: the Hope box
  ("Everything here stays in this app, on this phone. It is never sent anywhere"), Places ("Your
  places and your people stay on this phone"; "on this phone only"), the home spot ("One spot,
  saved on this phone only"), the name ("stays on this phone"), and the quick check-in ("Your
  check-in is saved on this phone"). Should each gain the backup sentence, or is one place enough?
  A lawyer should also confirm what a phone's backup really includes; this was not checked on a phone.
- **The Face ID sentence the phone shows** the first time the lock is used: "Only if you turn on
  "Lock the app": to check it's you before Tidelight shows anything you've saved. The check
  happens on this phone and nothing about it is sent anywhere." It is in English only, like the
  phone's location sentences.

For a fluent Spanish reader: "Bloquear la app", "Tidelight está bloqueada", "Desbloquear", "Quitar",
"Crear una copia de mis datos", "Lugar de casa", and the sentences around them are an unreviewed AI
translation. The license notices are left in English on purpose.

## Questions about the app's next features

Added from November 15, 2026, on `app/next-features`, at one founder's request, one feature at a time. **The other
founder hasn't seen the list.** Every new line is in `app/src/text/` in both languages and is listed as added since
the reviewer's snapshot, not as reviewed. The Spanish is an AI translation.

### My safety plan

A new screen, reached from the Check-in tab and, once something is written in it, from the support screen after a
very low check-in. Six parts, with the names and order the Get Help page already gives, in the first person. The
person types short lines; nothing is suggested and nothing is filled in for them. Please look at:

- **Should the app offer a plan a person writes alone?** The research in [[AGE-STRATEGIES]] is for plans made with
  a clinician, and found no clear benefit for teens from brief programs built around a plan. The screen says "A plan
  helps most when you make it, or go over it, with someone: a doctor, a counselor, or an adult you trust. It does
  not replace professional care." Is that enough, for adults and for minors? Should under-18s see something
  different, or no plan at all?
- **The six names and their one-line hints**, for example "6. Making my space safer: Things I can put out of
  reach, or ask someone to hold for a while, so a hard moment is safer." No method is named anywhere. Is that
  the right way to say it, and should the app say more or less?
- **988 and 911 are built into part 5** as full-size buttons that can't be removed, above the person's own
  professionals. The screen also says "You don't have to work through this list before asking for help." Is the
  order right: should crisis lines come first on the screen instead of fifth?
- **"Open my safety plan" on the support screen** after a very low check-in, under Call 988, Text 988, and Call
  911, and only when the plan has something in it. Is offering the plan there helpful, or does it put a step
  between the person and a call?
- **A person in part 4 or 5 with a phone number gets a "Call {name}" button.** It dials their own contact. Fine?
- **Reasons for living are not a seventh part.** The plan points to the Hope box instead. Should the plan hold them?
- **Sharing the plan** goes through the same notice as every other share. Should the app encourage sharing it
  with the person it was made with, as it does now in one line?
- **A lawyer:** the plan may hold other people's names and phone numbers, and what a person writes about their
  own warning signs. It is stored on the phone, is in the phone's backup, and is in "a copy of my data".

### The crisis strip at the largest text sizes

The app follows the phone's text size. At the top sizes the strip took most of the screen (86% of an iPhone 17's
at the largest), which left almost no room for anything else. Pictures of three options were made on November 14
([[LAUNCH-BACKLOG]]). On November 15 one founder chose the one that keeps every word: **the strip's own words stop
growing at 28 points** (the phone's usual size is 17), and its tap targets at 56. Nothing changes below about
twice the usual text size. The strip now takes about 27% of that screen in English and 32% in Spanish at every
larger size. The short form ("Call 988 · Text 988 · Call 911") was not used, so no crisis wording is left out.

- Is it right for the strip to be smaller than the text size the person chose, when everything else on the
  screen follows it? A person who needs 53-point text reads the strip at 28.
- On the smallest phones (320 points wide) the strip still takes about half the screen in English and two
  thirds in Spanish at those sizes. Is that acceptable, or should those phones get something else?

### "AYUDA" filled in for Spanish texts to 988

988's Spanish instructions are to text the word AYUDA. Until now every Spanish text link opened an empty
message, so a person in distress had to remember the word (asked about earlier in this note, under "The text
links open a blank message"). In the phone app only, a Spanish link that says to text AYUDA now opens the
phone's Messages with 988 as the recipient and AYUDA already typed. Nothing is sent: the person still taps
Send. English links are unchanged, and so is the link that says PRIDE. The public website is unchanged.

- Is filling in the word right, or could a person send it without meaning to start a conversation?
- Should the other keywords the pages mention (PRIDE to 988, and the keywords for other services) be filled in
  the same way, in the app and on the website?
- **Not yet confirmed on a real phone.** In the iPhone Simulator the link opens a new message with AYUDA
  typed, the same screen the plain link opens. Whether 988 shows as the recipient on a real iPhone and a real
  Android phone is a step in `app/TESTING_CHECKLIST.md`. If it fails on either, this must come out before release.

### "What happens when you reach out to 988", inside the app

A new screen that shows the Get Help page's own section of that name, in each language, **word for word**. It
is copied from that page when the app is built, and a test fails if one word differs, so there is nothing new
to review in it: your answers about that section on the website apply here too. It is reached from the
support screen after a very low check-in and from part 5 of the safety plan, both under the crisis buttons,
and it has Call 988, Text 988, and Call 911 at its end.

- The page folds most of the section under "Show more". The app's screen shows all of it, including what 988
  keeps private and when emergency services get involved. Is showing all of it right for someone who has just
  said they are very low, or should the screen lead with "If you call" and "If you text" only?
- Is the support screen the right place to offer it, or does a third choice under Call 988 slow a person down?
- **Back from this screen, and from the safety plan, now returns to the support screen** with Call 988 on it.
  Before, it started a new check-in. Please confirm that is what you would expect.

### Grounding

A new screen with four short exercises, offered on the support screen after a very low check-in (under the
crisis buttons) and on the Check-in tab. **This wording is new and was written by an AI assistant**, unlike
the 988 screen. It asks for nothing and stores nothing. Call 988, Text 988, and Call 911 are at its end. The
four, in full:

- **5, 4, 3, 2, 1.** "Look around you and name, out loud or in your head: 5 things you can see, 4 things you can
  touch, 3 things you can hear, 2 things you can smell, 1 thing you can taste."
- **Something cold.** "Hold something cold, or run cold water over your hands, for about half a minute. Notice
  how it feels."
- **Feet on the floor.** "Press your feet into the floor. Feel the chair or the ground holding you up. Open
  your hands and let your shoulders drop."
- **A slower breath.** "Breathe out for a little longer than you breathe in." with a button to the silent
  one-minute breathing circle the app already has.

Questions:

- Are these four safe and useful for someone who has just said they are very low, including a child or a
  teen? Should any come out, or be worded differently?
- "Something cold" stops at holding something cold or running water over the hands, on purpose. Is that the
  right limit?
- The screen says "These don't replace help from a person." Is that the right line, in the right place?
- Does offering exercises on the support screen risk a person trying them instead of calling?
- Spanish: the screen's name is "Volver al presente" ("come back to the present"), because Spanish has no
  everyday word for "grounding". A fluent reader should choose.

### The Home Screen and Lock Screen widget (iPhone)

A small widget a person can add to their Home Screen or Lock Screen. A tap opens the app at a minute of
breathing or at the safety plan. Because anyone can see a Home Screen, it follows the founder's rule for
notifications: discreet. Its words, all of them, in English and Spanish:

| Where | English | Spanish (AI translation) |
| --- | --- | --- |
| The widget picker's description | A quiet way back into Tidelight. It shows nothing about you. | Una forma discreta de volver a Tidelight. No muestra nada sobre ti. |
| Small widget and Lock Screen | A minute to breathe | Un minuto para respirar |
| Wider widget, first button | Breathe | Respirar |
| Wider widget, second button | My plan | Mi plan |

It also shows the app's name and a small leaf. It shows no mood, check-in, streak, or name, and it can read
nothing the person saved. Questions:

- Is "My plan" discreet enough for a Home Screen that a parent, partner, or classmate may see, or should the
  widget offer only breathing?
- Should a Lock Screen widget exist at all for this app? The app's name is on it.
- Should the widget offer Call 988? It was left off, because a crisis number on a Home Screen is not discreet;
  the app's own screens all have it.

### "Other ways to reach someone", inside the app

A second screen made the same way as the 988 screen: it shows the Get Help page's own section of that name
(Spanish, Deaf or hard of hearing, other languages, the Veterans Crisis Line, LGBTQ+ youth through 988, The
Trevor Project, Crisis Text Line, 911; in Spanish, SAMHSA's Spanish line too), **word for word and link for
link**, copied when the app is built. A test fails if a word or a link differs, so your answers about that
section on the website apply here. It is reached from the support screen after a very low check-in and from
part 5 of the safety plan, both under the crisis buttons.

- Is a list of eight services helpful on the support screen's path, or too much to read in a hard moment?
  Should the app show only the services that fit the person's age group?
- The English page's Spanish block ("En español") now has AYUDA filled in for its text link, like the
  Spanish pages. English links are unchanged.

### What tends to help

A new screen on the Check-in tab. It looks at the last 30 days of the person's own quick check-ins and, for the
days they chose Good or Great, lists what else they recorded on two or more of those days: a tag, a meditation,
a journal entry. For example: "On the 4 days you chose Good or Great, you also recorded: Grateful: 3 of 4 days.
A meditation: 2 of 4 days." It appears only after three such days. It is worked out on the phone each time and
nothing new is stored.

What it deliberately does not do: no score, no chart, no average, no trend; it never counts, lists, or mentions
hard days; and it says "This only counts what you recorded. It can't tell what caused what." Earlier notes say
the mood is "never shown as a score or a chart", and this keeps to that.

- Is showing a person what was there on their better days helpful, or could it read as "you didn't do these
  things, so you felt bad"?
- Is "Good or Great" the right line for a better day? Should "Okay" count?
- Three days and "two or more" are small numbers. Could a pattern from so few days mislead?
- Should this be offered on the support screen after a very low check-in, as a reminder of what has helped? It
  isn't, today.
- The name "What tends to help" promises more than a count can show. Is there a more honest name?

### When the phone can't save

If the phone's storage is full or refuses a write, the app used to lose the check-in, the plan entry, or the
journal entry without a word. It now shows one line, once, at the bottom of the screen above the tabs, never
near the crisis strip: "Tidelight can't save on this phone right now. The phone may be out of space. What you
enter stays on screen until the app closes." with a "Got it" button. A very low check-in still shows support at
once; the line appears as well.

- Is that the right thing to say to someone who has just checked in very low, and in the right place?
- Should it say what to do (free up space on the phone), or is that too much in the moment?

### A last line for the person who receives a shared message

The share notice gains one optional choice, off until ticked and off again every time: "End with what they can
do if they're worried". When ticked, this sentence is added as the last line of what is shared, and of a
message to My circle. The box shows the exact words:

> If you ever think I'm in immediate danger, call 911. You can also call or text 988, the Suicide & Crisis
> Lifeline, about someone you're worried about.

Spanish: "Si alguna vez crees que estoy en peligro inmediato, llama al 911. También puedes llamar o enviar un
mensaje de texto al 988, la Línea de Prevención del Suicidio y Crisis, por alguien que te preocupa."

It is drawn from the Help Someone page ("If you think they are in immediate danger, call 911"; "You can contact
it about someone else, too"). **These words leave the phone and reach someone who did not choose this app**,
so they matter more than most.

- Is this the right thing to tell a friend, a parent, or a classmate, in one line? Should it say "stay with me"
  or "ask me directly", as the Help Someone page does at more length?
- It names the Suicide & Crisis Lifeline in a message that may be about an ordinary day. Could that alarm the
  person receiving it, or expose the sender? Should it be offered only for some things, such as the safety plan?
- Should it be on by default for the safety plan, or never on by default?
- Spanish: it does not tell the receiver to press 2 or to text AYUDA, to keep to one line. Should it?
- A lawyer: this is advice to a third party, sent in the sender's name.

### "Helping someone you're worried about", inside the app

A third screen made the same way as the 988 screen, on the Friends tab: it shows the Help Someone page's own
opening (with its 911 line and its 988 call and text links) and its six sections (warning signs, the five
steps, what helps in the conversation, a child or teen, a post online, looking after yourself), **word for
word and link for link**, copied when the app is built. A test fails if a word or a link differs, so your
answers about that page on the website apply here. Nothing on the screen was written for the app. On the
page, parts of some sections fold under "more"; on this screen everything is open, because the app never
folds words about urgent help.

- The app is mainly for the person who is struggling. Is a screen for the person helping right inside it, on
  the tab where they keep the people they trust? Could reading a list of warning signs about oneself do harm?
- The warning signs include "Making a plan or researching ways to die". The page says it; so does this
  screen. Is that line right for an app that minors use?
- Should the row that opens it sit above "My circle" or below it? It is below.

### A summary for an appointment

A new screen on the Check-in tab. The person chooses how far back (14 or 30 days) and what goes on a short
page: their check-ins (ticked to begin with), their journal entries, their safety plan, and one thing they
want to ask or say. The screen shows every word of the page before anything is shared, and "Share this
summary" hands it to the phone's share sheet as one text file. Nothing ticked or typed is kept, and opening
the screen again starts over. The page lists records as they were recorded: nothing is counted, averaged,
scored, or interpreted.

The page begins: "A summary for my appointment", "Made on {date}, from what I recorded in the Tidelight app
over the last {days} days.", "These are my own notes. They are not a medical record or a diagnosis."

- Is a page like this useful to a clinician, or could a list of self-recorded check-ins mislead one? Should
  it say anything more about what a check-in is?
- Hard days are on the page as recorded, because the person is choosing to show their own record to someone
  treating them. "What tends to help" never shows hard days. Is that difference right?
- Check-ins are ticked to begin with; the journal and the safety plan are not. Should nothing be ticked?
- Beside the button: "The page isn't locked. Anyone who gets it can read it, and Tidelight can't take it
  back. You choose where it goes." Is that enough for a page that may hold a safety plan?
- A minor can make this page and send it to anyone. Should the screen say something about showing it to a
  parent or guardian, or about who it is meant for?
- A lawyer: the line "not a medical record or a diagnosis", and whether a page made for a clinician changes
  what the app is.
- Printing is not promised. On iPhone the share sheet usually offers Print for a text file; that has not
  been seen on a real phone.

### "Your privacy in Tidelight" (for a lawyer first)

A new screen in Settings, under About: a plain description of what the app keeps and where it goes, in eight
short parts (what stays on the phone; what the app doesn't do; when something leaves the phone; calls, texts,
and links; location; who can see it on this phone; your choices; what the page can't tell you). It opens with:
"This is not a privacy policy. It is a plain description of what the app does today, written by an AI
assistant from the app's own code. No lawyer has written or read it. Tidelight does not have a privacy policy
yet." Every word is in view; nothing folds. It was written from [[PRIVACY-INVENTORY]], and a test fails if
the app stores something the screen doesn't cover.

**It does not replace a privacy policy.** A real one is still a launch blocker ([[LAUNCH-BACKLOG]]).

- A lawyer: may an app show a description like this before it has a policy? Does any sentence promise more
  than the founders can keep, for example "Tidelight never receives what you enter, reads it, or analyzes it"
  or "It has no code from another company that contacts anyone"?
- A lawyer: the screen says nothing about children or about a parent's consent, on purpose. What must it say,
  given the app is for adults and minors?
- A lawyer: there is no way to contact anyone about privacy, because the project has no public address yet.
- "Remove the app from your phone. That removes everything it saved on this phone." True on iPhone as far as
  the code can show; not checked on a real phone or on Android.
- The reviewer: does a person in distress need any of this said differently, for example that nobody at
  Tidelight sees what they write, so the app is not a way to ask for help? (The check-in's own privacy note
  says that; this screen does not repeat it.)
- If Apple Health is added (feature 19), this screen must gain a part about it before that ships.

### Shortcuts and Siri (iPhone)

Two shortcuts, the same two places the widget opens: "A minute to breathe" and "My plan" (Spanish: "Un
minuto para respirar", "Mi plan"). They appear in the phone's Shortcuts app and in search, and a person can
say "Breathe with Tidelight" or "Open my plan in Tidelight" to Siri. Each only opens the app there, behind
the app lock if it is on. They read nothing the person saved.

- Their names can be seen by anyone holding the phone, and a Siri phrase is said out loud. They avoid mood,
  crisis, and the word "safety", like the widget. Is "My plan" discreet enough, and is it clear enough to the
  person who needs it?
- Should there be a shortcut at all for the plan, given it is spoken aloud?

### Apple Health (iPhone), a founder's choice to build

A setting, off until turned on: "Add meditations to Apple Health". When on, each finished meditation is added
to the phone's Health app as mindful minutes (when it started, how long it lasted). No check-in, mood, or
word is ever added, and Tidelight asks for no access to read Health. A button removes the entries Tidelight
added, and "Delete everything" removes them too. The setting isn't shown on a phone without Health.

The setting's words: "When this is on, each meditation you finish is added to the Health app on this phone as
mindful minutes: when it started and how long it lasted. Nothing else is added. No check-ins, no moods, and
nothing you write." "Health is Apple's app, not Tidelight's. What is in it can go to your iCloud, and other
apps you have allowed can read it. Tidelight reads nothing from Health." "Turning this off stops new entries.
The ones already added stay in Health until you remove them here or in the Health app. Delete everything, in
Your journey, removes them too."

**This changes what "stays on this phone" means.** Until now, nothing the app recorded went anywhere unless
the person shared it. With this on, a record that the person meditated, with the app's name on it, sits in
Apple's Health store, where it can sync to iCloud and be read by other apps the person allowed. The privacy
screen has a part about it.

- The reviewer: could a record in Health that names this app expose a person, for example to a parent who
  manages a child's phone or sees Health data through Family Sharing? Should minors be offered this at all?
- A lawyer: Apple's rules for apps that use HealthKit (a privacy policy is required; health data may not be
  used for advertising), and whether writing to Health changes the App Store privacy answers in
  [[APP-STORE-PRIVACY-DRAFT]]. The app's purpose string is in `Info.plist` (`NSHealthUpdateUsageDescription`).
- A founder: the app now has one entitlement (`com.apple.developer.healthkit`). A build for a real phone or
  the App Store needs HealthKit turned on for the app's identifier in the developer account. No team or
  signing identity was chosen.
- Mood is deliberately not written to Health (Apple has a "State of Mind" record). Leave it that way?
- The reviewed Delete everything wording doesn't mention Health; the Health setting's own words do. Is that
  enough, or should the Delete everything note say it too? (That note is reviewed wording, so it was not
  changed.)

### The app on an iPad

The app already ran on an iPad. On a wide screen its column sat left of the middle, out of line with the tab
bar; it now sits in the middle at every size, upright and on its side. No word changed.

**A fault found and fixed:** on an iPad on its side (and a large iPad upright) the crisis strip scrolled away
with the page, because the website treats a screen that wide as a desktop. In the app the strip now stays
pinned at every width, as the app's first rule says it must. On an iPad on its
side the website's own layout puts Quick exit in a corner of the screen, over the end of the tab bar; it
covers no tab, and it was left where the website puts it (a safety control is never moved).

- A founder: is a single centered column right for an iPad, or should a later version use the width (two
  columns, a side bar)? That is a design task of its own.

### The Apple Watch app, a founder's choice to build

A small app for Apple Watch (watchOS 10 and later) that comes with the iPhone app. Its first screen has "A
minute to breathe" and, under "Need help now?", the same three lines as the phone app's support screen: "Call
988", "Text 988", and "In immediate danger, call 911" (Spanish: the phone app's own Spanish for each, with
AYUDA filled in for the text). The breathing minute is six silent breaths, four seconds in and six out, with a
soft tap at each turn. It stores nothing, reads nothing from the phone app, has no notifications and no
watch-face complication, and shows only the name "Tidelight" outside itself. It is marked "Draft for review".

**It has been built, and has never run**: this computer has no watch Simulator and there is no watch. Nobody
has seen its screens.

- The reviewer: on a watch, does a tap on "Call 988" dial at once, with no "are you sure"? On an iPhone the
  phone asks first. If the watch does not, a mis-tap on a small screen could place a call to a crisis line.
  This must be tried on a real watch (by reading the screen, not by completing a call) before anyone uses it.
- Does a watch without its own phone plan, away from its iPhone, fail quietly when someone taps "Call 988"?
  What should the app say then?
- "Text 988" on a watch, and AYUDA filled in for Spanish: neither has been seen. The same open question as
  on the phone (the part about AYUDA, above).
- The app's name shows on the watch among the person's other apps. Is that discreet enough on a wrist?
- Should the breathing minute end with anything other than "Done"? It says nothing else, on purpose.
- A founder: a watch app needs its own identifier in the developer account. No team or signing identity
  was chosen.

### Forty features, 4: ten minutes at a time (November 16, 2026)

A new screen on the Check-in tab and on the support step (under the crisis buttons): five small steps, two
minutes each, with a silent clock. It stores nothing. Call 988, Text 988, and Call 911 are on the screen the
whole time. At the end it asks "How are things now?"; "Still hard" shows "You don't have to carry it alone"
and brings Call 988 into view. All of its wording is new, in both languages.

- The reviewer: the opening line is "Strong feelings rise and ease, even when it doesn't feel like they will."
  Is that safe to say to someone in a crisis, and is it true enough to say?
- **Does offering "ten minutes" risk someone waiting instead of calling?** The screen says first: "You don't
  have to finish this before asking for help."
- The five steps: feet on the floor and five things you can see; a longer breath out; a glass of water; move
  to a different spot; think of one person you could be near or message. Are any of these wrong for someone
  at high risk? Step 4 says "outside if you can".
- "A little easier" answers: "You got through ten minutes. You can come back to this any time." Is that too
  close to praise?
- The Spanish is an AI translation ("Diez minutos a la vez") no fluent reader has checked.

### Forty features, 3: reach someone I trust (November 16, 2026)

A new screen on the Friends tab. It holds a short message, ready ahead of time, and lists the people in My
circle; "Message (name)" opens the phone's own messages to that one person with the words filled in. The
person taps Send there. When the circle has someone in it, the support step after a very low check-in shows
"Message someone I trust" under Call 988, Text 988, and Call 911. All of its wording is new, in both languages.

- The reviewer: the screen starts with these words, which the person can change: "I'm having a hard time right
  now. Could you call or text me when you see this?" Is that the right thing to put in someone's mouth? It
  names nothing and asks for a call back, not for rescue.
- Is it safe to offer a message to a friend on the support step at all? The screen says first: "A message is
  not a way to get urgent help. The person may not see it right away."
- Each person also has "Call (name)". It is their own contact, as in the safety plan.
- A teenager's circle "doesn't have to include a parent" (existing wording). Does a ready message to a friend
  need any different wording for under-18s?
- A lawyer: the message goes through the phone's own messages, so the app never has it. The privacy screen
  now lists "your message for a hard moment" among what is kept (only words the person saved).

### Forty features, 2: a letter to myself (November 16, 2026)

A new screen on the Check-in tab. The person writes one letter, on a steadier day, to read on a hard one. The
app writes none of it. Once there is a letter, the support step after a very low check-in shows "Read my
letter" under Call 988, Text 988, Call 911, and the plan. All of its wording is new, in both languages.

- The reviewer: is offering a person their own letter on the support step safe? A letter written on a good day
  could read as a reproach on a bad one ("you promised").
- Should the screen say anything about what to write? It says only "There is no right way to write it."
- The screen says first that nothing has to be read or written before asking for help. Is that the right line?
- The letter can be up to 2,000 characters. It is stored as the person wrote it and is in "a copy of my data".
- The Spanish is an AI translation ("Una carta para mí") no fluent reader has checked.

### Changes from the check on November 16, 2026

- **New Spanish wording nobody fluent has read:** the four reasons the phone gives when it asks for Face ID,
  Apple Health, and location (`app/ios/App/App/es.lproj/InfoPlist.strings`). They are an AI translation of
  the English reasons, using the app's own Spanish names for each setting.
- The reviewer: on a short screen the crisis strip's words may now be set smaller than 28 points, never
  under 18, so the strip does not fill the screen ([[DECISIONS]], November 16). Is 18 points acceptable for
  someone who chose the phone's largest text, given that the alternative hides "call 911" below the fold?
- The reviewer: a check-in reminder now shows as a banner while the app is open. For about five seconds it
  covers "Need help now? Call 988 or text 988". Should reminders stay silent while the app is open instead?
- "Setup complete" now waits for another day when the day has a very low check-in. No wording changed.
- The map for choosing a place now opens below the crisis strip. No wording changed.

## Human-only checklist

- [ ] Founders decide what the public site shows until review. See [[DECISIONS]].
- [ ] Find a qualified suicide prevention reviewer, and if possible someone with
      lived experience and someone who works with young people.
- [ ] Tap-test every phone and text link on a real iPhone and Android phone. Stop at
      the dial or compose screen and cancel. Never complete a call or text. Note
      whether the text links open with a blank message.
- [ ] Test with VoiceOver and TalkBack, large text settings, and a slow connection.
- [ ] Read each provider page in [[SAFETY]] and fill in "Person confirmed".
- [ ] Open chat.988lifeline.org and chat.988lifeline.org/?lang=es on a phone, without
      submitting anything. Compare the form's questions with Get Help, and note whether a
      security check appears first. Repeat this whenever the numbers are rechecked, because
      the automatic check can't read these pages.
- [ ] Open the sources marked unconfirmed in the table above, and the Comtois journal
      page, in an ordinary browser.
- [ ] Ask a lawyer: who is the publisher, what disclaimers are needed, minors and
      under-13 privacy, and whether the host's IP logging matters.
- [ ] Check the name Tidelight against existing organizations and trademarks before
      buying a domain. Ask the reviewer how the name and the lone tree photo read to
      someone in distress.

## What was left out on purpose

Accounts, forms, tracking, AI counseling, risk scoring, and specific coping
exercises. No official source lists coping exercises for a suicidal crisis, and
general self-care lists should not become crisis instructions without review.

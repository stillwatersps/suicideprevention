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
- **Location alerts in the phone app.** One founder asked about an alert when someone is at a
  place known for suicide. Claude recorded it in [[IDEAS]] and suggested, instead of a built-in
  list of places, an opt-in safety-plan feature where the person picks their own places (E1). Is
  either version safe and helpful? What should the notification say, if anything, and what does
  the research show?

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

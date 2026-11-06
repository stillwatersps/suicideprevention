---
aliases: [Content review, Action map]
status: draft for review
---

# Content review and action map

[[00 START HERE|Back to Start Here]]

What the website says and does, where each claim comes from, and what still needs
a person. Claude drafted the page text and these notes. **No qualified person has
reviewed them.** Sources and numbers were read by Claude on the provider's or
journal's own page on November 5 and 6, 2026.

## Page status

| Page | Content | Source list | Review |
| --- | --- | --- | --- |
| Home (`index.html`) | Links out, role wording | [[SAFETY]] | Not reviewed |
| Get Help (`get-help/`) | Draft | On the page | Not reviewed |
| Help Someone (`help-someone/`) | Draft | On the page | Not reviewed |
| Research (`research/`) | Draft | One link per finding | Not reviewed |
| Page not found (`404.html`) | Crisis options and links | [[SAFETY]] | Not reviewed |

Every draft page says so on screen. Remove those notes only after review.

## What each control does

| Control | Where | Goes to | Provider | Checked | Needs a person |
| --- | --- | --- | --- | --- | --- |
| Call 988 | Crisis strip, buttons, banner | `tel:988` | 988 Lifeline | Link format only | Phone test, stop at dial screen |
| Text 988 | Crisis strip, buttons, banner | `sms:988` | 988 Lifeline | Link format only | Phone test, stop at compose screen |
| Call 911 | Crisis strip, Get Help, Help Someone | `tel:911` | Local 911 | Link format only | Phone test, stop at dial screen. Decide whether it should be a link at all |
| Chat Online | Buttons, banner | chat.988lifeline.org | 988 Lifeline | Page opens; form not submitted | Open on a phone |
| Chatear en español | Get Help | chat.988lifeline.org/?lang=es | 988 Lifeline | Page opens in Spanish; form not submitted | Spanish reviewer |
| 988lifeline.org | Fallback line | 988lifeline.org | 988 Lifeline | Page opens | None |
| 988 options for Deaf and hard of hearing people | Get Help | 988's page | 988 Lifeline | Page opens | Deaf reviewer or Deaf-led organization |
| Call 988, then press 1 | Get Help | `tel:988` | Veterans Crisis Line | Link format only | Phone test |
| Text 838255 | Get Help | `sms:838255` | Veterans Crisis Line | Link format only | Phone test |
| Veterans Crisis Line chat | Get Help | VCL chat page | Veterans Crisis Line | Page opens | None |
| Call 1-866-488-7386 | Get Help | `tel:+18664887386` | The Trevor Project | Link format only | Phone test |
| Text START to 678-678 | Get Help | `sms:678678` | The Trevor Project | Link format only | Phone test |
| Trevor Project chat and TTY | Get Help | Trevor's help page | The Trevor Project | Page opens | None |
| Text HOME to 741741 | Get Help | `sms:741741` | Crisis Text Line | Link format only | Phone test |
| 1-800-662-4357 | Get Help | `tel:+18006624357` | SAMHSA | Link format only | Phone test |
| Get Support Now | Header | Crisis options on the same page | Stillwater | Tested in browser | Founders: is the label right? |
| Menu | Header, phones and tablets | Opens the page list | Stillwater | Tested in browser | Real phone with a screen reader |
| Three homepage cards | Home | Get Help, Help Someone, Research | Stillwater | Tested in browser | None |

Text and chat with a crisis service start with automated steps. Texting asks you
to accept terms and answer a survey. Chat asks for a zip code, whether you are
having thoughts of suicide, and how upset you feel. The Get Help page says so.

## Questions for the qualified reviewer

Wording is proposed. Nothing here is clinical advice.

**Crisis wording on every page**

- "Need help now?" replaced "In crisis?", and "Not sure what you need?" replaced
  "Not in crisis?", so a distressed visitor is not asked to judge their own risk.
  Are these better?
- Should 911 be a tap-to-call link in the pinned strip? Phones ask before calling,
  but an accidental tap is possible, and some people fear a police response.
- Should the header button keep the design's "Get Support Now"? It does not say who
  provides the support.

**Get Help**

- Is it right to tell people that 988 counselors may contact emergency services,
  with 988's own figure of fewer than 2 in 100 calls? It is honest, but could it
  put someone off calling?
- Is the description of a safety plan suitable for someone making one alone? The
  developers present it as made with a clinician, and evidence for teens using one
  alone is thin. See the Research page.
- The Stanley-Brown developers require written permission to reword their form or
  put it into a website. The page describes safety plans in general and links to
  their PDF. Is that enough? Should the project ask them?
- Should the page add a note about shared devices and phone bills in more detail,
  or a quick-exit button?

**Under 18**

- What should minors be told about confidentiality? The page says conversations
  are confidential with limits, and that school staff may need to tell a parent or
  guardian. The American School Counselor Association treats telling parents as
  essential, except where a parent's abuse or neglect is the concern.
- 988's terms mention insurance statements that could reach a parent when a center
  bills insurance. Should the page say so?
- What should a teen do if no trusted adult is available, or home is not safe?
- A lawyer should look at minors' privacy and the under-13 question.

**Help Someone**

- The urgent note was reworded to follow SAMHSA: call 911 if danger seems imminent,
  stay with them or make sure another caring person is there, and you can also
  call or text 988. Is the order right? No general official page describes calling
  988 together, so the page no longer tells people to.
- The warning signs follow NIMH's 2025 list with no urgent tier, because official
  sources sort urgent signs differently. Is that right?
- Sources differ on when not to leave someone alone. The page follows NIMH: when
  they say they are going to end their life. Is that the right threshold?
- The page keeps safety advice general and names no items. Is it specific enough?

**Research**

- Are the findings fair? Each has a "What it can't show" line. Please check every
  number against its source.
- Is it right to include the study on news coverage of celebrity deaths? It is
  worded without figures and says it does not apply to talking with someone.
- Evidence moved recently: the caring messages trial was published November 2, 2026,
  and the 988 mortality letter has published responses. Recheck before release.

**Spanish**

- A fluent Spanish speaker should check the Spanish block on Get Help. Claude wrote
  it from 988's English and Spanish pages. Spanish pages do not name a key to press;
  the "press 2" comes from English pages.

## Human-only checklist

- [ ] Founders decide what the public site shows until review. See [[DECISIONS]].
- [ ] Find a qualified suicide prevention reviewer, and if possible someone with
      lived experience and someone who works with young people.
- [ ] Tap-test every phone and text link on a real iPhone and Android phone. Stop at
      the dial or compose screen and cancel. Never complete a call or text.
- [ ] Test with VoiceOver and TalkBack, large text settings, and a slow connection.
- [ ] Read each provider page in [[SAFETY]] and fill in "Person confirmed".
- [ ] Ask a lawyer: who is the publisher, what disclaimers are needed, minors and
      under-13 privacy, and whether the host's IP logging matters.
- [ ] Check the name Stillwater against existing organizations and trademarks before
      buying a domain. Ask the reviewer how the name and the lone tree photo read to
      someone in distress.

## What was left out on purpose

Accounts, forms, tracking, AI counseling, risk scoring, and specific coping
exercises. No official source lists coping exercises for a suicidal crisis, and
general self-care lists should not become crisis instructions without review.

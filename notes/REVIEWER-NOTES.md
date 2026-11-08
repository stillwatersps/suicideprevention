---
aliases: [Reviewer notes, Notes for reviewers]
status: drafts for the founders to edit and send
---

# Notes to send each reviewer

[[00 START HERE|Back to Start Here]]

Drafts for the founders to edit before sending. Claude wrote them. Add your own name, what you can offer, and
when you'd like to hear back. Keep names and contact details out of this public project, so write those in the
message itself. Every reviewer should know that the content was drafted by AI and that this project is public.

## Licensed therapist

> We're building Tidelight, a free website to help people in the U.S. find suicide prevention support, for adults
> and young people. It isn't a crisis service. It points people to the 988 Lifeline and others. An AI assistant
> drafted the pages, and no clinician has reviewed them. An early version, with 988 and 911 details and placeholder
> pages, is already public, and the project's files are in a public repository. We don't plan to publish these
> draft pages until someone qualified has reviewed them.
>
> The attached packet has every sentence numbered, with its sources. Each section has a box for your decision, and
> there's a list of questions we'd especially value your view on. Each page ends with what a screen reader reads
> aloud on it that the screen doesn't show, such as the full names of the crisis links, because some visitors hear
> the site rather than see it. Please start with anything that could cause harm.
> We especially need to know whether the "Not sure what you're feeling?" page belongs at all.
>
> Please record your role and the date, not your name or contact details, since the packet may be stored publicly.

Send: `review-packet/tidelight-review-packet.pdf`. If you meet in person, you can also show the draft site using
[[PHONE-TEST]]. For a remote reviewer, the packet is the way to see it, unless both founders agree to a temporary
tunnel.

## Fluent Spanish reader

> We need a fluent reader to check the Spanish pages of a draft suicide prevention website, for people in the U.S. An
> AI assistant translated them, and no fluent person has read them. We need to know whether they're correct and
> natural, whether anything changes the meaning of the English, and whether anything could confuse someone in crisis.
> We also need your view on wording such as "No estás solo", which uses a masculine form. The English pages also
> have a few lines in Spanish, such as the Spanish part of Get Help. They're in the packet too, in Part 3. Each page
> ends with what a screen reader reads aloud that the screen doesn't show, and Part 5 has questions written for
> you in Spanish, each with its English version for us. An AI wrote those questions too, so tell us if one reads
> badly.
>
> Please don't call or text any crisis line to check it. The attached packet numbers each sentence. Medical or
> crisis translation experience would help. If you notice something that seems clinically wrong, please tell us.
> The project's files are in a public repository, so please don't write anything personal in what you send back.

Send: `review-packet/tidelight-spanish-review-packet.pdf`. The content is about suicide, so give them the choice
to say no, with no reason needed.

## Someone with lived experience of a suicide loss

> We've drafted a page for people who have lost someone to suicide, using guidance from suicide prevention
> organizations. Nobody with lived experience has read it. You can say no, stop at any time, and you don't need to tell
> us anything about your own life. Would anything here hurt to read? Is anything missing that would have helped?
> An AI assistant drafted this, and the project's files are in a public repository, so please don't write anything
> personal in what you send back.

Send: the "After a loss" pages from the packet. Choose someone whose loss isn't recent, and offer support, such as 988,
in the message. A clinician may be able to advise you on how to ask. Don't record anything personal in this project.

## Someone who works with young people

> We've drafted a page for teens, and it covers reaching out on their own, trusted adults, and what stays private. We
> need to know whether it's accurate and would feel safe to a 14-year-old, including one with no safe adult at home.
> An AI assistant drafted this, and the project's files are in a public repository, so please don't write anything
> personal in what you send back.

Send: the For Teens pages from the packet, and the "If you're under 18" part of Get Help. The questions are in
[[CONTENT-REVIEW]].

## Lawyer

> We're planning a free, informational suicide prevention website for adults and minors. It collects nothing directly,
> and its host logs IP addresses. We'd like advice on who the publisher should be, what disclaimers it needs, liability
> for health information, what it can say about privacy and confidentiality, minors and under-13 privacy, the use of
> other organizations' names and links, and the name Tidelight.
> An AI assistant drafted this, and the project's files are in a public repository, so please don't write anything
> personal in what you send back.

Send: the About and privacy pages, the For Teens pages, and the "Human-only checklist" in [[CONTENT-REVIEW]].

## Deaf reviewer or Deaf-led organization

> We list ways for Deaf and hard of hearing people to reach crisis support on a draft website. Are they correct, clearly
> explained, and in the right order? Is anything missing?
> An AI assistant drafted this, and the project's files are in a public repository, so please don't write anything
> personal in what you send back.

Send: the "Deaf or hard of hearing" part of Get Help, the home page, and the wallet card. Ask whether people can find that part easily.

## Recording results

**The licensed therapist and the fluent Spanish reader.** Add one line per section of the packet's sign-off table to
"Review records" in [[CONTENT-REVIEW]], in exactly this form:

`- Get Help: licensed clinical social worker, 2026-12-01, approved, a1b2c3d4e5f6`

That is the section's name as the table prints it, the reviewer's role (never their name), the date as YYYY-MM-DD,
the result, and the fingerprint printed beside that section in the table. The publish step reads these lines:

- Only "approved", or "approved with changes, changes made", lets a section publish. "Approved with changes" alone
  doesn't, because the changes aren't made yet.
- Only a licensed mental health professional counts for English sections, and only a fluent or native Spanish
  reader for Spanish ones. "Review records" in [[CONTENT-REVIEW]] lists the roles that count.
- The Spanish lines on the English pages are Spanish sections, so they need the Spanish reader's lines, never the
  therapist's. The Spanish packet's table lists them: `Español en cada página en inglés`, `Español en Get Help`,
  `Español en After a loss`, `Español en Wallet card and poster` and `Página no encontrada`.
- The fingerprint ties the approval to the text the reviewer read. If the section changes afterward, even by one
  word, the approval stops counting and publishing stops. Rebuild the packet, show the reviewer the change, and add
  a new line with the new fingerprint.

**Answers to the packets' questions** aren't review records. Copy each useful answer into the note its question
comes from, such as [[SAFETY]] for the Spanish reader's questions about Crisis Text Line or TTY, with the reader's
role and the date.

**Everyone else**, such as the lawyer, the youth worker, the person with lived experience, and the Deaf reviewer:
record their results under "Other reviews" in [[CONTENT-REVIEW]]. The publish step never reads that section, so
their results can't approve a page or cancel a clinician's decision. A founder acts on them.

Then update the review list on the About pages. Run `python3 tools/check_site.py` afterward: it fails on a line it
can't read, and that stops every publish.

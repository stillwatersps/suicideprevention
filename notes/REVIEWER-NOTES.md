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
> drafted the pages, so no clinician has reviewed them, and nothing goes to the public until someone qualified has.
>
> The attached packet has every sentence numbered, with its sources. Each section has a box for your decision, and
> there's a list of questions we'd especially value your view on. Please start with anything that could cause harm.
> We especially need to know whether the "Not sure what you're feeling?" page belongs at all.
>
> Please record your role and the date, not your name or contact details, since the packet may be stored publicly.

Send: `review-packet/tidelight-review-packet.pdf`. Also offer the draft site through [[PHONE-TEST]].

## Fluent Spanish reader

> We need a fluent reader to check the Spanish pages of a draft suicide prevention website, for people in the U.S. An
> AI assistant translated them, and no fluent person has read them. We need to know whether they're correct and
> natural, whether anything changes the meaning of the English, and whether anything could confuse someone in crisis.
> We also need your view on wording such as "No estás solo", which uses a masculine form.
>
> Please don't call or text any crisis line to check it. The attached packet numbers each sentence. Medical or
> crisis translation experience would help. If you notice something that seems clinically wrong, please tell us.

Send: `review-packet/tidelight-spanish-review-packet.pdf`. The content is about suicide, so give them the choice
to say no, with no reason needed.

## Someone with lived experience of a suicide loss

> We've drafted a page for people who have lost someone to suicide, using guidance from suicide prevention
> organizations. Nobody with lived experience has read it. You can say no, stop at any time, and you don't need to tell
> us anything about your own life. Would anything here hurt to read? Is anything missing that would have helped?

Send: the "After a loss" pages from the packet. Choose someone whose loss isn't recent, and offer support, such as 988,
in the message. A clinician may be able to advise you on how to ask. Don't record anything personal in this project.

## Someone who works with young people

> We've drafted a page for teens, and it covers reaching out on their own, trusted adults, and what stays private. We
> need to know whether it's accurate and would feel safe to a 14-year-old, including one with no safe adult at home.

Send: the For Teens pages from the packet, and the "If you're under 18" part of Get Help. The questions are in
[[CONTENT-REVIEW]].

## Lawyer

> We're planning a free, informational suicide prevention website for adults and minors. It collects nothing directly,
> and its host logs IP addresses. We'd like advice on who the publisher should be, what disclaimers it needs, liability
> for health information, what it can say about privacy and confidentiality, minors and under-13 privacy, the use of
> other organizations' names and links, and the name Tidelight.

Send: the About and privacy pages, the For Teens pages, and the "Human-only checklist" in [[CONTENT-REVIEW]].

## Deaf reviewer or Deaf-led organization

> We list ways for Deaf and hard of hearing people to reach crisis support on a draft website. Are they correct, clearly
> explained, and in the right order? Is anything missing?

Send: the "Deaf or hard of hearing" part of Get Help, and the wallet card.

## Recording results

Add one line per finished review to "Review records" in [[CONTENT-REVIEW]], with the section, role, date, and result. For
example: "Get Help: licensed clinical social worker, 2026-12-01, approved with changes." Then update the review list
on the About pages. `tools/check_site.py` reads this section, and `tools/launch_gate.py` looks for the words "approved"
and the reviewer's role.

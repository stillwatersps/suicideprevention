---
aliases: [Safety, Crisis resources]
status: draft for review
---

# Safety baseline

[[00 START HERE|Back to Start Here]]

Draft, November 5, 2026. These are proposed ground rules for a suicide
prevention website, not approved decisions or a clinical review. A qualified
suicide prevention professional should review content before people rely on it.
The resource table was updated on November 7, 2026, for the one-page crisis page.

## Ground rules for every page we publish

GitHub Pages is on, so anything on `main` can be seen by the public.

1. **Crisis help is always one tap away.** Every page shows how to reach the
   988 Suicide & Crisis Lifeline and 911, in plain text a visitor can read even
   if a call or text link does not work on their device.
2. **No dead crisis controls.** A button that says "call", "text" or "chat"
   either works and says where it goes, or it is not shown. Placeholders are
   fine for resource cards, never for crisis actions.
3. **Say what Stillwater is.** Stillwater is not a crisis service unless the
   founders decide to staff one. Wording such as "24/7" or "talk to a counselor"
   names the outside service that actually provides it.
4. **Follow safe messaging guidance.** No method details, no describing suicide
   as a solution or as inevitable, no sensational images. Emphasize help,
   hope, coping and recovery stories. Sources are below.
5. **Collect nothing sensitive for now.** No forms, accounts, analytics or
   tracking that could record a visitor's distress until a data decision is made.
6. **Write for minors too.** Plain language and youth-appropriate resources,
   since the audience includes minors. Ages are still undecided.

## U.S. crisis resources

The one-page crisis page uses only the first three rows. They are copied word for
word from this note on the branch `site/first-version-finish`, commit `f2e6a70`, and
match draft pull request 5's copy. "Read on" means an AI assistant read the
provider's own page in a browser on that date, without calling, texting, chatting,
or submitting anything. It does not mean a person has confirmed it. A founder should
read each page and fill in the last column.

The FCC's text-to-911 page refused automated reads on November 6 and 7, 2026 (403),
so the "Emergency services" row rests on earlier reads. The crisis page only says to
call 911, not to text it. A person should open the FCC page in a browser and confirm
its wording.

The last three rows were listed from memory on November 5, 2026, and have **not
been checked in this copy**. The task branches' copy of this note has them, and more,
as read on the providers' pages. If the two copies disagree, keep the task branches'
copy, which pull request 5 would bring to `main`.

| Resource | How to reach it | Official page | Read on | Person confirmed |
| --- | --- | --- | --- | --- |
| 988 Suicide & Crisis Lifeline | Call or text 988; chat at chat.988lifeline.org. 24/7 | https://988lifeline.org/get-help/ | Nov 6, 2026 | |
| 988 in Spanish | Call 988, then press 2; text AYUDA to 988; chat at chat.988lifeline.org/?lang=es | https://988lifeline.org/get-help/ | Nov 6, 2026 | |
| Emergency services | Call 911. Text-to-911 works only in some places; call if you can | https://www.fcc.gov/consumers/guides/what-you-need-know-about-text-911 | Nov 6, 2026 | |
| Veterans Crisis Line | Dial 988, then press 1; text 838255 | https://www.veteranscrisisline.net | Not checked, listed from memory | |
| Crisis Text Line | Text HOME to 741741 | https://www.crisistextline.org | Not checked, listed from memory | |
| The Trevor Project (LGBTQ+ young people) | Call 1-866-488-7386; text START to 678-678 | https://www.thetrevorproject.org | Not checked, listed from memory | |

Record any additional services, such as deaf and hard-of-hearing options, after
confirming them on the provider's own site.

## Guidance to read before writing content

- Safe messaging framework (Action Alliance): https://suicidepreventionmessaging.org
- Recommendations for reporting on suicide: https://reportingonsuicide.org
- #chatsafe guidelines for young people online: https://www.orygen.org.au/chatsafe
- NIMH action steps (already cited in the scope draft): https://www.nimh.nih.gov/health/publications/5-action-steps-to-help-someone-having-thoughts-of-suicide

## Open questions

- Who on the team, or which advisor, reviews crisis content before release?
- Should a public preview exist at all before that review? See [[STATUS]].
- How often are crisis numbers re-checked, and by whom?

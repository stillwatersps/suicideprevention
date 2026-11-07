# Decisions

Agreed decisions, proposals, and open questions, each labelled.

## Confirmed project choices

- Start with a phone-friendly website.
- Launch first in the United States.
- Plan for adults and minors; exact supported ages remain undecided.

## November 4, 2026: shared project notebook

The user requested a shared Obsidian vault. Keep it in the GitHub project's
`notes/` folder, so notes, designs, and future code share one workflow.
Claude Code reads the short core notes through `CLAUDE.md`; detailed task
handoffs go in `worklogs/`.

The starter repository is published. The second computer's setup still needs
confirmation. Each person uses their own local copy and Claude conversation.

## November 4 to 6, 2026: what has already happened

Recorded so the history is accurate. No note records that both founders agreed to
these before they happened.

- The repository is public and GitHub Pages publishes `main`.
- The homepage and three placeholder pages went public when pull requests 3 and 4
  merged, without a recorded review or a decision about a public preview.
- The first build used plain HTML, CSS, and one small script. Its handoff calls this
  a starting point, not an agreed tool choice.

## November 6, 2026: reported, not confirmed

- **Hold on publishing.** The research brief's handoff says the founder who supplied
  it chose not to merge pull request 5 until both founders agree and a licensed
  therapist has reviewed the content. The other founder's agreement isn't recorded.

## November 6, 2026: proposed on branch `site/phone-accessibility-content`

Claude made these routine, reversible choices overnight at one founder's request.
They are in draft pull requests, not merged, and **not agreed by both founders**.

- **Crisis strip pinned on phones and tablets.** Up to 959 px wide, the crisis strip
  stays on screen while the header scrolls away. It stops pinning on very narrow
  screens (16em wide or less, about 256 px) and very short ones (300 px tall or
  less), where it would fill the screen. A phone on its side still pins it, as one row,
  down to 240 px tall when the screen is at least 704 px wide: Safari on an iPhone 17
  measures 750 by 292 there, so the 300 px rule had left 988 and 911 off screen after
  scrolling. Found in the iOS Simulator on November 7, 2026. These limits are set in em, so
  they grow with a larger text setting: at 150% text, 16em is 384 px and 18.75em is 450 px.
  Then the strip scrolls away and only Quick exit stays on screen, even where the strip would
  take a small part of it. Whether larger text should still pin the strip is open. Known limit: short screens 568 to
  703 px wide and 300 px tall or less, such as older phones on their side, don't pin it, because
  the Spanish strip needs two rows there. At 960 px and wider it scrolls away and the
  sticky header's button stays, which takes two steps to start a call. Why: on phones,
  the header's button took two taps.
- **Crisis strip uses links.** Call 988, text 988, and call 911 can be tapped. Why:
  [[SAFETY]] rule 1. Whether 911 should be a link is a question for the reviewer.
- **Pages ask search engines not to list them** (`noindex`), until review. Why: a
  person in crisis should not land on unreviewed drafts from a search. Remove it
  when the content is approved. It does not cover raw notes.
- **Wording keeps Tidelight apart from support services.** For example, "How can
  we support you today?" became "Where would you like to start?", and the footer
  says the content has not had professional review, not that it is being reviewed.
- **Privacy wording.** The homepage says "Tidelight has no sign-ups, forms, or
  tracking. Our web host logs visitors' IP addresses." Each footer says "no sign-ups,
  forms, analytics, or cookies" and links GitHub's statement about logging IP
  addresses. "Privacy first" was dropped because it promised too much. For the
  reviewer and a lawyer.
- **AI disclosure.** Footers and draft notes say an AI assistant drafted the content
  and compared numbers and links with each provider's website, and that no person has
  confirmed them.
- **A 404 page** keeps crisis options on screen for broken links.
- **Draft content is on the pages, marked for review,** with sources on each page.
  Long source lists sit behind a Show sources button. Three research papers are cited
  without links, because they name methods. The pages don't say why, since saying so
  points to method details. [[CONTENT-REVIEW]] gives the links for the reviewer.
- **No new website tools.** Still plain HTML, CSS, and one script. `tools/check_site.py`
  checks links, crisis numbers and markup, outside scripts and files, and Obsidian
  links with Python alone.
- **The 988 LGBTQ+ youth option is on the Get Help page as a draft,** listed apart
  from The Trevor Project. 988's own pages say it has been restored and list press 3
  and PRIDE to 988. None states an age range or chat route, and SAMHSA's older FAQ
  doesn't mention it. A person needs to confirm it. See [[SAFETY]].
- **Crisis content rules in `CLAUDE.md`.** That section, and importing [[SAFETY]] as a
  core note, are a proposal for both founders to confirm.
- **Pull request 6 goes into `claude/jolly-mayer-2m6eno`, not `main`,** so pull
  request 5 stays the one place to review. Merging it doesn't publish.

## Open decisions

For both founders, ideally with a qualified reviewer. Record the answer, who agreed,
and why at the end of this note. Then change that item below to plain text starting with
"Settled", with no bold, such as "4. Settled. See the end of this note." `tools/launch_gate.py`
counts only bold items as open. Keep the numbers, because other notes refer to them. This
repository is public, so record people by role,
such as "founder A", or by a handle the person chooses.

1. **What should the public site show until review?** Keep the preview out of search
   results, cut it to one page with 988, 911, and what Tidelight is, or turn Pages
   off. Claude's suggestion: one of the last two until a reviewer has signed off,
   because reaching 988 and 911 is the part that helps most and the drafts carry the
   most risk. Draft pull request 8 corrects only the four known problems on the live
   pages, so it doesn't settle this.
2. **Should the website be published without the notes?** Pages now serves every file
   on `main`, including these notes and `CLAUDE.md`. Moving the site to a `docs`
   folder or a deploy step would stop that. The notes would stay in the public
   repository either way. Making the repository private may affect Pages on the free
   plan, so check first. The two are also tied together the other way: one merge
   publishes notes and pages, so corrected notes can't reach `main` while pages wait
   for review, and `main`'s notes still say pull request 4 is unmerged. Draft pull
   request 7 would fix that for now, with notes only.
3. **Who reviews, and how does a sign-off get recorded?** A founder's brief names a
   licensed therapist. Does that review also cover the draft pages? Record the role
   and the date, never personal contact details.
4. **Should changes to `main` need the other person's approval?** Merging publishes
   within about a minute, and `main` has no protection.
5. **Is there any contact route, and what if someone writes in crisis?** GitHub
   Issues and the Wiki are on for this public repository. Turning them off is a
   simple first step.
6. **Which ages are supported?** The name is now Tidelight; see the November 7 entry
   below. A trademark check is still open.
7. **Where do private notes live?** The vault folder can hold private notes,
   `.gitignore` has no rule for them, and GitHub Desktop selects every changed file by
   default, so one could be committed and published by accident. Keep them outside
   `notes/`, or in one ignored folder?

## November 6, 2026: improvement ideas approved by one founder

One founder approved nine ideas from [[IDEAS]]: A1, A2, A3, A4, A6, A7, B1, B2 and B6.
**The other founder has not agreed yet.** They are built on branch
`claude/jolly-mayer-2m6eno`, draft pull request 5, not merged. Details and the
GitHub settings each needs are in
[[worklogs/2026-11-06-claude-approved-ideas|the handoff]].

- A2, A3 and A4 would settle open decisions 4, 2 and 5 above, once both founders
  agree and the settings are changed.
- B1, B2 and B6 change crisis wording, so they stay drafts until the qualified
  reviewer, and for B6 a fluent Spanish reader, has checked them. See [[CONTENT-REVIEW]].

## November 6, 2026: second batch approved by one founder

One founder approved C2, C3, C4, C5, C6, D1, D2 and D3 from [[IDEAS]]. **The other
founder has not agreed yet.** Built on draft pull request 5, not merged, except:
C5 (closing pull requests 1, 7 and 8) is on hold because the other founder opened
them, and C6 is a plan in [[USER-TEST]], not yet run. D1 to D3 add health wording,
so they stay drafts for the reviewer. D3, a page for teens, was built before
supported ages are decided; the page says so. Details in
[[worklogs/2026-11-06-claude-second-batch|the handoff]].

## November 6, 2026: first version finished for testing and review

The founder who hadn't yet weighed in asked Claude to finish the first version in one
session, using the work already on `claude/jolly-mayer-2m6eno`, so the site can be tested on
phones and given to human reviewers. This asks for testing and review, not publishing. **It
settles none of the open decisions above, and nothing is agreed to go live.** The first
founder hasn't seen the additions, and neither founder has agreed to the other's list.

Built as drafts on `site/first-version-build`, draft pull request 9: A5, B3, B4, B5, and C1
from [[IDEAS]], an About and privacy page, and the rest of the Spanish Research page. Details
are in [[worklogs/2026-11-06-claude-first-version|the handoff]]. Choices Claude made, all easy
to reverse:

- **Not sure page has nothing to type.** Tapping opens short notes. No answers, no score, no
  saving, and no form, which keeps [[SAFETY]] rule 5 intact. Pathway B's journal was not built.
- **The Research page was translated before review.** Earlier notes planned to wait. The founder
  asked for complete Spanish pages so they can be reviewed. If the English changes, so must this.
- **About became a page.** The first scope listed one, and quick exit and offline limits
  needed a place. The footer stays short and links to it. "About" in the menu goes there.
- **Two packets, not one.** The therapist gets English pages and the brief. A fluent Spanish
  reader gets the Spanish pages. Packets record a role and a date, never contact details.
- **Two pages appear in the phone menu only.** They don't fit the desktop header, where they
  stay in the footer and on the homepage.

## November 7, 2026: name changed to Tidelight

One founder renamed the project from Stillwater to Tidelight. **The other founder's
agreement isn't recorded yet.** Done on branch `claude/jolly-mayer-2m6eno`, draft pull
request 5, not merged. What changed:

- Every page in English and Spanish, the home screen app name, the review packets,
  the tools, and the current notes.
- Not changed: the supplied design files, which show the old name; earlier handoff
  notes, which are history; and the GitHub organization `stillwatersps` and the website
  address, which a founder would change in GitHub's settings.
- Visitors' saved offline copies under the old name are removed on their next visit.

Still open: check Tidelight against existing organizations and trademarks before
buying a domain or printing cards.

## Recorded November 7, 2026: publish safety check, proposed

Once Pages publishes with GitHub Actions, `tools/launch_gate.py` stops the publish step until
reviews are recorded. Claude built it as a proposal. Neither founder's agreement is recorded. See
[[LAUNCH-CHECKLIST]].

## Decision format

For future decisions, add the date, what was chosen, why, who agreed, and any
remaining questions. Keep the newest entries at the end.

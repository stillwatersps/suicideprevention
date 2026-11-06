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
  less), where it would fill the screen. At 960 px and wider it scrolls away and the
  sticky header's button stays, which takes two steps to start a call. Why: on phones,
  the header's button took two taps.
- **Crisis strip uses links.** Call 988, text 988, and call 911 can be tapped. Why:
  [[SAFETY]] rule 1. Whether 911 should be a link is a question for the reviewer.
- **Pages ask search engines not to list them** (`noindex`), until review. Why: a
  person in crisis should not land on unreviewed drafts from a search. Remove it
  when the content is approved. It does not cover raw notes.
- **Wording keeps Stillwater apart from support services.** For example, "How can
  we support you today?" became "Where would you like to start?", and the footer
  says the content has not had professional review, not that it is being reviewed.
- **Privacy wording.** The homepage says "Stillwater has no sign-ups, forms, or
  tracking. Our web host logs visitors' IP addresses." Each footer says "no sign-ups,
  forms, analytics, or cookies" and links GitHub's statement about logging IP
  addresses. "Privacy first" was dropped because it promised too much. For the
  reviewer and a lawyer.
- **AI disclosure.** Footers and draft notes say an AI assistant drafted the content
  and compared numbers and links with each provider's website, and that no person has
  confirmed them.
- **A 404 page** keeps crisis options on screen for broken links.
- **Draft content is on the pages, marked for review,** with sources on each page.
  Long source lists sit behind a Show sources button. Two research papers are cited
  without links, because they name methods. [[CONTENT-REVIEW]] gives the links for
  the reviewer.
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
and why at the end of this note. This repository is public, so record people by role,
such as "founder A", or by a handle the person chooses.

1. **What should the public site show until review?** Keep the preview out of search
   results, cut it to one page with 988, 911, and what Stillwater is, or turn Pages
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
6. **Which ages are supported, and is the name Stillwater final?**
7. **Where do private notes live?** The vault folder can hold private notes,
   `.gitignore` has no rule for them, and GitHub Desktop selects every changed file by
   default, so one could be committed and published by accident. Keep them outside
   `notes/`, or in one ignored folder?

## Decision format

For future decisions, add the date, what was chosen, why, who agreed, and any
remaining questions. Keep the newest entries at the end.

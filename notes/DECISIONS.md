# Decisions

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

## November 6, 2026: proposed on branch `site/phone-accessibility-content`

Claude made these routine, reversible choices overnight at one founder's request.
They are in a draft pull request, not merged, and **not agreed by both founders**.

- **Crisis line pinned on phones.** The crisis strip stays on screen while the
  header scrolls away, so help is always one tap away. Desktop keeps its sticky
  header. Why: the header's button took two taps to start a call.
- **Crisis strip uses links.** Call 988, text 988, and call 911 can be tapped. Why:
  [[SAFETY]] rule 1. Whether 911 should be a link is a question for the reviewer.
- **Pages ask search engines not to list them** (`noindex`), until review. Why: a
  person in crisis should not land on unreviewed drafts from a search. Remove it
  when the content is approved. It does not cover raw notes.
- **Wording keeps Stillwater apart from support services.** For example, "How can
  we support you today?" became "Where would you like to start?", and the footer
  says the content has not had professional review, not that it is being reviewed.
- **A 404 page** keeps crisis options on screen for broken links.
- **Draft content is on the pages, marked for review,** with sources on each page.
- **No new website tools.** Still plain HTML, CSS, and one script. `tools/check_site.py`
  checks links, crisis markup, and Obsidian links with Python alone.
- **The 988 LGBTQ+ youth option is left off for now,** because official pages
  disagree. See [[SAFETY]].

## Open decisions

For both founders, ideally with a qualified reviewer. Record the answer, who agreed,
and why at the end of this note.

1. **What should the public site show until review?** Keep the preview out of search
   results, cut it to one page with 988, 911, and what Stillwater is, or turn Pages
   off. Claude's suggestion: one of the last two until a reviewer has signed off,
   because reaching 988 and 911 is the part that helps most and the drafts carry the
   most risk.
2. **Should the website be published without the notes?** Pages now serves every file
   on `main`, including these notes and `CLAUDE.md`. Moving the site to a `docs`
   folder or a deploy step would stop that. The notes would stay in the public
   repository either way. Making the repository private may affect Pages on the free
   plan, so check first.
3. **Who reviews, and how does a sign-off get recorded?**
4. **Should changes to `main` need the other person's approval?** Merging publishes
   within about a minute, and `main` has no protection.
5. **Is there any contact route, and what if someone writes in crisis?** GitHub
   Issues and the Wiki are on for this public repository. Turning them off is a
   simple first step.
6. **Which ages are supported, and is the name Stillwater final?**

## Decision format

For future decisions, add the date, what was chosen, why, who agreed, and any
remaining questions. Keep the newest entries at the end.

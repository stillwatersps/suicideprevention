---
aliases: [Founder brief, Decisions needed]
status: proposal for both founders
---

# Decisions the founders need to make

[[00 START HERE|Back to Start Here]]

A first version is built and can be tested. Nothing more can move toward launch without you. Claude wrote this,
and each recommendation is only a suggestion. Record what you decide in [[DECISIONS]], with who agreed.
[[LAUNCH-CHECKLIST]] shows the order of everything else.

## Most urgent: what the public sees today

`main` is public now. It has the homepage and three placeholder pages, and it says its content "is still being
reviewed", which isn't true yet.

| Option | Good | Bad |
| --- | --- | --- |
| A. Merge pull request 8 | Takes minutes. Fixes the four known problems | Still public with no review |
| B. One page with 988, 911, and what Tidelight is | Keeps the part that helps most, with the least risk | Needs a small build |
| C. Turn GitHub Pages off | No unreviewed website. The drafts stay readable in the public repository | Nothing to show anyone |
| D. Leave it as it is | No work | The site keeps saying something untrue |

**Recommendation:** A today, because it corrects something untrue, then decide between B and C. The notes on
`main` are also public, and pull request 7 corrects the stale ones.

## Decisions for both of you

| # | Decision | Recommendation | Why it matters |
| --- | --- | --- | --- |
| 1 | Who reviews? Does the licensed therapist also cover the draft pages? | Yes, and add someone with lived experience of a loss and someone who works with young people | One person can't cover all of this |
| 2 | How is a sign-off recorded? | Role, date, and result in [[CONTENT-REVIEW]]. Keep anything personal outside this public project | The site's review list and checks read this |
| 3 | Which ages? Under-13s? | Don't gate access. Ask a lawyer about under-13s and the teen wording | The teen page exists, and ages are undecided |
| 4 | Does the Not Sure page belong? | Ask the therapist first. It's easy to remove | A reflection page may not suit someone in crisis |
| 5 | Do you both accept the built ideas in [[IDEAS]]? | Read them together. Each founder approved a different list, and neither has agreed to the other's | Nothing is agreed until you both say so |
| 6 | Should merging need the other founder's approval? | Yes | Merging publishes within about a minute, and `main` has no protection |
| 7 | Should the site publish without the notes? | Yes, with GitHub Actions. The workflow is built and needs one setting | Every note on `main` has a public address today |
| 8 | Keep the publish safety check? | Yes, until reviews are recorded | Once Pages is set to GitHub Actions, it stops publishing until reviews are recorded. Until that setting changes it does nothing, and merging pull request 5 publishes every page and note. See [[LAUNCH-CHECKLIST]] |
| 9 | What if someone contacts the project in crisis? | Turn off Issues and the Wiki, and add no contact route until you have a plan and a person to answer | A message nobody sees could do real harm |
| 10 | Who is the publisher? Is Tidelight the final name? | Ask a lawyer, and check trademarks before buying a domain | Both affect what the site must say |
| 11 | A custom domain? | Decide after the name. It changes the page-not-found links and the checks | The current address includes `/suicideprevention/` |
| 12 | Who does upkeep? | Name one person for each part of [[UPKEEP]] | Numbers change, and someone has to notice |
| 13 | Keep or close pull requests 1, 7, and 8? | Close 1. Merge 7 and 8 if `main` stays public for a while | Pull request 5 covers them once it merges |

AI auditors raised these on November 7, 2026. They are suggestions, not decisions.

### From the November 7 audit: before any publishing

- **Make the publish check binding on both of you.** `main` has no protection, and both of you are
  repository admins, so either one can publish alone, by pushing a review record, setting
  `PUBLISH_UNREVIEWED`, or removing the check. The planned rule for `main` (idea A2) needs "Do not
  allow bypassing the above settings" turned on, or it doesn't bind admins. Also turn on "Require
  approval of the most recent reviewable push", and require both "Check the website" and "Test in a
  real browser". The surest step: in Settings, Environments, `github-pages`, add the other founder as
  a required reviewer with "Prevent self-review" on. Delete `PUBLISH_UNREVIEWED` as soon as it's no
  longer needed.
- **No other Pages site in this organization.** Every Pages site in `stillwatersps` shares
  Tidelight's web address origin, so a script on another one could read or replace the offline copies
  of crisis pages. Today Tidelight is the only one, but members may create more. An organization
  owner can turn that off in the organization's Pages settings. A custom domain later gives Tidelight
  its own origin.

- **Commit email privacy.** Public commit details on `main` show a founder's first name with an
  email address at a personal domain, from three merges made with GitHub's merge button, and four
  other commits show an Apple relay address, so before any further merge both founders turn on "Keep
  my email addresses private" in GitHub's email settings and set git on each computer to their
  GitHub no-reply address
  (https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/setting-your-commit-email-address).
  Rewriting the history of `main` is a separate decision: it changes every commit ID, disrupts open
  pull requests, and doesn't remove copies elsewhere.
- **Pull request 5's description.** It is out of date and says "The founders agreed to hold this",
  which [[DECISIONS]] lists as reported, not confirmed. With a founder's go-ahead, replace its
  opening with a "Do not merge yet" note saying that merging publishes every page and note,
  including unreviewed draft crisis and health text, within about a minute, that one founder chose
  to hold it until both agree and a licensed therapist has reviewed it, and that the other founder's
  agreement isn't recorded; its old sections ("has no pull request of its own", "5 pages") would go.
- **The promise in the therapist note.** The note in [[REVIEWER-NOTES]] now ends "We don't plan to
  publish these draft pages until someone qualified has reviewed them." That is a promise to a
  professional, so confirm it before sending, or change it.
- **`PUBLISH_UNREVIEWED` (decision 8).** If you publish an agreed early preview before reviews are
  recorded and then delete this variable, every later publish stops, including an urgent
  crisis-number fix or a revert. Decide whether to keep it set until reviews are recorded, or who
  may add it alone for an urgent fix, since [[UPKEEP]] says a wrong number shouldn't wait.
- **Daily notes in the shared vault (open decision 7).** Obsidian's Daily notes plugin is on, so one
  click creates a dated note in `notes/`, where a commit would publish it. Consider setting
  `"daily-notes": false` in the vault's core plugin settings.

### From the November 7 audit: before launch

- **"Looking for ways to cope" on Home.** Home, in both languages, says "Whether you're in crisis,
  looking for ways to cope, or supporting someone you care about, these pages can point you to
  support", from the supplied design, but the site leaves out coping exercises on purpose (see "What
  was left out on purpose" in [[CONTENT-REVIEW]]). Keep the phrase, drop "looking for ways to
  cope,", or keep it only if the reviewer later approves coping content?
- **Whether the site stays installable (idea A6).** With `"display": "standalone"`, Chrome on
  Android may offer to install Tidelight after one tap and 30 seconds on a page, and the offer could
  appear over a crisis page: keep it, switch to `"browser"` so Android opens a normal tab, where
  Quick exit and Back were tested and people can still add a shortcut, or keep it and stop Chrome's
  automatic offer. On an iPhone, from iOS 26 every site added to the Home Screen opens as a web app
  whatever the manifest says (WebKit's Safari 26.0 notes, read second-hand). The Spanish pages now
  have their own manifest, also standalone, so the choice covers both.
- **The crisis strip on short screens and with larger text.** A one-row strip, "Call 988 · Text 988
  · Call 911" with Quick exit inside, is built as a proposal on branch `build/compact-strip`. It is
  not agreed by both founders. It pins where the full strip used to scroll away, if the row fits
  and takes a quarter of the screen's height or less. In desktop Chrome's phone-size emulation it
  pins in both languages on phones on their side, such as 640 by 290, and at 844 by 390 with 150%
  text. The Spanish row is longer, so with larger text the Spanish strip often still scrolls away,
  as at 750 by 292 with 150% text, and at every size tested with 200% text. On a phone held upright
  with very large text, such as 390 px wide at 200%, the strip still scrolls away in both languages.
  Where it scrolls away, Quick exit stays on screen in the bottom corner. Not tried on a real phone.
  Decide with the reviewer whether to keep it, and whether its shorter wording is acceptable: see
  the question in [[CONTENT-REVIEW]], the strip entry in [[DECISIONS]], and
  [[worklogs/2026-11-07-claude-compact-strip|the handoff]].
- **Two words to ask providers about.** Ask Crisis Text Line which word starts a conversation in
  Spanish (its FAQ says HOLA, its Spanish page says AYUDA), and ask 988 which reply word and steps
  apply when someone texts AYUDA (its Spanish What to Expect page says «siguiente», and its Spanish
  services page describes no terms step). Record both in [[SAFETY]].
- **AFSP's flipbook guides.** Try Surviving a Suicide Loss, Children, Teens and Suicide Loss, and
  the two Spanish booklets on a real iPhone and Android phone (in desktop phone-size emulation each
  page showed at about 135 by 209 px, and the viewer blocks zoom), and ask AFSP whether accessible
  versions exist, such as a tagged PDF or a web page, since the Spanish guide's PDF has no tag
  structure. Then decide whether After a loss also links the English guide's PDF (about 164 KB) and
  warns that the children's booklet download is about 203 MB.
- **AFSP's Healing Conversations form.** Before release, a person rereads the request form, without
  filling it in or submitting it, because After a loss now says what it asks for and who sees the
  answers, and forms change.
- **A school Chromebook check.** Add to the Human-only checklist in [[CONTENT-REVIEW]]: "If a
  school-managed Chromebook is available with permission, check that each chat link opens. Stop at
  the first screen. Don't start a chat."

---

## What's ready, and what isn't

**Ready for you to try:** all 19 pages in English and Spanish, and quick exit, offline support, dark mode, printing, saving 988 to
contacts, review packets, phone test steps, and automatic checks. See [[STATUS]].

**Not done, and not doable by Claude:**

- Clinical review, fluent Spanish review, legal review, and review by people with lived experience
- Tests on real phones, and with VoiceOver and TalkBack
- A person confirming each crisis detail in [[SAFETY]]
- The GitHub settings, which the repository owner changes

To see the current list at any time:

```bash
python3 tools/launch_gate.py
```

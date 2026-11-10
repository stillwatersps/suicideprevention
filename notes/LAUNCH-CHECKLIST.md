---
aliases: [Launch checklist]
status: proposal for both founders
---

# Launch checklist

[[00 START HERE|Back to Start Here]]

Everything between today and a public launch, in order. Claude drafted this as a proposal. Nothing
here has been agreed. To see where things stand, run:

```bash
python3 tools/launch_gate.py
```

It reads what people have recorded in the notes and on GitHub. It can't judge whether content is good.

## 1. Decide together

Read [[FOUNDER-BRIEF]] first. It gives the choices and a recommendation for each. Record each answer at the end
of [[DECISIONS]]. Then change that item under "Open decisions" to plain text starting with "Settled", with no
bold, so `tools/launch_gate.py` stops counting it. Keep its number, because other notes refer to it.

- [ ] What the public site shows until review
- [ ] Who reviews, and how a sign-off is recorded
- [ ] Supported ages, including under-13s
- [ ] Whether both founders accept the ideas in [[IDEAS]]
- [ ] Whether the name Tidelight is final, after a trademark check
- [ ] What to do if someone tries to contact the project in crisis

## 2. Human review

Give each person the matching note in [[REVIEWER-NOTES]]. Never add personal contact details to this
public project.

The licensed therapist's and the Spanish reader's results go under "Review records" in [[CONTENT-REVIEW]],
one line for each section of the packet's sign-off table, in exactly this form:

`- Get Help: licensed clinical social worker, 2026-12-01, approved, a1b2c3d4e5f6`

That is the section's name as the table prints it, the reviewer's role, the date as YYYY-MM-DD, the result,
and the section's fingerprint from the table. "Review records" in [[CONTENT-REVIEW]] explains each part,
which roles count, and what to do when a fingerprint no longer matches.

Everyone else's results go under "Other reviews" in [[CONTENT-REVIEW]], which the publish step never reads.

- [ ] Licensed therapist: `review-packet/tidelight-review-packet.pdf`. Results under "Review records"
- [ ] Fluent Spanish reader: `review-packet/tidelight-spanish-review-packet.pdf`, including the Spanish lines on
  the English pages in its Part 3 and the questions in its Part 5. Results under "Review records", and answers
  in the notes each question comes from
- [ ] Someone with lived experience of a suicide loss: After a loss. Results under "Other reviews"
- [ ] Someone who works with young people: For Teens. Results under "Other reviews"
- [ ] A lawyer: About and privacy, minors, and who the publisher is. Results under "Other reviews"
- [ ] Deaf reviewer or Deaf-led organization: the Deaf and hard of hearing options. Results under "Other reviews"

## 3. Make the changes

- [ ] Make reviewers' changes on a task branch, and show the reviewer anything that changed a safety message.
- [ ] Update the Spanish twin of every changed English page.
- [ ] Run `python3 tools/make_review_packet.py` again. Any change to a page's own section gives it a new
  fingerprint, so its approval stops counting until the reviewer has seen the change and a new line is recorded.
  That includes a change only a screen reader would notice, such as a link's `aria-label`, an image's description,
  or a page's title.
- [ ] Check the parts every page shares, such as the crisis strip and the footer, on every page you changed. The
  text on every page (Part 1) lists each different line there once, and a line that isn't on every page of its
  language carries a note saying which pages show it, such as "On every page except Home." The notes are part of
  the fingerprint, so a line taken off one page, changed there, moved to another part, or given a link to another
  place there gives Part 1 a new fingerprint, and its approval stops counting. A line that only changes its place
  among the other lines of its part is still a limit: the notes don't record the order. What a screen reader says
  in those parts must be the same on every page of a language, or `tools/check_site.py` fails, so a crisis link
  that loses its full name on one page is caught.

## 4. Test on real devices

Follow [[PHONE-TEST]]. Never complete a call or text to a crisis line. Record each phone in a note in
`worklogs/` with one line in exactly this form:

`Real phone test: iPhone 15, iOS 26.1, 2026-12-02, every check passed`

That is the phone, its system and version, the date, and the result. `tools/launch_gate.py` counts only these
lines. It never counts a Simulator or phone-size emulation note, or a result such as "not yet" or "pending".

- [ ] iPhone, Safari: every check in the table, including VoiceOver
- [ ] Android, Chrome: every check, including TalkBack
- [ ] Offline, over HTTPS
- [ ] The user test in [[USER-TEST]], after the reviewer approves its plan

## 5. Confirm the facts

- [ ] A person reads each provider's page and fills in "Person confirmed" in [[SAFETY]] with who, by role,
  and the date, such as "founder A, 2026-12-01". "Not yet" or "pending" doesn't count.
- [ ] Confirm the 988 LGBTQ+ youth option with 988, including its age range and any chat route.
- [ ] Run the current checks:

```bash
python3 tools/check_site.py --check-links
```

```bash
python3 tools/test_browser.py
```

```bash
python3 tools/check_crisis_sources.py
```

```bash
python3 tools/make_review_packet.py --self-test
```

- [ ] If the recheck happened on a new day, update the dates on the pages. Replace both dates in this
  example:

```bash
python3 tools/set_checked_date.py 2026-11-06 2026-12-07 --apply
```

## 6. Remove the draft labels, only after review

Every change below changes the text of the pages, so every section gets a new fingerprint and the earlier
approvals stop counting. Make all of these changes on one task branch, rebuild the packets, ask the reviewers
to approve the final text, and add new lines with the new fingerprints to "Review records" before merging.
Until those lines are there, `tools/check_site.py` fails if the About pages say "Approved", which is expected.

- [ ] Remove each page's draft note once its review is recorded. Removing a note makes `tools/check_site.py`
  fail, which stops publishing, so that check must change first.
- [ ] Update the review list on the About pages with each reviewer's role and the date.
- [ ] Remove the `noindex` tag, if both founders want search engines to list the site.
- [ ] Reword the footers, which say no professional has reviewed the content.
- [ ] Reword every line saying an AI assistant compared the numbers, or that no person has confirmed them or
  tried them on a phone. They are in the footers, the draft notes, and the About pages, in English and Spanish.

## 7. GitHub settings, done by the repository owner

Steps are in [[worklogs/2026-11-06-claude-approved-ideas]].

- [ ] Require the other founder's approval on `main`, with a branch protection rule or a ruleset.
  `tools/launch_gate.py` reads both. Reading a branch protection rule needs the owner's access, so if the
  tool says it couldn't read this, check it by hand.
- [ ] Turn off Issues and the Wiki.
- [ ] Set Pages to publish with GitHub Actions, right before merging. Until then, Pages publishes every
  file on `main`, notes included.
- [ ] Agree which founder's account gets failed-run notices from the daily and monthly checks. GitHub sends
  them to one account only. That founder checks their notification settings, and the other checks the Actions
  tab on a set day. See [[UPKEEP]].

## 8. Merge and publish

1. Merge the task branch into the branch behind pull request 5, then merge pull request 5 into `main`.
2. Watch the "Site" run under the Actions tab. It runs the checks and browser tests before publishing.
3. Open the live site on a phone. Check the crisis strip, Call and Text (cancel them), and the menu.
4. Confirm that a notes address, such as `/notes/STATUS.md`, no longer loads.
5. Open an address that doesn't exist, such as `/suicideprevention/no-such-page/`. Tidelight's "page not found" page
   should appear, with the crisis numbers, not GitHub's own page.
6. The next day, confirm the daily monitor passed.

If the "Site" run stops at the review check, the old site stays public, notes included, because Pages keeps
showing the last thing it published. So step 4 fails too. Either fix the records and use "Re-run failed jobs"
on the stopped run, or turn Pages off until a publish succeeds.

### The publish safety check

Once Pages publishes with GitHub Actions, the publish step runs `python3 tools/launch_gate.py --publish`.
It stops publishing unless all of these hold:

- Every page has a section in the review packets, and so do the Spanish lines on every English page. All the
  text a visitor sees is in a numbered part of a packet, not loose in a div. So are the words a screen reader says
  that the screen doesn't show, of the kinds `tools/check_site.py` reads: each page's title, an `aria-label` or a
  similar attribute, an image's description, words hidden from the eye, a drawing's title, and the skip link. In
  the parts every page shares, which the packets list once, those words are the same on every page of a language.
- Every line under "Review records" in [[CONTENT-REVIEW]] can be read, and none is dated after today.
- Every English section's newest line by a licensed clinician approves it, and every Spanish section's newest
  line by a fluent or native Spanish reader approves it. The Spanish sections include the Spanish lines on
  the English pages: `Español en cada página en inglés`, `Español en Get Help`, `Español en After a loss`,
  `Español en Wallet card and poster` and `Página no encontrada`. That is 12 English and 16 Spanish lines,
  one per section, in the form shown in section 2 above.
- Each of those approvals ends with the fingerprint of the section's current text.

Lines by any other reviewer, and anything under "Other reviews", are never counted. Run
`python3 tools/launch_gate.py` on a computer to see which sections are missing and why. The current published
site stays up when this step stops.

A line that can't be read also makes `tools/check_site.py` fail. That stops every publish, even with the
variable below, so run it after adding lines.

After any change to a page, its fingerprint changes and publishing stops until the change is reviewed and
recorded. That includes a fix to a crisis number. For an urgent fix, use the variable below, then record the
review afterward.

To publish anyway, for an agreed early preview, both founders agree first. Then the owner adds a repository
variable under Settings, Secrets and variables, Actions, Variables. Name it `PUBLISH_UNREVIEWED`, with the
value `both founders agreed`. If the publish already stopped, use "Re-run failed jobs" on that run instead of
pushing again. Delete the variable afterward. While any section isn't approved for its current text, each
later publish stops at this check too, including a fix to a crisis number or a revert. For that fix, both
founders agree, add the variable again before merging it, then delete it after it publishes.

This check is itself a proposal. To remove it, delete the "Check that reviews are on record" step from
`.github/workflows/site.yml`.

## After launch

See [[UPKEEP]].

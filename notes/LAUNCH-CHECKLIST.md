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

Give each person the matching note in [[REVIEWER-NOTES]]. Record each result in "Review records" in
[[CONTENT-REVIEW]]: the section, the reviewer's role, the date, and the result. Never add personal
contact details to this public project.

- [ ] Licensed therapist: `review-packet/tidelight-review-packet.pdf`
- [ ] Fluent Spanish reader: `review-packet/tidelight-spanish-review-packet.pdf`
- [ ] Someone with lived experience of a suicide loss: After a loss
- [ ] Someone who works with young people: For Teens
- [ ] A lawyer: About and privacy, minors, and who the publisher is
- [ ] Deaf reviewer or Deaf-led organization: the Deaf and hard of hearing options

## 3. Make the changes

- [ ] Make reviewers' changes on a task branch, and show the reviewer anything that changed a safety message.
- [ ] Update the Spanish twin of every changed English page.
- [ ] Run `python3 tools/make_review_packet.py` again if a reviewer needs to see changes.

## 4. Test on real devices

Follow [[PHONE-TEST]]. Add a note to `worklogs/` with "phone" in its name. Never complete a call or text
to a crisis line.

- [ ] iPhone, Safari: every check in the table, including VoiceOver
- [ ] Android, Chrome: every check, including TalkBack
- [ ] Offline, over HTTPS
- [ ] The user test in [[USER-TEST]], after the reviewer approves its plan

## 5. Confirm the facts

- [ ] A person reads each provider's page and fills in "Person confirmed" in [[SAFETY]].
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

- [ ] If the recheck happened on a new day, update the dates on the pages. Replace both dates in this
  example:

```bash
python3 tools/set_checked_date.py 2026-11-06 2026-12-07 --apply
```

## 6. Remove the draft labels, only after review

- [ ] Remove each page's draft note once its review is recorded. Removing a note makes `tools/check_site.py`
  fail, which stops publishing, so that check must change first.
- [ ] Update the review list on the About pages with each reviewer's role and the date.
- [ ] Remove the `noindex` tag, if both founders want search engines to list the site.
- [ ] Reword the footers, which say no professional has reviewed the content.
- [ ] Reword every line saying an AI assistant compared the numbers, or that no person has confirmed them or
  tried them on a phone. They are in the footers, the draft notes, and the About pages, in English and Spanish.

## 7. GitHub settings, done by the repository owner

Steps are in [[worklogs/2026-11-06-claude-approved-ideas]].

- [ ] Require the other founder's approval on `main`, with a branch protection rule, not a ruleset, because
  `tools/launch_gate.py` only reads branch protection rules.
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

### The publish safety check

Once Pages publishes with GitHub Actions, the publish step stops until "Review records" in [[CONTENT-REVIEW]]
has a line with a clinical role and the word "approved", and a line with a Spanish or fluent-reader word and
"approved". One line can count as both. It doesn't check that every page was reviewed, so a person must
confirm that every review is done before merging. The current published site stays up when this step stops.

To publish anyway, for an agreed early preview, both founders agree first. Then the owner adds a repository
variable under Settings, Secrets and variables, Actions, Variables. Name it `PUBLISH_UNREVIEWED`, with the
value `both founders agreed`. Delete it afterward. While no reviews are on record, each later publish stops
at this check too, including a fix to a crisis number or a revert. For that fix, both founders agree, add the
variable again before merging it, then delete it after it publishes.

This check is itself a proposal. To remove it, delete the "Check that reviews are on record" step from
`.github/workflows/site.yml`.

## After launch

See [[UPKEEP]].

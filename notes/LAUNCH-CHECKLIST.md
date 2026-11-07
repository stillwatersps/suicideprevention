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

Read [[FOUNDER-BRIEF]] first. It gives the choices and a recommendation for each.

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

- [ ] Remove each page's draft note once its review is recorded.
- [ ] Update the review list on the About pages with each reviewer's role and the date.
- [ ] Remove the `noindex` tag, if both founders want search engines to list the site.
- [ ] Reword the footers, which say no professional has reviewed the content.

## 7. GitHub settings, done by the repository owner

Steps are in [[worklogs/2026-11-06-claude-approved-ideas]].

- [ ] Require the other founder's approval on `main`.
- [ ] Turn off Issues and the Wiki.
- [ ] Set Pages to publish with GitHub Actions, right before merging. Until then, Pages publishes every
  file on `main`, notes included.
- [ ] Turn on notifications for failed workflow runs.

## 8. Merge and publish

1. Merge the task branch into the branch behind pull request 5, then merge pull request 5 into `main`.
2. Watch the "Site" run under the Actions tab. It runs the checks and browser tests before publishing.
3. Open the live site on a phone. Check the crisis strip, Call and Text (cancel them), and the menu.
4. Confirm that a notes address, such as `/notes/STATUS.md`, no longer loads.
5. Open an address that doesn't exist, such as `/suicideprevention/no-such-page/`. Tidelight's "page not found" page
   should appear, with the crisis numbers, not GitHub's own page.
6. The next day, confirm the daily monitor passed.

### The publish safety check

Once Pages publishes with GitHub Actions, the publish step stops if no clinical review and fluent Spanish
review are on record, so a merge can't put unreviewed crisis content live by accident. The current
published site stays up when this happens.

To publish anyway, for an agreed early preview, both founders agree first. Then the owner adds a repository
variable under Settings, Secrets and variables, Actions, Variables. Name it `PUBLISH_UNREVIEWED`, with the
value `both founders agreed`. Delete it afterward.

This check is itself a proposal. To remove it, delete the "Check that reviews are on record" step from
`.github/workflows/site.yml`.

## After launch

See [[UPKEEP]].

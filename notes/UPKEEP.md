---
aliases: [Upkeep, Maintenance]
status: proposal for both founders
---

# Keeping the site safe after launch

[[00 START HERE|Back to Start Here]]

A crisis number that stops working is the worst thing that can go wrong here. This is a proposed routine.
Agree on an owner for each part, by role. Claude drafted this, and no one has agreed to it yet.

## If a crisis number or link is wrong

Treat this as urgent. Wrong crisis details can cost someone the chance to reach help.

1. **Confirm it** on the provider's own page. Never test by calling or texting a crisis line.
2. **Find every place it appears:**

   ```bash
   grep -rn "THE-OLD-NUMBER" --include=index.html --include=*.vcf --include=404.html .
   ```

3. **Change it everywhere,** in English and Spanish: pages, wallet cards, contact cards in `assets/`, and the
   table in [[SAFETY]].
4. **Check it:** run `python3 tools/check_site.py` and `python3 tools/test_browser.py`.
5. **Publish it.** A wrong number shouldn't wait for a full review. Agree in advance who can approve this
   kind of fix alone. That is an open question in [[SAFETY]].
6. **Change `VERSION` in `sw.js`,** so saved copies get replaced the next time a visitor opens the site with a
   connection. Copies on devices that don't come back to the site keep the old number.
7. **Rebuild the packets** with `python3 tools/make_review_packet.py`, and write a short note in `worklogs/`.
8. **Tell the reviewer** if the wording changed, not only the number.

## If the site goes down

The daily check under the Actions tab will fail. Crisis lines still work without this site. Check
[GitHub's status page](https://www.githubstatus.com/), then the latest "Site" run. To undo a bad change, revert
its merge on GitHub, and the previous version publishes again.

## Automatic checks

| Check | When | What it does | Who should watch it |
| --- | --- | --- | --- |
| Site checks and browser tests | Every pull request, and before publishing | Links, crisis numbers, layout, keyboard, offline, and more | Whoever opened the pull request |
| Live site | Daily | Every page loads and shows 988, 911, and the "not a crisis service" line | Unassigned |
| Outside links and provider pages | Monthly, on the 1st | Every link opens, and each provider's page still shows our details | Unassigned |

Turn on GitHub notifications for failed runs. Scheduled runs stop after 60 days without a commit in a public
repository, so check the Actions tab now and then.

## Monthly, about 30 minutes

- [ ] Read the monthly run. Open any page it says a person must check.
- [ ] A person reads each provider's page and updates "Read on" and "Person confirmed" in [[SAFETY]].
- [ ] Update the date on the pages, only after that check:

  ```bash
  python3 tools/set_checked_date.py OLD-DATE NEW-DATE --apply
  ```

- [ ] Rerun `python3 tools/test_browser.py` to confirm it still passes.

## Every 6 months, or when something big changes

- [ ] Check the Research page for new studies, corrections, and retractions.
- [ ] Ask the clinical reviewer to read anything that changed. Record the role and date in [[CONTENT-REVIEW]].
- [ ] Reread privacy statements against what the site does.
- [ ] Rerun the phone tests in [[PHONE-TEST]] on current iPhone and Android versions.

## Rules that don't change

- Never place test calls, send test texts, start chats, or submit forms on a crisis service.
- No analytics, forms, accounts, or outside scripts without a recorded decision. See [[SAFETY]] rule 5.
- Keep personal names, contact details, and real people's health information out of this public project.
- Don't describe anything as reviewed until a qualified person has signed off.

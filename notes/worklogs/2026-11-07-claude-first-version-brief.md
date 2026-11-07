---
type: handoff
owner: Claude, at one founder's request
branch: build/first-version-brief
---

# Task handoff: first-version brief

Date: November 7, 2026, Eastern time.

## Completed

- New [[FIRST-VERSION]]: what the first version is and isn't, eight main journeys, and one line
  per page, in about 650 words. It is a proposal, not agreed by both founders.
- Linked it from [[00 START HERE]] and from the goal in [[PROJECT]].
- In [[TASKS]], moved "Write a one-page first-version description and main user journey" to
  "Ready for review".
- No page, tool, or crisis detail changed.

## Checked

- Read every English page, and the Spanish Home and Get Help, and described only what they show.
  The crisis details in the note match the table in [[SAFETY]]. Nothing was tested on a phone.
  A separate AI review then found two mistakes. See "Corrected after review" below.
- `python3 tools/check_site.py`: "Checked 19 pages. 112 different outside links. All checks passed."
  With a broken link planted in [[FIRST-VERSION]] for a moment, it failed on that link, so it does
  read the new note.
- No page changed, so the browser tests and review packets weren't rerun.

## Corrected after review

Both mistakes were checked against the pages first. No page changed.

- The crisis journey said Home adds **Chat Online**. All ten English pages have it, with Call 988
  and Text 988: Home under **You are not alone**, the others in a **Need to talk to someone now?**
  box. The journey now says so. It also names the short box near the top of Get Help, For Teens,
  After a loss, and Not sure.
- The no-signal journey said **Save 988 to your contacts** and the **Wallet card** don't need saved
  pages. Both are files on this site, so with no signal they open only from saved copies. It now
  says a contact saved earlier, or a printed card, doesn't depend on them. The About page says the
  same.
- `python3 tools/check_site.py` passed again afterward.

## Decisions and open questions

- Both founders read [[FIRST-VERSION]], correct anything wrong, and record their agreement in
  [[DECISIONS]]. Until then it stays a proposal.
- [[STATUS]] wasn't changed, because this branch isn't merged anywhere yet.
- [[CONTENT-REVIEW]]'s control table lists the Deaf card's Text 988 and Chat with 988 buttons on
  For Teens and its Spanish twin. Those pages only link to the card on Get Help.

## Next step

Merge `build/first-version-brief` into `site/first-version-finish`, then add [[FIRST-VERSION]] to
what both founders read in [[STATUS]].

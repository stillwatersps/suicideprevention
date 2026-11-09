---
aliases: [Check-in backend, Saving check-ins]
status: plan, not built, not agreed by both founders
---

# What saving the Daily check-in would need

[[00 START HERE|Back to Start Here]]

One founder chose, on November 9, 2026, that check-ins and journal entries should eventually be
saved with **accounts and a server**. This site has neither: it is static pages on GitHub Pages.
So the Daily check-in works only while the page is open, and saves nothing. This note lists what
saving would take, so the founders can decide whether and how to build it. Nothing here is built.

## What is built now

- Every screen works in the page: check-in, suggestions, reflections, journal with edit and
  delete, Your journey, and Delete everything.
- Nothing is sent or stored. `tools/check_site.py` fails if `assets/check-in.js` could send or
  store data, and the browser tests confirm no requests to other sites.
- Every screen says plainly that saving needs accounts, which aren't built.

## What saving would need

| Area | What it means here |
| --- | --- |
| A server and database | A hosted service outside GitHub Pages, with its own cost and upkeep. Someone must own it |
| Accounts | Sign-up and sign-in, password reset, and a way to stay anonymous (no real name, optional email) |
| Encryption | Entries encrypted in transit and at rest. Ideally end-to-end, so not even Tidelight can read them |
| Privacy policy | A plain-language policy, written with a lawyer, saying what is kept, for how long, and who can see it |
| Deleting | Delete one entry, everything, or the whole account, at any time, and actually remove it |
| Shared devices | Sign-out, a short session timeout, and no entry text in notifications or page titles |
| Minors | Ages are undecided ([[DECISIONS]], open decision 6). Under-13s bring U.S. COPPA rules. A lawyer must advise first |
| Health data rules | Journals about distress are sensitive. Some state laws cover consumer health data. A lawyer should check |
| Nobody is watching | Saved entries would not be monitored. The site must say so, because someone might write something urgent and expect a reply. See [[SAFETY]] rule 3 |
| No analysis | Entries are never analyzed or scored without clear, separate consent. The founder's spec asks for this |
| Breaches | A plan for what happens if data leaks, and who tells the people affected |
| Review | The licensed reviewer, and ideally someone with lived experience, review the saved-data design before launch |

## Questions for both founders

1. Is saving worth the risk and cost, given that the site's promise today is that nothing is kept?
2. Who would run and pay for the server, and who answers if something breaks?
3. Should saving be on the visitor's own device only, with no account? That was offered on
   November 9 and not chosen, but it needs no server.

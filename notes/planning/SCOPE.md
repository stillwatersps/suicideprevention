# Stillwater: proposed first version

Planning draft for review, November 4, 2026. These are recommendations, not
approved product decisions or a completed clinical review.

## Confirmed starting point

Stillwater is intended to be a phone-friendly U.S. suicide prevention website
for adults and minors. The shared GitHub project, Obsidian vault, and supplied
desktop homepage SVG exist. The supported ages, website tools, saved-data needs,
and first feature set remain undecided. Claude is already doing a separate
planning pass; compare both proposals before selecting work.

## Suggested first milestone

Prepare an informational website prototype using fictional examples and draft
placeholder copy marked for review. Show one clear journey from the homepage to a useful next
step, without requiring an account. Proposed pages are:

| Page | Purpose |
| --- | --- |
| Home | Adapt the supplied design to phones; show support choices clearly |
| Get support | Explain the available support routes and who provides each one |
| Help someone else | Organize sourced information for friends and family |
| Resources | Browse a small, sourced content collection |
| About and privacy | State Stillwater's role, content ownership, and actual data practices |

For this milestone, propose leaving accounts, saved journals or safety plans,
AI counseling, risk scoring, and community posting for later decisions. A smaller
information-first prototype allows the team to evaluate navigation and content
before designing sensitive-data services. The FTC recommends minimizing the
health information an app collects and protecting information it retains.
[FTC health-app guidance](https://www.ftc.gov/business-guidance/resources/mobile-health-app-developers-ftc-best-practices)

This scope is not evidence that the product prevents suicide. Have a qualified
suicide prevention professional review the support content and user journeys
before people are invited to rely on them. The NIMH action steps provide a
starting reference for the content map, including listening, connection, and
follow-up; they do not validate this website or its design.
[NIMH action steps](https://www.nimh.nih.gov/health/publications/5-action-steps-to-help-someone-having-thoughts-of-suicide)

## Two tasks that can proceed independently

| Task | Deliverable | Finished when |
| --- | --- | --- |
| A: phone layout and component plan | A phone layout sketch, component inventory, and navigation behavior in a dedicated planning note | Every supplied homepage element has a phone treatment; navigation and content order are explicit; keyboard, zoom, and small-screen checks are listed |
| B: content and action map | A separate table of page sections, button destinations, source references, and review status | Every homepage action has an intended result; external providers are identified; unsupported availability or confidentiality claims are flagged for review; no destination or clinical wording is invented |

Assign one person to each task. Keep their work in separate notes, such as
`notes/planning/mobile-layout.md` and `notes/planning/content-map.md`, on separate
task branches. Use shared action names for get-support, support-self,
support-someone-else, and learn-more. Neither task needs a backend or access to
real user information. When a website framework is selected, these deliverables
can guide a visual shell with clearly labeled placeholders.

## Decisions for the two founders

1. Accept or change the proposed first milestone and pages.
2. Define the actual supported ages, including whether under-13s are included.
3. Decide whether Stillwater provides any staffed service or connects visitors
   to external providers; make the wording match that role.
4. Identify who can review support content and maintain resource accuracy.
5. Select website tools and choose whether any data collection is necessary.

If under-13s and personal information are in scope, the founders need a child
privacy assessment before designing collection and consent. COPPA covers
certain services directed to children under 13 and certain services with actual
knowledge of collecting their personal information; the applicable rules depend
on the service and data practices.
[FTC COPPA guidance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)

## Useful preparation before those decisions

The team can finish the sitemap, responsive layout specification, component
inventory, content-source register, action map, and sample acceptance checks.
Keep disputed wording marked as a proposal, and record confirmed choices in
the shared decisions note after the founders review them. No code, public
deployment, data collection, or clinical review has been completed by this draft.

# Tidelight — Visual Redesign Brief ("Dawn at the Shoreline")

You are the lead product designer and front-end engineer for Tidelight, a check-in, meditation and suicide-prevention support app. The current UI works but looks generic and "vibe-coded": default navy and beige, same-shape rounded cards everywhere, system fonts, no texture, no motion, no visual identity. Your job is to give Tidelight a distinctive, premium, human-crafted visual identity that can stand next to Calm, Headspace and Insight Timer on the App Store, **without changing what the app does and without weakening any safety feature.**

Read this whole brief before writing any code. Then follow the phases in order.

---

## 0. Ground rules (non-negotiable — these override everything else in this brief)

1. **Safety first.** Every rule already logged in `CLAUDE.md` and `app/PROGRESS.md` still applies and wins over this brief if they conflict. Log any conflict in `app/PROGRESS.md` under "Design brief vs. project rules."
2. **Crisis access never gets harder.** The 988 call/text bar, the 911 line, the Exit button and "Get Support Now" must stay:
   - visible on every screen where they appear today,
   - at least WCAG **AAA** contrast (7:1) for their text,
   - tap targets of at least 44×44 pt,
   - reachable in one tap, never hidden behind a menu, animation or scroll.
   Styling them to match the new look is fine; making them quieter, smaller or less obvious is not.
3. **Visual layer only.** Do not add, remove or rename features. Do not rewrite consent, privacy, crisis or clinical wording. Do not change data storage or what is collected. Do not change any copy reviewed or awaiting review in `notes/CONTENT-REVIEW.md`. You may change layout, color, type, spacing, iconography, illustration, motion and microcopy that is purely decorative (e.g., section labels), and you must list every copy change in the PR.
4. **Keep the "Draft for review" system.** Every page that shows a review banner today still shows one. Restyle it, don't remove it.
5. **Streaks are an open reviewer question** (question 1 in `notes/CONTENT-REVIEW.md`). Do not delete the streak feature. Change only its presentation so it can never feel like failure (see §6.3), and note it for the reviewer.
6. **Do not copy competitors.** Use the patterns described here, never their assets, illustrations, mascots, logos, exact colors, layouts or wording. No wave bands (Headspace's signature). No mascot character. No stock "meditating person" illustrations.
7. **No new network calls.** Fonts, textures and illustrations are bundled locally. No Google Fonts CDN, no remote images, no analytics. This is a privacy-sensitive app.
8. **Don't break anything.** All existing unit tests, the WebKit run and the browser run must pass at the end. Add tests where this brief asks for them.
9. Work on a new branch off `app/redesign-dev` named `app/visual-identity`. Commit after each phase with a clear message.

---

## 1. Design goal in one sentence

> Tidelight should feel like **the first light at the edge of the water after a long night**: quiet, warm, steady, unhurried, and unmistakably its own.

Every decision should pass three tests:
- **Calm test:** Would this feel gentle to someone having the worst night of their life?
- **Signature test:** If you covered the logo, would someone still know this is Tidelight?
- **Craft test:** Does this look deliberately designed by a person, or like a template?

---

## 2. Phase 1 — Audit before touching anything

1. Launch the app in the Simulator (iPhone 17 and iPhone SE size) in **light and dark mode**, English and Spanish.
2. Screenshot every screen and state: onboarding and setup steps, Home, Check-in (every question and the completion screen), Meditate (list, player, completion), Location, Friends / My circle, Journal, Rediscover, Hope box, Settings, Get Support / crisis screens, empty states, error states, loading and launch.
3. Save them to `design/before/` (add `design/` to `.gitignore` except `design/README.md` — screenshots stay local).
4. Write `design/AUDIT.md`: for each screen, list what looks generic, inconsistent or cramped, every hard-coded color, font size, spacing value and radius you find, and every component that is a one-off.
5. Fix nothing yet.

---

## 3. Phase 2 — Design tokens (single source of truth)

Create one tokens file (e.g., `app/src/styles/tokens.css`, adapted to the project's actual stack) and replace every hard-coded value in the app with a token. No raw hex values, pixel font sizes or ad-hoc spacing anywhere outside the tokens file when you're done. Add a test or lint script that fails if raw hex colors appear outside the tokens file.

### 3.1 Color — light mode

Starting values. Verify every text/background pair with a contrast checker and adjust lightness (not hue) until they pass. Record final ratios in `design/TOKENS.md`.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#10272F` | Primary text, headers, crisis bar background |
| `--ink-soft` | `#3E5560` | Secondary text (must pass 4.5:1 on `--sand`) |
| `--ink-faint` | `#6E8089` | Captions, metadata only (must pass 4.5:1 for any readable text) |
| `--sand` | `#F5EFE5` | App background |
| `--paper` | `#FBF8F2` | Raised surfaces, sheets |
| `--shell` | `#ECE3D4` | Dividers, subtle fills, inactive chips |
| `--coral` | `#C9573F` | THE single accent: primary buttons, key highlights. White text on it must pass 4.5:1 |
| `--coral-soft` | `#F3D2C4` | Coral tints, selected chip fills |
| `--dawn` | `#F2C7A2` | Horizon glow, illustration light only (decorative) |
| `--seafoam` | `#2E6E68` | Secondary actions, progress, links (must pass 4.5:1 on `--sand`) |
| `--seafoam-soft` | `#D3E6E0` | Seafoam tints, success fills |
| `--focus` | `#1F6FB2` | Keyboard and switch-control focus ring only |

Rules:
- **Coral is rare.** At most one coral element per screen region, usually the primary action. If everything is coral, nothing is.
- **No pure black, no pure white** for backgrounds or text, except white text on coral or ink.
- **No red** anywhere except true system error states (`--error: #A63A2B`, used only for form validation, never for mood, never for streaks, never for "missed" days).

### 3.2 Color — dark mode ("night tide")

| Token | Value |
|---|---|
| `--ink` (text) | `#F1EBE1` |
| `--ink-soft` | `#C3BDB3` |
| `--ink-faint` | `#948F87` |
| `--sand` (background) | `#0E1C22` |
| `--paper` | `#152830` |
| `--shell` | `#21363F` |
| `--coral` | `#E58468` (dark text on it, verify contrast) |
| `--dawn` | `#8A5A43` (glow, at low opacity) |
| `--seafoam` | `#7FC2B7` |

Dark mode must be designed, not inverted: deep sea blue-green backgrounds, warm off-white text, a dimmer dawn glow. Respect the system setting, and add a manual override in Settings if one already exists; don't add a new one if not.

### 3.3 Mood scale colors (replace any face icons or red/green scales)

Five calm, non-judgmental tones. None of them reads as "bad."

| Mood word | Token | Light value |
|---|---|---|
| Calm water | `--mood-1` | `#8DB7C6` |
| Steady | `--mood-2` | `#A6C8B4` |
| Choppy | `--mood-3` | `#E3C27F` |
| Heavy | `--mood-4` | `#B3A3C6` |
| Stormy | `--mood-5` | `#7C8BA2` |

Map these to the existing check-in answer scale in whatever order matches the app's existing data. **Do not change stored values**, only labels and colors. Mood words are presentational; if the reviewer hasn't approved the words, keep the existing labels and apply only the colors, and add the tide words as a reviewer question.

### 3.4 Typography

Bundle these locally (both are SIL Open Font License; include the license files):
- **Display / headlines:** **Fraunces** (variable). Use optical size and a soft weight around 500–600, with a slight "SOFT" axis setting if the build supports it. Headlines only, never body text.
- **Body / UI:** **Figtree** (variable), weights 400, 500, 600.

Type scale (rem-based, must scale with iOS **Dynamic Type**; test at the largest accessibility size):

| Token | Size / line height | Font | Use |
|---|---|---|---|
| `--text-display` | 34 / 40 | Fraunces 560 | One per screen max (Home greeting, completion screens) |
| `--text-title` | 26 / 32 | Fraunces 540 | Screen titles |
| `--text-heading` | 20 / 26 | Fraunces 520 | Section headers |
| `--text-body-lg` | 18 / 27 | Figtree 400 | Check-in questions, meditation descriptions |
| `--text-body` | 16 / 24 | Figtree 400 | Default |
| `--text-label` | 14 / 20 | Figtree 600 | Buttons, chips, tabs |
| `--text-caption` | 13 / 18 | Figtree 500 | Metadata (min size, never smaller) |
| `--text-eyebrow` | 12 / 16, +0.08em tracking, uppercase | Figtree 600 | Small section labels like "DAILY CHECK-IN" |

Rules:
- Max line length about 65 characters for body text.
- Headlines in sentence case, never title case.
- Use the "highlight" treatment from §5.3 on at most one phrase per screen.
- Numbers in stats use tabular figures.

### 3.5 Spacing, radius, elevation

- **Spacing scale (4-pt base):** 4, 8, 12, 16, 20, 24, 32, 40, 56, 72. Screen side padding 20. Section gap 32–40. Never "almost" values like 15 or 18.
- **Radius:** `--radius-sm` 10 (chips, inputs), `--radius-md` 18 (cards, sheets), `--radius-lg` 28 (hero panels), `--radius-pill` 999 (buttons, tags). Don't use one radius for everything.
- **Elevation:** almost flat. One soft shadow only, for floating elements: `0 8px 24px rgba(16,39,47,0.08)`. Surfaces are distinguished mainly by color (`--sand` vs `--paper`), not shadows. No borders around every card. Use `--shell` hairlines (1px) sparingly.

---

## 4. Phase 3 — The signature: "the horizon"

Tidelight's one ownable visual idea is **a flat horizon line with light gathering at its edge**, like dawn over still water. It replaces the generic look the way the sun face defines Headspace or the serif-plus-highlighter defines Insight Timer.

Build it as a reusable, code-drawn component (SVG or CSS, no image files), `<Horizon>`, with these variants:

1. **`horizon-hero`** (Home header, onboarding welcome): a soft vertical gradient from `--sand` down to a warm `--dawn` glow concentrated near a single thin horizon line (1px, `--ink` at 15% opacity) about 60% down the panel. Below the line, a slightly cooler, darker band suggests water. A barely visible shimmer reflection under the brightest point of the glow.
2. **`horizon-progress`** (check-in flow): the glow's brightness and width grow gently with each answered question. The point is "light arriving," not "score." It never dims or moves backward visibly when someone skips a question.
3. **`horizon-complete`** (check-in and meditation completion): the full dawn state, with the glow at its widest and a slow 2–3 second ease-in.
4. **`horizon-night`** (dark mode, and screens used late at night if the app already knows the local time): a deep sea gradient with a faint moon-white line and very low glow.
5. **`horizon-quiet`** (empty states): a single horizon line with a tiny point of light. Paired with one short, warm line of copy.

Rules:
- Strictly **no waves**, no curves crossing the screen. The horizon is flat and still. Stillness is the brand.
- Time-of-day tinting is optional and subtle: morning slightly warmer, evening slightly rosier, night deep blue. Use only data the app already has (device time); no location.
- Add the paper-grain texture (§5.1) on top of horizon panels so gradients never look digital or banded.

---

## 5. Phase 4 — Texture, illustration, iconography

### 5.1 Grain
- Create one small tiling noise texture, generated in code or as a tiny bundled PNG/SVG under 20 KB.
- Apply it to `--sand` backgrounds and horizon panels at 2–4% opacity with `mix-blend-mode: multiply` (`screen`/`soft-light` in dark mode).
- It must not reduce text contrast. Check the crisis bar specifically. **No grain on the crisis bar.**

### 5.2 Illustration
- No people, no faces, no mascots, no stock art.
- Use **abstract shoreline elements** only: horizon lines, stones, a single gull silhouette at most, tide marks, light, small shells. Hand-drawn feel with slightly uneven line weights (1.5–2px strokes with round caps), filled with flat palette colors plus grain.
- Use them sparingly: onboarding, empty states, completion screens. Not on every card.

### 5.3 The "light-touch highlight"
A signature text treatment: on at most one key phrase per screen, draw a soft `--dawn` underlay behind the text (like sunlight catching it), slightly irregular rounded shape, sitting low behind the letters (bottom 45% of line height). Example: "You don't have to have *everything figured out*." This is our answer to generic bold text. Don't use it on crisis copy.

### 5.4 Icons
- One consistent line-icon set at 1.75px stroke, round caps and joins, 24px grid. Use an open-source set (e.g., Lucide or Phosphor "regular"), bundled locally, or draw custom icons in the same style. **Do not mix icon styles.**
- Tab bar icons: outline when inactive, filled seafoam-tinted when active, with the label always visible.
- Replace every emoji used as UI with an icon. Emoji in user-written content are fine.

---

## 6. Phase 5 — Components

Build or restyle these as reusable components, then use them everywhere. No one-off styling in screens.

### 6.1 Buttons
- **Primary:** `--coral` fill, white `--text-label`, pill radius, 52pt height, full width on mobile forms. Pressed state: darken 8% and scale to 0.98 with a 120ms ease.
- **Secondary:** `--paper` fill, `--ink` text, 1px `--shell` border.
- **Tertiary / text:** `--seafoam` text, no fill, underline on press.
- **Crisis buttons** (Call 988, Text 988, Get Support Now): their own component, `CrisisButton`, using `--ink` fill with white text in light mode (`--paper` text on deep ink in dark mode). Always 52pt+, never disabled, never animated away, never lower contrast than AAA.
- Every button has a visible focus ring (`--focus`, 3px, 2px offset).

### 6.2 Cards: vary them
Stop making everything a white rounded card. Use four distinct surface patterns and choose deliberately:
1. **Hero panel:** full-bleed `horizon-hero`, no card edges. Home top only.
2. **Feature card:** `--paper` with `--radius-lg`, generous 24 padding, one per screen section, for the single most important next action.
3. **List rows:** no card, just rows separated by `--shell` hairlines. Use this for tools, settings, meditations and history. Most content should be lists, not cards.
4. **Tinted tiles:** small `--radius-md` tiles with a soft tint (`--seafoam-soft`, `--coral-soft`, mood tints) and an icon in a 40×40 rounded square. Use for quick tools.

### 6.3 Progress, check-in history and streaks
- Replace "0 day streak" (which greets a new user with a zero) and any "days in a row" framing with **"Days you checked in this month"**, shown as a small row of soft dots for the month.
  - Checked-in days: filled `--seafoam`.
  - Other days: an empty outline in `--shell`, **never** red, never crossed out, never labeled "missed."
  - The count only ever goes up within a month and starts fresh quietly on the 1st, with no "you lost your streak" message ever.
- Before the first check-in, show `horizon-quiet` with "Your first check-in will appear here" instead of a zero.
- Setup progress ("0/8"): use a slim seafoam progress line plus "3 of 8 set up," not a big ring with 0/8.
- Log in `app/PROGRESS.md` that this is a presentation-only change pending reviewer question 1, and that the underlying streak data is unchanged.

### 6.4 Chips and filters
Pill chips in `--shell` with `--ink` text; selected is `--seafoam-soft` fill with `--seafoam` text and a small check. Horizontal scroll with fade edges for meditation filters (e.g., "Sleep," "Anxious right now," "2 minutes").

### 6.5 Sheets and modals
Bottom sheets with `--paper`, top `--radius-lg`, a grabber, and a 280ms spring-like ease. Dim the background to `--ink` at 30%. The crisis bar stays visible above or within every sheet if it is visible on the underlying screen today.

### 6.6 Inputs
`--paper` fill, `--radius-sm`, 1px `--shell` border, `--seafoam` 2px border on focus, labels always visible above the field (never placeholder-only labels).

### 6.7 Tab bar
`--paper` background with a 1px top hairline, 5 tabs as today (Home, Check-in, Meditate, Location, Friends). Active tab: seafoam icon and label with a 4px seafoam dot above. Respect the safe area. Never covers the crisis bar.

### 6.8 Review banner ("Draft for review")
Restyle as a calm, clearly visible note: `--coral-soft` background, `--ink` text, a small info icon, `--radius-md`. Keep the exact wording and the "See the review status of each page" link.

### 6.9 The crisis bar
- Pinned at the top as today: `--ink` background, `--paper` text, "Need help now? **Call 988** or **Text 988**" and "In immediate danger, **call 911**," with the Exit button.
- Links underlined and bold, each link a 44pt+ tap target.
- Exit button: outlined in `--paper`, clear "Exit" label with icon.
- No grain, no gradient, no transparency, no animation. It's the one place that stays plain on purpose.

---

## 7. Phase 6 — Screen-by-screen direction

Apply tokens and components to every screen. Keep all existing content, order and features unless noted.

### Home
- `horizon-hero` at the top with a time-aware greeting in `--text-display` ("Good morning"), and one short supportive line under it.
- One **feature card** for the single next best action (today's check-in if not done; otherwise a suggested 3-minute meditation; otherwise "Finish setting up").
- "Days you checked in this month" dot row (§6.3).
- Quick tools as **tinted tiles** (Breathe, Ground yourself, Hope box, Get help). "Get help" is a calm tile here *in addition to* the crisis bar, never instead of it.
- Everything else as list rows. Reduce the number of cards visible above the fold to two at most.

### Daily check-in
- One question per screen, `--text-body-lg`, generous whitespace, `horizon-progress` at the top growing as the person goes.
- Answer options as large tappable rows or mood tiles using the mood tokens (§3.3), 56pt tall, with selected state = tint fill + check icon + light haptic.
- "Skip" always visible as a tertiary button, without guilt copy.
- Keep the "every question is optional, there are no right answers" message.
- Completion: `horizon-complete`, a short warm line, and two choices (e.g., "Breathe for a minute," "Back to home"). No confetti, no trophies, no "great job!" scoring. If the project's existing safety logic shows support resources after certain answers (e.g., the "no celebrations after a very low check-in" rule), **that logic wins**; make sure the completion screen respects it in every state, and add a test.

### Meditate
- Filter chips at top, then a featured session as a hero card with a horizon-tinted abstract cover generated in code (each session gets a cover derived from the palette, so covers stay consistent without stock photos).
- Sessions as list rows: cover thumbnail, title in Figtree 600, duration and type as caption.
- **Player:** full-screen `--ink`/night gradient, large title in Fraunces, a slow breathing horizon glow that expands and contracts with the guided pace (respecting Reduce Motion — see §8), large play/pause, ±15s, time remaining. Crisis bar stays reachable.
- Completion: quiet `horizon-complete`, "Well done" style line in Fraunces, return action.

### Location
Keep every behavior and the legal-reviewed wording exactly. Restyle only: list rows, clear explanatory text in `--text-body`, and a calm illustration (stone + horizon) for the empty state. Don't add maps or new location features.

### Friends / My circle
List rows for trusted contacts with initials avatars on palette tints (no photos unless the app already uses them), clear primary action to reach out, warm empty state.

### Journal, Rediscover, Hope box
- Journal: editorial feel, entries as list rows with date eyebrow and first line in Fraunces. Writing screen is a calm `--paper` page with generous margins.
- Hope box: a gentle grid of saved items on `--paper` tiles with soft tints; the one place a slightly more personal, collage-like layout is allowed.
- Keep all wording as is.

### Onboarding and setup
- First screen: `horizon-hero` full screen, app name in Fraunces, one line of promise, primary button.
- Each setup step: one idea per screen, slim progress line, illustration from §5.2, skip where skipping exists today.
- Permission requests: explain first in our UI, then trigger the system prompt.

### Settings
Plain grouped list rows, iOS-native feel, no decoration. Crisis resources section first.

### Spanish
Every screen must work in Spanish. Spanish strings are longer: test that nothing truncates or overlaps, especially buttons, chips and the crisis bar.

### Launch screen
Fix the blank white flash at launch: use a launch screen with `--sand` (or `--sand` dark) background and a tiny horizon line, so the first frame matches the app. Measure time to interactive on the Simulator and note it for the 2-second target.

---

## 8. Phase 7 — Motion and haptics

Motion should feel like water and light: slow, smooth, never bouncy or flashy.

| Token | Value | Use |
|---|---|---|
| `--ease-tide` | `cubic-bezier(0.32, 0.72, 0, 1)` | Default |
| `--dur-quick` | 140ms | Press states |
| `--dur-base` | 260ms | Sheets, transitions |
| `--dur-slow` | 600ms | Horizon changes |
| `--dur-breath` | 4–6s cycles | Breathing glow |

- Screen transitions: gentle fade + 8px upward drift, never big slides.
- Lists: items fade in with 30ms stagger, max 6 items staggered.
- **Reduce Motion:** if the system setting is on, replace all movement with simple crossfades, stop the breathing glow from scaling (pulse opacity only, or a static state with a text cue), and disable the stagger. Add a test for this.
- Haptics (using the native haptics already added): light impact on selecting an answer, soft success on completing a check-in or meditation. **No haptics on crisis buttons** other than the system default; nothing that could be confused with an error.
- Nothing flashes more than 3 times per second, ever.

---

## 9. Phase 8 — Accessibility (required, not optional)

- All text meets WCAG AA (4.5:1 normal, 3:1 large); crisis elements meet AAA.
- Full **Dynamic Type** support up to the largest accessibility size: layouts reflow, nothing truncates crisis text, tiles become list rows at large sizes.
- **VoiceOver:** every control labeled, logical reading order, the crisis bar reachable first, mood tiles announce their word (not their color), decorative horizons and grain hidden from the accessibility tree.
- 44×44pt minimum tap targets everywhere.
- Never use color alone to show meaning (selected states also get a check icon).
- Test with Smart Invert and Increase Contrast; add a higher-contrast token set for Increase Contrast if the platform exposes it.

---

## 10. Phase 9 — Microcopy polish (decorative copy only)

You may rewrite only labels that are not reviewed content (section headers, empty states, button labels that don't change meaning). Voice:
- Warm, plain, short. Like a calm friend, not a therapist and not a coach.
- No exclamation marks except in rare genuine moments. No "Great job!", no "Crush your goals," no gamified language.
- Never guilt ("You missed yesterday," "Don't break your streak," "Don't leave a blank page").
- Second person, present tense, sentence case.

List every copy change in a table in the PR description (before → after, screen, reason), and add any that touch the meaning of anything to `notes/CONTENT-REVIEW.md` as questions instead of changing them.

---

## 11. Phase 10 — Quality bar and verification

Before calling this done:
1. Re-screenshot every screen and state from Phase 1 in light and dark, English and Spanish, iPhone SE and iPhone 17, plus the largest Dynamic Type size, into `design/after/`.
2. Create `design/COMPARISON.md` with before/after pairs for every screen.
3. Self-critique each "after" screenshot against the three tests in §1 (calm, signature, craft) and against this checklist, then fix and re-shoot anything that fails:
   - [ ] No raw hex, font size or spacing value outside the tokens file (lint passes)
   - [ ] At most one coral element per screen region
   - [ ] No red outside true error states
   - [ ] No more than two cards above the fold on any screen
   - [ ] Every screen uses the tokens' type scale; no system font fallback visible
   - [ ] Horizon signature appears on Home, check-in, completion and empty states
   - [ ] Grain is visible but subtle and never on the crisis bar
   - [ ] Crisis bar, Exit and Get Support Now meet AAA contrast, 44pt targets, visible on every screen they were on before
   - [ ] Review banners present on every page that had them
   - [ ] Streak shown as "Days you checked in this month," never resets visibly, never shows zero to a new user
   - [ ] Reduce Motion, VoiceOver, Dynamic Type and Spanish all checked
   - [ ] Launch screen matches the app, no white flash
   - [ ] No network requests added (verify with the network log)
   - [ ] All unit tests, the WebKit run and the browser run pass
4. Update `app/PROGRESS.md`, `CLAUDE.md` (add the design-token rules so future sessions follow them) and the worklog in `notes/worklogs/`.
5. Push `app/visual-identity` and open a **draft PR** into `app/redesign-dev` with: summary, the design principles, a link to `design/COMPARISON.md` (screenshots attached to the PR, not committed), the copy-change table, the checklist above with results, and open questions for the reviewer.
6. Finish with a short summary for me: what changed, what you weren't sure about, and the three screens you think are strongest and weakest.

---

## 12. Bonus, only after everything above passes — App Store screenshots

Make a set of 6 App Store screenshots (6.9" iPhone size) in `design/appstore/`:
- Each: `--sand` or horizon background with grain, a short Fraunces headline with one light-touch highlight, and a real app screen in a simple device frame.
- Suggested headlines (reviewer must approve before use): "Check in, in two minutes." / "A calm place for hard days." / "Help is always one tap away." / "Breathe when it gets loud." / "Keep the people who matter close." / "Private by design."
- No award badges, ratings, press logos or claims we can't prove. No clinical claims.
- Mark them "Draft, pending review" in the filename.

> **About this copy.** One founder wrote this build spec and sent it on November 11, 2026. The other founder
> hasn't agreed to it, and no licensed reviewer or lawyer has seen it. It was written without knowing this
> repository, so it was applied with changes: the app stays in `app/` on Capacitor, nothing merges into `main`,
> and the project's safety rules (`notes/SAFETY.md`, the root `CLAUDE.md`) win wherever they disagree with it.
> Every such choice is listed in `app/PROGRESS.md` under "Decisions made". The text below is unchanged.

# TIDELIGHT — FULL REDESIGN BUILD SPEC

> **For Claude Code.** This document is your complete instruction set. Read it fully before writing any code. Work autonomously through every phase in order. When this file and the existing code disagree, follow this file unless doing so would break an existing feature; in that case, choose the safer option and log the decision in `PROGRESS.md`.

---

## 0. MISSION

Tidelight is a calm, check-in-based wellness app that people can use **anywhere**: on the bus, at school, at home, in bed. The redesign has one goal:

> **Make Tidelight feel like Calm, Headspace and Finch: fewer words, more visuals, more touch, more delight, and zero friction.**

Every screen should pass the **3-second test**: a first-time user knows what to do within 3 seconds without reading a paragraph.

### Product principles (apply to every decision)
1. **Show, don't tell.** Use icons, animation and color before text. Never put more than 2 short lines of text on a screen unless it's a settings list.
2. **One action per screen.** Each screen has one obvious primary button.
3. **Forgiving, not punishing.** The app never guilts the user, whether about streaks, missed check-ins or skipped meditations.
4. **Works silently.** Every core feature must work with sound off and in public.
5. **Feels alive.** Taps, swipes and sliders give visual and haptic feedback.
6. **Fast.** The app opens to a usable Home screen in under 2 seconds; no screen waits on the network to render.

---

## 1. OPERATING RULES (READ BEFORE STARTING)

### 1.1 Git workflow
- Create a branch called `dev` from `main`. **Never commit to `main`.**
- For each phase, create `feature/<phase-slug>` from the latest `dev`.
- Commit in small, logical commits using this format: `phase-N: <what changed>` (e.g. `phase-3: add streak freeze logic + tests`).
- When a phase meets its Definition of Done (section 1.4), merge it into `dev` with a merge commit titled `Merge phase-N: <phase name>`.
- Never force-push. Never rewrite history on `dev`.
- Phase branch names:
  - `feature/p0-audit`
  - `feature/p1-design-nav`
  - `feature/p2-onboarding-settings`
  - `feature/p3-streaks`
  - `feature/p4-meditation-engine`
  - `feature/p5-meditation-types`
  - `feature/p6-meditation-builder`
  - `feature/p7-haptics-polish`
  - `feature/p8-final-qa`

### 1.2 PROGRESS.md protocol (critical: sessions may end mid-build)
Create `PROGRESS.md` at the repo root in Phase 0 and keep it current. **Update it after every phase AND before any step that will take a long time.** Use exactly this structure:

```
# Tidelight Build Progress
Last updated: <date/time>
Current branch: <branch>
Current phase: <N — name>
Current step: <what you were doing, specifically>

## Completed phases
- [x] Phase 0 — Audit (merged to dev)
...

## Remaining
- [ ] Phase N — ...

## Decisions made
- <decision> — <why>

## Known bugs / TODOs
- <bug> — <where> — <severity>

## Assets needed from the human
- <file> — <what it is> — <where to put it>

## Resume instructions
<exact next action a fresh session should take>
```

If a session starts and `PROGRESS.md` exists, **read it and `CLAUDE.md` first and resume from "Resume instructions"**. Do not redo completed phases.

### 1.3 Planning
- Before each phase, write a short plan (files to create or modify, data models, risks) into `PROGRESS.md` under the current phase, then execute it. Do not wait for approval; this run is autonomous.
- If something is ambiguous, pick the option that best matches the product principles in section 0, log it under "Decisions made," and keep going.

### 1.4 Definition of Done (every phase)
A phase is done only when all of the following are true:
- [ ] All acceptance criteria for the phase are met.
- [ ] The app builds and launches with zero errors and zero new warnings.
- [ ] All existing features still work (no regressions).
- [ ] Unit tests for new logic are written and passing, along with all existing tests.
- [ ] Lint and type checks pass (if the project has them; if not, add basic ones in Phase 0).
- [ ] No hard-coded colors, font sizes or spacing values; everything uses design tokens.
- [ ] Accessibility basics are done: labels on all interactive elements, Dynamic Type / font scaling respected, Reduce Motion respected.
- [ ] `PROGRESS.md` is updated.
- [ ] The phase branch is merged into `dev`.

### 1.5 What NOT to do
- Don't add new third-party dependencies when the platform or existing stack can do the job. If you must add one, prefer well-maintained, widely used libraries and log why in "Decisions made."
- Don't add analytics, tracking SDKs, ads or network calls that send user data anywhere.
- Don't delete existing user data or change storage formats without a migration.
- Don't leave placeholder "Lorem ipsum" text; write real, short copy using the voice guide in section 3.6.
- Don't block on missing audio or image assets. Use placeholders, make the code work, and list the needed assets in `PROGRESS.md`.

---

## PHASE 0 — AUDIT & FOUNDATION
**Branch:** `feature/p0-audit`

### Tasks
1. **Map the codebase.** Identify the framework (e.g. React Native/Expo, SwiftUI, Flutter), navigation library, state management, local storage method, folder structure, and every existing screen and feature (check-ins, location, friends, anything else).
2. **Write `CLAUDE.md`** at the repo root containing:
   - Stack and versions
   - How to install, run, test and build
   - Folder structure and where new code goes
   - Naming conventions and coding style (match what already exists)
   - The design token file location (created in Phase 1)
   - A one-paragraph product summary (from section 0)
3. **Create `PROGRESS.md`** per section 1.2.
4. **Set up tooling if missing:** a test runner, a linter, and type checking (if the language supports it). Keep configs minimal.
5. **Identify blockers.** List anything in the current code that will make later phases harder (e.g. no navigation library, state scattered across screens, no persistence layer). **Fix only true blockers** in this phase; log the rest.
6. **Create a storage layer** if one doesn't exist: a single module that wraps local persistence with typed get/set functions and a `schemaVersion` number for future migrations. Every later phase stores data through this module.
7. **Create a feature-flag/config module** (`config` or similar) for tunable values like streak rules, haptic intensities and default durations, so behavior can be changed in one place.

### Acceptance criteria
- `CLAUDE.md` and `PROGRESS.md` exist and are accurate.
- The app still runs exactly as before.
- The storage layer and config module exist with tests.

---

## PHASE 1 — DESIGN SYSTEM & BOTTOM TAB NAVIGATION
**Branch:** `feature/p1-design-nav`

### 1A. Design tokens
Create one theme file that every component imports. Include:

**Color (light and dark variants for each):**
| Token | Purpose | Light (suggested) | Dark (suggested) |
|---|---|---|---|
| `bg` | App background | very light sea-foam / off-white | deep navy |
| `surface` | Cards | white | slightly lighter navy |
| `primary` | Main actions | tide blue | lighter tide blue |
| `secondary` | Accents | soft teal | soft teal |
| `accentWarm` | Streaks, celebration | sunrise coral/amber | sunrise coral/amber |
| `textPrimary` | Headlines/body | near-black navy | off-white |
| `textSecondary` | Labels | muted slate | muted gray-blue |
| `success` / `warning` / `danger` | States | soft, not neon | soft, not neon |

Verify that all text/background pairs meet WCAG AA contrast (4.5:1 for body text).

**Typography:** a scale of `display`, `title`, `headline`, `body`, `label`, `caption`. Use the system font or one rounded, friendly font. All sizes must scale with the OS text-size setting.

**Spacing:** a 4-pt scale (`xs 4, sm 8, md 16, lg 24, xl 32, xxl 48`).

**Radius:** `sm 8, md 16, lg 24, full 999`. Cards use `lg`. Buttons use `full`.

**Motion:** `fast 150ms, normal 250ms, slow 400ms, breath` (driven by the breathing engine). Use ease-in-out curves. Everything respects Reduce Motion (cross-fades instead of movement).

**Elevation:** 2 levels max, soft and subtle.

### 1B. Core components
Build these reusable components and use them everywhere:
- `PrimaryButton` and `SecondaryButton`: pill-shaped, with a press animation (scale to 0.96) and a haptic hook (wired up in Phase 7; leave a no-op call now).
- `Card`: rounded, padded, optional icon, title (1 line), subtitle (1 line max).
- `BigChoiceCard`: large selectable card with an icon or illustration, a title, and a selected state. Used in onboarding and settings.
- `Stepper`: plus/minus control with a large number in the middle.
- `ProgressRing`: animated circular progress with a center label.
- `IconBadge`: for small status indicators.
- `ScreenContainer`: safe-area-aware wrapper with consistent padding and background.
- `EmptyState`: icon, one line of text, one button.

### 1C. Bottom tab navigation
Tabs, in order:
1. **Home** (icon: house or wave): dashboard
2. **Check-in** (icon: heart or circle-check)
3. **Meditate** (icon: lotus or breathing circles)
4. **Location** (icon: map pin)
5. **Friends** (icon: two people)

Requirements:
- Icons and short labels, with active and inactive states using tokens.
- The tab bar stays visible on root screens and hides during full-screen meditation.
- Each tab has its own stack so deeper screens push within the tab.
- Tapping the active tab scrolls to the top or pops to the tab root.
- Make adding a tab a one-line change (a tab config array).
- Settings is reached from a gear icon on the Home header, not a tab.

### 1D. Move existing features into tabs
- Put every existing screen in the right tab. Nothing existing gets lost.
- Tabs that don't have features yet (e.g. Friends, if empty) get an `EmptyState` with a friendly line like "Friends are coming soon 🌊".

### 1E. Text diet
Audit every existing screen and **cut on-screen text by at least 50%**:
- Replace paragraphs with icons, cards or a single line.
- Move explanations into optional "ⓘ" tooltips or info sheets.
- Headlines should be 2–5 words. Buttons should be 1–3 words.
- Log a before/after word count per screen in `PROGRESS.md`.

### 1F. Home tab layout (build the shell; later phases fill it)
From top to bottom:
1. Greeting by time of day ("Good morning") + gear icon
2. Setup progress ring (Phase 2; hidden when setup is complete)
3. Streak card (Phase 3)
4. "Next check-in" card with one tap to start
5. "Suggested for you" meditation card (Phase 5)
6. Quick actions row: Check in · Meditate · 1-min reset

### Acceptance criteria
- Zero hard-coded style values in touched files.
- Light and dark mode both look correct on every screen.
- All 5 tabs work; existing features are reachable.
- The Home shell renders with placeholders for future cards.

---

## PHASE 2 — ONBOARDING, SETUP CHECKLIST & CHECK-IN SETTINGS
**Branch:** `feature/p2-onboarding-settings`

### 2A. Onboarding flow (first launch only)
Swipeable, full-screen pages with a progress-dot indicator, a large illustration or animation per page, a headline of 5 words or fewer, an optional 1-line subtext, and one primary button. Include a "Skip" link on every page except Welcome; skipped steps stay on the setup checklist.

| # | Screen | Content | Saves |
|---|---|---|---|
| 1 | Welcome | Animated tide/wave. "Find your calm, anywhere." Button: "Let's go" | — |
| 2 | Your name | Single text field: "What should we call you?" | `user.name` (optional) |
| 3 | Check-ins per day | `Stepper` 1–5, default 3. Live preview below showing the check-in times spread across the day | `settings.checkInsPerDay` |
| 4 | Check-in times | Wake time and bedtime pickers; check-ins auto-spread evenly between them (editable later) | `settings.wakeTime`, `settings.sleepTime` |
| 5 | Check-in style | Two `BigChoiceCard`s: **Calm** 🌊 ("Gentle and slow") and **Straightforward** ⚡ ("Quick and direct"). Tapping a card plays a 2-second preview of that style's animation speed and a sample prompt | `settings.checkInStyle` |
| 6 | Location | One sentence on why (e.g. "So we can suggest the right meditation for where you are"). Button triggers the OS permission prompt. Then optionally "Set your home spot" (saves current location as Home) | `permissions.location`, `places.home` |
| 7 | Notifications | "We'll gently remind you to check in." Button triggers the OS prompt | `permissions.notifications` |
| 8 | Done | Celebration animation. "You're all set." Button: "Start" → Home | `onboarding.completed = true` |

Rules:
- Back-swipe works on every page.
- Denied permissions don't block anything; the step stays incomplete on the checklist.
- Onboarding shows only once. Add a hidden developer option in Settings, "Reset onboarding," for testing.

### 2B. Setup checklist
Track these items:
1. Name added
2. Check-in count chosen
3. Check-in style chosen
4. Location enabled
5. Home spot saved
6. Notifications enabled
7. First check-in completed
8. First meditation completed

Display:
- Home shows a `ProgressRing` labeled "Setup 5/8." Tapping it opens a sheet listing the remaining items, each with a one-tap button that completes it.
- When all items are done, play a small celebration and hide the ring permanently.
- Checklist state is derived from real app state (e.g. "Location enabled" reads the actual permission), not from stored flags that can get out of sync.

### 2C. Check-in style system (global)
Create one `styleProfile` object that the whole app reads:

| Property | Calm | Straightforward |
|---|---|---|
| Prompt wording | Soft, longer, warm ("Take a moment… how are you feeling right now?") | Short, direct ("How are you?") |
| Animation duration multiplier | 1.4× | 0.8× |
| Transitions | Slow fades | Quick slides |
| Haptic intensity (Phase 7) | Light | Medium |
| Check-in flow length | Includes an optional breath before answering | Answer immediately |
| Completion message | "Thank you for checking in with yourself 💙" | "Logged. Nice." |

All copy for both styles lives in one copy file keyed by style, so it can be edited without touching components.

### 2D. Check-in flow (rework the existing one to match the style system)
1. (Calm only) One guided breath animation (≈ 5 seconds), skippable.
2. Mood pick: 5 large emoji or illustrated faces in a row. One tap.
3. Optional quick tags: a single row of chips (e.g. Tired, Stressed, Happy, Focused, Anxious, Grateful). Multi-select, optional.
4. Optional one-line note.
5. Done screen per style, then auto-return to Home after 2 seconds.
- Total time in Straightforward mode should be **under 10 seconds**.
- Preserve any existing check-in data; migrate if the shape changes.

### 2E. Check-in reminders
- Schedule `checkInsPerDay` local notifications spread evenly between wake and sleep time.
- Notification text follows the style (Calm: "Time for a gentle check-in 🌊"; Straightforward: "Check-in time.").
- Reschedule whenever any related setting changes.
- If the user already completed that slot's check-in, skip or cancel that notification.

### 2F. Settings screen
Sections:
- **Check-ins:** per day (Stepper), wake/sleep times, style (BigChoiceCards)
- **Meditation:** default length, default sound, voice on/off, haptic breathing on/off
- **Feel:** haptics on/off, reduce animations (also follows the OS setting)
- **Places:** home spot (set/clear)
- **Notifications:** on/off and a "test notification" button
- **About:** version
- **Developer (hidden behind 7 taps on the version number):** reset onboarding, reset streak, seed fake history, show the current `PROGRESS.md` phase

### Acceptance criteria
- A fresh install shows onboarding; a second launch goes straight to Home.
- Changing the style instantly changes the check-in flow, copy and animation speed.
- Notifications schedule correctly (verify via logs or a debug screen listing scheduled notifications).
- Unit tests cover check-in time spreading, checklist derivation and style profile selection.

---

## PHASE 3 — STREAKS
**Branch:** `feature/p3-streaks`

### 3A. Rules (all values live in the config module)
- A **day** is the user's local calendar day (midnight to midnight, device time zone).
- A day is **complete** if `STREAK_RULE` is satisfied. Implement both rules and default to `"either"`:
  - `"allCheckIns"`: completed check-ins ≥ `checkInsPerDay`
  - `"either"`: (completed check-ins ≥ `checkInsPerDay`) OR (completed check-ins ≥ 1 AND meditations completed ≥ 1)
- **Current streak** = consecutive complete (or frozen) days ending today or yesterday. Today being incomplete *so far* does not break the streak until the day ends.
- **Streak freezes:**
  - Earn 1 freeze at the start of each week (Monday 00:00 local). Hold a maximum of 2.
  - If a day ends incomplete and a freeze is available, consume one automatically and mark that day `frozen`.
  - Only one freeze may be used per missed day; two missed days in a row use two freezes, if available.
- **Best streak** is stored and never decreases.
- **Changing `checkInsPerDay` mid-day** applies starting the next day (store the goal used for each day in the history).

### 3B. Data model
```
DayRecord {
  dateKey: "YYYY-MM-DD" (local)
  checkInsCompleted: number
  checkInGoal: number        // snapshot of the goal that day
  meditationsCompleted: number
  status: "complete" | "frozen" | "missed" | "inProgress"
}
StreakState {
  current: number
  best: number
  freezesAvailable: number
  lastFreezeGrantWeek: "YYYY-Www"
  lastEvaluatedDate: "YYYY-MM-DD"
}
```
- Evaluate past days lazily on app open and on returning to the foreground, so the app correctly processes days when it wasn't opened.

### 3C. UI
**Home streak card:**
- Large number + animated icon (a small wave or flame that gently moves; static under Reduce Motion)
- Label: "day streak"
- 7-day dot row (Mon–Sun): filled = complete, ❄️ = frozen, hollow = missed, pulsing = today in progress
- Small freeze indicator: "❄️ 2"
- Tapping opens the Streak detail screen.

**Streak detail screen:**
- Current and best streak
- A month calendar heatmap of complete/frozen/missed days
- How streaks work, in 2 short lines
- Freeze count and when the next one arrives

**Milestones:** 3, 7, 14, 30, 50, 100, 200 and 365 days. Show a full-screen celebration (confetti or wave-burst animation, haptic success pattern, and one line of copy). Show each milestone only once.

**Streak broken:** the next time the app opens after a break, show a gentle card (not a modal): "New wave, new start 🌊 Your best is still {best} days." No red, no guilt language.

### 3D. Tests (required)
- Complete day under both rules
- Today in progress doesn't break the streak
- A missed day with a freeze → frozen, streak continues
- A missed day without a freeze → streak resets
- Two missed days with 1 freeze → streak resets
- Weekly freeze grant, capped at 2
- The goal changes mid-day
- App not opened for 5 days → correct evaluation
- Time zone change (e.g. traveling) and daylight saving time transitions
- A midnight boundary check-in (11:59 pm vs 12:00 am)

### Acceptance criteria
- Every test above passes.
- The streak card updates immediately after a check-in or meditation.
- Developer tools can seed fake history to visually verify the heatmap.

---

## PHASE 4 — INTERACTIVE MEDITATION ENGINE
**Branch:** `feature/p4-meditation-engine`

This is the core of the app. Prioritize clean architecture; Phases 5 and 6 build entirely on top of it.

### 4A. Data model: meditations are data, not screens
```
Meditation {
  id: string
  title: string
  type: "silent" | "quick" | "deep" | "sleep" | "custom"
  totalSeconds: number
  world: "ocean" | "forest" | "nightSky"
  backgroundSound: "none" | "rain" | "ocean" | "whiteNoise" | "brownNoise"
  voiceEnabled: boolean
  hapticBreathing: boolean
  style: "calm" | "straightforward"
  segments: Segment[]
}

Segment {
  kind: "intro" | "breathing" | "bodyScan" | "silence" | "affirmation" | "outro"
  durationSeconds: number
  breathingPattern?: BreathingPattern
  voiceScriptId?: string     // key into the scripts file
  onScreenText?: string      // max ~4 words
}

BreathingPattern {
  name: string
  inhale: number   // seconds
  holdIn: number
  exhale: number
  holdOut: number
}
```
- Store meditation scripts (voice lines and on-screen text) in one scripts file keyed by `voiceScriptId` and style.

### 4B. Player architecture
- A **timeline controller** owns the clock and emits the current segment, the breath phase (`inhale | holdIn | exhale | holdOut`), phase progress (0–1), and total progress.
- **Layers subscribe to the controller** and stay independent of one another:
  1. **Visual world layer**
  2. **Breathing guide layer**
  3. **Voice layer**
  4. **Ambient sound layer**
  5. **Haptic layer**
- The timer must stay accurate even if the frame rate drops. Use monotonic time, not counted frames.
- The session must survive the screen locking or the app being backgrounded briefly: audio continues if the platform allows, and the timeline resyncs on return.

### 4C. Visual worlds (start with 3)
Each world is a full-screen animated scene that **reacts to the breath phase**:
- **Ocean:** a layered gradient sky; waves rise and swell on inhale and recede on exhale; gentle light shimmer.
- **Forest:** soft parallax tree layers; light rays brighten on inhale and dim on exhale; a few drifting particles (leaves or fireflies).
- **Night Sky:** deep gradient; stars brighten and twinkle with breath; a slow moon glow pulse.

Rules:
- Build scenes from code (gradients, shapes, simple particles), so no large image assets are required.
- Target 60 fps on mid-range phones; keep particle counts low.
- Under Reduce Motion, use slow color/brightness changes only, with no movement.
- Dim brightness automatically for the Sleep type.

### 4D. Breathing guide
- A large central circle that expands on inhale, holds, and contracts on exhale, with timing exactly matched to the pattern.
- One word inside or under it: "Breathe in" / "Hold" / "Breathe out" (Straightforward uses "In" / "Hold" / "Out").
- An optional small countdown number for each phase (toggle in Settings; off by default in Calm).
- Fade the text out after the first 3 cycles so the user can just follow the circle; fade back in if the pattern changes.

### 4E. Voice layer
- Plays the voice clip for each segment's `voiceScriptId` when `voiceEnabled` is on.
- **If no audio file exists for a script, fall back to the device's built-in text-to-speech** at a slow, calm rate and pitch. This means the feature works now, and real recordings can be dropped in later.
- Keep the clip naming convention simple, e.g. `assets/voice/<scriptId>_<style>.mp3`, and document it in `CLAUDE.md`.
- Duck (lower) the ambient sound while the voice speaks.

### 4F. Ambient sound layer
- Seamless looping with a crossfade at the loop point (no audible gap).
- **Synthesize white and brown noise in code** if the platform allows; otherwise use small loop files.
- Rain and ocean need audio files. Add short placeholder files or generated noise approximations, and list the real assets needed in `PROGRESS.md` under "Assets needed from the human" (must be royalty-free or licensed).
- Separate volume slider from the voice. Fade in over 3 seconds at the start and fade out over 5 seconds at the end.
- Respect the silent switch and audio-session rules for the platform. Silent meditations must not play any sound.

### 4G. Haptic breathing layer
- **Inhale:** a gradually strengthening pulse pattern across the inhale duration (a gentle "rising" feel).
- **Hold:** nothing, or one very light tick at the start.
- **Exhale:** a gradually fading pulse, ending with one soft tap.
- Intensity follows the style profile.
- Must work with the screen locked or dimmed if the platform allows; if not, keep the screen awake during the session (with dimming) and log the decision.
- Must be battery-conscious: no continuous vibration; use discrete, spaced pulses.

### 4H. Player screen & controls
- Full screen with the tab bar hidden. Tap anywhere to show controls for 3 seconds:
  - Pause/Resume (large, center)
  - End (top-left, with a confirmation: "End session?")
  - Sound / voice / haptics quick toggles (top-right)
  - A thin progress bar along the bottom
- Keep the screen awake during the session.
- When finished, show a **completion screen**: a soft celebration, minutes meditated, a "How do you feel now?" mood pick (optional, 5 faces), and buttons for Done and Save as favorite.
- Completion records a `MeditationSession` (id, meditationId, startedAt, completedSeconds, completed: boolean, moodAfter?) and increments today's `meditationsCompleted` **only if at least 60% was completed**.
- Update the setup checklist ("First meditation completed").

### 4I. Tests
- Timeline produces correct segment and phase sequences for given inputs.
- Total duration is exact (within 1 second).
- Pause/resume keeps the timing correct.
- The 60% completion rule.
- Fallback to TTS when a clip is missing.

### Acceptance criteria
- A hard-coded sample meditation plays end to end with all 5 layers working together and staying in sync.
- Each layer can be toggled independently mid-session.
- No audio plays when sound is off.

---

## PHASE 5 — MEDITATION TYPES & SMART SUGGESTIONS
**Branch:** `feature/p5-meditation-types`

### 5A. Built-in types
Define each as data using the engine:

| Type | Card label | Length | Audio | Haptics | Default world | Pattern | Structure |
|---|---|---|---|---|---|---|---|
| **Silent** | "Silent · anywhere" 🤫 | 3 or 5 min | None (forced off) | On | Ocean | Calm 4-0-6-0 | intro text → breathing → outro text |
| **Quick Reset** | "1-minute reset" ⚡ | 1 min | Optional | On | Forest | Box 4-4-4-4 | 5-sec intro → breathing → 5-sec outro |
| **Deep Session** | "Deep session" 🌊 | 10, 15 or 20 min | Voice + ambient | Optional | Ocean | 4-0-6-0 → body scan → silence | intro → breathing → body scan → silence → breathing → outro |
| **Sleep** | "Sleep" 🌙 | 10 or 20 min | Voice (very soft) + ambient, auto-fades | Off by default | Night Sky | 4-0-8-0 (slows over time) | intro → slowing breaths → body scan → long silence; audio fades over the final 3 min; no completion screen (just fades to dark) |

- Each type card shows its icon, its name, the length chip(s), and a one-tap start button.
- Long-pressing a card shows a quick options sheet (length, world, sound).

### 5B. Meditate tab layout
1. **"Suggested for you"**: one large hero card (see 5C)
2. **Types**: 2×2 grid of big cards
3. **Your presets**: horizontal scroll (filled in Phase 6; empty state with a "Build your own" CTA)
4. **"Build your own"**: prominent card leading to the builder (Phase 6)
5. **History**: link to a simple list of past sessions and total minutes

### 5C. Smart suggestion logic
One pure, easy-to-edit, fully tested function: `suggestMeditation(context) → { type, reason }`.

Context inputs: local time, whether headphones/Bluetooth audio is connected, whether the user is near their saved home spot (within ~150 m, if location is permitted), the device silent switch (if readable), and recent sessions.

Priority rules (first match wins):
1. Between 9:30 pm and 4:00 am → **Sleep** ("Winding down")
2. At home AND (headphones OR not silent) → **Deep Session** ("You're home, take your time")
3. Headphones connected AND not at home → **Quick Reset** with voice ("Quick reset on the go")
4. Otherwise → **Silent** ("Silent and ready anywhere")
5. If the user already did the suggested type today, suggest the next best one.

- Show the `reason` as a single short line on the hero card.
- If location isn't permitted, skip location rules quietly.
- Location checks happen on demand only, with no background tracking.

### 5D. Tests
- Each suggestion rule, including fallbacks when permissions are missing.
- That Silent never plays audio regardless of settings.

### Acceptance criteria
- All 4 types play correctly through the engine.
- The suggestion changes correctly when context changes (verify with dev tools that override the context).

---

## PHASE 6 — CUSTOM MEDITATION BUILDER
**Branch:** `feature/p6-meditation-builder`

### 6A. Builder screen layout (single scrolling screen, minimal text)
1. **Live preview** (top, ~35% of the screen height): the chosen world animating with the chosen breathing pattern on loop, at small scale.
2. **Length slider:** 1–30 minutes, snapping to whole minutes. Show a big number above the thumb ("12 min"). Haptic tick on every minute (Phase 7).
3. **Situation** (sets the breathing pattern), as `BigChoiceCard`s in a horizontal row:

| Situation | Pattern (in-hold-out-hold) | Notes |
|---|---|---|
| 😮‍💨 Stressed | 4-7-8-0 | Limit to 4 consecutive cycles, then alternate with 4-0-6-0 so it's comfortable for beginners |
| 🎯 Focus | 4-4-4-4 (box) | — |
| ⚡ Energize | 4-0-2-0 | Max 2 minutes of this pattern, then ease into 4-0-4-0 |
| 😴 Sleep | 4-0-8-0, gradually lengthening the exhale toward 10 | — |
| 🌊 Just breathe | 4-0-6-0 | Default |

4. **Sound:** icon chips (None, Rain, Ocean, White noise, Brown noise). Tapping a chip previews 3 seconds of the sound.
5. **World:** three thumbnail cards (Ocean, Forest, Night Sky).
6. **Toggles:** Voice guide, Haptic breathing, Body scan (only shown for 8+ minutes).
7. **Style:** Calm / Straightforward (defaults to the global style).
8. **Buttons:** "Start" (primary) and "Save preset" (secondary).

### 6B. Generation algorithm
`generateMeditation(choices) → Meditation`. It must be a pure function with full unit test coverage.

```
T = lengthMinutes * 60

intro  = clamp(round(0.10 * T), 20, 60)     // seconds
outro  = clamp(round(0.08 * T), 15, 45)
body   = T - intro - outro

if bodyScan enabled and lengthMinutes >= 8:
    scan = clamp(round(0.25 * body), 90, 300)
else:
    scan = 0

silence = 0
if lengthMinutes >= 10:
    silence = clamp(round(0.15 * body), 60, 240)

breathingTime = body - scan - silence

cycleLength = inhale + holdIn + exhale + holdOut
cycles      = floor(breathingTime / cycleLength)
remainder   = breathingTime - cycles * cycleLength
silence    += remainder            // so the total is EXACTLY T

Segment order:
  < 8 min:   intro → breathing → (silence if any) → outro
  8–15 min:  intro → breathing(60%) → bodyScan → breathing(40%) → silence → outro
  > 15 min:  intro → breathing(40%) → bodyScan → silence(50%) → breathing(30%) → silence(50%) → breathing(30%) → outro
  (split breathing cycles by whole cycles, never mid-cycle)

Apply pattern-specific rules (Stressed alternation, Energize cap, Sleep lengthening).
Pick voice script IDs based on segment kind + style.
Set the title automatically, e.g. "12-min Focus · Forest"
```

Tests must verify:
- Total duration equals T exactly for every length from 1 to 30 and every situation (a property-style test looping over all combinations).
- No segment has a negative or zero duration.
- Breathing segments contain whole cycles only.
- The Stressed, Energize and Sleep special rules hold.
- Body scan appears only when enabled and at 8+ minutes.
- 1-minute sessions still produce valid intro, breathing and outro segments (shrink intro and outro proportionally below the clamps if needed, and test this edge case).

### 6C. Presets
- "Save preset" asks for a name (keyboard opens immediately, suggested name pre-filled, 24-character max).
- Presets store the **choices**, not the generated meditation, and regenerate on start so algorithm improvements apply automatically.
- Presets appear on the Meditate tab ("Your presets") and can be renamed, edited (reopens the builder pre-filled), duplicated or deleted (with confirmation).
- Max 20 presets.
- Suggest 2 starter presets on first visit, e.g. "Bus ride" (Silent-style: 5 min, haptics on, no sound, Just breathe) and "Before bed" (15 min, Sleep, rain, voice on).

### Acceptance criteria
- Every combination of builder choices generates and plays correctly.
- The preview updates instantly when the world or situation changes.
- Presets persist across app restarts.

---

## PHASE 7 — HAPTICS & INTERACTION POLISH
**Branch:** `feature/p7-haptics-polish`

### 7A. Haptics helper
Create one module with named patterns. Components never call the platform haptics API directly.

| Pattern | Use | Calm | Straightforward |
|---|---|---|---|
| `tap` | Buttons, chips | light | light |
| `select` | Selection change, tab switch | selection | selection |
| `sliderTick` | Each minute on the length slider; Stepper changes | very light | light |
| `toggle` | Switches | light | medium |
| `success` | Check-in done, meditation done, setup complete | soft success | success |
| `milestone` | Streak milestones | a 3-pulse celebratory sequence | same, stronger |
| `breatheIn` / `breatheOut` | Haptic breathing (Phase 4) | per 4G | per 4G |
| `warning` | Destructive confirmation | light warning | warning |

- A global "Haptics" setting turns off everything except haptic breathing, which has its own toggle.
- Do nothing on devices without haptic support (no crashes).
- Throttle haptics so the same pattern can't fire more than once per 50 ms (important for the slider).

### 7B. Wire haptics everywhere
- All buttons and cards (`tap`)
- Tab bar (`select`)
- Builder length slider (`sliderTick` on each whole minute, plus a slightly stronger tick at 5, 10, 15, 20, 25 and 30)
- Stepper (`sliderTick`)
- All toggles (`toggle`)
- Mood faces and chips in check-in (`select`)
- Check-in complete, meditation complete, setup complete (`success`)
- Streak milestones (`milestone`)
- Onboarding page changes (`select`)
- Pull-to-refresh, if used (`tap` at the threshold)

### 7C. Motion & micro-interactions
- Press states: everything tappable scales to 0.96 on press, with a spring back on release.
- Screen transitions follow the style profile speed.
- Number changes animate (streak count, slider value, setup ring).
- Skeleton or placeholder shimmer instead of spinners anywhere data loads.
- Celebrations: one shared confetti/wave-burst component with consistent use.
- Everything respects Reduce Motion.

### 7D. Performance & battery
- No dropped frames during transitions on a mid-range device; profile the meditation player specifically.
- No timers or animations running on screens that aren't visible.
- No haptics firing in the background except haptic breathing during an active session.

### Acceptance criteria
- Every interaction in the 7B list has haptics, and turning off haptics silences them.
- A full checklist of every changed interaction is written to `PROGRESS.md`.

---

## PHASE 8 — FINAL QA & HANDOFF
**Branch:** `feature/p8-final-qa`

1. **Full regression pass:** walk every screen in light and dark mode at the smallest and largest text sizes, with Reduce Motion on and off.
2. **Fresh-install test:** delete the app data and run onboarding end to end with all permissions granted, then again with all permissions denied.
3. **Data migration test:** confirm data from the pre-redesign version still loads.
4. **Accessibility:** every interactive element has a screen-reader label; every key flow (check-in, start meditation, change settings) works with VoiceOver/TalkBack.
5. **Clean up:** remove dead code, unused assets and console logs; make sure lint and tests are green.
6. **Update `CLAUDE.md`** with the new architecture: tabs, design system, storage keys, meditation engine, builder algorithm, haptics helper, and the config module.
7. **Write `TESTING_CHECKLIST.md`**: a step-by-step checklist the human should run **on a real phone** (haptics, audio, notifications and location don't fully work in simulators). Group it by feature, with checkboxes, expected results, and a "what to try if it fails" note for each.
8. **Write `CHANGELOG.md`**: a summary of everything that changed, grouped by phase.
9. **Final `PROGRESS.md` update:** all phases checked, plus known issues and the list of assets needed (voice recordings, rain/ocean loops).
10. **Merge `feature/p8-final-qa` into `dev`. Do NOT merge into `main`.** The human merges `dev` into `main` after testing on a real phone.

### Final summary to print when completely done
- Phases completed
- Files created and modified (counts per phase)
- Test count and pass rate
- Known issues
- Assets the human needs to add, and where
- The exact next steps for the human

---

## 3. GLOBAL STANDARDS (apply in every phase)

### 3.1 Architecture
- Separate UI, logic and storage. Pure logic (streaks, suggestions, the generation algorithm, notification spreading) lives in plain modules with no UI imports, so it can be unit tested.
- One source of truth for each piece of state.
- Every tunable number lives in the config module.

### 3.2 Persistence keys
Namespace all stored keys (e.g. `tidelight.settings`, `tidelight.streak`, `tidelight.days`, `tidelight.sessions`, `tidelight.presets`, `tidelight.onboarding`). Bump `schemaVersion` and add a migration whenever a stored shape changes.

### 3.3 Privacy
- Location is used only on demand for suggestions and the home spot. No background tracking, no sending location anywhere.
- All data stays on the device.

### 3.4 Accessibility
- Minimum tap target of 44×44 pt.
- Never use color alone to convey meaning (streak dots also differ in shape or icon).
- All animations have Reduce Motion fallbacks.
- Screen-reader labels describe the action, e.g. "Start 5-minute silent meditation."

### 3.5 Error handling
- Never show raw errors to users. Show a friendly one-liner plus a retry option where relevant.
- Log errors in development builds only.

### 3.6 Voice & copy guide
- Warm, short and human. Use second person ("you").
- Headlines: 2–5 words. Buttons: 1–3 words. Body: 1 line, 2 max.
- No guilt, no pressure, no exclamation-point spam (at most one per screen).
- Emojis are allowed sparingly as icons (🌊 🌙 ⚡ 🤫 ❄️ 💙), never more than one per line.
- Calm style is softer and slower; Straightforward is clipped and efficient. Both are kind.

---

## 4. START COMMAND
1. If `PROGRESS.md` exists, read it and `CLAUDE.md`, then follow "Resume instructions."
2. Otherwise, create the `dev` branch and begin Phase 0.
3. Work through every phase in order without stopping for approval. Update `PROGRESS.md` constantly. Finish with Phase 8 and the final summary.

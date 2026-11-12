# Audit before the visual redesign

November 11, 2026, on `app/redesign-dev` at commit `0372e68`. 400 pictures in `before/` (not
committed): every screen below, in English and Spanish, light and dark, at 375 by 667 and 402 by
874, plus two passes at the largest text size. Desktop Chromium, not a phone. Nothing was changed
in this phase.

## What looks generic, everywhere

- **No identity.** System font throughout the new screens, a serif from the website on the older
  ones. Navy on near-white. Nothing a person would recognize with the logo covered.
- **One shape for everything.** Every surface is a white card with a 24-point radius, a hairline
  border, and a shadow: the setup card, the streak card, the next check-in card, the suggestion,
  every row on Check-in, every meditation type, every preset, every settings group.
- **Two looks in one app.** New screens use the `--tl-*` tokens; the older sections (Daily check-in,
  Journal, Rediscover, Hope box, Your journey, Places, My circle, the age question) use the
  website's Shoreline styles: square buttons, a different blue, a different text color, serif
  headings. Moving from Check-in to Journal feels like changing apps.
- **The top 40% is chrome.** Crisis strip, header, Get Support Now, and the language link come
  before any screen starts. All of it has to stay (a founder's rule 1); it can be calmer and more
  of a piece.
- **Emoji as artwork.** 🌊 ⚡ 🤫 🌙 😮‍💨 🎯 😴 ❄️ stand in for icons on style cards, type cards,
  situation cards, and the freeze badge. They render differently on every phone.
- **No texture and little motion.** Flat fills; the only movement is a fade between screens, a
  bobbing wave icon, and the onboarding blobs.

## Screen by screen

| Screen | What is generic, inconsistent, or cramped |
| --- | --- |
| Onboarding welcome, done | Three rotating blobs read as a loading animation. The headline is the only thing with character |
| Onboarding steps | Icon in a circle, title, field, button: a form wizard. Dots, Back, and Skip crowd one row at large text |
| Age question | The website's bordered box inside the new flow: square button, green border, different type |
| Home | Four stacked cards of equal weight (setup, streak, next check-in, suggestion), then three outlined pills. Nothing says what to do first. "0/8" and "0 day streak" greet a new person with two zeros |
| Check-in tab | A hero card and five identical rows |
| Quick check-in | Five line faces in a row; the saddest face is the first thing under the question. Chips and field are stock |
| Check-in done | A tick in a circle and a line of text |
| Support after a very low mood | Clear and plain, which is right. The outlined box looks like every other card |
| Streak screen | Two big numbers ("Now", "Best"), a calendar of ticks, snowflakes, and dashed rings: a scoreboard |
| Settings | Six white panels of controls; chips, steppers, and switches at three different densities |
| Daily check-in, Journal, Rediscover, Hope box, Your journey | Website styles: fine on a web page, foreign in the app. Long forms with square buttons |
| Meditate | A hero card, a two-by-two grid of cramped cards (chips wrap to three lines at 375), presets as a row of tall panels, two more cards |
| Builder | The preview is good. Below it, choice cards, chips, a panel of switches, more chips: five control styles in one scroll |
| Player | The strongest screen. The controls are generic pills, and the ocean world is bands of waves |
| Completion | The same tick in a circle as the check-in |
| Location, Friends | A title and the website-styled section under it |
| Crisis strip | Tide-blue bar, white text, an outlined Exit. Clear. Its blue is not the app's ink |
| Draft notices | A dashed amber box from the website. Readable, heavy, and twice on every screen |
| Tab bar | Five line icons with labels; the active one is only a darker blue |
| Launch | A white screen for a moment before the first page (seen in the Simulator) |

## Raw values found

- **`src/tokens.css`**: every color, size, radius, and duration of the new screens. Correct place.
- **`src/redesign.css`**: no raw colors (the lint enforces it). Raw numbers that are not sizes of
  type or space remain: `opacity` values, `letter-spacing: 0.04em`, `stroke-width`, scale factors
  such as `scale(1.4)` and `scale(3.6)`, one easing curve written out
  (`cubic-bezier(0.34, 1.56, 0.64, 1)`), and `aspect-ratio`.
- **`src/ui/worlds.js`**: raw hex and `rgba()` colors on 15 lines, for the three meditation worlds.
- **`src/ui/celebrate.js`**: colors come from tokens; sizes and speeds of the drops are raw numbers.
- **`src/app.css`, `src/extras.css`** (the older app layer): no raw colors; 114 raw pixel
  values (`20px` padding, `44px` heights, `2px` borders, `24px` checkboxes, `1.1rem` type).
- **`src/app-safe-area.css`**: one `2px`.
- **The website's `assets/styles.css`**, which styles the older sections inside the app: its own
  variables plus hundreds of raw pixel values and a few raw colors in its dark mode. It is the
  website's file and is not edited here; the app overrides it from its own stylesheets.
- **Radii in use:** 0 (website buttons), 8, 10, 14, 16, 24, 999. **Type sizes in use:** 13, 15,
  16, 17 (iPhone body), 19, 24, 36, 56, plus the website's `clamp()` sizes.

## One-off components

The setup card and its inline list; the streak card, its week row, and the snowflake badge; the
milestone and "new start" cards; the meditation type panel; the preset panel; the builder's
slider; the player's scene buttons and chips; the five-face mood row; the onboarding dots and
blobs; the support box; the history rows. Each has its own rules in `redesign.css`.

# Tokens: final colors and measured contrast

Made by `node tools/token-report.mjs` from `src/tokens.css`. The unit test
`test/unit/tokens.test.mjs` fails if any pair below falls under its minimum.

## Changes from the brief's starting values

- `--coral` is #C2523B, not #C9573F: white text on #C9573F measured 4.27 to 1, under the 4.5 needed.
- `--ink-faint` is #5C6E77, not #6E8089: #6E8089 on `--sand` measured 3.59 to 1.
- Added: `--rule` (hairlines and field borders; `--shell` on `--sand` is too faint for a field's edge),
  `--coral-deep` (coral as text), `--coral-press`, `--seafoam-deep`, `--water`, `--crisis-bg` and
  `--crisis-text` (fixed, so the strip stays dark in dark mode), dark values for the soft tints, and
  the `--scene-*` colors of the meditation worlds.
- Lightness was changed, never hue.

## Colors

| Token | Light | Dark |
| --- | --- | --- |
| `--ink` | #10272F | #F1EBE1 |
| `--ink-soft` | #3E5560 | #C3BDB3 |
| `--ink-faint` | #5C6E77 | #948F87 |
| `--sand` | #F5EFE5 | #0E1C22 |
| `--paper` | #FBF8F2 | #152830 |
| `--shell` | #ECE3D4 | #21363F |
| `--rule` | #D8CCB9 | #32495A |
| `--coral` | #C2523B | #E58468 |
| `--coral-press` | #A9432F | #D2755A |
| `--coral-deep` | #9A3B28 | #F0A08A |
| `--coral-soft` | #F3D2C4 | #4A2B23 |
| `--dawn` | #F2C7A2 | #8A5A43 |
| `--water` | #DDD9CE | #0A161B |
| `--seafoam` | #2E6E68 | #7FC2B7 |
| `--seafoam-deep` | #235650 | #9AD3C9 |
| `--seafoam-soft` | #D3E6E0 | #1F3F3C |
| `--focus` | #1F6FB2 | #7DB8EC |
| `--error` | #A63A2B | #F0A39E |
| `--crisis-bg` | #10272F | #081318 |
| `--crisis-text` | #FBF8F2 | #F1EBE1 |
| `--mood-1` | #8DB7C6 | #8DB7C6 |
| `--mood-2` | #A6C8B4 | #A6C8B4 |
| `--mood-3` | #E3C27F | #E3C27F |
| `--mood-4` | #B3A3C6 | #B3A3C6 |
| `--mood-5` | #7C8BA2 | #7C8BA2 |

## Contrast

| Pair | Light | Ratio | Dark | Ratio | Minimum |
| --- | --- | --- | --- | --- | --- |
| `--crisis-text` on `--crisis-bg` | #FBF8F2 on #10272F | 14.64 | #F1EBE1 on #081318 | 15.86 | 7 |
| `--ink` on `--sand` | #10272F on #F5EFE5 | 13.57 | #F1EBE1 on #0E1C22 | 14.66 | 7 |
| `--ink` on `--paper` | #10272F on #FBF8F2 | 14.64 | #F1EBE1 on #152830 | 12.85 | 7 |
| `--ink` on `--shell` | #10272F on #ECE3D4 | 12.20 | #F1EBE1 on #21363F | 10.64 | 4.5 |
| `--ink` on `--coral-soft` | #10272F on #F3D2C4 | 10.96 | #F1EBE1 on #4A2B23 | 10.66 | 4.5 |
| `--ink` on `--seafoam-soft` | #10272F on #D3E6E0 | 11.94 | #F1EBE1 on #1F3F3C | 9.65 | 4.5 |
| `--ink` on `--water` | #10272F on #DDD9CE | 11.00 | #F1EBE1 on #0A161B | 15.49 | 4.5 |
| `--ink-soft` on `--sand` | #3E5560 on #F5EFE5 | 6.87 | #C3BDB3 on #0E1C22 | 9.31 | 4.5 |
| `--ink-soft` on `--paper` | #3E5560 on #FBF8F2 | 7.41 | #C3BDB3 on #152830 | 8.16 | 4.5 |
| `--ink-soft` on `--shell` | #3E5560 on #ECE3D4 | 6.17 | #C3BDB3 on #21363F | 6.76 | 4.5 |
| `--ink-soft` on `--seafoam-soft` | #3E5560 on #D3E6E0 | 6.05 | #C3BDB3 on #1F3F3C | 6.13 | 4.5 |
| `--ink-faint` on `--sand` | #5C6E77 on #F5EFE5 | 4.65 | #948F87 on #0E1C22 | 5.41 | 4.5 |
| `--ink-faint` on `--paper` | #5C6E77 on #FBF8F2 | 5.01 | #948F87 on #152830 | 4.74 | 4.5 |
| `--on-coral` on `--coral` | #FFFFFF on #C2523B | 4.60 | #0E1C22 on #E58468 | 6.48 | 4.5 |
| `--on-coral` on `--coral-press` | #FFFFFF on #A9432F | 5.95 | #0E1C22 on #D2755A | 5.33 | 4.5 |
| `--coral-deep` on `--sand` | #9A3B28 on #F5EFE5 | 6.06 | #F0A08A on #0E1C22 | 8.36 | 4.5 |
| `--coral-deep` on `--paper` | #9A3B28 on #FBF8F2 | 6.54 | #F0A08A on #152830 | 7.33 | 4.5 |
| `--seafoam` on `--sand` | #2E6E68 on #F5EFE5 | 5.18 | #7FC2B7 on #0E1C22 | 8.53 | 4.5 |
| `--seafoam` on `--paper` | #2E6E68 on #FBF8F2 | 5.59 | #7FC2B7 on #152830 | 7.48 | 4.5 |
| `--seafoam` on `--seafoam-soft` | #2E6E68 on #D3E6E0 | 4.56 | #7FC2B7 on #1F3F3C | 5.62 | 4.5 |
| `--on-seafoam` on `--seafoam` | #FFFFFF on #2E6E68 | 5.92 | #0E1C22 on #7FC2B7 | 8.53 | 4.5 |
| `--error` on `--sand` | #A63A2B on #F5EFE5 | 5.63 | #F0A39E on #0E1C22 | 8.64 | 4.5 |
| `--error` on `--paper` | #A63A2B on #FBF8F2 | 6.07 | #F0A39E on #152830 | 7.57 | 4.5 |
| `--focus` on `--sand` | #1F6FB2 on #F5EFE5 | 4.62 | #7DB8EC on #0E1C22 | 8.23 | 3 |
| `--focus` on `--paper` | #1F6FB2 on #FBF8F2 | 4.98 | #7DB8EC on #152830 | 7.21 | 3 |
| `--on-scene` on `--scene-ink-mid` | #FFFFFF on #14323C | 13.54 | #FFFFFF on #14323C | 13.54 | 7 |
| `--on-scene` on `--scene-forest-mid` | #FFFFFF on #234A3B | 9.93 | #FFFFFF on #234A3B | 9.93 | 7 |
| `--on-scene` on `--scene-night-mid` | #FFFFFF on #0F2233 | 16.19 | #FFFFFF on #0F2233 | 16.19 | 7 |

The mood tones are swatches and tints. No text sits on them.

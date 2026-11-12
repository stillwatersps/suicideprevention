// Writes design/TOKENS.md: the final colors and the measured contrast of every pair the unit
// test checks. Run: node tools/token-report.mjs
import { writeFileSync } from 'node:fs';
import { light, dark, contrast, PAIRS } from '../test/unit/tokens.test.mjs';

const row = ([fg, bg, least]) => `| \`--${fg}\` on \`--${bg}\` | ${light[fg]} on ${light[bg]} | ${contrast(light[fg], light[bg]).toFixed(2)} | ${dark[fg]} on ${dark[bg]} | ${contrast(dark[fg], dark[bg]).toFixed(2)} | ${least} |`;
const names = ['ink', 'ink-soft', 'ink-faint', 'sand', 'paper', 'shell', 'rule', 'coral', 'coral-press', 'coral-deep', 'coral-soft', 'dawn', 'water', 'seafoam', 'seafoam-deep', 'seafoam-soft', 'focus', 'error', 'crisis-bg', 'crisis-text', 'mood-1', 'mood-2', 'mood-3', 'mood-4', 'mood-5'];
const text = `# Tokens: final colors and measured contrast

Made by \`node tools/token-report.mjs\` from \`src/tokens.css\`. The unit test
\`test/unit/tokens.test.mjs\` fails if any pair below falls under its minimum.

## Changes from the brief's starting values

- \`--coral\` is ${light.coral}, not #C9573F: white text on #C9573F measured 4.27 to 1, under the 4.5 needed.
- \`--ink-faint\` is ${light['ink-faint']}, not #6E8089: #6E8089 on \`--sand\` measured 3.59 to 1.
- Added: \`--rule\` (hairlines and field borders; \`--shell\` on \`--sand\` is too faint for a field's edge),
  \`--coral-deep\` (coral as text), \`--coral-press\`, \`--seafoam-deep\`, \`--water\`, \`--crisis-bg\` and
  \`--crisis-text\` (fixed, so the strip stays dark in dark mode), dark values for the soft tints, and
  the \`--scene-*\` colors of the meditation worlds.
- Lightness was changed, never hue.

## Colors

| Token | Light | Dark |
| --- | --- | --- |
${names.map((n) => `| \`--${n}\` | ${light[n]} | ${dark[n]} |`).join('\n')}

## Contrast

| Pair | Light | Ratio | Dark | Ratio | Minimum |
| --- | --- | --- | --- | --- | --- |
${PAIRS.map(row).join('\n')}

The mood tones are swatches and tints. No text sits on them.
`;
writeFileSync(new URL('../design/TOKENS.md', import.meta.url), text);
console.log('Wrote design/TOKENS.md.');

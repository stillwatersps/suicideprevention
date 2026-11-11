// The design tokens: every text and background pair meets WCAG AA in light and dark, and the
// crisis strip and crisis buttons meet AAA (7 to 1). tools/token-report.mjs writes the same
// numbers to design/TOKENS.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../src/tokens.css', import.meta.url), 'utf8');
export function tokens(block) {
  const out = {};
  for (const m of block.matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})\b/g)) out[m[1]] = m[2];
  return out;
}
const darkAt = css.indexOf('@media (prefers-color-scheme: dark)');
const moreAt = css.indexOf('@media (prefers-contrast: more)');
export const light = tokens(css.slice(0, darkAt));
export const dark = { ...light, ...tokens(css.slice(darkAt, moreAt)) };

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [text, background, the least it must reach]
export const PAIRS = [
  ['crisis-text', 'crisis-bg', 7], // the crisis strip and Exit
  ['crisis-btn-text', 'crisis-btn-bg', 7], // Get Support Now, Call 988
  ['crisis-btn-bg', 'sand', 7], // a crisis button stands out from the page itself, light or dark
  ['crisis-btn-bg', 'paper', 7],
  ['ink', 'sand', 7], ['ink', 'paper', 7], ['ink', 'shell', 4.5], ['ink', 'coral-soft', 4.5], ['ink', 'seafoam-soft', 4.5], ['ink', 'water', 4.5],
  ['ink-soft', 'sand', 4.5], ['ink-soft', 'paper', 4.5], ['ink-soft', 'shell', 4.5], ['ink-soft', 'seafoam-soft', 4.5],
  ['ink-faint', 'sand', 4.5], ['ink-faint', 'paper', 4.5],
  ['on-coral', 'coral', 4.5], ['on-coral', 'coral-press', 4.5],
  ['coral-deep', 'sand', 4.5], ['coral-deep', 'paper', 4.5],
  ['seafoam', 'sand', 4.5], ['seafoam', 'paper', 4.5], ['seafoam', 'seafoam-soft', 4.5], ['on-seafoam', 'seafoam', 4.5],
  ['error', 'sand', 4.5], ['error', 'paper', 4.5],
  ['focus', 'sand', 3], ['focus', 'paper', 3], // a focus ring is a graphic: 3 to 1
  ['on-scene', 'scene-ink-mid', 7], ['on-scene', 'scene-forest-mid', 7], ['on-scene', 'scene-night-mid', 7],
];

for (const [name, set] of [['light', light], ['dark', dark]]) {
  test(`${name} mode: every text and background pair passes, and crisis parts reach 7 to 1`, () => {
    for (const [fg, bg, least] of PAIRS) {
      assert.ok(set[fg] && set[bg], `missing token ${fg} or ${bg}`);
      const ratio = contrast(set[fg], set[bg]);
      assert.ok(ratio >= least, `${name}: ${fg} on ${bg} is ${ratio.toFixed(2)} to 1, needs ${least}`);
    }
  });
}

test('there is one accent, no pure black or white surfaces, and red is for errors only', () => {
  for (const set of [light, dark]) {
    for (const name of ['sand', 'paper', 'shell', 'ink', 'crisis-bg']) assert.ok(!/^#(000000|FFFFFF)$/i.test(set[name]), `${name} is not pure black or white`);
  }
  const uses = (css.match(/var\(--error\)/g) || []).length;
  assert.equal(uses, 1, '--error is used once in the token file (the old "danger" alias) and nowhere as a mood or streak color');
  assert.equal(Object.keys(light).filter((k) => /^mood-\d$/.test(k)).length, 5);
});

test('the scales are the brief\'s: 4-point spacing, four radii, tide easing, both fonts bundled', () => {
  const rem = (name) => Number((css.match(new RegExp(`--${name}:\\s*([0-9.]+)rem`)) || [])[1]) * 16;
  assert.deepEqual([4, 8, 12, 16, 20, 24, 32, 40, 56, 72].map((n) => rem('space-' + n)), [4, 8, 12, 16, 20, 24, 32, 40, 56, 72]);
  assert.deepEqual(['sm', 'md', 'lg'].map((n) => rem('radius-' + n)), [10, 18, 28]);
  assert.deepEqual(['display', 'title', 'heading', 'body-lg', 'body', 'label', 'caption', 'eyebrow'].map((n) => rem('text-' + n)), [34, 26, 20, 18, 16, 14, 13, 12]);
  assert.equal(rem('tap'), 44);
  assert.equal(rem('button'), 52);
  assert.match(css, /--ease-tide: cubic-bezier\(0\.32, 0\.72, 0, 1\)/);
  assert.match(css, /url\("fonts\/Fraunces-latin\.woff2"\)/);
  assert.match(css, /url\("fonts\/Figtree-latin\.woff2"\)/);
  assert.ok(!/https?:\/\//.test(css), 'no font or anything else comes from another site');
  for (const file of ['Fraunces-latin.woff2', 'Figtree-latin.woff2', 'Fraunces-OFL.txt', 'Figtree-OFL.txt']) assert.ok(readFileSync(new URL('../../src/fonts/' + file, import.meta.url)).length > 1000, file);
});

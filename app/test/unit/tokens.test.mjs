// The design tokens: every text and background pair meets WCAG AA, in light and dark.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../src/tokens.css', import.meta.url), 'utf8');
function tokens(block) {
  const out = {};
  for (const m of block.matchAll(/--tl-([a-z-]+):\s*(#[0-9A-Fa-f]{6})\b/g)) out[m[1]] = m[2];
  return out;
}
const darkAt = css.indexOf('@media (prefers-color-scheme: dark)');
const light = tokens(css.slice(0, darkAt));
const dark = { ...light, ...tokens(css.slice(darkAt)) };

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const PAIRS = [
  ['text-primary', 'bg'], ['text-primary', 'surface'], ['text-secondary', 'bg'], ['text-secondary', 'surface'],
  ['on-primary', 'primary'], ['primary', 'bg'], ['primary', 'surface'], ['primary', 'secondary-soft'],
  ['secondary', 'bg'], ['secondary', 'surface'], ['secondary', 'secondary-soft'],
  ['text-primary', 'secondary-soft'], ['text-secondary', 'secondary-soft'],
  ['accent-warm', 'surface'], ['accent-warm', 'bg'], ['accent-warm', 'accent-warm-soft'], ['text-primary', 'accent-warm-soft'],
  ['success', 'surface'], ['warning', 'surface'], ['warning', 'bg'], ['danger', 'surface'], ['danger', 'bg'],
];

for (const [name, set] of [['light', light], ['dark', dark]]) {
  test(`${name} mode: every text and background pair is at least 4.5 to 1`, () => {
    for (const [fg, bg] of PAIRS) {
      assert.ok(set[fg] && set[bg], `missing token ${fg} or ${bg}`);
      const ratio = contrast(set[fg], set[bg]);
      assert.ok(ratio >= 4.5, `${name}: ${fg} on ${bg} is ${ratio.toFixed(2)} to 1`);
    }
  });
}

test('the spacing scale is the 4-point scale, and radius and motion tokens exist', () => {
  const rem = (name) => Number((css.match(new RegExp(`--tl-${name}:\\s*([0-9.]+)rem`)) || [])[1]) * 16;
  assert.deepEqual(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map((n) => rem('space-' + n)), [4, 8, 16, 24, 32, 48]);
  assert.deepEqual(['sm', 'md', 'lg'].map((n) => rem('radius-' + n)), [8, 16, 24]);
  for (const name of ['radius-full', 'fast', 'normal', 'slow', 'ease', 'elev-1', 'elev-2', 'tap']) assert.match(css, new RegExp(`--tl-${name}:`));
  assert.equal(rem('tap'), 44);
});

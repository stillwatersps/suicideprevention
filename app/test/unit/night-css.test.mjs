// The build's second copy of the dark colors, for "Darker at night".
import test from 'node:test';
import assert from 'node:assert/strict';
import { nightCss } from '../../tools/night-css.mjs';

const flat = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();

test('a stylesheet with no dark rules gets nothing added', () => {
  assert.equal(nightCss('.a { color: red; } @media (min-width: 10px) { .b { top: 0; } }'), '');
});

test('tokens on the root element apply when the root has the night class', () => {
  const out = flat(nightCss('@media (prefers-color-scheme: dark) { :root { --ink: #fff; --sand: #000; } }'));
  assert.equal(out, ':root.tl-night { --ink: #fff; --sand: #000; }');
});

test('a selector that starts at the root gets the class there; any other is put inside it', () => {
  const out = flat(nightCss('@media (prefers-color-scheme: dark) { html.tl body { background-image: url("grain-dark.svg"); } .tl-horizon, a:hover { color: blue; } html { color: black; } html-ish { top: 0; } }'));
  assert.equal(out, 'html.tl-night.tl body { background-image: url("grain-dark.svg"); } html.tl-night .tl-horizon, html.tl-night a:hover { color: blue; } html.tl-night { color: black; } html.tl-night html-ish { top: 0; }');
});

test('a dark block with another condition keeps that condition', () => {
  const out = flat(nightCss('@media (prefers-color-scheme: dark) and (min-width: 960px) and (min-width: 60em) { .crisis-bar { top: 0; } }'));
  assert.equal(out, '@media (min-width: 960px) and (min-width: 60em) { html.tl-night .crisis-bar { top: 0; } }');
  const before = flat(nightCss('@media (min-width: 5px) and (prefers-color-scheme: dark) { .x { top: 0; } }'));
  assert.equal(before, '@media (min-width: 5px) { html.tl-night .x { top: 0; } }');
});

test('blocks nested inside a dark block keep their own condition', () => {
  const out = flat(nightCss('@media (prefers-color-scheme: dark) { .a { top: 0; } @supports (color: red) { .b { top: 1px; } } }'));
  assert.equal(out, 'html.tl-night .a { top: 0; } @supports (color: red) {html.tl-night .b { top: 1px; } }');
});

test('every dark block is copied, in order, and light rules and comments are left out', () => {
  const css = '.light { color: red; } /* @media (prefers-color-scheme: dark) { .no { top: 0; } } */ @media (prefers-color-scheme: dark) { .one { top: 0; } } .mid { top: 0; } @media (prefers-color-scheme:dark){ .two { top: 0; } }';
  const out = flat(nightCss(css));
  assert.equal(out, 'html.tl-night .one { top: 0; } html.tl-night .two { top: 0; }');
});

// The app's dark colors are written for a phone set to dark (`@media (prefers-color-scheme: dark)`).
// "Darker at night" needs the same colors on a phone set to light, so the build adds a second copy
// of every dark rule that applies when the page's root element has the class `tl-night`. The
// source stylesheets are not changed, and the two copies can never drift apart: one is made from
// the other each time the app is built.
const NIGHT = 'tl-night';

// The index of the brace that closes the block opened at `open`.
function closing(css, open) {
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') { depth -= 1; if (depth === 0) return i; }
  }
  return -1;
}

// One selector, made to apply only at night. A selector that starts at the root element
// (`:root`, `html`, `html.tl body`) gets the class on that element; any other is put inside it.
function atNight(selector) {
  const s = selector.trim();
  if (!s) return s;
  const root = s.match(/^(html|:root)(?![-\w])/);
  if (root) return (root[1] === ':root' ? ':root.' : 'html.') + NIGHT + s.slice(root[1].length);
  return 'html.' + NIGHT + ' ' + s;
}

// The rules inside a dark block, each selector scoped to night. Blocks nested inside (another
// @media, @supports) keep their own condition and have their contents scoped the same way.
function scope(body) {
  let out = '';
  let i = 0;
  while (i < body.length) {
    const open = body.indexOf('{', i);
    if (open < 0) break;
    const close = closing(body, open);
    if (close < 0) break;
    const head = body.slice(i, open).trim();
    const inner = body.slice(open + 1, close);
    if (head.startsWith('@')) out += head + ' {' + scope(inner) + '}\n';
    else out += head.split(',').map(atNight).join(', ') + ' {' + inner + '}\n';
    i = close + 1;
  }
  return out;
}

// Everything to add to a stylesheet: one night copy of each dark block, in the order they appear,
// so a later rule still wins over an earlier one. A dark block that also has another condition
// (a width, say) keeps that condition. Returns '' for a stylesheet with no dark rules.
export function nightCss(css) {
  const plain = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const find = /@media([^{]*)\{/g;
  let out = '';
  let match;
  while ((match = find.exec(plain))) {
    const condition = match[1];
    if (!/\(\s*prefers-color-scheme\s*:\s*dark\s*\)/.test(condition)) continue;
    const open = match.index + match[0].length - 1;
    const close = closing(plain, open);
    if (close < 0) break;
    const rest = condition.replace(/\(\s*prefers-color-scheme\s*:\s*dark\s*\)/, '').replace(/^\s*and\s+/, '').replace(/\s+and\s*$/, '').replace(/\s+and\s+and\s+/, ' and ').trim();
    const rules = scope(plain.slice(open + 1, close));
    out += rest ? '@media ' + rest + ' {\n' + rules + '}\n' : rules;
    find.lastIndex = close + 1;
  }
  return out ? '\n/* The dark rules above, again, for "Darker at night" (made by tools/night-css.mjs). */\n' + out : '';
}

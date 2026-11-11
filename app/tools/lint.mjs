// A small lint for the app, with no extra packages. Run: npm run lint
// - every script parses (esbuild)
// - no console output and no outside addresses in the app's own code: nothing may leave the phone
// - the redesign's styles use design tokens only: no colors, pixel sizes, or durations of their own
// - every word block and every word key exists in English and Spanish alike
import { transform } from 'esbuild';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const note = (file, line, what) => problems.push(`${relative(appDir, file)}${line ? ':' + line : ''}  ${what}`);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out); else out.push(path);
  }
  return out;
}

// Comments and strings are judged differently, so strip comments first.
function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`\\])\/\/[^\n]*/g, (m, lead) => lead);
}

const scripts = [...walk(join(appDir, 'src')), ...walk(join(appDir, 'tools')), ...walk(join(appDir, 'test'))]
  .filter((file) => ['.js', '.mjs'].includes(extname(file)));
for (const file of scripts) {
  const code = readFileSync(file, 'utf8');
  try { await transform(code, { loader: 'js', format: 'esm' }); } catch (e) { note(file, 0, 'does not parse: ' + e.message.split('\n')[0]); continue; }
  if (!file.includes(join(appDir, 'src'))) continue;
  stripComments(code).split('\n').forEach((line, i) => {
    if (/\bconsole\.(log|debug|info|warn|error)\b/.test(line)) note(file, i + 1, 'console output in app code (use devLog from core/dev.js)');
    if (/https?:\/\/(?!www\.w3\.org\/)/.test(line)) note(file, i + 1, 'an outside address in app code');
    if (/\b(XMLHttpRequest|WebSocket|sendBeacon|EventSource)\b/.test(line)) note(file, i + 1, 'a way to send data in app code');
  });
}

// Token-only styles: the redesign's stylesheets, except the token file itself.
const TOKEN_FILE = join(appDir, 'src', 'tokens.css');
const styleFiles = walk(join(appDir, 'src')).filter((f) => extname(f) === '.css' && /^(redesign|tl-)/.test(basename(f)));
for (const file of styleFiles) {
  if (file === TOKEN_FILE) continue;
  stripComments(readFileSync(file, 'utf8')).split('\n').forEach((line, i) => {
    if (/#[0-9a-fA-F]{3,8}\b/.test(line) || /\b(rgb|rgba|hsl|hsla)\(/.test(line)) note(file, i + 1, 'a color outside the token file');
    if (/(font-size|border-radius|gap|padding|margin)[^;]*\b\d+(\.\d+)?(px|rem|em)\b/.test(line)) note(file, i + 1, 'a size that should be a token');
    if (/(transition|animation)[^;]*\b\d+(\.\d+)?m?s\b/.test(line)) note(file, i + 1, 'a duration that should be a token');
  });
}

// Word sources come in pairs. Blocks and word keys must match across the two languages.
const textDir = join(appDir, 'src', 'text');
const names = (text, re) => [...text.matchAll(re)].map((m) => m[1]).sort();
for (const en of readdirSync(textDir).filter((f) => /(^|\.)en\.html$/.test(f))) {
  const es = en.replace(/en\.html$/, 'es.html');
  if (!existsSync(join(textDir, es))) { note(join(textDir, en), 0, 'has no Spanish twin'); continue; }
  const a = readFileSync(join(textDir, en), 'utf8');
  const b = readFileSync(join(textDir, es), 'utf8');
  for (const [label, re] of [['block', /<!-- BLOCK:([a-z0-9-]+) -->/g], ['word', /data-word="([^"]+)"/g], ['key', /data-tl="([^"]+)"/g]]) {
    const one = names(a, re);
    const two = names(b, re);
    const missing = one.filter((n) => !two.includes(n)).concat(two.filter((n) => !one.includes(n)));
    if (missing.length || one.length !== two.length) note(join(textDir, en), 0, `${label}s differ from ${es}: ${[...new Set(missing)].slice(0, 8).join(', ') || 'a repeated name'}`);
  }
  if (/redesign/.test(en) && !/unreviewed AI translation|traducción de IA sin revisar/i.test(b)) note(join(textDir, es), 0, 'must say it is an unreviewed AI translation');
}

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\nLint: ${problems.length} problem(s).`);
  process.exit(1);
}
console.log(`Lint: ${scripts.length} scripts, ${styleFiles.length} token-only stylesheets, and the word sources are clean.`);

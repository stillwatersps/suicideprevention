// Makes a printable list of every word the app adds, numbered, for the licensed reviewer and the
// fluent Spanish reader: notes/review-packet/tidelight-app-words.html. Run: node tools/make-words-packet.mjs
// It reads app/src/text/*.html, so it can't drift from what the app shows.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = [
  ['en', 'en.html', 'English'], ['en', 'extras.en.html', 'English: Hope box and My circle'],
  ['es', 'es.html', 'Spanish'], ['es', 'extras.es.html', 'Spanish: Hope box and My circle'],
];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// The readable lines of a block: text between tags, plus labels only screen readers hear.
function lines(html) {
  const out = [];
  for (const m of html.matchAll(/(?:aria-label|alt)="([^"]+)"/g)) out.push('[spoken label] ' + unesc(m[1]));
  const text = html.replace(/<(p|li|h\d|legend|label|button|option|summary|figcaption|span class="app-[a-z-]*")[^>]*>/g, '\n').replace(/<[^>]+>/g, ' ');
  for (const raw of text.split('\n')) {
    const line = unesc(raw).replace(/\s+/g, ' ').trim();
    if (line) out.push(line);
  }
  return out;
}

let body = '';
let total = 0;
for (const [lang, file, title] of FILES) {
  const text = readFileSync(join(appDir, 'src', 'text', file), 'utf8');
  body += `<h2 lang="en">${esc(title)} <small>(app/src/text/${file})</small></h2>\n`;
  for (const m of text.matchAll(/<!-- BLOCK:([a-z-]+) -->\n?([\s\S]*?)<!-- END -->/g)) {
    const rows = lines(m[2].replace(/<!-- INSERT:[a-z-]+ -->/g, ''));
    if (!rows.length) continue;
    const prefix = `APP-${lang.toUpperCase()}-${m[1]}`;
    body += `<h3 lang="en">${esc(m[1])}</h3>\n<ol lang="${lang}">\n`;
    rows.forEach((row, i) => { total += 1; body += `<li><span class="id">${prefix}-${i + 1}</span> ${esc(row)}</li>\n`; });
    body += '</ol>\n';
  }
}
const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Tidelight app words for review</title>
<meta name="robots" content="noindex">
<style>
body { font: 11pt/1.5 Georgia, serif; color: #13222C; max-width: 46em; margin: 2em auto; padding: 0 1em; }
h1, h2, h3 { font-family: Arial, sans-serif; color: #0B4F6C; }
h2 { border-bottom: 1px solid #D6D0C4; margin-top: 2em; } small { font-weight: normal; color: #555; }
ol { list-style: none; padding: 0; } li { margin: .35em 0; break-inside: avoid; }
.id { font: 8.5pt Arial, sans-serif; color: #7A400C; margin-right: .6em; white-space: nowrap; }
.note { border: 2px solid #0B4F6C; padding: .6em 1em; background: #E6F1F4; }
</style></head><body>
<h1>Tidelight app: every word the app adds</h1>
<p class="note"><strong>Draft for review.</strong> An AI assistant wrote these lines, and the Spanish is an unreviewed AI
translation. No licensed reviewer or fluent reader has approved them. ${total} numbered lines, built from
<code>app/src/text/</code> by <code>app/tools/make-words-packet.mjs</code>. Write the line's number next to any change.
The website's own pages are in the other two packets. In a crisis, call or text 988, or call 911.</p>
${body}</body></html>
`;
writeFileSync(join(appDir, '..', 'notes', 'review-packet', 'tidelight-app-words.html'), page);
console.log(`Wrote notes/review-packet/tidelight-app-words.html: ${total} lines.`);

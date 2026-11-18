// Screens that show a website page's own sections, word for word and link for link. They are
// copied from the app's copy of the page when the app is built and never retyped, so a screen
// can't drift from the page a reviewer reads. One entry per screen:
//   page:     the page, in each language
//   sections: the ids of the page's sections to show, in order
//   title:    'section' (the first section's heading is the screen's title) or 'page' (the page's
//             own title is; its opening line comes first and every heading moves down one level)
//   tab, row: the tab the screen is on and the id of the row that opens it (for the tests)
// The markup has `<!-- SITE:name -->` where the copy goes (src/text/redesign.en.html).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const SITE_SCREENS = {
  care: { page: { en: 'get-help/index.html', es: 'es/obtener-ayuda/index.html' }, sections: ['over-time'], title: 'section', tab: 'checkin', row: 'tl-checkin-care' },
  teens: { page: { en: 'teens/index.html', es: 'es/adolescentes/index.html' }, sections: ['reach-out', 'trusted-adult', 'privacy', 'friend'], title: 'page', tab: 'checkin', row: 'tl-checkin-teens' },
  parents: { page: { en: 'help-someone/index.html', es: 'es/ayudar-a-alguien/index.html' }, sections: ['child-or-teen'], title: 'section', tab: 'friends', row: 'tl-friends-parents' },
};

// What a screen is made from, as the page has it: { file, title, pieces } (pieces of HTML, in order).
export function siteSource(www, lang, name) {
  const spec = SITE_SCREENS[name];
  if (!spec) throw new Error(`site screen ${name}: not in SITE_SCREENS`);
  const file = spec.page[lang];
  const html = readFileSync(join(www, file), 'utf8');
  const need = (found, what) => { if (!found) throw new Error(`site screen ${name}: no ${what} in ${file}`); return found; };
  const pieces = [];
  let title = '';
  if (spec.title === 'page') {
    title = need(html.match(/<h1 id="page-title">([\s\S]*?)<\/h1>/), 'title')[1].trim();
    const lead = html.match(/<p class="hero-lead">[\s\S]*?<\/p>/);
    if (lead) pieces.push(lead[0]);
  }
  spec.sections.forEach((id, i) => {
    let body = need(html.match(new RegExp('<section id="' + id + '"[^>]*>([\\s\\S]*?)<\\/section>')), 'section ' + id)[1];
    if (spec.title === 'section' && i === 0) {
      title = need(body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/), 'heading in section ' + id)[1].trim();
      body = body.replace(/<h2[^>]*>[\s\S]*?<\/h2>/, '');
    }
    pieces.push(body);
  });
  return { file, title, pieces, folder: file.split('/').slice(-2, -1)[0] };
}

// The screen's inside: its title, then the pieces with "Show more" unfolded, no ids of the
// page's, and links to another part of the page pointing at the page.
export function siteScreen(www, lang, name) {
  const { file, title, pieces, folder } = siteSource(www, lang, name);
  const body = pieces.map((piece) => {
    let part = piece.replace(/<details class="more">\s*<summary>[\s\S]*?<\/summary>/g, '').replace(/<\/details>/g, '');
    if (/<details|<summary|<script|<form|<input|<button|\bstyle=/.test(part)) throw new Error(`site screen ${name}: something unexpected is in ${file}`);
    if (SITE_SCREENS[name].title === 'page') part = part.replace(/<(\/?)h3\b/g, '<$1h4').replace(/<(\/?)h2\b/g, '<$1h3');
    return part.replace(/ (?:id|aria-labelledby)="[^"]*"/g, '').trim();
  }).join('\n          ').replace(/href="#/g, `href="../${folder}/#`);
  return `<h2 class="tl-title" id="tl-${name}-title">${title}</h2>\n          <div class="tl-helping-body tl-site-body">${body}\n          </div>`;
}

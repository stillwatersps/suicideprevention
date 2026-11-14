// A copy of the person's own data as one plain text file they can read anywhere.
// Pure: it is given the words and the lines, and returns the text. It reads nothing itself.

// One line of text from anything stored: no line breaks inside a list item, and never "undefined".
export function oneLine(value) {
  return String(value === null || value === undefined ? '' : value).replace(/\s+/g, ' ').trim();
}

// sections: [{ heading, lines: [text, ...] }]. An empty section still appears, saying so, so the
// person can see that nothing of that kind is kept. A line may hold line breaks (a journal entry).
export function buildExport({ title, made, note, none, sections }) {
  const out = [oneLine(title), oneLine(made), oneLine(note)].filter(Boolean);
  (sections || []).forEach((section) => {
    const lines = (section.lines || []).map((line) => String(line === null || line === undefined ? '' : line).trim()).filter(Boolean);
    out.push('', oneLine(section.heading).toUpperCase());
    // An item of several lines (a journal entry) gets an empty line after it, to keep entries apart.
    const spaced = lines.flatMap((line) => (line.includes('\n') ? [line, ''] : [line]));
    while (spaced.length && spaced[spaced.length - 1] === '') spaced.pop();
    if (spaced.length) out.push(...spaced); else out.push(oneLine(none));
  });
  return out.join('\n') + '\n';
}

// A list read back from storage, with anything damaged left out.
export function listOf(value, keep) {
  return (Array.isArray(value) ? value : []).filter((item) => item && typeof item === 'object' && (!keep || keep(item)));
}

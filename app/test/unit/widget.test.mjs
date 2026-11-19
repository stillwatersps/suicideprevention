// The widget sits on the Home Screen and the Lock Screen, where anyone can see it. Its words say
// nothing about the person, and it can read nothing they saved. These checks read the widget's
// own files; whether it looks right is a job for a real phone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ios = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'ios', 'App');
const widget = join(ios, 'TidelightWidget');
const read = (...parts) => readFileSync(join(...parts), 'utf8');
// "key" = "words"; from a .strings file, comments left out.
const strings = (lang) => Object.fromEntries([...read(widget, `${lang}.lproj`, 'Localizable.strings').replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/^"([^"]+)"\s*=\s*"([^"]*)";$/gm)].map((m) => [m[1], m[2]]));
const swift = read(widget, 'TidelightWidget.swift');
// The code without its comment lines (a comment is a whole line here, so an address's "//" is safe).
const code = swift.split('\n').filter((line) => !line.trim().startsWith('//')).join('\n');

test('the widget has the same words in English and Spanish, and none is empty', () => {
  const en = strings('en');
  const es = strings('es');
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
  assert.ok(Object.keys(en).length >= 4);
  for (const key of Object.keys(en)) {
    assert.ok(en[key].trim() && es[key].trim(), key + ' is empty');
    assert.notEqual(en[key], es[key], key + ' is the same in both languages');
  }
});

test('every word the widget shows is one of those, or the app\'s name', () => {
  const en = strings('en');
  const shown = [...code.matchAll(/(?:Text|Label|choice|configurationDisplayName)\(\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(shown.length >= 6);
  for (const text of shown) assert.ok(text === 'Tidelight' || Object.prototype.hasOwnProperty.call(en, text), `"${text}" is written in the code, not in the word files`);
});

test('nothing on the widget is about the person, a mood, or a crisis', () => {
  const private_ = /suicid|crisis|988|911|mood|feel|sad|low|streak|check-?in|registro|ánimo|triste|racha|emergenc|safety|seguridad|help|ayuda|hotline|línea/i;
  for (const lang of ['en', 'es']) for (const [key, text] of Object.entries(strings(lang))) assert.ok(!private_.test(text), `${lang} ${key}: "${text}" should not be on a screen anyone can see`);
  // The system pictures it uses are plain ones.
  for (const [, symbol] of code.matchAll(/systemImage: "([^"]+)"|systemName: "([^"]+)"/g).map((m) => [m[0], m[1] || m[2]])) assert.ok(['leaf', 'wind', 'list.bullet'].includes(symbol), 'an unexpected picture: ' + symbol);
});

test('the widget can read nothing the person saved, and asks for nothing', () => {
  assert.ok(!/FileManager|appGroup|suiteName|URLSession|CLLocation|Keychain|HealthKit|Contacts/.test(code), 'the widget reaches for shared storage, the network, or the phone\'s data');
  // It keeps one number, in its own storage, which the app can't read: when a breathing minute
  // started on the widget ends. Nothing else is ever written or read.
  const uses = code.match(/UserDefaults[^\n]*/g) || [];
  assert.equal(uses.length, 2, 'the widget uses its storage somewhere new');
  assert.ok(uses.every((line) => /^UserDefaults\.standard\.(double|set)\(/.test(line) && line.includes('BreathingMinute.key')), uses.join(' | '));
  assert.ok(!existsSync(join(widget, 'TidelightWidget.entitlements')), 'the widget has entitlements (a shared container would let it read the app\'s data)');
  assert.match(code, /policy: \.never/, 'the widget never refreshes by itself: outside a breathing minute there is nothing on it that changes');
  assert.ok(!/policy: \.(atEnd|after)/.test(code));
});

test('a tap opens the app at one of three named places, through the app\'s own address', () => {
  const addresses = [...code.matchAll(/URL\(string: "([^"]+)"\)/g)].map((m) => m[1]).sort();
  assert.deepEqual(addresses, ['tidelight://open/breathe', 'tidelight://open/home', 'tidelight://open/plan']);
  const plist = read(ios, 'App', 'Info.plist');
  assert.match(plist, /<key>CFBundleURLSchemes<\/key>\s*<array>\s*<string>tidelight<\/string>\s*<\/array>/, 'the app answers to tidelight://');
  const plugin = read(ios, 'App', 'TidelightPlugin.swift');
  assert.match(plugin, /\["plan": "#tl-plan", "breathe": "#tl-breathe"\]/, 'the app knows the two places by name and no others');
  assert.match(plugin, /url\.scheme == "tidelight", url\.host == "open"/, 'and ignores any other address');
});

test('the widget is its own target inside the app, with no team or signing identity chosen for it', () => {
  const project = read(ios, 'App.xcodeproj', 'project.pbxproj');
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = org\.tidelight\.app\.widget;/);
  assert.match(project, /Embed Foundation Extensions/);
  assert.ok(!/DEVELOPMENT_TEAM = [A-Z0-9]{6,}/.test(project), 'a development team is set in the project');
  assert.match(read(widget, 'Info.plist'), /com\.apple\.widgetkit-extension/);
});

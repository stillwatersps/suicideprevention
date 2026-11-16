// The two shortcuts and Apple Health, checked from their files: what the shortcuts are called
// where anyone can see them, and what the app may add to Health (mindful minutes, and nothing
// else, and nothing read). No phone here; `notes/LAUNCH-READINESS.md` says what only a phone shows.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG } from '../../src/core/config.js';
import { defaultSettings } from '../../src/core/migrations.js';

const app = fileURLToPath(new URL('../../ios/App/App/', import.meta.url));
const read = (...parts) => readFileSync(join(app, ...parts), 'utf8');
const strings = (lang, file) => Object.fromEntries([...read(lang + '.lproj', file).matchAll(/^"((?:[^"\\]|\\.)*)"\s*=\s*"((?:[^"\\]|\\.)*)";$/gm)].map((m) => [m[1], m[2]]));
const shortcuts = read('TidelightShortcuts.swift');
const health = read('TidelightHealth.swift');
const plugin = read('TidelightPlugin.swift');
const code = (swift) => swift.replace(/^\s*\/\/.*$/gm, '');

test('the shortcuts\' words exist in English and Spanish, key for key', () => {
  for (const file of ['Localizable.strings', 'AppShortcuts.strings']) {
    const en = strings('en', file);
    const es = strings('es', file);
    assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort(), file);
    assert.ok(Object.keys(en).length >= 4, file);
    for (const key of Object.keys(en)) {
      assert.equal(en[key], key, `${file}: the English is the key itself`);
      assert.notEqual(es[key], en[key], `${file}: "${key}" is the same in both languages`);
    }
  }
});

test('every name and phrase in the code is in the word files', () => {
  const names = strings('en', 'Localizable.strings');
  const phrases = strings('en', 'AppShortcuts.strings');
  const titled = [...code(shortcuts).matchAll(/(?:LocalizedStringResource = |IntentDescription\(|shortTitle: )"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(titled.length >= 6);
  for (const text of titled) assert.ok(Object.prototype.hasOwnProperty.call(names, text), `"${text}" has no Spanish`);
  const said = [...code(shortcuts).matchAll(/"([^"]*\\\(\.applicationName\)[^"]*)"/g)].map((m) => m[1].replace('\\(.applicationName)', '${applicationName}'));
  assert.equal(said.length, 4);
  for (const phrase of said) assert.ok(Object.prototype.hasOwnProperty.call(phrases, phrase), `"${phrase}" has no Spanish`);
});

test('nothing a shortcut is called is about the person, a mood, or a crisis', () => {
  const private_ = /suicid|crisis|988|911|mood|feel|sad|low|streak|check-?in|registro|ánimo|triste|racha|emergenc|safety|seguridad|help|ayuda|hotline|línea/i;
  for (const lang of ['en', 'es']) for (const file of ['Localizable.strings', 'AppShortcuts.strings']) {
    for (const [key, text] of Object.entries(strings(lang, file))) assert.ok(!private_.test(text), `${lang} ${file} "${key}": "${text}" should not be where anyone can see it`);
  }
  for (const [, symbol] of code(shortcuts).matchAll(/systemImageName: "([^"]+)"/g)) assert.ok(['wind', 'list.bullet'].includes(symbol), 'an unexpected picture: ' + symbol);
});

test('a shortcut only opens the app at one of the widget\'s two places', () => {
  const words = [...code(shortcuts).matchAll(/TidelightShortcuts\.open\("([^"]+)"\)/g)].map((m) => m[1]).sort();
  assert.deepEqual(words, ['breathe', 'plan']);
  assert.equal((code(shortcuts).match(/openAppWhenRun: Bool = true/g) || []).length, 2, 'each one opens the app, where the lock and the safety frame are');
  assert.ok(!/UserDefaults|FileManager|URLSession|CLLocation|HealthKit|Contacts|@Parameter/.test(code(shortcuts)), 'a shortcut reaches for stored data, the network, or takes something typed');
  assert.match(plugin, /\["plan": "#tl-plan", "breathe": "#tl-breathe"\]/, 'the app knows the two places by name and no others');
  assert.match(plugin, /guard let hash = TidelightPlugin\.openTargets\[word\] else \{ return \}/, 'and a word it doesn\'t know does nothing');
});

test('Health: the app asks to add mindful minutes, and never asks to read anything', () => {
  const swift = code(health);
  const kinds = [...swift.matchAll(/forIdentifier: \.(\w+)/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(kinds)], ['mindfulSession'], 'only mindful minutes');
  assert.match(swift, /requestAuthorization\(toShare: \[type\], read: \[\]\)/, 'write access to that one kind, and nothing to read');
  assert.ok(!/HKSampleQuery|HKStatisticsQuery|HKAnchoredObjectQuery|HKObserverQuery|execute\(|stateOfMind|HKQuantityType|HKCharacteristicType|HKClinical/.test(swift), 'Health code reads something, or touches another kind of data');
  assert.match(swift, /predicateForObjects\(from: HKSource\.default\(\)\)/, 'it removes only what this app added');
  assert.ok(!/metadata:/.test(swift), 'an entry carries nothing but its start and end');
});

test('Health: what the page may hand over is a start time and a length, and nothing else', () => {
  const method = plugin.slice(plugin.indexOf('@objc func healthWrite'), plugin.indexOf('@objc func healthRemoveAll'));
  const asked = [...method.matchAll(/call\.get\w+\("(\w+)"\)/g)].map((m) => m[1]).sort();
  assert.deepEqual(asked, ['seconds', 'startedAt']);
  const page = readFileSync(new URL('../../src/ui/health.js', import.meta.url), 'utf8');
  assert.match(page, /healthWrite\(\{ startedAt, seconds \}\)/);
  assert.ok(!/mood|feeling|tags|journal/i.test(page.replace(/^\s*\/\/.*$/gm, '')), 'the page\'s Health code mentions something other than a meditation\'s time');
});

test('Health is off until turned on, and the phone says what it is for', () => {
  assert.equal(defaultSettings().health, false);
  assert.ok(CONFIG.health.minSeconds >= 60);
  const plist = read('Info.plist');
  assert.match(plist, /<key>NSHealthUpdateUsageDescription<\/key>\s*<string>Only if you turn on [^<]+<\/string>/);
  assert.ok(!/NSHealthShareUsageDescription/.test(plist), 'the app declares it reads from Health');
  assert.match(read('App.entitlements'), /<key>com\.apple\.developer\.healthkit<\/key>\s*<true\/>/);
  assert.ok(!/healthkit\.access|health-records|background-delivery/.test(read('App.entitlements')), 'more Health access than adding entries');
});

test('no team or signing identity was chosen along the way', () => {
  const project = readFileSync(join(app, '..', 'App.xcodeproj', 'project.pbxproj'), 'utf8');
  assert.ok(!/DEVELOPMENT_TEAM = [A-Z0-9]{6,}/.test(project), 'a development team is set in the project');
  assert.match(project, /CODE_SIGN_ENTITLEMENTS = App\/App\.entitlements;/);
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = org\.tidelight\.app;/);
});

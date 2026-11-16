// The Apple Watch app, checked from its files: its crisis lines are the phone app's own, they are
// on its first screen, and it stores nothing, reads nothing, and shows nothing outside itself.
// No watch here: it has been built for the watch Simulator and has never run on a watch.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ios = fileURLToPath(new URL('../../ios/App/', import.meta.url));
const watch = join(ios, 'TidelightWatch');
const read = (...parts) => readFileSync(join(...parts), 'utf8');
const swift = read(watch, 'TidelightWatchApp.swift');
const code = swift.replace(/^\s*\/\/.*$/gm, '');
const strings = (lang) => Object.fromEntries([...read(watch, lang + '.lproj', 'Localizable.strings').matchAll(/^"((?:[^"\\]|\\.)*)"\s*=\s*"((?:[^"\\]|\\.)*)";$/gm)].map((m) => [m[1], m[2]]));
const spanish = JSON.parse(readFileSync(new URL('../../src/text/redesign.es.json', import.meta.url), 'utf8'));
const english = readFileSync(new URL('../../src/text/redesign.en.html', import.meta.url), 'utf8');

test('the watch app\'s words exist in English and Spanish, key for key', () => {
  const en = strings('en');
  const es = strings('es');
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
  assert.ok(Object.keys(en).length >= 9);
  for (const key of Object.keys(en)) {
    assert.equal(en[key], key, 'the English is the key itself');
    assert.notEqual(es[key], en[key], `"${key}" is the same in both languages`);
  }
});

test('every word on the watch is in the word files', () => {
  const en = strings('en');
  const shown = [...code.matchAll(/(?:Text|Label)\(\s*(?:finished \? )?"([^"]+)"/g)].map((m) => m[1]).concat([...code.matchAll(/\? "([^"]+)" : "([^"]+)"/g)].flatMap((m) => [m[1], m[2]])).filter((text) => !/^(sms|tel):/.test(text)); // an address is not a word
  assert.ok(shown.length >= 8, 'found ' + shown.length);
  for (const text of shown) assert.ok(text === 'Tidelight' || Object.prototype.hasOwnProperty.call(en, text), `"${text}" is written in the code, not in the word files`);
});

test('the crisis lines are the phone app\'s own three, with its own words and addresses', () => {
  const addresses = [...code.matchAll(/URL\(string: (?:spanish \? )?"([^"]+)"(?: : "([^"]+)")?\)/g)].flatMap((m) => [m[1], m[2]]).filter(Boolean).sort();
  assert.deepEqual(addresses, ['sms:988', 'sms:988?&body=AYUDA', 'tel:911', 'tel:988']);
  const es = strings('es');
  // The phone app's support screen, in each language.
  const line = (href) => Object.entries(spanish.lines).find(([en]) => en.includes(`href="${href}"`) && en.includes('tl-btn-wide'));
  for (const [href, words] of [['tel:988', 'Call 988'], ['sms:988', 'Text 988'], ['tel:911', 'In immediate danger, call 911']]) {
    const [enLine, esLine] = line(href);
    assert.ok(enLine.includes('>' + words + '<'), `the phone app says "${words}"`);
    assert.ok(english.includes(enLine), 'and that line is on the support screen');
    assert.ok(esLine.includes('>' + es[words] + '<'), `Spanish for "${words}" is the phone app's: ${es[words]}`);
  }
  assert.equal(es['Draft for review'], spanish.words['Draft for review']);
});

test('the three crisis lines are on the first screen, never behind another', () => {
  const home = code.slice(code.indexOf('struct HomeView'), code.indexOf('struct BreatheView'));
  for (const line of ['CrisisLine.call988', 'CrisisLine.text988', 'CrisisLine.call911']) assert.ok(home.includes(`open(${line})`), line + ' is not on the first screen');
  assert.equal((home.match(/NavigationLink/g) || []).length, 1, 'only the breathing minute opens another screen');
  assert.match(home, /Text\("Draft for review"\)/);
  assert.match(home, /openSystemURL/);
});

test('it stores nothing, reads nothing, talks to nobody, and shows nothing outside itself', () => {
  assert.ok(!/UserDefaults|FileManager|AppStorage|SceneStorage|Keychain|URLSession|WatchConnectivity|WCSession|HealthKit|HKHealthStore|CLLocation|UserNotifications|UNUserNotificationCenter|WidgetKit|ClockKit|Contacts|CoreData|SwiftData/.test(code), 'the watch app reaches for storage, the network, the phone app, Health, location, notifications, or a watch face');
  const files = readdirSync(watch).sort();
  assert.deepEqual(files, ['Assets.xcassets', 'TidelightWatchApp.swift', 'en.lproj', 'es.lproj'], 'the watch app has a file this test has not read');
  assert.ok(!existsSync(join(watch, 'TidelightWatch.entitlements')));
});

test('the breathing minute is silent, has no score, and is the phone app\'s calm pattern', () => {
  const breathe = code.slice(code.indexOf('struct BreatheView'));
  assert.match(breathe, /inSeconds: Double = 4/);
  assert.match(breathe, /outSeconds: Double = 6/);
  assert.match(breathe, /breaths = 6/);
  assert.ok(!/AVFoundation|AVAudio|WKAudio|\.notification|\.success|streak|score|count/i.test(breathe), 'the breathing minute plays a sound, celebrates, or counts something');
  assert.match(breathe, /accessibilityReduceMotion/);
});

test('it is its own target inside the phone app, with no team or signing identity chosen', () => {
  const project = read(ios, 'App.xcodeproj', 'project.pbxproj');
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = org\.tidelight\.app\.watchkitapp;/);
  assert.match(project, /INFOPLIST_KEY_WKCompanionAppBundleIdentifier = org\.tidelight\.app;/);
  assert.match(project, /Embed Watch Content/);
  assert.match(project, /INFOPLIST_KEY_CFBundleDisplayName = Tidelight;/);
  assert.ok(!/DEVELOPMENT_TEAM = [A-Z0-9]{6,}/.test(project), 'a development team is set in the project');
});

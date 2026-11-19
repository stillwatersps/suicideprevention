// The interactive widget and the Lock Screen's breathing session. Both are on screens anyone can
// see. These checks read the files; whether they look right is a job for a real phone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ios = join(app, 'ios', 'App');
const read = (...parts) => readFileSync(join(...parts), 'utf8');
const noComments = (swift) => swift.split('\n').filter((line) => !line.trim().startsWith('//')).join('\n');
const strings = (lang) => Object.fromEntries([...read(ios, 'TidelightWidget', `${lang}.lproj`, 'Localizable.strings').replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/^"([^"]+)"\s*=\s*"([^"]*)";$/gm)].map((m) => [m[1], m[2]]));

test('the Lock Screen is told one thing: when the session ends', () => {
  const code = noComments(read(ios, 'TidelightWidget', 'BreathingAttributes.swift'));
  const fields = [...code.matchAll(/^\s*(?:var|let)\s+(\w+)\s*:/gm)].map((m) => m[1]);
  assert.deepEqual(fields, ['endsAt']);
});

test('what it shows is the app\'s name, one plain word, and the time left; never anything kept', () => {
  const code = noComments(read(ios, 'TidelightWidget', 'BreathingLive.swift'));
  const en = strings('en');
  const shown = [...code.matchAll(/(?:Text|Label)\(\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(shown.length >= 3);
  for (const text of shown) assert.ok(text === 'Tidelight' || Object.prototype.hasOwnProperty.call(en, text), `"${text}" is written in the code, not in the word files`);
  assert.ok(!/UserDefaults|FileManager|appGroup|suiteName|URLSession|CLLocation|Keychain|HealthKit|Contacts/.test(code));
  for (const m of code.matchAll(/systemName: "([^"]+)"/g)) assert.equal(m[1], 'wind');
  assert.match(code, /if !context\.isStale/, 'once the time has passed it shows the name alone');
  assert.equal(en['widget.breathing'], 'Breathing');
  assert.equal(strings('es')['widget.breathing'], 'Respirando');
});

test('the widget\'s button starts a breathing minute in place and does not open the app', () => {
  const code = noComments(read(ios, 'TidelightWidget', 'TidelightWidget.swift'));
  assert.match(code, /struct StartBreathingIntent: AppIntent/);
  assert.match(code, /static var openAppWhenRun: Bool = false/);
  assert.equal((code.match(/Button\(intent: StartBreathingIntent\(\)\)/g) || []).length, 2, 'on the small and the medium widget');
  assert.match(code, /static let seconds: TimeInterval = 60/);
  assert.match(code, /@main\s+struct TidelightWidgets: WidgetBundle/);
});

test('the app starts and ends it, cleans up when it opens, and the phone allows it', () => {
  const plugin = read(ios, 'App', 'TidelightPlugin.swift');
  for (const name of ['startBreathingActivity', 'endBreathingActivity']) {
    assert.ok(plugin.includes(`CAPPluginMethod(name: "${name}", returnType: CAPPluginReturnPromise)`), name);
    assert.ok(plugin.includes(`@objc func ${name}(_ call: CAPPluginCall)`), name);
  }
  assert.match(plugin, /override public func load\(\) \{\s*\/\/[^\n]*\n\s*if #available\(iOS 16\.2, \*\) \{ TidelightBreathing\.end \{\} \}/);
  const start = noComments(read(ios, 'App', 'TidelightBreathing.swift'));
  assert.match(start, /areActivitiesEnabled/);
  assert.match(start, /pushType: nil/, 'nothing is sent to it from anywhere but this phone');
  assert.match(start, /dismissalPolicy: \.immediate/);
  assert.match(read(ios, 'App', 'Info.plist'), /<key>NSSupportsLiveActivities<\/key>\s*<true\/>/);
});

test('the files are in the right targets, and no team or signing identity was chosen', () => {
  const project = read(ios, 'App.xcodeproj', 'project.pbxproj');
  assert.equal((project.match(/BreathingAttributes\.swift in Sources \*\/ = \{isa = PBXBuildFile/g) || []).length, 2, 'the shared file is built into the app and the widget');
  assert.equal((project.match(/BreathingLive\.swift in Sources \*\/ = \{isa = PBXBuildFile/g) || []).length, 1);
  assert.equal((project.match(/TidelightBreathing\.swift in Sources \*\/ = \{isa = PBXBuildFile/g) || []).length, 1);
  assert.ok(!/DEVELOPMENT_TEAM = [A-Z0-9]{6,}/.test(project));
  assert.ok(!existsSync(join(ios, 'TidelightWidget', 'TidelightWidget.entitlements')));
});

test('it is off until turned on, and only for sessions that are breathing and nothing else', () => {
  assert.match(read(app, 'src', 'core', 'migrations.js'), /lockScreenBreathing: false,/);
  const live = read(app, 'src', 'ui', 'live.js');
  assert.match(live, /LIVE_TYPES = \['quick', 'breathe'\]/);
  assert.match(live, /if \(!state\.settings\.lockScreenBreathing \|\| !liveAvailable\(\)/);
  const player = read(app, 'src', 'ui', 'player.js');
  assert.equal((player.match(/liveEnd\(\)/g) || []).length, 3, 'taken down when a session ends, is paused, or Get Support Now is tapped');
});

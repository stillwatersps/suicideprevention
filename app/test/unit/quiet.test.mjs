// Automated runs make no sound. The script that silences a page has two copies: one for the
// browser tests (test/quiet.mjs) and one inside the debug-only Simulator hook. They must match.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { QUIET_SOURCE } from '../quiet.mjs';

const swift = readFileSync(new URL('../../ios/App/App/TidelightPlugin.swift', import.meta.url), 'utf8');
const tidy = (text) => text.split('\n').map((line) => line.trim()).filter(Boolean).join('\n');

test('the Simulator hook carries the same quiet script as the browser tests', () => {
  const copy = swift.slice(swift.indexOf('#"""') + 4, swift.indexOf('"""#'));
  assert.equal(tidy(copy), tidy(QUIET_SOURCE));
});

test('the Simulator hook is debug-only, Simulator-only, and needs its launch argument', () => {
  const start = swift.indexOf('// MARK: - Automated Simulator runs make no sound');
  const hook = swift.slice(start, swift.indexOf('#endif', swift.indexOf('"""#')));
  assert.match(hook, /#if DEBUG && targetEnvironment\(simulator\)\n[\s\S]*private func quietForAutomatedRuns/);
  assert.match(hook, /guard UserDefaults\.standard\.bool\(forKey: "TidelightQuiet"\) else \{ return \}/);
  assert.match(swift, /#if DEBUG && targetEnvironment\(simulator\)\n\s+quietForAutomatedRuns\(\)\n\s+#endif/);
});

test('the quiet script parses and can sit in a Swift string', () => {
  assert.doesNotThrow(() => new Function(QUIET_SOURCE));
  assert.ok(!QUIET_SOURCE.includes('\\') && !QUIET_SOURCE.includes('"""'));
});

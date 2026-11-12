---
aliases: [Third-party licenses, Licenses]
status: generated from the app's lock file on November 12, 2026. Regenerate when dependencies change
---

# Third-party code and fonts in the phone app, and their licenses

[[00 START HERE|Back to Start Here]]

Listed from `app/package-lock.json`, the two font license files in `app/src/fonts/`, and the
iOS project's Podfile. **Not legal advice.** A lawyer should confirm what attribution the App
Store listing or the app itself needs.

## What ships inside the app

7 packages, all permissive licenses that allow use in a closed or open app:

| Package | Version | License |
| --- | --- | --- |
| `@capacitor/android` | 7.6.10 | MIT |
| `@capacitor/core` | 7.6.10 | MIT |
| `@capacitor/ios` | 7.6.10 | MIT |
| `@capacitor/local-notifications` | 7.0.7 | MIT |
| `@capacitor/preferences` | 7.0.4 | MIT |
| `@capacitor/share` | 7.0.4 | MIT |
| `tslib` | 2.9.1 | 0BSD |

On iPhone these arrive as five CocoaPods built from the same packages: Capacitor,
CapacitorCordova, CapacitorLocalNotifications, CapacitorPreferences, and CapacitorShare (all MIT).
`tslib` is a small helper the Capacitor packages depend on (0BSD: no conditions at all).

None of them contacts a server, collects data, or includes analytics. That was checked by reading
what they do in this app and by a test that fails on any network request.

## Fonts inside the app

| Font | File | License | Notes |
| --- | --- | --- | --- |
| Fraunces | `app/src/fonts/Fraunces-latin.woff2` | SIL Open Font License 1.1 | Copyright 2020 The Fraunces Project Authors. No reserved font name is declared |
| Figtree | `app/src/fonts/Figtree-latin.woff2` | SIL Open Font License 1.1 | Copyright 2022 The Figtree Project Authors. No reserved font name is declared |

The Open Font License allows bundling the fonts in an app, free or paid. Its condition: the
copyright notice and the license text travel with the font files. They do: `Fraunces-OFL.txt`
and `Figtree-OFL.txt` sit beside the fonts and are copied into the app with them.

## Attribution: what is required

- **MIT (Capacitor and its plugins):** keep the copyright notice and license text "in all copies
  or substantial portions". The usual way in an app is an "Acknowledgements" or "Licenses" screen
  or page. **The app has none yet.** It is in [[LAUNCH-BACKLOG]] as something to add before a
  public release; the notices are in each package's `LICENSE` file.
- **Open Font License:** met by the two license files that ship with the fonts. Listing the fonts
  on the same acknowledgements screen would be courteous and is commonly done.
- **0BSD (`tslib`):** nothing required.

Nothing found is incompatible with App Store distribution. No copyleft license (GPL, LGPL, AGPL)
applies to anything that ships.

## Tools used to build and test the app (not shipped)

120 packages. They run on a developer's computer or in the project's automated checks and
are never part of the app a person installs, so their licenses place no condition on the app.
By license: MIT (93), ISC (11), BlueOak-1.0.0 (11), Apache-2.0 (3), MPL-2.0 (1), Unlicense (1).

The ones chosen directly: `@capacitor/cli` (MIT), `esbuild` (MIT), `playwright` (Apache-2.0),
and `axe-core` (MPL-2.0, the accessibility audit; used unmodified, test-only).

| Package | Version | License |
| --- | --- | --- |
| `@capacitor/cli` | 7.6.10 | MIT |
| `@esbuild/aix-ppc64` | 0.25.12 | MIT |
| `@esbuild/android-arm` | 0.25.12 | MIT |
| `@esbuild/android-arm64` | 0.25.12 | MIT |
| `@esbuild/android-x64` | 0.25.12 | MIT |
| `@esbuild/darwin-arm64` | 0.25.12 | MIT |
| `@esbuild/darwin-x64` | 0.25.12 | MIT |
| `@esbuild/freebsd-arm64` | 0.25.12 | MIT |
| `@esbuild/freebsd-x64` | 0.25.12 | MIT |
| `@esbuild/linux-arm` | 0.25.12 | MIT |
| `@esbuild/linux-arm64` | 0.25.12 | MIT |
| `@esbuild/linux-ia32` | 0.25.12 | MIT |
| `@esbuild/linux-loong64` | 0.25.12 | MIT |
| `@esbuild/linux-mips64el` | 0.25.12 | MIT |
| `@esbuild/linux-ppc64` | 0.25.12 | MIT |
| `@esbuild/linux-riscv64` | 0.25.12 | MIT |
| `@esbuild/linux-s390x` | 0.25.12 | MIT |
| `@esbuild/linux-x64` | 0.25.12 | MIT |
| `@esbuild/netbsd-arm64` | 0.25.12 | MIT |
| `@esbuild/netbsd-x64` | 0.25.12 | MIT |
| `@esbuild/openbsd-arm64` | 0.25.12 | MIT |
| `@esbuild/openbsd-x64` | 0.25.12 | MIT |
| `@esbuild/openharmony-arm64` | 0.25.12 | MIT |
| `@esbuild/sunos-x64` | 0.25.12 | MIT |
| `@esbuild/win32-arm64` | 0.25.12 | MIT |
| `@esbuild/win32-ia32` | 0.25.12 | MIT |
| `@esbuild/win32-x64` | 0.25.12 | MIT |
| `@ionic/cli-framework-output` | 2.2.8 | MIT |
| `@ionic/utils-array` | 2.1.6 | MIT |
| `@ionic/utils-fs` | 3.1.7 | MIT |
| `@ionic/utils-object` | 2.1.6 | MIT |
| `@ionic/utils-process` | 2.1.12 | MIT |
| `@ionic/utils-stream` | 3.1.7 | MIT |
| `@ionic/utils-subprocess` | 3.0.1 | MIT |
| `@ionic/utils-terminal` | 2.3.5 | MIT |
| `@isaacs/fs-minipass` | 4.0.1 | ISC |
| `@isaacs/nonrecursive-glob-match` | 1.1.0 | BlueOak-1.0.0 |
| `@types/fs-extra` | 8.1.5 | MIT |
| `@types/node` | 26.6.6 | MIT |
| `@types/slice-ansi` | 4.0.0 | MIT |
| `@xmldom/xmldom` | 0.9.12 | MIT |
| `ansi-regex` | 5.0.1 | MIT |
| `ansi-styles` | 4.3.0 | MIT |
| `astral-regex` | 2.0.0 | MIT |
| `at-least-node` | 1.0.0 | ISC |
| `axe-core` | 4.14.0 | MPL-2.0 |
| `balanced-match` | 4.0.4 | MIT |
| `base64-js` | 1.5.1 | MIT |
| `big-integer` | 1.6.52 | Unlicense |
| `bplist-parser` | 0.3.2 | MIT |
| `brace-expansion` | 5.0.12 | MIT |
| `buffer-crc32` | 0.2.13 | MIT |
| `chownr` | 3.0.0 | BlueOak-1.0.0 |
| `color-convert` | 2.0.1 | MIT |
| `color-name` | 1.1.4 | MIT |
| `commander` | 12.1.0 | MIT |
| `cross-spawn` | 7.0.6 | MIT |
| `debug` | 4.4.3 | MIT |
| `define-lazy-prop` | 2.0.0 | MIT |
| `elementtree` | 0.1.7 | Apache-2.0 |
| `emoji-regex` | 8.0.0 | MIT |
| `env-paths` | 2.2.1 | MIT |
| `esbuild` | 0.25.12 | MIT |
| `fd-slicer` | 1.1.0 | MIT |
| `fs-extra` | 9.1.0 | MIT |
| `fs-extra` | 11.4.1 | MIT |
| `glob` | 14.0.4 | BlueOak-1.0.0 |
| `graceful-fs` | 4.2.11 | ISC |
| `inherits` | 2.0.4 | ISC |
| `ini` | 4.1.3 | ISC |
| `is-docker` | 2.2.1 | MIT |
| `is-fullwidth-code-point` | 3.0.0 | MIT |
| `is-wsl` | 2.2.0 | MIT |
| `isexe` | 2.0.0 | ISC |
| `jsonfile` | 6.2.1 | MIT |
| `kleur` | 4.1.5 | MIT |
| `kleur` | 3.0.3 | MIT |
| `lru-cache` | 11.5.3 | BlueOak-1.0.0 |
| `minimatch` | 11.0.5 | BlueOak-1.0.0 |
| `minipass` | 7.1.3 | BlueOak-1.0.0 |
| `minizlib` | 3.1.0 | MIT |
| `ms` | 2.1.3 | MIT |
| `native-run` | 2.1.0 | MIT |
| `open` | 8.4.2 | MIT |
| `package-json-from-dist` | 1.0.1 | BlueOak-1.0.0 |
| `path-key` | 3.1.1 | MIT |
| `path-scurry` | 3.0.0 | BlueOak-1.0.0 |
| `pend` | 1.2.0 | MIT |
| `playwright` | 1.65.0 | Apache-2.0 |
| `playwright-core` | 1.65.0 | Apache-2.0 |
| `plist` | 3.1.1 | MIT |
| `prompts` | 2.4.2 | MIT |
| `readable-stream` | 3.6.2 | MIT |
| `rimraf` | 6.1.4 | BlueOak-1.0.0 |
| `safe-buffer` | 5.2.1 | MIT |
| `sax` | 1.1.4 | ISC |
| `semver` | 7.8.6 | ISC |
| `shebang-command` | 2.0.0 | MIT |
| `shebang-regex` | 3.0.0 | MIT |
| `signal-exit` | 3.0.7 | ISC |
| `sisteransi` | 1.0.5 | MIT |
| `slice-ansi` | 4.0.0 | MIT |
| `split2` | 4.2.0 | ISC |
| `string_decoder` | 1.3.0 | MIT |
| `string-width` | 4.2.3 | MIT |
| `strip-ansi` | 6.0.1 | MIT |
| `tar` | 7.5.22 | BlueOak-1.0.0 |
| `through2` | 4.0.2 | MIT |
| `tree-kill` | 1.2.2 | MIT |
| `undici-types` | 8.9.0 | MIT |
| `universalify` | 2.0.1 | MIT |
| `untildify` | 4.0.0 | MIT |
| `util-deprecate` | 1.0.2 | MIT |
| `which` | 2.0.2 | ISC |
| `wrap-ansi` | 7.0.0 | MIT |
| `xml2js` | 0.6.2 | MIT |
| `xmlbuilder` | 11.0.1 | MIT |
| `xmlbuilder` | 15.1.1 | MIT |
| `yallist` | 5.0.0 | BlueOak-1.0.0 |
| `yauzl` | 2.10.0 | MIT |

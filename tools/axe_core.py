#!/usr/bin/env python3
"""axe-core, an accessibility checker, for the axe group of tools/test_browser.py. Never part of the website.

    python3 tools/axe_core.py --fetch    # download it if it isn't saved yet, and check it
    python3 tools/axe_core.py --check    # check the saved copy, without downloading anything
    python3 tools/axe_core.py --self-test   # check, offline, that wrong files are refused

The tests use one file, axe.min.js, from one pinned release of axe-core, an open-source checker by
Deque Systems under the Mozilla Public License 2.0. It comes from the official npm registry, as that
release's package file. Before anything is taken out of it, the package file must match the SHA-512
hash the registry publishes for it ("dist.integrity"). Then axe.min.js must match the SHA-256 hash
axe-core itself publishes for that release, in the package's sri-history.json. Both hashes, and the
sizes, are recorded below. Nothing else is taken out of the package, nothing is installed, and npm
and the package's scripts never run.

The checked copy is kept in tools/cache/, which git ignores, and is checked again every time the
tests use it. The tests inject it into their own headless Chrome. The site never serves it, links
to it, or loads anything from another site.

To move to a newer release, choose the newest one that has been out for at least two weeks, read
its "dist" entry and publish date at https://registry.npmjs.org/axe-core, and change VERSION, URL
and every hash and size below together. axe.min.js's hash is in that release's sri-history.json.
Then run the axe group of the browser tests and triage anything new.
"""
import argparse
import base64
import hashlib
import io
import os
import pathlib
import sys
import tarfile
import urllib.request

TOOLS = pathlib.Path(__file__).resolve().parent
VERSION = "4.14.0"
LICENSE = "MPL-2.0"
# The release's package file on the official npm registry, published October 5, 2026. It was the newest
# release, and more than two weeks old, when it was chosen on November 9, 2026.
URL = "https://registry.npmjs.org/axe-core/-/axe-core-4.14.0.tgz"
# The registry's hash for that file ("dist.integrity"), and its size, read November 9, 2026.
PACKAGE_SHA512 = "sha512-9WTZxEjsZ7b13TH8JPmbV2z8CHbl80/2hm3XPEG4JgNdQLK81IBRXmSxHfMAOkSqQeRxT/0dwNDz2GOm3zzpcQ=="
PACKAGE_SIZE = 706680
MEMBER = "package/axe.min.js"
# axe.min.js, whose hash the package's sri-history.json gives as sha256-IMCf4Veoo0ow4kGqofza3mV3NPCKs3ns++t9RcxG6Hg=
AXE_SHA256 = "20c09fe157a8a34a30e241aaa1fcdade657734f08ab379ecfbeb7d45cc46e878"
AXE_SIZE = 652140
CACHE = TOOLS / "cache" / f"axe-core-{VERSION}" / "axe.min.js"
# Far more than either file needs, so a wrong answer can't fill the disk.
LIMIT = 8 * 1024 * 1024


class AxeError(Exception):
    pass


def shown(path):
    try:
        return str(path.relative_to(TOOLS.parent))
    except ValueError:
        return path.name


def problem_with(data):
    """Why these bytes aren't the pinned axe.min.js, or "" if they are."""
    if len(data) != AXE_SIZE:
        return f"it has {len(data)} bytes, not {AXE_SIZE}"
    if hashlib.sha256(data).hexdigest() != AXE_SHA256:
        return "its SHA-256 hash doesn't match the one recorded in tools/axe_core.py"
    return ""


def unpack(package):
    """axe.min.js out of the package file, once the package matches the registry's hash."""
    if len(package) != PACKAGE_SIZE:
        raise AxeError(f"the package file has {len(package)} bytes, not the {PACKAGE_SIZE} the registry lists")
    digest = "sha512-" + base64.b64encode(hashlib.sha512(package).digest()).decode()
    if digest != PACKAGE_SHA512:
        raise AxeError("the package file doesn't match the SHA-512 hash the npm registry publishes for it")
    # Read in memory: nothing from the package is written to disk except this one file, once it is checked.
    with tarfile.open(fileobj=io.BytesIO(package), mode="r:gz") as tar:
        try:
            member = tar.getmember(MEMBER)
        except KeyError:
            raise AxeError(f"the package has no {MEMBER}") from None
        if not member.isfile() or member.size > LIMIT:
            raise AxeError(f"{MEMBER} in the package is not an ordinary file of the expected size")
        data = tar.extractfile(member).read()
    problem = problem_with(data)
    if problem:
        raise AxeError(f"axe.min.js in the package doesn't match: {problem}")
    return data


def download(url=URL):
    request = urllib.request.Request(url, headers={"User-Agent": "tidelight-tests"})
    with urllib.request.urlopen(request, timeout=60) as response:
        data = response.read(LIMIT + 1)
    if len(data) > LIMIT:
        raise AxeError("the download is far larger than expected")
    return data


def fetch(out=print):
    """Downloads and checks axe.min.js, unless a checked copy is already saved. Returns its path."""
    if CACHE.exists():
        problem = problem_with(CACHE.read_bytes())
        if not problem:
            return CACHE
        out(f"The saved copy at {shown(CACHE)} doesn't match ({problem}), so it is downloaded again.")
    out(f"Downloading axe-core {VERSION} for the accessibility tests (about 700 KB), once: {URL}")
    try:
        data = unpack(download())
    except OSError as error:
        raise AxeError(f"could not download axe-core: {error}") from None
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    partial = CACHE.with_name(CACHE.name + ".part")
    partial.write_bytes(data)
    os.replace(partial, CACHE)
    out(f"Saved {shown(CACHE)}, {len(data)} bytes, SHA-256 {AXE_SHA256}.")
    return CACHE


def source(download_if_missing=True, out=print):
    """The checked text of axe.min.js, for injecting into the test browser."""
    if download_if_missing:
        fetch(out)
    if not CACHE.exists():
        raise AxeError(f"{shown(CACHE)} is missing. Run: python3 tools/axe_core.py --fetch")
    data = CACHE.read_bytes()
    problem = problem_with(data)
    if problem:
        raise AxeError(f"{shown(CACHE)} doesn't match: {problem}. Delete it and run: python3 tools/axe_core.py --fetch")
    return data.decode("utf-8")


def self_test():
    """Offline: each check refuses a file that is wrong in the way it looks for."""
    problems = []
    cases = [
        ("a package of the wrong size", lambda: unpack(b"x" * (PACKAGE_SIZE + 1)), "bytes, not"),
        ("a package of the right size with the wrong hash", lambda: unpack(b"x" * PACKAGE_SIZE), "SHA-512"),
    ]
    for label, attempt, words in cases:
        try:
            attempt()
            problems.append(f"{label} was accepted")
        except AxeError as error:
            if words not in str(error):
                problems.append(f"{label} was refused for another reason: {error}")
    if not problem_with(b"x" * AXE_SIZE):
        problems.append("an axe.min.js of the right size with the wrong hash was accepted")
    if not problem_with(b"x"):
        problems.append("an axe.min.js of the wrong size was accepted")
    for problem in problems:
        print("FAIL", problem)
    print(f"axe-core download self-test: {len(problems)} problems.")
    return 1 if problems else 0


def main():
    parser = argparse.ArgumentParser(description="Download and check axe-core for the accessibility tests.")
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--fetch", action="store_true", help="download it if it isn't saved yet, then check it")
    action.add_argument("--check", action="store_true", help="only check the saved copy")
    action.add_argument("--self-test", action="store_true", help="check, offline, that wrong files are refused")
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    try:
        source(download_if_missing=args.fetch)
    except AxeError as error:
        print(f"FAIL: {error}")
        return 1
    print(f"axe-core {VERSION} ({LICENSE}) at {shown(CACHE)} matches its recorded SHA-256 hash {AXE_SHA256}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

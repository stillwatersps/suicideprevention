#!/usr/bin/env python3
"""Makes QR codes in plain Python, for opening the preview on a phone. Never part of the website.

    python3 tools/qr.py "http://192.168.1.20:8000/suicideprevention/"   # print a code in the terminal
    python3 tools/qr.py --self-test                                     # check the encoder

tools/preview_server.py --lan prints a code of the address a phone should open, so a phone's camera
can open it instead of typing it. The code follows the QR code standard (ISO/IEC 18004): byte mode,
error correction level M, the smallest version (size) that fits, and the mask with the lowest
penalty score under the standard's four rules. It needs nothing but Python and downloads nothing.

The self-test checks the tables and the penalty rules everywhere. On a Mac with Xcode's command line
tools it also draws codes for several addresses, one of every size, and reads them back with macOS's
own QR code reader in Core Image, which shares no code with this file. Elsewhere that part is skipped.
"""
import argparse
import json
import os
import pathlib
import platform
import shutil
import struct
import subprocess
import sys
import tempfile
import zlib

# Error correction level M, from the standard's table: for each version, the error correction codewords
# in each block, then (number of blocks, data codewords in each) for the shorter blocks and the longer ones.
BLOCKS_M = {
    1: (10, (1, 16)), 2: (16, (1, 28)), 3: (26, (1, 44)), 4: (18, (2, 32)), 5: (24, (2, 43)),
    6: (16, (4, 27)), 7: (18, (4, 31)), 8: (22, (2, 38), (2, 39)), 9: (22, (3, 36), (2, 37)),
    10: (26, (4, 43), (1, 44)), 11: (30, (1, 50), (4, 51)), 12: (22, (6, 36), (2, 37)),
    13: (22, (8, 37), (1, 38)), 14: (24, (4, 40), (5, 41)), 15: (24, (5, 41), (5, 42)),
    16: (28, (7, 45), (3, 46)), 17: (28, (10, 46), (1, 47)), 18: (26, (9, 43), (4, 44)),
    19: (26, (3, 44), (11, 45)), 20: (26, (3, 41), (13, 42)), 21: (26, (17, 42)), 22: (28, (17, 46)),
    23: (28, (4, 47), (14, 48)), 24: (28, (6, 45), (14, 46)), 25: (28, (8, 47), (13, 48)),
    26: (28, (19, 46), (4, 47)), 27: (28, (22, 45), (3, 46)), 28: (28, (3, 45), (23, 46)),
    29: (28, (21, 45), (7, 46)), 30: (28, (19, 47), (10, 48)), 31: (28, (2, 46), (29, 47)),
    32: (28, (10, 46), (23, 47)), 33: (28, (14, 46), (21, 47)), 34: (28, (14, 46), (23, 47)),
    35: (28, (12, 47), (26, 48)), 36: (28, (6, 47), (34, 48)), 37: (28, (29, 46), (14, 47)),
    38: (28, (13, 46), (32, 47)), 39: (28, (40, 47), (7, 48)), 40: (28, (18, 47), (31, 48)),
}
# Level M's two format bits are 00. The 15 format bits are masked with this, so they are never all light.
LEVEL_M_BITS = 0b00
FORMAT_MASK = 0x5412
FORMAT_GENERATOR = 0x537
VERSION_GENERATOR = 0x1F25
BYTE_MODE = 0b0100
# The penalty weights of the standard's four rules.
N1, N2, N3, N4 = 3, 3, 40, 10
MASKS = [
    lambda x, y: (x + y) % 2 == 0,
    lambda x, y: y % 2 == 0,
    lambda x, y: x % 3 == 0,
    lambda x, y: (x + y) % 3 == 0,
    lambda x, y: (x // 3 + y // 2) % 2 == 0,
    lambda x, y: x * y % 2 + x * y % 3 == 0,
    lambda x, y: (x * y % 2 + x * y % 3) % 2 == 0,
    lambda x, y: ((x + y) % 2 + x * y % 3) % 2 == 0,
]
# The standard asks for a light border of 4 modules around the code.
QUIET = 4


class QRError(Exception):
    pass


# ---------------------------------------------------------------- tables


def size_of(version):
    return 17 + 4 * version


def alignment_positions(version):
    """The rows and columns where alignment patterns are centred, as listed in the standard's annex E."""
    if version == 1:
        return []
    count = version // 7 + 2
    last = size_of(version) - 7
    step = 26 if version == 32 else (version * 4 + count * 2 + 1) // (count * 2 - 2) * 2
    return [6] + sorted(last - i * step for i in range(count - 1))


def data_module_count(version):
    """Modules left for data and error correction once the fixed patterns are drawn, counted on a drawing."""
    grid = Grid(version)
    grid.draw_patterns()
    return sum(not fixed for row in grid.fixed for fixed in row)


def blocks(version):
    """A list of data-codeword counts, one per block, and the error correction codewords per block."""
    ec, *groups = BLOCKS_M[version]
    return [length for count, length in groups for _ in range(count)], ec


def data_capacity(version):
    return sum(blocks(version)[0])


def count_bits(version):
    return 8 if version < 10 else 16


def smallest_version(length):
    for version in range(1, 41):
        if 4 + count_bits(version) + 8 * length <= 8 * data_capacity(version):
            return version
    raise QRError(f"{length} bytes is more than a QR code holds at error correction level M")


# ---------------------------------------------------------------- Reed-Solomon error correction


def gf_multiply(a, b):
    """Multiplication in the field the standard uses, with the polynomial x^8 + x^4 + x^3 + x^2 + 1."""
    result = 0
    for i in range(7, -1, -1):
        result = (result << 1) ^ ((result >> 7) * 0x11D)
        result ^= ((b >> i) & 1) * a
    return result


def generator(degree):
    """The coefficients, highest first and leaving out the leading 1, of (x - 1)(x - 2)(x - 4)... with `degree` factors."""
    poly = [0] * (degree - 1) + [1]
    root = 1
    for _ in range(degree):
        for j in range(degree):
            poly[j] = gf_multiply(poly[j], root)
            if j + 1 < degree:
                poly[j] ^= poly[j + 1]
        root = gf_multiply(root, 2)
    return poly


def error_correction(data, degree):
    divisor = generator(degree)
    remainder = [0] * degree
    for byte in data:
        factor = byte ^ remainder.pop(0)
        remainder.append(0)
        for i, coefficient in enumerate(divisor):
            remainder[i] ^= gf_multiply(coefficient, factor)
    return remainder


# ---------------------------------------------------------------- codewords


def codewords(data, version):
    """The data in byte mode, padded, split into blocks, given error correction, and interleaved."""
    bits = []

    def put(value, length):
        bits.extend((value >> i) & 1 for i in range(length - 1, -1, -1))

    put(BYTE_MODE, 4)
    put(len(data), count_bits(version))
    for byte in data:
        put(byte, 8)
    capacity = 8 * data_capacity(version)
    put(0, min(4, capacity - len(bits)))  # the terminator
    put(0, -len(bits) % 8)
    padded = [int("".join(map(str, bits[i:i + 8])), 2) for i in range(0, len(bits), 8)]
    pad = 0xEC
    while len(padded) < data_capacity(version):
        padded.append(pad)
        pad ^= 0xEC ^ 0x11
    lengths, ec = blocks(version)
    data_blocks, start = [], 0
    for length in lengths:
        data_blocks.append(padded[start:start + length])
        start += length
    ec_blocks = [error_correction(block, ec) for block in data_blocks]
    result = []
    for i in range(max(lengths)):
        result += [block[i] for block in data_blocks if i < len(block)]
    for i in range(ec):
        result += [block[i] for block in ec_blocks]
    return result


# ---------------------------------------------------------------- drawing


def format_bits(mask):
    data = LEVEL_M_BITS << 3 | mask
    remainder = data
    for _ in range(10):
        remainder = (remainder << 1) ^ ((remainder >> 9) * FORMAT_GENERATOR)
    return (data << 10 | remainder) ^ FORMAT_MASK


def version_bits(version):
    remainder = version
    for _ in range(12):
        remainder = (remainder << 1) ^ ((remainder >> 11) * VERSION_GENERATOR)
    return version << 12 | remainder


class Grid:
    """Modules as grid[y][x], True for dark. `fixed` marks the patterns that data and masks leave alone."""

    def __init__(self, version):
        self.version = version
        self.size = size_of(version)
        self.dark = [[False] * self.size for _ in range(self.size)]
        self.fixed = [[False] * self.size for _ in range(self.size)]

    def set(self, x, y, dark):
        self.dark[y][x] = bool(dark)
        self.fixed[y][x] = True

    def draw_patterns(self):
        size = self.size
        for i in range(size):
            self.set(6, i, i % 2 == 0)
            self.set(i, 6, i % 2 == 0)
        for cx, cy in ((3, 3), (size - 4, 3), (3, size - 4)):
            for dy in range(-4, 5):
                for dx in range(-4, 5):
                    x, y = cx + dx, cy + dy
                    if 0 <= x < size and 0 <= y < size:
                        self.set(x, y, max(abs(dx), abs(dy)) not in (2, 4))
        positions = alignment_positions(self.version)
        last = len(positions) - 1
        for i, cx in enumerate(positions):
            for j, cy in enumerate(positions):
                if (i, j) in ((0, 0), (0, last), (last, 0)):
                    continue  # where the finder patterns are
                for dy in range(-2, 3):
                    for dx in range(-2, 3):
                        self.set(cx + dx, cy + dy, max(abs(dx), abs(dy)) != 1)
        self.draw_format(0)  # reserves the format areas; drawn again once the mask is chosen
        if self.version >= 7:
            bits = version_bits(self.version)
            for i in range(18):
                bit = (bits >> i) & 1
                a, b = size - 11 + i % 3, i // 3
                self.set(a, b, bit)
                self.set(b, a, bit)

    def draw_format(self, mask):
        bits = format_bits(mask)
        size = self.size
        bit = lambda i: (bits >> i) & 1  # noqa: E731
        for i in range(6):
            self.set(8, i, bit(i))
        self.set(8, 7, bit(6))
        self.set(8, 8, bit(7))
        self.set(7, 8, bit(8))
        for i in range(9, 15):
            self.set(14 - i, 8, bit(i))
        for i in range(8):
            self.set(size - 1 - i, 8, bit(i))
        for i in range(8, 15):
            self.set(8, size - 15 + i, bit(i))
        self.set(8, size - 8, True)  # the dark module

    def place(self, words):
        """Data bits in the standard's zigzag, two columns at a time from the bottom right."""
        size, i, total = self.size, 0, len(words) * 8
        right = size - 1
        while right >= 1:
            if right == 6:
                right = 5  # skip the vertical timing line
            upward = ((right + 1) & 2) == 0
            for step in range(size):
                y = size - 1 - step if upward else step
                for x in (right, right - 1):
                    if not self.fixed[y][x] and i < total:
                        self.dark[y][x] = bool((words[i >> 3] >> (7 - (i & 7))) & 1)
                        i += 1
            right -= 2
        if i != total:
            raise QRError(f"placed {i} of {total} bits")

    def masked(self, mask):
        rule = MASKS[mask]
        copy = Grid(self.version)
        copy.fixed = self.fixed
        copy.dark = [[self.dark[y][x] ^ (not self.fixed[y][x] and rule(x, y)) for x in range(self.size)] for y in range(self.size)]
        copy.draw_format(mask)
        return copy


# ---------------------------------------------------------------- penalty rules


def lines_of(dark):
    """Every row, then every column."""
    size = len(dark[0]) if dark else 0
    return [list(row) for row in dark] + [[row[x] for row in dark] for x in range(size)]


def rule1(lines):
    """Five or more modules of one color in a row or column: 3 points, and 1 more for each module past five."""
    score = 0
    for line in lines:
        run = 1
        for a, b in zip(line, line[1:]):
            if a == b:
                run += 1
            else:
                score += N1 + run - 5 if run >= 5 else 0
                run = 1
        score += N1 + run - 5 if run >= 5 else 0
    return score


def rule2(dark):
    """Each 2 by 2 block of one color: 3 points. Blocks may overlap."""
    return sum(N2 for y in range(len(dark) - 1) for x in range(len(dark[0]) - 1)
               if dark[y][x] == dark[y][x + 1] == dark[y + 1][x] == dark[y + 1][x + 1])


FINDER_LOOKALIKE = [True, False, True, True, True, False, True]


def rule3(lines):
    """Dark-light-dark-dark-dark-light-dark, with four light modules before it or after it: 40 points
    for each. The light border around the code counts as light."""
    before = [False] * 4 + FINDER_LOOKALIKE
    after = FINDER_LOOKALIKE + [False] * 4
    score = 0
    for line in lines:
        padded = [False] * 4 + list(line) + [False] * 4
        for i in range(len(padded) - 10):
            window = padded[i:i + 11]
            score += N3 * ((window == before) + (window == after))
    return score


def rule4(dark):
    """10 points for each full 5% step the share of dark modules is away from half."""
    count = sum(map(sum, dark))
    total = len(dark) * len(dark[0])
    return N4 * ((abs(count * 20 - total * 10) + total - 1) // total - 1)


def penalty(dark):
    """The standard's penalty score for a finished code: lower is easier for a reader."""
    lines = lines_of(dark)
    return rule1(lines) + rule2(dark) + rule3(lines) + rule4(dark)


# ---------------------------------------------------------------- encoding


def encode(text, mask=None):
    """The QR code for text (or bytes), as rows of True for dark. The mask is chosen by the penalty rules
    unless one is given, which only the self-test does."""
    data = text.encode("utf-8") if isinstance(text, str) else bytes(text)
    version = smallest_version(len(data))
    grid = Grid(version)
    grid.draw_patterns()
    grid.place(codewords(data, version))
    if mask is None:
        scores = [penalty(grid.masked(m).dark) for m in range(8)]
        mask = scores.index(min(scores))
    return grid.masked(mask).dark


def chosen_mask(matrix):
    """The mask a finished code says it uses, read back from its first copy of the format bits."""
    bits = 0
    cells = [(8, i) for i in range(6)] + [(8, 7), (8, 8), (7, 8)] + [(14 - i, 8) for i in range(9, 15)]
    for i, (x, y) in enumerate(cells):
        bits |= matrix[y][x] << i
    return ((bits ^ FORMAT_MASK) >> 10) & 7


# ---------------------------------------------------------------- output


def terminal(matrix, color=True):
    """The code as text, two rows of modules to a line, using Unicode block characters, with the light
    border the standard asks for. With color, dark is forced to black and light to white, so a terminal
    with light text on a dark background doesn't show the code inverted, which some cameras can't read."""
    size = len(matrix)
    full = size + 2 * QUIET
    rows = [[False] * full for _ in range(QUIET)]
    rows += [[False] * QUIET + list(row) + [False] * QUIET for row in matrix]
    rows += [[False] * full for _ in range(QUIET + (full % 2))]
    # Upper half block, lower half block, full block.
    chars = {(False, False): " ", (True, False): "\u2580", (False, True): "\u2584", (True, True): "\u2588"}
    lines = []
    for y in range(0, len(rows), 2):
        line = "".join(chars[(rows[y][x], rows[y + 1][x])] for x in range(full))
        lines.append("\033[30;107m" + line + "\033[0m" if color else line)
    return "\n".join(lines)


def from_terminal(text):
    """Reads terminal() output back into modules, border included, to check the drawing."""
    top = {" ": False, "\u2580": True, "\u2584": False, "\u2588": True}
    bottom = {" ": False, "\u2580": False, "\u2584": True, "\u2588": True}
    rows = []
    for line in text.replace("\033[30;107m", "").replace("\033[0m", "").split("\n"):
        rows.append([top[c] for c in line])
        rows.append([bottom[c] for c in line])
    return rows


def png(matrix, scale=8):
    """A black and white PNG of the code with its border, for the self-test."""
    size = (len(matrix) + 2 * QUIET) * scale
    raw = bytearray()
    for y in range(size):
        my = y // scale - QUIET
        raw.append(0)
        for x in range(size):
            mx = x // scale - QUIET
            dark = 0 <= my < len(matrix) and 0 <= mx < len(matrix) and matrix[my][mx]
            raw.append(0 if dark else 255)

    def chunk(kind, body):
        return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body) & 0xFFFFFFFF)

    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 0, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b""))


def use_color(stream=sys.stdout):
    return stream.isatty() and "NO_COLOR" not in os.environ and os.environ.get("TERM") != "dumb"


# ---------------------------------------------------------------- self-test

# Reads each PNG named on the command line with Core Image's QR code detector and prints, for each,
# a JSON list of the messages found.
SWIFT = r"""
import CoreImage
import Foundation

let detector = CIDetector(ofType: CIDetectorTypeQRCode, context: nil, options: [CIDetectorAccuracy: CIDetectorAccuracyHigh])!
for path in CommandLine.arguments.dropFirst() {
    var found: [String] = []
    if let image = CIImage(contentsOf: URL(fileURLWithPath: path)) {
        for feature in detector.features(in: image) {
            if let code = feature as? CIQRCodeFeature, let message = code.messageString { found.append(message) }
        }
    }
    let data = try! JSONSerialization.data(withJSONObject: found)
    print(String(data: data, encoding: .utf8)!)
}
"""

# Addresses like the ones preview_server.py prints, and longer text that needs one of every version.
ADDRESSES = [
    "http://localhost:8000/suicideprevention/",
    "http://127.0.0.1:8123/suicideprevention/",
    "http://192.168.1.20:8000/suicideprevention/",
    "http://10.0.0.5:8000/suicideprevention/es/",
    "http://172.31.255.254:65535/suicideprevention/get-help/",
]


def text_for_version(version):
    """Text just long enough to need this version."""
    length = 1 if version == 1 else max(1, (data_capacity(version - 1) * 8 - 4 - count_bits(version - 1)) // 8 + 1)
    piece = "http://localhost:8000/suicideprevention/?"
    return (piece * (length // len(piece) + 1))[:length]


def self_test():
    problems = []
    # The tables agree with the layout: every module left over holds a codeword bit, apart from up to 7.
    for version in range(1, 41):
        lengths, ec = blocks(version)
        words = sum(lengths) + ec * len(lengths)
        if not 0 <= data_module_count(version) - 8 * words < 8:
            problems.append(f"version {version}: the block table has {words} codewords, but the layout leaves {data_module_count(version)} modules")
        if max(lengths) - min(lengths) > 1:
            problems.append(f"version {version}: blocks differ by more than one codeword")
    known = {2: [6, 18], 7: [6, 22, 38], 14: [6, 26, 46, 66], 32: [6, 34, 60, 86, 112, 138], 40: [6, 30, 58, 86, 114, 142, 170]}
    for version, positions in known.items():
        if alignment_positions(version) != positions:
            problems.append(f"version {version}: alignment patterns at {alignment_positions(version)}, not {positions}")
    # Values from the standard: the format bits for level M with mask 0, and version 7's version bits.
    if format_bits(0) != 0b101010000010010:
        problems.append(f"the format bits for level M, mask 0, are {format_bits(0):015b}, not 101010000010010")
    if version_bits(7) != 0b000111110010010100:
        problems.append(f"version 7's version bits are {version_bits(7):018b}, not 000111110010010100")
    if problems:
        # Codes can't be drawn from wrong tables, so the rest is left out.
        for problem in problems:
            print("FAIL", problem)
        print(f"QR self-test: {len(problems)} problems, so no codes were drawn.")
        return 1
    # The penalty rules, one at a time, on cases worked out by hand.
    light = [[False] * 21 for _ in range(21)]
    checker = [[(x + y) % 2 == 0 for x in range(21)] for y in range(21)]
    lookalike = [True, False, True, True, True, False, True, False, False, False, False]
    worked = [
        # 42 lines of 21 light modules, each 3 + 16.
        ("rule 1, all light", rule1(lines_of(light)), 42 * 19),
        ("rule 1, a run of 4", rule1([[True] * 4 + [False]]), 0),
        ("rule 1, runs of 5 and 7", rule1([[True] * 5 + [False] * 7]), 3 + 5),
        ("rule 2, all light", rule2(light), 400 * 3),
        ("rule 2, checkerboard", rule2(checker), 0),
        ("rule 2, a 2 by 3 block", rule2([[True] * 3, [True] * 3]), 6),
        ("rule 3, checkerboard", rule3(lines_of(checker)), 0),
        # Light on both sides, counting the border: it is found once with light before it and once with light after.
        ("rule 3, a lookalike with light on both sides", rule3([lookalike]), 80),
        ("rule 3, a lookalike with dark on both sides", rule3([[True] * 4 + FINDER_LOOKALIKE[1:-1] + [True] * 4]), 0),
        # No dark modules is 50% away from half: 9 full steps of 5% past the first.
        ("rule 4, all light", rule4(light), 90),
        # 221 of 441 dark is just over half.
        ("rule 4, checkerboard", rule4(checker), 0),
        ("rule 4, 60% dark", rule4([[True] * 6 + [False] * 4]), 10),
        ("rule 4, 55% dark", rule4([[True] * 11 + [False] * 9]), 0),
    ]
    for label, got, expected in worked:
        if got != expected:
            problems.append(f"penalty {label}: {got}, not {expected}")
    # What tools/preview_server.py --lan prints: the drawing, read back from the printed text, is the code
    # for the address, and the address is printed as text too. It is read back with Core Image below.
    import preview_server
    printed = []
    for text in ADDRESSES:
        matrix = encode(text)
        scores = [penalty(encode(text, mask)) for mask in range(8)]
        mask = chosen_mask(matrix)
        if scores[mask] != min(scores):
            problems.append(f"{text}: mask {mask} was used, but mask {scores.index(min(scores))} has a lower penalty")
        output = preview_server.phone_address(text, color=True).split("\n")
        if output[-1] != f"On a phone on the same Wi-Fi: {text}":
            problems.append(f"{text}: the preview server doesn't print the address as text below the code")
        drawn = from_terminal("\n".join(output[1:-1]))
        border = [[False] * QUIET + list(r) + [False] * QUIET for r in matrix]
        expected = [[False] * len(border[0])] * QUIET + border + [[False] * len(border[0])] * QUIET
        if drawn[:len(expected)] != expected or any(any(r) for r in drawn[len(expected):]):
            problems.append(f"{text}: the terminal drawing doesn't match the code")
        # The last text line can hold one extra light row, so the code has an even number of rows.
        printed.append((text, f"the preview server's drawing for {text}", drawn[:len(drawn[0])]))

    if platform.system() != "Darwin" or not shutil.which("swiftc"):
        print("Skipped reading the codes back: that needs a Mac with Xcode's command line tools (swiftc).")
    else:
        cases = [(text, f"address {i + 1}", encode(text)) for i, text in enumerate(ADDRESSES)]
        cases += [(text_for_version(v), f"version {v}", encode(text_for_version(v))) for v in range(1, 41)]
        cases += [("Línea de Prevención del Suicidio y Crisis 988", "accented text", encode("Línea de Prevención del Suicidio y Crisis 988"))]
        cases += printed
        with tempfile.TemporaryDirectory(prefix="tidelight-qr-") as folder:
            folder = pathlib.Path(folder)
            (folder / "read.swift").write_text(SWIFT, encoding="utf-8")
            subprocess.run(["swiftc", "-O", str(folder / "read.swift"), "-o", str(folder / "read")], check=True, capture_output=True)
            files = []
            for i, (text, label, matrix) in enumerate(cases):
                if label.startswith("version ") and len(matrix) != size_of(int(label.split()[1])):
                    problems.append(f"{label}: the code is {len(matrix)} modules wide, not {size_of(int(label.split()[1]))}")
                # Small codes at 8 pixels a module, large ones at 4, so every image stays a few hundred pixels.
                path = folder / f"code-{i}.png"
                path.write_bytes(png(matrix, 8 if len(matrix) < 60 else 4))
                files.append(path)
            done = subprocess.run([str(folder / "read"), *map(str, files)], capture_output=True, text=True, timeout=300)
            answers = [json.loads(line) for line in done.stdout.splitlines() if line.startswith("[")]
            if done.returncode != 0 or len(answers) != len(cases):
                problems.append(f"the Core Image reader answered {len(answers)} of {len(cases)} codes (return code {done.returncode})")
            for (text, label, _), found in zip(cases, answers):
                if found != [text]:
                    problems.append(f"{label}: Core Image could not read the code back: it read {found!r}, not {text!r}")
            print(f"Core Image read back {sum(1 for (t, _, _), f in zip(cases, answers) if f == [t])} of {len(cases)} codes, "
                  "including one of every version from 1 to 40 and what the preview server prints.")
    for problem in problems:
        print("FAIL", problem)
    print(f"QR self-test: {len(problems)} problems.")
    return 1 if problems else 0


def main():
    parser = argparse.ArgumentParser(description="Print a QR code in the terminal, or check the encoder.")
    parser.add_argument("text", nargs="?", help="what the code should hold, such as an address")
    parser.add_argument("--self-test", action="store_true", help="check the encoder; on a Mac, read codes back with Core Image")
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    if not args.text:
        parser.error("give the text for the code, or --self-test")
    print(terminal(encode(args.text), use_color()))
    print(args.text)
    return 0


if __name__ == "__main__":
    sys.exit(main())

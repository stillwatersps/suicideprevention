#!/usr/bin/env python3
"""Tests the website in a real browser, served the way GitHub Pages will serve it.

    python3 tools/test_browser.py                    # everything, a few minutes
    python3 tools/test_browser.py --only keyboard    # one group; see GROUPS below
    python3 tools/test_browser.py --pages get-help/  # only pages whose path has this text
    python3 tools/test_browser.py --screens DIR      # also save phone screenshots

Needs Python 3 and Google Chrome or Chromium. Chrome runs with a throwaway profile.

It never calls, texts, chats, or submits anything: clicks on call and text links are
refused here and blocked in the page. Quick exit is tested against a stand-in for
weather.gov, so no outside site is contacted.

Passing shows the pages behave as tested in desktop Chrome, including its phone-size
emulation. It is not a test on a real phone or with a screen reader, and it says
nothing about whether the content is right. See notes/CONTENT-REVIEW.md.
"""
import argparse
import base64
import html
import html.parser
import http.server
import json
import pathlib
import re
import shutil
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

TOOLS = pathlib.Path(__file__).resolve().parent
ROOT = TOOLS.parent
sys.path.insert(0, str(TOOLS))
import axe_core  # noqa: E402
from browser import Browser, Tab, find_chrome  # noqa: E402
from check_site import PHONE_SCHEMES, OTHER_PHONE_SCHEMES, SHOWN_OPACITY, allowed_numbers, find_pages, phone_digits, scheme_of  # noqa: E402
from preview_server import BASE, PAGES_CACHE, Server, make_server, published_items  # noqa: E402

# name, width, height, phone-style viewport
VIEWPORTS = [
    ("phone 320x568", 320, 568, True),
    ("phone 375x667", 375, 667, True),
    ("phone 390x844", 390, 844, True),
    ("phone 430x932", 430, 932, True),
    ("phone landscape 568x320", 568, 320, True),
    # Shorter phones on their side, where the compact one-row strip pins (see notes/DECISIONS.md).
    ("phone landscape 568x300", 568, 300, True),
    ("phone landscape 640x290", 640, 290, True),
    # Below the compact strip's height limit, 192px at the default text size, where even one row
    # would cover more than a quarter of the screen.
    ("phone landscape 640x180", 640, 180, True),
    # Safari on an iPhone 17 on its side, as measured in the iOS Simulator: its toolbars take
    # the rest, and page layout keeps this height even when they shrink.
    ("phone landscape 750x292", 750, 292, True),
    ("phone landscape 844x390", 844, 390, True),
    ("tablet 768x1024", 768, 1024, True),
    ("tablet landscape 1024x768", 1024, 768, True),
    ("laptop 1280x800", 1280, 800, False),
    ("desktop 1440x900", 1440, 900, False),
    ("400% zoom of 1280x900", 320, 225, False),
]
# Where the crisis strip must stay pinned, so 988 and 911 are always one tap away.
MUST_PIN = {
    "phone 320x568", "phone 375x667", "phone 390x844", "phone 430x932",
    "phone landscape 568x320", "phone landscape 568x300", "phone landscape 640x290",
    "phone landscape 750x292", "phone landscape 844x390", "tablet 768x1024",
}
# Where the crisis strip must scroll away, because pinned it would cover too much of the screen.
# Quick exit floats in the corner there, as everywhere the strip scrolls away.
MUST_NOT_PIN = {"phone landscape 640x180"}
# Where the compact strip must be in use, in both languages. This also shows the audit can tell
# it is there, which the checks of its limits need.
COMPACT = {"phone landscape 568x300", "phone landscape 640x290"}
# Phones on their side, where the pinned strip must also be a single row taking a quarter of the
# screen's height or less: the compact strip on short screens, the full one on wider screens. The
# compact strip must keep to these limits at every size and text size, wherever it is in use.
ONE_ROW = {"phone landscape 568x300", "phone landscape 640x290", "phone landscape 750x292", "phone landscape 844x390"}
ONE_ROW_MAX_PERCENT = 25
# name, width, height, phone-style viewport, text sizes in percent of the browser's default
TEXT_SIZES = [
    ("phone 320x568", 320, 568, True, (150, 200)),
    ("phone 390x844", 390, 844, True, (150, 200)),
    ("phone landscape 568x300", 568, 300, True, (150, 200)),
    ("phone landscape 640x290", 640, 290, True, (150, 200)),
    ("phone landscape 750x292", 750, 292, True, (150, 200)),
    ("phone landscape 844x390", 844, 390, True, (150, 200)),
    # Smaller text, as with desktop Chrome's "Small" font size, just past where the compact strip's
    # width limits would be without their floors in px. Part of the row doesn't shrink with the text.
    ("short screen 236x200", 236, 200, True, (75,)),
    ("short screen 410x200", 410, 200, True, (75,)),
    # Larger text on a desktop width must get a header that fits, not one that runs off the screen.
    ("tablet landscape 1024x768", 1024, 768, True, (150, 200)),
    ("laptop 1280x800", 1280, 800, False, (150, 200)),
]
# With larger or smaller text, where the strip must still pin, and in which languages. On a phone on
# its side that is the compact strip. The Spanish row is longer, so it pins in fewer places. Elsewhere
# at these sizes the strip may scroll away, and Quick exit floats.
MUST_PIN_TEXT = {
    ("phone 390x844", 150): {"en", "es"},
    ("phone landscape 568x300", 150): {"en"},
    ("phone landscape 640x290", 150): {"en"},
    ("phone landscape 640x290", 200): {"en"},
    ("phone landscape 750x292", 150): {"en"},
    ("phone landscape 750x292", 200): {"en"},
    ("phone landscape 844x390", 150): {"en", "es"},
    ("phone landscape 844x390", 200): {"en"},
    ("short screen 410x200", 75): {"en"},
}
GROUPS = [
    "links", "matrix", "textsize", "keyboard", "menu", "jumps", "folds", "language",
    "quickexit", "reducedmotion", "nojs", "print", "contact", "a11ytree", "axe", "offline", "speed", "modes", "privacy",
]
# Runs in every page and frame before the page's own scripts. A click, tap or Enter on a link that leaves
# the local test site is stopped, unless the test said to expect that address and answers it with a
# stand-in. A call, text, or other app link is always stopped, whatever its letter case. The browser
# itself can't reach other sites either: see Browser in tools/browser.py.
SAFE_CLICKS = """
(function (allowed) {
  function blocked(link) {
    var url;
    try { url = new URL(link.href, location.href); } catch (e) { return true; }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return true;
    if (url.origin === location.origin) return false;
    return !allowed.some(function (start) { return url.href.indexOf(start) === 0; });
  }
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href], area[href]');
    if (link && blocked(link)) { event.preventDefault(); event.stopPropagation(); window.__blockedClick = String(link.href); }
  }, true);
})(%s);
"""

# Reads the page and reports layout, contrast, and naming problems. Runs inside the page.
AUDIT_JS = r"""
(function () {
  var out = {hscroll: null, offscreen: [], clipped: [], smallTargets: [], tinyTargets: [], overlaps: [],
             brokenImages: [], contrast: [], unnamed: [], pinned: null, exitCovers: [], colorOnlyLinks: [], stripTargets: [],
             deadCrisis: [], exitCoversTop: [], stripTop: false, stripBottom: false, headerBottom: false, stripHidden: [],
             stripRows: 0, pinnedShare: 0, compact: false, exitFixed: false};
  function shown(el) {
    var s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') return false;
    var r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  }
  // How opaque an element is, with the opacity and any opacity() filter of every parent multiplied in.
  // A link can be "shown" and tappable at opacity 0, so the crisis links are also checked for this.
  function opacity(el) {
    var value = 1;
    for (var node = el; node && node.nodeType === 1; node = node.parentElement) {
      var s = getComputedStyle(node);
      value *= parseFloat(s.opacity);
      (s.filter.match(/opacity\([^)]*\)/g) || []).forEach(function (f) {
        var m = f.match(/opacity\(\s*([\d.]+)(%?)/);
        if (m) value *= parseFloat(m[1]) / (m[2] ? 100 : 1);
      });
    }
    return value;
  }
  // Things that let taps through can still cover a link. For a moment they are made to catch taps,
  // so a hit test finds them, and then they are put back exactly as they were.
  var passThrough = Array.prototype.filter.call(document.querySelectorAll('*'), function (n) {
    return getComputedStyle(n).pointerEvents === 'none';
  });
  function hitTest(el, seen) {
    var saved = [];
    if (seen) passThrough.forEach(function (n) {
      saved.push([n, n.style.getPropertyValue('pointer-events'), n.style.getPropertyPriority('pointer-events')]);
      n.style.setProperty('pointer-events', 'auto', 'important');
    });
    var r = el.getClientRects()[0] || el.getBoundingClientRect();
    var y = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
    var problem = '';
    [r.left + 3, r.left + r.width / 2, r.right - 3].forEach(function (x) {
      var hit = document.elementFromPoint(Math.min(Math.max(x, 0), innerWidth - 1), y);
      if (!problem && !(hit && (hit === el || el.contains(hit)))) problem = hit ? 'is under ' + name(hit) : 'is off the screen';
    });
    saved.forEach(function (s) { s[0].style.setProperty('pointer-events', s[1], s[2]); });
    return problem;
  }
  // Why a person can't see a crisis link where it is, or '' if they can: hidden, too faint (SHOWN_OPACITY
  // in tools/check_site.py), clipped or scaled to nothing, off the screen, or under something else.
  function unseen(el) {
    if (!el) return 'is missing';
    var s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility !== 'visible') return 'is hidden';
    var o = opacity(el);
    if (o < __SHOWN_OPACITY__) return 'is see-through (opacity ' + o.toFixed(2) + ' with its parents)';
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return 'has no size';
    if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return 'is off the screen';
    var covered = hitTest(el, true);
    return covered ? covered.replace('is under', 'is covered by') : '';
  }
  function hiddenOnPurpose(el) {
    return !!el.closest('.visually-hidden, .skip-link');
  }
  function name(el) {
    var cls = el.className && el.className.baseVal === undefined && el.className ? '.' + String(el.className).trim().split(/\s+/).join('.') : '';
    var text = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return el.tagName.toLowerCase() + cls + (text ? ' "' + text + '"' : '');
  }
  var de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1) out.hscroll = [de.scrollWidth, de.clientWidth];

  var all = Array.prototype.slice.call(document.querySelectorAll('body *'));
  all.forEach(function (el) {
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') return;
    if (hiddenOnPurpose(el) || !shown(el)) return;
    var r = el.getBoundingClientRect();
    if (r.right > de.clientWidth + 1 || r.left < -1) {
      // Inside a sideways-scrolling area is fine; nothing here should scroll sideways though.
      out.offscreen.push(name(el) + ' spans ' + Math.round(r.left) + ' to ' + Math.round(r.right));
    }
    var s = getComputedStyle(el);
    if ((s.overflowX === 'hidden' || s.overflowX === 'clip') && el.scrollWidth > el.clientWidth + 1 && el.textContent.trim()) {
      out.clipped.push(name(el) + ' cuts off sideways: ' + el.scrollWidth + ' > ' + el.clientWidth);
    }
    if ((s.overflowY === 'hidden' || s.overflowY === 'clip') && el.scrollHeight > el.clientHeight + 3 && el.textContent.trim()) {
      out.clipped.push(name(el) + ' cuts off vertically: ' + el.scrollHeight + ' > ' + el.clientHeight);
    }
  });

  // Tap targets. Links inside a sentence are exempt, as in WCAG 2.5.8.
  var controls = Array.prototype.slice.call(document.querySelectorAll('a[href], button:not([hidden]), summary')).filter(function (el) {
    return !hiddenOnPurpose(el) && shown(el);
  });
  controls.forEach(function (el) {
    var s = getComputedStyle(el);
    var r = el.getBoundingClientRect();
    var inline = s.display === 'inline';
    if (el.classList.contains('card-link')) return;  // its tap area is the whole card
    // The pinned strip is the one control that is always on screen, so it gets full-size targets.
    if (el.closest('.crisis-bar') && getComputedStyle(el.closest('.crisis-bar')).position === 'sticky' && r.height < 44) {
      out.stripTargets.push(name(el) + ' is ' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
    if (inline) return;  // a link inside a sentence
    var label = name(el) + ' is ' + Math.round(r.width) + 'x' + Math.round(r.height);
    if (r.height < 24 || r.width < 24) out.tinyTargets.push(label);
    else if (r.height < 44) out.smallTargets.push(label);
  });
  // A link inside a sentence must look like a link without relying on color.
  controls.forEach(function (el) {
    if (el.tagName.toLowerCase() !== 'a' || getComputedStyle(el).display !== 'inline' || el.classList.contains('card-link')) return;
    var holder = el.closest('p, li');
    if (!holder || holder.textContent.trim().length <= el.textContent.trim().length) return;
    if (getComputedStyle(el).textDecorationLine.indexOf('underline') < 0) out.colorOnlyLinks.push(name(el));
  });
  // Controls that overlap each other.
  var boxes = controls.filter(function (el) {
    if (el.closest('details:not([open])') && !el.closest('summary')) return false;  // folded away, whatever boxes a browser reports
    return getComputedStyle(el).position !== 'fixed';
  }).map(function (el) { return {el: el, r: el.getClientRects()[0] || el.getBoundingClientRect()}; });
  for (var i = 0; i < boxes.length; i++) {
    for (var j = i + 1; j < boxes.length; j++) {
      var a = boxes[i], b = boxes[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      var w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      var h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w > 2 && h > 2) out.overlaps.push(name(a.el) + ' overlaps ' + name(b.el));
    }
  }

  Array.prototype.slice.call(document.images).forEach(function (img) {
    if (!img.complete || img.naturalWidth === 0) out.brokenImages.push(img.currentSrc || img.src);
  });

  // Contrast, against the color or every gradient stop behind the text.
  function parse(color) {
    var m = color.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(/[ ,\/]+/).map(parseFloat);
    return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1};
  }
  function over(top, under) {
    var a = top.a;
    return {r: top.r * a + under.r * (1 - a), g: top.g * a + under.g * (1 - a), b: top.b * a + under.b * (1 - a), a: 1};
  }
  function lum(c) {
    function f(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function ratio(a, b) {
    var x = lum(a), y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  function backgrounds(el) {
    // Layers from the element outward, stopping at the first opaque one.
    var layers = [];
    for (var node = el; node; node = node.parentElement) {
      var s = getComputedStyle(node);
      if (s.backgroundImage && s.backgroundImage !== 'none') {
        var stops = s.backgroundImage.match(/rgba?\([^)]+\)/g);
        if (stops) { layers.push(stops.map(parse)); if (stops.map(parse).every(function (c) { return c.a === 1; })) return layers; }
      }
      var c = parse(s.backgroundColor);
      if (c && c.a > 0) { layers.push([c]); if (c.a === 1) return layers; }
    }
    layers.push([{r: 255, g: 255, b: 255, a: 1}]);
    return layers;
  }
  function combos(layers) {
    var result = layers[layers.length - 1].slice();
    for (var i = layers.length - 2; i >= 0; i--) {
      var next = [];
      layers[i].forEach(function (t) { result.forEach(function (u) { next.push(over(t, u)); }); });
      result = next.slice(0, 40);
    }
    return result;
  }
  var seen = {};
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    var text = walker.currentNode;
    if (!text.nodeValue.trim()) continue;
    var parent = text.parentElement;
    if (!parent || parent.closest('script, style, svg, noscript') || hiddenOnPurpose(parent) || !shown(parent)) continue;
    var s = getComputedStyle(parent);
    var fg = parse(s.color);
    if (!fg) continue;
    var size = parseFloat(s.fontSize);
    var bold = parseInt(s.fontWeight, 10) >= 700;
    var need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
    var worst = 99, bg = null;
    // A parent's opacity fades the text too, though the text's own color doesn't show it.
    var faded = opacity(parent);
    if (faded < 1) fg = {r: fg.r, g: fg.g, b: fg.b, a: fg.a * faded};
    combos(backgrounds(parent)).forEach(function (c) {
      var value = ratio(fg.a < 1 ? over(fg, c) : fg, c);
      if (value < worst) { worst = value; bg = c; }
    });
    if (worst < need) {
      var key = s.color + '|' + Math.round(worst * 100);
      if (!seen[key]) {
        seen[key] = 1;
        out.contrast.push(worst.toFixed(2) + ':1 (needs ' + need + ') on ' + name(parent));
      }
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('a[href], button:not([hidden]), summary')).forEach(function (el) {
    var label = (el.getAttribute('aria-label') || el.textContent || '').trim();
    if (!label && !el.querySelector('img[alt]:not([alt=""])')) out.unnamed.push(el.outerHTML.slice(0, 80));
  });

  // How much of the screen stays covered by pinned things, and what Quick exit covers at the page's end.
  var bar = document.querySelector('.crisis-bar');
  var exit = document.querySelector('.quick-exit');
  var covered = 0;
  if (bar && getComputedStyle(bar).position === 'sticky') covered = bar.getBoundingClientRect().height;
  out.pinned = Math.round(100 * covered / innerHeight);
  // The same share to a hundredth of a percent, for the limit of a quarter of the screen.
  out.pinnedShare = Math.round(10000 * covered / innerHeight) / 100;
  // Whether the compact one-row strip is in use: only it hides the words before Call 911, "In
  // immediate danger," or "Si hay peligro inmediato,".
  var lead = document.querySelector('.crisis-bar .strip-911 .strip-lead');
  out.compact = !!lead && getComputedStyle(lead).display === 'none';
  // Whether Quick exit floats in the corner, rather than riding inside the strip.
  out.exitFixed = !!exit && getComputedStyle(exit).position === 'fixed';
  // How many rows the strip's links and Quick exit take, counting Quick exit only when it is inside the strip.
  var rows = [];
  if (bar) Array.prototype.forEach.call(bar.querySelectorAll('a[href="tel:988"], a[href="sms:988"], a[href="tel:911"], .quick-exit'), function (el) {
    if (!shown(el) || getComputedStyle(el).position === 'fixed') return;
    var r = el.getBoundingClientRect(), middle = r.top + r.height / 2;
    if (!rows.some(function (m) { return Math.abs(m - middle) < 20; })) rows.push(middle);
  });
  out.stripRows = rows.length;
  // The crisis strip's Call 988 is on screen, and can be seen, at the top of the page.
  function inView(el) {
    if (!el || !shown(el) || unseen(el)) return false;
    var r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1;
  }
  var call = document.querySelector('.crisis-bar a[href="tel:988"]');
  out.stripTop = inView(call);
  // Every link in the strip, Quick exit included, can be seen at the top of the page.
  [['Call 988', '.crisis-bar a[href="tel:988"]'], ['Text 988', '.crisis-bar a[href="sms:988"]'],
   ['Call 911', '.crisis-bar a[href="tel:911"]'], ['Quick exit', '.quick-exit']].forEach(function (item) {
    var why = unseen(document.querySelector(item[1]));
    if (why) out.stripHidden.push(item[0] + ' ' + why);
  });
  // Call and text links anywhere, in any letter case, and the crisis buttons. Those in the strip and the
  // crisis buttons must always be there to see. Others may be hidden on purpose at some sizes.
  var crisisLinks = Array.prototype.slice.call(document.querySelectorAll('a[href^="tel:" i], a[href^="sms:" i], .crisis-actions a, .crisis-bar a'))
    .filter(function (el) {
      if (el.closest('details:not([open])') && !el.closest('summary')) return false;  // folded away, whatever boxes a browser reports
      if (el.closest('.crisis-bar, .crisis-actions')) return true;
      return !hiddenOnPurpose(el) && shown(el);
    });
  // A floating Quick exit must not cover a crisis link on the first screen.
  if (exit && shown(exit) && getComputedStyle(exit).position === 'fixed') {
    var pill = exit.getBoundingClientRect();
    crisisLinks.forEach(function (el) {
      if (el === exit) return;
      Array.prototype.forEach.call(el.getClientRects(), function (r) {
        var w = Math.min(pill.right, r.right) - Math.max(pill.left, r.left);
        var h = Math.min(pill.bottom, r.bottom) - Math.max(pill.top, r.top);
        if (w > 1 && h > 1 && out.exitCoversTop.indexOf(name(el)) < 0) out.exitCoversTop.push(name(el));
      });
    });
  }
  // Every crisis link can receive a tap: nothing lies on top of it, at its middle or near either end.
  // It can be seen there too: drawn, opaque enough, and not covered. Nothing is clicked. The page is
  // only asked what is at each point.
  crisisLinks.forEach(function (el) {
    // Twice: WebKit with a desktop scrollbar can leave the first scroll after loading short, near a
    // width where the layout changes, which would leave a crisis button under the pinned strip.
    el.scrollIntoView({block: 'center', behavior: 'instant'});
    el.scrollIntoView({block: 'center', behavior: 'instant'});
    var dead = hitTest(el, false) || unseen(el);
    if (dead) out.deadCrisis.push(name(el) + ' ' + dead);
  });
  window.scrollTo({top: de.scrollHeight, behavior: 'instant'});
  // Scrolled to the end: the pinned strip, or on a wide screen the header's button, is still on screen.
  out.stripBottom = inView(call);
  out.headerBottom = inView(document.querySelector('.site-header .header-cta'));
  // Inside the pinned strip, content scrolls under the strip by design. This is for the floating button.
  if (exit && shown(exit) && getComputedStyle(exit).position === 'fixed') {
    var er = exit.getBoundingClientRect();
    Array.prototype.slice.call(document.querySelectorAll('main *, footer *')).forEach(function (el) {
      if (el.closest('svg') || hiddenOnPurpose(el) || !shown(el)) return;
      var hasOwnText = Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
      if (!hasOwnText && !el.matches('a, button, summary')) return;
      var range = document.createRange();
      range.selectNodeContents(el);
      Array.prototype.forEach.call(range.getClientRects(), function (r) {
        var w = Math.min(er.right, r.right) - Math.max(er.left, r.left);
        var h = Math.min(er.bottom, r.bottom) - Math.max(er.top, r.top);
        if (w > 1 && h > 1 && out.exitCovers.indexOf(name(el)) < 0) out.exitCovers.push(name(el));
      });
    });
  }
  window.scrollTo({top: 0, behavior: 'instant'});
  return out;
})()
"""

AUDIT_JS = AUDIT_JS.replace("__SHOWN_OPACITY__", str(SHOWN_OPACITY))

OPEN_ALL = "document.querySelectorAll('details').forEach(function (d) { d.open = true; });"


class Report:
    def __init__(self):
        self.failures = {}
        self.notes = {}
        self.passed = {}

    def fail(self, group, page, message, where=""):
        self.failures.setdefault((group, page, message), []).append(where)

    def note(self, group, page, message, where=""):
        self.notes.setdefault((group, page, message), []).append(where)

    def ok(self, group, count=1):
        self.passed[group] = self.passed.get(group, 0) + count

    def print_summary(self):
        for kind, items in (("NOTE", self.notes), ("FAIL", self.failures)):
            for (group, page, message), wheres in sorted(items.items()):
                places = sorted(set(w for w in wheres if w))
                suffix = ""
                if places:
                    suffix = " [" + ", ".join(places[:4]) + (f", and {len(places) - 4} more" if len(places) > 4 else "") + "]"
                print(f"{kind} {group}: {page}: {message}{suffix}")
        print()
        for group in GROUPS:
            if group in self.passed or any(k[0] == group for k in self.failures):
                bad = sum(1 for k in self.failures if k[0] == group)
                print(f"  {group:14} {self.passed.get(group, 0):6} checks passed, {bad} distinct failures")
        return len(self.failures)

    def to_json(self):
        def rows(items):
            return [{"group": g, "page": p, "message": m, "where": sorted(set(w))} for (g, p, m), w in sorted(items.items())]
        return {"passed": self.passed, "failures": rows(self.failures), "notes": rows(self.notes)}


class Site:
    """A local server for the project, or for a temporary copy of it. It caches like GitHub Pages."""

    def __init__(self, root=ROOT, port=0, cache_control=PAGES_CACHE):
        self.root = pathlib.Path(root)
        self.port = port
        self.cache_control = cache_control
        self.server = None
        self.start()

    def start(self):
        self.server = make_server("127.0.0.1", self.port, self.root, self.cache_control)
        self.port = self.server.server_address[1]
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def stop(self):
        self.server.close_everything()

    @property
    def base(self):
        return f"http://127.0.0.1:{self.port}{BASE}"

    def url(self, page):
        if page == "404.html":
            return self.base + "no-such-page/at-all"
        return self.base + (page[: -len("index.html")] if page.endswith("index.html") else page)


class BadHost:
    """Takes over the site's address when the real server is stopped: it answers every
    request with a server error, or accepts the connection and never answers, like a
    very weak signal. A local stand-in, not a real cell network."""

    def __init__(self, port, stall):
        release = threading.Event()

        class Handler(http.server.BaseHTTPRequestHandler):
            protocol_version = "HTTP/1.1"

            def log_message(self, format, *args):
                pass

            def do_GET(self):
                if stall:
                    release.wait(300)
                    self.close_connection = True
                    return
                body = b"<!doctype html><title>Stand-in host error</title><p>Host error"
                self.send_response(503)
                self.send_header("Content-Type", "text/html")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(body)

        self.release = release
        self.server = Server(("127.0.0.1", port), Handler)
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def stop(self):
        self.release.set()
        self.server.close_everything()


def new_tab(browser, *args, allow=(), **kwargs):
    """A tab whose pages can't follow a link away from the local test site, except to the addresses
    in allow, which the test answers itself with a stand-in page."""
    tab = Tab(browser, *args, **kwargs)
    tab.allowed = tuple(allow)
    tab.send("Page.addScriptToEvaluateOnNewDocument", {"source": SAFE_CLICKS % json.dumps(list(tab.allowed))})
    return tab


def guard_click(tab, selector):
    """A real click at the middle of an element, as Tab.click does, after checking what lies there.
    Refuses a call, text or other app link, a link away from the local test site that this tab wasn't
    told to expect, and a click that would land on something else. The page's guard stops such clicks
    too, and the browser can't reach other sites at all. Returns False if the element isn't on screen."""
    info = tab.js(f"""(function () {{
        var el = document.querySelector({json.dumps(selector)});
        if (!el) return null;
        el.scrollIntoView({{block: 'center', behavior: 'instant'}});
        var r = el.getBoundingClientRect();
        var x = r.left + r.width / 2, y = r.top + r.height / 2;
        var hit = r.width && r.height ? document.elementFromPoint(x, y) : null;
        var link = hit && hit.closest('a[href], area[href]');
        return {{x: x, y: y, w: r.width, h: r.height, onTarget: !!hit && (hit === el || el.contains(hit)),
                 hit: hit ? hit.tagName.toLowerCase() + (hit.className ? '.' + String(hit.className).split(' ')[0] : '') : '',
                 href: link ? String(link.href) : '', local: !!link && new URL(link.href, location.href).origin === location.origin}};
    }})()""")
    if not info or not info["w"] or not info["h"]:
        return False
    if not info["onTarget"]:
        raise RuntimeError(f"refusing to click {selector}: {info['hit']} lies on top of it")
    href = info["href"]
    if href and (scheme_of(href) not in ("http", "https") or not (info["local"] or href.startswith(tab.allowed))):
        raise RuntimeError(f"refusing to click a link the tests must not follow: {href}")
    tab.click_at(info["x"], info["y"])
    return True


def page_problems(tab, page, site):
    """Console and network trouble, except the 404 status the 404 page is supposed to have."""
    found = tab.problems()
    if page == "404.html":
        found = [p for p in found if "status of 404" not in p]
    outside = [u for u in tab.requested_urls() if not u.startswith((site.base, "data:"))]
    return found + [f"contacted another site: {u}" for u in outside]


def report_after_use(tab, group, page, site, report, where=""):
    """After tapping or typing on a page, and before leaving it: script errors since it loaded, and any
    test click that landed on a call or text link, or a link to another site, which the page's guard stopped."""
    for problem in page_problems(tab, page, site):
        report.fail(group, page, problem, where)
    blocked = tab.js("window.__blockedClick || ''")
    if blocked:
        report.fail(group, page, f"a test click landed on a link the tests must not follow, and was stopped: {blocked}", where)


# ---------------------------------------------------------------- links, files, paths


class LinkParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.urls = []
        self.ids = set()
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        for key in ("href", "src"):
            if attrs.get(key):
                self.urls.append(attrs[key])
        for key in ("srcset", "imagesrcset"):
            for candidate in (attrs.get(key) or "").split(","):
                if candidate.strip():
                    self.urls.append(candidate.split()[0])
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])


def fetch(url):
    try:
        with urllib.request.urlopen(url, timeout=20) as response:
            return response.status, response.read(), response.headers.get("Content-Type", ""), response.geturl()
    except urllib.error.HTTPError as error:
        return error.code, error.read(), error.headers.get("Content-Type", ""), url


def test_links(site, pages, report):
    parsed = {}
    urls = {}
    for page in pages:
        status, body, kind, _ = fetch(site.url(page))
        if status != (404 if page == "404.html" else 200):
            report.fail("links", page, f"page answered {status}")
        if "text/html" not in kind:
            report.fail("links", page, f"page has content type {kind}")
        parser = LinkParser()
        parser.feed(body.decode("utf-8"))
        parsed[page] = parser
        urls[page] = site.url(page)
    checked = {}
    for page, parser in parsed.items():
        for url in parser.urls:
            split = urllib.parse.urlsplit(url)
            if split.scheme in ("http", "https", "tel", "sms", "mailto"):
                continue
            if url.startswith("#"):
                if url[1:] and url[1:] not in parser.ids:
                    report.fail("links", page, f"{url} points to a missing section")
                else:
                    report.ok("links")
                continue
            target = urllib.parse.urljoin(urls[page], url)
            bare, fragment = urllib.parse.urldefrag(target)
            if bare not in checked:
                checked[bare] = fetch(bare)
            status, body, kind, final = checked[bare]
            if status != 200:
                report.fail("links", page, f"{url} answered {status}")
                continue
            report.ok("links")
            if fragment:
                inner = LinkParser()
                if "text/html" in kind:
                    inner.feed(body.decode("utf-8"))
                if fragment not in inner.ids:
                    report.fail("links", page, f"{url} points to a missing section")
            if bare.endswith((".html", "/")) and "text/html" not in kind:
                report.fail("links", page, f"{url} has content type {kind}")
    # The address the real site will use, with and without its trailing slash.
    for page in pages:
        if page.endswith("/index.html"):
            status, _, _, final = fetch(site.url(page).rstrip("/"))
            if status != 200 or not final.endswith("/"):
                report.fail("links", page, "address without a trailing slash does not lead to the page")
            else:
                report.ok("links")
    # Nothing but the website is served.
    for private in ("notes/STATUS.md", "CLAUDE.md", "tools/check_site.py", ".github/workflows/site.yml", "README.md", "design/homepage.svg"):
        status, _, _, _ = fetch(site.base + private)
        if status != 404:
            report.fail("links", private, f"would be published (answered {status})")
        else:
            report.ok("links")
    worker = fetch(site.base + "sw.js")
    if "javascript" not in worker[2]:
        report.fail("links", "sw.js", f"content type {worker[2]}")
    manifest = json.loads(fetch(site.base + "manifest.webmanifest")[1])
    if not manifest["start_url"].startswith(".") or not manifest["scope"].startswith("."):
        report.fail("links", "manifest.webmanifest", "start_url and scope must be relative for the /suicideprevention/ path")


# ---------------------------------------------------------------- layout, contrast, naming


def apply_audit(result, group, page, where, report, phone, one_row=False, targets=True):
    """Reports the audit's findings. targets=False leaves out the general tap target sizes, but never
    the crisis strip's own."""
    if result["hscroll"]:
        report.fail(group, page, f"scrolls sideways ({result['hscroll'][0]} > {result['hscroll'][1]})", where)
    for key, label in (("offscreen", "runs off the screen"), ("clipped", "text cut off"), ("overlaps", "controls overlap"),
                       ("brokenImages", "image did not load"), ("contrast", "low contrast"), ("unnamed", "control has no name"),
                       ("colorOnlyLinks", "link in a sentence has no underline")):
        for item in result[key]:
            report.fail(group, page, f"{label}: {item}", where)
    for item in result["stripTargets"]:
        report.fail(group, page, f"crisis strip tap target under 44px: {item}", where)
    for item in result["tinyTargets"] if targets else []:
        report.fail(group, page, f"tap target under 24px: {item}", where)
    if phone and targets:
        for item in result["smallTargets"]:
            report.note(group, page, f"tap target under the project's 44px aim: {item}", where)
    for item in result["exitCovers"]:
        report.fail(group, page, f"Quick exit covers something at the page's end: {item}", where)
    for item in result["exitCoversTop"]:
        report.fail(group, page, f"Quick exit covers a crisis link at the top of the page: {item}", where)
    for item in result["deadCrisis"]:
        report.fail(group, page, f"a crisis link can't be tapped (SAFETY rule 2): {item}", where)
    for problem in strip_problems(result, one_row):
        report.fail(group, page, problem, where)
    if result["pinned"] and result["pinned"] > 30:
        report.note(group, page, f"the pinned crisis strip covers {result['pinned']}% of the screen", where)
    report.ok(group)


def strip_problems(result, one_row=False):
    """Rules for the crisis strip and Quick exit at every size and text size. Wherever the compact strip
    is pinned, and with one_row wherever any strip is pinned, it is one row taking ONE_ROW_MAX_PERCENT of
    the screen's height or less. Quick exit rides inside a pinned strip, and floats in the corner where
    the strip scrolls away. tools/test_webkit.py uses this too."""
    problems = []
    pinned, compact = result.get("pinned"), result.get("compact")
    if pinned and (compact or one_row):
        rows, share = result.get("stripRows"), result.get("pinnedShare", 0)
        if rows != 1 or share > ONE_ROW_MAX_PERCENT:
            problems.append(f"the pinned {'compact ' if compact else ''}crisis strip takes {rows} row{'' if rows == 1 else 's'} and "
                            f"{share:g}% of the screen's height, where it must be one row of {ONE_ROW_MAX_PERCENT}% or less")
    if not pinned and not result.get("exitFixed"):
        problems.append("Quick exit scrolls away with the crisis strip, where it must float in the corner")
    if pinned and result.get("exitFixed"):
        problems.append("Quick exit floats over the page, where it must be inside the pinned crisis strip")
    return problems


def test_matrix(browser, site, pages, report, screens=None):
    tab = new_tab(browser)
    for label, width, height, phone in VIEWPORTS:
        tab.resize(width, height, phone)
        for dark in (False, True):
            tab.media(dark=dark)
            where = f"{label}, {'dark' if dark else 'light'}"
            for page in pages:
                # The first time each page loads, wait longer, so an error a moment after loading shows.
                first = (label, dark) == (VIEWPORTS[0][0], False)
                status = tab.goto(site.url(page), settle=0.6 if first else 0.05)
                if status != (404 if page == "404.html" else 200):
                    report.fail("matrix", page, f"page answered {status}", where)
                for problem in page_problems(tab, page, site):
                    report.fail("matrix", page, problem, where)
                # Closed sections first, then everything open.
                closed_scroll = tab.js("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
                if closed_scroll:
                    report.fail("matrix", page, "scrolls sideways with sections closed", where)
                tab.js(OPEN_ALL)
                result = tab.js(AUDIT_JS)
                if label in MUST_PIN and not result["pinned"]:
                    report.fail("matrix", page, "the crisis strip is not pinned", where)
                # SAFETY rule 1: crisis help is always one tap away, at every size and in both color schemes.
                if not result["stripTop"]:
                    report.fail("matrix", page, "the crisis strip's Call 988 is not on screen at the top of the page", where)
                if label in MUST_PIN and not result["stripBottom"]:
                    report.fail("matrix", page, "the crisis strip's Call 988 scrolls off the screen", where)
                if label in MUST_NOT_PIN and result["pinned"]:
                    report.fail("matrix", page, f"the crisis strip is pinned, covering {result['pinnedShare']:g}% of the screen's height, "
                                "where it must scroll away", where)
                if label in COMPACT and not result["compact"]:
                    report.fail("matrix", page, "the compact crisis strip is not in use, or the audit can't tell, so its limits go unchecked", where)
                for item in result["stripHidden"]:
                    report.fail("matrix", page, f"at the top of the page, the crisis strip's {item} (SAFETY rule 1)", where)
                if width >= 960 and not result["headerBottom"]:
                    report.fail("matrix", page, "the header's Get Support Now button scrolls off the screen", where)
                apply_audit(result, "matrix", page, where, report, phone, one_row=label in ONE_ROW)
    tab.close()


def test_textsize(browser, site, pages, report):
    """Changes the browser's default font size, as a person's text size setting does."""
    tab = new_tab(browser)
    for label, width, height, phone, percents in TEXT_SIZES:
        tab.resize(width, height, phone)
        for percent in percents:
            tab.send("Page.setFontSizes", {"fontSizes": {"standard": 16 * percent // 100, "fixed": 13 * percent // 100}})
            where = f"{label}, text at {percent}%"
            for page in pages:
                tab.goto(site.url(page))
                tab.js(OPEN_ALL)
                tab.browser.pump(0.02)
                result = tab.js(AUDIT_JS)
                # Wherever a phone on its side pins the strip, in either language, it is one short row,
                # and so is the compact strip wherever it pins. Smaller text makes links sized by their
                # words smaller, by the reader's own choice, such as Home's "Call" at 21px wide at 75%,
                # so there only the crisis strip's tap targets are measured.
                apply_audit(result, "textsize", page, where, report, False, one_row=label in ONE_ROW, targets=percent >= 100)
                if ("es" if page.startswith("es/") else "en") in MUST_PIN_TEXT.get((label, percent), ()):
                    if not result["pinned"]:
                        report.fail("textsize", page, "the crisis strip is not pinned", where)
                    elif not result["stripBottom"]:
                        report.fail("textsize", page, "the crisis strip's Call 988 scrolls off the screen", where)
    tab.send("Page.setFontSizes", {"fontSizes": {"standard": 16, "fixed": 13}})
    tab.close()


# ---------------------------------------------------------------- keyboard and focus

FOCUS_JS = r"""
(function () {
  var el = document.activeElement;
  if (!el || el === document.body) return {none: true};
  var s = getComputedStyle(el);
  var after = getComputedStyle(el, '::after');
  var ring = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2) ||
             (after.outlineStyle !== 'none' && parseFloat(after.outlineWidth) >= 2) || s.boxShadow !== 'none' && s.boxShadow.indexOf('0px 0px 0px') >= 0;
  var r = el.getClientRects()[0] || el.getBoundingClientRect();
  var x = r.left + r.width / 2, y = r.top + r.height / 2;
  var hit = document.elementFromPoint(Math.min(x, innerWidth - 1), Math.min(Math.max(y, 0), innerHeight - 1));
  var covered = !hit || !(hit === el || el.contains(hit) || hit.contains(el) || hit.closest('.card') === el.closest('.card') && el.closest('.card'));
  return {
    tag: el.tagName.toLowerCase(),
    cls: String(el.className || ''),
    text: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
    href: el.getAttribute('href') || '',
    ring: ring,
    inView: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
    covered: covered,
    coveredBy: hit ? (hit.tagName.toLowerCase() + (hit.className ? '.' + String(hit.className).split(' ')[0] : '')) : '',
    top: Math.round(r.top),
    bottom: Math.round(r.bottom)
  };
})()
"""


def test_keyboard(browser, site, pages, report):
    tab = new_tab(browser)
    for label, width, height, phone in (("phone 390x844", 390, 844, True), ("desktop 1440x900", 1440, 900, False)):
        tab.resize(width, height, phone)
        tab.media(reduced=True)
        for page in pages:
            tab.goto(site.url(page))
            tab.js(OPEN_ALL)
            count = tab.js("""Array.prototype.filter.call(document.querySelectorAll('a[href], button:not([hidden]), summary'),
                function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 || el.classList.contains('skip-link'); }).length""")
            seen = []
            for step in range(count + 2):
                tab.tab_key()
                state = tab.js(FOCUS_JS)
                if state.get("none"):
                    continue
                seen.append(state)
                where = label
                what = f"{state['tag']} \"{state['text']}\""
                if not state["ring"]:
                    report.fail("keyboard", page, f"no visible focus ring on {what}", where)
                if not state["inView"]:
                    report.fail("keyboard", page, f"focused item is off screen: {what} ({state['top']} to {state['bottom']})", where)
                elif state["covered"]:
                    report.fail("keyboard", page, f"focused item is covered by {state['coveredBy']}: {what}", where)
                report.ok("keyboard")
            if not seen or "skip-link" not in seen[0]["cls"]:
                report.fail("keyboard", page, "the first Tab does not land on the skip link", label)
            elif len(seen) > 1 and "quick-exit" not in seen[1]["cls"]:
                report.note("keyboard", page, "Quick exit is not the second Tab stop", label)
            report_after_use(tab, "keyboard", page, site, report, label)
            # The skip link moves focus to the main content. Enter is pressed only on the skip link, so it
            # can't follow whatever else might have the focus.
            tab.goto(site.url(page))
            tab.tab_key()
            if "skip-link" not in (tab.js(FOCUS_JS).get("cls") or ""):
                report.fail("keyboard", page, "the first Tab does not land on the skip link, so Enter was not pressed", label)
                continue
            tab.press("Enter", "Enter", 13)
            tab.browser.pump(0.05)
            if tab.js("document.activeElement && document.activeElement.id") != "main":
                report.fail("keyboard", page, "the skip link does not move focus to the main content", label)
            else:
                report.ok("keyboard")
            # Shift+Tab goes backward.
            tab.goto(site.url(page))
            tab.tab_key()
            tab.tab_key()
            tab.tab_key(shift=True)
            if "skip-link" not in (tab.js(FOCUS_JS).get("cls") or ""):
                report.fail("keyboard", page, "Shift+Tab does not go back", label)
            else:
                report.ok("keyboard")
    tab.close()


def test_menu(browser, site, pages, report):
    tab = new_tab(browser, 390, 844, True)
    state = """(function () {
        var b = document.querySelector('.menu-button'), n = document.getElementById('site-nav');
        return {expanded: b.getAttribute('aria-expanded'), shown: getComputedStyle(n).display !== 'none',
                links: Array.prototype.filter.call(n.querySelectorAll('a'), function (a) {
                    var r = a.getBoundingClientRect(); return r.height > 0; }).length,
                focusOnButton: document.activeElement === b};
    })()"""
    for page in pages:
        tab.goto(site.url(page))
        start = tab.js(state)
        if start["expanded"] != "false" or start["shown"]:
            report.fail("menu", page, "the phone menu does not start closed")
        if not guard_click(tab, ".menu-button"):
            report.fail("menu", page, "the menu button is not on screen")
            continue
        opened = tab.js(state)
        if opened["expanded"] != "true" or not opened["shown"] or opened["links"] < 5:
            report.fail("menu", page, f"the menu did not open: {opened}")
        tab.press("Escape", "Escape", 27)
        closed = tab.js(state)
        if closed["expanded"] != "false" or closed["shown"] or not closed["focusOnButton"]:
            report.fail("menu", page, f"Escape did not close the menu and return focus: {closed}")
        guard_click(tab, ".menu-button")
        tab.click_at(5, 800)  # outside the menu
        tab.browser.pump(0.02)
        if tab.js(state)["expanded"] != "false":
            report.fail("menu", page, "tapping outside did not close the menu")
        report_after_use(tab, "menu", page, site, report)
        report.ok("menu")
    # Following a link leads to the page and leaves the menu closed there.
    home = site.url("index.html")
    tab.goto(home)
    guard_click(tab, ".menu-button")
    guard_click(tab, "#site-nav a[href='get-help/']")
    tab.browser.wait_for("Page.loadEventFired", tab.session, 15)
    if not tab.js("location.pathname").endswith("/get-help/") or tab.js(state)["shown"]:
        report.fail("menu", "index.html", "following a menu link did not lead to the page with the menu closed")
    else:
        report.ok("menu")
    # On a short screen, the menu scrolls, so its last link can still be reached.
    tab.resize(844, 390, True)
    tab.goto(home)
    guard_click(tab, ".menu-button")
    reach = tab.js("""(function () {
        var links = document.querySelectorAll('#site-nav a');
        var last = links[links.length - 1];
        last.scrollIntoView({block: 'end', behavior: 'instant'});
        var r = last.getBoundingClientRect();
        return {bottom: r.bottom, vh: innerHeight, top: r.top, count: links.length};
    })()""")
    if reach["bottom"] > reach["vh"] + 1 or reach["top"] < 0:
        report.fail("menu", "index.html", f"the last menu link can't be reached in landscape: {reach}")
    else:
        report.ok("menu")
    tab.resize(390, 844, True)
    # Rotating to the desktop width resets the menu.
    tab.goto(home)
    guard_click(tab, ".menu-button")
    tab.resize(1280, 800, False)
    tab.browser.pump(0.05)
    if tab.js("document.querySelector('.menu-button').getAttribute('aria-expanded')") != "false":
        report.fail("menu", "index.html", "the menu stays open after the layout changes to desktop")
    else:
        report.ok("menu")
    tab.close()


def test_jumps(browser, site, pages, report):
    """Every jump link lands on visible text, not behind the pinned strip."""
    tab = new_tab(browser)
    tab.media(reduced=True)
    for label, width, height, phone in (("phone 390x844", 390, 844, True), ("narrow phone 300x568", 300, 568, True), ("phone landscape 844x390", 844, 390, True), ("desktop 1440x900", 1440, 900, False)):
        tab.resize(width, height, phone)
        for page in pages:
            tab.goto(site.url(page))
            hashes = tab.js("""Array.from(new Set(Array.prototype.map.call(document.querySelectorAll('a[href^="#"]'),
                function (a) { return a.getAttribute('href'); }))).filter(function (h) { return h.length > 1; })""")
            for fragment in hashes:
                result = tab.js(f"""(function () {{
                    var target = document.getElementById({json.dumps(fragment[1:])});
                    if (!target) return {{missing: true}};
                    location.hash = {json.dumps(fragment)};
                    return new Promise(function (done) {{ requestAnimationFrame(function () {{ requestAnimationFrame(function () {{
                        var r = target.getBoundingClientRect();
                        var bar = document.querySelector('.crisis-bar');
                        var pinned = 0;
                        if (getComputedStyle(bar).position === 'sticky') pinned = bar.getBoundingClientRect().bottom;
                        var head = document.querySelector('.site-header');
                        if (getComputedStyle(head).position === 'sticky') pinned = Math.max(pinned, head.getBoundingClientRect().bottom);
                        done({{top: Math.round(r.top), height: Math.round(r.height), pinned: Math.round(pinned), vh: innerHeight, atEnd: innerHeight + scrollY >= document.documentElement.scrollHeight - 2}});
                    }}); }}); }});
                }})()""")
                if result.get("missing"):
                    report.fail("jumps", page, f"{fragment} has no target", label)
                elif result["height"] < 1:
                    report.fail("jumps", page, f"{fragment} lands on something hidden", label)
                elif result["top"] < result["pinned"] - 1:
                    report.fail("jumps", page, f"{fragment} lands behind the pinned area (top {result['top']}, pinned to {result['pinned']})", label)
                elif result["top"] > result["vh"] and not result["atEnd"]:
                    report.fail("jumps", page, f"{fragment} leaves its target below the screen", label)
                else:
                    report.ok("jumps")
            report_after_use(tab, "jumps", page, site, report, label)
    # A garbled address must not stop the page's script, which also sets up offline support.
    tab.resize(390, 844, True)
    tab.goto(site.url("get-help/index.html") + "#%E0%A4%A")
    found = [p for p in tab.problems() if "URI" in p or "script" in p.lower()]
    if found:
        report.fail("jumps", "get-help/index.html", f"a garbled address causes a script error: {found[:2]}")
    else:
        report.ok("jumps")
    tab.close()


def test_folds(browser, site, pages, report):
    tab = new_tab(browser, 390, 844, True)
    tab.media(reduced=True)
    for page in pages:
        tab.goto(site.url(page))
        folds = tab.js("document.querySelectorAll('details').length")
        if not folds:
            continue
        open_at_start = tab.js("document.querySelectorAll('details[open]').length")
        if open_at_start:
            report.fail("folds", page, f"{open_at_start} folded sections start open")
        # A real click opens and closes each fold's summary.
        for index in range(folds):
            box = tab.js(f"""(function () {{
                var s = document.querySelectorAll('details > summary')[{index}];
                // On the Daily check-in, a fold may sit in a section whose tab isn't open. A visitor
                // opens that tab first, so the test does too.
                var panel = s.closest('.ci-panel.ci-off');
                var opener = panel && document.querySelector('.ci-tabs a[href="#' + panel.id + '"]');
                if (opener) opener.click();
                s.scrollIntoView({{block: 'center', behavior: 'instant'}});
                var r = s.getBoundingClientRect();
                return {{x: r.left + Math.min(r.width / 2, 40), y: r.top + r.height / 2, h: r.height}};
            }})()""")
            if box["h"] < 44:
                report.fail("folds", page, f"fold {index + 1} is under 44px tall to tap ({box['h']})")
            tab.click_at(box["x"], box["y"])
            tab.browser.pump(0.01)
            if not tab.js(f"document.querySelectorAll('details')[{index}].open"):
                report.fail("folds", page, f"fold {index + 1} did not open when tapped")
            tab.click_at(box["x"], box["y"])
            tab.browser.pump(0.01)
            if tab.js(f"document.querySelectorAll('details')[{index}].open"):
                report.fail("folds", page, f"fold {index + 1} did not close when tapped again")
            report.ok("folds")
        report_after_use(tab, "folds", page, site, report)
        # Links to something inside a fold, from a page's contents list and from a direct address.
        targets = tab.js("""Array.prototype.filter.call(document.querySelectorAll('details [id], section[id]'), function (el) {
                return el.closest('details') || el.querySelector(':scope > details.more');
            }).map(function (el) { return el.id; })""")
        for target in targets:
            # A blank page first, so this is a fresh load of the address, as from a link on another
            # page, not only a change of the #part.
            tab.goto("about:blank")
            tab.goto(site.url(page) + "#" + target)
            opened = tab.js(f"""(function () {{
                var t = document.getElementById({json.dumps(target)});
                var outer = t.closest('details');
                var own = t.querySelector(':scope > details.more');
                return {{outer: !outer || outer.open, own: !own || own.open, h: t.getBoundingClientRect().height}};
            }})()""")
            if not opened["outer"] or not opened["own"] or opened["h"] < 1:
                report.fail("folds", page, f"opening #{target} directly leaves it folded: {opened}")
            else:
                report.ok("folds")
            report_after_use(tab, "folds", page, site, report)
        # And from a link within the page, which changes only the #part.
        if targets:
            tab.goto(site.url(page))
            target = targets[0]
            opened = tab.js(f"""new Promise(function (done) {{
                location.hash = {json.dumps('#' + target)};
                requestAnimationFrame(function () {{
                    var t = document.getElementById({json.dumps(target)});
                    var outer = t.closest('details'), own = t.querySelector(':scope > details.more');
                    done({{outer: !outer || outer.open, own: !own || own.open}});
                }});
            }})""")
            if not opened["outer"] or not opened["own"]:
                report.fail("folds", page, f"a link within the page to #{target} leaves it folded: {opened}")
            else:
                report.ok("folds")
    tab.close()


def test_language(browser, site, pages, report):
    tab = new_tab(browser, 390, 844, True)
    pairs = {}
    for page in pages:
        tab.goto(site.url(page))
        info = tab.js("""(function () {
            var a = document.querySelector('.lang-switch a');
            return {lang: document.documentElement.lang, href: a && a.href, hreflang: a && a.getAttribute('hreflang'),
                    linkLang: a && a.getAttribute('lang'), text: a && a.textContent.trim()};
        })()""")
        if not info["href"]:
            report.fail("language", page, "no language switch")
            continue
        want = "es" if page.startswith("es/") else "en"
        if info["lang"] != want:
            report.fail("language", page, f"html lang is {info['lang']}")
        other = "en" if want == "es" else "es"
        if info["hreflang"] != other or info["linkLang"] != other:
            report.fail("language", page, f"switch should be marked {other}: {info}")
        guard_click(tab, ".lang-switch a")
        tab.browser.wait_for("Page.loadEventFired", tab.session, 15)
        landed = tab.js("""({lang: document.documentElement.lang, back: (document.querySelector('.lang-switch a') || {}).href || '', url: location.href})""")
        if landed["lang"] != other:
            report.fail("language", page, f"the switch led to a page in {landed['lang']}: {landed['url']}")
        pairs[page] = (site.url(page), landed["url"], landed["back"])
        if page != "404.html" and landed["back"].rstrip("/") != site.url(page).rstrip("/"):
            report.fail("language", page, f"the other language's switch does not lead back: {landed['back']}")
        else:
            report.ok("language")
    tab.close()


# ---------------------------------------------------------------- quick exit


def follow_quick_exit(tab):
    """Clicks Quick exit and answers the request for weather.gov with a stand-in page."""
    if not guard_click(tab, ".quick-exit"):
        raise RuntimeError("Quick exit is not on screen")
    event = tab.browser.wait_for("Fetch.requestPaused", tab.session, 15)
    url = event["params"]["request"]["url"]
    tab.send("Fetch.fulfillRequest", {
        "requestId": event["params"]["requestId"],
        "responseCode": 200,
        "responseHeaders": [{"name": "Content-Type", "value": "text/html"}],
        "body": base64.b64encode(b"<!doctype html><title>Stand-in for weather.gov</title>").decode(),
    })
    tab.browser.wait_for("Page.loadEventFired", tab.session, 15)
    return url


def history_entries(tab):
    history = tab.send("Page.getNavigationHistory")
    return history["currentIndex"], [entry["url"] for entry in history["entries"]]


# Quick exit leads here. The tests answer it with a stand-in page, so weather.gov is never contacted.
WEATHER = "https://www.weather.gov/"


def test_quickexit(browser, site, pages, report):
    home, help_page = site.url("index.html"), site.url("get-help/index.html")
    pattern = {"patterns": [{"urlPattern": "https://www.weather.gov/*"}]}

    # On every page, Quick exit is on screen, first after the skip link, and replaces the page. At 640x290
    # it is inside the compact strip.
    for label, width, height, phone in (("phone 390x844", 390, 844, True), ("phone landscape 844x390", 844, 390, True),
                                        ("phone landscape 640x290", 640, 290, True), ("desktop 1440x900", 1440, 900, False)):
        for page in pages:
            tab = new_tab(browser, width, height, phone, allow=[WEATHER])
            tab.send("Fetch.enable", pattern)
            tab.goto(site.url(page))
            box = tab.js("""(function () {
                var e = document.querySelector('.quick-exit');
                var bar = document.querySelector('.crisis-bar');
                var pinnedInStrip = getComputedStyle(bar).position === 'sticky';
                var reasons = [];
                var de = document.documentElement;
                [0, de.scrollHeight / 2, de.scrollHeight].forEach(function (top) {
                    window.scrollTo({top: top, behavior: 'instant'});
                    var r = e.getBoundingClientRect();
                    var at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
                    if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth) reasons.push('off screen at ' + Math.round(top));
                    else if (!at || !e.contains(at)) reasons.push('covered at ' + Math.round(top));
                    if (pinnedInStrip) {
                        var b = bar.getBoundingClientRect();
                        if (!bar.contains(e) || getComputedStyle(e).position === 'fixed' || r.top < b.top || r.bottom > b.bottom) reasons.push('not inside the pinned strip');
                    } else if (getComputedStyle(e).position !== 'fixed') {
                        reasons.push('neither pinned in the strip nor fixed to the screen');
                    }
                });
                window.scrollTo({top: 0, behavior: 'instant'});
                // A tap aimed at Call 911 must not land on Quick exit.
                var q = e.getBoundingClientRect();
                var c = bar.querySelector('a[href="tel:911"]').getBoundingClientRect();
                var sameRow = q.top < c.bottom && c.top < q.bottom;
                if (pinnedInStrip && sameRow && q.left - c.right < 8 && c.left - q.right < 8) reasons.push('too close to Call 911');
                return {reasons: Array.from(new Set(reasons)), href: e.href};
            })()""")
            for reason in box["reasons"]:
                report.fail("quickexit", page, f"Quick exit is {reason}", label)
            before = tab.send("Page.getNavigationHistory")
            count_before = len(before["entries"])
            url = follow_quick_exit(tab)
            index, entries = history_entries(tab)
            address = site.url(page)
            if not url.startswith("https://www.weather.gov/"):
                report.fail("quickexit", page, f"Quick exit led to {url}", label)
            if len(entries) != count_before or any(e.startswith(address) for e in entries):
                report.fail("quickexit", page, f"the page stayed in the tab's history: {entries}", label)
            else:
                report.ok("quickexit")
            tab.close()

    # The page goes blank at once, even if the neutral site is slow to answer.
    tab = new_tab(browser, 390, 844, True, allow=[WEATHER])
    tab.send("Fetch.enable", pattern)
    tab.goto(help_page)
    # Chrome holds back questions to a page while it navigates to another site, so the page reports for itself.
    tab.js("""document.addEventListener('click', function () {
        console.info('exit-check:' + getComputedStyle(document.documentElement).display);
        console.info('exit-title:' + document.title);
    })""")
    tab.clear_events()
    guard_click(tab, ".quick-exit")
    event = tab.browser.wait_for("Fetch.requestPaused", tab.session, 15)
    said = [arg.get("value", "") for e in tab.browser.events if e.get("sessionId") == tab.session and e["method"] == "Runtime.consoleAPICalled"
            for arg in e["params"]["args"]]
    if "exit-check:none" not in said:
        report.fail("quickexit", "get-help/index.html", f"the page stays on screen while weather.gov loads: {said}")
    else:
        report.ok("quickexit")
    # The tab strip, tab switcher and history menu would show the page's title until weather.gov arrives.
    if "exit-title:" not in said:
        report.fail("quickexit", "get-help/index.html", f"the tab's title still names the page while weather.gov loads: {said}")
    else:
        report.ok("quickexit")
    tab.send("Fetch.failRequest", {"requestId": event["params"]["requestId"], "errorReason": "Aborted"})
    tab.close()

    # Coming back to a blanked page shows it again only in a Home Screen app. In a browser tab,
    # switching apps while weather.gov loads must not show the page that was left.
    blank_and_return = """(function () {
        document.documentElement.hidden = true;
        document.dispatchEvent(new Event('visibilitychange'));
        return document.documentElement.hidden;
    })()"""
    tab = new_tab(browser, 390, 844, True, allow=[WEATHER])
    tab.goto(help_page)
    if not tab.js(blank_and_return):
        report.fail("quickexit", "get-help/index.html", "switching apps during Quick exit shows the page that was left again")
    else:
        report.ok("quickexit")
    # Chrome's DevTools can't switch on Home Screen mode, so set the flag iPhones use for it.
    tab.js("Object.defineProperty(navigator, 'standalone', {value: true, configurable: true})")
    if tab.js(blank_and_return):
        report.fail("quickexit", "get-help/index.html", "coming back to the page after Quick exit leaves it blank")
    else:
        report.ok("quickexit")
    tab.close()

    # It works from the first moment, before the page's script file has arrived.
    tab = new_tab(browser, 390, 844, True, allow=[WEATHER])
    tab.send("Fetch.enable", {"patterns": pattern["patterns"] + [{"urlPattern": "*/assets/menu.js"}]})
    tab.send("Network.setBypassServiceWorker", {"bypass": True})  # or the worker's request can't be held
    tab.clear_events()
    tab.send("Page.navigate", {"url": help_page})
    held = tab.browser.wait_for("Fetch.requestPaused", tab.session, 15)
    if "menu.js" not in held["params"]["request"]["url"]:
        report.fail("quickexit", "get-help/index.html", f"expected the script file to load first: {held['params']['request']['url']}")
    tab.browser.pump(0.5)
    before = len(tab.send("Page.getNavigationHistory")["entries"])
    guard_click(tab, ".quick-exit")
    event = tab.browser.wait_for("Fetch.requestPaused", tab.session, 15)
    tab.send("Fetch.fulfillRequest", {
        "requestId": event["params"]["requestId"], "responseCode": 200,
        "responseHeaders": [{"name": "Content-Type", "value": "text/html"}],
        "body": base64.b64encode(b"<!doctype html><title>Stand-in</title>").decode(),
    })
    tab.browser.pump(0.5)
    _, entries = history_entries(tab)
    if help_page in entries or len(entries) != before:
        report.fail("quickexit", "get-help/index.html", f"a tap before the script file loads leaves the page in history: {entries}")
    else:
        report.ok("quickexit")
    tab.close()

    # What it can't do, so the site's wording can stay accurate.
    tab = new_tab(browser, 390, 844, True, allow=[WEATHER])
    tab.send("Fetch.enable", pattern)
    tab.goto(help_page)
    guard_click(tab, ".toc a")
    tab.browser.pump(0.3)
    follow_quick_exit(tab)
    _, entries = history_entries(tab)
    print(f"  Quick exit after a link within the page: history is {entries}")
    if help_page not in entries:
        report.fail("quickexit", "get-help/index.html", "expected the page to stay in history after a link within it; the site's wording needs another look")
    else:
        report.note("quickexit", "(limit)", "after a link within a page, Back from weather.gov reaches that page, and the About pages say so")
        report.ok("quickexit")
    tab.close()

    tab = new_tab(browser, 390, 844, True, allow=[WEATHER])
    tab.send("Fetch.enable", pattern)
    tab.goto(home)
    tab.js("location.href = 'get-help/'")
    tab.browser.wait_for("Page.loadEventFired", tab.session, 15)
    follow_quick_exit(tab)
    index, entries = history_entries(tab)
    print(f"  Quick exit after visiting two pages: history is {entries}, at {index}")
    if help_page in entries:
        report.fail("quickexit", "get-help/index.html", "Quick exit left the current page in history")
    if home not in entries:
        report.fail("quickexit", "index.html", "expected the earlier page to stay in history; the site's wording needs another look")
    else:
        report.note("quickexit", "(limit)", "the page before stays in history, so Back from weather.gov reaches the earlier Tidelight page")
        report.ok("quickexit")
    tab.close()

    # Without JavaScript it is a plain link. It still leaves, but the page stays in history.
    tab = new_tab(browser, 390, 844, True, allow=[WEATHER])
    tab.send("Fetch.enable", pattern)
    tab.send("Emulation.setScriptExecutionDisabled", {"value": True})
    tab.goto(help_page)
    tab.send("Emulation.setScriptExecutionDisabled", {"value": False})
    # With scripts off, the page's guard against call and text links can't run, so this click is only
    # made if Quick exit is what lies on top at that point.
    box = tab.js("""(function () { var e = document.querySelector('.quick-exit'), r = e.getBoundingClientRect();
        var x = r.left + r.width / 2, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y);
        return {x: x, y: y, onTop: !!(hit && hit.closest('.quick-exit') === e)}; })()""")
    if not box["onTop"]:
        raise RuntimeError("refusing to click: Quick exit is not on top at its own middle, and a crisis link may be")
    tab.send("Emulation.setScriptExecutionDisabled", {"value": True})
    tab.click_at(box["x"], box["y"])
    event = tab.browser.wait_for("Fetch.requestPaused", tab.session, 15)
    tab.send("Fetch.fulfillRequest", {
        "requestId": event["params"]["requestId"], "responseCode": 200,
        "responseHeaders": [{"name": "Content-Type", "value": "text/html"}],
        "body": base64.b64encode(b"<!doctype html><title>Stand-in</title>").decode(),
    })
    tab.browser.wait_for("Page.loadEventFired", tab.session, 15)
    _, entries = history_entries(tab)
    tab.send("Emulation.setScriptExecutionDisabled", {"value": False})
    if help_page in entries:
        report.note("quickexit", "(limit)", "without JavaScript, Quick exit is a plain link and the page stays in history")
        report.ok("quickexit")
    else:
        report.fail("quickexit", "get-help/index.html", "expected the page to stay in history without JavaScript; the site's wording needs another look")
    tab.close()

    # With no connection, weather.gov can't load. The tab still leaves Tidelight for the browser's error page.
    tab = new_tab(browser, 390, 844, True, allow=[WEATHER])
    tab.send("Fetch.enable", pattern)
    tab.goto(help_page)
    guard_click(tab, ".quick-exit")
    event = tab.browser.wait_for("Fetch.requestPaused", tab.session, 15)
    tab.send("Fetch.failRequest", {"requestId": event["params"]["requestId"], "errorReason": "InternetDisconnected"})
    tab.browser.pump(0.5)
    index, entries = history_entries(tab)
    shown = tab.js("location.href")
    if help_page in entries[index:index + 1] and shown == help_page:
        report.note("quickexit", "(limit)", "with no connection, the Tidelight page stays on screen")
    else:
        report.note("quickexit", "(limit)", f"with no connection, the tab shows the browser's error page ({shown[:40]})")
    print(f"  Quick exit with no connection: history is {entries}, at {index}; the tab shows {shown}")
    report.ok("quickexit")
    tab.close()
    quick_exit_in_frame(browser, site, report)


class Framer:
    """Another site, at another local address, whose page shows a Tidelight page in a frame, as any site
    can, since a policy in a page can't forbid it and GitHub Pages sends no header that does."""

    def __init__(self, inner):
        class Handler(http.server.BaseHTTPRequestHandler):
            protocol_version = "HTTP/1.1"

            def log_message(self, format, *args):
                pass

            def do_GET(self):
                sandbox = ' sandbox="allow-scripts allow-same-origin"' if self.path.startswith("/sandboxed") else ""
                body = (f'<!doctype html><title>Another site</title><h1>Another site</h1>'
                        f'<iframe src="{inner}" width="1000" height="700"{sandbox}></iframe>').encode()
                self.send_response(200)
                self.send_header("Content-Type", "text/html")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

        self.server = Server(("127.0.0.1", 0), Handler)
        self.base = f"http://127.0.0.1:{self.server.server_address[1]}"
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def stop(self):
        self.server.close_everything()


def node_where(tab, wanted):
    """The middle of an element inside any frame, on the screen, and whether it is what lies there.
    Read through DevTools, because the outer page can't read another site's frame."""
    root = tab.send("DOM.getDocument", {"depth": -1, "pierce": True})["root"]
    found = []

    def walk(node, inside):
        attrs = node.get("attributes", [])
        here = inside or (node.get("nodeName") == "A" and wanted in dict(zip(attrs[::2], attrs[1::2])).get("class", "").split())
        if here:
            found.append(node)
        for key in ("children", "contentDocument", "shadowRoots"):
            kids = node.get(key) or []
            for kid in [kids] if isinstance(kids, dict) else kids:
                walk(kid, here)
    walk(root, False)
    if not found:
        return None
    quad = tab.send("DOM.getBoxModel", {"nodeId": found[0]["nodeId"]})["model"]["border"]
    x, y = (quad[0] + quad[4]) / 2, (quad[1] + quad[5]) / 2
    hit = tab.send("DOM.getNodeForLocation", {"x": int(x), "y": int(y), "includeUserAgentShadowDOM": False})
    return x, y, hit.get("backendNodeId") in {node.get("backendNodeId") for node in found}


def quick_exit_in_frame(browser, site, report):
    """If another site shows Tidelight in a frame, Quick exit leaves the whole window, so that site isn't
    left on screen. A sandboxed frame may not do that, and then Quick exit leaves the frame."""
    framer = Framer(site.url("get-help/index.html"))
    try:
        for kind, path in (("a frame", "/"), ("a sandboxed frame", "/sandboxed")):
            tab = new_tab(browser, 1100, 800, False, allow=[WEATHER])
            tab.send("Fetch.enable", {"patterns": [{"urlPattern": WEATHER + "*"}]})
            tab.goto(framer.base + path)
            tab.browser.pump(0.8)
            where = node_where(tab, "quick-exit")
            if not where or not where[2]:
                report.fail("quickexit", "get-help/index.html", f"inside {kind}, Quick exit is not on screen or is covered: {where}")
                tab.close()
                continue
            main_frame = tab.send("Page.getFrameTree")["frameTree"]["frame"]["id"]
            tab.click_at(where[0], where[1])
            event = tab.browser.wait_for("Fetch.requestPaused", tab.session, 15)
            whole_window = event["params"].get("frameId") == main_frame
            tab.send("Fetch.fulfillRequest", {
                "requestId": event["params"]["requestId"], "responseCode": 200,
                "responseHeaders": [{"name": "Content-Type", "value": "text/html"}],
                "body": base64.b64encode(b"<!doctype html><title>Stand-in for weather.gov</title>").decode(),
            })
            tab.browser.pump(1.0)
            top = tab.js("location.href")
            _, entries = history_entries(tab)
            frames = [child["frame"].get("url", "") for child in tab.send("Page.getFrameTree")["frameTree"].get("childFrames", [])]
            print(f"  Quick exit inside {kind}: the window shows {top}, frames {frames}, history {entries}")
            if path == "/":
                if not whole_window or not top.startswith(WEATHER) or any(e.startswith(framer.base) for e in entries):
                    report.fail("quickexit", "get-help/index.html", f"inside another site's frame, Quick exit left that site on screen or in history: {top}, {entries}")
                else:
                    report.ok("quickexit")
            elif whole_window or top.startswith(WEATHER) or any(site.base in url for url in frames):
                report.fail("quickexit", "get-help/index.html", f"inside a sandboxed frame, Quick exit didn't leave the frame: {top}, {frames}")
            else:
                report.note("quickexit", "(limit)", "inside a sandboxed frame that may not change the whole window, Quick exit leaves only the frame")
                report.ok("quickexit")
            tab.close()
    finally:
        framer.stop()


def test_reducedmotion(browser, site, pages, report):
    tab = new_tab(browser, 390, 844, True)
    for page in pages:
        tab.media(reduced=True)
        tab.goto(site.url(page))
        state = tab.js("""({scroll: getComputedStyle(document.documentElement).scrollBehavior,
            animations: document.getAnimations().length,
            moving: Array.prototype.filter.call(document.querySelectorAll('*'), function (el) {
                var s = getComputedStyle(el);
                return s.animationName !== 'none' || parseFloat(s.transitionDuration) > 0;
            }).length})""")
        if state["scroll"] != "auto" or state["animations"] or state["moving"]:
            report.fail("reducedmotion", page, f"something still moves with reduced motion on: {state}")
        else:
            report.ok("reducedmotion")
        tab.media(reduced=False)
        tab.goto(site.url(page))
        if tab.js("getComputedStyle(document.documentElement).scrollBehavior") != "smooth":
            report.note("reducedmotion", page, "smooth scrolling is off even without the setting")
    tab.close()


def test_nojs(browser, site, pages, report):
    tab = new_tab(browser, 390, 844, True)
    tab.send("Emulation.setScriptExecutionDisabled", {"value": True})
    for page in pages:
        tab.goto(site.url(page))
        tab.browser.pump(0.02)
        # With scripts off, read the page from Python's side through the DOM domain.
        root = tab.send("DOM.getDocument", {"depth": -1})["root"]
        html_text = tab.send("DOM.getOuterHTML", {"nodeId": root["nodeId"]})["outerHTML"]
        for needle in ('href="tel:988"', 'href="sms:988"', 'href="tel:911"', 'class="quick-exit"'):
            if needle not in html_text:
                report.fail("nojs", page, f"missing without JavaScript: {needle}")
        # Is the navigation on screen with no menu button?
        script_state = tab.send("Runtime.evaluate", {
            "expression": """({hasJsClass: document.documentElement.classList.contains('js'),
                navShown: getComputedStyle(document.getElementById('site-nav')).display !== 'none',
                buttonShown: getComputedStyle(document.querySelector('.menu-button')).display !== 'none',
                printShown: !!document.querySelector('.print-button:not([hidden])'),
                hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1})""",
            "returnByValue": True,
        })
        value = script_state["result"].get("value")
        if value:
            if value["hasJsClass"] or not value["navShown"] or value["buttonShown"] or value["printShown"] or value["hscroll"]:
                report.fail("nojs", page, f"layout without JavaScript is wrong: {value}")
        report.ok("nojs")
    tab.send("Emulation.setScriptExecutionDisabled", {"value": False})
    tab.close()


def count_pdf_pages(path):
    data = pathlib.Path(path).read_bytes()
    return len(re.findall(rb"/Type\s*/Page[^s]", data))


def test_print(browser, site, pages, report, screens=None):
    tab = new_tab(browser, 1280, 800, False)
    workdir = pathlib.Path(tempfile.mkdtemp(prefix="tidelight-print-"))
    for page in pages:
        if page == "404.html":
            continue
        tab.media(media="print")
        tab.goto(site.url(page))
        state = tab.js("""({main: document.querySelector('main').getBoundingClientRect().height > 0 ? document.body.innerText.trim().length : 0,
            onScreen: 0,
            has988: /988/.test(document.body.innerText),
            hasExit: !!(document.querySelector('.quick-exit') && getComputedStyle(document.querySelector('.quick-exit')).display !== 'none'),
            isCard: !!document.querySelector('.print-area')})""")
        if state["main"] < 200:
            report.fail("print", page, f"prints almost nothing ({state['main']} characters)")
        if not state["has988"]:
            report.fail("print", page, "the printed page does not show 988")
        if state["hasExit"]:
            report.fail("print", page, "Quick exit would print")
        if state["isCard"]:
            cut = tab.js("""Array.prototype.filter.call(document.querySelectorAll('.pc-card'), function (c) {
                return c.scrollHeight > c.clientHeight + 1 || c.scrollWidth > c.clientWidth + 1; }).length""")
            if cut:
                report.fail("print", page, f"text is cut off on {cut} printed wallet cards")
        # A phone or computer in dark mode still prints dark text on white.
        tab.media(dark=True, media="print")
        tab.browser.pump(0.02)
        for item in tab.js(AUDIT_JS)["contrast"]:
            report.fail("print", page, f"low contrast in print from dark mode: {item}")
        tab.media()
        tab.goto(site.url(page))
        folds = tab.js("""(function () {
            window.__printEvents = [];
            window.addEventListener('beforeprint', function () {
                window.__printEvents.push(document.querySelectorAll('details:not([open])').length);
            });
            window.addEventListener('afterprint', function () { window.__printEvents.push('after'); });
            return document.querySelectorAll('details:not([open])').length;
        })()""")
        path = workdir / (page.replace("/", "_") + ".pdf")
        tab.pdf(path)
        tab.browser.pump(0.1)
        events = tab.js("window.__printEvents")
        if folds and (not events or events[0] != 0):
            report.fail("print", page, f"folded sections were not opened for printing: {events}")
        if folds and tab.js("document.querySelectorAll('details:not([open])').length") != folds:
            report.fail("print", page, "folded sections did not go back to closed after printing")
        pages_printed = count_pdf_pages(path)
        if pages_printed < 1:
            report.fail("print", page, "the PDF has no pages")
        if state["isCard"] and pages_printed != 2:
            report.fail("print", page, f"the wallet card page should print on 2 pages, got {pages_printed}")
        report.ok("print")
        if screens:
            shutil.copy(path, pathlib.Path(screens) / path.name)
    shutil.rmtree(workdir, ignore_errors=True)
    tab.close()


# ---------------------------------------------------------------- contact cards


def test_contact(browser, site, pages, report):
    numbers = allowed_numbers()
    cards = set()
    destinations = {}
    for page in pages:
        _, body, _, _ = fetch(site.url(page))
        parser = LinkParser()
        parser.feed(body.decode("utf-8"))
        # Call and text links are read, never followed. A browser reads TEL: as tel:, so this does too.
        for link in parser.links:
            if scheme_of(link) in PHONE_SCHEMES | OTHER_PHONE_SCHEMES:
                destinations[link] = destinations.get(link, 0) + 1
                if phone_digits(link.split("?")[0]) in numbers:
                    report.ok("contact")
                else:
                    report.fail("contact", page, f"{link} is not a number recorded in notes/SAFETY.md")
        for link in parser.links:
            if link.split("?")[0].endswith(".vcf"):
                cards.add(urllib.parse.urljoin(site.url(page), link))
    print("  Call and text links, read and never followed: " + ", ".join(f"{k} ({v})" for k, v in sorted(destinations.items())))
    if not cards:
        report.fail("contact", "(site)", "no page links to a contact card")
    for card in sorted(cards):
        status, body, kind, _ = fetch(card)
        name = card.rsplit("/", 1)[-1]
        if status != 200:
            report.fail("contact", name, f"answered {status}")
            continue
        if "vcard" not in kind:
            report.fail("contact", name, f"content type is {kind}")
        text = body.decode("utf-8")
        if "\r\n" not in text or re.search(r"(?<!\r)\n", text):
            report.fail("contact", name, "vCard lines must end in CRLF")
        lines = text.split("\r\n")
        if lines[0] != "BEGIN:VCARD" or "END:VCARD" not in lines or "VERSION:3.0" not in lines:
            report.fail("contact", name, "not a valid vCard 3.0")
        fields = dict(line.split(":", 1) for line in lines if ":" in line)
        phones = [v for k, v in fields.items() if k.startswith("TEL")]
        if not phones:
            report.fail("contact", name, "has no phone number")
        for phone in phones:
            if phone_digits(phone) not in numbers:
                report.fail("contact", name, f"{phone} is not recorded in notes/SAFETY.md")
        if not fields.get("FN"):
            report.fail("contact", name, "has no name")
        report.ok("contact")


def test_a11ytree(browser, site, pages, report):
    """Reads what a screen reader would be given. It is not a screen reader test."""
    tab = new_tab(browser, 390, 844, True)
    tab.send("Accessibility.enable")
    for page in pages:
        tab.goto(site.url(page))
        tab.js(OPEN_ALL)
        nodes = tab.send("Accessibility.getFullAXTree")["nodes"]
        names = {}
        roles = {}
        for node in nodes:
            if node.get("ignored"):
                continue
            role = node.get("role", {}).get("value", "")
            name = node.get("name", {}).get("value", "")
            roles[role] = roles.get(role, 0) + 1
            if role in ("link", "button", "DisclosureTriangle", "image", "img") and not str(name).strip():
                report.fail("a11ytree", page, f"{role} has no accessible name")
            names.setdefault(role, []).append(name)
        for required in ("main", "banner", "contentinfo", "navigation", "heading", "link"):
            if not roles.get(required):
                report.fail("a11ytree", page, f"no {required} in the accessibility tree")
        if roles.get("main", 0) != 1:
            report.fail("a11ytree", page, f"{roles.get('main', 0)} main regions")
        report.ok("a11ytree")
    tab.close()


# ---------------------------------------------------------------- axe-core

# axe-core's rules for WCAG 2.0, 2.1 and 2.2 at levels A and AA. axe-core 4.14 tags no rule wcag22a, since
# WCAG 2.2's new level A criteria need a person to judge; the tag is listed so a later release's rules run too.
AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"]
AXE_SIZES = [("phone 390x844", 390, 844, True), ("desktop 1440x900", 1440, 900, False)]
# Findings allowed, each with the written reason it isn't a problem: (rule, pages, or () for every page, text in
# the element's selector or markup, text in axe-core's explanation, reason). Each one allowed is still printed as
# a NOTE. Add one only with a reason a person could check.
AXE_ALLOWED = [
    ("target-size", ("check-in/index.html", "es/registro-diario/index.html"), 'a[href$="#ci-', "partially obscured",
     "Choosing a tab or step scrolls its section to just below the pinned crisis strip, so the tab row above it sits "
     "partly behind the strip until the visitor scrolls up. axe-core measures targets where they are on screen at that "
     "moment. With the page at the top, where the tabs are first reached, every tab passes. Whether the tab row should "
     "stay in view is a question for the founders in the handoff of November 9."),
]
# Results axe-core can't decide, which a person doesn't need to look at either: (messageKey, start of the element's
# markup, reason). Other undecided contrast is measured on the screen below, and anything else is a NOTE.
AXE_UNDECIDED_FINE = [
    ("nonBmp", '<span aria-hidden="true">',
     "an arrow drawn as a symbol, hidden from screen readers, inside a link whose own words are checked"),
]

AXE_RUN = """(async function (tags, context) {
  var r = await axe.run(context || document, {runOnly: {type: 'tag', values: tags}, resultTypes: ['violations', 'incomplete']});
  function rules(list) {
    return list.map(function (rule) {
      return {id: rule.id, impact: rule.impact, help: rule.help, nodes: rule.nodes.map(function (n) {
        var data = (n.any.concat(n.all, n.none)[0] || {}).data || {};
        return {target: n.target.join(' '), html: n.html.replace(/\\s+/g, ' ').slice(0, 200),
                why: (n.failureSummary || '').replace(/\\s+/g, ' ').slice(0, 300), key: data.messageKey || ''};
      })};
    });
  }
  return {version: axe.version, ran: r.passes.length + r.violations.length + r.incomplete.length + r.inapplicable.length,
          violations: rules(r.violations), incomplete: rules(r.incomplete)};
})(%s, %s)"""


# Text whose contrast axe can't judge, such as text over a gradient, a photo or a drawn shape, is measured on
# the screen instead. All text is made see-through for a moment, the screen behind an element's own text is
# captured, and its color is compared with each pixel there. The lowest 1% are left out, for soft edges.
TEXT_COLORS_JS = """(function (selectors) {
  return selectors.map(function (selector) {
    var el = document.querySelector(selector);
    if (!el) return null;
    var s = getComputedStyle(el);
    var m = s.color.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    var p = m[1].split(/[ ,\\/]+/).map(parseFloat);
    var alpha = p.length > 3 ? p[3] : 1;
    for (var node = el; node && node.nodeType === 1; node = node.parentElement) {
      var ns = getComputedStyle(node);
      alpha *= parseFloat(ns.opacity);
      (ns.filter.match(/opacity\\([^)]*\\)/g) || []).forEach(function (f) {
        var o = f.match(/opacity\\(\\s*([\\d.]+)(%%?)/);
        if (o) alpha *= parseFloat(o[1]) / (o[2] ? 100 : 1);
      });
    }
    var size = parseFloat(s.fontSize), bold = parseInt(s.fontWeight, 10) >= 700;
    return {color: [p[0], p[1], p[2], alpha], need: (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5};
  });
})(%s)"""
HIDE_TEXT_JS = """(function (hide) {
  var props = {'color': 'transparent', '-webkit-text-fill-color': 'transparent', 'text-shadow': 'none', 'text-decoration-color': 'transparent'};
  if (hide) {
    window.__tidelightHidden = Array.prototype.map.call(document.querySelectorAll('body, body *'), function (node) {
      var saved = Object.keys(props).map(function (p) { return [p, node.style.getPropertyValue(p), node.style.getPropertyPriority(p)]; });
      Object.keys(props).forEach(function (p) { node.style.setProperty(p, props[p], 'important'); });
      return [node, saved];
    });
  } else {
    (window.__tidelightHidden || []).forEach(function (item) {
      item[1].forEach(function (s) { item[0].style.setProperty(s[0], s[1], s[2]); });
    });
    window.__tidelightHidden = null;
  }
  return true;
})(%s)"""
TEXT_BOXES_JS = """(function (selector) {
  var el = document.querySelector(selector);
  if (!el) return [];
  el.scrollIntoView({block: 'center', behavior: 'instant'});
  // Nothing that can be seen lies over the text there. A clear layer, such as a link stretched over a card, is fine.
  function clear(s) {
    var m = s.backgroundColor.match(/rgba?\\(([^)]+)\\)/);
    var p = m ? m[1].split(/[ ,\\/]+/).map(parseFloat) : [];
    return p.length > 3 && p[3] === 0 && s.backgroundImage === 'none';
  }
  function open(x, y) {
    var stack = document.elementsFromPoint(x, y);
    for (var i = 0; i < stack.length; i++) {
      if (stack[i] === el || el.contains(stack[i])) return true;
      if (!(clear(getComputedStyle(stack[i])) && clear(getComputedStyle(stack[i], '::before')) && clear(getComputedStyle(stack[i], '::after')))) return false;
    }
    return false;
  }
  var boxes = [];
  Array.prototype.forEach.call(el.childNodes, function (text) {
    if (text.nodeType !== 3 || !text.nodeValue.trim()) return;
    var range = document.createRange();
    range.selectNodeContents(text);
    Array.prototype.forEach.call(range.getClientRects(), function (r) {
      if (r.width < 1 || r.height < 1 || r.top < 0 || r.left < 0 || r.bottom > innerHeight || r.right > innerWidth) return;
      if (!open(r.left + r.width / 2, r.top + r.height / 2)) return;  // under something else, such as the pinned strip
      boxes.push([r.left + scrollX, r.top + scrollY, r.right + scrollX, r.bottom + scrollY]);
    });
  });
  return boxes;
})(%s)"""
MEASURE_JS = """(async function (png, clip, boxes, text) {
  var bytes = Uint8Array.from(atob(png), function (c) { return c.charCodeAt(0); });
  var bitmap = await createImageBitmap(new Blob([bytes], {type: 'image/png'}));
  var canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  var context = canvas.getContext('2d');
  context.drawImage(bitmap, 0, 0);
  var pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
  var sx = bitmap.width / clip[2], sy = bitmap.height / clip[3], a = text[3];
  function lum(r, g, b) {
    function f(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  // How many pixels of each color lie behind the text.
  var counts = new Map(), total = 0;
  boxes.forEach(function (b) {
    var x0 = Math.max(0, Math.round((b[0] - clip[0]) * sx)), x1 = Math.min(bitmap.width, Math.round((b[2] - clip[0]) * sx));
    var y0 = Math.max(0, Math.round((b[1] - clip[1]) * sy)), y1 = Math.min(bitmap.height, Math.round((b[3] - clip[1]) * sy));
    for (var y = y0; y < y1; y++) {
      for (var x = x0; x < x1; x++) {
        var i = (y * bitmap.width + x) * 4, key = (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2];
        counts.set(key, (counts.get(key) || 0) + 1);
        total++;
      }
    }
  });
  if (!total) return null;
  var ratios = [];
  counts.forEach(function (count, key) {
    var r = key >> 16, g = (key >> 8) & 255, bl = key & 255;
    var back = lum(r, g, bl), fore = lum(text[0] * a + r * (1 - a), text[1] * a + g * (1 - a), text[2] * a + bl * (1 - a));
    ratios.push([(Math.max(back, fore) + 0.05) / (Math.min(back, fore) + 0.05), count]);
  });
  ratios.sort(function (x, y) { return x[0] - y[0]; });
  // The lowest ratio once the worst 1 in 100 pixels are left out.
  var skip = Math.floor(total * 0.01);
  for (var k = 0; k < ratios.length; k++) {
    skip -= ratios[k][1];
    if (skip < 0) return ratios[k][0];
  }
  return ratios[ratios.length - 1][0];
})(%s, %s, %s, %s)"""


def axe_allowance(rule, page, node):
    """The written reason a finding is allowed, or None."""
    for allowed_rule, allowed_pages, text, why, reason in AXE_ALLOWED:
        if allowed_rule == rule and (not allowed_pages or page in allowed_pages) and text in node["target"] + " " + node["html"] \
                and why in node["why"]:
            return reason
    return None


def measure_contrast(tab, nodes):
    """For each element axe couldn't judge: (lowest contrast measured behind its text, contrast it needs), or None."""
    selectors = [node["target"] for node in nodes]
    colors = tab.js(TEXT_COLORS_JS % json.dumps(selectors))
    results = []
    tab.js(HIDE_TEXT_JS % "true")
    try:
        for selector, color in zip(selectors, colors):
            boxes = tab.js(TEXT_BOXES_JS % json.dumps(selector)) if color else []
            if not boxes:
                results.append(None)
                continue
            left, top = min(b[0] for b in boxes), min(b[1] for b in boxes)
            clip = [left, top, max(b[2] for b in boxes) - left, max(b[3] for b in boxes) - top]
            png = tab.send("Page.captureScreenshot", {"format": "png", "clip": {
                "x": clip[0], "y": clip[1], "width": clip[2], "height": clip[3], "scale": 1}})["data"]
            value = tab.js(MEASURE_JS % (json.dumps(png), json.dumps(clip), json.dumps(boxes), json.dumps(color["color"])))
            results.append(None if value is None else (value, color["need"]))
    finally:
        tab.js(HIDE_TEXT_JS % "false")
        tab.js("window.scrollTo({top: 0, behavior: 'instant'})")
    return results


def check_with_axe(tab, source, page, where, report, context=None):
    """Runs axe-core on the page as it is now and reports what it finds. Returns the number of rules it ran."""
    if not tab.js("typeof window.axe === 'object' && typeof window.axe.run === 'function'"):
        tab.js(source + "\n;true")
    result = tab.js(AXE_RUN % (json.dumps(AXE_TAGS), json.dumps(context)))
    if result["version"] != axe_core.VERSION:
        report.fail("axe", page, f"the page reports axe-core {result['version']}, not the pinned {axe_core.VERSION}", where)
    for rule in result["violations"]:
        for node in rule["nodes"]:
            reason = axe_allowance(rule["id"], page, node)
            if reason:
                report.note("axe", page, f"{rule['id']} allowed on {node['target']}: {reason}", where)
            else:
                report.fail("axe", page, f"{rule['id']} ({rule['impact']}): {rule['help']}: {node['target']}: {node['why']}", where)
    undecided = []
    for rule in result["incomplete"]:
        for node in rule["nodes"]:
            if any(node["key"] == key and node["html"].startswith(start) for key, start, _ in AXE_UNDECIDED_FINE):
                report.ok("axe")
            elif rule["id"] == "color-contrast":
                undecided.append(node)
            else:
                report.note("axe", page, f"axe-core couldn't decide {rule['id']} ({rule['help']}) for {node['target']}: a person should look", where)
    for node, measured in zip(undecided, measure_contrast(tab, undecided) if undecided else []):
        if measured is None:
            report.note("axe", page, f"axe-core couldn't judge the contrast of {node['target']} ({node['key']}), "
                        "and it couldn't be measured on screen: a person should look", where)
        elif measured[0] < measured[1]:
            report.fail("axe", page, f"low contrast, measured on screen behind the text (needs {measured[1]}:1): {node['target']}",
                        f"{where}, {measured[0]:.2f}:1")
        else:
            report.ok("axe")
    report.ok("axe")
    return result["ran"]


def test_axe(browser, site, pages, report):
    """axe-core's WCAG 2.2 A and AA rules on every page, at a phone size and a desktop size, in light and dark,
    with every fold open, on phones with the menu open too, and on the Daily check-in at each step and tab.
    axe-core is downloaded once and checked against its recorded hash (tools/axe_core.py). It is injected
    into this test browser only, never served by the site. Like every automated check, it finds only part
    of what a person using a screen reader or a keyboard would."""
    try:
        source = axe_core.source()
    except axe_core.AxeError as error:
        report.fail("axe", "(axe-core)", str(error))
        return
    tab = new_tab(browser)
    ran = set()
    for label, width, height, phone in AXE_SIZES:
        tab.resize(width, height, phone)
        for dark in (False, True):
            tab.media(dark=dark, reduced=True)
            where = f"{label}, {'dark' if dark else 'light'}"
            for page in pages:
                tab.goto(site.url(page))
                tab.js(OPEN_ALL)
                ran.add(check_with_axe(tab, source, page, where, report))
                if phone and tab.js("!!document.querySelector('.menu-button')"):
                    tab.js("document.querySelector('.menu-button').click()")
                    if tab.js("document.querySelector('.menu-button').getAttribute('aria-expanded')") != "true":
                        report.fail("axe", page, "the menu didn't open, so its links weren't checked", where)
                    else:
                        check_with_axe(tab, source, page, where + ", menu open", report, "#site-nav")
                    tab.js("document.querySelector('.menu-button').click()")
                # The Daily check-in shows one tab and one step at a time, so each is checked as a visitor sees it.
                states = tab.js("""Array.prototype.map.call(document.querySelectorAll('.ci-panel[id], .ci-step[id]'),
                    function (el) { return el.id; })""") or []
                for state in states:
                    tab.js(f"location.hash = {json.dumps('#' + state)}; true")
                    tab.browser.pump(0.05)
                    tab.js(OPEN_ALL)
                    check_with_axe(tab, source, page, f"{where}, #{state}", report)
                if states and tab.js("!!document.querySelector('.ci-finish')"):
                    tab.js("document.querySelector('.ci-finish').click(); true")
                    tab.browser.pump(0.05)
                    tab.js(OPEN_ALL)
                    check_with_axe(tab, source, page, f"{where}, today's suggestions", report)
                for problem in page_problems(tab, page, site):
                    report.fail("axe", page, problem, where)
    tab.close()
    print(f"  axe-core {axe_core.VERSION} ran {', '.join(str(n) for n in sorted(ran))} rules on each page (WCAG 2.2 A and AA).")


# ---------------------------------------------------------------- offline


def copy_site(target):
    target = pathlib.Path(target)
    (target / ".github" / "workflows").mkdir(parents=True)
    shutil.copy(ROOT / ".github" / "workflows" / "site.yml", target / ".github" / "workflows" / "site.yml")
    for item in published_items():
        source = ROOT / item
        if source.is_dir():
            shutil.copytree(source, target / item)
        else:
            shutil.copy(source, target / item)


WAIT_FOR_WORKER = """(async function () {
    var timeout = new Promise(function (done) { setTimeout(function () { done(null); }, 15000); });
    var reg = await Promise.race([navigator.serviceWorker.ready, timeout]);
    if (!reg) return {scope: '', controlled: false, names: [], saved: []};
    for (var i = 0; i < 100 && !navigator.serviceWorker.controller; i++) await new Promise(function (r) { setTimeout(r, 50); });
    var names = await caches.keys();
    var saved = [];
    for (var n of names) { (await (await caches.open(n)).keys()).forEach(function (q) { saved.push(q.url); }); }
    return {scope: reg.scope, controlled: !!navigator.serviceWorker.controller, names: names, saved: saved};
})()"""


def test_offline(browser, site_ignored, pages, report):
    workdir = tempfile.mkdtemp(prefix="tidelight-offline-")
    site_root = pathlib.Path(workdir) / "site"
    site_root.mkdir()
    copy_site(site_root)
    site = Site(site_root)
    context = browser.call("Target.createBrowserContext")["browserContextId"]
    # An iPhone's screen has 3 device pixels per CSS pixel, so the larger photo is the one it picks.
    tab = new_tab(browser, 390, 844, True, scale=3, context=context)
    try:
        tab.goto(site.base)
        state = tab.js(WAIT_FOR_WORKER)
        print(f"  Offline: after one visit, {len(set(state['saved']))} files are saved in {state['names']}.")
        if not state["controlled"]:
            report.fail("offline", "(worker)", "the worker did not take control after the first visit")
            site.stop()
            return
        if state["scope"] != site.base:
            report.fail("offline", "(worker)", f"worker scope is {state['scope']}")
        titles = {}
        # The checks further down always use these three pages, whichever pages were asked for.
        for page in set(pages) | {"research/index.html", "get-help/index.html", "es/obtener-ayuda/index.html"}:
            parser = re.search(r"<title>(.*?)</title>", fetch(site.url(page))[1].decode("utf-8"), re.S)
            titles[page] = html.unescape(parser.group(1)) if parser else ""
        outside = [u for u in state["saved"] if not u.startswith(site.base)]
        if outside:
            report.fail("offline", "(worker)", f"saved something from another site: {outside}")

        # Really one visit: the connection goes at once, so nothing else is loaded first. The browser's
        # own 10-minute copies are cleared, as they would have run out by a later day, so only the
        # worker's saved copies can show.
        site.stop()  # The computer's connection to the site is now gone.
        tab.send("Network.clearBrowserCache")
        for page in pages:
            if page == "404.html":
                continue
            status = tab.goto(site.url(page))
            info = tab.js("""({title: document.title, tel: !!document.querySelector('.crisis-bar a[href="tel:988"]'),
                sms: !!document.querySelector('.crisis-bar a[href="sms:988"]'),
                styled: getComputedStyle(document.body).fontFamily.indexOf('Arial') >= 0,
                broken: Array.prototype.filter.call(document.images, function (i) { return i.complete && i.naturalWidth === 0; }).map(function (i) { return i.currentSrc || i.src; })})""")
            if status != 200 or not info["tel"] or not info["sms"] or info["title"] != titles[page]:
                report.fail("offline", page, f"not available offline after one visit: status {status}, {info}")
            elif not info["styled"]:
                report.fail("offline", page, "opens offline without its styles")
            elif info["broken"]:
                report.fail("offline", page, f"image missing offline: {info['broken']}")
            else:
                report.ok("offline")
        # An address that was never saved shows the page-not-found page, with the crisis numbers.
        status = tab.goto(site.base + "never/saved/")
        info = tab.js("""({title: document.title, tel: !!document.querySelector('.crisis-bar a[href="tel:988"]'),
            styled: getComputedStyle(document.body).fontFamily.indexOf('Arial') >= 0})""")
        if not info["tel"] or not info["styled"]:
            report.fail("offline", "(unknown address)", f"offline fallback failed: status {status}, {info}")
        else:
            report.ok("offline")
        # Contact cards are saved too, if the site links to any.
        for page in ("get-help/index.html",):
            cards = [u for u in state["saved"] if u.endswith(".vcf")]
            for card in cards:
                got = tab.js(f"fetch({json.dumps(card)}).then(function (r) {{ return r.ok ? r.text() : ''; }})")
                if "BEGIN:VCARD" not in (got or ""):
                    report.fail("offline", card.rsplit("/", 1)[-1], "the contact card is not available offline")
                else:
                    report.ok("offline")

        # The page says so when the device reports no connection, in its own language.
        site.start()
        for page, word in (("index.html", "offline"), ("es/index.html", "sin conexi")):
            tab.goto(site.url(page))
            if tab.js("!!document.querySelector('.offline-note')"):
                report.fail("offline", page, "the offline notice shows with a connection")
            tab.send("Network.emulateNetworkConditions", {"offline": True, "latency": 0, "downloadThroughput": -1, "uploadThroughput": -1})
            tab.browser.pump(0.3)
            notice = tab.js("(document.querySelector('main > .offline-note') || {}).textContent || ''")
            if word not in notice.lower():
                report.fail("offline", page, f"no offline notice in the page's language: {notice!r}")
            tab.send("Network.emulateNetworkConditions", {"offline": False, "latency": 0, "downloadThroughput": -1, "uploadThroughput": -1})
            tab.browser.pump(0.3)
            if tab.js("!!document.querySelector('.offline-note')"):
                report.fail("offline", page, "the offline notice stays after the connection returns")
            report.ok("offline")

        # The site comes back with a changed page. Like GitHub Pages, the server lets the browser keep a
        # copy for 10 minutes, so a visitor who loaded the page recently may see the old text until then,
        # as the About pages say. After that, the next visit shows the new text and refreshes the saved copy.
        tab.goto(site.url("get-help/index.html"))
        site.stop()
        target = site_root / "get-help" / "index.html"
        target.write_text(target.read_text(encoding="utf-8").replace("</h1>", " UPDATE-MARKER</h1>", 1), encoding="utf-8")
        site.start()
        tab.goto(site.url("get-help/index.html"))
        if "UPDATE-MARKER" not in tab.js("document.querySelector('h1').textContent"):
            report.note("offline", "(limit)", "a changed page can take up to 10 minutes to show to someone who loaded it recently, and the About pages say so")
        tab.send("Network.clearBrowserCache")  # stands in for the 10 minutes passing
        tab.goto(site.url("get-help/index.html"))
        if "UPDATE-MARKER" not in tab.js("document.querySelector('h1').textContent"):
            report.fail("offline", "(updates)", "a changed page does not show once the browser's 10-minute copy has run out")
        else:
            report.ok("offline")
        tab.browser.pump(0.3)
        site.stop()
        tab.goto(site.url("get-help/index.html"))
        if "UPDATE-MARKER" not in tab.js("document.querySelector('h1').textContent"):
            report.fail("offline", "(updates)", "the saved copy was not refreshed by the online visit")
        else:
            report.ok("offline")
        # Pages visited offline before the update and not since keep the old copy until a visit, or a new VERSION.
        worker = site_root / "sw.js"
        worker.write_text(re.sub(r"tidelight-v\d+", "tidelight-v999", worker.read_text(encoding="utf-8")), encoding="utf-8")
        site.start()
        tab.goto(site.base)
        tab.js("navigator.serviceWorker.getRegistration().then(function (r) { return r.update(); })")
        names = []
        for _ in range(60):
            tab.browser.pump(0.1)
            names = tab.js("caches.keys()")
            if names == ["tidelight-v999"]:
                break
        # The new saved files must hold the new text, not only have the new name.
        saved = tab.js(f"""caches.open('tidelight-v999').then(function (c) {{ return c.match({json.dumps(site.url('get-help/index.html'))}); }})
            .then(function (r) {{ return r ? r.text() : ''; }})""") if names == ["tidelight-v999"] else ""
        if names != ["tidelight-v999"]:
            report.fail("offline", "(updates)", f"a new VERSION did not replace the old saved files: {names}")
        elif "UPDATE-MARKER" not in (saved or ""):
            report.fail("offline", "(updates)", "a new VERSION saved an old copy of a changed page")
        else:
            report.ok("offline")
        # An address with a ?query is saved under its plain address, so nothing extra is kept.
        tab.goto(site.url("research/index.html") + "?utm_source=planted#what-helps")
        tab.browser.pump(0.5)
        state = tab.js(WAIT_FOR_WORKER)
        extra = [u for u in state["saved"] if "?" in u or "#" in u]
        if extra:
            report.fail("offline", "(worker)", f"an address was saved with its query: {extra[:2]}")
        else:
            report.ok("offline")
        site.stop()
        tab.send("Network.clearBrowserCache")
        status = tab.goto(site.url("research/index.html") + "?utm_source=planted")
        if tab.js("document.title") != titles["research/index.html"]:
            report.fail("offline", "research/index.html", f"not available offline with a query in the address: status {status}")
        else:
            report.ok("offline")

        check_bad_hosts(tab, site, titles, report)
        # Outside links aren't saved, so they can't open offline, and that includes chat.
        print("  Offline: call and text links only open the phone's own apps; chat and outside sites need a connection.")
    finally:
        tab.close()
        browser.call("Target.disposeBrowserContext", {"browserContextId": context})
        shutil.rmtree(workdir, ignore_errors=True)
    check_correction_beats_browser_cache(browser, report)


SHOWS_CRISIS_HELP = """({title: document.title, tel: !!document.querySelector('.crisis-bar a[href="tel:988"]'),
    sms: !!document.querySelector('.crisis-bar a[href="sms:988"]'),
    styled: getComputedStyle(document.body).fontFamily.indexOf('Arial') >= 0})"""
# A saved copy after about 3 seconds, allowing for a slow test machine.
STALLED_LIMIT_S = 8
# After that, the next page shouldn't have to wait out the 3 seconds again.
STALLED_AGAIN_LIMIT_S = 2.5


def check_bad_hosts(tab, site, titles, report):
    """A visitor who has been here before, when the host misbehaves. The browser's own 10-minute
    copies are cleared first, as on a later day, so only the worker can show a saved copy."""
    # The host answers with a server error. Saved pages show, not the error page.
    tab.send("Network.clearBrowserCache")
    host = BadHost(site.port, stall=False)
    try:
        for page in ("get-help/index.html", "es/obtener-ayuda/index.html"):
            tab.goto(site.url(page))
            info = tab.js(SHOWS_CRISIS_HELP)
            if info["title"] != titles[page] or not info["tel"] or not info["styled"]:
                report.fail("offline", page, f"a server error hides the saved copy: {info}")
            else:
                report.ok("offline")
        tab.goto(site.base + "never/saved/")
        info = tab.js(SHOWS_CRISIS_HELP)
        if not info["tel"] or not info["sms"]:
            report.fail("offline", "(unknown address)", f"a server error on an unsaved address shows no crisis numbers: {info}")
        else:
            report.ok("offline")
    finally:
        host.stop()

    # The host accepts the connection and never answers. A saved copy shows soon anyway.
    tab.send("Network.clearBrowserCache")
    host = BadHost(site.port, stall=True)
    try:
        for page, limit in (("get-help/index.html", STALLED_LIMIT_S), ("es/obtener-ayuda/index.html", STALLED_AGAIN_LIMIT_S)):
            started = time.monotonic()
            try:
                tab.goto(site.url(page), timeout=max(limit * 3, 25))
                elapsed = time.monotonic() - started
            except Exception as error:  # noqa: BLE001 - a timeout here is the failure being tested for
                report.fail("offline", page, f"with a weak signal the page never opened: {error}")
                continue
            info = tab.js(SHOWS_CRISIS_HELP)
            print(f"  Offline: with a host that never answers, {page} showed its saved copy in {elapsed:.1f} s.")
            if info["title"] != titles[page] or not info["tel"] or not info["styled"]:
                report.fail("offline", page, f"with a weak signal the saved copy didn't show: {info}")
            elif elapsed > limit:
                report.fail("offline", page, f"with a weak signal the saved copy took {elapsed:.1f} s, over {limit} s")
            else:
                report.ok("offline")
    finally:
        host.stop()


def check_correction_beats_browser_cache(browser, report):
    """A corrected crisis number must reach saved copies, even for a visitor who loaded the
    old page minutes ago and still has it in the browser's short-term cache."""
    workdir = tempfile.mkdtemp(prefix="tidelight-correct-")
    site_root = pathlib.Path(workdir) / "site"
    site_root.mkdir()
    copy_site(site_root)
    site = Site(site_root, cache_control="public, max-age=600")
    context = browser.call("Target.createBrowserContext")["browserContextId"]
    tab = new_tab(browser, 390, 844, True, context=context)
    try:
        tab.goto(site.base)
        tab.js(WAIT_FOR_WORKER)
        tab.goto(site.url("get-help/index.html"))
        target = site_root / "get-help" / "index.html"
        target.write_text(target.read_text(encoding="utf-8").replace("</h1>", " CORRECTED-MARKER</h1>", 1), encoding="utf-8")
        worker = site_root / "sw.js"
        worker.write_text(re.sub(r"tidelight-v\d+", "tidelight-v999", worker.read_text(encoding="utf-8")), encoding="utf-8")
        tab.goto(site.base)
        tab.js("navigator.serviceWorker.getRegistration().then(function (r) { return r.update(); })")
        names = []
        for _ in range(60):
            tab.browser.pump(0.1)
            names = tab.js("caches.keys()")
            if names == ["tidelight-v999"]:
                break
        if names != ["tidelight-v999"]:
            report.fail("offline", "(updates)", f"the new VERSION did not install: {names}")
            return
        site.stop()
        tab.goto(site.url("get-help/index.html"))
        if "CORRECTED-MARKER" not in tab.js("document.querySelector('h1').textContent"):
            report.fail("offline", "(updates)", "a correction did not reach the saved copy, because the browser's cache was used")
        else:
            report.ok("offline")
    finally:
        tab.close()
        browser.call("Target.disposeBrowserContext", {"browserContextId": context})
        shutil.rmtree(workdir, ignore_errors=True)


# ---------------------------------------------------------------- speed on a poor connection

# Chrome's "Slow 3G" settings, and a phone about 4 times slower than this computer.
SLOW_NETWORK = {"offline": False, "latency": 2000, "downloadThroughput": 50000, "uploadThroughput": 50000}
# How long the crisis numbers may take to appear on that connection, for a first-time visitor. See notes/worklogs.
FIRST_PAINT_LIMIT_MS = 9000
PAGE_WEIGHT_LIMIT_BYTES = 250000


def test_speed(browser, site, pages, report):
    context = browser.call("Target.createBrowserContext")["browserContextId"]
    worst = {}
    try:
        for page in pages:
            tab = new_tab(browser, 390, 844, True, scale=3, context=context)
            tab.send("Network.setCacheDisabled", {"cacheDisabled": True})
            tab.send("Network.emulateNetworkConditions", SLOW_NETWORK)
            tab.send("Emulation.setCPUThrottlingRate", {"rate": 4})
            # The worker would serve later pages from its copy, so measure a true first visit.
            tab.send("Network.setBypassServiceWorker", {"bypass": True})
            tab.goto(site.url(page), timeout=120, settle=0.2)
            timing = tab.js("""(function () {
                var paint = performance.getEntriesByName('first-contentful-paint')[0];
                var bar = document.querySelector('.crisis-bar a[href="tel:988"]');
                var box = bar ? bar.getBoundingClientRect() : {height: 0, top: -1};
                return {paint: paint ? Math.round(paint.startTime) : null, bar: box.height > 0 && box.top >= 0};
            })()""")
            bytes_loaded = sum(
                event["params"].get("encodedDataLength", 0) for event in browser.events
                if event.get("sessionId") == tab.session and event["method"] == "Network.loadingFinished"
            )
            worst[page] = (timing["paint"], bytes_loaded)
            if not timing["bar"]:
                report.fail("speed", page, "the crisis strip is not on screen after loading")
            if timing["paint"] is None or timing["paint"] > FIRST_PAINT_LIMIT_MS:
                report.fail("speed", page, f"first paint took {timing['paint']} ms on a slow connection (limit {FIRST_PAINT_LIMIT_MS})")
            elif bytes_loaded > PAGE_WEIGHT_LIMIT_BYTES:
                report.fail("speed", page, f"{bytes_loaded // 1024} KB loaded (limit {PAGE_WEIGHT_LIMIT_BYTES // 1024})")
            else:
                report.ok("speed")
            tab.close()
    finally:
        browser.call("Target.disposeBrowserContext", {"browserContextId": context})
    slowest = max(worst.items(), key=lambda item: item[1][0] or 0)
    heaviest = max(worst.items(), key=lambda item: item[1][1])
    print(f"  Slow connection, first visit: slowest paint {slowest[1][0]} ms ({slowest[0]}), heaviest {heaviest[1][1] // 1024} KB ({heaviest[0]}).")


# ---------------------------------------------------------------- high contrast modes


def test_modes(browser, site, pages, report):
    """Windows high contrast and "increase contrast" settings: nothing may vanish or overlap."""
    tab = new_tab(browser)
    for label, width, height, phone in (("phone 390x844", 390, 844, True), ("desktop 1440x900", 1440, 900, False)):
        tab.resize(width, height, phone)
        for extra in ({"forced-colors": "active"}, {"prefers-contrast": "more"}):
            where = f"{label}, {list(extra.items())[0][0]}"
            tab.media(extra=extra, reduced=True)
            for page in pages:
                tab.goto(site.url(page))
                tab.js(OPEN_ALL)
                result = tab.js(AUDIT_JS)
                # Forced colors replaces the page's colors, so these measurements don't apply.
                if "forced-colors" in extra:
                    result["contrast"] = []
                apply_audit(result, "modes", page, where, report, False)
                gone = tab.js("""Array.prototype.filter.call(document.querySelectorAll('.action svg, .quick-exit svg, .menu-button svg'), function (svg) {
                    var s = getComputedStyle(svg);
                    return s.display === 'none' || s.visibility === 'hidden' || s.stroke === 'none';
                }).length""")
                if gone:
                    report.fail("modes", page, f"{gone} control icons disappear", where)
    tab.media()
    tab.close()


# ---------------------------------------------------------------- privacy claims


def test_privacy(browser, site, pages, report):
    """What the About pages promise: nothing stored about visitors, nothing from other sites, no referrer."""
    tab = new_tab(browser, 390, 844, True)
    for page in pages:
        tab.goto(site.url(page))
        stored = tab.js("""(async function () {
            var databases = indexedDB.databases ? await indexedDB.databases() : [];
            return {cookie: document.cookie, local: localStorage.length, session: sessionStorage.length, databases: databases.length};
        })()""")
        if stored["cookie"] or stored["local"] or stored["session"] or stored["databases"]:
            report.fail("privacy", page, f"the page stores something: {stored}")
        # Nothing reaches the network here: the policy refuses the request first.
        blocked = tab.js("""new Promise(function (done) {
            document.addEventListener('securitypolicyviolation', function () { done(true); }, {once: true});
            new Image().src = 'https://example.com/planted.png';
            setTimeout(function () { done(false); }, 800);
        })""")
        if not blocked:
            report.fail("privacy", page, "the content security policy doesn't block loading from another site")
        else:
            report.ok("privacy")
    tab.close()

    # Going Back doesn't show which feeling was opened. Only real clicks, so the browser keeps the page.
    if any(p.startswith("not-sure") for p in pages):
        tab = new_tab(browser, 390, 844, True)
        tab.goto(site.url("not-sure/index.html"))
        guard_click(tab, "details.feeling > summary")
        opened = tab.js("document.querySelectorAll('details.feeling[open]').length")
        tab.js("window.tidelightMarker = 1")
        tab.clear_events()
        guard_click(tab, ".next-steps a[href^=\"../\"]")
        tab.browser.wait_for("Page.loadEventFired", tab.session, 15)
        tab.clear_events()
        tab.js("history.back()")
        tab.browser.pump(1)
        after = tab.js("""({open: document.querySelectorAll('details.feeling[open]').length, kept: window.tidelightMarker === 1,
            hidden: document.documentElement.hidden, at: location.pathname})""")
        print(f"  Privacy: after Back, the browser {'kept the page in memory' if after['kept'] else 'loaded the page again'}, with {after['open']} feelings open.")
        if not opened or "not-sure" not in after["at"]:
            report.fail("privacy", "not-sure/index.html", f"the test could not open a feeling and return to it: {opened}, {after}")
        elif after["open"]:
            report.fail("privacy", "not-sure/index.html", "Back shows which feeling was opened")
        elif after["hidden"]:
            report.fail("privacy", "not-sure/index.html", "the page came back blank")
        else:
            report.ok("privacy")
        tab.close()

    # Following an outside link doesn't tell that site where the visitor came from. A stand-in answers.
    tab = new_tab(browser, 390, 844, True, allow=["https://988lifeline.org/"])
    tab.send("Fetch.enable", {"patterns": [{"urlPattern": "https://988lifeline.org/*"}]})
    tab.goto(site.url("get-help/index.html"))
    if not guard_click(tab, ".fallback a[href='https://988lifeline.org/']"):
        report.fail("privacy", "get-help/index.html", "the link to 988lifeline.org is not on screen")
    else:
        event = tab.browser.wait_for("Fetch.requestPaused", tab.session, 15)
        headers = {key.lower(): value for key, value in event["params"]["request"]["headers"].items()}
        tab.send("Fetch.fulfillRequest", {
            "requestId": event["params"]["requestId"], "responseCode": 200,
            "responseHeaders": [{"name": "Content-Type", "value": "text/html"}],
            "body": base64.b64encode(b"<!doctype html><title>Stand-in</title>").decode(),
        })
        if "referer" in headers:
            report.fail("privacy", "get-help/index.html", f"an outside site is told the visitor came from here: {headers['referer']}")
        else:
            report.ok("privacy")
    tab.close()


# ---------------------------------------------------------------- screenshots


def take_screenshots(browser, site, pages, directory):
    directory = pathlib.Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    tab = new_tab(browser, 390, 844, True, scale=2)
    for dark in (False, True):
        tab.media(dark=dark, reduced=True)
        suffix = "dark" if dark else "light"
        for page in pages:
            tab.goto(site.url(page))
            name = page.replace("/index.html", "").replace("/", "-").replace(".html", "") or "home"
            name = "home" if page == "index.html" else name
            tab.screenshot(directory / f"{name}-phone-{suffix}.png")
    tab.close()


def main():
    parser = argparse.ArgumentParser(description="Test the website in a real browser.")
    parser.add_argument("--only", default=",".join(GROUPS), help="comma-separated groups: " + ", ".join(GROUPS))
    parser.add_argument("--pages", default="", help="only pages whose path contains this text")
    parser.add_argument("--screens", default="", help="save phone screenshots in this folder")
    parser.add_argument("--out", default="", help="write the results as JSON to this file")
    args = parser.parse_args()

    if not find_chrome():
        print("Google Chrome or Chromium was not found, so nothing was tested.")
        return 2
    pages = find_pages()
    if args.pages:
        pages = [p for p in pages if any(piece in p for piece in args.pages.split(","))]
        if not pages:
            print(f"No page's path contains {args.pages!r}, so nothing would be tested.")
            return 2
    groups = [g.strip() for g in args.only.split(",") if g.strip()]
    unknown = [g for g in groups if g not in GROUPS]
    if unknown:
        print(f"Unknown groups: {unknown}")
        return 2

    site = Site()
    browser = Browser()
    print(browser.call("Browser.getVersion")["product"], "at", site.base)
    report = Report()
    functions = {
        "matrix": test_matrix, "textsize": test_textsize, "keyboard": test_keyboard, "menu": test_menu,
        "jumps": test_jumps, "folds": test_folds, "language": test_language, "quickexit": test_quickexit,
        "reducedmotion": test_reducedmotion, "nojs": test_nojs, "print": test_print, "contact": test_contact,
        "a11ytree": test_a11ytree, "axe": test_axe, "offline": test_offline, "speed": test_speed, "modes": test_modes,
        "privacy": test_privacy,
    }
    try:
        for group in groups:
            started = time.time()
            if group == "links":
                test_links(site, pages, report)
            else:
                functions[group](browser, site, pages, report)
            print(f"  {group} took {time.time() - started:.0f}s", flush=True)
        if args.screens:
            take_screenshots(browser, site, pages, args.screens)
    finally:
        browser.close()
        try:
            site.stop()
        except Exception:
            pass
    print()
    failures = report.print_summary()
    if args.out:
        pathlib.Path(args.out).write_text(json.dumps(report.to_json(), indent=1), encoding="utf-8")
    if failures:
        print(f"\n{failures} distinct problem(s). This covers desktop Chrome and its phone-size emulation only.")
        return 1
    print("\nAll browser checks passed. This covers desktop Chrome and its phone-size emulation only,")
    print("not a real phone, not a screen reader, and not whether the content is right.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

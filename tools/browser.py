"""A small driver for Chrome, so browser tests need nothing but Python and Chrome itself.

It starts Chrome with a throwaway profile, so it never sees anyone's sign-ins, and talks
to it over the Chrome DevTools Protocol. Used by tools/test_browser.py and
tools/make_review_packet.py. It never calls, texts, or submits anything.
"""
import base64
import json
import os
import pathlib
import shutil
import socket
import struct
import subprocess
import tempfile
import time
import urllib.parse

CHROME_PATHS = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
]


def find_chrome():
    for path in CHROME_PATHS:
        if os.path.exists(path):
            return path
    for name in ("google-chrome", "chromium", "chromium-browser"):
        found = shutil.which(name)
        if found:
            return found
    return None


class WebSocket:
    """Just enough of RFC 6455 for one local connection."""

    def __init__(self, url):
        parts = urllib.parse.urlsplit(url)
        self.sock = socket.create_connection((parts.hostname, parts.port), timeout=60)
        key = base64.b64encode(os.urandom(16)).decode()
        request = (
            f"GET {parts.path} HTTP/1.1\r\nHost: {parts.hostname}:{parts.port}\r\n"
            f"Upgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(request.encode())
        response = b""
        while b"\r\n\r\n" not in response:
            chunk = self.sock.recv(4096)
            if not chunk:
                raise ConnectionError("Chrome closed the connection during the handshake")
            response += chunk
        if b" 101 " not in response.split(b"\r\n", 1)[0]:
            raise ConnectionError(response[:200].decode("latin1"))
        self.buffer = response.split(b"\r\n\r\n", 1)[1]
        self.fragments = b""

    def send(self, text):
        payload = text.encode()
        header = bytearray([0x81])
        length = len(payload)
        if length < 126:
            header.append(0x80 | length)
        elif length < 65536:
            header.append(0x80 | 126)
            header += struct.pack(">H", length)
        else:
            header.append(0x80 | 127)
            header += struct.pack(">Q", length)
        mask = os.urandom(4)
        header += mask
        self.sock.sendall(bytes(header) + bytes(b ^ mask[i % 4] for i, b in enumerate(payload)))

    def _send_pong(self, payload):
        mask = os.urandom(4)
        masked = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
        self.sock.sendall(bytes([0x8A, 0x80 | len(payload)]) + mask + masked)

    def _frame(self):
        """One complete frame from the buffer, or None. Nothing is consumed until it is complete."""
        data = self.buffer
        if len(data) < 2:
            return None
        first, second = data[0], data[1]
        length = second & 0x7F
        offset = 2
        if length == 126:
            if len(data) < 4:
                return None
            length = struct.unpack(">H", data[2:4])[0]
            offset = 4
        elif length == 127:
            if len(data) < 10:
                return None
            length = struct.unpack(">Q", data[2:10])[0]
            offset = 10
        if len(data) < offset + length:
            return None
        self.buffer = data[offset + length:]
        return first, data[offset:offset + length]

    def recv(self, timeout):
        """The next whole message. A timeout leaves partly received data in the buffer."""
        self.sock.settimeout(max(timeout, 0.001))
        while True:
            frame = self._frame()
            if frame is None:
                chunk = self.sock.recv(1 << 20)
                if not chunk:
                    raise ConnectionError("Chrome closed the connection")
                self.buffer += chunk
                continue
            first, payload = frame
            opcode = first & 0x0F
            if opcode == 0x8:
                raise ConnectionError("Chrome closed the connection")
            if opcode == 0x9:
                self._send_pong(payload)
                continue
            if opcode == 0xA:
                continue
            self.fragments += payload
            if first & 0x80:
                message, self.fragments = self.fragments, b""
                return message.decode("utf-8")

    def close(self):
        try:
            self.sock.close()
        except OSError:
            pass


def closed_port():
    """A port on this computer that nothing listens on, so a connection to it fails at once."""
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        return probe.getsockname()[1]


class Browser:
    """Chrome with a throwaway profile, removed again by close(), or straight away if Chrome doesn't start.

    With local_only, the default, Chrome can't reach any other computer: every name but localhost fails
    to resolve, and every address but this computer's goes to a proxy that isn't there. A test can still
    answer a request itself, as the Quick exit tests do for weather.gov, because that answer never leaves
    Chrome. So a mis-aimed click can never load a crisis service. Only tools/check_crisis_sources.py,
    which reads providers' pages on purpose, turns it off."""

    def __init__(self, chrome=None, local_only=True):
        self.chrome = chrome or find_chrome()
        if not self.chrome:
            raise RuntimeError("Google Chrome or Chromium was not found.")
        self.process = None
        self.ws = None
        self.profile = tempfile.mkdtemp(prefix="tidelight-chrome-")
        try:
            self._start(local_only)
        except BaseException:
            self._stop()
            raise
        self.next_id = 0
        self.events = []

    def _start(self, local_only):
        # GitHub's Linux runners don't allow Chrome's sandbox. Nothing else should set this.
        sandbox = ["--no-sandbox"] if os.environ.get("TIDELIGHT_CHROME_NO_SANDBOX") else []
        offline = [
            "--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE localhost , EXCLUDE 127.0.0.1",
            f"--proxy-server=http://127.0.0.1:{closed_port()}",
        ] if local_only else []
        self.process = subprocess.Popen(
            [
                self.chrome,
                *sandbox,
                *offline,
                "--headless=new",
                "--remote-debugging-port=0",
                f"--user-data-dir={self.profile}",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-extensions",
                "--disable-sync",
                "--disable-component-update",
                "--disable-background-networking",
                "--disable-default-apps",
                "--hide-scrollbars",
                "about:blank",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        port_file = pathlib.Path(self.profile) / "DevToolsActivePort"
        for _ in range(300):
            if port_file.exists() and len(port_file.read_text().splitlines()) >= 2:
                break
            if self.process.poll() is not None:
                raise RuntimeError("Chrome stopped while starting.")
            time.sleep(0.1)
        else:
            raise RuntimeError("Chrome did not start in time.")
        port, path = port_file.read_text().splitlines()[:2]
        self.ws = WebSocket(f"ws://127.0.0.1:{port}{path}")

    def _stop(self):
        """Stops Chrome, however far it got, and removes its profile."""
        if self.ws:
            self.ws.close()
        if self.process and self.process.poll() is None:
            self.process.kill()
            try:
                self.process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                pass
        shutil.rmtree(self.profile, ignore_errors=True)

    def call(self, method, params=None, session=None, timeout=60):
        self.next_id += 1
        message = {"id": self.next_id, "method": method, "params": params or {}}
        if session:
            message["sessionId"] = session
        self.ws.send(json.dumps(message))
        deadline = time.time() + timeout
        while True:
            left = deadline - time.time()
            if left <= 0:
                raise TimeoutError(f"{method} took longer than {timeout}s")
            incoming = json.loads(self.ws.recv(left))
            if incoming.get("id") == self.next_id:
                if "error" in incoming:
                    raise RuntimeError(f"{method}: {incoming['error'].get('message')}")
                return incoming.get("result", {})
            if "method" in incoming:
                self.events.append(incoming)

    def pump(self, seconds):
        """Collect events for a while."""
        deadline = time.time() + seconds
        while True:
            left = deadline - time.time()
            if left <= 0:
                return
            try:
                incoming = json.loads(self.ws.recv(left))
            except (socket.timeout, TimeoutError):
                return
            if "method" in incoming:
                self.events.append(incoming)

    def wait_for(self, method, session=None, timeout=30, match=None):
        """Wait for an event, from those already collected or new ones."""
        deadline = time.time() + timeout
        while True:
            for index, event in enumerate(self.events):
                if event["method"] == method and (session is None or event.get("sessionId") == session):
                    if match is None or match(event.get("params", {})):
                        return self.events.pop(index)
            left = deadline - time.time()
            if left <= 0:
                raise TimeoutError(f"no {method} within {timeout}s")
            try:
                incoming = json.loads(self.ws.recv(left))
            except (socket.timeout, TimeoutError):
                continue
            if "method" in incoming:
                self.events.append(incoming)

    def close(self):
        try:
            self.call("Browser.close", timeout=5)
        except Exception:
            pass
        self.ws.close()
        try:
            self.process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            pass
        self._stop()


class Tab:
    """One browser tab with its own size, color scheme, and record of what went wrong."""

    def __init__(self, browser, width=390, height=844, mobile=True, scale=2, context=None):
        self.browser = browser
        params = {"url": "about:blank"}
        if context:
            params["browserContextId"] = context
        self.target = browser.call("Target.createTarget", params)["targetId"]
        self.session = browser.call("Target.attachToTarget", {"targetId": self.target, "flatten": True})["sessionId"]
        for domain in ("Page", "Runtime", "Network", "Log"):
            self.send(f"{domain}.enable")
        self.send("Page.setLifecycleEventsEnabled", {"enabled": True})
        # A background tab draws nothing, so media query changes and clicks would stall.
        self.send("Page.bringToFront")
        self.send("Emulation.setFocusEmulationEnabled", {"enabled": True})
        self.resize(width, height, mobile, scale)

    def send(self, method, params=None, timeout=60):
        return self.browser.call(method, params, self.session, timeout)

    def resize(self, width, height, mobile=True, scale=2):
        self.width, self.height, self.mobile = width, height, mobile
        self.send("Emulation.setDeviceMetricsOverride", {
            "width": width,
            "height": height,
            "deviceScaleFactor": scale,
            "mobile": mobile,
            "screenOrientation": {
                "type": "landscapePrimary" if width > height else "portraitPrimary",
                "angle": 90 if width > height else 0,
            },
        })
        self.send("Emulation.setTouchEmulationEnabled", {"enabled": mobile})

    def media(self, dark=False, reduced=False, media="", extra=None):
        features = [
            {"name": "prefers-color-scheme", "value": "dark" if dark else "light"},
            {"name": "prefers-reduced-motion", "value": "reduce" if reduced else "no-preference"},
        ]
        for name, value in (extra or {}).items():
            features.append({"name": name, "value": value})
        self.send("Emulation.setEmulatedMedia", {"media": media, "features": features})

    def clear_events(self):
        self.browser.events = [e for e in self.browser.events if e.get("sessionId") != self.session]

    def goto(self, url, timeout=30, settle=0.05):
        """Navigate and wait for the load event. Returns the HTTP status of the page itself."""
        self.clear_events()
        result = self.send("Page.navigate", {"url": url})
        if result.get("errorText"):
            return None
        if not result.get("loaderId"):  # only the #part changed, so no new page loads
            self.browser.pump(settle)
            return 200
        self.browser.wait_for("Page.loadEventFired", self.session, timeout)
        if settle:
            self.browser.pump(settle)
        status = None
        for event in self.browser.events:
            # Only the page itself. A frame inside a page is a document too, and may answer differently.
            if (event.get("sessionId") == self.session and event["method"] == "Network.responseReceived"
                    and event["params"].get("type") == "Document" and event["params"].get("frameId") == result.get("frameId")):
                status = event["params"]["response"]["status"]
        return status

    def js(self, expression, timeout=60):
        result = self.send("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True,
            "awaitPromise": True,
            "userGesture": True,
        }, timeout)
        if "exceptionDetails" in result:
            details = result["exceptionDetails"]
            text = details.get("exception", {}).get("description") or details.get("text")
            raise RuntimeError(f"page script failed: {text}")
        return result["result"].get("value")

    def press(self, key, code=None, key_code=0, shift=False):
        common = {
            "key": key,
            "code": code or key,
            "windowsVirtualKeyCode": key_code,
            "nativeVirtualKeyCode": key_code,
            "modifiers": 8 if shift else 0,
        }
        self.send("Input.dispatchKeyEvent", dict(common, type="rawKeyDown"))
        self.send("Input.dispatchKeyEvent", dict(common, type="keyUp"))

    def tab_key(self, shift=False):
        self.press("Tab", "Tab", 9, shift)

    def click_at(self, x, y):
        for kind in ("mouseMoved", "mousePressed", "mouseReleased"):
            self.send("Input.dispatchMouseEvent", {
                "type": kind, "x": x, "y": y, "button": "left" if kind != "mouseMoved" else "none",
                "buttons": 1 if kind == "mousePressed" else 0, "clickCount": 1 if kind != "mouseMoved" else 0,
            })

    def click(self, selector):
        """A real mouse click at the middle of an element. Returns False if it isn't on screen."""
        box = self.js(f"""(function () {{
            var el = document.querySelector({json.dumps(selector)});
            if (!el) return null;
            el.scrollIntoView({{block: 'center', behavior: 'instant'}});
            var r = el.getBoundingClientRect();
            return {{x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}};
        }})()""")
        if not box or not box["w"] or not box["h"]:
            return False
        self.click_at(box["x"], box["y"])
        return True

    def screenshot(self, path, full_page=False):
        params = {"format": "png", "captureBeyondViewport": bool(full_page)}
        if full_page:
            size = self.send("Page.getLayoutMetrics")["cssContentSize"]
            params["clip"] = {"x": 0, "y": 0, "width": size["width"], "height": size["height"], "scale": 1}
        data = self.send("Page.captureScreenshot", params)["data"]
        pathlib.Path(path).write_bytes(base64.b64decode(data))

    def pdf(self, path, footer=None):
        params = {"printBackground": True, "preferCSSPageSize": True}
        if footer:
            params.update({"displayHeaderFooter": True, "headerTemplate": "<span></span>", "footerTemplate": footer})
        data = self.send("Page.printToPDF", params, timeout=180)["data"]
        pathlib.Path(path).write_bytes(base64.b64decode(data))

    def problems(self):
        """Console errors, script errors, and failed requests seen since the last goto."""
        found = []
        requests = {}
        for event in self.browser.events:
            if event.get("sessionId") != self.session:
                continue
            params = event["params"]
            method = event["method"]
            if method == "Runtime.exceptionThrown":
                details = params["exceptionDetails"]
                found.append("script error: " + (details.get("exception", {}).get("description") or details.get("text", "")))
            elif method == "Runtime.consoleAPICalled" and params["type"] in ("error", "warning", "assert"):
                found.append(f"console {params['type']}: " + " ".join(str(a.get("value", a.get("description", ""))) for a in params["args"]))
            elif method == "Log.entryAdded" and params["entry"]["level"] == "error":
                found.append("log error: " + params["entry"]["text"] + " " + params["entry"].get("url", ""))
            elif method == "Network.requestWillBeSent":
                requests[params["requestId"]] = params["request"]["url"]
            elif method == "Network.loadingFailed" and not params.get("canceled"):
                found.append(f"request failed: {requests.get(params['requestId'], '?')} ({params.get('errorText')})")
        return found

    def requested_urls(self):
        return [
            event["params"]["request"]["url"]
            for event in self.browser.events
            if event.get("sessionId") == self.session and event["method"] == "Network.requestWillBeSent"
        ]

    def close(self):
        try:
            self.browser.call("Target.closeTarget", {"targetId": self.target})
        except Exception:
            pass

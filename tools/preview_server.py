#!/usr/bin/env python3
"""Serves the website the way GitHub Pages will, for testing on this computer or a phone.

    python3 tools/preview_server.py               # this computer only
    python3 tools/preview_server.py --lan         # also phones on the same Wi-Fi
    python3 tools/preview_server.py --port 8123

The site appears under /suicideprevention/, like the real address. Only the files the
publish step copies are served, so notes and tools stay out, exactly as they will once
Pages publishes with GitHub Actions. A missing address gets 404.html with a 404 status.

It needs only Python 3 and sends nothing anywhere. Stop it with Control-C.
"""
import argparse
import http.server
import mimetypes
import pathlib
import re
import socket
import socketserver
import subprocess
import sys
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "/suicideprevention/"
# GitHub Pages takes its types from mime-db. These are the ones Python might get wrong.
TYPES = {
    ".vcf": "text/x-vcard",
    ".webmanifest": "application/manifest+json",
    ".js": "application/javascript",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
}


def published_items(root=ROOT):
    """The file and folder names the publish step copies, read from the workflow itself."""
    workflow = (root / ".github" / "workflows" / "site.yml").read_text(encoding="utf-8")
    match = re.search(r"for item in ([^;]+); do", workflow)
    if not match:
        raise SystemExit("Could not find the publish list in .github/workflows/site.yml")
    return match.group(1).split()


def make_handler(root, cache_control, log):
    allowed = set(published_items(root))

    class Handler(http.server.BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"
        server_version = "StillwaterPreview"
        sys_version = ""

        def log_message(self, format, *args):
            if log:
                sys.stderr.write("  %s %s\n" % (self.address_string(), format % args))

        def _send(self, status, body, content_type, head_only, extra=None):
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", cache_control)
            for key, value in (extra or {}).items():
                self.send_header(key, value)
            self.end_headers()
            if not head_only:
                self.wfile.write(body)

        def _not_found(self, head_only):
            body = (root / "404.html").read_bytes()
            self._send(404, body, TYPES[".html"], head_only)

        def _redirect(self, location, head_only):
            self._send(301, b"", "text/plain", head_only, {"Location": location})

        def _serve(self, head_only):
            path = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
            if path == "/" or path + "/" == BASE:
                return self._redirect(BASE, head_only)
            if not path.startswith(BASE):
                return self._not_found(head_only)
            relative = pathlib.PurePosixPath(path[len(BASE):])
            parts = [p for p in relative.parts if p not in (".", "")]
            if ".." in parts or (parts and parts[0] not in allowed):
                return self._not_found(head_only)
            target = root.joinpath(*parts) if parts else root
            if target.is_dir():
                if not path.endswith("/"):
                    return self._redirect(path + "/", head_only)
                target = target / "index.html"
            if not target.is_file():
                return self._not_found(head_only)
            suffix = target.suffix.lower()
            kind = TYPES.get(suffix) or mimetypes.guess_type(target.name)[0] or "application/octet-stream"
            self._send(200, target.read_bytes(), kind, head_only)

        def do_GET(self):
            self._serve(False)

        def do_HEAD(self):
            self._serve(True)

    return Handler


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def make_server(host="127.0.0.1", port=0, root=ROOT, cache_control="no-cache", log=False):
    """Used by tools/test_browser.py as well. Port 0 picks any free port."""
    return Server((host, port), make_handler(pathlib.Path(root), cache_control, log))


def lan_addresses():
    """This computer's addresses on the local network. VPN tunnels are skipped, since a phone can't use them."""
    found = []
    try:
        output = subprocess.run(["ifconfig"], capture_output=True, text=True, check=True).stdout
    except (OSError, subprocess.CalledProcessError):
        output = ""
    interface = ""
    for line in output.splitlines():
        if line and not line[0].isspace():
            interface = line.split(":", 1)[0]
        match = re.match(r"\s+inet (\d+\.\d+\.\d+\.\d+)", line)
        if match and re.match(r"(en|eth|wl)", interface) and re.match(r"(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)", match.group(1)):
            found.append(match.group(1))
    if found:
        return found
    probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # A UDP "connect" only picks a route. Nothing is sent.
        probe.connect(("10.255.255.255", 1))
        found.append(probe.getsockname()[0])
    except OSError:
        pass
    finally:
        probe.close()
    return [address for address in found if not address.startswith("127.")]


def main():
    parser = argparse.ArgumentParser(description="Serve the website the way GitHub Pages will.")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--lan", action="store_true", help="let phones on the same Wi-Fi open it")
    parser.add_argument("--quiet", action="store_true", help="don't print each request")
    args = parser.parse_args()

    host = "0.0.0.0" if args.lan else "127.0.0.1"
    server = make_server(host, args.port, log=not args.quiet)
    port = server.server_address[1]
    print(f"On this computer: http://localhost:{port}{BASE}")
    if args.lan:
        addresses = lan_addresses()
        for address in addresses:
            print(f"On a phone on the same Wi-Fi: http://{address}:{port}{BASE}")
        if not addresses:
            print("No Wi-Fi address found. Check that this computer is on a network.")
        print("If macOS asks whether to allow incoming connections, choose Allow.")
        print("If the phone can't connect, a VPN on either device may be blocking local traffic.")
        print("Offline support can't be tested this way: it needs HTTPS or localhost.")
    print("Press Control-C to stop.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

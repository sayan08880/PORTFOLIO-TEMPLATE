#!/usr/bin/env python3
"""
Portfolio local server
- Serves the portfolio folder
- Opens Admin + Index in the browser
- Public pages auto-update when you Save Changes in Admin
  (same browser, localStorage + storage event — no manual refresh)

Usage:
  python3 server.py
  python3 server.py 8080
"""

from __future__ import annotations

import http.server
import os
import socket
import socketserver
import sys
import threading
import time
import webbrowser

PORT = 8080
if len(sys.argv) > 1:
    try:
        PORT = int(sys.argv[1])
    except ValueError:
        print(f"Invalid port: {sys.argv[1]}")
        sys.exit(1)

# Serve from the directory that contains this script
ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # Keep logs short
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), format % args))

    def end_headers(self):
        # Helpful for local dev; avoid stale cached HTML/JS
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()


def port_free(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", port))
            return True
        except OSError:
            return False


def find_port(start: int) -> int:
    for p in range(start, start + 30):
        if port_free(p):
            return p
    raise RuntimeError("No free port found")


def open_browsers(base: str):
    # Small delay so the server is accepting connections
    time.sleep(0.6)
    webbrowser.open(f"{base}/index.html")
    time.sleep(0.25)
    webbrowser.open(f"{base}/admin.html")


def main():
    port = find_port(PORT)
    if port != PORT:
        print(f"Port {PORT} busy — using {port} instead.")

    handler = QuietHandler
    # Allow quick restart on some systems
    socketserver.TCPServer.allow_reuse_address = True

    with socketserver.TCPServer(("127.0.0.1", port), handler) as httpd:
        base = f"http://127.0.0.1:{port}"
        print("=" * 56)
        print("  Portfolio local server")
        print("=" * 56)
        print(f"  Portfolio : {base}/index.html")
        print(f"  Admin     : {base}/admin.html")
        print(f"  Password  : admin")
        print()
        print("  Save Changes in Admin → public pages update live")
        print("  (same browser, no manual refresh needed)")
        print()
        print("  Press Ctrl+C to stop")
        print("=" * 56)

        threading.Thread(target=open_browsers, args=(base,), daemon=True).start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == "__main__":
    main()

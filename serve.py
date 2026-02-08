#!/usr/bin/env python3
"""Project-local static server for this demo.

Always serves files from the repository root (the directory this script lives in),
so users don't need to worry about current working directory.
"""

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
import os


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve this repo as static files")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind (default: 8000)")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent
    index_path = repo_root / "index.html"
    if not index_path.exists():
        raise SystemExit(f"index.html not found: {index_path}")

    os.chdir(repo_root)
    server = ThreadingHTTPServer(("0.0.0.0", args.port), SimpleHTTPRequestHandler)
    print(f"Serving repo root: {repo_root}")
    print(f"Open: http://localhost:{args.port}/index.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()

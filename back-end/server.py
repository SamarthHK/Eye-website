import json
import os
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "front-end"))
DATA_FILE = os.path.join(BASE_DIR, "submissions.json")

print(f"Serving frontend from: {FRONTEND_DIR}")

# Create submissions.json if missing
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)


def load_submissions():
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_submissions(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"  {self.command} {self.path}")

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = urllib.parse.unquote(parsed.path)

        # Redirect root to the actual front page path so relative URLs work too
        if path == "/" or path == "":
            self.send_response(302)
            self.send_header("Location", "/front-end/front-page/index.html")
            self.end_headers()
            return

        # API
        if path == "/api/submissions":
            data = load_submissions()
            body = json.dumps(data).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(body)
            return

        # Strip leading /front-end/ if the browser sends it
        if path.startswith("/front-end/"):
            path = path[len("/front-end"):]

        # Build absolute file path
        file_path = os.path.abspath(os.path.join(FRONTEND_DIR, path.lstrip("/")))

        # Security: must stay inside FRONTEND_DIR
        if not file_path.startswith(FRONTEND_DIR):
            self.send_response(403)
            self.end_headers()
            self.wfile.write(b"403 Forbidden")
            return

        # Directory -> try index.html inside it
        if os.path.isdir(file_path):
            file_path = os.path.join(file_path, "index.html")

        if not os.path.isfile(file_path):
            print(f"  404 -> {file_path}")
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")
            return

        ext = os.path.splitext(file_path)[1].lower()
        mime = MIME_TYPES.get(ext, "application/octet-stream")

        with open(file_path, "rb") as f:
            content = f.read()

        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(content)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(content)

    def do_POST(self):
        if self.path == "/api/submit":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                payload = json.loads(body)
                name = str(payload.get("name", "")).strip()
                vision = str(payload.get("vision", "")).strip()

                if not name or not vision:
                    raise ValueError("Missing name or vision")

                submissions = load_submissions()
                submissions.append({"name": name, "vision": vision})
                save_submissions(submissions)

                resp = json.dumps({"ok": True}).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(resp)))
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(resp)

            except Exception as e:
                resp = json.dumps({"ok": False, "error": str(e)}).encode()
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(resp)))
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(resp)
        else:
            self.send_response(404)
            self.end_headers()


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8080), Handler)
    print("─────────────────────────────────────")
    print(" Eye Test Server")
    print(" http://localhost:8080")
    print("─────────────────────────────────────")
    server.serve_forever()
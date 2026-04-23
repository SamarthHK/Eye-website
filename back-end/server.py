import http.server
import json
import os
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler

DATA_FILE = os.path.join(os.path.dirname(__file__), "submissions.json")
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "front-end")

# Create submissions.json if it doesn't exist
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)


def load_submissions():
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_submissions(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


class Handler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        print(f"[{self.address_string()}] {format % args}")

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
        path   = parsed.path

        # API: get all submissions
        if path == "/api/submissions":
            data = load_submissions()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(data).encode())
            return

        # Serve front-end files
        # Root → front-page
        if path == "/" or path == "":
            path = "/front-page/index.html"

        file_path = os.path.normpath(os.path.join(FRONTEND_DIR, path.lstrip("/")))

        # Security: stay inside front-end dir
        if not file_path.startswith(os.path.normpath(FRONTEND_DIR)):
            self.send_response(403)
            self.end_headers()
            return

        if os.path.isdir(file_path):
            file_path = os.path.join(file_path, "index.html")

        if not os.path.exists(file_path):
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")
            return

        # MIME types
        ext = os.path.splitext(file_path)[1]
        mime = {
            ".html": "text/html",
            ".css":  "text/css",
            ".js":   "application/javascript",
            ".json": "application/json",
            ".png":  "image/png",
            ".jpg":  "image/jpeg",
            ".jpeg": "image/jpeg",
            ".ico":  "image/x-icon",
        }.get(ext, "application/octet-stream")

        with open(file_path, "rb") as f:
            content = f.read()

        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(content)

    def do_POST(self):
        if self.path == "/api/submit":
            length  = int(self.headers.get("Content-Length", 0))
            body    = self.rfile.read(length)

            try:
                payload = json.loads(body)
                name    = str(payload.get("name", "")).strip()
                vision  = str(payload.get("vision", "")).strip()

                if not name or not vision:
                    raise ValueError("Missing fields")

                submissions = load_submissions()
                submissions.append({"name": name, "vision": vision})
                save_submissions(submissions)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True}).encode())

            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"ok": False, "error": str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8080), Handler)
    print("Server running on http://0.0.0.0:8080")
    server.serve_forever()
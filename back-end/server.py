import json
import os
import urllib.parse
import threading
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'front-end'))
DATA_FILE = os.path.join(BASE_DIR, 'submissions.json')
LOCK = threading.Lock()

if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump([], f)

MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
    '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf'
}


def load_submissions():
    with LOCK:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)


def save_submissions(data):
    with LOCK:
        tmp = DATA_FILE + '.tmp'
        with open(tmp, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)
        os.replace(tmp, DATA_FILE)


class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_message(self, fmt, *args):
        print(f'{self.command} {self.path}')

    def cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def send_bytes(self, status, body, content_type='text/plain; charset=utf-8', cache=False):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        if cache:
            self.send_header('Cache-Control', 'public, max-age=3600')
        self.cors()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.cors()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = urllib.parse.unquote(parsed.path)

        if path in ('', '/'):
            self.send_response(302)
            self.send_header('Location', '/front-end/front-page/index.html')
            self.end_headers()
            return

        if path == '/api/submissions':
            body = json.dumps(load_submissions()).encode('utf-8')
            self.send_bytes(200, body, 'application/json; charset=utf-8', False)
            return

        if path.startswith('/front-end/'):
            path = path[len('/front-end'):]

        file_path = os.path.abspath(os.path.join(FRONTEND_DIR, path.lstrip('/')))
        if not file_path.startswith(FRONTEND_DIR):
            self.send_bytes(403, b'403 Forbidden')
            return

        if os.path.isdir(file_path):
            file_path = os.path.join(file_path, 'index.html')

        if not os.path.isfile(file_path):
            self.send_bytes(404, b'404 Not Found')
            return

        ext = os.path.splitext(file_path)[1].lower()
        mime = MIME_TYPES.get(ext, 'application/octet-stream')
        size = os.path.getsize(file_path)

        self.send_response(200)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(size))
        self.send_header('Cache-Control', 'public, max-age=3600')
        self.cors()
        self.end_headers()

        with open(file_path, 'rb') as f:
            while True:
                chunk = f.read(65536)
                if not chunk:
                    break
                self.wfile.write(chunk)

    def do_POST(self):
        if self.path != '/api/submit':
            self.send_bytes(404, b'404 Not Found')
            return

        try:
            length = int(self.headers.get('Content-Length', 0))
            raw = self.rfile.read(length)
            payload = json.loads(raw)
            name = str(payload.get('name', '')).strip()
            vision = str(payload.get('vision', '')).strip()

            if not name or not vision:
                raise ValueError('Missing name or vision')

            data = load_submissions()
            data.append({'name': name, 'vision': vision})
            save_submissions(data)

            body = json.dumps({'ok': True}).encode('utf-8')
            self.send_bytes(200, body, 'application/json; charset=utf-8')
        except Exception as e:
            body = json.dumps({'ok': False, 'error': str(e)}).encode('utf-8')
            self.send_bytes(400, body, 'application/json; charset=utf-8')


if __name__ == '__main__':
    server = ThreadingHTTPServer(('0.0.0.0', 8080), Handler)
    print('Optimized server running at http://localhost:8080')
    server.serve_forever()

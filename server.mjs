// Serves dist/. No dependencies. Works on any host that runs Node and sets
// PORT (Railway, Render, Fly, a VPS). Files are small, so they are read
// into memory once and gzipped up front.
//
// For agents: GET / with "Accept: text/markdown" returns the page as
// Markdown, and every response to / says so with Link and Vary headers.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const root = 'dist';
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
};

const files = new Map();
for (const rel of fs.readdirSync(root, { recursive: true })) {
  const full = path.join(root, rel);
  if (fs.statSync(full).isDirectory()) continue;
  const body = fs.readFileSync(full);
  const type = TYPES[path.extname(rel)] || 'application/octet-stream';
  files.set('/' + rel.split(path.sep).join('/'), {
    body, type,
    gzip: type.startsWith('image/png') ? null : zlib.gzipSync(body, { level: 9 }),
    etag: '"' + crypto.createHash('sha1').update(body).digest('hex').slice(0, 16) + '"',
  });
}

const LINK = '</index.md>; rel="alternate"; type="text/markdown", ' +
  '</llms.txt>; rel="alternate"; type="text/plain"; title="llms.txt"';

function headersFor(url, file) {
  const h = {
    'Content-Type': file.type,
    'ETag': file.etag,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': url.startsWith('/img/') || url === '/favicon.svg'
      ? 'public, max-age=86400, stale-while-revalidate=604800'
      : 'public, max-age=300',
  };
  if (/\.(md|txt)$/.test(url)) h['Access-Control-Allow-Origin'] = '*';
  if (url.startsWith('/play/')) h['X-Robots-Tag'] = 'noindex';
  return h;
}

function send(req, res, status, headers, file) {
  if (req.headers['if-none-match'] === file.etag) {
    res.writeHead(304, headers); return res.end();
  }
  let body = file.body;
  if (file.gzip && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    body = file.gzip; headers['Content-Encoding'] = 'gzip';
  }
  if (file.gzip) headers['Vary'] = headers['Vary'] ? headers['Vary'] + ', Accept-Encoding' : 'Accept-Encoding';
  headers['Content-Length'] = body.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
}

http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end();
  }
  let url;
  try { url = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
  catch { res.writeHead(400); return res.end(); }

  if (url === '/' || url === '/index.html') {
    const wantsMd = /text\/markdown/i.test(req.headers.accept || '');
    const key = wantsMd ? '/index.md' : '/index.html';
    const file = files.get(key);
    const h = headersFor(key, file);
    h['Vary'] = 'Accept'; h['Link'] = LINK;
    return send(req, res, 200, h, file);
  }
  if (url.length > 1 && url.endsWith('/')) {          // /docs/ -> /docs
    res.writeHead(308, { Location: url.replace(/\/+$/, '') }); return res.end();
  }
  const file = files.get(url);
  if (file) return send(req, res, 200, headersFor(url, file), file);

  const body = Buffer.from('404: not found. Start at / or /llms.txt\n');
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': body.length });
  res.end(req.method === 'HEAD' ? undefined : body);
}).listen(process.env.PORT || 3000, '0.0.0.0', function () {
  console.log(`serving ${files.size} files on port ${this.address().port}`);
});

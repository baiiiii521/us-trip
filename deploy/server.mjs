// 自托管服务：提供 dist 静态文件，并用本地文件实现 /api/sync（两人云同步，只存密文）。
// 运行：node deploy/server.mjs        环境变量：PORT（默认 8080）、DATA_DIR（默认 ./data）、DIST（默认 ./dist）
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handle } from '../api/sync.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.env.DIST || path.join(root, 'dist'));
const DATA = path.resolve(process.env.DATA_DIR || path.join(root, 'data'));
const PORT = Number(process.env.PORT || 8080);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.mp4': 'video/mp4' };

const store = {
  get: async (k) => { try { return await fs.readFile(path.join(DATA, k.replace(/[^a-z0-9:]/gi, '_') + '.json'), 'utf8'); } catch { return null; } },
  set: async (k, v) => { await fs.mkdir(DATA, { recursive: true }); await fs.writeFile(path.join(DATA, k.replace(/[^a-z0-9:]/gi, '_') + '.json'), v); }
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/sync') {
    let body = '';
    if (req.method === 'PUT') { for await (const c of req) { body += c; if (body.length > 400000) break; } }
    const out = await handle({ method: req.method, id: url.searchParams.get('id'), body }, store).catch(() => ({ status: 502, json: { error: 'storage' } }));
    res.writeHead(out.status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); return res.end(JSON.stringify(out.json));
  }
  let file = path.normalize(path.join(DIST, decodeURIComponent(url.pathname)));
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  try { if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html'); } catch { file = path.join(DIST, 'index.html'); }
  try {
    const buf = await fs.readFile(file);
    const hashed = /\/assets\//.test(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': hashed ? 'public, max-age=31536000, immutable' : file.endsWith('sw.js') || file.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600' });
    res.end(buf);
  } catch { res.writeHead(404); res.end('not found'); }
}).listen(PORT, () => console.log(`us-trip on http://localhost:${PORT}  (data: ${DATA})`));

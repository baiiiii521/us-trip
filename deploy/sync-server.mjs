// 两人云同步的存储服务（替代 Vercel KV）。
// 只存客户端加密后的密文 {iv, ct}，按房间 id（客户端算的 SHA-256）存文件，服务端解不开内容。
// 接口与 api/sync.js 一致：GET /api/sync?id=<64hex> → 200 {iv,ct} / 404；PUT 同上 → {ok:true}
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const PORT = Number(process.env.PORT || 8796);
const DIR = process.env.DATA_DIR || '/var/lib/us-trip-sync';
const MAX = 300 * 1024;          // 单房间上限，跟 api/sync.js 一致
const TTL_MS = 120 * 86400 * 1000; // 120 天没动就清掉

const fileFor = (id) => path.join(DIR, id + '.json');

async function sweep() {
  try {
    const files = await fs.readdir(DIR);
    const now = Date.now();
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const p = path.join(DIR, f);
      const st = await fs.stat(p).catch(() => null);
      if (st && now - st.mtimeMs > TTL_MS) await fs.unlink(p).catch(() => {});
    }
  } catch (e) { /* 目录还没建好之类，忽略 */ }
}

function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname !== '/api/sync') return send(res, 404, { error: 'not found' });
  if (req.method === 'OPTIONS') { res.writeHead(204, { Allow: 'GET, PUT, OPTIONS' }); return res.end(); }

  const id = url.searchParams.get('id') || '';
  if (!/^[a-f0-9]{64}$/.test(id)) return send(res, 400, { error: 'bad id' });

  const file = fileFor(id);

  if (req.method === 'GET') {
    try {
      const raw = await fs.readFile(file, 'utf8');
      const st = await fs.stat(file);
      if (Date.now() - st.mtimeMs > TTL_MS) { await fs.unlink(file).catch(() => {}); return send(res, 404, { error: 'empty' }); }
      const { iv, ct } = JSON.parse(raw);
      return send(res, 200, { iv, ct });
    } catch (e) {
      return send(res, 404, { error: 'empty' });
    }
  }

  if (req.method === 'PUT') {
    let size = 0;
    const chunks = [];
    let tooBig = false;
    for await (const c of req) {
      size += c.length;
      if (size > MAX) { tooBig = true; break; }
      chunks.push(c);
    }
    if (tooBig) return send(res, 413, { error: 'too large' });
    let parsed;
    try { parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (e) { return send(res, 400, { error: 'bad json' }); }
    if (typeof parsed?.iv !== 'string' || typeof parsed?.ct !== 'string') return send(res, 400, { error: 'bad body' });
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(file, JSON.stringify({ iv: parsed.iv, ct: parsed.ct }), { mode: 0o600 });
    return send(res, 200, { ok: true });
  }

  return send(res, 405, { error: 'method' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`us-trip-sync listening on 127.0.0.1:${PORT}, data=${DIR}`);
});
setInterval(sweep, 6 * 3600 * 1000).unref();
sweep();

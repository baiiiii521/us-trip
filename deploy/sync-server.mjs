// 两人云同步的存储服务（替代 Vercel KV）。
// 只存客户端加密后的密文 {iv, ct}，按房间 id（客户端算的 SHA-256）存文件，服务端解不开内容。
// 接口与 api/sync.js 一致：GET /api/sync?id=<64hex> → 200 {iv,ct} / 404；PUT 同上 → {ok:true}
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

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
      if (!f.endsWith('.json') || f === 'vault.enc.json') continue;
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

// ── 证件和订单保险箱 ──
// POST /api/vault {proof} → 200 {v,salt,iter,iv,ct}（密文）/ 403 密码不对 / 429 试太多 / 404 还没上传
// 文件 DATA_DIR/vault.enc.json 由发版脚本上传；服务端只能比对“密码证明”，解不开内容。
// 防猜：同一 IP 15 分钟内错 5 次锁 15 分钟；全站 1 小时内错 20 次锁 1 小时（6 位数字密码靠这个挡住穷举）。
const VAULT_FILE = path.join(DIR, 'vault.enc.json');
const ipFails = new Map();
let globalFails = [];
let globalLockUntil = 0;

function clientIp(req) {
  return String(req.headers['x-real-ip'] || req.socket.remoteAddress || '');
}

function sameHex(a, b) {
  const x = Buffer.from(String(a), 'utf8');
  const y = Buffer.from(String(b), 'utf8');
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

async function readBody(req, max) {
  let size = 0;
  const chunks = [];
  let over = false;
  for await (const c of req) { size += c.length; if (size > max) { over = true; continue; } chunks.push(c); }
  if (over) return null;
  return Buffer.concat(chunks).toString('utf8');
}

// 读请求体、比对密码证明、记错误次数。通过返回 { body, box }，不通过时已经回了错误码，返回 null
async function authorize(req, res, maxBody) {
  if (req.method !== 'POST') { send(res, 405, { error: 'method' }); return null; }
  const now = Date.now();
  const ip = clientIp(req);
  const rec = ipFails.get(ip);
  if (now < globalLockUntil || (rec && rec.count >= 5 && now - rec.first < 15 * 60000)) { send(res, 429, { error: 'too many' }); return null; }
  const raw = await readBody(req, maxBody);
  if (raw == null) { send(res, 413, { error: 'too large' }); return null; }
  let body;
  try { body = JSON.parse(raw || '{}'); } catch (e) { send(res, 400, { error: 'bad json' }); return null; }
  const proof = String(body.proof || '');
  let box;
  try { box = JSON.parse(await fs.readFile(VAULT_FILE, 'utf8')); } catch (e) { send(res, 404, { error: 'empty' }); return null; }
  if (!/^[a-f0-9]{64}$/.test(proof)) { send(res, 400, { error: 'bad proof' }); return null; }
  if (!sameHex(proof, box.proof)) {
    const r = rec && now - rec.first < 15 * 60000 ? rec : { count: 0, first: now };
    r.count += 1; ipFails.set(ip, r);
    globalFails = globalFails.filter((t) => now - t < 3600000); globalFails.push(now);
    if (globalFails.length >= 20) globalLockUntil = now + 3600000;
    send(res, 403, { error: 'wrong' }); return null;
  }
  ipFails.delete(ip);
  return { body, box };
}

async function handleVault(req, res) {
  const ok = await authorize(req, res, 2048);
  if (!ok) return;
  const { v, salt, iter, iv, ct } = ok.box;
  return send(res, 200, { v, salt, iter, iv, ct });
}

// ── 手机上传的附件（2026-11-14）──
// POST /api/vault/files {proof, op}
//   op=list → {files:[{id, at, size, miv, mct}]}（文件名、类型在 mct 里，服务器解不开）
//   op=get {id} → {id, at, miv, mct, iv, ct}
//   op=put {miv, mct, iv, ct} → {ok, id}
//   op=del {id} → {ok}
// 内容在手机上用证件包密码加密，这里只存密文。存在 DATA_DIR/vault-files/<id>.json（不在 sweep 清理范围）。
const VF_DIR = path.join(DIR, 'vault-files');
const VF_MAX_BODY = 15 * 1024 * 1024;   // 单个文件约 10MB（base64 后约 13.4MB）
const VF_MAX_COUNT = 40;
const VF_MAX_TOTAL = 150 * 1024 * 1024;
const B64 = /^[A-Za-z0-9+/=]+$/;

async function vfList() {
  const names = await fs.readdir(VF_DIR).catch(() => []);
  const out = [];
  for (const n of names) {
    if (!/^[a-z0-9]{8,40}\.json$/.test(n)) continue;
    try {
      const r = JSON.parse(await fs.readFile(path.join(VF_DIR, n), 'utf8'));
      out.push({ id: r.id, at: r.at, size: r.ct.length, miv: r.miv, mct: r.mct });
    } catch (e) { /* 坏文件跳过 */ }
  }
  return out.sort((a, b) => a.at - b.at);
}

async function handleVaultFiles(req, res) {
  const ok = await authorize(req, res, VF_MAX_BODY);
  if (!ok) return;
  const b = ok.body;
  const idOk = (id) => typeof id === 'string' && /^[a-z0-9]{8,40}$/.test(id);
  if (b.op === 'list') return send(res, 200, { files: await vfList() });
  if (b.op === 'get') {
    if (!idOk(b.id)) return send(res, 400, { error: 'bad id' });
    try { return send(res, 200, JSON.parse(await fs.readFile(path.join(VF_DIR, b.id + '.json'), 'utf8'))); }
    catch (e) { return send(res, 404, { error: 'gone' }); }
  }
  if (b.op === 'del') {
    if (!idOk(b.id)) return send(res, 400, { error: 'bad id' });
    await fs.unlink(path.join(VF_DIR, b.id + '.json')).catch(() => {});
    return send(res, 200, { ok: true });
  }
  if (b.op === 'put') {
    for (const k of ['miv', 'mct', 'iv', 'ct']) if (typeof b[k] !== 'string' || !b[k] || !B64.test(b[k])) return send(res, 400, { error: 'bad body' });
    if (b.mct.length > 4096 || b.miv.length > 64 || b.iv.length > 64) return send(res, 400, { error: 'bad body' });
    const list = await vfList();
    if (list.length >= VF_MAX_COUNT) return send(res, 507, { error: 'too many files' });
    if (list.reduce((n, f) => n + f.size, 0) + b.ct.length > VF_MAX_TOTAL) return send(res, 507, { error: 'full' });
    const id = Date.now().toString(36) + crypto.randomBytes(6).toString('hex');
    await fs.mkdir(VF_DIR, { recursive: true, mode: 0o700 });
    await fs.writeFile(path.join(VF_DIR, id + '.json'), JSON.stringify({ id, at: Date.now(), miv: b.miv, mct: b.mct, iv: b.iv, ct: b.ct }), { mode: 0o600 });
    return send(res, 200, { ok: true, id });
  }
  return send(res, 400, { error: 'bad op' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/vault') return handleVault(req, res).catch(() => send(res, 500, { error: 'server' }));
  if (url.pathname === '/api/vault/files') return handleVaultFiles(req, res).catch(() => send(res, 500, { error: 'server' }));
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
setInterval(() => { const now = Date.now(); for (const [k, r] of ipFails) if (now - r.first > 15 * 60000) ipFails.delete(k); }, 15 * 60000).unref();
sweep();

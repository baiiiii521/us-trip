// Vercel 函数：两人云同步的存储。只存客户端加密后的密文（iv + ct），按房间 id（SHA-256）存取。
// 需要在 Vercel 项目里接一个 KV / Upstash Redis，环境变量：
//   KV_REST_API_URL 和 KV_REST_API_TOKEN（Vercel KV 自动注入），或 UPSTASH_REDIS_REST_URL 和 UPSTASH_REDIS_REST_TOKEN
// 没配置时返回 501，网页会提示改用同步码。
const MAX = 300 * 1024; // 单个房间最多 300KB
const TTL_DAYS = 120;

function env() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

// 可替换的存储（测试时传入内存版）
export function redisStore(cfg, fetchImpl = fetch) {
  const call = async (cmd) => {
    const r = await fetchImpl(cfg.url, { method: 'POST', headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
    if (!r.ok) throw new Error('kv ' + r.status);
    return (await r.json()).result;
  };
  return {
    get: (k) => call(['GET', k]),
    set: (k, v) => call(['SET', k, v, 'EX', String(TTL_DAYS * 86400)])
  };
}

export async function handle({ method, id, body }, store) {
  if (!store) return { status: 501, json: { error: 'not configured' } };
  if (!/^[a-f0-9]{64}$/.test(id || '')) return { status: 400, json: { error: 'bad id' } };
  const key = 'hoops:' + id;
  if (method === 'GET') {
    const v = await store.get(key);
    return v ? { status: 200, json: JSON.parse(v) } : { status: 404, json: { error: 'empty' } };
  }
  if (method === 'PUT') {
    const s = typeof body === 'string' ? body : JSON.stringify(body || {});
    if (s.length > MAX) return { status: 413, json: { error: 'too large' } };
    let parsed; try { parsed = JSON.parse(s); } catch (e) { return { status: 400, json: { error: 'bad json' } }; }
    if (typeof parsed.iv !== 'string' || typeof parsed.ct !== 'string') return { status: 400, json: { error: 'bad body' } };
    await store.set(key, JSON.stringify({ iv: parsed.iv, ct: parsed.ct }));
    return { status: 200, json: { ok: true } };
  }
  return { status: 405, json: { error: 'method' } };
}

export default async function handler(req, res) {
  const cfg = env();
  const id = (req.query && req.query.id) || new URL(req.url, 'http://x').searchParams.get('id');
  let body = req.body;
  if (req.method === 'PUT' && body == null) {
    body = await new Promise((resolve) => { let s = ''; req.on('data', (c) => { s += c; }); req.on('end', () => resolve(s)); });
  }
  try {
    const out = await handle({ method: req.method, id, body }, cfg ? redisStore(cfg) : null);
    res.status(out.status).setHeader('Cache-Control', 'no-store').json(out.json);
  } catch (e) {
    res.status(502).json({ error: 'storage' });
  }
}

// 两人同步。可同步的数据（清单、打卡、记账、订单文字、酒店、座位、名字）每条都带更新时间 u，
// 合并时每条取较新的一份（删除也是一条带时间的记录）。照片和附件不同步。
// 两种方式：
//   1. 同步码：把数据压缩成一段文字，发给同伴，对方粘贴导入（不需要服务器）
//   2. 云同步：部署到 Vercel 并配置 KV 后可用。房间名 + 口令在本机加密（AES-GCM），服务器只存密文
export const SYNC_KEYS = ['todo', 'visited', 'expenses', 'wallet', 'hotels', 'seats', 'people'];

export function syncDoc(state) {
  return Object.fromEntries(SYNC_KEYS.map((k) => [k, state[k] || {}]));
}

// 合并两份文档：每个集合里每个 key 取 u 较大的
export function mergeDocs(a, b) {
  const out = {};
  for (const k of SYNC_KEYS) {
    const A = (a && a[k]) || {}, B = (b && b[k]) || {};
    const m = { ...A };
    for (const [id, v] of Object.entries(B)) {
      if (!m[id] || ((v && v.u) || 0) > ((m[id] && m[id].u) || 0)) m[id] = v;
    }
    out[k] = m;
  }
  return out;
}

// —— 同步码（deflate + base64url）——
const b64u = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

async function pipe(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}

export async function encodeShare(doc) {
  const raw = new TextEncoder().encode(JSON.stringify(doc));
  const packed = typeof CompressionStream === 'function' ? await pipe(raw, new CompressionStream('deflate-raw')) : raw;
  let s = ''; for (let i = 0; i < packed.length; i += 8192) s += String.fromCharCode(...packed.subarray(i, i + 8192));
  const body = btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return (typeof CompressionStream === 'function' ? 'HOOPS1.' : 'HOOPS0.') + body;
}

export async function decodeShare(code) {
  const m = /^(HOOPS[01])\.([A-Za-z0-9_-]+)$/.exec(String(code || '').trim().replace(/\s+/g, ''));
  if (!m) throw new Error('同步码格式不对');
  const bytes = unb64u(m[2]);
  const raw = m[1] === 'HOOPS1' ? await pipe(bytes, new DecompressionStream('deflate-raw')) : bytes;
  return JSON.parse(new TextDecoder().decode(raw));
}
void b64u;

// —— 云同步（端到端加密）——
async function keyMaterial(room, pass) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('hoops:' + room), iterations: 150000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const idBuf = await crypto.subtle.digest('SHA-256', enc.encode(`hoops-room:${room}:${pass}`));
  const id = [...new Uint8Array(idBuf)].map((x) => x.toString(16).padStart(2, '0')).join('');
  return { key, id };
}

export async function encryptDoc(doc, room, pass) {
  const { key, id } = await keyMaterial(room, pass);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(doc))));
  const toB64 = (u) => { let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode(...u.subarray(i, i + 8192)); return btoa(s); };
  return { id, body: { iv: toB64(iv), ct: toB64(ct) } };
}

export async function decryptDoc(body, room, pass) {
  const { key } = await keyMaterial(room, pass);
  const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(body.iv) }, key, fromB64(body.ct));
  return JSON.parse(new TextDecoder().decode(pt));
}

// 拉取 → 合并 → 推送。返回合并后的文档。endpoint 默认 /api/sync
export async function cloudSync(localDoc, room, pass, endpoint = 'api/sync') {
  const { id } = await keyMaterial(room, pass);
  const res = await fetch(`${endpoint}?id=${id}`);
  if (res.status === 501) throw new Error('云同步还没在服务器上配置');
  if (res.ok && !/json/.test(res.headers.get('content-type') || '')) throw new Error('这个网址没有云同步服务（只有部署到 Vercel 并接上 KV 后才有）');
  if (!res.ok && res.status !== 404) throw new Error('服务器返回 ' + res.status);
  let merged = localDoc;
  if (res.ok) {
    const j = await res.json();
    if (j && j.ct) merged = mergeDocs(localDoc, await decryptDoc(j, room, pass));
  }
  const { body } = await encryptDoc(merged, room, pass);
  const put = await fetch(`${endpoint}?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!put.ok) throw new Error('上传失败 ' + put.status);
  return merged;
}

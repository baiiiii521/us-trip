// 证件和订单保险箱：护照号、PNR、票号、酒店确认号、行程单 PDF 等。
// - 内容在电脑上用密码加密（scripts/build-vault.mjs），服务器和网站上只有密文
// - 取密文要先交“密码证明”，服务器限制尝试次数（deploy/sync-server.mjs）
// - 解密只在手机浏览器里做；密文缓存在本机，没网也能打开
// 浏览器和 Node（WebCrypto）共用这一份代码。
const enc = new TextEncoder();
const dec = new TextDecoder();
export const KEY_ITER = 600000;
const PROOF_ITER = 200000;
const PROOF_SALT = 'hoops-vault-proof-v1';
const CACHE_KEY = 'hoops-vault-v1';

const toB64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode(...u8.subarray(i, i + 8192)); return btoa(s); };
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');

async function base(pin) {
  return crypto.subtle.importKey('raw', enc.encode(String(pin)), 'PBKDF2', false, ['deriveKey', 'deriveBits']);
}

// 给服务器看的“我知道密码”的证明（服务器只存这个值，存不了密码本身）
export async function vaultProof(pin) {
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(PROOF_SALT), iterations: PROOF_ITER, hash: 'SHA-256' }, await base(pin), 256);
  return hex(bits);
}

async function aesKey(pin, salt, iter) {
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, await base(pin), { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

// 电脑上加密：返回 { v, salt, iter, iv, ct, proof }
export async function sealVault(data, pin, iter = KEY_ITER) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await aesKey(pin, salt, iter);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(data))));
  return { v: 1, salt: toB64(salt), iter, iv: toB64(iv), ct: toB64(ct), proof: await vaultProof(pin) };
}

// 手机上解密：密码不对会抛错
export async function openVault(box, pin) {
  const key = await aesKey(pin, fromB64(box.salt), box.iter || KEY_ITER);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(box.iv) }, key, fromB64(box.ct));
  return JSON.parse(dec.decode(pt));
}

export function cachedVault() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (e) { return null; }
}
function cacheVault(box) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ...box, at: Date.now() })); } catch (e) { /* 存不下就算了 */ }
}
export function forgetVault() {
  try { localStorage.removeItem(CACHE_KEY); } catch (e) { /* 忽略 */ }
}

// 解锁：先问服务器要最新密文（顺便验证密码），没网就用本机缓存
export async function unlockVault(pin, endpoint = 'api/vault') {
  const proof = await vaultProof(pin);
  let box = null;
  let serverSaid = '';
  try {
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proof }) });
    if (res.ok && /json/.test(res.headers.get('content-type') || '')) { box = await res.json(); cacheVault(box); }
    else if (res.status === 403) serverSaid = 'wrong';
    else if (res.status === 429) serverSaid = 'locked';
    else if (res.status === 404) serverSaid = 'empty';
  } catch (e) { serverSaid = 'offline'; }
  if (serverSaid === 'wrong') throw new Error('密码不对');
  if (serverSaid === 'locked') throw new Error('尝试次数太多，服务器暂时锁住了，1 小时后再试；已经存在这台手机里的副本照样能打开');
  if (!box) box = cachedVault();
  if (!box) throw new Error(serverSaid === 'empty' ? '服务器上还没有上传内容（在电脑上运行一次发版脚本）' : '没连上网，这台手机上也还没有副本。先在有网的时候打开一次');
  try { return { data: await openVault(box, pin), from: serverSaid ? 'cache' : 'server', at: box.at || Date.now() }; }
  catch (e) { throw new Error('密码不对'); }
}

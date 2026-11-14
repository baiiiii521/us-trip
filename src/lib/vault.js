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

// ── 手机上传的附件 ──
// 每个附件两段密文：mct（文件名、类型、大小）和 ct（文件本身），都用证件包密码派生的同一把钥匙加密。
// 钥匙每次打开只算一次（60 万次 PBKDF2，手机上约 1 秒）。
const FILES_SALT = enc.encode('hoops-vault-files-v1');
const fileKeys = new Map();
function filesKey(pin, iter = KEY_ITER) {
  const k = iter + ':' + pin;
  if (!fileKeys.has(k)) fileKeys.set(k, aesKey(pin, FILES_SALT, iter));
  return fileKeys.get(k);
}
export function forgetFileKeys() { fileKeys.clear(); }

async function seal(key, bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes));
  return { iv: toB64(iv), ct: toB64(ct) };
}
async function unseal(key, iv, ct) {
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(iv) }, key, fromB64(ct)));
}

export const VAULT_FILE_MAX = 10 * 1024 * 1024;

// { name, type, bytes } → { miv, mct, iv, ct }
export async function sealVaultFile({ name, type, bytes }, pin, iter = KEY_ITER) {
  const key = await filesKey(pin, iter);
  const meta = await seal(key, enc.encode(JSON.stringify({ name: String(name || '附件'), type: String(type || 'application/octet-stream'), size: bytes.length })));
  const body = await seal(key, bytes);
  return { miv: meta.iv, mct: meta.ct, iv: body.iv, ct: body.ct };
}
export async function openVaultFileMeta(rec, pin, iter = KEY_ITER) {
  return JSON.parse(dec.decode(await unseal(await filesKey(pin, iter), rec.miv, rec.mct)));
}
export async function openVaultFileData(rec, pin, iter = KEY_ITER) {
  return unseal(await filesKey(pin, iter), rec.iv, rec.ct);
}

// 调服务器：op = list / get / put / del。出错时抛出中文说明
export async function vaultFilesCall(op, pin, extra = {}, endpoint = 'api/vault/files') {
  let res;
  try {
    res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proof: await vaultProof(pin), op, ...extra }) });
  } catch (e) { const err = new Error('没连上网'); err.offline = true; throw err; }
  if (res.ok) return res.json();
  const msg = { 403: '密码不对', 404: op === 'get' ? '这个附件已经被删了' : '服务器上还没有证件包', 413: '文件太大，单个最多 10MB', 429: '尝试次数太多，过一会儿再试', 507: '空间满了：最多 40 个附件、共 150MB，先删掉几个' }[res.status];
  throw new Error(msg || `服务器出错（${res.status}）`);
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

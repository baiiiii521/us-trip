#!/usr/bin/env node
// 把 private/itinerary.json 里的个人信息 + private/files/ 里的附件（行程单 PDF、酒店确认单截图等）
// 用查询密码加密成 private/vault.enc.json。发版脚本会把它传到服务器的数据目录（不在网站目录里）。
//   node scripts/build-vault.mjs
// 密码写在 private/itinerary.json 的 "pin" 字段，或者用环境变量 VAULT_PIN。
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { sealVault } from '../src/lib/vault.js';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'private/itinerary.json');
const FILES = join(ROOT, 'private/files');
const OUT = join(ROOT, 'private/vault.enc.json');
const MAX_FILE = 6 * 1024 * 1024;

if (!existsSync(SRC)) { console.log('没有 private/itinerary.json，跳过保险箱'); process.exit(0); }
const P = JSON.parse(readFileSync(SRC, 'utf8'));
const pin = process.env.VAULT_PIN || P.pin;
if (!pin) { console.error('缺查询密码：在 private/itinerary.json 加 "pin"，或设置 VAULT_PIN'); process.exit(1); }

const row = (label, value, note) => (value ? { label, value: String(value), note: note || '' } : null);
const sections = [];
sections.push({ title: '旅客和护照', rows: (P.travellers || []).map((t) => row(t.name, t.passport, '护照号')) });
sections.push({ title: '机票', rows: [
  row('回程 PNR（联合航空）', P.returnPnr, 'united.com 用 PNR + 姓查订单、选座、值机')
] });
sections.push({ title: '住宿', rows: [
  ...Object.entries(P.hotelRefs || {}).map(([k, v]) => row({ bos: '波士顿', dc: '华盛顿', phl: '费城', nyc: '纽约公寓', lic: 'LIC Hotel（原纽约订单）' }[k] || k, v)),
  row('纽约公寓房号', P.nycUnit, 'AVA Fort Greene, 343 Gold St, Brooklyn'),
  row('房东 / 公寓联系方式', P.nycContact)
] });
if (P.car) sections.push({ title: '租车', rows: Object.entries(P.car).map(([k, v]) => row(k, v)) });
for (const s of P.extraSections || []) sections.push({ title: s.title, rows: (s.rows || []).map((r) => row(r.label, r.value, r.note)) });
if (P.contact) sections.push({ title: '联系方式', rows: [row('邮箱', P.contact)] });

const TYPES = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.heic': 'image/heic', '.webp': 'image/webp' };
const files = [];
if (existsSync(FILES)) {
  for (const f of readdirSync(FILES).sort()) {
    const p = join(FILES, f);
    const type = TYPES[extname(f).toLowerCase()];
    if (!type || !statSync(p).isFile()) continue;
    const buf = readFileSync(p);
    if (buf.length > MAX_FILE) { console.warn(`跳过 ${f}：超过 6MB`); continue; }
    files.push({ name: basename(f), type, b64: buf.toString('base64') });
  }
}

const data = { builtAt: new Date().toISOString(), sections: sections.map((s) => ({ ...s, rows: s.rows.filter(Boolean) })).filter((s) => s.rows.length), files };
const box = await sealVault(data, pin);
writeFileSync(OUT, JSON.stringify(box), { mode: 0o600 });
console.log(`保险箱：${data.sections.length} 组、${data.files.length} 个附件 → private/vault.enc.json（${(JSON.stringify(box).length / 1024).toFixed(0)}KB，已加密）`);

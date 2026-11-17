#!/usr/bin/env node
// 把行程里出现的英文地址一次性换成经纬度，写进小程序共用层。
// 这样点一条行程就能直接 wx.openLocation 打开导航，而不是只能复制地址。
// 数据源：Photon（认店名）→ 美国人口普查局（认街道门牌，免费无 key）。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = ['src/data/days.js', 'src/data/hotels.js', 'src/data/drive.js', 'src/data/sos.js', 'src/data/games.js'];
const OUT = join(ROOT, 'miniprogram/shared/data/geo.js');
const CACHE = join(ROOT, '.cache/geocode.json');

const qs = new Set();
for (const f of SRC) {
  const s = readFileSync(join(ROOT, f), 'utf8');
  for (const m of s.matchAll(/q:\s*'([^']{6,140})'/g)) qs.add(m[1].trim());
  for (const m of s.matchAll(/addr:\s*'([^']{6,140})'/g)) qs.add(m[1].trim());
}

const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function photon(q) {
  const url = `https://photon.komoot.io/api/?limit=1&q=${encodeURIComponent(q)}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = await r.json();
  const f = (j.features || [])[0];
  if (!f || !f.geometry) return null;
  const [lng, lat] = f.geometry.coordinates;
  if (Math.abs(lat) > 80 || Math.abs(lng) > 180) return null;
  return [lat, lng];
}

async function census(q) {
  // 只给街道 + 城市 + 州，去掉店名/航站楼之类的修饰
  const parts = q.split(',').map((s) => s.trim());
  const street = parts.find((p) => /^\d+\s/.test(p)) || parts[0];
  const rest = parts.filter((p) => p !== street && p !== parts[0]).join(', ');
  const addr = rest ? `${street}, ${rest}` : q;
  const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(addr)}&benchmark=Public_AR_Current&format=json`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = await r.json();
  const m = j.result && j.result.addressMatches && j.result.addressMatches[0];
  if (!m) return null;
  return [m.coordinates.y, m.coordinates.x];
}

let hit = 0;
let miss = 0;
for (const q of [...qs].sort()) {
  if (cache[q]) {
    hit += 1;
    continue;
  }
  let ll = null;
  try {
    ll = await photon(q);
    if (!ll) ll = await census(q);
  } catch (e) {
    ll = null;
  }
  if (ll) {
    cache[q] = [Number(ll[0].toFixed(6)), Number(ll[1].toFixed(6))];
    hit += 1;
    console.log('✓', q.slice(0, 72));
  } else {
    miss += 1;
    console.log('✗', q.slice(0, 72));
  }
  await sleep(1100); // 两边都要求慢一点，别把接口打烦
}

writeFileSync(CACHE, JSON.stringify(cache, null, 1));
const body = Object.entries(cache)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([q, ll]) => `  ${JSON.stringify(q)}: [${ll[0]}, ${ll[1]}]`)
  .join(',\n');

writeFileSync(
  OUT,
  `// 生成物：node scripts/mp-geocode.mjs（地址 → 经纬度，供 wx.openLocation 用）\n// 不要手改；地址变了重跑脚本，缓存在家目录 .cache/geocode.json。\nexport const ADDR_LL = {\n${body}\n};\n\nexport const llOf = (q) => (q && ADDR_LL[String(q).trim()]) || null;\n`
);
console.log(`写入 ${OUT}｜命中 ${hit}｜未命中 ${miss}｜共 ${qs.size}`);

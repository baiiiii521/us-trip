#!/usr/bin/env node
// 首页和城市头图要的大图：维基缩略图接口只会给「它自己生成过的尺寸」，
// 手改宽度会 400，所以这里直接向接口要高分辨率的地址（1600 / 2200 宽）。
import { writeFileSync, existsSync, readFileSync } from 'node:fs';

const OUT = 'miniprogram/shared/data/heroes.js';
const CACHE = '.cache/heroes.json';

// [景点 id, 维基页面名]
const TARGETS = [
  ['brooklyn-bridge', 'Brooklyn_Bridge'],
  ['central-park', 'Central_Park'],
  ['times-square', 'Times_Square'],
  ['msg', 'Madison_Square_Garden'],
  ['public-garden', 'Boston_Public_Garden'],
  ['beacon-hill', 'Acorn_Street'],
  ['charging-bull', 'Charging_Bull'],
  ['uss-constitution', 'USS_Constitution'],
  ['grand-central', 'Grand_Central_Terminal'],
  ['bryant-park', 'Bryant_Park'],
  ['lincoln-memorial', 'Lincoln_Memorial'],
  ['liberty-bell', 'Liberty_Bell'],
  ['independence-hall', 'Independence_Hall'],
  ['capitol', 'United_States_Capitol'],
  ['white-house', 'White_House'],
  ['griffith', 'Griffith_Observatory'],
  ['santa-monica', 'Santa_Monica_Pier']
];

const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};

async function query(title, width) {
  const url =
    'https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages|imageinfo' +
    `&piprop=thumbnail&pithumbsize=${width}&iiprop=url|extmetadata&titles=${encodeURIComponent(title)}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'us-trip-mp/1.0 (personal travel app)' } });
  if (!r.ok) return null;
  const j = await r.json();
  const page = Object.values((j.query && j.query.pages) || {})[0];
  if (!page) return null;
  const src = page.thumbnail && page.thumbnail.source;
  if (!src) return null;
  const meta = (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].extmetadata) || {};
  const strip = (v) => String(v || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    src,
    credit: strip(meta.Artist && meta.Artist.value),
    license: strip(meta.LicenseShortName && meta.LicenseShortName.value)
  };
}

const out = {};
for (const [id, title] of TARGETS) {
  if (cache[id] && cache[id].src) {
    out[id] = cache[id];
    continue;
  }
  let hit = null;
  for (const w of [1600, 1200, 960]) {
    hit = await query(title, w);
    if (hit) break;
    await new Promise((r) => setTimeout(r, 600));
  }
  if (!hit) {
    console.log('✗', id, title);
    continue;
  }
  cache[id] = hit;
  out[id] = hit;
  console.log('✓', id, hit.src.split('/').pop().slice(0, 40), hit.license || '');
  await new Promise((r) => setTimeout(r, 700));
}

writeFileSync(CACHE, JSON.stringify(cache, null, 1));
const body = Object.entries(out)
  .map(([id, v]) => `  ${JSON.stringify(id)}: { src: ${JSON.stringify(v.src)}, credit: ${JSON.stringify(v.credit)}, license: ${JSON.stringify(v.license)} }`)
  .join(',\n');

writeFileSync(
  OUT,
  `// 生成物：node scripts/mp-heroes.mjs（大图，给封面和城市头图用；别再手改宽度，维基会 400）\nexport const HEROES = {\n${body}\n};\n\nexport const heroOf = (id) => HEROES[id] || null;\n`
);
console.log(`写入 ${OUT}，${Object.keys(out).length} 张`);

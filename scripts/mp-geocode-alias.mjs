#!/usr/bin/env node
// 行程正文里反复出现、但不在 68 个景点里的地名（街道、车站、服务区、校园）。
// 按别名匹配后给它们坐标，这样「走自由之路」「逛哈佛广场」这类条目也能点开导航。
// 只做一次：结果写进 shared/data/places.js，地址变了重跑。
import { writeFileSync, existsSync, readFileSync } from 'node:fs';

const OUT = 'miniprogram/shared/data/places.js';
const CACHE = '.cache/geocode-places.json';

// [正文里会出现的词, 地图查询]
const ALIASES = [
  ['哈佛广场', 'Harvard Square, Cambridge, MA'],
  ['Harvard Square', 'Harvard Square, Cambridge, MA'],
  ['自由之路', 'Freedom Trail, Boston, MA'],
  ['Boston Common', 'Boston Common, Boston, MA'],
  ['Newbury Street', 'Newbury Street, Boston, MA'],
  ['State 站', 'State Station, Boston, MA'],
  ['Park Street', 'Park Street Station, Boston, MA'],
  ['Pinocchio', "Pinocchio's Pizza & Subs, 74 Winthrop St, Cambridge, MA"],
  ['Milford 服务区', 'Milford Service Plaza, Milford, CT'],
  ['耶鲁', 'Yale University, New Haven, CT'],
  ['Yale', 'Yale University, New Haven, CT'],
  ['纽黑文', 'New Haven, CT'],
  ['第五大道', 'Fifth Avenue, New York, NY'],
  ['华尔街', 'Wall Street, New York, NY'],
  ['帝国大厦', 'Empire State Building, New York, NY'],
  ['自由钟', 'Liberty Bell, Philadelphia, PA'],
  ['独立厅', 'Independence Hall, Philadelphia, PA'],
  ['白宫', 'The White House, Washington, DC'],
  ['国会大厦', 'United States Capitol, Washington, DC'],
  ['方尖碑', 'Washington Monument, Washington, DC'],
  ['林肯纪念堂', 'Lincoln Memorial, Washington, DC'],
  ['航空航天博物馆', 'National Air and Space Museum, Washington, DC'],
  ['国家美术馆', 'National Gallery of Art, Washington, DC'],
  ['国会图书馆', 'Library of Congress, Washington, DC'],
  ['乔治城', 'Georgetown, Washington, DC'],
  ['雷丁市场', 'Reading Terminal Market, Philadelphia, PA'],
  ['费城艺术博物馆', 'Philadelphia Museum of Art, Philadelphia, PA'],
  ['市政厅', 'Philadelphia City Hall, Philadelphia, PA'],
  ['长木花园', 'Longwood Gardens, Kennett Square, PA'],
  ['时代广场', 'Times Square, New York, NY'],
  ['中央公园', 'Central Park, New York, NY'],
  ['高线', 'The High Line, New York, NY'],
  ['布鲁克林大桥', 'Brooklyn Bridge, New York, NY'],
  ['圣地亚哥', 'Santa Monica Pier, Santa Monica, CA'],
  ['好莱坞', 'Hollywood Sign, Los Angeles, CA'],
  ['格里菲斯', 'Griffith Observatory, Los Angeles, CA'],
  ['圣莫尼卡', 'Santa Monica Pier, Santa Monica, CA'],
  ['威尼斯海滩', 'Venice Beach, Los Angeles, CA'],
  ['比佛利', 'Beverly Hills, CA'],
  ['环球影城', 'Universal Studios Hollywood, Universal City, CA']
];

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
  return [Number(lat.toFixed(6)), Number(lng.toFixed(6))];
}

const rows = [];
for (const [alias, query] of ALIASES) {
  if (!cache[query]) {
    const ll = await photon(query);
    if (!ll) {
      console.log('✗', query);
      continue;
    }
    cache[query] = ll;
    console.log('✓', query);
    await sleep(1100);
  }
  rows.push({ alias, query, ll: cache[query] });
}

writeFileSync(CACHE, JSON.stringify(cache, null, 1));
const body = rows
  .map((r) => `  { alias: ${JSON.stringify(r.alias)}, name: ${JSON.stringify(r.query.split(',')[0])}, ll: [${r.ll[0]}, ${r.ll[1]}] }`)
  .join(',\n');

writeFileSync(
  OUT,
  `// 生成物：node scripts/mp-geocode-alias.mjs\n// 正文里常见地名 → 坐标，补 68 个景点覆盖不到的地方。\nexport const PLACE_ALIASES = [\n${body}\n];\n`
);
console.log(`写入 ${OUT}，共 ${rows.length} 条`);

// ⚠️ 生成文件，不要手改。源头：src/lib/index.js
// 由 scripts/mp-sync-shared.mjs 生成；改内容请改 src/ 下那份，然后跑 node scripts/mp-sync-shared.mjs
// 行程索引：景点出现在哪几天
export function poiAppearances(days) {
  const map = {};
  for (const d of days) {
    for (const it of d.items) {
      for (const id of it.pois || []) {
        map[id] = map[id] || [];
        if (!map[id].includes(d)) map[id].push(d);
      }
    }
  }
  return map;
}

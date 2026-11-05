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

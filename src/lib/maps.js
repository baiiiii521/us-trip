// 导航链接：Google 地图 / Apple 地图。默认公共交通路线。
const enc = encodeURIComponent;

export const NAV_APPS = {
  google: 'Google 地图',
  apple: 'Apple 地图'
};

// 打开地点
export function placeUrl(q, app = 'google') {
  if (app === 'apple') return `https://maps.apple.com/?q=${enc(q)}`;
  return `https://www.google.com/maps/search/?api=1&query=${enc(q)}`;
}

// 从当前位置导航过去（公交）
export function directionsUrl(q, app = 'google', mode = 'transit') {
  if (app === 'apple') {
    const flag = { transit: 'r', walking: 'w', driving: 'd' }[mode] || 'r';
    return `https://maps.apple.com/?daddr=${enc(q)}&dirflg=${flag}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${enc(q)}&travelmode=${mode}`;
}

// 当天路线：按顺序串起多个地点（Google 支持途经点，用步行模式；Apple 不支持途经点）
export function routeUrl(queries) {
  const qs = queries.filter(Boolean);
  if (qs.length === 0) return null;
  if (qs.length === 1) return directionsUrl(qs[0], 'google', 'walking');
  const origin = qs[0];
  const dest = qs[qs.length - 1];
  const way = qs.slice(1, -1).slice(0, 8); // Google 网页版最多 9 个途经点
  let url = `https://www.google.com/maps/dir/?api=1&origin=${enc(origin)}&destination=${enc(dest)}&travelmode=walking`;
  if (way.length) url += `&waypoints=${way.map(enc).join('%7C')}`;
  return url;
}

// 路线图投影：等距圆柱投影（经度按纬度余弦压缩），缩放到路线图的 viewBox 里。
// 参数必须和 scripts/build-map.mjs 里的 GEO 一致，否则城市点会跑到州界外面。
export const GEO = { lat0: 40.7, lng0: -74.0, scale: 34, cx: 168, cy: 196 };

// 五个城市的真实经纬度（纬度, 经度 之外用 [lng, lat] 顺序，跟 GeoJSON 一致）
export const CITY_LL = {
  bos: [-71.0589, 42.3601],
  nyc: [-74.0060, 40.7128],
  phl: [-75.1652, 39.9526],
  dc: [-77.0369, 38.9072],
  la: [-118.2437, 34.0522]
};

export const project = ([lng, lat]) => [
  (lng - GEO.lng0) * Math.cos((GEO.lat0 * Math.PI) / 180) * GEO.scale + GEO.cx,
  -(lat - GEO.lat0) * GEO.scale + GEO.cy
];

export const CITY_XY = Object.fromEntries(Object.entries(CITY_LL).map(([k, v]) => [k, project(v)]));

// 两点连线沿法线平移 d 像素：来回两段可以分开画，不叠在一起
export function offsetLine(a, b, d) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * d, ny = (dx / len) * d;
  return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny]];
}

export const toPath = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');

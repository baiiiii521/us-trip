#!/usr/bin/env node
// 生成路线图用的底图：从 us-atlas 的 states-10m TopoJSON 里取东岸各州，
// 做等距圆柱投影 + 简化，输出 src/data/map-geo.js（一串 SVG path）。
//
// 重新生成：node scripts/build-map.mjs
// 数据来源：https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json（Natural Earth / Census，公有领域）
// 只需要重跑一次；平时改行程不用动底图。
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'scripts/data/states-10m.json');
const OUT = path.join(ROOT, 'src/data/map-geo.js');

// 路线图的投影参数：和 src/lib/geo.js 必须一致（改这里也改那边）
export const GEO = { lat0: 40.7, lng0: -74.0, scale: 34, cx: 168, cy: 196 };

const project = ([lng, lat]) => [
  (lng - GEO.lng0) * Math.cos((GEO.lat0 * Math.PI) / 180) * GEO.scale + GEO.cx,
  -(lat - GEO.lat0) * GEO.scale + GEO.cy
];

// 只看东岸这一块，别的州丢掉
const KEEP = new Set(['Maine', 'New Hampshire', 'Vermont', 'Massachusetts', 'Rhode Island', 'Connecticut',
  'New York', 'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'District of Columbia', 'Virginia', 'West Virginia']);

// ── TopoJSON 解码（只实现本文件用到的部分：stored delta + quantized） ──
export function decodeTopology(topo) {
  const { scale, translate } = topo.transform;
  const arcs = topo.objects.states.geometries; // 仅用于取名称
  const decoded = topo.arcs.map((arc) => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => {
      x += dx; y += dy;
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
    });
  });
  return { decoded, geoms: arcs };
}

const ringOf = (decoded, arcIdxs) => {
  const pts = [];
  for (const i of arcIdxs) {
    const arc = i < 0 ? decoded[~i].slice().reverse() : decoded[i];
    for (const p of arc) {
      const last = pts[pts.length - 1];
      if (!last || last[0] !== p[0] || last[1] !== p[1]) pts.push(p);
    }
  }
  return pts;
};

// Douglas–Peucker，容差按像素给
function simplify(points, tol) {
  if (points.length < 4) return points;
  const sqTol = tol * tol;
  const sqSegDist = (p, a, b) => {
    let x = a[0], y = a[1];
    let dx = b[0] - x, dy = b[1] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) { x = b[0]; y = b[1]; } else if (t > 0) { x += dx * t; y += dy * t; }
    }
    dx = p[0] - x; dy = p[1] - y;
    return dx * dx + dy * dy;
  };
  const sq = [];
  const keep = new Array(points.length).fill(false);
  keep[0] = keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxD = 0, idx = -1;
    for (let i = first + 1; i < last; i++) {
      const d = sqSegDist(points[i], points[first], points[last]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > sqTol && idx > 0) { keep[idx] = true; stack.push([first, idx], [idx, last]); }
  }
  void sq;
  return points.filter((_, i) => keep[i]);
}

// 全美小图（左上角取景框）：CONUS 48 州，等比缩放到框内
const US_BOX = { x: 12, y: 18, w: 118, h: 44 };
const CONUS = new Set(['Alabama', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'District of Columbia', 'Florida', 'Georgia', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
  'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']);
const usProject = ([lng, lat]) => [lng, lat]; // 先取经纬度，算完 bbox 再统一缩放

const buildShapes = (decoded, geoms, filter, projector, tol) => {
  const out = [];
  for (const g of geoms) {
    const name = g.properties?.name;
    if (!filter(name)) continue;
    const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs;
    const d = [];
    for (const poly of polys) {
      for (const ring of poly) {
        const ll = ringOf(decoded, ring);
        const xy = ll.map(projector);
        const simp = simplify(xy, tol);
        if (simp.length < 3) continue;
        d.push('M' + simp.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z');
      }
    }
    if (d.length) out.push({ name, d: d.join('') });
  }
  return out;
};

const run = () => {
  const topo = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  const { decoded, geoms } = decodeTopology(topo);

  // 东岸主图
  const states = buildShapes(decoded, geoms, (n) => KEEP.has(n), project, 0.6);

  // 全美小图：先投影成经纬度算 bbox，再等比缩放进 US_BOX
  const raw = buildShapes(decoded, geoms, (n) => CONUS.has(n), usProject, 0.35);
  const nums = raw.flatMap((s) => s.d.match(/-?\d+(\.\d+)?/g).map(Number));
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = Math.min(US_BOX.w / (x1 - x0), US_BOX.h / (y1 - y0));
  const ox = US_BOX.x + (US_BOX.w - (x1 - x0) * k) / 2;
  const oy = US_BOX.y + (US_BOX.h - (y1 - y0) * k) / 2;
  const usToBox = (lng, lat) => [ox + (lng - x0) * k, oy + (lat - y1) * -k];
  const us = raw.map((s) => ({
    name: s.name,
    d: s.d.replace(/-?\d+(\.\d+)?/g, (m, _d, off, str) => {
      // 交替替换 x / y：用计数判断
      const before = str.slice(0, off).match(/-?\d+(\.\d+)?/g) || [];
      const isX = before.length % 2 === 0;
      const v = Number(m);
      const p = isX ? [ox + (v - x0) * k, 0] : [0, oy + (v - y1) * -k];
      return (isX ? p[0] : p[1]).toFixed(1);
    })
  }));
  void usToBox;

  states.sort((a, b) => a.name.localeCompare(b.name));
  const total = states.reduce((n, s) => n + s.d.length, 0);

  const body = `// 自动生成，勿手改：node scripts/build-map.mjs
// 底图来自 us-atlas states-10m（Census/Natural Earth，公有领域），等距圆柱投影后简化。
// 坐标系和 src/lib/geo.js 的 project() 一致，viewBox 由组件给出。
export const MAP_STATES = [
${states.map((s) => `  { name: ${JSON.stringify(s.name)}, d: ${JSON.stringify(s.d)} }`).join(',\n')}
];

export const MAP_BOX = { x: 0, y: 0, w: 300, h: 292 };

// 左上角取景框里的全美小图（CONUS），坐标已经缩放进框内
export const US_BOX = ${JSON.stringify(US_BOX)};
// 把经纬度投到小图里的参数：x = ox + (lng - x0) * k，y = oy - (lat - y1) * k
export const US_TX = ${JSON.stringify({ x0: +x0.toFixed(3), y1: +y1.toFixed(3), k: +k.toFixed(4), ox: +ox.toFixed(2), oy: +oy.toFixed(2) })};
export const MAP_US = [
${us.map((s) => `  { name: ${JSON.stringify(s.name)}, d: ${JSON.stringify(s.d)} }`).join(',\n')}
];
`;
  fs.writeFileSync(OUT, body);
  console.log(`states=${states.length} us=${us.length} pathChars=${total} → ${path.relative(ROOT, OUT)} (${(body.length / 1024).toFixed(1)}KB)`);
};

run();

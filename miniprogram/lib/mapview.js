// 地图上的东西都在这里算：总览（四座东部城市）和每天的小地图。
// 坐标来自 shared/data/extras.js 的 POI_LL，城市中心用该城景点坐标的平均值。
import { POIS } from '../shared/data/pois.js';
import { POI_LL } from '../shared/data/extras.js';
import { CITIES } from '../shared/data/trip.js';

const ORDER = ['bos', 'dc', 'phl', 'nyc'];

const CITY_LL = (() => {
  const out = {};
  for (const c of Object.keys(CITIES)) {
    const pts = POIS.filter((p) => p.city === c).map((p) => POI_LL[p.id]).filter(Boolean);
    if (!pts.length) continue;
    out[c] = [
      pts.reduce((s, p) => s + p[0], 0) / pts.length,
      pts.reduce((s, p) => s + p[1], 0) / pts.length
    ];
  }
  return out;
})();

// 跨度（度）→ 地图缩放级别，经验公式：0.01°≈15、0.2°≈11、1°≈9、4°≈6
const scaleFor = (span) => {
  const deg = Math.max(0.004, span);
  return Math.min(16, Math.max(5, Math.round(15 - 1.04 * (Math.log2(deg) + 6.64))));
};

const bounds = (pts) => {
  const lats = pts.map((p) => p[0]);
  const lngs = pts.map((p) => p[1]);
  return { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLng: Math.min(...lngs), maxLng: Math.max(...lngs) };
};

export function overviewMap(days) {
  const pts = ORDER.filter((c) => CITY_LL[c]).map((c) => CITY_LL[c]);
  if (pts.length < 2) return null;
  const b = bounds(pts);
  const center = [((b.minLat + b.maxLat) / 2), ((b.minLng + b.maxLng) / 2)];

  // 每座城市住几晚：按天里的 city 字段数
  const nights = {};
  for (const d of days || []) nights[d.city] = (nights[d.city] || 0) + 1;

  return {
    latitude: center[0],
    longitude: center[1],
    scale: scaleFor(Math.max(b.maxLat - b.minLat, b.maxLng - b.minLng) * 1.25),
    markers: ORDER.filter((c) => CITY_LL[c]).map((c, i) => ({
      id: i,
      latitude: CITY_LL[c][0],
      longitude: CITY_LL[c][1],
      iconPath: '/assets/pin-city.png',
      width: 26,
      height: 34,
      callout: {
        content: `${CITIES[c].zh}${nights[c] ? ` ${nights[c]} 天` : ''}`,
        color: '#16202B',
        fontSize: 11,
        borderRadius: 6,
        padding: 5,
        bgColor: '#FFFFFF',
        display: 'ALWAYS'
      }
    })),
    polyline: [{
      points: ORDER.filter((c) => CITY_LL[c]).map((c) => ({ latitude: CITY_LL[c][0], longitude: CITY_LL[c][1] })),
      color: '#C04A0Acc',
      width: 3,
      dottedLine: true,
      arrowLine: true
    }]
  };
}

export function dayMap(day) {
  if (!day || !day.items) return null;
  const seen = new Set();
  const stops = [];
  for (const it of day.items) {
    const id = (it.pois && it.pois[0]) || (it.game ? null : null);
    if (!id || seen.has(id) || !POI_LL[id]) continue;
    seen.add(id);
    const poi = POIS.find((p) => p.id === id);
    stops.push({ id, name: poi ? poi.name : id, ll: POI_LL[id] });
  }
  if (stops.length < 2) return null;

  const pts = stops.map((s) => s.ll);
  const b = bounds(pts);
  return {
    latitude: (b.minLat + b.maxLat) / 2,
    longitude: (b.minLng + b.maxLng) / 2,
    scale: scaleFor(Math.max(b.maxLat - b.minLat, b.maxLng - b.minLng) * 1.4),
    markers: stops.map((s, i) => ({
      id: i,
      latitude: s.ll[0],
      longitude: s.ll[1],
      iconPath: i === 0 ? '/assets/pin-start.png' : '/assets/pin-poi.png',
      width: 22,
      height: 28,
      callout: {
        content: `${i + 1}. ${s.name}`,
        color: '#16202B',
        fontSize: 10,
        borderRadius: 6,
        padding: 4,
        bgColor: '#FFFFFF',
        display: 'BYCLICK'
      }
    })),
    polyline: [{
      points: pts.map((p) => ({ latitude: p[0], longitude: p[1] })),
      color: '#1F4E8Ccc',
      width: 2,
      dottedLine: false,
      arrowLine: true
    }]
  };
}

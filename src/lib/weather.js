// 实时天气：Open-Meteo（免费、不需要密钥、支持浏览器跨域）。只有出发前 16 天内才有预报。
// 结果缓存 3 小时；读不到时页面继续显示 12 月历史平均。
const CACHE_KEY = 'hoops-weather-v1';
const TTL = 3 * 3600000;

export const COORDS = {
  bos: [42.36, -71.06, 'America/New_York'],
  dc: [38.90, -77.04, 'America/New_York'],
  phl: [39.95, -75.17, 'America/New_York'],
  nyc: [40.71, -74.01, 'America/New_York'],
  la: [34.02, -118.49, 'America/Los_Angeles']
};

// WMO 天气代码 → 中文
export function codeLabel(code) {
  if (code === 0) return '晴';
  if (code <= 2) return '少云';
  if (code === 3) return '阴';
  if (code === 45 || code === 48) return '雾';
  if (code >= 51 && code <= 57) return '毛毛雨';
  if (code >= 61 && code <= 67) return '雨';
  if (code >= 71 && code <= 77) return '雪';
  if (code >= 80 && code <= 82) return '阵雨';
  if (code === 85 || code === 86) return '阵雪';
  if (code >= 95) return '雷雨';
  return '多云';
}

// 是否触发暴雪 / 大雨预案（纯函数）
export function alertFor(w) {
  if (!w) return null;
  const snowy = (w.snow || 0) >= 2 || [71, 73, 75, 77, 85, 86].includes(w.code);
  const heavySnow = (w.snow || 0) >= 8 || w.code === 75 || w.code === 86;
  const rainy = (w.rain || 0) >= 15 || (w.code >= 63 && w.code <= 67) || w.code >= 95;
  if (heavySnow) return { level: 'crit', text: `预报大雪约 ${Math.round(w.snow)} 厘米` };
  if (snowy) return { level: 'warn', text: `预报有雪${w.snow ? `，约 ${Math.round(w.snow)} 厘米` : ''}` };
  if (rainy) return { level: 'warn', text: `预报降雨约 ${Math.round(w.rain || 0)} 毫米` };
  if (w.lo <= -8) return { level: 'warn', text: `最低 ${Math.round(w.lo)}°C，注意保暖` };
  return null;
}

function readCache() {
  try { const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); if (c && Date.now() - c.at < TTL) return c.data; } catch (e) { /* 忽略 */ }
  return null;
}

// Open-Meteo 返回 → { 'bos|2026-12-19': {hi, lo, code, snow, rain, pop} }（纯函数）
export function parseWeather(city, json) {
  const out = {};
  const d = (json && json.daily) || {};
  (d.time || []).forEach((date, i) => {
    out[`${city}|${date}`] = {
      hi: d.temperature_2m_max[i], lo: d.temperature_2m_min[i], code: d.weather_code[i],
      snow: d.snowfall_sum[i], rain: d.rain_sum[i], pop: d.precipitation_probability_max[i]
    };
  });
  return out;
}

// 返回 { 'bos|2026-12-19': {hi, lo, code, snow, rain, pop} }
export async function loadWeather() {
  const cached = readCache(); if (cached) return cached;
  const out = {};
  await Promise.all(Object.entries(COORDS).map(async ([city, [lat, lon, tz]]) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=${encodeURIComponent(tz)}&forecast_days=16&daily=weather_code,temperature_2m_max,temperature_2m_min,snowfall_sum,rain_sum,precipitation_probability_max`;
    try {
      const res = await fetch(url); if (!res.ok) return;
      Object.assign(out, parseWeather(city, await res.json()));
    } catch (e) { /* 网络不通 */ }
  }));
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: out })); } catch (e) { /* 忽略 */ }
  return out;
}

export function weatherFor(map, city, day) {
  if (!map) return null;
  const [m, d] = day.md.split('/');
  return map[`${city}|2026-${m.padStart(2, '0')}-${d.padStart(2, '0')}`] || null;
}

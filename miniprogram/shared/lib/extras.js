// ⚠️ 生成文件，不要手改。源头：src/lib/extras.js
// 由 scripts/mp-sync-shared.mjs 生成；改内容请改 src/ 下那份，然后跑 node scripts/mp-sync-shared.mjs
// 旅途小帮手的计算：两地时钟、离我多远、值机进行到哪一步、旅行总结。纯函数，可测试。
import { CHECKINS, EATS, POI_LL, TOILETS } from '../data/extras.js';
import { POIS } from '../data/pois.js';
import { liveExpenses, toUsd, byCategory } from './money.js';

const TZ = { bos: 'America/New_York', dc: 'America/New_York', phl: 'America/New_York', nyc: 'America/New_York', la: 'America/Los_Angeles' };
const hm = (now, timeZone) => new Intl.DateTimeFormat('zh-CN', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
const hourIn = (now, timeZone) => Number(new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hour12: false }).format(now)) % 24;

// 当地时间和北京时间，外加“现在给家里打电话合不合适”
// wall：预览模式下“假装现在是”的时间按当地钟点算（手机不在美国时也对），北京时间按冬令时差推：美东 +13、洛杉矶 +16
export function clocks(now, city = 'nyc', wall = false) {
  const tz = TZ[city] || TZ.nyc;
  if (wall) {
    const p = (n) => String(n).padStart(2, '0'), bj = new Date(+now + (city === 'la' ? 16 : 13) * 3600000), h = bj.getHours();
    const call = h >= 8 && h < 22 ? { ok: true, text: '家里醒着，可以打电话' } : h >= 22 ? { ok: false, text: '家里该睡了' } : { ok: false, text: '家里在睡觉' };
    return { local: `${p(now.getHours())}:${p(now.getMinutes())}`, beijing: `${p(bj.getHours())}:${p(bj.getMinutes())}`, place: city === 'la' ? '洛杉矶' : '美东', call };
  }
  const h = hourIn(now, 'Asia/Shanghai');
  const call = h >= 8 && h < 22 ? { ok: true, text: '家里醒着，可以打电话' } : h >= 22 ? { ok: false, text: '家里该睡了' } : { ok: false, text: '家里在睡觉' };
  return { local: hm(now, tz), beijing: hm(now, 'Asia/Shanghai'), place: city === 'la' ? '洛杉矶' : '美东', call };
}

// 两点之间的直线距离（米）
export function distM([lat1, lng1], [lat2, lng2]) {
  const r = Math.PI / 180, a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(a));
}
export function fmtDist(m) {
  if (m < 950) return `约 ${Math.max(50, Math.round(m / 50) * 50)} 米`;
  return `约 ${(m / 1000).toFixed(m < 10000 ? 1 : 0)} 公里`;
}
// 走路大概几分钟：直线距离 × 1.3 绕路系数，每分钟 75 米
export const walkMin = (m) => Math.max(1, Math.round((m * 1.3) / 75));

// 所有能排“离我最近”的地方：kind = sight 景点 / eat 吃的 / wc 厕所
export function places() {
  const out = [];
  for (const p of POIS) if (POI_LL[p.id]) out.push({ kind: p.cat === 'food' ? 'eat' : 'sight', id: p.id, name: p.name, note: p.tag || '', q: p.q, ll: POI_LL[p.id], poi: p.id });
  for (const e of EATS) out.push({ kind: 'eat', id: 'eat-' + e.name, name: e.name, note: `${e.zh} · ${e.price}`, q: e.q, ll: e.ll });
  for (const t of TOILETS) out.push({ kind: 'wc', id: 'wc-' + t.name, name: t.name, note: t.note, q: t.q, ll: t.ll });
  return out;
}
export function nearest(here, kind = 'all', n = 10) {
  return places().filter((p) => kind === 'all' || p.kind === kind)
    .map((p) => ({ ...p, m: distM(here, p.ll) })).sort((a, b) => a.m - b.m).slice(0, n);
}

// 值机：起飞前 24 小时开放。stage：soon 还没开（3 天内）/ open 可以值机了 / gone 已起飞 / far 还早
export function checkinStatus(c, now) {
  const open = c.dep - 24 * 3600000, t = +now;
  if (t >= c.dep) return { stage: 'gone', open };
  if (t >= open) return { stage: 'open', open, left: c.dep - t };
  if (t >= open - 3 * 24 * 3600000) return { stage: 'soon', open, wait: open - t };
  return { stage: 'far', open };
}
export const activeCheckins = (now) => CHECKINS.map((c) => ({ c, s: checkinStatus(c, now) })).filter((x) => x.s.stage === 'open' || x.s.stage === 'soon');
// 提醒用：值机开放的那一刻
export const checkinEvents = () => CHECKINS.map((c) => ({ at: new Date(c.dep - 24 * 3600000), title: `可以网上值机了：${c.flight}`, body: `${c.depText}。现在打开航司 App 值机、选座。` }));
export function fmtSpan(ms) {
  const h = Math.floor(ms / 3600000), d = Math.floor(h / 24);
  if (d >= 1) return `${d} 天 ${h % 24} 小时`;
  if (h >= 1) return `${h} 小时`;
  return `${Math.max(1, Math.round(ms / 60000))} 分钟`;
}

// 旅行总结：到今天为止走了多少、花了多少、看了几场、去了几个地方
export function recapStats(state, days, now, miles) {
  const y = now.getFullYear(), past = days.filter((d) => { const [m, dd] = d.md.split('/').map(Number); return new Date(y, m - 1, dd) <= now; });
  const rate = +state.budget.rate || 6.8;
  const exp = liveExpenses(state.expenses);
  const spent = exp.reduce((s, e) => s + toUsd(e, rate), 0);
  const games = past.flatMap((d) => d.items.filter((i) => i.game && !['nyk25', 'nyk27'].includes(i.game)).map((i) => i.game));
  const been = POIS.filter((p) => state.visited[p.id] && state.visited[p.id].v === 'been');
  const legs = past.flatMap((d) => d.items.filter((i) => i.leg).map((i) => i.leg));
  return {
    days: past.length, total: days.length, km: past.reduce((s, d) => s + ((d.pace && d.pace.km) || 0), 0),
    cities: [...new Set(past.map((d) => d.city))], games, been, spent, count: exp.length, cats: byCategory(state.expenses, rate),
    miles: state.rent === 'none' ? 0 : legs.reduce((s, id) => s + (miles[id] || 0), 0),
    notes: Object.values(state.notes || {}).filter((n) => n && !n.del && n.text).length,
    shop: Object.values(state.shop || {}).filter((x) => x && !x.del && x.done).length
  };
}

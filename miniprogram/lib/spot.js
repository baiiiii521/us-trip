// 一条行程「能导航到哪」：显式地址 → 正文里的地名 → 当天城市兜底。
// 行程页和今天页共用这一份，别再各写一遍。
import { POIS } from '../shared/data/pois.js';
import { POI_LL } from '../shared/data/extras.js';
import { PLACE_ALIASES } from '../shared/data/places.js';
import { llOf } from '../shared/data/geo.js';
import { CITIES } from '../shared/data/trip.js';

const POI = new Map(POIS.map((p) => [p.id, p]));

// 景点名里的中文部分（「哈佛园 Harvard Yard」→「哈佛园」）
const PLACES = POIS.map((p) => {
  const zh = String(p.name).replace(/\s*[A-Za-z].*$/, '').trim();
  return { name: p.name, zh, en: p.en || '', ll: POI_LL[p.id] || null };
}).filter((x) => x.ll);

const HOTEL_LL = {
  bos: ['811 Massachusetts Ave, Boston, MA 02118', '波士顿住处'],
  dc: ['1225 First St NE, Washington, DC 20002', '华盛顿住处'],
  phl: ['400 Arch St, Philadelphia, PA 19106', '费城住处'],
  nyc: ['343 Gold St, Brooklyn, NY 11201', '纽约住处']
};

const AIRPORTS = [
  { re: /纽瓦克|Newark/i, name: '纽瓦克机场', q: 'Newark Liberty International Airport, Newark, NJ' },
  { re: /肯尼迪|JFK/, name: 'JFK 租车中心', q: 'Federal Circle Station, JFK Airport, Jamaica, NY 11430' },
  { re: /洛根|Logan/i, name: '洛根机场租车中心', q: 'Logan Airport Rental Car Center, East Boston, MA' },
  { re: /洛杉矶机场|LAX/, name: '洛杉矶 T7', q: 'LAX Terminal 7, Los Angeles, CA' }
];

/**
 * 返回 { name, q, ll } 或 null。q 是英文地址（可能为空，只有坐标）。
 */
export function spotFor(item, city) {
  if (!item) return null;

  // 1) 数据里写了地址
  if (item.nav && item.nav.q) {
    const ll = llOf(item.nav.q);
    if (ll) return { name: item.nav.name || '目的地', q: item.nav.q, ll };
  }

  // 2) 引用了景点
  for (const id of item.pois || []) {
    const ll = POI_LL[id];
    const poi = POI.get(id);
    if (ll && poi) return { name: poi.name, q: poi.q || '', ll };
  }

  const text = String(item.text || '');

  // 3) 正文里的街道、车站、校园
  let alias = null;
  for (const a of PLACE_ALIASES) {
    if (text.indexOf(a.alias) >= 0 && (!alias || a.alias.length > alias.alias.length)) alias = a;
  }
  if (alias) return { name: alias.name, q: '', ll: alias.ll };

  // 4) 正文里提到的景点
  let best = null;
  for (const x of PLACES) {
    if (x.zh.length >= 2 && text.indexOf(x.zh) >= 0) {
      if (!best || x.zh.length > best.len) best = { len: x.zh.length, name: x.name, q: '', ll: x.ll };
    }
  }
  if (best) return best;

  const low = text.toLowerCase();
  for (const x of PLACES) {
    if (x.en && x.en.length >= 5 && low.indexOf(x.en.toLowerCase()) >= 0) return { name: x.name, q: '', ll: x.ll };
  }

  // 5) 「去机场」「回酒店」这类
  for (const a of AIRPORTS) {
    if (a.re.test(text)) {
      const ll = llOf(a.q);
      if (ll) return { name: a.name, q: a.q, ll };
    }
  }
  if (HOTEL_LL[city] && /酒店|公寓|回到住处/.test(text)) {
    const [q, name] = HOTEL_LL[city];
    const ll = llOf(q);
    if (ll) return { name, q, ll };
  }

  return null;
}

export { CITIES };

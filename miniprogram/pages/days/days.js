import { getState, update } from '../../shared/state.js';
import { TRIPS } from '../../data/trips.js';
import { buildDays } from '../../shared/data/days.js';
import { CITIES } from '../../shared/data/trip.js';
import { PACE, paceText } from '../../shared/data/wellbeing.js';
import { POIS } from '../../shared/data/pois.js';
import { llOf } from '../../shared/data/geo.js';
import { PICKUP, DROPOFF, DRIVES } from '../../shared/data/drive.js';
import { POI_LL } from '../../shared/data/extras.js';
import { PLACE_ALIASES } from '../../shared/data/places.js';
import { overviewMap, dayMap } from '../../lib/mapview.js';
import { openTarget, qqTarget } from '../../lib/nav.js';

const POI = new Map(POIS.map((p) => [p.id, p]));

const poiChips = (ids) => (ids || []).filter((id) => POI.has(id)).map((id) => ({ id, name: POI.get(id).name }));

// 地名索引：正文里出现的地名也能定位（行程里很多条目只写了「走自由之路」，没带地址）
const PLACES = POIS.map((p) => {
  const zh = String(p.name).replace(/\s*[A-Za-z].*$/, '').trim();
  return { name: p.name, zh, en: p.en || '', ll: POI_LL[p.id] || null };
}).filter((x) => x.ll);

function locate(text, poiIds) {
  for (const id of poiIds || []) {
    const ll = POI_LL[id];
    const poi = POI.get(id);
    if (ll && poi) return { name: poi.name, ll };
  }
  const t = String(text || '');
  // 先看正文里常见的街道/车站/校园名，再退到 68 个景点
  let alias = null;
  for (const a of PLACE_ALIASES) {
    if (t.indexOf(a.alias) >= 0 && (!alias || a.alias.length > alias.alias.length)) alias = a;
  }
  if (alias) return { name: alias.name, ll: alias.ll };

  let best = null;
  for (const x of PLACES) {
    if (x.zh.length >= 2 && t.indexOf(x.zh) >= 0) {
      if (!best || x.zh.length > best.len) best = { len: x.zh.length, name: x.name, ll: x.ll };
    }
  }
  if (best) return { name: best.name, ll: best.ll };
  const low = t.toLowerCase();
  for (const x of PLACES) {
    if (x.en && x.en.length >= 5 && low.indexOf(x.en.toLowerCase()) >= 0) return { name: x.name, ll: x.ll };
  }
  return null;
}

// 兜底定位：正文只说「回酒店」「去机场」时，按当天所在城市给一个点
const HOTEL_LL = {
  bos: llOf('811 Massachusetts Ave, Boston, MA 02118'),
  dc: llOf('1225 First St NE, Washington, DC 20002'),
  phl: llOf('400 Arch St, Philadelphia, PA 19106'),
  nyc: llOf('343 Gold St, Brooklyn, NY 11201')
};

const AIRPORTS = [
  { re: /纽瓦克|Newark/i, name: '纽瓦克机场', ll: llOf('Newark Liberty International Airport, Newark, NJ') },
  { re: /肯尼迪|JFK/, name: 'JFK 租车中心', ll: llOf('Federal Circle Station, JFK Airport, Jamaica, NY 11430') },
  { re: /洛根|Logan/i, name: '洛根机场租车中心', ll: llOf('Logan Airport Rental Car Center, East Boston, MA') },
  { re: /洛杉矶机场|LAX/, name: '洛杉矶 T7', ll: llOf('LAX Terminal 7, Los Angeles, CA') }
];

function fallback(text, city) {
  const t = String(text || '');
  for (const a of AIRPORTS) {
    if (a.ll && a.re.test(t)) return { name: a.name, ll: a.ll };
  }
  if (HOTEL_LL[city] && /酒店|公寓|回到住处/.test(t)) return { name: '住处', ll: HOTEL_LL[city] };
  return null;
}

const trim = (s, n) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
};

Page({
  data: {
    tripId: '',
    days: [],
    strip: [],
    activeId: '',
    overview: null,
    rent: '',
    rentLabel: '',
    open: {},
    todayId: '',
    progress: -1,
    badge: ''
  },

  onLoad(query) {
    this.setData({
      tripId: (query && query.id) || TRIPS[0].id,
      anchorDay: (query && query.day) || ''
    });
  },

  onShow() {
    this.render();
    const day = this.data.anchorDay;
    if (day) {
      this.setData({ anchorDay: '' });
      setTimeout(() => wx.pageScrollTo({ selector: `#d-${day}`, duration: 0 }), 120);
    }
  },

  render() {
    const state = getState();
    const raw = buildDays(state);
    const open = {};
    for (const d of raw) open[d.id] = !!(this.data.open && this.data.open[d.id]);

    const days = raw.map((d) => {
      const c = CITIES[d.city] || {};
      const items = d.items.map((it) => {
        const explicit = it.nav && it.nav.q ? { name: it.nav.name || '', q: it.nav.q, ll: llOf(it.nav.q) } : null;
        const auto = explicit && explicit.ll ? null : locate(it.text, it.pois) || fallback(it.text, d.city);
        let spot = explicit && explicit.ll ? explicit : auto ? { name: auto.name, q: '', ll: auto.ll } : null;
        // 取/还车这种条目本身没有地址，指向门店
        if (!spot && it.drive) {
          const plan = state.rent === 'bos' ? PICKUP.bos : state.rent === 'none' ? null : PICKUP.jfk;
          const q = it.drive === 'dropoff' ? DROPOFF.q : plan && plan.q;
          const ll = q ? llOf(q) : null;
          if (ll) spot = { name: it.drive === 'dropoff' ? '还车门店' : '取车点', q, ll };
        }
        const chips = poiChips(it.pois);
        // 城际路段：数据里只有 leg 编号，正文是空的，这里补一句人话 + 当天落脚点
        const legInfo = it.leg && DRIVES[it.leg] ? DRIVES[it.leg] : null;
        const text = it.text || (legInfo ? `${legInfo.from} → ${legInfo.to}：${legInfo.mi} 英里，${legInfo.h}` : '');
        if (!spot && legInfo && HOTEL_LL[d.city]) spot = { name: `${CITIES[d.city] ? CITIES[d.city].zh : ''}落脚点`, q: '', ll: HOTEL_LL[d.city] };
        return {
          t: it.t || '',
          text,
          short: trim(text, 40),
          note: it.note || '',
          spot,
          addr: explicit ? explicit.q : '',
          canTap: !!(spot || chips.length),
          game: !!it.game,
          leg: !!it.leg,
          drive: !!it.drive,
          xmas: it.xmas ? it.xmas.s : '',
          xmasNote: it.xmas ? it.xmas.note || '' : '',
          poi: chips
        };
      });
      return {
        id: d.id,
        md: d.md,
        wd: d.wd,
        cityZh: c.zh || '',
        title: d.title || '',
        stay: d.stay || '',
        warn: d.warn || '',
        tips: d.tips || [],
        cut: d.pace && d.pace.cut ? d.pace.cut : '',
        pace: d.pace ? { km: d.pace.km, label: PACE[d.pace.lv] || '', text: paceText(d.pace), lv: d.pace.lv } : null,
        weather: c.hi != null ? `${c.hi}° / ${c.lo}°C · 日落 ${c.sunset}` : '',
        head: items.slice(0, 3),
        more: Math.max(0, items.length - 3),
        items,
        map: open[d.id] ? dayMap(d) : null
      };
    });

    const rentLabel = { jfk: '全程自驾 · 12/18 JFK 取车', bos: '12/21 波士顿取车', none: '不租车 · 火车/大巴' }[state.rent] || '';

    const now = new Date();
    const idx = days.findIndex((d) => {
      const [m, dd] = d.md.split('/').map(Number);
      return m === now.getMonth() + 1 && dd === now.getDate();
    });
    const underway = idx >= 0;
    const dayNo = underway ? idx + 1 : 0;
    // 出发前按日期算进度，行程中按第几天
    const start = new Date(2026, 11, 18);
    const before = now < start;
    const progress = underway ? dayNo / days.length : before ? 0 : 1;

    this.setData({
      days,
      overview: overviewMap(raw),
      strip: days.map((d) => ({ id: d.id, md: d.md, wd: d.wd })),
      rent: state.rent || '',
      rentLabel,
      todayId: underway ? days[idx].id : '',
      open,
      progress,
      badge: underway ? `第 ${dayNo} / ${days.length} 天` : before ? `距出发 ${Math.ceil((start - now) / 86400000)} 天` : '已走完'
    });
  },

  toggle(e) {
    const { id } = e.currentTarget.dataset;
    const open = { ...this.data.open, [id]: !this.data.open[id] };
    const days = this.data.days.map((d) => (d.id === id ? { ...d, map: open[id] ? dayMap(buildDays(getState()).find((x) => x.id === id)) : null } : d));
    this.setData({ open, days });
  },

  /**
   * 点一条行程：有地址就开地图导航，有景点就进详情页。
   * 地图走 wx.openLocation，需要经纬度——地址在构建时已经换成坐标（shared/data/geo.js）。
   */
  openItem(e) {
    const { id, i } = e.currentTarget.dataset;
    const day = this.data.days.find((d) => d.id === id);
    const it = day && day.items[Number(i)];
    if (!it) return;
    if (it.spot && it.spot.ll) {
      openTarget({ name: it.spot.name || '目的地', q: it.spot.q || '', ll: it.spot.ll });
      return;
    }
    if (it.poi.length) {
      wx.navigateTo({ url: `/pages/poi/poi?id=${it.poi[0].id}` });
      return;
    }
    wx.showToast({ title: '这一项没有地点', icon: 'none' });
  },

  copyAddr(e) {
    const { q } = e.currentTarget.dataset;
    if (!q) return;
    wx.setClipboardData({ data: String(q), success: () => wx.showToast({ title: '英文地址已复制', icon: 'none' }) });
  },

  jump(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ activeId: id });
    wx.pageScrollTo({ selector: `#d-${id}`, duration: 240 });
  },

  openPoi(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/poi/poi?id=${id}` });
  },

  switchRent() {
    const LABEL = { jfk: '全程自驾 · 12/18 JFK 取车', bos: '12/21 波士顿取车', none: '不租车 · 火车/大巴' };
    const order = ['jfk', 'bos', 'none'];
    const cur = this.data.rent || 'jfk';
    const next = order[(order.indexOf(cur) + 1) % order.length];
    update((s) => { s.rent = next; });
    this.setData({ open: {} });
    this.render();
    wx.showToast({ title: `已切换：${LABEL[next]}`, icon: 'none', duration: 2200 });
  },

  toTips() {
    wx.navigateTo({ url: '/pages/tips/tips' });
  },

  openOverview() {
    const o = this.data.overview;
    if (!o) return;
    openTarget({ name: '四座城市', q: 'Boston, New York, Philadelphia, Washington DC', ll: [o.latitude, o.longitude] });
  }
});

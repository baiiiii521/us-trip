import { getState, update } from '../../shared/state.js';
import { TRIPS } from '../../data/trips.js';
import { buildDays } from '../../shared/data/days.js';
import { CITIES, TRIP } from '../../shared/data/trip.js';
import { PACE, paceText } from '../../shared/data/wellbeing.js';
import { POIS } from '../../shared/data/pois.js';
import { overviewMap, dayMap } from '../../lib/mapview.js';
import { openTarget } from '../../lib/nav.js';

const POI = new Map(POIS.map((p) => [p.id, p]));

// 行程引用到的景点 id → 名字，页面上显示成可点的小标签
const poiChips = (ids) => (ids || []).filter((id) => POI.has(id)).map((id) => ({ id, name: POI.get(id).name }));

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
    open: {},       // 展开状态：id → true
    todayId: ''
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
      const items = d.items.map((it) => ({
        t: it.t || '',
        text: it.text || '',
        short: trim(it.text, 42),
        note: it.note || '',
        game: !!it.game,
        leg: !!it.leg,
        drive: it.drive || '',
        xmas: it.xmas ? it.xmas.s : '',
        xmasNote: it.xmas ? it.xmas.note || '' : '',
        poi: poiChips(it.pois)
      }));
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

    // 今天在第几天（用于默认展开和日期条高亮）
    const todayIdx = (() => {
      const now = new Date();
      const hit = days.findIndex((d) => {
        const [m, dd] = d.md.split('/').map(Number);
        return m === now.getMonth() + 1 && dd === now.getDate();
      });
      return hit;
    })();

    this.setData({
      days,
      overview: overviewMap(raw),
      strip: days.map((d) => ({ id: d.id, md: d.md, wd: d.wd })),
      rent: state.rent || '',
      rentLabel,
      todayId: todayIdx >= 0 ? days[todayIdx].id : '',
      open
    });
  },

  toggle(e) {
    const { id } = e.currentTarget.dataset;
    const open = { ...this.data.open, [id]: !this.data.open[id] };
    const days = this.data.days.map((d) => (d.id === id ? { ...d, map: open[id] ? dayMap(buildDays(getState()).find((x) => x.id === id)) : null } : d));
    this.setData({ open, days });
  },

  jump(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ activeId: id });
    wx.pageScrollTo({ selector: `#d-${id}`, duration: 220 });
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
    openTarget({ name: '四座城市的地理位置', q: 'Boston, New York, Philadelphia, Washington DC', ll: [o.latitude, o.longitude] });
  }
});

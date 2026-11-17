import { getState, update } from '../../shared/state.js';
import { TRIPS } from '../../data/trips.js';
import { buildDays } from '../../shared/data/days.js';
import { CITIES } from '../../shared/data/trip.js';
import { PACE } from '../../shared/data/wellbeing.js';
import { POIS } from '../../shared/data/pois.js';
import { openTarget } from '../../lib/nav.js';

const POI = new Map(POIS.map((p) => [p.id, p]));

// 行程引用到的景点 id → 名字，页面上显示成可点的小标签
function poiChips(ids) {
  return (ids || []).filter((id) => POI.has(id)).map((id) => ({ id, name: POI.get(id).name }));
}

Page({
  data: {
    tripId: '',
    days: [],
    strip: [],
    activeId: '',
    rent: '',
    rentLabel: ''
  },

  onLoad(query) {
    this.setData({
      tripId: (query && query.id) || TRIPS[0].id,
      anchorDay: (query && query.day) || ''
    });
  },

  onShow() {
    this.render();
    // 从景点详情跳「安排在这几天」过来时，直接滚到那一天
    const day = this.data.anchorDay;
    if (day) {
      this.setData({ anchorDay: '' });
      setTimeout(() => wx.pageScrollTo({ selector: `#d-${day}`, duration: 0 }), 120);
    }
  },

  render() {
    const state = getState();
    const days = buildDays(state).map((d) => ({
      id: d.id,
      md: d.md,
      wd: d.wd,
      cityZh: CITIES[d.city] ? CITIES[d.city].zh : '',
      title: d.title || '',
      stay: d.stay || '',
      warn: d.warn || '',
      tips: d.tips || [],
      pace: d.pace ? { km: d.pace.km, label: PACE[d.pace.lv] || '', cut: d.pace.cut } : null,
      items: d.items.map((it) => ({
        t: it.t || '',
        text: it.text || '',
        note: it.note || '',
        game: !!it.game,
        leg: !!it.leg,
        drive: it.drive || '',
        xmas: it.xmas ? it.xmas.s : '',
        poi: poiChips(it.pois)
      }))
    }));

    const rentLabel = { jfk: '全程自驾（12/18 JFK 取车）', bos: '12/21 波士顿取车', none: '不租车（火车/大巴）' }[state.rent] || '';

    this.setData({
      days,
      strip: days.map((d) => ({ id: d.id, md: d.md, wd: d.wd })),
      rent: state.rent || '',
      rentLabel
    });
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

  navItem(e) {
    const { day, t } = e.currentTarget.dataset;
    const d = this.data.days.find((x) => x.id === day);
    const it = d && d.items.find((x) => x.t === t);
    if (it && it.poi.length) wx.navigateTo({ url: `/pages/poi/poi?id=${it.poi[0].id}` });
  },

  switchRent() {
    const LABEL = { jfk: '全程自驾（12/18 JFK 取车）', bos: '12/21 波士顿取车', none: '不租车（火车/大巴）' };
    const order = ['jfk', 'bos', 'none'];
    const cur = this.data.rent || 'jfk';
    const next = order[(order.indexOf(cur) + 1) % order.length];
    update((s) => { s.rent = next; });
    this.render();
    wx.showToast({ title: `已切换：${LABEL[next]}`, icon: 'none', duration: 2200 });
  }
});

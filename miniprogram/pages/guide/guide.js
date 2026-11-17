import { POIS } from '../../shared/data/pois.js';
import { CITIES, CATEGORIES } from '../../shared/data/trip.js';
import { buildDays } from '../../shared/data/days.js';
import { getState } from '../../shared/state.js';
import { poiAppearances } from '../../shared/lib/index.js';
import { thumbOf } from '../../lib/photos.js';

// 按行程顺序；颜色是每座城的线色（和行程页、今天页同一套）
const CITY_ORDER = ['bos', 'dc', 'phl', 'nyc', 'la'];
const LINE = { bos: '#2FB36B', dc: '#E63A3A', phl: '#2F6BFF', nyc: '#FFC233', la: '#19B5C9' };

Page({
  data: {
    cities: [],
    active: 'all',
    q: '',
    list: [],
    total: 0
  },

  onLoad() {
    const cities = [{ key: 'all', label: '全部' }, ...CITY_ORDER.filter((c) => CITIES[c]).map((c) => ({ key: c, label: CITIES[c].zh, color: LINE[c] }))];
    this.setData({ cities });
  },

  onShow() {
    this.render();
  },

  render() {
    const { active, q } = this.data;
    const days = buildDays(getState());
    const appears = poiAppearances(days); // poi id → 出现的天
    const key = String(q || '').trim().toLowerCase();

    const list = POIS
      .filter((p) => active === 'all' || p.city === active)
      .filter((p) => !key || `${p.name}${p.en}${p.tag}${p.intro || ''}`.toLowerCase().includes(key))
      .map((p) => ({
        id: p.id,
        name: p.name,
        en: p.en,
        tag: p.tag || '',
        city: CITIES[p.city] ? CITIES[p.city].zh : '',
        cat: CATEGORIES[p.cat] || '',
        days: (appears[p.id] || []).map((d) => d.md).slice(0, 4),
        moreDays: Math.max(0, (appears[p.id] || []).length - 4),
        photo: thumbOf(p.id, 480),
        color: LINE[p.city] || '#0E1A3A'
      }));

    this.setData({ list, total: list.length });
  },

  pick(e) {
    this.setData({ active: e.currentTarget.dataset.key }, () => this.render());
  },

  search(e) {
    this.setData({ q: e.detail.value }, () => this.render());
  },

  open(e) {
    wx.navigateTo({ url: `/pages/poi/poi?id=${e.currentTarget.dataset.id}` });
  }
});

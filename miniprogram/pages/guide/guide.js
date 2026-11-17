import { POIS } from '../../shared/data/pois.js';
import { CITIES, CATEGORIES } from '../../shared/data/trip.js';
import { buildDays } from '../../shared/data/days.js';
import { getState } from '../../shared/state.js';
import { poiAppearances } from '../../shared/lib/index.js';
import { thumbOf } from '../../lib/photos.js';

const CITY_ORDER = ['bos', 'nyc', 'phl', 'dc', 'la'];
const CITY_COLOR = { bos: '#1E7A4C', dc: '#2B4C8C', phl: '#1D6FB8', nyc: '#C04A0A', la: '#0E8A8A' };

Page({
  data: {
    cities: [],
    active: 'all',
    q: '',
    list: [],
    total: 0
  },

  onLoad() {
    const cities = [{ key: 'all', label: '全部' }, ...CITY_ORDER.filter((c) => CITIES[c]).map((c) => ({ key: c, label: CITIES[c].zh }))];
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
        color: CITY_COLOR[p.city] || '#16202B'
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

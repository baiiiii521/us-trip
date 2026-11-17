import { EATS } from '../../shared/data/extras.js';
import { CITIES } from '../../shared/data/trip.js';
import { openTarget, qqTarget } from '../../lib/nav.js';

const CITY_ORDER = ['bos', 'nyc', 'phl', 'dc', 'la'];

Page({
  data: { cities: [], active: 'all', groups: [], total: 0 },

  onLoad() {
    this.setData({
      cities: [{ key: 'all', label: '全部' }, ...CITY_ORDER.filter((c) => CITIES[c]).map((c) => ({ key: c, label: CITIES[c].zh }))]
    });
  },

  onShow() {
    this.render();
  },

  render() {
    const { active } = this.data;
    const picked = EATS.filter((e) => active === 'all' || e.city === active);
    const groups = CITY_ORDER
      .map((c) => ({
        city: c,
        zh: CITIES[c] ? CITIES[c].zh : c,
        items: picked.filter((e) => e.city === c).map((e, i) => ({
          key: `${c}-${i}`,
          name: e.name,
          zh: e.zh,
          what: e.what,
          price: e.price,
          book: e.book,
          day: e.day || '',
          q: e.q,
          ll: e.ll
        }))
      }))
      .filter((g) => g.items.length);
    this.setData({ groups, total: picked.length });
  },

  pick(e) {
    this.setData({ active: e.currentTarget.dataset.key }, () => this.render());
  },

  nav(e) {
    const { key } = e.currentTarget.dataset;
    for (const g of this.data.groups) {
      const it = g.items.find((x) => x.key === key);
      if (it) {
        openTarget(qqTarget(it.name, it.q, it.ll));
        return;
      }
    }
  }
});

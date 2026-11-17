import { POIS } from '../../shared/data/pois.js';
import { CITIES, CATEGORIES } from '../../shared/data/trip.js';
import { POI_LL } from '../../shared/data/extras.js';
import { getState } from '../../shared/state.js';
import { buildDays } from '../../shared/data/days.js';
import { poiAppearances } from '../../shared/lib/index.js';
import { openTarget, poiTarget } from '../../lib/nav.js';

const BY_ID = new Map(POIS.map((p) => [p.id, p]));
const CITY_COLOR = { bos: '#1E7A4C', dc: '#2B4C8C', phl: '#1D6FB8', nyc: '#C04A0A', la: '#0E8A8A' };

Page({
  data: { poi: null, days: [], ll: false },

  onLoad(query) {
    const p = BY_ID.get(query && query.id);
    if (!p) {
      this.setData({ poi: null });
      return;
    }
    const appears = poiAppearances(buildDays(getState()));
    this.setData({
      poi: {
        ...p,
        cityZh: CITIES[p.city] ? CITIES[p.city].zh : '',
        catZh: CATEGORIES[p.cat] || '',
        coverColor: CITY_COLOR[p.city] || '#16202B',
        highlights: p.highlights || []
      },
      days: (appears[p.id] || []).map((d) => ({ id: d.id, md: d.md, wd: d.wd, title: d.title || '' })),
      ll: !!POI_LL[p.id]
    });
    wx.setNavigationBarTitle({ title: p.name });
  },

  nav() {
    openTarget(poiTarget(this.data.poi.id));
  },

  copy() {
    wx.setClipboardData({
      data: this.data.poi.q || this.data.poi.en,
      success: () => wx.showToast({ title: '英文地址已复制', icon: 'none' })
    });
  },

  jumpDay(e) {
    wx.redirectTo({ url: `/pages/days/days?day=${e.currentTarget.dataset.id}` });
  }
});

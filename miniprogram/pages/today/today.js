import { getState } from '../../shared/state.js';
import { TRIPS } from '../../data/trips.js';
import { buildTodayView } from '../../lib/today-view.js';
import { openTarget } from '../../lib/nav.js';

Page({
  data: {
    v: null,
    tripId: ''
  },

  onLoad(query) {
    this.setData({ tripId: (query && query.id) || TRIPS[0].id });
  },

  onShow() {
    this.render();
  },

  render() {
    let v;
    try {
      v = buildTodayView(new Date(), getState());
    } catch (e) {
      v = { phase: 'error', headline: '读不到行程数据', subline: String(e && e.message ? e.message : e) };
    }
    this.setData({ v });
  },

  onPullDownRefresh() {
    this.render();
    wx.stopPullDownRefresh();
  },

  navTo() {
    openTarget(this.data.v && this.data.v.navTarget);
  },

  go(e) {
    const { url } = e.currentTarget.dataset;
    wx.redirectTo({ url: `${url}?id=${this.data.tripId}` });
  },

  backToList() {
    wx.navigateBack({ delta: 1 });
  }
});

import { getState } from '../../shared/state.js';
import { TRIPS } from '../../data/trips.js';
import { buildTodayView } from '../../lib/today-view.js';
import { openTarget } from '../../lib/nav.js';

Page({
  data: {
    v: null,
    tripId: '',
    badge: '',
    progress: -1
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
    // 顶部栏徽标和进度：今天页自己算，别让顶栏再显示一遍美东时间（页面里已有双钟）
    const TOTAL = 14;
    let badge = '';
    let progress = -1;
    if (v.phase === 'on') {
      badge = `第 ${v.dayNo} / ${TOTAL} 天`;
      progress = v.dayNo / TOTAL;
    } else if (v.phase === 'before') {
      const m = String(v.headline || '').match(/(\d+)/);
      badge = m ? `距出发 ${m[1]} 天` : '';
      progress = 0;
    } else if (v.phase === 'after') {
      badge = '已走完';
      progress = 1;
    }

    this.setData({ v, badge, progress });
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

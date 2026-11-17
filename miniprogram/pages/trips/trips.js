// 首页：旅行列表。现在只有一趟，但结构按多趟写，加第二趟不用改页面。
import { TRIPS, dotDate, tripPhase, tripDays } from '../../data/trips.js';

// 点开哪一页：旅程首页就是「今天」。写死在这里，别散在 WXML 里
export const OPEN_URL = (id) => `/pages/today/today?id=${id}`;

Page({
  data: {
    list: [],
    brand: '行前行后'
  },

  onShow() {
    this.render();
  },

  render() {
    const list = TRIPS.map((t) => {
      const phase = tripPhase(t);
      return {
        ...t,
        dateText: `${dotDate(t.start)} – ${dotDate(t.end)}`,
        days: tripDays(t),
        phaseLabel: phase.label,
        phaseKey: phase.key
      };
    });
    this.setData({ list });
  },

  openTrip(e) {
    const id = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id) || (TRIPS[0] && TRIPS[0].id);
    if (!id) {
      wx.showToast({ title: '没有旅行数据', icon: 'none' });
      return;
    }
    try {
      wx.setStorageSync('lastTrip', id);
    } catch (err) {
      // 存不下也不影响打开
    }
    wx.navigateTo({
      url: OPEN_URL(id),
      fail: (err) => wx.showToast({ title: `打不开：${err && err.errMsg ? err.errMsg : ''}`, icon: 'none', duration: 3000 })
    });
  }
});

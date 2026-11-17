// 首页：旅行列表。现在只有一趟，但结构按多趟写，加第二趟不用改页面。
const { TRIPS, dotDate, tripPhase, tripDays } = require('../../data/trips.js');

Page({
  data: {
    list: []
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
    const { id } = e.currentTarget.dataset;
    try {
      wx.setStorageSync('lastTrip', id);
    } catch (err) {
      // 存不下也不影响打开
    }
    wx.navigateTo({ url: `/pages/trip/trip?id=${id}` });
  }
});

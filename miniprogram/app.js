// 小程序入口：只放旅行列表和全局状态，单趟旅程的内容由各页面按需 import。
import { TRIPS } from './data/trips.js';
import { getState } from './shared/state.js';

App({
  globalData: {
    trips: TRIPS,
    version: '0.2.0',
    brand: '行前行后'
  },
  onLaunch() {
    // 读一次本地状态（旅行方案设置），失败就用默认值
    try {
      this.globalData.state = getState();
    } catch (e) {
      this.globalData.state = null;
    }
    try {
      const last = wx.getStorageSync('lastTrip');
      if (last && TRIPS.some((t) => t.id === last)) this.globalData.lastTrip = last;
    } catch (e) {
      // 存储不可用就当第一次打开
    }
  }
});

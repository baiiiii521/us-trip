// 小程序入口：只放旅行列表和全局状态，单趟旅程的内容由各页面按需 import。
import { TRIPS } from './data/trips.js';
import { getState } from './shared/state.js';
import { festiveOf } from './lib/festive.js';

// 节日换装：包一层 Page，每个页面显示时把当天的节日配色（12/24、12/25）放进 data.festive，
// 页面第一行的 <page-meta page-style="{{festive.style}}"> 再把它盖到整页上
const RawPage = Page;
Page = (cfg) => {
  const show = cfg.onShow;
  const load = cfg.onLoad;
  const stamp = (self) => { const f = festiveOf(new Date()); if (!self.data.festive || self.data.festive.key !== f.key) self.setData({ festive: f }); };
  cfg.onLoad = function onLoad(...a) { stamp(this); return load ? load.apply(this, a) : undefined; };
  cfg.onShow = function onShow(...a) { stamp(this); return show ? show.apply(this, a) : undefined; };
  return RawPage(cfg);
};

// 状态栏/胶囊尺寸只在这里读一次，顶部栏和页面共用（读不到就按机型兜底）
function readMetrics() {
  let sys = {};
  try {
    sys = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
  } catch (e) {
    try {
      sys = wx.getSystemInfoSync();
    } catch (e2) {
      sys = {};
    }
  }
  let platform = sys.platform || '';
  if (!platform) {
    try {
      platform = (wx.getDeviceInfo ? wx.getDeviceInfo() : {}).platform || '';
    } catch (e) {
      platform = '';
    }
  }
  let sb = Number(sys.statusBarHeight) || 0;
  if (sb < 24) sb = /ios/i.test(platform) ? 44 : 24;
  let navH = 48;
  try {
    const cap = wx.getMenuButtonBoundingClientRect();
    if (cap && cap.height && cap.top) {
      const h = (cap.top - sb) * 2 + cap.height;
      if (h >= 36 && h <= 64) navH = Math.max(46, h);
    }
  } catch (e) {
    // 用默认值
  }
  return { sb, navH, platform };
}

App({
  globalData: {
    trips: TRIPS,
    version: '0.9.1',
    brand: '行前行后',
    metrics: null
  },
  onLaunch() {
    this.globalData.metrics = readMetrics();
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

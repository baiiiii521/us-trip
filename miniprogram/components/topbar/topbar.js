// 自定义顶部栏：系统导航栏不能改字体和排版，所以主页面用这个。
// 状态栏高度必须真的读对，否则文字会被刘海/状态栏压住：
// 读取顺序 getWindowInfo → getSystemInfoSync，读不到再按机型兜底。
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

Component({
  properties: {
    title: { type: String, value: '' },
    sub: { type: String, value: '' },
    showBack: { type: Boolean, value: false },
    brand: { type: Boolean, value: false },
    transparent: { type: Boolean, value: false },
    badge: { type: String, value: '' },
    progress: { type: Number, value: -1, observer: 'paint' }
  },
  data: { sb: 24, navH: 48, segs: [] },
  lifetimes: {
    attached() {
      const app = getApp();
      const cached = app && app.globalData && app.globalData.metrics;
      const m = cached && cached.sb ? cached : readMetrics();
      if (app && app.globalData) app.globalData.metrics = m;
      this.setData({ sb: m.sb, navH: m.navH });
      this.paint();
    }
  },
  methods: {
    // 五座城的天数：波士顿 3、华盛顿 2、费城 1、纽约 7、洛杉矶 1（共 14 天）
    paint() {
      const p = Number(this.data.progress);
      if (!(p >= 0)) return;
      const LINES = [
        { city: 'bos', days: 3, color: '#2FB36B' },
        { city: 'dc', days: 2, color: '#E63A3A' },
        { city: 'phl', days: 1, color: '#2F6BFF' },
        { city: 'nyc', days: 7, color: '#FFC233' },
        { city: 'la', days: 1, color: '#19B5C9' }
      ];
      const done = p * 14;
      let acc = 0;
      const segs = LINES.map((l) => {
        const lit = done > acc;
        acc += l.days;
        return { ...l, lit };
      });
      this.setData({ segs });
    },
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) wx.navigateBack();
      else wx.reLaunch({ url: '/pages/trips/trips' });
    }
  }
});

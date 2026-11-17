// 自定义顶部栏：系统导航栏不能改字体和排版，所以主页面用这个。
// 高度按状态栏自动撑开，右边留出微信胶囊的位置（88rpx）。
Component({
  properties: {
    title: { type: String, value: '' },
    sub: { type: String, value: '' },
    showBack: { type: Boolean, value: false },
    brand: { type: Boolean, value: false },
    transparent: { type: Boolean, value: false }
  },
  data: { sb: 20 },
  lifetimes: {
    attached() {
      let sb = 20;
      try {
        const info = wx.getSystemInfoSync();
        sb = info.statusBarHeight || 20;
      } catch (e) {
        // 取不到就用默认值
      }
      this.setData({ sb });
    }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) wx.navigateBack();
      else wx.reLaunch({ url: '/pages/trips/trips' });
    }
  }
});

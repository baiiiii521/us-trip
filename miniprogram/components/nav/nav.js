// 底部导航：今天 / 行程 / 景点 / 花费 / 随身。
// 用自定义组件而不是原生 tabBar——tabBar 是全局的，将来第二趟旅行要能换一套。
Component({
  properties: {
    current: { type: String, value: 'today' },
    tripId: { type: String, value: '' }
  },
  data: {
    items: [
      { key: 'today', label: '今天', url: '/pages/today/today', icon: '/assets/ic-today.png', on: '/assets/ic-today-on.png' },
      { key: 'days', label: '行程', url: '/pages/days/days', icon: '/assets/ic-days.png', on: '/assets/ic-days-on.png' },
      { key: 'guide', label: '景点', url: '/pages/guide/guide', icon: '/assets/ic-guide.png', on: '/assets/ic-guide-on.png' },
      { key: 'money', label: '花费', url: '/pages/money/money', icon: '/assets/ic-money.png', on: '/assets/ic-money-on.png' },
      { key: 'more', label: '随身', url: '/pages/more/more', icon: '/assets/ic-more.png', on: '/assets/ic-more-on.png' }
    ]
  },
  methods: {
    go(e) {
      const { key, url } = e.currentTarget.dataset;
      if (key === this.data.current) return;
      const q = this.data.tripId ? `?id=${this.data.tripId}` : '';
      wx.redirectTo({ url: `${url}${q}` });
    }
  }
});

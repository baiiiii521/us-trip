// 底部导航：今天 / 行程 / 景点 / 花费 / 随身。
// 用自定义组件而不是原生 tabBar——tabBar 是全局的，将来第二趟旅行要能换一套。
Component({
  properties: {
    current: { type: String, value: 'today' },
    tripId: { type: String, value: '' }
  },
  data: {
    items: [
      { key: 'today', label: '今天', url: '/pages/today/today' },
      { key: 'days', label: '行程', url: '/pages/days/days' },
      { key: 'guide', label: '景点', url: '/pages/guide/guide' },
      { key: 'money', label: '花费', url: '/pages/money/money' },
      { key: 'more', label: '随身', url: '/pages/more/more' }
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

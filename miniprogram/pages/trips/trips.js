// 首页：一趟旅程的封面页。
// 结构按多趟写（下面还有「所有旅程」），但现在只有美东这一趟，所以首屏就是它的海报。
import { TRIPS, dotDate, tripPhase, tripDays } from '../../data/trips.js';
import { getState } from '../../shared/state.js';
import { buildTodayView } from '../../lib/today-view.js';
import { photoOf } from '../../lib/photos.js';
import { openTarget } from '../../lib/nav.js';

// 点开哪一页：旅程首页就是「今天」。写死在这里，别散在 WXML 里
export const OPEN_URL = (id) => `/pages/today/today?id=${id}`;

const TOOLS = [
  { key: 'wallet', name: '订单夹', sub: '确认号、截图，一格一样', url: '/pages/wallet/wallet' },
  { key: 'tickets', name: '票务', sub: '六场球，购票入口与比价', url: '/pages/tickets/tickets' },
  { key: 'drive', name: '自驾须知', sub: '四段路，取车还车、停车', url: '/pages/drive/drive' },
  { key: 'ledger', name: '记账与结算', sub: '两人 AA，谁给谁多少', url: '/pages/ledger/ledger' },
  { key: 'cards', name: '英文大字卡', sub: '给司机、店员看的几行字', url: '/pages/cards/cards' },
  { key: 'tips', name: '小技巧', sub: '入境、刷卡坐车、买票', url: '/pages/tips/tips' }
];

const TRAIL = ['波士顿', '华盛顿', '费城', '纽约', '洛杉矶'];

// 顶栏徽标只说状态，不报天数——天数由下面那张卡片负责，两处别抢同一件事
const PHASE_WORD = { soon: '未出发', now: '行程中', done: '已结束' };

Page({
  data: {
    brand: '行前行后',
    sb: 44,
    hero: null,
    now: null,
    tools: TOOLS,
    trips: [],
    ready: false
  },

  onLoad() {
    const app = getApp();
    const m = app && app.globalData && app.globalData.metrics;
    this.setData({ sb: m && m.sb ? m.sb : 44 });
  },

  onShow() {
    this.render();
  },

  render() {
    const t = TRIPS[0];
    const phase = tripPhase(t);
    const photo = photoOf('brooklyn-bridge') || photoOf('msg');

    let view = null;
    try {
      view = buildTodayView(new Date(), getState());
    } catch (e) {
      view = null;
    }

    const heroes = TRIPS.map((x) => {
      const p = tripPhase(x);
      return {
        id: x.id,
        title: x.title,
        titleEn: x.titleEn || '',
        dateText: `${dotDate(x.start)} – ${dotDate(x.end)}`,
        days: tripDays(x),
        people: x.people,
        metaText: `${dotDate(x.start)} – ${dotDate(x.end)} · ${tripDays(x)} 天 · ${x.people} 人`,
        phaseLabel: PHASE_WORD[p.key] || p.label,
        phaseKey: p.key,
        trail: TRAIL.join(' → ')
      };
    });

    const nowLabel = view && view.phase === 'on' ? '今天' : view && view.phase === 'before' ? '出发前' : '行程';

    this.setData({
      ready: true,
      hero: {
        ...heroes[0],
        trail: TRAIL.join(' → '),
        cover: photo ? photo.src : '',
        credit: photo ? `图片 ${photo.credit || '维基百科'} · ${photo.license || ''}` : ''
      },
      now: {
        label: nowLabel,
        title: view ? view.headline : '读不到行程数据',
        sub: view && view.phase === 'before' && view.dayTitle ? view.dayTitle : view ? view.subline : '',
        canNav: !!(view && view.navTarget),
        detail: view && view.current
          ? `${view.current.t || ''} ${view.current.text || ''}`.trim()
          : view && view.preview && view.preview[0]
            ? `${view.preview[0].t || ''} ${view.preview[0].text || ''}`.trim()
            : ''
      },
      trips: heroes
    });
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
  },

  go(e) {
    const { url } = e.currentTarget.dataset;
    if (url) wx.navigateTo({ url });
  },

  navNow() {
    const v = this.data.now;
    if (!v || !v.canNav) {
      wx.showToast({ title: '现在没有要去的下一个点', icon: 'none' });
      return;
    }
    const view = buildTodayView(new Date(), getState());
    if (view && view.navTarget) openTarget(view.navTarget);
  }
});

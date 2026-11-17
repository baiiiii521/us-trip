import { getState, update } from '../../shared/state.js';
import { CONSULATES, HOTLINE_12308, SOS_TIPS } from '../../shared/data/sos.js';
import { RENTAL, DROPOFF } from '../../shared/data/drive.js';

Page({
  data: {
    consulates: CONSULATES.map((c) => ({ ...c, telShow: c.tel.replace('+1-', '') })),
    hotline: HOTLINE_12308,
    tips: SOS_TIPS,
    rentLabel: '',
    ewr: false,
    rental: RENTAL,
    dropoff: DROPOFF,
    version: ''
  },

  onShow() {
    const s = getState();
    const RENT = { jfk: '全程自驾 · 12/18 JFK 取车', bos: '12/21 波士顿取车', none: '不租车 · 火车/大巴' };
    this.setData({
      rentLabel: RENT[s.rent] || '',
      ewr: !!(s.opts && s.opts.ewr),
      version: getApp().globalData.version || ''
    });
  },

  call911() {
    wx.makePhoneCall({ phoneNumber: '911' });
  },

  call12308() {
    wx.makePhoneCall({ phoneNumber: '01012308', fail: () => this.copy(HOTLINE_12308.tel) });
  },

  callConsulate(e) {
    const { tel } = e.currentTarget.dataset;
    wx.makePhoneCall({ phoneNumber: tel.replace(/[^0-9+]/g, '') });
  },

  copy(text) {
    wx.setClipboardData({ data: String(text), success: () => wx.showToast({ title: '已复制', icon: 'none' }) });
  },

  switchRent() {
    const LABEL = { jfk: '全程自驾 · 12/18 JFK 取车', bos: '12/21 波士顿取车', none: '不租车 · 火车/大巴' };
    const order = ['jfk', 'bos', 'none'];
    const cur = getState().rent || 'jfk';
    const next = order[(order.indexOf(cur) + 1) % order.length];
    update((s) => { s.rent = next; });
    this.setData({ rentLabel: LABEL[next] });
    wx.showToast({ title: `已切换：${LABEL[next]}`, icon: 'none', duration: 2200 });
  },

  toggleEwr() {
    update((s) => { s.opts = s.opts || {}; s.opts.ewr = !s.opts.ewr; });
    this.setData({ ewr: !this.data.ewr });
  },

  soon(e) {
    wx.showToast({ title: `${e.currentTarget.dataset.name} 下一版接入`, icon: 'none' });
  },

  go(e) {
    const { url } = e.currentTarget.dataset;
    if (!url) return;
    wx.navigateTo({ url });
  }
});

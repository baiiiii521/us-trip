// 小技巧：把网站 content.js 里的 TIPS / CHECKLIST / SOURCES 原样搬过来，分组展示。
import { TIPS, CHECKLIST, SOURCES } from '../../shared/data/content.js';

Page({
  data: { groups: [], checklist: [], sources: [], openGroup: 0 },

  onLoad() {
    this.setData({
      groups: TIPS,
      checklist: CHECKLIST,
      sources: SOURCES
    });
  },

  toggle(e) {
    const i = Number(e.currentTarget.dataset.i);
    this.setData({ openGroup: this.data.openGroup === i ? -1 : i });
  },

  copyLink(e) {
    const { url } = e.currentTarget.dataset;
    if (!url) return;
    wx.setClipboardData({
      data: String(url),
      success: () => wx.showToast({ title: '链接已复制', icon: 'none' })
    });
  }
});

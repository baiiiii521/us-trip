import { getState, update, walletOf } from '../../shared/state.js';
import { walletSlots, WALLET_GROUPS } from '../../shared/data/bookings.js';

const FILE_KEY = 'wallet-files'; // 截图只存本机：{ slotId: [本地路径] }

const readFiles = () => {
  try {
    return wx.getStorageSync(FILE_KEY) || {};
  } catch (e) {
    return {};
  }
};

const writeFiles = (v) => {
  try {
    wx.setStorageSync(FILE_KEY, v);
  } catch (e) {
    wx.showToast({ title: '存储满了，先删几张截图', icon: 'none' });
  }
};

Page({
  data: {
    groups: [],
    editing: null,
    form: { v: '', note: '' },
    files: {}
  },

  onShow() {
    this.render();
  },

  render() {
    const s = getState();
    const slots = walletSlots(s);
    const files = readFiles();
    const groups = Object.entries(WALLET_GROUPS)
      .map(([key, label]) => ({
        key,
        label,
        items: slots.filter((x) => x.group === key).map((x) => {
          const w = walletOf(s, x.id);
          return {
            id: x.id,
            title: x.title,
            hint: x.hint || '',
            md: x.md || '',
            v: w && w.v ? w.v : '',
            note: w && w.note ? w.note : '',
            shots: (files[x.id] || []).length,
            cover: (files[x.id] || [])[0] || ''
          };
        })
      }))
      .filter((g) => g.items.length);
    this.setData({ groups, files });
  },

  edit(e) {
    const { id } = e.currentTarget.dataset;
    const s = getState();
    const w = walletOf(s, id);
    const slot = walletSlots(s).find((x) => x.id === id);
    const files = readFiles();
    this.setData({
      editing: { id, title: slot ? slot.title : '', hint: slot ? slot.hint : '', shots: files[id] || [] },
      form: { v: (w && w.v) || '', note: (w && w.note) || '' }
    });
  },

  onV(e) { this.setData({ 'form.v': e.detail.value }); },
  onNote(e) { this.setData({ 'form.note': e.detail.value }); },

  save() {
    const { id } = this.data.editing;
    const { v, note } = this.data.form;
    update((s) => {
      s.wallet[id] = { ...(s.wallet[id] || {}), v: String(v || '').trim(), note: String(note || '').trim(), u: Date.now() };
    });
    this.setData({ editing: null });
    this.render();
    wx.showToast({ title: '存好了', icon: 'success' });
  },

  cancel() {
    this.setData({ editing: null });
  },

  addShot() {
    const { id } = this.data.editing;
    wx.chooseMedia({
      count: 3,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: (res) => {
        const files = readFiles();
        const list = files[id] || [];
        for (const f of res.tempFiles) {
          // 存到小程序的用户目录，App 重启也还在
          const saved = wx.getFileSystemManager().saveFileSync(f.tempFilePath);
          list.push(saved);
        }
        files[id] = list.slice(-6);
        writeFiles(files);
        this.setData({ 'editing.shots': files[id] });
        this.render();
        wx.showToast({ title: `存了 ${res.tempFiles.length} 张`, icon: 'none' });
      }
    });
  },

  previewShot(e) {
    const { src, id } = e.currentTarget.dataset;
    const files = readFiles();
    wx.previewImage({ current: src, urls: files[id] || [src] });
  },

  async removeShot(e) {
    const { src, id } = e.currentTarget.dataset;
    const files = readFiles();
    files[id] = (files[id] || []).filter((p) => p !== src);
    writeFiles(files);
    this.setData({ 'editing.shots': files[id] });
    this.render();
  },

  copyV(e) {
    const { v } = e.currentTarget.dataset;
    if (!v) return;
    wx.setClipboardData({ data: String(v), success: () => wx.showToast({ title: '已复制', icon: 'none' }) });
  },

  noop() {}
});

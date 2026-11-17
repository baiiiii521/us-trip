// ⚠️ 生成文件，不要手改。源头：src/lib/store.js（小程序实现）
// 由 scripts/mp-sync-shared.mjs 生成；改内容请改 src/ 下那份，然后跑 node scripts/mp-sync-shared.mjs

// 小程序没有 localStorage，用 wx 的同步存储，键名和网页保持一致。
export const store = {
  get(key) {
    try {
      const v = wx.getStorageSync(key);
      return v === '' ? null : v;
    } catch (e) {
      return null;
    }
  },
  set(key, value) {
    try {
      wx.setStorageSync(key, value);
    } catch (e) {
      // 10MB 上限满了就静默放弃，下一次改动再试
    }
  }
};

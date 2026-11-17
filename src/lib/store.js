// 存储层：网页用 localStorage，小程序里换一个实现（scripts/mp-sync-shared.mjs 生成）。
// 抽出来是为了让 state.js 这类共用逻辑两边都能跑，改一边不用动另一边。
export const store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null; // 隐私模式、被禁用
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // 配额满了就算了，下一次改动再试
    }
  }
};

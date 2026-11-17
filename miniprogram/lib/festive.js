// 节日彩蛋：12/24 平安夜、12/25 圣诞节，全部界面换成节日装扮。
// 日期按美东时间算（UTC−5），和今天页的「现在」同一个来源：人在纽约，过的是纽约的平安夜。
// 换装靠改 CSS 变量：每个页面第一行的 <page-meta page-style="{{festive.style}}"> 把这些变量盖到 page 上，
// 午夜蓝换成松针绿（平安夜）或酒红（圣诞节），顶栏挂彩灯、全屏下雪，当天第一次打开弹一张贺卡。
import { MEDIA } from './media.js';

const VARS = {
  // 平安夜：松针绿 + 金
  eve: {
    '--night': '#0D3B2E',
    '--night-2': '#14503F',
    '--night-3': '#1C6450',
    '--on-night-2': '#BFDCCD',
    '--go': '#F2B632',
    '--go-press': '#DDA11F',
    '--fest': '#D7263D'
  },
  // 圣诞节：酒红 + 金
  xmas: {
    '--night': '#5E0E1C',
    '--night-2': '#761829',
    '--night-3': '#8E2337',
    '--on-night-2': '#F3CBD1',
    '--go': '#F5C542',
    '--go-press': '#E0AE28',
    '--fest': '#1E8E52'
  }
};

const CARD = {
  eve: {
    title: '平安夜快乐',
    en: 'Merry Christmas Eve',
    line: '今晚中城 7 站：梅西橱窗 → 中央车站圣诞市集 → 洛克菲勒圣诞树 → 广场酒店',
    image: `${MEDIA}christmas-eve.jpg`
  },
  xmas: {
    title: '圣诞快乐',
    en: 'Merry Christmas',
    line: '中午尼克斯 vs 马刺圣诞大战，晚上去 Dyker Heights 看满街的圣诞灯',
    image: `${MEDIA}christmas-day.jpg`
  }
};

// 美东的日期：返回 'eve' / 'xmas' / ''
export function festiveKey(now = new Date()) {
  const d = new Date(now.getTime() - 5 * 3600000);
  if (d.getUTCMonth() !== 11) return '';
  if (d.getUTCDate() === 24) return 'eve';
  if (d.getUTCDate() === 25) return 'xmas';
  return '';
}

export function festiveOf(now = new Date()) {
  const key = festiveKey(now);
  if (!key) return { key: '', style: '' };
  const style = Object.entries(VARS[key]).map(([k, v]) => `${k}:${v}`).join(';');
  return { key, style, ...CARD[key] };
}

// 下雪：固定的一组雪花（位置、大小、速度写死，不用随机数，每次打开都一样）
export const SNOW = Array.from({ length: 16 }, (_, i) => ({
  i,
  left: (i * 37 + 3) % 100,
  size: 10 + ((i * 7) % 4) * 4,
  dur: 7 + ((i * 5) % 6),
  delay: -((i * 13) % 11),
  drift: ((i % 3) - 1) * 24
}));

// 顶栏下沿的一串彩灯
export const BULBS = Array.from({ length: 16 }, (_, i) => ({ i, color: ['#E63A3A', '#F5C542', '#2FB36B', '#4C8DFF'][i % 4], delay: (i % 4) * 300 }));

// 当天第一次打开才弹贺卡；点过「开始今天」就不再弹
export function cardSeen(key, now = new Date()) {
  if (!key) return true;
  try {
    return wx.getStorageSync('festiveSeen') === `${key}-${new Date(now.getTime() - 5 * 3600000).getUTCFullYear()}`;
  } catch (e) {
    return true;
  }
}

export function markCardSeen(key, now = new Date()) {
  try {
    wx.setStorageSync('festiveSeen', `${key}-${new Date(now.getTime() - 5 * 3600000).getUTCFullYear()}`);
  } catch (e) {
    // 存不下就下次再弹一次
  }
}

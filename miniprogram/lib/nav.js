// 导航：小程序打不开 Google/Apple 地图链接，统一用 wx.openLocation 打开内置地图；
// 没有坐标的（比如某个门牌地址）就复制英文地址，提示去地图 App 粘贴。
import { POI_LL } from '../shared/data/extras.js';
import { POIS } from '../shared/data/pois.js';
import { GAMES } from '../shared/data/games.js';
import { PICKUP, DROPOFF } from '../shared/data/drive.js';

const BY_ID = new Map(POIS.map((p) => [p.id, p]));

// 行程条目 → 导航目标：条目自带的 nav → 第一个景点 → 球馆 → 取车/还车点
export function targetFor(item, opts = {}) {
  if (!item) return null;
  if (item.nav && item.nav.q) return { name: item.nav.name || item.nav.q, q: item.nav.q };
  const poiId = (item.pois && item.pois[0]) || (item.game && GAMES[item.game] && GAMES[item.game].arena);
  if (poiId && BY_ID.has(poiId)) {
    const p = BY_ID.get(poiId);
    return { name: p.name, q: p.q, ll: POI_LL[p.id] || null };
  }
  if (item.drive === 'pickup') {
    const k = PICKUP[opts.rent] || PICKUP.jfk;
    return { name: '取车', q: k.q };
  }
  if (item.drive === 'dropoff') return { name: '还车', q: DROPOFF.q };
  return null;
}

export function poiTarget(id) {
  const p = BY_ID.get(id);
  if (!p) return null;
  return { name: p.name, q: p.q, ll: POI_LL[p.id] || null };
}

// 地点词（餐馆自带坐标）→ 导航目标
export function qqTarget(name, q, ll) {
  return { name, q, ll: ll || null };
}

export function openTarget(t) {
  if (!t) {
    wx.showToast({ title: '这一项没有地点', icon: 'none' });
    return;
  }
  if (t.ll && t.ll.length === 2) {
    wx.openLocation({
      latitude: t.ll[0],
      longitude: t.ll[1],
      name: t.name,
      address: t.q || '',
      scale: 16
    });
    return;
  }
  wx.setClipboardData({
    data: t.q || t.name,
    success: () => wx.showToast({ title: '地址已复制，去地图 App 粘贴', icon: 'none', duration: 2500 })
  });
}

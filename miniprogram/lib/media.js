// 城市图：放在自己的服务器上（trip.byb521.com/media/mp/），国内也能打开，不占小程序包体积。
// 白天用真实照片，天黑后换 codex 生成的夜景示意图——同一座城，早晚看到的不一样。
// 生成和更新：node scripts/mp-media.mjs，然后随网站发版。
export const MEDIA = 'https://trip.byb521.com/media/mp/';

// 真实照片的作者和许可（维基共享资源，许可要求署名，所以图上保留）；
// 夜景、封面、球馆图是 codex 生成的，2026-11-17 Barry 要求图上不再标「AI 示意图」（首页底部那行说明还在）
const CREDIT = {
  'bos-day': 'Gaby Azeem · CC0',
  'dc-day': 'Martin Falbisoner · CC BY-SA 3.0',
  'phl-day': 'Rdsmith4 · CC BY-SA 2.5',
  'nyc-day': 'Christian David · CC BY-SA 4.0',
  'la-day': 'web4camguy · CC BY-SA 2.0'
};

// hour：当地钟点（0–23）。7 点到 16 点算白天，其余算晚上（12 月日落 16:15–16:55）
export function cityImage(city, hour) {
  const key = city && CREDIT[`${city}-day`] ? city : 'nyc';
  const night = !(hour >= 7 && hour < 16);
  const name = `${key}-${night ? 'night' : 'day'}`;
  return {
    src: `${MEDIA}${name}.jpg`,
    night,
    credit: night ? '' : `实拍 · ${CREDIT[name]}`
  };
}

export const COVER = { src: `${MEDIA}cover.jpg`, credit: '' };
export const ARENA = { src: `${MEDIA}arena.jpg`, credit: '' };

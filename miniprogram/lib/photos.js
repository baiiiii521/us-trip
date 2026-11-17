// 景点图片：图片地址是构建时抓下来的（scripts/mp-photos.mjs），存在 shared/data/photos.json。
// 小程序里 <image> 可以直接加载 HTTPS 图片，不受「服务器域名」白名单限制，所以不用中转。
import PHOTOS from '../shared/data/photos.js';

export const photoOf = (id) => PHOTOS[id] || null;

// 列表用的缩略图：用接口返回的那份小图地址（维基只认自己做过的尺寸，手改宽高会 400）
export function thumbOf(id) {
  const p = PHOTOS[id];
  if (!p) return null;
  return p.thumb || p.src || null;
}

export const creditLine = (id) => {
  const p = PHOTOS[id];
  if (!p) return '';
  return `${p.credit || '维基共享资源'} · ${p.license || ''}`.replace(/ · $/, '');
};

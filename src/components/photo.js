// 景点图片：优先用自己放在 public/ 的照片，其次维基百科首图，都没有时显示占位明信片。
// 按 taste-skill 规则，图片上和图片下都不放说明文字；版权只在详情页底部写一行（photoCredit）。
import { esc, icon } from '../lib/dom.js';
import { getPhoto } from '../lib/photos.js';
import { CITIES } from '../data/trip.js';

const CAT_ICON = { sight: 'pin', food: 'sun', arena: 'ball', hub: 'train', shop: 'ticket' };

// 胶片相机日期戳：'26 12 20
function stamp(md) {
  if (!md) return '';
  const [m, d] = md.split('/');
  return `<span class="stamp" aria-hidden="true">'26 ${m} ${d}</span>`;
}

function source(poi) {
  if (poi.photo) return { src: poi.photo, own: true };
  return getPhoto(poi.wiki);
}

export function photoHtml(poi, { size = 'card', md = '' } = {}) {
  const ph = source(poi);
  if (ph) {
    return `<figure class="photo photo--${size}">
      <img src="${esc(ph.src)}" alt="${esc(poi.name)}" loading="lazy" decoding="async" onerror="this.closest('figure').classList.add('photo--broken')">
      ${stamp(md)}
    </figure>`;
  }
  const city = CITIES[poi.city];
  return `<figure class="photo photo--${size} photo--ph ph-${poi.city}" aria-label="${esc(poi.name)}">
    <div class="ph">
      <span class="ph__city">${esc(city.en)}</span>
      ${icon(CAT_ICON[poi.cat] || 'pin', 'ph__icon')}
      <span class="ph__en">${esc(poi.en)}</span>
    </div>${stamp(md)}
  </figure>`;
}

// 详情页底部的一行版权
export function photoCredit(poi) {
  const ph = source(poi);
  if (!ph || ph.own) return '';
  const who = ph.artist || '维基共享资源';
  return `照片：${esc(who)}${ph.license ? '，' + esc(ph.license) : ''}，<a class="link" href="${esc(ph.fileUrl || ph.page)}" target="_blank" rel="noopener">查看原图和许可</a>`;
}

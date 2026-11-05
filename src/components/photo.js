// 景点图片：优先用自己放在 public/ 的照片，其次维基百科首图，都没有时显示占位明信片
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

export function photoHtml(poi, { size = 'card', md = '' } = {}) {
  const own = poi.photo ? { src: poi.photo, own: true } : null;
  const ph = own || getPhoto(poi.wiki);
  if (ph) {
    const credit = ph.own ? '' : `<figcaption class="credit">照片：${esc(ph.artist || '维基共享资源')}${ph.license ? ' · ' + esc(ph.license) : ''} · <a href="${esc(ph.fileUrl || ph.page)}" target="_blank" rel="noopener">来源</a></figcaption>`;
    return `<figure class="photo photo--${size}">
      <img src="${esc(ph.src)}" alt="${esc(poi.name)}" loading="lazy" decoding="async" onerror="this.closest('figure').classList.add('photo--broken')">
      ${stamp(md)}${size === 'hero' ? credit : ''}
    </figure>`;
  }
  const city = CITIES[poi.city];
  return `<figure class="photo photo--${size} photo--ph ph-${poi.city}" aria-label="${esc(poi.name)}">
    <div class="ph">
      <span class="ph__city">${esc(city.en.toUpperCase())}</span>
      ${icon(CAT_ICON[poi.cat] || 'pin', 'ph__icon')}
      <span class="ph__en">${esc(poi.en)}</span>
    </div>${stamp(md)}
  </figure>`;
}

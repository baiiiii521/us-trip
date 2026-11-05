// 景点详情弹层内容
import { esc, icon, ext, vendorLinks, buyRow } from '../lib/dom.js';
import { placeUrl, directionsUrl, NAV_APPS } from '../lib/maps.js';
import { CITIES, CATEGORIES } from '../data/trip.js';
import { gameLinks, GAMES } from '../data/games.js';
import { photoHtml, photoCredit } from './photo.js';

export function poiSheetHtml(poi, state, appearsOn = []) {
  const app = state.nav;
  const other = app === 'google' ? 'apple' : 'google';
  const city = CITIES[poi.city];
  const days = appearsOn.map((d) => `<a class="chip" href="#day-${d.id}" data-close>${d.md} ${esc(d.wd)}</a>`).join('');
  const facts = [
    ['开放时间', poi.open], ['门票', poi.ticket], ['建议停留', poi.stay], ['怎么去', poi.transit]
  ].filter(([, v]) => v && v !== '—');
  const game = poi.game ? GAMES[poi.game] : null;
  const credit = photoCredit(poi);

  return `
  <div class="sheet__media">${photoHtml(poi, { size: 'hero', md: appearsOn[0] && appearsOn[0].md })}</div>
  <div class="sheet__body">
    <div class="sheet__eyebrow"><span class="tag tag--${poi.city}">${esc(city.zh)}</span><span class="tag">${esc(CATEGORIES[poi.cat] || '')}</span></div>
    <h2 class="sheet__title" id="sheet-title">${esc(poi.name)}</h2>
    <p class="sheet__sub">${esc(poi.tag || poi.en)}</p>

    <div class="navbar" role="group" aria-label="导航">
      <a class="btn btn--primary" href="${esc(directionsUrl(poi.q, app))}" target="_blank" rel="noopener">${icon('nav')}导航到这里<small>· ${esc(NAV_APPS[app])}，公交</small></a>
      <a class="btn btn--secondary" href="${esc(placeUrl(poi.q, app))}" target="_blank" rel="noopener">${icon('pin')}在地图上查看</a>
      <button class="btn btn--secondary" type="button" data-action="copy" data-text="${esc(poi.q)}">${icon('copy')}<span>复制地址</span></button>
    </div>

    <p class="sheet__intro">${esc(poi.intro)}</p>
    ${poi.highlights && poi.highlights.length ? `<h3 class="sheet__h">看点</h3><ul class="sheet__list">${poi.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}

    ${facts.length ? `<dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    ${poi.tip ? `<p class="callout"><b>提示</b>${esc(poi.tip)}</p>` : ''}

    ${game ? buyRow(`${game.title} ${game.date} 的球票`, gameLinks(poi.game).map((l, i) => ext(l.label, l.url, i === 0)).join('')) : ''}
    ${poi.buy ? buyRow('预约和官网', vendorLinks(poi.buy)) : ''}
    ${days ? `<div class="buys"><span class="buys__label">安排在这几天</span><div class="chips">${days}</div></div>` : ''}

    <div class="sheet__foot">
      <span>用 ${esc(NAV_APPS[other])} 导航：<a class="link" href="${esc(directionsUrl(poi.q, other))}" target="_blank" rel="noopener">打开 ${esc(NAV_APPS[other])}</a></span>
      ${poi.wiki ? `<span><a class="link" href="https://en.wikipedia.org/wiki/${esc(poi.wiki)}" target="_blank" rel="noopener">阅读维基百科条目</a></span>` : ''}
      ${credit ? `<span>${credit}</span>` : ''}
    </div>
  </div>`;
}

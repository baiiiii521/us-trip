// 景点详情弹层内容
import { esc, icon, ext, vendorLinks, buyRow } from '../lib/dom.js';
import { placeUrl, directionsUrl, NAV_APPS } from '../lib/maps.js';
import { CITIES, CATEGORIES } from '../data/trip.js';
import { gameLinks, GAMES } from '../data/games.js';
import { photoHtml } from './photo.js';

export function poiSheetHtml(poi, state, appearsOn = []) {
  const app = state.nav;
  const other = app === 'google' ? 'apple' : 'google';
  const city = CITIES[poi.city];
  const days = appearsOn.map((d) => `<a class="chip chip--day" href="#day-${d.id}" data-close>${d.md} ${esc(d.wd)}</a>`).join('');
  const facts = [
    ['开放', poi.open], ['门票', poi.ticket], ['建议停留', poi.stay], ['怎么去', poi.transit]
  ].filter(([, v]) => v && v !== '—');
  const game = poi.game ? GAMES[poi.game] : null;

  return `
  <div class="sheet__media">${photoHtml(poi, { size: 'hero', md: appearsOn[0] && appearsOn[0].md })}</div>
  <div class="sheet__body">
    <div class="sheet__eyebrow"><span class="tag tag--${poi.city}">${esc(city.zh)}</span><span class="tag">${esc(CATEGORIES[poi.cat] || '')}</span>${poi.tag ? `<span class="sheet__tagline">${esc(poi.tag)}</span>` : ''}</div>
    <h2 class="sheet__title" id="sheet-title">${esc(poi.name)}</h2>
    <p class="sheet__en">${esc(poi.en)}</p>

    <div class="navbar" role="group" aria-label="导航">
      <a class="btn btn--primary" href="${esc(directionsUrl(poi.q, app))}" target="_blank" rel="noopener">${icon('nav')}导航过去<small>${esc(NAV_APPS[app])} · 公交</small></a>
      <a class="btn" href="${esc(placeUrl(poi.q, app))}" target="_blank" rel="noopener">${icon('pin')}看地图</a>
      <button class="btn" type="button" data-action="copy" data-text="${esc(poi.q)}">${icon('copy')}复制地址</button>
      <a class="btn btn--ghost" href="${esc(directionsUrl(poi.q, other))}" target="_blank" rel="noopener">用${esc(NAV_APPS[other])}</a>
    </div>

    <p class="sheet__intro">${esc(poi.intro)}</p>
    ${poi.highlights && poi.highlights.length ? `<h3 class="sheet__h">看点</h3><ul class="sheet__list">${poi.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}

    ${facts.length ? `<dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    ${poi.tip ? `<p class="callout"><b>提示</b>${esc(poi.tip)}</p>` : ''}

    ${game ? buyRow('买票 · ' + game.title + ' ' + game.date, gameLinks(poi.game).map((l, i) => ext(l.label, l.url, i === 0)).join('')) : ''}
    ${poi.buy ? buyRow('预约 / 官网', vendorLinks(poi.buy)) : ''}
    ${days ? `<div class="sheet__days"><span class="buys__label">行程里出现在</span><div class="chips">${days}</div></div>` : ''}
    ${poi.wiki ? `<p class="sheet__more"><a href="https://en.wikipedia.org/wiki/${esc(poi.wiki)}" target="_blank" rel="noopener">在维基百科了解更多</a></p>` : ''}
  </div>`;
}

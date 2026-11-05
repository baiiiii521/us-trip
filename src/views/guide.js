// 景点图鉴：按城市、类型筛选，点卡片看详情
import { esc, icon } from '../lib/dom.js';
import { POIS } from '../data/pois.js';
import { CITIES, CATEGORIES } from '../data/trip.js';
import { buildDays } from '../data/days.js';
import { poiAppearances } from '../lib/index.js';
import { photoHtml } from '../components/photo.js';

export const guideUi = { city: 'all', cat: 'all' };

export function renderGuide(state) {
  const days = buildDays(state);
  const app = poiAppearances(days);
  const list = POIS.filter((p) => (guideUi.city === 'all' || p.city === guideUi.city) && (guideUi.cat === 'all' || p.cat === guideUi.cat));
  const cityChips = [['all', '全部'], ...Object.entries(CITIES).map(([k, v]) => [k, v.zh])]
    .map(([k, v]) => `<button type="button" class="chip${guideUi.city === k ? ' is-on' : ''}" data-action="guide-filter" data-key="city" data-value="${k}" aria-pressed="${guideUi.city === k}">${esc(v)}</button>`).join('');
  const catChips = [['all', '全部类型'], ...Object.entries(CATEGORIES)]
    .map(([k, v]) => `<button type="button" class="chip chip--soft${guideUi.cat === k ? ' is-on' : ''}" data-action="guide-filter" data-key="cat" data-value="${k}" aria-pressed="${guideUi.cat === k}">${esc(v)}</button>`).join('');

  return `
  <div class="pagehead"><h1>景点图鉴</h1><p>${POIS.length} 个地点：介绍、看点、开放时间、门票、怎么去和导航。照片来自维基百科，作者和许可写在详情页。</p></div>
  <div class="filters"><div class="chips">${cityChips}</div><div class="chips">${catChips}</div></div>
  <p class="count">${list.length} 个地点</p>
  <div class="poigrid">${list.map((p) => {
    const ds = app[p.id] || [];
    return `<button type="button" class="poicard" data-action="poi" data-id="${p.id}">
      ${photoHtml(p, { size: 'card', md: ds[0] && ds[0].md })}
      <span class="poicard__body">
        <span class="poicard__meta"><span class="tag tag--${p.city}">${esc(CITIES[p.city].zh)}</span>${ds.length ? `<span class="poicard__days">${ds.map((d) => d.md).join(' · ')}</span>` : '<span class="poicard__days">备选</span>'}</span>
        <b class="poicard__name">${esc(p.name)}</b>
        <span class="poicard__tag">${esc(p.tag || '')}</span>
      </span>
    </button>`;
  }).join('') || '<p class="empty">没有符合条件的地点。</p>'}</div>`;
  void icon;
}

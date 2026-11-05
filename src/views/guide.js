// 景点图鉴：搜索 + 按城市、类型筛选，点卡片看详情
import { esc, icon } from '../lib/dom.js';
import { POIS } from '../data/pois.js';
import { CITIES, CATEGORIES } from '../data/trip.js';
import { buildDays } from '../data/days.js';
import { poiAppearances } from '../lib/index.js';
import { photoHtml } from '../components/photo.js';
import { visitOf } from '../state.js';

export const guideUi = { city: 'all', cat: 'all', q: '', visit: 'all' };
let visitState = {};

function matches(p) {
  if (guideUi.city !== 'all' && p.city !== guideUi.city) return false;
  if (guideUi.cat !== 'all' && p.cat !== guideUi.cat) return false;
  if (guideUi.visit !== 'all' && visitOf(visitState, p.id) !== guideUi.visit) return false;
  const q = guideUi.q.trim().toLowerCase();
  if (!q) return true;
  return [p.name, p.en, p.tag, p.intro, p.tip, ...(p.highlights || []), CITIES[p.city].zh].some((v) => v && v.toLowerCase().includes(q));
}

// 只渲染结果区，搜索输入时调用，不打断输入框
export function guideResultsHtml(state) {
  visitState = state;
  const app = poiAppearances(buildDays(state));
  const list = POIS.filter(matches);
  return `<p class="count" aria-live="polite">${list.length} 个地点</p>
  <div class="poigrid">${list.map((p) => {
    const ds = app[p.id] || [];
    return `<button type="button" class="poicard m-card m-zoom" data-action="poi" data-id="${p.id}">
      ${photoHtml(p, { size: 'card', md: ds[0] && ds[0].md })}
      <span class="poicard__body">
        <span class="poicard__meta"><span class="tag tag--${p.city}">${esc(CITIES[p.city].zh)}</span><span class="poicard__days">${ds.length ? ds.map((d) => d.md).join(' · ') : '备选'}</span></span>
        <b class="poicard__name">${esc(p.name)}${visitOf(state, p.id) === 'been' ? ' <span class="tag tag--ok">去过</span>' : visitOf(state, p.id) === 'want' ? ' <span class="tag">想去</span>' : ''}</b>
        <span class="poicard__tag">${esc(p.tag || '')}</span>
      </span>
    </button>`;
  }).join('') || '<p class="empty">没有符合条件的地点，换个关键词或清除筛选。</p>'}</div>`;
}

export function renderGuide(state) {
  const cityChips = [['all', '全部城市'], ...Object.entries(CITIES).map(([k, v]) => [k, v.zh])]
    .map(([k, v]) => `<button type="button" class="chip${guideUi.city === k ? ' is-on' : ''}" data-action="guide-filter" data-key="city" data-value="${k}" aria-pressed="${guideUi.city === k}">${esc(v)}</button>`).join('');
  const catChips = [['all', '全部类型'], ...Object.entries(CATEGORIES)]
    .map(([k, v]) => `<button type="button" class="chip${guideUi.cat === k ? ' is-on' : ''}" data-action="guide-filter" data-key="cat" data-value="${k}" aria-pressed="${guideUi.cat === k}">${esc(v)}</button>`).join('');

  return `
  <div class="pagehead"><h1>景点图鉴</h1><p>${POIS.length} 个地点的介绍、开放时间、门票和走法，每个都能一键导航。照片来自维基百科。</p></div>
  <div class="filters">
    <label class="search" for="guide-q"><span class="visually-hidden">搜索景点</span>${icon('guide')}
      <input id="guide-q" type="search" placeholder="搜索景点，例如 大桥、披萨、Met" value="${esc(guideUi.q)}" autocomplete="off" data-guide-search></label>
    <div class="chips" role="group" aria-label="城市">${cityChips}</div>
    <div class="chips" role="group" aria-label="类型">${catChips}</div>
    <div class="chips" role="group" aria-label="打卡">${[['all', '全部'], ['want', '想去'], ['been', '去过']].map(([k, v]) => `<button type="button" class="chip${guideUi.visit === k ? ' is-on' : ''}" data-action="guide-filter" data-key="visit" data-value="${k}" aria-pressed="${guideUi.visit === k}">${esc(v)}</button>`).join('')}</div>
  </div>
  <div id="guide-results">${guideResultsHtml(state)}</div>`;
}

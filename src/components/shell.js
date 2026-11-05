// 外壳：顶栏、桌面标签、手机底部导航、弹层容器
import { icon, esc, usd, cny, brandMark } from '../lib/dom.js';
import { budgetTotal } from '../lib/calc.js';
import { TRIP } from '../data/trip.js';

export const ROUTES = [
  { id: 'home', label: '总览', icon: 'home' },
  { id: 'days', label: '行程', icon: 'days' },
  { id: 'guide', label: '景点', icon: 'guide' },
  { id: 'tickets', label: '票务', icon: 'ticket' },
  { id: 'budget', label: '预算', icon: 'wallet' },
  { id: 'info', label: '资料', icon: 'info' }
];

export function shellHtml() {
  const tabs = ROUTES.map((r) => `<a href="#${r.id}" class="tab" data-route="${r.id}">${esc(r.label)}</a>`).join('');
  const bottom = ROUTES.map((r) => `<a href="#${r.id}" class="bb" data-route="${r.id}">${icon(r.icon)}<span>${esc(r.label)}</span></a>`).join('');
  return `
  <header class="topbar">
    <div class="topbar__in">
      <a class="brand" href="#home" aria-label="${esc(TRIP.title)} 首页">
        ${brandMark}<span class="brand__name">${esc(TRIP.titleEn)}</span>
      </a>
      <nav class="tabs" aria-label="主导航">${tabs}</nav>
      <button class="total" type="button" data-action="open-settings" aria-label="方案设置和总价">
        <span class="total__usd" id="total-usd">$—</span>
        <span class="total__cny" id="total-cny">≈ ¥—</span>
      </button>
      <button class="iconbtn" type="button" data-action="open-settings" aria-label="方案设置">${icon('gear')}</button>
    </div>
  </header>
  <main id="view" class="view" tabindex="-1"></main>
  <nav class="bottombar" aria-label="主导航">${bottom}</nav>
  <dialog id="sheet" class="sheet" aria-labelledby="sheet-title">
    <button class="sheet__close iconbtn" type="button" data-action="close-sheet" aria-label="关闭">${icon('close')}</button>
    <div id="sheet-content"></div>
  </dialog>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>`;
}

export function updateShell(state, route) {
  const total = budgetTotal(state);
  const u = document.getElementById('total-usd');
  const c = document.getElementById('total-cny');
  if (u) u.textContent = usd(total);
  if (c) c.textContent = '≈ ' + cny(total * (+state.budget.rate || 0));
  document.querySelectorAll('[data-route]').forEach((a) => {
    const on = a.dataset.route === route;
    a.classList.toggle('is-on', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

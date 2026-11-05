// 入口：外壳、路由（#home #days #guide #tickets #budget #info，以及 #day-1220、#poi-xxx 深链）、事件委托
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/motion.css';

import { getState, update, subscribe, resetState } from './state.js';
import { choicesForMode } from './lib/calc.js';
import { icon } from './lib/dom.js';
import { loadPhotos, onPhotos } from './lib/photos.js';
import { poiAppearances } from './lib/index.js';
import { POI, POIS } from './data/pois.js';
import { buildDays } from './data/days.js';
import { shellHtml, updateShell, ROUTES } from './components/shell.js';
import { settingsHtml } from './components/settings.js';
import { poiSheetHtml } from './components/poi-sheet.js';
import { renderHome } from './views/home.js';
import { renderDays } from './views/days.js';
import { renderGuide, guideUi, guideResultsHtml } from './views/guide.js';
import { renderTickets } from './views/tickets.js';
import { renderBudget, budgetOutputHtml } from './views/budget.js';
import { renderInfo, infoUi } from './views/info.js';

const VIEWS = { home: renderHome, days: renderDays, guide: renderGuide, tickets: renderTickets, budget: renderBudget, info: renderInfo };
const TITLES = Object.fromEntries(ROUTES.map((r) => [r.id, r.label]));

const app = document.getElementById('app');
app.innerHTML = shellHtml();
const view = document.getElementById('view');
const sheet = document.getElementById('sheet');
const sheetContent = document.getElementById('sheet-content');

let route = 'home';
let sheetKind = null; // 'poi' | 'settings'
let sheetPoi = null;

/* ---------- 路由 ---------- */
function parseHash() {
  const h = (location.hash || '').replace(/^#/, '');
  if (VIEWS[h]) return { route: h };
  const day = h.match(/^day-(\d{4})$/);
  if (day) return { route: 'days', day: day[1] };
  const poi = h.match(/^poi-([a-z0-9-]+)$/);
  if (poi && POI[poi[1]]) return { route: 'guide', poi: poi[1] };
  return { route: 'home' };
}

// 重绘后把键盘焦点放回同一个控件（按 id 或 data-action + data-key/value/id 找）
function focusKey(el) {
  if (!el || el === document.body || !view.contains(el)) return null;
  if (el.id) return '#' + CSS.escape(el.id);
  const a = el.dataset || {};
  if (!a.action) return null;
  let sel = `[data-action="${a.action}"]`;
  for (const k of ['key', 'value', 'id', 'leg', 'kind', 'tab']) if (a[k] != null) sel += `[data-${k}="${CSS.escape(a[k])}"]`;
  return sel;
}

const FOOT = `<footer class="app-foot"><span>信息核对于 2026 年 11 月 5 日，出发前一周再核对一次</span><span>景点照片来自维基共享资源，作者和许可写在每个景点详情底部</span></footer>`;

function render({ keepScroll = false } = {}) {
  const state = getState();
  const y = window.scrollY;
  const fk = focusKey(document.activeElement);
  view.innerHTML = VIEWS[route](state) + FOOT;
  if (fk) { const el = view.querySelector(fk); if (el) el.focus({ preventScroll: true }); }
  updateShell(state, route);
  document.title = `${TITLES[route]} · 美东圣诞篮球行`;
  if (keepScroll) window.scrollTo(0, y);
  if (sheet.open) refreshSheet();
}

function scrollToDay(id) {
  const el = document.getElementById('day-' + id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset();
  window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  document.querySelectorAll('.strip__d').forEach((a) => a.classList.toggle('is-on', a.dataset.day === id));
  const chip = document.querySelector(`.strip__d[data-day="${id}"]`);
  if (chip) chip.scrollIntoView({ inline: 'center', block: 'nearest' });
}

function stickyOffset() {
  const bar = document.querySelector('.topbar');
  const strip = document.querySelector('.strip');
  return (bar ? bar.offsetHeight : 0) + (strip ? strip.offsetHeight : 0) + 12;
}

function onRoute() {
  const r = parseHash();
  const changed = r.route !== route;
  route = r.route;
  if (changed || !view.innerHTML) { render(); window.scrollTo(0, 0); }
  if (r.day) requestAnimationFrame(() => scrollToDay(r.day));
  if (r.poi) openPoi(r.poi);
}

/* ---------- 弹层 ---------- */
function showSheet() {
  if (!sheet.open) {
    if (typeof sheet.showModal === 'function') sheet.showModal(); else sheet.setAttribute('open', '');
  }
  sheet.scrollTop = 0;
}
function closeSheet() {
  if (typeof sheet.close === 'function') sheet.close(); else sheet.removeAttribute('open');
}
function refreshSheet() {
  const state = getState();
  if (sheetKind === 'poi' && sheetPoi) {
    const app = poiAppearances(buildDays(state));
    sheetContent.innerHTML = poiSheetHtml(POI[sheetPoi], state, app[sheetPoi] || []);
  } else if (sheetKind === 'settings') {
    sheetContent.innerHTML = `<div class="sheet__body"><h2 class="sheet__title" id="sheet-title">方案设置</h2>${settingsHtml(state)}</div>`;
  }
}
function openPoi(id) {
  sheetKind = 'poi'; sheetPoi = id;
  sheet.className = 'sheet sheet--poi';
  refreshSheet(); showSheet();
}
function openSettings() {
  sheetKind = 'settings'; sheetPoi = null;
  sheet.className = 'sheet sheet--settings';
  refreshSheet(); showSheet();
}
sheet.addEventListener('click', (e) => {
  // 点到弹层外的背景关闭
  if (e.target === sheet) closeSheet();
  if (e.target.closest('[data-close]')) closeSheet();
});
sheet.addEventListener('close', () => {
  if (/^#poi-/.test(location.hash)) history.replaceState(null, '', '#guide');
});

/* ---------- 提示 ---------- */
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('is-on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-on'), 2200);
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('已复制：' + text); }
  catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove(); toast(ok ? '已复制：' + text : '复制失败，请长按地址手动复制');
  }
}

/* ---------- 事件委托 ---------- */
const ACTIONS = {
  poi: (el) => openPoi(el.dataset.id),
  'open-settings': () => openSettings(),
  'close-sheet': () => closeSheet(),
  copy: async (el) => {
    await copyText(el.dataset.text);
    const ic = el.querySelector('.ic');
    const label = el.querySelector('span');
    if (!ic) return;
    const old = ic.outerHTML;
    ic.outerHTML = icon('check');
    el.setAttribute('data-copied', '');
    if (label) label.textContent = '已复制';
    setTimeout(() => {
      const now = el.querySelector('.ic'); if (now) now.outerHTML = old;
      el.removeAttribute('data-copied');
      if (label) label.textContent = '复制地址';
    }, 1600);
  },
  set: (el) => {
    const { key, value } = el.dataset;
    update((s) => {
      if (key === 'mode') s.choice = choicesForMode(value);
      else s[key] = value;
    });
    if (key === 'plan') toast(value === 'A' ? '已切到方案 A：不看凯尔特人' : value === 'C' ? '已切到方案 C：波士顿多住一晚' : '已切到方案 B：凌晨大巴');
  },
  leg: (el) => update((s) => { s.choice[el.dataset.leg] = el.dataset.kind; }),
  todo: (el) => update((s) => { s.todo[el.dataset.id] = !s.todo[el.dataset.id]; }),
  'guide-filter': (el) => { guideUi[el.dataset.key] = el.dataset.value; render({ keepScroll: true }); },
  'info-tab': (el) => { infoUi.tab = el.dataset.tab; if (route === 'info') render({ keepScroll: true }); },
  reset: () => { resetState(); toast('已恢复默认设置'); }
};

document.addEventListener('click', (e) => {
  // 已在行程页时，再点同一个日期也能滚过去（hash 没变不会触发 hashchange）
  const dayLink = e.target.closest('a[href^="#day-"]');
  if (dayLink && route === 'days' && !dayLink.closest('dialog')) {
    e.preventDefault();
    const id = dayLink.getAttribute('href').slice(5);
    history.replaceState(null, '', '#day-' + id);
    scrollToDay(id);
    return;
  }
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.action];
  if (!fn) return;
  if (el.tagName === 'BUTTON') e.preventDefault();
  fn(el);
});

// 景点搜索：只刷新结果区
document.addEventListener('input', (e) => {
  if (!e.target.matches('[data-guide-search]')) return;
  guideUi.q = e.target.value;
  const box = document.getElementById('guide-results');
  if (box) box.innerHTML = guideResultsHtml(getState());
});

// 预算输入：只刷新明细和顶栏总价，不重绘输入框
document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-bind]');
  if (!el) return;
  const [group, key] = el.dataset.bind.split('.');
  const value = el.type === 'checkbox' ? el.checked : parseFloat(el.value);
  update((s) => { s[group][key] = el.type === 'checkbox' ? value : (Number.isFinite(value) ? value : 0); }, { silent: true });
  const out = document.getElementById('budget-out');
  if (out) out.innerHTML = budgetOutputHtml(getState());
  updateShell(getState(), route);
});

subscribe(() => render({ keepScroll: true }));
window.addEventListener('hashchange', onRoute);

// 日期条跟随滚动高亮
let stripRaf;
window.addEventListener('scroll', () => {
  if (route !== 'days') return;
  cancelAnimationFrame(stripRaf);
  stripRaf = requestAnimationFrame(() => {
    const off = stickyOffset() + 40;
    let cur = null;
    document.querySelectorAll('.day').forEach((d) => { if (d.getBoundingClientRect().top <= off) cur = d.id.slice(4); });
    if (!cur) return;
    document.querySelectorAll('.strip__d').forEach((a) => a.classList.toggle('is-on', a.dataset.day === cur));
  });
}, { passive: true });

onRoute();

// 照片：后台读取，拿到后刷新当前页
onPhotos(() => render({ keepScroll: true }));
loadPhotos(POIS.map((p) => p.wiki));

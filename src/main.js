// 入口：外壳、路由、事件委托。
// 路由：#home #days #guide #tickets #money #more，子页 #wallet #cards #memories #info，
// 深链 #day-1220、#poi-xxx、#order-<订单格子>、#budget（花费里的预算）、#sync（更多里的同步）
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/motion.css';
import './styles/features.css';

import { getState, update, subscribe, resetState, isDone, visitOf } from './state.js';
import { choicesForMode } from './lib/calc.js';
import { icon } from './lib/dom.js';
import { loadPhotos, onPhotos, photoUrls } from './lib/photos.js';
import { poiAppearances } from './lib/index.js';
import { POI, POIS } from './data/pois.js';
import { GAMES } from './data/games.js';
import { LEGS } from './data/legs.js';
import { CITIES } from './data/trip.js';
import { buildDays } from './data/days.js';
import { shellHtml, updateShell, ROUTES, SUBPAGES } from './components/shell.js';
import { settingsHtml } from './components/settings.js';
import { poiSheetHtml } from './components/poi-sheet.js';
import { gamedaySheetHtml } from './components/gameday.js';
import { renderHome } from './views/home.js';
import { renderDays } from './views/days.js';
import { renderGuide, guideUi, guideResultsHtml } from './views/guide.js';
import { renderTickets } from './views/tickets.js';
import { budgetOutputHtml } from './views/budget.js';
import { renderInfo, infoUi } from './views/info.js';
import { renderMoney, moneyUi } from './views/money.js';
import { renderMore, moreUi } from './views/more.js';
import { renderWallet, slotSheetHtml, walletFiles, loadWalletFiles } from './views/wallet.js';
import { renderCards, cardsUi, hotelSheetHtml, bigCardHtml } from './views/cards.js';
import { renderMemories, memUi, loadMemories } from './views/memories.js';
import { files, uid } from './lib/storage.js';
import { fetchRate } from './lib/money.js';
import { loadWeather, weatherFor, codeLabel } from './lib/weather.js';
import { findToday, keyEvents } from './lib/today.js';
import { askPermission, notifyPermission, scheduleReminders } from './lib/notify.js';
import { registerSW, onPwaChange, promptInstall, warmUrls } from './lib/pwa.js';
import { syncDoc, mergeDocs, encodeShare, decodeShare, cloudSync } from './lib/sync.js';
import { photoDate, tripDayOf } from './lib/exif.js';
import { makeRecap, loadBitmap } from './lib/recap.js';
import { drawShareCard } from './lib/sharecard.js';

// 条目首图非自由版权（或没有首图）的景点，用 Commons 上指定文件的照片兜底
const POI_FILES = Object.fromEntries(POIS.filter((x) => x.wiki && x.photoFile).map((x) => [x.wiki, x.photoFile]));

const VIEWS = {
  home: renderHome, days: renderDays, guide: renderGuide, tickets: renderTickets, money: renderMoney, more: renderMore,
  wallet: renderWallet, cards: renderCards, memories: renderMemories, info: renderInfo
};
const TITLES = { ...Object.fromEntries(ROUTES.map((r) => [r.id, r.label])), ...Object.fromEntries(Object.entries(SUBPAGES).map(([k, v]) => [k, v.label])) };

const app = document.getElementById('app');
app.innerHTML = shellHtml();
const view = document.getElementById('view');
const sheet = document.getElementById('sheet');
const sheetContent = document.getElementById('sheet-content');

let route = 'home';
let sheetKind = null; // 'poi' | 'settings' | 'slot' | 'gameday' | 'hotel' | 'html'
let sheetArg = null;
let sheetHtml = '';
const ctx = { now: new Date(), weather: null };

// “现在”：预览模式下用设置的时间，否则用真实时间
function currentNow(state) {
  const p = state.local && state.local.preview;
  const d = p ? new Date(p) : null;
  return d && !isNaN(d) ? d : new Date();
}

/* ---------- 路由 ---------- */
function parseHash() {
  const h = (location.hash || '').replace(/^#/, '');
  if (VIEWS[h]) return { route: h };
  if (h === 'budget') return { route: 'money', tab: 'budget' };
  if (h === 'sync') return { route: 'more', scrollTo: 'sync' };
  const day = h.match(/^day-(\d{4})$/);
  if (day) return { route: 'days', day: day[1] };
  const poi = h.match(/^poi-([a-z0-9-]+)$/);
  if (poi && POI[poi[1]]) return { route: 'guide', poi: poi[1] };
  const order = h.match(/^order-([a-z0-9-]+)$/);
  if (order) return { route: null, order: order[1] };
  return { route: 'home' };
}

// 重绘后把键盘焦点放回同一个控件
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

// 正在输入的表单不要被重绘打断
function typing() {
  const a = document.activeElement;
  return a && view.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type !== 'checkbox' && a.type !== 'radio' && a.type !== 'file';
}

function render({ keepScroll = false } = {}) {
  const state = getState();
  ctx.now = currentNow(state);
  const y = window.scrollY;
  const fk = focusKey(document.activeElement);
  view.innerHTML = VIEWS[route](state, ctx) + FOOT;
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

function enterRoute(r) {
  if (r === 'memories' && !memUi.loaded) loadMemories().then(() => { if (route === 'memories') render({ keepScroll: true }); }).catch(() => {});
  if (r === 'wallet' || r === 'tickets' || r === 'days' || r === 'home') { /* 订单附件索引启动时已读取 */ }
}

function onRoute() {
  const r = parseHash();
  if (r.tab) moneyUi.tab = r.tab;
  const target = r.route || (view.innerHTML ? route : 'wallet');
  const changed = target !== route;
  route = target;
  if (changed || !view.innerHTML || r.tab) { enterRoute(route); render(); if (!r.order) window.scrollTo(0, 0); }
  if (r.day) requestAnimationFrame(() => scrollToDay(r.day));
  if (r.scrollTo) requestAnimationFrame(() => { const el = document.getElementById(r.scrollTo); if (el) el.scrollIntoView({ block: 'start' }); });
  if (r.poi) openPoi(r.poi);
  if (r.order) openSlot(r.order);
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
async function hydrateThumbs() {
  for (const el of sheetContent.querySelectorAll('[data-thumb]')) {
    const rec = await files.get(el.dataset.thumb).catch(() => null);
    if (rec && rec.blob && /^image\//.test(rec.type)) {
      const img = new Image(); img.alt = rec.name; img.src = URL.createObjectURL(rec.blob);
      el.textContent = ''; el.appendChild(img);
    }
  }
}
function refreshSheet() {
  const state = getState();
  if (sheetKind === 'poi' && sheetArg) {
    const appr = poiAppearances(buildDays(state));
    sheetContent.innerHTML = poiSheetHtml(POI[sheetArg], state, appr[sheetArg] || []);
  } else if (sheetKind === 'settings') {
    sheetContent.innerHTML = `<div class="sheet__body"><h2 class="sheet__title" id="sheet-title">方案设置</h2>${settingsHtml(state)}</div>`;
  } else if (sheetKind === 'slot') {
    sheetContent.innerHTML = slotSheetHtml(state, sheetArg); hydrateThumbs();
  } else if (sheetKind === 'gameday') {
    sheetContent.innerHTML = gamedaySheetHtml(state, sheetArg);
  } else if (sheetKind === 'hotel') {
    sheetContent.innerHTML = hotelSheetHtml(state, sheetArg);
  } else if (sheetKind === 'html') {
    sheetContent.innerHTML = sheetHtml;
  }
}
function openSheet(kind, arg, cls) {
  sheetKind = kind; sheetArg = arg;
  sheet.className = 'sheet ' + cls;
  refreshSheet(); showSheet();
}
const openPoi = (id) => openSheet('poi', id, 'sheet--poi');
const openSettings = () => openSheet('settings', null, 'sheet--settings');
const openSlot = (id) => openSheet('slot', id, 'sheet--settings');
const openGameday = (id) => openSheet('gameday', id, 'sheet--settings');
const openHotel = (city) => openSheet('hotel', city, 'sheet--settings');
function openHtml(html, cls = 'sheet--settings') { sheetHtml = html; openSheet('html', null, cls); }

sheet.addEventListener('click', (e) => {
  if (e.target === sheet) closeSheet();
  if (e.target.closest('[data-close]')) closeSheet();
});
sheet.addEventListener('close', () => {
  if (/^#(poi|order)-/.test(location.hash)) history.replaceState(null, '', '#' + route);
  sheetKind = null; sheetArg = null;
});

/* ---------- 提示 ---------- */
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('is-on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-on'), 2600);
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('已复制：' + text.slice(0, 40)); }
  catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove(); toast(ok ? '已复制：' + text.slice(0, 40) : '复制失败，请长按手动复制');
  }
}

const rerender = () => render({ keepScroll: true });

/* ---------- 提醒 ---------- */
function armReminders() {
  const state = getState();
  if (!state.local.remind || notifyPermission() !== 'granted') { scheduleReminders([]); return 0; }
  const now = currentNow(state);
  const events = [];
  for (const d of buildDays(state)) {
    for (const x of keyEvents(d)) {
      const title = x.it.leg ? `${LEGS[x.it.leg].route}` : GAMES[x.it.game].title;
      events.push({ at: x.at, title, body: x.it.leg ? '带好订单号和证件，提前到车站' : '带好电子票和证件，注意包袋规定' });
    }
  }
  return scheduleReminders(events, now);
}

/* ---------- 动作 ---------- */
const stamp = () => Date.now();
const ACTIONS = {
  poi: (el) => openPoi(el.dataset.id),
  'open-settings': () => openSettings(),
  'close-sheet': () => closeSheet(),
  gameday: (el) => openGameday(el.dataset.id),
  'hotel-edit': (el) => openHotel(el.dataset.city),
  bigcard: (el) => openHtml(bigCardHtml(el.dataset.en, el.dataset.zh), 'sheet--big'),
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
      const cur = el.querySelector('.ic'); if (cur) cur.outerHTML = old;
      el.removeAttribute('data-copied');
      if (label) label.textContent = '复制地址';
    }, 1600);
  },
  set: (el) => {
    const { key, value } = el.dataset;
    update((s) => {
      if (key === 'mode') s.choice = choicesForMode(value);
      else if (key.startsWith('opts.')) s.opts[key.slice(5)] = value === 'true';
      else s[key] = value;
    });
    if (key === 'opts.ewr') toast(value === 'true' ? '12/30 改为住纽瓦克机场酒店，预算和订单夹已更新' : '12/30 改为机场过夜，预算已去掉酒店');
    if (key === 'plan') toast(value === 'A' ? '已切到方案 A：不看凯尔特人' : value === 'C' ? '已切到方案 C：波士顿多住一晚' : '已切到方案 B：凌晨大巴');
  },
  leg: (el) => update((s) => { s.choice[el.dataset.leg] = el.dataset.kind; }),
  todo: (el) => update((s) => { s.todo[el.dataset.id] = { v: !isDone(s, el.dataset.id), u: stamp() }; }),
  visit: (el) => update((s) => {
    const cur = visitOf(s, el.dataset.id);
    s.visited[el.dataset.id] = { v: cur === el.dataset.value ? '' : el.dataset.value, u: stamp() };
  }),
  'guide-filter': (el) => { guideUi[el.dataset.key] = el.dataset.value; if (route === 'guide') render({ keepScroll: true }); },
  'info-tab': (el) => { infoUi.tab = el.dataset.tab; if (route === 'info') render({ keepScroll: true }); },
  'money-tab': (el) => { moneyUi.tab = el.dataset.tab; render({ keepScroll: true }); },
  'fx-live': async () => {
    const r = await fetchRate();
    if (!r) return toast('取不到实时汇率，先用手动汇率');
    update((s) => { s.budget.rate = Math.round(r * 1000) / 1000; });
    toast(`已更新：1 美元 = ¥${r.toFixed(3)}`);
  },
  'exp-del': (el) => update((s) => { s.expenses[el.dataset.id] = { del: true, u: stamp() }; }),
  reset: () => { resetState(); toast('已恢复默认设置'); },

  'file-open': async (el) => {
    const rec = await files.get(el.dataset.id).catch(() => null);
    if (rec && rec.blob) window.open(URL.createObjectURL(rec.blob), '_blank');
  },
  'file-del': async (el) => {
    await files.del(el.dataset.id).catch(() => {});
    await loadWalletFiles(); refreshSheet(); rerender();
  },

  'remind-toggle': async () => {
    const on = getState().local.remind && notifyPermission() === 'granted';
    if (on) { update((s) => { s.local.remind = false; }); armReminders(); return toast('提醒已关闭'); }
    const p = await askPermission();
    if (p !== 'granted') return toast('没有通知权限，请在浏览器或系统设置里允许');
    update((s) => { s.local.remind = true; });
    toast(`提醒已开启，接下来 24 小时内有 ${armReminders()} 条`);
  },
  install: async () => { const ok = await promptInstall(); if (ok) toast('已添加到主屏幕'); },
  'warm-photos': async () => {
    const urls = photoUrls();
    if (!urls.length) return toast('还没有读到景点照片，请先联网并打开一次景点图鉴');
    moreUi.busy = 'warm'; moreUi.warm = 0; rerender();
    await warmUrls(urls, (p) => { moreUi.warm = p; if (Math.round(p * 20) % 2 === 0) rerender(); });
    moreUi.busy = ''; rerender(); toast(`已下载 ${urls.length} 张景点照片`);
  },
  'preview-clear': () => { update((s) => { s.local.preview = ''; }); toast('已回到真实时间'); },

  'share-make': async () => { moreUi.share = await encodeShare(syncDoc(getState())); rerender(); },
  'share-copy': () => copyText(moreUi.share),
  'share-import': async () => {
    const box = document.querySelector('[data-share-box]');
    try {
      const doc = await decodeShare(box ? box.value : '');
      const merged = mergeDocs(syncDoc(getState()), doc);
      update((s) => { Object.assign(s, merged); s.local.lastSync = Date.now(); });
      moreUi.share = ''; moreUi.msg = '已合并同伴的数据。'; rerender();
    } catch (e) { moreUi.msg = '同步码不对，请完整复制后再试：' + e.message; rerender(); }
  },

  'mem-del': async (el) => {
    await files.del(el.dataset.id).catch(() => {});
    await loadMemories(); rerender();
  },
  recap: async () => {
    const state = getState();
    const days = buildDays(state);
    const seen = new Set();
    const list = memUi.photos.filter((p) => p.day !== 'other').map((p) => {
      const d = days.find((x) => x.id === p.day);
      const first = !seen.has(p.day); seen.add(p.day);
      return { blob: p.blob, takenAt: p.takenAt, label: first && d ? `${d.md} ${d.wd} ${CITIES[d.city].zh}` : '' };
    });
    if (list.length < 3) { memUi.msg = '落在 12/18–12/31 的照片不足 3 张。照片的拍摄时间不在行程里时，不会进回忆视频。'; return rerender(); }
    memUi.busy = 'recap'; memUi.progress = 0; memUi.msg = ''; memUi.video = null; rerender();
    try {
      const out = await makeRecap({ photos: list, onProgress: (p) => { memUi.progress = p; if (Math.round(p * 100) % 10 === 0) rerender(); } });
      memUi.video = { url: URL.createObjectURL(out.blob), ext: /mp4/.test(out.type) ? 'mp4' : 'webm' };
      memUi.msg = `生成完成，约 ${Math.round(out.seconds)} 秒。长按或点“保存视频”存到手机。`;
    } catch (e) { memUi.msg = '生成失败：' + e.message; }
    memUi.busy = ''; rerender();
  },
  sharecard: async (el) => {
    const state = getState();
    const day = buildDays(state).find((d) => d.id === el.dataset.day);
    const c = CITIES[day.city];
    const pic = memUi.photos.find((p) => p.day === day.id);
    const w = weatherFor(ctx.weather, day.city, day);
    const canvas = document.createElement('canvas');
    let bmp = null;
    if (pic) { try { bmp = await loadBitmap(pic.blob); } catch (e) { bmp = null; } }
    await drawShareCard(canvas, {
      day, cityZh: c.zh, cityEn: c.en || c.zh, photo: bmp,
      items: day.items.filter((i) => i.text).map((i) => ({ t: i.t, text: i.text })),
      weatherText: w ? `${codeLabel(w.code)} ${Math.round(w.hi)}°` : `${c.hi}°/${c.lo}°`
    });
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    const url = URL.createObjectURL(blob);
    openHtml(`<div class="sheet__body"><h2 class="sheet__title" id="sheet-title">${day.md} 分享卡</h2>
      <img class="sharecard" src="${url}" alt="${day.md} 分享卡预览">
      <div class="btn-row"><a class="btn btn--primary" href="${url}" download="hoops-${day.id}.png">${icon('check')}保存图片</a>
      <button type="button" class="btn btn--secondary" data-action="share-native" data-url="${url}" data-name="hoops-${day.id}.png">分享到…</button></div>
      <p class="note">${pic ? '用了这天你导入的第一张照片。' : '这天还没有照片，先用城市配色；导入照片后重新生成。'}</p></div>`);
  },
  'share-native': async (el) => {
    try {
      const blob = await (await fetch(el.dataset.url)).blob();
      const f = new File([blob], el.dataset.name, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: '美东圣诞篮球行' });
      else toast('这个浏览器不能直接分享，请先保存图片');
    } catch (e) { /* 用户取消 */ }
  }
};

document.addEventListener('click', (e) => {
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

/* ---------- 表单 ---------- */
const val = (f, n) => (f.elements[n] ? String(f.elements[n].value).trim() : '');
const FORMS = {
  expense: (f) => {
    const amount = parseFloat(val(f, 'amount'));
    if (!(amount > 0)) return toast('请填金额');
    const d = moneyUi.draft;
    update((s) => { s.expenses[uid()] = { amount, currency: d.currency, cat: d.cat, payer: d.payer, split: d.split, date: val(f, 'date'), note: val(f, 'note'), u: stamp() }; });
    toast('已记一笔');
  },
  people: (f) => { update((s) => { s.people.a = { v: val(f, 'a') || '我', u: stamp() }; s.people.b = { v: val(f, 'b') || '同伴', u: stamp() }; }); toast('名字已保存'); },
  seat: (f) => { const id = f.dataset.id; update((s) => { s.seats[id] = { v: val(f, 'seat'), u: stamp() }; }); closeSheet(); toast('座位已保存'); },
  hotel: (f) => { const c = f.dataset.city; update((s) => { s.hotels[c] = { name: val(f, 'name'), addr: val(f, 'addr'), u: stamp() }; }); closeSheet(); toast('酒店已保存'); },
  slot: (f) => {
    const id = f.dataset.id;
    update((s) => { s.wallet[id] = { code: val(f, 'code'), note: val(f, 'note'), u: stamp() }; });
    closeSheet(); toast('订单已保存');
  },
  preview: (f) => { update((s) => { s.local.preview = val(f, 'at'); }); toast(val(f, 'at') ? '预览模式已开' : '已回到真实时间'); },
  cloud: async (f) => {
    const room = val(f, 'room'), pass = val(f, 'pass');
    if (!room || !pass) return toast('房间名和口令都要填');
    update((s) => { s.local.syncRoom = room; s.local.syncPass = pass; }, { silent: true });
    moreUi.busy = 'cloud'; moreUi.msg = ''; rerender();
    try {
      const merged = await cloudSync(syncDoc(getState()), room, pass);
      update((s) => { Object.assign(s, merged); s.local.lastSync = Date.now(); });
      moreUi.msg = '同步完成。';
    } catch (e) { moreUi.msg = e.message + '。也可以改用上面的同步码。'; }
    moreUi.busy = ''; rerender();
  }
};

document.addEventListener('submit', (e) => {
  const f = e.target.closest('[data-form]');
  if (!f) return;
  e.preventDefault();
  const fn = FORMS[f.dataset.form];
  if (fn) fn(f);
});

/* ---------- 输入 ---------- */
document.addEventListener('input', (e) => {
  if (e.target.matches('[data-guide-search]')) {
    guideUi.q = e.target.value;
    const box = document.getElementById('guide-results');
    if (box) box.innerHTML = guideResultsHtml(getState());
    return;
  }
  const el = e.target.closest('[data-bind]');
  if (!el) return;
  const [group, key] = el.dataset.bind.split('.');
  const value = el.type === 'checkbox' ? el.checked : parseFloat(el.value);
  update((s) => { s[group][key] = el.type === 'checkbox' ? value : (Number.isFinite(value) ? value : 0); }, { silent: true });
  const out = document.getElementById('budget-out');
  if (out) out.innerHTML = budgetOutputHtml(getState());
  updateShell(getState(), route);
});

document.addEventListener('change', async (e) => {
  const t = e.target;
  if (t.matches('.pillradio input')) {
    moneyUi.draft[t.name] = t.value;
    t.closest('form').querySelectorAll(`.pillradio input[name="${t.name}"]`).forEach((r) => r.closest('.pillradio').classList.toggle('is-on', r.checked));
    return;
  }
  if (t.matches('[data-cards-day]')) { cardsUi.day = t.value; rerender(); return; }
  if (t.matches('[data-slot-files]')) {
    const slot = t.dataset.slotFiles;
    for (const f of t.files) await files.put({ id: uid(), kind: 'wallet', slot, name: f.name, type: f.type, blob: f });
    t.value = ''; await loadWalletFiles(); refreshSheet(); rerender();
    return;
  }
  if (t.matches('[data-mem-files]')) {
    const list = [...t.files];
    memUi.busy = 'import'; memUi.msg = `正在导入 ${list.length} 张…`; rerender();
    let n = 0;
    for (const f of list) {
      const at = await photoDate(f);
      await files.put({ id: uid(), kind: 'photo', name: f.name, type: f.type, blob: f, takenAt: at.getTime(), day: tripDayOf(at) }); n++;
    }
    t.value = ''; await loadMemories();
    memUi.busy = ''; memUi.msg = `已导入 ${n} 张，按拍摄时间归到各天。`; rerender();
  }
});

subscribe(() => { render({ keepScroll: true }); armReminders(); });
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

// 后台任务：订单附件索引、天气、照片、离线缓存、提醒
loadWalletFiles().then(rerender).catch(() => {});
loadWeather().then((m) => { ctx.weather = m; rerender(); }).catch(() => {});
onPhotos(() => render({ keepScroll: true }));
loadPhotos(POIS.map((p) => p.wiki), POI_FILES);
registerSW();
onPwaChange(() => { if (route === 'more') rerender(); });
armReminders();
// 今天页面每分钟刷新一次“现在/下一项”；顺手重新排提醒：
// 行程日期通常离出发还有好几天，只在打开时排一次的话，等事件进入 24 小时窗口时页面已开着也不会响。
setInterval(() => {
  armReminders();
  if (route === 'home' && !typing() && !sheet.open && findToday(buildDays(getState()), currentNow(getState()))) rerender();
}, 60000);
void walletFiles;

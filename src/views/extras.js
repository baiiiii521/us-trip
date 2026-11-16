// 旅途小帮手的页面：待确认、值机、两地时钟、备注、吃什么、离我最近、换算、购物清单、行程片、旅行总结
import { esc, icon, ext, vendorLinks, usd, cny, arrow } from '../lib/dom.js';
import { CONFIRMS, EATS, CONV } from '../data/extras.js';
import { CITIES } from '../data/trip.js';
import { GAMES } from '../data/games.js';
import { DRIVES } from '../data/drive.js';
import { EXP_CATS } from '../lib/money.js';
import { buildDays } from '../data/days.js';
import { isDone, personName } from '../state.js';
import { directionsUrl, placeUrl } from '../lib/maps.js';
import { clocks, nearest, fmtDist, walkMin, activeCheckins, fmtSpan, recapStats } from '../lib/extras.js';

// ---------- 两地时钟 ----------
export function clockHtml(now, city, wall = false) {
  const c = clocks(now, city, wall);
  return `<p class="clock" data-om="clock"><span><b class="mono">${esc(c.local)}</b> ${esc(c.place)}</span><span><b class="mono">${esc(c.beijing)}</b> 北京</span><span class="clock__call${c.call.ok ? ' is-ok' : ''}">${esc(c.call.text)}</span></p>`;
}

// ---------- 值机 ----------
export function flightBoxHtml(now) {
  return activeCheckins(now).map(({ c, s }) => `<details class="tbox"${s.stage === 'open' ? ' open' : ''}>
    <summary><h3>${icon('plane')} 值机 · ${esc(c.flight)}</h3><span class="tbox__st">${s.stage === 'open' ? `可以值机了，${fmtSpan(s.left)}后起飞` : `${fmtSpan(s.wait)}后开放`}</span></summary>
    <p class="tbox__p">${esc(c.depText)}。${esc(c.note)}</p>
    <div class="buys__list">${c.links.map(([l, u], i) => ext(l, u, i === 0 && s.stage === 'open')).join('')}</div>
  </details>`).join('');
}

// ---------- 待确认 ----------
export const confirmLeft = (state) => CONFIRMS.filter((c) => !isDone(state, c.id)).length;
export function confirmHtml(state) {
  const left = confirmLeft(state);
  return `<p class="note">${left ? `还有 ${left} 件没确认` : '全部确认过了'}，共 ${CONFIRMS.length} 件。这些事要到临近才公布，或者得打电话、看官网才知道。确认一件勾一件，两个人的手机会同步。</p>
  <ul class="todo">${CONFIRMS.map((c) => {
    const on = isDone(state, c.id);
    return `<li class="todo__i${on ? ' is-done' : ''}">
      <button type="button" class="todo__ck" data-action="todo" data-id="${c.id}" aria-pressed="${on}" aria-label="${on ? '标记为未确认' : '标记为已确认'}">${on ? icon('check') : ''}</button>
      <span class="todo__when">${esc(c.by)} 前</span>
      <div class="todo__what"><span>${esc(c.text)}</span><small class="todo__how">怎么确认：${esc(c.how)}</small>${c.vendors ? `<div class="buys__list">${vendorLinks(c.vendors)}</div>` : ''}</div>
    </li>`;
  }).join('')}</ul>`;
}

// ---------- 每一项的备注和改时间 ----------
export function noteSheetHtml(state, key) {
  const [dayId, t0] = [key.slice(0, 4), key.slice(5)];
  const n = state.notes[key] && !state.notes[key].del ? state.notes[key] : {};
  return `<h2 id="sheet-title">备注和改时间</h2>
  <p class="note">${esc(dayId.slice(0, 2) + '/' + dayId.slice(2))} 原定 ${esc(t0)} 的这一项。改过的时间会用在“今天”卡片和提醒里；两个人的手机同步。</p>
  <form class="form" data-form="note" data-key="${esc(key)}">
    <label class="field" for="note-t"><span>改成几点（不改就留空，格式 09:40）</span><input id="note-t" name="t" inputmode="numeric" autocomplete="off" placeholder="${esc(t0)}" value="${esc(n.t || '')}" pattern="\\d{1,2}:\\d{2}.*"></label>
    <label class="field" for="note-text"><span>备注（例如：预约号、换了哪家店、和谁约了几点）</span><textarea id="note-text" name="text" rows="3">${esc(n.text || '')}</textarea></label>
    <div class="btn-row"><button class="btn btn--primary" type="submit">保存</button>${n.t || n.text ? `<button class="btn btn--secondary" type="button" data-action="note-clear" data-key="${esc(key)}">恢复原样</button>` : ''}</div>
  </form>`;
}

// ---------- 吃什么 ----------
export const eatsUi = { city: 'bos' };
const CITY_TABS = ['bos', 'dc', 'phl', 'nyc', 'la'];
export function renderEats(state) {
  const list = EATS.filter((e) => e.city === eatsUi.city);
  return `
  <div class="pagehead"><h1>吃什么</h1><p>每个城市值得专门去吃的店：招牌是什么、要不要订位、大概多少钱。行程里已经排进去的标了日期，其余是备选。</p></div>
  <div class="subtabs" role="tablist">${CITY_TABS.map((c) => `<button type="button" role="tab" aria-selected="${eatsUi.city === c}" class="subtab${eatsUi.city === c ? ' is-on' : ''}" data-action="eats-city" data-city="${c}">${esc(CITIES[c].zh)}</button>`).join('')}</div>
  <div class="subbody eats">${list.map((e) => `<article class="card eat">
    <header class="eat__h"><div><h3>${esc(e.zh)}</h3><p class="eat__en">${esc(e.name)}</p></div>${e.day ? `<span class="pill pill--acc">${esc(e.day)} 已排</span>` : '<span class="pill">备选</span>'}</header>
    <p>${esc(e.what)}</p>
    <dl class="eat__facts"><div><dt>价位</dt><dd>${esc(e.price)} · ${e.price === '$' ? '人均 15 美元内' : e.price === '$$' ? '人均 15–35 美元' : '人均 35 美元以上'}</dd></div><div><dt>订位</dt><dd>${esc(e.book)}</dd></div></dl>
    <div class="btn-row"><a class="btn btn--primary btn--sm" href="${esc(directionsUrl(e.q, state.nav))}" target="_blank" rel="noopener">${icon('nav')}导航</a><a class="btn btn--secondary btn--sm" href="${esc(placeUrl(e.q, state.nav))}" target="_blank" rel="noopener">看营业时间</a></div>
  </article>`).join('')}</div>
  <p class="note">价位和订位方式是常见情况，没有逐家打电话核实；营业时间以地图上显示的为准，圣诞前后尤其要看一眼。小费 18–22%，柜台点单可以不给。</p>`;
}

// ---------- 离我最近 ----------
export const nearUi = { here: null, kind: 'all', busy: false, msg: '' };
const KINDS = [['all', '全部'], ['sight', '景点'], ['eat', '吃的'], ['wc', '厕所']];
const KIND_ZH = { sight: '景点', eat: '吃的', wc: '厕所' };
export function renderNear(state) {
  const rows = nearUi.here ? nearest(nearUi.here, nearUi.kind, 12) : [];
  const far = rows.length && rows[0].m > 80000;
  const q = (s) => `https://www.google.com/maps/search/${encodeURIComponent(s)}/`;
  return `
  <div class="pagehead"><h1>离我最近</h1><p>按手机定位，把攻略里的景点、餐馆和能上厕所的地方按远近排出来。位置只在这台手机上用一下，不上传、不保存。</p></div>
  <section class="card">
    <div class="btn-row"><button type="button" class="btn btn--primary" data-action="near-locate"${nearUi.busy ? ' disabled' : ''}>${icon('pin')}${nearUi.busy ? '正在定位…' : nearUi.here ? '重新定位' : '定位我在哪'}</button></div>
    ${nearUi.msg ? `<p class="callout" role="status">${esc(nearUi.msg)}</p>` : ''}
    <div class="buys"><span class="buys__label">地图上直接搜附近的</span><div class="buys__list">${ext('地铁站', q('subway station'))}${ext('公共厕所', q('public restroom'))}${ext('药店', q('pharmacy'))}${ext('便利店', q('convenience store'))}${ext('咖啡馆', q('coffee'))}</div></div>
  </section>
  ${nearUi.here ? `
  <div class="subtabs" role="tablist">${KINDS.map(([k, l]) => `<button type="button" role="tab" aria-selected="${nearUi.kind === k}" class="subtab${nearUi.kind === k ? ' is-on' : ''}" data-action="near-kind" data-kind="${k}">${l}</button>`).join('')}</div>
  ${far ? '<p class="callout">你现在不在这五个城市附近，下面是直线距离最近的几个，仅供参考。</p>' : ''}
  <ul class="nearlist">${rows.map((p) => `<li class="nearrow">
    <${p.poi ? `button type="button" data-action="poi" data-id="${p.poi}"` : 'div'} class="nearrow__main">
      <b>${esc(p.name)}</b><small>${esc(KIND_ZH[p.kind])}${p.note ? ' · ' + esc(p.note) : ''}</small>
    </${p.poi ? 'button' : 'div'}>
    <span class="nearrow__d"><b>${esc(fmtDist(p.m))}</b>${p.m < 4000 ? `<small>走路 ${walkMin(p.m)} 分钟</small>` : ''}</span>
    <a class="poichip__nav" href="${esc(directionsUrl(p.q, state.nav, p.m < 2500 ? 'walking' : 'transit'))}" target="_blank" rel="noopener" aria-label="导航到 ${esc(p.name)}">${icon('nav')}</a>
  </li>`).join('')}</ul>
  <p class="note">距离是直线距离，坐标是约数，实际路程以导航为准。</p>` : ''}`;
}

// ---------- 换算速查 ----------
export const convUi = { f: '', mi: '', lb: '' };
export function convOut() {
  const n = (v) => (v === '' || !Number.isFinite(+v) ? null : +v);
  const f = n(convUi.f), mi = n(convUi.mi), lb = n(convUi.lb);
  return { c: f == null ? '' : ((f - 32) / 1.8).toFixed(1) + ' °C', km: mi == null ? '' : (mi * 1.609).toFixed(1) + ' 公里', kg: lb == null ? '' : (lb * 0.4536).toFixed(1) + ' 公斤' };
}
const table = (head, rows) => `<table class="conv"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(String(c))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
export function convHtml() {
  const o = convOut();
  return `
  <section class="card">
    <div class="card__h"><h2>随手换算</h2></div>
    <div class="convrow"><label class="field" for="cv-f"><span>华氏度 °F</span><input id="cv-f" inputmode="decimal" data-conv="f" value="${esc(convUi.f)}" placeholder="例如 28"></label><output id="cv-f-out">${esc(o.c)}</output></div>
    <div class="convrow"><label class="field" for="cv-mi"><span>英里</span><input id="cv-mi" inputmode="decimal" data-conv="mi" value="${esc(convUi.mi)}" placeholder="例如 450"></label><output id="cv-mi-out">${esc(o.km)}</output></div>
    <div class="convrow"><label class="field" for="cv-lb"><span>磅 lb</span><input id="cv-lb" inputmode="decimal" data-conv="lb" value="${esc(convUi.lb)}" placeholder="例如 50"></label><output id="cv-lb-out">${esc(o.kg)}</output></div>
  </section>
  <section class="card"><div class="card__h"><h2>气温</h2><span class="meta">天气预报用华氏度</span></div>${table(['华氏 °F', '摄氏 °C'], CONV.temp)}</section>
  <section class="card"><div class="card__h"><h2>路牌和车速</h2></div>${table(['美国', '国内'], CONV.dist)}</section>
  <section class="card"><div class="card__h"><h2>重量和容量</h2></div>${table(['美国', '国内'], CONV.weight)}</section>
  <section class="card"><div class="card__h"><h2>鞋码</h2><span class="meta">球鞋各品牌略有出入，以鞋盒上的 CM 为准</span></div>
    <div class="convtwo"><div><h3 class="xdate">男鞋</h3>${table(['美码', '中国码'], CONV.shoesM)}</div><div><h3 class="xdate">女鞋</h3>${table(['美码', '中国码'], CONV.shoesW)}</div></div></section>
  <section class="card"><div class="card__h"><h2>上衣</h2><span class="meta">美版偏大，球衣通常买小一码</span></div>${table(['美码', '大致相当于'], CONV.tops)}</section>`;
}

// ---------- 购物清单 ----------
export function shopItems(state) {
  return Object.entries(state.shop || {}).filter(([, v]) => v && !v.del).map(([id, v]) => ({ id, ...v })).sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0) || (a.c || 0) - (b.c || 0));
}
export function shopHtml(state) {
  const items = shopItems(state), rate = +state.budget.rate || 6.8;
  const plan = items.reduce((s, x) => s + (+x.budget || 0), 0), got = items.filter((x) => x.done).length;
  return `
  <section class="card">
    <div class="card__h"><h2>要买的东西</h2><span class="meta">${got}/${items.length} 已买${plan ? ` · 预算 ${usd(plan)}（约 ${cny(plan * rate)}）` : ''}</span></div>
    ${items.length ? `<ul class="shoplist">${items.map((x) => `<li class="${x.done ? 'is-done' : ''}">
      <label><input type="checkbox" data-action="shop-toggle" data-id="${esc(x.id)}"${x.done ? ' checked' : ''}><span><b>${esc(x.text)}</b><small>${[x.who && '给 ' + x.who, x.size && '尺码 ' + x.size, +x.budget ? '预算 $' + (+x.budget) : ''].filter(Boolean).map(esc).join(' · ')}</small></span></label>
      <button type="button" class="linkbtn" data-action="shop-del" data-id="${esc(x.id)}" aria-label="删除 ${esc(x.text)}">删除</button></li>`).join('')}</ul>`
      : '<p class="note">还没有。帮人带的东西、自己想买的球衣和球鞋，都记在这里，买到一件勾一件。</p>'}
  </section>
  <section class="card">
    <div class="card__h"><h2>加一件</h2></div>
    <form class="form" data-form="shop">
      <label class="field" for="shop-text"><span>买什么</span><input id="shop-text" name="text" autocomplete="off" required placeholder="例如 尼克斯 11 号球衣"></label>
      <div class="form__row">
        <label class="field" for="shop-who"><span>给谁</span><input id="shop-who" name="who" autocomplete="off" placeholder="自己 / 爸妈 / 同事"></label>
        <label class="field" for="shop-size"><span>尺码</span><input id="shop-size" name="size" autocomplete="off" placeholder="M / US 9"></label>
        <label class="field" for="shop-budget"><span>预算（美元）</span><input id="shop-budget" name="budget" inputmode="decimal" autocomplete="off" placeholder="120"></label>
      </div>
      <div class="btn-row"><button class="btn btn--primary" type="submit">加到清单</button></div>
    </form>
    <p class="note">美国标价不含税：纽约买衣服鞋子单件 110 美元以下免销售税，超过的加 8.875%。尺码对照在“换算”标签里。</p>
  </section>`;
}

// ---------- 行程片 ----------
export function videoCardHtml() {
  return `<section class="card film">
    <div class="card__h"><h2>行程预告片</h2><span class="meta">33 秒 · 有声音</span></div>
    <video class="film__v" controls preload="none" playsinline poster="media/intro-poster.jpg" src="media/intro.mp4"></video>
    <p class="note">一个篮球沿着路线一城一城落下去。片里的城市图是 AI 生成的示意图，不是实拍。</p>
  </section>`;
}

// ---------- 旅行总结 ----------
export function renderRecap(state, ctx = { now: new Date() }) {
  const days = buildDays(state);
  const miles = Object.fromEntries(Object.entries(DRIVES).map(([k, d]) => [k, d.mi]));
  const r = recapStats(state, days, ctx.now, miles), rate = +state.budget.rate || 6.8;
  const stat = (n, l) => `<div class="fact"><span class="fact__n">${esc(String(n))}</span><span class="fact__l">${esc(l)}</span></div>`;
  if (!r.days) return `<div class="pagehead"><h1>旅行总结</h1><p>出发以后，这里会自动记下走了多少路、看了几场球、花了多少钱。12/18 落地那天开始有数字。</p></div>${videoCardHtml()}`;
  const cats = Object.entries(r.cats).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  return `
  <div class="pagehead"><h1>旅行总结</h1><p>${r.days >= r.total ? '14 天走完了。' : `第 ${r.days} 天，共 ${r.total} 天。`}数字来自你们记的账、打的卡和每天的行程。</p></div>
  <section class="hero__facts recap__facts">
    ${stat(r.days, '天在路上')}${stat(r.cities.length, '座城市')}${stat(r.games.length, '场 NBA')}
    ${stat(r.km, '公里步行（按行程估）')}${r.miles ? stat(r.miles, '英里自驾') : ''}${stat(r.been.length, '个景点打过卡')}
  </section>
  <section class="card">
    <div class="card__h"><h2>花了多少</h2><a class="more" href="#money">看明细${arrow}</a></div>
    ${r.count ? `<p class="recap__big"><b class="mono">${usd(r.spent)}</b><span>约 ${cny(r.spent * rate)} · ${r.count} 笔 · 平均每天 ${usd(r.spent / r.days)}</span></p>
    <ul class="recap__cats">${cats.map(([k, v]) => `<li><span>${esc(EXP_CATS[k] || k)}</span><span class="recap__bar"><i style="width:${Math.round((v / cats[0][1]) * 100)}%"></i></span><b class="mono">${usd(v)}</b></li>`).join('')}</ul>`
      : '<p class="note">还没记账。在“花费”里随手记，这里就会有分类统计。</p>'}
  </section>
  <section class="card">
    <div class="card__h"><h2>看过的球</h2></div>
    ${r.games.length ? `<ul class="recap__list">${r.games.map((g) => `<li><span class="mono">${esc(GAMES[g].date)}</span><b>${esc(GAMES[g].title)}</b></li>`).join('')}</ul>` : '<p class="note">第一场是 12/20 凯尔特人 vs 活塞。</p>'}
  </section>
  <section class="card">
    <div class="card__h"><h2>去过的地方</h2><a class="more" href="#guide">景点图鉴${arrow}</a></div>
    ${r.been.length ? `<p class="recap__tags">${r.been.map((p) => `<span class="pill">${esc(p.name)}</span>`).join('')}</p>` : '<p class="note">在景点详情里点“去过”，这里会攒成一面墙。</p>'}
    <p class="note">${r.notes ? `写了 ${r.notes} 条行程备注。` : ''}${r.shop ? `买到 ${r.shop} 件清单上的东西。` : ''}照片和回忆视频在 <a class="link" href="#memories">回忆</a> 里。${esc(personName(state, 'a'))}和${esc(personName(state, 'b'))}，这一趟辛苦了。</p>
  </section>
  ${videoCardHtml()}`;
}

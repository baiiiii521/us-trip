// 每日行程：顶部日期条 + 每天一张卡。景点可点开介绍，交通和球赛直接给买票入口。
import { esc, icon, ext, vendorLinks, buyRow } from '../lib/dom.js';
import { buildDays } from '../data/days.js';
import { CITIES } from '../data/trip.js';
import { POI } from '../data/pois.js';
import { LEGS, legOption } from '../data/legs.js';
import { GAMES, gameLinks } from '../data/games.js';
import { choiceFor, tripPhase } from '../lib/calc.js';
import { routeUrl, directionsUrl } from '../lib/maps.js';
import { photoHtml } from '../components/photo.js';
import { tripRouteHtml } from '../components/trip-route.js';
import { slotsForItem } from '../data/bookings.js';
import { slotChip } from './wallet.js';
import { findToday } from '../lib/today.js';
import { weatherFor, alertFor, codeLabel } from '../lib/weather.js';

function legBlock(id, state) {
  const kind = choiceFor(state, id);
  const o = legOption(id, kind);
  const leg = LEGS[id];
  const canSwitch = true;
  const other = kind === 'train' ? 'bus' : 'train';
  return `<div class="move move--${kind}">
    <div class="move__h">${icon(kind)}<b>${kind === 'train' ? '火车' : '大巴'} · ${esc(leg.route)}</b>
      ${canSwitch ? `<button type="button" class="linkbtn" data-action="leg" data-leg="${id}" data-kind="${other}">改坐${other === 'train' ? '火车' : '大巴'}</button>` : ''}</div>
    <p class="move__t">${esc(o.t)} <span class="price">${o.p ? '$' + o.p + '/人' : ''}</span></p>
    <p class="move__d">${esc(o.d)}</p>
    ${buyRow('订票', vendorLinks(o.buy))}
    ${leg.extra ? buyRow(leg.extra.label, vendorLinks(leg.extra.buy)) : ''}
  </div>`;
}

function gameBlock(id, text) {
  const g = GAMES[id];
  const arena = POI[g.arena];
  return `<div class="game">
    <div class="game__h">${icon('ball')}<b>${esc(g.title)}</b><span class="mono">${esc(g.time)}</span></div>
    ${text ? `<p class="game__note">${esc(text)}</p>` : ''}
    <button type="button" class="linkbtn poi-chip" data-action="poi" data-id="${arena.id}">看 ${esc(arena.name)} 球馆介绍</button>
    <div class="btn-row"><button type="button" class="btn btn--secondary btn--sm" data-action="gameday" data-id="${id}">${icon('ball')}球赛日卡片：几点开门、怎么去怎么回</button></div>
    ${buyRow('买票', gameLinks(id).map((l, i) => ext(l.label, l.url, i === 0)).join(''))}
  </div>`;
}

function poiChips(ids, state, md) {
  return `<div class="poichips">${ids.map((pid) => {
    const p = POI[pid];
    if (!p) return '';
    return `<div class="poichip">
      <button type="button" class="poichip__main" data-action="poi" data-id="${p.id}">
        ${photoHtml(p, { size: 'thumb', md: '' })}
        <span class="poichip__txt"><b>${esc(p.name)}</b><small>${esc(p.tag || '')}</small></span>
      </button>
      <a class="poichip__nav" href="${esc(directionsUrl(p.q, state.nav))}" target="_blank" rel="noopener" aria-label="导航到 ${esc(p.name)}">${icon('nav')}</a>
    </div>`;
  }).join('')}</div>`;
  void md;
}

export function renderDays(state, ctx = { now: new Date(), weather: null }) {
  const days = buildDays(state);
  const phase = tripPhase(ctx.now);
  const strip = days.map((d) => {
    const hasGame = d.items.some((i) => i.game && !['nyk25', 'nyk27'].includes(i.game));
    const isToday = phase.phase === 'during' && phase.id === d.id;
    return `<a class="strip__d${isToday ? ' is-today' : ''}" href="#day-${d.id}" data-day="${d.id}">
      <span class="strip__md">${d.md.split('/')[1]}</span><span class="strip__wd">${esc(d.wd.slice(1))}</span>
      <span class="strip__city dot-${d.city}">${esc(CITIES[d.city].zh.slice(0, 2))}</span>${hasGame ? icon('ball', 'ic--ball') : ''}</a>`;
  }).join('');

  const cards = days.map((d) => {
    const c = CITIES[d.city];
    const routeQs = [];
    d.items.forEach((it) => (it.pois || []).forEach((pid) => { if (POI[pid] && !routeQs.includes(POI[pid].q)) routeQs.push(POI[pid].q); }));
    const rUrl = routeQs.length > 1 ? routeUrl(routeQs) : null;
    return `<article class="day card" id="day-${d.id}" aria-labelledby="dt-${d.id}">
      <header class="day__h">
        <div class="day__date"><span class="day__md">${d.md}</span><span class="day__wd">${esc(d.wd)}</span></div>
        <div class="day__meta">
          <span class="tag tag--${d.city}">${d.from ? esc(CITIES[d.from].zh) + ' → ' : ''}${esc(c.zh)}</span>
          <h2 id="dt-${d.id}">${esc(d.title)}</h2>
          ${(() => { const w = weatherFor(ctx.weather, d.city, d); const al = alertFor(w);
            return `<p class="day__wx">${icon('sun')}${w ? `预报 ${codeLabel(w.code)} ${Math.round(w.hi)}° / ${Math.round(w.lo)}°C` : `12 月平均 ${c.hi}° / ${c.lo}°`} · 日落 ${c.sunset}</p>${al ? `<p class="alert alert--${al.level}" role="alert"><b>天气提醒</b>${esc(al.text)}，户外项目请准备室内备选。</p>` : ''}`; })()}
        </div>
        ${rUrl ? `<a class="btn btn--secondary" href="${esc(rUrl)}" target="_blank" rel="noopener">${icon('route')}打开当天路线</a>` : ''}
      </header>
      <ol class="tl">${d.items.map((it) => `
        <li class="tl__i${it.leg ? ' tl__i--move' : ''}${it.game ? ' tl__i--game' : ''}">
          <span class="tl__t">${esc(it.t)}</span>
          <div class="tl__b">
            ${it.leg ? legBlock(it.leg, state) : ''}
            ${it.game ? gameBlock(it.game, it.text) : ''}
            ${!it.game && it.text ? `<p>${esc(it.text)}</p>` : ''}
            ${it.pois && it.pois.length ? poiChips(it.pois, state, d.md) : ''}
            ${it.buy && it.buy.length ? buyRow('预约 / 买票', vendorLinks(it.buy)) : ''}
            ${(() => { const ids = slotsForItem(it); return ids.length ? `<div class="buys"><span class="buys__label">我的订单</span><div class="buys__list">${ids.map((id) => slotChip(state, id)).join('')}</div></div>` : ''; })()}
          </div>
        </li>`).join('')}</ol>
      ${d.tips && d.tips.length ? `<ul class="day__tips">${d.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      <p class="day__stay">${icon('bed')}住：${esc(d.stay)}</p>
    </article>`;
  }).join('');

  return `
  <div class="pagehead"><h1>每日行程</h1><p>先看整体路线，再往下看每天。点景点卡片看介绍和照片，右侧箭头直接导航；“打开当天路线”会把这一天的地点按顺序放进 Google 地图。</p></div>
  ${tripRouteHtml(state)}
  <nav class="strip" aria-label="日期">${strip}</nav>
  <div class="days">${cards}</div>`;
}

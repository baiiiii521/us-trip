// 总览：一句话说清这是什么 + 三个硬数字、下一件待办、三个关键决定、路线图、14 天一览、必须改的问题
import { esc, icon, usd, cny, vendorLinks, ext, buyRow, arrow } from '../lib/dom.js';
import { tripPhase, budgetTotal, MODE_LABEL, choiceFor } from '../lib/calc.js';
import { CHECKLIST, AUDIT } from '../data/content.js';
import { CITIES, TRIP } from '../data/trip.js';
import { GAMES, gameLinks } from '../data/games.js';
import { buildDays } from '../data/days.js';
import { settingsHtml } from '../components/settings.js';
import { routeMapHtml } from '../components/route-map.js';
import { isDone } from '../state.js';
import { findToday, nowAndNext, fmtCountdown } from '../lib/today.js';
import { weatherFor, alertFor, codeLabel } from '../lib/weather.js';
import { CITY_STATUS, LEG_STATUS } from '../data/travelcards.js';
import { POI } from '../data/pois.js';
import { directionsUrl } from '../lib/maps.js';
import { slotsForItem } from '../data/bookings.js';
import { slotChip } from './wallet.js';

// 今天模式：当前在做什么、下一项几点、去哪、订单、实时状态
function todayCard(state, days, ctx) {
  const day = findToday(days, ctx.now);
  if (!day) return '';
  const { current, next, minutes } = nowAndNext(day, ctx.now);
  const w = weatherFor(ctx.weather, day.city, day);
  const al = alertFor(w);
  const nextPoi = next && (next.it.pois || []).map((id) => POI[id]).find(Boolean);
  const slots = [...new Set(day.items.flatMap(slotsForItem))];
  const leg = day.items.find((i) => i.leg);
  const status = [...(CITY_STATUS[day.city] || []), ...(leg ? LEG_STATUS[choiceFor(state, leg.leg)] || [] : [])];
  const line = (x) => x ? `<b>${esc(x.it.t)}</b> ${esc((x.it.text || x.it.title || (x.it.leg ? '城际交通' : x.it.game ? '球赛' : '')).slice(0, 60))}` : '';
  return `<section class="card today2">
    <div class="card__h"><h2>今天 ${day.md} ${esc(day.wd)}</h2><span class="meta">${esc(CITIES[day.city].zh)}${w ? ` · ${codeLabel(w.code)} ${Math.round(w.hi)}°/${Math.round(w.lo)}°C` : ''}</span></div>
    <p class="today2__title">${esc(day.title)}</p>
    ${al ? `<p class="alert alert--${al.level}" role="alert"><b>天气提醒</b>${esc(al.text)}。室外项目改成室内：${esc(STORM[day.city] || '博物馆、图书馆、商场')}。出发前再看一次交通是否正常。</p>` : ''}
    <dl class="nownext">
      <div><dt>现在</dt><dd>${current ? line(current) : '今天还没开始'}</dd></div>
      <div><dt>下一项${minutes != null ? ' · ' + fmtCountdown(minutes) : ''}</dt><dd>${next ? line(next) : '今天的安排都结束了'}</dd></div>
    </dl>
    <div class="btn-row">
      ${nextPoi ? `<a class="btn btn--primary" href="${esc(directionsUrl(nextPoi.q, state.nav))}" target="_blank" rel="noopener">${icon('nav')}导航到 ${esc(nextPoi.name)}</a>` : ''}
      <a class="btn btn--secondary" href="#day-${day.id}">看全天行程</a>
      <a class="btn btn--secondary" href="#cards">英文大字卡</a>
    </div>
    ${slots.length ? `<div class="buys"><span class="buys__label">今天要出示的订单</span><div class="buys__list">${slots.map((id) => slotChip(state, id)).join('')}</div></div>` : ''}
    ${status.length ? `<div class="buys"><span class="buys__label">实时状态</span><div class="buys__list">${status.map((l) => ext(l.label, l.url)).join('')}</div></div>` : ''}
  </section>`;
}
const STORM = { bos: '波士顿公共图书馆、哈佛自然史博物馆', dc: '史密森尼博物馆群（免费）、国会图书馆', phl: '费城艺术博物馆、独立厅', nyc: '大都会博物馆、自然史博物馆、纽约公共图书馆', la: '盖蒂中心、格兰德中央市场' };

export function renderHome(state, ctx = { now: new Date(), weather: null }) {
  const phase = tripPhase(ctx.now);
  const days = buildDays(state);
  const total = budgetTotal(state);
  const next = CHECKLIST.find((t) => !isDone(state, t.id));
  const doneCount = CHECKLIST.filter((t) => isDone(state, t.id)).length;
  const games = days.flatMap((d) => d.items.filter((i) => i.game && i.game !== 'nyk25' && i.game !== 'nyk27').map((i) => i.game));

  let when;
  if (phase.phase === 'before') when = [String(phase.days), '天后出发'];
  else if (phase.phase === 'during') when = ['D' + (phase.index + 1), `第 ${phase.index + 1} 天，共 14 天`];
  else when = ['14', '天行程已结束'];


  return `
  <section class="hero">
    <div>
      <h1 class="hero__h1">两人 14 天美东圣诞篮球行</h1>
      <p class="hero__lead">2026 年 12 月 18 日纽约落地，坐火车和大巴去波士顿、华盛顿、费城，纽约连住 6 晚过圣诞，31 日在洛杉矶海边走半天再回国。5 座城市全程公共交通，在美 ${TRIP.nights} 晚。</p>
    </div>
    <div class="hero__facts">
      <div class="fact"><span class="fact__n">${esc(when[0])}</span><span class="fact__l">${esc(when[1])}</span></div>
      <div class="fact"><span class="fact__n">${games.length}</span><span class="fact__l">场 NBA 已排进</span></div>
      <div class="fact"><span class="fact__n">${usd(total)}</span><span class="fact__l">两人预算${state.budget.flights ? '' : '，未含机票'}</span></div>
    </div>
  </section>

  ${todayCard(state, days, ctx)}

  <section class="grid2">
    <div class="m-nolift card next">
      <div class="card__h"><h2>下一件待办</h2><a href="#info" class="more" data-action="info-tab" data-tab="todo">清单 ${doneCount}/${CHECKLIST.length}${arrow}</a></div>
      ${next ? `
        <p class="next__when">${esc(next.when)}</p>
        <p class="next__what">${esc(next.text)}</p>
        ${buyRow('去办', vendorLinks(next.buy || []) + (next.game ? gameLinks(next.game).slice(0, 3).map((l, i) => ext(l.label, l.url, i === 0)).join('') : ''))}
        <button class="btn btn--primary" type="button" data-action="todo" data-id="${next.id}">${icon('check')}标记这件已完成</button>`
        : '<p class="next__what">清单全部完成。出发前 48 小时再核对一次球赛和车次时间。</p>'}
    </div>
    <div class="m-nolift card">
      <div class="m-nolift card__h"><h2>三个关键决定</h2></div>
      ${settingsHtml(state, { compact: true })}
    </div>
  </section>

  <section class="grid2 grid2--map">
    <div class="m-nolift card">
      <div class="m-nolift card__h"><h2>路线和城际交通</h2><span class="meta">当前：${esc(MODE_LABEL[state.mode])}</span></div>
      ${routeMapHtml(state)}
    </div>
    <div class="m-nolift card">
      <div class="m-nolift card__h"><h2>14 天行程一览</h2><a href="#days" class="more">看每日行程${arrow}</a></div>
      <ol class="glance">${days.map((d) => {
        const g = d.items.find((i) => i.game && GAMES[i.game] && !['nyk25', 'nyk27'].includes(i.game));
        const mv = d.items.find((i) => i.leg);
        return `<li><a href="#day-${d.id}">
          <span class="glance__md">${d.md}</span><span class="glance__wd">${esc(d.wd)}</span>
          <span class="tag tag--${d.city}">${esc(CITIES[d.city].zh)}</span>
          <span class="glance__t">${esc(d.title)}</span>
          <span class="glance__ic">${mv ? icon(choiceFor(state, mv.leg)) : ''}${g ? icon('ball', 'ic--ball') : ''}</span>
        </a></li>`;
      }).join('')}</ol>
    </div>
  </section>

  <section class="m-nolift card">
    <div class="m-nolift card__h"><h2>原攻略里必须改的 3 处</h2><a href="#info" class="more" data-action="info-tab" data-tab="audit">看全部审计${arrow}</a></div>
    <ul class="audit">${AUDIT.filter((a) => a.level === 'crit').map((a) => `<li class="audit__item audit--crit"><b>${esc(a.title)}</b><span>${esc(a.fix)}</span></li>`).join('')}</ul>
  </section>`;
}

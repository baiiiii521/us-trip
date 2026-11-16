// 总览：一句话说清这是什么 + 三个硬数字、下一件待办、三个关键决定、路线图、14 天一览、必须改的问题
import { esc, icon, usd, cny, vendorLinks, ext, buyRow, arrow } from '../lib/dom.js';
import { tripPhase, budgetTotal, transportLabel, choiceFor } from '../lib/calc.js';
import { CHECKLIST } from '../data/content.js';
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
import { slotsForItem, walletSlots } from '../data/bookings.js';
import { slotChip } from './wallet.js';
import { LEGS } from '../data/legs.js';
import { HOTEL_OF } from '../data/hotels.js';
import { PICKUP, DROPOFF, PARKING } from '../data/drive.js';
import { checkoutItems, parkingCities, daySpend } from '../lib/tools.js';
import { files } from '../lib/storage.js';
import { usd as usd0 } from '../lib/dom.js';
import { paceText, jetlagFor, PACKING, PACK_IDS } from '../data/wellbeing.js';
import { clockHtml, flightBoxHtml, confirmLeft, videoCardHtml } from './extras.js';
import { CONFIRMS } from '../data/extras.js';

// 倒时差：今天该怎么睡、什么时候喝咖啡
function jetlagHtml(j, open = false) {
  if (!j) return '';
  return `<details class="tbox"${open ? ' open' : ''}><summary><h3>倒时差</h3><span class="tbox__st">${esc(j.title)}</span></summary>
    <ul class="plain">${j.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details>`;
}

// 停车照片（IndexedDB，只在本机）：{ city: objectURL }
export const parkingPhotos = { map: {} };
export async function loadParking() {
  for (const u of Object.values(parkingPhotos.map)) URL.revokeObjectURL(u);
  const map = {};
  for (const f of await files.byKind('parking')) if (f.blob) map[f.slot] = URL.createObjectURL(f.blob);
  parkingPhotos.map = map;
}

function checkoutHtml(state, day) {
  const items = checkoutItems(day, state);
  if (!items.length) return '';
  const done = items.filter((x) => isDone(state, x.id)).length;
  return `<details class="tbox"${done < items.length ? ' open' : ''}><summary><h3>退房前检查</h3><span class="tbox__st">${done === items.length ? '都检查过了' : `${done}/${items.length}`}</span></summary>
    <ul class="outlist">${items.map((x) => `<li class="${isDone(state, x.id) ? 'is-done' : ''}"><label><input type="checkbox" data-action="todo" data-id="${esc(x.id)}"${isDone(state, x.id) ? ' checked' : ''}><span>${esc(x.text)}</span></label></li>`).join('')}</ul></details>`;
}

const CITY_ZH = { bos: '波士顿', dc: '华盛顿', phl: '费城' };
function parkingHtml(state, day) {
  return parkingCities(day, state).map((c) => {
    const p = state.parking && state.parking[c] && !state.parking[c].del ? state.parking[c] : {};
    const photo = parkingPhotos.map[c];
    const has = p.spot || p.lat || photo;
    const back = p.lat ? `<a class="btn btn--primary" href="${esc(directionsUrl(p.lat + ',' + p.lng, state.nav, 'walking'))}" target="_blank" rel="noopener">${icon('nav')}走回车旁</a>` : '';
    const sum = p.spot ? `已记：${p.spot}` : has ? '已记位置' : c === day.from && c !== day.city ? '今天从这里取车' : '停好车记一下';
    return `<details class="tbox park"${c === day.from && c !== day.city && has ? ' open' : ''}>
      <summary><h3>${icon('car')} 车停在哪 · ${esc(CITY_ZH[c])}</h3><span class="tbox__st">${esc(sum)}</span></summary>
      <form class="form form--inline" data-form="park" data-city="${c}">
        <label class="field" for="park-${c}"><span>层数、车位号、哪个车库</span><input id="park-${c}" name="spot" value="${esc(p.spot || '')}" autocomplete="off" placeholder="例如 P2 层 B14，酒店车库"></label>
        <button class="btn btn--secondary" type="submit">保存</button>
      </form>
      ${photo ? `<img class="park__photo" src="${photo}" alt="${esc(CITY_ZH[c])}停车位置照片">` : ''}
      <div class="btn-row">
        ${back}
        <button type="button" class="btn btn--secondary" data-action="park-here" data-city="${c}">${p.lat ? '重新定位' : '记下当前位置'}</button>
        <label class="btn btn--secondary filebtn" for="park-photo-${c}">${photo ? '换一张照片' : '拍柱子编号'}<input id="park-photo-${c}" type="file" accept="image/*" capture="environment" data-park-photo="${c}" hidden></label>
        ${has ? `<button type="button" class="btn btn--secondary" data-action="park-clear" data-city="${c}">清空</button>` : ''}
      </div>
      <p class="meta">${esc((PARKING[c] || {}).note || '')}</p>
    </details>`;
  }).join('');
}

function spendHtml(state, day) {
  const rate = +state.budget.rate || 6.8;
  const spent = daySpend(state.expenses, day.md, rate);
  const food = (+state.budget.food || 0) * 2;
  return `<a class="tbox tbox--link" href="#money"><h3>今天的花费</h3>
    <span class="tbox__st">已记 <b class="mono">${usd0(spent)}</b>（约 ${cny(spent * rate)}）${food ? ` · 餐饮预算 ${usd0(food)}/天` : ''}</span>${icon('arrow')}</a>`;
}

// 订单格子的短名字：“租车：12/18 JFK 取 → …” → “租车”；“郑州 → 纽约 JFK（MF8280 / MF849）” → “郑州 → 纽约 JFK”
export function shortTitle(t) {
  const s = String(t).split('：')[0].replace(/（.*?）/g, '').trim();
  return s.length > 14 ? s.slice(0, 13) + '…' : s;
}

// 某一项该导航去哪：景点 → 球馆 → 开车段的目的地酒店 → 取车/还车点
export function navTarget(state, day, it) {
  if (!it) return null;
  if (it.nav) return it.nav;
  const poi = (it.pois || []).map((id) => POI[id]).find(Boolean);
  if (poi) return { name: poi.name, q: poi.q };
  if (it.game && GAMES[it.game]) { const a = POI[GAMES[it.game].arena]; if (a) return { name: a.name, q: a.q }; }
  if (it.leg && choiceFor(state, it.leg) === 'car' && HOTEL_OF[day.city]) return { name: HOTEL_OF[day.city].zh, q: HOTEL_OF[day.city].addr, mode: 'driving' };
  if (it.drive === 'pickup' && PICKUP[state.rent]) return { name: state.rent === 'jfk' ? 'Sixt 取车点' : '取车点', q: PICKUP[state.rent].q };
  if (it.drive === 'dropoff') return { name: 'Sixt 还车点', q: DROPOFF.q, mode: 'driving' };
  return null;
}

// 现在 / 下一项的一句话：球赛写清对手和球馆，开车写清从哪到哪
export function itemLine(state, it) {
  if (it.game && GAMES[it.game]) { const G = GAMES[it.game]; const a = POI[G.arena]; return `${G.title}${a ? ' · ' + a.name : ''}`; }
  if (it.leg && LEGS[it.leg]) return `${choiceFor(state, it.leg) === 'car' ? '开车' : '城际交通'}：${LEGS[it.leg].route}`;
  return firstSentence(it.text || it.title || '');
}

// 一句话摘要：取到第一个句号或冒号；太长就在 56 个字处截断加省略号，不留半个括号
export function firstSentence(text, max = 56) {
  const s = String(text).trim();
  const m = /^[^。：；]{6,}?[。：；]/.exec(s);
  let out = m && m[0].length <= max ? m[0].replace(/[。：；]$/, '') : s;
  if (out.length > max) out = out.slice(0, max).replace(/[（(，、\s][^（(，、]*$/, '') + '…';
  return out;
}

// 今天模式：当前在做什么、下一项几点、去哪、订单、实时状态
function todayCard(state, days, ctx) {
  const day = findToday(days, ctx.now);
  if (!day) return '';
  const { current, next, between, minutes } = nowAndNext(day, ctx.now);
  const w = weatherFor(ctx.weather, day.city, day);
  const al = alertFor(w);
  // 下一项没有地点时，先给正在进行的这一项（人就在那儿或正往那儿走），再往后找
  const ahead = next ? day.items.slice(next.i + 1, next.i + 3) : [];
  const go = [next && next.it, current && current.it, ...ahead].map((it) => navTarget(state, day, it)).find(Boolean);
  const slots = [...new Set(day.items.flatMap((it) => slotsForItem(it, state)))];
  const slotTitle = Object.fromEntries(walletSlots(state).map((x) => [x.id, shortTitle(x.title)]));
  const leg = day.items.find((i) => i.leg);
  const status = [...(CITY_STATUS[day.city] || []), ...(leg ? LEG_STATUS[choiceFor(state, leg.leg)] || [] : [])];
  const line = (x) => x ? `<b>${esc(x.it.t)}</b> ${esc(itemLine(state, x.it))}` : '';
  return `<section class="card today2">
    <div class="card__h"><h2>今天 ${day.md} ${esc(day.wd)}</h2><span class="meta">${esc(CITIES[day.city].zh)}${w ? ` · ${codeLabel(w.code)} ${Math.round(w.hi)}°/${Math.round(w.lo)}°C` : ''}</span></div>
    <p class="today2__title">${esc(day.title)}</p>
    ${clockHtml(ctx.now, day.city, !!(state.local && state.local.preview))}
    ${day.pace ? `<p class="day__pace"><span class="pace pace--${day.pace.lv}" aria-hidden="true"><i></i><i></i><i></i></span>${esc(paceText(day.pace))} · 日落 ${esc(CITIES[day.city].sunset)}</p>` : ''}
    ${al ? `<p class="alert alert--${al.level}" role="alert"><b>天气提醒</b>${esc(al.text)}。室外项目改成室内：${esc(STORM[day.city] || '博物馆、图书馆、商场')}。出发前再看一次交通是否正常。</p>` : ''}
    <dl class="nownext">
      <div><dt>现在</dt><dd>${current ? line(current) : '今天还没开始'}</dd></div>
      ${between.length ? `<div><dt>接着按顺序</dt><dd>${between.map((it) => `<b>${esc(it.t)}</b> ${esc(itemLine(state, it).slice(0, 24))}`).join('<br>')}</dd></div>` : ''}
      <div class="is-next"><dt>下一项${minutes != null ? ' · ' + fmtCountdown(minutes) : ''}</dt><dd>${next ? line(next) : '今天的安排都结束了'}</dd></div>
    </dl>
    ${next && next.it.note ? `<p class="tl__note"><b>备注</b>${esc(next.it.note)}</p>` : current && current.it.note ? `<p class="tl__note"><b>备注</b>${esc(current.it.note)}</p>` : ''}
    ${next && next.it.xmas ? `<p class="xmas xmas--${esc(next.it.xmas.s)}"><b>${next.it.xmas.s === 'open' ? '圣诞照常' : next.it.xmas.s === 'closed' ? '圣诞关门' : '圣诞营业待确认'}</b>${esc(next.it.xmas.note)}</p>` : ''}
    <div class="btn-row">
      ${go ? `<a class="btn btn--primary" href="${esc(directionsUrl(go.q, state.nav, go.mode))}" target="_blank" rel="noopener">${icon('nav')}导航到 ${esc(go.name)}</a>` : ''}
    </div>
    <nav class="qa qa--6" aria-label="今天常用">
      <a class="qa__i" href="#day-${day.id}">${icon('days')}<span>全天行程</span></a>
      <a class="qa__i" href="#near">${icon('pin')}<span>离我最近</span></a>
      <a class="qa__i" href="#eats" data-action="eats-city" data-city="${day.city}">${icon('guide')}<span>吃什么</span></a>
      <a class="qa__i" href="#cards">${icon('bus')}<span>英文大字卡</span></a>
      <a class="qa__i" href="#info" data-action="info-tab" data-tab="confirm">${icon('check')}<span>待确认 ${confirmLeft(state)}</span></a>
      <a class="qa__i" href="#sos">${icon('phone')}<span>紧急情况</span></a>
    </nav>
    ${flightBoxHtml(ctx.now)}
    ${slots.length ? `<div class="buys"><span class="buys__label">今天要出示的订单</span><div class="buys__list">${slots.map((id) => slotChip(state, id, slotTitle[id])).join('')}</div></div>` : ''}
    ${status.length ? `<details class="tbox"><summary><h3>实时路况和地铁 · ${status.length} 个</h3></summary><div class="buys__list">${status.map((l) => ext(l.label, l.url)).join('')}</div></details>` : ''}
    ${day.pace && day.pace.cut ? `<details class="tbox"><summary><h3>想轻松点</h3><span class="tbox__st">累了或下雨先砍哪一项</span></summary><p class="tbox__p">${esc(day.pace.cut)}</p></details>` : ''}
    ${jetlagHtml(jetlagFor({ phase: 'during' }, day.id), ctx.now.getHours() < 12)}
    ${checkoutHtml(state, day)}
    ${parkingHtml(state, day)}
    ${spendHtml(state, day)}
  </section>`;
}
const STORM = { bos: '波士顿公共图书馆、哈佛自然史博物馆', dc: '史密森尼博物馆群（免费）、国会图书馆', phl: '费城艺术博物馆、独立厅', nyc: '大都会博物馆、自然史博物馆、纽约公共图书馆', la: '盖蒂中心、格兰德中央市场' };

function heroLead(state) {
  const how = state.rent === 'jfk' ? '落地在 JFK 取车，一路开到波士顿、华盛顿、费城，12/24 回纽约还车'
    : state.rent === 'bos' ? '坐火车去波士顿，12/21 在波士顿取车开去华盛顿、费城，12/24 回纽约还车'
    : '坐火车和大巴去波士顿、华盛顿、费城';
  return `2026 年 12 月 18 日纽约落地，${how}。纽约住布鲁克林连住 7 晚过圣诞，31 日在洛杉矶海边走半天再回国。在美 ${TRIP.nights} 晚，看 4 场 NBA。`;
}

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


  const today = todayCard(state, days, ctx);
  const packed = PACK_IDS.filter((id) => isDone(state, id)).length;
  const jl = phase.phase === 'before' ? jetlagFor(phase) : null;
  // 出发前两周起：行李清单进度和倒时差提示放到最上面
  const prep = phase.phase === 'before' && phase.days <= 14 ? `<section class="card prep">
    <div class="card__h"><h2>还有 ${phase.days} 天出发</h2><span class="meta">12/17 13:45 郑州起飞</span></div>
    <a class="tbox tbox--link" href="#info" data-action="info-tab" data-tab="pack"><h3>行李清单</h3><span class="tbox__st">${packed}/${PACK_IDS.length} 已装</span>${icon('arrow')}</a>
    <a class="tbox tbox--link" href="#info" data-action="info-tab" data-tab="todo"><h3>预订清单</h3><span class="tbox__st">${doneCount}/${CHECKLIST.length} 已办</span>${icon('arrow')}</a>
    <a class="tbox tbox--link" href="#info" data-action="info-tab" data-tab="confirm"><h3>待确认</h3><span class="tbox__st">还有 ${confirmLeft(state)}/${CONFIRMS.length} 件</span>${icon('arrow')}</a>
    ${flightBoxHtml(ctx.now)}
    ${clockHtml(ctx.now, 'nyc')}
    ${jetlagHtml(jl, true)}
  </section>` : '';
  void PACKING;
  return `
  ${today}
  ${prep}
  <section class="hero${today ? ' hero--during' : ''}">
    <div>
      <h1 class="hero__h1">两人 14 天美东圣诞篮球行</h1>
      <p class="hero__lead">${heroLead(state)}</p>
    </div>
    <div class="hero__facts">
      <div class="fact"><span class="fact__n">${esc(when[0])}</span><span class="fact__l">${esc(when[1])}</span></div>
      <div class="fact"><span class="fact__n">${games.length}</span><span class="fact__l">场 NBA 已排进</span></div>
      <div class="fact"><span class="fact__n">${usd(total)}</span><span class="fact__l">两人预算${state.budget.flights ? '' : '，未含机票'}</span></div>
    </div>
  </section>

  <section class="grid2">
    <div class="m-nolift card next">
      <div class="card__h"><h2>下一件待办</h2><a href="#info" class="more" data-action="info-tab" data-tab="todo">清单 ${doneCount}/${CHECKLIST.length}${arrow}</a></div>
      ${phase.phase !== 'after' && confirmLeft(state) ? `<a class="tbox tbox--link next__cf" href="#info" data-action="info-tab" data-tab="confirm"><h3>待确认</h3><span class="tbox__st">还有 ${confirmLeft(state)} 件要打电话或看官网</span>${icon('arrow')}</a>` : ''}
      ${next ? `
        <p class="next__when">${esc(next.when)}</p>
        <p class="next__what">${esc(next.text)}</p>
        ${buyRow('去办', vendorLinks(next.buy || []) + (next.game ? gameLinks(next.game).slice(0, 3).map((l, i) => ext(l.label, l.url, i === 0)).join('') : ''))}
        <button class="btn btn--primary" type="button" data-action="todo" data-id="${next.id}">${icon('check')}标记这件已完成</button>`
        : '<p class="next__what">清单全部完成。出发前 48 小时再核对一次球赛和车次时间。</p>'}
    </div>
    <div class="m-nolift card">
      <div class="m-nolift card__h"><h2>四个关键决定</h2></div>
      ${settingsHtml(state, { compact: true })}
    </div>
  </section>

  ${phase.phase === 'after' ? `<section class="card"><div class="card__h"><h2>这一趟走完了</h2></div><p class="note">走了多少路、看了几场球、花了多少钱，都在旅行总结里。</p><div class="btn-row"><a class="btn btn--primary" href="#recap">看旅行总结</a><a class="btn btn--secondary" href="#memories">整理照片</a></div></section>` : ''}
  ${phase.phase === 'before' ? videoCardHtml() : ''}

  <section class="grid2 grid2--map">
    <div class="m-nolift card">
      <div class="m-nolift card__h"><h2>路线和城际交通</h2><span class="meta">当前：${esc(transportLabel(state))}${state.rent !== 'none' ? ' · <a class="link" href="#drive">自驾须知</a>' : ''}</span></div>
      ${routeMapHtml(state)}
    </div>
    <div class="m-nolift card">
      <div class="m-nolift card__h"><h2>14 天行程一览</h2><a href="#days" class="more">看每日行程${arrow}</a></div>
      <p class="pacekey"><span>每天的强度</span><span><span class="pace pace--1"><i></i><i></i><i></i></span>轻松</span><span><span class="pace pace--2"><i></i><i></i><i></i></span>适中</span><span><span class="pace pace--3"><i></i><i></i><i></i></span>紧凑</span></p>
      <p class="note">最密的是 12/18–12/24（落地、三座城、开 900 英里）；纽约 7 晚有意放松，12/26 和 12/29 是恢复日。</p>
      <ol class="glance">${days.map((d) => {
        const g = d.items.find((i) => i.game && GAMES[i.game] && !['nyk25', 'nyk27'].includes(i.game));
        const mv = d.items.find((i) => i.leg);
        return `<li><a href="#day-${d.id}">
          <span class="glance__md">${d.md}</span><span class="glance__wd">${esc(d.wd)}</span>
          <span class="tag tag--${d.city}">${esc(CITIES[d.city].zh)}</span>
          <span class="glance__t">${esc(d.title)}</span>
          <span class="glance__ic">${mv ? icon(choiceFor(state, mv.leg)) : ''}${g ? icon('ball', 'ic--ball') : ''}${d.pace ? `<span class="pace pace--${d.pace.lv}" title="${esc(paceText(d.pace))}"><i></i><i></i><i></i></span><span class="visually-hidden">${esc(paceText(d.pace))}</span>` : ''}</span>
        </a></li>`;
      }).join('')}</ol>
    </div>
  </section>
`;
}

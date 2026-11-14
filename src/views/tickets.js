// 票务：城际交通（火车/大巴）、NBA 球票、需要预约的景点
import { esc, icon, ext, usd, cny, vendorLinks, buyRow, arrow } from '../lib/dom.js';
import { LEGS, LEG_IDS, legOption, legWhy } from '../data/legs.js';
import { GAMES, GAME_ORDER, gameLinks, gameStatus } from '../data/games.js';
import { TICKET_PLATFORMS } from '../data/vendors.js';
import { POI, POIS } from '../data/pois.js';
import { choiceFor, transportCost, MODE_LABEL, carCost, transportLabel } from '../lib/calc.js';
import { rentPlan } from '../data/drive.js';
import { FLIGHTS } from '../data/flights.js';
import { HOTELS } from '../data/hotels.js';
import { slotChip } from './wallet.js';

// 已出票的机票：票面上的航班号、航站楼、行李额原样贴上来，出发前在这里对一遍
function flightCard(f) {
  const segs = f.segments.map((s) => `<li class="fl__seg">
      <span class="fl__no mono">${esc(s.flight)}</span>
      <div class="fl__col"><b class="mono">${esc(s.depTime)}</b><span>${esc(s.dep)}</span></div>
      <span class="fl__arrow" aria-hidden="true">${icon('plane')}</span>
      <div class="fl__col"><b class="mono">${esc(s.arrTime)}</b><span>${esc(s.arr)}</span>${s.arrNote ? `<i class="fl__arrnote">${esc(s.arrNote)}</i>` : ''}</div>
    </li>`).join('');
  return `<article class="card fl">
    <header class="fl__h">
      <span class="mono">${esc(f.date)}</span>
      <h3>${esc(f.title)}</h3>
      <span class="pill pill--ok">已出票</span>
    </header>
    <ol class="fl__segs">${segs}</ol>
    ${f.note ? `<p class="fl__note">${esc(f.note)}</p>` : ''}
    <p class="fl__meta">${esc(f.airline)} · ${esc(f.cabin)}</p>
    <p class="fl__meta">订单号、PNR、票号：<a class="link" href="#vault">证件和订单（需密码）</a></p>
    <p class="fl__meta">行李：${esc(f.bags)}</p>
  </article>`;
}

// 已订酒店：名字、地址、房型、价格都按订单原文，点“给司机看”直接全屏出英文
function hotelCard(h, state) {
  const rate = +state.budget.rate || 6.8;
  const total = h.usdNightly ? h.usdNightly * h.nights : h.cny / rate;
  const nightly = total / h.nights;
  // 有人民币订单就照票面显示到分；纽约公寓只有美元价
  const money = h.usdNightly
    ? (h.priceTbd ? `房价待填，按 $${h.usdNightly}/晚估算 ${usd(total)}` : `${usd(total)}（$${h.usdNightly}/晚 × ${h.nights}）· 约 ${cny(total * rate)}`)
    : `${h.approx ? '约 ' : ''}${cny(h.cny)}（含税费，以订单为准）· 约 ${usd(total)}，每晚 ${usd(nightly)}`;
  const q = encodeURIComponent(`${h.en} ${h.addr}`);
  return `<article class="card ht">
    <header class="ht__h">
      <span class="mono ht__dates">${esc(h.checkIn)}–${esc(h.checkOut)}</span>
      <span class="pill pill--${h.status === '已订' ? 'ok' : 'warn'}">${esc(h.status)}</span>
      <h3>${esc(h.zh)}</h3>
    </header>
    <p class="ht__en">${esc(h.en)}</p>
    <p class="ht__addr">${icon('pin')}${esc(h.addr)}</p>
    <ul class="ht__meta">
      <li>${h.nights} 晚${h.room ? ' · ' + esc(h.room) : ''}${h.tel ? ` · <a class="link" href="tel:${esc(h.tel.replace(/[^+\d]/g, ''))}">${esc(h.tel)}</a>` : ''}</li>
      <li>${esc(money)}</li>
    </ul>
    <div class="btn-row">
      <button type="button" class="btn btn--secondary btn--sm" data-action="bigcard" data-en="${esc(`Please take me to:\n${h.en}\n${h.addr}`)}" data-zh="${esc(`请带我去 ${h.zh}`)}">${icon('nav')}给司机看</button>
      <a class="btn btn--secondary btn--sm" href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">${icon('route')}地图</a>
    </div>
  </article>`;
}

function legCard(id, state) {
  const leg = LEGS[id];
  const cur = choiceFor(state, id);
  const opts = ['train', 'bus'].map((k) => {
    const o = legOption(id, k);
    const on = cur === k;
    return `<div class="opt opt--${k}${on ? ' is-on' : ''}${o.disabled ? ' is-off' : ''}">
      <button type="button" class="opt__pick" data-action="leg" data-leg="${id}" data-kind="${k}" aria-pressed="${on}" ${o.disabled ? 'disabled' : ''}>
        <span class="opt__top"><span class="opt__radio" aria-hidden="true"></span>${icon(k)}<b>${k === 'train' ? '火车' : '大巴'}</b><span class="price">${o.p ? usd(o.p) + '/人' : '—'}</span></span>
        <span class="opt__t">${esc(o.t)}</span>
        <span class="opt__d">${esc(o.d)}</span>
        ${o.price ? `<span class="opt__src">价格：${esc(o.price)}</span>` : ''}
      </button>
      ${o.buy && o.buy.length ? buyRow('订票', vendorLinks(o.buy)) : ''}
    </div>`;
  }).join('');
  return `<article class="card leg">
    <header class="leg__h"><span class="mono">${leg.date} ${esc(leg.wd)}</span><h3>${esc(leg.route)}</h3>
      <span class="pill pill--${leg.rec}">推荐${leg.rec === 'train' ? '火车' : '大巴'}</span></header>
    <div class="opts">${opts}</div>
    ${leg.extra ? buyRow(leg.extra.label, vendorLinks(leg.extra.buy)) : ''}
    <p class="leg__why">${esc(legWhy(id))}</p>
  </article>`;
}

export function renderTickets(state) {
  const plan = rentPlan(state);
  const car = carCost(state);
  const ticketLegs = LEG_IDS.filter((id) => !plan.legs.includes(id));
  const tr = transportCost(state, 'train');
  const rows = [['train', '全火车'], ['mix', '推荐混合（长途火车 + 短途大巴）'], ['bus', '全大巴']];
  if (state.mode === 'custom') rows.push(['custom', '你的自选组合']);
  const cmp = rows.map(([m, label]) => {
    const v = m === 'custom' ? transportCost(state) : transportCost(state, m);
    return `<tr class="${state.mode === m ? 'is-on' : ''}"><td>${esc(label)}</td><td class="n">${usd(v)}</td><td class="n">${v === tr ? '—' : '省 ' + usd(tr - v)}</td><td class="n">${cny(v * state.budget.rate)}</td></tr>`;
  }).join('');

  const games = GAME_ORDER.map((id) => {
    const g = GAMES[id];
    const st = gameStatus(id);
    const arena = POI[g.arena];
    return `<article class="card gamecard gamecard--${st.tone}">
      <div class="gamecard__date"><span class="mono">${g.date}</span><span>${esc(g.wd)}</span><b class="mono">${esc(g.time)}</b></div>
      <div class="gamecard__body">
        <h3>${esc(g.title)}</h3>
        <p><button type="button" class="linkbtn" data-action="poi" data-id="${arena.id}">${esc(arena.name)}</button> · ${esc(g.price)} · <span class="pill pill--${st.tone}">${esc(st.label)}</span></p>
        ${buyRow('买票', gameLinks(id).slice(0, 3).map((l, i) => ext(l.label, l.url, i === 0)).join(''))}
        <details class="more-links"><summary>还有 ${gameLinks(id).length - 3} 个购票入口</summary><div class="buys__list">${gameLinks(id).slice(3).map((l) => ext(l.label, l.url)).join('')}</div></details>
        <div class="btn-row">${slotChip(state, 'game-' + id)}<button type="button" class="btn btn--secondary btn--sm" data-action="gameday" data-id="${id}">${icon('ball')}球赛日卡片</button></div>
      </div>
    </article>`;
  }).join('');

  const reservations = POIS.filter((p) => p.buy && p.buy.length).map((p) => `<li>
      <button type="button" class="linkbtn" data-action="poi" data-id="${p.id}">${esc(p.name)}</button>
      <span class="res__t">${esc(p.ticket)}</span>
      <div class="buys__list">${vendorLinks(p.buy)}</div></li>`).join('');

  return `
  <div class="pagehead"><h1>票务</h1><p>机票、住宿、租车、球票和需要预约的景点都在这一页。价格是估算区间，下单前以官网为准。</p></div>
  <nav class="jump" aria-label="跳到">${[['tk-flights', '机票'], ['tk-hotels', '住宿'], ...(plan.legs.length ? [['tk-drive', '自驾']] : []), ...(ticketLegs.length ? [['tk-legs', plan.legs.length ? '车票' : '城际交通']] : []), ['tk-games', '球票'], ['tk-res', '预约']]
    .map(([id, l]) => `<a class="chip" href="#tickets" data-jump="${id}">${l}</a>`).join('')}</nav>

  <section class="sec" id="tk-flights">
    <div class="sec__h"><h2>机票</h2><span class="meta">两人已出票</span></div>
    <div class="flights">${FLIGHTS.map(flightCard).join('')}</div>
  </section>

  <section class="sec" id="tk-hotels">
    <div class="sec__h"><h2>住宿</h2><span class="meta">${HOTELS.filter((h) => h.status === '已订').length} 处全部已订</span></div>
    <div class="hotels">${HOTELS.map((h) => hotelCard(h, state)).join('')}</div>
    <p class="note">前三家是携程「在线付（含税费）」订单，金额按每晚房价换算，以订单为准；纽约公寓房价还没填，先按 $90/晚估算，可以在“花费 → 预算”里改。确认号和公寓房号在<a class="link" href="#vault">证件和订单（需密码）</a>里。</p>
    <div class="btn-row"><button type="button" class="btn btn--secondary btn--sm" data-action="budget-actual">${icon('check')}把预算里的房价改成订单价</button></div>
  </section>

  ${plan.legs.length ? `<section class="sec" id="tk-drive">
    <div class="sec__h"><h2>自驾</h2><span class="meta">${esc(transportLabel(state))} · 约 ${usd(car.total)}</span></div>
    <a class="card drivecard m-card" href="#drive">
      <span class="drivecard__ic">${icon('car')}</span>
      <span class="drivecard__main"><b>${esc(plan.label)} → 12/24 曼哈顿还车</b>
        <small>${plan.days} 天 · 约 ${car.miles} 英里 · 租车 ${usd(car.rental)} + 油 ${usd(car.fuel)} + 过路费 ${usd(car.tolls)} + 停车 ${usd(car.parking)}${car.oneWay ? ' + 异地还车 ' + usd(car.oneWay) : ''}</small>
        <small>每段路线、取还车步骤、停车、过路费、加油和驾驶规则</small></span>${arrow}
    </a>
  </section>` : ''}
  ${ticketLegs.length ? `<section class="sec" id="tk-legs">
    <div class="sec__h"><h2>${plan.legs.length ? '要买票的城际交通' : '城际交通'}</h2><span class="meta">${plan.legs.length ? '' : '当前：' + esc(MODE_LABEL[state.mode]) + ' · '}两人 ${usd(transportCost(state))}</span></div>
    ${plan.legs.length ? '' : `<div class="segctl segctl--inline" role="radiogroup" aria-label="交通方式">${[['train', '全火车'], ['mix', '推荐混合'], ['bus', '全大巴']].map(([m, l]) =>
      `<button type="button" role="radio" aria-checked="${state.mode === m}" class="segctl__opt${state.mode === m ? ' is-on' : ''}" data-action="set" data-key="mode" data-value="${m}"><b>${l}</b></button>`).join('')}</div>`}
    <div class="legs">${ticketLegs.map((id) => legCard(id, state)).join('')}</div>
    ${plan.legs.length ? '' : `<div class="card"><div class="scroll"><table class="tbl"><thead><tr><th>组合</th><th class="n">两人城际</th><th class="n">比全火车</th><th class="n">人民币</th></tr></thead><tbody>${cmp}</tbody></table></div>
    <p class="note">大巴票越早买越便宜，Megabus / OurBus 偶尔有 $1–9 早鸟票。火车 Saver 票不退，Value 票可改签。</p></div>`}
  </section>` : ''}

  <section class="sec" id="tk-games">
    <div class="sec__h"><h2>NBA 球票</h2><span class="meta">每场 7 个购票入口</span></div>
    <div class="games">${games}</div>
    <h3 class="sec__sub">六个购票平台怎么选</h3>
    <p class="note">先在 TickPick 看含费总价定基准，再去 SeatGeek、StubHub 打开“显示含费价格”对比，最后在 Ticketmaster 看有没有官方原价票。奇才、篮网赛前 1–2 天用 Gametime 捡漏。</p>
    <div class="platforms">${TICKET_PLATFORMS.map((p) => `<a class="card platform m-card" href="${esc(p.url)}" target="_blank" rel="noopener"><b>${esc(p.name)}${arrow}</b><span>${esc(p.note)}</span></a>`).join('')}</div>
  </section>

  <section class="sec" id="tk-res">
    <div class="sec__h"><h2>需要预约的景点</h2><span class="meta">${POIS.filter((p) => p.buy && p.buy.length).length} 处</span></div>
    <ul class="card reslist">${reservations}</ul>
  </section>`;
}

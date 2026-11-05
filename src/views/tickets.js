// 票务：城际交通（火车/大巴）、NBA 球票、需要预约的景点
import { esc, icon, ext, usd, cny, vendorLinks, buyRow } from '../lib/dom.js';
import { LEGS, LEG_IDS, legOption, legWhy } from '../data/legs.js';
import { GAMES, GAME_ORDER, gameLinks, gameStatus } from '../data/games.js';
import { TICKET_PLATFORMS } from '../data/vendors.js';
import { POI, POIS } from '../data/pois.js';
import { choiceFor, transportCost, MODE_LABEL } from '../lib/calc.js';

function legCard(id, state) {
  const leg = LEGS[id];
  const cur = choiceFor(state, id);
  const opts = ['train', 'bus'].map((k) => {
    const o = legOption(id, k, state.plan);
    const on = cur === k;
    return `<div class="opt opt--${k}${on ? ' is-on' : ''}${o.disabled ? ' is-off' : ''}">
      <button type="button" class="opt__pick" data-action="leg" data-leg="${id}" data-kind="${k}" aria-pressed="${on}" ${o.disabled ? 'disabled' : ''}>
        <span class="opt__top">${icon(k)}<b>${k === 'train' ? '火车' : '大巴'}</b><span class="price">${o.p ? usd(o.p) + '/人' : '—'}</span></span>
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
    <p class="leg__why">${esc(legWhy(id, state.plan))}</p>
  </article>`;
}

export function renderTickets(state) {
  const tr = transportCost(state, 'train');
  const rows = [['train', '全火车'], ['mix', '推荐混合（长途火车 + 短途大巴）'], ['bus', '全大巴']];
  if (state.mode === 'custom') rows.push(['custom', '你的自选组合']);
  const cmp = rows.map(([m, label]) => {
    const v = m === 'custom' ? transportCost(state) : transportCost(state, m);
    return `<tr class="${state.mode === m ? 'is-on' : ''}"><td>${esc(label)}</td><td class="n">${usd(v)}</td><td class="n">${v === tr ? '—' : '省 ' + usd(tr - v)}</td><td class="n">${cny(v * state.budget.rate)}</td></tr>`;
  }).join('');

  const games = GAME_ORDER.map((id) => {
    const g = GAMES[id];
    const st = gameStatus(id, state.plan);
    const arena = POI[g.arena];
    return `<article class="card gamecard gamecard--${st.tone}">
      <div class="gamecard__date"><span class="mono">${g.date}</span><span>${esc(g.wd)}</span><b class="mono">${esc(g.time)}</b></div>
      <div class="gamecard__body">
        <h3>${esc(g.title)}</h3>
        <p><button type="button" class="linkbtn" data-action="poi" data-id="${arena.id}">${esc(arena.name)}</button> · ${esc(g.price)} · <span class="pill pill--${st.tone}">${esc(st.label)}</span></p>
        ${buyRow('买票', gameLinks(id).map((l, i) => ext(l.label, l.url, i === 0)).join(''))}
      </div>
    </article>`;
  }).join('');

  const reservations = POIS.filter((p) => p.buy && p.buy.length).map((p) => `<li>
      <button type="button" class="linkbtn" data-action="poi" data-id="${p.id}">${esc(p.name)}</button>
      <span class="res__t">${esc(p.ticket)}</span>
      <div class="buys__list">${vendorLinks(p.buy)}</div></li>`).join('');

  return `
  <div class="pagehead"><h1>票务</h1><p>城际交通、球票和需要预约的景点都在这一页。火车价按原攻略总价拆分估算，大巴价来自比价网站区间，下单前以官网为准。</p></div>

  <section class="sec">
    <div class="sec__h"><h2>城际交通</h2><span class="more">当前：${esc(MODE_LABEL[state.mode])} · 两人 ${usd(transportCost(state))}</span></div>
    <div class="segctl segctl--inline" role="radiogroup" aria-label="交通方式">${[['train', '全火车'], ['mix', '推荐混合'], ['bus', '全大巴']].map(([m, l]) =>
      `<button type="button" role="radio" aria-checked="${state.mode === m}" class="segctl__opt${state.mode === m ? ' is-on' : ''}" data-action="set" data-key="mode" data-value="${m}"><b>${l}</b></button>`).join('')}</div>
    <div class="legs">${LEG_IDS.map((id) => legCard(id, state)).join('')}</div>
    <div class="card"><div class="scroll"><table class="tbl"><thead><tr><th>组合</th><th class="n">两人城际</th><th class="n">比全火车</th><th class="n">人民币</th></tr></thead><tbody>${cmp}</tbody></table></div>
    <p class="note">大巴票越早买越便宜，Megabus / OurBus 偶尔有 $1–9 早鸟票。火车 Saver 票不退，Value 票可改签。</p></div>
  </section>

  <section class="sec">
    <div class="sec__h"><h2>NBA 球票</h2><span class="more">每场 7 个入口，第一个是推荐</span></div>
    <div class="games">${games}</div>
    <h3 class="sec__sub">选哪个平台</h3>
    <p class="note">先在 TickPick 看含费总价定基准，再去 SeatGeek、StubHub 打开“显示含费价格”对比，最后在 Ticketmaster 看有没有官方原价票。奇才、篮网赛前 1–2 天用 Gametime 捡漏。</p>
    <div class="platforms">${TICKET_PLATFORMS.map((p) => `<a class="card platform" href="${esc(p.url)}" target="_blank" rel="noopener"><b>${esc(p.name)}</b><span>${esc(p.note)}</span></a>`).join('')}</div>
  </section>

  <section class="sec">
    <div class="sec__h"><h2>需要预约的景点</h2></div>
    <ul class="card reslist">${reservations}</ul>
  </section>`;
}

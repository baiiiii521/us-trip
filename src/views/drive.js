// 自驾：租车方案、花费、取还车步骤、每段路线、停车、驾驶规则
import { esc, icon, usd, cny, ext } from '../lib/dom.js';
import { carCost, rentCompare } from '../lib/calc.js';
import { DRIVES, PICKUP, DROPOFF, PARKING, DRIVE_GUIDE, rentPlan } from '../data/drive.js';
import { HOTEL_OF } from '../data/hotels.js';
import { LEG_STATUS } from '../data/travelcards.js';
import { driveUrl, directionsUrl } from '../lib/maps.js';

const CITY_ZH = { bos: '波士顿', dc: '华盛顿', phl: '费城' };
const ENDS = {
  s1: () => [PICKUP.jfk.q, HOTEL_OF.bos.addr],
  s2: (st) => [st.rent === 'bos' ? PICKUP.bos.q : HOTEL_OF.bos.addr, HOTEL_OF.dc.addr],
  s3: () => [HOTEL_OF.dc.addr, HOTEL_OF.phl.addr],
  s4: () => [HOTEL_OF.phl.addr, HOTEL_OF.nyc.addr]
};
const LEG_MD = { s1: '12/18 周五', s2: '12/21 周一', s3: '12/23 周三', s4: '12/24 周四' };

function costCard(state) {
  const c = carCost(state);
  const rate = +state.budget.rate || 6.8;
  const rows = [
    [`租车 ${c.days} 天 × $${state.budget.carDay}`, c.rental, '在“花费 → 预算”里改成你订到的每天总价'],
    ...(c.oneWay ? [['异地还车费', c.oneWay, '波士顿取、纽约还，下单时看清楚']] : []),
    [`油费（约 ${c.miles} 英里，28 mpg，$3.3/加仑）`, c.fuel, ''],
    ['过路费（含租车公司收费服务费）', c.tolls, '估算'],
    [`停车（${Object.entries(c.parkNights).filter(([, v]) => v).map(([k, v]) => `${CITY_ZH[k]} ${v} 晚`).join('、')}）`, c.parking, '酒店停车场按晚收，估算']
  ];
  return `<section class="card">
    <div class="card__h"><h2>自驾花费</h2><span class="meta">两人一车 · 估算</span></div>
    <table class="tbl tbl--brk"><tbody>${rows.map(([l, v, n]) => `<tr><td>${esc(l)}${n ? `<small class="tbl__note">${esc(n)}</small>` : ''}</td><td class="n">${usd(v)}</td></tr>`).join('')}
      <tr class="tbl__sum"><td>合计</td><td class="n">${usd(c.total)}<small class="tbl__note">≈ ${cny(c.total * rate)}</small></td></tr></tbody></table>
  </section>`;
}

function compareCard(state) {
  const list = rentCompare(state);
  const by = Object.fromEntries(list.map((r) => [r.rent, r]));
  const note = {
    jfk: '落地就有车，行李不用拖上火车；代价是长途飞行后马上开 4–5 小时，波士顿两天车停着也要付租金和停车费。',
    bos: '12/18 在火车上补觉；波士顿两天本来就坐地铁，不付车钱。需要异地还车费。',
    none: '最省心，不用管停车和过路费；带着两个大箱子换乘 4 次。'
  };
  const saving = by.jfk.total - by.bos.total;
  return `<section class="card">
    <div class="card__h"><h2>三种走法比一比</h2><span class="meta">城际全部花费，两人</span></div>
    <div class="rentopts">${list.map((r) => `<button type="button" class="rentopt${state.rent === r.rent ? ' is-on' : ''}" data-action="set" data-key="rent" data-value="${r.rent}" aria-pressed="${state.rent === r.rent}">
      <span class="rentopt__top"><b>${esc(r.label)}</b><span class="mono">${usd(r.total)}</span></span>
      <span class="rentopt__meta">${r.car.miles ? `租 ${r.car.days} 天 · 开 ${r.car.miles} 英里` : '不开车'}${state.rent === r.rent ? ' · 当前' : ''}</span>
      <span class="rentopt__d">${esc(note[r.rent])}</span>
    </button>`).join('')}</div>
    ${saving > 0 ? `<p class="callout"><b>建议</b>12/21 在波士顿取车比落地取车省约 ${usd(saving)}，还避开了“长途飞行后马上开 4–5 小时”这个全程最大的风险。12/19、12/20 在波士顿本来就只坐地铁，车停着只花钱。</p>` : ''}
  </section>`;
}

function stepsCard(state) {
  const pick = PICKUP[state.rent === 'bos' ? 'bos' : 'jfk'];
  const pickSteps = state.rent === 'bos' ? [
    pick.how,
    '取车：驾照原件 + 翻译件、护照、主驾驶的信用卡；两人都登记为驾驶员；确认含过路费电子收费服务和 LDW + SLI 保险。',
    '绕车拍一圈视频（轮胎、风挡、里程、油表），划痕写进合同。'
  ] : [
    '出关后先吃点东西、喝咖啡，手机连上 eSIM。别饿着、困着上路。',
    pick.how,
    '柜台：驾照原件 + 翻译件、护照、主驾驶的信用卡。两人都登记为驾驶员；确认含过路费电子收费服务、LDW + SLI 保险；不买预付油费。',
    '取车场：绕车拍一圈视频（轮胎、风挡、里程表、油表），有划痕让工作人员写进合同；调好座椅、后视镜，手机上支架，导航设好再出场。',
    '第一段先在机场周边慢慢开 10 分钟熟悉车，再上 Van Wyck 高速。'
  ];
  const dropSteps = [
    '新泽西收费公路上最后一个服务区加满油（新泽西有人帮加），保留小票。',
    `先开到公寓（${HOTEL_OF.nyc.addr}）门口卸行李，一人看车一人搬。`,
    '空车开去 JFK，跟着 Rental Car Return 指示牌，约 40–60 分钟。',
    '还车时再绕车拍一圈视频、拍油表和里程，拿到还车收据（邮件）再走。',
    '坐 AirTrain 到 Jamaica 换 LIRR 到 Atlantic Terminal，走 12 分钟回公寓，约 1 小时。',
    DROPOFF.why
  ];
  const ol = (a) => `<ol class="steps">${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`;
  return `<section class="card">
    <div class="card__h"><h2>取车 · ${esc(pick.md)} ${esc(pick.at)}</h2><a class="linkbtn" href="${esc(directionsUrl(pick.q, state.nav))}" target="_blank" rel="noopener">${icon('nav')}导航到取车点</a></div>
    <p class="meta">${esc(pick.place)}</p>
    ${ol(pickSteps)}
    <div class="card__h card__h--gap"><h2>还车 · 12/24 ${esc(DROPOFF.at)}</h2><a class="linkbtn" href="${esc(directionsUrl(DROPOFF.q, state.nav, 'driving'))}" target="_blank" rel="noopener">${icon('nav')}导航到还车点</a></div>
    <p class="meta">${esc(DROPOFF.place)}</p>
    ${ol(dropSteps)}
  </section>`;
}

function legsCard(state, legs) {
  return `<section class="sec">
    <div class="sec__h"><h2>每段路线</h2><span class="meta">${legs.length} 段</span></div>
    <div class="legs">${legs.map((id) => {
      const d = DRIVES[id];
      const [from, to] = ENDS[id](state);
      return `<article class="card leg">
        <header class="leg__h"><span class="mono">${LEG_MD[id]}</span><h3>${esc(d.from)} → ${esc(d.to)}</h3><span class="pill pill--car">${d.mi} 英里</span></header>
        <dl class="facts">
          <div><dt>时长</dt><dd>${esc(d.h)}</dd></div>
          <div><dt>路线</dt><dd>${esc(d.route)}</dd></div>
          <div><dt>过路费</dt><dd>约 $${d.toll}。${esc(d.tollNote)}</dd></div>
          <div><dt>休息</dt><dd>${esc(d.stops.join('；'))}</dd></div>
        </dl>
        <p class="callout"><b>注意</b>${esc(d.risk)}</p>
        <div class="btn-row"><a class="btn btn--primary btn--sm" href="${esc(driveUrl(from, to, state.nav))}" target="_blank" rel="noopener">${icon('nav')}开车导航</a></div>
      </article>`;
    }).join('')}</div>
  </section>`;
}

function parkingCard(state) {
  const c = carCost(state);
  const rows = Object.entries(c.parkNights).filter(([, v]) => v);
  return `<section class="card">
    <div class="card__h"><h2>停车</h2><span class="meta">约 ${usd(c.parking)}</span></div>
    <ul class="parklist">${rows.map(([k, v]) => `<li><b>${CITY_ZH[k]} ${v} 晚 · 约 $${PARKING[k].nightly}/晚</b><span>${esc(HOTEL_OF[k].parking)}</span><span>${esc(PARKING[k].note)}</span></li>`).join('')}
      <li><b>纽约 · 不停车</b><span>${esc(HOTEL_OF.nyc.parking)}</span></li></ul>
    <p class="note">入住前给每家酒店打个电话（号码在“票务 → 酒店”），问三件事：有没有停车位、每晚多少钱、车高限制。</p>
  </section>`;
}

export function renderDrive(state) {
  const plan = rentPlan(state);
  if (!plan.legs.length) {
    return `<div class="pagehead"><h1>自驾</h1><p>现在是“不租车”方案，全程火车和大巴。</p></div>
    ${compareCard(state)}`;
  }
  return `
  <div class="pagehead"><h1>自驾</h1><p>${esc(plan.label)}，12/24 回纽约还车，${plan.days} 天约 ${carCost(state).miles} 英里。纽约那 6 天不开车。</p></div>
  ${compareCard(state)}
  ${costCard(state)}
  ${stepsCard(state)}
  ${legsCard(state, plan.legs)}
  ${parkingCard(state)}
  <section class="sec">
    <div class="sec__h"><h2>驾驶和停车须知</h2><span class="meta">点开看</span></div>
    <div class="guide">${DRIVE_GUIDE.map((g, i) => `<details class="card fold"${i === 0 ? ' open' : ''}><summary><b>${esc(g.group)}</b><span class="meta">${g.items.length} 条</span></summary>
      <ul class="sheet__list">${g.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details>`).join('')}</div>
  </section>
  <section class="card">
    <div class="card__h"><h2>出发前看路况</h2></div>
    <div class="buys__list">${LEG_STATUS.car.map((l) => ext(l.label, l.url)).join('')}</div>
    <p class="note">每段出发前一晚看一次天气和路况。遇到冬季风暴预警（Winter Storm Warning）就推迟，或者改坐 Amtrak。</p>
  </section>`;
}

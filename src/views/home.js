// 总览：一句话说清这是什么 + 三个硬数字、下一件待办、三个关键决定、路线图、14 天一览、必须改的问题
import { esc, icon, usd, cny, vendorLinks, ext, buyRow, arrow } from '../lib/dom.js';
import { tripPhase, budgetTotal, MODE_LABEL, choiceFor } from '../lib/calc.js';
import { CHECKLIST, AUDIT } from '../data/content.js';
import { CITIES, TRIP } from '../data/trip.js';
import { GAMES, gameLinks } from '../data/games.js';
import { buildDays } from '../data/days.js';
import { settingsHtml } from '../components/settings.js';
import { routeMapHtml } from '../components/route-map.js';

export function renderHome(state) {
  const phase = tripPhase();
  const days = buildDays(state);
  const total = budgetTotal(state);
  const next = CHECKLIST.find((t) => !state.todo[t.id]);
  const doneCount = CHECKLIST.filter((t) => state.todo[t.id]).length;
  const games = days.flatMap((d) => d.items.filter((i) => i.game && i.game !== 'nyk25' && i.game !== 'nyk27').map((i) => i.game));

  let when;
  if (phase.phase === 'before') when = [String(phase.days), '天后出发'];
  else if (phase.phase === 'during') when = ['D' + (phase.index + 1), `第 ${phase.index + 1} 天，共 14 天`];
  else when = ['14', '天行程已结束'];

  const today = phase.phase === 'during' ? days.find((d) => d.id === phase.id) : null;

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

  ${today ? `<a class="card today m-card" href="#day-${today.id}"><span class="meta">今天 ${today.md} ${esc(today.wd)}</span><b>${esc(today.title)}</b>${arrow}</a>` : ''}

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

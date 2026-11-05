// 总览：倒计时、现在要做、关键决定、路线图、14 天一览、必须改的问题
import { esc, icon, usd, cny, vendorLinks, ext, buyRow } from '../lib/dom.js';
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
  if (phase.phase === 'before') when = `<span class="big">${phase.days}</span><span>天后出发</span>`;
  else if (phase.phase === 'during') when = `<span class="big">D${phase.index + 1}</span><span>旅行第 ${phase.index + 1} 天</span>`;
  else when = '<span class="big">✓</span><span>旅行结束</span>';

  const today = phase.phase === 'during' ? days.find((d) => d.id === phase.id) : null;

  return `
  <section class="hero">
    <div class="hero__text">
      <p class="eyebrow">2 人 · 2026.12.18 – 12.31 · 在美 ${TRIP.nights} 晚 · ${TRIP.checkedOn.slice(5).replace('-', '/')} 核对</p>
      <h1 class="hero__title">EAST COAST <em>HOOPS</em></h1>
      <p class="hero__lead">纽约进、纽瓦克出，全程公共交通。波士顿看哈佛和 MIT，南下华盛顿、费城，纽约连住 6 晚过圣诞，最后在洛杉矶海边走半天。</p>
    </div>
    <div class="hero__stats">
      <div class="stat stat--when">${when}</div>
      <div class="stat"><span class="big">${games.length}</span><span>场 NBA</span></div>
      <div class="stat"><span class="big">${usd(total)}</span><span>两人 ≈ ${cny(total * state.budget.rate)}${state.budget.flights ? '' : '<br>未含机票'}</span></div>
    </div>
  </section>

  ${today ? `<a class="card today" href="#day-${today.id}"><span class="eyebrow">今天 · ${today.md} ${esc(today.wd)}</span><b>${esc(today.title)}</b>${icon('arrow')}</a>` : ''}

  <section class="grid2">
    <div class="card next">
      <div class="card__h"><h2>现在要做</h2><a href="#info" class="more">清单 ${doneCount}/${CHECKLIST.length} ${icon('arrow')}</a></div>
      ${next ? `
        <p class="next__when">${esc(next.when)}</p>
        <p class="next__what">${esc(next.text)}</p>
        ${buyRow('去办', vendorLinks(next.buy || []) + (next.game ? gameLinks(next.game).slice(0, 3).map((l) => ext(l.label, l.url)).join('') : ''))}
        <button class="btn btn--primary" type="button" data-action="todo" data-id="${next.id}">${icon('check')}办完了，下一件</button>`
        : '<p class="next__what">清单全部完成，出发前 48 小时再核对一次时间。</p>'}
    </div>
    <div class="card">
      <div class="card__h"><h2>三个关键决定</h2></div>
      ${settingsHtml(state, { compact: true })}
    </div>
  </section>

  <section class="grid2 grid2--map">
    <div class="card">
      <div class="card__h"><h2>路线</h2><span class="more">当前：${esc(MODE_LABEL[state.mode])}</span></div>
      ${routeMapHtml(state)}
    </div>
    <div class="card">
      <div class="card__h"><h2>14 天一览</h2><a href="#days" class="more">每日行程 ${icon('arrow')}</a></div>
      <ol class="glance">${days.map((d) => {
        const g = d.items.find((i) => i.game && GAMES[i.game] && !['nyk25', 'nyk27'].includes(i.game));
        const mv = d.items.find((i) => i.leg);
        return `<li><a href="#day-${d.id}">
          <span class="glance__md">${d.md}</span><span class="glance__wd">${esc(d.wd)}</span>
          <span class="glance__city tag tag--${d.city}">${esc(CITIES[d.city].zh)}</span>
          <span class="glance__t">${esc(d.title)}</span>
          <span class="glance__ic">${mv ? icon(choiceFor(state, mv.leg)) : ''}${g ? icon('ball', 'ic--ball') : ''}</span>
        </a></li>`;
      }).join('')}</ol>
    </div>
  </section>

  <section class="card">
    <div class="card__h"><h2>原攻略里必须改的 3 处</h2><a href="#info" class="more" data-action="info-tab" data-tab="audit">全部审计 ${icon('arrow')}</a></div>
    <ul class="audit">${AUDIT.filter((a) => a.level === 'crit').map((a) => `<li class="audit__item audit--crit"><b>${esc(a.title)}</b><span>${esc(a.fix)}</span></li>`).join('')}</ul>
  </section>`;
}

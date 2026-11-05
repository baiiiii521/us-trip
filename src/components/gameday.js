// 球赛日卡片：几点开门、包袋规定、座位、怎么去怎么回、附近吃什么、票在哪
import { esc, icon, ext } from '../lib/dom.js';
import { GAMES, gameLinks } from '../data/games.js';
import { POI } from '../data/pois.js';
import { GAMEDAY, GAMEDAY_COMMON } from '../data/travelcards.js';
import { seatOf } from '../state.js';
import { directionsUrl } from '../lib/maps.js';
import { slotChip } from '../views/wallet.js';

export function gamedaySheetHtml(state, id) {
  const g = GAMES[id]; const d = GAMEDAY[id]; const arena = POI[g.arena];
  const seat = seatOf(state, id);
  return `<div class="sheet__body">
    <div class="sheet__eyebrow"><span class="tag tag--${arena.city}">${esc(g.date)} ${esc(g.wd)}</span><span class="meta">开球 ${esc(g.time)}</span></div>
    <h2 class="sheet__title" id="sheet-title">${esc(g.title)}</h2>
    <p class="sheet__sub">${esc(arena.name)}</p>
    <div class="navbar"><a class="btn btn--primary" href="${esc(directionsUrl(arena.q, state.nav))}" target="_blank" rel="noopener">${icon('nav')}导航到球馆</a></div>
    <dl class="facts">
      <div><dt>几点开门</dt><dd>${esc(d.doors)}</dd></div>
      <div><dt>怎么去</dt><dd>${esc(d.there)}</dd></div>
      <div><dt>散场怎么回</dt><dd>${esc(d.back)}</dd></div>
      <div><dt>附近吃什么</dt><dd>${esc(d.food)}</dd></div>
    </dl>
    <form class="form form--inline" data-form="seat" data-id="${esc(id)}">
      <label class="field" for="seat-${esc(id)}"><span>座位</span><input id="seat-${esc(id)}" name="seat" value="${esc(seat)}" placeholder="例如 214 区 8 排 5–6 座" autocomplete="off"></label>
      <button class="btn btn--secondary" type="submit">保存座位</button>
    </form>
    <ul class="sheet__list">${GAMEDAY_COMMON.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <div class="buys"><span class="buys__label">票</span><div class="buys__list">${slotChip(state, 'game-' + id)}${ext('查看球馆最新包袋规定', d.policy)}</div></div>
    <div class="buys"><span class="buys__label">还没买票</span><div class="buys__list">${gameLinks(id).slice(0, 4).map((l, i) => ext(l.label, l.url, i === 0)).join('')}</div></div>
  </div>`;
}

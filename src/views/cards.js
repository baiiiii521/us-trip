// 英文大字卡：给司机、前台、服务员看的地址和句子。点一下全屏放大。
import { esc, icon } from '../lib/dom.js';
import { PHRASES } from '../data/travelcards.js';
import { POI } from '../data/pois.js';
import { CITIES } from '../data/trip.js';
import { buildDays } from '../data/days.js';
import { hotelOf } from '../state.js';
import { findToday } from '../lib/today.js';

export const cardsUi = { day: '' };

const STAYS = [
  ['bos', '波士顿酒店'], ['dc', '华盛顿酒店'], ['phl', '费城酒店'], ['nyc', '纽约酒店'], ['ewr', '纽瓦克机场酒店']
];

export function renderCards(state, ctx = {}) {
  const now = ctx.now || new Date();
  const days = buildDays(state);
  const today = findToday(days, now);
  const dayId = cardsUi.day || (today ? today.id : days[0].id);
  const day = days.find((d) => d.id === dayId) || days[0];
  const pois = [];
  day.items.forEach((it) => (it.pois || []).forEach((p) => { if (POI[p] && !pois.includes(p)) pois.push(p); }));
  const stays = STAYS.filter(([c]) => c !== 'ewr' || state.opts.ewr);
  return `
  <div class="pagehead"><h1>英文大字卡</h1><p>点任意一张卡全屏放大，横过来给司机、前台或服务员看。酒店地址填一次，以后一键出示。</p></div>

  <section class="card">
    <div class="card__h"><h2>我们的酒店</h2></div>
    <ul class="clist">${stays.map(([c, label]) => {
      const h = hotelOf(state, c);
      return `<li class="crow">
        <div class="crow__main"><b>${esc(label)}</b><small>${h && h.name ? esc(h.name + (h.addr ? '，' + h.addr : '')) : '还没填地址'}</small></div>
        ${h && (h.addr || h.name) ? `<button type="button" class="btn btn--secondary" data-action="bigcard" data-en="${esc('Please take me to:\n' + [h.name, h.addr].filter(Boolean).join('\n'))}" data-zh="${esc('请带我去' + label)}">给司机看</button>` : ''}
        <button type="button" class="linkbtn" data-action="hotel-edit" data-city="${c}">${h ? '修改' : '填地址'}</button>
      </li>`;
    }).join('')}</ul>
  </section>

  <section class="card">
    <div class="card__h"><h2>这天要去的地方</h2>
      <label class="selectwrap" for="cards-day"><span class="visually-hidden">选择日期</span><select id="cards-day" data-cards-day>${days.map((d) => `<option value="${d.id}"${d.id === day.id ? ' selected' : ''}>${d.md} ${esc(d.wd)} ${esc(CITIES[d.city].zh)}</option>`).join('')}</select></label></div>
    <ul class="clist">${pois.map((id) => { const p = POI[id];
      return `<li class="crow"><div class="crow__main"><b>${esc(p.en)}</b><small>${esc(p.name)}</small></div>
        <button type="button" class="btn btn--secondary" data-action="bigcard" data-en="${esc('Please take me to:\n' + p.en + '\n' + p.q)}" data-zh="${esc('请带我去 ' + p.name)}">给司机看</button></li>`; }).join('') || '<li class="meta">这天没有要去的景点</li>'}</ul>
  </section>

  <section class="card">
    <div class="card__h"><h2>常用句子</h2></div>
    <div class="phrases">${PHRASES.map((p) => `<button type="button" class="phrase m-card" data-action="bigcard" data-en="${esc(p.en)}" data-zh="${esc(p.zh)}"><span class="tag">${esc(p.group)}</span><b>${esc(p.en)}</b><small>${esc(p.zh)}</small></button>`).join('')}</div>
  </section>`;
}

export function hotelSheetHtml(state, city) {
  const label = (STAYS.find(([c]) => c === city) || [city, city])[1];
  const h = hotelOf(state, city) || {};
  return `<div class="sheet__body">
    <h2 class="sheet__title" id="sheet-title">${esc(label)}</h2>
    <p class="meta">用英文填，给司机看时原样显示。</p>
    <form class="form" data-form="hotel" data-city="${esc(city)}">
      <label class="field" for="hotel-name"><span>酒店英文名</span><input id="hotel-name" name="name" value="${esc(h.name || '')}" placeholder="例如 Hotel Pennsylvania" autocomplete="off"></label>
      <label class="field" for="hotel-addr"><span>英文地址</span><textarea id="hotel-addr" name="addr" rows="2" placeholder="例如 401 7th Ave, New York, NY 10001">${esc(h.addr || '')}</textarea></label>
      <div class="btn-row"><button class="btn btn--primary" type="submit">${icon('check')}保存</button></div>
    </form>
  </div>`;
}

// 全屏大字卡
export function bigCardHtml(en, zh) {
  return `<div class="bigcard" data-close>
    <p class="bigcard__en">${esc(en).replace(/\n/g, '<br>')}</p>
    ${zh ? `<p class="bigcard__zh">${esc(zh)}</p>` : ''}
    <p class="bigcard__hint">点任意位置关闭</p>
  </div>`;
}

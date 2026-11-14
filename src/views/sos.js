// 紧急情况：911、领事保护、酒店电话、道路救援、丢护照、英文求助大字卡。全部离线可用。
import { esc, icon } from '../lib/dom.js';
import { CONSULATES, HOTLINE_12308, LOST_PASSPORT, SOS_CARDS, SOS_TIPS } from '../data/sos.js';
import { HOTEL_OF } from '../data/hotels.js';
import { CITIES } from '../data/trip.js';
import { buildDays } from '../data/days.js';
import { findToday } from '../lib/today.js';
import { walletOf } from '../state.js';

const telHref = (t) => 'tel:' + String(t).replace(/[^\d+]/g, '');
const call = (label, tel, primary = false) => `<a class="btn ${primary ? 'btn--primary' : 'btn--secondary'}" href="${esc(telHref(tel))}">${icon('phone')}${esc(label)}</a>`;

export function renderSos(state, ctx = {}) {
  const today = findToday(buildDays(state), ctx.now || new Date());
  const city = today ? today.city : null;
  const cons = [...CONSULATES].sort((a, b) => (b.cities.includes(city) ? 1 : 0) - (a.cities.includes(city) ? 1 : 0));
  const car = walletOf(state, 'car-rental');
  const hotels = ['bos', 'dc', 'phl', 'nyc'].map((c) => HOTEL_OF[c]).filter(Boolean);
  return `
  <div class="pagehead"><h1>紧急情况</h1><p>没网也能看。电话点一下直接拨号。${city ? `现在在${esc(CITIES[city].zh)}，对应的领馆排在最前面。` : ''}</p></div>

  <section class="card sos">
    <div class="card__h"><h2>先打这两个</h2></div>
    <div class="btn-row">${call('911 报警 / 急救 / 火警', '911', true)}${call('12308 外交部热线', HOTLINE_12308.tel)}</div>
    <p class="note">911 接通后说 “Chinese, I need an interpreter.” 会转中文翻译。${esc(HOTLINE_12308.label)}；打不通再试 ${esc(HOTLINE_12308.alt)}。</p>
  </section>

  <section class="card">
    <div class="card__h"><h2>领事保护</h2><span class="meta">号码按官网核对于 2026-11-14</span></div>
    <ul class="soslist">${cons.map((c) => `<li${c.cities.includes(city) ? ' class="is-here"' : ''}>
      <b>${esc(c.name)}</b><small>${esc(c.area)} · ${esc(c.addr)}</small>
      <div class="btn-row">${call(c.tel, c.tel, c.cities.includes(city))}<a class="btn btn--secondary" href="${esc(c.url)}" target="_blank" rel="noopener">官网</a></div>
    </li>`).join('')}</ul>
    <p class="note">这些电话不一定 24 小时有人接，节假日和夜里先打 12308。</p>
  </section>

  <section class="card">
    <div class="card__h"><h2>酒店和租车</h2></div>
    <ul class="soslist">${hotels.map((h) => `<li${h.city === city ? ' class="is-here"' : ''}><b>${esc(h.zh)}</b><small>${esc(CITIES[h.city].zh)} · ${esc(h.addr)}</small>${h.tel ? `<div class="btn-row">${call(h.tel, h.tel)}</div>` : '<small>公寓没有前台，联系方式在订单夹里</small>'}</li>`).join('')}
    ${state.rent !== 'none' ? `<li><b>租车道路救援</b><small>${car && (car.note || car.code) ? esc([car.code, car.note].filter(Boolean).join('　')) : '还没存：把救援电话写进订单夹的“租车”格子'}</small><div class="btn-row"><a class="btn btn--secondary" href="#order-car-rental">打开租车订单</a></div></li>` : ''}
    </ul>
  </section>

  <section class="card">
    <div class="card__h"><h2>给别人看的英文</h2><span class="meta">点一下全屏放大</span></div>
    <div class="soscards">${SOS_CARDS.map((c) => `<button type="button" class="soscard" data-action="bigcard" data-en="${esc(c.en)}" data-zh="${esc(c.zh)}"><b>${esc(c.en.split('\n')[0])}</b><small>${esc(c.zh)}</small></button>`).join('')}</div>
  </section>

  <section class="card">
    <div class="card__h"><h2>护照丢了怎么办</h2></div>
    <ol class="steps">${LOST_PASSPORT.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
    <div class="btn-row"><a class="btn btn--secondary" href="#vault">打开证件和订单</a></div>
  </section>

  <section class="card">
    <div class="card__h"><h2>其他情况</h2></div>
    <ul class="tips">${SOS_TIPS.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
  </section>`;
}

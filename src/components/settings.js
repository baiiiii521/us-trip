// 方案设置：交通方式、12/20 方案、纽约住宿、导航 App。总览页和设置弹层共用。
import { esc, usd } from '../lib/dom.js';
import { PLANS } from '../data/legs.js';
import { NAV_APPS } from '../lib/maps.js';
import { transportCost } from '../lib/calc.js';

function seg(name, options, current) {
  return `<div class="segctl" role="radiogroup" aria-label="${esc(name)}">${options.map((o) =>
    `<button type="button" role="radio" aria-checked="${o.value === current}" class="segctl__opt${o.value === current ? ' is-on' : ''}" data-action="set" data-key="${o.key}" data-value="${o.value}">
      <b>${esc(o.label)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</button>`).join('')}</div>`;
}

export function settingsHtml(state, { compact = false } = {}) {
  const tr = transportCost(state, 'train');
  const modes = [
    { key: 'mode', value: 'train', label: '全火车', sub: usd(tr) },
    { key: 'mode', value: 'mix', label: '推荐混合', sub: usd(transportCost(state, 'mix')) + ' · 省 ' + usd(tr - transportCost(state, 'mix')) },
    { key: 'mode', value: 'bus', label: '全大巴', sub: usd(transportCost(state, 'bus')) + ' · 省 ' + usd(tr - transportCost(state, 'bus')) }
  ];
  const plans = ['A', 'C', 'B'].map((k) => ({ key: 'plan', value: k, label: PLANS[k].short, sub: PLANS[k].note }));
  const hotels = [
    { key: 'hotel', value: 'penn', label: '方便版 · Penn Station', sub: '步行到火车站和 NJ Transit' },
    { key: 'hotel', value: 'lic', label: '省钱版 · 长岛市', sub: '每晚约省 $90，地铁 10–15 分钟' }
  ];
  const navs = Object.entries(NAV_APPS).map(([k, v]) => ({ key: 'nav', value: k, label: v }));
  return `
  <div class="settings${compact ? ' settings--compact' : ''}">
    <section class="set"><h3 class="set__h">城际交通 <small>两人 4 段${state.mode === 'custom' ? ' · 当前是自选组合' : ''}</small></h3>${seg('城际交通', modes, state.mode)}</section>
    <section class="set"><h3 class="set__h">12/20 方案 <small>凯尔特人 20:00 开球 vs 67 次 18:45 开车</small></h3>${seg('12/20 方案', plans, state.plan)}</section>
    <section class="set"><h3 class="set__h">纽约住宿 <small>6 晚</small></h3>${seg('纽约住宿', hotels, state.hotel)}</section>
    ${compact ? '' : `<section class="set"><h3 class="set__h">导航用 <small>页面上所有“导航”按钮跟着换</small></h3>${seg('导航 App', navs, state.nav)}</section>
    <p class="note">设置保存在这台设备的浏览器里。<button type="button" class="linkbtn" data-action="reset">恢复默认设置</button></p>`}
  </div>`;
}

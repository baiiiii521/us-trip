// 方案设置：交通方式、12/20 方案、纽约住宿、导航 App。总览页和设置弹层共用。
import { esc, usd } from '../lib/dom.js';
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
  const stays30 = [
    { key: 'opts.ewr', value: 'false', label: '住公寓（默认）', sub: '公寓已订到 12/31，凌晨 02:30 叫车去机场' },
    { key: 'opts.ewr', value: 'true', label: '改机场酒店 1 晚', sub: '约 $170，要退掉公寓最后一晚' }
  ];
  const navs = Object.entries(NAV_APPS).map(([k, v]) => ({ key: 'nav', value: k, label: v }));
  return `
  <div class="settings${compact ? ' settings--compact' : ''}">
    <section class="set"><h3 class="set__h">城际交通 <small>两人 4 段${state.mode === 'custom' ? ' · 当前是自选组合' : ''}</small></h3>${seg('城际交通', modes, state.mode)}</section>
    <section class="set"><h3 class="set__h">已定行程 <small>不能再改的那几项</small></h3>
      <ul class="set__fixed">
        <li><b>12/20 凯尔特人</b><span>20:00 开球，波士顿住 3 晚，12/21 早上南下</span></li>
        <li><b>纽约住宿</b><span>DKLB BKLN 公寓 · 12/24–12/31 · $90/晚</span></li>
      </ul>
    </section>
    <section class="set"><h3 class="set__h">12/30 晚住宿 <small>次日 12/31 06:00 从纽瓦克飞洛杉矶</small></h3>${seg('12/30 晚住宿', stays30, String(!!state.opts.ewr))}</section>
    ${compact ? '' : `<section class="set"><h3 class="set__h">导航用 <small>页面上所有“导航”按钮跟着换</small></h3>${seg('导航 App', navs, state.nav)}</section>
    <p class="note">设置保存在这台设备的浏览器里。<button type="button" class="linkbtn" data-action="reset">恢复默认设置</button></p>`}
  </div>`;
}

// 预算：输入 + 明细 + 占比条。输入框改动只局部刷新，不打断输入。
import { esc, usd, cny } from '../lib/dom.js';
import { budgetRows, budgetTotal, budgetByGroup, GROUP_LABEL } from '../lib/calc.js';

const FIELDS = [
  ['flights', '机票合计（两人，美元）', 10],
  ['rate', '汇率 $1 = ¥', 0.01],
  ['bos', '波士顿 每晚', 5],
  ['dc', '华盛顿 每晚', 5],
  ['phl', '费城 每晚', 5],
  ['penn', '纽约 Penn Station 每晚', 5],
  ['lic', '纽约 长岛市 每晚', 5],
  ['food', '餐饮 每人每天', 5]
];
const OPTS = [
  ['ewr', '12/30 纽瓦克机场酒店（约 $170）', '推荐。原要求是不住酒店，这里留作可选。'],
  ['summit', 'Summit 观景台（约 $45/人）', '电梯直达，不用爬。'],
  ['ins', '旅行保险（约 $60/人）', '含航班延误和行李，分开买票时尤其有用。']
];
const KIND = { real: '实查', est: '估算', in: '你填' };

export function budgetOutputHtml(state) {
  const rows = budgetRows(state);
  const total = budgetTotal(state);
  const groups = budgetByGroup(state);
  const bar = Object.entries(groups).filter(([, v]) => v > 0).map(([g, v]) =>
    `<span class="bar__seg bar--${g}" style="flex:${v}" title="${esc(GROUP_LABEL[g])} ${usd(v)}"></span>`).join('');
  const legend = Object.entries(groups).filter(([, v]) => v > 0).map(([g, v]) =>
    `<li><i class="bar--${g}"></i>${esc(GROUP_LABEL[g])}<span class="mono">${usd(v)}</span><span class="pct">${total ? Math.round(v / total * 100) : 0}%</span></li>`).join('');
  return `
    <div class="sum"><span>两人合计</span><b class="mono">${usd(total)}</b><span class="mono">≈ ${cny(total * (+state.budget.rate || 0))}</span>${state.budget.flights ? '' : '<em>还没填机票</em>'}</div>
    <div class="bar" role="img" aria-label="预算占比">${bar}</div>
    <ul class="barlegend">${legend}</ul>
    <table class="tbl tbl--brk"><tbody>${rows.map((r) => `<tr><td>${esc(r.label)}<span class="kind kind--${r.kind}">${KIND[r.kind]}</span></td><td class="n">${usd(r.amount)}</td></tr>`).join('')}</tbody></table>`;
}

export function renderBudget(state) {
  return `
  <div class="pagehead"><h1>预算</h1><p>数字都能改，保存在这台设备的浏览器里。房价是 12 月下旬的估算，请换成订房页的含税价，再填上机票。</p></div>
  ${budgetBody(state)}`;
}

export function budgetBody(state) {
  return `
  <div class="grid2 grid2--budget">
    <section class="card">
      <div class="card__h"><h2>输入</h2></div>
      <div class="fields">${FIELDS.map(([k, label, step]) => `<label class="fld" for="b-${k}"><span>${esc(label)}</span>
        <input id="b-${k}" type="number" inputmode="decimal" min="0" step="${step}" value="${esc(state.budget[k])}" data-bind="budget.${k}"></label>`).join('')}</div>
      <div class="optlist">${OPTS.map(([k, label, sub]) => `<label class="ck" for="o-${k}"><input id="o-${k}" type="checkbox" ${state.opts[k] ? 'checked' : ''} data-bind="opts.${k}"><span><b>${esc(label)}</b><small>${esc(sub)}</small></span></label>`).join('')}</div>
    </section>
    <section class="card">
      <div class="card__h"><h2>明细</h2></div>
      <div id="budget-out">${budgetOutputHtml(state)}</div>
      <p class="note"><span class="kind kind--real">实查</span> 11/5 前查到的价格 · <span class="kind kind--est">估算</span> 按往年或同类价格 · <span class="kind kind--in">你填</span> 你自己的数字。外币卡可能另收 1–1.5% 手续费，汇率默认按 6.8 留了余量。</p>
    </section>
  </div>`;
}

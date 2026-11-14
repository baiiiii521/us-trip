// 花费：记账（旅途中随手记）、结算（两人 AA）、预算（出发前估算）
import { esc, icon, usd, cny } from '../lib/dom.js';
import { EXP_CATS, liveExpenses, settle, byCategory, toUsd } from '../lib/money.js';
import { budgetByGroup } from '../lib/calc.js';
import { personName } from '../state.js';
import { buildDays } from '../data/days.js';
import { findToday } from '../lib/today.js';
import { budgetBody } from './budget.js';
import { TAX, TIPS, billTotal } from '../lib/tools.js';

export const moneyUi = { tab: 'log', draft: { currency: 'USD', cat: 'food', payer: 'a', split: 'both' }, bill: { amount: '', city: '', tip: 18, incl: false } };

// 结账计算的结果（输入时只刷新这一块，不重绘整页）
export function billOutHtml(state) {
  const b = moneyUi.bill;
  const rate = +state.budget.rate || 6.8;
  const r = billTotal({ amount: b.amount, taxRate: TAX[b.city || 'nyc'].rate, tipPct: b.tip, taxIncluded: b.incl });
  return `<div><span>${b.incl ? '税前' : '菜单金额'}</span><b>${usd2(r.sub)}</b></div>
    <div><span>税</span><b>${usd2(r.tax)}</b></div>
    <div><span>小费 ${b.tip}%（按税前算）</span><b>${usd2(r.tip)}</b></div>
    <div><span>每人</span><b>${usd2(r.each)}</b></div>
    <div class="is-total"><span>一共要付 · 约 ${cny(r.total * rate)}</span><b>${usd2(r.total)}</b></div>`;
}
const usd2 = (n) => '$' + (Number(n) || 0).toFixed(2);

function billCard(state, today) {
  const b = moneyUi.bill;
  if (!b.city) b.city = today && TAX[today.city] ? today.city : 'nyc';
  return `<section class="card bill">
    <div class="card__h"><h2>结账计算</h2><span class="meta">美国标价不含税，小费另付</span></div>
    <form class="form" data-form="bill">
      <div class="form__row">
        <label class="field field--amount" for="bill-amount"><span>账单金额（美元）</span><input id="bill-amount" name="amount" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0.00" value="${esc(b.amount)}" data-bill="amount"></label>
        <label class="field" for="bill-city"><span>在哪个城市</span><select id="bill-city" name="city" data-bill="city">${Object.entries(TAX).map(([k, v]) => `<option value="${k}"${k === b.city ? ' selected' : ''}>${esc(v.label)}</option>`).join('')}</select></label>
      </div>
      <div class="field"><span>小费</span><div class="pills">${TIPS.map((t) => `<label class="pillradio${t === +b.tip ? ' is-on' : ''}"><input type="radio" name="tip" value="${t}" data-bill="tip"${t === +b.tip ? ' checked' : ''}><span>${t ? t + '%' : '不给'}</span></label>`).join('')}</div></div>
      <label class="check"><input type="checkbox" name="incl" data-bill="incl"${b.incl ? ' checked' : ''}> 我输入的是已含税的金额（收据上的 Total）</label>
      <div class="bill__out" id="bill-out" aria-live="polite">${billOutHtml(state)}</div>
      <button class="btn btn--primary" type="submit">${icon('check')}按总额记一笔</button>
    </form>
    <p class="note">餐馆坐下吃给 18–20%；外带、柜台点餐可以不给或给 10%；收据上已经有 “Gratuity / Service charge” 就不用再给。刷卡时小费写在 Tip 那一行，Total 写总数。</p>
  </section>`;
}

const TABS = [['log', '记账'], ['settle', '结算'], ['budget', '预算']];
// 记账分类 → 预算分组（用于“实际 vs 预算”）
const CAT_TO_GROUP = { food: ['food'], transport: ['transport', 'local'], hotel: ['hotel'], tickets: ['games', 'tickets'], shopping: [], other: ['other', 'flight'] };

function radio(name, value, label, current) {
  return `<label class="pillradio${value === current ? ' is-on' : ''}"><input type="radio" name="${name}" value="${esc(value)}" ${value === current ? 'checked' : ''}><span>${esc(label)}</span></label>`;
}

function logTab(state, now) {
  const rate = +state.budget.rate || 6.8;
  const days = buildDays(state);
  const today = findToday(days, now);
  const d = moneyUi.draft;
  const list = liveExpenses(state.expenses);
  const total = list.reduce((s, e) => s + toUsd(e, rate), 0);
  const byDate = {};
  for (const e of list) (byDate[e.date || '其他'] = byDate[e.date || '其他'] || []).push(e);
  const a = personName(state, 'a'), b = personName(state, 'b');
  return `
  ${billCard(state, today)}
  <section class="card">
    <div class="card__h"><h2>记一笔</h2><span class="meta">汇率 1 美元 = ¥${rate.toFixed(2)} <button type="button" class="linkbtn" data-action="fx-live">用实时汇率</button></span></div>
    <form class="form" data-form="expense">
      <div class="form__row">
        <label class="field field--amount" for="exp-amount"><span>金额</span><input id="exp-amount" name="amount" type="number" inputmode="decimal" step="0.01" min="0" required placeholder="0.00"></label>
        <div class="field"><span>币种</span><div class="pills">${radio('currency', 'USD', '美元', d.currency)}${radio('currency', 'CNY', '人民币', d.currency)}</div></div>
      </div>
      <div class="field"><span>分类</span><div class="pills">${Object.entries(EXP_CATS).map(([k, v]) => radio('cat', k, v, d.cat)).join('')}</div></div>
      <div class="form__row">
        <div class="field"><span>谁付的</span><div class="pills">${radio('payer', 'a', a, d.payer)}${radio('payer', 'b', b, d.payer)}</div></div>
        <div class="field"><span>怎么分</span><div class="pills">${radio('split', 'both', '两人平分', d.split)}${radio('split', 'a', '只算' + a, d.split)}${radio('split', 'b', '只算' + b, d.split)}</div></div>
      </div>
      <div class="form__row">
        <label class="field" for="exp-date"><span>日期</span><select id="exp-date" name="date">${['出发前', ...days.map((x) => x.md), '回国后'].map((v) => `<option${(today ? today.md : '出发前') === v ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
        <label class="field" for="exp-note"><span>备注</span><input id="exp-note" name="note" placeholder="例如 DiNic's 三明治" autocomplete="off"></label>
      </div>
      <button class="btn btn--primary" type="submit">${icon('check')}记下这笔</button>
    </form>
  </section>
  <section class="card">
    <div class="card__h"><h2>已记 ${list.length} 笔</h2><span class="meta">合计 ${usd(total)} ≈ ${cny(total * rate)}</span></div>
    ${list.length ? Object.entries(byDate).map(([date, rows]) => `<h3 class="xdate">${esc(date)}</h3><ul class="xlist">${rows.map((e) => `<li class="xrow">
      <span class="tag">${esc(EXP_CATS[e.cat] || '其他')}</span>
      <span class="xrow__main"><b>${esc(e.note || EXP_CATS[e.cat] || '一笔花费')}</b><small>${esc(personName(state, e.payer))}付，${e.split === 'both' ? '两人平分' : '只算' + esc(personName(state, e.split))}</small></span>
      <span class="xrow__amt mono">${e.currency === 'CNY' ? cny(+e.amount) : usd(+e.amount)}${e.currency === 'CNY' ? '' : `<small>${cny(toUsd(e, rate) * rate)}</small>`}</span>
      <button type="button" class="iconbtn iconbtn--sm" data-action="exp-del" data-id="${esc(e.id)}" aria-label="删除这笔">${icon('close')}</button>
    </li>`).join('')}</ul>`).join('') : '<p class="empty">还没有记录。旅途中每笔花费随手记，最后自动算出谁该给谁多少。</p>'}
  </section>`;
}

function settleTab(state) {
  const rate = +state.budget.rate || 6.8;
  const r = settle(state.expenses, rate);
  const a = personName(state, 'a'), b = personName(state, 'b');
  const cat = byCategory(state.expenses, rate);
  const plan = budgetByGroup(state);
  const rows = Object.entries(EXP_CATS).map(([k, label]) => {
    const spent = cat[k] || 0; const budget = (CAT_TO_GROUP[k] || []).reduce((s, g) => s + (plan[g] || 0), 0);
    const pct = budget ? Math.min(100, Math.round(spent / budget * 100)) : 0;
    return `<li><span>${esc(label)}</span><span class="cmpbar"><span style="width:${budget ? pct : (spent ? 100 : 0)}%" class="${budget && spent > budget ? 'over' : ''}"></span></span><span class="mono">${usd(spent)}${budget ? ` / ${usd(budget)}` : ''}</span></li>`;
  }).join('');
  return `
  <section class="card">
    <div class="card__h"><h2>两人结算</h2></div>
    <form class="form form--inline" data-form="people">
      <label class="field" for="name-a"><span>我叫</span><input id="name-a" name="a" value="${esc(a)}" autocomplete="off"></label>
      <label class="field" for="name-b"><span>同伴叫</span><input id="name-b" name="b" value="${esc(b)}" autocomplete="off"></label>
      <button class="btn btn--secondary" type="submit">保存名字</button>
    </form>
    <div class="settle">
      <div><span class="meta">${esc(a)} 付了</span><b class="mono">${usd(r.paid.a)}</b><small>应承担 ${usd(r.owe.a)}</small></div>
      <div><span class="meta">${esc(b)} 付了</span><b class="mono">${usd(r.paid.b)}</b><small>应承担 ${usd(r.owe.b)}</small></div>
    </div>
    <p class="settle__line">${r.transfer ? `${esc(personName(state, r.transfer.from))} 给 ${esc(personName(state, r.transfer.to))} <b class="mono">${usd(r.transfer.usd)}</b>，约 <b class="mono">${cny(r.transfer.usd * rate)}</b>` : '目前两人不用互相转账'}</p>
  </section>
  <section class="card">
    <div class="card__h"><h2>实际花费和预算</h2><span class="meta">合计 ${usd(r.total)} / 预算 ${usd(Object.values(plan).reduce((s, v) => s + v, 0))}</span></div>
    <ul class="cmplist">${rows}</ul>
    <p class="note">机票、城际交通等出发前付清的钱，也可以在“出发前”日期里记一笔，这样结算才完整。</p>
  </section>`;
}

export function renderMoney(state, ctx = {}) {
  const now = ctx.now || new Date();
  const body = moneyUi.tab === 'settle' ? settleTab(state) : moneyUi.tab === 'budget' ? budgetBody(state) : logTab(state, now);
  return `
  <div class="pagehead"><h1>花费</h1><p>出发前看预算，旅途中随手记账，最后自动算出两人谁该给谁多少。</p></div>
  <div class="subtabs" role="tablist">${TABS.map(([k, l]) => `<button type="button" role="tab" aria-selected="${moneyUi.tab === k}" class="subtab${moneyUi.tab === k ? ' is-on' : ''}" data-action="money-tab" data-tab="${k}">${esc(l)}</button>`).join('')}</div>
  <div class="subbody">${body}</div>`;
}

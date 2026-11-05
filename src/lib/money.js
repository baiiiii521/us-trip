// 记账与 AA 结算。纯函数，可测试。金额统一换算成美元计算。
export const EXP_CATS = { food: '餐饮', transport: '交通', hotel: '住宿', tickets: '门票球票', shopping: '纪念品', other: '其他' };

export function toUsd(e, rate) {
  const amt = Number(e.amount) || 0;
  return e.currency === 'CNY' ? amt / (Number(rate) || 6.8) : amt;
}

export function liveExpenses(expenses) {
  return Object.entries(expenses || {}).filter(([, e]) => e && !e.del).map(([id, e]) => ({ id, ...e }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.u || 0) - (a.u || 0));
}

// 每人实际付了多少、应该承担多少、最后谁给谁
export function settle(expenses, rate, people = ['a', 'b']) {
  const paid = Object.fromEntries(people.map((p) => [p, 0]));
  const owe = Object.fromEntries(people.map((p) => [p, 0]));
  let total = 0;
  for (const e of liveExpenses(expenses)) {
    const usd = toUsd(e, rate); total += usd;
    if (paid[e.payer] != null) paid[e.payer] += usd;
    const split = e.split === 'a' || e.split === 'b' ? [e.split] : people;
    for (const p of split) owe[p] += usd / split.length;
  }
  const bal = Object.fromEntries(people.map((p) => [p, paid[p] - owe[p]]));
  let transfer = null;
  const [a, b] = people;
  if (Math.abs(bal[a]) >= 0.01) transfer = bal[a] > 0 ? { from: b, to: a, usd: bal[a] } : { from: a, to: b, usd: -bal[a] };
  return { total, paid, owe, bal, transfer };
}

export function byCategory(expenses, rate) {
  const out = {};
  for (const e of liveExpenses(expenses)) out[e.cat || 'other'] = (out[e.cat || 'other'] || 0) + toUsd(e, rate);
  return out;
}

// 实时汇率（欧洲央行数据，免费、可跨域）。失败返回 null
export async function fetchRate() {
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=CNY');
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.rates && j.rates.CNY ? Number(j.rates.CNY) : null;
  } catch (e) { return null; }
}

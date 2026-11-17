import { getState } from '../../shared/state.js';
import { budgetRows, budgetByGroup, GROUP_LABEL } from '../../shared/lib/calc.js';
import { money } from '../../lib/format.js';

const KIND = { real: '已订', est: '估算', in: '含在预算里' };

Page({
  data: { total: '', per: '', groups: [], rows: [], rate: '' },

  onShow() {
    this.render();
  },

  render() {
    const s = getState();
    const rows = budgetRows(s);
    const total = budgetRows(s).reduce((n, r) => n + r.amount, 0);
    const byGroup = budgetByGroup(s);
    const groups = Object.entries(byGroup)
      .sort((a, b) => b[1] - a[1])
      .map(([g, v]) => ({ key: g, label: GROUP_LABEL[g] || g, usd: money(v), pct: Math.round((v / total) * 100), w: `${Math.max(2, Math.round((v / total) * 100))}%` }));

    this.setData({
      total: money(total),
      per: money(total / 2),
      rate: String(s.budget.rate || ''),
      groups,
      rows: rows.map((r) => ({ label: r.label, usd: money(r.amount), kind: KIND[r.kind] || '' }))
    });
  },

  toLedger() {
    wx.navigateTo({ url: '/pages/ledger/ledger' });
  }
});

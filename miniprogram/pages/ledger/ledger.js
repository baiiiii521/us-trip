import { getState, update, personName } from '../../shared/state.js';
import { liveExpenses, settle, toUsd, EXP_CATS } from '../../shared/lib/money.js';
import { money } from '../../lib/format.js';

const CAT_KEYS = Object.keys(EXP_CATS);
const todayStr = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

Page({
  data: {
    list: [],
    total: '',
    per: '',
    bal: [],
    settleText: '',
    rate: '',
    catLabel: '',
    // 表单
    form: { amount: '', currency: 'USD', cat: 'food', payer: 'a', split: 'all', date: '', note: '' },
    cats: CAT_KEYS.map((k) => ({ key: k, label: EXP_CATS[k] })),
    catIndex: 0,
    payerOptions: [],
    payerIndex: 0,
    splitOptions: [{ key: 'all', label: '两人平摊' }, { key: 'a', label: '只有我出' }, { key: 'b', label: '只有同伴出' }],
    splitIndex: 0,
    currencyOptions: ['美元 USD', '人民币 CNY'],
    currencyIndex: 0
  },

  onLoad() {
    this.setData({ form: { ...this.data.form, date: todayStr() } });
  },

  onShow() {
    this.render();
  },

  render() {
    const s = getState();
    const rate = s.budget.rate;
    const people = ['a', 'b'];
    const names = { a: personName(s, 'a'), b: personName(s, 'b') };
    const rows = liveExpenses(s.expenses).map((e) => ({
      id: e.id,
      date: e.date || '',
      label: `${EXP_CATS[e.cat] || '其他'}${e.note ? ` · ${e.note}` : ''}`,
      payer: names[e.payer] || e.payer,
      amount: e.currency === 'CNY' ? `¥${Math.round(e.amount)}` : money(e.amount),
      usd: money(toUsd(e, rate)),
      split: e.split === 'a' ? names.a : e.split === 'b' ? names.b : '平摊'
    }));

    const st = settle(s.expenses, rate, people);
    const settleText = st.transfer
      ? `${names[st.transfer.from]} 给 ${names[st.transfer.to]} ${money(st.transfer.usd)}`
      : '两人扯平了';

    this.setData({
      list: rows,
      total: money(st.total),
      per: money(st.total / 2),
      bal: people.map((p) => ({ name: names[p], v: money(st.bal[p]), pos: st.bal[p] >= 0 })),
      settleText,
      rate: String(rate),
      payerOptions: people.map((p) => ({ key: p, label: names[p] }))
    });
  },

  onAmount(e) { this.setData({ 'form.amount': e.detail.value }); },
  onNote(e) { this.setData({ 'form.note': e.detail.value }); },
  onDate(e) { this.setData({ 'form.date': e.detail.value }); },
  onCat(e) {
    const i = Number(e.detail.value);
    this.setData({ catIndex: i, 'form.cat': this.data.cats[i].key });
  },
  onPayer(e) {
    const i = Number(e.detail.value);
    this.setData({ payerIndex: i, 'form.payer': this.data.payerOptions[i].key });
  },
  onSplit(e) {
    const i = Number(e.detail.value);
    this.setData({ splitIndex: i, 'form.split': this.data.splitOptions[i].key });
  },
  onCurrency(e) {
    const i = Number(e.detail.value);
    this.setData({ currencyIndex: i, 'form.currency': i === 0 ? 'USD' : 'CNY' });
  },

  add() {
    const f = this.data.form;
    const amount = Number(f.amount);
    if (!amount || amount <= 0) {
      wx.showToast({ title: '先填金额', icon: 'none' });
      return;
    }
    const id = `e${Date.now()}`;
    update((s) => {
      s.expenses[id] = {
        amount,
        currency: f.currency,
        cat: f.cat,
        payer: f.payer,
        split: f.split,
        date: f.date || todayStr(),
        note: String(f.note || '').slice(0, 40),
        u: Date.now()
      };
    });
    this.setData({ form: { ...f, amount: '', note: '' }, catIndex: 0 });
    this.render();
    wx.showToast({ title: '记上了', icon: 'success' });
  },

  del(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '删掉这一笔？',
      content: '两人同步后对方也会看不到。',
      confirmText: '删掉',
      confirmColor: '#B3261E',
      success: (r) => {
        if (!r.confirm) return;
        update((s) => { s.expenses[id] = { del: true, u: Date.now() }; });
        this.render();
      }
    });
  }
});

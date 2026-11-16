// 旅途小工具：结账、退房清单、停车、开车前一晚提醒、今天花费、紧急页、圣诞营业标记
import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS } from '../src/state.js';
import { buildDays } from '../src/data/days.js';
import { billTotal, TAX, checkoutItems, parkingCities, driveEves, daySpend } from '../src/lib/tools.js';
import { SYNC_KEYS, mergeDocs } from '../src/lib/sync.js';
import { renderSos } from '../src/views/sos.js';
import { renderHome } from '../src/views/home.js';
import { renderMoney } from '../src/views/money.js';
import { CONSULATES } from '../src/data/sos.js';
import { CITIES } from '../src/data/trip.js';

const S = () => JSON.parse(JSON.stringify(DEFAULTS));
const day = (st, id) => buildDays(st).find((d) => d.id === id);

test('结账：税按菜单金额算，小费按税前算；已含税时先倒推税前', () => {
  const r = billTotal({ amount: 100, taxRate: TAX.nyc.rate, tipPct: 18 });
  assert.equal(r.tax, 8.88); assert.equal(r.tip, 18); assert.equal(r.total, 126.88); assert.equal(r.each, 63.44);
  const inc = billTotal({ amount: 108.875, taxRate: TAX.nyc.rate, tipPct: 20, taxIncluded: true });
  assert.equal(inc.sub, 100); assert.equal(inc.tip, 20); assert.equal(inc.total, 128.88);
  assert.equal(billTotal({ amount: '', taxRate: 0.07, tipPct: 18 }).total, 0);
  for (const c of Object.keys(TAX)) assert.ok(CITIES[c], c);
});

test('退房清单：换住处的早上才有，开车的日子多两项', () => {
  const st = S(); st.rent = 'jfk';
  assert.equal(checkoutItems(day(st, '1218'), st).length, 0);
  assert.equal(checkoutItems(day(st, '1219'), st).length, 0);
  const d21 = checkoutItems(day(st, '1221'), st);
  assert.ok(d21.some((x) => x.id === 'out-1221-car'));
  assert.ok(d21.every((x) => x.id.startsWith('out-1221-')));
  assert.equal(checkoutItems(day(st, '1230'), st).length, 0);
  assert.ok(checkoutItems(day(st, '1231'), st).length >= 6);
  st.opts.ewr = true;
  assert.ok(checkoutItems(day(st, '1230'), st).length >= 6);
  const none = S(); none.rent = 'none';
  assert.ok(!checkoutItems(day(none, '1221'), none).some((x) => x.id.endsWith('-car')));
});

test('车停在哪：只在租车期间、车过夜的城市出现', () => {
  const jfk = S(); jfk.rent = 'jfk';
  assert.deepEqual(parkingCities(day(jfk, '1218'), jfk), ['bos']);
  assert.deepEqual(parkingCities(day(jfk, '1221'), jfk), ['bos', 'dc']);
  assert.deepEqual(parkingCities(day(jfk, '1224'), jfk), ['phl']);
  assert.deepEqual(parkingCities(day(jfk, '1226'), jfk), []);
  const bos = S(); bos.rent = 'bos';
  assert.deepEqual(parkingCities(day(bos, '1220'), bos), []);
  assert.deepEqual(parkingCities(day(bos, '1221'), bos), ['dc']);
  const none = S(); none.rent = 'none';
  assert.deepEqual(parkingCities(day(none, '1222'), none), []);
  assert.ok(SYNC_KEYS.includes('parking'));
  const m = mergeDocs({ parking: { bos: { spot: 'P1', u: 1 } } }, { parking: { bos: { spot: 'P2 B14', u: 5 } } });
  assert.equal(m.parking.bos.spot, 'P2 B14');
});

test('开车前一晚 21:00 提醒看天气，落地那天不提醒', () => {
  const st = S(); st.rent = 'jfk';
  const ev = driveEves(buildDays(st), st, () => true);
  assert.deepEqual(ev.map((e) => e.leg), ['s2', 's3', 's4']);
  const s2 = ev[0].at;
  assert.equal(s2.getDate(), 20); assert.equal(s2.getHours(), 21);
  assert.match(ev[0].body, /450 英里/);
  assert.equal(driveEves(buildDays(st), st, () => false).length, 0);
});

test('今天花费：只算这一天，人民币按汇率换算', () => {
  const ex = { a: { amount: 50, currency: 'USD', date: '12/20', u: 1 }, b: { amount: 68, currency: 'CNY', date: '12/20', u: 2 }, c: { amount: 9, currency: 'USD', date: '12/21', u: 3 }, d: { del: true, u: 4 } };
  assert.equal(daySpend(ex, '12/20', 6.8), 60);
});

test('紧急页、今天卡片、结账卡片都能渲染', () => {
  const st = S();
  const sos = renderSos(st, { now: new Date(2026, 11, 22, 10) });
  assert.match(sos, /tel:911/);
  assert.match(sos, /tel:\+861012308/);
  // 在华盛顿时，大使馆排在领馆第一位
  assert.ok(sos.indexOf('中国驻美国大使馆') < sos.indexOf('中国驻纽约总领馆'));
  for (const c of CONSULATES) assert.match(c.tel, /^\+1-\d{3}-\d{3}-\d{4}$/);
  const h21 = renderHome(st, { now: new Date(2026, 11, 21, 6, 30), weather: null });
  assert.match(h21, /退房前检查/); assert.match(h21, /车停在哪 · 波士顿/); assert.match(h21, /今天的花费/); assert.match(h21, /#sos/);
  assert.match(renderMoney(st, { now: new Date(2026, 11, 20, 12) }), /结账计算/);
});

test('圣诞营业：12/24、12/25 去景点的条目都标了照常或待确认', () => {
  for (const rent of ['jfk', 'bos', 'none']) {
    const st = S(); st.rent = rent;
    for (const id of ['1224', '1225']) {
      const d = day(st, id);
      for (const it of d.items) {
        if (it.leg || it.drive || (!it.pois && !it.buy && !it.game) || /Rocky/.test(it.text || '') || /回公寓|LIRR/.test(it.text || '')) continue;
        assert.ok(it.xmas && ['open', 'check', 'closed'].includes(it.xmas.s), `${id} ${it.t}`);
      }
    }
  }
});

test('导航：底部 5 个，票务和自驾挂在“随身”下，旧链接 #tickets 照样能开', async () => {
  const { ROUTES, SUBPAGES } = await import('../src/components/shell.js');
  assert.deepEqual(ROUTES.map((r) => r.id), ['home', 'days', 'guide', 'money', 'more']);
  assert.equal(SUBPAGES.tickets.parent, 'more');
  assert.equal(SUBPAGES.drive.parent, 'more');
  const { shortTitle } = await import('../src/views/home.js');
  assert.equal(shortTitle('租车：12/18 JFK 取 → 12/24 曼哈顿 Battery Park 还（Sixt）'), '租车');
  assert.equal(shortTitle('郑州 → 纽约 JFK（MF8280 / MF849）'), '郑州 → 纽约 JFK');
});

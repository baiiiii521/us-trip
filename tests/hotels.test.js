// 酒店数据：订单字段、与每日行程/预算是否对得上
import test from 'node:test';
import assert from 'node:assert/strict';
import { HOTELS, HOTEL_OF, BOOKED_CNY, hotelUsd } from '../src/data/hotels.js';
import { buildDays } from '../src/data/days.js';
import { buildRoute } from '../src/lib/route.js';
import { budgetRows } from '../src/lib/calc.js';
import { DEFAULTS } from '../src/state.js';

const state = (over = {}) => ({ ...JSON.parse(JSON.stringify(DEFAULTS)), ...over });

test('四处住宿都已订，纽约是 AVA Fort Greene 公寓', () => {
  assert.equal(HOTELS.length, 4);
  assert.ok(HOTELS.every((h) => h.status === '已订'));
  for (const h of HOTELS) assert.ok(h.en && h.addr && h.parking, `${h.id} 缺英文名、地址或停车说明`);
  const nyc = HOTEL_OF.nyc;
  assert.equal(nyc.en, 'AVA Fort Greene');
  assert.equal(nyc.addr, '343 Gold St, Brooklyn, NY 11201');
  assert.ok(!/3810|Apt|Apartment/.test(JSON.stringify(HOTELS)), '房号不放进公开网站');
  assert.equal(HOTELS.reduce((n, h) => n + h.nights, 0), 13);
  assert.ok(BOOKED_CNY > 4000 && BOOKED_CNY < 4200, `已订合计异常：${BOOKED_CNY}`);
  assert.equal(hotelUsd(nyc), 630);
});

test('每日行程的“住”写的是订的酒店', () => {
  const days = buildDays(state());
  const by = (id) => days.find((d) => d.id === id).stay;
  assert.match(by('1218'), /欢朋.*811 Massachusetts Ave/);
  assert.match(by('1222'), /希尔顿花园酒店.*1225 First St NE/);
  assert.match(by('1223'), /温德姆.*400 Arch St/);
  assert.match(by('1224'), /AVA Fort Greene.*343 Gold St/);
  assert.match(by('1230'), /AVA Fort Greene|机场酒店/);
  const text = JSON.stringify(days);
  assert.ok(!/DKLB/.test(text), '行程里还有旧公寓名');
});

test('默认按方案 C：波士顿住够 3 晚，和酒店订单一致', () => {
  assert.equal(DEFAULTS.plan, 'C');
  const route = buildRoute(state());
  assert.equal(route.stays.find((s) => s.city === 'bos').nights, 3);
  const nyc = route.stays.find((s) => s.city === 'nyc');
  assert.equal(nyc.nights, 7); // 公寓订到 12/31
});

test('预算里纽约按公寓 7 晚算', () => {
  const rows = budgetRows(state());
  const nyc = rows.find((r) => r.label.startsWith('纽约'));
  assert.match(nyc.label, /7 晚/);
  assert.match(nyc.label, /AVA Fort Greene/);
  assert.equal(nyc.amount, 90 * 7);
  const ewr = budgetRows(state({ opts: { ...DEFAULTS.opts, ewr: true } }));
  assert.match(ewr.find((r) => r.label.startsWith('纽约')).label, /6 晚/);
  assert.ok(ewr.some((r) => /纽瓦克机场酒店/.test(r.label)));
});

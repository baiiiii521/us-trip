// 机票数据：票面字段是否齐全，以及每日行程里引用的航班号是否和 flights.js 对得上
import test from 'node:test';
import assert from 'node:assert/strict';
import { FLIGHTS } from '../src/data/flights.js';
import { buildDays } from '../src/data/days.js';
import { DEFAULTS } from '../src/state.js';

const state = () => JSON.parse(JSON.stringify(DEFAULTS));

test('两程机票：航段、航班号、时间、航站楼都在', () => {
  assert.equal(FLIGHTS.length, 2);
  for (const f of FLIGHTS) {
    assert.ok(f.title && f.record && f.bags && f.note, `${f.id} 缺字段`);
    assert.equal(f.segments.length, 2, `${f.id} 应该是两段`);
    for (const s of f.segments) {
      assert.match(s.flight, /^[A-Z]{2}\d{3,4}$/, `${f.id} 航班号格式不对：${s.flight}`);
      assert.match(s.depTime, /^\d{2}\/\d{2} \d{2}:\d{2}$/);
      assert.match(s.arrTime, /^\d{2}\/\d{2} \d{2}:\d{2}$/);
      assert.ok(s.dep && s.arr, `${s.flight} 缺起降机场`);
    }
  }
});

test('回程第二段是跨天到达，票面只印一个时间', () => {
  const back = FLIGHTS.find((f) => f.id === 'back');
  const last = back.segments[1];
  assert.equal(last.flight, 'UA771');
  assert.match(last.arrNote || '', /跨 2 天/);
});

test('每日行程里写的航班号和机票数据一致', () => {
  const days = buildDays(state());
  const text = days.map((d) => d.items.map((i) => i.text || '').join(' ')).join(' ');
  const fromData = FLIGHTS.flatMap((f) => f.segments.map((s) => s.flight));
  for (const no of fromData) {
    assert.ok(text.includes(no), `行程里没提到航班 ${no}`);
  }
  // 反过来：行程里出现的航班号都必须是票面上的
  const found = new Set(text.match(/[A-Z]{2}\d{3,4}/g) || []);
  for (const no of found) assert.ok(fromData.includes(no), `行程里出现了票面没有的航班 ${no}`);
});

test('落地当天写的是 10:55 到 JFK，回程当天写 06:00 从纽瓦克走', () => {
  const days = buildDays(state());
  const d18 = days.find((d) => d.id === '1218');
  const d31 = days.find((d) => d.id === '1231');
  assert.ok(d18.items.some((i) => /MF849/.test(i.text) && /10:55/.test(i.text)));
  assert.ok(d18.items.some((i) => /MF8280/.test(i.text) && /12\/17/.test(i.text)));
  assert.ok(d31.items.some((i) => /UA2434/.test(i.text) && /06:00/.test(i.text) && /纽瓦克/.test(i.text)));
  assert.ok(d31.items.some((i) => /UA771/.test(i.text) && /23:35/.test(i.text)));
});

test('订单夹里有三张机票格子，带上航班号', () => {
  const days = buildDays(state());
  assert.ok(days.length === 14);
  return import('../src/data/bookings.js').then(({ walletSlots }) => {
    const slots = walletSlots(state()).filter((s) => s.group === 'flight');
    assert.equal(slots.length, 3);
    const titles = slots.map((s) => s.title).join(' ');
    for (const no of ['MF8280', 'MF849', 'UA2434', 'UA771']) assert.ok(titles.includes(no), `订单夹缺 ${no}`);
  });
});

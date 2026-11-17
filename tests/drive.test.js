// 自驾：租车方案、花费、每日行程和隐私
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULTS } from '../src/state.js';
import { carCost, rentCompare, budgetRows, choiceFor, transportCost } from '../src/lib/calc.js';
import { buildDays } from '../src/data/days.js';
import { DRIVES, RENT_PLANS, DRIVE_GUIDE, DROPOFF } from '../src/data/drive.js';
import { PRIVATE_PATTERNS } from '../scripts/mp-scan.mjs';

const state = (over = {}) => ({ ...JSON.parse(JSON.stringify(DEFAULTS)), ...over });

test('默认是你们的计划：12/18 JFK 取车，四段全自驾', () => {
  const s = state();
  assert.equal(s.rent, 'jfk');
  for (const id of ['s1', 's2', 's3', 's4']) assert.equal(choiceFor(s, id), 'car');
  assert.equal(transportCost(s), 0, '全程自驾不该再算车票');
});

test('自驾花费：6 天租车 + 油 + 过路费 + 波士顿/华盛顿/费城停车', () => {
  const c = carCost(state());
  assert.equal(c.days, 6);
  assert.equal(c.booked, true);
  assert.equal(c.rental, Math.round(4300 / DEFAULTS.budget.rate), '已订 ¥4,300 含保险');
  assert.equal(c.miles, 215 + 450 + 140 + 100 + 4);
  assert.ok(c.fuel > 80 && c.fuel < 150, `油费 ${c.fuel}`);
  assert.deepEqual(c.parkNights, { bos: 3, dc: 2, phl: 1 });
  assert.equal(c.total, c.rental + c.oneWay + c.fuel + c.tolls + c.parking);
});

test('波士顿取车：只租 3 天，不付波士顿停车，加异地还车费', () => {
  const c = carCost(state({ rent: 'bos' }));
  assert.equal(c.days, 3);
  assert.equal(c.booked, false);
  assert.equal(c.rental, 3 * DEFAULTS.budget.carDay);
  assert.equal(c.parkNights.bos, 0);
  assert.equal(c.oneWay, DEFAULTS.budget.oneWay);
  const cmp = Object.fromEntries(rentCompare(state()).map((r) => [r.rent, r]));
  assert.ok(cmp.bos.total < cmp.jfk.total, '按默认估算，波士顿取车应该更省');
  assert.equal(cmp.none.car.total, 0);
});

test('预算里有租车、油费、过路费、停车，不再有 4 段车票', () => {
  const rows = budgetRows(state());
  assert.equal(rows.find((r) => /^租车/.test(r.label)).kind, 'real');
  for (const re of [/^租车 6 天/, /^油费/, /^过路费/, /^停车/]) assert.ok(rows.some((r) => re.test(r.label)), `缺 ${re}`);
  assert.ok(!rows.some((r) => /^城际车票/.test(r.label)));
  const none = budgetRows(state({ rent: 'none' }));
  assert.ok(none.some((r) => /^城际车票 4 段/.test(r.label)));
  assert.ok(!none.some((r) => /^租车/.test(r.label)));
});

test('每日行程：12/18 取车、12/24 还车，自驾日不再写火车大巴', () => {
  const days = buildDays(state());
  const d = (id) => days.find((x) => x.id === id);
  assert.ok(d('1218').items.some((i) => i.drive === 'pickup'));
  assert.ok(d('1224').items.some((i) => i.drive === 'dropoff'));
  for (const id of ['1218', '1221', '1223', '1224']) {
    const text = d(id).items.map((i) => i.text || '').join(' ');
    assert.ok(!/Amtrak|大巴|South Station 坐|联合车站（不用打车）/.test(text), `${id} 还在写公共交通：${text.slice(0, 80)}`);
  }
  // 12/24 在曼哈顿 Sixt Battery Park 还车，12:30 前还掉（平安夜门店可能 13:00 关门，订单也写 13:00）
  for (const rent of ['jfk', 'bos']) {
    const drop = buildDays(state({ rent })).find((x) => x.id === '1224').items.find((i) => i.drive === 'dropoff');
    const [h, m] = drop.t.split(' ')[0].split(':').map(Number);
    assert.ok(h * 60 + m <= 12 * 60 + 30, `${rent} 还车 ${drop.t} 太晚`);
  }
  assert.match(DROPOFF.q, /Morris/);
  assert.match(DROPOFF.hours, /07:30–13:00/);
  // 不租车时恢复原来的火车/大巴
  const none = buildDays(state({ rent: 'none' }));
  assert.ok(none.find((x) => x.id === '1218').items.some((i) => /AirTrain 到 Jamaica/.test(i.text || '')));
});

test('每段路线数据齐全，驾驶须知每组都有内容', () => {
  for (const id of RENT_PLANS.jfk.legs) {
    const x = DRIVES[id];
    assert.ok(x.mi > 0 && x.h && x.route && x.toll >= 0 && x.tollNote && x.risk && x.stops.length, `${id} 缺字段`);
  }
  assert.ok(DRIVE_GUIDE.length >= 6);
  for (const g of DRIVE_GUIDE) assert.ok(g.items.length >= 3, g.group);
});

test('公开网站的源码和 public/ 里没有护照号、PNR、票号、公寓房号', () => {
  const bad = PRIVATE_PATTERNS;
  const walk = (dir) => readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
  for (const f of [...walk('src'), ...walk('public'), ...walk('scripts').filter((f) => /\.m?js$/.test(f))]) {
    if (/\.(png|jpg|ico)$/.test(f)) continue;
    const txt = readFileSync(f, 'latin1');
    assert.ok(!bad.test(txt), `${f} 含个人信息`);
  }
});

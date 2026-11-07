import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transportCost, choicesForMode, detectMode, budgetRows, budgetTotal, tripPhase } from '../src/lib/calc.js';
import { DEFAULTS } from '../src/state.js';

const base = () => JSON.parse(JSON.stringify(DEFAULTS));

test('三种交通组合的两人价格（12/20 固定方案 C，s2 是 12/21 白天车）', () => {
  const s = base();
  assert.equal(transportCost(s, 'train'), (79 + 89 + 45 + 45) * 2);
  assert.equal(transportCost(s, 'mix'), (79 + 89 + 22 + 18) * 2);
  assert.equal(transportCost(s, 'bus'), (35 + 60 + 22 + 18) * 2);
});

test('模式识别', () => {
  assert.equal(detectMode(choicesForMode('train')), 'train');
  assert.equal(detectMode(choicesForMode('bus')), 'bus');
  assert.equal(detectMode(choicesForMode('mix')), 'mix');
  assert.equal(detectMode({ s1: 'bus', s2: 'train', s3: 'train', s4: 'bus' }), 'custom');
});

test('预算里波士顿 3 晚、凯尔特人、纽约公寓 7 晚都在', () => {
  const rows = budgetRows(base());
  assert.ok(rows.some((r) => r.label === '波士顿 3 晚'));
  assert.ok(rows.some((r) => r.label.includes('凯尔特人')));
  const nyc = rows.find((r) => r.label.startsWith('纽约'));
  assert.equal(nyc.amount, 90 * 7);
  // 机票默认按订单 ¥12,200 ÷ 6.8
  assert.equal(rows.find((r) => r.label.startsWith('机票')).amount, 1794);
});

test('出发倒计时', () => {
  assert.deepEqual(tripPhase(new Date(2026, 10, 5)), { phase: 'before', days: 43 });
  const d = tripPhase(new Date(2026, 11, 20, 15));
  assert.equal(d.phase, 'during');
  assert.equal(d.id, '1220');
  assert.equal(tripPhase(new Date(2027, 0, 2)).phase, 'after');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transportCost, choicesForMode, detectMode, budgetRows, budgetTotal, tripPhase } from '../src/lib/calc.js';
import { DEFAULTS } from '../src/state.js';

const base = () => JSON.parse(JSON.stringify(DEFAULTS));

test('三种交通组合的两人价格', () => {
  const s = base();
  assert.equal(transportCost(s, 'train'), (79 + 99 + 45 + 45) * 2); // 536，与原攻略一致
  assert.equal(transportCost(s, 'mix'), (79 + 99 + 22 + 18) * 2);
  assert.equal(transportCost(s, 'bus'), (35 + 70 + 22 + 18) * 2);
});

test('方案 B 强制 12/20 坐大巴，方案 C 用 12/21 白天车', () => {
  const s = base();
  s.plan = 'B';
  assert.equal(transportCost(s, 'train'), (79 + 75 + 45 + 45) * 2);
  s.plan = 'C';
  assert.equal(transportCost(s, 'train'), (79 + 89 + 45 + 45) * 2);
});

test('模式识别', () => {
  assert.equal(detectMode(choicesForMode('train')), 'train');
  assert.equal(detectMode(choicesForMode('bus')), 'bus');
  assert.equal(detectMode(choicesForMode('mix')), 'mix');
  assert.equal(detectMode({ s1: 'bus', s2: 'train', s3: 'train', s4: 'bus' }), 'custom');
});

test('方案 C 多一晚波士顿、多一场凯尔特人', () => {
  const a = base();
  const c = base(); c.plan = 'C';
  const diff = budgetTotal(c) - budgetTotal(a);
  // 多一晚 210 + 凯尔特人 280 + 交通差 (89-99)*2
  assert.equal(diff, 210 + 280 - 20);
  assert.ok(budgetRows(c).some((r) => r.label.includes('凯尔特人')));
});

test('纽约住宿切换只改纽约 6 晚', () => {
  const a = base();
  const b = base(); b.hotel = 'lic';
  assert.equal(budgetTotal(a) - budgetTotal(b), (320 - 230) * 6);
});

test('出发倒计时', () => {
  assert.deepEqual(tripPhase(new Date(2026, 10, 5)), { phase: 'before', days: 43 });
  const d = tripPhase(new Date(2026, 11, 20, 15));
  assert.equal(d.phase, 'during');
  assert.equal(d.id, '1220');
  assert.equal(tripPhase(new Date(2027, 0, 2)).phase, 'after');
});

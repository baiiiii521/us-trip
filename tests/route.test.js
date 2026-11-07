// 整体路线图的数据模型：停留段、城际移动、方案 A/B/C 的差异
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRoute } from '../src/lib/route.js';
import { DEFAULTS } from '../src/state.js';

const state = (over = {}) => ({ ...JSON.parse(JSON.stringify(DEFAULTS)), ...over });

test('停留段：五座城市按顺序，14 天一天不漏、不重', () => {
  const r = buildRoute(state());
  assert.deepEqual(r.stays.map((s) => s.city), ['bos', 'dc', 'phl', 'nyc', 'la']);
  const ids = r.stays.flatMap((s) => s.dayIds);
  assert.equal(ids.length, 14);
  assert.equal(new Set(ids).size, 14);
  assert.deepEqual(ids, r.days.map((d) => d.id));
});

test('移动段：4 段城际 + 1 段航班，每段都能定位到某一天', () => {
  const r = buildRoute(state());
  assert.deepEqual(r.moves.map((m) => m.id), ['s1', 's2', 's3', 's4', 'air']);
  for (const m of r.moves) {
    assert.ok(r.days.some((d) => d.id === m.dayId), `${m.id} 的 dayId ${m.dayId} 不存在`);
    assert.ok(m.dur && m.fromZh && m.toZh);
  }
  assert.equal(r.moves[4].kind, 'flight');
});

test('s2 固定在 12/21 白天南下（方案 C）', () => {
  const r = buildRoute(state());
  assert.equal(r.moves[1].md, '12/21');
  assert.equal(r.moves[1].dayId, '1221');
  assert.equal(r.moves[1].night, false);
  // 老存档里的 A/B 也会被迁移成 C
  const old = state({ plan: 'A' });
  assert.equal(buildRoute(old).moves[1].md, '12/21');
});

test('住几晚：波士顿 3 晚、纽约 7 晚，和酒店订单一致', () => {
  const r = buildRoute(state());
  const byCity = Object.fromEntries(r.stays.map((s) => [s.city, s.nights]));
  assert.deepEqual(byCity, { bos: 3, dc: 2, phl: 1, nyc: 7, la: 0 });

  // 改了 12/30 机场酒店，最后一晚不在公寓，纽约变 6 晚
  const ewr = buildRoute(state({ opts: { ...DEFAULTS.opts, ewr: true } }));
  assert.equal(ewr.stays.find((s) => s.city === 'nyc').nights, 6);
});

test('球赛归到正确的停留段（含 12/20 凯尔特人）', () => {
  const r = buildRoute(state());
  const games = Object.fromEntries(r.stays.map((s) => [s.city, s.games.map((g) => g.id)]));
  assert.deepEqual(games.bos, ['bos']);
  assert.deepEqual(games.dc, ['was']);
  assert.deepEqual(games.phl, ['phi']);
  assert.deepEqual(games.nyc, ['nyk25', 'bkn', 'nyk27']);
});

test('交通方式跟着选择变', () => {
  const train = buildRoute(state({ choice: { s1: 'train', s2: 'train', s3: 'train', s4: 'train' } }));
  assert.ok(train.moves.slice(0, 4).every((m) => m.kind === 'train'));
  const bus = buildRoute(state({ choice: { s1: 'bus', s2: 'bus', s3: 'bus', s4: 'bus' } }));
  assert.ok(bus.moves.slice(0, 4).every((m) => m.kind === 'bus'));
});

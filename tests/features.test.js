import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeDocs, syncDoc, encodeShare, decodeShare, encryptDoc, decryptDoc, SYNC_KEYS } from '../src/lib/sync.js';
import { settle, byCategory, toUsd, parseRate } from '../src/lib/money.js';
import { findToday, nowAndNext, itemTime, fmtCountdown, keyEvents } from '../src/lib/today.js';
import { alertFor, codeLabel, weatherFor, parseWeather } from '../src/lib/weather.js';
import { tripDayOf } from '../src/lib/exif.js';
import { walletSlots, slotsForItem } from '../src/data/bookings.js';
import { buildDays } from '../src/data/days.js';
import { DEFAULTS, migrate, isDone, personName } from '../src/state.js';
import { handle } from '../api/sync.js';
import { scheduleReminders, notifyPermission } from '../src/lib/notify.js';
import { pickMime } from '../src/lib/recap.js';

const S = () => JSON.parse(JSON.stringify(DEFAULTS));

test('mergeDocs: 每条记录取更新时间较新的一份，删除也生效', () => {
  const a = { todo: { t1: { v: true, u: 5 } }, expenses: { e1: { amount: 10, u: 1 } } };
  const b = { todo: { t1: { v: false, u: 9 } }, expenses: { e1: { del: true, u: 3 }, e2: { amount: 4, u: 2 } } };
  const m = mergeDocs(a, b);
  assert.equal(m.todo.t1.v, false);
  assert.equal(m.expenses.e1.del, true);
  assert.equal(m.expenses.e2.amount, 4);
  for (const k of SYNC_KEYS) assert.ok(k in m);
});

test('mergeDocs: 顺序无关、重复合并结果不变', () => {
  const a = { wallet: { x: { code: 'A', u: 2 } } };
  const b = { wallet: { x: { code: 'B', u: 7 }, y: { code: 'C', u: 1 } } };
  assert.deepEqual(mergeDocs(a, b), mergeDocs(b, a));
  assert.deepEqual(mergeDocs(mergeDocs(a, b), b), mergeDocs(a, b));
});

test('同步码：编码再解码得到同一份数据', async () => {
  const s = S(); s.todo.t1 = { v: true, u: 1 }; s.people.a = { v: '小白', u: 2 };
  const code = await encodeShare(syncDoc(s));
  assert.match(code, /^HOOPS[01]\./);
  assert.deepEqual(await decodeShare(code), syncDoc(s));
  await assert.rejects(() => decodeShare('乱写的'));
});

test('云同步加密：对的口令能解开，错的不行，房间 id 与口令有关', async () => {
  const doc = { todo: { t1: { v: true, u: 1 } } };
  const { id, body } = await encryptDoc(doc, 'room', 'pw');
  assert.match(id, /^[a-f0-9]{64}$/);
  assert.deepEqual(await decryptDoc(body, 'room', 'pw'), doc);
  await assert.rejects(() => decryptDoc(body, 'room', 'wrong'));
  assert.notEqual((await encryptDoc(doc, 'room', 'other')).id, id);
});

test('api/sync：未配置 501，PUT 后 GET 取回，坏输入被拒绝', async () => {
  assert.equal((await handle({ method: 'GET', id: 'a'.repeat(64) }, null)).status, 501);
  const mem = new Map();
  const store = { get: async (k) => mem.get(k) || null, set: async (k, v) => { mem.set(k, v); } };
  const id = 'b'.repeat(64);
  assert.equal((await handle({ method: 'GET', id }, store)).status, 404);
  assert.equal((await handle({ method: 'PUT', id, body: { iv: 'x', ct: 'y' } }, store)).status, 200);
  const got = await handle({ method: 'GET', id }, store);
  assert.deepEqual(got.json, { iv: 'x', ct: 'y' });
  assert.equal((await handle({ method: 'PUT', id: 'short', body: {} }, store)).status, 400);
  assert.equal((await handle({ method: 'PUT', id, body: { nope: 1 } }, store)).status, 400);
  assert.equal((await handle({ method: 'PUT', id, body: 'x'.repeat(400000) }, store)).status, 413);
  assert.equal((await handle({ method: 'DELETE', id }, store)).status, 405);
});

test('settle: 两人平分、只算一人、人民币换算', () => {
  const ex = {
    e1: { amount: 100, currency: 'USD', payer: 'a', split: 'both', cat: 'food', u: 1 },
    e2: { amount: 30, currency: 'USD', payer: 'b', split: 'a', cat: 'other', u: 2 },
    e3: { amount: 68, currency: 'CNY', payer: 'b', split: 'both', cat: 'food', u: 3 },
    e4: { amount: 999, currency: 'USD', payer: 'a', split: 'both', del: true, u: 4 }
  };
  const r = settle(ex, 6.8);
  assert.equal(Math.round(r.total * 100) / 100, 140);
  assert.equal(Math.round(r.paid.a), 100);
  assert.equal(Math.round(r.paid.b), 40);
  // a 应承担 50 + 30 + 5 = 85；b 应承担 50 + 5 = 55；a 多付 15
  assert.equal(Math.round(r.owe.a), 85);
  assert.equal(Math.round(r.owe.b), 55);
  assert.equal(r.transfer.from, 'b'); assert.equal(r.transfer.to, 'a'); assert.equal(Math.round(r.transfer.usd), 15);
  assert.equal(toUsd({ amount: 68, currency: 'CNY' }, 6.8), 10);
  assert.equal(Math.round(byCategory(ex, 6.8).food), 110);
  assert.equal(settle({}, 6.8).transfer, null);
});

test('今天模式：按日期找到当天，再找当前项和下一项', () => {
  const days = buildDays(S());
  const d = findToday(days, new Date(2026, 11, 19, 10, 0));
  assert.equal(d.id, '1219');
  assert.equal(findToday(days, new Date(2026, 10, 5)), null);
  assert.equal(findToday(days, new Date(2025, 11, 19)), null);
  const { current, next, minutes } = nowAndNext(d, new Date(2026, 11, 19, 10, 0));
  assert.equal(current.it.t, '09:30'); assert.equal(next.it.t, '11:00'); assert.equal(minutes, 60);
  assert.equal(itemTime(d, '落地'), null);
  assert.equal(fmtCountdown(0), '马上'); assert.equal(fmtCountdown(45), '45 分钟后'); assert.equal(fmtCountdown(125), '2 小时 5 分钟后');
  assert.ok(keyEvents(findToday(days, new Date(2026, 11, 20))).length >= 1);
});

test('天气预案：大雪、小雪、大雨、严寒才提醒', () => {
  assert.equal(alertFor({ snow: 12, code: 75, lo: -3 }).level, 'crit');
  assert.equal(alertFor({ snow: 3, code: 71, lo: -1 }).level, 'warn');
  assert.equal(alertFor({ rain: 20, code: 63, lo: 5 }).level, 'warn');
  assert.equal(alertFor({ snow: 0, code: 0, lo: -12 }).level, 'warn');
  assert.equal(alertFor({ snow: 0, rain: 0, code: 1, lo: 2 }), null);
  assert.equal(alertFor(null), null);
  assert.equal(codeLabel(0), '晴'); assert.equal(codeLabel(73), '雪');
  assert.equal(weatherFor({ 'nyc|2026-12-25': { hi: 3 } }, 'nyc', { md: '12/25' }).hi, 3);
});

test('照片日期归到行程第几天', () => {
  assert.equal(tripDayOf(new Date(2026, 11, 20, 9)), '1220');
  assert.equal(tripDayOf(new Date(2026, 11, 31, 23)), '1231');
  assert.equal(tripDayOf(new Date(2026, 11, 17)), 'other');
  assert.equal(tripDayOf(new Date(2025, 11, 20)), 'other');
});

test('订单夹：凯尔特人始终有格子，每个行程里的票都有对应格子', () => {
  const a = S();
  assert.ok(walletSlots(a).some((s) => s.id === 'game-bos'));
  const c = S(); c.opts.ewr = true; c.opts.ins = true; c.opts.summit = true;
  const ids = walletSlots(c).map((s) => s.id);
  assert.ok(ids.includes('game-bos'));
  assert.ok(ids.includes('hotel-ewr') && ids.includes('doc-ins') && ids.includes('res-summit'));
  assert.equal(new Set(ids).size, ids.length);
  for (const st of [c]) {
    const have = new Set(walletSlots(st).map((s) => s.id));
    for (const d of buildDays(st)) for (const it of d.items) for (const id of slotsForItem(it)) assert.ok(have.has(id), `${d.md} 缺格子 ${id}`);
  }
});

test('状态迁移：旧版布尔清单升级，名字有默认值', () => {
  const o = migrate({ todo: { t1: true, t2: false, t3: { v: true, u: 5 } } });
  assert.deepEqual(o.todo.t1, { v: true, u: 0 });
  const s = S(); s.todo = o.todo;
  assert.equal(isDone(s, 't1'), true); assert.equal(isDone(s, 't2'), false); assert.equal(isDone(s, 't3'), true);
  assert.equal(personName(S(), 'a'), '我'); assert.equal(personName(S(), 'b'), '同伴');
});

test('提醒：只有 60 / 15 分钟前、且落在这 24 小时窗口内才排程', () => {
  // node 里没有浏览器对象，先造一个最小环境（window + Notification）
  const g = globalThis;
  const had = { w: 'window' in g, n: 'Notification' in g };
  const fakeNotif = { permission: 'granted', requestPermission: async () => 'granted' };
  g.window = g.window || {};
  g.window.Notification = fakeNotif;
  g.Notification = fakeNotif;
  try {
    const now = new Date('2026-12-20T10:00:00Z');
    const at = (min) => new Date(now.getTime() + min * 60000);
    // 75 分钟后：两条都能排（60 分钟前 + 15 分钟前）
    assert.equal(scheduleReminders([{ at: at(75), title: 't', body: 'b' }], now), 2);
    // 20 分钟后：只有 15 分钟那条
    assert.equal(scheduleReminders([{ at: at(20), title: 't', body: 'b' }], now), 1);
    // 10 分钟后：两条都来不及
    assert.equal(scheduleReminders([{ at: at(10), title: 't', body: 'b' }], now), 0);
    // 30 小时后：超出 24 小时窗口，不排（下次打开再算）
    assert.equal(scheduleReminders([{ at: at(30 * 60), title: 't', body: 'b' }], now), 0);
    scheduleReminders([], now);
    // 没授权时一条都不排
    fakeNotif.permission = 'denied';
    assert.equal(notifyPermission(), 'denied');
    assert.equal(scheduleReminders([{ at: at(75), title: 't', body: 'b' }], now), 0);
  } finally {
    if (!had.w) delete g.window;
    if (!had.n) delete g.Notification;
  }
});

test('回忆视频：优先 mp4（iPhone Safari 只认 mp4），其次 webm', () => {
  const g = globalThis;
  const hadMR = 'MediaRecorder' in g;
  const stub = (ok) => { g.MediaRecorder = { isTypeSupported: (t) => ok.includes(t) }; };
  try {
    stub(['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4']);
    assert.match(pickMime(), /^video\/mp4/);
    stub(['video/webm;codecs=vp9,opus', 'video/webm']);
    assert.match(pickMime(), /^video\/webm/);
    stub([]);
    assert.equal(pickMime(), '');
    delete g.MediaRecorder;
    assert.equal(pickMime(), null); // 完全不支持录制
  } finally {
    if (!hadMR) delete g.MediaRecorder;
  }
});

test('实时汇率：v2 数组和 v1 对象两种返回都认，坏数据返回 null', () => {
  assert.equal(parseRate([{ date: '2026-11-08', base: 'USD', quote: 'CNY', rate: 6.6635 }]), 6.6635);
  assert.equal(parseRate({ amount: 1, base: 'USD', rates: { CNY: 6.6713 } }), 6.6713);
  assert.equal(parseRate([{ quote: 'EUR', rate: 0.9 }]), null);
  assert.equal(parseRate({ rates: {} }), null);
  assert.equal(parseRate(null), null);
  assert.equal(parseRate([{ quote: 'CNY', rate: 0 }]), null);
});

test('天气：Open-Meteo 返回按 城市|日期 归档，行程日期能取到', () => {
  const map = parseWeather('nyc', { daily: {
    time: ['2026-12-20', '2026-12-21'],
    weather_code: [3, 75], temperature_2m_max: [4.2, -1.8], temperature_2m_min: [-2.5, -6.1],
    snowfall_sum: [0, 12.4], rain_sum: [0, 0], precipitation_probability_max: [10, 95]
  } });
  assert.deepEqual(Object.keys(map).sort(), ['nyc|2026-12-20', 'nyc|2026-12-21']);
  const w = weatherFor(map, 'nyc', { md: '12/21' });
  assert.equal(w.code, 75);
  assert.equal(w.snow, 12.4);
  assert.equal(alertFor(w).level, 'crit');
  assert.equal(weatherFor(map, 'nyc', { md: '12/25' }), null); // 预报窗口外 → 页面回落到 12 月平均
  assert.deepEqual(parseWeather('nyc', {}), {});
});


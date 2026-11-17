import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS } from '../src/state.js';
import { buildDays } from '../src/data/days.js';
import { CONFIRMS, CHECKINS, EATS, POI_LL, TOILETS } from '../src/data/extras.js';
import { POIS } from '../src/data/pois.js';
import { VENDORS } from '../src/data/vendors.js';
import { clocks, distM, fmtDist, walkMin, nearest, checkinStatus, activeCheckins, checkinEvents, recapStats } from '../src/lib/extras.js';
import { SYNC_KEYS, mergeDocs } from '../src/lib/sync.js';
import { nowAndNext } from '../src/lib/today.js';
import { renderEats, renderNear, nearUi, renderRecap, confirmHtml, noteSheetHtml, convOut, convUi, shopHtml, convHtml } from '../src/views/extras.js';
import { renderHome } from '../src/views/home.js';
import { renderDays } from '../src/views/days.js';
import { renderInfo, infoUi } from '../src/views/info.js';
import { renderMoney, moneyUi } from '../src/views/money.js';

const S = (over = {}) => ({ ...structuredClone(DEFAULTS), ...over });

test('备注和改时间：改过的时间用在今天卡片上，原定时间留着，两人同步', () => {
  const st = S();
  st.notes['1222@09:00'] = { t: '09:40', text: '导览预约号 A123', u: 5 };
  const d = buildDays(st).find((x) => x.id === '1222');
  const it = d.items[0];
  assert.equal(it.t, '09:40'); assert.equal(it.t0, '09:00'); assert.equal(it.note, '导览预约号 A123'); assert.equal(it.key, '1222@09:00');
  assert.equal(nowAndNext(d, new Date(2026, 11, 22, 9, 10)).next.it.t, '09:40');
  const html = renderDays(st, { now: new Date(2026, 10, 17), weather: null });
  assert.match(html, /导览预约号 A123/); assert.match(html, /data-action="note" data-key="1222@09:00"/); assert.match(html, /<s class="tl__t0">09:00<\/s>/);
  assert.match(noteSheetHtml(st, '1222@09:00'), /value="09:40"/);
  // 删掉后恢复原样
  st.notes['1222@09:00'] = { del: true, u: 9 };
  assert.equal(buildDays(st).find((x) => x.id === '1222').items[0].t, '09:00');
  assert.ok(SYNC_KEYS.includes('notes') && SYNC_KEYS.includes('shop'));
  assert.equal(mergeDocs({ notes: { a: { text: '旧', u: 1 } } }, { notes: { a: { text: '新', u: 2 } } }).notes.a.text, '新');
});

test('待确认：每件都有截止日和确认办法，链接都认得', () => {
  assert.ok(CONFIRMS.length >= 12);
  assert.equal(new Set(CONFIRMS.map((c) => c.id)).size, CONFIRMS.length);
  for (const c of CONFIRMS) { assert.match(c.id, /^cf-/); assert.ok(c.by && c.text && c.how, c.id); for (const v of c.vendors || []) assert.ok(VENDORS[v], `${c.id} ${v}`); }
  const st = S(); st.todo['cf-sixt'] = { v: true, u: 1 };
  assert.match(confirmHtml(st), new RegExp(`还有 ${CONFIRMS.length - 1} 件没确认`));
  infoUi.tab = 'confirm'; assert.match(renderInfo(st), /Sixt Battery Park/); infoUi.tab = 'todo';
});

test('值机：起飞前 24 小时开放，提前 3 天开始显示，起飞后消失', () => {
  const back = CHECKINS.find((c) => c.id === 'ci-back');
  assert.equal(new Date(back.dep).toISOString(), '2026-12-31T11:00:00.000Z');            // 06:00 美东
  assert.equal(checkinStatus(back, new Date(Date.UTC(2026, 11, 20))).stage, 'far');
  assert.equal(checkinStatus(back, new Date(Date.UTC(2026, 11, 29, 12))).stage, 'soon');
  assert.equal(checkinStatus(back, new Date(Date.UTC(2026, 11, 30, 11, 1))).stage, 'open');
  assert.equal(checkinStatus(back, new Date(Date.UTC(2026, 11, 31, 11, 1))).stage, 'gone');
  assert.equal(new Date(CHECKINS[0].dep).toISOString(), '2026-12-17T05:45:00.000Z');     // 13:45 北京
  assert.equal(activeCheckins(new Date(Date.UTC(2026, 11, 16, 6))).length, 1);
  const ev = checkinEvents();
  assert.equal(ev.length, 2); assert.equal(ev[1].at.toISOString(), '2026-12-30T11:00:00.000Z');
  assert.match(renderHome(S(), { now: new Date(Date.UTC(2026, 11, 30, 15)), weather: null }), /值机 · UA2434/);
});

test('两地时钟：美东比北京晚 13 小时，洛杉矶晚 16 小时', () => {
  const t = new Date(Date.UTC(2026, 11, 22, 20, 5));   // 15:05 美东 = 次日 04:05 北京
  const c = clocks(t, 'dc');
  assert.equal(c.local, '15:05'); assert.equal(c.beijing, '04:05'); assert.equal(c.call.ok, false);
  const la = clocks(new Date(Date.UTC(2027, 0, 1, 1, 0)), 'la');   // 17:00 洛杉矶 = 09:00 北京
  assert.equal(la.local, '17:00'); assert.equal(la.beijing, '09:00'); assert.equal(la.call.ok, true);
});

test('离我最近：每个景点都有坐标，站在布莱恩公园最近的厕所就是它', () => {
  for (const p of POIS) { const ll = POI_LL[p.id]; assert.ok(ll && ll[0] > 33 && ll[0] < 43 && ll[1] < -71 && ll[1] > -119, `${p.id} 没坐标`); }
  for (const x of [...EATS, ...TOILETS]) assert.ok(x.q && x.ll && x.ll.length === 2, x.name);
  const here = [40.7536, -73.9832];
  assert.equal(nearest(here, 'wc', 1)[0].name, '布莱恩公园公厕');
  assert.equal(nearest(here, 'sight', 1)[0].id, 'bryant-park');
  assert.ok(nearest(here, 'all', 5).every((p, i, a) => !i || p.m >= a[i - 1].m));
  const d = distM([40.7580, -73.9855], [40.7527, -73.9772]);   // 时代广场 → 中央车站，约 900 米
  assert.ok(d > 700 && d < 1100, String(d));
  assert.equal(fmtDist(430), '约 450 米'); assert.equal(fmtDist(2340), '约 2.3 公里'); assert.equal(walkMin(750), 13);
  nearUi.here = here; nearUi.kind = 'all';
  const html = renderNear(S()); nearUi.here = null;
  assert.match(html, /布莱恩公园/); assert.match(html, /走路 \d+ 分钟/);
  assert.match(renderNear(S()), /定位我在哪/);
});

test('吃什么：五个城市都有，行程里提到的店排进了对应日期', () => {
  for (const c of ['bos', 'dc', 'phl', 'nyc', 'la']) assert.ok(EATS.filter((e) => e.city === c).length >= 3, c);
  for (const e of EATS) { assert.ok(['$', '$$', '$$$'].includes(e.price), e.name); assert.ok(e.book && e.what && e.zh, e.name); }
  const html = renderEats(S());
  assert.match(html, /Regina Pizzeria/); assert.match(html, /看营业时间/); assert.match(html, /12\/20 已排/);
});

test('换算和购物清单', () => {
  Object.assign(convUi, { f: '32', mi: '100', lb: '50' });
  assert.deepEqual(convOut(), { c: '0.0 °C', km: '160.9 公里', kg: '22.7 公斤' });
  Object.assign(convUi, { f: '', mi: 'abc', lb: '' });
  assert.deepEqual(convOut(), { c: '', km: '', kg: '' });
  assert.match(convHtml(), /鞋码/);
  const st = S();
  st.shop.a = { text: '尼克斯球衣', who: '自己', size: 'M', budget: 120, done: false, c: 1, u: 1 };
  st.shop.b = { text: '曲奇', done: true, c: 2, u: 2 }; st.shop.c = { del: true, u: 3 };
  const html = shopHtml(st);
  assert.match(html, /1\/2 已买/); assert.match(html, /预算 \$120/); assert.match(html, /给 自己 · 尺码 M/);
  moneyUi.tab = 'shop'; assert.match(renderMoney(st, { now: new Date(2026, 11, 20) }), /尼克斯球衣/);
  moneyUi.tab = 'conv'; assert.match(renderMoney(st, { now: new Date(2026, 11, 20) }), /华氏度/); moneyUi.tab = 'log';
});

test('旅行总结和行程片：出发前只有预告片，途中按已过的天数统计', () => {
  const st = S();
  assert.match(renderRecap(st, { now: new Date(2026, 10, 17) }), /media\/intro\.mp4/);
  assert.match(renderHome(st, { now: new Date(2026, 10, 17), weather: null }), /行程预告片/);
  st.expenses.x = { amount: 50, currency: 'USD', cat: 'food', payer: 'a', split: 'both', date: '12/19', u: 1 };
  st.visited['harvard-yard'] = { v: 'been', u: 1 };
  const days = buildDays(st);
  const r = recapStats(st, days, new Date(2026, 11, 22, 23), { s1: 215, s2: 450, s3: 140, s4: 100 });
  assert.equal(r.days, 5); assert.deepEqual(r.games, ['bos', 'was']); assert.equal(r.miles, 665); assert.equal(r.spent, 50); assert.equal(r.been.length, 1);
  assert.equal(r.km, days.slice(0, 5).reduce((s, d) => s + d.pace.km, 0));
  const html = renderRecap(st, { now: new Date(2026, 11, 22, 23) });
  assert.match(html, /第 5 天/); assert.match(html, /凯尔特人 vs 活塞/); assert.match(html, /哈佛园/);
  assert.match(renderHome(st, { now: new Date(2027, 0, 3), weather: null }), /看旅行总结/);
});

test('首页今天卡片：两地时钟、六个入口、待确认数', () => {
  const h = renderHome(S(), { now: new Date(2026, 11, 22, 10, 0), weather: null });
  assert.match(h, /class="clock"/); assert.match(h, /href="#near"/); assert.match(h, /href="#eats"/); assert.match(h, new RegExp(`待确认 ${CONFIRMS.length}`));
});

test('两地时钟：预览模式按当地钟点推北京时间', () => {
  const c = clocks(new Date(2026, 11, 22, 10, 0), 'dc', true);
  assert.equal(c.local, '10:00'); assert.equal(c.beijing, '23:00'); assert.equal(c.call.ok, false);
  assert.equal(clocks(new Date(2026, 11, 31, 17, 0), 'la', true).beijing, '09:00');
});

test('顶栏：北京和纽约时间、现在的天气；在洛杉矶那天多一个洛杉矶时间', async () => {
  const { nowbarHtml } = await import('../src/components/shell.js');
  const { parseNow } = await import('../src/lib/weather.js');
  const t = new Date(Date.UTC(2026, 11, 22, 20, 5));
  const h = nowbarHtml(t, 'dc', { temp: 3.4, code: 3, feels: -1.2 });
  assert.match(h, /北京 <b>04:05<\/b>/); assert.match(h, /纽约 <b>15:05<\/b>/); assert.match(h, /华盛顿 3°C 阴/); assert.match(h, /体感 -1°/);
  assert.doesNotMatch(h, /洛杉矶/);
  assert.match(nowbarHtml(t, 'la', null), /洛杉矶 <b>12:05<\/b>/); assert.match(nowbarHtml(t, 'nyc', null), /纽约 天气读取中/);
  assert.deepEqual(parseNow({ current: { temperature_2m: 5, weather_code: 71, apparent_temperature: 1 } }), { temp: 5, code: 71, feels: 1 });
  assert.equal(parseNow({}), null);
});

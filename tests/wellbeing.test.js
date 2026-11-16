import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDays } from '../src/data/days.js';
import { DEFAULTS } from '../src/state.js';
import { PACE, paceText, jetlagFor, JETLAG, PACK_IDS } from '../src/data/wellbeing.js';
import { renderInfo, infoUi } from '../src/views/info.js';
import { renderHome } from '../src/views/home.js';
import { renderDays } from '../src/views/days.js';
import { driveUrl } from '../src/lib/maps.js';
import { DRIVES } from '../src/data/drive.js';

const S = (over = {}) => ({ ...structuredClone(DEFAULTS), ...over });

test('每天都标了步行公里数、强度和“累了先砍哪一项”', () => {
  for (const rent of ['jfk', 'bos', 'none']) {
    const days = buildDays(S({ rent }));
    assert.equal(days.length, 14);
    for (const d of days) {
      assert.ok(d.pace, `${rent} ${d.id} 没有 pace`);
      assert.ok(PACE[d.pace.lv], `${d.id} lv`);
      assert.ok(d.pace.km > 0 && d.pace.km <= 12, `${d.id} km`);
      assert.ok(d.pace.cut && d.pace.cut.length > 8, `${d.id} cut`);
    }
    // 恢复日：看球当天下午都留了回住处休息的时间
    const lv = Object.fromEntries(days.map((d) => [d.id, d.pace.lv]));
    assert.equal(lv['1226'], 1); assert.equal(lv['1229'], 1); assert.equal(lv['1230'], 1);
  }
  assert.equal(paceText({ km: 10, lv: 3 }), '步行约 10 公里 · 紧凑');
});

test('行程顺序：有具体时间的条目按时间先后排（凌晨的算第二天）', () => {
  for (const rent of ['jfk', 'bos', 'none']) {
    for (const ewr of [false, true]) {
      const st = S({ rent }); st.opts.ewr = ewr;
      for (const d of buildDays(st)) {
        let prev = -1;
        for (const it of d.items) {
          const m = /^(\d{1,2}):(\d{2})/.exec(it.t);
          if (!m) continue;
          let v = +m[1] * 60 + +m[2];
          if (+m[1] < 5) v += 1440;
          assert.ok(v >= prev, `${rent} ${d.id} ${it.t} 排在了更晚的条目后面`);
          prev = v;
        }
      }
    }
  }
});

test('12/21 自驾中午停纽黑文，导航带途经点；彩纸试飞在 12/29', () => {
  const days = buildDays(S({ rent: 'jfk' }));
  const d21 = days.find((d) => d.id === '1221');
  assert.ok(d21.items.some((i) => /Frank Pepe/.test(i.text || '') && i.nav && /New Haven/.test(i.nav.q)));
  assert.match(driveUrl('A', 'B', 'google', DRIVES.s2.via), /waypoints=.*New%20Haven/);
  assert.doesNotMatch(driveUrl('A', 'B', 'google'), /waypoints/);
  assert.ok(days.find((d) => d.id === '1229').items.some((i) => /彩纸试飞/.test(i.text)));
  assert.ok(!days.find((d) => d.id === '1230').items.some((i) => /彩纸/.test(i.text || '')));
  // 不租车时 12/21 还是火车
  assert.ok(!buildDays(S({ rent: 'none' })).find((d) => d.id === '1221').items.some((i) => /Frank Pepe/.test(i.text || '')));
});

test('倒时差：出发前 4 天起有提示，头四天和回国那天各一条', () => {
  assert.equal(jetlagFor({ phase: 'before', days: 20 }), null);
  assert.equal(jetlagFor({ phase: 'before', days: 3 }), JETLAG.pre);
  assert.equal(jetlagFor({ phase: 'before', days: 1 }), JETLAG[1217]);
  assert.equal(jetlagFor({ phase: 'during' }, '1219'), JETLAG[1219]);
  assert.equal(jetlagFor({ phase: 'during' }, '1226'), null);
  assert.equal(jetlagFor({ phase: 'during' }, '1231'), JETLAG.back);
});

test('页面：行李清单和倒时差标签、今天卡片的节奏和倒时差、出发前卡片', () => {
  assert.equal(new Set(PACK_IDS).size, PACK_IDS.length);
  const st = S({ rent: 'jfk' });
  infoUi.tab = 'pack';
  const pack = renderInfo(st);
  assert.match(pack, /行李清单/); assert.match(pack, /data-id="pk-license"/);
  infoUi.tab = 'jetlag';
  assert.match(renderInfo(st), /北京凌晨 4 点/);
  infoUi.tab = 'todo';
  const h19 = renderHome(st, { now: new Date(2026, 11, 19, 9, 0), weather: null });
  assert.match(h19, /步行约 10 公里 · 紧凑/); assert.match(h19, /倒时差/); assert.match(h19, /想轻松点/);
  const pre = renderHome(st, { now: new Date(2026, 11, 14, 9, 0), weather: null });
  assert.match(pre, /还有 4 天出发/); assert.match(pre, /行李清单/); assert.match(pre, /出发前三天/);
  assert.doesNotMatch(renderHome(st, { now: new Date(2026, 10, 16), weather: null }), /天出发<\/h2>/);
  assert.match(renderDays(st, { now: new Date(2026, 10, 16), weather: null }), /day__cut/);
});

test('今天卡片的一句话摘要：取第一句，不留半个括号', async () => {
  const { firstSentence } = await import('../src/views/home.js');
  assert.equal(firstSentence('今天不退房（酒店订到 12/21）。出门坐橙线到 State。'), '今天不退房（酒店订到 12/21）');
  const long = firstSentence('时差会让你们五六点就醒，早点出门正好，酒店门口 Massachusetts Ave 上坐 1 路公交，不用换乘直达哈佛（约 35–40 分钟），或者坐橙线');
  assert.ok(long.endsWith('…') && long.length <= 57 && !/（[^）]*$/.test(long), long);
  assert.equal(firstSentence('午饭。'), '午饭。');
});

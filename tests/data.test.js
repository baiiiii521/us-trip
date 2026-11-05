// 数据完整性：行程里引用的景点、交通段、球赛、订票入口都必须存在
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDays } from '../src/data/days.js';
import { POIS, POI } from '../src/data/pois.js';
import { LEGS } from '../src/data/legs.js';
import { GAMES } from '../src/data/games.js';
import { VENDORS } from '../src/data/vendors.js';
import { CITIES, CATEGORIES } from '../src/data/trip.js';
import { CHECKLIST } from '../src/data/content.js';
import { DEFAULTS } from '../src/state.js';
import { parsePageImages, parseCredits } from '../src/lib/photos.js';
import { routeUrl, directionsUrl } from '../src/lib/maps.js';

const states = ['A', 'B', 'C'].flatMap((plan) => ['penn', 'lic'].map((hotel) => ({ ...JSON.parse(JSON.stringify(DEFAULTS)), plan, hotel })));

test('每个方案都是 14 天，12/18 到 12/31', () => {
  for (const s of states) {
    const days = buildDays(s);
    assert.equal(days.length, 14);
    assert.equal(days[0].md, '12/18');
    assert.equal(days[13].md, '12/31');
  }
});

test('行程引用全部有效', () => {
  for (const s of states) {
    for (const d of buildDays(s)) {
      assert.ok(CITIES[d.city], d.id + ' city');
      for (const it of d.items) {
        for (const p of it.pois || []) assert.ok(POI[p], `${d.id} 引用了不存在的景点 ${p}`);
        if (it.leg) assert.ok(LEGS[it.leg], `${d.id} leg ${it.leg}`);
        if (it.game) assert.ok(GAMES[it.game], `${d.id} game ${it.game}`);
        for (const v of it.buy || []) assert.ok(VENDORS[v], `${d.id} vendor ${v}`);
      }
    }
  }
});

test('每段城际交通在每个方案里恰好出现一次', () => {
  for (const s of states) {
    const legs = buildDays(s).flatMap((d) => d.items.filter((i) => i.leg).map((i) => i.leg));
    assert.deepEqual(legs.sort(), ['s1', 's2', 's3', 's4']);
  }
});

test('方案 A 不看凯尔特人，B/C 看', () => {
  const has = (plan) => buildDays({ ...DEFAULTS, plan }).some((d) => d.items.some((i) => i.game === 'bos'));
  assert.equal(has('A'), false);
  assert.equal(has('B'), true);
  assert.equal(has('C'), true);
});

test('国会图书馆不排在周一', () => {
  for (const s of states) {
    for (const d of buildDays(s)) {
      if (d.wd === '周一') assert.ok(!d.items.some((i) => (i.pois || []).includes('loc')), `方案 ${s.plan} 周一排了国会图书馆`);
    }
  }
});

test('大都会不排在周三或 12/25', () => {
  for (const s of states) {
    for (const d of buildDays(s)) {
      const hasMet = d.items.some((i) => (i.pois || []).includes('met'));
      if (hasMet) assert.ok(d.wd !== '周三' && d.md !== '12/25');
    }
  }
});

test('景点字段完整、id 唯一', () => {
  const ids = new Set();
  for (const p of POIS) {
    assert.ok(!ids.has(p.id), 'dup ' + p.id); ids.add(p.id);
    assert.ok(CITIES[p.city] && CATEGORIES[p.cat], p.id);
    for (const k of ['name', 'en', 'q', 'intro']) assert.ok(p[k], `${p.id}.${k}`);
    for (const v of p.buy || []) assert.ok(VENDORS[v], `${p.id} vendor ${v}`);
    if (p.game) assert.ok(GAMES[p.game]);
  }
  for (const g of Object.values(GAMES)) assert.ok(POI[g.arena], 'arena ' + g.arena);
  for (const t of CHECKLIST) for (const v of t.buy || []) assert.ok(VENDORS[v], `${t.id} vendor ${v}`);
});

test('维基图片解析：处理规范化和重定向', () => {
  const json = { query: {
    normalized: [{ from: 'TD_Garden', to: 'TD Garden' }],
    redirects: [{ from: 'Boston Public Garden', to: 'Public Garden (Boston)' }],
    pages: [
      { title: 'TD Garden', pageimage: 'TD_Garden.jpg', thumbnail: { source: 'https://upload.wikimedia.org/a.jpg', width: 960, height: 640 } },
      { title: 'Public Garden (Boston)', pageimage: 'PG.jpg', thumbnail: { source: 'https://upload.wikimedia.org/b.jpg', width: 960, height: 720 } },
      { title: 'No Image' }
    ] } };
  const out = parsePageImages(json, ['TD_Garden', 'Boston_Public_Garden', 'No_Image']);
  assert.equal(out.TD_Garden.src, 'https://upload.wikimedia.org/a.jpg');
  assert.equal(out.Boston_Public_Garden.file, 'PG.jpg');
  assert.equal(out.No_Image, undefined);
  const credits = parseCredits({ query: { pages: [{ title: 'File:PG.jpg', imageinfo: [{ descriptionurl: 'https://commons.wikimedia.org/wiki/File:PG.jpg', extmetadata: { Artist: { value: '<a href="x">Jane Doe</a>' }, LicenseShortName: { value: 'CC BY-SA 4.0' } } }] }] } });
  assert.equal(credits['PG.jpg'].artist, 'Jane Doe');
  assert.equal(credits['PG.jpg'].license, 'CC BY-SA 4.0');
});

test('导航链接', () => {
  assert.match(directionsUrl('Barclays Center', 'google'), /travelmode=transit/);
  assert.match(directionsUrl('Barclays Center', 'apple'), /dirflg=r/);
  const r = routeUrl(['A', 'B', 'C']);
  assert.match(r, /origin=A&destination=C/);
  assert.match(r, /waypoints=B/);
});

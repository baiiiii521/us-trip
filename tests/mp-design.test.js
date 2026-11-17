// 小程序「地铁线路图」设计（2026-11-17）的守门：
// 城市图白天实拍、晚上 AI 夜景，都放在自己的服务器；五条线色各页一致；图都真的存在。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { cityImage, MEDIA, COVER, ARENA } from '../miniprogram/lib/media.js';

const MP = 'miniprogram';
const LINE = { bos: '#2FB36B', dc: '#E63A3A', phl: '#2F6BFF', nyc: '#FFC233', la: '#19B5C9' };

test('城市图：7 点到 16 点用实拍，其余时间用 AI 夜景，并且标明来源', () => {
  for (const city of Object.keys(LINE)) {
    const day = cityImage(city, 11);
    const night = cityImage(city, 19);
    assert.match(day.src, new RegExp(`${city}-day\\.jpg$`));
    assert.match(night.src, new RegExp(`${city}-night\\.jpg$`));
    assert.match(day.credit, /^实拍 · .+/, `${city} 实拍要写作者和许可`);
    assert.equal(night.credit, 'AI 示意图');
    assert.equal(cityImage(city, 6).night, true, '早上 6 点还算晚上');
    assert.equal(cityImage(city, 16).night, true, '16 点日落后算晚上');
  }
  assert.match(cityImage('xx', 12).src, /nyc-day/, '不认识的城市退回纽约');
});

test('城市图放在自己的服务器上，发版目录里每张都在，而且不大', () => {
  assert.equal(MEDIA, 'https://trip.byb521.com/media/mp/');
  const names = [];
  for (const city of Object.keys(LINE)) names.push(`${city}-day.jpg`, `${city}-night.jpg`);
  names.push(COVER.src.split('/').pop(), ARENA.src.split('/').pop());
  for (const n of names) {
    const p = join('public/media/mp', n);
    assert.ok(existsSync(p), `缺 ${p}（跑 node scripts/mp-media.mjs）`);
    assert.ok(statSync(p).size < 400 * 1024, `${n} 太大，弱网出不来`);
  }
  const credits = JSON.parse(readFileSync('public/media/mp/credits.json', 'utf8'));
  for (const n of names) assert.ok(credits[n.replace(/\.jpg$/, '')], `credits.json 没写 ${n} 的来源`);
});

test('小程序里的网络图只来自自己的服务器或维基（不引第三方图床）', () => {
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
  const files = walk(MP).filter((p) => /\.(js|wxml)$/.test(p) && !p.includes('/shared/'));
  for (const f of files) {
    for (const m of readFileSync(f, 'utf8').matchAll(/https?:\/\/([a-z0-9.-]+)\/[^\s'"`)]*\.(?:jpg|jpeg|png|webp)/gi)) {
      assert.ok(/(^|\.)byb521\.com$|wikimedia\.org$|wikipedia\.org$/.test(m[1]), `${f} 引了外部图片 ${m[0]}`);
    }
  }
});

test('五条线色：顶栏、今天、行程、景点、吃什么、首页用的是同一套', () => {
  const files = ['components/topbar/topbar.js', 'pages/today/today.js', 'pages/days/days.js', 'pages/guide/guide.js', 'pages/eats/eats.js', 'pages/trips/trips.js'];
  for (const f of files) {
    const src = readFileSync(join(MP, f), 'utf8');
    for (const [city, color] of Object.entries(LINE)) {
      assert.ok(src.includes(color), `${f} 里 ${city} 的线色不是 ${color}`);
    }
  }
  const css = readFileSync(join(MP, 'app.wxss'), 'utf8');
  for (const [city, color] of Object.entries(LINE)) assert.ok(css.includes(`--l-${city}: ${color}`), `app.wxss 缺 --l-${city}`);
});

test('旧的篮球橙不再出现在小程序界面里（只剩品牌头像）', () => {
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
  const files = walk(MP).filter((p) => /\.(wxss|wxml)$/.test(p));
  for (const f of files) assert.ok(!/#C04A0A/i.test(readFileSync(f, 'utf8')), `${f} 还有旧的橙色 #C04A0A`);
});

test('今天页：出发前第一站是「下一站」，行程中现在 / 下一站各只有一个', async () => {
  globalThis.wx = new Proxy({}, { get: () => () => '' });
  globalThis.getApp = () => ({ globalData: {} });
  let cfg;
  globalThis.Page = (o) => { cfg = o; };
  await import(`../miniprogram/pages/today/today.js?t=${Date.now()}`);
  const inst = { ...cfg, data: { ...cfg.data }, setData(o) { Object.assign(this.data, o); } };
  inst.onLoad({});
  inst.onShow();
  const d = inst.data;
  assert.equal(d.stations.length, 5, '顶部五座城');
  assert.ok(d.img && d.img.src.startsWith('https://trip.byb521.com/'), '今天页有城市图');
  if (d.phase === 'before') {
    assert.equal(d.preview[0].state, 'next');
    assert.equal(d.preview.filter((x) => x.state === 'next').length, 1);
  } else if (d.phase === 'on') {
    assert.ok(d.items.filter((x) => x.state === 'now').length <= 1);
    assert.ok(d.items.filter((x) => x.state === 'next').length <= 1);
  }
});

// 小程序「地铁线路图」设计（2026-11-17）的守门：
// 城市图白天实拍、晚上 AI 夜景，都放在自己的服务器；五条线色各页一致；图都真的存在。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { cityImage, MEDIA, COVER, ARENA } from '../miniprogram/lib/media.js';

const MP = 'miniprogram';
const LINE = { bos: '#2FB36B', dc: '#E63A3A', phl: '#2F6BFF', nyc: '#FFC233', la: '#19B5C9' };

test('城市图：7 点到 16 点用实拍（标作者和许可），其余时间用 AI 夜景（2026-11-17 起图上不标字）', () => {
  for (const city of Object.keys(LINE)) {
    const day = cityImage(city, 11);
    const night = cityImage(city, 19);
    assert.match(day.src, new RegExp(`${city}-day\\.jpg$`));
    assert.match(night.src, new RegExp(`${city}-night\\.jpg$`));
    assert.match(day.credit, /^实拍 · .+/, `${city} 实拍要写作者和许可`);
    assert.equal(night.credit, '', '夜景图上不再标「AI 示意图」');
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

test('节日彩蛋：按美东日期，12/24 平安夜、12/25 圣诞节，其余日子不打扰', async () => {
  const { festiveKey, festiveOf, SNOW, BULBS } = await import('../miniprogram/lib/festive.js');
  assert.equal(festiveKey(new Date(Date.UTC(2026, 11, 24, 15))), 'eve');
  assert.equal(festiveKey(new Date(Date.UTC(2026, 11, 25, 4, 59))), 'eve', '美东 12/24 23:59 还是平安夜');
  assert.equal(festiveKey(new Date(Date.UTC(2026, 11, 25, 5, 1))), 'xmas');
  assert.equal(festiveKey(new Date(Date.UTC(2026, 11, 26, 5, 1))), '');
  assert.equal(festiveKey(new Date(Date.UTC(2026, 10, 24, 15))), '', '11 月不算');
  assert.equal(festiveOf(new Date(Date.UTC(2026, 11, 20))).style, '', '平时不换配色');
  for (const d of [Date.UTC(2026, 11, 24, 18), Date.UTC(2026, 11, 25, 18)]) {
    const f = festiveOf(new Date(d));
    for (const v of ['--night', '--night-2', '--night-3', '--go']) assert.match(f.style, new RegExp(`${v}:#[0-9A-F]{6}`), `${f.key} 缺 ${v}`);
    assert.ok(f.title && f.line, '贺卡有标题和一句话');
    assert.ok(existsSync(join('public/media/mp', f.image.split('/').pop())), `缺节日图 ${f.image}`);
  }
  assert.ok(SNOW.length >= 10 && SNOW.every((x) => x.left >= 0 && x.left < 100), '雪花位置固定在屏幕内');
  assert.ok(BULBS.length >= 8);
});

test('节日换装接到了每一页：第一行是 page-meta，顶栏和首页都挂了节日组件', () => {
  const app = JSON.parse(readFileSync(join(MP, 'app.json'), 'utf8'));
  for (const page of app.pages) {
    const src = readFileSync(join(MP, `${page}.wxml`), 'utf8');
    assert.ok(src.trimStart().startsWith('<page-meta page-style="{{festive.style}}"'), `${page} 第一行不是 page-meta，节日配色盖不上`);
  }
  assert.match(readFileSync(join(MP, 'app.js'), 'utf8'), /festiveOf/, 'app.js 要给每个页面塞 festive');
  assert.match(readFileSync(join(MP, 'components/topbar/topbar.wxml'), 'utf8'), /<festive-layer/);
  assert.match(readFileSync(join(MP, 'pages/trips/trips.wxml'), 'utf8'), /<festive-layer card/);
  // 顶栏、底栏、首页的深色和琥珀都走变量，节日才换得动
  for (const f of ['components/topbar/topbar.wxss', 'components/nav/nav.wxss', 'pages/trips/trips.wxss']) {
    assert.ok(!/background:\s*#0E1A3A/i.test(readFileSync(join(MP, f), 'utf8')), `${f} 写死了午夜蓝底色`);
  }
});

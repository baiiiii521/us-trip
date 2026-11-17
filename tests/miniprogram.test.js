// 小程序的守门测试：代码包干净、结构完整、共用代码同步、页面逻辑能算出东西。
// 跑法：npm test（和其他测试一起跑），不需要微信开发者工具。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { scanLeaks, packageSize, walk } from '../scripts/mp-scan.mjs';
import { buildTodayView } from '../miniprogram/lib/today-view.js';
import { DEFAULTS } from '../src/state.js';
import { POIS } from '../src/data/pois.js';

const MP = 'miniprogram';
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const APP = readJson(join(MP, 'app.json'));

test('小程序代码包里没有护照号、PNR、票号、公寓房号（和网站同一份规则）', () => {
  const hits = scanLeaks(MP);
  assert.deepEqual(hits, [], `发现个人信息：${hits.map((h) => h.file).join(', ')}`);
});

test('上传密钥、证件、订单文件都没混进小程序目录', () => {
  const bad = walk(MP).map((f) => f.path).filter((f) => /\.key$|itinerary\.json|vault\.enc|\.p12$|\.pem$/i.test(f));
  assert.deepEqual(bad, [], `不该出现在代码包里的文件：${bad.join(', ')}`);
});

test('app.json 里登记的页面，四个文件都齐（js/json/wxml/wxss）', () => {
  assert.ok(APP.pages.length >= 6, '主页面应该都登记上了');
  for (const page of APP.pages) {
    for (const ext of ['js', 'json', 'wxml', 'wxss']) {
      const p = join(MP, `${page}.${ext}`);
      assert.ok(existsSync(p), `缺文件：${p}`);
    }
  }
  assert.equal(APP.pages[0], 'pages/trips/trips', '首页必须是旅行列表');
});

test('project.config.json 的 appid、类型、根目录对得上', () => {
  const cfg = readJson(join(MP, 'project.config.json'));
  assert.equal(cfg.appid, 'wx678ed2bc735ec846');
  assert.equal(cfg.compileType, 'miniprogram');
  assert.equal(cfg.miniprogramRoot, './');
  assert.equal(cfg.setting.urlCheck, false, '开发期不校验域名，正式版再开');
});

test('主包在 2MB 以内，且不含图片/视频（媒体一律走网络）', () => {
  const size = packageSize(MP);
  assert.ok(size < 2 * 1024 * 1024, `主包 ${(size / 1024).toFixed(0)} KB 超过 2MB`);
  const media = walk(MP).filter((f) => /\.(mp4|mov|ttf|otf|woff2?|zip)$/i.test(f.path));
  assert.deepEqual(media.map((m) => m.path), [], '这些大文件不该打进代码包');
});

test('共用代码是最新的：shared/ 和 src/ 一致', () => {
  // 用 --check 跑一次同步脚本；不一致会以退出码 1 结束
  assert.doesNotThrow(() => {
    execFileSync(process.execPath, ['scripts/mp-sync-shared.mjs', '--check'], { stdio: 'pipe' });
  }, '跑 node scripts/mp-sync-shared.mjs 重新生成 shared/');
});

test('旅行列表：现在就一趟，字段齐全，日期和网站一致', async () => {
  const { TRIPS, tripDays, tripPhase } = await import('../miniprogram/data/trips.js');
  assert.equal(TRIPS.length, 1, '这次只做一趟，多出来的先不写');
  const t = TRIPS[0];
  assert.equal(t.id, 'us-east-2026');
  assert.equal(t.title, '美东圣诞篮球行');
  assert.equal(t.start, '2026-12-18');
  assert.equal(t.end, '2026-12-31');
  assert.equal(t.people, 2);
  assert.equal(tripDays(t), 14);
  assert.deepEqual(t.trail, ['波士顿', '华盛顿', '费城', '纽约', '洛杉矶']);
  // 状态随时钟走：出发前应该在不久的将来，行程前后都能算出来
  const phase = tripPhase(t, new Date('2026-11-17T00:00:00+08:00'));
  assert.equal(phase.key, 'soon');
  assert.match(phase.label, /还有 \d+ 天/);
  assert.equal(tripPhase(t, new Date('2026-12-20T10:00:00+08:00')).key, 'now');
  assert.equal(tripPhase(t, new Date('2027-01-05T10:00:00+08:00')).key, 'done');
});

test('所有页面都不联网、不跳外链（这一版没有后端依赖）', () => {
  for (const page of APP.pages) {
    const txt = readFileSync(join(MP, `${page}.js`), 'utf8');
    assert.ok(!/wx\.request|wx\.navigateToMiniProgram|<web-view/.test(txt), `${page}.js 里不该有网络请求或外链`);
  }
});

test('今天卡片：出发前给倒计时和第一天预览，行程中给第几天和下一项', () => {
  const before = buildTodayView(new Date('2026-11-17T09:00:00+08:00'), DEFAULTS);
  assert.equal(before.phase, 'before');
  assert.match(before.headline, /^距出发 \d+ 天$/);
  assert.ok(before.preview.length >= 3, '出发前要能看到第一天的安排');
  assert.ok(before.clock.beijing && before.clock.local, '两地时钟都要有值');

  // 手机本地时间就是判断依据（旅途中手机自动切到美东时间）；这里用 +07 造一个当地的 12/20 晚上
  const during = buildTodayView(new Date('2026-12-20T18:40:00+07:00'), DEFAULTS);
  assert.equal(during.phase, 'on');
  assert.match(during.headline, /^第 3 天/, `12/20 应该是第 3 天：${during.headline}`);
  assert.ok(during.navTarget, '今天卡片要给得出导航目标');
  assert.ok(during.items.length >= 3);
  assert.ok(during.pace, '每天都有节奏标签');
});

test('所有跳转目标都是 app.json 里登记过的页面（防止删了页面忘了改链接）', () => {
  const files = [
    ...APP.pages.map((p) => `${MP}/${p}.js`),
    ...walk(join(MP, 'components')).map((f) => f.path).filter((f) => f.endsWith('.js'))
  ];
  const bad = [];
  for (const f of files) {
    const txt = readFileSync(f, 'utf8');
    // 抓 wx.navigateTo({ url: '/pages/x/x?...' }) 里的路径，模板字符串也算
    for (const m of txt.matchAll(/url:\s*`?['"]?(\/pages\/[A-Za-z0-9_\-/]+)/g)) {
      const target = m[1].replace(/^\//, '');
      if (!APP.pages.includes(target)) bad.push(`${f} → ${target}`);
    }
  }
  assert.deepEqual(bad, [], `这些跳转指向不存在的页面：\n${bad.join('\n')}`);
});

test('景点图鉴：68 个都在，且都有名字和地址', () => {
  assert.equal(POIS.length, 68);
  for (const p of POIS) assert.ok(p.name && p.q, `${p.id} 缺名字或地址`);
});

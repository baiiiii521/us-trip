// 每个页面都要能「装载并跑一遍 onLoad/onShow」：抓的是拼错字段、拿错数据结构、
// 引用不存在的模块这类错误——它们在真机上只表现为「点了没反应」。
// 不需要微信开发者工具：把 Page / wx / Component 换成桩就行。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const MP = 'miniprogram';
const APP = JSON.parse(readFileSync(join(MP, 'app.json'), 'utf8'));
const calls = [];

const noop = () => undefined;

function stubWx() {
  const handler = {
    get(target, key) {
      if (key in target) return target[key];
      return (...args) => {
        calls.push([String(key), args]);
        // 几个有返回值的接口给个合理的空值
        if (key === 'getStorageSync') return '';
        if (key === 'getSystemInfoSync') return { platform: 'devtools', safeArea: {} };
        if (key === 'getFileSystemManager') return { saveFileSync: (p) => p };
        if (key === 'createSelectorQuery') return () => ({ select: () => ({ boundingClientRect: () => ({ exec: noop }) }) });
        return undefined;
      };
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    }
  };
  globalThis.wx = new Proxy({}, handler);
}

async function load(pagePath) {
  let cfg = null;
  globalThis.Page = (o) => { cfg = o; };
  globalThis.Component = (o) => { cfg = o; };
  globalThis.App = (o) => { cfg = o; };
  globalThis.getApp = () => ({ globalData: { version: 'test', trips: [] } });
  globalThis.getCurrentPages = () => [];
  stubWx();
  // 同一个页面会被导入两次（第一个测试跑一遍，第二个测试再跑一遍），加个时间戳绕开模块缓存
  const href = `${pathToFileURL(join(process.cwd(), MP, `${pagePath}.js`)).href}?t=${Date.now()}${Math.random()}`;
  await import(href);
  assert.ok(cfg, `${pagePath} 没有调用 Page()/Component()`);
  return cfg;
}

function run(cfg, data) {
  const inst = {
    ...cfg,
    data: { ...(cfg.data || {}) },
    setData(obj) {
      for (const [k, v] of Object.entries(obj || {})) this.data[k] = v;
    }
  };
  if (cfg.methods) Object.assign(inst, cfg.methods);
  if (inst.onLoad) inst.onLoad({});
  if (inst.onShow) inst.onShow();
  return inst;
}

test('每个页面都能装载，并跑一遍 onLoad / onShow 不报错', async () => {
  for (const page of APP.pages) {
    const cfg = await load(page);
    let inst;
    assert.doesNotThrow(() => { inst = run(cfg); }, `${page} 跑 onLoad/onShow 报错`);
    assert.ok(inst.data, `${page} 没有 data`);
  }
});

test('关键页面的数据真的算出来了（不是空页）', async () => {
  const days = run(await load('pages/days/days'));
  assert.equal(days.data.days.length, 14, '行程应该 14 天');
  assert.ok(days.data.days.every((d) => d.md && d.items.length), '每天都要有日期和条目');

  const guide = run(await load('pages/guide/guide'));
  assert.equal(guide.data.list.length, 68, '景点应该是 68 个');
  assert.ok(guide.data.list.filter((p) => p.photo).length >= 60, '绝大多数景点要带图片');

  const eats = run(await load('pages/eats/eats'));
  assert.ok(eats.data.groups.length >= 4, '吃什么要按城市分组');

  const tickets = run(await load('pages/tickets/tickets'));
  assert.equal(tickets.data.games.length, 6, '六场球');
  assert.ok(tickets.data.games.every((g) => g.links.length >= 3), '每场都要有购票入口');

  const drive = run(await load('pages/drive/drive'));
  assert.equal(drive.data.drives.length, 4, '四段自驾');
  assert.ok(drive.data.guide.length >= 3, '自驾须知分组');

  const wallet = run(await load('pages/wallet/wallet'));
  assert.ok(wallet.data.groups.length >= 4, '订单夹分组');
  assert.ok(wallet.data.groups.reduce((n, g) => n + g.items.length, 0) >= 15, '订单格子数量');

  const cards = run(await load('pages/cards/cards'));
  assert.ok(cards.data.count > 0, '大字卡至少有地址卡');

  const money = run(await load('pages/money/money'));
  assert.ok(money.data.rows.length >= 10, '预算明细');

  const ledger = run(await load('pages/ledger/ledger'));
  assert.ok(ledger.data.cats.length >= 5, '记账分类');

  const today = run(await load('pages/today/today'));
  assert.ok(today.data.v && today.data.v.headline, '今天卡片有标题');
});

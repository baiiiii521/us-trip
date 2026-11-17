// 守住一类「直接白屏/错位」的错误：页面里写的自定义标签，必须在这页 json 的
// usingComponents 里登记过，而且名字要一模一样。
// 踩过的坑：组件登记成 "topbar"，页面里却写 <top-bar>，微信把它当未知元素丢掉，
// 顶部栏根本没渲染，内容直接压到状态栏上，改多少样式都看不出来。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MP = 'miniprogram';
const APP = JSON.parse(readFileSync(join(MP, 'app.json'), 'utf8'));

// 微信内置组件（带连字符的那些）
const BUILTIN = new Set([
  'scroll-view', 'swiper-item', 'movable-area', 'movable-view', 'cover-view', 'cover-image',
  'rich-text', 'web-view', 'open-data', 'live-player', 'live-pusher', 'functional-page-navigator',
  'page-meta', 'navigation-bar', 'keyboard-accessory', 'match-media', 'page-container',
  'share-element', 'official-account', 'picker-view', 'picker-view-column', 'checkbox-group',
  'radio-group', 'movable-area', 'inline-payment-panel', 'store-home', 'store-product',
  'grid-view', 'list-view', 'sticky-header', 'sticky-section', 'nested-scroll-header',
  'nested-scroll-body', 'root-portal', 'ad-custom', 'channel-live', 'channel-video',
  'voip-room', 'hover-view', 'grid-builder', 'list-builder', 'draggable-sheet', 'open-container'
]);

const walk = (dir) => {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.wxml')) out.push(p);
  }
  return out;
};

const jsonOf = (wxml) => {
  const base = wxml.replace(/\.wxml$/, '');
  return existsSync(`${base}.json`) ? JSON.parse(readFileSync(`${base}.json`, 'utf8')) : {};
};

const tagsIn = (src) => {
  const found = new Set();
  const re = /<([a-z][a-z0-9]*(?:-[a-z0-9]+)+)[\s/>]/g;
  let m;
  while ((m = re.exec(src))) {
    const tag = m[1];
    if (BUILTIN.has(tag)) continue;
    if (tag.startsWith('wx-')) continue;
    found.add(tag);
  }
  return found;
};

const files = [
  ...APP.pages.map((p) => join(MP, `${p}.wxml`)),
  ...walk(join(MP, 'components'))
];

test('页面里用到的每个自定义标签都在 usingComponents 里登记过', () => {
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const declared = Object.keys(jsonOf(file).usingComponents || {});
    for (const tag of tagsIn(src)) {
      assert.ok(
        declared.includes(tag),
        `${file} 用了 <${tag}>，但这页的 usingComponents 里没有这个键（登记的是：${declared.join(', ') || '空'}）`
      );
    }
  }
});

test('每个登记过的组件都存在，并且有 js / json / wxml 三件套', () => {
  for (const file of files) {
    const uc = jsonOf(file).usingComponents || {};
    for (const [name, p] of Object.entries(uc)) {
      const abs = p.startsWith('/') ? join(MP, p) : join(file, '..', p);
      for (const ext of ['.js', '.json', '.wxml']) {
        assert.ok(existsSync(`${abs}${ext}`), `${file} 声明的组件 ${name} 缺少 ${abs}${ext}`);
      }
    }
  }
});

test('带底部导航的五个页，顶栏必须有返回按钮（否则进了行程回不到首页）', () => {
  for (const page of APP.pages) {
    const src = readFileSync(join(MP, `${page}.wxml`), 'utf8');
    if (!src.includes('<bottom-nav')) continue;
    const m = src.match(/<top-bar[^>]*>/);
    assert.ok(m, `${page} 用了底部导航却没有顶栏`);
    assert.ok(/show-back/.test(m[0]), `${page} 的顶栏没有 show-back，用户回不到旅行列表`);
  }
});

test('开了自定义导航栏的页面，wxml 里必须真的有顶部栏', () => {
  for (const page of APP.pages) {
    const cfg = JSON.parse(readFileSync(join(MP, `${page}.json`), 'utf8'));
    if (cfg.navigationStyle !== 'custom') continue;
    const src = readFileSync(join(MP, `${page}.wxml`), 'utf8');
    // 要么用统一顶栏，要么整页自己画（首页是整幅封面，白色状态栏文字压在图上）
    assert.ok(
      src.includes('<top-bar') || src.includes('class="hero"'),
      `${page} 用了自定义导航栏却既没有 <top-bar> 也没有自己的封面`
    );
  }
});

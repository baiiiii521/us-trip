// 小程序页面预览：不用微信开发者工具，在电脑上把每个页面按真实数据渲染成网页并截图。
// 做法：页面 JS 用桩跑一遍 onLoad/onShow 拿到 data → 用一个小模板引擎把 WXML 渲染成 HTML →
// WXSS 换算 rpx（750rpx = 375px）→ 本机 Chrome 无头截图（iPhone 13 尺寸，2 倍图）。
// 这是近似预览：字体用电脑上的苹方，原生组件（地图、picker）只画占位。最终以真机为准。
//
//   node scripts/mp-preview.mjs                    所有页面，按今天的真实时间
//   node scripts/mp-preview.mjs today days         只渲染这几页
//   NOW=2026-12-22T10:00 node scripts/mp-preview.mjs today    假装是旅途中的某个时刻
//   FULL=1 ...                                     整页长图（默认只截第一屏）
// 产物：mp-preview/<页面>.html 和 mp-preview/shots/<页面>.png（不进仓库）
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const MP = join(ROOT, 'miniprogram');
const OUT = join(ROOT, 'mp-preview');
const SHOTS = join(OUT, 'shots');
mkdirSync(SHOTS, { recursive: true });
const APP = JSON.parse(readFileSync(join(MP, 'app.json'), 'utf8'));
const W = 390, H = 844; // iPhone 13/14

// ---------- 假装现在是某个时间 ----------
if (process.env.NOW) {
  const fixed = new Date(process.env.NOW).getTime();
  const Real = Date;
  globalThis.Date = class extends Real {
    constructor(...a) { if (a.length) super(...a); else super(fixed); }
    static now() { return fixed; }
  };
}

// ---------- 微信接口的桩 ----------
const store = {};
function stubWx() {
  const api = {
    getStorageSync: (k) => (k in store ? store[k] : ''),
    setStorageSync: (k, v) => { store[k] = v; },
    getWindowInfo: () => ({ statusBarHeight: 47, platform: 'ios', windowWidth: W, windowHeight: H, safeArea: { bottom: H - 34 } }),
    getSystemInfoSync: () => ({ statusBarHeight: 47, platform: 'ios', windowWidth: W, windowHeight: H, safeArea: { bottom: H - 34 } }),
    getDeviceInfo: () => ({ platform: 'ios' }),
    getMenuButtonBoundingClientRect: () => ({ top: 51, height: 32, width: 87, right: W - 7, left: W - 94, bottom: 83 }),
    getFileSystemManager: () => ({ saveFileSync: (p) => p }),
    createSelectorQuery: () => ({ select: () => ({ boundingClientRect: () => ({ exec: () => {} }) }), selectAll: () => ({ boundingClientRect: () => ({ exec: () => {} }) }) }),
    createMapContext: () => ({ includePoints: () => {}, moveToLocation: () => {} })
  };
  globalThis.wx = new Proxy(api, { get: (t, k) => (k in t ? t[k] : () => undefined) });
}

async function loadPage(path, query = {}) {
  let cfg = null;
  globalThis.Page = (o) => { cfg = o; };
  globalThis.Component = (o) => { cfg = o; };
  globalThis.getApp = () => ({ globalData: { version: '0.9.0', trips: [], brand: '行前行后', metrics: { sb: 47, navH: 44, platform: 'ios' } } });
  globalThis.getCurrentPages = () => [{}, {}];
  stubWx();
  await import(`${pathToFileURL(join(MP, `${path}.js`)).href}?t=${Math.random()}`);
  const inst = { ...cfg, data: JSON.parse(JSON.stringify(cfg.data || {})), setData(o) { Object.assign(this.data, o); } };
  if (cfg.methods) Object.assign(inst, cfg.methods);
  if (cfg.properties) for (const [k, v] of Object.entries(cfg.properties)) inst.data[k] = query[k] !== undefined ? query[k] : v.value;
  try {
    if (inst.onLoad) inst.onLoad(query);
    if (inst.onShow) inst.onShow();
    if (inst.onReady) inst.onReady();
    if (cfg.lifetimes && cfg.lifetimes.attached) cfg.lifetimes.attached.call(inst);
  } catch (e) { console.warn(`  ${path} 跑生命周期出错：${e.message}`); }
  return inst;
}

// ---------- WXML 解析 ----------
const VOID = new Set(['image', 'input', 'img', 'br', 'icon', 'progress', 'switch', 'slider', 'checkbox', 'radio']);
function parse(src) {
  src = src.replace(/<!--[\s\S]*?-->/g, '');
  const root = { tag: '#root', attrs: {}, kids: [] };
  const stack = [root];
  const re = /<\/?([a-zA-Z][\w-]*)((?:\s+[\w:.@-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(src))) {
    const top = stack[stack.length - 1];
    if (m[4] !== undefined) { if (m[4].trim()) top.kids.push({ text: m[4] }); else if (/\S|\n/.test(m[4]) === false) top.kids.push({ text: m[4] }); continue; }
    const tag = m[1];
    if (m[0].startsWith('</')) { while (stack.length > 1 && stack.pop().tag !== tag) { /* 容错 */ } continue; }
    const attrs = {};
    const ar = /([\w:.@-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'))?/g;
    let a;
    while ((a = ar.exec(m[2]))) attrs[a[1]] = a[3] !== undefined ? a[3] : a[4] !== undefined ? a[4] : 'true';
    const node = { tag, attrs, kids: [] };
    top.kids.push(node);
    if (!m[3] && !VOID.has(tag)) stack.push(node);
  }
  return root;
}

// ---------- 表达式 ----------
const fnCache = new Map();
function evalExpr(expr, scope) {
  let f = fnCache.get(expr);
  if (!f) { try { f = new Function('s', `with (s) { return (${expr}); }`); } catch (e) { f = () => ''; } fnCache.set(expr, f); }
  try { return f(new Proxy(scope, { has: () => true, get: (t, k) => (k === Symbol.unscopables ? undefined : k in t ? t[k] : globalThis[k]) })); } catch (e) { return undefined; }
}
function interp(str, scope) {
  if (str == null) return '';
  const only = /^\s*\{\{((?:(?!\}\})[\s\S])+)\}\}\s*$/.exec(str); // 只有一段 {{}} 时才按原值返回
  if (only) return evalExpr(only[1], scope);
  return str.replace(/\{\{([\s\S]+?)\}\}/g, (_, e) => { const v = evalExpr(e, scope); return v == null ? '' : String(v); });
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- 渲染 ----------
const COMPONENTS = {};
function compOf(pageJsonPath) {
  const j = existsSync(pageJsonPath) ? JSON.parse(readFileSync(pageJsonPath, 'utf8')) : {};
  return j.usingComponents || {};
}

async function renderNodes(nodes, scope, ctx) {
  let out = '';
  let lastIf = null; // 上一个 wx:if 是否成立
  for (const n of nodes) {
    if (n.text !== undefined) { out += esc(interp(n.text, scope)).replace(/\n\s*/g, ' '); continue; }
    const a = n.attrs;
    // 微信里 wx:for 比 wx:if 先算：同一个元素上两个都有时，按每一项各自判断
    if ('wx:for' in a && 'wx:if' in a) {
      const list = interp(a['wx:for'], scope) || [];
      const itemName = a['wx:for-item'] || 'item', idxName = a['wx:for-index'] || 'index';
      const arr = Array.isArray(list) ? list : Object.values(list);
      const rest = { ...n, attrs: { ...a } };
      delete rest.attrs['wx:for']; delete rest.attrs['wx:if'];
      for (let i = 0; i < arr.length; i++) {
        const sc = { ...scope, [itemName]: arr[i], [idxName]: i };
        if (interp(a['wx:if'], sc)) out += await renderEl(rest, sc, ctx);
      }
      lastIf = null;
      continue;
    }
    if ('wx:if' in a) { lastIf = !!interp(a['wx:if'], scope); if (!lastIf) continue; }
    else if ('wx:elif' in a) { if (lastIf) continue; lastIf = !!interp(a['wx:elif'], scope); if (!lastIf) continue; }
    else if ('wx:else' in a) { if (lastIf) { lastIf = null; continue; } lastIf = null; }
    else lastIf = null;
    if ('wx:for' in a) {
      const list = interp(a['wx:for'], scope) || [];
      const itemName = a['wx:for-item'] || 'item', idxName = a['wx:for-index'] || 'index';
      const arr = Array.isArray(list) ? list : typeof list === 'number' ? Array.from({ length: list }, (_, i) => i) : Object.values(list);
      for (let i = 0; i < arr.length; i++) out += await renderEl(n, { ...scope, [itemName]: arr[i], [idxName]: i }, ctx);
      continue;
    }
    out += await renderEl(n, scope, ctx);
  }
  return out;
}

function attrString(n, scope, ctx, extraStyle = '') {
  const a = n.attrs;
  let cls = a.class !== undefined ? String(interp(a.class, scope)) : '';
  if (ctx.prefix) cls = cls.split(/\s+/).filter(Boolean).map((c) => ctx.prefix + c).join(' ');
  let style = a.style !== undefined ? String(interp(a.style, scope)) : '';
  style = style.replace(/(-?[\d.]+)rpx/g, (_, v) => `${(+v * W) / 750}px`);
  let s = '';
  if (cls) s += ` class="${esc(cls)}"`;
  if (style || extraStyle) s += ` style="${esc(extraStyle + style)}"`;
  if (a.bindtap || a.catchtap) s += ' data-tap="1"';
  return s;
}

// 自己服务器上的图，预览时读本地 public/ 里那份（还没发版也能看）
const assetUrl = (src) => { const s = String(src); if (s.startsWith('https://trip.byb521.com/')) return `../public/${s.slice(24)}`; return s.startsWith('/') ? `../miniprogram${s}` : s; };

async function renderEl(n, scope, ctx) {
  const a = n.attrs, tag = n.tag;
  if (tag === 'block') return renderNodes(n.kids, scope, ctx);
  if (ctx.comps[tag]) return renderComponent(ctx.comps[tag], n, scope, ctx);
  const kids = () => renderNodes(n.kids, scope, ctx);
  switch (tag) {
    case 'view': case 'scroll-view': case 'swiper': case 'swiper-item': case 'label': case 'form': case 'navigator': case 'cover-view': case 'movable-area': case 'movable-view':
      return `<wx-${tag === 'scroll-view' ? `scroll${'scroll-x' in a ? 'x' : 'y'}` : 'view'}${attrString(n, scope, ctx)}>${await kids()}</wx-${tag === 'scroll-view' ? `scroll${'scroll-x' in a ? 'x' : 'y'}` : 'view'}>`;
    case 'text': case 'span':
      return `<wx-text${attrString(n, scope, ctx)}>${await kids()}</wx-text>`;
    case 'image': {
      const src = interp(a.src || '', scope);
      const mode = a.mode || 'scaleToFill';
      const fit = { aspectFill: 'cover', aspectFit: 'contain', widthFix: 'fill', heightFix: 'fill' }[mode] || 'fill';
      return `<img${attrString(n, scope, ctx, `object-fit:${fit};${mode === 'widthFix' ? 'height:auto;' : ''}`)} src="${esc(assetUrl(src))}" data-mode="${mode}">`;
    }
    case 'input': case 'textarea':
      return `<input${attrString(n, scope, ctx)} placeholder="${esc(interp(a.placeholder || '', scope))}" value="${esc(interp(a.value || '', scope) ?? '')}">`;
    case 'picker':
      return `<wx-view${attrString(n, scope, ctx)}>${await kids()}</wx-view>`;
    case 'map':
      return `<wx-view${attrString(n, scope, ctx, 'background:linear-gradient(135deg,#dfe7ee,#cfd9e2);display:flex;align-items:center;justify-content:center;color:#7a8794;font-size:12px;')}>地图（原生组件，预览里只画占位）</wx-view>`;
    case 'button':
      return `<wx-button${attrString(n, scope, ctx)}>${await kids()}</wx-button>`;
    case 'switch': case 'checkbox': case 'radio':
      return `<input type="checkbox"${interp(a.checked || '', scope) ? ' checked' : ''}${attrString(n, scope, ctx)}>`;
    default:
      return `<wx-view data-tag="${tag}"${attrString(n, scope, ctx)}>${await kids()}</wx-view>`;
  }
}

async function renderComponent(path, n, scope, ctx) {
  const props = {};
  for (const [k, v] of Object.entries(n.attrs)) {
    if (/^(class|style|wx:|bind|catch)/.test(k)) continue;
    const camel = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    props[camel] = v === 'true' && !/\{\{/.test(v) ? true : interp(v, scope);
  }
  const inst = await loadPage(path.replace(/^\//, ''), props);
  for (const [k, v] of Object.entries(props)) inst.data[k] = v;
  const name = path.split('/').pop();
  ctx.css.add(cssOf(join(MP, `${path}.wxss`), `${name}__`));
  const tree = parse(readFileSync(join(MP, `${path}.wxml`), 'utf8'));
  const html = await renderNodes(tree.kids, inst.data, { ...ctx, prefix: `${name}__`, comps: {} });
  return `<wx-view class="${esc(n.attrs.class ? String(interp(n.attrs.class, scope)) : '')}" data-comp="${name}">${html}</wx-view>`;
}

// ---------- WXSS ----------
function cssOf(file, prefix = '') {
  if (!existsSync(file)) return '';
  let css = readFileSync(file, 'utf8');
  css = css.replace(/@import\s+["'][^"']+["'];?/g, '');
  css = css.replace(/(-?[\d.]+)rpx/g, (_, v) => `${(+v * W) / 750}px`);
  // 选择器里的标签名换成预览用的元素
  css = css.replace(/(^|[\s,{}>+~(])(page)(?=[\s,{:.#[>+~)])/g, '$1body');
  css = css.replace(/(^|[\s,{}>+~(])(view)(?=[\s,{:.#[>+~)])/g, '$1wx-view');
  css = css.replace(/(^|[\s,{}>+~(])(text)(?=[\s,{:.#[>+~)])/g, '$1wx-text');
  css = css.replace(/(^|[\s,{}>+~(])(image)(?=[\s,{:.#[>+~)])/g, '$1img');
  if (prefix) css = css.replace(/\.(-?[_a-zA-Z][\w-]*)(?=[^{}]*\{)/g, (m0, c) => (/^\d/.test(c) ? m0 : `.${prefix}${c}`));
  return css;
}

const BASE = `
html { -webkit-text-size-adjust: none; }
body { margin: 0; width: ${W}px; min-height: ${H}px; }
wx-view, wx-scrolly, wx-scrollx, wx-button { display: block; box-sizing: border-box; }
wx-scrolly { overflow-y: auto; }
wx-scrollx { overflow-x: auto; overflow-y: hidden; }
wx-text { display: inline; }
img { display: inline-block; width: 160px; height: 120px; }
input { box-sizing: border-box; font: inherit; border: 0; background: transparent; outline: none; display: block; }
wx-button { text-align: center; }
* { -webkit-tap-highlight-color: transparent; }
`;

async function renderPage(page, query = {}) {
  const inst = await loadPage(page, query);
  const comps = compOf(join(MP, `${page}.json`));
  const json = existsSync(join(MP, `${page}.json`)) ? JSON.parse(readFileSync(join(MP, `${page}.json`), 'utf8')) : {};
  const ctx = { prefix: '', comps, css: new Set() };
  const tree = parse(readFileSync(join(MP, `${page}.wxml`), 'utf8'));
  const body = await renderNodes(tree.kids, inst.data, ctx);
  // 页面底色以 WXSS 的 page{} 为准；没有自定义顶栏的页面画一条系统导航栏（状态栏 47 + 44）
  const css = [BASE, `body{background:${APP.window.backgroundColor || '#fff'};}`, cssOf(join(MP, 'app.wxss')), ...ctx.css, cssOf(join(MP, `${page}.wxss`))].join('\n');
  const custom = (json.navigationStyle || APP.window.navigationStyle) === 'custom';
  const barBg = json.navigationBarBackgroundColor || APP.window.navigationBarBackgroundColor || '#fff';
  const barInk = (json.navigationBarTextStyle || APP.window.navigationBarTextStyle) === 'white' ? '#fff' : '#000';
  const bar = custom ? '' : `<div style="position:sticky;top:0;z-index:999;height:91px;padding-top:47px;box-sizing:border-box;background:${barBg};color:${barInk};display:flex;align-items:center;justify-content:center;font:600 17px -apple-system,'PingFang SC';"><span style="position:absolute;left:14px;font-size:26px;font-weight:300">‹</span>${esc(json.navigationBarTitleText || APP.window.navigationBarTitleText || '')}<span style="position:absolute;right:7px;width:87px;height:32px;border-radius:16px;border:1px solid rgba(0,0,0,.12)"></span></div>`;
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=${W}"><title>${page}</title>
<style>${css}</style></head><body>${bar}${body}</body></html>`;
  const name = page.split('/').pop();
  writeFileSync(join(OUT, `${name}.html`), html);
  return name;
}

// ---------- Chrome 截图（DevTools 协议，Node 自带 WebSocket）----------
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
async function shoot(names) {
  const port = 9300 + Math.floor(Math.random() * 400);
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, '--hide-scrollbars', '--allow-file-access-from-files', '--no-first-run', `--user-data-dir=${join(OUT, '.chrome')}`, 'about:blank'], { stdio: 'ignore' });
  let ws;
  for (let i = 0; i < 50 && !ws; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try { const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const pg = list.find((x) => x.type === 'page'); if (pg) ws = pg.webSocketDebuggerUrl; } catch (e) { /* 还没起来 */ }
  }
  const sock = new WebSocket(ws);
  await new Promise((r) => sock.addEventListener('open', r));
  let id = 0; const waits = new Map();
  sock.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && waits.has(m.id)) { waits.get(m.id)(m.result || {}); waits.delete(m.id); } });
  const send = (method, params = {}) => new Promise((r) => { const n = ++id; waits.set(n, r); sock.send(JSON.stringify({ id: n, method, params })); });
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true });
  for (const name of names) {
    await send('Page.navigate', { url: pathToFileURL(join(OUT, `${name}.html`)).href });
    await new Promise((r) => setTimeout(r, 900));
    let h = H;
    if (process.env.FULL) {
      const r = await send('Runtime.evaluate', { expression: 'Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)', returnByValue: true });
      h = Math.min(9000, Math.max(H, r.result ? r.result.value : H));
      await send('Emulation.setDeviceMetricsOverride', { width: W, height: h, deviceScaleFactor: 2, mobile: true });
      await new Promise((r) => setTimeout(r, 300));
    }
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(SHOTS, `${name}${process.env.FULL ? '-full' : ''}${process.env.TAG ? '-' + process.env.TAG : ''}.png`), Buffer.from(shot.data, 'base64'));
    if (process.env.FULL) await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true });
  }
  sock.close(); proc.kill();
}

const want = process.argv.slice(2);
const QUERY = { 'pages/poi/poi': { id: 'capitol' } };
const pages = APP.pages.filter((p) => !want.length || want.includes(p.split('/').pop()));
const names = [];
for (const p of pages) { names.push(await renderPage(p, { id: 'east', ...(QUERY[p] || {}) })); }
await shoot(names);
console.log(`预览：${names.length} 页 → ${SHOTS}`);

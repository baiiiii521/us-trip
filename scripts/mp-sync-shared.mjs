// 把小程序的共用代码同步到 miniprogram/shared/：数据（src/data）和不碰浏览器的计算（src/lib）。
// 只从 src/ 往 shared/ 单向生成，shared/ 里的文件不要手改——下次同步会覆盖。
// 网站上那份仍然是唯一源头，改行程只改 src/data。
//
// 用法：node scripts/mp-sync-shared.mjs [--check]
//   --check 只比对不写入，发现不一致就以退出码 1 结束（测试里用）。
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(repo, 'src');
const OUT = join(repo, 'miniprogram', 'shared');
const checkOnly = process.argv.includes('--check');

// 共用清单：数据全部共用；lib 只挑不碰浏览器的
const LIB_FILES = ['calc.js', 'today.js', 'extras.js', 'route.js', 'tools.js', 'index.js', 'geo.js', 'exif.js', 'money.js', 'store.js'];
// 这些文件由别的脚本生成，同步时不要当成「多余的」删掉
const KEEP = new Set(['data/photos.js', 'data/geo.js', 'data/places.js', 'data/heroes.js']);
// 这些文件里出现浏览器 API 就说明挑错了，同步时直接报错
const BROWSER_API = /\b(window\.|document\.|localStorage\b|indexedDB\b|navigator\.|requestAnimationFrame\b|new Notification\b)/;

const BANNER = (src) =>
  `// ⚠️ 生成文件，不要手改。源头：${src}\n// 由 scripts/mp-sync-shared.mjs 生成；改内容请改 src/ 下那份，然后跑 node scripts/mp-sync-shared.mjs\n`;

// 查浏览器 API 前先去掉注释：注释里写「localStorage」是说明，不是调用
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

// 小程序版存储层：localStorage → wx 的同步存储
const STORE_MP = `${BANNER('src/lib/store.js（小程序实现）')}
// 小程序没有 localStorage，用 wx 的同步存储，键名和网页保持一致。
export const store = {
  get(key) {
    try {
      const v = wx.getStorageSync(key);
      return v === '' ? null : v;
    } catch (e) {
      return null;
    }
  },
  set(key, value) {
    try {
      wx.setStorageSync(key, value);
    } catch (e) {
      // 10MB 上限满了就静默放弃，下一次改动再试
    }
  }
};
`;

const jobs = [];
for (const f of readdirSync(join(SRC, 'data')).filter((f) => f.endsWith('.js'))) {
  jobs.push({ from: `src/data/${f}`, out: `data/${f}` });
}
for (const f of LIB_FILES) {
  jobs.push({ from: `src/lib/${f}`, out: `lib/${f}`, replace: f === 'store.js' ? STORE_MP : null });
}
jobs.push({ from: 'src/state.js', out: 'state.js' });

const problems = [];
const writes = [];

for (const job of jobs) {
  const srcPath = join(repo, job.from);
  if (!existsSync(srcPath)) {
    // store.js 之前不存在时也要能跑（网页那份是实现，不能缺）
    problems.push(`缺源文件：${job.from}`);
    continue;
  }
  const body = readFileSync(srcPath, 'utf8');
  const content = job.replace || `${BANNER(job.from)}${body}`;
  // 只有复制过来的要检查浏览器 API；替换内容是本项目自己写的，跳过
  if (!job.replace) {
    const hit = stripComments(body).match(BROWSER_API);
    if (hit) problems.push(`${job.from} 用了浏览器 API（${hit[0]}），不能放进共用层`);
  }
  writes.push({ out: join(OUT, job.out), content });
}

const stale = [];
if (existsSync(OUT)) {
  const wanted = new Set(writes.map((w) => w.out));
  const walk = (dir) => readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return existsSync(p) && !f.includes('.') ? walk(p) : [p];
  });
  for (const p of walk(OUT)) {
    if (!wanted.has(p) && !p.endsWith('.DS_Store') && !KEEP.has(relative(OUT, p))) stale.push(p);
  }
}

if (problems.length) {
  console.error(problems.map((p) => `❌ ${p}`).join('\n'));
  process.exit(1);
}

let changed = 0;
for (const w of writes) {
  const has = existsSync(w.out) ? readFileSync(w.out, 'utf8') : null;
  if (has === w.content) continue;
  changed += 1;
  if (!checkOnly) {
    mkdirSync(dirname(w.out), { recursive: true });
    writeFileSync(w.out, w.content);
  }
}
for (const p of stale) {
  changed += 1;
  if (!checkOnly) rmSync(p);
}

if (checkOnly) {
  if (changed) {
    console.error(`shared/ 和 src/ 不一致：${changed} 个文件需要重新生成（跑 node scripts/mp-sync-shared.mjs）`);
    process.exit(1);
  }
  console.log(`shared/ 是最新的（${writes.length} 个文件）`);
} else {
  console.log(`同步完成：${writes.length} 个文件，改动 ${changed} 个 → miniprogram/shared/`);
}

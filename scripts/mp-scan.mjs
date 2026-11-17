// 小程序代码包的隐私扫描：和 tests/drive.test.js 里扫网站用的是同一份规则。
// 上传前跑一次（scripts/mp-upload.mjs 会调用），测试里也跑一次，防止哪一步漏掉。
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// 护照号、第二本护照、PNR、票号、酒店/公寓确认号、公寓房号。
// 规则放在 private-patterns.json 里，脚本本身就不会被自己的规则命中。
const patternSrc = JSON.parse(
  readFileSync(fileURLToPath(new URL('./private-patterns.json', import.meta.url)), 'utf8')
).private;

export const PRIVATE_PATTERNS = new RegExp(patternSrc);

const TEXT_EXT = new Set(['.js', '.mjs', '.cjs', '.json', '.wxml', '.wxss', '.md', '.txt', '.html', '.wxs']);
// 这些目录不是代码包内容，扫也没用
const SKIP_DIR = new Set(['node_modules', '.git', 'miniprogram_npm']);

export function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (!SKIP_DIR.has(name)) walk(p, out);
    } else {
      out.push({ path: p, size: st.size });
    }
  }
  return out;
}

// 返回命中的 [{ file, match }]；空数组表示干净
export function scanLeaks(root) {
  const hits = [];
  for (const f of walk(root)) {
    if (!TEXT_EXT.has(extname(f.path))) continue;
    const txt = readFileSync(f.path, 'latin1');
    const m = txt.match(PRIVATE_PATTERNS);
    if (m) hits.push({ file: f.path, match: m[0] });
  }
  return hits;
}

// 包体积：主包（整个 miniprogram/ 就是主包，分包在 subpackages 里另算）
export function packageSize(root) {
  const files = walk(root);
  return files.reduce((n, f) => n + f.size, 0);
}

// 把 vite build 的结果打包成单个 HTML（CSS/JS 内联），可以直接双击打开、发给同伴或离线保存。
// 输出：dist/single/index.html（完整文档）和 dist/single/fragment.html（不含 html/head/body 外壳，给只接受页面片段的托管用）
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
let html = readFileSync(join(dist, 'index.html'), 'utf8');

html = html.replace(/<link[^>]+rel="stylesheet"[^>]+href="\.\/(assets\/[^"]+\.css)"[^>]*>/g, (_, p) =>
  `<style>\n${readFileSync(join(dist, p), 'utf8')}\n</style>`);
html = html.replace(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"[^>]*><\/script>/g, (_, p) => {
  const js = readFileSync(join(dist, p), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">\n${js}\n</script>`;
});

const out = join(dist, 'single');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'index.html'), html);
if (existsSync(join(dist, 'favicon.svg'))) copyFileSync(join(dist, 'favicon.svg'), join(out, 'favicon.svg'));

// 片段版：去掉 doctype / html / head / body 外壳，保留 title、样式、字体和脚本
const head = (html.match(/<head>([\s\S]*?)<\/head>/) || [, ''])[1]
  .replace(/<meta charset[^>]*>\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '');
const body = (html.match(/<body>([\s\S]*?)<\/body>/) || [, ''])[1];
// 脚本移到正文后面，保证 #app 已存在
const scripts = [];
const headNoScript = head.replace(/<script type="module">[\s\S]*?<\/script>/g, (m) => { scripts.push(m); return ''; });
writeFileSync(join(out, 'fragment.html'), `${headNoScript.trim()}\n${body.trim()}\n${scripts.join('\n')}\n`);

console.log('single file:', join(out, 'index.html'), (html.length / 1024).toFixed(0) + ' KB');

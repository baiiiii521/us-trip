// 上传小程序：隐私扫描 → 上传开发版 → 出预览二维码。
// 在腾讯云 49.233.168.199 上跑（/opt/node20/bin/node），不在本地跑微信开发者工具。
//
// 用法：
//   node scripts/mp-upload.mjs --project miniprogram --key ~/.mp-ci/private.wx678ed2bc735ec846.key \
//        --version 0.1.0 --desc "空壳：旅行列表" [--preview-only]
//
// 私钥只用路径，不读内容、不打印、不落日志。
import { createRequire } from 'node:module';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanLeaks, packageSize } from './mp-scan.mjs';

const require = createRequire(import.meta.url);
const ci = require('miniprogram-ci');

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v && !v.startsWith('--') ? v : true;
}

const projectDir = resolve(repo, arg('project', 'miniprogram'));
const keyPath = resolve(arg('key', `${process.env.HOME}/.mp-ci/private.key`).replace(/^~(?=\/)/, process.env.HOME));
const version = String(arg('version', '0.1.0'));
const desc = String(arg('desc', '自动上传'));
const previewOnly = process.argv.includes('--preview-only');
const outDir = resolve(repo, arg('out', '.mp-out'));
const qrPath = resolve(outDir, 'preview.png');

if (!existsSync(projectDir)) throw new Error(`找不到小程序目录：${projectDir}`);
if (!existsSync(keyPath)) throw new Error(`找不到上传密钥（路径来自参数，未读取内容）：${keyPath}`);

const cfg = JSON.parse(readFileSync(resolve(projectDir, 'project.config.json'), 'utf8'));
const appid = cfg.appid;
if (!/^wx[0-9a-f]{16}$/.test(appid)) throw new Error(`project.config.json 里的 appid 不合法：${appid}`);
// 密钥文件名必须和 appid 对得上，防止拿错项目
if (!keyPath.includes(appid)) throw new Error('密钥文件名和 appid 不匹配，检查是不是拿错了 key');

// 1. 隐私扫描：命中就停下，别把证件号传上去
const leaks = scanLeaks(projectDir);
if (leaks.length) {
  for (const h of leaks) console.error(`❌ ${h.file.replace(repo + '/', '')} 命中 ${h.match}`);
  throw new Error(`小程序代码包里有个人信息（${leaks.length} 处），已中止上传`);
}

const size = packageSize(projectDir);
console.log(`隐私扫描：干净（0 处）`);
console.log(`主包体积：${(size / 1024).toFixed(0)} KB / 上限 2048 KB`);
if (size > 2 * 1024 * 1024) throw new Error('主包超过 2MB，先拆分包');

const project = new ci.Project({
  appid,
  type: 'miniProgram',
  projectPath: projectDir,
  privateKeyPath: keyPath,
  ignores: ['node_modules/**/*', '.git/**/*', '**/*.md']
});

const setting = { es6: true, es7: true, minify: true, autoPrefixWXSS: true, codeProtect: false };
const onProgressUpdate = (t) => {
  if (t && t._msg) process.stdout.write(`\r${String(t._msg).slice(0, 60)}          `);
};

mkdirSync(outDir, { recursive: true });

if (!previewOnly) {
  const res = await ci.upload({
    project,
    version,
    desc,
    setting,
    robot: 1,
    onProgressUpdate
  });
  process.stdout.write('\n');
  console.log(`上传成功：版本 ${version}，${desc}`);
  if (res && res.subPackageInfo) {
    for (const p of res.subPackageInfo) console.log(`  ${p.name || '主包'}：${(p.size / 1024).toFixed(0)} KB`);
  }
}

const qr = await ci.preview({
  project,
  desc,
  setting,
  qrcodeFormat: 'image',
  qrcodeOutputDest: qrPath,
  pagePath: 'pages/trips/trips',
  onProgressUpdate
});
process.stdout.write('\n');
if (!existsSync(qrPath)) throw new Error('预览二维码没生成');
console.log(`预览二维码：${qrPath}`);
if (qr && qr.subPackageInfo) console.log('预览包信息已附带');

// miniprogram-ci 会留下不结束的子进程，脚本自己要收尾，否则 ssh 那边会一直挂着
process.exit(0);

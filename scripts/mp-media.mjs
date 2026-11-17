// 小程序用的城市图：放到自己的服务器（trip.byb521.com/media/mp/），国内也能打开。
// 维基的图在国内经常打不开，所以先下载下来、压到合适尺寸，跟网站一起发版。
//
// 每座城两张：
//   <城>-day.jpg   真实照片（维基共享资源，作者和许可写进 credits.json）
//   <城>-night.jpg 本机 codex 生成的夜景示意图（AI 生成，不是实拍；提示词见 video/intro3d/）
// 另外 cover.jpg（首页封面）、arena.jpg（票务页）也来自 codex 生成图。
//
// 用法：node scripts/mp-media.mjs        → 写 public/media/mp/，再跑 deploy/deploy.sh 发上去
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { HEROES } from '../miniprogram/shared/data/heroes.js';
import PHOTOS from '../miniprogram/shared/data/photos.js';

const OUT = 'public/media/mp';
const GEN = 'video/intro3d/assets/gen';
mkdirSync(OUT, { recursive: true });

// 真实照片：每座城挑一张最认得出的
const DAY = { bos: 'public-garden', dc: 'capitol', phl: 'independence-hall', nyc: 'brooklyn-bridge', la: 'santa-monica' };
// AI 夜景：codex 生成的那一批
const NIGHT = { bos: 'boston', dc: 'dc', phl: 'philly', nyc: 'nyc', la: 'la' };
const EXTRA = { cover: 'nyc', arena: 'arena', brooklyn: 'brooklyn' };

const credits = {};
const tmp = join(OUT, '.tmp.jpg');

// 竖图横图都压到 1080 宽，质量 72：一张 120–220KB，弱网也能出来
function squeeze(src, dst, { w = 1080, h = 0 } = {}) {
  const geo = h ? `${w}x${h}^` : `${w}x`;
  const args = [src, '-auto-orient', '-strip', '-resize', geo];
  if (h) args.push('-gravity', 'center', '-extent', `${w}x${h}`);
  args.push('-sampling-factor', '4:2:0', '-interlace', 'JPEG', '-quality', '72', dst);
  execFileSync('magick', args);
}

for (const [city, id] of Object.entries(DAY)) {
  const h = HEROES[id];
  if (!h) { console.warn(`  ${city}：没有 ${id} 的大图，跳过`); continue; }
  const res = await fetch(h.src, { headers: { 'User-Agent': 'trip-site-build/1.0 (personal travel notes)' } });
  if (!res.ok) { console.warn(`  ${city}：下载失败 ${res.status}`); continue; }
  writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
  // 横幅比例 3:2，正好放进今天页的站牌
  squeeze(tmp, join(OUT, `${city}-day.jpg`), { w: 1080, h: 720 });
  const p = PHOTOS[id] || PHOTOS[`${id}-pier`] || {};
  credits[`${city}-day`] = { kind: 'photo', source: 'Wikimedia Commons', poi: id, author: h.credit || p.credit || p.author || '', license: h.license || p.license || '' };
}

for (const [city, name] of Object.entries(NIGHT)) {
  const src = join(GEN, `${name}.jpg`);
  if (!existsSync(src)) { console.warn(`  ${city}：没有 ${src}`); continue; }
  squeeze(src, join(OUT, `${city}-night.jpg`), { w: 1080, h: 720 });
  credits[`${city}-night`] = { kind: 'ai', source: 'codex 本机生图（AI 生成示意图，不是实拍）', file: src };
}

for (const [key, name] of Object.entries(EXTRA)) {
  const src = join(GEN, `${name}.jpg`);
  if (!existsSync(src)) continue;
  if (key === 'cover') squeeze(src, join(OUT, 'cover.jpg'), { w: 1080, h: 1500 });
  else squeeze(src, join(OUT, `${key}.jpg`), { w: 1080, h: 720 });
  credits[key] = { kind: 'ai', source: 'codex 本机生图（AI 生成示意图，不是实拍）', file: src };
}

try { execFileSync('rm', ['-f', tmp]); } catch (e) { /* 没有就算了 */ }
writeFileSync(join(OUT, 'credits.json'), JSON.stringify(credits, null, 2) + '\n');
console.log(`写好 ${Object.keys(credits).length} 张 → ${OUT}`);
void readFileSync;

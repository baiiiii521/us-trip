// 把 68 个景点的维基首图抓下来，写成 miniprogram/shared/data/photos.json。
// 为什么要在构建时抓：小程序里 <image> 能直接显示国外域名的图，但每台手机现场取一次
// 既慢又要处理作者和许可信息；先抓一次存进包里，图片地址是维基 CDN，随用随取。
//
// 用法：node scripts/mp-photos.mjs
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { POIS } from '../src/data/pois.js';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(repo, 'miniprogram/shared/data/photos.js');
const WIKI = 'https://en.wikipedia.org/w/api.php';
const UA = 'us-trip-miniprogram/0.3 (personal travel app; contact barry)';

const api = async (params) => {
  const url = `${WIKI}?${new URLSearchParams({ format: 'json', origin: '*', ...params })}`;
  for (let i = 0; i < 3; i += 1) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.ok) return await r.json();
    } catch (e) {
      // 重试
    }
    await new Promise((res) => setTimeout(res, 400 * (i + 1)));
  }
  throw new Error(`维基接口失败：${params.titles ? String(params.titles).slice(0, 60) : url}`);
};

const chunk = (arr, n) => arr.reduce((out, x, i) => (i % n ? out[out.length - 1].push(x) : out.push([x]), out), []);
const norm = (t) => String(t).replace(/_/g, ' ');

async function main() {
  const wanted = POIS.filter((p) => p.wiki).map((p) => ({ id: p.id, wiki: p.wiki }));
  const byTitle = new Map();

  for (const group of chunk(wanted, 20)) {
    const titles = group.map((w) => norm(w.wiki)).join('|');
    const json = await api({
      action: 'query',
      prop: 'pageimages',
      piprop: 'thumbnail|name',
      pithumbsize: '900',
      pilicense: 'free',
      redirects: '1',
      titles
    });
    const q = json.query || {};
    const forward = {};
    for (const r of q.normalized || []) forward[r.from] = r.to;
    for (const r of q.redirects || []) forward[r.from] = r.to;
    const pages = new Map(Object.values(q.pages || {}).map((p) => [p.title, p]));
    for (const w of group) {
      let title = norm(w.wiki);
      for (let i = 0; i < 3 && forward[title]; i += 1) title = forward[title];
      const p = pages.get(title);
      if (p && p.thumbnail && p.thumbnail.source) {
        byTitle.set(w.id, {
          src: p.thumbnail.source,
          w: p.thumbnail.width,
          h: p.thumbnail.height,
          file: p.pageimage || '',
          page: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
        });
      }
    }
    process.stdout.write(`图片 ${byTitle.size}/${wanted.length}\r`);
  }

  // 列表用的小图：维基只认它自己返回的尺寸，简历上拼一个 480px 会 400，必须再问一次接口
  for (const group of chunk(wanted, 20)) {
    const json = await api({
      action: 'query',
      prop: 'pageimages',
      piprop: 'thumbnail',
      pithumbsize: '480',
      pilicense: 'free',
      redirects: '1',
      titles: group.map((w) => norm(w.wiki)).join('|')
    });
    const q = json.query || {};
    const forward = {};
    for (const r of q.normalized || []) forward[r.from] = r.to;
    for (const r of q.redirects || []) forward[r.from] = r.to;
    const pages = new Map(Object.values(q.pages || {}).map((p) => [p.title, p]));
    for (const w of group) {
      let title = norm(w.wiki);
      for (let i = 0; i < 3 && forward[title]; i += 1) title = forward[title];
      const p = pages.get(title);
      const cur = byTitle.get(w.id);
      if (cur && p && p.thumbnail && p.thumbnail.source) cur.thumb = p.thumbnail.source;
    }
  }

  // 作者和许可：按文件名查一次 extmetadata
  const files = [...byTitle.values()].map((v) => v.file).filter(Boolean);
  const meta = new Map();
  for (const group of chunk([...new Set(files)], 20)) {
    const json = await api({
      action: 'query',
      prop: 'imageinfo',
      iiprop: 'extmetadata',
      titles: group.map((f) => `File:${f}`).join('|')
    });
    for (const p of Object.values((json.query && json.query.pages) || {})) {
      const info = p.imageinfo && p.imageinfo[0];
      if (!info || !info.extmetadata) continue;
      const m = info.extmetadata;
      meta.set(p.title.replace(/^File:/, '').replace(/_/g, ' '), {
        artist: (m.Artist && m.Artist.value ? m.Artist.value : '').replace(/<[^>]*>/g, '').trim(),
        license: (m.LicenseShortName && m.LicenseShortName.value) || ''
      });
    }
  }

  // 少数景点没有维基首图（版权原因），但指定了共享资源里的某个文件，单独取一次
  const FALLBACK = { 'charging-bull': 'Shooting Charging Bull.jpg' };
  for (const [id, file] of Object.entries(FALLBACK)) {
    if (byTitle.has(id)) continue;
    const json = await api({
      action: 'query',
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiurlwidth: '900',
      titles: `File:${file}`
    });
    const p = Object.values((json.query && json.query.pages) || {})[0];
    const info = p && p.imageinfo && p.imageinfo[0];
    if (!info) continue;
    const m = info.extmetadata || {};
    byTitle.set(id, {
      src: info.thumburl || info.url,
      w: 900,
      h: 0,
      file,
      page: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`
    });
    meta.set(file.replace(/_/g, ' '), {
      artist: (m.Artist && m.Artist.value ? m.Artist.value : '').replace(/<[^>]*>/g, '').trim(),
      license: (m.LicenseShortName && m.LicenseShortName.value) || ''
    });
  }

  const out = {};
  for (const [id, v] of byTitle) {
    const m = meta.get(String(v.file).replace(/_/g, ' ')) || {};
    out[id] = {
      src: v.src,
      thumb: v.thumb || v.src,
      w: v.w,
      h: v.h,
      credit: m.artist || '',
      license: m.license || '',
      page: v.page
    };
  }

  // 保险：没有图片的景点保持原样（页面会显示城市色块）
  const missing = POIS.filter((p) => !out[p.id]).map((p) => p.id);
  writeFileSync(OUT, `// ⚠️ 生成文件，不要手改。来源：scripts/mp-photos.mjs（维基百科首图 + 作者/许可）\nexport default ${JSON.stringify(out, null, 0)};\n`);
  console.log(`\n写入 ${OUT}`);
  console.log(`有图 ${Object.keys(out).length}/${POIS.length}${missing.length ? `；没有图：${missing.join(', ')}` : ''}`);
}

if (!existsSync(join(repo, 'miniprogram/shared/data'))) {
  throw new Error('先跑 node scripts/mp-sync-shared.mjs 生成 shared/');
}
main();

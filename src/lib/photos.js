// 景点照片：在浏览器里从维基百科读取条目首图（只取自由版权图片）和作者/许可信息。
// 结果缓存在 localStorage 30 天。网络不通或被拦截时返回空，页面显示占位明信片。
const CACHE_KEY = 'hoops-photos-v2'; // v2：补了 4 个景点的照片，旧缓存作废
const TTL = 30 * 86400000;
const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

let photos = {};
const listeners = new Set();

export function getPhoto(wikiTitle) { return wikiTitle ? photos[wikiTitle] || null : null; }
export function onPhotos(fn) { listeners.add(fn); }
export function photoUrls() { return Object.values(photos).map((p) => p.src).filter(Boolean); }

function readCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (c && Date.now() - c.at < TTL) return c.data;
  } catch (e) { /* 忽略 */ }
  return null;
}
function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data })); } catch (e) { /* 忽略 */ }
}

const norm = (t) => t.replace(/_/g, ' ');

// 解析 pageimages 返回：把请求的标题（含重定向、规范化）映射到图片
export function parsePageImages(json, requested) {
  const q = (json && json.query) || {};
  const forward = {};
  for (const r of q.normalized || []) forward[r.from] = r.to;
  for (const r of q.redirects || []) forward[r.from] = r.to;
  const byTitle = {};
  for (const p of q.pages || []) {
    if (p.thumbnail && p.thumbnail.source) {
      byTitle[p.title] = { src: p.thumbnail.source, w: p.thumbnail.width, h: p.thumbnail.height, file: p.pageimage || null, page: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(p.title.replace(/ /g, '_')) };
    }
  }
  const out = {};
  for (const t of requested) {
    let title = norm(t);
    for (let i = 0; i < 3 && forward[title]; i++) title = forward[title];
    if (byTitle[title]) out[t] = byTitle[title];
  }
  return out;
}

function stripHtml(s) {
  if (!s) return '';
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

export function parseCredits(json) {
  const out = {};
  for (const p of ((json && json.query && json.query.pages) || [])) {
    const info = p.imageinfo && p.imageinfo[0];
    if (!info) continue;
    const m = info.extmetadata || {};
    out[p.title.replace(/^File:/, '').replace(/ /g, '_')] = {
      artist: stripHtml(m.Artist && m.Artist.value),
      license: stripHtml(m.LicenseShortName && m.LicenseShortName.value),
      licenseUrl: (m.LicenseUrl && m.LicenseUrl.value) || '',
      fileUrl: info.descriptionurl || ''
    };
  }
  return out;
}

async function getJson(base, params) {
  const url = base + '?' + new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params });
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

// 解析 Commons 指定文件的 imageinfo 返回（给没有自由版权首图的条目用）
// requested: [{ key, file }]，key 是页面里用的缓存键（一般就是条目名）
export function parseCommonsFiles(json, requested) {
  const q = (json && json.query) || {};
  const forward = {};
  for (const r of q.normalized || []) forward[r.from] = r.to;
  const byFile = {};
  for (const p of q.pages || []) {
    const info = p.imageinfo && p.imageinfo[0];
    if (!info) continue;
    const src = info.thumburl || info.url;
    if (!src) continue;
    const m = info.extmetadata || {};
    const name = p.title.replace(/^File:/, '');
    byFile[norm(name)] = {
      src,
      w: info.thumbwidth || info.width,
      h: info.thumbheight || info.height,
      file: name,
      page: info.descriptionurl || '',
      fileUrl: info.descriptionurl || '',
      artist: stripHtml(m.Artist && m.Artist.value),
      license: stripHtml(m.LicenseShortName && m.LicenseShortName.value),
      licenseUrl: (m.LicenseUrl && m.LicenseUrl.value) || ''
    };
  }
  const out = {};
  for (const t of requested) {
    let k = norm(t.file);
    for (let i = 0; i < 3 && forward[k]; i++) k = forward[k];
    if (byFile[k]) out[t.key] = byFile[k];
  }
  return out;
}

function chunks(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// titles: 维基条目名数组；files: { 条目名 → Commons 文件名 }，给没有自由版权首图的条目兜底
export async function loadPhotos(titles, files = {}) {
  const cached = readCache();
  if (cached) { photos = cached; listeners.forEach((f) => f()); return; }
  const want = [...new Set(titles.filter(Boolean))];
  const found = {};
  try {
    for (const group of chunks(want, 45)) {
      const json = await getJson(WIKI_API, {
        action: 'query', redirects: '1', prop: 'pageimages', piprop: 'thumbnail|name',
        pithumbsize: '960', pilimit: '50', titles: group.join('|')
      });
      Object.assign(found, parsePageImages(json, group));
    }
    const files2 = [...new Set(Object.values(found).map((p) => p.file).filter(Boolean))];
    const credits = {};
    for (const group of chunks(files2, 45)) {
      const json = await getJson(COMMONS_API, {
        action: 'query', prop: 'imageinfo', iiprop: 'extmetadata|url',
        iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl', titles: group.map((f) => 'File:' + f).join('|')
      });
      Object.assign(credits, parseCredits(json));
    }
    for (const t of Object.keys(found)) {
      const c = credits[(found[t].file || '').replace(/ /g, '_')];
      if (c) Object.assign(found[t], c);
    }
    // 指定文件兜底：条目首图是非自由版权或干脆没有首图时，直接读 Commons 上的自由版权照片
    const pick = Object.entries(files || {}).filter(([k]) => k && !found[k]);
    if (pick.length) {
      const req = pick.map(([key, file]) => ({ key, file }));
      for (const group of chunks(req, 45)) {
        const json = await getJson(COMMONS_API, {
          action: 'query', prop: 'imageinfo', iiprop: 'extmetadata|url|size', iiurlwidth: '960',
          iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl',
          titles: group.map((r) => 'File:' + r.file).join('|')
        });
        Object.assign(found, parseCommonsFiles(json, group));
      }
    }
    photos = found;
    writeCache(found);
  } catch (e) {
    // 被浏览器策略或网络拦截：保持空，页面用占位图
    photos = {};
  }
  listeners.forEach((f) => f());
}


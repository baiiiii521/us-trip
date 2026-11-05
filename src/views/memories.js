// 回忆：导入照片（读取拍摄时间自动归到行程第几天）、生成回忆视频、每天一张分享卡。照片只存在本机。
import { esc, icon } from '../lib/dom.js';
import { buildDays } from '../data/days.js';
import { CITIES } from '../data/trip.js';
import { files } from '../lib/storage.js';
import { pickMime } from '../lib/recap.js';

export const memUi = { photos: [], loaded: false, busy: '', progress: 0, msg: '', video: null };

export async function loadMemories() {
  const recs = await files.byKind('photo');
  memUi.photos.forEach((p) => URL.revokeObjectURL(p.url));
  memUi.photos = recs.map((r) => ({ id: r.id, name: r.name, takenAt: new Date(r.takenAt), day: r.day, blob: r.blob, url: URL.createObjectURL(r.blob) }))
    .sort((a, b) => a.takenAt - b.takenAt);
  memUi.loaded = true;
}

export function renderMemories(state) {
  const days = buildDays(state);
  const groups = days.map((d) => ({ d, list: memUi.photos.filter((p) => p.day === d.id) }));
  const other = memUi.photos.filter((p) => p.day === 'other');
  const supported = pickMime() !== null;
  const busy = !!memUi.busy;
  return `
  <div class="pagehead"><h1>回忆</h1><p>导入旅途中的照片，按拍摄时间自动归到每一天。照片只存在这台手机里，不会上传。</p></div>

  <section class="card">
    <div class="card__h"><h2>导入照片</h2><span class="meta">共 ${memUi.photos.length} 张</span></div>
    <div class="btn-row">
      <label class="btn btn--primary filebtn" for="mem-add">${icon('copy')}选择照片<input id="mem-add" type="file" accept="image/*" multiple hidden data-mem-files></label>
      <button type="button" class="btn btn--secondary" data-action="recap"${busy || memUi.photos.length < 3 || !supported ? ' disabled' : ''}>${memUi.busy === 'recap' ? `录制中 ${Math.round(memUi.progress * 100)}%` : '生成回忆视频'}</button>
    </div>
    <p class="note">${supported ? '回忆视频是 1080×1920 竖屏，每张约 1.8 秒，带胶片日期戳。录制时要把页面留在前台，大约等于视频时长。至少要 3 张。' : '这个浏览器不支持在页面里录视频，请换 Chrome 或 Safari 新版本。'}</p>
    ${memUi.msg ? `<p class="callout" role="status">${esc(memUi.msg)}</p>` : ''}
    ${memUi.video ? `<div class="recap"><video controls playsinline src="${esc(memUi.video.url)}"></video><a class="btn btn--secondary" href="${esc(memUi.video.url)}" download="east-coast-hoops-recap.${memUi.video.ext}">${icon('check')}保存视频</a></div>` : ''}
  </section>

  ${groups.map(({ d, list }) => `<section class="card memday" id="mem-${d.id}">
    <div class="card__h"><h2>${d.md} ${esc(d.wd)} <span class="tag tag--${d.city}">${esc(CITIES[d.city].zh)}</span></h2>
      <button type="button" class="btn btn--secondary btn--sm" data-action="sharecard" data-day="${d.id}"${busy ? ' disabled' : ''}>生成分享卡</button></div>
    <p class="meta">${esc(d.title)}</p>
    ${list.length ? `<div class="thumbs">${list.map((p) => `<figure class="thumb"><img src="${esc(p.url)}" alt="${esc(d.md)} 的照片" loading="lazy"><button type="button" class="thumb__x" data-action="mem-del" data-id="${esc(p.id)}" aria-label="删除这张照片">${icon('close')}</button></figure>`).join('')}</div>` : '<p class="meta">这天还没有照片</p>'}
  </section>`).join('')}

  ${other.length ? `<section class="card"><div class="card__h"><h2>不在行程日期内</h2></div><div class="thumbs">${other.map((p) => `<figure class="thumb"><img src="${esc(p.url)}" alt="其他照片" loading="lazy"><button type="button" class="thumb__x" data-action="mem-del" data-id="${esc(p.id)}" aria-label="删除这张照片">${icon('close')}</button></figure>`).join('')}</div><p class="note">这些照片的拍摄时间不在 12/18–12/31，不会进回忆视频。</p></section>` : ''}`;
}

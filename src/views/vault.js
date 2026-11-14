// 证件和订单（需密码）：护照号、PNR、票号、酒店确认号、行程单 PDF。
// 解锁后的明文只放在内存里，关掉页面或点“锁上”就没了；本机只存密文。
import { esc, icon } from '../lib/dom.js';
import { cachedVault, vaultFilesCall, sealVaultFile, openVaultFileMeta, openVaultFileData, forgetFileKeys, VAULT_FILE_MAX } from '../lib/vault.js';
import { files } from '../lib/storage.js';

// pin 只在解锁期间留在内存里（上传时要用它加密），锁上就清掉
export const vaultUi = { data: null, err: '', busy: false, from: '', at: 0, urls: {}, pin: '', uploads: [], upBusy: '', upMsg: '' };

export function lockVault() {
  Object.values(vaultUi.urls).forEach((u) => URL.revokeObjectURL(u));
  forgetFileKeys();
  Object.assign(vaultUi, { data: null, err: '', busy: false, from: '', at: 0, urls: {}, pin: '', uploads: [], upBusy: '', upMsg: '' });
}

// ── 手机上传的附件：服务器存密文，本机 IndexedDB 也存一份密文（kind=vaultfile），没网照样能看 ──
const cacheId = (id) => 'vf-' + id;

async function refreshUploads() {
  const pin = vaultUi.pin;
  const all = await files.byKind('vaultfile');
  const list = [];
  for (const c of all) {
    try { list.push({ id: c.rec.id, at: c.rec.at, ...(await openVaultFileMeta(c.rec, pin)) }); } catch (e) { /* 别的密码加的，跳过 */ }
  }
  vaultUi.uploads = list.sort((a, b) => a.at - b.at);
}

// 打开证件包后调用：和服务器对一遍，下载本机还没有的，删掉服务器上已经删了的
export async function syncVaultFiles(onChange) {
  const pin = vaultUi.pin;
  if (!pin) return;
  await refreshUploads(); onChange();
  let remote;
  try { remote = (await vaultFilesCall('list', pin)).files; }
  catch (e) { vaultUi.upMsg = e.offline ? '没网：下面是这台手机上存的附件。' : '附件列表没取到：' + e.message; onChange(); return; }
  const local = await files.byKind('vaultfile');
  const have = new Set(local.map((c) => c.rec.id));
  const keep = new Set(remote.map((r) => r.id));
  for (const c of local) if (!keep.has(c.rec.id)) await files.del(c.id).catch(() => {});
  const missing = remote.filter((r) => !have.has(r.id));
  for (let i = 0; i < missing.length; i++) {
    vaultUi.upBusy = `正在下载附件 ${i + 1}/${missing.length}…`; onChange();
    try { const rec = await vaultFilesCall('get', pin, { id: missing[i].id }); await files.put({ id: cacheId(rec.id), kind: 'vaultfile', rec }); } catch (e) { /* 下次再试 */ }
  }
  vaultUi.upBusy = ''; vaultUi.upMsg = '';
  await refreshUploads(); onChange();
}

export async function uploadVaultFiles(list, onChange) {
  const pin = vaultUi.pin;
  if (!pin) return;
  let ok = 0; const bad = [];
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    if (f.size > VAULT_FILE_MAX) { bad.push(`${f.name} 超过 10MB`); continue; }
    vaultUi.upBusy = `正在加密上传 ${i + 1}/${list.length}：${f.name}`; onChange();
    try {
      const sealed = await sealVaultFile({ name: f.name, type: f.type, bytes: new Uint8Array(await f.arrayBuffer()) }, pin);
      const r = await vaultFilesCall('put', pin, sealed);
      await files.put({ id: cacheId(r.id), kind: 'vaultfile', rec: { id: r.id, at: Date.now(), ...sealed } });
      ok++;
    } catch (e) { bad.push(`${f.name}：${e.message}`); }
  }
  vaultUi.upBusy = '';
  vaultUi.upMsg = (ok ? `已上传 ${ok} 个，同伴打开证件包就能看到。` : '') + (bad.length ? `没传上：${bad.join('；')}` : '');
  await refreshUploads(); onChange();
}

export async function openUpload(id) {
  const c = await files.get(cacheId(id));
  if (!c) throw new Error('这台手机上没有这个附件，联网后重新打开证件包');
  const meta = await openVaultFileMeta(c.rec, vaultUi.pin);
  const bytes = await openVaultFileData(c.rec, vaultUi.pin);
  const key = 'up-' + id;
  if (!vaultUi.urls[key]) vaultUi.urls[key] = URL.createObjectURL(new Blob([bytes], { type: meta.type }));
  return { url: vaultUi.urls[key], ...meta };
}

export async function deleteUpload(id, onChange) {
  try { await vaultFilesCall('del', vaultUi.pin, { id }); }
  catch (e) { vaultUi.upMsg = '没删掉：' + e.message; onChange(); return; }
  await files.del(cacheId(id)).catch(() => {});
  vaultUi.upMsg = '已删除，两台手机都看不到了。';
  await refreshUploads(); onChange();
}

const kb = (n) => n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB';
function uploadsHtml() {
  const u = vaultUi.uploads;
  return `<section class="card">
    <div class="card__h"><h2>我上传的</h2><span class="meta">${u.length} 个 · 两台手机共享</span></div>
    ${u.length ? `<ul class="vlist">${u.map((f) => `<li class="vrow">
      <span class="vrow__main"><b>${esc(f.name)}</b><small>${/pdf/.test(f.type) ? 'PDF' : /^image\//.test(f.type) ? '图片' : '文件'} · ${kb(f.size)} · ${when(f.at)}</small></span>
      <button type="button" class="btn btn--primary btn--sm" data-action="vfile-open" data-id="${esc(f.id)}">打开</button>
      <button type="button" class="btn btn--secondary btn--sm" data-action="vfile-del" data-id="${esc(f.id)}" aria-label="删除 ${esc(f.name)}">${icon('close')}</button>
    </li>`).join('')}</ul>` : '<p class="empty">还没有。护照首页、签证页、酒店确认单、租车合同，拍照或选 PDF 传上来。</p>'}
    ${vaultUi.upBusy ? `<p class="callout" role="status">${esc(vaultUi.upBusy)}</p>` : ''}
    ${vaultUi.upMsg ? `<p class="callout" role="status">${esc(vaultUi.upMsg)}</p>` : ''}
    <label class="btn btn--primary filebtn" for="vault-up"${vaultUi.upBusy ? ' aria-disabled="true"' : ''}>${icon('copy')}添加照片或 PDF<input id="vault-up" type="file" accept="image/*,application/pdf" multiple data-vault-upload hidden${vaultUi.upBusy ? ' disabled' : ''}></label>
    <p class="note">文件先在这台手机上用证件包密码加密，再传到服务器；服务器上只有密文，文件名也看不到。单个最多 10MB。传上来的会自动存一份在手机里，没网也能打开。</p>
  </section>`;
}

// 附件转成可以打开的地址（只在解锁后生成）
export function vaultFileUrl(i) {
  if (vaultUi.urls[i]) return vaultUi.urls[i];
  const f = vaultUi.data.files[i];
  const bytes = Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0));
  vaultUi.urls[i] = URL.createObjectURL(new Blob([bytes], { type: f.type }));
  return vaultUi.urls[i];
}

const when = (t) => new Date(t).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export function renderVault() {
  const cached = cachedVault();
  if (!vaultUi.data) {
    return `
    <div class="pagehead"><h1>证件和订单</h1><p>护照号、机票订单号和票号、酒店确认号、入境用行程单都在这里。输入查询密码才能看。</p></div>
    <section class="card vault">
      <form class="form" data-form="vault" autocomplete="off">
        <label class="field" for="vault-pin"><span>查询密码</span>
          <input id="vault-pin" name="pin" type="password" inputmode="numeric" autocomplete="off" required placeholder="6 位数字"></label>
        <button class="btn btn--primary" type="submit"${vaultUi.busy ? ' disabled' : ''}>${vaultUi.busy ? '正在打开…' : `${icon('check')}打开`}</button>
      </form>
      ${vaultUi.err ? `<p class="alert alert--warn" role="alert"><b>没打开</b>${esc(vaultUi.err)}</p>` : ''}
      <p class="note">${cached ? `这台手机上存着 ${when(cached.at)} 的加密副本，没网也能打开。` : '第一次要联网打开；之后这台手机会存一份加密副本，没网也能看。'}内容在服务器和手机上都是加密的，只有输对密码才解得开。连续输错会被锁一段时间。</p>
    </section>`;
  }
  const d = vaultUi.data;
  return `
  <div class="pagehead"><h1>证件和订单</h1><p>已打开（${vaultUi.from === 'cache' ? '本机副本' : '最新版本'}，生成于 ${when(d.builtAt)}）。点号码旁边的按钮复制。用完点“锁上”。</p></div>
  <div class="btn-row"><button type="button" class="btn btn--secondary" data-action="vault-lock">${icon('close')}锁上</button></div>
  ${d.sections.map((s) => `<section class="card">
    <div class="card__h"><h2>${esc(s.title)}</h2></div>
    <ul class="vlist">${s.rows.map((r) => `<li class="vrow">
      <span class="vrow__main"><small>${esc(r.label)}</small><b class="mono">${esc(r.value)}</b>${r.note ? `<small>${esc(r.note)}</small>` : ''}</span>
      <button type="button" class="btn btn--secondary btn--sm" data-action="copy" data-text="${esc(r.value)}">${icon('copy')}<span>复制</span></button>
    </li>`).join('')}</ul>
  </section>`).join('')}
  ${d.files.length ? `<section class="card">
    <div class="card__h"><h2>附件</h2><span class="meta">${d.files.length} 个</span></div>
    <ul class="vlist">${d.files.map((f, i) => `<li class="vrow">
      <span class="vrow__main"><b>${esc(f.name)}</b><small>${f.type === 'application/pdf' ? 'PDF' : '图片'} · ${Math.round(f.b64.length * 0.75 / 1024)}KB</small></span>
      <button type="button" class="btn btn--primary btn--sm" data-action="vault-file" data-i="${i}">打开</button>
    </li>`).join('')}</ul>
    <p class="note">入境时打开行程单 PDF 给边检看；也可以“分享 → 存储到文件”留一份在手机里。</p>
  </section>` : ''}
  ${uploadsHtml()}`;
}

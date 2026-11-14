// 证件和订单（需密码）：护照号、PNR、票号、酒店确认号、行程单 PDF。
// 解锁后的明文只放在内存里，关掉页面或点“锁上”就没了；本机只存密文。
import { esc, icon } from '../lib/dom.js';
import { cachedVault } from '../lib/vault.js';

export const vaultUi = { data: null, err: '', busy: false, from: '', at: 0, urls: {} };

export function lockVault() {
  Object.values(vaultUi.urls).forEach((u) => URL.revokeObjectURL(u));
  Object.assign(vaultUi, { data: null, err: '', busy: false, from: '', at: 0, urls: {} });
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
  </section>` : ''}`;
}

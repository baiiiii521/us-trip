// 订单夹：每张票、每间房、每个预约一个格子。确认号和备注会参与两人同步；截图和 PDF 只存在本机。
import { esc, icon, vendorLinks } from '../lib/dom.js';
import { walletSlots, WALLET_GROUPS } from '../data/bookings.js';
import { walletOf } from '../state.js';
import { files } from '../lib/storage.js';

// 附件索引缓存：{ slotId: [{ id, name, type }] }
export const walletFiles = { map: {}, loaded: false };

export async function loadWalletFiles() {
  const all = await files.byKind('wallet');
  const map = {};
  for (const f of all) (map[f.slot] = map[f.slot] || []).push({ id: f.id, name: f.name, type: f.type });
  walletFiles.map = map; walletFiles.loaded = true;
}

export function walletProgress(state) {
  const slots = walletSlots(state);
  const filled = slots.filter((s) => { const w = walletOf(state, s.id); return (w && (w.code || w.note)) || (walletFiles.map[s.id] || []).length; }).length;
  return { filled, total: slots.length };
}

export function slotChip(state, id) {
  const w = walletOf(state, id);
  const n = (walletFiles.map[id] || []).length;
  const has = (w && w.code) || n;
  return `<a class="wchip${has ? ' is-on' : ''}" href="#order-${esc(id)}">${icon(has ? 'check' : 'ticket')}${has ? `订单 ${esc((w && w.code) || n + ' 个附件')}` : '存订单号'}</a>`;
}

export function renderWallet(state) {
  const slots = walletSlots(state);
  const { filled, total } = walletProgress(state);
  const groups = Object.entries(WALLET_GROUPS).map(([g, label]) => {
    const rows = slots.filter((s) => s.group === g);
    if (!rows.length) return '';
    return `<section class="card wgroup"><div class="card__h"><h2>${esc(label)}</h2></div><ul class="wlist">${rows.map((s) => {
      const w = walletOf(state, s.id); const n = (walletFiles.map[s.id] || []).length;
      const has = (w && (w.code || w.note)) || n;
      return `<li><a class="wrow m-card" href="#order-${esc(s.id)}">
        <span class="wrow__md mono">${esc(s.md || '出发前')}</span>
        <span class="wrow__main"><b>${esc(s.title)}</b><small>${has ? esc([w && w.code, w && w.note, n ? `${n} 个附件` : ''].filter(Boolean).join('　')) : esc(s.hint)}</small></span>
        <span class="wrow__st${has ? ' is-on' : ''}">${has ? icon('check') : '待填'}</span></a></li>`;
    }).join('')}</ul></section>`;
  }).join('');
  return `
  <div class="pagehead"><h1>订单夹</h1><p>把确认号、座位和截图按天放好，检票、入住时直接打开，没网也能看。截图和 PDF 只存在这台手机上；确认号和备注可以用“两人同步”发给同伴。</p></div>
  <div class="progress"><div class="progress__bar"><span style="width:${total ? Math.round(filled / total * 100) : 0}%"></span></div><span class="meta">已填 ${filled} / ${total}</span></div>
  ${groups}`;
}

// 编辑某个格子的弹层
export function slotSheetHtml(state, id) {
  const s = walletSlots(state).find((x) => x.id === id);
  if (!s) return '<div class="sheet__body"><p>这个订单格子在当前方案里不存在。</p></div>';
  const w = walletOf(state, id) || {};
  const list = walletFiles.map[id] || [];
  return `<div class="sheet__body">
    <div class="sheet__eyebrow"><span class="tag">${esc(WALLET_GROUPS[s.group])}</span><span class="meta">${esc(s.md || '出发前')}</span></div>
    <h2 class="sheet__title" id="sheet-title">${esc(s.title)}</h2>
    <form class="form" data-form="slot" data-id="${esc(id)}">
      <label class="field" for="slot-code"><span>确认号 / 订单号</span><input id="slot-code" name="code" autocomplete="off" value="${esc(w.code || '')}" placeholder="例如 6AB7C2"></label>
      <label class="field" for="slot-note"><span>备注</span><textarea id="slot-note" name="note" rows="3" placeholder="${esc(s.hint)}">${esc(w.note || '')}</textarea></label>
      <div class="btn-row"><button class="btn btn--primary" type="submit">${icon('check')}保存</button>
      ${w.code ? `<button class="btn btn--secondary" type="button" data-action="bigcard" data-en="${esc(w.code)}" data-zh="${esc(s.title)}">放大给工作人员看</button>` : ''}</div>
    </form>
    <div class="buys"><span class="buys__label">截图和 PDF（只存在本机）</span>
      <div class="files" id="slot-files">${list.map((f) => `<div class="file" data-file="${esc(f.id)}"><span class="file__thumb" data-thumb="${esc(f.id)}">${f.type === 'application/pdf' ? 'PDF' : ''}</span><span class="file__name">${esc(f.name)}</span>
        <button type="button" class="linkbtn" data-action="file-open" data-id="${esc(f.id)}">打开</button><button type="button" class="linkbtn" data-action="file-del" data-id="${esc(f.id)}" data-slot="${esc(id)}">删除</button></div>`).join('') || '<p class="meta">还没有附件</p>'}</div>
      <label class="btn btn--secondary filebtn" for="slot-add">${icon('copy')}添加截图或 PDF<input id="slot-add" type="file" accept="image/*,application/pdf" multiple data-slot-files="${esc(id)}" hidden></label>
    </div>
    ${s.vendors ? `<div class="buys"><span class="buys__label">官网</span><div class="buys__list">${vendorLinks(s.vendors)}</div></div>` : ''}
  </div>`;
}

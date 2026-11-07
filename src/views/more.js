// 更多：订单夹、英文大字卡、回忆、资料的入口，加上提醒、离线、两人同步和景点打卡进度
import { esc, icon, arrow } from '../lib/dom.js';
import { POIS } from '../data/pois.js';
import { CHECKLIST } from '../data/content.js';
import { isDone, visitOf } from '../state.js';
import { walletProgress } from './wallet.js';
import { pwaStatus } from '../lib/pwa.js';
import { notifySupported, notifyPermission } from '../lib/notify.js';
import { liveExpenses } from '../lib/money.js';

export const moreUi = { share: '', msg: '', busy: '', warm: 0, photoCount: 0 };

function entry(href, title, sub, ic) {
  return `<a class="mrow m-card" href="${href}"><span class="mrow__ic">${icon(ic)}</span><span class="mrow__main"><b>${esc(title)}</b><small>${esc(sub)}</small></span>${arrow}</a>`;
}

export function renderMore(state) {
  const wp = walletProgress(state);
  const done = CHECKLIST.filter((t) => isDone(state, t.id)).length;
  const been = POIS.filter((p) => visitOf(state, p.id) === 'been').length;
  const want = POIS.filter((p) => visitOf(state, p.id) === 'want').length;
  const pwa = pwaStatus();
  const perm = notifyPermission();
  const l = state.local;
  const spent = liveExpenses(state.expenses).length;
  return `
  <div class="pagehead"><h1>更多</h1><p>订单、大字卡、回忆都在这里。数据只存在你的手机里，两人用同步码或云同步合并。</p></div>

  <section class="card">
    <div class="mlist">
      ${entry('#wallet', '订单夹', `确认号、座位、截图，已填 ${wp.filled}/${wp.total}`, 'ticket')}
      ${entry('#cards', '英文大字卡', '给司机、前台、服务员看的地址和句子', 'bus')}
      ${entry('#memories', '回忆', '导入照片，按天整理，生成回忆视频和每日分享卡', 'sun')}
      ${entry('#info', '资料', `预订清单 ${done}/${CHECKLIST.length}、实用提示、来源`, 'info')}
    </div>
  </section>

  <section class="card">
    <div class="card__h"><h2>入境用行程单</h2><span class="meta">英文 · A4 两页</span></div>
    <p class="note">给边检看的英文行程单：旅客证件、进出境航班、酒店地址和逐日安排，都在两页里。出发前一周再生成一次，把最新的酒店和航班带上。</p>
    <div class="btn-row"><a class="btn btn--secondary" href="US-Itinerary-2026-12.pdf" target="_blank" rel="noopener">打开 PDF</a></div>
  </section>

  <section class="card">
    <div class="card__h"><h2>景点打卡</h2><span class="meta">去过 ${been} · 想去 ${want} · 共 ${POIS.length}</span></div>
    <div class="progress"><div class="progress__bar"><span style="width:${Math.round(been / POIS.length * 100)}%"></span></div></div>
    <p class="note">在景点详情里点“去过”或“想去”。想去的会在景点图鉴里单独筛出来。<a class="link" href="#guide" data-action="guide-filter" data-key="visit" data-value="want">看想去的</a></p>
  </section>

  <section class="card">
    <div class="card__h"><h2>出发提醒</h2></div>
    <p class="note">每次城际交通和球赛开始前 60 分钟、15 分钟各提醒一次。浏览器的限制：需要页面开着，或者已加到主屏幕。iPhone 必须先“添加到主屏幕”。</p>
    ${notifySupported()
      ? `<div class="btn-row"><button type="button" class="btn ${l.remind && perm === 'granted' ? 'btn--secondary' : 'btn--primary'}" data-action="remind-toggle">${l.remind && perm === 'granted' ? '已开启，点这里关闭' : '开启提醒'}</button>${perm === 'denied' ? '<span class="meta">浏览器已拒绝通知，请在系统设置里允许</span>' : ''}</div>`
      : '<p class="meta">这个浏览器不支持通知。</p>'}
  </section>

  <section class="card">
    <div class="card__h"><h2>离线使用</h2><span class="meta">${pwa.ready ? '已可离线' : pwa.supported ? '第一次打开后自动可用' : '当前环境不支持'}</span></div>
    <p class="note">在有网络时打开一次，之后没有信号也能看行程、订单夹和大字卡。出发前在 Wi-Fi 下点“下载景点照片”，照片也能离线看。</p>
    <div class="btn-row">
      <button type="button" class="btn btn--secondary" data-action="warm-photos"${moreUi.busy === 'warm' ? ' disabled' : ''}>${moreUi.busy === 'warm' ? `下载中 ${Math.round(moreUi.warm * 100)}%` : '下载景点照片'}</button>
      ${pwa.canInstall ? '<button type="button" class="btn btn--primary" data-action="install">添加到主屏幕</button>' : pwa.standalone ? '<span class="meta">已从主屏幕打开</span>' : '<span class="meta">iPhone：Safari 分享按钮 → 添加到主屏幕</span>'}
    </div>
  </section>

  <section class="card" id="sync">
    <div class="card__h"><h2>两人同步</h2><span class="meta">${l.lastSync ? '上次同步 ' + new Date(l.lastSync).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '还没同步过'}</span></div>
    <p class="note">同步的内容：清单、打卡、记账、订单号和备注、酒店地址、座位、名字。截图和照片不同步。每条记录取最新修改的那份，所以两个人可以同时记。</p>
    <h3 class="xdate">方式一：同步码（不需要服务器）</h3>
    <div class="btn-row"><button type="button" class="btn btn--secondary" data-action="share-make">生成我的同步码</button><button type="button" class="btn btn--secondary" data-action="share-copy"${moreUi.share ? '' : ' disabled'}>${icon('copy')}复制</button></div>
    <label class="field" for="share-code"><span>同步码（生成后复制发给同伴；收到同伴的粘贴在这里再点导入）</span><textarea id="share-code" rows="3" data-share-box placeholder="HOOPS1.…">${esc(moreUi.share)}</textarea></label>
    <div class="btn-row"><button type="button" class="btn btn--primary" data-action="share-import">导入并合并</button></div>
    <h3 class="xdate">方式二：云同步（需要部署时接 Vercel KV）</h3>
    <form class="form form--inline" data-form="cloud">
      <label class="field" for="sync-room"><span>房间名</span><input id="sync-room" name="room" value="${esc(l.syncRoom)}" autocomplete="off" placeholder="两人约定一个，例如 hoops-1218"></label>
      <label class="field" for="sync-pass"><span>口令</span><input id="sync-pass" name="pass" type="password" value="${esc(l.syncPass)}" autocomplete="off" placeholder="只存在本机，用来加密"></label>
      <button class="btn btn--primary" type="submit"${moreUi.busy === 'cloud' ? ' disabled' : ''}>${moreUi.busy === 'cloud' ? '同步中…' : '立即同步'}</button>
    </form>
    <p class="note">数据在你的手机里先用口令加密，服务器只存密文，看不到内容。房间名和口令两个人填一样的。已记 ${spent} 笔账。</p>
    ${moreUi.msg ? `<p class="callout" role="status">${esc(moreUi.msg)}</p>` : ''}
  </section>

  <section class="card">
    <div class="card__h"><h2>预览模式</h2></div>
    <p class="note">想提前看看“今天”页面长什么样？选一个行程里的日期，再选时间。清空就回到真实时间。</p>
    <form class="form form--inline" data-form="preview">
      <label class="field" for="prev-at"><span>假装现在是</span><input id="prev-at" type="datetime-local" name="at" value="${esc(l.preview || '')}" min="2026-12-18T00:00" max="2026-12-31T23:59"></label>
      <button class="btn btn--secondary" type="submit">应用</button>
      <button class="btn btn--secondary" type="button" data-action="preview-clear">清空</button>
    </form>
  </section>`;
}

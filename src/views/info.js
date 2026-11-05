// 资料：预订清单 / 实用提示 / 审计发现 / 来源
import { esc, icon, ext, vendorLinks } from '../lib/dom.js';
import { CHECKLIST, TIPS, AUDIT, SOURCES } from '../data/content.js';
import { gameLinks } from '../data/games.js';

export const infoUi = { tab: 'todo' };

const TABS = [['todo', '预订清单'], ['tips', '实用提示'], ['audit', '审计发现'], ['sources', '来源']];

function todoHtml(state) {
  const done = CHECKLIST.filter((t) => state.todo[t.id]).length;
  return `<p class="note">${done}/${CHECKLIST.length} 已完成。按截止时间排。</p>
  <ul class="todo">${CHECKLIST.map((t) => {
    const on = !!state.todo[t.id];
    const links = vendorLinks(t.buy || []) + (t.game ? gameLinks(t.game).slice(0, 2).map((l) => ext(l.label, l.url)).join('') : '');
    return `<li class="todo__i${on ? ' is-done' : ''}">
      <button type="button" class="todo__ck" data-action="todo" data-id="${t.id}" aria-pressed="${on}" aria-label="${on ? '标记为未完成' : '标记为完成'}">${on ? icon('check') : ''}</button>
      <span class="todo__when">${esc(t.when)}</span>
      <div class="todo__what"><span>${esc(t.text)}</span>${links ? `<div class="buys__list">${links}</div>` : ''}</div>
    </li>`;
  }).join('')}</ul>`;
}

function tipsHtml() {
  return `<div class="tipgrid">${TIPS.map((g) => `<section class="card tip"><h3><span class="pill pill--${g.tone}">${esc(g.group)}</span></h3>
    <ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul><p class="tip__src">来源：${esc(g.src)}</p></section>`).join('')}</div>`;
}

function auditHtml() {
  const lab = { crit: '必须改', warn: '建议改', ok: '没问题' };
  return `<p class="note">对照原攻略页面文本和 11/5 实查信息。红色会让行程落空，橙色会多花钱或出错，绿色是原版做对的地方。</p>
  <ul class="audit">${AUDIT.map((a) => `<li class="audit__item audit--${a.level}"><span class="pill pill--${a.level}">${lab[a.level]}</span><b>${esc(a.title)}</b><span>${esc(a.what)}</span><span class="audit__fix">处理：${esc(a.fix)}</span></li>`).join('')}</ul>`;
}

function sourcesHtml() {
  return `<ul class="sources">${SOURCES.map(([l, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}</a></li>`).join('')}</ul>
  <p class="note">景点照片在浏览器里从维基百科读取，作者和许可证写在每个景点详情的图片下方。</p>`;
}

export function renderInfo(state) {
  const body = { todo: () => todoHtml(state), tips: tipsHtml, audit: auditHtml, sources: sourcesHtml }[infoUi.tab]();
  return `
  <div class="pagehead"><h1>资料</h1></div>
  <div class="subtabs" role="tablist">${TABS.map(([k, l]) => `<button type="button" role="tab" aria-selected="${infoUi.tab === k}" class="subtab${infoUi.tab === k ? ' is-on' : ''}" data-action="info-tab" data-tab="${k}">${esc(l)}</button>`).join('')}</div>
  <div class="subbody">${body}</div>`;
}

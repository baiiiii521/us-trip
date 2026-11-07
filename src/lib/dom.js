// 小工具：转义、金额格式、图标、链接按钮
import { VENDORS } from '../data/vendors.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
export const cny = (n) => '¥' + Math.round(n).toLocaleString('en-US');

const P = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  days: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  guide: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="16.5" cy="15" r="1.3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  nav: '<path d="M3 11 21 3l-8 18-2-8z"/>',
  train: '<rect x="6" y="3" width="12" height="13" rx="3"/><path d="M6 10h12M9 20l-2 2M15 20l2 2M8.5 16l-1.5 4h10l-1.5-4"/><circle cx="9" cy="13" r=".8"/><circle cx="15" cy="13" r=".8"/>',
  bus: '<rect x="4" y="3" width="16" height="15" rx="2"/><path d="M4 10h16M7 18v3M17 18v3"/><circle cx="8" cy="14" r=".9"/><circle cx="16" cy="14" r=".9"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6c3 2.6 4.4 4.7 4.4 6.4s-1.4 3.8-4.4 6.4M18.4 5.6c-3 2.6-4.4 4.7-4.4 6.4s1.4 3.8 4.4 6.4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  bed: '<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-8v5"/><circle cx="7" cy="11" r="1.6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  plane: '<path d="M12 3c1.1 0 1.7.9 1.7 2v4.2l6.8 4v2l-6.8-2.2v4.4l2.6 1.8v1.6L12 19.5 7.7 20.8v-1.6l2.6-1.8v-4.4L3.5 15.2v-2l6.8-4V5c0-1.1.6-2 1.7-2z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>'
};

export function icon(name, cls = '') {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}

// 外部订票链接。recommended 时在名字前加“推荐”小字，不另换颜色或样式
export function ext(label, url, recommended = false) {
  return `<a class="buy" href="${esc(url)}" target="_blank" rel="noopener">${recommended ? '<span class="buy__rec">推荐</span>' : ''}${esc(label)}</a>`;
}

export function vendorLinks(keys = []) {
  return keys.filter((k) => VENDORS[k]).map((k) => ext(VENDORS[k].label, VENDORS[k].url)).join('');
}

// 往右的小箭头：悬停时右移 3px
export const arrow = '<svg class="m-arrow ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

// 品牌标：一个篮球
export const brandMark = '<svg class="brand__mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="var(--accent)"/><g fill="none" stroke="var(--card)" stroke-width="3"><path d="M4 32h56M32 4v56"/><path d="M13 12c8 6 12 13 12 20s-4 14-12 20M51 12c-8 6-12 13-12 20s4 14 12 20"/></g></svg>';

export function buyRow(label, html) {
  if (!html) return '';
  return `<div class="buys"><span class="buys__label">${esc(label)}</span><div class="buys__list">${html}</div></div>`;
}

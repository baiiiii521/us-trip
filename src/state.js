// 全局状态：方案选择、预算输入、清单勾选。保存在本机浏览器 localStorage。
import { detectMode } from './lib/calc.js';

const KEY = 'hoops-trip-v3';

export const DEFAULTS = {
  mode: 'mix',
  plan: 'A',
  hotel: 'penn',
  nav: 'google',
  choice: { s1: 'train', s2: 'train', s3: 'bus', s4: 'bus' },
  budget: { flights: 0, rate: 6.8, bos: 210, dc: 190, phl: 180, penn: 320, lic: 230, food: 65 },
  opts: { ewr: false, summit: false, ins: false },
  todo: {}
};

function clone(o) { return JSON.parse(JSON.stringify(o)); }

function load() {
  const s = clone(DEFAULTS);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return s;
    const o = JSON.parse(raw);
    for (const k of ['mode', 'plan', 'hotel', 'nav']) if (typeof o[k] === 'string') s[k] = o[k];
    for (const k of ['choice', 'budget', 'opts', 'todo']) if (o[k] && typeof o[k] === 'object') Object.assign(s[k], o[k]);
  } catch (e) { /* 隐私模式或数据损坏时用默认值 */ }
  return s;
}

let state = load();
const subs = new Set();

export function getState() { return state; }

// update(draft => { draft.plan = 'C' }, { silent: true })
export function update(fn, { silent = false } = {}) {
  const draft = clone(state);
  fn(draft);
  draft.mode = detectMode(draft.choice);
  state = draft;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 忽略 */ }
  if (!silent) subs.forEach((f) => f(state));
  return state;
}

export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }

export function resetState() {
  state = clone(DEFAULTS);
  try { localStorage.removeItem(KEY); } catch (e) { /* 忽略 */ }
  subs.forEach((f) => f(state));
}

// 全局状态，保存在本机浏览器 localStorage。
// - 方案设置：交通方式、12/20 方案、纽约住宿、导航 App、预算输入
// - 可同步数据（两人同步时合并）：每条记录带更新时间 u，删除也留一条 { del: true, u }
//     todo 清单勾选、visited 景点打卡、expenses 记账、wallet 订单夹文字、hotels 酒店地址、seats 球赛座位、people 两人名字
// - 本机设置：提醒、预览日期、云同步房间（口令只存本机）
// 照片和订单附件存在 IndexedDB（lib/storage.js），不在这里。
import { detectMode } from './lib/calc.js';

const KEY = 'hoops-trip-v3';

export const DEFAULTS = {
  mode: 'mix',
  plan: 'C',
  hotel: 'apt',
  nav: 'google',
  choice: { s1: 'train', s2: 'train', s3: 'bus', s4: 'bus' },
  // 机票 ¥12,200（去程 6,000 + 返程 6,200）÷ 6.8；酒店按已订订单的每晚实价
  budget: { flights: 1794, rate: 6.8, bos: 108, dc: 86, phl: 109, apt: 90, food: 65 },
  opts: { ewr: false, summit: false, ins: false },
  todo: {},
  visited: {},
  expenses: {},
  wallet: {},
  hotels: {},
  seats: {},
  people: {},
  local: { remind: false, preview: '', syncRoom: '', syncPass: '', lastSync: 0 }
};

const SETTING_KEYS = ['mode', 'plan', 'hotel', 'nav', 'choice', 'budget', 'opts'];
const DATA_KEYS = ['todo', 'visited', 'expenses', 'wallet', 'hotels', 'seats', 'people', 'local'];

function clone(o) { return JSON.parse(JSON.stringify(o)); }

// 旧版清单是 { t1: true }，改成 { t1: { v: true, u: 0 } }
export function migrate(o) {
  if (!o) return o;
  if (o.todo) {
    for (const [k, v] of Object.entries(o.todo)) if (typeof v === 'boolean') o.todo[k] = { v, u: 0 };
  }
  // 2026-11-05：12/20 只保留方案 C，纽约只保留已订公寓；老存档里的 A/B 和替代酒店一起归位
  o.plan = 'C';
  o.hotel = 'apt';
  if (o.choice && o.choice.s2 !== 'train' && o.choice.s2 !== 'bus') o.choice.s2 = 'train';
  if (o.budget) {
    delete o.budget.penn;
    delete o.budget.lic;
    if (!o.budget.flights) o.budget.flights = 1794;
    if (!o.budget.apt) o.budget.apt = 90;
  }
  return o;
}

function load() {
  const s = clone(DEFAULTS);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return s;
    const o = migrate(JSON.parse(raw));
    for (const k of ['mode', 'plan', 'hotel', 'nav']) if (typeof o[k] === 'string') s[k] = o[k];
    for (const k of ['choice', 'budget', 'opts', ...DATA_KEYS]) if (o[k] && typeof o[k] === 'object') Object.assign(s[k], o[k]);
  } catch (e) { /* 隐私模式或数据损坏时用默认值 */ }
  return s;
}

let state = load();
const subs = new Set();

export function getState() { return state; }

export const now = () => Date.now();

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

// 只恢复方案设置，不动清单、记账、订单这些数据
export function resetState() {
  update((s) => { for (const k of SETTING_KEYS) s[k] = clone(DEFAULTS[k]); });
}

// —— 小工具 ——
export const isDone = (s, id) => !!(s.todo[id] && s.todo[id].v);
export const visitOf = (s, id) => (s.visited[id] && s.visited[id].v) || '';
export const personName = (s, p) => (s.people[p] && s.people[p].v) || (p === 'a' ? '我' : '同伴');
export const hotelOf = (s, city) => (s.hotels[city] && !s.hotels[city].del ? s.hotels[city] : null);
export const seatOf = (s, game) => (s.seats[game] && s.seats[game].v) || '';
export const walletOf = (s, id) => (s.wallet[id] && !s.wallet[id].del ? s.wallet[id] : null);

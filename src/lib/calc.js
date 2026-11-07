// 纯函数：交通和预算计算。不碰 DOM，方便测试（tests/calc.test.js）
import { LEGS, LEG_IDS, legOption } from '../data/legs.js';
import { GAMES } from '../data/games.js';
import { TRIP } from '../data/trip.js';

export const MODE_LABEL = { train: '全火车', mix: '推荐混合', bus: '全大巴', custom: '自选组合' };

export function choiceFor(state, id) {
  return state.choice[id];
}

export function choicesForMode(mode) {
  return Object.fromEntries(LEG_IDS.map((id) => [id, mode === 'mix' ? LEGS[id].rec : mode]));
}

export function detectMode(choice) {
  const vals = LEG_IDS.map((id) => choice[id]);
  if (vals.every((v) => v === 'train')) return 'train';
  if (vals.every((v) => v === 'bus')) return 'bus';
  if (LEG_IDS.every((id) => choice[id] === LEGS[id].rec)) return 'mix';
  return 'custom';
}

// 两人城际交通费；mode 不传时按当前选择
export function transportCost(state, mode) {
  let perPerson = 0;
  for (const id of LEG_IDS) {
    const kind = mode ? (mode === 'mix' ? LEGS[id].rec : mode) : choiceFor(state, id);
    perPerson += legOption(id, kind).p;
  }
  return perPerson * TRIP.people;
}

const n = (v) => (Number.isFinite(+v) ? +v : 0);

// 预算明细。kind: real 实查 / est 估算 / in 你填；group 用于占比条
export function budgetRows(state) {
  const b = state.budget;
  const o = state.opts;
  const people = TRIP.people;
  const bosNights = 3; // 波士顿酒店订到 12/21（3 晚）
  // 纽约已订公寓 12/24–12/31 七晚；只有勾了 12/30 机场酒店才是 6 晚 + 机场 1 晚
  // 纽约只保留已订的 DKLB BKLN 公寓
  const nycLabel = 'DKLB BKLN 公寓';
  const nycNightly = n(b.apt);
  const nycNights = o.ewr ? 6 : 7;
  const rows = [
    { group: 'flight', label: '机票（两人）', amount: n(b.flights), kind: 'in' },
    { group: 'transport', label: '城际交通 4 段（' + MODE_LABEL[state.mode] + '）', amount: transportCost(state), kind: 'est' },
    { group: 'hotel', label: `波士顿 ${bosNights} 晚`, amount: n(b.bos) * bosNights, kind: 'est' },
    { group: 'hotel', label: '华盛顿 2 晚', amount: n(b.dc) * 2, kind: 'est' },
    { group: 'hotel', label: '费城 1 晚', amount: n(b.phl), kind: 'est' },
    { group: 'hotel', label: `纽约 ${nycNights} 晚（${nycLabel}）`, amount: nycNightly * nycNights, kind: 'est' }
  ];
  if (o.ewr) rows.push({ group: 'hotel', label: '纽瓦克机场酒店 1 晚', amount: 170, kind: 'est' });
  rows.push({ group: 'games', label: '球票 奇才 + 76人 + 篮网（两人含费）', amount: GAMES.was.est + GAMES.phi.est + GAMES.bkn.est, kind: 'est' });
  rows.push({ group: 'games', label: '球票 凯尔特人（两人）', amount: GAMES.bos.est, kind: 'est' });
  rows.push({ group: 'local', label: '市内交通（地铁、机场轨道、渡轮）', amount: 210, kind: 'est' });
  rows.push({ group: 'tickets', label: '大都会 $30×2 + 独立厅预约费', amount: 62, kind: 'real' });
  if (o.summit) rows.push({ group: 'tickets', label: 'Summit 观景台', amount: 45 * people, kind: 'est' });
  rows.push({ group: 'food', label: `餐饮 $${n(b.food)}/人/天 × 14 天`, amount: n(b.food) * 14 * people, kind: 'in' });
  rows.push({ group: 'other', label: 'EVUS 登记 $31.75×2', amount: 64, kind: 'real' });
  rows.push({ group: 'other', label: 'eSIM 流量卡', amount: 50, kind: 'est' });
  if (o.ins) rows.push({ group: 'other', label: '旅行保险', amount: 60 * people, kind: 'est' });
  return rows;
}

export const GROUP_LABEL = {
  flight: '机票', transport: '城际交通', hotel: '住宿', games: '球票', local: '市内交通', tickets: '门票', food: '餐饮', other: '其他'
};

export function budgetTotal(state) {
  return budgetRows(state).reduce((sum, r) => sum + r.amount, 0);
}

export function budgetByGroup(state) {
  const out = {};
  for (const r of budgetRows(state)) out[r.group] = (out[r.group] || 0) + r.amount;
  return out;
}

// 出发倒计时 / 行程第几天
export function tripPhase(now = new Date()) {
  const [y, m, d] = TRIP.start.split('-').map(Number);
  const [y2, m2, d2] = TRIP.end.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y2, m2 - 1, d2);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = 86400000;
  if (today < start) return { phase: 'before', days: Math.round((start - today) / day) };
  if (today > end) return { phase: 'after', days: 0 };
  const idx = Math.round((today - start) / day);
  const id = String(m).padStart(2, '0') + String(d + idx).padStart(2, '0');
  return { phase: 'during', index: idx, id: id.slice(0, 2) === '12' ? id : null };
}

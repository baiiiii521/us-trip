// ⚠️ 生成文件，不要手改。源头：src/lib/calc.js
// 由 scripts/mp-sync-shared.mjs 生成；改内容请改 src/ 下那份，然后跑 node scripts/mp-sync-shared.mjs
// 纯函数：交通和预算计算。不碰 DOM，方便测试（tests/calc.test.js）
import { LEGS, LEG_IDS, legOption } from '../data/legs.js';
import { GAMES } from '../data/games.js';
import { TRIP } from '../data/trip.js';
import { RENT_PLANS, DRIVES, PARKING, GAS, TOLL_PROGRAM_FEE, RETURN_MI, isDriveLeg } from '../data/drive.js';

export const MODE_LABEL = { train: '全火车', mix: '推荐混合', bus: '全大巴', custom: '自选组合' };
export const KIND_LABEL = { train: '火车', bus: '大巴', car: '自驾', flight: '飞机' };

// 某段实际怎么走：租车期间的段一律是 car，其余按火车/大巴的选择
export function choiceFor(state, id) {
  return isDriveLeg(state, id) ? 'car' : state.choice[id];
}

// 交通方式的一句话标签（顶栏、总览、预算里用）
export function transportLabel(state) {
  if (state.rent === 'jfk') return '全程自驾';
  if (state.rent === 'bos') return '12/18 ' + KIND_LABEL[state.choice.s1] + ' + 自驾';
  return MODE_LABEL[state.mode];
}

// 自驾花费（两人一车）：租车、异地还车、油费、过路费、停车
export function carCost(state, rent = state.rent) {
  const plan = RENT_PLANS[rent] || RENT_PLANS.none;
  if (!plan.legs.length) return { days: 0, rental: 0, oneWay: 0, miles: 0, fuel: 0, tolls: 0, parking: 0, parkNights: {}, total: 0 };
  const b = state.budget;
  const miles = plan.legs.reduce((s, id) => s + DRIVES[id].mi, 0) + RETURN_MI;
  const fuel = Math.round(miles / GAS.mpg * GAS.usdPerGal);
  const tolls = plan.legs.reduce((s, id) => s + DRIVES[id].toll, 0) + TOLL_PROGRAM_FEE;
  // 租车期间要过夜停车的城市：jfk 方案波士顿 3 晚；两种方案都有华盛顿 2 晚、费城 1 晚
  const parkNights = { bos: rent === 'jfk' ? 3 : 0, dc: 2, phl: 1 };
  const parking = Object.entries(parkNights).reduce((s, [c, k]) => s + k * PARKING[c].nightly, 0);
  // JFK 6 天已订：¥4,300 含保险，按汇率换成美元；别的方案还没订，按每天估算
  const booked = rent === 'jfk' && n(b.carCny) > 0;
  const rental = booked ? Math.round(n(b.carCny) / (n(b.rate) || 6.8)) : plan.days * n(b.carDay);
  const oneWay = rent === 'bos' ? n(b.oneWay) : 0;
  return { days: plan.days, booked, rental, oneWay, miles, fuel, tolls, parking, parkNights, total: rental + oneWay + fuel + tolls + parking };
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

// 两人城际车票（只算火车/大巴）。mode 给定时按全火车/混合/全大巴比较；不给时只算没开车的那几段
export function transportCost(state, mode) {
  let perPerson = 0;
  for (const id of LEG_IDS) {
    if (!mode && isDriveLeg(state, id)) continue;
    const kind = mode ? (mode === 'mix' ? LEGS[id].rec : mode) : state.choice[id];
    perPerson += legOption(id, kind).p;
  }
  return perPerson * TRIP.people;
}

// 三种租车方案的城际总花费（车票 + 自驾全部），用来比较
export function rentCompare(state) {
  return Object.keys(RENT_PLANS).map((rent) => {
    const s = { ...state, rent };
    const car = carCost(s, rent);
    const tickets = transportCost(s);
    return { rent, ...RENT_PLANS[rent], car, tickets, total: car.total + tickets };
  });
}

const n = (v) => (Number.isFinite(+v) ? +v : 0);

// 预算明细。kind: real 实查 / est 估算 / in 你填；group 用于占比条
export function budgetRows(state) {
  const b = state.budget;
  const o = state.opts;
  const people = TRIP.people;
  const bosNights = 3; // 波士顿酒店订到 12/21（3 晚）
  // 纽约已订公寓 12/24–12/31 七晚；只有勾了 12/30 机场酒店才是 6 晚 + 机场 1 晚
  const nycLabel = 'AVA Fort Greene 公寓';
  const nycNightly = n(b.apt);
  const nycNights = o.ewr ? 6 : 7;
  const rows = [
    { group: 'flight', label: '机票（两人）', amount: n(b.flights), kind: 'in' },
    { group: 'hotel', label: `波士顿 ${bosNights} 晚`, amount: n(b.bos) * bosNights, kind: 'est' },
    { group: 'hotel', label: '华盛顿 2 晚', amount: n(b.dc) * 2, kind: 'est' },
    { group: 'hotel', label: '费城 1 晚', amount: n(b.phl), kind: 'est' },
    { group: 'hotel', label: `纽约 ${nycNights} 晚（${nycLabel}）`, amount: nycNightly * nycNights, kind: 'est' }
  ];
  if (o.ewr) rows.push({ group: 'hotel', label: '纽瓦克机场酒店 1 晚', amount: 170, kind: 'est' });
  const car = carCost(state);
  const ticketLegs = LEG_IDS.filter((id) => !isDriveLeg(state, id)).length;
  if (ticketLegs) rows.push({ group: 'transport', label: `城际车票 ${ticketLegs} 段（${ticketLegs === 4 ? MODE_LABEL[state.mode] : KIND_LABEL[state.choice.s1]}）`, amount: transportCost(state), kind: 'est' });
  if (car.days) {
    rows.push({ group: 'transport', label: car.booked ? `租车 ${car.days} 天（已订 ¥${n(b.carCny).toLocaleString('en-US')}，含保险）` : `租车 ${car.days} 天（$${n(b.carDay)}/天，含税费和保险）`, amount: car.rental, kind: car.booked ? 'real' : 'in' });
    if (car.oneWay) rows.push({ group: 'transport', label: '异地还车费（波士顿取、纽约还）', amount: car.oneWay, kind: 'est' });
    rows.push({ group: 'transport', label: `油费（约 ${car.miles} 英里）`, amount: car.fuel, kind: 'est' });
    rows.push({ group: 'transport', label: '过路费（含租车公司收费服务费）', amount: car.tolls, kind: 'est' });
    const where = Object.entries(car.parkNights).filter(([, v]) => v).map(([c, v]) => ({ bos: '波士顿', dc: '华盛顿', phl: '费城' })[c] + ' ' + v + ' 晚').join('、');
    rows.push({ group: 'local', label: `停车（${where}）`, amount: car.parking, kind: 'est' });
  }
  rows.push({ group: 'games', label: '球票 奇才 + 76人 + 篮网（两人含费）', amount: GAMES.was.est + GAMES.phi.est + GAMES.bkn.est, kind: 'est' });
  rows.push({ group: 'games', label: '球票 凯尔特人（两人）', amount: GAMES.bos.est, kind: 'est' });
  rows.push({ group: 'local', label: '市内交通（地铁、机场轨道、渡轮）', amount: state.rent === 'jfk' ? 180 : 210, kind: 'est' });
  rows.push({ group: 'tickets', label: '大都会 $30×2 + 独立厅预约费', amount: 62, kind: 'real' });
  if (o.summit) rows.push({ group: 'tickets', label: 'Summit 观景台', amount: 45 * people, kind: 'est' });
  rows.push({ group: 'food', label: `餐饮 $${n(b.food)}/人/天 × 14 天`, amount: n(b.food) * 14 * people, kind: 'in' });
  rows.push({ group: 'other', label: 'EVUS 登记 $31.75×2', amount: 64, kind: 'real' });
  rows.push({ group: 'other', label: 'eSIM 流量卡', amount: 50, kind: 'est' });
  if (o.ins) rows.push({ group: 'other', label: '旅行保险', amount: 60 * people, kind: 'est' });
  return rows;
}

export const GROUP_LABEL = {
  flight: '机票', transport: '城际交通和租车', hotel: '住宿', games: '球票', local: '市内交通和停车', tickets: '门票', food: '餐饮', other: '其他'
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

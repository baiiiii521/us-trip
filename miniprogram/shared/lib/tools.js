// ⚠️ 生成文件，不要手改。源头：src/lib/tools.js
// 由 scripts/mp-sync-shared.mjs 生成；改内容请改 src/ 下那份，然后跑 node scripts/mp-sync-shared.mjs
// 旅途小工具：结账（税 + 小费）、退房清单、车停在哪、开车前一晚提醒、今天花了多少。纯函数，可测试。
import { rentPlan, DRIVES } from '../data/drive.js';
import { LEGS } from '../data/legs.js';
import { liveExpenses, toUsd } from './money.js';
import { itemTime } from './today.js';

// 餐馆账单的税率（州 + 市，2026 年估算，账单上印的为准）。小费按税前金额算
export const TAX = {
  bos: { rate: 0.07, label: '波士顿 7%（餐饮税）' },
  dc: { rate: 0.10, label: '华盛顿 10%（餐饮税）' },
  phl: { rate: 0.08, label: '费城 8%' },
  nyc: { rate: 0.08875, label: '纽约 8.875%' },
  la: { rate: 0.1025, label: '洛杉矶一带约 10.25%' }
};
export const TIPS = [0, 15, 18, 20, 22];

// amount 账单金额；taxIncluded 时 amount 已含税（例如收据上的 Total）
export function billTotal({ amount, taxRate, tipPct, taxIncluded = false, people = 2 }) {
  const a = Math.max(0, Number(amount) || 0);
  const r = Math.max(0, Number(taxRate) || 0);
  const sub = taxIncluded ? a / (1 + r) : a;
  const tax = taxIncluded ? a - sub : sub * r;
  const tip = sub * (Math.max(0, Number(tipPct) || 0) / 100);
  const total = sub + tax + tip;
  return { sub: round2(sub), tax: round2(tax), tip: round2(tip), total: round2(total), each: round2(total / (people || 1)) };
}
const round2 = (n) => Math.round(n * 100) / 100;

// 退房清单：换住处的那天早上（有 from 的日子，12/18 落地那天除外；住机场酒店时 12/30 也要退房）
const OUT_BASE = [
  ['passport', '两本护照、钱包、信用卡'],
  ['charger', '手机充电器、充电宝、转换插头（床头和插座都看一眼）'],
  ['safe', '房间保险箱、抽屉、衣柜'],
  ['bath', '浴室：牙刷、剃须刀、护肤品'],
  ['fridge', '冰箱里的水和吃的'],
  ['key', '房卡还前台，要一张结账单（Folio）']
];
const OUT_CAR = [
  ['car', '行李全进后备箱，拉上遮物帘，车里看不到任何东西'],
  ['park', '停车票或代客泊车的取车单，停车费结清']
];
export function checkoutDay(day, state) {
  if (day.id === '1230') return !!(state.opts && state.opts.ewr);
  return !!day.from && day.id !== '1218';
}
export function checkoutItems(day, state) {
  if (!checkoutDay(day, state)) return [];
  const car = day.items.some((it) => (it.leg && rentPlan(state).legs.includes(it.leg)) || it.drive === 'pickup');
  return [...OUT_BASE, ...(car ? OUT_CAR : [])].map(([k, text]) => ({ id: `out-${day.id}-${k}`, text }));
}

// 车停在哪：租车期间，车过夜的城市。返回今天要用的城市（出发城市在前，用来取车）
const PARK_LEG = { bos: 's1', dc: 's2', phl: 's3' };
export function parkingCities(day, state) {
  const legs = rentPlan(state).legs;
  const has = (c) => PARK_LEG[c] && legs.includes(PARK_LEG[c]);
  // 例：JFK 方案 12/21 → ['bos', 'dc']（先去波士顿车库取车，晚上停进华盛顿）；bos 方案前几晚没有车，s1 不在 legs 里
  return [...new Set([day.from, day.city])].filter((c) => c && has(c));
}

// 开车前一晚 21:00 提醒看天气（落地那天除外：前一晚在飞机上）
export function driveEves(days, state, isCar) {
  const out = [];
  for (const d of days) {
    if (d.id === '1218') continue;
    for (const it of d.items) {
      if (!it.leg || !isCar(it.leg)) continue;
      const at = itemTime(d, '21:00');
      at.setDate(at.getDate() - 1);
      const dr = DRIVES[it.leg];
      out.push({ at, leg: it.leg, title: `明天开车：${LEGS[it.leg].route}`, body: `约 ${dr ? dr.mi : '?'} 英里，${it.t} 出发。现在看一眼天气：有冬季风暴预警（Winter Storm Warning）就推迟或改坐 Amtrak。油箱过半、手机充满。` });
    }
  }
  return out;
}

// 某天记了多少（美元）
export function daySpend(expenses, md, rate) {
  return liveExpenses(expenses).filter((e) => e.date === md).reduce((s, e) => s + toUsd(e, rate), 0);
}

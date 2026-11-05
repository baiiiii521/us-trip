// 城际 4 段：火车 / 大巴两个选项。p = 每人价格（美元）
// 火车价按原攻略“4 段两人 $536”拆分估算；大巴价来自 Omio / Wanderu / CheckMyBus 报价区间（2026-11-05）
export const LEGS = {
  s1: {
    date: '12/18', wd: '周五', from: 'nyc', to: 'bos', route: '纽约 JFK → 波士顿', rec: 'train',
    why: '推荐火车：落地后要过海关，时间不可控，买 Value 票可以免费改签。大巴最便宜，但周五下午出曼哈顿很堵，赶不上就作废。',
    train: { p: 79, t: 'Amtrak 东北区域列车', d: 'Penn Station（Moynihan 大厅候车）→ South Station，约 4h15。选落地后 4 小时以上的班次。', price: '估算', buy: ['amtrak'] },
    bus: { p: 35, t: 'FlixBus / Greyhound / Peter Pan', d: 'Port Authority 巴士总站或 W 31st St 路边站 → South Station 巴士总站，约 4.5–5.5h，$25–45。', price: '区间', buy: ['flix', 'grey', 'pp', 'wand'] },
    extra: { label: '机场进城', buy: ['lirr', 'airtrain'] }
  },
  s2: {
    date: '12/20', wd: '周日', from: 'bos', to: 'dc', route: '波士顿 → 华盛顿', rec: 'train', night: true,
    why: '推荐火车：同样过夜，火车座位宽、能走动、有洗手间和餐车，早上 06:54 到；大巴每人只省约 $30，要在座位上窝 11 小时。',
    train: { p: 99, t: 'Amtrak 67 次 · 18:45 → 次日 06:54', d: 'South Station 18:45 开（Back Bay 18:51），约 12h，只有座位没有卧铺。商务座更宽，值得比价。', price: '估算', buy: ['amtrak'] },
    bus: { p: 70, t: '过夜大巴 · Greyhound / FlixBus', d: 'Greyhound 19:35 → 06:50（约 $64）或 FlixBus 21:50 → 08:20（约 $77）。South Station 巴士总站 → Union Station 巴士层。', price: '区间', buy: ['grey', 'flix', 'wand'] }
  },
  s3: {
    date: '12/23', wd: '周三', from: 'dc', to: 'phl', route: '华盛顿 → 费城', rec: 'bus',
    why: '推荐大巴：只有 2–3 小时，价格是火车的一半，76人 19:30 才开球。坐 9–10 点的车，留足堵车缓冲。',
    train: { p: 45, t: 'Amtrak 东北区域列车', d: 'Union Station → 费城 30th Street 站，约 1h45。', price: '估算', buy: ['amtrak'] },
    bus: { p: 22, t: 'FlixBus / Peter Pan / Greyhound / Megabus', d: 'Union Station 巴士层 → 费城市中心（FlixBus 停 1001 Filbert St），约 2h20–3h15，$19–26。', price: '区间', buy: ['flix', 'pp', 'grey', 'mega', 'our', 'wand'] }
  },
  s4: {
    date: '12/24', wd: '周四', from: 'phl', to: 'nyc', route: '费城 → 纽约', rec: 'bus',
    why: '推荐大巴：平安夜上午出城车流不大，约 2 小时。备选通勤铁路接力：SEPTA Trenton 线 + NJ Transit，约 2.5h、$25–30/人，不怕堵车，直达 Penn Station。',
    train: { p: 45, t: 'Amtrak 东北区域 / Keystone', d: '30th Street 站 → Penn Station，约 1h20。', price: '估算', buy: ['amtrak'] },
    bus: { p: 18, t: 'Megabus / FlixBus / OurBus', d: '费城市中心 → 曼哈顿 31st–34th St 一带，约 2h，$9–25。上车点以 App 地图为准。', price: '区间', buy: ['mega', 'flix', 'our', 'wand'] },
    extra: { label: '通勤铁路接力', buy: ['septa', 'njt'] }
  }
};

export const LEG_IDS = Object.keys(LEGS);

// 12/20 三个方案
export const PLANS = {
  A: { short: 'A 不看凯尔特人', label: 'A · 不看凯尔特人，坐 67 次过夜车', note: '原方案。省一晚房费，第二天一早到华盛顿。' },
  C: { short: 'C 多住一晚', label: 'C · 看凯尔特人，波士顿多住一晚', note: '想看 4 场就选它。12/21 早上坐火车南下，多一晚房费约 $230。' },
  B: { short: 'B 凌晨大巴', label: 'B · 看凯尔特人，凌晨 1:30 大巴', note: '不推荐。散场后等 3 小时，还要解决行李寄存（球馆不让带包）。' }
};

// 根据 12/20 方案返回某段某种方式的实际选项
export function legOption(id, kind, plan) {
  const leg = LEGS[id];
  if (id === 's2' && plan === 'B') {
    if (kind === 'train') return { p: 0, t: '67 次不可选', d: '18:45 开车，看不了 20:00 的凯尔特人。', disabled: true, buy: [] };
    return { p: 75, t: 'Greyhound 凌晨 01:30 大巴', d: '散场后在 South Station 巴士总站等约 3 小时，01:30 开，次日约中午到 Union Station。$64–97。', price: '区间', buy: ['grey', 'wand'] };
  }
  if (id === 's2' && plan === 'C') {
    if (kind === 'train') return { p: 89, t: '12/21 早班 Amtrak', d: 'South Station 早上 6–7 点的东北区域列车，约 7–8h，午后到华盛顿。', price: '估算', buy: ['amtrak'] };
    return { p: 60, t: '12/21 白天大巴', d: '约 9–10h，整天都在车上，不推荐。', price: '区间', buy: ['grey', 'flix', 'wand'] };
  }
  return leg[kind];
}

export function legWhy(id, plan) {
  if (id === 's2' && plan === 'B') return '方案 B：凯尔特人 20:00 开球，只能等凌晨 1:30 的大巴。连续熬夜，还要找地方寄存行李，不推荐。';
  if (id === 's2' && plan === 'C') return '方案 C：12/20 看完凯尔特人回酒店睡，12/21 早上坐火车南下，下午到华盛顿。多一晚房费，但最轻松。';
  return LEGS[id].why;
}

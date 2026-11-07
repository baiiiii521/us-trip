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
    // 12/20 固定按方案 C：看完凯尔特人回酒店睡，12/21 早上坐车南下
    date: '12/21', wd: '周一', from: 'bos', to: 'dc', route: '波士顿 → 华盛顿', rec: 'train',
    why: '12/21 早班火车南下：6:30 左右发车，午后到华盛顿，下午还能去看国家圣诞树。大巴慢 2–3 小时且周一早高峰出城容易堵，不推荐。',
    train: { p: 89, t: 'Amtrak 早班东北区域 · 06:30 左右', d: 'South Station 早上 6–7 点发车，约 7h30–8h，午后到 Union Station。酒店打车到车站 10 分钟。', price: '估算', buy: ['amtrak'] },
    bus: { p: 60, t: '白天大巴 · Greyhound / FlixBus', d: '约 9–10 小时，整天都在车上，下午晚些才到 Union Station 巴士层。不推荐。', price: '区间', buy: ['grey', 'flix', 'wand'] }
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

// 12/20 只保留方案 C（看凯尔特人、波士顿住 3 晚、12/21 早上南下）。
// 签名保留 plan 参数，方便老调用处不报错；值不再影响结果。
export function legOption(id, kind) {
  return LEGS[id][kind];
}

export function legWhy(id) {
  return LEGS[id].why;
}
